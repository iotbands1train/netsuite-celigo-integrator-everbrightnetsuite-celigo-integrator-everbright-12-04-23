/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope public
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
define(['N/record', 'N/https', 'N/url', 'N/ui/message', 'N/runtime', 'N/search'], function(record, https, url, uiMessageModule, runtime, search) {
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        var record = scriptContext.currentRecord;
        console.log('Before submit client script fired');
        jQuery(function(){
            console.log('main page loaded init');
            //var iFrameDocument = jQuery('#bb_s3_iframe').contents();
            var iFrameDocument = jQuery('#bludocs_s3_iframe').contents();
            console.log(iFrameDocument);
            // delete button
            jQuery('.direct-upload', iFrameDocument).append(
               jQuery(document.createElement('input')).attr({
                   id:    'submit_delete',
                   name:  'Delete Files',
                   value: 'Delete Files',
                   type:  'button'
               })
            );
            jQuery('.submit_delete', iFrameDocument).css({height: 20, width: 100, margin: 10});
            jQuery('.objects', iFrameDocument).after('<p></p>');
            //loop over each object and add a check box
            var counter = 1;
            jQuery('.object', iFrameDocument).each(function(counter){
                if (counter >= 1 ) {
                    jQuery(this).append(
                       jQuery(document.createElement('input')).attr({
                           id:    'delete_file' + counter,
                           name:  'delete_file',
                           type:  'checkbox'
                       })
                    );
                    // position of check boxes
                    jQuery('#delete_file' + counter, iFrameDocument).parent().css({position: 'relative'});
                    jQuery('#delete_file' + counter, iFrameDocument).css({top: 5, right: 5, position:'absolute'});
                }
            });
            // button click function
            jQuery(document).ready(function(){
                var deleteItems =[];
                jQuery('#submit_delete', iFrameDocument).click(function(){
                    // loop over objects that have check box marked as true, then pass those objects to request call to the suitelet
                    var counter = 1;
                    jQuery('.object', iFrameDocument).each(function(counter){
                        if (counter >= 1 && jQuery('#delete_file'+ counter, iFrameDocument).prop('checked') == true) {
                            console.log(jQuery('#delete_file'+ counter));
                            var objectName = jQuery('.object', iFrameDocument).get(counter);
                            console.log(objectName);
                            var fileName = jQuery('span', objectName).text();
                            console.log(fileName);
                            deleteItems.push(fileName);
                        }
                    });
                    console.log(deleteItems);
                    if (deleteItems.length > 0) {
                        var path = record.getValue({
                            fieldId: 'custrecord_bb_proj_task_dm_folder_text'
                        });
                        console.log('path', path);
                        var data = {
                                deleteItems: deleteItems,
                                path: path
                            }
                        var body = JSON.stringify(data);
                        var suiteletURL = url.resolveScript({
                            scriptId: 'customscript_bb_s3_sl_delete_amz_objects',
                            deploymentId: 'customdeploy_bb_s3_sl_delete_amz_objects',
                            returnExternalUrl: false,
                        });
                        console.log('suitelet url',suiteletURL);
                        var rsp = https.post({
                            url: suiteletURL,
                            body: body
                        });
                        console.log('response', rsp);
                        if (rsp.code == 200) {
                            jQuery(location.reload());
                        }
                    }
                }); // end of on click function
            }); // end of on document ready function
        }); // end of JQuery function
    }
    /**
    * When Action Template changes, find the Action Template record and
    * set Recurrence Frequency based on value from Action Template.
    */
    function fieldChanged(scriptContext) {
        var record = scriptContext.currentRecord;
        var fieldChanged = scriptContext.fieldId;
        var actionTemplate;
        var customrecord_bb_package_taskSearchObj;
        var recurFreq;
        var actionTemplateResult;
        var actionGroupResult;
        if (fieldChanged === 'custrecord_bb_project_package_action') {  //Action Template
            actionTemplate = record.getValue('custrecord_bb_project_package_action');
            console.log('actionTemplate', actionTemplate);
            if (actionTemplate) {
                customrecord_bb_package_taskSearchObj = search.create({
                    type: "customrecord_bb_package_task",       //Action Template
                    filters:
                    [
                        ["internalid","anyof",actionTemplate]
                    ],
                    columns:
                    [
                        search.createColumn({name: "name", label: "Name"}),
                        search.createColumn({name: "custrecord_bb_package_detail", label: "Action Group"}),
                        search.createColumn({name: "custrecord_bb_pack_act_recur_frequency", label: "Recurrence Frequency"})
                    ]
                });
                customrecord_bb_package_taskSearchObj.run().each(function(result){
                    recurFreq = result.getValue('custrecord_bb_pack_act_recur_frequency');
                    actionTemplateResult = result.getValue('name');
                    actionGroupResult = result.getValue('custrecord_bb_package_detail');
                    return false;
                });
                console.log('recurFreq', recurFreq);
                console.log('actionTemplateResult', actionTemplateResult);
                console.log('actionGroupResult', actionGroupResult);
                if (recurFreq) {
                    record.setValue('custrecord_bb_recurrence_frequency', recurFreq);
                }
                else {
                    record.setValue('custrecord_bb_recurrence_frequency', '');
                }
            }
        }
    }
    function saveRecord(scriptContext) {
        var record = scriptContext.currentRecord;
        console.log('Before submit client script fired');
        console.log('main page loaded on save');
        //var iFrameDocument = jQuery('#bb_s3_iframe').contents();
        var iFrameDocument = jQuery('#bludocs_s3_iframe').contents();
        console.log(iFrameDocument);
        if(jQuery('.object', iFrameDocument).length >= 2){
            console.log('length greater than 2');
            record.setValue({
                fieldId: 'custrecord_bb_proj_action_file_cnt_int',
                value: jQuery('.object', iFrameDocument).length - 1
            });
            var docDate = record.getValue({
                fieldId: 'custrecord_bb_doc_saved_date'
            });
            if (!docDate) {
                record.setValue({
                    fieldId: 'custrecord_bb_doc_saved_date',
                    value: new Date()
                });
            }
            return true;
        } else {
            var searchObj = search.lookupFields({
                type: 'customrecord_bb_solar_success_configurtn',
                id: record.getValue({fieldId: 'custrecord_bb_proj_action_config_record'}) || 1,
                columns: ['custrecord_bb_req_files_act_doctype_bool']
            })
            var requireDocuments = searchObj.custrecord_bb_req_files_act_doctype_bool;
            console.log('No files found');
            record.setValue({
                fieldId: 'custrecord_bb_proj_action_file_cnt_int',
                value: 0
            });
            var _currentUser = runtime.getCurrentUser();
            var _taskType = record.getText({fieldId: 'custrecord_bb_project_doc_action_type'});
            var _hasApprovedStatus = record.getValue({fieldId: 'custrecord_bb_action_status_type'});
            var _isDocumentActionType = /document/i.test(_taskType);
            var _isAdministrator = _currentUser && /administrator/i.test(_currentUser.roleId);
            if(!_isAdministrator && _hasApprovedStatus == 4 && _isDocumentActionType && requireDocuments){
                var _errorExecMessage = uiMessageModule.create({
                    type: uiMessageModule.Type.ERROR,
                    title: 'Project action not completed.',
                    message: 'You cannot approve project action that doesn\'t contain any documents.',
                    duration: 20000
                });
                _errorExecMessage.show();
                return false;
            }
        }
        return true;
    }
    return {
        //pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };
});