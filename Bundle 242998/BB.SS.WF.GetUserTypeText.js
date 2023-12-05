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
                var entitySearchObj = search.create({
                    type: "entity",
                    filters:
                        [
                            ["internalid","anyof",runtime.getCurrentUser().id]
                        ],
                    columns:[]
                });
                entitySearchObj.run().each(function(result){
                    textResult = result.recordType
                });
                log.debug('Entity Type',textResult);
            } catch (e){
                     log.error('ERROR', e);
            }
            return textResult || '';
        }

        return {
            onAction:onAction
        }
    
    }
);