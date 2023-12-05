/**
 * This is a Vendor Bill service module
 *
 * @exports BB.SS.VendorBill.Service
 *
 * @author Michael Golichenko <mgolichenko@bluebanyansolutions.com>
 * @version 0.0.1
 *
 * @NApiVersion 2.x
 * @NModuleScope public
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

define(['N/record', 'N/search', './BB.SS.Project.Service', './BB.SS.Transaction.Service', './BB.SS.Milestone.Service'],
    /**
     * @param recordModule {record}
     * @param searchModule {search}
     * @param projectService
     * @param transactionService
     * @param milestoneService
     */
    function(recordModule, searchModule, projectService, transactionService, milestoneService){

        var // project fields
            PROJECT_ORIGINATOR_VENDOR_FIELD = 'custentity_bb_originator_vendor',
            PROJECT_ORIGINATOR_M0_AMOUNT_FIELD = 'custentity_bb_orgntr_m0_vbill_amt',
            PROJECT_ORIGINATOR_M1_AMOUNT_FIELD = 'custentity_bb_orgntr_m1_vbill_amt',
            PROJECT_ORIGINATOR_M2_AMOUNT_FIELD = 'custentity_bb_orgntr_m2_vbill_amt',
            PROJECT_ORIGINATOR_M3_AMOUNT_FIELD = 'custentity_bb_orgntr_m3_vbill_amt',
            PROJECT_ORIGINATOR_M4_AMOUNT_FIELD = 'custentity_bb_orgntr_m4_vbill_amt',
            PROJECT_ORIGINATOR_M5_AMOUNT_FIELD = 'custentity_bb_orgntr_m5_vbill_amt',
            PROJECT_ORIGINATOR_M6_AMOUNT_FIELD = 'custentity_bb_orgntr_m6_vbill_amt',
            PROJECT_ORIGINATOR_M7_AMOUNT_FIELD = 'custentity_bb_orgntr_m7_vbill_amt',
            PROJECT_INSTALLER_VENDOR_FIELD = 'custentity_bb_installer_partner_vendor',
            PROJECT_INSTALLER_M0_AMOUNT_FIELD = 'custentity_bb_installer_m0_vbill_amt',
            PROJECT_INSTALLER_M1_AMOUNT_FIELD = 'custentity_bb_installer_m1_vbill_amt',
            PROJECT_INSTALLER_M2_AMOUNT_FIELD = 'custentity_bb_installer_m2_vbill_amt',
            PROJECT_INSTALLER_M3_AMOUNT_FIELD = 'custentity_bb_installer_m3_vbill_amt',
            PROJECT_INSTALLER_M4_AMOUNT_FIELD = 'custentity_bb_installer_m4_vbill_amt',
            PROJECT_INSTALLER_M5_AMOUNT_FIELD = 'custentity_bb_installer_m5_vbill_amt',
            PROJECT_INSTALLER_M6_AMOUNT_FIELD = 'custentity_bb_installer_m6_vbill_amt',
            PROJECT_INSTALLER_M7_AMOUNT_FIELD = 'custentity_bb_installer_m7_vbill_amt',
            PROJECT_SS_CONFIG_REF_FIELD = 'custentity_bbss_configuration',
            PROJECT_SUBSIDIARY_FIELD = 'subsidiary',
            PROJECT_ACCOUNTING_METHOD = 'custentity_bb_project_acctg_method',
            PROJECT_INSTALLER_ALREADY_BILLED_AMOUNT = 'custentity_bb_ss_inst_already_billed_amt',
            PROJECT_ORIGINATOR_ALREADY_BILLED_AMOUNT = 'custentity_bb_ss_org_already_billed_amt',
            // ss config fields
            SS_CONFIG_RECORD = 'customrecord_bb_solar_success_configurtn',
            SS_CONFIG_ORIGINATOR_ITEM_FIELD = 'custrecord_bb_originator_item',
            SS_CONFIG_SUBINSTALLER_ITEM_FIELD = 'custrecord_bb_subinstaller_item',
            SS_CONFIG_PROJECT_PAYMENT_ITEM_FIELD = 'custrecord_bb_project_payment_item',
            SS_CONFIG_PROJECT_ACCTG_METHOD = 'custrecord_bb_project_acctg_method',
            // vendor bill fields
            VENDOR_BILL_PROJECT_FIELD = 'custbody_bb_project',
            VENDOR_BILL_MILESTONE_FIELD = 'custbody_bb_milestone',
            VENDOR_BILL_TRANDATE_FIELD = 'trandate',
            VENDOR_BILL_ENTITY_FIELD = 'entity',
            VENDOR_BILL_SUBSIDIARY_FIELD = 'subsidiary',
            VENDOR_BILL_LOCATION_FIELD = 'location',
            VENDOR_BILL_ACCOUNTING_METHOD = 'custbody_bb_project_acctg_method',
            // transaction search fields
            TRANSACTION_VENDOR_BILL_TYPE = 'VendBill',
            TRANSACTION_VENDOR_CREDIT_TYPE = 'VendCred',
            // vendor bill item fields
            VENDOR_BILL_ITEM_RECORD = 'item',
            VENDOR_BILL_ITEM_ITEM_FIELD = 'item',
            VENDOR_BILL_ITEM_AMOUNT_FIELD = 'amount',
            VENDOR_BILL_ITEM_RATE_FIELD = 'rate'
        ;

        var _exports = {},
            _mOriginatorFieldsOrdered = [PROJECT_ORIGINATOR_M0_AMOUNT_FIELD, PROJECT_ORIGINATOR_M1_AMOUNT_FIELD, PROJECT_ORIGINATOR_M2_AMOUNT_FIELD, PROJECT_ORIGINATOR_M3_AMOUNT_FIELD,
                PROJECT_ORIGINATOR_M4_AMOUNT_FIELD, PROJECT_ORIGINATOR_M5_AMOUNT_FIELD, PROJECT_ORIGINATOR_M6_AMOUNT_FIELD, PROJECT_ORIGINATOR_M7_AMOUNT_FIELD],

            _mInstallerFieldsOrdered = [PROJECT_INSTALLER_M0_AMOUNT_FIELD, PROJECT_INSTALLER_M1_AMOUNT_FIELD, PROJECT_INSTALLER_M2_AMOUNT_FIELD, PROJECT_INSTALLER_M3_AMOUNT_FIELD,
                PROJECT_INSTALLER_M4_AMOUNT_FIELD, PROJECT_INSTALLER_M5_AMOUNT_FIELD, PROJECT_INSTALLER_M6_AMOUNT_FIELD, PROJECT_INSTALLER_M7_AMOUNT_FIELD];

        /*
         *  ALL BUSINESS LOGIC FUNCTIONS
         */

        /**
         * <code>createVendorBillFromProjectIdAndMilestoneName</code> function
         *
         * @governance 72
         * @param projectId {number|string} Project internal ID
         * @param milestoneName {string} Milestone name (M0, M1, M2,  M3)
         *
         * @return JSON Record object of Project
         *
         * @static
         * @function createVendorBillFromProjectIdAndMilestoneName
         */
        function createVendorBillFromProjectIdAndMilestoneName(projectId, milestoneName, config, milestoneDate){
            var _project = recordModule.load({type: recordModule.Type.JOB, id: projectId});
            if(_project){
                _project = createVendorBillFromProjectAndMilestoneName(_project, milestoneName, config, milestoneDate);
            }
            return _project;
        }

        /**
         * <code>createVendorBillFromProjectAndMilestoneName</code> function
         *
         * @governance 67
         * @param project {Record} Project record
         * @param milestoneName {string} Milestone name (M0, M1, M2,  M3)
         *
         * @return JSON Record object of Project
         *
         * @static
         * @function createVendorBillFromProjectAndMilestoneName
         */
        function createVendorBillFromProjectAndMilestoneName(project, milestoneName, config, milestoneDate, originatorId, installerId){
            if(!transactionService.canGenerateTransaction(project)) return project;
            var _shouldGenerateBill = config.getValue({fieldId: 'custrecord_bb_ss_generate_bills'});
            if(!_shouldGenerateBill) return project;
            var _milestoneNumber = milestoneService.convertMilestoneFromNameToIndex(milestoneName);
//            var _config = recordModule.load({type: SS_CONFIG_RECORD, id: project.getValue({fieldId: PROJECT_SS_CONFIG_REF_FIELD})});
            var _mField = milestoneService.findMilestoneByName(milestoneName);
            log.debug('milestone field id', _mField);
            var _originatorVendorId = (originatorId) ? originatorId : project.getValue({fieldId: PROJECT_ORIGINATOR_VENDOR_FIELD});
            var _installerVendorId = (installerId) ? installerId :  project.getValue({fieldId: PROJECT_INSTALLER_VENDOR_FIELD});
            var _locationId = (project.getValue('custentity_bb_project_location')) ? project.getValue('custentity_bb_project_location') : projectService.getLocationId(project, config);
            log.debug('type of originator id', typeof _originatorVendorId);
            log.debug('type of installer id', typeof _installerVendorId);
            var origOverrideAmt = project.getValue({fieldId: 'custentity_bb_orig_pay_total_overide_amt'});
            var paymentHold = project.getValue({fieldId: 'custentity_bb_orig_payments_on_hold_bool'});
            log.debug('originator override amount', origOverrideAmt);
            log.debug('paymenthold', paymentHold);

            var _itemId;
            //process from map reduce execution
            if(typeof _originatorVendorId !== 'number' && originatorId && !installerId) {
                // if (!origOverrideAmt) {
                if (!paymentHold) {
                    log.debug('create originator vendor bill from map reduce');
                    _itemId = config.getValue({fieldId: SS_CONFIG_ORIGINATOR_ITEM_FIELD});
                    var _originatorAlreadyBilledAmount = project.getValue({fieldId: PROJECT_ORIGINATOR_ALREADY_BILLED_AMOUNT});
                    project = createVendorBillGeneric(project, _milestoneNumber, _mField.id, _locationId, _mOriginatorFieldsOrdered, config, originatorId, _originatorAlreadyBilledAmount, milestoneDate, _itemId);
                }
                // }
            }
            //process from map reduce execution
            if(typeof _installerVendorId !== 'number' && installerId && !originatorId){
                log.debug('create installer vendor bill from map reduce');
                _itemId = config.getValue({fieldId: SS_CONFIG_SUBINSTALLER_ITEM_FIELD});
                var _installerAlreadyBilledAmount = project.getValue({fieldId: PROJECT_INSTALLER_ALREADY_BILLED_AMOUNT});
                project = createVendorBillGeneric(project, _milestoneNumber, _mField.id, _locationId, _mInstallerFieldsOrdered, config, installerId, _installerAlreadyBilledAmount, milestoneDate, _itemId);
            }
            // process config values for installerVendorId 
            if (typeof _originatorVendorId !== 'number' && !originatorId && !installerId) {
                // if (!origOverrideAmt) {
                if (!paymentHold) {
                    log.debug('create originator vendor bill from configuration');
                    _itemId = config.getValue({fieldId: SS_CONFIG_ORIGINATOR_ITEM_FIELD});
                    var _originatorAlreadyBilledAmount = project.getValue({fieldId: PROJECT_ORIGINATOR_ALREADY_BILLED_AMOUNT});
                    project = createVendorBillGeneric(project, _milestoneNumber, _mField.id, _locationId, _mOriginatorFieldsOrdered, config, _originatorVendorId, _originatorAlreadyBilledAmount, milestoneDate, _itemId);
                }
                // }
            }
            // process config values for originatorVendorId 
            if (typeof _installerVendorId !== 'number' && !originatorId && !installerId) {
                log.debug('create installer vendor bill from configuration');
                _itemId = config.getValue({fieldId: SS_CONFIG_SUBINSTALLER_ITEM_FIELD});
                var _installerAlreadyBilledAmount = project.getValue({fieldId: PROJECT_INSTALLER_ALREADY_BILLED_AMOUNT});
                project = createVendorBillGeneric(project, _milestoneNumber, _mField.id, _locationId, _mInstallerFieldsOrdered, config, _installerVendorId, _installerAlreadyBilledAmount, milestoneDate, _itemId);
            }
            return project;
        }

        /**
         * <code>createVendorBillGeneric</code> function
         *
         * @governance 25
         * @param project {Record} Project record
         * @param milestoneNumber {number} Milestone index number
         * @param milestoneId {number|string} Milestone internal ID
         * @param locationId {number|string} Location internal ID
         * @param milestoneFields {string[]} Project milestone fields
         * @param config {Record} BB SS Configuration record
         * @param vendorId {number} Vendor internal ID
         *
         * @return JSON Record object of Project
         *
         * @static
         * @function createVendorBillGeneric
         */
        function createVendorBillGeneric(project, milestoneNumber, milestoneId, locationId, milestoneFields, config, vendorId, alreadyBilledAmount, milestoneDate, itemId){
            if(milestoneNumber < milestoneFields.length){
                var _mFieldAmount = project.getValue({fieldId: milestoneFields[milestoneNumber]});
                if(_mFieldAmount > 0){
                    var noneOfStatus = "VendBill:C";
                    var _transactions = transactionService.findAllTransactionsByProjectIdAndVendorId(project.id, vendorId, [TRANSACTION_VENDOR_BILL_TYPE, TRANSACTION_VENDOR_CREDIT_TYPE], null, null, noneOfStatus);
                    var _newVendorBillAmount = transactionService.calculateAmount(project, _transactions, milestoneNumber, milestoneFields, alreadyBilledAmount);
                    log.debug('new vendor bill amount', _newVendorBillAmount);
                    if(_newVendorBillAmount > 0) {
                        if(checkForAlreadyGeneratedVendorBill(project.id, milestoneId, vendorId)) return project;
                        createVendorBill(project, milestoneId, locationId, config, _newVendorBillAmount, vendorId, milestoneDate, itemId);
                        var projectAccountingMethod = project.getValue({fieldId: 'custentity_bb_project_acctg_method'});
                        if(!projectAccountingMethod){//only set if null
                            project.setValue({
                                fieldId: 'custentity_bb_project_acctg_method',
                                value: config.getValue({fieldId: 'custrecord_bb_project_acctg_method'}),
                            });
                        }
                    }
                }
            }
            return project;
        }

        /*
         *  ALL DATA ACCESS FUNCTIONS
         */

        /**
         * <code>createVendorBill</code> function
         *
         * @governance 15
         * @param project {Record} Project record
         * @param milestoneId {number|string} Milestone internal ID
         * @param locationId {number|string} Location internal ID
         * @param config {Record} BB SS Configuration record
         * @param vendorBillAmount {number} Amount of the vendor bill
         * @param vendorId {number} Vendor internal ID
         *
         * @return {void}
         *
         * @static
         * @function createInvoice
         */
        function createVendorBill(project, milestoneId, locationId, config, vendorBillAmount, vendorId, milestoneDate, itemId){
            var _newVendorBill = recordModule.create({
                type: recordModule.Type.VENDOR_BILL,
                isDynamic: false
            });
            if(!itemId){
                itemId = config.getValue({fieldId: SS_CONFIG_PROJECT_PAYMENT_ITEM_FIELD});
            }
            _newVendorBill.setValue({fieldId: VENDOR_BILL_PROJECT_FIELD, value: project.id});
            _newVendorBill.setValue({fieldId: VENDOR_BILL_MILESTONE_FIELD, value: milestoneId});
            _newVendorBill.setValue({fieldId: VENDOR_BILL_TRANDATE_FIELD, value: milestoneDate ? milestoneDate : new Date()});
            _newVendorBill.setValue({fieldId: VENDOR_BILL_ENTITY_FIELD, value: vendorId});
            _newVendorBill.setValue({fieldId: VENDOR_BILL_LOCATION_FIELD, value: locationId});
            _newVendorBill.setValue({fieldId: VENDOR_BILL_SUBSIDIARY_FIELD, value: project.getValue({fieldId: PROJECT_SUBSIDIARY_FIELD})});
            _newVendorBill.setValue({fieldId: VENDOR_BILL_ACCOUNTING_METHOD, value: getVendorBillAccountingMethod(project,config)});
            _newVendorBill.insertLine({sublistId: VENDOR_BILL_ITEM_RECORD, line: 0});
            _newVendorBill.setSublistValue({sublistId: VENDOR_BILL_ITEM_RECORD, line: 0, fieldId: VENDOR_BILL_ITEM_ITEM_FIELD, value: itemId});
            _newVendorBill.setSublistValue({sublistId: VENDOR_BILL_ITEM_RECORD, line: 0, fieldId: VENDOR_BILL_ITEM_AMOUNT_FIELD, value: vendorBillAmount});
            _newVendorBill.setSublistValue({sublistId: VENDOR_BILL_ITEM_RECORD, line: 0, fieldId: VENDOR_BILL_ITEM_RATE_FIELD, value: vendorBillAmount});
            _newVendorBill.save({
                ignoreMandatoryFields: true
            });
        }

        function checkForAlreadyGeneratedVendorBill(projectId, milestoneId, entityId) {
            var alreadyGeneratedBill = null;
            if (projectId && milestoneId) {
                var vendorbillSearchObj = searchModule.create({
                    type: "vendorbill",
                    filters:
                        [
                            ["type","anyof","VendBill"],
                            "AND",
                            ["mainline","is","T"],
                            "AND",
                            ["custbody_bb_milestone","anyof",milestoneId],
                            "AND",
                            ["custbody_bb_project","anyof",projectId],
                            "AND",
                            ["entity","anyof",entityId],
                            "AND",
                            ["status","noneof", "VendBill:C"]
                        ],
                    columns:
                        [
                            "internalid"
                        ]
                });
                var searchResultCount = vendorbillSearchObj.runPaged().count;
                log.debug("already completed milestone vendor bill count ",searchResultCount);
                vendorbillSearchObj.run().each(function(result){
                    alreadyGeneratedBill = result.getValue({name: 'internalid'});
                    return true;
                });
            }
            return alreadyGeneratedBill;
        }

        function getVendorBillAccountingMethod(project, config){
            var projectAccountingMethod = project.getValue({fieldId: PROJECT_ACCOUNTING_METHOD});
            return isNull(projectAccountingMethod)?config.getValue({fieldId: SS_CONFIG_PROJECT_ACCTG_METHOD}):projectAccountingMethod;
        }

        function isNull(param){
            return (param == null || param == '' || param == undefined);
        }

        _exports.createVendorBillFromProjectIdAndMilestoneName = createVendorBillFromProjectIdAndMilestoneName;
        _exports.createVendorBillFromProjectAndMilestoneName = createVendorBillFromProjectAndMilestoneName;

        return _exports;
    });