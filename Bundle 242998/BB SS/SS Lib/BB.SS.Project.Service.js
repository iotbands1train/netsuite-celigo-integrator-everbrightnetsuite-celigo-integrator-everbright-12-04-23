/**
 * This is a Project service module
 *
 * @exports BB.SS.Project.Service
 *
 * @author Michael Golichenko <mgolichenko@bluebanyansolutions.com>
 * @version 0.0.2
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 *
 * @param recordModule {record} NetSuite native record service
 * @param searchModule {search} NetSuite native search service
 * @param projectActionService {module:ProjectActionService} NetSuite project action service
 * @param projectActionModel {module:ProjectActionModel} NetSuite project action model
 * @param projectModel {module:ProjectModel} NetSuite native project model
 **/

/**
 * Copyright 2017-2018 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */
function ProjectService(recordModule, searchModule, projectActionService, projectActionModel, projectModel){

    // needs to be refactored old structure code from merge
    var // ss config fields
        SS_CONFIG_DEFAULT_FULL_SERVICE_PROJECT_SITE_LOCATION_FIELD = 'custrecord_bb_full_serv_proj_site_loc',
        // customer fields
        CUSTOMER_PROJECT_SITE_LOCATION_FIELD = 'custentity_bb_project_site_location',
        // default values
        DEFAULT_LOCATION_ID = 6,
        EPC_PROJECT_JOBTYPE_TEXT = 'EPC',
        PROJECT_ACTION_REQUIRED_OPTIONAL_OPTION_ID = 2
    ;

    /**
     * @module ProjectService
     * @private
     * @class
     */
    var _exports = function(){};

    /*
     *  ALL BUSINESS LOGIC FUNCTIONS
     */

    /**
     * <code>isM1FieldInitiallyUpdated</code> function that helps to identify if M1 field is initially updated
     *
     * @governance 0
     * @param projectNewValue {Record} updated Project record
     * @param projectOldValue {Record} old Project record
     *
     * @return {boolean}
     */
    function isM1FieldInitiallyUpdated(projectNewValue, projectOldValue){
        var _m1FieldOldValue = projectOldValue.getValue({fieldId: projectModel.CustomFields.M1_DATE}),
            _m1FieldNewValue = projectNewValue.getValue({fieldId: projectModel.CustomFields.M1_DATE});
        if(projectNewValue && projectOldValue && (!_m1FieldOldValue || _m1FieldOldValue == '') && (_m1FieldNewValue && _m1FieldNewValue != '')){
            return true;
        }
        return false;
    }

    /**
     * <code>getLocationId</code> function that gets location internal id by financier, config or returns default one
     *
     * @governance 5
     * @param project {Record} Project record
     * @param config {Record} BB SS Configuration record
     *
     * @return {number|string}
     */
    function getLocationId(project, config){
        var _projectType = project.getText({fieldId: projectModel.Fields.JOB_TYPE}),
            _locationId = undefined;
        if(new RegExp(EPC_PROJECT_JOBTYPE_TEXT, 'ig').test(_projectType)){
            var _financier = recordModule.load({type: recordModule.Type.CUSTOMER, id: project.getValue({fieldId: projectModel.CustomFields.FINANCIER_REF})});
            _locationId = _financier.getValue({fieldId: CUSTOMER_PROJECT_SITE_LOCATION_FIELD});
        } else {
            _locationId = config.getValue({fieldId: SS_CONFIG_DEFAULT_FULL_SERVICE_PROJECT_SITE_LOCATION_FIELD});
        }
        return typeof _locationId !== 'undefined' ? _locationId : DEFAULT_LOCATION_ID;
    }

    function getCustomDocumentTemplateProjectActionChanges(projectData, projectActions, projectFieldId, templateFieldId, extraFilters){
        var _filters = [{'name': 'isinactive', 'operator': 'is', 'values': ['F']}];
        if(extraFilters instanceof Array && extraFilters.length > 0){
            _filters = _filters.concat(extraFilters);
        }
        var _searchTemplate = searchModule.create({
            type: 'customrecord_bb_document_template',
            filters: _filters,
            columns: [
                'custrecord_bb_doc_temp_state'
                , 'custrecord_bb_document_template'
                , 'custrecord_bb_doc_temp_pkg_action'
                , 'custrecord_bb_doc_temp_util_company'
                , 'custrecord_bb_doc_temp_municipality'
                , 'custrecord_bb_doc_temp_hoa'
                , 'custrecord_bb_doc_temp_org_type'
                , 'custrecord_bb_doc_temp_financier'
            ]
        });
        var _templateList = {};
        _searchTemplate.run().each(function(row){
            var _id = row.getValue({name: 'custrecord_bb_doc_temp_pkg_action'});
            if(!_templateList.hasOwnProperty(_id)){
                _templateList[_id] = {};
                row.columns.forEach(function(col){
                    _templateList[_id][col.name] = {
                        value: row.getValue({name: col.name}),
                        text: row.getText({name: col.name})
                    };
                });
            }
            return true;
        });
        var projectActionsToUpdate = [];
        projectActions.forEach(function(projectAction){
          	var _packageActionPackage = projectAction.getValue({name: projectActionModel.CustomFields.PROJECT_PACKAGE_ACTION});
            if(_templateList.hasOwnProperty(_packageActionPackage)){
                var _template =  _templateList[_packageActionPackage];
                var _projectValue = projectData.getValue({fieldId: projectFieldId});
                var _templateValue = _template && _template[templateFieldId] ? _template[templateFieldId].value : undefined;
                var _useCustomTemplate = _projectValue && _templateValue && _projectValue === _templateValue;
                if(_useCustomTemplate){
                    projectActionsToUpdate.push({
                        template: _template.custrecord_bb_document_template.value,
                        id: projectAction.id
                    });
                }
            }
        });
        return projectActionsToUpdate;
    }


    /**
     * <code>customDocumentTemplateFieldChangeProcess</code> function that update project action if specified field is changed
     *
     * @governance 0, 20+
     * @param newProject {Record} updated Project record
     * @param oldProject {Record} old Project record
     *
     * @return {void}
     */
    function customDocumentTemplateFieldChangeProcess(newProject, oldProject, projectFieldId, customDocumentTemplateFieldId){
        if(!oldProject) return;
        var _newFieldValue = newProject.getValue({fieldId: projectFieldId}),
            _oldFieldValue = oldProject.getValue({fieldId: projectFieldId}),
            _fieldValueChanged = _newFieldValue !== _oldFieldValue,
            _oldProjectActions = [];
        if(!_newFieldValue) return;
        if(_fieldValueChanged){
            var _extraFilters = [{'name': customDocumentTemplateFieldId, 'operator': searchModule.Operator.ANYOF, 'values': [_newFieldValue]}];
            _oldProjectActions = projectActionService.getProjectActionsByProjectId(newProject.id);
            var _changeTemplateProjectActions = getCustomDocumentTemplateProjectActionChanges(newProject, _oldProjectActions, projectFieldId, customDocumentTemplateFieldId, _extraFilters);
            _changeTemplateProjectActions.forEach(function(projectAction){
                projectActionService.createNewRevision(projectAction.id, {'custrecord_bb_proj_act_temp_doc_rec': projectAction.template});
            });
        }
    }

    function projectFieldsChange(newProject, oldProject){
        var _fieldConfiguration = [
            {
                projectFieldId: 'custentity_bb_entity_hoa',
                customDocumentTemplateFieldId: 'custrecord_bb_doc_temp_hoa'
            },
            {
                projectFieldId: 'custentity_bb_utility_company_source',
                customDocumentTemplateFieldId: 'custrecord_bb_doc_temp_util_company'
            },
            {
                projectFieldId: 'custentity_bb_entity_municipality',
                customDocumentTemplateFieldId: 'custrecord_bb_doc_temp_municipality'
            },
            {
                projectFieldId: 'custentity_bb_install_state',
                customDocumentTemplateFieldId: 'custrecord_bb_doc_temp_state'
            },
            {
                projectFieldId: 'custentity_bb_financier_customer',
                customDocumentTemplateFieldId: 'custrecord_bb_doc_temp_financier'
            }
        ];
        _fieldConfiguration.forEach(function(config){
            customDocumentTemplateFieldChangeProcess(newProject, oldProject, config.projectFieldId, config.customDocumentTemplateFieldId);
        });
    }


    /**
     * <code>changeProjectTemplate</code> function that update project action is project template changes
     *
     * @governance 0, 20+
     * @param newProject {Record} updated Project record
     * @param oldProject {Record} old Project record
     *
     * @return {void}
     */
    function changeProjectTemplate(newProject, oldProject){
        if(!oldProject) return;

        var _newProjectTemplate = newProject.getValue({fieldId: projectModel.CustomFields.PROJECT_TEMPLATE}),
            _oldProjectTemplate = oldProject.getValue({fieldId: projectModel.CustomFields.PROJECT_TEMPLATE}),
            _projectTemplateChanged = _newProjectTemplate != _oldProjectTemplate,
            _newProjectActions = [],
            _oldProjectActions = [];
        if(!_newProjectTemplate) return;
        if(_projectTemplateChanged){
            log.debug('executing project template change');
            _oldProjectActions = projectActionService.getProjectActionsByProjectId(oldProject.id);
            log.debug('_oldProjectActions', _oldProjectActions);
            _newProjectActions = projectActionService.getProjectActionsByProjectId(_newProjectTemplate);
            log.debug('_oldProjectActions', _oldProjectActions);
            _newProjectActions.forEach(function(newProjectAction){
                var _foundOldProjectActions = projectActionService.findSameProjectActions(_oldProjectActions, newProjectAction);
                if(_foundOldProjectActions && _foundOldProjectActions.length > 0){
                    if(_foundOldProjectActions.length == 1){
                        var _foundOldProjectAction = _foundOldProjectActions[0],
                            _oldIsRequired = _foundOldProjectAction.getValue({name: projectActionModel.CustomFields.REQUIRED}),
                            _newIsRequired = newProjectAction.getValue({name: projectActionModel.CustomFields.REQUIRED}),
                            _oldStepNumber = _foundOldProjectAction.getValue({name: projectActionModel.CustomFields.PACKAGE_STEP}),
                            _newStepNumber = newProjectAction.getValue({name: projectActionModel.CustomFields.PACKAGE_STEP}),
                            _updateRequired = false,
                            _values = {};
                        if(_oldIsRequired != _newIsRequired){
                            _values[projectActionModel.CustomFields.REQUIRED] = _newIsRequired;
                            _updateRequired = true;
                        }
                        if(_oldStepNumber != _newStepNumber){
                            _values[projectActionModel.CustomFields.PACKAGE_STEP] = _newStepNumber;
                            _updateRequired = true;
                        }
                        if(_updateRequired){
                            recordModule.submitFields({
                                type: projectActionModel.Type,
                                id: _foundOldProjectAction.id,
                                values: _values,
                                options: {
                                	ignoreMandatoryFields: true
                                }
                            });
                        }
                    }
                } else {
                    var _newProjectAction = recordModule.copy({
                        type: projectActionModel.Type,
                        id: newProjectAction.id
                    });
                    _newProjectAction.setValue({fieldId: projectActionModel.CustomFields.PROJECT, value: newProject.id});
                    _newProjectAction.save({
                    	ignoreMandatoryFields: true
                    });
                }
            });
            _oldProjectActions.forEach(function(oldProjectAction){
                var _foundNewProjectActions = projectActionService.findSameProjectActions(_newProjectActions, oldProjectAction);
                if(!_foundNewProjectActions || _foundNewProjectActions.length == 0){
                    log.debug('found project action not included in new set that needs to be marked optional');
                    var _isRequired = oldProjectAction.getValue({name: projectActionModel.CustomFields.REQUIRED});
                    log.debug('is required for project action id: ' + oldProjectAction.id, _isRequired);
                    if(_isRequired && _isRequired == 1){ // 5/26/2021 ML (_isRequired && (_isRequired === true || /t/ig.test(_isRequired))) -- removed this logic because required returns 1 or 2 vs true or false was not executing setting optional on old actions 
                        var _values = {};
                        _values[projectActionModel.CustomFields.REQUIRED] = PROJECT_ACTION_REQUIRED_OPTIONAL_OPTION_ID;
                        recordModule.submitFields({
                            type: projectActionModel.Type,
                            id: oldProjectAction.id,
                            values: _values,
                            options: {
                            	ignoreMandatoryFields: true
                            }
                        });
                    }
                }
            });
        }


    }

    /*
     *  ALL DATA ACCESS FUNCTIONS
     */

    /**
     * <code>getLeadRecordById</code> function
     *
     * @governance 5
     *
     * @param projectId {number|string} Project internal ID
     * @return {Record}
     */
    function getProjectRecordById(projectId){
        return recordModule.load({type: projectModel.Type, id: projectId});
    }

    _exports.prototype.getProjectRecordById = getProjectRecordById;
    _exports.prototype.getLocationId = getLocationId;
    _exports.prototype.changeProjectTemplate = changeProjectTemplate;
    _exports.prototype.isM1FieldInitiallyUpdated = isM1FieldInitiallyUpdated;
    _exports.prototype.projectFieldsChange = projectFieldsChange;

    return new _exports();
}

define([
    'N/record'
    , 'N/search'
    , './BB.SS.ProjectAction.Service'
    , './BB.SS.ProjectAction.Model'
    , './BB.SS.Project.Model'
], ProjectService);
