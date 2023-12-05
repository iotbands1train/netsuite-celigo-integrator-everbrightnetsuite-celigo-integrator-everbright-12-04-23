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

define(['N/runtime','N/search'],
    function(runtime, search) {
    
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
                var recordId = scriptContext.newRecord.id;
                // make sure we have a record to work with
                if(!recordId) return textResult;
                // get search id from parameters of the script
                var scriptObj = runtime.getCurrentScript();
                var searchId = scriptObj.getParameter({name:'custscript_bb_ss_wf_search'});
                // load the search
                var searchObj = search.load({
                	id: searchId
                });
                // add the filter for the internalid value of the record this is running against
                // if it's already in the search it's ok if it has it twice
                var searchFilters = searchObj.filterExpression;
                log.debug('filterExpression',searchFilters);
                if(searchFilters.length>0){
                    searchFilters.push('and');
                }
                searchFilters.push(['internalid','is',recordId]);
                searchObj.filterExpression = searchFilters;
                log.debug('filterExpression',searchFilters);

                // run the search and return the first column from the first result
                searchObj.run().each(function(result){
                    log.debug('searchObj.columns[0]',searchObj.columns[0]);
                    textResult = result.getValue(searchObj.columns[0]);
                    log.debug('result = '+textResult,result);
                    // no return value here because only first result is desired
                });

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