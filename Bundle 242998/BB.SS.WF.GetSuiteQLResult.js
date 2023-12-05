/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope public
 */

/**
 * Copyright 2020 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/runtime','N/query'],
    function(runtime, query) {

        /**
         * Entry point
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {Record} scriptContext.form - Form (serverWidget.form)
         * @param {string} scriptContext.type - Trigger type
         * @param {integer} scriptContext.workflowId - Internal ID of the workflow that calls the script
         */
        function onAction(scriptContext) {
            var textResult = '';
            try{
                var scriptObj = runtime.getCurrentScript();
                // get search id from parameters of the script
                var suiteQL = scriptObj.getParameter({name:'custscript_bbss_wf_sql'});
                var params = scriptObj.getParameter({name:'custscript_bbss_wf_sql_params'});
                params = params ? params.split(',') : [];
                log.debug('sql data',{query:suiteQL,params:params});
                var results = query.runSuiteQL({
                    query: suiteQL,
                    params:params
                });
                log.debug('results',results);
                log.debug('Results mapped',results.asMappedResults());

                var result = results.results[0];
                if(!result) return textResult;

                var values = result.values;
                textResult = values[0];

                log.debug('return result',textResult);

            } catch (e){
                log.error('ERROR', e);
            }
            return textResult;
        }

        return {
            onAction:onAction
        }

    }
);