/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 *
 * - Module Definition -
 *
 * Copyright 2020 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/search', 'N/record', 'N/query', 'N/plugin', './BB.SS.AccrualJournal', '../../BB.SS.WFA.InvoiceActual'],
    function (search, record, query, plugin, revenueJournal, invActuals) {

        // LIST OF TRANSACTION TYPES BY ID
        var TRANSACTION_TYPE = {
            "1": "JOURNAL_ENTRY",
            "2": "INVENTORY_TRANSFER",
            "3": "CHECK",
            "4": "DEPOSIT",
            "5": "CASH_SALE",
            "6": "ESTIMATE",
            "7": "INVOICE",
            "8": "",
            "9": "CUSTOMER_PAYMENT",
            "10": "CREDIT_MEMO",
            "11": "INVENTORY_ADJUSTMENT",
            "12": "INVENTORY_TRANSFER", // listed twice
            "13": "",
            "14": "",
            "15": "PURCHASE_ORDER",
            "16": "ITEM_RECEIPT",
            "17": "VENDOR_BILL",
            "18": "VENDOR_PAYMENT",
            "20": "VENDOR_CREDIT",
            "21": "CREDIT_CARD_CHARGE",
            "22": "CREDIT_CARD_REFUND",
            "23": "",
            "28": "EXPENSE_REPORT",
            "29": "CASH_REFUND",
            "30": "CUSTOMER_REFUND",
            "31": "SALES_ORDER",
            "32": "ITEM_FULFILLMENT",
            "33": "RETURN_AUTHORIZATION",
            "36": "",
            "37": "OPPORTUNITY",
            "38": "PARTNER_COMMISSION_PLAN",
            "40": "CUSTOMER_DEPOSIT",
            "41": "DEPOSIT_APPLICATION",
            "42": "BIN_WORKSHEET",
            "43": "VENDOR_RETURN_AUTHORIZATION",
            "45": "BIN_TRANSFER",
            "48": "TRANSFER_ORDER",
            "49": "",
            "50": "",
            "51": "INVENTORY_COST_REVALUATION",
            "52": "",
            "57": "INVENTORY_COUNT",
            "65": "",
            "66": "",
            "74": "",
            "100": ""
        };

        var TRANSACTION_SUBLISTID = {
            'JOURNAL_ENTRY' : 'line',
            'INVOICE': 'item',
            'SALES_ORDER': 'item',
            'CREDIT_MEMO': 'item',
            'VENDOR_BILL': 'item',
            'VENDOR_PAYMENT': 'item',
            'VENDOR_CREDIT': 'item',
            'TRANSFER_ORDER': 'item',
            'ITEM_FULFILLMENT': 'item',
            'ITEM_RECEIPT': 'item',
            'INVENTORY_ADJUSTMENT': 'item',
            'VENDOR_RETURN_AUTHORIZATION': 'item',
            'CASH_SALE': 'item',
            'VENDOR_RETURN_AUTHORIZATION': 'item',
            'VENDOR_RETURN_AUTHORIZATION': 'item'
        }


        function headerCalculations(paymentschedule) {
            log.debug('after submit context', paymentschedule);
            // log.debug('after dealer text', dealerapptext);
            var rec = record.load({
                type: 'customrecord_bbss_adv_payment_schedule',
                id: paymentschedule,
                isDynamic: true
            })
            var templateid = rec.getValue('custrecord_bb_ss_advpay_template');
            var financier = rec.getValue('custrecord_bbss_advpay_financier_list');
            log.debug('before template', templateid);
            if (templateid) {
                var amount = rec.getValue('custrecord_bbss_advpay_amount');
                log.debug('before amount', amount);
                var dealerpct = rec.getValue('custrecord_bbss_advpay_dealer_fee_perc');
                log.debug('dealer pct', dealerpct);
                // dealerapptext = rec.getText('custrecord_bbss_advpay_dealer_method');

                if (amount && dealerpct) {

                    var dealertotal = parseFloat(dealerpct) / 100 * parseFloat(amount);
                    log.debug('dealer total', dealertotal);

                    rec.setValue({ fieldId: 'custrecord_bbss_advpay_dealer_fee_total', value: dealertotal });
                    // var dealermethod = rec.getValue('custrecord_bbss_advpay_dealer_method');
                    // if (dealermethod == 1){

                    // }

                };
                var paymentcopysearch = search.load({
                    id: 'customsearch_bbss_advpay_schedulefields'
                });
                var filters = paymentcopysearch.filterExpression;
                // log.debug('filters', filters);
                // this code block is just in case the UI already has a filtered field
                var hasFilter = false;
                for (var f = 0; f < filters.length; f++) {
                    if (filters[f][0] == 'internalid') {
                        filters[f] = ["internalid", "anyof", templateid];
                        hasFilter = true;
                    }
                }
                if (!hasFilter) filters.push("AND", ["internalid", "is", templateid]);
                //log.audit('duplicate filters', filters);
                paymentcopysearch.filterExpression = filters;
                var searchResultCount = paymentcopysearch.runPaged().count;
                log.debug("copy search result count", searchResultCount);
                paymentcopysearch.run().each(function (result) {
                    //   log.debug('payment copy result', result);
                    var jsonresults = result.toJSON();
                    //   log.debug('json results', jsonresults);
                    var values = jsonresults.values;
                    //   log.debug('values', values);
                    var keys = Object.keys(values);
                    //  log.debug('keys', keys);
                    for (var a = 0; a < keys.length; a++) {
                        var getValue = '';
                        var field = keys[a];
                        //     log.debug('field', field);
                        getValue = result.getValue(field);
                        if (getValue.slice(-1) == '%') {
                            getValue = getValue.slice(0, -1);
                        }
                        log.debug('getValue', getValue);
                        if (!rec.getValue({ fieldId: field })) {
                            rec.setValue({ fieldId: field, value: getValue });
                        };
                    };
                });
                if (financier) {
                    var sql = "SELECT SSC.custrecord_bb_advpay_use_advpay AS usepayments, SSC.custrecord_bb_direct_pay_item AS configdirectitem, CR.custentity_bb_dealer_fee_item AS customdealeritem, CR.id AS custid, SSC.custrecord_bb_direct_pay_search AS configdirectsearch, CR.custentity_bb_direct_pay_item AS customerdirectpay FROM customrecord_bb_solar_success_configurtn SSC JOIN customer CR ON CR.id = CR.id WHERE SSC.id like 1 AND CR.id like ?"
                    var results = query.runSuiteQL({ query: sql, params: [financier] });
                    results = results.asMappedResults();
                    if (!rec.getValue({ fieldId: 'custrecord_bbss_advpay_dealer_fee_item' }) && results[0].customdealeritem) rec.setValue({ fieldId: 'custrecord_bbss_advpay_dealer_fee_item', value: results[0].customdealeritem });

                    if (!rec.getValue({ fieldId: 'custrecord_bbss_advpay_directpayitem' }) && (results[0].configdirectitem || results[0].customerdirectpay)) {
                        if (results[0].customerdirectpay) rec.setValue({ fieldId: 'custrecord_bbss_advpay_directpayitem', value: results[0].customerdirectpay });
                        if (!results[0].customerdirectpay) rec.setValue({ fieldId: 'custrecord_bbss_advpay_directpayitem', value: results[0].configdirectitem });
                    }
                };
                rec.setValue({ fieldId: 'custrecord_bbss_advpay_dealer_fee_total', value: dealertotal });
                var save = rec.save();
                log.debug('header save', save);


            };
        }


        function createMilestones(finPaymentScheduleTemplateId, advpayScheduleId, projectId) {
            log.debug('financier advanced payment schedule id', finPaymentScheduleTemplateId);
            if (finPaymentScheduleTemplateId && advpayScheduleId && projectId) {
                var advPaymentRecord = record.load({
                    type: 'customrecord_bbss_adv_payment_schedule',
                    id: advpayScheduleId,
                    isDynamic: true
                });
                var amount = advPaymentRecord.getValue({fieldId: 'custrecord_bbss_advpay_amount'});
                var dealerFeeItem = advPaymentRecord.getValue({fieldId: 'custrecord_bbss_advpay_dealer_fee_item'});
                var downPaymentMethod = advPaymentRecord.getValue({fieldId: 'custrecord_bbss_advpay_deposit_appmethod'});
                var finObj = getFinancierAdvancedMilestoneScheduleRecord(finPaymentScheduleTemplateId);
                log.debug('main schedule search object', finObj);
                var roofAmt = 0;
                var roofingAmount = advPaymentRecord.getValue({fieldId: 'custrecord_bbss_advpay_roof_amt'});
                var roofingPercent = advPaymentRecord.getValue({fieldId: 'custrecord_bbss_advpay_roof_percent'});
                if (roofingPercent && amount) {
                    roofAmt = amount * (roofingPercent / 100);
                } else if (roofingAmount) {
                    roofAmt = roofingAmount;
                }
                log.debug('roofing amount', roofAmt);
                var secondItem = advPaymentRecord.getValue({fieldId: 'custrecord_bbss_advpay_second_item'});
                var secondItemAppMethod = advPaymentRecord.getValue({fieldId: 'custrecord_bbss_advpay_sec_item_app_meth'});
                var secondItemAmount = advPaymentRecord.getValue({fieldId: 'custrecord_bbss_advpay_sec_item_amount'})
                var subArray = finObj.array;
                var downPaymentAmount = finObj.downPaymentAmount;
                // var downPaymentMethod = finObj.downPaymentMethod
                if (subArray.length > 0) {
                    for (var i = 0; i < subArray.length; i++) {
                        createAdvancedMilestoneRecord(subArray[i], advpayScheduleId, projectId, amount, dealerFeeItem, downPaymentAmount, downPaymentMethod, roofAmt, secondItem, secondItemAppMethod, secondItemAmount);
                    }
                }
            }
        }


        function createMilestoneFromProjectAutomation(finPaymentScheduleTemplateId, project) {
            if (finPaymentScheduleTemplateId && project.id) {
                //check if advanced payment schedule exists on project already
                var customrecord_bbss_adv_payment_scheduleSearchObj = search.create({
                    type: "customrecord_bbss_adv_payment_schedule",
                    filters:
                        [
                            ["custrecord_bb_ss_advpay_template","anyof", finPaymentScheduleTemplateId],
                            "AND",
                            ["custrecord_bbss_advpay_project_list","anyof", project.id]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"})
                        ]
                });
                var searchResultCount = customrecord_bbss_adv_payment_scheduleSearchObj.runPaged().count;
                log.debug("existing adv schedule by financier result count",searchResultCount);
                if (searchResultCount == 0) {// create new advanced payment schedule
                    // var projObj = search.lookupFields({
                    //     type: search.Type.JOB,
                    //     id: projectId,
                    //     columns: ['custentity_bb_homeowner_customer', 'custentity_bb_fin_prelim_purch_price_amt', 'custentity_bb_financier_customer']
                    // });
                    var projHomeowner = project.getValue({fieldId: 'custentity_bb_homeowner_customer'});
                    var projFinancier = project.getValue({fieldId: 'custentity_bb_financier_customer'});
                    var contractAmt = project.getValue({fieldId: 'custentity_bb_fin_prelim_purch_price_amt'});
                    // var homeowner = (projObj.custentity_bb_homeowner_customer.length > 0) ? projObj.custentity_bb_homeowner_customer[0].value : null;
                    // var financier = (projObj.custentity_bb_financier_customer.length > 0) ? projObj.custentity_bb_financier_customer[0].value : null;
                    // var contractValue = projObj.custentity_bb_fin_prelim_purch_price_amt;
                    if (contractAmt && projFinancier) {
                        var advSchedule = record.create({
                            type: 'customrecord_bbss_adv_payment_schedule',
                            isDynamic: true
                        });
                        advSchedule.setValue({
                            fieldId: 'custrecord_bbss_advpay_financier_list',
                            value: projFinancier
                        });
                        advSchedule.setValue({
                            fieldId: 'custrecord_bbss_advpay_project_list',
                            value: project.id
                        });
                        advSchedule.setValue({
                            fieldId: 'custrecord_bb_ss_advpay_template',
                            value: finPaymentScheduleTemplateId
                        });
                        advSchedule.setValue({
                            fieldId: 'custrecord_bbss_advpay_amount',
                            value: contractAmt
                        });
                        var advId = advSchedule.save({
                            ignoreMandatoryFields: true
                        });
                        createMilestones(finPaymentScheduleTemplateId, advId, project.id);
                        record.submitFields({
                            type: 'customrecord_bbss_adv_payment_schedule',
                            id: advId,
                            values: {
                                custrecord_bb_advpay_milestone_created: true
                            }
                        });
                    }
                }
            }
        }


        function createAdvancedMilestoneRecord(obj, advpayScheduleId, projectId, amount, dealerFeeItem, downPaymentAmount, downPaymentMethod, roofAmt, secondItem, secondItemAppMethod, secondItemAmount) {
            if (obj && advpayScheduleId && projectId && amount) {
                var lineAmount;
                var appMethodMapping = mapApplicationMethodToMilestoneId(downPaymentMethod);
                var subRec = record.create({
                    type: 'customrecord_bbss_adv_sub_pay_schedule',
                    isDynamic: true
                });
                subRec.setValue({
                    fieldId: 'custrecord_bbss_adv_subpay_category',
                    value: obj.custrecord_bb_fams_category
                });

                subRec.setValue({
                    fieldId: 'custrecord_bbss_adv_subpay_milestone',
                    value: obj.custrecord_bb_fams_milestone
                });
                subRec.setValue({
                    fieldId: 'custrecord_bbss_adv_subpay_action_list',
                    value: obj.custrecord_bb_fams_action
                });
                subRec.setValue({
                    fieldId: 'custrecord_bbss_adv_subpay_milestone',
                    value: obj.custrecord_bb_fams_milestone
                });

                if (obj.custrecord_bb_fams_amount_percent) {
                    if (appMethodMapping == -1) { // apply down payment method evenly
                        lineAmount = (!downPaymentAmount) ? (parseFloat(obj.custrecord_bb_fams_amount_percent) / 100) * amount :
                            (parseFloat(obj.custrecord_bb_fams_amount_percent) / 100) * (amount - downPaymentAmount);
                    } else {
                        if (appMethodMapping == obj.custrecord_bb_fams_milestone) {
                            lineAmount = ((parseFloat(obj.custrecord_bb_fams_amount_percent) / 100) * amount) - downPaymentAmount;
                        } else {
                            lineAmount = (parseFloat(obj.custrecord_bb_fams_amount_percent) / 100) * amount;
                        }
                    }

                    subRec.setValue({
                        fieldId: 'custrecord_bbss_adv_subpay_amount',
                        value: lineAmount
                    });

                    subRec.setValue({
                        fieldId: 'custrecord_bbss_adv_subpay_amount_pct',
                        value: parseFloat(obj.custrecord_bb_fams_amount_percent)
                    });
                } else if (obj.custrecord_bb_fams_milestone_amount) {// usually down payment amount 
                    subRec.setValue({
                        fieldId: 'custrecord_bbss_adv_subpay_amount',
                        value: obj.custrecord_bb_fams_milestone_amount
                    });
                }
                if (obj.custrecord_bb_fams_category == 1) { // category is roofing set roofing amount on line
                    subRec.setValue({
                        fieldId: 'custrecord_bbss_adv_subpay_amount',
                        value: roofAmt
                    });
                }
                subRec.setValue({
                    fieldId: 'custrecord_bbss_adv_subpay_schedule',
                    value: advpayScheduleId
                });
                subRec.setValue({
                    fieldId: 'custrecord_bbss_adv_subpay_dealer_item',
                    value: dealerFeeItem
                });
                subRec.setValue({
                    fieldId: 'custrecord_bbss_adv_subpay_project',
                    value: projectId
                });
                subRec.setValue({
                    fieldId: 'custrecord_bbss_adv_subpay_item_list',
                    value: obj.custrecord_bb_fams_trans_item
                });
                subRec.setValue({
                    fieldId: 'custrecord_bbss_adv_subpay_trans_type',
                    value: obj.custrecord_bb_fams_trans_type
                });
                subRec.setValue({
                    fieldId: 'custrecord_bbss_adv_subpay_recog_je_type',
                    value: obj.custrecord_bb_fams_recog_je_type
                });
                subRec.setValue({
                    fieldId: 'custrecord_bbss_adv_subpay_project',
                    value: projectId
                });
                if (obj.custrecord_bb_fams_fixed_dealer_fee_item) {
                    subRec.setValue({
                        fieldId: 'custrecord_bbss_adv_subpay_fix_deal_item',
                        value: obj.custrecord_bb_fams_fixed_dealer_fee_item
                    });
                }
                if (obj.custrecord_bb_fams_fixed_dealer_fee_amt) {
                    subRec.setValue({
                        fieldId: 'custrecord_bbss_adv_subpay_fix_deal_amt',
                        value: obj.custrecord_bb_fams_fixed_dealer_fee_amt
                    });
                }

                var secondItemMethodMapping = mapApplicationMethodToMilestoneId(secondItemAppMethod);
                var secondaryItem = (secondItem) ? secondItem: ((obj.custrecord_bb_fams_second_item) ? obj.custrecord_bb_fams_second_item : null);
                log.debug('secondItemMethodMapping', secondItemMethodMapping);
                log.debug('secondaryItem', secondaryItem);
                if (secondItemMethodMapping == -1 && secondaryItem) { // when apply even - set second item on all lines
                    subRec.setValue({
                        fieldId: 'custrecord_bbss_adv_subpay_sec_item',
                        value: secondaryItem
                    });
                } else if (secondItemMethodMapping == obj.custrecord_bb_fams_milestone) { // if app method = milestone set the second item
                    if (secondaryItem) {
                        subRec.setValue({
                            fieldId: 'custrecord_bbss_adv_subpay_sec_item',
                            value: secondaryItem
                        });
                    }
                    if (obj.custrecord_bb_fams_second_item_amount) {
                        subRec.setValue({
                            fieldId: 'custrecord_bbss_adv_subpay_sec_item_amt',
                            value: secondItemAmount
                        });
                    }
                }
                subRec.save({
                    ignoreMandatoryFields: true
                });
            }
        }


        function getFinancierAdvancedMilestoneScheduleRecord(finPaymentScheduleTemplateId) {
            var array = [];
            var downPaymentAmount = 0;
            var downPaymentMethod;
            if (finPaymentScheduleTemplateId) {
                var customrecord_bb_financier_milestone_schSearchObj = search.create({
                    type: "customrecord_bb_financier_milestone_sch",
                    filters:
                        [
                            ["custrecord_bb_fams_fin_advpay_schedule","anyof", finPaymentScheduleTemplateId]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"}),
                            search.createColumn({name: "custrecord_bb_fams_milestone", label: "Milestone"}),
                            search.createColumn({name: "custrecord_bb_fams_action", label: "Action"}),
                            search.createColumn({name: "custrecord_bb_fams_amount_percent", label: "Amount %"}),
                            search.createColumn({name: "custrecord_bb_fams_recog_je_type", label: "Recognition JE Type"}),
                            search.createColumn({name: "custrecord_bb_fams_trans_item", label: "Transaction Item"}),
                            search.createColumn({name: "custrecord_bb_fams_trans_type", label: "Transaction Type"}),
                            search.createColumn({name: "custrecord_bb_fams_category", label: "Category"}),
                            search.createColumn({name: "custrecord_bb_fams_milestone_amount", label: "Milestone Amount"}),
                            search.createColumn({name: "custrecord_bb_fams_fixed_dealer_fee_item", label: "Fixed Dealer Fee Item"}),
                            search.createColumn({name: "custrecord_bb_fams_fixed_dealer_fee_amt", label: "Fixed Dealer Fee Amount"}),
                            search.createColumn({name: "custrecord_bb_fams_second_item", label: "Second Item"}),
                            search.createColumn({name: "custrecord_bb_fams_second_item_amount", label: "Second Item Amount"}),
                            search.createColumn({
                                name: "custrecord_bb_finaps_deposit_app_method",
                                join: "CUSTRECORD_BB_FAMS_FIN_ADVPAY_SCHEDULE",
                                label: "Down Payment/Deposit Application Method"
                            })
                        ]
                });
                var searchResultCount = customrecord_bb_financier_milestone_schSearchObj.runPaged().count;
                log.debug("customrecord_bb_financier_milestone_schSearchObj result count",searchResultCount);
                customrecord_bb_financier_milestone_schSearchObj.run().each(function(result){
                    var obj = {};
                    obj['internalid'] = result.getValue({name: 'internalid'});
                    obj['custrecord_bb_fams_milestone'] = result.getValue({name: 'custrecord_bb_fams_milestone'});
                    obj['custrecord_bb_fams_milestone_name'] = result.getText({name: 'custrecord_bb_fams_milestone'});
                    obj['custrecord_bb_fams_action'] = result.getValue({name: 'custrecord_bb_fams_action'});
                    obj['custrecord_bb_fams_amount_percent'] = result.getValue({name: 'custrecord_bb_fams_amount_percent'});
                    obj['custrecord_bb_fams_recog_je_type'] = result.getValue({name: 'custrecord_bb_fams_recog_je_type'});
                    obj['custrecord_bb_fams_trans_item'] = result.getValue({name: 'custrecord_bb_fams_trans_item'});
                    obj['custrecord_bb_fams_trans_type'] = result.getValue({name: 'custrecord_bb_fams_trans_type'});
                    obj['custrecord_bb_fams_category'] = result.getValue({name: 'custrecord_bb_fams_category'});
                    obj['custrecord_bb_fams_milestone_amount'] = result.getValue({name: 'custrecord_bb_fams_milestone_amount'});
                    obj['custrecord_bb_fams_fixed_dealer_fee_item'] = result.getValue({name: 'custrecord_bb_fams_fixed_dealer_fee_item'});
                    obj['custrecord_bb_fams_fixed_dealer_fee_amt'] = result.getValue({name: 'custrecord_bb_fams_fixed_dealer_fee_amt'});
                    obj['custrecord_bb_fams_second_item'] = result.getValue({name: 'custrecord_bb_fams_second_item'});
                    obj['custrecord_bb_fams_second_item_amount'] = result.getValue({name: 'custrecord_bb_fams_second_item_amount'});
                    downPaymentMethod = result.getValue({name: 'custrecord_bb_finaps_deposit_app_method', join: 'CUSTRECORD_BB_FAMS_FIN_ADVPAY_SCHEDULE'});
                    if (obj.custrecord_bb_fams_milestone_name == 'Down Payment') {
                        downPaymentAmount = obj.custrecord_bb_fams_milestone_amount;
                    }
                    array.push(obj);
                    return true;
                });
            }
            log.debug('finanicer advanced payment schedule sub record array', array);
            return {
                array: array,
                downPaymentAmount: downPaymentAmount,
                downPaymentMethod: downPaymentMethod
            }
        }


        function getAdvPaymentScheduleTransactionToProcessFromRecord(advPaymentRecord) {
            var config = record.load({
                type: 'customrecord_bb_solar_success_configurtn',
                id: advPaymentRecord.getValue({fieldId: 'custrecord_bbss_advpay_config'}) || 1,
                isDynamic: true
            });
            var useInvoiceActuals = config.getValue({fieldId: 'custrecord_bb_invoice_actuals_boolean'});
            var array = [];

            if (advPaymentRecord.id) {
                var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
                    type: "customrecord_bbss_adv_sub_pay_schedule",
                    filters:
                        [
                            ["custrecord_bbss_adv_subpay_schedule","anyof", advPaymentRecord.id]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_milestone", label: "Milestone"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_action_list", label: "Action"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount", label: "Amount"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount_pct", label: "Amount %"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_item_list", label: "Transaction Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_category", label: "Category"}),
                            search.createColumn({
                                name: "custrecord_bbss_adv_subpay_trans_type",
                                sort: search.Sort.ASC,
                                label: "Transaction Type"
                            }),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_schedule", label: "Payment Schedule"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je_type", label: "Recognition JE Type"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_milestonedate", label: "Milestone Date"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_transaction", label: "Transaction"}),
                            search.createColumn({name: "custrecord_bb_adv_subpay_already_invoic", label: "Already Invoiced?"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je", label: "Recognition JE"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_project", label: "Project"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_dealer_amount", label: "Dealer Fee Amount"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_trans_total", label: "Transaction Total"}),

                            search.createColumn({name: "custrecord_bbss_adv_subpay_fix_deal_item", label: "Fixed Dealer Fee Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_fix_deal_amt", label: "Fixed Dealer Fee Amount"}),

                            search.createColumn({name: "custrecord_bbss_adv_subpay_sec_item", label: "Secondary Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_sec_item_amt", label: "Secondary Item Amount"}),

                            search.createColumn({
                                name: "custrecord_bbss_advpay_dealer_fee_perc",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Dealer Fee %"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_dealer_method",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Dealer Fee Application Method"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_dealer_fee_item",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Dealer Fee Item"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_dealer_fee_total",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Dealer Fee Total"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_direct_pay_amt",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Direct Pay Amount"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_directpay_method",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Direct Pay Application Method"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_directpayitem",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Direct Pay Item"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_deposit_appmethod",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Down Payment/Deposit Application Method"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_financier_list",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Financier"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_amount",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Amount"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_already_invcd_amt",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Already Invoiced Amount"
                            })
                        ]
                });
                customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().each(function(result){
                    var processObj = {};
                    processObj.milestoneDate = result.getValue({name: 'custrecord_bbss_adv_subpay_milestonedate'});
                    processObj.transaction = result.getValue({name: 'custrecord_bbss_adv_subpay_transaction'});
                    processObj.category = result.getValue({name: 'custrecord_bbss_adv_subpay_category'});
                    processObj.milestone = result.getValue({name: 'custrecord_bbss_adv_subpay_milestone'});
                    processObj.action = result.getValue({name: 'custrecord_bbss_adv_subpay_action_list'});
                    processObj.amount = (result.getValue({name: 'custrecord_bbss_adv_subpay_amount'})) ? parseFloat(result.getValue({name: 'custrecord_bbss_adv_subpay_amount'})) : 0;
                    processObj.percent = (result.getValue({name: 'custrecord_bbss_adv_subpay_amount_pct'})) ? parseFloat(result.getValue({name: 'custrecord_bbss_adv_subpay_amount_pct'})) : 0;
                    processObj.item = result.getValue({name: 'custrecord_bbss_adv_subpay_item_list'});
                    processObj.type = result.getValue({name: 'custrecord_bbss_adv_subpay_trans_type'});
                    processObj.advParentId = result.getValue({name: 'custrecord_bbss_adv_subpay_schedule'});
                    processObj.recognitionType = result.getValue({name: 'custrecord_bbss_adv_subpay_recog_je_type'});
                    processObj.alreadyInvoiced = result.getValue({name: 'custrecord_bb_adv_subpay_already_invoic'});
                    processObj.recognitionJe = result.getValue({name: 'custrecord_bbss_adv_subpay_recog_je'});
                    processObj.projectId = result.getValue({name: 'custrecord_bbss_adv_subpay_project'});
                    processObj.transTotal = result.getValue({name: 'custrecord_bbss_adv_subpay_trans_total'});

                    processObj.fixedDealerFeeItem = result.getValue({name: 'custrecord_bbss_adv_subpay_fix_deal_item'});
                    processObj.fixedDealerFeeAmount = result.getValue({name: 'custrecord_bbss_adv_subpay_fix_deal_amt'});

                    processObj.secondaryItem = result.getValue({name: 'custrecord_bbss_adv_subpay_sec_item'});
                    processObj.secondaryItemAmount = result.getValue({name: 'custrecord_bbss_adv_subpay_sec_item_amt'});

                    processObj.advChildId = result.getValue({name: 'internalid'});

                    processObj.entityId = result.getValue({name: 'custrecord_bbss_advpay_financier_list', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.downPaymentDepositMethod = result.getValue({name: 'custrecord_bbss_advpay_deposit_appmethod', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});

                    processObj.dealerFeeMethod = result.getValue({name: 'custrecord_bbss_advpay_dealer_method', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.dealerFeeItem = result.getValue({name: 'custrecord_bbss_advpay_dealer_fee_item', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.dealerFeeAmount = result.getValue({name: 'custrecord_bbss_advpay_dealer_fee_total' , join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.dealerFeePercent = (result.getValue({name: 'custrecord_bbss_advpay_dealer_fee_perc', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'})) ? parseFloat(result.getValue({name: 'custrecord_bbss_advpay_dealer_fee_perc', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'})) / 100 : null;

                    processObj.directPayMethod = result.getValue({name: 'custrecord_bbss_advpay_directpay_method', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.directPayItem = result.getValue({name: 'custrecord_bbss_advpay_directpayitem', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.directPayAmount = result.getValue({name: 'custrecord_bbss_advpay_direct_pay_amt', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.setMilestoneDate = true;
                    processObj.advTotalAmt = result.getValue({name: 'custrecord_bbss_advpay_amount', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.advAlreadyInvoicedAmt = result.getValue({name: 'custrecord_bbss_advpay_already_invcd_amt', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    if (processObj.milestoneDate && processObj.item && ((processObj.amount && processObj.percent > 0) || (processObj.amount > 0 && !processObj.percent)) && !processObj.transaction && !processObj.alreadyInvoiced && processObj.type != 1 && !useInvoiceActuals) {
                        array.push(processObj);
                    } else if (useInvoiceActuals && processObj.milestoneDate && processObj.percent > 0 && processObj.amount > 0 && !processObj.transaction && !processObj.alreadyInvoiced && processObj.type == 7) {
                        array.push(processObj);
                    } else if (processObj.type == 1 && processObj.recognitionType == 2 && processObj.milestoneDate && !processObj.transaction) { /// process milestone accrual je
                        array.push(processObj);
                    } else if (processObj.type == 1 && processObj.recognitionType == 1 && processObj.category == 1 && processObj.milestoneDate && !processObj.transaction) { // process roof category for journal entry reversal
                        array.push(processObj);
                    } else if (processObj.type == 1 && processObj.recognitionType == 1 && processObj.milestoneDate && !processObj.transaction && processObj.category != 1) { // process projected revenue je
                        array.push(processObj);
                    } else if (processObj.type == 1 && processObj.recognitionType == 4 && processObj.milestoneDate && !processObj.transaction) { // percent complete recognition je
                        array.push(processObj);
                    } else if (processObj.type == 1 && processObj.recognitionType == 3 && processObj.milestoneDate && !processObj.transaction) { // actuals at completion recognition je
                        array.push(processObj);
                    }
                    return true;
                });
            }
            return array;
        }


        function getAdvPaymentScheduleTransactionToProcessFromProjectAction(projectId, packageActionId, milestoneDate) {
            var config = record.load({
                type: 'customrecord_bb_solar_success_configurtn',
                id: 1,
                isDynamic: true
            });
            var useInvoiceActuals = config.getValue({fieldId: 'custrecord_bb_invoice_actuals_boolean'});
            var array = [];
            if (projectId && packageActionId) {
                var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
                    type: "customrecord_bbss_adv_sub_pay_schedule",
                    filters:
                        [
                            ["custrecord_bbss_adv_subpay_action_list","anyof", packageActionId],
                            "AND",
                            ["custrecord_bbss_adv_subpay_project","anyof", projectId]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_milestone", label: "Milestone"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_action_list", label: "Action"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount", label: "Amount"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount_pct", label: "Amount %"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_item_list", label: "Transaction Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_category", label: "Category"}),
                            search.createColumn({
                                name: "custrecord_bbss_adv_subpay_trans_type",
                                sort: search.Sort.ASC,
                                label: "Transaction Type"
                            }),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_schedule", label: "Payment Schedule"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je_type", label: "Recognition JE Type"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_milestonedate", label: "Milestone Date"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_transaction", label: "Transaction"}),
                            search.createColumn({name: "custrecord_bb_adv_subpay_already_invoic", label: "Already Invoiced?"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je", label: "Recognition JE"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_project", label: "Project"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_dealer_amount", label: "Dealer Fee Amount"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_trans_total", label: "Transaction Total"}),

                            search.createColumn({name: "custrecord_bbss_adv_subpay_fix_deal_item", label: "Fixed Dealer Fee Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_fix_deal_amt", label: "Fixed Dealer Fee Amount"}),

                            search.createColumn({name: "custrecord_bbss_adv_subpay_sec_item", label: "Secondary Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_sec_item_amt", label: "Secondary Item Amount"}),

                            search.createColumn({
                                name: "custrecord_bbss_advpay_dealer_fee_perc",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Dealer Fee %"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_dealer_method",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Dealer Fee Application Method"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_dealer_fee_item",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Dealer Fee Item"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_dealer_fee_total",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Dealer Fee Total"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_direct_pay_amt",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Direct Pay Amount"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_directpay_method",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Direct Pay Application Method"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_directpayitem",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Direct Pay Item"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_deposit_appmethod",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Down Payment/Deposit Application Method"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_financier_list",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Financier"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_amount",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Amount"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_already_invcd_amt",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Already Invoiced Amount"
                            })
                        ]
                });
                customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().each(function(result){
                    var processObj = {};
                    processObj.milestoneDate = milestoneDate;
                    processObj.transaction = result.getValue({name: 'custrecord_bbss_adv_subpay_transaction'});
                    processObj.category = result.getValue({name: 'custrecord_bbss_adv_subpay_category'});
                    processObj.milestone = result.getValue({name: 'custrecord_bbss_adv_subpay_milestone'});
                    processObj.action = result.getValue({name: 'custrecord_bbss_adv_subpay_action_list'});
                    processObj.amount = (result.getValue({name: 'custrecord_bbss_adv_subpay_amount'})) ? parseFloat(result.getValue({name: 'custrecord_bbss_adv_subpay_amount'})) : 0;
                    processObj.percent = (result.getValue({name: 'custrecord_bbss_adv_subpay_amount_pct'})) ? parseFloat(result.getValue({name: 'custrecord_bbss_adv_subpay_amount_pct'})) : 0;
                    processObj.item = result.getValue({name: 'custrecord_bbss_adv_subpay_item_list'});
                    processObj.type = result.getValue({name: 'custrecord_bbss_adv_subpay_trans_type'});
                    processObj.advParentId = result.getValue({name: 'custrecord_bbss_adv_subpay_schedule'});
                    processObj.recognitionType = result.getValue({name: 'custrecord_bbss_adv_subpay_recog_je_type'});
                    processObj.alreadyInvoiced = result.getValue({name: 'custrecord_bb_adv_subpay_already_invoic'});
                    processObj.recognitionJe = result.getValue({name: 'custrecord_bbss_adv_subpay_recog_je'});
                    processObj.projectId = result.getValue({name: 'custrecord_bbss_adv_subpay_project'});
                    processObj.transTotal = result.getValue({name: 'custrecord_bbss_adv_subpay_trans_total'});

                    processObj.fixedDealerFeeItem = result.getValue({name: 'custrecord_bbss_adv_subpay_fix_deal_item'});
                    processObj.fixedDealerFeeAmount = result.getValue({name: 'custrecord_bbss_adv_subpay_fix_deal_amt'});

                    processObj.secondaryItem = result.getValue({name: 'custrecord_bbss_adv_subpay_sec_item'});
                    processObj.secondaryItemAmount = result.getValue({name: 'custrecord_bbss_adv_subpay_sec_item_amt'});

                    processObj.advChildId = result.getValue({name: 'internalid'});

                    processObj.entityId = result.getValue({name: 'custrecord_bbss_advpay_financier_list', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.downPaymentDepositMethod = result.getValue({name: 'custrecord_bbss_advpay_deposit_appmethod', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});

                    processObj.dealerFeeMethod = result.getValue({name: 'custrecord_bbss_advpay_dealer_method', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.dealerFeeItem = result.getValue({name: 'custrecord_bbss_advpay_dealer_fee_item', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.dealerFeeAmount = result.getValue({name: 'custrecord_bbss_advpay_dealer_fee_total'});
                    processObj.dealerFeePercent = (result.getValue({name: 'custrecord_bbss_advpay_dealer_fee_perc', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'})) ? parseFloat(result.getValue({name: 'custrecord_bbss_advpay_dealer_fee_perc', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'})) / 100 : null;

                    processObj.directPayMethod = result.getValue({name: 'custrecord_bbss_advpay_directpay_method', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.directPayItem = result.getValue({name: 'custrecord_bbss_advpay_directpayitem', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.directPayAmount = result.getValue({name: 'custrecord_bbss_advpay_direct_pay_amt', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.setMilestoneDate = true;
                    processObj.advTotalAmt = result.getValue({name: 'custrecord_bbss_advpay_amount', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.advAlreadyInvoicedAmt = result.getValue({name: 'custrecord_bbss_advpay_already_invcd_amt', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    if (!processObj.transaction && !processObj.alreadyInvoiced && processObj.item && ((processObj.amount && processObj.percent > 0) || (processObj.amount > 0 && !processObj.percent))  && processObj.type != 1 && !useInvoiceActuals) {
                        array.push(processObj);
                        log.debug('pushing general transaction');
                    } else if (useInvoiceActuals && !processObj.transaction && !processObj.alreadyInvoiced && processObj.percent > 0 && processObj.type == 7) {
                        log.debug('pushing invoice actual transaction');
                        array.push(processObj);
                    } else if (!processObj.transaction && processObj.type == 1) {
                        log.debug('pushing journal actual transaction');
                        array.push(processObj);
                    }
                    return true;
                });
            }
            return array;
        }

        // used with WF on advanced milestone schedule
        function getAdvPaymentScheduleTransactionToProcessFromAdvMilestoneRecord(advMilestoneRecord) {
            var array = [];
            var configObj = search.lookupFields({
                type: 'customrecord_bb_solar_success_configurtn',
                id: 1,
                columns: ['custrecord_bb_invoice_actuals_boolean']
            });
            var useInvoiceActuals = configObj.custrecord_bb_invoice_actuals_boolean;

            if (advMilestoneRecord.id) {
                var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
                    type: "customrecord_bbss_adv_sub_pay_schedule",
                    filters:
                        [
                            ["internalid","anyof", advMilestoneRecord.id]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_milestone", label: "Milestone"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_action_list", label: "Action"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount", label: "Amount"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount_pct", label: "Amount %"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_item_list", label: "Transaction Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_category", label: "Category"}),
                            search.createColumn({
                                name: "custrecord_bbss_adv_subpay_trans_type",
                                sort: search.Sort.ASC,
                                label: "Transaction Type"
                            }),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_schedule", label: "Payment Schedule"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je_type", label: "Recognition JE Type"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_milestonedate", label: "Milestone Date"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_transaction", label: "Transaction"}),
                            search.createColumn({name: "custrecord_bb_adv_subpay_already_invoic", label: "Already Invoiced?"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je", label: "Recognition JE"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_project", label: "Project"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_dealer_amount", label: "Dealer Fee Amount"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_trans_total", label: "Transaction Total"}),

                            search.createColumn({name: "custrecord_bbss_adv_subpay_fix_deal_item", label: "Fixed Dealer Fee Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_fix_deal_amt", label: "Fixed Dealer Fee Amount"}),

                            search.createColumn({name: "custrecord_bbss_adv_subpay_sec_item", label: "Secondary Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_sec_item_amt", label: "Secondary Item Amount"}),

                            search.createColumn({
                                name: "custrecord_bbss_advpay_dealer_fee_perc",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Dealer Fee %"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_dealer_method",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Dealer Fee Application Method"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_dealer_fee_item",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Dealer Fee Item"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_dealer_fee_total",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Dealer Fee Total"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_direct_pay_amt",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Direct Pay Amount"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_directpay_method",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Direct Pay Application Method"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_directpayitem",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Direct Pay Item"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_deposit_appmethod",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Down Payment/Deposit Application Method"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_financier_list",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Financier"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_amount",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Amount"
                            }),
                            search.createColumn({
                                name: "custrecord_bbss_advpay_already_invcd_amt",
                                join: "CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE",
                                label: "Already Invoiced Amount"
                            })
                        ]
                });
                customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().each(function(result){
                    var processObj = {};
                    processObj.milestoneDate = (advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})) ? advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'}) :
                        ((result.getValue({name: 'custrecord_bbss_adv_subpay_milestonedate'})) ? result.getValue({name: 'custrecord_bbss_adv_subpay_milestonedate'}) : null);

                    processObj.transaction = (advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_transaction'})) ? advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_transaction'}) :
                        ((result.getValue({name: 'custrecord_bbss_adv_subpay_transaction'})) ? result.getValue({name: 'custrecord_bbss_adv_subpay_transaction'}) : null);

                    processObj.category = (advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_category'})) ? advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_category'}) :
                        ((result.getValue({name: 'custrecord_bbss_adv_subpay_category'})) ? result.getValue({name: 'custrecord_bbss_adv_subpay_category'}) : null);

                    processObj.milestone = (advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestone'})) ? advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestone'}) :
                        ((result.getValue({name: 'custrecord_bbss_adv_subpay_milestone'})) ? result.getValue({name: 'custrecord_bbss_adv_subpay_milestone'}) : null);

                    processObj.action = (advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_action_list'})) ? advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_action_list'}) :
                        ((result.getValue({name: 'custrecord_bbss_adv_subpay_action_list'})) ? result.getValue({name: 'custrecord_bbss_adv_subpay_action_list'}) : null);

                    processObj.amount = (advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_amount'})) ? advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_amount'}) :
                        ((result.getValue({name: 'custrecord_bbss_adv_subpay_amount'})) ? result.getValue({name: 'custrecord_bbss_adv_subpay_amount'}) : 0);

                    processObj.secondaryItem = (advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_sec_item'})) ? advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_sec_item'}) :
                        ((result.getValue({name: 'custrecord_bbss_adv_subpay_sec_item'})) ? result.getValue({name: 'custrecord_bbss_adv_subpay_sec_item'}) : null);

                    processObj.secondaryItemAmount = (advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_sec_item_amt'})) ? advMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_sec_item_amt'}) :
                        ((result.getValue({name: 'custrecord_bbss_adv_subpay_sec_item_amt'})) ? result.getValue({name: 'custrecord_bbss_adv_subpay_sec_item_amt'}) : null);

                    processObj.percent = (result.getValue({name: 'custrecord_bbss_adv_subpay_amount_pct'})) ? parseFloat(result.getValue({name: 'custrecord_bbss_adv_subpay_amount_pct'})) : 0;
                    processObj.item = result.getValue({name: 'custrecord_bbss_adv_subpay_item_list'});
                    processObj.type = result.getValue({name: 'custrecord_bbss_adv_subpay_trans_type'});
                    processObj.advParentId = result.getValue({name: 'custrecord_bbss_adv_subpay_schedule'});
                    processObj.recognitionType = result.getValue({name: 'custrecord_bbss_adv_subpay_recog_je_type'});
                    processObj.alreadyInvoiced = (advMilestoneRecord.getValue({fieldId: 'custrecord_bb_adv_subpay_already_invoic'})) ? advMilestoneRecord.getValue({fieldId: 'custrecord_bb_adv_subpay_already_invoic'}) :
                        ((result.getValue({name: 'custrecord_bb_adv_subpay_already_invoic'})) ? result.getValue({name: 'custrecord_bb_adv_subpay_already_invoic'}) : null);
                    processObj.recognitionJe = result.getValue({name: 'custrecord_bbss_adv_subpay_recog_je'});
                    processObj.projectId = result.getValue({name: 'custrecord_bbss_adv_subpay_project'});
                    processObj.transTotal = result.getValue({name: 'custrecord_bbss_adv_subpay_trans_total'});

                    processObj.fixedDealerFeeItem = result.getValue({name: 'custrecord_bbss_adv_subpay_fix_deal_item'});
                    processObj.fixedDealerFeeAmount = result.getValue({name: 'custrecord_bbss_adv_subpay_fix_deal_amt'});

                    processObj.advChildId = result.getValue({name: 'internalid'});

                    processObj.entityId = result.getValue({name: 'custrecord_bbss_advpay_financier_list', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.downPaymentDepositMethod = result.getValue({name: 'custrecord_bbss_advpay_deposit_appmethod', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});

                    processObj.dealerFeeMethod = result.getValue({name: 'custrecord_bbss_advpay_dealer_method', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.dealerFeeItem = result.getValue({name: 'custrecord_bbss_advpay_dealer_fee_item', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.dealerFeeAmount = result.getValue({name: 'custrecord_bbss_advpay_dealer_fee_total'});
                    processObj.dealerFeePercent = (result.getValue({name: 'custrecord_bbss_advpay_dealer_fee_perc', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'})) ? parseFloat(result.getValue({name: 'custrecord_bbss_advpay_dealer_fee_perc', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'})) / 100 : null;

                    processObj.directPayMethod = result.getValue({name: 'custrecord_bbss_advpay_directpay_method', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.directPayItem = result.getValue({name: 'custrecord_bbss_advpay_directpayitem', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.directPayAmount = result.getValue({name: 'custrecord_bbss_advpay_direct_pay_amt', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.setMilestoneDate = true;
                    processObj.advTotalAmt = result.getValue({name: 'custrecord_bbss_advpay_amount', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    processObj.advAlreadyInvoicedAmt = result.getValue({name: 'custrecord_bbss_advpay_already_invcd_amt', join: 'CUSTRECORD_BBSS_ADV_SUBPAY_SCHEDULE'});
                    if (!processObj.transaction && !processObj.alreadyInvoiced && processObj.item && processObj.milestoneDate && ((processObj.amount && processObj.percent > 0) || (processObj.amount > 0 && !processObj.percent))  && processObj.type != 1 && !useInvoiceActuals) {
                        array.push(processObj);
                        log.debug('pushing general transaction');
                    } else if (useInvoiceActuals && !processObj.transaction && processObj.milestoneDate && !processObj.alreadyInvoiced && processObj.percent > 0 && processObj.type == 7) {
                        log.debug('pushing invoice actual transaction');
                        array.push(processObj);
                    } else if (!processObj.transaction && processObj.type == 1 && processObj.milestoneDate) {
                        log.debug('pushing journal actual transaction');
                        array.push(processObj);
                    }
                    return true;
                });
            }
            log.debug('array for transaction creation', array)
            return array;
        }



        function createAdvancedMilestoneTransaction(obj, advancedMilestoneRecord) {
            var values = {};
            var columns = ['custentity_bb_project_location', 'custentity_bb_project_acctg_method']
            var config = record.load({
                type: 'customrecord_bb_solar_success_configurtn',
                id: 1,
                isDynamic: true
            });
            if (config.getValue({fieldId: 'custrecord_bb_ss_has_subsidiaries'})) {
                columns.push('subsidiary');
            }
            var invoiceActuals = config.getValue({fieldId: 'custrecord_bb_invoice_actuals_boolean'})

            var recType = obj.type;
            var recTypeName = TRANSACTION_TYPE[recType];
            log.debug('trans type name', recTypeName);

            var projObj = search.lookupFields({
                type: search.Type.JOB,
                id: obj.projectId,
                columns: columns
            });
            log.debug('*** projObj ***', projObj);
            log.debug('*** projObj subsidiary ***', projObj.subsidiary[0].value);

            var invoiceLineCount = getInvoicedSublistRecordCount(obj.advParentId);
            log.debug('*** invoiceLineCount ***', invoiceLineCount);

            var advScheduleCount = getProjectADVScheduleCount(obj.projectId);
            log.debug('*** advScheduleCount ***', advScheduleCount);

            var accountingMethod = (projObj.custentity_bb_project_acctg_method.length > 0) ? projObj.custentity_bb_project_acctg_method[0].value : null;
            log.debug('*** accountingMethod ***', accountingMethod);

            var location = (projObj.custentity_bb_project_location.length > 0) ? projObj.custentity_bb_project_location[0].value : null;
            log.debug('*** location ***', location);

            if (!invoiceActuals) {
                log.debug('*** not invoiceActuals ***');

                if (recTypeName != 'JOURNAL_ENTRY') {
                    log.debug('*** not journal entry ***');

                    var transRecord = record.create({
                        type: record.Type[recTypeName],
                        isDynamic: true
                    });
                    if (recTypeName != 'TRANSFER_ORDER' || recTypeName != 'CUSTOMER_DEPOSIT') {
                        transRecord.setValue({fieldId: 'entity', value: obj.entityId});
                    }
                    else if (recTypeName == 'CUSTOMER_DEPOSIT') {
                        transRecord.setValue({fieldId: 'customer', value: obj.entityId});
                    }

                    if (config.getValue({fieldId: 'custrecord_bb_ss_has_subsidiaries'})) {
                        transRecord.setValue({fieldId: 'subsidiary', value: projObj.subsidiary[0].value});
                    }
                    var impls = plugin.findImplementations({
                        type: 'customscript_bb_ss_adv_trans_plugin',
                        includeDefault: false

                    });
                    log.debug('implsss',impls)

                    var tranDate = null;
                    if (advancedMilestoneRecord) {
                        if (advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})) {
                            tranDate = new Date(advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'}))
                        } else {
                            tranDate = new Date(obj.milestoneDate)
                        }
                    } else {
                        tranDate = new Date(obj.milestoneDate)
                    }
                    transRecord.setValue({fieldId: 'trandate', value: tranDate});
                    transRecord.setValue({fieldId: 'custbody_bb_project', value: obj.projectId});
                    transRecord.setValue({fieldId: 'location', value: location});
                    transRecord.setValue({fieldId: 'custbody_bb_milestone', value: obj.milestone});
                    transRecord.setValue({fieldId: 'custbody_bbss_adv_payschedlist', value: obj.advParentId});
                    transRecord.setValue({fieldId: 'custbody_bbss_adv_pay_subschedlink', value: obj.advChildId});

                    // set the deferral account field only for invoice and credit memo's that apply to milestone recognition type
                    if (obj.recognitionType == 2 && (recTypeName == 'INVOICE' || recTypeName == 'CREDIT_MEMO')) {
                        //lookup item deferral account
                        if (obj.item) {
                            var itemObj = search.lookupFields({
                                type: search.Type.ITEM,
                                id: obj.item,
                                columns: ['custitem_bb_deferred_rev_account']
                            })
                            var itemDeferredRevAccount = (itemObj.custitem_bb_deferred_rev_account.length > 0) ? itemObj.custitem_bb_deferred_rev_account[0].value : null;
                            if (itemDeferredRevAccount) {
                                transRecord.setValue({fieldId: 'custbody_bb_deferral_account', value: itemDeferredRevAccount});
                            }
                        }
                    }
                    var orderTotal = obj.amount;
                    if (recTypeName != 'CUSTOMER_DEPOSIT') {
                        log.debug('*** not customer deposit ***');
                        // setlines
                        var sublist = TRANSACTION_SUBLISTID[recTypeName];
                        transRecord.selectNewLine({sublistId: sublist});
                        transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'item', value: obj.item});
                        transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'quantity', value: 1});
                        var secondaryItem = obj.secondaryItem;
                        var secondaryItemAmount = (obj.secondaryItemAmount) ? parseFloat(obj.secondaryItemAmount) : 0;
                        // used with already invoiced amount
                        log.debug('*** obj.advParentId ***', obj.advParentId);
                        log.debug('*** obj.milestone ***', obj.milestone);
                        log.debug('*** obj.advAlreadyInvoicedAmt ***', obj.advAlreadyInvoicedAmt);
                        log.debug('*** obj.amount ***', obj.amount);
                        log.debug('*** secondaryItemAmount ***', secondaryItemAmount);

                        if (obj.advAlreadyInvoicedAmt && checkForLastMilestoneRecord(obj.advParentId, obj.milestone)) {
                            log.debug('*** already inv amt populated and last milestone rec is true ***');

                            var calcAlreadyInvAmt = parseFloat(getAlreadyGeneratedInvoiceTotals(obj.projectId));
                            log.debug('*** calcAlreadyInvAmt ***', calcAlreadyInvAmt);
//mlm testing!!
                            //obj.amount = parseFloat(obj.advTotalAmt) - calcAlreadyInvAmt - obj.advAlreadyInvoicedAmt - secondaryItemAmount;
                            obj.amount = obj.amount - obj.advAlreadyInvoicedAmt;
//mlm testing
                            if (obj.amount < 0) {
                                obj.amount = 0;
                            }
                            log.debug('*** obj.amount ***', obj.amount);

                        }
                        else if (secondaryItemAmount > 0 && secondaryItem) {
                            obj.amount = obj.amount - secondaryItemAmount
                        }
                        transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'rate', value: obj.amount});
                        if (impls.length > 0) {
                            var advPlugImpl = plugin.loadImplementation({
                                type: "customscript_bb_ss_adv_trans_plugin",
                                implementation: impls[0]
                            });
                            advPlugImpl.setCurrnetLineCustomFields(transRecord);
                        }

                        transRecord.commitLine({sublistId: sublist});

                        if (secondaryItem && secondaryItemAmount > 0) {
                            transRecord.selectNewLine({sublistId: sublist});
                            transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'item', value: secondaryItem});
                            transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'quantity', value: 1});
                            transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'rate', value: secondaryItemAmount});
                            if (impls.length > 0) {
                                var advPlugImpl = plugin.loadImplementation({
                                    type: "customscript_bb_ss_adv_trans_plugin",
                                    implementation: impls[0]
                                });
                                advPlugImpl.setCurrentLineCustomFields(transRecord);
                            }

                            transRecord.commitLine({sublistId: sublist});
                        }

                        // set other line for dealer fee
                        var advLookup = search.lookupFields({
                            type: 'customrecord_bbss_adv_payment_schedule',
                            id: obj.advParentId,
                            columns:['custrecord_bb_set_dealer_fee_header_bool']
                        })
                        // TODO add this value to the saved search object in the processing script.
                        var setDealerFeeAtHeader = advLookup.custrecord_bb_set_dealer_fee_header_bool
                        var dealFeeAmount = null;
                        var appMethodMapping = mapApplicationMethodToMilestoneId(obj.dealerFeeMethod);
                        if (obj.dealerFeeItem && obj.dealerFeePercent && obj.milestone != (12 || 2 || 6 || 7))  {
                            if (appMethodMapping == -1) { // apply evenly
                                dealFeeAmount = (orderTotal * obj.dealerFeePercent) * -1;
                            } else if (appMethodMapping) {
                                if (appMethodMapping == obj.milestone) {
                                    dealFeeAmount = obj.dealerFeeAmount * -1;
                                }
                            }
                            log.debug('dealFeeAmount',dealFeeAmount);
                            if (dealFeeAmount && !setDealerFeeAtHeader) {
                                transRecord.selectNewLine({sublistId: sublist});
                                transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'item', value: obj.dealerFeeItem});
                                transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'quantity', value: 1});
                                transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'rate', value: dealFeeAmount});
                                if (impls.length > 0) {
                                    var advPlugImpl = plugin.loadImplementation({
                                        type: "customscript_bb_ss_adv_trans_plugin",
                                        implementation: impls[0]
                                    });
                                    advPlugImpl.setCurrentLineCustomFields(transRecord)
                                }

                                transRecord.commitLine({sublistId: sublist});
                                values['custrecord_bbss_adv_subpay_dealer_item'] = obj.dealerFeeItem;
                                values['custrecord_bbss_adv_subpay_dealer_amount'] = dealFeeAmount;
                            } else if (dealFeeAmount && setDealerFeeAtHeader) {
                                transRecord.setValue({
                                    fieldId : 'discountitem',
                                    value : obj.dealerFeeItem
                                });
                                transRecord.setValue({
                                    fieldId : 'discountrate',
                                    value : dealFeeAmount
                                });
                                values['custrecord_bbss_adv_subpay_dealer_item'] = obj.dealerFeeItem;
                                values['custrecord_bbss_adv_subpay_dealer_amount'] = dealFeeAmount;
                            }
                        } else if (obj.dealerFeeItem && !obj.dealerFeePercent && obj.dealerFeeAmount && obj.milestone != (12 || 2 || 6 || 7)) {
                            // used for flat fee dealer fee amount vs using percentage
                            if (appMethodMapping == -1) { // apply evenly
                                dealFeeAmount = (parseFloat(obj.dealerFeeAmount) / parseInt(invoiceLineCount)) * -1;
                            } else if (appMethodMapping) {
                                if (appMethodMapping == obj.milestone) {
                                    dealFeeAmount = obj.dealerFeeAmount * -1;
                                }
                            }
                            log.debug('dealFeeAmount',dealFeeAmount);
                            if (dealFeeAmount && !setDealerFeeAtHeader) {
                                transRecord.selectNewLine({sublistId: sublist});
                                transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'item', value: obj.dealerFeeItem});
                                transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'quantity', value: 1});
                                transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'rate', value: dealFeeAmount});
                                if (impls.length > 0) {
                                    var advPlugImpl = plugin.loadImplementation({
                                        type: "customscript_bb_ss_adv_trans_plugin",
                                        implementation: impls[0]
                                    });
                                    advPlugImpl.setCurrentLineCustomFields(transRecord)
                                }

                                transRecord.commitLine({sublistId: sublist});
                                values['custrecord_bbss_adv_subpay_dealer_item'] = obj.dealerFeeItem;
                                values['custrecord_bbss_adv_subpay_dealer_amount'] = dealFeeAmount;
                            } else if (dealFeeAmount && setDealerFeeAtHeader) {
                                transRecord.setValue({
                                    fieldId : 'discountitem',
                                    value : obj.dealerFeeItem
                                });
                                transRecord.setValue({
                                    fieldId : 'discountrate',
                                    value : dealFeeAmount
                                });
                                values['custrecord_bbss_adv_subpay_dealer_item'] = obj.dealerFeeItem;
                                values['custrecord_bbss_adv_subpay_dealer_amount'] = dealFeeAmount;
                            }
                        }
                        // set fixed dealer fee item and amount
                        if (obj.fixedDealerFeeAmount && obj.fixedDealerFeeItem) {
                            var fixedDealerFeeCalculation = obj.fixedDealerFeeAmount * -1;
                            transRecord.selectNewLine({sublistId: sublist});
                            transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'item', value: obj.fixedDealerFeeItem});
                            transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'quantity', value: 1});
                            transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'rate', value: fixedDealerFeeCalculation});
                            if (impls.length > 0) {
                                var advPlugImpl = plugin.loadImplementation({
                                    type: "customscript_bb_ss_adv_trans_plugin",
                                    implementation: impls[0]
                                });
                                advPlugImpl.setCurrentLineCustomFields(transRecord);
                            }

                            transRecord.commitLine({sublistId: sublist});
                        }

                        // direct pay
                        if (obj.directPayItem && obj.directPayAmount && obj.milestone != (12 || 2 || 6 || 7)) {
                            var directAmount = null;
                            var directAppMethodMapping = mapApplicationMethodToMilestoneId(obj.directPayMethod);
                            if (directAppMethodMapping == -1) {// apply evenly
                                directAmount = obj.directPayAmount * -1;
                            } else if (directAppMethodMapping) {
                                if (directAppMethodMapping == obj.milestone) {
                                    directAmount = obj.directPayAmount * -1;
                                }
                            }
                            if (directAmount) {
                                transRecord.selectNewLine({sublistId: sublist});
                                transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'item', value: obj.directPayItem});
                                transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'quantity', value: 1});
                                transRecord.setCurrentSublistValue({sublistId: sublist, fieldId: 'rate', value: directAmount});
                                if (impls.length > 0) {
                                    var advPlugImpl = plugin.loadImplementation({
                                        type: "customscript_bb_ss_adv_trans_plugin",
                                        implementation: impls[0]
                                    });
                                    advPlugImpl.setCurrentLineCustomFields(transRecord);
                                }

                                transRecord.commitLine({sublistId: sublist});
                            }
                        }

                    } else if (recTypeName == 'CUSTOMER_DEPOSIT') {
                        transRecord.setValue({fieldId: 'payment', value: obj.amount});
                    }

                    // 100% projected revenue and cogs actuals
                    if (obj.recognitionType == 1 && obj.projectId && obj.advParentId) {
                        // get project revenue je
                        var hasAllProjectedRevenueLine = true;
                        var hasMilestoneRecogntionLines = false;
                        var jeCreated = false;
                        var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
                            type: "customrecord_bbss_adv_sub_pay_schedule",
                            filters:
                                [
                                    ["custrecord_bbss_adv_subpay_project","anyof", obj.projectId],
                                    // "AND",
                                    // ["custrecord_bbss_adv_subpay_trans_type","anyof","1"],
                                    // "AND",
                                    // ["custrecord_bbss_adv_subpay_recog_je_type","anyof","1"],
                                    "AND",
                                    ["custrecord_bbss_adv_subpay_schedule", "anyof", obj.advParentId]
                                ],
                            columns:
                                [
                                    search.createColumn({name: "custrecord_bbss_adv_subpay_transaction", label: "Transaction"}),
                                    search.createColumn({name: "custrecord_bbss_adv_subpay_trans_type", label: "Transaction Type"}),
                                    search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je_type", label: "Recogntion Type"}),
                                ]
                        });
                        customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().each(function(result){
                            if (result.getValue({name: 'custrecord_bbss_adv_subpay_trans_type'}) == 1 &&
                                result.getValue({name: 'custrecord_bbss_adv_subpay_transaction'})) {
                                log.debug('setting journal entry on invoice sub line');
                                values['custrecord_bbss_adv_subpay_recog_je'] = result.getValue({name: 'custrecord_bbss_adv_subpay_transaction'});
                                transRecord.setValue({
                                    fieldId: 'custbody_bb_adv_pay_recognition_je',
                                    value: result.getValue({name: 'custrecord_bbss_adv_subpay_transaction'})
                                });
                                jeCreated = true;
                            }
                            if (result.getValue({name: 'custrecord_bbss_adv_subpay_recog_je_type'}) == 2) {
                                hasMilestoneRecogntionLines = true;
                            }
                            return true;
                        });
                        if (hasAllProjectedRevenueLine && !hasMilestoneRecogntionLines && !jeCreated) {
                            // change invoice generated recognition mehtod to milestone recognition so it can be sent to deferred revenue instead of unbilled AR
                            log.debug('updating invoice line to milestone recognition, the invoice is generated before the journal entry');
                            values['custrecord_bbss_adv_subpay_recog_je_type'] = 2;
                            // set value on invoice
                            transRecord.setValue({
                                fieldId: 'custbody_bb_adv_pay_recognition_type',
                                value: 2
                            });
                        }
                        // add logic here to check if an je is created first or not for all lines with projected revenue.
                    }

                    var tranId = transRecord.save({
                        ignoreMandatoryFields: true
                    });
                    values['custrecord_bbss_adv_subpay_transaction'] = tranId;
                    // only set the milestone date if there is no advanced milestone record object, (normal processing from the advanced payment schedule)
                    if (obj.setMilestoneDate && !advancedMilestoneRecord) {
                        values['custrecord_bbss_adv_subpay_milestonedate'] = new Date(obj.milestoneDate);
                    }
                    // only set the date if the advanced milestone record does not have a date and the advanced milestone object has been passed for processing
                    if (obj.setMilestoneDate && advancedMilestoneRecord) {
                        if (!advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})) {
                            values['custrecord_bbss_adv_subpay_milestonedate'] = new Date(obj.milestoneDate);
                        }
                    }
                }// end of non-journal entry execution check
            } else {
                // execute invoice actuals, get soId, milestone%, milestoneId
                log.debug('executing invoice actuals');
                var soId = searchProjectSalesOrder(obj.projectId);
                if (obj.milestone && obj.percent && soId && obj.type != 1) {
                    var milestoneArray = [];
                    milestoneArray.push({
                        milestoneId: obj.milestone,
                        percent: obj.percent
                    });
                    var existingTransCount = checkForExistingTransaction(obj.projectId, obj.milestone);
                    if (existingTransCount == 0) {
                        var isFinalPackage = invActuals.checkADVFinalPackage(obj.projectId, obj.milestone);
                        var invId = invActuals.transformSalesOrderToInvoice(soId, milestoneArray, isFinalPackage, obj.projectId, obj.advChildId, obj.advParentId);
                        values['custrecord_bbss_adv_subpay_transaction'] = invId;
                        // only set the milestone date if there is no advanced milestone record object, (normal processing from the advanced payment schedule)
                        if (obj.setMilestoneDate && !advancedMilestoneRecord) {
                            values['custrecord_bbss_adv_subpay_milestonedate'] = new Date(obj.milestoneDate);
                        }
                        // only set the date if the advanced milestone record does not have a date and the advanced milestone object has been passed for processing
                        if (obj.setMilestoneDate && advancedMilestoneRecord) {
                            if (!advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})) {
                                values['custrecord_bbss_adv_subpay_milestonedate'] = new Date(obj.milestoneDate);
                            }
                        }
                    }
                }

            }

            // create je for milestone accrual
            if (recTypeName == 'JOURNAL_ENTRY' && obj.recognitionType == 2 && obj.projectId && obj.milestone && (obj.milestoneDate || advancedMilestoneRecord)) {
                var project = record.load({
                    type: record.Type.JOB,
                    id: obj.projectId,
                    isDynamic: true
                });
                var config = record.load({
                    type:'customrecord_bb_solar_success_configurtn',
                    id: project.getValue({fieldId: 'custentity_bbss_configuration'}) || 1
                });
                var includeDownPayment = shouldIncludeDownPayment(obj.advParentId, obj.milestone);
                // get transactions that will be reversed here, use these transId to set milestone recogntion je on lines
                var recognitionTransactions = getReversalTransactions(obj.projectId, obj.milestone, includeDownPayment);
                log.debug('recogntionTransactions', recognitionTransactions);
                if (advancedMilestoneRecord) {
                    if (advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})) {
                        obj.milestoneDate = advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})
                    }
                }

                var jeId = revenueJournal.createMilestoneRecognitionJe(project, config, obj);
                if (jeId) {
                    log.debug('journal successfully created');
                    values['custrecord_bbss_adv_subpay_transaction'] = jeId;
                    // set all other transaction id's recognition je to all related transactions
                    // only set the milestone date if there is no advanced milestone record object, (normal processing from the advanced payment schedule)
                    if (obj.setMilestoneDate && !advancedMilestoneRecord) {
                        values['custrecord_bbss_adv_subpay_milestonedate'] = new Date(obj.milestoneDate);
                    }
                    // only set the date if the advanced milestone record does not have a date and the advanced milestone object has been passed for processing
                    if (obj.setMilestoneDate && advancedMilestoneRecord) {
                        if (!advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})) {
                            values['custrecord_bbss_adv_subpay_milestonedate'] = new Date(obj.milestoneDate);
                        }
                    }
                    setRecognitionJE(obj.projectId, obj.milestone,  obj.advParentId, advScheduleCount, jeId, recognitionTransactions, includeDownPayment, obj.advChildId);
                }
            }

            // create je for rolled in roofing
            if (recTypeName == 'JOURNAL_ENTRY' && obj.recognitionType == 1 && obj.category == 1 && obj.projectId && obj.milestone) {
                log.debug('generating rolled in roofing journal')
                var project = record.load({
                    type: record.Type.JOB,
                    id: obj.projectId,
                    isDynamic: true
                });
                var config = record.load({
                    type:'customrecord_bb_solar_success_configurtn',
                    id: project.getValue({fieldId: 'custentity_bbss_configuration'}) || 1
                });
                if (advancedMilestoneRecord) {
                    if (advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})) {
                        obj.milestoneDate = advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})
                    }
                }
                var jeId = revenueJournal.createRolledInRoofingRecognitionJe(project, config, obj);
                if (jeId) {
                    log.debug('journal successfully created');
                    values['custrecord_bbss_adv_subpay_transaction'] = jeId;
                }
            }

            // create je for projected revenue and cogs actuals
            if (recTypeName == 'JOURNAL_ENTRY' && obj.recognitionType == 1 && obj.projectId && obj.milestone && obj.category != 1) {
                log.debug('generating projected revenue cogs actuals journal')
                var project = record.load({
                    type: record.Type.JOB,
                    id: obj.projectId,
                    isDynamic: true
                });
                var config = record.load({
                    type:'customrecord_bb_solar_success_configurtn',
                    id: project.getValue({fieldId: 'custentity_bbss_configuration'}) || 1
                });
                if (advancedMilestoneRecord) {
                    if (advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})) {
                        obj.milestoneDate = advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})
                    }
                }
                var advRecords = getAdvancedMilestoneScheduleForProjectedRevenueJournals(obj.projectId, obj.action, obj.advParentId, advScheduleCount);
                if (advRecords.length > 0) {
                    for (var i = 0; i < advRecords.length; i++) {
                        if (!advRecords[i].custrecord_bbss_adv_subpay_transaction && advRecords[i].custrecord_bbss_adv_subpay_trans_type == 1) {
                            var jeId = revenueJournal.createProjectedRevenueRecognitionJe(project, config, advRecords[i], obj, advScheduleCount);
                            if (jeId) {
                                log.debug('journal successfully created');
                                values['custrecord_bbss_adv_subpay_transaction'] = jeId;
                                // only set the milestone date if there is no advanced milestone record object, (normal processing from the advanced payment schedule)
                                if (obj.setMilestoneDate && !advancedMilestoneRecord) {
                                    values['custrecord_bbss_adv_subpay_milestonedate'] = new Date(obj.milestoneDate);
                                }
                                // only set the date if the advanced milestone record does not have a date and the advanced milestone object has been passed for processing
                                if (obj.setMilestoneDate && advancedMilestoneRecord) {
                                    if (!advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})) {
                                        values['custrecord_bbss_adv_subpay_milestonedate'] = new Date(obj.milestoneDate);
                                    }
                                }
                                project.setValue({fieldId: 'custentity_bb_ss_accrual_journal', value: jeId});
                                project.save({ignoreMandatoryFields: true});
                            }
                        }
                    }
                    // update advanced milestone records/change unbilled invoices recognition type to Projected Revenue/COGS Actuals
                    findMilestoneScheduleRecordsUpdateToProjectedRevenue(obj.advParentId);
                }
            }

            // create je for percent complete
            if (recTypeName == 'JOURNAL_ENTRY' && obj.recognitionType == 4 && obj.projectId && obj.milestone && obj.percent) {
                var project = record.load({
                    type: record.Type.JOB,
                    id: obj.projectId,
                    isDynamic: true
                });
                var config = record.load({
                    type:'customrecord_bb_solar_success_configurtn',
                    id: project.getValue({fieldId: 'custentity_bbss_configuration'}) || 1
                });
                // check records if journal has been generated and invoice has been generated
                var createJe = false;
                var invoiceAmount = 0.00;
                var dealerFeeAmount = 0;
                var invArray = [];
                var advRecords = getAdvancedMilestoneScheduleForPercentComplete(obj.projectId, obj.advParentId);
                if (advancedMilestoneRecord) {
                    if (advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})) {
                        obj.milestoneDate = advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})
                    }
                }
                if (advRecords.length > 0) {
                    for (var x = 0; x < advRecords.length; x++) {
                        if (advRecords[x].custrecord_bbss_adv_subpay_transaction && advRecords[x].custrecord_bbss_adv_subpay_trans_type == 7) {
                            invoiceAmount = invoiceAmount + parseFloat(advRecords[x].custrecord_bbss_adv_subpay_amount);
                            invArray.push(advRecords[x].custrecord_bbss_adv_subpay_transaction);
                            dealerFeeAmount = dealerFeeAmount + parseFloat(advRecords[x].custrecord_bbss_adv_subpay_dealer_amount);
                        }
                        if (!advRecords[x].custrecord_bbss_adv_subpay_transaction && advRecords[x].custrecord_bbss_adv_subpay_trans_type == 1) {
                            createJe = true;
                        }
                    }// end of loop
                    if (createJe) {
                        var jeId = revenueJournal.createPercentCompleteRecognitionJe(project, config, invArray, obj, dealerFeeAmount);
                        if (jeId) {
                            log.debug('journal successfully created');
                            values['custrecord_bbss_adv_subpay_transaction'] = jeId;
                            // only set the milestone date if there is no advanced milestone record object, (normal processing from the advanced payment schedule)
                            if (obj.setMilestoneDate && !advancedMilestoneRecord) {
                                values['custrecord_bbss_adv_subpay_milestonedate'] = new Date(obj.milestoneDate);
                            }
                            // only set the date if the advanced milestone record does not have a date and the advanced milestone object has been passed for processing
                            if (obj.setMilestoneDate && advancedMilestoneRecord) {
                                if (!advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})) {
                                    values['custrecord_bbss_adv_subpay_milestonedate'] = new Date(obj.milestoneDate);
                                }
                            }
                            var finalJe = percentCompleteFinalJeCheck(project.id, obj.advChildId);
                            if (finalJe == 0) {
                                project.setValue({fieldId: 'custentity_bb_ss_accrual_journal', value: jeId});
                                project.save({ignoreMandatoryFields: true});
                            }
                        }
                    }
                }
            }

            // create je for actuals at completion
            if (recTypeName == 'JOURNAL_ENTRY' && obj.recognitionType == 3 && obj.projectId && (obj.milestoneDate || advancedMilestoneRecord)) {
                var project = record.load({
                    type: record.Type.JOB,
                    id: obj.projectId,
                    isDynamic: true
                });
                var config = record.load({
                    type:'customrecord_bb_solar_success_configurtn',
                    id: project.getValue({fieldId: 'custentity_bbss_configuration'}) || 1
                });
                // check records if journal has been generated
                var createJe = project.getValue({fieldId: 'custentity_bb_ss_accrual_journal'});
                var milestoneDate = null;
                if (advancedMilestoneRecord) {
                    if (advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})) {
                        milestoneDate = advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})
                    } else {
                        milestoneDate = obj.milestoneDate
                    }
                } else {
                    milestoneDate = obj.milestoneDate;
                }
                //(advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'})) ? advancedMilestoneRecord.getValue({fieldId: 'custrecord_bbss_adv_subpay_milestonedate'}) : obj.milestoneDate
                if (!createJe) {
                    var jeId = revenueJournal.createAccrualJE(project, config, milestoneDate);
                    if (jeId) {
                        log.debug('journal successfully created');
                        values['custrecord_bbss_adv_subpay_transaction'] = jeId;

                        project.setValue({fieldId: 'custentity_bb_ss_accrual_journal', value: jeId});
                        project.save({ignoreMandatoryFields: true});
                    }
                }
            }

            log.debug('values object', values);
            record.submitFields({
                type: 'customrecord_bbss_adv_sub_pay_schedule',
                id: obj.advChildId,
                values: values,
                options: {
                    ignoreMandatoryFields: true,
                    disableTriggers: true
                }
            });
            // calculate invoiced ar amount for advanced payment record
            var invoiceARTotal = getInvoicedARTotal(obj.advParentId);
            record.submitFields({
                type: 'customrecord_bbss_adv_payment_schedule',
                id: obj.advParentId,
                values: {
                    'custrecord_bbss_advpay_already_amount': invoiceARTotal
                },
                options: {
                    ignoreMandatoryFields: true,
                    disableTriggers: true
                }
            });
        }


        function getInvoicedARTotal(advParent) {
            var invoiceARTotal = 0;
            if (advParent) {
                var invoiceSearchObj = search.create({
                    type: "invoice",
                    filters:
                        [
                            ["mainline", "is", "T"],
                            "AND",
                            ["type", "anyof", "CustInvc"],
                            "AND",
                            ["custbody_bbss_adv_payschedlist", "anyof", advParent]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "amount",
                                summary: "SUM",
                                label: "Amount"
                            })
                        ]
                });
                var result = invoiceSearchObj.run().getRange({start: 0, end: 1});
                if (result.length > 0) {
                    var invoiceTotal = result[0].getValue({name: 'amount', summary: 'SUM'});
                    if (invoiceTotal) invoiceARTotal = invoiceTotal;
                }
            }
            return invoiceARTotal;
        }


        function getProjectADVScheduleCount(projectId) {
            var resultCount = 0;
            if (projectId) {
                var customrecord_bbss_adv_payment_scheduleSearchObj = search.create({
                    type: "customrecord_bbss_adv_payment_schedule",
                    filters:
                        [
                            ["custrecord_bbss_advpay_project_list", "anyof", projectId]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"})
                        ]
                });
                resultCount = customrecord_bbss_adv_payment_scheduleSearchObj.runPaged().count;
                log.debug("advanced payment schedule record count by project", resultCount);
            }
            return resultCount;
        }


        function getInvoicedSublistRecordCount(advParent) {
            var invoiceLineCount = 0;
            if (advParent) {
                var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
                    type: "customrecord_bbss_adv_sub_pay_schedule",
                    filters:
                        [
                            ["custrecord_bbss_adv_subpay_schedule", "anyof", advParent],
                            "AND",
                            ["custrecord_bbss_adv_subpay_trans_type", "anyof", "7"],
                            "AND",
                            ["isinactive", "is", "F"]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"})
                        ]
                });
                var searchResultCount = customrecord_bbss_adv_sub_pay_scheduleSearchObj.runPaged().count;
                log.debug("Invoice sublist result count", searchResultCount);
                invoiceLineCount = searchResultCount;
            }
            return invoiceLineCount;
        }


        function findMilestoneScheduleRecordsUpdateToProjectedRevenue(parentRecordId) {
            if (parentRecordId) {
                var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
                    type: "customrecord_bbss_adv_sub_pay_schedule",
                    filters:
                        [
                            ["custrecord_bbss_adv_subpay_trans_type","anyof","7"],
                            "AND",
                            ["custrecord_bbss_adv_subpay_transaction","anyof","@NONE@"],
                            "AND",
                            ["custrecord_bbss_adv_subpay_recog_je_type","noneof","1"],
                            "AND",
                            ["custrecord_bbss_adv_subpay_schedule","anyof", parentRecordId]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_milestone", label: "Milestone"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_action_list", label: "Action"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount", label: "Amount"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount_pct", label: "Amount %"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_item_list", label: "Transaction Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_trans_type", label: "Transaction Type"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_schedule", label: "Payment Schedule"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je_type", label: "Recognition JE Type"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_transaction", label: "Transaction"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je", label: "Recognition JE"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_project", label: "Project"})
                        ]
                });
                var searchResultCount = customrecord_bbss_adv_sub_pay_scheduleSearchObj.runPaged().count;
                log.debug("record count to update to recognition je type",searchResultCount);
                customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().each(function(result){

                    record.submitFields({
                        type: 'customrecord_bbss_adv_sub_pay_schedule',
                        id: result.getValue({name: 'internalid'}),
                        values: {
                            'custrecord_bbss_adv_subpay_recog_je_type': 1
                        },
                        options: {
                            ignoreMandatoryFields: true
                        }
                    });
                    return true;
                });
            }
        }


        function mapApplicationMethodToMilestoneId(applicationMethod) {
            if (applicationMethod == 1) {
                return -1;
            } else if (applicationMethod == 2) {
                return 1; // M0
            } else if (applicationMethod == 3) {
                return 3; // M1
            } else if (applicationMethod == 4) {
                return 4; // M2
            } else if (applicationMethod == 5) {
                return 5; // M3
            } else if (applicationMethod == 6) {
                return 8; // M4
            } else if (applicationMethod == 7) {
                return 9; // M5
            } else if (applicationMethod == 8) {
                return 10; // M6
            } else if (applicationMethod == 9) {
                return 11; // M7
            } else {
                return null
            }
        }


        function setRecognitionJE(projectId, milestoneId, parentId, advScheduleCount, jeId, transactionArray, includeDownPayment, advChildId) {
            var advRecords = getAdvMilestoneTransactionRecords(projectId, milestoneId, parentId, advScheduleCount, includeDownPayment);
            log.debug('advRecord', advRecords);
            // loop over advrecords and check if the match is in the transaction array, set those lines
            if (jeId && advRecords.length > 0) {
                for (var x = 0; x <  advRecords.length; x++) {
                    var tranId = advRecords[x].tranId;
                    var advId = advRecords[x].id;
                    var indexNumber = transactionArray.map(function(result) {return result.tranId;}).indexOf(tranId);
                    log.debug('found index to set je on adv records', indexNumber);
                    if (indexNumber != -1) {
                        record.submitFields({
                            type: 'customrecord_bbss_adv_sub_pay_schedule',
                            id: advId,
                            values: {
                                'custrecord_bbss_adv_subpay_recog_je': jeId
                            },
                            options: {
                                ignoreMandatoryFields: true
                            }
                        });
                    }

                    record.submitFields({
                        type: 'customrecord_bbss_adv_sub_pay_schedule',
                        id: advChildId,
                        values: {
                            'custrecord_bbss_adv_subpay_recog_je': jeId
                        },
                        options: {
                            ignoreMandatoryFields: true
                        }
                    });
                }
            }
            // loop over transactions that need the reversal JE info set/set check box that says already
            if (jeId && transactionArray.length > 0) {
                for (var i = 0; i < transactionArray.length; i++) {
                    var type = null;
                    var tranId = transactionArray[i].tranId
                    var tranType = transactionArray[i].tranType;
                    if (transactionArray[i].tranType == 'CustInvc') {
                        type = record.Type.INVOICE
                    } else if (transactionArray[i].tranType == 'VendBill') {
                        type = record.Type.VENDOR_BILL
                    } else if (transactionArray[i].tranType == 'Journal') {
                        type = record.Type.JOURNAL
                    } else if (transactionArray[i].tranType == '') { // credit memo
                        type = record.Type.CREDIT_MEMO
                    }
                    record.submitFields({
                        type: type,
                        id: tranId,
                        values: {
                            'custbody_bb_adv_milestone_rec_bool': true
                        },
                        options: {
                            ignoreMandatoryFields: true
                        }
                    });
                }
            }
        }


        function getAdvMilestoneTransactionRecords(projectId, milestoneId, parentId, advScheduleCount, includeDownPayment) {
            var advRecordsArray = [];
            if (projectId && milestoneId) {
                var filters = [
                    ["custrecord_bbss_adv_subpay_schedule.custrecord_bbss_advpay_project_list","anyof", projectId]

                ];
                if (advScheduleCount > 1) {
                    filters.push("AND", ["custrecord_bbss_adv_subpay_schedule","anyof", parentId])
                }
                if (includeDownPayment) {
                    filters.push("AND", ["custrecord_bbss_adv_subpay_milestone","anyof", milestoneId, 12])
                } else {
                    filters.push("AND", ["custrecord_bbss_adv_subpay_milestone","anyof", milestoneId])
                }
                var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
                    type: "customrecord_bbss_adv_sub_pay_schedule",
                    filters: filters,
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_milestone", label: "Milestone"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_action_list", label: "Action"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount", label: "Amount"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount_pct", label: "Amount %"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_item_list", label: "Transaction Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_trans_type", label: "Transaction Type"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_schedule", label: "Payment Schedule"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je_type", label: "Recognition JE Type"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_dealer_item", label: "Dealer Fee Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_milestonedate", label: "Milestone Date"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_transaction", label: "Transaction"}),
                            search.createColumn({name: "custrecord_bb_adv_subpay_already_invoic", label: "Already Invoiced?"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je", label: "Recognition JE"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_project", label: "Project"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_dealer_amount", label: "Dealer Fee Amount"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_trans_total", label: "Transaction Total"})
                        ]
                });
                var searchResultCount = customrecord_bbss_adv_sub_pay_scheduleSearchObj.runPaged().count;
                log.debug("customrecord_bbss_adv_sub_pay_scheduleSearchObj result count",searchResultCount);
                customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().each(function(result) {
                    advRecordsArray.push({
                        id: parseInt(result.getValue({name: 'internalid'})),
                        tranId: parseInt(result.getValue({name: 'custrecord_bbss_adv_subpay_transaction'}))
                    })
                    return true;
                });
            }
            return advRecordsArray;
        }


        function getAdvancedMilestoneScheduleForProjectedRevenueJournals(projectId, packageAction, advParentId, advScheduleCount) {
            var array = [];
            var counter = 0;
            var filters = [["custrecord_bbss_adv_subpay_project","anyof", projectId],
                "AND",
                ["custrecord_bbss_adv_subpay_trans_type","anyof","1"],
                "AND",
                ["custrecord_bbss_adv_subpay_action_list","anyof", packageAction],
                "AND",
                ["custrecord_bbss_adv_subpay_recog_je_type","anyof", "1"],
            ]
            if (advScheduleCount > 1 && advParentId) {
                filters.push("AND", ["custrecord_bbss_adv_subpay_schedule","anyof", advParentId])
            }
            if (projectId && packageAction) {
                var advMilestoneScheduleSearch = search.create({
                    type: "customrecord_bbss_adv_sub_pay_schedule",
                    filters: filters,
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internalid"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_project", label: "Project"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_milestone", label: "Milestone"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount", label: "Amount"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount_pct", label: "Amount %"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_dealer_amount", label: "Dealer Fee Amount"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_action_list", label: "Action"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_item_list", label: "Transaction Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_trans_type", label: "Transaction Type"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je_type", label: "Recognition JE Type"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_dealer_item", label: "Dealer Fee Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_milestonedate", label: "Milestone Date"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_transaction", label: "Transaction"}),
                            search.createColumn({name: "custrecord_bb_adv_subpay_already_invoic", label: "Already Invoiced?"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je", label: "Recognition JE"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_trans_total", label: "Transaction Total"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_schedule", label: "Payment Schedule"}),
                            search.createColumn({name: "subsidiary", join: 'CUSTRECORD_BBSS_ADV_SUBPAY_PROJECT', label: "Subsidiary"})
                        ]
                });
                var start = 0;
                var end = 100;
                var resultSet = advMilestoneScheduleSearch.run();
                var results = resultSet.getRange({
                    start: start,
                    end: end
                });
                for (var i = 0; i < results.length; i++) {
                    var advObj = {};
                    for (var c = 0; c < resultSet.columns.length; c++) {
                        if (!resultSet.columns[c].join) {
                            advObj[resultSet.columns[c].name] = (results[i].getValue({ name: resultSet.columns[c].name })) ? results[i].getValue({ name: resultSet.columns[c].name }) : null;
                        } else {
                            advObj[resultSet.columns[c].name] = (results[i].getValue({ name: resultSet.columns[c].name, join: resultSet.columns[c].join })) ?
                                results[i].getValue({ name: resultSet.columns[c].name, join: resultSet.columns[c].join }) : null;
                        }
                    }
                    array.push(advObj);
                }
            }
            log.debug('projected revenue journal entry process array value', array);
            return array;
        }


        function getAdvancedMilestoneScheduleForPercentComplete(projectId, advParentId) {
            var array = [];
            var counter = 0;
            if (projectId && advParentId) {
                var advMilestoneScheduleSearch = search.create({
                    type: "customrecord_bbss_adv_sub_pay_schedule",
                    filters:
                        [
                            ["custrecord_bbss_adv_subpay_project","anyof", projectId],
                            "AND",
                            ["custrecord_bbss_adv_subpay_schedule","anyof", advParentId]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internalid"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_project", label: "Project"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_milestone", label: "Milestone"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount", label: "Amount"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_amount_pct", label: "Amount %"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_dealer_amount", label: "Dealer Fee Amount"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_action_list", label: "Action"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_item_list", label: "Transaction Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_trans_type", label: "Transaction Type"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je_type", label: "Recognition JE Type"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_dealer_item", label: "Dealer Fee Item"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_milestonedate", label: "Milestone Date"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_transaction", label: "Transaction"}),
                            search.createColumn({name: "custrecord_bb_adv_subpay_already_invoic", label: "Already Invoiced?"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je", label: "Recognition JE"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_trans_total", label: "Transaction Total"}),
                            search.createColumn({name: "custrecord_bbss_adv_subpay_schedule", label: "Payment Schedule"}),
                            search.createColumn({name: "subsidiary", join: 'CUSTRECORD_BBSS_ADV_SUBPAY_PROJECT', label: "Subsidiary"})
                        ]
                });
                var start = 0;
                var end = 100;
                var resultSet = advMilestoneScheduleSearch.run();
                var results = resultSet.getRange({
                    start: start,
                    end: end
                });
                for (var i = 0; i < results.length; i++) {
                    var advObj = {};
                    for (var c = 0; c < resultSet.columns.length; c++) {
                        if (!resultSet.columns[c].join) {
                            advObj[resultSet.columns[c].name] = (results[i].getValue({ name: resultSet.columns[c].name })) ? results[i].getValue({ name: resultSet.columns[c].name }) : null;
                        } else {
                            advObj[resultSet.columns[c].name] = (results[i].getValue({ name: resultSet.columns[c].name, join: resultSet.columns[c].join })) ?
                                results[i].getValue({ name: resultSet.columns[c].name, join: resultSet.columns[c].join }) : null;
                        }
                    }
                    array.push(advObj);
                }
            }
            return array;
        }


        function shouldIncludeDownPayment(paymentScheduleId, milestoneId) {
            log.debug('paymentScheduleId', paymentScheduleId);
            log.debug('milestoneId', milestoneId);
            var includeDownPayment = false;
            var downPaymentRecognized = false;
            var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
                type: "customrecord_bbss_adv_sub_pay_schedule",
                filters:
                    [
                        ["custrecord_bbss_adv_subpay_schedule","anyof", paymentScheduleId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "custrecord_bbss_adv_subpay_milestone",
                            summary: "GROUP",
                            sort: search.Sort.ASC,
                            label: "Milestone"
                        }),
                        search.createColumn({
                            name: "formulanumeric",
                            summary: "GROUP",
                            formula: "{custrecord_bbss_adv_subpay_recog_je.id}"
                        })
                    ]
            });
            customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().each(function(result){
                var milestone = result.getValue({name: 'custrecord_bbss_adv_subpay_milestone', summary: 'GROUP'});
                var recognitionJe = result.getValue({name: 'formulanumeric', summary: 'GROUP', formula: '{custrecord_bbss_adv_subpay_recog_je.id}'});
                log.debug('recognitionJe type of', typeof recognitionJe);
                log.debug('recognitionJe', recognitionJe);
                if (milestone == 12 && isNotNull(recognitionJe)) {
                    downPaymentRecognized = true;
                } else if (milestone == milestoneId && milestone != 12 && !downPaymentRecognized) {
                    includeDownPayment = true;
                }
                return true;
            });
            log.debug('downPaymentRecognized', downPaymentRecognized);
            log.debug('includeDownPayment', includeDownPayment);
            if (!downPaymentRecognized && includeDownPayment) {
                return true;
            } else {
                return false;
            }
        }


        function searchProjectSalesOrder(projectId) {
            var soId = null;
            if (projectId) {
                var salesorderSearchObj = search.create({
                    type: "salesorder",
                    filters:
                        [
                            ["type","anyof","SalesOrd"],
                            "AND",
                            ["mainline","is","T"],
                            "AND",
                            ["custbody_bb_project","anyof", projectId]
                        ],
                    columns:
                        [
                            "internalid"
                        ]
                });
                var searchResultCount = salesorderSearchObj.runPaged().count;
                log.debug("Project Sales Order Record Count",searchResultCount);
                var result = salesorderSearchObj.run().getRange({start:0, end:1});
                if (result.length > 0) {
                    soId = result[0].getValue({name: 'internalid'});
                }
            }
            return soId;
        }


        function checkForExistingTransaction(projectId, milestoneId) {
            var searchResultCount = 0;
            if (projectId && milestoneId) {
                var invoiceSearchObj = search.create({
                    type: "invoice",
                    filters:
                        [
                            ["type","anyof","CustInvc"],
                            "AND",
                            ["custbody_bb_project","anyof", projectId],
                            "AND",
                            ["mainline","is","T"],
                            "AND",
                            ["custbody_bb_milestone","anyof", milestoneId]
                        ],
                    columns:
                        [
                            "internalid"
                        ]
                });
                searchResultCount = invoiceSearchObj.runPaged().count;
                log.debug("invoiceSearchObj result count",searchResultCount);
            }
            return searchResultCount;
        }


        // return all recognizable transactions before deferral process, ids are used to set the recognition JE
        function getReversalTransactions(projectId, milestoneId,  includeDownPayment) {
            var tranArray = [];
            var filters = [];
            filters.push(
                ["posting","is","T"],
                "AND",
                ["formulanumeric: CASE WHEN ({account} IN ({custbody_bbss_configuration.custrecord_bb_proj_shipping_cost_account}, {custbody_bbss_configuration.custrecord_bb_unbilled_ar_account},                         {custbody_bbss_configuration.custrecord_bb_deferred_proj_cost_account}) OR INSTR({custbody_bbss_configuration.custrecord_bb_deferred_revenue_account.id} , {account.id}) >  0 OR INSTR({custbody_bbss_configuration.custrecord_bb_revenue_account.id} , {account.id}) >  0 OR INSTR({custbody_bbss_configuration.custrecord_bb_equipment_costs_account.id} , {account.id}) >  0 OR INSTR({custbody_bbss_configuration.custrecord_bb_direct_labor_cost_account.id} , {account.id}) >  0  OR INSTR({custbody_bbss_configuration.custrecord_bb_ss_outside_labor_cost_acct.id} , {account.id}) > 0) THEN 1 ELSE 0 END","equalto","1"],
                "AND",
                ["type","noneof","Journal"],
                "AND",
                ["formulatext: {customscript}","isnotempty",""],
                "AND",
                ["custbody_bb_project","anyof", projectId],
                "AND",
                ["accounttype","noneof","DeferRevenue","DeferExpense"]
            );
            if (includeDownPayment) {
                filters.push("AND", ["custbody_bb_milestone","anyof", milestoneId, 12]);
            } else {
                filters.push("AND", ["custbody_bb_milestone","anyof", milestoneId]);
            }
            if (projectId) {
                var transactionSearchObj = search.create({
                    type: "transaction",
                    filters: filters,
                    columns:
                        [
                            search.createColumn({
                                name: "amount",
                                summary: "SUM",
                                label: "Amount"
                            }),
                            search.createColumn({
                                name: "internalid",
                                summary: "GROUP",
                                label: "Internal ID"
                            }),
                            search.createColumn({
                                name: "datecreated",
                                summary: "GROUP",
                                label: "Date Created"
                            }),
                            search.createColumn({
                                name: "type",
                                summary: "GROUP",
                                label: "Type"
                            })
                        ]
                });
                var searchResultCount = transactionSearchObj.runPaged().count;
                log.debug("transactionSearchObj result count",searchResultCount);
                transactionSearchObj.run().each(function(result){
                    var tranId = parseInt(result.getValue({name: 'internalid', summary: 'GROUP'}));
                    var tranType = result.getValue({name: 'type', summary: 'GROUP'})
                    tranArray.push({
                        tranId: tranId,
                        tranType: tranType
                    });
                    return true;
                });
            }
            return tranArray;
        }


        function percentCompleteFinalJeCheck(projectId, advChildId) {
            var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
                type: "customrecord_bbss_adv_sub_pay_schedule",
                filters:
                    [
                        ["custrecord_bbss_adv_subpay_project","anyof", projectId],
                        "AND",
                        ["custrecord_bbss_adv_subpay_trans_type","anyof","1"],
                        "AND",
                        ["custrecord_bbss_adv_subpay_transaction","anyof","@NONE@"]
                    ],
                columns:
                    [
                        search.createColumn({name: "internalid", label: "ID"})
                    ]
            });
            var searchResultCount = customrecord_bbss_adv_sub_pay_scheduleSearchObj.runPaged().count;
            log.debug("customrecord_bbss_adv_sub_pay_scheduleSearchObj result count",searchResultCount);
            customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().each(function(result) {
                var advChildRecordId = result.getValue({name: 'internalid'});
                if (advChildRecordId == advChildId && searchResultCount == 1) {
                    searchResultCount = 0;
                }
            })
            return searchResultCount;
        }


        function isNotNull(param) {
            return param != null && param != '' && param != undefined;
        }


        function getAdvPaymentScheduleTotal(projectId) {
            var total = 0;
            if (projectId) {
                var customrecord_bbss_adv_payment_scheduleSearchObj = search.create({
                    type: "customrecord_bbss_adv_payment_schedule",
                    filters:
                        [
                            ["custrecord_bbss_advpay_project_list","anyof", projectId]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "custrecord_bbss_advpay_amount",
                                summary: "SUM",
                                label: "Amount"
                            })
                        ]
                });
                var searchResultCount = customrecord_bbss_adv_payment_scheduleSearchObj.runPaged().count;
                log.debug("customrecord_bbss_adv_payment_scheduleSearchObj result count",searchResultCount);
                customrecord_bbss_adv_payment_scheduleSearchObj.run().each(function(result){
                    var sumTotal = result.getValue({name: 'custrecord_bbss_advpay_amount', summary: 'SUM'})
                    total = (sumTotal) ? total + sumTotal : total + 0;
                    return true;
                });
            }
            return total;
        }


        function getAdvPaymentScheduleRecordCount(projectId) {
            var total = 0;
            if (projectId) {
                var customrecord_bbss_adv_payment_scheduleSearchObj = search.create({
                    type: "customrecord_bbss_adv_payment_schedule",
                    filters:
                        [
                            ["custrecord_bbss_advpay_project_list","anyof", projectId]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "internalid",
                                label: "internalid"
                            })
                        ]
                });
                total = customrecord_bbss_adv_payment_scheduleSearchObj.runPaged().count;
                log.debug("customrecord_bbss_adv_payment_scheduleSearchObj result count", total);
            }
            return total;
        }


        function getAlreadyGeneratedInvoiceTotals(projectId) {
            var alreadyInvoicedAmt = 0;
            if (projectId) {
                var transactionSearchObj = search.create({
                    type: "transaction",
                    filters:
                        [
                            ["custbody_bb_project", "anyof", projectId],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["type", "anyof", "CustCred", "CustInvc"],
                            "AND",
                            ["custbody_bb_milestone", "anyof", "1", "3", "4", "5", "6", "8", "9", "10", "11", "12", "13"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "amount",
                                summary: "SUM",
                                label: "Amount"
                            })
                        ]
                });
                var searchResultCount = transactionSearchObj.runPaged().count;
                log.debug("transactionSearchObj result count", searchResultCount);
                var result = transactionSearchObj.run().getRange({start:0, end:1});
                if (result.length > 0) {
                    if (isNotNull(result[0].getValue({name: 'amount', summary: "SUM"}))) {
                        alreadyInvoicedAmt = result[0].getValue({name: 'amount', summary: "SUM"});
                    }
                }
            }
            log.audit('already invoiced amount from transactions', alreadyInvoicedAmt);
            return alreadyInvoicedAmt;
        }


        function checkForLastMilestoneRecord(advParentId, milestoneId) {
            var canProcess = false;
            if (advParentId && milestoneId) {
                var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
                    type: "customrecord_bbss_adv_sub_pay_schedule",
                    filters:
                        [
                            ["isinactive", "is", "F"],
                            "AND",
                            ["custrecord_bbss_adv_subpay_milestone", "anyof", "1", "3", "4", "5", "6", "8", "9", "10", "11", "12", "13"],
                            "AND",
                            ["custrecord_bbss_adv_subpay_schedule", "anyof", advParentId]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "custrecord_bbss_adv_subpay_milestone",
//mlm changed this code start
                                //sort: search.Sort.DESC,
                                sort: search.Sort.ASC,
//mlm end
                                label: "Milestone"
                            })
                        ]
                });
                var searchResultCount = customrecord_bbss_adv_sub_pay_scheduleSearchObj.runPaged().count;
                log.debug("customrecord_bbss_adv_sub_pay_scheduleSearchObj result count", searchResultCount);
                var result = customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().getRange({start: 0, end: 1});
                if (result.length > 0) {
                    //mlm TESTING
                    var testingXX = result[0].getValue({name: 'custrecord_bbss_adv_subpay_milestone'});
                    log.debug('testingXX', testingXX);

                    if (result[0].getValue({name: 'custrecord_bbss_adv_subpay_milestone'}) == milestoneId) {
                        canProcess = true
                    }
                }
            }
            log.debug('leaving checkForLastMilestoneRecord', canProcess);
            return canProcess;
        }


        return {
            createMilestones: createMilestones,
            headerCalculations: headerCalculations,
            getAdvPaymentScheduleTransactionToProcessFromRecord: getAdvPaymentScheduleTransactionToProcessFromRecord,
            createAdvancedMilestoneTransaction: createAdvancedMilestoneTransaction,
            getAdvPaymentScheduleTransactionToProcessFromProjectAction: getAdvPaymentScheduleTransactionToProcessFromProjectAction,
            getReversalTransactions: getReversalTransactions,
            createMilestoneFromProjectAutomation: createMilestoneFromProjectAutomation,
            getAdvPaymentScheduleTotal: getAdvPaymentScheduleTotal,
            getAdvPaymentScheduleRecordCount: getAdvPaymentScheduleRecordCount,
            getAdvPaymentScheduleTransactionToProcessFromAdvMilestoneRecord: getAdvPaymentScheduleTransactionToProcessFromAdvMilestoneRecord
        }
    });