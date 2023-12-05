/**
 * @author Matt Lehman
 * @version 0.0.9
 * @fileOverview This file is a custom GL script for deferring revenue/expenses
 * from Project transactions using the project accounting method configuration methods
 * on the BB configuration values
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

function customizeGlImpact(transactionRecord, standardLines, customLines, book) {
    var recType = transactionRecord.getRecordType();
    nlapiLogExecution('DEBUG', 'Record Type', recType);

    var str_acctgMethod = transactionRecord.getFieldText('custbody_bb_project_acctg_method');
    var advancedPaymentScheduleAcctMethod = transactionRecord.getFieldText('custbody_bb_adv_pay_recognition_type');
    var advancedMilestoneSchedule = transactionRecord.getFieldValue('custbody_bbss_adv_pay_subschedlink');
    var projectID = transactionRecord.getFieldValue('custbody_bb_project');
    var config = bb.config.getConfigurations(['custrecord_bb_revenue_account', 'custrecord_bb_deferred_revenue_account', 'custrecord_bb_unbilled_ar_account',
        'custrecord_bb_equipment_costs_account', 'custrecord_bb_direct_labor_cost_account', 'custrecord_bb_proj_shipping_cost_account', 'custrecord_bb_vra_item_fulfil_account',
        'custrecord_bb_deferred_proj_cost_account', 'custrecord_bb_ss_outside_labor_cost_acct', 'custrecord_bb_ss_inv_rec_not_bill_acct', 'custrecord_bb_warranty_reserve_account',
        'custrecord_bb_deferred_proj_expnse_accnt', 'custrecord_bb_defered_revenue_accounts'
    ]);

    // process directly per project related transaction
    if (bb.config.isNotNull(projectID)) {
        var a_accounts = getAccountArray(config);
        var cogsAccounts =  getCOGSArray(config);
        var revAccounts = getRevAccounts(config);
        var unbilledARAccount = parseInt(config['custrecord_bb_unbilled_ar_account'].value);

        nlapiLogExecution('DEBUG', 'Account List', a_accounts);
        // check if advanced payment scheudule is populated first
        if (bb.config.isNotNull(advancedMilestoneSchedule) && bb.config.isNotNull(advancedPaymentScheduleAcctMethod)) {
            // execute accounting method for advanced payment schedule accounting methods
            if (advancedPaymentScheduleAcctMethod == 'Actuals at Completion') {
                nlapiLogExecution('DEBUG', 'Executing Actuals at Completion for Advanced payment schedule recognition');
                //check if transaction record has advanced payment schedule record has the accrual je set. need to perform a search on the custom record
                var isAccrualCompleted = transactionRecord.getFieldValue('custbody_bb_proj_accrual_je_record');
                nlapiLogExecution('DEBUG', 'Accrual JE Created for advanced payment schedule', isAccrualCompleted);

                if (!isAccrualCompleted) {
                    bb.config.processAccrualDeferalLines(recType, transactionRecord, standardLines, customLines, a_accounts, cogsAccounts, revAccounts, config);
                }
            } else if (advancedPaymentScheduleAcctMethod == 'All Revenue Projected and COGS Actuals') {
                nlapiLogExecution('DEBUG', 'Executing 100% Revenue Projected and COGS Actuals for Advanced payment schedule recognition');
                // check if the accrual has been completed
                var isProjRevAccrualCompleted = transactionRecord.getFieldValue('custbody_bb_proj_accrual_je_record');
                nlapiLogExecution('DEBUG', 'Accrual JE Created for advanced payment schedule', isProjRevAccrualCompleted);
                if (!isProjRevAccrualCompleted || recType == 'invoice') {
                    bb.config.processProjectedRevenueCOGSActualLines(recType, transactionRecord, standardLines, customLines, a_accounts, cogsAccounts, revAccounts, config);
                }
            } else if (advancedPaymentScheduleAcctMethod.indexOf('Milestone') != -1 && typeof(advancedPaymentScheduleAcctMethod) == 'string') {
                nlapiLogExecution('DEBUG', 'Executing Milestone Accrual for Advanced payment schedule recognition');
                // check if advanced payment schedule accrual JE has been completed.
                var milestoneRecognized = transactionRecord.getFieldValue('custbody_bb_adv_milestone_rec_bool'); // may possibly need to stop deferral
                var isADVMilestoneCompleted = transactionRecord.getFieldValue('custbody_bb_adv_pay_recognition_je'); // may possibly need to stop deferral

                nlapiLogExecution('DEBUG', 'Accrual JE Created for advanced payment schedule', isADVMilestoneCompleted);
                if (!isADVMilestoneCompleted || milestoneRecognized == 'T') {
                    bb.config.processAccrualDeferalLines(recType, transactionRecord, standardLines, customLines, a_accounts, cogsAccounts, revAccounts, config);
                }
            } else if (advancedPaymentScheduleAcctMethod == 'Percent Complete') {
                nlapiLogExecution('DEBUG', 'Executing Percent Complete for Advanced payment schedule recognition');
                // check if advanced payment schedule accrual JE has been completed.
                var isMilestoneAccrualCompleted = transactionRecord.getFieldValue('custbody_bb_proj_accrual_je_record');
                var milestoneRecognized = transactionRecord.getFieldValue('custbody_bb_adv_milestone_rec_bool'); // may possibly need to stop deferral

                nlapiLogExecution('DEBUG', 'Accrual JE Created for advanced payment schedule - percent complete', isMilestoneAccrualCompleted);
                if (!isMilestoneAccrualCompleted || milestoneRecognized == 'T') {
                    bb.config.processPercentCompleteLines(recType, transactionRecord, standardLines, customLines, a_accounts, cogsAccounts, revAccounts, config)
                }
            }

        } else {
            // standard project accounting method
            if (str_acctgMethod == 'Accrual' || str_acctgMethod == 'Actuals at Completion' || str_acctgMethod == 'Cash') {
                nlapiLogExecution('DEBUG', 'Executing Accrual or Actuals at Completion');
                //check if transaction record has advanced payment schedule record has the accrual je set. need to perform a search on the custom record
                var isAccrualCompleted = transactionRecord.getFieldValue('custbody_bb_proj_accrual_je_record');
                nlapiLogExecution('DEBUG', 'Accrual JE Created', isAccrualCompleted);

                if (!isAccrualCompleted) {
                    bb.config.processAccrualDeferalLines(recType, transactionRecord, standardLines, customLines, a_accounts, cogsAccounts, revAccounts, config);
                }

            } else if (str_acctgMethod == '100% Revenue Projected and COGS Actuals') {
                nlapiLogExecution('DEBUG', 'Executing 100% Revenue Projected and COGS Actuals');
                // check if the accrual has been completed
                var isProjRevAccrualCompleted = transactionRecord.getFieldValue('custbody_bb_proj_accrual_je_record');
                nlapiLogExecution('DEBUG', 'Accrual JE Created', isProjRevAccrualCompleted);
                if (!isProjRevAccrualCompleted || recType == 'invoice') {
                    bb.config.processProjectedRevenueCOGSActualLines(recType, transactionRecord, standardLines, customLines, a_accounts, cogsAccounts, revAccounts, config);
                }

            } else if (str_acctgMethod == 'Milestone') {
                nlapiLogExecution('DEBUG', 'Executing Milestone Accrual');
                // check if advanced payment schedule accrual JE has been completed.
                var isMilestoneAccrualCompleted = transactionRecord.getFieldValue('custbody_bb_proj_accrual_je_record');
                var isADVMilestoneCompleted = transactionRecord.getFieldValue('custbody_bb_adv_pay_recognition_je'); // may possibly need to stop deferral
                var milestoneRecognized = transactionRecord.getFieldValue('custbody_bb_adv_milestone_rec_bool'); // may possibly need to stop deferral
                nlapiLogExecution('DEBUG', 'Accrual JE Created', isADVMilestoneCompleted);
                if (!isADVMilestoneCompleted || milestoneRecognized == 'T') {
                    bb.config.processAccrualDeferalLines(recType, transactionRecord, standardLines, customLines, a_accounts, cogsAccounts, revAccounts, config);
                }
            } else if (str_acctgMethod == 'Percent Complete') {
                nlapiLogExecution('DEBUG', 'Executing Percent Complete for Advanced payment schedule recognition');
                // check if advanced payment schedule accrual JE has been completed.
                var isMilestoneAccrualCompleted = transactionRecord.getFieldValue('custbody_bb_proj_accrual_je_record');

                if (!isMilestoneAccrualCompleted) {
                    bb.config.processPercentCompleteLines(recType, transactionRecord, standardLines, customLines, a_accounts, cogsAccounts, revAccounts, config)
                }
            }
        }

    } else {
        // process journal entries not associated to a project, looks at each line item on a journal and determines if accrual is needed
        if (recType == 'journalentry' || recType == 'customtransaction_bb_balance_of_system') {
            // get custom segment mappings
            var customSegmentMappingArray = bb.config.getCustomSegmentConfiguration(['custrecord_bb_cust_seg_field_id']);

            bb.config.getCustomSegmentRecordValues(transactionRecord, customSegmentMappingArray);

            nlapiLogExecution("DEBUG", 'customSegmentMapping', JSON.stringify(customSegmentMappingArray));

            var a_accounts = getAccountArray(config);
            var cogsAccounts =  getCOGSArray(config);
            var revAccounts = getRevAccounts(config);

            var standardLine, newCustomLine;
            var amount, departmentId, classId, locationId;

            // returns an array of objects run over transactions lines and returning all je lines with accrual details
            var journalLines = bb.config.getJournalLineDetails(transactionRecord, recType, customSegmentMappingArray);

            for (var j = 0; j < standardLines.getCount(); j++) {
                var deferredAccount;
                var generalDeferredAccount;
                var isClawback = false;
                var memoText = (cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) ? 'cost of sale' : 'revenue';
                var deferredMemo = 'Deferring ' + memoText + ' to be recognized on M3 per configuration';
                standardLine = standardLines.getLine(j);

                nlapiLogExecution('DEBUG', 'Current Line Number', j);
                nlapiLogExecution('DEBUG', 'Standard Line ' + j + ' Account ID', standardLine.getAccountId());
                var indexOfAccountID = a_accounts.indexOf(standardLine.getAccountId());
                nlapiLogExecution('DEBUG', 'Array Values of Accounts', a_accounts);

                var jeMatchingLineDetail = bb.config.getMatchingLineDetails(journalLines, j + 1);
                nlapiLogExecution('DEBUG', 'matching JE line details', JSON.stringify(jeMatchingLineDetail));


                if (indexOfAccountID != -1 && jeMatchingLineDetail != -1) {

                    var segmentArray = jeMatchingLineDetail.segmentArray;

                    if (cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                        amount = standardLine.getDebitAmount();
                        if (amount == parseInt(0)) {
                            amount = standardLine.getCreditAmount();
                            isClawback = true;
                        }
                    } else if (revAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                        amount = standardLine.getCreditAmount();
                        if (amount == parseInt(0)) {
                            amount = standardLine.getDebitAmount();
                            isClawback = true;
                        }
                    } else {
                        amount = standardLine.getCreditAmount();
                        if (amount == parseInt(0)) {
                            amount = standardLine.getDebitAmount();
                            isClawback = true;
                        }
                    }
                    nlapiLogExecution('DEBUG', 'Array Values of Deferred COGS accounts', config['custrecord_bb_deferred_proj_cost_account'].value);

                    var deferredLineAccountId = (jeMatchingLineDetail.deferredLineAccountId) ? jeMatchingLineDetail.deferredLineAccountId : null;
                    deferredAccount = (cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) ? parseInt(config['custrecord_bb_deferred_proj_cost_account'].value) : parseInt(config['custrecord_bb_deferred_revenue_account'].value);
                    var str_acctgMethod = jeMatchingLineDetail.accountingMethod;

                    if (str_acctgMethod == 'Accrual' || str_acctgMethod == 'Actuals at Completion') {
                        // nlapiLogExecution('DEBUG', 'Array Values of Deferred Revenue accounts', config['custrecord_bb_deferred_proj_cost_account'].value);
                        generalDeferredAccount = (cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) ? parseInt(config['custrecord_bb_deferred_proj_cost_account'].value) : parseInt(config['custrecord_bb_deferred_revenue_account'].value);
                        deferredAccount =  (deferredLineAccountId) ? deferredLineAccountId : generalDeferredAccount
                    } else if (str_acctgMethod == '100% Revenue Projected and COGS Actuals' && cogsAccounts.indexOf(a_accounts[indexOfAccountID]) == -1) {
                        //execute deferral on income related accounts
                        generalDeferredAccount = parseInt(config['custrecord_bb_unbilled_ar_account'].value);
                        deferredAccount = (deferredLineAccountId) ? deferredLineAccountId : generalDeferredAccount
                    } else if (str_acctgMethod == '100% Revenue Projected and COGS Actuals' && cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                        // prevent cogs accounts from deferring when accounting method is 100% Revenue Projected and COGS Actuals
                        nlapiLogExecution('DEBUG', 'Skipping 100% Revenue Projected and COGS Actuals Starting on Standard JE', 'Skipped');
                        continue;
                    } else if (str_acctgMethod == 'Milestone Accrual') {
                        deferredAccount = (cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) ? parseInt(config['custrecord_bb_deferred_proj_cost_account'].value) : parseInt(config['custrecord_bb_deferred_revenue_account'].value);
                    }

                    departmentId = standardLine.getDepartmentId();
                    classId = standardLine.getClassId();
                    locationId = standardLine.getLocationId();
                    entityId = standardLine.getEntityId();

                    nlapiLogExecution('DEBUG', 'Current Line Amount', amount);
                    if (amount == 0 || amount < 0) continue;
                    nlapiLogExecution('DEBUG', 'Journal Line id record details', JSON.stringify(journalLines));

                    if ((jeMatchingLineDetail.accountingMethod == 'Accrual' || jeMatchingLineDetail.accountingMethod == 'Actuals at Completion') && !jeMatchingLineDetail.isAccrued) {

                        nlapiLogExecution('DEBUG', 'Accrual Deferment Starting on Standard JE', 'Started');
                        var memoWithAcctname = deferredMemo + ' || ' + jeMatchingLineDetail.accountName;
                        //create balance first line
                        newCustomLine = customLines.addNewLine();
                        newCustomLine.setDepartmentId(departmentId);
                        newCustomLine.setClassId(classId);
                        newCustomLine.setLocationId(locationId);
                        nlapiLogExecution('DEBUG', 'isClawBack', isClawback);

                        if (cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                            if (isClawback) {
                                newCustomLine.setDebitAmount(amount);
                            } else {
                                newCustomLine.setCreditAmount(amount);
                            }
                        }

                        if (revAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                            if (isClawback) {
                                newCustomLine.setCreditAmount(amount);
                            } else {
                                newCustomLine.setDebitAmount(amount);
                            }
                        }

                        newCustomLine.setAccountId(a_accounts[indexOfAccountID]);
                        newCustomLine.setMemo(deferredMemo);
                        newCustomLine.setEntityId(entityId);
                        bb.config.setCustomSegmentRecordLineValues(newCustomLine, segmentArray);

                        //create offset second line
                        newCustomLine = customLines.addNewLine();
                        newCustomLine.setDepartmentId(departmentId);
                        newCustomLine.setClassId(classId);
                        newCustomLine.setLocationId(locationId);
                        if (cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                            if (isClawback) {
                                newCustomLine.setCreditAmount(amount);
                            } else {
                                newCustomLine.setDebitAmount(amount);
                            }
                        }

                        if (revAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                            if (isClawback) {
                                newCustomLine.setDebitAmount(amount);
                            } else {
                                newCustomLine.setCreditAmount(amount);
                            }
                        }
                        nlapiLogExecution('DEBUG', 'deferred account', deferredAccount);
                        newCustomLine.setAccountId(deferredAccount);
                        newCustomLine.setMemo(memoWithAcctname);
                        newCustomLine.setEntityId(entityId);
                        bb.config.setCustomSegmentRecordLineValues(newCustomLine, segmentArray);

                    }

                }
            }// end of JE transaction line loop
        } // end of JE check

        if (recType == 'vendorbill') {
            // get custom segment mappings
            var customSegmentMappingArray = bb.config.getCustomSegmentConfiguration(['custrecord_bb_cust_seg_field_id']);

            bb.config.getCustomSegmentRecordValues(transactionRecord, customSegmentMappingArray);

            nlapiLogExecution("DEBUG", 'customSegmentMapping', JSON.stringify(customSegmentMappingArray));

            var a_accounts = getAccountArray(config);
            var cogsAccounts =  getCOGSArray(config);
            var revAccounts = getRevAccounts(config);

            var standardLine, newCustomLine;
            var amount, departmentId, classId, locationId;

            // returns an array of objects run over transactions lines and returning all je lines with accrual details
            var expenseLines = bb.config.getExpenseLineDetails(transactionRecord, recType, customSegmentMappingArray);

            for (var j = 0; j < standardLines.getCount(); j++) {
                var deferredAccount;
                var generalDeferralAccount;
                var isClawback = false;
                var memoText = (cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) ? 'cost of sale' : 'revenue';
                var deferredMemo = 'Deferring ' + memoText + ' to be recognized on M3 per configuration';
                standardLine = standardLines.getLine(j);

                nlapiLogExecution('DEBUG', 'Current Line Number', j);
                nlapiLogExecution('DEBUG', 'Standard Line ' + j + ' Account ID', standardLine.getAccountId());
                var indexOfAccountID = a_accounts.indexOf(standardLine.getAccountId());
                nlapiLogExecution('DEBUG', 'Array Values of Accounts', a_accounts);

                var expenseMatchingLineDetail = bb.config.getMatchingLineDetails(expenseLines, j);
                nlapiLogExecution('DEBUG', 'matching Expense line details', JSON.stringify(expenseMatchingLineDetail));

                var segmentArray = expenseMatchingLineDetail.segmentArray;

                if (indexOfAccountID != -1 && expenseMatchingLineDetail != -1) {
                    if (cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                        amount = standardLine.getDebitAmount();
                        if (amount == parseInt(0)) {
                            amount = standardLine.getCreditAmount();
                            isClawback = true;
                        }
                    }

                    if (revAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                        amount = standardLine.getCreditAmount();
                        if (amount == parseInt(0)) {
                            amount = standardLine.getDebitAmount();
                            isClawback = true;
                        }
                    }
                    var str_acctgMethod = expenseMatchingLineDetail.accountingMethod;
                    nlapiLogExecution('DEBUG', 'Array Values of Deferred Revenue accounts', config['custrecord_bb_deferred_proj_cost_account'].value);
                    deferredAccount = (cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) ? parseInt(config['custrecord_bb_deferred_proj_cost_account'].value) : parseInt(config['custrecord_bb_deferred_revenue_account'].value);

                    var lineDeferralAcct = (expenseMatchingLineDetail.deferralLineAccountId) ? expenseMatchingLineDetail.deferralLineAccountId : null;
                    nlapiLogExecution('DEBUG', 'line deferral account', lineDeferralAcct);

                    if (str_acctgMethod == 'Accrual' || str_acctgMethod == 'Actuals at Completion') {
                        // nlapiLogExecution('DEBUG', 'Array Values of Deferred Revenue accounts', config['custrecord_bb_deferred_proj_cost_account'].value);
                        // generalDeferralAccount = (cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) ? parseInt(config['custrecord_bb_deferred_proj_cost_account'].value) : parseInt(config['custrecord_bb_deferred_revenue_account'].value);
                        deferredAccount = (lineDeferralAcct) ? lineDeferralAcct : deferredAccount
                    } else if (str_acctgMethod == '100% Revenue Projected and COGS Actuals' && cogsAccounts.indexOf(a_accounts[indexOfAccountID]) == -1) {
                        //execute deferral on income related accounts
                        deferredAccount = parseInt(config['custrecord_bb_unbilled_ar_account'].value);
                    } else if (str_acctgMethod == '100% Revenue Projected and COGS Actuals' && cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                        // prevent cogs accounts from deferring when accounting method is 100% Revenue Projected and COGS Actuals
                        nlapiLogExecution('DEBUG', 'Skipping 100% Revenue Projected and COGS Actuals Starting on Standard JE', 'Skipped');
                        continue;
                    } else if (str_acctgMethod == 'Milestone Accrual') {
                        deferredAccount = (lineDeferralAcct) ? lineDeferralAcct : deferredAccount;
                    }

                    departmentId = standardLine.getDepartmentId();
                    classId = standardLine.getClassId();
                    locationId = standardLine.getLocationId();
                    entityId = standardLine.getEntityId();

                    nlapiLogExecution('DEBUG', 'Current Line Amount', amount);
                    nlapiLogExecution('DEBUG', 'Expense Line id record details', JSON.stringify(expenseLines));
                    var lineNumberCounter = j + 1;
                    nlapiLogExecution('DEBUG', 'Expense Line number counter', j);
                    var expenseMatchingLineDetail = bb.config.getMatchingLineDetails(expenseLines, j);

                    nlapiLogExecution('DEBUG', 'matching Expense line details', JSON.stringify(expenseMatchingLineDetail));


                    if ((expenseMatchingLineDetail.accountingMethod == 'Accrual' || expenseMatchingLineDetail.accountingMethod == 'Actuals at Completion') && !expenseMatchingLineDetail.isAccrued) {

                        nlapiLogExecution('DEBUG', 'Accrual Deferment Starting on Standard JE', 'Started');
                        var memoWithAcctname = deferredMemo + ' || ' + expenseMatchingLineDetail.accountName;
                        //create balance first line
                        newCustomLine = customLines.addNewLine();
                        newCustomLine.setDepartmentId(departmentId);
                        newCustomLine.setClassId(classId);
                        newCustomLine.setLocationId(locationId);
                        nlapiLogExecution('DEBUG', 'isClawBack', isClawback);

                        if (cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                            if (isClawback) {
                                newCustomLine.setDebitAmount(amount);
                            } else {
                                newCustomLine.setCreditAmount(amount);
                            }
                        }

                        if (revAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                            if (isClawback) {
                                newCustomLine.setCreditAmount(amount);
                            } else {
                                newCustomLine.setDebitAmount(amount);
                            }
                        }

                        newCustomLine.setAccountId(a_accounts[indexOfAccountID]);
                        newCustomLine.setMemo(deferredMemo);
                        newCustomLine.setEntityId(entityId);
                        bb.config.setCustomSegmentRecordLineValues(newCustomLine, segmentArray);

                        //create offset second line
                        newCustomLine = customLines.addNewLine();
                        newCustomLine.setDepartmentId(departmentId);
                        newCustomLine.setClassId(classId);
                        newCustomLine.setLocationId(locationId);
                        if (cogsAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                            if (isClawback) {
                                newCustomLine.setCreditAmount(amount);
                            } else {
                                newCustomLine.setDebitAmount(amount);
                            }
                        }

                        if (revAccounts.indexOf(a_accounts[indexOfAccountID]) != -1) {
                            if (isClawback) {
                                newCustomLine.setDebitAmount(amount);
                            } else {
                                newCustomLine.setCreditAmount(amount);
                            }
                        }
                        nlapiLogExecution('DEBUG', 'deferred account', deferredAccount);
                        newCustomLine.setAccountId(deferredAccount);
                        newCustomLine.setMemo(memoWithAcctname);
                        newCustomLine.setEntityId(entityId);
                        bb.config.setCustomSegmentRecordLineValues(newCustomLine, segmentArray);

                    }

                }
            }// end of Vendor Bill Expense Line transaction line loop
        } // end of Vendor Bill check

    }//end Project check
}// end of gl impact function


function getCOGSArray(config) {
    cogsArr = [];
    //Equipment Costs Account - MultiSelect Field
    nlapiLogExecution('DEBUG', 'Equipment Costs has Array Value', config['custrecord_bb_equipment_costs_account'].value.indexOf(','));
    if (config['custrecord_bb_equipment_costs_account'].value.indexOf(',') > -1) {
        var equipmentCostAct = config['custrecord_bb_equipment_costs_account'].value.split(',');
        pushAccountToArray(cogsArr, equipmentCostAct);
    } else {
        cogsArr.push(parseInt(config['custrecord_bb_equipment_costs_account'].value));
    }

    //Direct Labor Account - MultiSelect Field
    if (config['custrecord_bb_direct_labor_cost_account'].value.indexOf(',') > -1) {
        var directLabortAct = config['custrecord_bb_direct_labor_cost_account'].value.split(',');
        pushAccountToArray(cogsArr, directLabortAct);
    } else {
        cogsArr.push(parseInt(config['custrecord_bb_direct_labor_cost_account'].value));
    }

    // Outside Labor Account - MultiSelect Field
    if (config['custrecord_bb_ss_outside_labor_cost_acct'].value.indexOf(',') > -1) {
        var outsideLabortAct = config['custrecord_bb_ss_outside_labor_cost_acct'].value.split(',');
        pushAccountToArray(cogsArr, outsideLabortAct);
    } else {
        cogsArr.push(parseInt(config['custrecord_bb_ss_outside_labor_cost_acct'].value));
    }

    // if (config['custrecord_bb_deferred_proj_expnse_accnt'].value.indexOf(',') > -1) {
    //     var outsideLabortAct = config['custrecord_bb_deferred_proj_expnse_accnt'].value.split(',');
    //     pushAccountToArray(cogsArr, outsideLabortAct);
    // } else {
    //     cogsArr.push(parseInt(config['custrecord_bb_deferred_proj_expnse_accnt'].value));
    // }

    return cogsArr;
}

function getRevAccounts(config) {
    var revArr = [];
    nlapiLogExecution('DEBUG', 'Revenue has Array Value', config['custrecord_bb_revenue_account'].value.indexOf(','));
    if (config['custrecord_bb_revenue_account'].value.indexOf(',') > -1) {
        var revenueAcct = config['custrecord_bb_revenue_account'].value.split(',');
        pushAccountToArray(revArr, revenueAcct);
    } else {
        revArr.push(parseInt(config['custrecord_bb_revenue_account'].value));
    }
    return revArr;
}


function getAccountArray(config) {
    var array = [];

    // Revenue Account
    nlapiLogExecution('DEBUG', 'Revenue has Array Value', config['custrecord_bb_revenue_account'].value.indexOf(','));
    if (config['custrecord_bb_revenue_account'].value.indexOf(',') > -1) {
        var revenueAcct = config['custrecord_bb_revenue_account'].value.split(',');
        pushAccountToArray(array, revenueAcct);
    } else {
        array.push(parseInt(config['custrecord_bb_revenue_account'].value));
    }

    //Equipment Costs Account - MultiSelect Field
    nlapiLogExecution('DEBUG', 'Equipment Costs has Array Value', config['custrecord_bb_equipment_costs_account'].value.indexOf(','));
    if (config['custrecord_bb_equipment_costs_account'].value.indexOf(',') > -1) {
        var equipmentCostAct = config['custrecord_bb_equipment_costs_account'].value.split(',');
        pushAccountToArray(array, equipmentCostAct);
    } else {
        array.push(parseInt(config['custrecord_bb_equipment_costs_account'].value));
    }

    //Direct Labor Account - MultiSelect Field
    if (config['custrecord_bb_direct_labor_cost_account'].value.indexOf(',') > -1) {
        var directLabortAct = config['custrecord_bb_direct_labor_cost_account'].value.split(',');
        pushAccountToArray(array, directLabortAct);
    } else {
        array.push(parseInt(config['custrecord_bb_direct_labor_cost_account'].value));
    }

    // Outside Labor Account - MultiSelect Field
    if (config['custrecord_bb_ss_outside_labor_cost_acct'].value.indexOf(',') > -1) {
        var outsideLabortAct = config['custrecord_bb_ss_outside_labor_cost_acct'].value.split(',');
        pushAccountToArray(array, outsideLabortAct);
    } else {
        array.push(parseInt(config['custrecord_bb_ss_outside_labor_cost_acct'].value));
    }

    array.push(parseInt(config['custrecord_bb_proj_shipping_cost_account'].value));

    array.push(parseInt(config['custrecord_bb_vra_item_fulfil_account'].value));

    array.push(parseInt(config['custrecord_bb_unbilled_ar_account'].value));

    return array;
}

function pushAccountToArray(array, valuePair) {
    if (valuePair.length > 1) {
        for (var i = 0; i < valuePair.length; i++) {
            array.push(parseInt(valuePair[i]));
        }
        return array;
    }
}



