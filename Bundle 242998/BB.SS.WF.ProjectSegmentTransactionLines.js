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

define(['N/runtime', 'N/search', 'N/record'],
    function (runtime, search, record) {

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
            try {
                /************** script parameters **************/
                var scriptObj = runtime.getCurrentScript();
                var setBody = scriptObj.getParameter({name: "custscript_bb_proj_seg_set_body"});
                var setLine = scriptObj.getParameter({name: "custscript_bb_proj_seg_set_line"});
                var getProjectFromLine = scriptObj.getParameter({name: "custscript_bb_proj_get_line"});
                /************** end script parameters **************/

                    // cseg_bb_project
                var projectId;
                var prjSeg;
                if (!getProjectFromLine) {
                    projectId = scriptContext.newRecord.getValue({fieldId: 'custbody_bb_project'});
                    if (!projectId) return;

                    prjSeg = search.lookupFields({
                        type: search.Type.JOB,
                        id: projectId,
                        columns: ['cseg_bb_project']
                    }).cseg_bb_project;
                    //log.debug('project segment found',prjSeg);

                    if (!prjSeg) {
                        log.debug('Project found but no segment');
                        return;
                    }
                }

                var recordHasChanged = false;
                var transRecord = record.load({
                    type: scriptContext.newRecord.type,
                    id: scriptContext.newRecord.id,
                    isDynamic: true
                });
                if (setBody) {
                    transRecord.setValue({fieldId: 'cseg_bb_project', value: prjSeg[0].value});
                    recordHasChanged = true;
                }
                if (setLine) {
                    var sublists = transRecord.getSublists();
                    for (var s = 0; s < sublists.length; s++) {
                        var sublistid = sublists[s];
                        var sublistFields = transRecord.getSublistFields({sublistId: sublistid});
                        var hasSegmentColumn = sublistFields.indexOf('cseg_bb_project') >= 0;
                        if (!hasSegmentColumn) continue;

                        var lineCount = transRecord.getLineCount({sublistId: sublistid});
                        for (var i = 0; i < lineCount; i++) {

                            transRecord.selectLine({sublistId: sublistid, line: i});
                            var value;
                            if (getProjectFromLine) {
                                var lineProj = transRecord.getCurrentSublistValue({
                                    sublistId: sublistid,
                                    fieldId: 'customer',
                                });
                                value = search.lookupFields({
                                    type: search.Type.JOB,
                                    id: lineProj,
                                    columns: ['cseg_bb_project']
                                }).cseg_bb_project[0].value;
                                log.debug("value" , value)
                                if (!value) continue;

                            } else {
                                value = prjSeg[0].value
                            }
                            log.debug("value" , value)
                            transRecord.setCurrentSublistValue({
                                sublistId: sublistid,
                                fieldId: 'cseg_bb_project',
                                value: value
                            });
                            transRecord.commitLine({sublistId: sublistid});
                            recordHasChanged = true;
                        }
                    }
                }

                if (recordHasChanged) {
                    log.debug(transRecord.type + ':' + transRecord.id, prjSeg);
                    transRecord.save({
                        ignoreMandatoryFields: true,
                        disableTriggers: true
                    });
                }

            } catch
                (e) {
                log.error('ERROR', e);
            }
        }

        return {
            onAction: onAction
        }

    }
)
;