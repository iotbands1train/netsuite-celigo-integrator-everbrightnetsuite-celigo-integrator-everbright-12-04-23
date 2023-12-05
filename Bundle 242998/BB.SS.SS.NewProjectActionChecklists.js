/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope Public
 * @Overview - Add new Project Action Checklist Records after Project Action creation
 */
define(['N/runtime', 'N/search', 'N/record'],

    function(runtime, search, record) {

        /**
         * Definition of the Scheduled script trigger point.
         *
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
         * @Since 2015.2
         */
        function execute(scriptContext) {
            var projectId = runtime.getCurrentScript().getParameter({name: 'custscript_bb_checklist_projectid'});
            log.audit('projectId', projectId);
            try {
                if (projectId) {
                    var checkListObj = getProjectActionsAndChecklistDetails(projectId);
                    var projectActionArray = checkListObj.projectActionArray;
                    if (checkListObj.actionTemplateArray.length > 0) {
                        var actionTemplateString = checkListObj.actionTemplateArray.toString();
                        log.debug('action template string value', actionTemplateString);
                        var customrecord_bb_atchklistSearchObj = search.create({
                            type: "customrecord_bb_atchklist",
                            filters:
                                [
                                    ["custrecord_bb_atchklist_action_template","anyof", actionTemplateString],
                                    "AND",
                                    ["isinactive","is","F"]
                                ],
                            columns:
                                [
                                    search.createColumn({name: "internalid", label: "Internal ID"}),
                                    search.createColumn({
                                        name: "name",
                                        sort: search.Sort.ASC,
                                        label: "Name"
                                    }),
                                    search.createColumn({name: "custrecord_bb_atchklist_action_group", label: "Action Group"}),
                                    search.createColumn({name: "custrecord_bb_atchklist_action_template", label: "Action Template"})
                                ]
                        });
                        var searchResultCount = customrecord_bb_atchklistSearchObj.runPaged().count;
                        log.debug("Action Template Checklist result count",searchResultCount);
                        customrecord_bb_atchklistSearchObj.run().each(function(result){
                            var obj = {
                                actionGroup: result.getValue({name: 'custrecord_bb_atchklist_action_group'}),
                                actionTemplate: result.getValue({name: 'custrecord_bb_atchklist_action_template'}),
                            }
                            var projectActionObj = getProjectActionByActionGroupAndTemplate(projectActionArray, obj);
                            if (projectActionObj.length > 0) {
                                // var existingId = checkForExistingCheckListRecord(projectId, result.getValue({name: 'custrecord_bb_atchklist_action_group'}),
                                //     result.getValue({name: 'custrecord_bb_atchklist_action_template'}), result.getValue({name: 'name'}));
                                // if (!existingId) {
                                    var projectActionChecklist = record.create({
                                        type: 'customrecord_bb_project_action_checklist',
                                        isDynamic: true
                                    });
                                    projectActionChecklist.setValue({fieldId: 'custrecord_bb_pachklist_title', value: result.getValue({name: 'name'})});
                                    projectActionChecklist.setValue({fieldId: 'custrecord_bb_pachklist_project', value: projectId});
                                    projectActionChecklist.setValue({fieldId: 'custrecord_bb_pachklist_project_action', value: projectActionObj[0].id});
                                    projectActionChecklist.setValue({fieldId: 'custrecord_bb_pachklist_action_group', value: result.getValue({name: 'custrecord_bb_atchklist_action_group'})});
                                    projectActionChecklist.setValue({fieldId: 'custrecord_bb_pachklist_action_template', value: result.getValue({name: 'custrecord_bb_atchklist_action_template'})});
                                    projectActionChecklist.setValue({fieldId: 'custrecord_bb_pachklist_act_template', value: result.getValue({name: 'internalid'})});
                                    projectActionChecklist.save({
                                        ignoreMandatoryFields: true
                                    });
                                // }
                            }
                            return true;
                        });
                    }
                }
            } catch (e) {
                log.error('error creating project action punchlist record', e);
            }
        }

        function getProjectActionsAndChecklistDetails(projectId) {
            var projectActionArray = [];
            var actionTemplateArray = [];
            if (projectId) {
                var customrecord_bb_project_actionSearchObj = search.create({
                    type: "customrecord_bb_project_action",
                    filters:
                        [
                            ["custrecord_bb_project", "anyof", projectId],
                            "AND",
                            ["isinactive", "is", "F"]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"}),
                            search.createColumn({name: "custrecord_bb_project", label: "Project"}),
                            search.createColumn({name: "custrecord_bb_package", label: "Action Group"}),
                            search.createColumn({
                                name: "custrecord_bb_project_package_action",
                                label: "Action Template"
                            })
                        ]
                });
                var searchResultCount = customrecord_bb_project_actionSearchObj.runPaged().count;
                log.debug("Project Action result count", searchResultCount);
                customrecord_bb_project_actionSearchObj.run().each(function (result) {
                    projectActionArray.push({
                        id: result.getValue({name: 'internalid'}),
                        projectId: result.getValue({name: 'custrecord_bb_project'}),
                        actionGroup: result.getValue({name: 'custrecord_bb_package'}),
                        actionTemplate: result.getValue({name: 'custrecord_bb_project_package_action'})
                    });
                    if (result.getValue({name: 'custrecord_bb_project_package_action'})) {
                        actionTemplateArray.push(result.getValue({name: 'custrecord_bb_project_package_action'}))
                    }
                    return true;
                });
            }
            return {
                projectActionArray: projectActionArray,
                actionTemplateArray: actionTemplateArray
            };
        }


        function getProjectActionByActionGroupAndTemplate(projectActionArray, obj) {
            var value = projectActionArray.filter(function(data) {
                return data.actionGroup == obj.actionGroup && data.actionTemplate == obj.actionTemplate;
            });
            return value;
        }


        function checkForExistingCheckListRecord(project, actionGroup, actionTemplate, title) {
            var checklistId = null;
            if (project && actionGroup && actionTemplate && title) {
                var customrecord_bb_project_action_checklistSearchObj = search.create({
                    type: "customrecord_bb_project_action_checklist",
                    filters:
                        [
                            ["custrecord_bb_pachklist_project", "anyof", project],
                            "AND",
                            ["custrecord_bb_pachklist_action_group", "anyof", actionGroup],
                            "AND",
                            ["custrecord_bb_pachklist_action_template", "anyof", actionTemplate],
                            "AND",
                            ["isinactive", "is", "F"],
                            "AND",
                            ["custrecord_bb_pachklist_title", "is", title]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"})
                        ]
                });
                var searchResultCount = customrecord_bb_project_action_checklistSearchObj.runPaged().count;
                log.debug("Found Existing checklist record count", searchResultCount);
                var result = customrecord_bb_project_action_checklistSearchObj.run().getRange({start: 0, end: 1});
                if (result.length > 0) {
                    checklistId = result.getValue({name: 'internalid'})
                }
            }
            return checklistId;
        }


        return {
            execute: execute
        };

    });
