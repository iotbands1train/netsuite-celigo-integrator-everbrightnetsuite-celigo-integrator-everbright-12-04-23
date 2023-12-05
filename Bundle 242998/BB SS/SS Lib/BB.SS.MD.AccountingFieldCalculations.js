/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Matt Lehman
 * @version 0.1.3
 * @fileOverview This Custom Module library is used with projects to get
 * accounting tab field calculations
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

define (['N/record', 'N/search', './BB_SS_MD_SolarConfig'], function(record, search, solarConfig) {

    EPC_ROLE = {
        'INSTALLER': 1,
        'ORIGINATOR': 2
    };

    /**
     * Calculates the Rebate Variance Amount Field
     *
     * @param project - NS project record
     * @returns - value of reabte variance field
     */
    function getRebateVariance(project, projectDataObj) {
        var rebateAppAmt = (project.getValue('custentity_bb_rebate_application_amount')) ? project.getValue('custentity_bb_rebate_application_amount') :
            ((projectDataObj.custentity_bb_rebate_application_amount) ? parseFloat(projectDataObj.custentity_bb_rebate_application_amount) : 0);

        var rebateConfAmt = (project.getValue('custentity_bb_rebate_confirmation_amount')) ? project.getValue('custentity_bb_rebate_confirmation_amount') :
            ((projectDataObj.custentity_bb_rebate_confirmation_amount) ? parseFloat(projectDataObj.custentity_bb_rebate_confirmation_amount) : 0);

        return parseFloat(rebateAppAmt - rebateConfAmt).toFixed(2);
    }



    /**
     * Calculates Financier Total Fees Field
     *
     * @param project - NS Project record
     * @returns - value of Financier Total Fees Field
     */
    function getFinancierTotalFees(project, projectDataObj) {
        var finBaseFeesAmt = (project.getValue('custentity_bb_fin_base_fees_amount')) ?
            parseFloat(project.getValue('custentity_bb_fin_base_fees_amount')) : ((projectDataObj.custentity_bb_fin_base_fees_amount) ?
                parseFloat(projectDataObj.custentity_bb_fin_base_fees_amount) : 0.00);

        var finMonitorFeeAmt = (project.getValue('custentity_bb_fin_monitoring_fee_amount')) ? parseFloat(project.getValue('custentity_bb_fin_monitoring_fee_amount').toFixed(2)) :
            ((projectDataObj.custentity_bb_fin_monitoring_fee_amount) ? parseFloat(projectDataObj.custentity_bb_fin_monitoring_fee_amount) : 0.00);

        return parseFloat(finBaseFeesAmt + finMonitorFeeAmt).toFixed(2);
    }



    /**
     * Calculates the Financier total Invoice Amount Field
     *
     * @param project - NS Project Record
     * @returns - value of the Financier total Invoice Amount Field
     */
    function getFinancierTotalInvoiceAmount(project, projectDataObj) {
        var PROJECT_TYPE = getBBConfigProjectType();
        var projType = (project.getValue('jobtype')) ? project.getValue('jobtype') : ((projectDataObj.jobtype) ? projectDataObj.jobtype : null);

        var finPrelimPurchPriceAmt = (project.getValue('custentity_bb_fin_prelim_purch_price_amt')) ? project.getValue('custentity_bb_fin_prelim_purch_price_amt') :
            ((projectDataObj.custentity_bb_fin_prelim_purch_price_amt) ? parseFloat(projectDataObj.custentity_bb_fin_prelim_purch_price_amt) : 0.00);

        var finBaseFeeAmt = (project.getValue('custentity_bb_fin_base_fees_amount')) ? project.getValue('custentity_bb_fin_base_fees_amount') :
            ((projectDataObj.custentity_bb_fin_base_fees_amount) ? parseFloat(projectDataObj.custentity_bb_fin_base_fees_amount) : 0.00);

        var finMonitorFeeAmt = (project.getValue('custentity_bb_fin_monitoring_fee_amount')) ? project.getValue('custentity_bb_fin_monitoring_fee_amount') :
            ((projectDataObj.custentity_bb_fin_monitoring_fee_amount) ? parseFloat(projectDataObj.custentity_bb_fin_monitoring_fee_amount) : 0.00);

        var finOwnedEquipCostAmt = (project.getValue('custentity_bb_fin_owned_equip_costs_amt')) ? project.getValue('custentity_bb_fin_owned_equip_costs_amt') :
            ((projectDataObj.custentity_bb_fin_owned_equip_costs_amt) ? parseFloat(projectDataObj.custentity_bb_fin_owned_equip_costs_amt) : 0.00);


        if (projType == PROJECT_TYPE.FULL_SERVICE) {
            return parseFloat(finPrelimPurchPriceAmt - finBaseFeeAmt - finMonitorFeeAmt).toFixed(2);
        } else {
            return parseFloat(finPrelimPurchPriceAmt - finBaseFeeAmt - finMonitorFeeAmt - finOwnedEquipCostAmt).toFixed(2);
        }

    }

    function getSchedulePresetMilestoneAmounts(scheduleId) {
        if (scheduleId) {
            var searchObj = search.lookupFields({
                type: 'customrecord_bb_milestone_pay_schedule',
                id: scheduleId,
                columns: ['custrecord_bb_m0_amount', 'custrecord_bb_m1_amount', 'custrecord_bb_m2_amount', 'custrecord_bb_m3_amount',
                    'custrecord_bb_m4_amount', 'custrecord_bb_m5_amount', 'custrecord_bb_m6_amount', 'custrecord_bb_m7_amount']
            });
            if (searchObj) {
                return {
                    m0Amount: (searchObj.custrecord_bb_m0_amount) ? searchObj.custrecord_bb_m0_amount : 0.00,
                    m1Amount: (searchObj.custrecord_bb_m1_amount) ? searchObj.custrecord_bb_m1_amount : 0.00,
                    m2Amount: (searchObj.custrecord_bb_m2_amount) ? searchObj.custrecord_bb_m2_amount : 0.00,
                    m3Amount: (searchObj.custrecord_bb_m3_amount) ? searchObj.custrecord_bb_m3_amount : 0.00,
                    m4Amount: (searchObj.custrecord_bb_m4_amount) ? searchObj.custrecord_bb_m4_amount : 0.00,
                    m5Amount: (searchObj.custrecord_bb_m5_amount) ? searchObj.custrecord_bb_m5_amount : 0.00,
                    m6Amount: (searchObj.custrecord_bb_m6_amount) ? searchObj.custrecord_bb_m6_amount : 0.00,
                    m7Amount: (searchObj.custrecord_bb_m7_amount) ? searchObj.custrecord_bb_m7_amount : 0.00
                }
            }
        }
    }

    function getScheduleData(scheduleId) {
        var downPayment, m0Amount, m1Amount, m2Amount, m3Amount, m4Amount,m5Amount, m6Amount, m7Amount, downPaymentMilestoneName, rebateMilestoneName,  deductFromAllMilestones;
        if (scheduleId) {
            var lookup = search.lookupFields({
                type: 'customrecord_bb_milestone_pay_schedule',
                id: scheduleId,
                columns: ['custrecord_bb_mps_down_payment_amount', 'custrecord_bb_down_payment_milestone', 'custrecord_bb_down_payment_all_milestone', 'custrecord_bb_m0_amount',
                    'custrecord_bb_m1_amount', 'custrecord_bb_m2_amount', 'custrecord_bb_m3_amount','custrecord_bb_m4_amount',
                    'custrecord_bb_m5_amount', 'custrecord_bb_m6_amount', 'custrecord_bb_m7_amount', 'custrecord_bb_dedct_rebate_frm_milestone']
            });

            downPayment = lookup.custrecord_bb_mps_down_payment_amount;

            m0Amount = (lookup.custrecord_bb_m0_amount > 0) ? lookup.custrecord_bb_m0_amount : 0.00;
            m1Amount = (lookup.custrecord_bb_m1_amount > 0) ? lookup.custrecord_bb_m1_amount : 0.00;
            m2Amount = (lookup.custrecord_bb_m2_amount > 0) ? lookup.custrecord_bb_m2_amount : 0.00;
            m3Amount = (lookup.custrecord_bb_m3_amount > 0) ? lookup.custrecord_bb_m3_amount : 0.00;
            m4Amount = (lookup.custrecord_bb_m4_amount > 0) ? lookup.custrecord_bb_m4_amount : 0.00;
            m5Amount = (lookup.custrecord_bb_m5_amount > 0) ? lookup.custrecord_bb_m5_amount : 0.00;
            m6Amount = (lookup.custrecord_bb_m6_amount > 0) ? lookup.custrecord_bb_m6_amount : 0.00;
            m7Amount = (lookup.custrecord_bb_m7_amount > 0) ? lookup.custrecord_bb_m7_amount : 0.00;

            if (lookup.custrecord_bb_down_payment_milestone.length > 0) {
                downPaymentMilestoneName = lookup.custrecord_bb_down_payment_milestone[0].text
            } else {
                downPaymentMilestoneName = null;
            }
            if (lookup.custrecord_bb_dedct_rebate_frm_milestone.length > 0) {
                rebateMilestoneName = lookup.custrecord_bb_dedct_rebate_frm_milestone[0].text
            }
            deductFromAllMilestones = lookup.custrecord_bb_down_payment_all_milestone;

            return {
                downPayment: downPayment,
                downPaymentMilestoneName: downPaymentMilestoneName,
                deductFromAllMilestones: deductFromAllMilestones,
                rebateMilestoneName: rebateMilestoneName,
                m0Amount: m0Amount,
                m1Amount: m1Amount,
                m2Amount: m2Amount,
                m3Amount: m3Amount,
                m4Amount: m4Amount,
                m5Amount: m5Amount,
                m6Amount: m6Amount,
                m7Amount: m7Amount
            }
        }
    }

    /**
     * Calculates Financier M0 Invoice Amount
     *
     * @param project - NS Project Record
     * @returns - Financier M0 Invoice Amount
     */
    function getFinancierM0InvoiceAmount(project, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj) {
        var rebateAmt = 0;
        var rebateConfirmationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'}) :
            ((projectDataObj.custentity_bb_rebate_confirmation_amount) ? projectDataObj.custentity_bb_rebate_confirmation_amount : 0);

        var rebateApplicationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_application_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_application_amount'}) :
            ((projectDataObj.custentity_bb_rebate_application_amount) ? projectDataObj.custentity_bb_rebate_application_amount : 0);

        if (rebateConfirmationAmt) {
            rebateAmt = rebateConfirmationAmt;
        } else if (rebateApplicationAmt) {
            rebateAmt = rebateApplicationAmt;
        }

        var rebateAssignee = project.getValue({fieldId: 'custentity_bb_rebate_assignee'});
        var deductRebateAllMilestones = project.getValue({fieldId: 'custentity_bb_dedct_rebate_all_milestone'});

        var finM0InvoicePer = (project.getValue('custentity_bb_fin_m0_invoice_percent')) ? project.getValue('custentity_bb_fin_m0_invoice_percent') / 100 :
            ((projectDataObj.custentity_bb_fin_m0_invoice_percent) ? parseFloat(projectDataObj.custentity_bb_fin_m0_invoice_percent) / 100 : 0);

        var totalContractValue = (project.getValue('custentity_bb_total_contract_value_amt')) ? project.getValue('custentity_bb_total_contract_value_amt') :
            ((projectDataObj.custentity_bb_total_contract_value_amt) ? parseFloat(projectDataObj.custentity_bb_total_contract_value_amt) : 0.00);

        downPayment = (downPayment) ? downPayment : ((projectDataObj.finDownPayment) ? projectDataObj.finDownPayment : null);
        downPaymentMilestoneName = (downPaymentMilestoneName) ? downPaymentMilestoneName : ((projectDataObj.finDownPaymentMilestoneName) ? projectDataObj.finDownPaymentMilestoneName : null);

        var deductFromAllMilestones = project.getValue({fieldId: 'custentity_bb_down_payment_all_milestone'});
        // log.debug('downpayment amount m0', downPayment);
        // log.debug('downpayment name m0', downPaymentMilestoneName);
        if (!customFinTotals) {
            if (deductFromAllMilestones && downPayment) {

                return downPayment;
            } else if (downPayment && downPaymentMilestoneName && !deductFromAllMilestones) {

                return downPayment;

            } else if (rebateAssignee == 3 && rebateAmt && scheduleAmounts.rebateMilestoneName == 'M0') {
                // subtract rebate amount from the calculation of M0
                return (parseFloat(finM0InvoicePer * totalContractValue).toFixed(2)) - parseFloat(rebateAmt);
            } else if (rebateAssignee == 3 && rebateAmt && !scheduleAmounts.rebateMilestoneName && deductRebateAllMilestones) {
                return parseFloat((totalContractValue - parseFloat(rebateAmt)) * finM0InvoicePer).toFixed(2);
            } else if (scheduleAmounts) {

                if (scheduleAmounts.m0Amount > 0) {
                    return scheduleAmounts.m0Amount;
                } else {
                    var updatedContractValue = totalContractValue - scheduleAmounts.m7Amount - scheduleAmounts.m6Amount - scheduleAmounts.m5Amount - scheduleAmounts.m4Amount -
                        scheduleAmounts.m3Amount - scheduleAmounts.m2Amount - scheduleAmounts.m1Amount - scheduleAmounts.m0Amount;
                    return parseFloat(updatedContractValue * finM0InvoicePer).toFixed(2);
                }

            } else {
                return parseFloat(finM0InvoicePer * totalContractValue).toFixed(2);
            }
        } else {
            return project.getValue({fieldId: 'custentity_bb_fin_m0_invoice_amount'});
        }
    }



    /**
     * Calculates Financier M1 Invoice Amount
     *
     * @param project - NS Project Record
     * @returns - value of the Financier M1 Invoice Amount
     */
    function getFinancierM1InvoiceAmount(project, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj) {
        var rebateAmt = 0;
        var rebateConfirmationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'}) :
            ((projectDataObj.custentity_bb_rebate_confirmation_amount) ? projectDataObj.custentity_bb_rebate_confirmation_amount : 0);

        var rebateApplicationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_application_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_application_amount'}) :
            ((projectDataObj.custentity_bb_rebate_application_amount) ? projectDataObj.custentity_bb_rebate_application_amount : 0);

        if (rebateConfirmationAmt) {
            rebateAmt = rebateConfirmationAmt;
        } else if (rebateApplicationAmt) {
            rebateAmt = rebateApplicationAmt;
        }

        var rebateAssignee = project.getValue({fieldId: 'custentity_bb_rebate_assignee'});
        var deductRebateAllMilestones = project.getValue({fieldId: 'custentity_bb_dedct_rebate_all_milestone'});
        var PROJECT_TYPE = getBBConfigProjectType();
        var projType = (project.getValue('jobtype')) ? project.getValue('jobtype') : ((projectDataObj.jobtype) ? projectDataObj.jobtype : null);

        var finM1InvoicePer = (project.getValue('custentity_bb_fin_m1_invoice_percent')) ? project.getValue('custentity_bb_fin_m1_invoice_percent') / 100 :
            ((projectDataObj.custentity_bb_fin_m1_invoice_percent) ? parseFloat(projectDataObj.custentity_bb_fin_m1_invoice_percent) / 100 : 0);

        var totalContractValue = (project.getValue('custentity_bb_total_contract_value_amt')) ? project.getValue('custentity_bb_total_contract_value_amt') :
            ((projectDataObj.custentity_bb_total_contract_value_amt) ? parseFloat(projectDataObj.custentity_bb_total_contract_value_amt) : 0.00);

        var finOwnedEquipCostAmt = (project.getValue('custentity_bb_fin_owned_equip_costs_amt')) ? project.getValue('custentity_bb_fin_owned_equip_costs_amt') :
            ((projectDataObj.custentity_bb_fin_owned_equip_costs_amt) ? parseFloat(projectDataObj.custentity_bb_fin_owned_equip_costs_amt) : 0.00);

        var finTotalFeesAmt = (project.getValue('custentity_bb_fin_total_fees_amount')) ? project.getValue('custentity_bb_fin_total_fees_amount') :
            ((projectDataObj.custentity_bb_fin_total_fees_amount) ? parseFloat(projectDataObj.custentity_bb_fin_total_fees_amount) : 0.00);

        var finM1InvoiceAmt = 0;

        downPayment = (downPayment) ? downPayment : ((projectDataObj.finDownPayment) ? projectDataObj.finDownPayment : null);
        downPaymentMilestoneName = (downPaymentMilestoneName) ? downPaymentMilestoneName : ((projectDataObj.finDownPaymentMilestoneName) ? projectDataObj.finDownPaymentMilestoneName : null);

        log.debug('downPayment amount m1', downPayment);
        log.debug('downPayment name m1', downPaymentMilestoneName);
        var deductFromAllMilestones = project.getValue({fieldId: 'custentity_bb_down_payment_all_milestone'});
        if (!customFinTotals) {
            if (deductFromAllMilestones && downPayment) {
                return parseFloat((totalContractValue - parseFloat(downPayment)) * finM1InvoicePer).toFixed(2);
            } else if (downPayment && downPaymentMilestoneName == 'M1' && !deductFromAllMilestones) {
                if (projType == PROJECT_TYPE.FULL_SERVICE) {
                    log.debug('setting m1 amount per full service project type');
                    return (finM1InvoicePer * totalContractValue) - finOwnedEquipCostAmt - finTotalFeesAmt - downPayment;
                } else {
                    log.debug('setting m1 amount when project type is not full service');
                    return (finM1InvoicePer * totalContractValue) - downPayment;
                }

            } else if (rebateAssignee == 3 && rebateAmt && scheduleAmounts.rebateMilestoneName == 'M1') {
                return (parseFloat(finM1InvoicePer * totalContractValue).toFixed(2)) - parseFloat(rebateAmt);
            } else if (rebateAssignee == 3 && rebateAmt && !scheduleAmounts.rebateMilestoneName && deductRebateAllMilestones) {
                return parseFloat((totalContractValue - parseFloat(rebateAmt)) * finM1InvoicePer).toFixed(2);
            } else if (scheduleAmounts) {

                if (scheduleAmounts.m1Amount > 0) {
                    log.debug('setting m1 amount when pre set from milestone schedule record');
                    return scheduleAmounts.m1Amount;
                } else {
                    log.debug('setting m1 amount when the schedule amount is not pre set');
                    var updatedContractValue = totalContractValue - scheduleAmounts.m7Amount - scheduleAmounts.m6Amount - scheduleAmounts.m5Amount - scheduleAmounts.m4Amount -
                        scheduleAmounts.m3Amount - scheduleAmounts.m2Amount - scheduleAmounts.m1Amount - scheduleAmounts.m0Amount;
                    var m1Amount = (projType == PROJECT_TYPE.FULL_SERVICE) ? (updatedContractValue * finM1InvoicePer) - finOwnedEquipCostAmt - finTotalFeesAmt : updatedContractValue * finM1InvoicePer;
                    return m1Amount;
                }

            } else {
                return parseFloat(finM1InvoicePer * totalContractValue).toFixed(2);
            }
        } else {
            return project.getValue({fieldId: 'custentity_bb_fin_m1_invoice_amount'});
        }
    }



    /**
     * Calculates Financier M2 Invoice Amount
     *
     * @param project - NS Project Record
     * @returns - the vale of the Financier M2 Invoice Amount
     */
    function getFinancierM2InvoiceAmount(project, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj) {
        var rebateAmt = 0;
        var rebateConfirmationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'}) :
            ((projectDataObj.custentity_bb_rebate_confirmation_amount) ? projectDataObj.custentity_bb_rebate_confirmation_amount : 0);

        var rebateApplicationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_application_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_application_amount'}) :
            ((projectDataObj.custentity_bb_rebate_application_amount) ? projectDataObj.custentity_bb_rebate_application_amount : 0);

        if (rebateConfirmationAmt) {
            rebateAmt = rebateConfirmationAmt;
        } else if (rebateApplicationAmt) {
            rebateAmt = rebateApplicationAmt;
        }
        var rebateAssignee = project.getValue({fieldId: 'custentity_bb_rebate_assignee'});
        var deductRebateAllMilestones = project.getValue({fieldId: 'custentity_bb_dedct_rebate_all_milestone'});
        var deductFromAllMilestones = project.getValue({fieldId: 'custentity_bb_down_payment_all_milestone'});
        var finM2InvoicePer = (project.getValue('custentity_bb_fin_m2_invoice_percent')) ?  project.getValue('custentity_bb_fin_m2_invoice_percent')/ 100 :
            ((projectDataObj.custentity_bb_fin_m2_invoice_percent) ? parseFloat(projectDataObj.custentity_bb_fin_m2_invoice_percent) / 100 : 0);

        var totalContractValue = (project.getValue('custentity_bb_total_contract_value_amt')) ? project.getValue('custentity_bb_total_contract_value_amt') :
            ((projectDataObj.custentity_bb_total_contract_value_amt) ? parseFloat(projectDataObj.custentity_bb_total_contract_value_amt) : 0.00);

        downPayment = (downPayment) ? downPayment : ((projectDataObj.finDownPayment) ? projectDataObj.finDownPayment : null);
        downPaymentMilestoneName = (downPaymentMilestoneName) ? downPaymentMilestoneName : ((projectDataObj.finDownPaymentMilestoneName) ? projectDataObj.finDownPaymentMilestoneName : null);

        // log.debug('downpayment amount m2', downPayment);
        // log.debug('downpayment name m2', downPaymentMilestoneName);
        if (!customFinTotals) {
            if (deductFromAllMilestones && downPayment) {
                return parseFloat((totalContractValue - parseFloat(downPayment)) * finM2InvoicePer).toFixed(2);
            } else if (downPayment && downPaymentMilestoneName == 'M2' && !deductFromAllMilestones) {

                return (finM2InvoicePer * totalContractValue) - downPayment;

            } else if (rebateAssignee == 3 && rebateAmt && scheduleAmounts.rebateMilestoneName == 'M2') {
                return (parseFloat(finM2InvoicePer * totalContractValue).toFixed(2)) - parseFloat(rebateAmt);
            } else if (rebateAssignee == 3 && rebateAmt && !scheduleAmounts.rebateMilestoneName && deductRebateAllMilestones) {
                return parseFloat((totalContractValue - parseFloat(rebateAmt)) * finM2InvoicePer).toFixed(2);
            } else if (scheduleAmounts) {

                if (scheduleAmounts.m2Amount > 0) {
                    return scheduleAmounts.m2Amount;
                } else {
                    var updatedContractValue = totalContractValue - scheduleAmounts.m7Amount - scheduleAmounts.m6Amount - scheduleAmounts.m5Amount - scheduleAmounts.m4Amount -
                        scheduleAmounts.m3Amount - scheduleAmounts.m2Amount - scheduleAmounts.m1Amount - scheduleAmounts.m0Amount;
                    return parseFloat(updatedContractValue * finM2InvoicePer).toFixed(2);
                }

            } else {
                return parseFloat(finM2InvoicePer * totalContractValue).toFixed(2);
            }
        } else {
            return project.getValue({fieldId: 'custentity_bb_fin_m2_invoice_amount'});
        }
    }



    /**
     * Calculate Financier M3 Invoice Amount
     *
     * @param project - NS Project Record
     * @returns - Financier M3 Invoice Amount
     */
    function getFinancierM3InvoiceAmount(project, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj) {
        var rebateAmt = 0;
        var rebateConfirmationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'}) :
            ((projectDataObj.custentity_bb_rebate_confirmation_amount) ? projectDataObj.custentity_bb_rebate_confirmation_amount : 0);

        var rebateApplicationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_application_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_application_amount'}) :
            ((projectDataObj.custentity_bb_rebate_application_amount) ? projectDataObj.custentity_bb_rebate_application_amount : 0);

        if (rebateConfirmationAmt) {
            rebateAmt = rebateConfirmationAmt;
        } else if (rebateApplicationAmt) {
            rebateAmt = rebateApplicationAmt;
        }
        var rebateAssignee = project.getValue({fieldId: 'custentity_bb_rebate_assignee'});
        var deductRebateAllMilestones = project.getValue({fieldId: 'custentity_bb_dedct_rebate_all_milestone'});
        var deductFromAllMilestones = project.getValue({fieldId: 'custentity_bb_down_payment_all_milestone'});
        var finM3InvoicePer = (project.getValue('custentity_bb_fin_m3_invoice_percent')) ? project.getValue('custentity_bb_fin_m3_invoice_percent') / 100 :
            ((projectDataObj.custentity_bb_fin_m3_invoice_percent) ? parseFloat(projectDataObj.custentity_bb_fin_m3_invoice_percent) / 100 : 0);

        var totalContractValue = (project.getValue('custentity_bb_total_contract_value_amt')) ? project.getValue('custentity_bb_total_contract_value_amt') :
            ((projectDataObj.custentity_bb_total_contract_value_amt) ? parseFloat(projectDataObj.custentity_bb_total_contract_value_amt) : 0.00);

        downPayment = (downPayment) ? downPayment : ((projectDataObj.finDownPayment) ? projectDataObj.finDownPayment : null);
        downPaymentMilestoneName = (downPaymentMilestoneName) ? downPaymentMilestoneName : ((projectDataObj.finDownPaymentMilestoneName) ? projectDataObj.finDownPaymentMilestoneName : null);

        // log.debug('downpayment amount m3', downPayment);
        // log.debug('downpayment name m3', downPaymentMilestoneName);
        if (!customFinTotals) {
            if (deductFromAllMilestones && downPayment) {
                return parseFloat((totalContractValue - parseFloat(downPayment)) * finM3InvoicePer).toFixed(2);
            } else if (downPayment && downPaymentMilestoneName == 'M3' && !deductFromAllMilestones) {

                return (finM3InvoicePer * totalContractValue) - downPayment;

            } else if (rebateAssignee == 3 && rebateAmt && scheduleAmounts.rebateMilestoneName == 'M3') {
                return (parseFloat(finM3InvoicePer * totalContractValue).toFixed(2)) - parseFloat(rebateAmt);
            } else if (rebateAssignee == 3 && rebateAmt && !scheduleAmounts.rebateMilestoneName && deductRebateAllMilestones) {
                return parseFloat((totalContractValue - parseFloat(rebateAmt)) * finM3InvoicePer).toFixed(2);
            } else if (scheduleAmounts) {

                if (scheduleAmounts.m3Amount > 0) {
                    return scheduleAmounts.m3Amount;
                } else {
                    var updatedContractValue = totalContractValue - scheduleAmounts.m7Amount - scheduleAmounts.m6Amount - scheduleAmounts.m5Amount - scheduleAmounts.m4Amount -
                        scheduleAmounts.m3Amount - scheduleAmounts.m2Amount - scheduleAmounts.m1Amount - scheduleAmounts.m0Amount;
                    return parseFloat(updatedContractValue * finM3InvoicePer).toFixed(2);
                }

            } else {
                return parseFloat(finM3InvoicePer * totalContractValue).toFixed(2)
            }
        } else {
            return project.getValue({fieldId: 'custentity_bb_fin_m3_invoice_amount'});
        }

    }


    /**
     * Calculate Financier M4 Invoice Amount
     *
     * @param project - NS Project Record
     * @returns - Financier M4 Invoice Amount
     */
    function getFinancierM4InvoiceAmount(project, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj) {
        var rebateAmt = 0;
        var rebateConfirmationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'}) :
            ((projectDataObj.custentity_bb_rebate_confirmation_amount) ? projectDataObj.custentity_bb_rebate_confirmation_amount : 0);

        var rebateApplicationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_application_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_application_amount'}) :
            ((projectDataObj.custentity_bb_rebate_application_amount) ? projectDataObj.custentity_bb_rebate_application_amount : 0);

        if (rebateConfirmationAmt) {
            rebateAmt = rebateConfirmationAmt;
        } else if (rebateApplicationAmt) {
            rebateAmt = rebateApplicationAmt;
        }
        var rebateAssignee = project.getValue({fieldId: 'custentity_bb_rebate_assignee'});
        var deductRebateAllMilestones = project.getValue({fieldId: 'custentity_bb_dedct_rebate_all_milestone'});
        var deductFromAllMilestones = project.getValue({fieldId: 'custentity_bb_down_payment_all_milestone'});
        var finM4InvoicePer = (project.getValue('custentity_bb_fin_m4_invoice_percent')) ? project.getValue('custentity_bb_fin_m4_invoice_percent') / 100 :
            ((projectDataObj.custentity_bb_fin_m4_invoice_percent) ? parseFloat(projectDataObj.custentity_bb_fin_m4_invoice_percent) / 100 : 0);

        var totalContractValue = (project.getValue('custentity_bb_total_contract_value_amt')) ? project.getValue('custentity_bb_total_contract_value_amt') :
            ((projectDataObj.custentity_bb_total_contract_value_amt) ? parseFloat(projectDataObj.custentity_bb_total_contract_value_amt) : 0.00);

        downPayment = (downPayment) ? downPayment : ((projectDataObj.finDownPayment) ? projectDataObj.finDownPayment : null);
        downPaymentMilestoneName = (downPaymentMilestoneName) ? downPaymentMilestoneName : ((projectDataObj.finDownPaymentMilestoneName) ? projectDataObj.finDownPaymentMilestoneName : null);

        // log.debug('downpayment amount m4', downPayment);
        // log.debug('downpayment name m4', downPaymentMilestoneName);
        if (!customFinTotals) {
            if (deductFromAllMilestones && downPayment) {
                return parseFloat((totalContractValue - parseFloat(downPayment)) * finM4InvoicePer).toFixed(2);
            } else if (downPayment && downPaymentMilestoneName == 'M4' && !deductFromAllMilestones) {

                return (finM4InvoicePer * totalContractValue) - downPayment;

            } else if (rebateAssignee == 3 && rebateAmt && scheduleAmounts.rebateMilestoneName == 'M4') {
                return (parseFloat(finM4InvoicePer * totalContractValue).toFixed(2)) - parseFloat(rebateAmt);
            } else if (rebateAssignee == 3 && rebateAmt && !scheduleAmounts.rebateMilestoneName && deductRebateAllMilestones) {
                return parseFloat((totalContractValue - parseFloat(rebateAmt)) * finM4InvoicePer).toFixed(2);
            } else if (scheduleAmounts) {

                if (scheduleAmounts.m4Amount > 0) {
                    return scheduleAmounts.m4Amount;
                } else {
                    var updatedContractValue = totalContractValue - scheduleAmounts.m7Amount - scheduleAmounts.m6Amount - scheduleAmounts.m5Amount - scheduleAmounts.m4Amount -
                        scheduleAmounts.m3Amount - scheduleAmounts.m2Amount - scheduleAmounts.m1Amount - scheduleAmounts.m0Amount;
                    return parseFloat(updatedContractValue * finM4InvoicePer).toFixed(2);
                }

            } else {
                return parseFloat(finM4InvoicePer * totalContractValue).toFixed(2)
            }
        } else {
            return project.getValue({fieldId: 'custentity_bb_fin_m4_invoice_amount'});
        }

    }

    /**
     * Calculate Financier M5 Invoice Amount
     *
     * @param project - NS Project Record
     * @returns - Financier M5 Invoice Amount
     */
    function getFinancierM5InvoiceAmount(project, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj) {
        var rebateAmt = 0;
        var rebateConfirmationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'}) :
            ((projectDataObj.custentity_bb_rebate_confirmation_amount) ? projectDataObj.custentity_bb_rebate_confirmation_amount : 0);

        var rebateApplicationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_application_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_application_amount'}) :
            ((projectDataObj.custentity_bb_rebate_application_amount) ? projectDataObj.custentity_bb_rebate_application_amount : 0);

        if (rebateConfirmationAmt) {
            rebateAmt = rebateConfirmationAmt;
        } else if (rebateApplicationAmt) {
            rebateAmt = rebateApplicationAmt;
        }
        var rebateAssignee = project.getValue({fieldId: 'custentity_bb_rebate_assignee'});
        var deductRebateAllMilestones = project.getValue({fieldId: 'custentity_bb_dedct_rebate_all_milestone'});
        var deductFromAllMilestones = project.getValue({fieldId: 'custentity_bb_down_payment_all_milestone'});
        var finM5InvoicePer = (project.getValue('custentity_bb_fin_m5_invoice_percent')) ? project.getValue('custentity_bb_fin_m5_invoice_percent') / 100 :
            ((projectDataObj.custentity_bb_fin_m5_invoice_percent) ? parseFloat(projectDataObj.custentity_bb_fin_m5_invoice_percent) / 100 : 0);

        var totalContractValue = (project.getValue('custentity_bb_total_contract_value_amt')) ? project.getValue('custentity_bb_total_contract_value_amt') :
            ((projectDataObj.custentity_bb_total_contract_value_amt) ? parseFloat(projectDataObj.custentity_bb_total_contract_value_amt) : 0.00);

        downPayment = (downPayment) ? downPayment : ((projectDataObj.finDownPayment) ? projectDataObj.finDownPayment : null);
        downPaymentMilestoneName = (downPaymentMilestoneName) ? downPaymentMilestoneName : ((projectDataObj.finDownPaymentMilestoneName) ? projectDataObj.finDownPaymentMilestoneName : null);

        // log.debug('downpayment amount m5', downPayment);
        // log.debug('downpayment name m5', downPaymentMilestoneName);
        if (!customFinTotals) {
            if (deductFromAllMilestones && downPayment) {
                return parseFloat((totalContractValue - parseFloat(downPayment)) * finM5InvoicePer).toFixed(2);
            } else if (downPayment && downPaymentMilestoneName == 'M5' && !deductFromAllMilestones) {

                return (finM5InvoicePer * totalContractValue) - downPayment;

            } else if (rebateAssignee == 3 && rebateAmt && scheduleAmounts.rebateMilestoneName == 'M5') {
                return (parseFloat(finM5InvoicePer * totalContractValue).toFixed(2)) - parseFloat(rebateAmt);
            } else if (rebateAssignee == 3 && rebateAmt && !scheduleAmounts.rebateMilestoneName && deductRebateAllMilestones) {
                return parseFloat((totalContractValue - parseFloat(rebateAmt)) * finM5InvoicePer).toFixed(2);
            } else if (scheduleAmounts) {

                if (scheduleAmounts.m5Amount > 0) {
                    return scheduleAmounts.m5Amount;
                } else {
                    var updatedContractValue = totalContractValue - scheduleAmounts.m7Amount - scheduleAmounts.m6Amount - scheduleAmounts.m5Amount - scheduleAmounts.m4Amount -
                        scheduleAmounts.m3Amount - scheduleAmounts.m2Amount - scheduleAmounts.m1Amount - scheduleAmounts.m0Amount;
                    return parseFloat(updatedContractValue * finM5InvoicePer).toFixed(2);
                }

            } else {
                return parseFloat(finM5InvoicePer * totalContractValue).toFixed(2)
            }
        } else {
            return project.getValue({fieldId: 'custentity_bb_fin_m5_invoice_amount'});
        }

    }


    /**
     * Calculate Financier M6 Invoice Amount
     *
     * @param project - NS Project Record
     * @returns - Financier M6 Invoice Amount
     */
    function getFinancierM6InvoiceAmount(project, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj) {
        var rebateAmt = 0;
        var rebateConfirmationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'}) :
            ((projectDataObj.custentity_bb_rebate_confirmation_amount) ? projectDataObj.custentity_bb_rebate_confirmation_amount : 0);

        var rebateApplicationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_application_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_application_amount'}) :
            ((projectDataObj.custentity_bb_rebate_application_amount) ? projectDataObj.custentity_bb_rebate_application_amount : 0);

        if (rebateConfirmationAmt) {
            rebateAmt = rebateConfirmationAmt;
        } else if (rebateApplicationAmt) {
            rebateAmt = rebateApplicationAmt;
        }
        var rebateAssignee = project.getValue({fieldId: 'custentity_bb_rebate_assignee'});
        var deductRebateAllMilestones = project.getValue({fieldId: 'custentity_bb_dedct_rebate_all_milestone'});
        var deductFromAllMilestones = project.getValue({fieldId: 'custentity_bb_down_payment_all_milestone'});
        var finM6InvoicePer = (project.getValue('custentity_bb_fin_m6_invoice_percent')) ? project.getValue('custentity_bb_fin_m6_invoice_percent') / 100 :
            ((projectDataObj.custentity_bb_fin_m6_invoice_percent) ? parseFloat(projectDataObj.custentity_bb_fin_m6_invoice_percent) / 100 : 0);

        var totalContractValue = (project.getValue('custentity_bb_total_contract_value_amt')) ? project.getValue('custentity_bb_total_contract_value_amt') :
            ((projectDataObj.custentity_bb_total_contract_value_amt) ? parseFloat(projectDataObj.custentity_bb_total_contract_value_amt) : 0.00);

        downPayment = (downPayment) ? downPayment : ((projectDataObj.finDownPayment) ? projectDataObj.finDownPayment : null);
        downPaymentMilestoneName = (downPaymentMilestoneName) ? downPaymentMilestoneName : ((projectDataObj.finDownPaymentMilestoneName) ? projectDataObj.finDownPaymentMilestoneName : null);

        // log.debug('downpayment amount m6', downPayment);
        // log.debug('downpayment name m6', downPaymentMilestoneName);
        if (!customFinTotals) {
            if (deductFromAllMilestones && downPayment) {
                return parseFloat((totalContractValue - parseFloat(downPayment)) * finM6InvoicePer).toFixed(2);
            } else if (downPayment && downPaymentMilestoneName == 'M6' && !deductFromAllMilestones) {

                return (finM6InvoicePer * totalContractValue) - downPayment;

            } else if (rebateAssignee == 3 && rebateAmt && scheduleAmounts.rebateMilestoneName == 'M6') {
                return (parseFloat(finM6InvoicePer * totalContractValue).toFixed(2)) - parseFloat(rebateAmt);
            } else if (rebateAssignee == 3 && rebateAmt && !scheduleAmounts.rebateMilestoneName && deductRebateAllMilestones) {
                return parseFloat((totalContractValue - parseFloat(rebateAmt)) * finM6InvoicePer).toFixed(2);
            } else if (scheduleAmounts) {

                if (scheduleAmounts.m6Amount > 0) {
                    return scheduleAmounts.m6Amount;
                } else {
                    var updatedContractValue = totalContractValue - scheduleAmounts.m7Amount - scheduleAmounts.m6Amount - scheduleAmounts.m5Amount - scheduleAmounts.m4Amount -
                        scheduleAmounts.m3Amount - scheduleAmounts.m2Amount - scheduleAmounts.m1Amount - scheduleAmounts.m0Amount;
                    return parseFloat(updatedContractValue * finM6InvoicePer).toFixed(2);
                }

            } else {
                return parseFloat(finM6InvoicePer * totalContractValue).toFixed(2)
            }
        } else {
            return project.getValue({fieldId: 'custentity_bb_fin_m6_invoice_amount'});
        }

    }

    /**
     * Calculate Financier M7 Invoice Amount
     *
     * @param project - NS Project Record
     * @returns - Financier M7 Invoice Amount
     */
    function getFinancierM7InvoiceAmount(project, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj) {
        var rebateAmt = 0;
        var rebateConfirmationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'}) :
            ((projectDataObj.custentity_bb_rebate_confirmation_amount) ? projectDataObj.custentity_bb_rebate_confirmation_amount : 0);

        var rebateApplicationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_application_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_application_amount'}) :
            ((projectDataObj.custentity_bb_rebate_application_amount) ? projectDataObj.custentity_bb_rebate_application_amount : 0);

        if (rebateConfirmationAmt) {
            rebateAmt = rebateConfirmationAmt;
        } else if (rebateApplicationAmt) {
            rebateAmt = rebateApplicationAmt;
        }
        var rebateAssignee = project.getValue({fieldId: 'custentity_bb_rebate_assignee'});
        var deductRebateAllMilestones = project.getValue({fieldId: 'custentity_bb_dedct_rebate_all_milestone'});
        var deductFromAllMilestones = project.getValue({fieldId: 'custentity_bb_down_payment_all_milestone'});
        var finM7InvoicePer = (project.getValue('custentity_bb_fin_m7_invoice_percent')) ? project.getValue('custentity_bb_fin_m7_invoice_percent') / 100 :
            ((projectDataObj.custentity_bb_fin_m7_invoice_percent) ? parseFloat(projectDataObj.custentity_bb_fin_m7_invoice_percent) / 100 : 0);

        var totalContractValue = (project.getValue('custentity_bb_total_contract_value_amt')) ? project.getValue('custentity_bb_total_contract_value_amt') :
            ((projectDataObj.custentity_bb_total_contract_value_amt) ? parseFloat(projectDataObj.custentity_bb_total_contract_value_amt) : 0.00);

        downPayment = (downPayment) ? downPayment : ((projectDataObj.finDownPayment) ? projectDataObj.finDownPayment : null);
        downPaymentMilestoneName = (downPaymentMilestoneName) ? downPaymentMilestoneName : ((projectDataObj.finDownPaymentMilestoneName) ? projectDataObj.finDownPaymentMilestoneName : null);

        // log.debug('downpayment amount m7', downPayment);
        // log.debug('downpayment name m7', downPaymentMilestoneName);
        if (!customFinTotals) {
            if (deductFromAllMilestones && downPayment) {
                return parseFloat((totalContractValue - parseFloat(downPayment)) * finM7InvoicePer).toFixed(2);
            } else if (downPayment && downPaymentMilestoneName == 'M7' && !deductFromAllMilestones) {

                return (finM7InvoicePer * totalContractValue) - downPayment;

            } else if (rebateAssignee == 3 && rebateAmt && scheduleAmounts.rebateMilestoneName == 'M7') {
                return (parseFloat(finM7InvoicePer * totalContractValue).toFixed(2)) - parseFloat(rebateAmt);
            } else if (rebateAssignee == 3 && rebateAmt && !scheduleAmounts.rebateMilestoneName && deductRebateAllMilestones) {
                return parseFloat((totalContractValue - parseFloat(rebateAmt)) * finM7InvoicePer).toFixed(2);
            } else if (scheduleAmounts) {

                if (scheduleAmounts.m7Amount > 0) {
                    return scheduleAmounts.m7Amount;
                } else {
                    var updatedContractValue = totalContractValue - scheduleAmounts.m7Amount - scheduleAmounts.m6Amount - scheduleAmounts.m5Amount - scheduleAmounts.m4Amount -
                        scheduleAmounts.m3Amount - scheduleAmounts.m2Amount - scheduleAmounts.m1Amount - scheduleAmounts.m0Amount;
                    return parseFloat(updatedContractValue * finM7InvoicePer).toFixed(2);
                }

            } else {
                return parseFloat(finM7InvoicePer * totalContractValue).toFixed(2)
            }
        } else {
            return project.getValue({fieldId: 'custentity_bb_fin_m7_invoice_amount'});
        }

    }

    function getRebateInvoiceAmount(project, scheduleAmounts, projectDataObj) {
        var rebateAmt = 0;
        var rebateConfirmationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_confirmation_amount'}) :
            ((projectDataObj.custentity_bb_rebate_confirmation_amount) ? projectDataObj.custentity_bb_rebate_confirmation_amount : 0);

        var rebateApplicationAmt =  (project.getValue({fieldId: 'custentity_bb_rebate_application_amount'})) ? project.getValue({fieldId: 'custentity_bb_rebate_application_amount'}) :
            ((projectDataObj.custentity_bb_rebate_application_amount) ? projectDataObj.custentity_bb_rebate_application_amount : 0);

        if (rebateConfirmationAmt) {
            rebateAmt = rebateConfirmationAmt;
        } else if (rebateApplicationAmt) {
            rebateAmt = rebateApplicationAmt;
        }
        var rebateAssignee = project.getValue({fieldId: 'custentity_bb_rebate_assignee'});
        if (rebateAssignee == 3 && rebateAmt) {
            return rebateAmt;
        } else {
            return 0;
        }
    }

    function calculateGrossProfitAmount(project, projectDataObj) {
        var revenueAmt =  (project.getValue({fieldId: 'custentity_bb_revenue_amount'})) ? project.getValue({fieldId: 'custentity_bb_revenue_amount'}) :
            ((projectDataObj.custentity_bb_revenue_amount) ? projectDataObj.custentity_bb_revenue_amount : 0);
        var equipmentAmt =  (project.getValue({fieldId: 'custentity_bb_equip_cost_amount'})) ? project.getValue({fieldId: 'custentity_bb_equip_cost_amount'}) :
            ((projectDataObj.custentity_bb_equip_cost_amount) ? projectDataObj.custentity_bb_equip_cost_amount : 0);
        var serviceAmt =  (project.getValue({fieldId: 'custentity_bb_services_costs_amount'})) ? project.getValue({fieldId: 'custentity_bb_services_costs_amount'}) :
            ((projectDataObj.custentity_bb_services_costs_amount) ? projectDataObj.custentity_bb_services_costs_amount : 0);
        return revenueAmt - equipmentAmt - serviceAmt
    }

////////////Dealer Fee Calculation Section///////////////////////

    function getM0DealerFeeAmount(project, dealerFeePercent, dealerFeeExecution, projectDataObj, downPayment) {
        var m0DealerFee = 0.00;
        var m0Amt = (project.getValue({fieldId: 'custentity_bb_fin_m0_invoice_amount'})) ? project.getValue({fieldId: 'custentity_bb_fin_m0_invoice_amount'}) : projectDataObj.custentity_bb_fin_m0_invoice_amount;
        if ((dealerFeeExecution == 1 || dealerFeeExecution == 2) && dealerFeePercent && m0Amt && !downPayment) {
            var dealerPercent = parseFloat(dealerFeePercent) / 100;
            m0DealerFee = parseFloat(m0Amt) * dealerPercent;
            log.debug('m0Dealer Fee Amount', m0DealerFee);
        }
        return m0DealerFee;
    }


    function getM1DealerFeeAmount(project, dealerFeePercent, dealerFeeExecution, projectDataObj, downPayment, downPaymentMilestoneName) {
        var m1DealerFee = 0.00;
        var m1Amt = (project.getValue({fieldId: 'custentity_bb_fin_m1_invoice_amount'})) ? project.getValue({fieldId: 'custentity_bb_fin_m1_invoice_amount'}) : projectDataObj.custentity_bb_fin_m1_invoice_amount;
        if ((dealerFeeExecution == 1 || dealerFeeExecution == 3) && dealerFeePercent && m1Amt) {
            var downPaymentAmt = (downPaymentMilestoneName == 'M1') ? (downPayment) ? parseFloat(downPayment) : parseFloat(0.00) : parseFloat(0.00);
            var dealerPercent = parseFloat(dealerFeePercent) / 100;
            m1DealerFee = (parseFloat(m1Amt) + downPaymentAmt) * dealerPercent;
            log.debug('m1Dealer Fee Amount', m1DealerFee);
        }
        return m1DealerFee;
    }


    function getM2DealerFeeAmount(project, dealerFeePercent, dealerFeeExecution, projectDataObj, downpayment, downPaymentMilestoneName) {
        var m2DealerFee = 0.00;
        var m2Amt = (project.getValue({fieldId: 'custentity_bb_fin_m2_invoice_amount'})) ? project.getValue({fieldId: 'custentity_bb_fin_m2_invoice_amount'}) : projectDataObj.custentity_bb_fin_m2_invoice_amount;
        if ((dealerFeeExecution == 1 || dealerFeeExecution == 4) && dealerFeePercent && m2Amt) {
            var downPaymentAmt = (downPaymentMilestoneName == 'M2') ? (downPayment) ? parseFloat(downPayment) : parseFloat(0.00) : parseFloat(0.00);
            var dealerPercent = parseFloat(dealerFeePercent) / 100;
            m2DealerFee = (parseFloat(m2Amt) + downPaymentAmt) * dealerPercent;
            log.debug('m2Dealer Fee Amount', m2DealerFee);
        }
        return m2DealerFee;
    }


    function getM3DealerFeeAmount(project, dealerFeePercent, dealerFeeExecution, projectDataObj, downpayment, downPaymentMilestoneName) {
        var m3DealerFee = 0.00;
        var m3Amt = (project.getValue({fieldId: 'custentity_bb_fin_m3_invoice_amount'})) ? project.getValue({fieldId: 'custentity_bb_fin_m3_invoice_amount'}) : projectDataObj.custentity_bb_fin_m3_invoice_amount;
        if ((dealerFeeExecution == 1 || dealerFeeExecution == 5) && dealerFeePercent && m3Amt) {
            var downPaymentAmt = (downPaymentMilestoneName == 'M3') ? (downPayment) ? parseFloat(downPayment) : parseFloat(0.00) : parseFloat(0.00);
            var dealerPercent = parseFloat(dealerFeePercent) / 100;
            m3DealerFee = (parseFloat(m3Amt) + downPaymentAmt) * dealerPercent;
            log.debug('m3Dealer Fee Amount', m3DealerFee);
        }
        return m3DealerFee;
    }


    function getM4DealerFeeAmount(project, dealerFeePercent, dealerFeeExecution, projectDataObj, downpayment, downPaymentMilestoneName) {
        var m4DealerFee = 0.00;
        var m4Amt = (project.getValue({fieldId: 'custentity_bb_fin_m4_invoice_amount'})) ? project.getValue({fieldId: 'custentity_bb_fin_m4_invoice_amount'}) : projectDataObj.custentity_bb_fin_m4_invoice_amount;
        if ((dealerFeeExecution == 1 || dealerFeeExecution == 6) && dealerFeePercent && m4Amt) {
            var downPaymentAmt = (downPaymentMilestoneName == 'M4') ? (downPayment) ? parseFloat(downPayment) : parseFloat(0.00) : parseFloat(0.00);
            var dealerPercent = parseFloat(dealerFeePercent) / 100;
            m4DealerFee = (parseFloat(m4Amt) + downPaymentAmt) * dealerPercent;
            log.debug('m4Dealer Fee Amount', m4DealerFee);
        }
        return m4DealerFee;
    }


    function getM5DealerFeeAmount(project, dealerFeePercent, dealerFeeExecution, projectDataObj, downpayment, downPaymentMilestoneName) {
        var m5DealerFee = 0.00;
        var m5Amt = (project.getValue({fieldId: 'custentity_bb_fin_m5_invoice_amount'})) ? project.getValue({fieldId: 'custentity_bb_fin_m5_invoice_amount'}) : projectDataObj.custentity_bb_fin_m5_invoice_amount;
        if ((dealerFeeExecution == 1 || dealerFeeExecution == 7) && dealerFeePercent && m5Amt) {
            var downPaymentAmt = (downPaymentMilestoneName == 'M5') ? (downPayment) ? parseFloat(downPayment) : parseFloat(0.00) : parseFloat(0.00);
            var dealerPercent = parseFloat(dealerFeePercent) / 100;
            m5DealerFee = (parseFloat(m5Amt) + downPaymentAmt) * dealerPercent;
            log.debug('m5Dealer Fee Amount', m5DealerFee);
        }
        return m5DealerFee;
    }


    function getM6DealerFeeAmount(project, dealerFeePercent, dealerFeeExecution, projectDataObj, downpayment, downPaymentMilestoneName) {
        var m6DealerFee = 0.00;
        var m6Amt = (project.getValue({fieldId: 'custentity_bb_fin_m6_invoice_amount'})) ? project.getValue({fieldId: 'custentity_bb_fin_m6_invoice_amount'}) : projectDataObj.custentity_bb_fin_m6_invoice_amount;
        if ((dealerFeeExecution == 1 || dealerFeeExecution == 8) && dealerFeePercent && m6Amt) {
            var downPaymentAmt = (downPaymentMilestoneName == 'M6') ? (downPayment) ? parseFloat(downPayment) : parseFloat(0.00) : parseFloat(0.00);
            var dealerPercent = parseFloat(dealerFeePercent) / 100;
            m6DealerFee = (parseFloat(m6Amt) + downPaymentAmt) * dealerPercent;
            log.debug('m6Dealer Fee Amount', m6DealerFee);
        }
        return m6DealerFee;
    }


    function getM7DealerFeeAmount(project, dealerFeePercent, dealerFeeExecution, projectDataObj, downpayment, downPaymentMilestoneName) {
        var m7DealerFee = 0.00;
        var m7Amt = (project.getValue({fieldId: 'custentity_bb_fin_m7_invoice_amount'})) ? project.getValue({fieldId: 'custentity_bb_fin_m7_invoice_amount'}) : projectDataObj.custentity_bb_fin_m7_invoice_amount;
        if ((dealerFeeExecution == 1 || dealerFeeExecution == 9) && dealerFeePercent && m7Amt) {
            var downPaymentAmt = (downPaymentMilestoneName == 'M7') ? (downPayment) ? parseFloat(downPayment) : parseFloat(0.00) : parseFloat(0.00);
            var dealerPercent = parseFloat(dealerFeePercent) / 100;
            m7DealerFee = (parseFloat(m7Amt) + downPaymentAmt) * dealerPercent;
            log.debug('m7Dealer Fee Amount', m7DealerFee);
        }
        return m7DealerFee;
    }


    /**
     * Calculates Installation Base Amount Field
     *
     * @param project - NS Project Record
     * @returns - Installation Base Amount
     */
    function getInstallationBaseAmount(project, projectDataObj) {
        var finInstallPerWattAmt = (project.getValue('custentity_bb_fin_install_per_watt_amt')) ? project.getValue('custentity_bb_fin_install_per_watt_amt') :
            ((projectDataObj.custentity_bb_fin_install_per_watt_amt) ? parseFloat(projectDataObj.custentity_bb_fin_install_per_watt_amt) : 0);

        var systemSizeAmt = (project.getValue('custentity_bb_system_size_decimal')) ? project.getValue('custentity_bb_system_size_decimal') :
            ((projectDataObj.custentity_bb_system_size_decimal) ? parseFloat(projectDataObj.custentity_bb_system_size_decimal) : 0);

        return parseFloat(finInstallPerWattAmt * systemSizeAmt * 1000).toFixed(2);
    }



    /**
     * Calculatse Origination Amount Per Watt Field
     *
     * @param project - NS Project Record
     * @returns - Origination Amount Per Watt
     */
    function getOriginationAmountPerWatt(project, projectDataObj) {
        var finPurchPricePerWattAmt = (project.getValue('custentity_bb_fin_pur_price_p_watt_amt')) ? project.getValue('custentity_bb_fin_pur_price_p_watt_amt') :
            ((projectDataObj.custentity_bb_fin_pur_price_p_watt_amt) ? parseFloat(projectDataObj.custentity_bb_fin_pur_price_p_watt_amt) : 0);

        var finOrigBasePerWattAmt = (project.getValue('custentity_bb_fin_orig_base_per_watt_amt')) ? project.getValue('custentity_bb_fin_orig_base_per_watt_amt') :
            ((projectDataObj.custentity_bb_fin_orig_base_per_watt_amt) ? parseFloat(projectDataObj.custentity_bb_fin_orig_base_per_watt_amt) : 0);

        // return parseFloat(parseFloat(finPurchPricePerWattAmt) - parseFloat(finOrigBasePerWattAmt)).toFixed(2);
        return finPurchPricePerWattAmt - finOrigBasePerWattAmt;
    }



    /**
     * Calculates Origination Base Amount
     *
     * @param project - NS Project Record
     * @returns - Origination Base Amount
     */
    function getOriginationBaseAmount(project, projectDataObj) {
        var finOrigPerWattAmt = (project.getValue('custentity_bb_fin_orig_per_watt_amt')) ? project.getValue('custentity_bb_fin_orig_per_watt_amt') :
            ((projectDataObj.custentity_bb_fin_orig_per_watt_amt) ? parseFloat(projectDataObj.custentity_bb_fin_orig_per_watt_amt) : 0);

        var origPerWattAmt = (project.getValue('custentity_bb_originator_base_p_watt_amt')) ? project.getValue('custentity_bb_originator_base_p_watt_amt') :
            ((projectDataObj.custentity_bb_originator_base_p_watt_amt) ? parseFloat(projectDataObj.custentity_bb_originator_base_p_watt_amt) : 0);

        var systemSizeAmt = (project.getValue('custentity_bb_system_size_decimal')) ? project.getValue('custentity_bb_system_size_decimal') :
            ((projectDataObj.custentity_bb_system_size_decimal) ? parseFloat(projectDataObj.custentity_bb_system_size_decimal) : 0);

        var finPrelimPurchPriceAmt = (project.getValue('custentity_bb_fin_prelim_purch_price_amt')) ? project.getValue('custentity_bb_fin_prelim_purch_price_amt') :
            ((projectDataObj.custentity_bb_fin_prelim_purch_price_amt) ? parseFloat(projectDataObj.custentity_bb_fin_prelim_purch_price_amt) : 0);

        //return parseFloat(parseFloat(finOrigPerWattAmt) * systemSizeAmt * 1000).toFixed(2); // controlled value rounds to 2 decimal places

        //return finOrigPerWattAmt * (systemSizeAmt * 1000);

        return finOrigPerWattAmt * (systemSizeAmt * 1000); // original formula
    }




    /**
     * Calculates Financier Purchase Price Per Watt
     *
     * @param project - NS Project Record
     * @returns - Origination Base Amount
     */
    function getFinancierPurchPricePerWatt(project, projectDataObj) {
        var finPrelimPurchPriceAmt = (project.getValue('custentity_bb_fin_prelim_purch_price_amt')) ? project.getValue('custentity_bb_fin_prelim_purch_price_amt') :
            ((projectDataObj.custentity_bb_fin_prelim_purch_price_amt) ? parseFloat(projectDataObj.custentity_bb_fin_prelim_purch_price_amt) : 0);

        var systemSizeAmt = (project.getValue('custentity_bb_system_size_decimal')) ? project.getValue('custentity_bb_system_size_decimal') :
            ((projectDataObj.custentity_bb_system_size_decimal) ? parseFloat(projectDataObj.custentity_bb_system_size_decimal) : 0);

        if (systemSizeAmt == 0) {
            return 0;
        } else {
            log.debug('financier purchase price per watt amount', finPrelimPurchPriceAmt / (systemSizeAmt * 1000));
            return Math.floor((finPrelimPurchPriceAmt / (systemSizeAmt * 1000)) * 100) / 100;
        }
    }


    function getGrossAdderTotal(project) {
        var grossAdderTotal = 0;
        if (project.id) {
            var customrecord_bb_project_adderSearchObj = search.create({
                type: "customrecord_bb_project_adder",
                filters:
                    [
                        ["isinactive","is","F"],
                        "AND",
                        ["custrecord_bb_project_adder_project","anyof", project.id]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "custrecord_bb_adder_total_amount",
                            summary: "SUM"
                        })
                    ]
            });
            var results = customrecord_bb_project_adderSearchObj.run().getRange({start: 0, end: 1});
            if (results.length > 0) {
                grossAdderTotal = (results[0].getValue({name: 'custrecord_bb_adder_total_amount', summary: 'SUM'})) ?
                    results[0].getValue({name: 'custrecord_bb_adder_total_amount', summary: 'SUM'}) : 0
            }
            return grossAdderTotal;
        }
    }
    function getSolarPortionContractValue(project, projectDataObj) {
        var finPrelimPurchPriceAmt = (project.getValue('custentity_bb_fin_prelim_purch_price_amt')) ? project.getValue('custentity_bb_fin_prelim_purch_price_amt') :
            ((projectDataObj.custentity_bb_fin_prelim_purch_price_amt) ? parseFloat(projectDataObj.custentity_bb_fin_prelim_purch_price_amt) : 0);
        var grossAdderTotal = (project.getValue('custentity_bb_gross_adder_total')) ? project.getValue('custentity_bb_gross_adder_total') :
            ((projectDataObj.custentity_bb_gross_adder_total) ? parseFloat(projectDataObj.custentity_bb_gross_adder_total) : 0);
        return finPrelimPurchPriceAmt - grossAdderTotal;
    }
    function getNetPricePerWatt(project, projectDataObj) {
        var solarPortionContractValue = (project.getValue('custentity_bb_solar_portion_contract_amt')) ? project.getValue('custentity_bb_solar_portion_contract_amt') :
            ((projectDataObj.custentity_bb_solar_portion_contract_amt) ? parseFloat(projectDataObj.custentity_bb_solar_portion_contract_amt) : 0);
        var systemSizeAmt = (project.getValue('custentity_bb_system_size_decimal')) ? project.getValue('custentity_bb_system_size_decimal') :
            ((projectDataObj.custentity_bb_system_size_decimal) ? parseFloat(projectDataObj.custentity_bb_system_size_decimal) : 0);
        if (systemSizeAmt && solarPortionContractValue) {
            return solarPortionContractValue / (systemSizeAmt * 1000);
        } else {
            return 0;
        }
    }

    /**
     * Calculate Total Contract Value field
     *
     * @param project - NS Project Record
     * @returns - Total Contract Value Amount
     */
    function getTotalContractValue(project, projectDataObj) {
        var PROJECT_TYPE = getBBConfigProjectType();
        var projType = (project.getValue('jobtype')) ? project.getValue('jobtype') : ((projectDataObj.jobtype) ? parseInt(projectDataObj.jobtype) : null);

        var finPrelimPurchPriceAmt = (project.getValue('custentity_bb_fin_prelim_purch_price_amt')) ? project.getValue('custentity_bb_fin_prelim_purch_price_amt') :
            ((projectDataObj.custentity_bb_fin_prelim_purch_price_amt) ? parseFloat(projectDataObj.custentity_bb_fin_prelim_purch_price_amt) : 0);

        var finOwnedEquipCostAmt = (project.getValue('custentity_bb_fin_owned_equip_costs_amt')) ? project.getValue('custentity_bb_fin_owned_equip_costs_amt') :
            ((projectDataObj.custentity_bb_fin_owned_equip_costs_amt) ? parseFloat(projectDataObj.custentity_bb_fin_owned_equip_costs_amt) : 0);

        var epcRole = (project.getValue('custentity_bb_epc_role')) ? project.getValue('custentity_bb_epc_role') :
            ((projectDataObj.custentity_bb_epc_role) ? projectDataObj.custentity_bb_epc_role : null);

        var finInstallBaseAmt = (project.getValue('custentity_bb_fin_install_base_amt')) ? project.getValue('custentity_bb_fin_install_base_amt') :
            ((projectDataObj.custentity_bb_fin_install_base_amt) ? parseFloat(projectDataObj.custentity_bb_fin_install_base_amt) : 0);

        var finFixedAdderAmt = (project.getValue('custentity_bb_fin_fixed_adder_amt')) ? project.getValue('custentity_bb_fin_fixed_adder_amt') :
            ((projectDataObj.custentity_bb_fin_fixed_adder_amt) ? parseFloat(projectDataObj.custentity_bb_fin_fixed_adder_amt) : 0);

        var finPerFootAdderAmt = (project.getValue('custentity_bb_fin_per_foot_adder_amt')) ? project.getValue('custentity_bb_fin_per_foot_adder_amt') :
            ((projectDataObj.custentity_bb_fin_per_foot_adder_amt) ? parseFloat(projectDataObj.custentity_bb_fin_per_foot_adder_amt) : 0);

        var finPerWattAdderAmt = (project.getValue('custentity_bb_fin_per_watt_adder_amt')) ? project.getValue('custentity_bb_fin_per_watt_adder_amt') :
            ((projectDataObj.custentity_bb_fin_per_watt_adder_amt) ? parseFloat(projectDataObj.custentity_bb_fin_per_watt_adder_amt) : 0);

        var finPerModuleAdderAmt = (project.getValue('custentity_bb_fin_per_module_adder_amt')) ? project.getValue('custentity_bb_fin_per_module_adder_amt') :
            ((projectDataObj.custentity_bb_fin_per_module_adder_amt) ? parseFloat(projectDataObj.custentity_bb_fin_per_module_adder_amt) : 0);

        var finOrigBaseAmt = (project.getValue('custentity_bb_fin_orig_base_amt')) ? project.getValue('custentity_bb_fin_orig_base_amt') :
            ((projectDataObj.custentity_bb_fin_orig_base_amt) ? parseFloat(projectDataObj.custentity_bb_fin_orig_base_amt) : 0);

        var totalContractValue;

        if (projType == PROJECT_TYPE.FULL_SERVICE) {
            totalContractValue = parseFloat(finPrelimPurchPriceAmt) + parseFloat(finOwnedEquipCostAmt);
        } else if (projType == PROJECT_TYPE.EPC && epcRole == EPC_ROLE.INSTALLER) {
            totalContractValue = parseFloat(finInstallBaseAmt) + parseFloat(finFixedAdderAmt) + parseFloat(finPerFootAdderAmt) + parseFloat(finPerWattAdderAmt) + parseFloat(finPerModuleAdderAmt);
        } else if (projType == PROJECT_TYPE.EPC && epcRole == EPC_ROLE.ORIGINATOR) {
            totalContractValue = parseFloat(finOrigBaseAmt) - parseFloat(finFixedAdderAmt) - parseFloat(finPerFootAdderAmt) - parseFloat(finPerWattAdderAmt) - parseFloat(finPerModuleAdderAmt);
        } else {
            totalContractValue = parseFloat(finPrelimPurchPriceAmt);
        }
        // log.debug('total contract value amount in calc lib', totalContractValue)

        if (isNaN(totalContractValue)) {
            totalContractValue = 0;
        }

        return totalContractValue;
    }


    /**
     * Calculate Originator Amount / Watt
     * Formula: Financier Preliminary Purchase Price per watt - Originator Base Price / Watt
     *
     * @param project - NS Project Record
     * @returns - Originator Amount / Watt
     */
    function getOriginatorAmountPerWatt(project, projectDataObj) {
        var finPrelimPurchPricePerWattAmt = (project.getValue('custentity_bb_fin_pur_price_p_watt_amt')) ? project.getValue('custentity_bb_fin_pur_price_p_watt_amt') :
            ((projectDataObj.custentity_bb_fin_pur_price_p_watt_amt) ? parseFloat(projectDataObj.custentity_bb_fin_pur_price_p_watt_amt) : 0);

        var originatorBasePricePerWattAmt = (project.getValue('custentity_bb_originator_base_p_watt_amt')) ? project.getValue('custentity_bb_originator_base_p_watt_amt') :
            ((projectDataObj.custentity_bb_originator_base_p_watt_amt) ? parseFloat(projectDataObj.custentity_bb_originator_base_p_watt_amt) : 0);

        // return parseFloat(parseFloat(finPrelimPurchPricePerWattAmt) - parseFloat(originatorBasePricePerWattAmt)).toFixed(2);
        return finPrelimPurchPricePerWattAmt - originatorBasePricePerWattAmt;
    }



    /**
     * Calculate Originator Base Amount
     * Formula: Originator Amount / Watt * System Size * 1000
     *
     * @param project - NS Project Record
     * @returns - Originator Base Amount
     */
    function getOriginatorBaseAmount(project, projectDataObj) {
        var originatorAmountPerWatt = (project.getValue('custentity_bb_originator_per_watt_amt')) ? project.getValue('custentity_bb_originator_per_watt_amt') :
            ((projectDataObj.custentity_bb_originator_per_watt_amt) ? parseFloat(projectDataObj.custentity_bb_originator_per_watt_amt) : 0);

        var origPerWattAmt = (project.getValue('custentity_bb_originator_base_p_watt_amt')) ? project.getValue('custentity_bb_originator_base_p_watt_amt') :
            ((projectDataObj.custentity_bb_originator_base_p_watt_amt) ? parseFloat(projectDataObj.custentity_bb_originator_base_p_watt_amt) : 0);

        var systemSizeAmt = (project.getValue('custentity_bb_system_size_decimal')) ? project.getValue('custentity_bb_system_size_decimal') :
            ((projectDataObj.custentity_bb_system_size_decimal) ? parseFloat(projectDataObj.custentity_bb_system_size_decimal) : 0);

        var finPrelimPurchPriceAmt = (project.getValue('custentity_bb_fin_prelim_purch_price_amt')) ? project.getValue('custentity_bb_fin_prelim_purch_price_amt') :
            ((projectDataObj.custentity_bb_fin_prelim_purch_price_amt) ? parseFloat(projectDataObj.custentity_bb_fin_prelim_purch_price_amt) : 0);

        // return parseFloat(originatorAmountPerWatt * systemSize * 1000).toFixed(2);
        //return originatorAmountPerWatt * (systemSize * 1000);

        log.debug('origination value setting', projectDataObj.custrecord_bb_orig_base_calc_method);
        if (projectDataObj.custrecord_bb_orig_base_calc_method == 2) {
            // use this calculation when the config setting is turned on.
            log.debug('config setting division calculation executed');
            return finPrelimPurchPriceAmt - (origPerWattAmt * (systemSizeAmt * 1000));
        } else {
            // use this formula when the config setting is turned off
            log.debug('config setting no division calculation executed or turned off');
            return originatorAmountPerWatt * (systemSizeAmt * 1000);
        }
    }




    /**
     * Calculate Originator Payment Total
     * Formula: Originator Base Amount - Originator Adder Total
     *
     * @param project - NS Project Record
     * @returns - Originator Payment Total
     */
    function getOriginatorPaymentTotal(project, projectDataObj) {
        // with use of the originator payment total override field. if the that field is populated, use that, else use the formula below
        var originatorBaseAmount = (project.getValue('custentity_bb_originator_base_amt')) ? project.getValue('custentity_bb_originator_base_amt') :
            ((projectDataObj.custentity_bb_originator_base_amt) ? parseFloat(projectDataObj.custentity_bb_originator_base_amt) : 0);

        var originatorAdderTotal = (project.getValue('custentity_bb_orgntr_addr_ttl_amt')) ? project.getValue('custentity_bb_orgntr_addr_ttl_amt') :
            ((projectDataObj.custentity_bb_orgntr_addr_ttl_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_addr_ttl_amt) : 0);

        // newly added 12/14 when payment total override is populated, return this value else return calculation
        var originatorPaymentTotalOverride = (project.getValue('custentity_bb_orig_pay_total_overide_amt')) ? project.getValue('custentity_bb_orig_pay_total_overide_amt') :
            ((projectDataObj.custentity_bb_orig_pay_total_overide_amt) ? parseFloat(projectDataObj.custentity_bb_orig_pay_total_overide_amt) : 0);
        if (originatorPaymentTotalOverride) {
            return originatorPaymentTotalOverride;
        } else {
            return parseFloat(originatorBaseAmount) - parseFloat(originatorAdderTotal);
        }

        // return parseFloat(originatorBaseAmount) - parseFloat(originatorAdderTotal);
    }


    /**
     * Calculate Originator Payment Total / watt
     * Formula: Originator Payment Total / (System Size * 1000)
     *
     * @param project - NS Project Record
     * @returns - Originator Payment Total Per Watt
     */
    function getOriginatorPaymentTotalPerWatt(project, projectDataObj) {
        var originatorPaymentTotal = (project.getValue('custentity_bb_orgntr_payment_tot_amt')) ? project.getValue('custentity_bb_orgntr_payment_tot_amt') :
            ((projectDataObj.custentity_bb_orgntr_payment_tot_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_payment_tot_amt) : 0);

        var systemSize = (project.getValue('custentity_bb_system_size_decimal')) ? project.getValue('custentity_bb_system_size_decimal') :
            ((projectDataObj.custentity_bb_system_size_decimal) ? parseFloat(projectDataObj.custentity_bb_system_size_decimal) : 0);

        if (systemSize == 0) {
            return 0;
        }

        // return parseFloat((originatorPaymentTotal / (systemSize * 1000)).toFixed(2));
        return originatorPaymentTotal / (systemSize * 1000);
    }



    /**
     * Calculates M0 Vendor Bill Amount
     * Formula: Originator Payment Total * Originator M0 Vendor Bill %
     *
     * @param project - NS Project Record
     * @param customCalc - boolean value, if marked true, vendor bill amount will be processed via custom script per client
     * @returns - Originator M0 Vendor Bill Amount
     */
    function getOriginatorM0VendorBillAmount(project, customCalc, scheduleAmounts, projectDataObj) {
        var originatorM0VendorBillPerc = (project.getValue('custentity_bb_orgntr_m0_vbill_perc')) ? project.getValue('custentity_bb_orgntr_m0_vbill_perc') :
            ((projectDataObj.custentity_bb_orgntr_m0_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_orgntr_m0_vbill_perc) : 0);

        var origProjPaymentTotal = (project.getValue('custentity_bb_orgntr_payment_tot_amt')) ? project.getValue('custentity_bb_orgntr_payment_tot_amt') :
            ((projectDataObj.custentity_bb_orgntr_payment_tot_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_payment_tot_amt) : 0);

        var origPayTotal;
        if (!customCalc) {
            if (scheduleAmounts) {
                var origGrandPaymentTotal = origProjPaymentTotal - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount;
                if (scheduleAmounts.m0Amount > 0) {
                    return scheduleAmounts.m0Amount;
                } else {
                    return parseFloat(origGrandPaymentTotal * originatorM0VendorBillPerc / 100).toFixed(2);
                }
            } else {
                return  parseFloat(origProjPaymentTotal * originatorM0VendorBillPerc / 100).toFixed(2);
            }

        } else {
            if (scheduleAmounts) {
                if (scheduleAmounts.m0Amount > 0) {
                    return scheduleAmounts.m0Amount;
                } else {
                    return project.getValue({fieldId: 'custentity_bb_orgntr_m0_vbill_amt'});
                }
            } else {
                return project.getValue({fieldId: 'custentity_bb_orgntr_m0_vbill_amt'});
            }
        }
    }




    /**
     * Calculates M1 Vendor Bill Amount
     * Formula: Originator Payment Total * Originator M1 Vendor Bill %
     *
     * @param project - NS Project Record
     * @param customCalc - boolean value, if marked true, vendor bill amount will be processed via custom script per client
     * @returns - Originator M1 Vendor Bill Amount
     */
    function getOriginatorM1VendorBillAmount(project, customCalc, scheduleAmounts, projectDataObj) {
        var originatorM1VendorBillPerc = (project.getValue('custentity_bb_orgntr_m1_vbill_perc')) ? project.getValue('custentity_bb_orgntr_m1_vbill_perc') :
            ((projectDataObj.custentity_bb_orgntr_m1_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_orgntr_m1_vbill_perc) : 0);

        var origProjPaymentTotal = (project.getValue('custentity_bb_orgntr_payment_tot_amt')) ? project.getValue('custentity_bb_orgntr_payment_tot_amt') :
            ((projectDataObj.custentity_bb_orgntr_payment_tot_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_payment_tot_amt) : 0);

        var origPayTotal;
        if (!customCalc) {
            if (scheduleAmounts) {
                var origGrandPaymentTotal = origProjPaymentTotal - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount;
                if (scheduleAmounts.m1Amount > 0) {
                    return scheduleAmounts.m1Amount;
                } else {
                    return parseFloat(origGrandPaymentTotal * originatorM1VendorBillPerc / 100).toFixed(2);
                }
            } else {
                return parseFloat(origProjPaymentTotal * originatorM1VendorBillPerc / 100).toFixed(2);
            }
        } else {
            if (scheduleAmounts) {
                if (scheduleAmounts.m1Amount > 0) {
                    return scheduleAmounts.m1Amount;
                } else {
                    return project.getValue({fieldId: 'custentity_bb_orgntr_m1_vbill_amt'});
                }
            } else {
                return project.getValue({fieldId: 'custentity_bb_orgntr_m1_vbill_amt'});
            }
        }
    }



    /**
     * Calculates M2 Vendor Bill Amount
     * Formula: Originator Payment Total * Originator M2 Vendor Bill %
     *
     * @param project - NS Project Record
     * @param customCalc - boolean value, if marked true, vendor bill amount will be processed via custom script per client
     * @returns - Originator M2 Vendor Bill Amount
     */
    function getOriginatorM2VendorBillAmount(project, customCalc, scheduleAmounts, projectDataObj) {
        var originatorM2VendorBillPerc = (project.getValue('custentity_bb_orgntr_m2_vbill_perc')) ? project.getValue('custentity_bb_orgntr_m2_vbill_perc') :
            ((projectDataObj.custentity_bb_orgntr_m2_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_orgntr_m2_vbill_perc) : 0);

        var origProjPaymentTotal = (project.getValue('custentity_bb_orgntr_payment_tot_amt')) ? project.getValue('custentity_bb_orgntr_payment_tot_amt') :
            ((projectDataObj.custentity_bb_orgntr_payment_tot_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_payment_tot_amt) : 0);

        if (!customCalc) {
            if (scheduleAmounts) {
                var origGrandPaymentTotal = origProjPaymentTotal - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount;
                if (scheduleAmounts.m2Amount > 0) {
                    return scheduleAmounts.m2Amount;
                } else {
                    return parseFloat(origGrandPaymentTotal * originatorM2VendorBillPerc / 100).toFixed(2);
                }
            } else {
                return parseFloat(origProjPaymentTotal * originatorM2VendorBillPerc / 100).toFixed(2);
            }
        } else {
            if (scheduleAmounts) {
                if (scheduleAmounts.m2Amount > 0) {
                    return scheduleAmounts.m2Amount
                } else {
                    return project.getValue({fieldId: 'custentity_bb_orgntr_m2_vbill_amt'});
                }
            } else {
                return project.getValue({fieldId: 'custentity_bb_orgntr_m2_vbill_amt'});
            }
        }
    }





    /**
     * Calculates M3 Vendor Bill Amount
     * Formula: Originator Payment Total * Originator M3 Vendor Bill %
     *
     * @param project - NS Project Record
     * @param customCalc - boolean value, if marked true, vendor bill amount will be processed via custom script per client
     * @returns - Originator M3 Vendor Bill Amount
     */
    function getOriginatorM3VendorBillAmount(project, customCalc, scheduleAmounts, projectDataObj) {
        var originatorM3VendorBillPerc = (project.getValue('custentity_bb_orgntr_m3_vbill_perc')) ? project.getValue('custentity_bb_orgntr_m3_vbill_perc') :
            ((projectDataObj.custentity_bb_orgntr_m3_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_orgntr_m3_vbill_perc) : 0);

        var origProjPaymentTotal = (project.getValue('custentity_bb_orgntr_payment_tot_amt')) ? project.getValue('custentity_bb_orgntr_payment_tot_amt') :
            ((projectDataObj.custentity_bb_orgntr_payment_tot_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_payment_tot_amt) : 0);

        if (!customCalc) {
            if (scheduleAmounts) {
                var origGrandPaymentTotal = origProjPaymentTotal - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount;
                if (scheduleAmounts.m3Amount > 0) {
                    return scheduleAmounts.m3Amount;
                } else {
                    return parseFloat(origGrandPaymentTotal * originatorM3VendorBillPerc / 100).toFixed(2);
                }
            } else {
                return parseFloat(origProjPaymentTotal * originatorM3VendorBillPerc / 100).toFixed(2);
            }
        } else {
            if (scheduleAmounts) {
                if (scheduleAmounts.m3Amount > 0) {
                    return scheduleAmounts.m3Amount;
                } else {
                    return project.getValue({fieldId: 'custentity_bb_orgntr_m3_vbill_amt'});
                }
            } else {
                return project.getValue({fieldId: 'custentity_bb_orgntr_m3_vbill_amt'});
            }
        }
    }


    /**
     * Calculates M4 Vendor Bill Amount
     * Formula: Originator Payment Total * Originator M4 Vendor Bill %
     *
     * @param project - NS Project Record
     * @param customCalc - boolean value, if marked true, vendor bill amount will be processed via custom script per client
     * @returns - Originator M4 Vendor Bill Amount
     */
    function getOriginatorM4VendorBillAmount(project, customCalc, scheduleAmounts, projectDataObj) {
        var originatorM4VendorBillPerc = (project.getValue('custentity_bb_orgntr_m4_vbill_perc')) ? project.getValue('custentity_bb_orgntr_m4_vbill_perc') :
            ((projectDataObj.custentity_bb_orgntr_m4_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_orgntr_m4_vbill_perc) : 0);

        var origProjPaymentTotal = (project.getValue('custentity_bb_orgntr_payment_tot_amt')) ? project.getValue('custentity_bb_orgntr_payment_tot_amt') :
            ((projectDataObj.custentity_bb_orgntr_payment_tot_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_payment_tot_amt) : 0);

        if (!customCalc) {
            if (scheduleAmounts) {
                var origGrandPaymentTotal = origProjPaymentTotal - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount -
                    scheduleAmounts.m4Amount - scheduleAmounts.m5Amount - scheduleAmounts.m6Amount - scheduleAmounts.m7Amount;
                if (scheduleAmounts.m4Amount > 0) {
                    return scheduleAmounts.m4Amount;
                } else {
                    return parseFloat(origGrandPaymentTotal * originatorM4VendorBillPerc / 100).toFixed(2);
                }
            } else {
                return parseFloat(origProjPaymentTotal * originatorM4VendorBillPerc / 100).toFixed(2);
            }
        } else {
            if (scheduleAmounts) {
                if (scheduleAmounts.m4Amount > 0) {
                    return scheduleAmounts.m4Amount;
                } else {
                    return project.getValue({fieldId: 'custentity_bb_orgntr_m4_vbill_amt'});
                }
            } else {
                return project.getValue({fieldId: 'custentity_bb_orgntr_m4_vbill_amt'});
            }
        }
    }


    /**
     * Calculates M5 Vendor Bill Amount
     * Formula: Originator Payment Total * Originator M5 Vendor Bill %
     *
     * @param project - NS Project Record
     * @param customCalc - boolean value, if marked true, vendor bill amount will be processed via custom script per client
     * @returns - Originator M5 Vendor Bill Amount
     */
    function getOriginatorM5VendorBillAmount(project, customCalc, scheduleAmounts, projectDataObj) {
        var originatorM5VendorBillPerc = (project.getValue('custentity_bb_orgntr_m5_vbill_perc')) ? project.getValue('custentity_bb_orgntr_m5_vbill_perc') :
            ((projectDataObj.custentity_bb_orgntr_m5_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_orgntr_m5_vbill_perc) : 0);

        var origProjPaymentTotal = (project.getValue('custentity_bb_orgntr_payment_tot_amt')) ? project.getValue('custentity_bb_orgntr_payment_tot_amt') :
            ((projectDataObj.custentity_bb_orgntr_payment_tot_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_payment_tot_amt) : 0);

        if (!customCalc) {
            if (scheduleAmounts) {
                var origGrandPaymentTotal = origProjPaymentTotal - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount -
                    scheduleAmounts.m4Amount - scheduleAmounts.m5Amount - scheduleAmounts.m6Amount - scheduleAmounts.m7Amount;
                if (scheduleAmounts.m5Amount > 0) {
                    return scheduleAmounts.m5Amount;
                } else {
                    return parseFloat(origGrandPaymentTotal * originatorM5VendorBillPerc / 100).toFixed(2);
                }
            } else {
                return parseFloat(origProjPaymentTotal * originatorM5VendorBillPerc / 100).toFixed(2);
            }
        } else {
            if (scheduleAmounts) {
                if (scheduleAmounts.m5Amount > 0) {
                    return scheduleAmounts.m5Amount;
                } else {
                    return project.getValue({fieldId: 'custentity_bb_orgntr_m5_vbill_amt'});
                }
            } else {
                return project.getValue({fieldId: 'custentity_bb_orgntr_m5_vbill_amt'});
            }
        }
    }


    /**
     * Calculates M6 Vendor Bill Amount
     * Formula: Originator Payment Total * Originator M6 Vendor Bill %
     *
     * @param project - NS Project Record
     * @param customCalc - boolean value, if marked true, vendor bill amount will be processed via custom script per client
     * @returns - Originator M6 Vendor Bill Amount
     */
    function getOriginatorM6VendorBillAmount(project, customCalc, scheduleAmounts, projectDataObj) {
        var originatorM6VendorBillPerc = (project.getValue('custentity_bb_orgntr_m6_vbill_perc')) ? project.getValue('custentity_bb_orgntr_m6_vbill_perc') :
            ((projectDataObj.custentity_bb_orgntr_m6_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_orgntr_m6_vbill_perc) : 0);

        var origProjPaymentTotal = (project.getValue('custentity_bb_orgntr_payment_tot_amt')) ? project.getValue('custentity_bb_orgntr_payment_tot_amt') :
            ((projectDataObj.custentity_bb_orgntr_payment_tot_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_payment_tot_amt) : 0);

        if (!customCalc) {
            if (scheduleAmounts) {
                var origGrandPaymentTotal = origProjPaymentTotal - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount -
                    scheduleAmounts.m4Amount - scheduleAmounts.m5Amount - scheduleAmounts.m6Amount - scheduleAmounts.m7Amount;
                if (scheduleAmounts.m6Amount > 0) {
                    return scheduleAmounts.m6Amount;
                } else {
                    return parseFloat(origGrandPaymentTotal * originatorM6VendorBillPerc / 100).toFixed(2);
                }
            } else {
                return parseFloat(origProjPaymentTotal * originatorM6VendorBillPerc / 100).toFixed(2);
            }
        } else {
            if (scheduleAmounts) {
                if (scheduleAmounts.m6Amount > 0) {
                    return scheduleAmounts.m6Amount;
                } else {
                    return project.getValue({fieldId: 'custentity_bb_orgntr_m6_vbill_amt'});
                }
            } else {
                return project.getValue({fieldId: 'custentity_bb_orgntr_m6_vbill_amt'});
            }
        }
    }


    /**
     * Calculates M7 Vendor Bill Amount
     * Formula: Originator Payment Total * Originator M7 Vendor Bill %
     *
     * @param project - NS Project Record
     * @param customCalc - boolean value, if marked true, vendor bill amount will be processed via custom script per client
     * @returns - Originator M7 Vendor Bill Amount
     */
    function getOriginatorM7VendorBillAmount(project, customCalc, scheduleAmounts, projectDataObj) {
        var originatorM7VendorBillPerc = (project.getValue('custentity_bb_orgntr_m7_vbill_perc')) ? project.getValue('custentity_bb_orgntr_m7_vbill_perc') :
            ((projectDataObj.custentity_bb_orgntr_m7_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_orgntr_m7_vbill_perc) : 0);

        var origProjPaymentTotal = (project.getValue('custentity_bb_orgntr_payment_tot_amt')) ? project.getValue('custentity_bb_orgntr_payment_tot_amt') :
            ((projectDataObj.custentity_bb_orgntr_payment_tot_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_payment_tot_amt) : 0);

        if (!customCalc) {
            if (scheduleAmounts) {
                var origGrandPaymentTotal = origProjPaymentTotal - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount -
                    scheduleAmounts.m4Amount - scheduleAmounts.m5Amount - scheduleAmounts.m6Amount - scheduleAmounts.m7Amount;
                if (scheduleAmounts.m7Amount > 0) {
                    return scheduleAmounts.m7Amount;
                } else {
                    return parseFloat(origGrandPaymentTotal * originatorM7VendorBillPerc / 100).toFixed(2);
                }
            } else {
                return parseFloat(origProjPaymentTotal * originatorM7VendorBillPerc / 100).toFixed(2);
            }
        } else {
            if (scheduleAmounts) {
                if (scheduleAmounts.m7Amount > 0) {
                    return scheduleAmounts.m7Amount;
                } else {
                    return project.getValue({fieldId: 'custentity_bb_orgntr_m7_vbill_amt'});
                }
            } else {
                return project.getValue({fieldId: 'custentity_bb_orgntr_m7_vbill_amt'});
            }
        }
    }

    /**
     * Calculates the vendor bill and bill credit totals for both originator and installer sets those totals on the project when the originator or installer vendors are populted
     * @param project - NS Project Record
     * @param projectDataObj - NS Project Search Object containing values related to project
     * @returns - void
     */
    function calculateBillAndBillCreditTotals(project, projectDataObj) {
        var originatorBillTotal = 0;
        var originatorCreditTotal = 0;
        var installerBillTotal = 0;
        var installerCreditTotal = 0;
        var originatorVendor = (project.getValue('custentity_bb_originator_vendor')) ? project.getValue('custentity_bb_originator_vendor') :
            ((projectDataObj.custentity_bb_originator_vendor) ? projectDataObj.custentity_bb_originator_vendor : null);
        var installerVendor = (project.getValue('custentity_bb_installer_partner_vendor')) ? project.getValue('custentity_bb_installer_partner_vendor') :
            ((projectDataObj.custentity_bb_installer_partner_vendor) ? projectDataObj.custentity_bb_installer_partner_vendor : null);
        if (originatorVendor || installerVendor) {
            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["mainline","is","T"],
                        "AND",
                        ["type","anyof","VendBill","VendCred"],
                        "AND",
                        ["custbody_bb_project","anyof",project.id]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "type",
                            summary: "GROUP",
                            label: "Type"
                        }),
                        search.createColumn({
                            name: "entity",
                            summary: "GROUP",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "custbody_bb_project",
                            summary: "GROUP",
                            label: "Project"
                        }),
                        search.createColumn({
                            name: "amount",
                            summary: "SUM",
                            label: "Amount"
                        })
                    ]
            });
            transactionSearchObj.run().each(function(result){
                log.audit('transaction type', result.getValue({name: 'type', summary: 'GROUP'}));
                if (result.getValue({name: 'type', summary: 'GROUP'}) == 'VendBill') {
                    if (result.getValue({name: 'entity', summary: 'GROUP'}) == originatorVendor) {
                        originatorBillTotal = parseFloat(result.getValue({name: 'amount', summary: 'SUM'}));
                        project.setValue({fieldId: 'custentity_bb_orig_vend_bill_total', value: result.getValue({name: 'amount', summary: 'SUM'})})
                    }
                    if (result.getValue({name: 'entity', summary: 'GROUP'}) == installerVendor) {
                        installerBillTotal = parseFloat(result.getValue({name: 'amount', summary: 'SUM'}));
                        project.setValue({fieldId: 'custentity_bb_subinstl_vend_bill_total', value: result.getValue({name: 'amount', summary: 'SUM'})})
                    }
                } else {
                    if (result.getValue({name: 'entity', summary: 'GROUP'}) == originatorVendor) {
                        originatorCreditTotal = parseFloat(result.getValue({name: 'amount', summary: 'SUM'}));
                        project.setValue({fieldId: 'custentity_bb_orig_vend_credit_total', value: result.getValue({name: 'amount', summary: 'SUM'})})
                    }
                    if (result.getValue({name: 'entity', summary: 'GROUP'}) == installerVendor) {
                        installerCreditTotal = parseFloat(result.getValue({name: 'amount', summary: 'SUM'}));
                        project.setValue({fieldId: 'custentity_bb_subinstl_vend_credit_total', value: result.getValue({name: 'amount', summary: 'SUM'})})
                    }
                }
                return true;
            });
        } else {
            project.setValue({fieldId: 'custentity_bb_orig_vend_bill_total', value: 0});
            project.setValue({fieldId: 'custentity_bb_subinstl_vend_bill_total', value: 0});
            project.setValue({fieldId: 'custentity_bb_orig_vend_credit_total', value: 0});
            project.setValue({fieldId: 'custentity_bb_subinstl_vend_credit_total', value: 0});
        }
        // adding totals because the amounts for the credits are negative
        var originatorTotal = originatorBillTotal + originatorCreditTotal;
        var installerTotal = installerBillTotal + installerCreditTotal;
        project.setValue({fieldId: 'custentity_bb_orig_payout_total', value: originatorTotal});
        project.setValue({fieldId: 'custentity_bb_install_payout_total', value: installerTotal});
    }


    /**
     * Gets the Originator Vendor Bill Total when Pre set Amounts are populated
     * Formula: Vendor Bill Payment Total - Originator Vendor Bill Preset Amounts
     *
     * @param project - NS Project Record
     * @returns - Originator Vendor Bill Amount - Preset Amounts for calculation
     */

    function getCalculatedOrigVendorBillAmountWithPresets(project, scheduleId, projectDataObj) {
        var m0PresetAmount = 0.00;
        var m1PresetAmount = 0.00;
        var m2PresetAmount = 0.00;
        var m3PresetAmount = 0.00;
        var m4PresetAmount = 0.00;
        var m5PresetAmount = 0.00;
        var m6PresetAmount = 0.00;
        var m7PresetAmount = 0.00;
        var originatorPaymentTotal = 0.00;
        var newOriginatorPaymentAmount = 0.00;

        if (!scheduleId) {
            if (projectDataObj) {
                if (projectDataObj.custentity_bb_sales_partner_pay_schedule) {
                    scheduleId = projectDataObj.custentity_bb_sales_partner_pay_schedule;
                }
            }
        }

        var scheduleAmounts = getSchedulePresetMilestoneAmounts(scheduleId);
        if (scheduleAmounts) {
            m0PresetAmount = (scheduleAmounts.m0Amount) ? parseFloat(scheduleAmounts.m0Amount) : 0.00;
            m1PresetAmount = (scheduleAmounts.m1Amount) ? parseFloat(scheduleAmounts.m1Amount) : 0.00;
            m2PresetAmount = (scheduleAmounts.m2Amount) ? parseFloat(scheduleAmounts.m2Amount) : 0.00;
            m3PresetAmount = (scheduleAmounts.m3Amount) ? parseFloat(scheduleAmounts.m3Amount) : 0.00;
            m4PresetAmount = (scheduleAmounts.m4Amount) ? parseFloat(scheduleAmounts.m4Amount) : 0.00;
            m5PresetAmount = (scheduleAmounts.m5Amount) ? parseFloat(scheduleAmounts.m5Amount) : 0.00;
            m6PresetAmount = (scheduleAmounts.m6Amount) ? parseFloat(scheduleAmounts.m6Amount) : 0.00;
            m7PresetAmount = (scheduleAmounts.m7Amount) ? parseFloat(scheduleAmounts.m7Amount) : 0.00;
        }

        originatorPaymentTotal = (project.getValue('custentity_bb_orgntr_payment_tot_amt')) ? project.getValue('custentity_bb_orgntr_payment_tot_amt') :
            ((projectDataObj) ? parseFloat(projectDataObj.custentity_bb_orgntr_payment_tot_amt) : 0);


        newOriginatorPaymentAmount = originatorPaymentTotal - m0PresetAmount - m1PresetAmount - m2PresetAmount - m3PresetAmount -
            m4PresetAmount - m5PresetAmount - m6PresetAmount - m7PresetAmount;

        return newOriginatorPaymentAmount;
    }


    /**
     * Calculates Originator Total Vendor Bill Amount
     * Formula: Originator M0 Vendor Bill Amount + Originator M1 Vendor Bill Amount
     * + Originator M2 Vendor Bill Amount + Originator M3 Vendor Bill Amount
     *
     * @param project - NS Project Record
     * @returns - Originator Total Vendor Bill Amount
     */
    function getOriginatorTotalVendorBillAmount(project, projectDataObj) {
        var originatorM0VendorBillAmount = (project.getValue('custentity_bb_orgntr_m0_vbill_amt')) ? project.getValue('custentity_bb_orgntr_m0_vbill_amt') :
            ((projectDataObj.custentity_bb_orgntr_m0_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_m0_vbill_amt) : 0);

        var originatorM1VendorBillAmount = (project.getValue('custentity_bb_orgntr_m1_vbill_amt')) ? project.getValue('custentity_bb_orgntr_m1_vbill_amt') :
            ((projectDataObj.custentity_bb_orgntr_m1_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_m1_vbill_amt) : 0);

        var originatorM2VendorBillAmount = (project.getValue('custentity_bb_orgntr_m2_vbill_amt')) ? project.getValue('custentity_bb_orgntr_m2_vbill_amt') :
            ((projectDataObj.custentity_bb_orgntr_m2_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_m2_vbill_amt) : 0);

        var originatorM3VendorBillAmount = (project.getValue('custentity_bb_orgntr_m3_vbill_amt')) ? project.getValue('custentity_bb_orgntr_m3_vbill_amt') :
            ((projectDataObj.custentity_bb_orgntr_m3_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_m3_vbill_amt) : 0);

        var originatorM4VendorBillAmount = (project.getValue('custentity_bb_orgntr_m4_vbill_amt')) ? project.getValue('custentity_bb_orgntr_m4_vbill_amt') :
            ((projectDataObj.custentity_bb_orgntr_m4_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_m4_vbill_amt) : 0);

        var originatorM5VendorBillAmount = (project.getValue('custentity_bb_orgntr_m5_vbill_amt')) ? project.getValue('custentity_bb_orgntr_m5_vbill_amt') :
            ((projectDataObj.custentity_bb_orgntr_m5_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_m5_vbill_amt) : 0);

        var originatorM6VendorBillAmount = (project.getValue('custentity_bb_orgntr_m6_vbill_amt')) ? project.getValue('custentity_bb_orgntr_m6_vbill_amt') :
            ((projectDataObj.custentity_bb_orgntr_m6_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_m6_vbill_amt) : 0);

        var originatorM7VendorBillAmount = (project.getValue('custentity_bb_orgntr_m7_vbill_amt')) ? project.getValue('custentity_bb_orgntr_m7_vbill_amt') :
            ((projectDataObj.custentity_bb_orgntr_m7_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_orgntr_m7_vbill_amt) : 0);

        var totalBillAmount = parseFloat(originatorM0VendorBillAmount) + parseFloat(originatorM1VendorBillAmount)
            + parseFloat(originatorM2VendorBillAmount) + parseFloat(originatorM3VendorBillAmount)
            + parseFloat(originatorM4VendorBillAmount) + parseFloat(originatorM5VendorBillAmount)
            + parseFloat(originatorM6VendorBillAmount) + parseFloat(originatorM7VendorBillAmount);

        return totalBillAmount;
    }



    /**
     * Calculates Installer Sub-contractor Amount
     * Formula: Installer Sub-contractor price / watt * system size * 1000
     *
     * @param project - NS Project Record
     * @returns - Installer Sub-contractor amount
     */
    function getInstallerSubContractorAmount(project, projectDataObj) {
        var installerPricePerWatt = (project.getValue('custentity_bb_installer_price_p_w')) ? project.getValue('custentity_bb_installer_price_p_w') :
            ((projectDataObj.custentity_bb_installer_price_p_w) ? parseFloat(projectDataObj.custentity_bb_installer_price_p_w) : 0);

        var systemSize = (project.getValue('custentity_bb_system_size_decimal')) ? project.getValue('custentity_bb_system_size_decimal') :
            ((projectDataObj.custentity_bb_system_size_decimal) ? parseFloat(projectDataObj.custentity_bb_system_size_decimal) : 0);

        return parseFloat(parseFloat(installerPricePerWatt) * systemSize * 1000).toFixed(2);
    }





    /**
     * Calculates Installer Sub-contractor Total Payment
     * Formula: Installer Sub-contractor Amount + Installer Sub-contractor Adder Total
     *
     * @param project - NS Project Record
     * @returns - Installer Total Payment
     */
    function getInstallerTotalPayment(project, projectDataObj) {
        var installerSubContractorAmount = (project.getValue('custentity_bb_installer_amt')) ? project.getValue('custentity_bb_installer_amt') :
            ((projectDataObj.custentity_bb_installer_amt) ? parseFloat(projectDataObj.custentity_bb_installer_amt) : 0);

        var installerSubContractorAdderTtlAmt = (project.getValue('custentity_bb_installer_adder_total_amt')) ? project.getValue('custentity_bb_installer_adder_total_amt') :
            ((projectDataObj.custentity_bb_installer_adder_total_amt) ? parseFloat(projectDataObj.custentity_bb_installer_adder_total_amt) : 0);

        var installerOverridePaymentTotal = (project.getValue('custentity_bb_install_pay_total_ovrd_amt')) ? project.getValue('custentity_bb_install_pay_total_ovrd_amt') :
            ((projectDataObj.custentity_bb_install_pay_total_ovrd_amt) ? parseFloat(projectDataObj.custentity_bb_install_pay_total_ovrd_amt) : 0);
        if (installerOverridePaymentTotal) {
            return installerOverridePaymentTotal;
        } else {
            return parseFloat(installerSubContractorAmount) + parseFloat(installerSubContractorAdderTtlAmt);
        }
    }



    /**
     * Calculates Installer Sub-contractor total payment / watt
     * Formula: Installer sub-contractor total payment / system size * 1000
     *
     * @param project - NS Project Record
     * @returns - Installer Total Payment / Watt
     */
    function getInstallerTotalPaymentPerWatt(project, projectDataObj) {
        var installerSubContrTtlPymtAmt = (project.getValue('custentity_bb_installer_total_pay_amt')) ? project.getValue('custentity_bb_installer_total_pay_amt') :
            ((projectDataObj.custentity_bb_installer_total_pay_amt) ? parseFloat(projectDataObj.custentity_bb_installer_total_pay_amt) : 0);

        var systemSize = (project.getValue('custentity_bb_system_size_decimal')) ? project.getValue('custentity_bb_system_size_decimal') :
            ((projectDataObj.custentity_bb_system_size_decimal) ? parseFloat(projectDataObj.custentity_bb_system_size_decimal) : 0);

        if (systemSize == 0) {
            return 0;
        }

        return parseFloat(parseFloat(installerSubContrTtlPymtAmt) / (systemSize * 1000)).toFixed(2);
    }


    /**
     * Calculates Installer Sub-contractor M0 Vendor Bill Amount
     * Formula: Installer Sub-contractor Payment Total * Installer Sub-contractor M0 Vendor Bill %
     *
     * @param project - NS Project Record
     * @returns - Installer Sub-contractor M0 Vendor Bill Amount
     */
    function getInstallerSubContrM0VBillAmt(project, scheduleAmounts, projectDataObj) {
        var installerSubContrTtlPymtAmt = (project.getValue('custentity_bb_installer_total_pay_amt')) ? project.getValue('custentity_bb_installer_total_pay_amt') :
            ((projectDataObj.custentity_bb_installer_total_pay_amt) ? parseFloat(projectDataObj.custentity_bb_installer_total_pay_amt) : 0);

        var installerSubContrM0VBillPerc = (project.getValue('custentity_bb_installer_m0_vbill_perc')) ? project.getValue('custentity_bb_installer_m0_vbill_perc') :
            ((projectDataObj.custentity_bb_installer_m0_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_installer_m0_vbill_perc) : 0);

        if (scheduleAmounts) {
            if (scheduleAmounts.m0Amount > 0) {
                return scheduleAmounts.m0Amount;
            } else {
                var installGrandTotal = installerSubContrTtlPymtAmt - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount -
                    scheduleAmounts.m4Amount - scheduleAmounts.m5Amount - scheduleAmounts.m6Amount - scheduleAmounts.m7Amount;
                return installGrandTotal * installerSubContrM0VBillPerc / 100;
            }

        } else {
            return parseFloat(installerSubContrTtlPymtAmt * installerSubContrM0VBillPerc / 100).toFixed(2);
        }
    }


    /**
     * Calculates Installer Sub-contractor M1 Vendor Bill Amount
     * Formula: Installer Sub-contractor Payment Total * Installer Sub-contractor M1 Vendor Bill %
     *
     * @param project - NS Project Record
     * @returns - Installer Sub-contractor M1 Vendor Bill Amount
     */
    function getInstallerSubContrM1VBillAmt(project, scheduleAmounts, projectDataObj) {
        var installerSubContrTtlPymtAmt = (project.getValue('custentity_bb_installer_total_pay_amt')) ? project.getValue('custentity_bb_installer_total_pay_amt') :
            ((projectDataObj.custentity_bb_installer_total_pay_amt) ? parseFloat(projectDataObj.custentity_bb_installer_total_pay_amt) : 0);

        var installerSubContrM1VBillPerc = (project.getValue('custentity_bb_installer_m1_vbill_perc')) ? project.getValue('custentity_bb_installer_m1_vbill_perc') :
            ((projectDataObj.custentity_bb_installer_m1_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_installer_m1_vbill_perc) : 0);

        if (scheduleAmounts) {
            if (scheduleAmounts.m1Amount > 0) {
                return scheduleAmounts.m1Amount;
            } else {
                var installGrandTotal = installerSubContrTtlPymtAmt - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount -
                    scheduleAmounts.m4Amount - scheduleAmounts.m5Amount - scheduleAmounts.m6Amount - scheduleAmounts.m7Amount;
                return installGrandTotal * installerSubContrM1VBillPerc / 100;
            }
        } else {
            return parseFloat(installerSubContrTtlPymtAmt * installerSubContrM1VBillPerc / 100).toFixed(2);
        }

    }


    /**
     * Calculates Installer Sub-contractor M2 Vendor Bill Amount
     * Formula: Installer Sub-contractor Payment Total * Installer Sub-contractor M2 Vendor Bill %
     *
     * @param project - NS Project Record
     * @returns - Installer Sub-contractor M2 Vendor Bill Amount
     */
    function getInstallerSubContrM2VBillAmt(project, scheduleAmounts, projectDataObj) {
        var installerSubContrTtlPymtAmt = (project.getValue('custentity_bb_installer_total_pay_amt')) ? project.getValue('custentity_bb_installer_total_pay_amt') :
            ((projectDataObj.custentity_bb_installer_total_pay_amt) ? parseFloat(projectDataObj.custentity_bb_installer_total_pay_amt) : 0);

        var installerSubContrM2VBillPerc = (project.getValue('custentity_bb_installer_m2_vbill_perc')) ? project.getValue('custentity_bb_installer_m2_vbill_perc') :
            ((projectDataObj.custentity_bb_installer_m2_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_installer_m2_vbill_perc) : 0);

        if (scheduleAmounts) {
            if (scheduleAmounts.m2Amount > 0) {
                return scheduleAmounts.m2Amount;
            } else {
                var installGrandTotal = installerSubContrTtlPymtAmt - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount -
                    scheduleAmounts.m4Amount - scheduleAmounts.m5Amount - scheduleAmounts.m6Amount - scheduleAmounts.m7Amount;
                return installGrandTotal * installerSubContrM2VBillPerc / 100;
            }
        } else {
            return parseFloat(installerSubContrTtlPymtAmt * installerSubContrM2VBillPerc / 100).toFixed(2);
        }

    }


    /**
     * Calculates Installer Sub-contractor M3 Vendor Bill Amount
     * Formula: Installer Sub-contractor Payment Total * Installer Sub-contractor M3 Vendor Bill %
     *
     * @param project - NS Project Record
     * @returns - Installer Sub-contractor M3 Vendor Bill Amount
     */
    function getInstallerSubContrM3VBillAmt(project, scheduleAmounts, projectDataObj) {
        var installerSubContrTtlPymtAmt = (project.getValue('custentity_bb_installer_total_pay_amt')) ? project.getValue('custentity_bb_installer_total_pay_amt') :
            ((projectDataObj.custentity_bb_installer_total_pay_amt) ? parseFloat(projectDataObj.custentity_bb_installer_total_pay_amt) : 0);

        var installerSubContrM3VBillPerc = (project.getValue('custentity_bb_installer_m3_vbill_perc')) ? project.getValue('custentity_bb_installer_m3_vbill_perc') :
            ((projectDataObj.custentity_bb_installer_m3_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_installer_m3_vbill_perc) : 0);

        if (scheduleAmounts) {
            if (scheduleAmounts.m3Amount > 0) {
                return scheduleAmounts.m3Amount;
            } else {
                var installGrandTotal = installerSubContrTtlPymtAmt - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount -
                    scheduleAmounts.m4Amount - scheduleAmounts.m5Amount - scheduleAmounts.m6Amount - scheduleAmounts.m7Amount;
                return installGrandTotal * installerSubContrM3VBillPerc / 100;
            }
        } else {
            return parseFloat(installerSubContrTtlPymtAmt * installerSubContrM3VBillPerc / 100).toFixed(2);
        }
    }


    /**
     * Calculates Installer Sub-contractor M4 Vendor Bill Amount
     * Formula: Installer Sub-contractor Payment Total * Installer Sub-contractor M4 Vendor Bill %
     *
     * @param project - NS Project Record
     * @returns - Installer Sub-contractor M4 Vendor Bill Amount
     */
    function getInstallerSubContrM4VBillAmt(project, scheduleAmounts, projectDataObj) {
        var installerSubContrTtlPymtAmt = (project.getValue('custentity_bb_installer_total_pay_amt')) ? project.getValue('custentity_bb_installer_total_pay_amt') :
            ((projectDataObj.custentity_bb_installer_total_pay_amt) ? parseFloat(projectDataObj.custentity_bb_installer_total_pay_amt) : 0);

        var installerSubContrM4VBillPerc = (project.getValue('custentity_bb_installer_m4_vbill_perc')) ? project.getValue('custentity_bb_installer_m4_vbill_perc') :
            ((projectDataObj.custentity_bb_installer_m4_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_installer_m4_vbill_perc) : 0);

        if (scheduleAmounts) {
            if (scheduleAmounts.m4Amount > 0) {
                return scheduleAmounts.m4Amount;
            } else {
                var installGrandTotal = installerSubContrTtlPymtAmt - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount
                    - scheduleAmounts.m4Amount - scheduleAmounts.m5Amount - scheduleAmounts.m6Amount - scheduleAmounts.m7Amount;
                return installGrandTotal * installerSubContrM4VBillPerc / 100;
            }
        } else {
            return parseFloat(installerSubContrTtlPymtAmt * installerSubContrM4VBillPerc / 100).toFixed(2);
        }
    }


    /**
     * Calculates Installer Sub-contractor M5 Vendor Bill Amount
     * Formula: Installer Sub-contractor Payment Total * Installer Sub-contractor M5 Vendor Bill %
     *
     * @param project - NS Project Record
     * @returns - Installer Sub-contractor M5 Vendor Bill Amount
     */
    function getInstallerSubContrM5VBillAmt(project, scheduleAmounts, projectDataObj) {
        var installerSubContrTtlPymtAmt = (project.getValue('custentity_bb_installer_total_pay_amt')) ? project.getValue('custentity_bb_installer_total_pay_amt') :
            ((projectDataObj.custentity_bb_installer_total_pay_amt) ? parseFloat(projectDataObj.custentity_bb_installer_total_pay_amt) : 0);

        var installerSubContrM5VBillPerc = (project.getValue('custentity_bb_installer_m5_vbill_perc')) ? project.getValue('custentity_bb_installer_m5_vbill_perc') :
            ((projectDataObj.custentity_bb_installer_m5_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_installer_m5_vbill_perc) : 0);

        if (scheduleAmounts) {
            if (scheduleAmounts.m5Amount > 0) {
                return scheduleAmounts.m5Amount;
            } else {
                var installGrandTotal = installerSubContrTtlPymtAmt - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount
                    - scheduleAmounts.m4Amount - scheduleAmounts.m5Amount - scheduleAmounts.m6Amount - scheduleAmounts.m7Amount;
                return installGrandTotal * installerSubContrM5VBillPerc / 100;
            }
        } else {
            return parseFloat(installerSubContrTtlPymtAmt * installerSubContrM5VBillPerc / 100).toFixed(2);
        }
    }


    /**
     * Calculates Installer Sub-contractor M6 Vendor Bill Amount
     * Formula: Installer Sub-contractor Payment Total * Installer Sub-contractor M6 Vendor Bill %
     *
     * @param project - NS Project Record
     * @returns - Installer Sub-contractor M6 Vendor Bill Amount
     */
    function getInstallerSubContrM6VBillAmt(project, scheduleAmounts, projectDataObj) {
        var installerSubContrTtlPymtAmt = (project.getValue('custentity_bb_installer_total_pay_amt')) ? project.getValue('custentity_bb_installer_total_pay_amt') :
            ((projectDataObj.custentity_bb_installer_total_pay_amt) ? parseFloat(projectDataObj.custentity_bb_installer_total_pay_amt) : 0);

        var installerSubContrM6VBillPerc = (project.getValue('custentity_bb_installer_m6_vbill_perc')) ? project.getValue('custentity_bb_installer_m6_vbill_perc') :
            ((projectDataObj.custentity_bb_installer_m6_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_installer_m6_vbill_perc) : 0);

        if (scheduleAmounts) {
            if (scheduleAmounts.m6Amount > 0) {
                return scheduleAmounts.m6Amount;
            } else {
                var installGrandTotal = installerSubContrTtlPymtAmt - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount
                    - scheduleAmounts.m4Amount - scheduleAmounts.m5Amount - scheduleAmounts.m6Amount - scheduleAmounts.m7Amount;
                return installGrandTotal * installerSubContrM6VBillPerc / 100;
            }
        } else {
            return parseFloat(installerSubContrTtlPymtAmt * installerSubContrM6VBillPerc / 100).toFixed(2);
        }
    }


    /**
     * Calculates Installer Sub-contractor M7 Vendor Bill Amount
     * Formula: Installer Sub-contractor Payment Total * Installer Sub-contractor M7 Vendor Bill %
     *
     * @param project - NS Project Record
     * @returns - Installer Sub-contractor M7 Vendor Bill Amount
     */
    function getInstallerSubContrM7VBillAmt(project, scheduleAmounts, projectDataObj) {
        var installerSubContrTtlPymtAmt = (project.getValue('custentity_bb_installer_total_pay_amt')) ? project.getValue('custentity_bb_installer_total_pay_amt') :
            ((projectDataObj.custentity_bb_installer_total_pay_amt) ? parseFloat(projectDataObj.custentity_bb_installer_total_pay_amt) : 0);

        var installerSubContrM7VBillPerc = (project.getValue('custentity_bb_installer_m7_vbill_perc')) ? project.getValue('custentity_bb_installer_m7_vbill_perc') :
            ((projectDataObj.custentity_bb_installer_m7_vbill_perc) ? parseFloat(projectDataObj.custentity_bb_installer_m7_vbill_perc) : 0);

        if (scheduleAmounts) {
            if (scheduleAmounts.m7Amount > 0) {
                return scheduleAmounts.m7Amount;
            } else {
                var installGrandTotal = installerSubContrTtlPymtAmt - scheduleAmounts.m0Amount - scheduleAmounts.m1Amount - scheduleAmounts.m2Amount - scheduleAmounts.m3Amount
                    - scheduleAmounts.m4Amount - scheduleAmounts.m5Amount - scheduleAmounts.m6Amount - scheduleAmounts.m7Amount;
                return installGrandTotal * installerSubContrM7VBillPerc / 100;
            }
        } else {
            return parseFloat(installerSubContrTtlPymtAmt * installerSubContrM7VBillPerc / 100).toFixed(2);
        }
    }



    /**
     * Calculates Installer Sub-contractor Total Vendor Bill Amount
     * Formula: Installer Sub-contractor M0 Vendor Bill Amount + Installer Sub-contractor M1 Vendor Bill Amount
     * + Installer Sub-contractor M2 Vendor Bill Amount + Installer Sub-contractor M3 Vendor Bill Amount
     *
     * @param project - NS Project Record
     * @returns - Installer Sub-contractor total vendor bill amount
     */
    function getInstallerTotalVBillAmount(project, projectDataObj) {
        var installerSubContrM0VBillAmt = (project.getValue('custentity_bb_installer_m0_vbill_amt')) ? project.getValue('custentity_bb_installer_m0_vbill_amt') :
            ((projectDataObj.custentity_bb_installer_m0_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_installer_m0_vbill_amt) : 0);

        var installerSubContrM1VBillAmt = (project.getValue('custentity_bb_installer_m1_vbill_amt')) ? project.getValue('custentity_bb_installer_m1_vbill_amt') :
            ((projectDataObj.custentity_bb_installer_m1_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_installer_m1_vbill_amt) : 0);

        var installerSubContrM2VBillAmt = (project.getValue('custentity_bb_installer_m2_vbill_amt')) ? project.getValue('custentity_bb_installer_m2_vbill_amt') :
            ((projectDataObj.custentity_bb_installer_m2_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_installer_m2_vbill_amt) : 0);

        var installerSubContrM3VBillAmt = (project.getValue('custentity_bb_installer_m3_vbill_amt')) ? project.getValue('custentity_bb_installer_m3_vbill_amt') :
            ((projectDataObj.custentity_bb_installer_m3_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_installer_m3_vbill_amt) : 0);

        var installerSubContrM4VBillAmt = (project.getValue('custentity_bb_installer_m4_vbill_amt')) ? project.getValue('custentity_bb_installer_m4_vbill_amt') :
            ((projectDataObj.custentity_bb_installer_m4_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_installer_m4_vbill_amt) : 0);

        var installerSubContrM5VBillAmt = (project.getValue('custentity_bb_installer_m5_vbill_amt')) ? project.getValue('custentity_bb_installer_m5_vbill_amt') :
            ((projectDataObj.custentity_bb_installer_m5_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_installer_m5_vbill_amt) : 0);

        var installerSubContrM6VBillAmt = (project.getValue('custentity_bb_installer_m6_vbill_amt')) ? project.getValue('custentity_bb_installer_m6_vbill_amt') :
            ((projectDataObj.custentity_bb_installer_m6_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_installer_m6_vbill_amt) : 0);

        var installerSubContrM7VBillAmt = (project.getValue('custentity_bb_installer_m7_vbill_amt')) ? project.getValue('custentity_bb_installer_m7_vbill_amt') :
            ((projectDataObj.custentity_bb_installer_m7_vbill_amt) ? parseFloat(projectDataObj.custentity_bb_installer_m7_vbill_amt) : 0);

        return parseFloat(installerSubContrM0VBillAmt) + parseFloat(installerSubContrM1VBillAmt)
            + parseFloat(installerSubContrM2VBillAmt) + parseFloat(installerSubContrM3VBillAmt)
            + parseFloat(installerSubContrM4VBillAmt) + parseFloat(installerSubContrM5VBillAmt)
            + parseFloat(installerSubContrM6VBillAmt) + parseFloat(installerSubContrM7VBillAmt);
    }


    function getBBConfigProjectType() {
        var configItems = ['custrecord_bb_full_service_type', 'custrecord_bb_epc_type'];
        var projType = solarConfig.getConfigurations(configItems);
        if (projType) {
            return {
                FULL_SERVICE : projType.custrecord_bb_full_service_type.value,
                EPC : projType.custrecord_bb_epc_type.value
            };

        }
    }


    var _checkIfNumber = function(value){
        if(value){
            if(typeof value === 'number'){
                return value;
            }
            if(typeof value === 'string'){
                var _value = parseFloat(value);
                if(!isNaN(_value)){
                    return _value;
                }
            }
        }
        return 0;
    };

    var _calcFuncForField = {};

    _calcFuncForField['custentity_bb_services_costs_amount'] = function(record, projectDataObj){
        // get values
        var _siteAuditAmount = (record.getValue({fieldId: 'custentity_bb_site_audit_amount'})) ? record.getValue({fieldId: 'custentity_bb_site_audit_amount'}) :
            ((projectDataObj.custentity_bb_site_audit_amount) ? parseFloat(projectDataObj.custentity_bb_site_audit_amount) : 0);

        var _designAmount = (record.getValue({fieldId: 'custentity_bb_design_amount'})) ? record.getValue({fieldId: 'custentity_bb_design_amount'}) :
            ((projectDataObj.custentity_bb_design_amount) ? parseFloat(projectDataObj.custentity_bb_design_amount) : 0);

        var _totalInstallerPaymentAmount = (record.getValue({fieldId: 'custentity_bb_installer_vbill_ttl_amt'})) ? record.getValue({fieldId: 'custentity_bb_installer_vbill_ttl_amt'}) :
            ((projectDataObj.custentity_bb_installer_vbill_ttl_amt) ? parseFloat(projectDataObj.custentity_bb_installer_vbill_ttl_amt) : 0);

        var _inspectionAmount = (record.getValue({fieldId: 'custentity_bb_inspection_amount'})) ? record.getValue({fieldId: 'custentity_bb_inspection_amount'}) :
            ((projectDataObj.custentity_bb_inspection_amount) ? parseFloat(projectDataObj.custentity_bb_inspection_amount) : 0);

        var _warrantyServicesAmount = (record.getValue({fieldId: 'custentity_bb_warranty_service_amount'})) ? record.getValue({fieldId: 'custentity_bb_warranty_service_amount'}) :
            ((projectDataObj.custentity_bb_warranty_service_amount) ? parseFloat(projectDataObj.custentity_bb_warranty_service_amount) : 0);

        // perform check and default to 0
        _siteAuditAmount = _checkIfNumber(_siteAuditAmount);
        _designAmount = _checkIfNumber(_designAmount);
        _totalInstallerPaymentAmount = _checkIfNumber(_totalInstallerPaymentAmount);
        _inspectionAmount = _checkIfNumber(_inspectionAmount);
        _warrantyServicesAmount = _checkIfNumber(_warrantyServicesAmount);


        return _siteAuditAmount + _designAmount + _totalInstallerPaymentAmount + _inspectionAmount + _warrantyServicesAmount;

    };

    _calcFuncForField['custentity_bb_services_costs_pr_watt_amt'] = function(record, amount, projectDataObj){
        if(typeof amount === 'undefined'){
            amount = calcFuncForField['custentity_bb_services_costs_amount'](record, projectDataObj);
        }
        var _systemSize = (record.getValue({fieldId: 'custentity_bb_system_size_decimal'})) ? record.getValue({fieldId: 'custentity_bb_system_size_decimal'}) :
            ((projectDataObj.custentity_bb_system_size_decimal) ? projectDataObj.custentity_bb_system_size_decimal : 0);

        return  _systemSize > 0 && amount > 0 ? (amount / (_systemSize * 1000)).toFixed(2) : 0;
    }


    return {
        //accounts receivable
        getRebateVariance: getRebateVariance,
        getFinancierTotalFees: getFinancierTotalFees,
        getFinancierTotalInvoiceAmount: getFinancierTotalInvoiceAmount,
        getSchedulePresetMilestoneAmounts: getSchedulePresetMilestoneAmounts,
        getFinancierM1InvoiceAmount: getFinancierM1InvoiceAmount,
        getFinancierM2InvoiceAmount: getFinancierM2InvoiceAmount,
        getFinancierM3InvoiceAmount: getFinancierM3InvoiceAmount,
        getFinancierM0InvoiceAmount: getFinancierM0InvoiceAmount,
        getFinancierM4InvoiceAmount: getFinancierM4InvoiceAmount,
        getFinancierM5InvoiceAmount: getFinancierM5InvoiceAmount,
        getFinancierM6InvoiceAmount: getFinancierM6InvoiceAmount,
        getFinancierM7InvoiceAmount: getFinancierM7InvoiceAmount,
        getRebateInvoiceAmount: getRebateInvoiceAmount,
        getM0DealerFeeAmount: getM0DealerFeeAmount,
        getM1DealerFeeAmount: getM1DealerFeeAmount,
        getM2DealerFeeAmount: getM2DealerFeeAmount,
        getM3DealerFeeAmount: getM3DealerFeeAmount,
        getM4DealerFeeAmount: getM4DealerFeeAmount,
        getM5DealerFeeAmount: getM5DealerFeeAmount,
        getM6DealerFeeAmount: getM6DealerFeeAmount,
        getM7DealerFeeAmount: getM7DealerFeeAmount,
        getInstallationBaseAmount: getInstallationBaseAmount,
        getOriginationAmountPerWatt: getOriginationAmountPerWatt,
        getOriginationBaseAmount: getOriginationBaseAmount,
        getFinancierPurchPricePerWatt: getFinancierPurchPricePerWatt,
        getTotalContractValue: getTotalContractValue,
        getScheduleData: getScheduleData,
        calculateGrossProfitAmount: calculateGrossProfitAmount,
        //accounts payable
        getOriginatorAmountPerWatt: getOriginatorAmountPerWatt,
        getOriginatorBaseAmount: getOriginatorBaseAmount,
        getOriginatorPaymentTotal: getOriginatorPaymentTotal,
        getOriginatorPaymentTotalPerWatt: getOriginatorPaymentTotalPerWatt,
        getOriginatorM0VendorBillAmount: getOriginatorM0VendorBillAmount,
        getOriginatorM1VendorBillAmount: getOriginatorM1VendorBillAmount,
        getOriginatorM2VendorBillAmount: getOriginatorM2VendorBillAmount,
        getOriginatorM3VendorBillAmount: getOriginatorM3VendorBillAmount,
        getOriginatorM4VendorBillAmount: getOriginatorM4VendorBillAmount,
        getOriginatorM5VendorBillAmount: getOriginatorM5VendorBillAmount,
        getOriginatorM6VendorBillAmount: getOriginatorM6VendorBillAmount,
        getOriginatorM7VendorBillAmount: getOriginatorM7VendorBillAmount,
        getOriginatorTotalVendorBillAmount: getOriginatorTotalVendorBillAmount,
        getCalculatedOrigVendorBillAmountWithPresets: getCalculatedOrigVendorBillAmountWithPresets,
        getInstallerSubContractorAmount: getInstallerSubContractorAmount,
        getInstallerTotalPayment: getInstallerTotalPayment,
        getInstallerTotalPaymentPerWatt: getInstallerTotalPaymentPerWatt,
        getInstallerSubContrM0VBillAmt: getInstallerSubContrM0VBillAmt,
        getInstallerSubContrM1VBillAmt: getInstallerSubContrM1VBillAmt,
        getInstallerSubContrM2VBillAmt: getInstallerSubContrM2VBillAmt,
        getInstallerSubContrM3VBillAmt: getInstallerSubContrM3VBillAmt,
        getInstallerSubContrM4VBillAmt: getInstallerSubContrM4VBillAmt,
        getInstallerSubContrM5VBillAmt: getInstallerSubContrM5VBillAmt,
        getInstallerSubContrM6VBillAmt: getInstallerSubContrM6VBillAmt,
        getInstallerSubContrM7VBillAmt: getInstallerSubContrM7VBillAmt,
        getInstallerTotalVBillAmount: getInstallerTotalVBillAmount,
        calculateBillAndBillCreditTotals: calculateBillAndBillCreditTotals,
        getGrossAdderTotal: getGrossAdderTotal,
        getSolarPortionContractValue: getSolarPortionContractValue,
        getNetPricePerWatt: getNetPricePerWatt,
        //field based calculations
        calculation : _calcFuncForField
    }
})