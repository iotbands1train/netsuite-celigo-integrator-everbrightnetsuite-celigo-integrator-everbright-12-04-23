/**
* @NApiVersion 2.x
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
BB.SS.Projects = BB.SS.Projects || {};
BB.SS.DocumentStatuses = {
	NOT_STARTED: '1',
	REQUESTED: '2',
	PENDING_PM_REVIEW: '3',
	SUBMITTED_TO_ENGINEERING: '4',
	SUBMITTED_TO_FUND: '5',
	SUBMITTED_TO_HOMEOWNER: '6',
	SUBMITTED_TO_INSTALLER: '7',
	SUBMITTED_TO_SALES_PARTNER: '8',
	SUBMITTED_TO_UTILITY: '9',
	APPROVED_BY_INTERNAL_REVIEWER: '10',
	APPROVED_BY_FUN: '11',
	APPROVED_BY_UTILITY: '12',
	REJECTED_BY_INTERNAL_REVIEWER: '13',
	REJECTED_BY_FUND: '14',
	REJECTED_BY_INSTALLER: '15',
	REJECTED_BY_SALES_PARTNER: '16',
	REJECTED_BY_UTILITY: '17'
}
BB.SS.Projects.Package = function(recordModule){
    var _recordModule = recordModule,
        _export = function(params) {
            var _internalId = undefined,
                _name = undefined,
                _counterPartyType = undefined,
                _approvalEmailSubjectLine = undefined,
                _approvalEmailText = undefined,
                _rejectionEmailSubjectLine = undefined,
                _rejectionEmailHeaderText = undefined,
                _rejectionEmailFooterText = undefined,
                __changes = {
                    name: false,
                    counterPartyType: false,
                    approvalEmailSubjectLine: false,
                    approvalEmailText: false,
                    rejectionEmailSubjectLine: false,
                    rejectionEmailHeaderText: false,
                    rejectionEmailFooterText: false,
                    hasChanges: function() {
                        return this.name || this.counterPartyType || this.approvalEmailSubjectLine || this.approvalEmailText
                            || this.rejectionEmailFooterText || this.rejectionEmailHeaderText || this.rejectionEmailSubjectLine;
                    },
                    clear: function() {
                        this.name = false;
                        this.counterPartyType = false;
                        this.approvalEmailSubjectLine = false;
                        this.approvalEmailText = false;
                        this.rejectionEmailFooterText = false;
                        this.rejectionEmailHeaderText = false;
                        this.rejectionEmailSubjectLine = false;
                    }
                };

            Object.defineProperties(this, {
                'internalId': {
                    enumerable: true,
                    get: function() {
                        return _internalId;
                    },
                    set: function(val) {
                        _internalId = val;
                    }
                },
                'name': {
                    enumerable: true,
                    get: function() {
                        return _name;
                    },
                    set: function(val) {
                        _name = val;
                        __changes.name = true;
                    }
                },
                'counterPartyType': {
                    enumerable: true,
                    get: function() {
                        return _counterPartyType;
                    },
                    set: function(val) {
                        _counterPartyType = val;
                        __changes.counterPartyType = true;
                    }
                },
                '__changes': {
                    enumerable: true,
                    get: function() {
                        return __changes;
                    }
                }
            });

            if (params) {
                this.internalId = params.internalId;
                this.name = params.name;
                this.counterPartyType = params.counterPartyType;
            }
        };

    _export.prototype.constructor = _export;
    _export.prototype.load = function() {
        var _this = this,
            _package = _recordModule.load({
                type: BB.SS.Projects.Package.TYPE,
                id: _this.internalId
            });

        _this.name = _package.getValue(BB.SS.Projects.Package.Fields.NAME);
        _this.counterPartyType = _package.getValue(BB.SS.Projects.Package.Fields.COUNTER_PARTY_TYPE);
        _this.approvalEmailSubjectLine = _package.getValue(BB.SS.Projects.Package.Fields.APPROVAL_EMAIL_SUBJECT_LINE);
        _this.approvalEmailText = _package.getValue(BB.SS.Projects.Package.Fields.APPROVAL_EMAIL_TEXT);
        _this.rejectionEmailSubjectLine = _package.getValue(BB.SS.Projects.Package.Fields.REJECTION_EMAIL_SUBJECT_LINE);
        _this.rejectionEmailHeaderText = _package.getValue(BB.SS.Projects.Package.Fields.REJECTION_EMAIL_HEADER_TEXT);
        _this.rejectionEmailFooterText = _package.getValue(BB.SS.Projects.Package.Fields.REJECTION_EMAIL_FOOTER_TEXT);

        _this.__changes.clear();
        return this;
    }

    return _export;
}
BB.SS.Projects.Package.Fields = {
    NAME: 'name',
    COUNTER_PARTY_TYPE: 'custrecord_bb_package_counterparty_type',
    APPROVAL_EMAIL_SUBJECT_LINE: 'custrecord_bb_approval_email_subject_lin',
    APPROVAL_EMAIL_TEXT: 'custrecord_bb_approval_email_header_text',
    REJECTION_EMAIL_SUBJECT_LINE: 'custrecord_bb_rejection_email_subject_li',
    REJECTION_EMAIL_HEADER_TEXT: 'custrecord_bb_rejection_email_header_txt',
    REJECTION_EMAIL_FOOTER_TEXT: 'custrecord_bb_rejection_email_footer_txt'
}
BB.SS.Projects.Package.TYPE = 'customrecord_bb_package';
BB.SS.Projects.Package.prototype.constructor = BB.SS.Projects.Package;

BB.SS.Projects.PackageTask = function(recordModule){
    var _recordModule = recordModule,
        _export = function(params) {
            var _internalId = undefined,
                _name = undefined,
                _package = undefined,
                _packageStep = undefined,
                _taskType = undefined,
                _counterPartyType = undefined,
                _reqd = undefined,
                __changes = {
                    name: false,
                    package: false,
                    packageStep: false,
                    taskType: false,
                    counterPartyType: false,
                    reqd: false,
                    hasChanges: function() {
                        return this.name || this.counterPartyType || this.package || this.packageStep
                            || this.taskType || this.reqd;
                    },
                    clear: function() {
                        this.name = false;
                        this.counterPartyType = false;
                        this.package = false;
                        this.packageStep = false;
                        this.taskType = false;
                        this.reqd = false;
                    }
                };

            Object.defineProperties(this, {
                'internalId': {
                    enumerable: true,
                    get: function() {
                        return _internalId;
                    },
                    set: function(val) {
                        _internalId = val;
                    }
                },
                'name': {
                    enumerable: true,
                    get: function() {
                        return _name;
                    },
                    set: function(val) {
                        _name = val;
                        __changes.name = true;
                    }
                },
                'counterPartyType': {
                    enumerable: true,
                    get: function() {
                        return _counterPartyType;
                    },
                    set: function(val) {
                        _counterPartyType = val;
                        __changes.counterPartyType = true;
                    }
                },
                '__changes': {
                    enumerable: true,
                    get: function() {
                        return __changes;
                    }
                }
            });

            if (params) {
                this.internalId = params.internalId;
                this.name = params.name;
                this.counterPartyType = params.counterPartyType;
            }
        };

    _export.prototype.constructor = _export;
    _export.prototype.load = function() {
        var _this = this;

        var packageTask = _recordModule.load({
            type: BB.SS.Projects.PackageTask.TYPE,
            id: _this.internalId
        });

        _this.name = packageTask.getValue(BB.SS.Projects.PackageTask.Fields.NAME);
        _this.package = packageTask.getValue(BB.SS.Projects.PackageTask.Fields.PACKAGE);
        _this.packageStep = packageTask.getValue(BB.SS.Projects.PackageTask.Fields.PACKAGE_STEP);
        _this.taskType = packageTask.getValue(BB.SS.Projects.PackageTask.Fields.TASK_TYPE);
        _this.counterPartyType = packageTask.getValue(BB.SS.Projects.PackageTask.Fields.COUNTER_PARTY_TYPE);
        _this.reqd = packageTask.getValue(BB.SS.Projects.PackageTask.Fields.REQD);

        _this.__changes.clear();

        return this;
    }
    return _export;
}
BB.SS.Projects.PackageTask.Fields = {
    NAME: 'name',
    PACKAGE: 'custrecord_bb_package_detail',
    PACKAGE_STEP: 'custrecord_bb_doc_package_step_number',
    TASK_TYPE: 'custrecord_bb_task_type',
    COUNTER_PARTY_TYPE: 'custrecord_bb_counterparty_type',
    REQD: 'custrecord_bb_required_optional'
}
BB.SS.Projects.PackageTask.TYPE = 'customrecord_bb_package_task';
BB.SS.Projects.PackageTask.prototype.constructor = BB.SS.Projects.PackageTask;
BB.SS.Projects.Project = function(recordModule, searchModule, entityModule, config, docLib, documentStatusModule, batchProcessor, taskModule){
    var _recordModule = recordModule,
        _searchModule = searchModule,
        _entityModule = entityModule,
        _export = function(params) {
            var _internalId = undefined,
                _subsidiary = undefined,
                _id = undefined,
                _name = undefined,
                _parent = undefined,
                _jobType = undefined,
                _projectTemplate = undefined,
                _homeownerName = undefined,
                _homeownerPhone = undefined,
                _homeownerEmail = undefined,
                _installationAddress1 = undefined,
                _installationAddress2 = undefined,
                _installationCity = undefined,
                _installationState = undefined,
                _installationStateText = undefined,
                _installationZipCode = undefined,
                _leadVendor = undefined,
                _homeownerFinanceMethod = undefined,
                _financierCustomerId = undefined,
                _financierProposalId = undefined,
                _projectStartDate = undefined,
                _rebatePackageStartDate = undefined,
                _rebatePackageEndDate = undefined,
                _hoaPackageStartDate = undefined,
                _hoaPackageEndDate = undefined,
                _siteAuditPackageStartDate = undefined,
                _siteAuditPackageEndDate = undefined,
                _contractPackageStartDate = undefined,
                _contractPackageEndDate = undefined,
                _location = undefined,//Added 4/3/2020 Myron Chavez
                _homeownerCreditApprovalDate = undefined,
                _cacDeadlineDate = undefined,
                _designPackageStartDate = undefined,
                _designPackageEndDate = undefined,
                _actualEquipmentShipDate = undefined,
                _equipmentShippingApprovalDate = undefined,
                _installationCompletionPackageStartDate = undefined,
                _installationCompletionPackageEndDate = undefined,
                _installationCompleteDate = undefined,
                _installationScheduledDate = undefined,
                _substantialCompletionPackageStartDate = undefined,
                _substantialCompletionPackageEndDate = undefined,
                _finalAcceptancePackageStartDate = undefined,
                _finalAcceptancePackageEndDate = undefined,
                _m0Date = undefined,
                _m1Date = undefined,
                _m2Date = undefined,
                _m3Date = undefined,
                _projectPackageTasks = undefined,
                _netsuiteRecord = undefined,
                _utilityCompany = undefined,
                _marketSegment = undefined,
                _financier = undefined,
                _resources = [],
                __changes = {
                    subsidiary: false,
                    id: false,
                    name: false,
                    parent: false,
                    jobType: false,
                    projectTemplate: false,
                    homeownerFinanceMethod: false,
                    homeownerName: false,
                    homeownerPhone: false,
                    homeownerEmail: false,
                    installationAddress1: false,
                    installationAddress2: false,
                    installationCity: false,
                    installationState: false,
                    installationZipCode: false,
                    leadVendor: false,
                    location: false,//Added 4/3/2020 Myron Chavez
                    financierCustomerId: false,
                    financierProposalId: false,
                    projectStartDate: false,
                    rebatePackageStartDate: false,
                    rebatePackageEndDate: false,
                    hoaPackageStartDate: false,
                    hoaPackageEndDate: false,
                    siteAuditPackageStartDate: false,
                    siteAuditPackageEndDate: false,
                    contractPackageStartDate: false,
                    contractPackageEndDate: false,
                    homeownerCreditApprovalDate: false,
                    cacDeadlineDate: false,
                    designPackageStartDate: false,
                    designPackageEndDate: false,
                    actualEquipmentShipDate: false,
                    equipmentShippingApprovalDate: false,
                    installationCompletionPackageStartDate: false,
                    installationCompletionPackageEndDate: false,
                    installationCompleteDate: false,
                    installationScheduledDate: false,
                    substantialCompletionPackageStartDate: false,
                    substantialCompletionPackageEndDate: false,
                    finalAcceptancePackageStartDate: false,
                    finalAcceptancePackageEndDate: false,
                    m0Date: false,
                    m1Date: false,
                    m2Date: false,
                    m3Date: false,
                    utilityCompany: false,
                    marketSegment: false,
                    financier: false,
                    hasChanges: function() {
                        return this.subsidiary || this.id || this.name || this.parent || this.jobType || this.homeOwnerFinanceMethod
                            || this.projectTemplate
                            || this.homeownerName
                            || this.homeownerPhone
                            || this.homeownerEmail
                            || this.installationAddress1
                            || this.installationAddress2
                            || this.installationCity
                            || this.installationState
                            || this.installationZipCode
                            || this.leadVendor
                            || this.location//Added 4/3/2020 Myron Chavez
                            || this.homeownerFinanceMethod
                            || this.financierCustomerId
                            || this.financierProposalId
                            || this.projectStartDate
                            || this.rebatePackageStartDate
                            || this.rebatePackageEndDate
                            || this.hoaPackageStartDate
                            || this.hoaPackageEndDate
                            || this.siteAuditPackageStartDate
                            || this.siteAuditPackageEndDate
                            || this.contractPackageStartDate
                            || this.contractPackageEndDate
                            || this.homeownerCreditApprovalDate
                            || this.cacDeadlineDate
                            || this.designPackageStartDate
                            || this.designPackageEndDate
                            || this.actualEquipmentShipDate
                            || this.equipmentShippingApprovalDate
                            || this.installationCompletionPackageStartDate
                            || this.installationCompletionPackageEndDate
                            || this.installationCompleteDate
                            || this.installationScheduledDate
                            || this.substantialCompletionPackageStartDate
                            || this.substantialCompletionPackageEndDate
                            || this.finalAcceptancePackageStartDate
                            || this.finalAcceptancePackageEndDate
                            || this.m0Date
                            || this.m1Date
                            || this.m2Date
                            || this.m3Date
                            || this.marketSegment
                            || this.financier
                    },
                    clear: function() {
                        subsidiary = false;
                        id = false;
                        name = false;
                        parent = false;
                        jobType = false;
                        projectTemplate = false;
                        homeownerFinanceMethod = false;
                        homeownerName = false;
                        homeownerPhone = false;
                        homeownerEmail = false;
                        installationAddress1 = false;
                        installationAddress2 = false;
                        installationCity = false;
                        installationState = false;
                        installationZipCode = false;
                        leadVendor = false;
                        location = false;//Added 4/3/2020 Myron Chavez
                        homeownerFinanceMethod = false;
                        financierCustomerId = false;
                        financierProposalId = false;
                        projectStartDate = false;
                        rebatePackageStartDate = false;
                        rebatePackageEndDate = false;
                        hoaPackageStartDate = false;
                        hoaPackageEndDate = false;
                        siteAuditPackageStartDate = false;
                        siteAuditPackageEndDate = false;
                        contractPackageStartDate = false;
                        contractPackageEndDate = false;
                        homeownerCreditApprovalDate = false;
                        cacDeadlineDate = false;
                        designPackageStartDate = false;
                        designPackageEndDate = false;
                        actualEquipmentShipDate = false;
                        equipmentShippingApprovalDate = false;
                        installationCompletionPackageStartDate = false;
                        installationCompletionPackageEndDate = false;
                        installationCompleteDate = false;
                        installationScheduledDate = false;
                        substantialCompletionPackageStartDate = false;
                        substantialCompletionPackageEndDate = false;
                        finalAcceptancePackageStartDate = false;
                        finalAcceptancePackageEndDate = false;
                        m0Date = false;
                        m1Date = false;
                        m2Date = false;
                        m3Date = false;
                        marketSegment = false;
                        financier = false;
                    }
                };

            function notEmpty(element) {
                return typeof element !== 'undefined' && element != '';
            }

            Object.defineProperties(this, {
                'internalId': {
                    enumerable: true,
                    get: function() {
                        return _internalId;
                    },
                    set: function(val) {
                        _internalId = val;
                    }
                },
                'subsidiary': {
                    enumerable: true,
                    get: function() {
                        return _subsidiary;
                    },
                    set: function(val) {
                        _subsidiary = val;
                    }
                },
                'id': {
                    enumerable: true,
                    get: function() {
                        return _id;
                    },
                    set: function(val) {
                        _id = val;
                    }
                },
                'name': {
                    enumerable: true,
                    get: function() {
                        return _name;
                    },
                    set: function(val) {
                        _name = val;
                        __changes.name = true;
                    }
                },
                'parent': {
                    enumerable: true,
                    get: function() {
                        return _parent;
                    },
                    set: function(val) {
                        _parent = val;
                        __changes.parent = true;
                    }
                },
                'jobType': {
                    enumerable: true,
                    get: function() {
                        return _jobType;
                    },
                    set: function(val) {
                        _jobType = val;
                        __changes.jobType = true;
                    }
                },
                'projectTemplate': {
                    enumerable: true,
                    get: function() {
                        return _projectTemplate;
                    },
                    set: function(val) {
                        _projectTemplate = val;
                        __changes.projectTemplate = true;
                    }
                },
                'homeownerFinanceMethod': {
                    enumerable: true,
                    get: function() {
                        return _homeownerFinanceMethod;
                    },
                    set: function(val) {
                        _homeownerFinanceMethod = val;
                        __changes.homeownerFinanceMethod = true;
                    }
                },
                'homeownerName': {
                    enumerable: true,
                    get: function() {
                        return _homeownerName;
                    },
                    set: function(val) {
                        _homeownerName = val;
                        __changes.homeownerName = true;
                    }
                },
                'homeownerPhone': {
                    enumerable: true,
                    get: function() {
                        return _homeownerPhone;
                    },
                    set: function(val) {
                        _homeownerPhone = val;
                        __changes.homeownerPhone = true;
                    }
                },
                'homeownerEmail': {
                    enumerable: true,
                    get: function() {
                        return _homeownerEmail;
                    },
                    set: function(val) {
                        _homeownerEmail = val;
                        __changes.homeownerEmail = true;
                    }
                },
                'installationAddress1': {
                    enumerable: true,
                    get: function() {
                        return _installationAddress1;
                    },
                    set: function(val) {
                        _installationAddress1 = val;
                        __changes.installationAddress1 = true;
                    }
                },
                'installationAddress2': {
                    enumerable: true,
                    get: function() {
                        return _installationAddress2;
                    },
                    set: function(val) {
                        _installationAddress2 = val;
                        __changes.installationAddress2 = true;
                    }
                },
                'installationCity': {
                    enumerable: true,
                    get: function() {
                        return _installationCity;
                    },
                    set: function(val) {
                        _installationCity = val;
                        __changes.installationCity = true;
                    }
                },
                'installationState': {
                    enumerable: true,
                    get: function() {
                        return _installationState;
                    },
                    set: function(val) {
                        _installationState = val;
                        __changes.installationState = true;
                    }
                },
                'installationStateText': {
                    enumerable: true,
                    get: function() {
                        return _installationStateText;
                    },
                    set: function(val) {
                        _installationStateText = val;
                    }
                },
                'installationZipCode': {
                    enumerable: true,
                    get: function() {
                        return _installationZipCode;
                    },
                    set: function(val) {
                        _installationZipCode = val;
                        __changes.installationZipCode = true;
                    }
                },
                'installationAddress': {
                    enumerable: true,
                    get: function() {
                        return [
                            _installationAddress1,
                            _installationAddress2,
                            [
                                _installationCity,
                                [
                                    _installationStateText,
                                    _installationZipCode
                                ].filter(notEmpty).join(', ')
                            ].join(' ')
                        ].filter(notEmpty).join('\n');
                    }
                },
                'leadVendor': {
                    enumerable: true,
                    get: function() {
                        return _leadVendor;
                    },
                    set: function(val) {
                        _leadVendor = val;
                        __changes.leadVendor = true;
                    }
                },
                'homeownerFinanceMethod': {
                    enumerable: true,
                    get: function() {
                        return _homeownerFinanceMethod;
                    },
                    set: function(val) {
                        _homeownerFinanceMethod = val;
                        __changes.homeownerFinanceMethod = true;
                    }
                },
                'financierCustomerId': {
                    enumerable: true,
                    get: function() {
                        return _financierCustomerId;
                    },
                    set: function(val) {
                        _financierCustomerId = val;
                        __changes.financierCustomerId = true;
                    }
                },
                'financierProposalId': {
                    enumerable: true,
                    get: function() {
                        return _financierProposalId;
                    },
                    set: function(val) {
                        _financierProposalId = val;
                        __changes.financierProposalId = true;
                    }
                },
                'projectStartDate': {
                    enumerable: true,
                    get: function() {
                        return _projectStartDate;
                    },
                    set: function(val) {
                        _projectStartDate = val;
                        __changes.projectStartDate = true;
                    }
                },
                'rebatePackageStartDate': {
                    enumerable: true,
                    get: function() {
                        return _rebatePackageStartDate;
                    },
                    set: function(val) {
                        _rebatePackageStartDate = val;
                    }
                },
                'rebatePackageEndDate': {
                    enumerable: true,
                    get: function() {
                        return _rebatePackageEndDate;
                    },
                    set: function(val) {
                        _rebatePackageEndDate = val;
                    }
                },
                'hoaPackageStartDate': {
                    enumerable: true,
                    get: function() {
                        return _hoaPackageStartDate;
                    },
                    set: function(val) {
                        _hoaPackageStartDate = val;
                    }
                },
                'hoaPackageEndDate': {
                    enumerable: true,
                    get: function() {
                        return _hoaPackageEndDate;
                    },
                    set: function(val) {
                        _hoaPackageEndDate = val;
                    }
                },
                'siteAuditPackageStartDate': {
                    enumerable: true,
                    get: function() {
                        return _siteAuditPackageStartDate;
                    },
                    set: function(val) {
                        _siteAuditPackageStartDate = val;
                    }
                },
                'siteAuditPackageEndDate': {
                    enumerable: true,
                    get: function() {
                        return _siteAuditPackageEndDate;
                    },
                    set: function(val) {
                        _siteAuditPackageEndDate = val;
                    }
                },
                'contractPackageStartDate': {
                    enumerable: true,
                    get: function() {
                        return _contractPackageStartDate;
                    },
                    set: function(val) {
                        _contractPackageStartDate = val;
                    }
                },
                'contractPackageEndDate': {
                    enumerable: true,
                    get: function() {
                        return _contractPackageEndDate;
                    },
                    set: function(val) {
                        _contractPackageEndDate = val;
                    }
                },
                'homeownerCreditApprovalDate': {
                    enumerable: true,
                    get: function() {
                        return _homeownerCreditApprovalDate;
                    },
                    set: function(val) {
                        _homeownerCreditApprovalDate = val;
                    }
                },
                'cacDeadlineDate': {
                    enumerable: true,
                    get: function() {
                        return _cacDeadlineDate;
                    },
                    set: function(val) {
                        _cacDeadlineDate = val;
                    }
                },
                'designPackageStartDate': {
                    enumerable: true,
                    get: function() {
                        return _designPackageStartDate;
                    },
                    set: function(val) {
                        _designPackageStartDate = val;
                    }
                },
                'designPackageEndDate': {
                    enumerable: true,
                    get: function() {
                        return _designPackageEndDate;
                    },
                    set: function(val) {
                        _designPackageEndDate = val;
                    }
                },
                'actualEquipmentShipDate': {
                    enumerable: true,
                    get: function() {
                        return _actualEquipmentShipDate;
                    },
                    set: function(val) {
                        _actualEquipmentShipDate = val;
                    }
                },
                'equipmentShippingApprovalDate': {
                    enumerable: true,
                    get: function() {
                        return _equipmentShippingApprovalDate;
                    },
                    set: function(val) {
                        _equipmentShippingApprovalDate = val;
                    }
                },
                'installationCompletionPackageStartDate': {
                    enumerable: true,
                    get: function() {
                        return _installationCompletionPackageStartDate;
                    },
                    set: function(val) {
                        _installationCompletionPackageStartDate = val;
                    }
                },
                'installationCompletionPackageEndDate': {
                    enumerable: true,
                    get: function() {
                        return _installationCompletionPackageEndDate;
                    },
                    set: function(val) {
                        _installationCompletionPackageEndDate = val;
                    }
                },
                'installationCompleteDate': {
                    enumerable: true,
                    get: function() {
                        return _installationCompleteDate;
                    },
                    set: function(val) {
                        _installationCompleteDate = val;
                    }
                },
                'installationScheduledDate': {
                    enumerable: true,
                    get: function() {
                        return _installationScheduledDate;
                    },
                    set: function(val) {
                        _installationScheduledDate = val;
                    }
                },
                'substantialCompletionPackageStartDate': {
                    enumerable: true,
                    get: function() {
                        return _substantialCompletionPackageStartDate;
                    },
                    set: function(val) {
                        _substantialCompletionPackageStartDate = val;
                    }
                },
                'substantialCompletionPackageEndDate': {
                    enumerable: true,
                    get: function() {
                        return _substantialCompletionPackageEndDate;
                    },
                    set: function(val) {
                        _substantialCompletionPackageEndDate = val;
                    }
                },
                'finalAcceptancePackageStartDate': {
                    enumerable: true,
                    get: function() {
                        return _finalAcceptancePackageStartDate;
                    },
                    set: function(val) {
                        _finalAcceptancePackageStartDate = val;
                    }
                },
                'finalAcceptancePackageEndDate': {
                    enumerable: true,
                    get: function() {
                        return _finalAcceptancePackageEndDate;
                    },
                    set: function(val) {
                        _finalAcceptancePackageEndDate = val;
                    }
                },
                'm0Date': {
                    enumerable: true,
                    get: function() {
                        return _m0Date;
                    },
                    set: function(val) {
                        _m0Date = val;
                    }
                },
                'm1Date': {
                    enumerable: true,
                    get: function() {
                        return _m1Date;
                    },
                    set: function(val) {
                        _m1Date = val;
                    }
                },
                'm2Date': {
                    enumerable: true,
                    get: function() {
                        return _m2Date;
                    },
                    set: function(val) {
                        _m2Date = val;
                    }
                },
                'm3Date': {
                    enumerable: true,
                    get: function() {
                        return _m3Date;
                    },
                    set: function(val) {
                        _m3Date = val;
                    }
                },
              //Added 4/3/2020 Myron Chavez
                'location': {
                    enumerable: true,
                    get: function() {
                        return _location;
                    },
                    set: function(val) {
                        _location = val;
                    }
                },
                'projectPackageTasks': {
                    enumerable: false,
                    get: function() {
                        if (typeof _projectPackageTasks === 'undefined') {
                            _projectPackageTasks = this.getTasks();
                        }

                        return _projectPackageTasks;
                    },
                    set: function(val) {
                        throw 'projectPackageTasks is read-only.';
                    }
                },
                'netsuiteRecord': {
                    enumerable: false,
                    get: function() {
                        return _netsuiteRecord;
                    },
                    set: function(val) {
                        _netsuiteRecord = val;
                    }
                },
                'utilityCompany': {
                    enumerable: true,
                    get: function() {
                        return _utilityCompany;
                    },
                    set: function(val) {
                        _utilityCompany = val;
                        __changes.utilityCompany = true;
                    }
                },
                'marketSegment': {
                    enumerable: true,
                    get: function() {
                        return _marketSegment;
                    },
                    set: function(val) {
                        _marketSegment = val;
                        __changes.marketSegment = true;
                    }
                },
                'financier': {
                    enumerable: true,
                    get: function() {
                        return _financier;
                    },
                    set: function(val) {
                        _financier = val;
                        __changes.financier = true;
                    }
                },
                'resources': {
                    enumerable: false,
                    get: function() {
                        return _resources;
                    },
                    set: function(val) {
                        _resources = val;
                    }
                },
                '__changes': {
                    enumerable: true,
                    get: function() {
                        return __changes;
                    }
                }
            });

            if (params) {
                this.internalId = params.internalId;
                this.subsidiary = BB.SS.Projects.Project.USE_SUBSIDIARY ? params.subsidiary : null;
                this.id = params.id;
                this.name = params.name;
                this.parent = params.parent;
                this.jobType = params.jobType;
                this.projectTemplate = params.projectTemplate;
                this.homeownerFinanceMethod = params.homeOwnerFinancingMethod;
                this.homeownerName = params.homeownerName;
                this.homeownerPhone = params.homeownerPhone;
                this.homeownerEmail = params.homeownerEmail;
                this.installationAddress1 = params.installationAddress1;
                this.installationAddress2 = params.installationAddress2;
                this.installationCity = params.installationCity;
                this.installationState = params.installationState;
                this.installationStateText = params.installationStateText;
                this.installationZipCode = params.installationZipCode;
                this.leadVendor = params.leadVendor;
                this.homeownerFinanceMethod = params.homeownerFinanceMethod;
                this.financierCustomerId = params.financierCustomerId;
                this.financierProposalId = params.financierProposalId;
                this.resources = params.resources;
                this.projectStartDate = params.projectStartDate;
                this.rebatePackageStartDate = params.rebatePackageStartDate;
                this.rebatePackageEndDate = params.rebatePackageEndDate;
                this.hoaPackageStartDate = params.hoaPackageStartDate;
                this.hoaPackageEndDate = params.hoaPackageEndDate;
                this.siteAuditPackageStartDate = params.siteAuditPackageStartDate;
                this.siteAuditPackageEndDate = params.siteAuditPackageEndDate;
                this.contractPackageStartDate = params.contractPackageStartDate;
                this.contractPackageEndDate = params.contractPackageEndDate;
                //Added 4/3/2020 Myron Chavez
                this.location = params.location;
                this.homeownerCreditApprovalDate = params.homeownerCreditApprovalDate;
                this.cacDeadlineDate = params.cacDeadlineDate;
                this.designPackageStartDate = params.designPackageStartDate;
                this.designPackageEndDate = params.designPackageEndDate;
                this.actualEquipmentShipDate = params.actualEquipmentShipDate;
                this.equipmentShippingApprovalDate = params.equipmentShippingApprovalDate;
                this.installationCompletionPackageStartDate = params.installationCompletionPackageStartDate;
                this.installationCompletionPackageEndDate = params.installationCompletionPackageEndDate;
                this.installationCompleteDate = params.installationCompleteDate;
                this.installationScheduledDate = params.installationScheduledDate;
                this.substantialCompletionPackageStartDate = params.substantialCompletionPackageStartDate;
                this.substantialCompletionPackageEndDate = params.substantialCompletionPackageEndDate;
                this.finalAcceptancePackageStartDate = params.finalAcceptancePackageStartDate;
                this.finalAcceptancePackageEndDate = params.finalAcceptancePackageEndDate;
                this.m0Date = params.m0Date;
                this.m1Date = params.m1Date;
                this.m2Date = params.m2Date;
                this.m3Date = params.m3Date;
                this.marketSegment = params.marketSegment;
                this.financier = params.financier;
            }
        };
    _export.prototype.constructor = _export;

    _export.prototype.load = function() {
        var _this = this;

        var columns = [],
            parentColumn = undefined;
        for (var field in BB.SS.Projects.Project.Fields) {
            if (BB.SS.Projects.Project.Fields[field] == BB.SS.Projects.Project.Fields.PARENT) {
                // Had to use different approach for parent field because it's not accessible with searches
                parentColumn = _searchModule.createColumn({
                    name: 'formulanumeric',
                    formula: '{customer.internalid}'
                });
                columns.push(parentColumn);
            } else {
                columns.push({name: BB.SS.Projects.Project.Fields[field]});
            }
        }

        var projectSearch = _searchModule.create({
            type: BB.SS.Projects.Project.TYPE,
            filters: [['internalid', 'anyof', _this.internalId]],
            columns: columns
        });

        projectSearch.run().each(function (project) {
            _this.map(project);
        });

        _this.__changes.clear();

        return this;
    }

    _export.prototype.search = function(fields) {
        var _this = this;

        var columns = [],
            parentColumn = undefined;
        if(!(fields instanceof Array)){
            for (var field in BB.SS.Projects.Project.Fields) {
                if (BB.SS.Projects.Project.Fields[field] == BB.SS.Projects.Project.Fields.PARENT) {
                    // Had to use different approach for parent field because it's not accessible with searches
                    parentColumn = _searchModule.createColumn({
                        name: 'formulanumeric',
                        formula: '{customer.internalid}'
                    });
                    columns.push(parentColumn);
                } else {
                    columns.push({name: BB.SS.Projects.Project.Fields[field]});
                }
            }
        } else {
            fields.forEach(function(field){
                if (field == BB.SS.Projects.Project.Fields.PARENT) {
                    // Had to use different approach for parent field because it's not accessible with searches
                    parentColumn = _searchModule.createColumn({
                        name: 'formulanumeric',
                        formula: '{customer.internalid}'
                    });
                    columns.push(parentColumn);
                } else {
                    columns.push({name: field});
                }
            });
        }


        var projectSearch = _searchModule.create({
            type: BB.SS.Projects.Project.TYPE,
            filters: [['internalid', 'anyof', _this.internalId]],
            columns: columns
        });

        projectSearch.run().each(function (project) {
            _this.map(project);
        });

        _this.__changes.clear();


        return this;
    }

    _export.prototype.map = function(project){
        var _this = this;
        var parentColumn = {
            name: 'formulanumeric',
            formula: '{customer.internalid}'
        };
        if(project !== Object(project)){
            throw 'Variable "project" is not a valid NetSuite object';
        }
        if(BB.SS.Projects.Project.USE_SUBSIDIARY)
            _this.subsidiary = project.getValue({name: BB.SS.Projects.Project.Fields.SUBSIDIARY});
        _this.id = project.getValue({name: BB.SS.Projects.Project.Fields.ID});
        _this.name = project.getValue({name: BB.SS.Projects.Project.Fields.NAME});
        _this.parent = project.getValue(parentColumn);
        _this.jobType = project.getValue({name: BB.SS.Projects.Project.Fields.JOB_TYPE});
        _this.projectTemplate = project.getValue({name: BB.SS.Projects.Project.Fields.PROJECT_TEMPLATE});
        _this.homeownerName = project.getValue({name: BB.SS.Projects.Project.Fields.HOMEOWNER_NAME});
        _this.homeownerPhone = project.getValue({name: BB.SS.Projects.Project.Fields.HOMEOWNER_PHONE});
        _this.homeownerEmail = project.getValue({name: BB.SS.Projects.Project.Fields.HOMEOWNER_EMAIL});
        _this.installationAddress1 = project.getValue({name: BB.SS.Projects.Project.Fields.INSTALLATION_ADDRESS_1});
        _this.installationAddress2 = project.getValue({name: BB.SS.Projects.Project.Fields.INSTALLATION_ADDRESS_2});
        _this.installationCity = project.getValue({name: BB.SS.Projects.Project.Fields.INSTALLATION_CITY});
        _this.installationState = project.getValue({name: BB.SS.Projects.Project.Fields.INSTALLATION_STATE});
        _this.installationStateText = project.getText({name: BB.SS.Projects.Project.Fields.INSTALLATION_STATE});
        _this.installationZipCode = project.getValue({name: BB.SS.Projects.Project.Fields.INSTALLATION_ZIP_CODE});
        _this.leadVendor = project.getValue({name: BB.SS.Projects.Project.Fields.LEAD_VENDOR});
        _this.location = project.getValue({name: BB.SS.Projects.Project.Fields.LOCATION});//Added 4/3/2020 Myron Chavez
        _this.homeownerFinanceMethod = project.getValue({name: BB.SS.Projects.Project.Fields.HOMEOWNER_FINANCE_METHOD});
        _this.financierCustomerId = project.getValue({name: BB.SS.Projects.Project.Fields.FINANCIER_CUSTOMER_ID});
        _this.financierProposalId = project.getValue({name: BB.SS.Projects.Project.Fields.FINANCIER_PROPOSAL_ID});
        _this.projectStartDate = project.getValue({name: BB.SS.Projects.Project.Fields.PROJECT_START_DATE});
        _this.rebatePackageStartDate = project.getValue({name: BB.SS.Projects.Project.Fields.REBATE_PACKAGE_START_DATE});
        _this.rebatePackageEndDate = project.getValue({name: BB.SS.Projects.Project.Fields.REBATE_PACKAGE_END_DATE});
        _this.hoaPackageStartDate = project.getValue({name: BB.SS.Projects.Project.Fields.HOA_PACKAGE_START_DATE});
        _this.hoaPackageEndDate = project.getValue({name: BB.SS.Projects.Project.Fields.HOA_PACKAGE_END_DATE});
        _this.siteAuditPackageStartDate = project.getValue({name: BB.SS.Projects.Project.Fields.SITE_AUDIT_PACKAGE_START_DATE});
        _this.siteAuditPackageEndDate = project.getValue({name: BB.SS.Projects.Project.Fields.SITE_AUDIT_PACKAGE_END_DATE});
        _this.contractPackageStartDate = project.getValue({name: BB.SS.Projects.Project.Fields.CONTRACT_PACKAGE_START_DATE});
        _this.contractPackageEndDate = project.getValue({name: BB.SS.Projects.Project.Fields.CONTRACT_PACKAGE_END_DATE});
        _this.homeownerCreditApprovalDate = project.getValue({name: BB.SS.Projects.Project.Fields.HOMEOWNER_CREDIT_APPROVAL_DATE});
        _this.cacDeadlineDate = project.getValue({name: BB.SS.Projects.Project.Fields.CAC_DEADLINE_DATE});
        _this.designPackageStartDate = project.getValue({name: BB.SS.Projects.Project.Fields.DESIGN_PACKAGE_START_DATE});
        _this.designPackageEndDate = project.getValue({name: BB.SS.Projects.Project.Fields.DESIGN_PACKAGE_END_DATE});
        _this.actualEquipmentShipDate = project.getValue({name: BB.SS.Projects.Project.Fields.ACTUAL_EQUIPMENT_SHIP_DATE});
        _this.equipmentShippingApprovalDate = project.getValue({name: BB.SS.Projects.Project.Fields.EQUIPMENT_SHIPPING_APPROVAL_DATE});
        _this.installationCompletionPackageStartDate = project.getValue({name: BB.SS.Projects.Project.Fields.INSTALLATION_COMPLETION_PACKAGE_START_DATE});
        _this.installationCompletionPackageEndDate = project.getValue({name: BB.SS.Projects.Project.Fields.INSTALLATION_COMPLETION_PACKAGE_END_DATE});
        _this.installationCompleteDate = project.getValue({name: BB.SS.Projects.Project.Fields.INSTALLATION_COMPLETE_DATE});
        _this.installationScheduledDate = project.getValue({name: BB.SS.Projects.Project.Fields.INSTALLATION_SCHEDULED_DATE});
        _this.substantialCompletionPackageStartDate = project.getValue({name: BB.SS.Projects.Project.Fields.SUBSTANTIAL_COMPLETION_PACKAGE_START_DATE});
        _this.substantialCompletionPackageEndDate = project.getValue({name: BB.SS.Projects.Project.Fields.SUBSTANTIAL_COMPLETION_PACKAGE_END_DATE});
        _this.finalAcceptancePackageStartDate = project.getValue({name: BB.SS.Projects.Project.Fields.FINAL_ACCEPTANCE_PACKAGE_START_DATE});
        _this.finalAcceptancePackageEndDate = project.getValue({name: BB.SS.Projects.Project.Fields.FINAL_ACCEPTANCE_PACKAGE_END_DATE});
        _this.m0Date = project.getValue({name: BB.SS.Projects.Project.Fields.M0_DATE});
        _this.m1Date = project.getValue({name: BB.SS.Projects.Project.Fields.M1_DATE});
        _this.m3Date = project.getValue({name: BB.SS.Projects.Project.Fields.M3_DATE});
        _this.m2Date = project.getValue({name: BB.SS.Projects.Project.Fields.M2_DATE});
        _this.marketSegment = project.getValue({name: BB.SS.Projects.Project.Fields.MARKET_SEGMENT});
        _this.financier = project.getValue({name: BB.SS.Projects.Project.Fields.FINANCIER});
    }

    /**
     * Gets Project Package Task records associated with the Project.
     *
     * Expected usage: 10
     *
     * @returns {array} Array of ProjectPackageTask records. Returns empty array if no tasks are associated with the Project.
     * @param {integer|string} templateId = project template id 
     */
    _export.getTasks = function(templateId) {
        var _this = this,
            _tasks = [],
            _projectPackageTask = new BB.SS.Projects.ProjectPackageTask(_recordModule);

        var startTime = new Date();

        var taskSearch = _searchModule.load({
            id: 'customsearch_bb_proj_pack_task_by_templ'
        });

        var taskSearchFilters = taskSearch.filters;

        var addFilters = _searchModule.createFilter({
            name: BB.SS.Projects.ProjectPackageTask.Fields.PROJECT,
            operator: _searchModule.Operator.ANYOF,
            values: templateId
        });

        taskSearchFilters.push(addFilters);
        taskSearch.filters = taskSearchFilters;

        taskSearch.columns = [];
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.PROJECT}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE_ACTION}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE_STEP}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_SAVED_DATE}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.REVISION_NUMBER}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_STATUS}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_STATUS_DATE}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.REJECTION_COMMENTS}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.REJECTION_COMMENT_HISTORY}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.TASK_TYPE}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.REQD}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.UNIQUE_ID}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.TEMPLATE_DOCUMENT_RECORD}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE_ACTION_TEMPLATE_DOCUMENT, "join": BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE_ACTION_TEMPLATE_RECORD_JOIN_NAME}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.FROM_ACTION_RECORD}));
        taskSearch.columns.push(_searchModule.createColumn({"name": BB.SS.Projects.ProjectPackageTask.Fields.PRECEDING_PACKAGE_ACTION}));

        taskSearch.run().each(function(task) {
            var params = {};
            params.internalId = task.id;
            params.project = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.PROJECT});
            params.package = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE});
            params.packageAction = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE_ACTION});
            params.packageStep = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE_STEP});
            params.document = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT});
            params.documentSavedDate = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_SAVED_DATE});
            params.revisionNumber = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.REVISION_NUMBER});
            params.documentStatus = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_STATUS});
            params.documentStatusDate = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_STATUS_DATE});
            params.rejectionComments = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.REJECTION_COMMENTS});
            params.rejectionCommentHistory = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.REJECTION_COMMENT_HISTORY});
            params.taskType = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.TASK_TYPE});
            params.requiredOptional = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.REQD});
            params.uniqueId = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.UNIQUE_ID});
            params.template_document_record = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.TEMPLATE_DOCUMENT_RECORD});
            params.package_action_template_document = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE_ACTION_TEMPLATE_DOCUMENT, join: BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE_ACTION_TEMPLATE_RECORD_JOIN_NAME});
            params.from_action_record = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.FROM_ACTION_RECORD});
            params.preceeding_package_action_id = task.getValue({name: BB.SS.Projects.ProjectPackageTask.Fields.PRECEDING_PACKAGE_ACTION});
            _tasks.push(new _projectPackageTask(params));
            return true;
        });

        log.debug('end - getTasks', 'total time ' + (new Date() - startTime));

        return _tasks;
    }


    /**
     * Performs a shallow copy of the Project.
     *
     * @returns {object} The copy, with internalId = undefined.
     */
    _export.prototype.copy = function() {
        var project = new _export(this);
        project.internalId = undefined;
        return project;
    }

    /**
     * Saves the Project record.
     *
     * @returns {object} Returns the Project. Will include internalId value.
     */
    _export.prototype.save = function() {
        var _netsuiteRecord = undefined,
            _this = this,
            isNew = typeof this.internalId === 'undefined';

        if (isNew) {
            if (BB.SS.Projects.Project.USE_SUBSIDIARY && !this.subsidiary) throw 'Missing required subsidiary.';
            _netsuiteRecord = _recordModule.create({
                type: BB.SS.Projects.Project.TYPE,
                //isDynamic: true
            });
        } else {
            // Load the existing record
            _netsuiteRecord = _recordModule.load({
                type: BB.SS.Projects.Project.TYPE,
                id: _this.internalId,
                //isDynamic: true
            });
        }

        if (isNew) {
            var _index = _netsuiteRecord.getLineCount({sublistId: 'jobresources'});
            util.each(this.resources, function(resource) {

                // _netsuiteRecord.selectNewLine({
                // 	sublistId: 'jobresources'
                // });
                // _netsuiteRecord.setCurrentSublistValue({
                // 	sublistId: 'jobresources',
                // 	fieldId: 'email',
                // 	value: resource.email
                // });
                // _netsuiteRecord.setCurrentSublistValue({
                // 	sublistId: 'jobresources',
                // 	fieldId: 'jobresource',
                // 	value: resource.employee
                // });
                // _netsuiteRecord.setCurrentSublistValue({
                // 	sublistId: 'jobresources',
                // 	fieldId: 'role',
                // 	value: resource.role
                // });
                // _netsuiteRecord.commitLine({
                // 	sublistId: 'jobresources'
                // });
                _netsuiteRecord.insertLine({
                    sublistId: 'jobresources',
                    line: _index
                });
                _netsuiteRecord.setSublistValue({
                    sublistId: 'jobresources',
                    fieldId: 'email',
                    line: _index,
                    value: resource.email
                });
                _netsuiteRecord.setSublistValue({
                    sublistId: 'jobresources',
                    fieldId: 'jobresource',
                    line: _index,
                    value: resource.employee
                });
                _netsuiteRecord.setSublistValue({
                    sublistId: 'jobresources',
                    fieldId: 'role',
                    line: _index,
                    value: resource.role
                });
                _index++;
                return true;
            });
        }

        if (this.__changes.name) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.NAME,
                value: this.name
            });
        }

        if (isNew && this.parent) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.PARENT,
                value: this.parent
            });
        }

        if (isNew && BB.SS.Projects.Project.USE_SUBSIDIARY) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.SUBSIDIARY,
                value: _this.subsidiary
            });
        }

        if (this.__changes.jobType) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.JOB_TYPE,
                value: this.jobType
            });
        }

        if (this.__changes.projectTemplate) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.PROJECT_TEMPLATE,
                value: this.projectTemplate
            });
        }

        if (this.__changes.homeownerFinanceMethod) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.HOMEOWNER_FINANCE_METHOD,
                value: this.homeownerFinanceMethod
            });
        }

        if (this.__changes.homeownerName) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.HOMEOWNER_NAME,
                value: this.homeownerName
            });
        }
         //Added 4/3/2020 Myron Chavez
        if (this.__changes.location) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.LOCATION,
                value: this.location
            });
        }

        if (this.__changes.homeownerPhone) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.HOMEOWNER_PHONE,
                value: this.homeownerPhone
            });
        }
        if (this.__changes.homeownerEmail) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.HOMEOWNER_EMAIL,
                value: this.homeownerEmail
            });
        }
        if (this.__changes.installationAddress1) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.INSTALLATION_ADDRESS_1,
                value: this.installationAddress1
            });
        }
        if (this.__changes.installationAddress2) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.INSTALLATION_ADDRESS_2,
                value: this.installationAddress2
            });
        }
        if (this.__changes.installationCity) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.INSTALLATION_CITY,
                value: this.installationCity
            });
        }
        if (this.__changes.installationState) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.INSTALLATION_STATE,
                value: this.installationState
            });
        }
        if (this.__changes.installationZipCode) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.INSTALLATION_ZIP_CODE,
                value: this.installationZipCode
            });
        }
        if (this.__changes.leadVendor) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.LEAD_VENDOR,
                value: this.leadVendor
            });
        }
        if (this.__changes.homeownerFinanceMethod) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.HOMEOWNER_FINANCE_METHOD,
                value: this.homeownerFinanceMethod
            });
        }
        if (this.__changes.financierCustomerId) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.FINANCIER_CUSTOMER_ID,
                value: this.financierCustomerId
            });
        }
        if (this.__changes.financierProposalId) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.FINANCIER_PROPOSAL_ID,
                value: this.financierProposalId
            });
        }
        if (this.__changes.projectStartDate) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.PROJECT_START_DATE,
                value: this.projectStartDate
            });
        }
        if (this.__changes.marketSegment) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.MARKET_SEGMENT,
                value: this.marketSegment
            });
        }
        if (this.__changes.financier) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Projects.Project.Fields.FINANCIER,
                value: this.financier
            });
        }

        if (BB.SS.Projects.Project.DEFAULT_EXPENSE_TYPE){
          _netsuiteRecord.setValue({
            fieldId: 'projectexpensetype',
            value: BB.SS.Projects.Project.DEFAULT_EXPENSE_TYPE
          });
        }

        this.internalId = _netsuiteRecord.save({
            enableSourcing: false
        });

        this.__changes.clear();

        return this;
    }

    /**
     * Performs a search of current employees and adds to resources array. Must be followed up with save() to assign resources.
     *
     * Expected usage: 10
     *
     * @returns {object} Returns the Project.
     */
    _export.prototype.addEmployeeResources = function() {
        var _this = this;

        this.resources = [];

        var employeeSearch = _searchModule.load({
            id: 'customsearch_bb_current_employees'
        });

        var columns = employeeSearch.columns;

        employeeSearch.run().each(function(employee) {
            var employeeId = employee.id;
            var email = employee.getValue(columns[1]);
            var role = -3;
            var ProjectResource = new BB.SS.Projects.ProjectResource();
            _this.resources.push(new ProjectResource({
                email: email,
                employee: employeeId,
                role: role
            }));

            return true;
        });

        return this;
    }

    _export.copyTasksFromProject = function(tasks, toProject, fromLead, proposalFileId) {
        if (!toProject.internalId) throw 'To Project must be saved before copying tasks.';
        
        // var fromTasks = fromProject.copyTasks(toProject);
        var fromTasks = tasks; // fromProject is now an array of project actions provided from Scheduled Script updated 8/31/2018

        var toTasks = [];
        var _approvedDocStatus = {};
        var docStatusId;

        log.debug('start - tasks', 'copying tasks...');
        util.each(fromTasks, function(task) {
            log.debug('copying task', JSON.stringify(task));
            var _statusId;
            task.internalId = undefined;
            task.project = toProject.internalId;
            docStatusId = documentStatusModule.findDocumentStatusByPackageAndStatusType(task.package, documentStatusModule.STATUS_TYPES.NOT_STARTED);

            task.documentStatus = (docStatusId.length > 0) ? docStatusId[0].id : undefined;
            task.documentStatusDate = undefined;
            task.document = undefined;

            if(task.packageAction == 4 && fromLead.utilityBillDocument) {
                var file = new _entityModule.BbFile({internalId : fromLead.utilityBillDocument}).load();
                if(file.link){
                    task.document = file.link;
                    docStatusId = documentStatusModule.findDocumentStatusByPackageAndStatusType(task.package, documentStatusModule.STATUS_TYPES.APPROVED);
                    task.documentStatus = (docStatusId.length > 0) ? docStatusId[0].id : 1;
                    task.documentStatusDate = new Date();

                }
            } else if (task.packageAction == 45) {
                if(proposalFileId){
                    var file = new _entityModule.BbFile({internalId : proposalFileId}).load();
                    if(file.link){
                        task.document = file.link;
                        docStatusId = documentStatusModule.findDocumentStatusByPackageAndStatusType(task.package, documentStatusModule.STATUS_TYPES.APPROVED);
                        task.documentStatus = (docStatusId.length > 0) ? docStatusId[0].id : 1;
                        task.documentStatusDate = new Date();
                    }
                }
            }
            if (task.template_document_record) {
            	task.template_document_record;
            } else if (task.package_action_template_document) {
            	task.template_document_record = task.package_action_template_document;
            }

            task.documentSavedDate = undefined;
            task.rejectionComments = undefined;
            task.rejectionCommentsHistory = undefined;
            task.save();
            toTasks.push(task);
            log.debug('task copied', JSON.stringify(task));

            return true;
        });
        log.debug('end - tasks', 'tasks copied');

        // loop over entity action records and define if project package action is found, if found, move document template logic, 
        //if package action is not found, create project action record
        // call library to upsert project actions from entity action records
        var entityObj = docLib.getProjectDocumentTemplateRelatedData(toProject.internalId);
        var entityActions = docLib.getActionRecords(entityObj.projectAHJ, entityObj.projectUtility, entityObj.projectHOA, entityObj.projectState, entityObj.projectFinancier);
        docLib.upsertProjectActions(entityActions, toTasks, toProject.internalId);

        try {
            var taskParameters = {};
            taskParameters['custscript_preceding_project_id'] = toProject.internalId;
            taskParameters['custscript_preceding_task_array'] = toTasks;

            var scriptId = 'customscript_bb_ss_set_preceding_actions';
            var deploymentId = 'customdeploy_bb_ss_set_preceding_act';
            var taskType = taskModule.TaskType.SCHEDULED_SCRIPT;

            batchProcessor.addToQueue(scriptId, deploymentId, taskParameters, taskType);
        } catch (e) {
            log.error('error', e);
        }

        return toTasks;
    }


    _export.addMissingProjectActions = function(tasks, toProject, fromLead, proposalFileId, existingTasks) {
        if (!toProject.internalId) throw 'To Project must be saved before copying tasks.';
        
        // var fromTasks = fromProject.copyTasks(toProject);
        var fromTasks = tasks; // fromProject is now an array of project actions provided from Scheduled Script updated 8/31/2018

        var toTasks = [];
        var _approvedDocStatus = {};
        var docStatusId;

        log.debug('start - tasks', 'copying tasks...');
        util.each(fromTasks, function(task) {
            if (existingTasks.length > 0) {
                var actionIndex = existingTasks.map(function(data){return data.packageActionId}).indexOf(parseInt(task.packageAction));
                log.debug('action index number', actionIndex);
                if (actionIndex == -1) {
                    log.debug('copying task', JSON.stringify(task));
                    var _statusId;
                    task.internalId = undefined;
                    task.project = toProject.internalId;
                    docStatusId = documentStatusModule.findDocumentStatusByPackageAndStatusType(task.package, documentStatusModule.STATUS_TYPES.NOT_STARTED);

                    task.documentStatus = (docStatusId.length > 0) ? docStatusId[0].id : 1;
                    task.documentStatusDate = undefined;
                    task.document = undefined;
                    // if(!_approvedDocStatus.hasOwnProperty(task.package)){
                    //     _approvedDocStatus[task.package] = documentStatusModule.findDocumentStatusByPackageAndStatusType(task.package, documentStatusModule.STATUS_TYPES.NOT_STARTED);
                    // }
                    // _statusId = _approvedDocStatus[task.package][0] ? _approvedDocStatus[task.package][0].id : undefined;
                    // this id needs to change to value from BBSS Config, will be done when config is finalized and contains all the needed fields
                    if(task.packageAction == 4 && fromLead.utilityBillDocument) {
                        var file = new _entityModule.BbFile({internalId : fromLead.utilityBillDocument}).load();
                        if(file.link){
                            task.document = file.link;
                            // if(_statusId){
                                // task.documentStatus = BB.SS.DocumentStatuses.APPROVED_BY_INTERNAL_REVIEWER;
                                docStatusId = documentStatusModule.findDocumentStatusByPackageAndStatusType(task.package, documentStatusModule.STATUS_TYPES.APPROVED);
                                task.documentStatus = (docStatusId.length > 0) ? docStatusId[0].id : 1;
                                task.documentStatusDate = new Date();
                            // }
                        }
                    } else if (task.packageAction == 45) {
                        if(proposalFileId){
                            var file = new _entityModule.BbFile({internalId : proposalFileId}).load();
                            if(file.link){
                                task.document = file.link;
                                // if(_statusId){
                                    // task.documentStatus = BB.SS.DocumentStatuses.APPROVED_BY_INTERNAL_REVIEWER;
                                    docStatusId = documentStatusModule.findDocumentStatusByPackageAndStatusType(task.package, documentStatusModule.STATUS_TYPES.APPROVED);
                                    task.documentStatus = (docStatusId.length > 0) ? docStatusId[0].id : 1;
                                    task.documentStatusDate = new Date();
                                // }
                            }
                        }
                    }
                    if (task.template_document_record) {
                        task.template_document_record;
                    } else if (task.package_action_template_document) {
                        task.template_document_record = task.package_action_template_document;
                    }

                    task.documentSavedDate = undefined;
                    task.rejectionComments = undefined;
                    task.rejectionCommentsHistory = undefined;
                    task.save();
                    toTasks.push(task);
                    log.debug('task copied', JSON.stringify(task));

                    return true;
                }// end of index check
            }// end of existing actions array check
        });
        log.debug('end - tasks', 'tasks copied');
        // loop over entity action records and define if project package action is found, if found, move document template logic, 
        //if package action is not found, create project action record
        // call library to upsert project actions from entity action records
        var entityObj = docLib.getProjectDocumentTemplateRelatedData(toProject.internalId);
        var entityActions = docLib.getActionRecords(entityObj.projectAHJ, entityObj.projectUtility, entityObj.projectHOA, entityObj.projectState, entityObj.projectFinancier);
        docLib.upsertProjectActions(entityActions, toTasks, toProject.internalId);

        return toTasks;
    }

    return _export;

}


BB.SS.Projects.Project.USE_SUBSIDIARY = true;
BB.SS.Projects.Project.TYPE = 'job';
BB.SS.Projects.Project.Fields = {
    ID: 'entityid',
    SUBSIDIARY: 'subsidiary',
    NAME: 'companyname',
    PARENT: 'parent',
    JOB_TYPE: 'jobtype',
    HOMEOWNER_FINANCE_METHOD: 'custentity_bb_homeowner_finance_method',
    PROJECT_TEMPLATE: 'custentity_bb_started_from_proj_template',
    HOMEOWNER_NAME: 'custentity_bb_home_owner_name_text',
    HOMEOWNER_PHONE: 'custentity_bb_home_owner_phone',
    HOMEOWNER_EMAIL: 'custentity_bb_home_owner_primary_email',
    INSTALLATION_ADDRESS_1: 'custentity_bb_install_address_1_text',
    INSTALLATION_ADDRESS_2: 'custentity_bb_install_address_2_text',
    INSTALLATION_CITY: 'custentity_bb_install_city_text',
    INSTALLATION_STATE: 'custentity_bb_install_state',
    INSTALLATION_ZIP_CODE: 'custentity_bb_install_zip_code_text',
    //Added 4/3/2020 Myron Chavez
    LOCATION: 'custentity_bb_project_location',
    LEAD_VENDOR: 'custentity_bb_lead_vendor',
    FINANCIER_CUSTOMER_ID: 'custentity_bb_fin_customer_id_text',
    FINANCIER_PROPOSAL_ID: 'custentity_bb_fin_proposal_id_text',
    PROJECT_START_DATE: 'custentity_bb_project_start_date',
    REBATE_PACKAGE_START_DATE: 'custentity_bb_rebate_package_start_date',
    REBATE_PACKAGE_END_DATE: 'custentity_bb_rebate_package_end_date',
    HOA_PACKAGE_START_DATE: 'custentity_bb_hoa_package_start_date',
    HOA_PACKAGE_END_DATE: 'custentity_bb_hoa_package_end_date',
    SITE_AUDIT_PACKAGE_START_DATE: 'custentity_bb_site_audit_pack_start_date',
    SITE_AUDIT_PACKAGE_END_DATE: 'custentity_bb_site_audit_pack_end_date',
    CONTRACT_PACKAGE_START_DATE: 'custentity_bb_contract_pack_start_date',
    CONTRACT_PACKAGE_END_DATE: 'custentity_bb_contract_pack_end_date',
    HOMEOWNER_CREDIT_APPROVAL_DATE: 'custentity_bb_ho_credit_approval_date',
    CAC_DEADLINE_DATE: 'custentity_bb_cac_deadline_date',
    DESIGN_PACKAGE_START_DATE: 'custentity_bb_design_package_start_date',
    DESIGN_PACKAGE_END_DATE: 'custentity_bb_design_package_end_date',
    ACTUAL_EQUIPMENT_SHIP_DATE: 'custentity_bb_actual_equipment_ship_date',
    EQUIPMENT_SHIPPING_APPROVAL_DATE: 'custentity_bb_equip_shipping_apprvl_date',
    INSTALLATION_COMPLETION_PACKAGE_START_DATE: 'custentity_bb_install_comp_pack_start_dt',
    INSTALLATION_COMPLETION_PACKAGE_END_DATE: 'custentity_bb_install_comp_pack_end_date',
    INSTALLATION_COMPLETE_DATE: 'custentity_bb_install_comp_pack_date',
    INSTALLATION_SCHEDULED_DATE: 'custentity_bb_install_scheduled_date',
    SUBSTANTIAL_COMPLETION_PACKAGE_START_DATE: 'custentity_bb_subst_compl_pack_start_dt',
    SUBSTANTIAL_COMPLETION_PACKAGE_END_DATE: 'custentity_bb_subst_compl_pack_end_dt',
    FINAL_ACCEPTANCE_PACKAGE_START_DATE: 'custentity_bb_final_acc_pack_start_date',
    FINAL_ACCEPTANCE_PACKAGE_END_DATE: 'custentity_bb_final_acc_pack_end_date',
    M0_DATE: 'custentity_bb_m0_date',
    M1_DATE: 'custentity_bb_m1_date',
    M3_DATE: 'custentity_bb_m3_date',
    M2_DATE: 'custentity_bb_m2_date',
    MARKET_SEGMENT: 'custentity_bb_market_segment',
    FINANCIER: 'custentity_bb_financier_customer'
}
BB.SS.Projects.Project.prototype.constructor = BB.SS.Projects.Project;
BB.SS.Projects.ProjectPackageTask = function(recordModule){
    var _recordModule = recordModule,
        _export = function(params) {
            var _internalId = undefined,
                _project = undefined,
                _package = undefined,
                _packageAction = undefined,
                _packageStep = undefined,
                _document = undefined,
                _documentSavedDate = undefined,
                _revisionNumber = undefined,
                _documentStatus = undefined,
                _documentStatusDate = undefined,
                _rejectionComments = undefined,
                _rejectionCommentHistory = undefined,
                _taskType = undefined,
                _requiredOptional = undefined,
                _uniqueId = undefined,
                _template_document_record = undefined,
                _package_action_template_document = undefined,
                _preceeding_package_action_id = undefined,
                _from_action_record = undefined,
                __changes = {
                    project: false,
                    package: false,
                    packageAction: false,
                    packageStep: false,
                    document: false,
                    documentSavedDate: false,
                    revisionNumber: false,
                    documentStatus: false,
                    documentStatusDate: false,
                    rejectionComments: false,
                    rejectionCommentHistory: false,
                    taskType: false,
                    requiredOptional: false,
                    uniqueId: false,
                    template_document_record: false,
                    package_action_template_document: false,
                    from_action_record: false,
                    preceeding_package_action_id: false,
                    hasChanges: function() {
                        return this.project || this.package || this.packageAction || this.packageStep
                            || this.document || this.documentSavedDate || this.revisionNumber
                            || this.documentStatus || this.documentStatusDate || this.rejectionComments
                            || this.rejectionCommentHistory || this.taskType || this.requiredOptional
                            || this.uniqueId || this.template_document_record || this.package_action_template_document || this.from_action_record || this.preceeding_package_action_id;
                    },
                    clear: function() {
                        this.project = false;
                        this.package = false;
                        this.packageAction = false;
                        this.packageStep = false;
                        this.document = false;
                        this.documentSavedDate = false;
                        this.revisionNumber = false;
                        this.documentStatus = false;
                        this.documentStatusDate = false;
                        this.rejectionComments = false;
                        this.rejectionCommentHistory = false;
                        this.taskType = false;
                        this.requiredOptional = false;
                        this.uniqueId = false;
                        this.template_document_record = false;
                        this.package_action_template_document = false;
                        this.from_action_record = false;
                        this.preceeding_package_action_id = false;
                    }
                };

            Object.defineProperties(this, {
                'internalId': {
                    enumerable: true,
                    get: function() {
                        return _internalId;
                    },
                    set: function(val) {
                        _internalId = val;
                    }
                },
                'project': {
                    enumerable: true,
                    get: function() {
                        return _project;
                    },
                    set: function(val) {
                        _project = val;
                        __changes.project = true;
                    }
                },
                'package': {
                    enumerable: true,
                    get: function() {
                        return _package;
                    },
                    set: function(val) {
                        _package = val;
                        __changes.package = true;
                    }
                },
                'packageAction': {
                    enumerable: true,
                    get: function() {
                        return _packageAction;
                    },
                    set: function(val) {
                        _packageAction = val;
                        __changes.packageAction = true;
                    }
                },
                'document': {
                    enumerable: true,
                    get: function() {
                        return _document;
                    },
                    set: function(val) {
                        _document = val;
                        __changes.document = true;
                    }
                },
                'documentSavedDate': {
                    enumerable: true,
                    get: function() {
                        return _documentSavedDate;
                    },
                    set: function(val) {
                        _documentSavedDate = val;
                        __changes.documentSavedDate = true;
                    }
                },
                'revisionNumber': {
                    enumerable: true,
                    get: function() {
                        return _revisionNumber;
                    },
                    set: function(val) {
                        _revisionNumber = val;
                        __changes.revisionNumber = true;
                    }
                },
                'documentStatus': {
                    enumerable: true,
                    get: function() {
                        return _documentStatus;
                    },
                    set: function(val) {
                        _documentStatus = val;
                        __changes.documentStatus = true;
                    }
                },
                'documentStatusDate': {
                    enumerable: true,
                    get: function() {
                        return _documentStatusDate;
                    },
                    set: function(val) {
                        _documentStatusDate = val;
                        __changes.documentStatusDate = true;
                    }
                },
                'rejectionComments': {
                    enumerable: true,
                    get: function() {
                        return _rejectionComments;
                    },
                    set: function(val) {
                        _rejectionComments = val;
                        __changes.rejectionComments = true;
                    }
                },
                'rejectionCommentHistory': {
                    enumerable: true,
                    get: function() {
                        return _rejectionCommentHistory;
                    },
                    set: function(val) {
                        _rejectionCommentHistory = val;
                        __changes.rejectionCommentHistory = true;
                    }
                },
                'taskType': {
                    enumerable: true,
                    get: function() {
                        return _taskType;
                    },
                    set: function(val) {
                        _taskType = val;
                        __changes.taskType = true;
                    }
                },
                'requiredOptional': {
                    enumerable: true,
                    get: function() {
                        return _requiredOptional;
                    },
                    set: function(val) {
                        _requiredOptional = val;
                        __changes.requiredOptional = true;
                    }
                },
                'uniqueId': {
                    enumerable: true,
                    get: function() {
                        return _uniqueId;
                    },
                    set: function(val) {
                        _uniqueId = val;
                        __changes.uniqueId = true;
                    }
                },
                'template_document_record': {
                    enumerable: true,
                    get: function() {
                        return _template_document_record;
                    },
                    set: function(val) {
                        _template_document_record = val;
                        __changes.template_document_record = true;
                    }
                },
                'package_action_template_document': {
                    enumerable: true,
                    get: function() {
                        return _package_action_template_document;
                    },
                    set: function(val) {
                    	_package_action_template_document = val;
                    	__changes.package_action_template_document = true;
                    }
                },
                'from_action_record': {
                    enumerable: true,
                    get: function() {
                        return _from_action_record;
                    },
                    set: function(val) {
                        _from_action_record = val;
                        __changes.from_action_record = true;
                    }
                },
                'preceeding_package_action_id': {
                    enumerable: true,
                    get: function() {
                        return _preceeding_package_action_id;
                    },
                    set: function(val) {
                        _preceeding_package_action_id = val;
                        __changes.preceeding_package_action_id = true;
                    }
                },
                '__changes': {
                    enumerable: true,
                    get: function() {
                        return __changes;
                    }
                }
            });

            if (params) {
                this.internalId = params.internalId;
                this.project = params.project;
                this.package = params.package;
                this.packageAction = params.packageAction;
                this.packageStep = params.packageStep;
                this.document = params.document;
                this.documentSavedDate = params.documentSavedDate;
                this.revisionNumber = params.revisionNumber;
                this.documentStatus = params.documentStatus;
                this.documentStatusDate = params.documentStatusDate;
                this.rejectionComments = params.rejectionComments;
                this.rejectionCommentHistory = params.rejectionCommentHistory;
                this.taskType = params.taskType;
                this.requiredOptional = params.requiredOptional;
                this.uniqueId = params.uniqueId;
                this.template_document_record = params.template_document_record;
                this.package_action_template_document = params.package_action_template_document;
                this.from_action_record = params.from_action_record;
                this.preceeding_package_action_id = params.preceeding_package_action_id;
            }
        };

    _export.prototype.constructor = _export;
    _export.prototype.load = function() {
        var _this = this;

        var netsuiteRecord = _recordModule.load({
            type: BB.SS.Projects.ProjectPackageTask.TYPE,
            id: _this.internalId,
            isDynamic: true
        });

        _this.project = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.PROJECT});
        _this.package = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE});
        _this.packageAction = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE_ACTION});
        _this.packageStep = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE_STEP});
        _this.document = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT});
        _this.documentSavedDate = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_SAVED_DATE});
        _this.revisionNumber = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.REVISION_NUMBER});
        _this.documentStatus = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_STATUS});
        _this.documentStatusDate = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_STATUS_DATE});
        _this.rejectionComments = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.REJECTION_COMMENTS});
        _this.rejectionCommentHistory = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.REJECTION_COMMENT_HISTORY});
        _this.taskType = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.TASK_TYPE});
        _this.requiredOptional = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.REQD});
        _this.uniqueId = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.UNIQUE_ID});
        _this.template_document_record = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.TEMPLATE_DOCUMENT_RECORD});
        _this.from_action_record = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.FROM_ACTION_RECORD});
        _this.preceeding_package_action_id = netsuiteRecord.getValue({fieldId: BB.SS.Projects.ProjectPackageTask.Fields.PRECEDING_PACKAGE_ACTION});

        _this.__changes.clear();

        return this;
    }
    _export.prototype.save = function() {
        var _this = this;

        var task = undefined;
        var isNew = typeof _this.internalId === 'undefined';
        if (isNew) {
            task = _recordModule.create({
                type: BB.SS.Projects.ProjectPackageTask.TYPE,
                isDyamic: true
            });
        } else {
            task = _recordModule.load({
                type: BB.SS.Projects.ProjectPackageTask.TYPE,
                id: _this.internalId,
                isDynamic: true
            });
        }

        if (isNew || _this.__changes.project) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.PROJECT,
                value: _this.project
            });
        }

        if (isNew || _this.__changes.package) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE,
                value: _this.package
            });
        }

        if (isNew || _this.__changes.packageAction) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE_ACTION,
                value: _this.packageAction
            });
        }

        if (isNew || _this.__changes.packageStep) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE_STEP,
                value: _this.packageStep
            });
        }

        if (isNew && (typeof _this.document !== 'undefined') || !isNew && _this.__changes.document) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT,
                value: _this.document
            });
        }

        if (isNew && (typeof _this.documentSavedDate !== 'undefined') || !isNew && _this.__changes.documentSavedDate) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_SAVED_DATE,
                value: _this.documentSavedDate
            });
        }

        if (isNew || _this.__changes.revisionNumber) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.REVISION_NUMBER,
                value: _this.revisionNumber
            });
        }

        if (isNew || _this.__changes.documentStatus) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_STATUS,
                value: _this.documentStatus
            });
        }

        if (isNew && (typeof _this.documentStatusDate !== 'undefined') || !isNew &&  _this.__changes.documentStatusDate) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_STATUS_DATE,
                value: _this.documentStatusDate
            });
        }

        if (isNew && (typeof _this.rejectionComments !== 'undefined') || !isNew && _this.__changes.rejectionComments) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.REJECTION_COMMENTS,
                value: _this.rejectionComments
            });
        }

        if (isNew && (typeof _this.rejectionCommentHistory !== 'undefined') || !isNew && _this.__changes.rejectionCommentHistory) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.REJECTION_COMMENT_HISTORY,
                value: _this.rejectionCommentHistory
            });
        }

        if (isNew || _this.__changes.taskType) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.TASK_TYPE,
                value: _this.taskType
            });
        }

        if (isNew || _this.__changes.requiredOptional) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.REQD,
                value: _this.requiredOptional
            });
        }
        if (isNew || _this.__changes.template_document_record) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.TEMPLATE_DOCUMENT_RECORD,
                value: _this.template_document_record
            });
        }
        if (isNew || _this.__changes.from_action_record) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.FROM_ACTION_RECORD,
                value: _this.from_action_record
            });
        }
        if (isNew || _this.__changes.preceeding_package_action_id) {
            task.setValue({
                fieldId: BB.SS.Projects.ProjectPackageTask.Fields.PRECEDING_PACKAGE_ACTION,
                value: _this.preceeding_package_action_id
            });
        }

        _this.internalId = task.save();


        return this;
    }



    return _export;
}
BB.SS.Projects.ProjectPackageTask.TYPE = 'customrecord_bb_project_action';
BB.SS.Projects.ProjectPackageTask.Fields = {
    PROJECT: 'custrecord_bb_project',
    PACKAGE: 'custrecord_bb_package',
    PACKAGE_ACTION: 'custrecord_bb_project_package_action',
    PACKAGE_STEP: 'custrecord_bb_package_step_number',
    DOCUMENT: 'custrecord_bb_project_document',
    DOCUMENT_IFRAME: 'custrecord_bb_proj_dm_iframe_html',
    DOCUMENT_SAVED_DATE: 'custrecord_bb_doc_saved_date',
    REVISION_NUMBER: 'custrecord_bb_revision_number',
    DOCUMENT_STATUS: 'custrecord_bb_document_status',
    DOCUMENT_STATUS_DATE: 'custrecord_bb_document_status_date',
    REJECTION_COMMENTS: 'custrecord_bb_rejection_comments',
    REJECTION_COMMENT_HISTORY: 'custrecord_bb_doc_reject_comm_history',
    TASK_TYPE: 'custrecord_bb_project_doc_action_type',
    REQD: 'custrecord_bb_proj_doc_required_optional',
    UNIQUE_ID: 'custrecord_bb_proj_task_uuid_txt',
    DOCUMENT_MANAGER_FOLDER: 'custrecord_bb_proj_task_dm_folder_text',
    TEMPLATE_DOCUMENT_RECORD: 'custrecord_bb_proj_act_temp_doc_rec',
    PACKAGE_ACTION_TEMPLATE_DOCUMENT: 'custrecord_bb_pkg_action_temp_doc_rec',
    PACKAGE_ACTION_TEMPLATE_RECORD_JOIN_NAME: 'CUSTRECORD_BB_PROJECT_PACKAGE_ACTION',
    DOCUMENT_MANAGER_IFRAME_FIELD: 'custrecord_bb_ss_proj_action_s3_folder',
    FROM_ACTION_RECORD: 'custrecord_bb_proj_act_from_action_rec',
    PRECEDING_PACKAGE_ACTION: 'custrecord_bb_projact_preced_pack_action',
}

BB.SS.Projects.ProjectPackageTask.prototype.constructor = BB.SS.Projects.ProjectPackageTask;
BB.SS.Projects.ProjectResource = function(){
    var _export = function(params) {
        var _email = undefined,
            _employee = undefined,
            _role = undefined;

        if (params) {
            _email = params.email;
            _employee = params.employee;
            _role = params.role;
        }

        Object.defineProperties(this, {
            'email': {
                enumerable: true,
                get: function() {
                    return _email;
                },
                set: function(val) {
                    _email = val;
                }
            },
            'employee': {
                enumerable: true,
                get: function() {
                    return _employee;
                },
                set: function(val) {
                    _employee = val;
                }
            },
            'role': {
                enumerable: true,
                get: function() {
                    return _role;
                },
                set: function(val) {
                    _role = val;
                }
            }
        })
    };
    _export.prototype.constructor = _export;
    return _export;
}
BB.SS.Projects.ProjectResource.prototype.constructor = BB.SS.Projects.ProjectResource;

//COMMENTED THAT ONE OUT, COULDN'T FIND THAT IS BEING USED SOMEWHERE IN THE CODE.

/**
 * Copies all Project Program Tasks from a given project into another project. Sets the Document Status
 * to Not Started.
 * 
 * @param {object} fromProject The project from which tasks will be copied.
 * @param {object} toProject The project to which tasks will be copied.
 * @param {object} fromLead The lead from which project is created.
 * @param {number|string} proposalFileId Proposal file internal ID tha will be copied to task.
 * @returns {array} Array of newly created Project Program Tasks.
 */
/*BB.SS.Projects.copyTasksFromProject = function(fromProject, toProject, fromLead, proposalFileId) {
    if (!toProject.internalId) throw 'To Project must be saved before copying tasks.';

    // var fromTasks = fromProject.copyTasks(toProject);
    var fromTasks = fromProject.getTasks();

    //execute search and get object values
    var entityActions = docLib.getAllActionRecords();

    //get project data, ahj, utilty, hoa, state and financier ids
    var projectObj = docLib.getProjectDocumentTemplateRelatedData(toProject.internalId);

    var toTasks = [];

    log.debug('start - tasks', 'copying tasks...');
    util.each(fromTasks, function(task) {
        log.debug('copying task', JSON.stringify(task));
        task.internalId = undefined;
        task.project = toProject.internalId;
        task.documentStatus = BB.SS.DocumentStatuses.NOT_STARTED
        task.documentStatusDate = undefined;
        task.document = undefined;
        // this id needs to change to value from BBSS Config, will be done when config is finalized and contains all the needed fields
        if(task.packageAction == 4 && fromLead.utilityBillDocument) { // utility bill task
            var file = new BB.SS.Entity.BbFile({internalId : fromLead.utilityBillDocument}).load();
            if(file.link){
                task.document = file.link;
                task.documentStatus = BB.SS.DocumentStatuses.APPROVED_BY_INTERNAL_REVIEWER;
                task.documentStatusDate = new Date();
            }
        } else if (task.packageAction == 45) { // proposal task
            if(proposalFileId){
                var file = new BB.SS.Entity.BbFile({internalId : proposalFileId}).load();
                if(file.link){
                    task.document = file.link;
                    task.documentStatus = BB.SS.DocumentStatuses.APPROVED_BY_INTERNAL_REVIEWER;
                    task.documentStatusDate = new Date();
                }
            }
        }

        if (task.template_document_record) {
            task.template_document_record;
        } else if (task.package_action_template_document) {
            task.template_document_record = task.package_action_template_document;
        }

        //
        // Check entity actions for document template record, loop over all entity action records
        //if ((package action id = action record package action id) && projectObj.action type == action record.type) see example below
        //example projectObj.finacier (financier from project) = action record (finanicer on action record)
        //if the action record is required is true, and action record has document template - replace project action document template with one from action record
        //if the action record is required is false and project action record already has document template, leave project action document in place
        //

        // check ahj action records for matching data
        if (docLib.getAHJMatchingData(entityActions.ahjActions, task.packageAction).map(function(data) {return data.custrecord_bb_ahj_record}).indexOf(parseInt(projectObj.projectAHJ)) != -1) {
            var ahjIndex = docLib.getAHJMatchingData(entityActions.ahjActions, task.packageAction).map(function(data) {return data.custrecord_bb_ahj_package_action}).indexOf(projectObj.projectAHJ);
            var ahjObj = docLib.getAHJMatchingData(entityActions.ahjActions, task.packageAction)[ahjIndex];
            if (ahjObj.custrecord_bb_ahj_record == projectObj.projectAHJ) {
                // check if action is required or optional
                if (ahjObj.custrecord_bb_ahj_req_optional_list == 1) {// required document
                    if (ahjObj.custrecord_bb_ahj_doc_template) {
                        task.template_document_record = ahjObj.custrecord_bb_ahj_doc_template;
                        task.requiredOptional = 1;
                        task.from_action_record = 'AHJ';
                    }
                } else { // action is optional
                    if (!task.template_document_record && ahjObj.custrecord_bb_ahj_doc_template) {
                        task.template_document_record = ahjObj.custrecord_bb_ahj_doc_template;
                        task.from_action_record = 'AHJ';
                    }
                }
            }

        } else if (docLib.docLib.getUtilMatchingData(entityActions.utilActions, task.packageAction).map(function(data) {return data.custrecord_bb_utility_record}).indexOf(parseInt(projectObj.projectUtility)) != -1) {
            // check utility action records for matching data
            var utilIndex = docLib.docLib.getUtilMatchingData(entityActions.utilActions, task.packageAction).map(function(data) {return data.custrecord_bb_utility_record}).indexOf(parseInt(projectObj.projectUtility));
            var utilObj = docLib.docLib.getUtilMatchingData(entityActions.utilActions, task.packageAction)[utilIndex];
            if (utilObj.custrecord_bb_utility_record == projectObj.projectUtility) {
                // check if action is required or optional
                if (utilObj.custrecord_bb_utility_req_optional_list == 1) {// required document
                    if (utilObj.custrecord_bb_utility_doc_template) {
                        task.template_document_record = utilObj.custrecord_bb_utility_doc_template;
                        task.requiredOptional = 1;
                        task.from_action_record = 'Utility';
                    }
                } else { // action is optional
                    if (!task.template_document_record && utilObj.custrecord_bb_utility_doc_template) {
                        task.template_document_record = utilObj.custrecord_bb_utility_doc_template;
                        task.from_action_record = 'Utility';
                    }
                }
            }

        } else if (docLib.getHOAMatchingData(entityActions.hoaActions, task.packageAction).map(function(data) {return data.custrecord_bb_hoa_record}).indexOf(parseInt(projectObj.projectHOA)) != -1) {
            // check hoa action records for matching data
            var hoaIndex = docLib.getHOAMatchingData(entityActions.hoaActions, task.packageAction).map(function(data) {return data.custrecord_bb_hoa_record}).indexOf(parseInt(projectObj.projectHOA));
            var hoaObj = docLib.getHOAMatchingData(entityActions.hoaActions, task.packageAction)[hoaIndex];
            if (hoaObj.custrecord_bb_hoa_record == projectObj.projectHOA) {
                // check if action is required or optional
                if (hoaObj.custrecord_bb_hoa_req_optional_list == 1) {// required document
                    if (hoaObj.custrecord_bb_hoa_doc_template) {
                        task.template_document_record = hoaObj.custrecord_bb_hoa_doc_template;
                        task.requiredOptional = 1;
                        task.from_action_record = 'Homeowners Association';
                    }
                } else { // action is optional
                    if (!task.template_document_record && hoaObj.custrecord_bb_hoa_doc_template) {
                        task.template_document_record = hoaObj.custrecord_bb_hoa_doc_template;
                        task.from_action_record = 'Homeowners Association';
                    }
                }
            }

        } else if (docLib.getStateMatchingData(entityActions.stateActions, task.packageAction).map(function(data) {return data.custrecord_bb_state_record}).indexOf(parseInt(projectObj.projectState)) != -1) {
            // check state action records for matching data
            var stateIndex = docLib.getStateMatchingData(entityActions.stateActions, task.packageAction).map(function(data) {return data.custrecord_bb_state_record}).indexOf(parseInt(projectObj.projectState));
            var stateObj = docLib.getStateMatchingData(entityActions.stateActions, task.packageAction)[stateIndex];
            if (stateObj.custrecord_bb_state_record == projectObj.projectState) {
                // check if action is required or optional
                if (stateObj.custrecord_bb_state_req_optional_list == 1) {// required document
                    if (stateObj.custrecord_bb_state_doc_template) {
                        task.template_document_record = stateObj.custrecord_bb_state_doc_template;
                        task.requiredOptional = 1;
                        task.from_action_record = 'State';
                    }
                } else { // action is optional
                    if (!task.template_document_record && stateObj.custrecord_bb_state_doc_template) {
                        task.template_document_record = stateObj.custrecord_bb_state_doc_template;
                        task.from_action_record = 'State';
                    }
                }
            }

        } else if (docLib.docLib.getFinMatchingData(entityActions.finActions, task.packageAction).map(function(data) {return data.custrecord_bb_financier_record}).indexOf(parseInt(projectObj.projectFinancier)) != -1) {
            // check financier action records for matching data
            var finIndex = docLib.docLib.getFinMatchingData(entityActions.finActions, task.packageAction).map(function(data) {return data.custrecord_bb_financier_record}).indexOf(parseInt(projectObj.projectFinancier));
            var finObj = docLib.docLib.getFinMatchingData(entityActions.finActions, task.packageAction)[finIndex];
            if (finObj.custrecord_bb_financier_record == projectObj.projectFinancier) {
                // check if action is required or optional
                if (finObj.custrecord_bb_fin_req_optional_list == 1) {// required document
                    if (finObj.custrecord_bb_fin_doc_template) {
                        //set document
                        task.template_document_record = finObj.custrecord_bb_fin_doc_template;
                        task.requiredOptional = 1;
                        task.from_action_record = 'Financier';
                    }
                } else { // action is optional
                    if (!task.template_document_record && finObj.custrecord_bb_fin_doc_template) {
                        task.template_document_record = finObj.custrecord_bb_fin_doc_template;
                        task.from_action_record = 'Financier';
                    }
                }
            }
        } else {
            //do nothing
        }


        task.documentSavedDate = undefined;
        task.rejectionComments = undefined;
        task.rejectionCommentsHistory = undefined;
        task.save();
        toTasks.push(task);
        log.debug('task copied', JSON.stringify(task));

        return true;
    });
    log.debug('end - tasks', 'tasks copied');

    return toTasks;
}*/


define(['N/record', 'N/search', './BB.SS.Entity', './BB_SS_MD_SolarConfig', './BB.SS.MD.Entity.Document.Template.Lib', './BB.SS.DocumentStatus.Service', './BB.SS.ScheduledScript.BatchProcessing', 'N/task'], function(recordModule, searchModule, entityModule, config, docLib, documentStatusModule, batchProcessor, taskModule) {

    try{
        BB.SS.Projects.Project.USE_SUBSIDIARY = config.getConfiguration('custrecord_bb_ss_has_subsidiaries').value;
        if(!BB.SS.Projects.Project.USE_SUBSIDIARY)
            delete BB.SS.Projects.Project.Fields.SUBSIDIARY;
    } catch (e) {
        log.error(e.name,e.message);
        BB.SS.Projects.Project.USE_SUBSIDIARY = true;
    }

    try{
      BB.SS.Projects.Project.DEFAULT_EXPENSE_TYPE = config.getConfiguration('custrecord_bb_ss_project_expense_type').value;
    } catch(e) {
      BB.SS.Projects.Project.DEFAULT_EXPENSE_TYPE = undefined;
    }
    
    return {
        Package: new BB.SS.Projects.Package(recordModule),
        PackageTask: new BB.SS.Projects.PackageTask(recordModule),
        Project: new BB.SS.Projects.Project(recordModule, searchModule, entityModule, config, docLib, documentStatusModule, batchProcessor, taskModule),
        ProjectPackageTask: new BB.SS.Projects.ProjectPackageTask(recordModule),
        ProjectResource: new BB.SS.Projects.ProjectResource(),
        copyTasksFromProject: new BB.SS.Projects.Project(recordModule, searchModule, entityModule, config, docLib, documentStatusModule, batchProcessor, taskModule).copyTasksFromProject,
        addMissingProjectActions: new BB.SS.Projects.Project(recordModule, searchModule, entityModule, config, docLib, documentStatusModule).addMissingProjectActions,
        getTasks: new BB.SS.Projects.Project(recordModule, searchModule, entityModule).getTasks
    };
});