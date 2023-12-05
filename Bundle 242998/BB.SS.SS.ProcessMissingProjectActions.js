/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope Public
 * @author Matt Lehman
 * @overview - Scheduled Script task to process project actions missing on project records
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
 
define(['N/search', 'N/runtime', './BB SS/SS Lib/BB.SS.MD.LeadToProject'], function(search, runtime, leadToProject) {
   
    function execute(scriptContext) {
        var projects = getProjectsMissingActions();
        if (projects.length > 0) {
            for (var i = 0; i < projects.length; i++) {
                var projectId = projects[i].projectId;
                var templateId = projects[i].templateId;
                var entityId = projects[i].entityId;
                var proposal = projects[i].proposal;

                log.debug('project id', projectId);
                log.debug('project Template', templateId);
                log.debug('entity id', entityId);
                log.debug('proposal id', proposal);
                var project = {
                    internalId: projectId
                };
                if (templateId) {
                    var tasks = leadToProject.getTemplateRelatedProjectActions(templateId)
                    log.debug('project action tasks', tasks);
                    log.debug('project action tasks count', tasks.length);
                    if (entityId) { 
                        leadToProject.createNewProjectActionsFromTemplate(tasks, projectId, null, proposal);
                    }
                    
                    var processActions = runtime.getCurrentScript();
                    log.debug('Remaining governance units', processActions.getRemainingUsage());
                }


            }

        } else {
            log.audit('Message','Could not find any projects missing project actions')
        }

    }

    function getProjectsMissingActions() {
        var projectsArr = [];
        var jobSearchObj = search.create({
            type: "job",
            filters:
            [
                ["custrecord_bb_project.custrecord_bb_project","anyof","@NONE@"]
            ],
            columns:
            [
                "internalid",
                "entityid",
                "custentity_bb_started_from_proj_template",
                search.createColumn({
                    name: "internalid",
                    join: "CUSTENTITY_BB_STARTED_FROM_PROJ_TEMPLATE"
                }),
                "custentity_bb_homeowner_customer"
            ]
        });
        var searchResultCount = jobSearchObj.runPaged().count;
        log.debug("Projects missing actions count", searchResultCount);
        var searchResult = jobSearchObj.run().getRange({
            start:0,
            end: 250
        });

        if (searchResult.length > 0) {
            for (var i = 0; i < searchResult.length; i++) {
                 var projectId = searchResult[i].getValue({
                    name: 'internalid'
                });
                var templateId = searchResult[i].getValue({
                    name: 'custentity_bb_started_from_proj_template'
                });
                var entityId = searchResult[i].getValue({
                    name: 'custentity_bb_homeowner_customer'
                });
                log.debug('entity id', entityId);
                var proposal;
                // if (entityId) {
                //     proposal = getProposal(entityId);
                // } 
                //var proposal = getProposal(entityId);
                if (projectId && templateId && entityId) {
                    projectsArr.push({
                        projectId: projectId,
                        templateId: templateId,
                        entityId: entityId,
                        proposal: null
                    });
                }

            }
        }

        return projectsArr;
    }


    function getProposal(entityId) {
        var proposalId;
        var customrecord_bb_proposalSearchObj = search.create({
            type: "customrecord_bb_proposal",
            filters:
            [
                ["custrecord_bb_lead.internalid","anyof", entityId]
            ],
            columns:
            [
                "custrecord_bb_file_system",   
            ]
        });
        customrecord_bb_proposalSearchObj.run().each(function(result){
            proposalId = result.getValue({
                name: 'custrecord_bb_file_system'
            });
            return true;
        });
        log.debug('Proposal Id', proposalId);
        if (proposalId) {
            return proposalId;
        }
            
    }

    return {
       execute: execute
    }
    
});