/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 * zbilliet 10/8/19
 */
define(['N/record', 'N/search', 'N/runtime'],
    /**
     * @param {Object} record
     * @param {Object} search
     * @param {Object} runtime
     */
    function (record, search, runtime, file) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {
                /** @desc Log the script context. */
                log.debug('on action', JSON.stringify(scriptContext));

                /** @desc initialize script variables. */
                var today = new Date();

                /** @desc Get script parameters. */
                var updateaction = runtime.getCurrentScript().getParameter({ name: 'custscript_wfa_dsu_package_action' });
                var updatestatus = runtime.getCurrentScript().getParameter({ name: 'custscript_wfa_dsu_field_value' });
                log.debug('params', updateaction + ' status ' + updatestatus);

                /** @desc Get the record type. */
                var type = scriptContext.newRecord.type;
                log.debug('type', type);

                /** @desc Determine the project id. If we can't then exit. */
                if (type == 'job'){
                    var prjid = scriptContext.newRecord.id;
                } else if (type == 'customrecord_bb_project_action') {
                    var prjid = scriptContext.newRecord.getValue('custrecord_bb_project');
                } else if (type == 'salesorder') {
                    var prjid = scriptContext.newRecord.getValue('custbody_bb_project');
                } else {
                    log.error('Could not determine prjid');
                    return;
                };
                log.debug('prjid', prjid);

                /** @desc Load the search. */
                var actionsearch = search.load({
                    id: 'customsearch_bb_wfa_updatedocstatus'
                });

                /** @desc Modify the loaded search filters. */
                var expr = actionsearch.filterExpression.slice();
                expr.push('AND', ["custrecord_bb_project_package_action", "anyof", updateaction]);
                expr.push('AND', ["custrecord_bb_project", "anyof", prjid]);
                expr.push('AND', ["custrecord_bb_document_status", "noneof", updatestatus]);
                actionsearch.filterExpression = expr;

                /** @desc Test the search and log the result count. */
                var searchResultCount = actionsearch.runPaged().count;
                log.audit("parentdata result count", searchResultCount);

                /** @desc Run the search and process the results. */
                actionsearch.run().each(function (result) {
                    log.debug('result', result);

                    /** @desc Get the action id from the search results. */
                    var actionid = result.getValue({
                        name: "internalid",
                        summary: "MAX"
                    });
                    log.debug('action id', actionid);

                    /**
                     *  @desc Load the project record.
                     *  Swapped out the Load/Set/Save actions for a single submitFields action to
                     *  reduce resources used and save governance.
                     *  Remove this code block after testing to clean up script.
                    var projectAction = record.load({
						type: 'customrecord_bb_project_action',
						id: actionid						
					});
					projectAction.setValue({
						fieldId: 'custrecord_bb_document_status',
						value: updatestatus
					});
					projectAction.setValue({
						fieldId: 'custrecord_bb_document_status_date',
						value: today
					});
					projectAction.save({
						ignoreMandatoryFields: true
                    });*/
                    var updatevalues = {
                        custrecord_bb_document_status: updatestatus
                        , custrecord_bb_document_status_date: today
                    };

                    if (updatestatus){
                        var statustypelookup = search.lookupFields({
                            type: 'customrecord_bb_document_status',
                            id: updatestatus,
                            columns: ['custrecord_bb_doc_status_type']
                        });
                        var statustypeid = statustypelookup.custrecord_bb_doc_status_type[0].value;
                        if (statustypeid) updatevalues.custrecord_bb_action_status_type = statustypeid;
                    }
                    log.debug('update values', updatevalues);
					/** @desc Set the fields on the record. */
					var result = record.submitFields({
                        type: 'customrecord_bb_project_action'
                        , id: actionid
                        , values: updatevalues                       
                        , options: {
                            ignoreMandatoryFields: true
                        }
                    });
                });
            } catch (e) {
                log.debug('error', e);
            }
            
            return '';
        }

        return {
            onAction: onAction
        };

    });