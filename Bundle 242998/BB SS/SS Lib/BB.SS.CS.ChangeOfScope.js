/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @author Michael Golichenko
 * @NModuleScope Public
 * @version 0.1.1
 * @fileOverview Process client side Change of Scope logic
 */

/**
 * Copyright 2017-2018 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/ui/message'], function(uiMessageModule) {

    var _errorMessage = undefined;

    function fieldChanged(context){
        log.debug('fieldChanged context', context);
        console.log(context);
        var _sublistId = context.sublistId;
        var _record = context.currentRecord;
        if(_sublistId){
            var _line = context.line;
            var _sublistValue = _record.getSublistValue({sublistId: _sublistId, fieldId: 'custpage_select_package', line: _line});
            var _isPackageSelected = (typeof _sublistValue === 'string' && /t/i.test(_sublistValue)) || (typeof _sublistValue === 'boolean' && _sublistValue);
            var _dropdownInput = NS.jQuery('input[id^=indx_custpage_rejection_reason]')[_line];
            if(_dropdownInput) {
                var _dropdownInputId = _dropdownInput.id;
                var _dropdownId = _dropdownInputId.substring(5);
                var _dropdown = window.dropdowns[_dropdownId];
                _dropdown.setDisabled(!_isPackageSelected);
                _dropdown.setRequired(_isPackageSelected);
            }
        }
    }

    function pageInit(context){
        var _record = context.currentRecord;
        NS.jQuery('input[id^=indx_custpage_rejection_reason]').each(function(idx, value){
            var _dropdownInputId = this.id;
            var _packageId = _record.getSublistValue({sublistId: 'custpage_packages_list', fieldId: 'custpage_package_id', line: idx});
            var _dropdownId = _dropdownInputId.substring(5);
            var _dropdown = window.dropdowns[_dropdownId];
            _dropdown.setDisabled(true);
            // filter options based on Package
            var _values = _dropdown.getValues();
            _values = _values.filter(function(value){
                var _regexString = ['^', _packageId, '_'].join('');
               return typeof value === 'string' && value.length > 0 && !new RegExp(_regexString, 'i').test(value);
            });
            _values.forEach(function(value){
               _dropdown.deleteOneOption(value);
            });
        });
    }

    function saveRecord(context){
        log.debug('saveRecord context', context);
        console.log(context);
        var _errorMessages = [];
        var _record = context.currentRecord;
        var _changeOfScopeReason = _record.getValue({fieldId: 'custpage_soc_reason'});
        var _changeOfScopeComment = _record.getValue({fieldId: 'custpage_soc_reason_comment'});
        if(_errorMessage){
            _errorMessage.hide();
        }

        if(!_changeOfScopeReason || isNaN(parseInt(_changeOfScopeReason))){
            _errorMessages.push('Please select value for "Change of Scope Reason" field.')
        }
        if(typeof _changeOfScopeComment !== 'string' || _changeOfScopeComment.trim().length === 0){
            _errorMessages.push('"Change of Scope Reason Comment" should be filled in.')
        }
        var _sublistCount = _record.getLineCount({sublistId: 'custpage_packages_list'});
        for (var i = 0; i < _sublistCount; i++){
            var _checked = _record.getSublistValue({sublistId: 'custpage_packages_list', fieldId: 'custpage_select_package', line: i});
            var _packageName = _record.getSublistValue({sublistId: 'custpage_packages_list', fieldId: 'custpage_package_name', line: i});
            var _rejectionReason = _record.getSublistValue({sublistId: 'custpage_packages_list', fieldId: 'custpage_rejection_reason', line: i});
            if(/t/i.test(_checked) && (!_rejectionReason || isNaN(parseInt(_rejectionReason)))){
                _errorMessages.push(['"Rejection Reason" should be filled in for "', _packageName, '".'].join(''));
            }
        }

        if(_errorMessages.length > 0){
            console.log(_errorMessages);
            var _message = '';
            _errorMessages.forEach(function(errorMessage){
                _message = [_message, '<li>', errorMessage, '</li>'].join('');
            });
            _message = ['<ul style="list-style: inside;">', _message, '</ul>'].join('');
            _errorMessage = uiMessageModule.create({
                type: uiMessageModule.Type.ERROR,
                title: 'Please fix following errors:',
                message: _message
            });
            _errorMessage.show();
        }

        return _errorMessages.length === 0;
    }

    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
        pageInit: pageInit
    };
});