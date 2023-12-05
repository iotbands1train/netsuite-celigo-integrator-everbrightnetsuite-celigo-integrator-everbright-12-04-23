/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope public
 * 
 * Author: David Smith
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
            var segRecId = '';
            try{
                // get search id from parameters of the script
                var scriptObj = runtime.getCurrentScript();
                var searchId = scriptObj.getParameter({name:'custscript_bbss_wf_prj_search'});
              log.debug('searchId', searchId);

                var projectId = scriptContext.newRecord.id;
                var subsidiaryId = scriptContext.newRecord.getValue({fieldId:'subsidiary'});
              // We know this is a project because that is where it's deployed to
                // update or create the project interface record
                var segRec = getProjectSegmentRecord(projectId,subsidiaryId);
              	if(!segRec){
                  log.error('could not create or load segment');
                  return;
                }
                var segRecFields = segRec.getFields();
                log.debug('segRec fields',segRecFields);

                // load the search in order to get the column labels to set the data
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
                searchFilters.push(['internalid','is',projectId]);
                searchObj.filterExpression = searchFilters;
                log.debug('filterExpression',searchFilters);
              	var update=false;
                // run the search and return the first column from the first result
                searchObj.run().each(function(result){
                    log.debug('searchObj.columns',searchObj.columns);
                    for(var c=0; c<searchObj.columns.length; c++){
                        var col = searchObj.columns[c];
                        log.debug('col', col);

                        // This solution bases the field mapping on the column label to determin
                        // where to place the data on the integration record
                        var label = col.label;
                        log.debug('label', label);
                        if(!label || segRecFields.indexOf(label)==-1){
                            log.audit(c+' Column skipped - field invalid',col);
                            continue;
                        }
                      	// don't update the record if we don't have to
                      	if(segRec.getValue({fieldId:label.toLowerCase()}) != result.getValue(col)){
                            segRec.setValue({
                                fieldId:label.toLowerCase(),
                                value:result.getValue(col)
                            });
                          	update=true;
                        }
                    }
                    return false; // only work with first result of the search
                });

                // save the integration record with the field values
                if(update){
                  segRecId = segRec.save();
                  log.debug('Record Saved','customrecord_cseg_bb_project:'+segRecId);
                }
              // if this project was found by the search then it must be missing the segment on the project record
              // record.submitFields({
              //       type:record.Type.JOB,
              //       id: projectId,
              //       values:{
              //         cseg_bb_project: segRec.id
              //       }
              // });
              // Updated BY ML 10/23/2020 Changes to record load and save to prevent accounting related fields getting blanked out.
              var projectRecord = record.load({
                type: record.Type.JOB,
                id: projectId,
                isDynamic: true
              });
              projectRecord.setValue({
                fieldId: 'cseg_bb_project',
                value: segRec.id
              });
              projectRecord.save({
                ignoreMandatoryFields: true
              });
                

            } catch (e){
                     log.error('ERROR', e);
            }
            return segRecId;
        }

        function getProjectSegmentRecord(projectId,subsidiaryId){
            var rec;
            log.debug('searching for segment for project',projectId);
            // search for the record
            search.create({type:'customrecord_cseg_bb_project',
                filters: [['custrecord_seg_project','is',projectId],'and',['isinactive','is','F']],
                columns: ['internalid']
            }).run().each(function (result) {
                rec = record.load({
                    type:'customrecord_cseg_bb_project',
                    id: result.id,
                    isDynamic: true
                });
                return false; // only want first one found
            });
            if(!rec) {
                rec = record.create({
                    type:'customrecord_cseg_bb_project',
                    isDynamic: true
                });
                rec.setValue({fieldId:'custrecord_seg_project',value:projectId});
                rec.setValue({fieldId:'cseg_bb_project_filterby_subsidiary',value:subsidiaryId});
                //rec.setValue({fieldId:'custrecord_seg_subsidiary',value:subsidiaryId});
            }
            return rec;
        }

        return {
            onAction:onAction
        }
    
    }
);