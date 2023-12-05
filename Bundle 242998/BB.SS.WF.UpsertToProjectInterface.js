/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope Public
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

define(['N/runtime','N/search','N/record'],
    function(runtime, search, record) {
    
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
         	log.debug('onAction', scriptContext);
            var integrationRecId = '';
            try{
                // get search id from parameters of the script
                var scriptObj = runtime.getCurrentScript();
                var projectId = scriptObj.getParameter({name:'custscript_bbss_wf_prj_id'});
                var customerId = scriptObj.getParameter({name:'custscript_bbss_wf_cust_id'});
                var searchId = scriptObj.getParameter({name:'custscript_bbss_wf_intgr_search'});

                if(/job/i.test(scriptContext.newRecord.type)) {
                  projectId = scriptContext.newRecord.id;
                  customerId = scriptContext.newRecord.getValue({fieldId: 'custentity_bb_homeowner_customer'});
                }
                if(/customer/i.test(scriptContext.newRecord.type)) {
                  customerId = scriptContext.newRecord.id;
                }
                if(/customrecord_bb_project_action/i.test(scriptContext.newRecord.type)) {
                  projectId = scriptContext.newRecord.getValue({fieldId:'custrecord_bb_project'});
                }
                // update or create the project interface record
                var integrationRec = getIntegrationRecord(projectId, customerId);
                var integrationFields = integrationRec.getFields();

                // load the search
                var searchObj = search.load({
                	id: searchId
                });
                // add the filter for the internalid value of the record this is running against
                // if it's already in the search it's ok if it has it twice
                var searchFilters = searchObj.filterExpression;
                log.debug('filterExpression before modification',searchFilters);
                if(/job/i.test(scriptContext.newRecord.type)){
                  searchFilters.push('and');
                  searchFilters.push(['internalid','is',projectId]);
                }
                if(/customrecord_bb_project_action/i.test(scriptContext.newRecord.type)){
                  searchFilters.push('and');
                  searchFilters.push(["custrecord_bb_project.internalid",'is',projectId]);
                }
                if(/customer/i.test(scriptContext.newRecord.type)){
                  searchFilters.push('and');
                  searchFilters.push(['internalid','is',customerId]);
                }
                searchObj.filterExpression = searchFilters;
                log.debug('filterExpression after modification after assignment',searchFilters);
                // run the search and return the first column from the first result
                searchObj.run().each(function(result){
                    log.debug('searchObj.columns',searchObj.columns);
                    for(var c=0; c<searchObj.columns.length; c++){
                        var col = searchObj.columns[c];

                        // This solution bases the field mapping on the column label to determine
                        // where to place the data on the integration record
                        var label = col.label;
                        if(!label || integrationFields.indexOf(label)==-1){
                            log.audit(c+' Column skipped - field invalid',col);
                            continue;
                        }

                        var myField = integrationRec.getField({fieldId: label});
                        switch (myField.type) {
                            case "checkbox":
                                log.debug('case checkbox', result.getValue(col));
                                if (["T", "t", 1, "True", "true", true, "Y"].indexOf(result.getValue(col)) >= 0) {
                                    log.debug('setting true checkbox field value');
                                    integrationRec.setValue({
                                        fieldId:label,
                                        value:true
                                    });
                                }
                                else if (["F", "f", 0, "False", "false", false, "N"].indexOf(result.getValue(col)) >= 0) {
                                    log.debug('setting false checkbox field value');
                                    integrationRec.setValue({
                                        fieldId:label,
                                        value:false
                                    });
                                }
                                break;

                            default:
                                log.debug('case default', result.getValue(col));
                                integrationRec.setValue({
                                    fieldId:label,
                                    value:result.getValue(col)
                                });
                                break;
                        }
                    }
                    return false; // only work with first result of the search
                });

                // save the integration record with the field values
                integrationRecId = integrationRec.save();
                log.debug('Record Saved','customrecord_bb_ss_project_interface:'+integrationRecId);

            } catch (e){
                     log.error('ERROR', e);
            }
            return integrationRecId;
        }

        function getIntegrationRecord(projectId, customerId){
            var
              rec
              , _filters = [
                ['isinactive','is','F']
                , 'and'
              ]
              , _searchFilters = []
            ;
            log.debug('searching for interface for project',projectId);
            log.debug('searching for interface for customer',customerId);
            // search for the record
            if(projectId) {
              _searchFilters.push(['custrecord_bb_pi_project', 'is', projectId]);
            }
            if(customerId) {
              if(_searchFilters.length > 0) {
                _searchFilters.push('or');
              }
              _searchFilters.push(['custrecord_bb_pi_customer', 'is', customerId]);
            }

            search.create({type:'customrecord_bb_ss_project_interface',
                filters: [
                  [
                    _searchFilters
                  ]
                  , 'and'
                  , ['isinactive','is','F']
                ],
                columns: ['internalid', 'custrecord_bb_pi_project', 'custrecord_bb_pi_customer']
            }).run().each(function (result) {
                rec = record.load({
                    type:'customrecord_bb_ss_project_interface',
                    id: result.id,
                    isDynamic: true
                });
                if(!result.getValue({name: 'custrecord_bb_pi_project'}) && projectId) {
                  rec.setValue({fieldId: 'custrecord_bb_pi_project', value: projectId});
                }
                if(!result.getValue({name: 'custrecord_bb_pi_customer'}) && customerId) {
                  rec.setValue({fieldId: 'custrecord_bb_pi_customer', value: customerId});
                }
                return false; // only want first one found
            });
            if(!rec) {
                rec = record.create({
                    type:'customrecord_bb_ss_project_interface',
                    isDynamic: true
                });
                if(projectId) {
                  rec.setValue({fieldId:'custrecord_bb_pi_project',value:projectId});
                }
              if(customerId) {
                rec.setValue({fieldId:'custrecord_bb_pi_customer',value:customerId});
              }
            }
            return rec;
        }

        return {
            onAction:onAction
        }
    
    }
);