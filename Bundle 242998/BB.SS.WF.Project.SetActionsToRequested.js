/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope public
 * @author Ashley Wallace
 * @version 0.1.1
 * @fileOverview - sets the document status all project actions on a given project
 *  and package, that are required, to requested 
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

define(['N/record', 'N/search', 'N/error', 'N/runtime'],
    function(record, search, errorRec, runtime) {
       
        var DOCUMENT_STATUS;
        var ACTION_REQD;
        var PROJECT_ACTION_ID = 'customrecord_bb_project_action'; 
            
        function onAction(scriptContext) {
            try {
                DOCUMENT_STATUS = getLiteralMap('customrecord_bb_document_status');
                ACTION_REQD = getLiteralMap('customlist_bb_required_optional');

                var package = runtime.getCurrentScript().getParameter({name:'custscript_bb_ss_package'});
                var projectId = scriptContext.newRecord.id;

                setAdderDocumentStatus(package, projectId);
            }catch (error) {
                log.error('Set Actions to Requested', error);


            };
        };

        /**
         * Runs a saved search to get a list of project actions that need to be updated 
         * based on the project, if it is required, and the package. Then updates the document
         * status to "requested".
         * @param {string} packageType - the package that requires updating 
         * @param {integer} projectId - the project for which the package is being updated
         */
         function setAdderDocumentStatus(package, projectId)
         {
            search.create({
                type: PROJECT_ACTION_ID,
                columns:['id'],
                filters: [ ['custrecord_bb_project', 'anyof', projectId], 
                    'AND', ['custrecord_bb_package', 'anyof', package], 
                    'AND', ['custrecord_bb_document_status', 'anyof', DOCUMENT_STATUS['not started'] ],
                    'AND', ['custrecord_bb_proj_doc_required_optional', 'anyof', ACTION_REQD['required'] ]
                ],
              }).run().each(function(result){
                record.submitFields({
                    type: PROJECT_ACTION_ID,
                    id: result.getValue(result.columns[0]),
                    values: { 'custrecord_bb_document_status': DOCUMENT_STATUS['requested'],
                              'custrecord_bb_document_status_date': DateNow() },
                    options: {ignoreMandatoryFields: true }
                });
                return true;
            });
        };




        /**
         * Returns a date object for the current date
         * @returns {date} - today's date. 
         */
        function DateNow() { return new Date(); };



        /**
         * Get a map of a given list/record for looking up internal id's by name
         * @returns {Object} 
         */
        function getLiteralMap(literalType) {
            return search.create({
                type: literalType,
                columns: ['name']
            }).run().getRange({
                start: 0,
                end: 100
            }).reduce(function(map, current) {
                var itemName = current.getValue({
                    name: 'name'
                }).toLowerCase();
                map[itemName] = current.id;
                return map;
            }, {});
        };

        return {
            onAction: onAction
        };

    })	