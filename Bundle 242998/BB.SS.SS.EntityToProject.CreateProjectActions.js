/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope Public
 * @author Matt Lehman
 * @overview - Scheduled Script task to process project actions from Entity to Project
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

define(['N/runtime', 'N/record', 'N/search', './BB SS/SS Lib/BB.SS.MD.LeadToProject'], function(runtime, record, search, leadToProject) {


    // function customDocumentTemplateProcess(projectId, tasks){
    //     var _project = record.load({
    //             type: record.Type.JOB,
    //             id: projectId
    //     });
    //     var _searchTemplate = search.create({
    //         type: 'customrecord_bb_document_template',
    //         filters: [['isinactive', 'is', 'F']],
    //         columns: [
    //             'custrecord_bb_doc_temp_state'
    //             , 'custrecord_bb_document_template'
    //             , 'custrecord_bb_doc_temp_pkg_action'
    //             , 'custrecord_bb_doc_temp_util_company'
    //             , 'custrecord_bb_doc_temp_municipality'
    //             , 'custrecord_bb_doc_temp_hoa'
    //             , 'custrecord_bb_doc_temp_org_type'
    //             , 'custrecord_bb_doc_temp_financier'
    //         ]
    //     });
    //     var _templateList = {};
    //     var _functions = {
    //         'hao': function(project, template){
    //             var _projectValue = project.getValue({fieldId: 'custentity_bb_entity_hoa'});
    //             var _templateValue = template && template.custrecord_bb_doc_temp_hoa ? template.custrecord_bb_doc_temp_hoa.value : undefined;
    //             return _projectValue && _templateValue && _projectValue === _templateValue;
    //         },
    //         'utility': function(project, template){
    //             var _projectValue = project.getValue({fieldId: 'custentity_bb_utility_company_source'});
    //             var _templateValue = template && template.custrecord_bb_doc_temp_util_company ? template.custrecord_bb_doc_temp_util_company.value : undefined;
    //             return _projectValue && _templateValue && _projectValue === _templateValue;
    //         },
    //         'municipality': function(project, template){
    //             var _projectValue = project.getValue({fieldId: 'custentity_bb_entity_municipality'});
    //             var _templateValue = template && template.custrecord_bb_doc_temp_municipality ? template.custrecord_bb_doc_temp_municipality.value : undefined;
    //             return _projectValue && _templateValue && _projectValue === _templateValue;
    //         },
    //         'state': function(project, template){
    //             var _projectValue = project.getValue({fieldId: 'custentity_bb_install_state'});
    //             var _templateValue = template && template.custrecord_bb_doc_temp_state ? template.custrecord_bb_doc_temp_state.value : undefined;
    //             return _projectValue && _templateValue && _projectValue === _templateValue;
    //         },
    //         'financier': function(project, template){
    //             var _projectValue = project.getValue({fieldId: 'custentity_bb_financier_customer'});
    //             var _templateValue = template && template.custrecord_bb_doc_temp_financier ? template.custrecord_bb_doc_temp_financier.value : undefined;
    //             return _projectValue && _templateValue && _projectValue === _templateValue;
    //         }
    //     };
    //     _searchTemplate.run().each(function(row){
    //         var _id = row.getValue({name: 'custrecord_bb_doc_temp_pkg_action'});
    //         if(!_templateList.hasOwnProperty(_id)){
    //             _templateList[_id] = {};
    //             row.columns.forEach(function(col){
    //                 _templateList[_id][col.name] = {
    //                     value: row.getValue({name: col.name}),
    //                     text: row.getText({name: col.name})
    //                 };
    //             });
    //         }
    //         return true;
    //     });
    //     tasks.forEach(function(task){
    //         if(_templateList.hasOwnProperty(task.packageAction)){
    //             var _template =  _templateList[task.packageAction];
    //             var _funcName = _template && _template.custrecord_bb_doc_temp_org_type && typeof _template.custrecord_bb_doc_temp_org_type.text === 'string'
    //                 ? _template.custrecord_bb_doc_temp_org_type.text.toLowerCase().trim()
    //                 : undefined;
    //             if(_funcName && _functions.hasOwnProperty(_funcName)){
    //                 var _useCustomTemplate = _functions[_funcName](_project, _template);
    //                 if(_useCustomTemplate){
    //                     task.template_document_record = _template.custrecord_bb_document_template.value;
    //                 }
    //             }
    //         }
    //     });
    //     return tasks;
    // }

//'N/record', 'N/search', './BB SS/SS Lib/BB.SS.Entity', 
    function execute(scriptContext) {
        var paramsObj = runtime.getCurrentScript();
        var projectId = paramsObj.getParameter({
            name: 'custscript_project_id'
        });
        if (projectId) projectId = JSON.parse(projectId);


        var projectTemplate = paramsObj.getParameter({
            name: 'custscript_project_template_id'
        });
        if (projectTemplate) projectTemplate = JSON.parse(projectTemplate);

        var entityId = paramsObj.getParameter({
            name: 'custscript_entity_id'
        });
        if (entityId) entityId = JSON.parse(entityId);

        var proposalFileId = paramsObj.getParameter({
            name: 'custscript_file_id'
        });
        if (proposalFileId) proposalFileId = JSON.parse(proposalFileId);

        var utilityBillFileId = paramsObj.getParameter({
            name: 'custscript_utility_bill_file_id'
        });
        if (utilityBillFileId) utilityBillFileId = JSON.parse(utilityBillFileId);


        log.debug('project id', projectId);
        log.debug('project Template', projectTemplate);
        log.debug('entity id', entityId);
        log.debug('proposal id', proposalFileId);
        log.debug('utility bill file id', utilityBillFileId);
        try {
            if (projectTemplate) {
                var tasks = leadToProject.getTemplateRelatedProjectActions(projectTemplate);
                // tasks = customDocumentTemplateProcess(projectId, tasks);
                log.debug('project action tasks', tasks);
                log.debug('project action tasks count', tasks.length);
                if (tasks && projectId) {
                    leadToProject.createNewProjectActionsFromTemplate(tasks, projectId, utilityBillFileId, proposalFileId);
                    // projectsModule.copyTasksFromProject(tasks, projectId, entityId, proposal, tasks);
                }

            }
        } catch (e) {
            log.error('error processing project action creation', e);
        }
    }

    return {
       execute: execute
    };
    
});