/**
 * @NApiVersion 2.0
 * @NModuleScope Public
 * @version 0.1.1
 * @author Matt Lehman
 * @fileOverview update accounting fields before record submit
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

define(['N/record', 'N/search', 'N/runtime','./BB.SS.MD.AccountingFieldCalculations', './BB.SS.Project.UpdateProjectFinancierOverview',
        './BB.SS.Project.TotalContractValueHistory', './BB.SS.Projects.PaymentMemo', './BB.SS.MD.GetProjectAccountingData', './BB.SS.MD.UpsertSalesOrder'],
    function (record, search, runtime, accountingCalc, financier, getContractHistory, paymentMemo, projectData, soLib) {

        /**
         * Sets the A/P Fields for a project record and
         * returns the project
         * @param {record} record - NS Project Record
         * @param {customOrigTotal}
         *      boolean - true - do not calculate Bill amount totals through Solar Success use custom amounts
         *      boolean - false - calculate Originator Bill amounts from Solar Success
         */
        function setAPFields(record, customOrigTotals, origScheduleAmounts, installScheduleAmounts, values, projectDataObj, afterSubmit) {

            var originatorVendor = (record.getValue('custentity_bb_originator_vendor')) ? record.getValue('custentity_bb_originator_vendor') :
                ((projectDataObj.custentity_bb_originator_vendor) ? projectDataObj.custentity_bb_originator_vendor : null);

            if (!originatorVendor) {
                record.setValue({
                    fieldId: 'custentity_bb_sales_partner_pay_schedule',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m0_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m1_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m2_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m3_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m4_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m5_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m6_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m7_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orig_tot_vendor_bill_amt',
                    value: null,
                    ignoreFieldChange: true
                });

            } else {
                record.setValue({
                    fieldId: 'custentity_bb_originator_per_watt_amt',
                    value: accountingCalc.getOriginatorAmountPerWatt(record, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_originator_base_amt',
                    value: accountingCalc.getOriginatorBaseAmount(record, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_payment_tot_amt',
                    value: accountingCalc.getOriginatorPaymentTotal(record, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_pay_tot_p_w_amt',
                    value: accountingCalc.getOriginatorPaymentTotalPerWatt(record, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m0_vbill_amt',
                    value: accountingCalc.getOriginatorM0VendorBillAmount(record, customOrigTotals, origScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m1_vbill_amt',
                    value: accountingCalc.getOriginatorM1VendorBillAmount(record, customOrigTotals, origScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m2_vbill_amt',
                    value: accountingCalc.getOriginatorM2VendorBillAmount(record, customOrigTotals, origScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m3_vbill_amt',
                    value: accountingCalc.getOriginatorM3VendorBillAmount(record, customOrigTotals, origScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m4_vbill_amt',
                    value: accountingCalc.getOriginatorM4VendorBillAmount(record, customOrigTotals, origScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m5_vbill_amt',
                    value: accountingCalc.getOriginatorM5VendorBillAmount(record, customOrigTotals, origScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m6_vbill_amt',
                    value: accountingCalc.getOriginatorM6VendorBillAmount(record, customOrigTotals, origScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orgntr_m7_vbill_amt',
                    value: accountingCalc.getOriginatorM7VendorBillAmount(record, customOrigTotals, origScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_orig_tot_vendor_bill_amt',
                    value: accountingCalc.getOriginatorTotalVendorBillAmount(record, projectDataObj),
                    ignoreFieldChange: true
                });

            }

            if (afterSubmit) {

                values['custentity_bb_originator_per_watt_amt'] = record.getValue({fieldId: 'custentity_bb_originator_per_watt_amt'});
                values['custentity_bb_originator_base_amt'] = record.getValue({fieldId: 'custentity_bb_originator_base_amt'});
                values['custentity_bb_orgntr_payment_tot_amt'] = record.getValue({fieldId: 'custentity_bb_orgntr_payment_tot_amt'});
                values['custentity_bb_orgntr_pay_tot_p_w_amt'] = record.getValue({fieldId: 'custentity_bb_orgntr_pay_tot_p_w_amt'});
                values['custentity_bb_orgntr_m0_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_orgntr_m0_vbill_amt'});
                values['custentity_bb_orgntr_m1_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_orgntr_m1_vbill_amt'});
                values['custentity_bb_orgntr_m2_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_orgntr_m2_vbill_amt'});
                values['custentity_bb_orgntr_m3_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_orgntr_m3_vbill_amt'});
                values['custentity_bb_orgntr_m4_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_orgntr_m4_vbill_amt'});
                values['custentity_bb_orgntr_m5_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_orgntr_m5_vbill_amt'});
                values['custentity_bb_orgntr_m6_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_orgntr_m6_vbill_amt'});
                values['custentity_bb_orgntr_m7_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_orgntr_m7_vbill_amt'});
                values['custentity_bb_orig_tot_vendor_bill_amt'] = record.getValue({fieldId: 'custentity_bb_orig_tot_vendor_bill_amt'});
            }


            var installerVendor = (record.getValue('custentity_bb_installer_partner_vendor')) ? record.getValue('custentity_bb_installer_partner_vendor') :
                ((projectDataObj) ? projectDataObj.custentity_bb_installer_partner_vendor : null);
            if (!installerVendor) {
                record.setValue({
                    fieldId: 'custentity_bb_install_part_pay_schedule',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_vbill_ttl_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m0_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m1_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m2_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m3_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m4_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m5_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m6_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m6_vbill_amt',
                    value: null,
                    ignoreFieldChange: true
                });

            } else {
                record.setValue({
                    fieldId: 'custentity_bb_installer_amt',
                    value: accountingCalc.getInstallerSubContractorAmount(record, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_total_pay_amt',
                    value: accountingCalc.getInstallerTotalPayment(record, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_install_total_payment_p_w',
                    value: accountingCalc.getInstallerTotalPaymentPerWatt(record, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m0_vbill_amt',
                    value: accountingCalc.getInstallerSubContrM0VBillAmt(record, installScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m1_vbill_amt',
                    value: accountingCalc.getInstallerSubContrM1VBillAmt(record, installScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m2_vbill_amt',
                    value: accountingCalc.getInstallerSubContrM2VBillAmt(record, installScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m3_vbill_amt',
                    value: accountingCalc.getInstallerSubContrM3VBillAmt(record, installScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m4_vbill_amt',
                    value: accountingCalc.getInstallerSubContrM4VBillAmt(record, installScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m5_vbill_amt',
                    value: accountingCalc.getInstallerSubContrM5VBillAmt(record, installScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m6_vbill_amt',
                    value: accountingCalc.getInstallerSubContrM6VBillAmt(record, installScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_m7_vbill_amt',
                    value: accountingCalc.getInstallerSubContrM7VBillAmt(record, installScheduleAmounts, projectDataObj),
                    ignoreFieldChange: true
                }).setValue({
                    fieldId: 'custentity_bb_installer_vbill_ttl_amt',
                    value: accountingCalc.getInstallerTotalVBillAmount(record, projectDataObj),
                    ignoreFieldChange: true
                });

            }
            if (afterSubmit) {
                // set values for installer via record.submitFields
                values['custentity_bb_installer_amt'] = record.getValue({fieldId: 'custentity_bb_installer_amt'});
                values['custentity_bb_installer_total_pay_amt'] = record.getValue({fieldId: 'custentity_bb_installer_total_pay_amt'});
                values['custentity_bb_install_total_payment_p_w'] = record.getValue({fieldId: 'custentity_bb_install_total_payment_p_w'});
                values['custentity_bb_installer_m0_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_installer_m0_vbill_amt'});
                values['custentity_bb_installer_m1_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_installer_m1_vbill_amt'});
                values['custentity_bb_installer_m2_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_installer_m2_vbill_amt'});
                values['custentity_bb_installer_m3_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_installer_m3_vbill_amt'});
                values['custentity_bb_installer_m4_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_installer_m4_vbill_amt'});
                values['custentity_bb_installer_m5_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_installer_m5_vbill_amt'});
                values['custentity_bb_installer_m6_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_installer_m6_vbill_amt'});
                values['custentity_bb_installer_m7_vbill_amt'] = record.getValue({fieldId: 'custentity_bb_installer_m7_vbill_amt'});
                values['custentity_bb_installer_vbill_ttl_amt'] = record.getValue({fieldId: 'custentity_bb_installer_vbill_ttl_amt'});
            }

            return values;
        }


        /**
         * Sets values for A/R Fields
         *
         * @param record - NS Project Record
         * @returns - void
         */
        function setARFields(record, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, values, projectDataObj, afterSubmit, dealerFeePercent, dealerFeeExecution) {

            record.setValue({
                fieldId: 'custentity_bb_rebate_variance_amount',
                value: accountingCalc.getRebateVariance(record, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_pur_price_p_watt_amt',
                value: accountingCalc.getFinancierPurchPricePerWatt(record, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_rebate_app_amount_copy',
                value: record.getValue('custentity_bb_rebate_application_amount'),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_rebate_conf_amount_copy',
                value: record.getValue('custentity_bb_rebate_confirmation_amount'),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_total_fees_amount',
                value: accountingCalc.getFinancierTotalFees(record, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_total_invoice_amount',
                value: accountingCalc.getFinancierTotalInvoiceAmount(record, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_install_base_amt',
                value: accountingCalc.getInstallationBaseAmount(record, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_orig_per_watt_amt',
                value: accountingCalc.getOriginationAmountPerWatt(record, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_orig_base_amt',
                value: accountingCalc.getOriginationBaseAmount(record, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_total_contract_value_amt',
                value: accountingCalc.getTotalContractValue(record, projectDataObj),
                ignoreFieldChange: true
            }).setValue({   
                fieldId: 'custentity_bb_solar_portion_contract_amt',    
                value: accountingCalc.getSolarPortionContractValue(record, projectDataObj), 
                ignoreFieldChange: true 
            }).setValue({   
                fieldId: 'custentity_bb_net_price_per_watt',    
                value: accountingCalc.getNetPricePerWatt(record, projectDataObj),   
                ignoreFieldChange: true 
            }).setValue({
                fieldId: 'custentity_bb_tot_contract_value_cpy_amt',
                value: accountingCalc.getTotalContractValue(record, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_m0_invoice_amount',
                value: accountingCalc.getFinancierM0InvoiceAmount(record, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_m1_invoice_amount',
                value: accountingCalc.getFinancierM1InvoiceAmount(record, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_m2_invoice_amount',
                value: accountingCalc.getFinancierM2InvoiceAmount(record, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_m3_invoice_amount',
                value: accountingCalc.getFinancierM3InvoiceAmount(record, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_m4_invoice_amount',
                value: accountingCalc.getFinancierM4InvoiceAmount(record, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_m5_invoice_amount',
                value: accountingCalc.getFinancierM5InvoiceAmount(record, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_m6_invoice_amount',
                value: accountingCalc.getFinancierM6InvoiceAmount(record, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_m7_invoice_amount',
                value: accountingCalc.getFinancierM7InvoiceAmount(record, customFinTotals, downPayment, downPaymentMilestoneName, scheduleAmounts, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_rebate_inv_amount',
                value: accountingCalc.getRebateInvoiceAmount(record, scheduleAmounts, projectDataObj),
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_gross_profit_amount',
                value: accountingCalc.calculateGrossProfitAmount(record, projectDataObj),
                ignoreFieldChange: true
            });

            if (afterSubmit) {
                // sends financier values in after submit via record.submitFields
                values['custentity_bb_rebate_variance_amount'] = record.getValue({fieldId: 'custentity_bb_rebate_variance_amount'});
                values['custentity_bb_fin_pur_price_p_watt_amt'] = record.getValue({fieldId: 'custentity_bb_fin_pur_price_p_watt_amt'});
                values['custentity_bb_rebate_app_amount_copy'] = record.getValue('custentity_bb_rebate_application_amount');
                values['custentity_bb_rebate_conf_amount_copy'] = record.getValue('custentity_bb_rebate_confirmation_amount');
                values['custentity_bb_fin_total_fees_amount'] = record.getValue({fieldId: 'custentity_bb_fin_total_fees_amount'});
                values['custentity_bb_fin_total_invoice_amount'] = record.getValue({fieldId: 'custentity_bb_fin_total_invoice_amount'});
                values['custentity_bb_fin_install_base_amt'] = record.getValue({fieldId: 'custentity_bb_fin_install_base_amt'});
                values['custentity_bb_fin_orig_per_watt_amt'] = record.getValue({fieldId: 'custentity_bb_fin_orig_per_watt_amt'});
                values['custentity_bb_fin_orig_base_amt'] = record.getValue({fieldId: 'custentity_bb_fin_orig_base_amt'});
                values['custentity_bb_total_contract_value_amt'] = record.getValue({fieldId: 'custentity_bb_total_contract_value_amt'});
                values['custentity_bb_tot_contract_value_cpy_amt'] = record.getValue({fieldId: 'custentity_bb_tot_contract_value_cpy_amt'});
                values['custentity_bb_fin_m1_invoice_amount'] = record.getValue({fieldId: 'custentity_bb_fin_m1_invoice_amount'});
                values['custentity_bb_fin_m2_invoice_amount'] = record.getValue({fieldId: 'custentity_bb_fin_m2_invoice_amount'});
                values['custentity_bb_fin_m3_invoice_amount'] = record.getValue({fieldId: 'custentity_bb_fin_m3_invoice_amount'});
                values['custentity_bb_fin_m0_invoice_amount'] = record.getValue({fieldId: 'custentity_bb_fin_m0_invoice_amount'});
                values['custentity_bb_fin_m4_invoice_amount'] = record.getValue({fieldId: 'custentity_bb_fin_m4_invoice_amount'});
                values['custentity_bb_fin_m5_invoice_amount'] = record.getValue({fieldId: 'custentity_bb_fin_m5_invoice_amount'});
                values['custentity_bb_fin_m6_invoice_amount'] = record.getValue({fieldId: 'custentity_bb_fin_m6_invoice_amount'});
                values['custentity_bb_fin_m7_invoice_amount'] = record.getValue({fieldId: 'custentity_bb_fin_m7_invoice_amount'});
                values['custentity_bb_fin_rebate_inv_amount'] = record.getValue({fieldId: 'custentity_bb_fin_rebate_inv_amount'});
                values['custentity_bb_gross_profit_amount'] = record.getValue({fieldId: 'custentity_bb_gross_profit_amount'});
                values['custentity_bb_gross_adder_total'] = record.getValue({fieldId: 'custentity_bb_gross_adder_total'});  
                values['custentity_bb_solar_portion_contract_amt'] = record.getValue({fieldId: 'custentity_bb_solar_portion_contract_amt'});    
                values['custentity_bb_net_price_per_watt'] = record.getValue({fieldId: 'custentity_bb_net_price_per_watt'});
            }

            return values;
        }



        /**
         * Sets the adder totals, payment memo, total contract history,
         * and other a/r & a/p fields
         * @param {record} project - NS project record
         * @param {boolean} needsSubmit - if the function is being called from a project
         *    and needs to save the project, or return the project
         */


        function setAccountingFields(project, needsSubmit, values) {

            var downPayment, downPaymentMilestoneName, finPayObj, origPayObj, installPayObj, dealerFeePercent, dealerFeeExecution;

            var projectDataObj = projectData.getProjectAccountingSearchData(project.id);
            log.debug('project data object', projectDataObj);

            // financer fields
            var finPayScheduleId = (project.getValue('custentity_bb_financier_payment_schedule')) ? project.getValue('custentity_bb_financier_payment_schedule') :
                ((projectDataObj.custentity_bb_financier_payment_schedule) ? parseFloat(projectDataObj.custentity_bb_financier_payment_schedule) : null);
            if (finPayScheduleId) {
                finPayObj = accountingCalc.getScheduleData(finPayScheduleId);
                downPayment = finPayObj.downPayment;
                downPaymentMilestoneName = finPayObj.downPaymentMilestoneName;
            }

            var origPayScheduleId = (project.getValue('custentity_bb_sales_partner_pay_schedule')) ? project.getValue('custentity_bb_sales_partner_pay_schedule') :
                ((projectDataObj.custentity_bb_sales_partner_pay_schedule) ? parseFloat(projectDataObj.custentity_bb_sales_partner_pay_schedule) : null);
            if (origPayScheduleId) {
                origPayObj = accountingCalc.getScheduleData(origPayScheduleId);
            }

            var installPayScheduleId = (project.getValue('custentity_bb_install_part_pay_schedule')) ? project.getValue('custentity_bb_install_part_pay_schedule') :
                ((projectDataObj.custentity_bb_install_part_pay_schedule) ? parseFloat(projectDataObj.custentity_bb_install_part_pay_schedule) : null);
            if (installPayScheduleId) {
                installPayObj = accountingCalc.getScheduleData(origPayScheduleId);
            }
            var configId = (project.getValue({fieldId: 'custentity_bbss_configuration'})) ? project.getValue({fieldId: 'custentity_bbss_configuration'}) : 1;

            var customOrigTotals = false;
            var customFinTotals = false;
            if (configId) {
                var configObj = search.lookupFields({
                    type: 'customrecord_bb_solar_success_configurtn',
                    id: configId,
                    columns: ['custrecord_bb_set_cus_org_inv_total_bool', 'custrecord_bb_set_cus_fin_inv_total_bool'] // custrecord_pst_test_origin_total_bool
                });
                customOrigTotals = configObj.custrecord_bb_set_cus_org_inv_total_bool; // custom calculation boolean value passed to originator bill amount fields
                customFinTotals = configObj.custrecord_bb_set_cus_fin_inv_total_bool;
            }

            // execute search on project and send values to calculation functions

            // log.debug('project id in set accounting fields', project.id);


            dealerFeePercent = (project.getValue({fieldId: 'custentity_bb_dealer_fee_percent'}))
                ? parseFloat(project.getValue({fieldId: 'custentity_bb_dealer_fee_percent'})) : parseFloat(projectDataObj.custentity_bb_dealer_fee_percent);

            dealerFeeExecution = (project.getValue({fieldId:'custentity_bb_dealer_fee_app_method'}))
                ? parseFloat(project.getValue({fieldId:'custentity_bb_dealer_fee_app_method'})) : parseInt(projectDataObj.custentity_bb_dealer_fee_app_method);

            var soId = searchProjectSalesOrder(project.id);
            if (soId) {
                var taxObj = soLib.getSalesTaxDetails(project.id);
                log.debug('sales order tax object',  taxObj);
                values['custentity_bb_project_so'] = soId;
                values['custentity_bb_sales_tax_amount'] = (taxObj) ? taxObj.amount : null;
                values['custentity_bb_ss_sales_tax_account'] = (taxObj) ? taxObj.account : null;
            }

            // set project related field values
            values = setFinancialOverview(project, values, projectDataObj);
            values = setAdderTotals(project, financier.updateProjectFinancier(project, projectDataObj), values, needsSubmit);
            values = setARFields(project, customFinTotals, downPayment, downPaymentMilestoneName, finPayObj, values, projectDataObj, needsSubmit);
            values = setAPFields(project, customOrigTotals, origPayObj, installPayObj, values, projectDataObj, needsSubmit);
            values = setDealerFeeFields(project, dealerFeePercent, dealerFeeExecution, projectDataObj, values, downPayment, downPaymentMilestoneName);
            accountingCalc.calculateBillAndBillCreditTotals(project, projectDataObj);

            if (needsSubmit) {
                values = setPaymentMemos(project, paymentMemo.savePaymentMemo(project, projectDataObj), values, needsSubmit); //update payment memos
                submitProject(project, values);
                saveContractHistory(project);
                return values;
            } else {
                return values;
            }
        }



        /**
         *
         * @param {NS Project Record} project
         */
        function submitProject(project, values) {
            // log.debug('values submitted', values);
            record.submitFields({
                type: record.Type.JOB,
                id: project.id,
                values: values,
                options: {
                    ignoreMandatoryFields: true
                }
            });

        }

        /**
         *
         * @param {NS Project Record ID} project
         * get project sales order
         */

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


        /**
         * Sets the adder totals on a project record
         * @param {record} project - NS Project Record
         * @param {object} adderTotals - object returned from the financialOverview module
         */
        function setAdderTotals(project, adderTotals, values, afterSubmit) {
            var financierAdderFields = adderTotals.financierAdderFields;
            var originatorAdderFields = adderTotals.originatorAdderFields;
            var installerAdderFields = adderTotals.installerAdderFields;
            project.setValue({
                fieldId: 'custentity_bb_fin_fixed_adder_amt',
                value: (financierAdderFields) ? financierAdderFields.fixedAdderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_per_watt_adder_amt',
                value: (financierAdderFields) ? financierAdderFields.perWattAdderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_per_module_adder_amt',
                value: (financierAdderFields) ? financierAdderFields.perModuleAdderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_fin_per_foot_adder_amt',
                value: (financierAdderFields) ? financierAdderFields.perFootAdderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_orgntr_fxd_addr_ttl_amt',
                value: (originatorAdderFields) ? originatorAdderFields.fixedAdderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_orgntr_per_watt_adder_amt',
                value: (originatorAdderFields) ? originatorAdderFields.perWattAdderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_orgntr_per_mod_adder_amt',
                value: (originatorAdderFields) ? originatorAdderFields.perModuleAdderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_orgntr_per_ft_addr_ttl_amt',
                value: (originatorAdderFields) ? originatorAdderFields.perFootAdderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_orgntr_addr_ttl_amt',
                value: (originatorAdderFields) ? originatorAdderFields.adderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_installer_fxd_addr_ttl_amt',
                value: (installerAdderFields) ? installerAdderFields.fixedAdderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_instllr_pr_wt_addr_ttl_amt',
                value: (installerAdderFields) ? installerAdderFields.perWattAdderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_instllr_pr_md_addr_ttl_amt',
                value: (installerAdderFields) ? installerAdderFields.perModuleAdderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_installr_p_ft_addr_ttl_amt',
                value: (installerAdderFields) ? installerAdderFields.perFootAdderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_installer_adder_total_amt',
                value: (installerAdderFields) ? installerAdderFields.adderTotal : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_installer_adder_total_p_w',
                value: (installerAdderFields) ? installerAdderFields.adderTotalPerWatt : 0,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custentity_bb_orgntr_addr_ttl_p_watt_amt',
                value: (originatorAdderFields) ? parseFloat(originatorAdderFields.adderTotalPerWatt).toFixed(2) : 0,
                ignoreFieldChange: true
            }).setValue({   
                fieldId: 'custentity_bb_gross_adder_total', 
                value: accountingCalc.getGrossAdderTotal(project),  
                ignoreFieldChange: true 
            });
            if (afterSubmit) {
                // log.debug('values object in adder function', values);
                values['custentity_bb_fin_fixed_adder_amt'] = (financierAdderFields.fixedAdderTotal) ? financierAdderFields.fixedAdderTotal : 0;
                values['custentity_bb_fin_per_watt_adder_amt'] = (financierAdderFields.perWattAdderTotal) ? financierAdderFields.perWattAdderTotal : 0;
                values['custentity_bb_fin_per_module_adder_amt'] = (financierAdderFields.perModuleAdderTotal) ? financierAdderFields.perModuleAdderTotal : 0;
                values['custentity_bb_fin_per_foot_adder_amt'] = (financierAdderFields.perFootAdderTotal) ? financierAdderFields.perFootAdderTotal : 0;
                values['custentity_bb_orgntr_fxd_addr_ttl_amt'] = (originatorAdderFields.fixedAdderTotal) ? originatorAdderFields.fixedAdderTotal : 0;
                values['custentity_bb_orgntr_per_watt_adder_amt'] = (originatorAdderFields.perWattAdderTotal) ? originatorAdderFields.perWattAdderTotal : 0;
                values['custentity_bb_orgntr_per_mod_adder_amt'] = (originatorAdderFields.perModuleAdderTotal) ? originatorAdderFields.perModuleAdderTotal : 0;
                values['custentity_bb_orgntr_per_ft_addr_ttl_amt'] = (originatorAdderFields.perFootAdderTotal) ? originatorAdderFields.perFootAdderTotal : 0;
                values['custentity_bb_orgntr_addr_ttl_amt'] = (originatorAdderFields.adderTotal) ? originatorAdderFields.adderTotal : 0;
                values['custentity_bb_orgntr_addr_ttl_p_watt_amt'] = (originatorAdderFields.adderTotalPerWatt) ? originatorAdderFields.adderTotalPerWatt : 0;
                values['custentity_bb_installer_fxd_addr_ttl_amt'] = (installerAdderFields.fixedAdderTotal) ? installerAdderFields.fixedAdderTotal : 0;
                values['custentity_bb_instllr_pr_wt_addr_ttl_amt'] = (installerAdderFields.perWattAdderTotal) ? installerAdderFields.perWattAdderTotal : 0;
                values['custentity_bb_instllr_pr_md_addr_ttl_amt'] = (installerAdderFields.perModuleAdderTotal) ? installerAdderFields.perModuleAdderTotal : 0;
                values['custentity_bb_installr_p_ft_addr_ttl_amt'] = (installerAdderFields.perFootAdderTotal) ? installerAdderFields.perFootAdderTotal : 0;
                values['custentity_bb_installer_adder_total_amt'] = (installerAdderFields.adderTotal) ? installerAdderFields.adderTotal : 0;
                values['custentity_bb_installer_adder_total_p_w'] = (installerAdderFields.adderTotalPerWatt) ? installerAdderFields.adderTotalPerWatt : 0;
                values['custentity_bb_gross_adder_total'] = accountingCalc.getGrossAdderTotal(project);

            }

            return values;
        }


        function getChangesAdderTotals(project, adderTotals){
            var _financierAdderFields = adderTotals.financierAdderFields;
            var _originatorAdderFields = adderTotals.originatorAdderFields;
            var _installerAdderFields = adderTotals.installerAdderFields;
            var _changes = {};
            var _fields = [{
                fieldId: 'custentity_bb_fin_fixed_adder_amt',
                value: _financierAdderFields.fixedAdderTotal
            },{
                fieldId: 'custentity_bb_fin_per_watt_adder_amt',
                value: _financierAdderFields.perWattAdderTotal
            },{
                fieldId: 'custentity_bb_fin_per_foot_adder_amt',
                value: _financierAdderFields.perFootAdderTotal
            },{
                fieldId: 'custentity_bb_orgntr_fxd_addr_ttl_amt',
                value: _originatorAdderFields.fixedAdderTotal
            },{
                fieldId: 'custentity_bb_orgntr_per_watt_adder_amt',
                value: _originatorAdderFields.perWattAdderTotal
            },{
                fieldId: 'custentity_bb_orgntr_per_ft_addr_ttl_amt',
                value: _originatorAdderFields.perFootAdderTotal
            },{
                fieldId: 'custentity_bb_orgntr_addr_ttl_amt',
                value: _originatorAdderFields.adderTotal
            },{
                fieldId: 'custentity_bb_orgntr_addr_ttl_p_watt_amt',
                value: _originatorAdderFields.adderTotalPerWatt
            },{
                fieldId: 'custentity_bb_installer_fxd_addr_ttl_amt',
                value: _installerAdderFields.fixedAdderTotal
            },{
                fieldId: 'custentity_bb_instllr_pr_wt_addr_ttl_amt',
                value: _installerAdderFields.perWattAdderTotal
            },{
                fieldId: 'custentity_bb_installr_p_ft_addr_ttl_amt',
                value: _installerAdderFields.perFootAdderTotal
            },{
                fieldId: 'custentity_bb_installer_adder_total_amt',
                value: _installerAdderFields.adderTotal
            },{
                fieldId: 'custentity_bb_installer_adder_total_p_w',
                value: _installerAdderFields.adderTotalPerWatt
            }];
            _fields.forEach(function(field){
                var _oldValue = project.getValue({fieldId: field.fieldId});
                if(_oldValue != field.value){
                    _changes[field.fieldId] = field.value;
                    project.setValue({
                        fieldId: field.fieldId,
                        value: field.value,
                        ignoreFieldChange: true
                    })
                }
            });
            return _changes;
        }


        /**
         * Sets the payment memos on a project record
         * @param {record} project - NS Project Record
         * @param {object} memos - Object returned by the payment memo module
         */
        function setPaymentMemos(project, memos, values, needsSubmit) {
            // do not fire project.setvalues in before submit call
            if (needsSubmit) {
                values['custentity_bb_fin_payment_memo_html'] = memos.financierPaymentMemo;
                values['custentity_bb_originator_pay_memo_html'] = memos.originatorPaymentMemo;
                values['custentity_bb_installer_pay_memo_html'] = memos.installerPaymentMemo;
            }
            return values;
        }

        function getChangesPaymentMemos(project, memos) {
            var _changes = {};
            var _fields = [{
                fieldId: 'custentity_bb_fin_payment_memo_html',
                value: memos.financierPaymentMemo,
                ignoreFieldChange: true
            },{
                fieldId: 'custentity_bb_originator_pay_memo_html',
                value: memos.originatorPaymentMemo,
                ignoreFieldChange: true
            },{
                fieldId: 'custentity_bb_installer_pay_memo_html',
                value: memos.installerPaymentMemo,
                ignoreFieldChange: true
            }];

            _fields.forEach(function(field){
                var _oldValue = project.getValue({fieldId: field.fieldId});
                if(_oldValue == field.value){
                    _changes[field.fieldId] = field.value;
                    project.setValue({fieldId: field.fieldId, value: field.value, ignoreFieldChange: true});
                }
            });

            return _changes;
        }

        /**
         *
         * @param {record} project
         */
        function setFinancialOverview(project, values, projectDataObj){
            var _servicesCostAmount = accountingCalc.calculation['custentity_bb_services_costs_amount'](project, projectDataObj);
            log.debug('_servicesCostAmount', _servicesCostAmount);
            if(_servicesCostAmount > 0) {
                project.setValue({fieldId: 'custentity_bb_services_costs_amount', value: _servicesCostAmount});
                values['custentity_bb_services_costs_amount'] = _servicesCostAmount;
                var _servicesCostPerWatt = accountingCalc.calculation['custentity_bb_services_costs_pr_watt_amt'](project, _servicesCostAmount, projectDataObj);

                log.debug('_servicesCostPerWatt', _servicesCostPerWatt);
                if(_servicesCostPerWatt > 0){
                    project.setValue({fieldId: 'custentity_bb_services_costs_pr_watt_amt', value: _servicesCostPerWatt});
                    values['custentity_bb_services_costs_pr_watt_amt'] = _servicesCostPerWatt;
                }
            }
            log.debug('finanier overview values object', values);
            return values;
        }


        /**
         * Sets the value for the contract value history, needs
         * to be done separately to include current edits
         * @param {record} project - NS Project Record
         */
        function saveContractHistory(project) {
            record.submitFields({
                type: record.Type.JOB,
                id: project.id,
                values: {'custentity_bb_contract_value_hist_html': getContractHistory.contractHistory(project)},
                options: {ignoreMandatoryFields: true}
            });
        }


        function setDealerFeeFields(record, dealerFeePercent, dealerFeeExecution, projectDataObj, values, downPayment, downPaymentMilestoneName) {
            // set dealer fee amounts
            var dealerM0Fee = accountingCalc.getM0DealerFeeAmount(record, dealerFeePercent, dealerFeeExecution, projectDataObj, downPayment) || 0;
            var dealerM1Fee = accountingCalc.getM1DealerFeeAmount(record, dealerFeePercent, dealerFeeExecution, projectDataObj, downPayment, downPaymentMilestoneName) || 0;
            var dealerM2Fee = accountingCalc.getM2DealerFeeAmount(record, dealerFeePercent, dealerFeeExecution, projectDataObj, downPayment, downPaymentMilestoneName) || 0;
            var dealerM3Fee = accountingCalc.getM3DealerFeeAmount(record, dealerFeePercent, dealerFeeExecution, projectDataObj, downPayment, downPaymentMilestoneName) || 0;
            var dealerM4Fee = accountingCalc.getM4DealerFeeAmount(record, dealerFeePercent, dealerFeeExecution, projectDataObj, downPayment, downPaymentMilestoneName) || 0;
            var dealerM5Fee = accountingCalc.getM5DealerFeeAmount(record, dealerFeePercent, dealerFeeExecution, projectDataObj, downPayment, downPaymentMilestoneName) || 0;
            var dealerM6Fee = accountingCalc.getM6DealerFeeAmount(record, dealerFeePercent, dealerFeeExecution, projectDataObj, downPayment, downPaymentMilestoneName) || 0;
            var dealerM7Fee = accountingCalc.getM7DealerFeeAmount(record, dealerFeePercent, dealerFeeExecution, projectDataObj, downPayment, downPaymentMilestoneName) || 0;
            record.setValue({
                fieldId: 'custentity_bb_m0_dealer_fee_amount',
                value: dealerM0Fee,
                ignoreFieldChange: true
            });
            record.setValue({
                fieldId: 'custentity_bb_m1_dealer_fee_amount',
                value: dealerM1Fee,
                ignoreFieldChange: true
            });
            record.setValue({
                fieldId: 'custentity_bb_m2_dealer_fee_amount',
                value: dealerM2Fee,
                ignoreFieldChange: true
            });
            record.setValue({
                fieldId: 'custentity_bb_m3_dealer_fee_amount',
                value: dealerM3Fee,
                ignoreFieldChange: true
            });
            record.setValue({
                fieldId: 'custentity_bb_m4_dealer_fee_amount',
                value: dealerM4Fee,
                ignoreFieldChange: true
            });
            record.setValue({
                fieldId: 'custentity_bb_m5_dealer_fee_amount',
                value: dealerM5Fee,
                ignoreFieldChange: true
            });
            record.setValue({
                fieldId: 'custentity_bb_m6_dealer_fee_amount',
                value: dealerM6Fee,
                ignoreFieldChange: true
            });
            record.setValue({
                fieldId: 'custentity_bb_m7_dealer_fee_amount',
                value: dealerM7Fee,
                ignoreFieldChange: true
            });
            var dealerFeeTotal = dealerM0Fee + dealerM1Fee + dealerM2Fee + dealerM3Fee + dealerM4Fee + dealerM5Fee + dealerM6Fee + dealerM7Fee;
            record.setValue({
                fieldId: 'custentity_bb_total_dealer_fee_amount',
                value: dealerFeeTotal,
                ignoreFieldChange: true
            });

            values['custentity_bb_m0_dealer_fee_amount'] = record.getValue({fieldId: 'custentity_bb_m0_dealer_fee_amount'});
            values['custentity_bb_m1_dealer_fee_amount'] = record.getValue({fieldId: 'custentity_bb_m1_dealer_fee_amount'});
            values['custentity_bb_m2_dealer_fee_amount'] = record.getValue({fieldId: 'custentity_bb_m2_dealer_fee_amount'});
            values['custentity_bb_m3_dealer_fee_amount'] = record.getValue({fieldId: 'custentity_bb_m3_dealer_fee_amount'});
            values['custentity_bb_m4_dealer_fee_amount'] = record.getValue({fieldId: 'custentity_bb_m4_dealer_fee_amount'});
            values['custentity_bb_m5_dealer_fee_amount'] = record.getValue({fieldId: 'custentity_bb_m5_dealer_fee_amount'});
            values['custentity_bb_m6_dealer_fee_amount'] = record.getValue({fieldId: 'custentity_bb_m6_dealer_fee_amount'});
            values['custentity_bb_m7_dealer_fee_amount'] = record.getValue({fieldId: 'custentity_bb_m7_dealer_fee_amount'});
            values['custentity_bb_total_dealer_fee_amount'] = dealerFeeTotal;

            return values;

        }

        return {
            setAPFields: setAPFields,
            setARFields: setARFields,
            setAccountingFields: setAccountingFields
        };

    });