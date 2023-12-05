/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 * @NModuleScope Public
 * @author Matthew Lehman
 * @overview - Create Revenue Recoginition JE script
 */

 /**
 * Copyright 2017-2020 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/record', 'N/search', 'N/runtime', './BB SS/SS Lib/BB.SS.AccrualJournal'], function(record, search, runtime, revenueJournal) {
   
    function onAction(scriptContext) {
        log.debug('system user id', runtime.getCurrentUser().id);
        log.debug('projectID', scriptContext.newRecord.id);
        var project = scriptContext.newRecord;
        var projectId = scriptContext.newRecord.id;
        var jeDateParam = runtime.getCurrentScript().getParameter({name: 'custscript_bb_recognition_je_date'});

        var config = record.load({
            type: 'customrecord_bb_solar_success_configurtn',
            id: project.getValue({fieldId: 'custentity_bbss_configuration'})
        });
        var invAlreadyBillAmt =  (project.getValue({fieldId:'custentity_bb_ss_already_invoiced_amount'})) ? project.getValue({fieldId:'custentity_bb_ss_already_invoiced_amount'}) : 0.00;
        var origAlreadyBillAmt = (project.getValue({fieldId: 'custentity_bb_ss_org_already_billed_amt'})) ? project.getValue({fieldId: 'custentity_bb_ss_org_already_billed_amt'}) : 0.00;
        var installAlreadyBillAmt = (project.getValue({fieldId: 'custentity_bb_ss_inst_already_billed_amt'})) ? project.getValue({fieldId: 'custentity_bb_ss_inst_already_billed_amt'}) : 0.00;
        var originatorOverrideAmt = (project.getValue({fieldId: 'custentity_bb_orig_pay_total_overide_amt'})) ? project.getValue({fieldId: 'custentity_bb_orig_pay_total_overide_amt'}) : 0.00;
        var isOriginatorOverride = project.getValue({fieldId: 'custentity_bb_orig_override_boolean'});

        var financierInvTotal = project.getValue({fieldId: 'custentity_bb_total_contract_value_amt'});
        var originatorBillTotals = project.getValue({fieldId: 'custentity_bb_orgntr_m0_vbill_amt'}) + project.getValue({fieldId: 'custentity_bb_orgntr_m1_vbill_amt'}) + project.getValue({fieldId: 'custentity_bb_orgntr_m2_vbill_amt'}) + project.getValue({fieldId: 'custentity_bb_orgntr_m3_vbill_amt'});
        var installerBillTotals = project.getValue({fieldId: 'custentity_bb_installer_m0_vbill_amt'}) + project.getValue({fieldId: 'custentity_bb_installer_m1_vbill_amt'}) + project.getValue({fieldId: 'custentity_bb_installer_m2_vbill_amt'}) + project.getValue({fieldId: 'custentity_bb_installer_m3_vbill_amt'}); 

        var projectMilestoneObj = {
            invoiceDetails: {
                financier: project.getValue({fieldId: 'custentity_bb_financier_customer'}),
                m0InvoiceAmt: project.getValue({fieldId: 'custentity_bb_fin_m0_invoice_amount'}),
                m1InvoiceAmt: project.getValue({fieldId: 'custentity_bb_fin_m1_invoice_amount'}),
                m2InvoiceAmt: project.getValue({fieldId: 'custentity_bb_fin_m2_invoice_amount'}),
                m3InvoiceAmt: project.getValue({fieldId: 'custentity_bb_fin_m3_invoice_amount'}),
                alreadyBillAmt: invAlreadyBillAmt,
                financierInvTotal: financierInvTotal
            }, 
            originatorDetails: {
                originatorVendor: project.getValue({fieldId: 'custentity_bb_originator_vendor'}),
                m0OriginatorInvAmt: project.getValue({fieldId: 'custentity_bb_orgntr_m0_vbill_amt'}),
                m1OriginatorInvAmt: project.getValue({fieldId: 'custentity_bb_orgntr_m1_vbill_amt'}),
                m2OriginatorInvAmt: project.getValue({fieldId: 'custentity_bb_orgntr_m2_vbill_amt'}),
                m3OriginatorInvAmt: project.getValue({fieldId: 'custentity_bb_orgntr_m3_vbill_amt'}),
                alreadyBillAmt: origAlreadyBillAmt,
                originatorInvTotal: originatorBillTotals,
                originatorOverrideAmt: originatorOverrideAmt,
                isOriginatorOverride: isOriginatorOverride
            },
            installerDetails: {
                installerVendor: project.getValue({fieldId: 'custentity_bb_installer_partner_vendor'}),
                m0InstallerInvAmt: project.getValue({fieldId: 'custentity_bb_installer_m0_vbill_amt'}),
                m1InstallerInvAmt: project.getValue({fieldId: 'custentity_bb_installer_m1_vbill_amt'}),
                m2InstallerInvAmt: project.getValue({fieldId: 'custentity_bb_installer_m2_vbill_amt'}),
                m3InstallerInvAmt: project.getValue({fieldId: 'custentity_bb_installer_m3_vbill_amt'}),
                alreadyBillAmt: installAlreadyBillAmt,
                installerInvTotal: installerBillTotals
            },
            siteAuditDetails: {
                siteAuditVendor: project.getValue({fieldId: 'custentity_bb_site_audit_vendor'}),
                siteAuditTotal: project.getValue({fieldId: 'custentity_bb_site_audit_amount'})
            },
            designDetails: {
                designVendor: project.getValue({fieldId: 'custentity_bb_design_partner_vendor'}),
                designTotal: project.getValue({fieldId: 'custentity_bb_design_amount'})
            },
            inspectionDetails: {
                inspectionVendor: project.getValue({fieldId: 'custentity_bb_inspection_partner_vendor'}),
                inspectionTotal: project.getValue({fieldId: 'custentity_bb_inspection_amount'}) // note - setting default as 0.00 currently
            }
        };
        var accountingMethod = project.getValue({fieldId: 'custentity_bb_project_acctg_method'});
        log.debug('milestone object', projectMilestoneObj);
        var projTranactions = checkProjectTransactions(projectId);
        var approvedRecs = projTranactions.approvedRecords;
        var unapprovedRecs = projTranactions.unapprovedRecords;
        log.debug('approvedRecs array length', approvedRecs.length);
        log.debug('unapprovedRecs array length', unapprovedRecs.length);

        var projectJournalCount = checkProjectJournals(projectId);
        var projectCancellationDate = project.getValue({fieldId: 'custentity_bb_cancellation_date'});
        var turnOffValidation = config.getValue({fieldId: 'custrecord_bb_override_proj_accrl_warn'});

        var journal;
        if (accountingMethod == 3) {
            if (approvedRecs.length == 0 && unapprovedRecs.length == 0 && projectJournalCount == 0 && !projectCancellationDate && !turnOffValidation) {
                log.debug('No Available Transactions for Project InternalId =  ', project.id);
                if (runtime.getCurrentUser().id != -4) {
                    throw 'This Project has no available transactions for Revenue Recognition';
                } else {
                    log.debug('This Project has no available transactions for Revenue Recognition');
                    return;
                }
            } else if (projectCancellationDate && approvedRecs.length == 0 && unapprovedRecs.length == 0 && projectJournalCount == 0 && !turnOffValidation) {
                log.debug('No Available Transactions for Project InternalId =  ', project.id);
                if (runtime.getCurrentUser().id != -4) {// added to cover user as "system" execution from scheduled workflow on accrual, prevents thrown error, returns a log statement
                    throw 'This Project has no available transactions for Revenue Recognition';
                } else {
                    log.debug('This Project has no available transactions for Revenue Recognition');
                    return;
                }
            }

            if (unapprovedRecs.length > 0 && !turnOffValidation) {
                var errorMsg = printUnapprovedTransactions(unapprovedRecs);
                if (runtime.getCurrentUser().id != -4) {// added to cover user as "system" execution from scheduled workflow on accrual, prevents thrown error, returns a log statement
                    throw 'The following records are not approved. To Recognize Revenue, these transactions must be approved.' + '\n' + errorMsg;
                } else {
                    log.debug('The following records are not approved. To Recognize Revenue, these transactions must be approved.', errorMsg);
                    return;
                }
            } else {

                var invalidTransactions = validateTransactions(projectMilestoneObj, approvedRecs);
                if (!invalidTransactions && !turnOffValidation) { // has valid transactions and validation is on
                    journal = revenueJournal.createAccrualJE(project, config,jeDateParam);
                } else if (!invalidTransactions && turnOffValidation) {
                    journal = revenueJournal.createAccrualJE(project, config,jeDateParam);
                } else if (invalidTransactions && turnOffValidation) {
                    journal = revenueJournal.createAccrualJE(project, config, jeDateParam);

                } else  {
                    if (runtime.getCurrentUser().id != -4) {// added to cover user as "system" execution from scheduled workflow on accrual, prevents thrown error, returns a log statement
                        throw invalidTransactions;
                    } else {
                        log.debug('Invalid Transaction List', invalidTransactions);
                        return;
                    }
                }
                if (journal) {
                    record.submitFields({
                        type: record.Type.JOB,
                        id: projectId,
                        values: {
                            'custentity_bb_ss_accrual_journal': journal
                        },
                        options: {
                            ignoreMandatoryFields: true,
                            disableTriggers: true
                        }
                    });
                }
            }
        }

    }

    function checkProjectJournals(projectId) {
        var searchResultCount = 0;
        var transactionSearchObj = search.load({
           id: 'customsearch_bb_je_txn_proj_accural'
        });
        var additionalFilters = ['AND', ["name","anyof", projectId]];
        var newFilterExpression = transactionSearchObj.filterExpression.concat(additionalFilters);
        transactionSearchObj.filterExpression = newFilterExpression;
        searchResultCount = searchResultCount + parseInt(transactionSearchObj.runPaged().count);

        var transactionSearchObj2 = search.load({
           id: 'customsearch_bb_je_txn_proj_accural'
        });
        var additionalFilters2 = ['AND', ["custbody_bb_project","anyof", projectId]];
        var newFilterExpression2 = transactionSearchObj2.filterExpression.concat(additionalFilters2);
        transactionSearchObj2.filterExpression = newFilterExpression2;

        searchResultCount = searchResultCount + parseInt(transactionSearchObj2.runPaged().count);
        log.debug('journal record count', searchResultCount);
        return searchResultCount;
    }


    function checkProjectTransactions(projectId) {
        var approvedRecords = [];
        var unapprovedRecords = [];
        var financierArr = [];
        var originatorArr = [];
        var installerArr = [];

        var transactionSearchObj = search.create({
            type: "transaction",
            filters:
            [
                  ["custbody_bb_project","anyof",projectId], 
                  "AND", 
                  ["mainline","is","F"], 
                  "AND", 
                  ["type","anyof","VendBill","VendCred","PurchOrd","CustCred","CustInvc","Journal","Check"], 
                  "AND", 
                  ["taxline","is","F"], 
                  "AND", 
                  ["cogs","is","F"], 
                  "AND", 
                  ["shipping","is","F"]

            ],
            columns:
                   [
                      search.createColumn({
                         name: "custbody_bb_project",
                         summary: "GROUP",
                         label: "Project"
                      }),
                      search.createColumn({
                         name: "amount",
                         summary: "SUM",
                         label: "Amount"
                      }),
                      search.createColumn({
                         name: "trandate",
                         summary: "GROUP",
                         label: "Date"
                      }),
                      search.createColumn({
                         name: "type",
                         summary: "GROUP",
                         label: "Type"
                      }),
                      search.createColumn({
                         name: "tranid",
                         summary: "GROUP",
                         label: "Document Number"
                      }),
                      search.createColumn({
                         name: "custbody_bb_milestone",
                         summary: "GROUP",
                         label: "Milestone"
                      }),
                      search.createColumn({
                         name: "statusref",
                         summary: "GROUP",
                         label: "Status"
                      }),
                      search.createColumn({
                         name: "entity",
                         summary: "GROUP",
                         label: "Name"
                      }),
                      search.createColumn({
                         name: "salesdescription",
                         join: "item",
                         summary: "GROUP",
                         label: "Description"
                      }),
                      search.createColumn({
                         name: "creditamount",
                         summary: "SUM",
                         label: "Amount (Credit)"
                      }),
                      search.createColumn({
                         name: "debitamount",
                         summary: "SUM",
                         label: "Amount (Debit)"
                      })
                   ]
                });
        var searchResultCount = transactionSearchObj.runPaged().count;
        log.debug("Project Transaction Record Count",searchResultCount);

        transactionSearchObj.run().each(function(result){
            var project = result.getText({name: 'custbody_bb_project', summary: "GROUP"});

            var tranDate = result.getValue({name: 'trandate', summary: "GROUP"});

            var type = result.getValue({name: 'type', summary: "GROUP"});

            var docNumber = result.getValue({name: 'tranid', summary: "GROUP"});

            var mileStone = result.getText({name: 'custbody_bb_milestone', summary: "GROUP"});

            var statusName = result.getText({name: 'statusref', summary: "GROUP"});

            var amount = result.getValue({name: 'amount', summary: "SUM"});

            var entity = result.getValue({name: 'entity', summary: "GROUP"});

            var memo = result.getValue({name: 'salesdescription', join: "item", summary: "GROUP"});

            var creditAmt = result.getValue({name: 'creditamount', summary: "SUM"});
            
            if (statusName == 'Pending Approval') {
                unapprovedRecords.push({
                    project: project,
                    tranDate: tranDate,
                    type: type,
                    docNumber: docNumber,
                    mileStone: mileStone,
                    statusName: statusName,
                    amount: amount,
                    entity: entity,
                    memo: memo,
                    creditAmt: creditAmt
                });
            }

            if (statusName != 'Pending Approval') {
                if (type == 'Journal') {
                    if (mileStone == 'Accrual') {
                        throw 'This Project already has a Revenue Recognition Journal Entry Created.';
                    }
                }
                if (type == 'PurchOrd') {
                    if (statusName != ('Fully Billed' || 'Closed')) {
                        unapprovedRecords.push({
                            project: project,
                            tranDate: tranDate,
                            type: type,
                            docNumber: docNumber,
                            mileStone: mileStone,
                            statusName: statusName,
                            amount: amount,
                            entity: entity,
                            memo: memo,
                            creditAmt: creditAmt
                        });
                    } else {
                        approvedRecords.push({
                            project: project,
                            tranDate: tranDate,
                            type: type,
                            docNumber: docNumber,
                            mileStone: mileStone,
                            statusName: statusName,
                            amount: amount,
                            entity: entity,
                            memo: memo,
                            creditAmt: creditAmt
                        });
                    }
                } else {
                    approvedRecords.push({
                        project: project,
                        tranDate: tranDate,
                        type: type,
                        docNumber: docNumber,
                        mileStone: mileStone,
                        statusName: statusName,
                        amount: amount,
                        entity: entity,
                        memo: memo,
                        creditAmt: creditAmt
                    });
                }
            }

            return true;
        });
        return {
            approvedRecords: approvedRecords,
            unapprovedRecords: unapprovedRecords
        };
    }


    function validateTransactions(projectMilestoneObj, approvedRecs) {
        var problemTransactions = [];
        var financierTotalAmt = parseFloat(0.00);
        var originatorTotalAmt = parseFloat(0.00);
        var installerTotalAmt = parseFloat(0.00);
        var siteAuditTotal = parseFloat(0.00);
        var designTotal = parseFloat(0.00);
        var inspectionTotal = parseFloat(0.00);


        for (var i = 0; i < approvedRecs.length; i++) {
            var type = approvedRecs[i].type;
            var milestone = approvedRecs[i].mileStone;
            var entity = approvedRecs[i].entity;
            var memo = approvedRecs[i].memo;
            var creditAmount = approvedRecs[i].creditAmt;

            // adding totals to correct category
            if ((type == 'CustInvc' || type == 'CustCred') && entity == projectMilestoneObj.invoiceDetails.financier && milestone != 'Shipment') {
                financierTotalAmt = financierTotalAmt + parseFloat(approvedRecs[i].amount);
                
            }
            if ((type == 'VendBill' || type == 'VendCred') && milestone != 'Shipment') { // dont process PO Bills only milestones M0 - M3

                if (entity == projectMilestoneObj.originatorDetails.originatorVendor && (memo != 'Site Inspection' || memo != 'Site Installation' || memo !='Site Audit' || memo !='System Design')) { // originator vendor bill amounts
                    originatorTotalAmt = originatorTotalAmt + parseFloat(approvedRecs[i].amount);
                }
                if (entity == projectMilestoneObj.installerDetails.installerVendor && memo == 'Site Installation') {
                    installerTotalAmt = installerTotalAmt + parseFloat(approvedRecs[i].amount);
                }
                if (entity == projectMilestoneObj.siteAuditDetails.siteAuditVendor && memo == 'Site Audit') { 
                    siteAuditTotal = siteAuditTotal + parseFloat(approvedRecs[i].amount);
                }
                if (entity == projectMilestoneObj.designDetails.designVendor && memo == 'System Design') { 
                    designTotal = designTotal + parseFloat(approvedRecs[i].amount);
                }
                if (entity == projectMilestoneObj.inspectionDetails.inspectionVendor && memo == 'Site Inspection') { 
                    inspectionTotal = inspectionTotal + parseFloat(approvedRecs[i].amount);
                } 

            }

        }// end of loop

        // **** invalid transction mesages ****
        var invalidTransactionResponse = '<style>#items {border-collapse:collapse; border-spacing: 15px; padding-right: 15px; padding-left: 15px; padding-top: 15px; padding-bottom: 15px;}';

        var financierMsg = 'The transaction invoice amounts M0 - M3 Do not match the financier invoice total amounts from the Project, The Invoice/Credit Memo amounts = $' + financierTotalAmt + ' and the expected project total Financier amount is $' + projectMilestoneObj.invoiceDetails.financierInvTotal +
          '. \n If the total is correct please enter the balance difference in the Invoice Already Billed Amount';
        var originatorMsg = 'The Transaction Bill Amounts M0 - M3 Do not match The Originator vendor bill total amounts from the project, The Vendor Bill/Credit amounts = $' + (originatorTotalAmt + projectMilestoneObj.originatorDetails.alreadyBillAmt) + ' and the expected project total Originator amount is $' + projectMilestoneObj.originatorDetails.originatorInvTotal +
          '. \n If the total is correct please enter the balance difference in the Originator Already Billed Amount';
        var installationMsg = 'The Transaction Bill Amounts M0 - M3 Do not match The Installer Sub Contractor total amounts from the project, The Vendor Bill/Credit amounts = $' + installerTotalAmt + ' and the expected project total Installer Sub Contractor amount is $' + projectMilestoneObj.installerDetails.installerInvTotal;
        var siteAuditMsg = 'The Transaction Bill for Site Audit does not match The Site Audit Bill total amount from the project, The Site Audit Bill amount = $' + siteAuditTotal + ' and the expected project Site Audit amount is $' + projectMilestoneObj.siteAuditDetails.siteAuditTotal;
        var designMsg = 'The Transaction Bill for Design does not match The Design Bill amount from the project, The Design amount =  $' + designTotal + ' and the expected project Design amount = $' + projectMilestoneObj.designDetails.designTotal;
        var inspectionMsg = 'The Transaction Bill for Inspection does not match The Inspection Bill amount from the project, The Inspection amount = $'+ inspectionTotal + ' and the expected project Inspection amount = $' + projectMilestoneObj.inspectionDetails.inspectionTotal;


        invalidTransactionResponse += '#items th {text-align: left; font-size: 12px; font-weight: bold; background-color:#c2c2d6; white-space: nowrap; padding-right: 15px; padding-left: 15px; padding-top: 7px; padding-bottom: 7px;}';
        invalidTransactionResponse += '#items td {text-align: left; font-size: 12px; background-color: #e0e0eb; padding-right: 15px; padding-left: 15px; padding-top: 7px; padding-bottom: 7px;}</style>';
        invalidTransactionResponse += '<body><table id="items"><tr><th>Transation Group</th><th>Message</th></tr>';
        
        // if (projectMilestoneObj.invoiceDetails.financierInvTotal > 0) {
        //     if (financierTotalAmt.toFixed(2) != projectMilestoneObj.invoiceDetails.financierInvTotal.toFixed(2)) { //projectMilestoneObj.invoiceDetails.financierInvTotal > 0
        //         if (projectMilestoneObj.invoiceDetails.financierInvTotal > 0) {
        //             invalidTransactionResponse += '<tr><td style= "white-space: nowrap";>Financier Invoice Totals</td><td>' + financierMsg +'</td>';
        //             problemTransactions.push('invalid');
        //         } 
        //     } 
        // }
        if (projectMilestoneObj.originatorDetails.originatorInvTotal > 0 && (!projectMilestoneObj.originatorDetails.originatorOverrideAmt || projectMilestoneObj.originatorDetails.originatorOverrideAmt != 0)) {
            log.debug('originatorTotalAmt', originatorTotalAmt);
            log.debug('projectMilestoneObj', projectMilestoneObj);
            log.debug('validate originator bill amount', originatorTotalAmt + projectMilestoneObj.originatorDetails.alreadyBillAmt);
            if (!projectMilestoneObj.originatorDetails.isOriginatorOverride) {
                if ((parseFloat(originatorTotalAmt.toFixed(2)) + parseFloat(projectMilestoneObj.originatorDetails.alreadyBillAmt.toFixed(2))) != parseFloat(projectMilestoneObj.originatorDetails.originatorInvTotal.toFixed(2))) {
                    if (projectMilestoneObj.originatorDetails.originatorInvTotal > 0) {
                        invalidTransactionResponse += '<tr><td style= "white-space: nowrap";>Originator Bill Total</td><td>' + originatorMsg + '</td>';
                        problemTransactions.push('invalid');
                    }
                }
            }
        }
        // if (projectMilestoneObj.installerDetails.installerInvTotal > 0) {
        //     if ((parseFloat(installerTotalAmt.toFixed(2)) + parseFloat(projectMilestoneObj.installerDetails.alreadyBillAmt.toFixed(2))) != parseFloat(projectMilestoneObj.installerDetails.installerInvTotal.toFixed(2))) {
        //         if (projectMilestoneObj.installerDetails.installerInvTotal > 0) {
        //             invalidTransactionResponse += '<tr><td style= "white-space: nowrap";>Installer Bill Total</td><td>' + installationMsg + '</td>';
        //             problemTransactions.push('invalid');
        //         }
        //     }
        // }

        if (siteAuditTotal.toFixed(2) != projectMilestoneObj.siteAuditDetails.siteAuditTotal) {
            if (projectMilestoneObj.siteAuditDetails.siteAuditTotal > 0) {
                invalidTransactionResponse += '<tr><td style= "white-space: nowrap";>Site Audit Bill Total</td><td>' + siteAuditMsg + '</td>';
                problemTransactions.push('invalid');
            }
        }
        if (designTotal.toFixed(2) != projectMilestoneObj.designDetails.designTotal) {
            if (projectMilestoneObj.designDetails.designTotal > 0) {
                invalidTransactionResponse += '<tr><td style= "white-space: nowrap";>Design Bill Total</td><td>' + designMsg +'</td>';
                problemTransactions.push('invalid');
            }
        }
        if (designTotal.toFixed(2) != projectMilestoneObj.inspectionDetails.inspectionTotal) {
            if (projectMilestoneObj.inspectionDetails.inspectionTotal > 0) {
                invalidTransactionResponse += '<tr><td style= "white-space: nowrap";>Inspection Bill Total</td><td>' + inspectionMsg + '</td>';
                problemTransactions.push('invalid');
            }
        }
        invalidTransactionResponse += '</table></body>';

        if (problemTransactions.length > 0) {
            return invalidTransactionResponse;
        } else {
            return null;
        }

    }


    function printUnapprovedTransactions(unapprovedRecs) {
        var responseLineHTML = '<style>#items {border-collapse:collapse; border-spacing: 15px; padding-right: 15px; padding-left: 15px; padding-top: 15px; padding-bottom: 15px;}'; 
        responseLineHTML += '#items th {text-align: left; font-size: 12px; font-weight: bold; background-color:#c2c2d6; white-space: nowrap; padding-right: 15px; padding-left: 15px; padding-top: 7px; padding-bottom: 7px;}';
        responseLineHTML += '#items td {text-align: left; font-size: 12px; background-color: #e0e0eb; padding-right: 15px; padding-left: 15px; padding-top: 7px; padding-bottom: 7px;}</style>';
        responseLineHTML += '<body><table id= "items"><tr><th>Project</th><th>Date</th><th>Type</th><th>Document Number</th><th>Milestone</th><th>Status</th></tr>';
        for (var i = 0; i < unapprovedRecs.length; i++) {
            var project = unapprovedRecs[i].project;
            var date = unapprovedRecs[i].tranDate;
            var type = unapprovedRecs[i].type;
            var docNumber = unapprovedRecs[i].docNumber;
            var mileStone = unapprovedRecs[i].mileStone;
            var status = unapprovedRecs[i].statusName;
            responseLineHTML += '<tr><td style= "white-space: nowrap";>' + project + '</td><td>' + date + '</td><td>' + type + '</td><td>' + docNumber + '</td><td>' + mileStone + '</td><td>' + status + '</td></tr>';
        }
        responseLineHTML += '</table></body>';
        return responseLineHTML;
    }

    return {
        onAction : onAction
    };
    
});