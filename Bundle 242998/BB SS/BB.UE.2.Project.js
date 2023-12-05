/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @author Keith B
 * @version 0.2.0
 */

define(["N/runtime", "N/search", "N/url", "N/https", "N/record"], function (runtime, search, url, https, record) {
 var CREDENTIALS_REC_NAME = 'SolarEdge';
    /**
     * Function called before load of the project record
     * 
     * @governance 0 Units
     * @param {Object} context - context of the request
     */
    function beforeLoad(context) {
log.debug('context',context);
        
      //login();
        //context.form.clientScriptModulePath = './BB.CS.ProjectAdditional';

        var record = context.newRecord;

     //   addCopyProjectButton(context, record);
       // addGetSiteDevicesButton(context.form, record)

    }

    /**
     * Function shows the copy project button to admins
     * 
     * @governance 0 Units
     * @param {Object} context - context of the request
     * @param {Object} newRecord - new project record
     */
    function addCopyProjectButton(context, newRecord) {

        if (context.type == context.UserEventType.VIEW) {


            var copyProjectBtnSetting = search.lookupFields({
                type: 'customrecord_bb_solar_success_configurtn',
                id: 1,
                columns: ['custrecord_bb_shw_cp_prj_btn']
            });

            log.debug('copyProjectBtnSetting', copyProjectBtnSetting);
            if (copyProjectBtnSetting.custrecord_bb_shw_cp_prj_btn) {
                var copyTo = newRecord.getValue({ fieldId: "custentity_bb_copy_to" });
                var roleId = runtime.getCurrentUser().role;
                var suiteletUrl = url.resolveScript({
                    scriptId: 'customscript_bb_sl_copyproject',
                    deploymentId: 'customdeploy_bb_sl_copyproject',
                    params: {
                        recordId: context.newRecord.id
                    }
                });

                var fullURL = "https://" + url.resolveDomain({ hostType: url.HostType.APPLICATION }) + suiteletUrl;

                context.form.addButton({
                    id: 'custpage_copyproject',
                    label: 'Copy Project',
                    functionName: "callCopyProjectSuitelet"
                    // functionName: "windown.open(\'"+ fullURL+ "\')"
                });

                if (copyTo && roleId != 3) {
                    context.form.removeButton({ id: "edit" })
                }
            }

        }
    }

    function addGetSiteDevicesButton(form, rec) {

       if(rec.id){
           var proj = record.load({
               type: 'job',
               id: rec.id,
               isDynamic: true,
           })
           var sublist = form.getSublist({
               id: 'recmachcustrecord_bb_ss_device_proj'
           });// subtab internal ID on where you would like the button to show
          if(sublist){
              sublist.addButton({
                  id: 'custpage_buttonid',
                  label: 'Load Devices',
                  functionName: "callLoadDevices"
              });
          }

       }

    }
  
  function login(){
        var credentials = getCredentials();
        var SolarEdgeUrl = credentials.url + '/login?j_username='+credentials.username+'&j_password='+credentials.password

        var responsemain = https.post({
            url: SolarEdgeUrl,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-Encoding": "en-us"
            }
        });
        log.debug('response',responsemain.headers)
        log.debug('body',responsemain.body)
     log.debug('cookei resp',typeof responsemain.headers)
    var cook='';
    for(var x in responsemain.headers){
      log.debug('x',x);
      if(x=='Set-Cookie'){
          log.debug('jhavsdhjw',responsemain.headers[x])
        cook=responsemain.headers[x]
      }
    
    }
    

    //    log.debug('cookei resp',responsemain.headers.'Set-Cookie')
        var response = https.get({
            url: 'https://monitoringapi.solaredge.com/sites/siteNameExists?siteName=1018214544',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-Encoding": "en-us",
                "Cookie":cook
            }
        });

        log.debug('response',response.body)

    }
function getCredentials() {
        var credentialsRecId = getCredentialRecordId();
        var credentialsRec = record.load({
            type: 'customrecord_system_credentials',
            id: credentialsRecId
        });

        var credentials = {
            username: credentialsRec.getValue('custrecord_system_username'),
            password: credentialsRec.getValue('custrecord_system_password'),
            url: credentialsRec.getValue('custrecord_system_base_url'),
            apiToken: credentialsRec.getValue('custrecord_system_token')
        };
        log.debug('credentials', credentials);
        return credentials;
    }

    /**
     * Function returns the internal id of the System Credential record for the API system
     * @returns {*}
     */
    function getCredentialRecordId() {
        var results = search.create({
            type: 'customrecord_system_credentials',
            filters: [{
                name: 'name',
                operator: 'IS',
                values: CREDENTIALS_REC_NAME
            }, {
                name: 'isinactive',
                operator: 'IS',
                values: ['F']
            }]
        }).run().getRange({
            start: 0,
            end: 10
        });

        if (results.length > 1 || results.length == 0) {
            log.debug('Credentials Error', 'Credentials results: ' + JSON.stringify(results));
            throw CREDENTIALS_ERROR;
        }
        return results[0].id;
    }


    return {
        beforeLoad: beforeLoad
    };
});