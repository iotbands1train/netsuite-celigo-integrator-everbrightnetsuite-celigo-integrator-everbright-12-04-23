/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @author Michael Golichenko
 * @version 0.0.1
 */

define(['N/record', 'N/search', './../DocuSign'], function(recordModule, searchModule, docuSignModule){

    function getObtainConsentUrl(){
        var _apiClient = new docuSignModule.ApiClient();
        var _auth = new docuSignModule.OAuth();
        _apiClient.addAuthentication(_auth).setupFromRecord();
        return _auth.getJWTUri(_apiClient.basePath);
    }

    function beforeLoad(scriptContext) {
      var _trigger = scriptContext.type;
      var _record = scriptContext.newRecord;
      if(_trigger !== scriptContext.UserEventType.CREATE) {
        var _url = getObtainConsentUrl();
        if(/^http/i.test(_url)){
          log.debug('_url', _url);
          _record.setValue({fieldId: 'custrecord_bb_ds_integr_obt_consent_url', value: _url});
        }
      }
    }

   return {
       beforeLoad: beforeLoad
   }
});