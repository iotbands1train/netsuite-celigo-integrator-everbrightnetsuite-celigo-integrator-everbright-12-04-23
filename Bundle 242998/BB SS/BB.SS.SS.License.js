/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 *
 * Deployment _bbss_release_ue re-deploys the UE script
 *
 * Deployment _bbss_send_license sends the account license data
 *
 * REQUIRES UE Script customscript_bbss_license_ue
 *
 */

define(['N/runtime','N/encode','N/https','N/search','N/record'],
    function (runtime,encode,https, search, record){

    function execute(scriptContext) {
        // Get the script ID of the User Event
        var ueScriptId;
        search.create({
            type: "scriptdeployment",
            filters:[["script.scriptid","is","customscript_bbss_license_ue"]],
            columns:[
                search.createColumn({
                    name: "scriptid",
                    sort: search.Sort.ASC,
                    label: "Custom ID"
                })
            ]
        }).run().each(function(result){
            ueScriptId = result.id;
            var depId = result.getValue({name:"scriptid"});
            log.debug('UE Script Found',{id:ueScriptId,scriptId:depId});
            return false;
        });
        // if the UE doesn't exist exit
        if(!ueScriptId) {
            log.audit('UE Script NOT FOUND','Exiting');
            return;
        }

        /************** Manual deployment to send license data **************/
        var scriptObj = runtime.getCurrentScript();
        var licenseData = scriptObj.getParameter({name:"custscript_bbss_license_data"});
        if(licenseData){
            // send this info to BB for processing
            var success = sendLicenseData(licenseData);
            if(success==true){
                // disable the UE deployment so it doesn't execute again
                record.submitFields({
                    type:'scriptdeployment',
                    id: ueScriptId,
                    values:{
                        isdeployed:false
                    }
                });
                log.debug('UE disabled','scriptdeployment:'+ueScriptId);
            } else {
                log.error('Sending Data FAILED');
            }
            return;
        }
        /************** end license send **************/


        /************** Re-enable the UE script *******************/
        // This should only be scheduled max 1x/day
        record.submitFields({
            type:'scriptdeployment',
            id: ueScriptId,
            values:{
                isdeployed:true
            }
        });
        log.debug('UE Re-deployed','scriptdeployment:'+ueScriptId);
        /************** end user event re-deploy **************/
    }

    function sendLicenseData(data){
        log.debug('sendLicenseData data',data);
        var
            _endpoint = 'https://4527410.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=246&deploy=1&compid=4527410&h=ff8f000bd7f283cb3202'
            , _param = ['license', runtime.accountId].join('=')
            , _url = [_endpoint, _param, 'app=com.bluebanyansolutions.solarsuccess'].join('&')
            , _username = 'BluBanyanSuiteApp'
            , _password = 'wKx89Dk0p0Wu'
            , _authentication = encode.convert({
                string: [_username, _password].join(':'),
                inputEncoding: encode.Encoding.UTF_8,
                outputEncoding: encode.Encoding.BASE_64
            })
            , _headers = {
                'Authorization': ['Basic', _authentication].join(' ')
            }

        var _response = https.post({
            url: _url,
            body: {"billingevents":data},
            headers: _headers
        });
        log.debug('sendLicenseData response',_response);

        if(_response.code==200){
            var resp = JSON.parse(_response.body);
            return resp.success==true;
        } else return false;

    }

    return {
    	execute: execute
    }
});
