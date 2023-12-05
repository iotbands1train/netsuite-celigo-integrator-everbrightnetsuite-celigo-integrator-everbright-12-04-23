/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @author Michael Golichenko
 * @version 0.0.1
 */

define(['N/record', 'N/search', './../DocuSign'], function(recordModule, searchModule, docuSignModule){

    function authenticate(){
        var _customTabsApi = new docuSignModule.CustomTabsApi();
        _customTabsApi.apiClient.addAuthentication(new docuSignModule.OAuth()).setupFromRecord().authenticate();
        return _customTabsApi;
    }

    function afterSubmit(scriptContext){
        var _trigger = scriptContext.type;
        var _record = _trigger === scriptContext.UserEventType.DELETE ? scriptContext.oldRecord : scriptContext.newRecord;
        var _type = _record.getValue({fieldId: 'custrecord_bb_ss_cust_map_ns_record_id'});
        var _field = _record.getValue({fieldId: 'custrecord_bb_ss_cust_map_ns_field_id'});
        var _alias = _record.getValue({fieldId: 'custrecord_bb_ss_cust_map_field_alias'});
        var _externalId = _record.getValue({fieldId: 'custrecord_bb_ss_cust_map_ext_field_id'});
        var _system = _record.getValue({fieldId: 'inpt_custrecord_bb_ss_cust_map_system'});
        // don't do anything if system is not DocuSign
        if(typeof _system !== 'string' || !(/docusign/i.test(_system))) return;

        if(typeof _externalId === 'string' && _externalId.trim().length > 0){
            var _customTabsApi;
            if(_trigger === scriptContext.UserEventType.DELETE){
                _customTabsApi = authenticate();
                _customTabsApi._delete(_externalId);
            } else if(_trigger === scriptContext.UserEventType.EDIT || _trigger === scriptContext.UserEventType.XEDIT){
                _customTabsApi = authenticate();
                var _newCustomTab = new docuSignModule.TabMetadata();
                var _name = [_type, _field].join('.');
                if(typeof _alias === 'string' && _alias.trim().length > 0){
                    _name = _alias.trim();
                }
                _newCustomTab.name = _name;
                _newCustomTab.tabLabel = _name;
                _newCustomTab.type = 'Text';
                _customTabsApi.update(_externalId, {tabMetadata: _newCustomTab});
            }
        }
   }

   function beforeSubmit(scriptContext){
       var _trigger = scriptContext.type;
       var _record = scriptContext.newRecord;
       var _type = _record.getValue({fieldId: 'custrecord_bb_ss_cust_map_ns_record_id'});
       var _field = _record.getValue({fieldId: 'custrecord_bb_ss_cust_map_ns_field_id'});
       var _alias = _record.getValue({fieldId: 'custrecord_bb_ss_cust_map_field_alias'});
       var _system = _record.getValue({fieldId: 'inpt_custrecord_bb_ss_cust_map_system'});
       // don't do anything if system is not DocuSign
       if(typeof _system !== 'string' || !(/docusign/i.test(_system))) return;

       var _name = [_type, _field].join('.');
       if(_trigger === scriptContext.UserEventType.CREATE){
           var _customTabsApi = authenticate();
            var _newCustomTab = new docuSignModule.TabMetadata();
            if(typeof _alias === 'string' && _alias.trim().length > 0){
                _name = _alias.trim();
            } else {
                _alias = _name;
            }
            _newCustomTab.name = _name;
            _newCustomTab.tabLabel = _name;
            _newCustomTab.type = 'Text';
            var _result = _customTabsApi.create({tabMetadata: _newCustomTab});
            scriptContext.newRecord.setValue({fieldId: 'custrecord_bb_ss_cust_map_field_alias', value: _alias});
            scriptContext.newRecord.setValue({fieldId: 'custrecord_bb_ss_cust_map_ext_field_id', value: _result.customTabId});
       } else if(_trigger === scriptContext.UserEventType.EDIT || _trigger === scriptContext.UserEventType.XEDIT){
           if(typeof _alias !== 'string' || _alias.trim().length === 0){
               _alias = _name;
           }
           scriptContext.newRecord.setValue({fieldId: 'custrecord_bb_ss_cust_map_field_alias', value: _alias});
       }
   }

   return {
       afterSubmit: afterSubmit,
       beforeSubmit: beforeSubmit
   }
});