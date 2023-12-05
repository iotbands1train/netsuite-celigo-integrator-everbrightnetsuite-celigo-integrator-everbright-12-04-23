/**
 * This is a Project Action service module
 *
 * @exports BB.SS.ProjectAction.Service
 *
 * @copyright Blue Banyan Solutions
 * @author Michael Golichenko <mgolichenko@bluebanyansolutions.com>
 * @version 0.0.1
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 *
 * @param recordModule {record} NetSuite native record service
 * @param searchModule {search} NetSuite native search service
 * @param projectActionModel {module:ProjectActionModel} NetSuite native lead model
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
function ProjectActionService(recordModule, searchModule, projectActionModel){

    var _documentStatusses;

    /**
     * @module ProjectActionService
     * @private
     * @class
     */
    var _exports = function(){};

    /*
     *  ALL BUSINESS LOGIC FUNCTIONS
     */

    function findSameProjectActions(list, find){
        var _findPackageAction = find.getValue({fieldId: projectActionModel.CustomFields.PROJECT_PACKAGE_ACTION, name: projectActionModel.CustomFields.PROJECT_PACKAGE_ACTION}),
            _findPackage = find.getValue({fieldId: projectActionModel.CustomFields.PACKAGE, name: projectActionModel.CustomFields.PACKAGE});
        return list.filter(function(item){
            var _itemPackageAction = item.getValue({fieldId: projectActionModel.CustomFields.PROJECT_PACKAGE_ACTION, name: projectActionModel.CustomFields.PROJECT_PACKAGE_ACTION}),
                _itemPackage = item.getValue({fieldId: projectActionModel.CustomFields.PACKAGE, name: projectActionModel.CustomFields.PACKAGE});
            return _itemPackage == _findPackage && _itemPackageAction == _findPackageAction;
        });
    }


    /*
     *  ALL DATA ACCESS FUNCTIONS
     */

    /**
     * <code>getProjectActionsByProjectId</code> function is getting all Project Actions by specific Project internal ID
     *
     * @governance 10
     *
     * @param projectId {number|string} Project internal ID
     * @return {Result[]}
     */
    function getProjectActionsByProjectId(projectId){
        var _data = [];
        searchModule.create({
            type: projectActionModel.Type,
            filters:[{
                name: projectActionModel.CustomFields.PROJECT,
                operator: searchModule.Operator.ANYOF,
                values: [projectId]
            }],
            columns:[
                projectActionModel.CustomFields.PACKAGE,
                projectActionModel.CustomFields.PACKAGE_STEP,
                projectActionModel.CustomFields.REQUIRED,
                projectActionModel.CustomFields.PROJECT_PACKAGE_ACTION
            ]
        }).run().each(function(projectAction){
                _data.push(projectAction);
                return true;
            });
        return _data;
    }

    /**
     * <code>createNewRevision</code> function is creating project action new revision
     *
     * @governance 10
     *
     * @param projectAction {number|Record} Project action
     * @return {number}
     */
    function createNewRevision(projectAction, overrideValues){
        var _toCopyFieldsValues = [
            projectActionModel.Fields.NAME
            , projectActionModel.CustomFields.PACKAGE
            , projectActionModel.CustomFields.PROJECT_PACKAGE_ACTION
            , projectActionModel.CustomFields.PACKAGE_STEP
            , projectActionModel.CustomFields.PROJECT
            , projectActionModel.CustomFields.REQUIRED
            , projectActionModel.CustomFields.ACTION_TYPE
        ];
        if(!isNaN(parseInt(projectAction))){
            projectAction = recordModule.load({
                type: projectActionModel.Type,
                id: projectAction
            });
        }
        var _newRecord = recordModule.create({
            type: projectActionModel.Type
        });
        _toCopyFieldsValues.forEach(function(field){
            _newRecord.setValue({
                fieldId: field,
                value: projectAction.getValue({fieldId: field})
            });
        });

        if(overrideValues && typeof overrideValues === 'object'){
            for(var prop in overrideValues){
                if(overrideValues.hasOwnProperty(prop)){
                    _newRecord.setValue({
                        fieldId: prop,
                        value: overrideValues[prop]
                    });
                }
            }
        }

        var _revisionNumber = parseInt(projectAction.getValue({fieldId: projectActionModel.CustomFields.REVISION_NUMBER}));
        _revisionNumber = isNaN(_revisionNumber) ? 1 : _revisionNumber + 1;
        _newRecord.setValue({
            fieldId: projectActionModel.CustomFields.REVISION_NUMBER,
            value: _revisionNumber
        });
        return _newRecord.save({ignoreMandatoryFields: true});
    }

    /**
     * <code>getDucmentStatusses</code> function returns list of possible document statusses
     *
     * @governance 10
     *
     * @return [object]
     */
    function getDucmentStatusses() {
        if(!_documentStatusses){
            _documentStatusses = searchModule.create({
                type: 'customrecord_bb_document_status',
                columns: ['name']
            }).run().getRange({
                start: 0,
                end: 100
            }).map(function(line) {
                var _statusName = line.getValue({
                    name: 'name'
                });
                return {id: line.id, name: _statusName};
            });
        }
        return _documentStatusses;
    }

    /**
     * <code>getDocumentStatusByName</code> function returns found status
     *
     * @governance 10
     *
     * @param name {string|RegExp} status name
     * @return {object|undefined}
     */
    function getDocumentStatusByName(name){
        var _statusses = getDucmentStatusses();
        if(_statusses){
            return _statusses.filter(function(status){
                var _regex = new RegExp(name, 'i');
                return  _regex.test(status.name);
            })[0];
        }
        return undefined;
    }

    function getDocumentStatusByPackageAndStatusType(packageId, statusTypeId) {
        var documentStatus = null;
        if (packageId && statusTypeId) {
            var docStatusSearch = searchModule.create({
                type: "customrecord_bb_document_status",
                filters:
                [
                    ["custrecord_bb_doc_status_package","anyof", packageId], 
                    "AND", 
                    ["custrecord_bb_doc_status_type","anyof", statusTypeId]
                ],
                columns:
                [
                    "internalid"
                ]
            });
            // docStatusSearch.run().each(function(result){
            //     documentStatus = result.getValue({name: 'internalid'});
            //     return true;
            // });
            var resultSet = docStatusSearch.run();
            var results = resultSet.getRange({
                start : 0,
                end : 1
            });
            documentStatus = results[0].getValue({name: 'internalid'});
            log.debug('document status id', documentStatus)
        }
        return documentStatus;
    }


    _exports.prototype.findSameProjectActions = findSameProjectActions;
    _exports.prototype.getProjectActionsByProjectId = getProjectActionsByProjectId;
    _exports.prototype.createNewRevision = createNewRevision;
    _exports.prototype.getDucmentStatusses = getDucmentStatusses;
    _exports.prototype.getDocumentStatusByName = getDocumentStatusByName;
    _exports.prototype.getDocumentStatusByPackageAndStatusType = getDocumentStatusByPackageAndStatusType;

    return new _exports();
}


define(['N/record', 'N/search', './BB.SS.ProjectAction.Model'], ProjectActionService);