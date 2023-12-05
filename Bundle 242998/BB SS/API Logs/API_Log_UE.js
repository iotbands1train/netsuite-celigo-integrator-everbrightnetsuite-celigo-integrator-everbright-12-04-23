/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* @ FILENAME      : API_Log_UE.js
* @ AUTHOR        : David Smith
* @ DATE          : 2019/07
* @Descriptin - Adds the client script to the custom record view mode
* Copyright (c) 2019 MultiPoint Videos, LLC.
* All Rights Reserved.
*
* This software is the confidential and proprietary information of
* MultiPoint Videos, LLC. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with MultiPoint Videos, LLC.
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

define(['N/runtime','N/file'], 
function(runtime,file) {

    function beforeLoad(scriptContext) {
    	if(scriptContext.type!='view') return;
    	var form = scriptContext.form;
    	var scriptObj = runtime.getCurrentScript();
    	var bundleArr = scriptObj.bundleIds;
    	log.debug('bundles',bundleArr);
    	var basePath = 'SuiteScripts/BB SS/API Logs/';
      	var jsonFormatScript;
    	if(bundleArr && bundleArr.length>0){
    		// assumes it's only used in one bundle
    		//basePath = 'SuiteBundles/Bundle '+bundleArr[0]+'/BB SS/API Logs/';
          	try{
                jsonFormatScript = file.load({id: 'SuiteBundles/Bundle '+bundleArr[0]+'/BB SS/API Logs/'+'API_Log_CS.js'}).getContents();
            } catch(e){
              	jsonFormatScript = file.load({id: basePath+'API_Log_CS.js'}).getContents();
            }
    	}
      	if(jsonFormatScript){
          var scriptFld = form.addField({
              id : 'custpage_init_json_script',
              type : 'inlinehtml',
              label : 'Dialog'
          });
          scriptFld.defaultValue = jsonFormatScript;
        }
    }

    return {
    	beforeLoad: 	beforeLoad
    };
});
