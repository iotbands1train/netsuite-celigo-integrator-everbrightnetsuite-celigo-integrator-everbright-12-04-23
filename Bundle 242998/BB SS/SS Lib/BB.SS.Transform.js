/**
* @NModuleScope Public
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
var BB = BB || {};
BB.SS = BB.SS || {};
BB.SS.Transform = BB.SS.Transform || {};
BB.SS.Transform.Transformer = function () {
    var _export = function (params) { };
    _export.prototype.constructor = _export;
    _export.prototype.transform = function () {
        throw 'transform is a virtual function and must be implemented by a class.';
    }
    _export.registeredTransforms = {};
    _export.getKey = function (fromType, toType) {
        return [fromType, '-', toType].join('');
    }

    _export.registerTransformer = function (fromType, toType, transformer) {
        var key = _export.getKey(fromType, toType);
        BB.SS.Transform.Transformer.registeredTransforms[key] = transformer;
    }

    _export.canTransform = function (fromType, toType) {
        var key = _export.getKey(fromType, toType);
        return typeof BB.SS.Transform.Transformer.registeredTransforms[key] !== 'undefined';
    }

    _export.getTransformer = function (fromType, toType) { // passes stage from function in WFA script
        var key = _export.getKey(fromType, toType);
        if (!_export.canTransform(fromType, toType)) throw ['Cannot transform from ', fromType, ' to ', toType, '.'].join('');
        return Object.create(BB.SS.Transform.Transformer.registeredTransforms[key]);
    }

    return _export;
}

BB.SS.Transform.Transformer.prototype.constructor = BB.SS.Transform.Transformer;
BB.SS.Transform.Transformer.registeredTransforms = {};


BB.SS.Transform.EntityToProject = function (entityModule, projectsModule, proposalService, proposalModel, leadService, customerService, prospectService, subCustomerModule, batchProcessor, taskModule, runtime, getLocation) {
    var _entityModule = entityModule,
        _projectsModule = projectsModule,
        _proposalService = proposalService,
        _proposalModel = proposalModel,
        _leadService = leadService,
        _customerService = customerService,
        _prospectService = prospectService,
        _subCostomerModule = subCustomerModule,
        _transformerModule = new BB.SS.Transform.Transformer(),
        _export = function (params) {
            _transformerModule.call(this);
        };
    _export.prototype = Object.create(_transformerModule.prototype)
    _export.prototype.transform = function (data) { // starts on this line from lead to project wfa
        var stage = data.stage;
        var _project = undefined;


        var _entity = undefined;
        if (typeof data.id === 'number') {
            _entity = new _entityModule.EntityRecord({ internalId: data.id }).load(data.stage);
        } else if (data.id === Object(data.id)) {
            _entity = new _entityModule.EntityRecord().map(data.id);
        }
        if (typeof _entity === 'undefined') {
            throw 'Entity could not be loaded.';
        }


        if (!_entity.installationAddr1 || !_entity.installationCity || !_entity.installationState || !_entity.installationZip)
            throw 'All Installation Address Fields must be filled out to create a project.';

        // TODO if statement for data.stage -- if data.stage == LEAD
        if (stage == 'LEAD') {
            var _nsEntityRecord = _leadService.getLeadRecordById(_entity.internalId),
                _proposal = _proposalService.findSelectedProposalByLeadIdForLeadToProjectConversion(_entity.internalId);
        }

        if (stage == 'CUSTOMER') {
            var _nsEntityRecord = _customerService.getCustomerRecordById(_entity.internalId),
                _proposal = _proposalService.findSelectedProposalByLeadIdForLeadToProjectConversion(_entity.internalId);
        }

        if (stage == 'PROSPECT') {
            var _nsEntityRecord = _prospectService.getProspectRecordById(_entity.internalId),
                _proposal = _proposalService.findSelectedProposalByLeadIdForLeadToProjectConversion(_entity.internalId);
        }


        if (!_proposal) throw 'Missing proposal. At least one selected proposal is required.';

        var _projectTemplate = _proposal.getValue({ name: _proposalModel.CustomFields.PROJECT_TEMPLATE_REF }),
            _proposalFileId = _proposal.getValue({ name: _proposalModel.CustomFields.FILE_REF }),
            _entityFinancier = _leadService.getFinancierByFinancingType(_nsEntityRecord);

        if (!_projectTemplate) throw 'Missing Project Template value. Please set Project Template before proceeding.';

        var template = new _projectsModule.Project({ internalId: _projectTemplate }).search([
            BB.SS.Projects.Project.Fields.ID
            , BB.SS.Projects.Project.Fields.JOB_TYPE
        ]);

        _project = new _projectsModule.Project();
        _project.parent = _subCostomerModule.createSubCustomer(_entity);
        if (BB.SS.Transform.USE_SUBSIDIARY)
            _project.subsidiary = _entity.subsidiary;
         _project.location = getLocation.getLocation(_entity.subsidiary, template.jobType);
         log.debug('Tranform File: ', _project.location);
        _project.projectTemplate = _projectTemplate;
        _project.jobType = template.jobType;
        _project.homeownerName = _entity.name;

        _project.installationAddress1 = _entity.installationAddr1;
        _project.installationAddress2 = _entity.installationAddr2;
        _project.installationCity = _entity.installationCity;
        _project.installationState = _entity.installationState;
        _project.installationZipCode = _entity.installationZip;
        _project.utilityCompany = _entity.utilityCompany;
        _project.marketSegment = _entity.marketSegment;

        if (_entityFinancier) {
            _project.financier = _entityFinancier;
        }
        _project.addEmployeeResources();
        _project.save();

        // batch processor here
        if (runtime.executionContext == 'WORKFLOW') {
            var _taskParameters = {};
            _taskParameters['custscript_project_id'] = _project;
            _taskParameters['custscript_project_template_id'] = template;
            _taskParameters['custscript_entity_id'] = _entity;
            _taskParameters['custscript_entity_type'] = _entity.type;
            _taskParameters['custscript_file_id'] = _proposalFileId;

            var scriptId = 'customscript_bb_ss_project_action_create';
            var deployment = 'customdeploy_bb_ss_proj_action_create';
            var taskType = taskModule.TaskType.SCHEDULED_SCRIPT;

            batchProcessor.addToQueue(scriptId, deployment, _taskParameters, taskType);
        }
        return _project;
    }

    _transformerModule.registerTransformer('PROSPECT', 'project', _export.prototype);


    _transformerModule.registerTransformer('LEAD', 'project', _export.prototype);


    _transformerModule.registerTransformer('CUSTOMER', 'project', _export.prototype);


    return _export;
}

BB.SS.Transform.EntityToProject.prototype.constructor = BB.SS.Transform.EntityToProject; // change names here

BB.SS.Transform.LeadToCustomer = function (entityModule) {
    var _entityModule = entityModule,
        _transformerModule = new BB.SS.Transform.Transformer(),
        _export = function (params) {
            _transformerModule.call(this);
        };
    _export.prototype = Object.create(_transformerModule.prototype)
    _export.prototype.transform = function (id) {
        var _customer = undefined;
        _customer = new _entityModule.Lead({ internalId: id }).load();
        _customer.status = 'CUSTOMER-Closed Won';
        _customer.save();

        return _customer;
    };
    _transformerModule.registerTransformer('lead', 'customer', _export.prototype);
    return _export;
}
BB.SS.Transform.LeadToCustomer.prototype.constructor = BB.SS.Transform.LeadToCustomer;
BB.SS.Transform.USE_SUBSIDIARY = true;

define(['./BB.SS.Entity'
    , './BB.SS.Projects'
    , './BB.SS.Proposal.Service'
    , './BB.SS.Proposal.Model'
    , './BB.SS.Lead.Service'
    , './BB.SS.Customer.Service'
    , './BB.SS.Prospect.Service'
    , './BB.SS.Project.SubCustomer'
    , './BB.SS.ScheduledScript.BatchProcessing'
    , 'N/task'
    , 'N/runtime'
    , './BB_SS_MD_SolarConfig'
    , './BB.SS.GetLocation'
], function (entityModule, projectsModule, proposalService, proposalModel, leadService, customerService, prospectService, subCustomerModule, batchProcessor, taskModule, runtime, config, getLocation) {

    try {
        BB.SS.Transform.USE_SUBSIDIARY = config.getConfiguration('custrecord_bb_ss_has_subsidiaries').value;
    } catch (e) {
        log.error(e.name, e.message);
        BB.SS.Transform.USE_SUBSIDIARY = true;
    }

    return {
        Transformer: new BB.SS.Transform.Transformer(),
        LeadToCustomer: new BB.SS.Transform.LeadToCustomer(entityModule),
        EntityToProject: new BB.SS.Transform.EntityToProject(entityModule, projectsModule, proposalService, proposalModel, leadService, customerService, prospectService, subCustomerModule, batchProcessor, taskModule, runtime, getLocation),
    };
});