/**
 * @NApiVersion 2.0
 * @NModuleScope Public
 * @author Matt Lehman
 * @fileOverview get project search data
 */

/**
 * Copyright 2017-2019 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/record', 'N/search', './BB.SS.MD.AccountingFieldCalculations'],

function(record, search, accountingCalc) {

	function getProjectAccountingSearchData(projectId) {
		var projectObj = {}
		if (projectId) {
			var jobSearchObj = search.create({
			    type: "job",
			    filters:
			    [
			        ["internalid","anyof", projectId]
			    ],
			    columns:
			    [
			        search.createColumn({name: "custentity_bb_ss_accrual_journal", label: "Accrual Journal"}),
			        search.createColumn({name: "custentity_bb_orgntr_addr_ttl_p_watt_amt", label: "Adder Total / Watt"}),
			        search.createColumn({name: "custentity_bb_ss_already_invoiced_amount", label: "Already Invoiced Amount"}),
			        search.createColumn({name: "custentity_bb_avg_utilitybill_month_amt", label: "Average Utility Bill/Month"}),
			        search.createColumn({name: "custentity_bbss_configuration", label: "BBSS Config Reference"}),
			        search.createColumn({name: "custentity_bb_bom_status_list", label: "BOM Status"}),
			        search.createColumn({name: "custentity_bb_cancellation_date", label: "Cancellation Date"}),
			        search.createColumn({name: "custentity_bb_cancellation_reason_comm", label: "Cancellation Reason"}),
			        search.createColumn({name: "customer", label: "Customer"}),
			        search.createColumn({name: "custentity_bb_customer_signture_date", label: "Customer Signature Date"}),
			        search.createColumn({name: "custentity_bb_epc_role", label: "EPC Role"}),
			        search.createColumn({name: "custentity_bb_financier_customer", label: "Financier"}),
			        search.createColumn({name: "custentity_bb_fin_base_fees_amount", label: "Financier Base Fees"}),
			        search.createColumn({name: "custentity_bb_fin_m0_invoice_percent", label: "Financier M0 Invoice %"}),
			        search.createColumn({name: "custentity_bb_fin_m0_invoice_amount", label: "Financier M0 Invoice Amount"}),
			        search.createColumn({name: "custentity_bb_fin_m1_invoice_percent", label: "Financier M1 Invoice %"}),
			        search.createColumn({name: "custentity_bb_fin_m1_invoice_amount", label: "Financier M1 Invoice Amount"}),
			        search.createColumn({name: "custentity_bb_fin_m2_invoice_percent", label: "Financier M2 Invoice %"}),
			        search.createColumn({name: "custentity_bb_fin_m2_invoice_amount", label: "Financier M2 Invoice Amount"}),
			        search.createColumn({name: "custentity_bb_fin_m3_invoice_percent", label: "Financier M3 Invoice %"}),
			        search.createColumn({name: "custentity_bb_fin_m3_invoice_amount", label: "Financier M3 Invoice Amount"}),
			        search.createColumn({name: "custentity_bb_fin_m4_invoice_percent", label: "Financier M4 Invoice %"}),
			        search.createColumn({name: "custentity_bb_fin_m4_invoice_amount", label: "Financier M4 Invoice Amount"}),
			        search.createColumn({name: "custentity_bb_fin_m5_invoice_percent", label: "Financier M5 Invoice %"}),
			        search.createColumn({name: "custentity_bb_fin_m5_invoice_amount", label: "Financier M5 Invoice Amount"}),
			        search.createColumn({name: "custentity_bb_fin_m6_invoice_percent", label: "Financier M6 Invoice %"}),
			        search.createColumn({name: "custentity_bb_fin_m6_invoice_amount", label: "Financier M6 Invoice Amount"}),
			        search.createColumn({name: "custentity_bb_fin_m7_invoice_percent", label: "Financier M7 Invoice %"}),
			        search.createColumn({name: "custentity_bb_fin_m7_invoice_amount", label: "Financier M7 Invoice Amount"}),
					search.createColumn({name: "custentity_bb_fin_rebate_inv_amount", label: "Financier Rebate Invoice Amount"}),
			        search.createColumn({name: "custentity_bb_fin_monitoring_fee_amount", label: "Financier Monitoring Fee"}),
			        search.createColumn({name: "custentity_bb_fin_owned_equip_costs_amt", label: "Financier Owned Equipment Costs"}),
			        search.createColumn({name: "custentity_bb_financier_payment_schedule", label: "Financier Payment Schedule"}),
			        search.createColumn({name: "custentity_bb_fin_pur_price_p_watt_amt", label: "Financier Purchase Price / Watt"}),
			        search.createColumn({name: "custentity_bb_fin_total_fees_amount", label: "Financier Total Fees"}),
			        search.createColumn({name: "custentity_bb_fin_total_invoice_amount", label: "Financier Total Invoice Amount"}),
			        search.createColumn({name: "custentity_bb_financing_type", label: "Financing Type"}),
			        search.createColumn({name: "custentity_bb_fin_fixed_adder_amt", label: "Fixed Adder Total Amount"}),
			        search.createColumn({name: "custentity_bb_homeowner_customer", label: "Homeowner Customer Record"}),
			        search.createColumn({name: "custentity_bb_install_scheduled_date", label: "Installation Scheduled"}),
			        search.createColumn({name: "custentity_bb_installer_partner_vendor", label: "Installer Partner"}),
			        search.createColumn({name: "custentity_bb_installer_adder_total_amt", label: "Installer Adder Total"}),
			        search.createColumn({name: "custentity_bb_install_adder_tot_p_w_amt", label: "Installer Adder Total / Watt"}),
			        search.createColumn({name: "custentity_bb_ss_inst_already_billed_amt", label: "Installer Already Billed Amount"}),
			        search.createColumn({name: "custentity_bb_installer_amt", label: "Installer Sub-contractor Amount"}),
			        search.createColumn({name: "custentity_bb_installer_fxd_addr_ttl_amt", label: "Installer Sub-contractor Fixed Adder Total"}),
			        search.createColumn({name: "custentity_bb_installer_m0_vbill_perc", label: "Installer Sub-contractor M0 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_installer_m0_vbill_amt", label: "Installer Sub-contractor M0 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_installer_m1_vbill_perc", label: "Installer Sub-contractor M1 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_installer_m1_vbill_amt", label: "Installer Sub-contractor M1 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_installer_m2_vbill_perc", label: "Installer Sub-contractor M2 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_installer_m2_vbill_amt", label: "Installer Sub-contractor M2 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_installer_m3_vbill_perc", label: "Installer Sub-contractor M3 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_installer_m3_vbill_amt", label: "Installer Sub-contractor M3 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_installer_m4_vbill_perc", label: "Installer Sub-contractor M4 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_installer_m4_vbill_amt", label: "Installer Sub-contractor M4 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_installer_m5_vbill_perc", label: "Installer Sub-contractor M5 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_installer_m5_vbill_amt", label: "Installer Sub-contractor M5 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_installer_m6_vbill_perc", label: "Installer Sub-contractor M6 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_installer_m6_vbill_amt", label: "Installer Sub-contractor M6 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_installer_m7_vbill_perc", label: "Installer Sub-contractor M7 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_installer_m7_vbill_amt", label: "Installer Sub-contractor M7 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_install_part_pay_schedule", label: "Installer Sub-contractor Pay Schedule"}),
			        search.createColumn({name: "custentity_bb_installr_p_ft_addr_ttl_amt", label: "Installer Sub-contractor Per Foot Adder Total"}),
			        search.createColumn({name: "custentity_bb_instllr_pr_md_addr_ttl_amt", label: "Installer Sub-contractor Per Module Adder Total"}),
			        search.createColumn({name: "custentity_bb_instllr_pr_wt_addr_ttl_amt", label: "Installer Sub-contractor Per Watt Adder Total"}),
			        search.createColumn({name: "custentity_bb_installer_price_p_w", label: "Installer Sub-contractor Price / Watt"}),
			        search.createColumn({name: "custentity_bb_installer_vbill_ttl_amt", label: "Installer Sub-contractor Total Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_install_total_payment_p_w", label: "Installer Total Payment  / Watt"}),
			        search.createColumn({name: "custentity_bb_installer_total_pay_amt", label: "Installer Total Payment"}),
			        search.createColumn({name: "custentity_bb_inventory_amount", label: "Inventory Amount"}),
			        search.createColumn({name: "custentity_bb_inverter_item", label: "Inverter Item"}),
			        search.createColumn({name: "custentity_bb_inverter_quantity_num", label: "Inverter Quantity"}),
			        search.createColumn({name: "custentity_bb_m0_date", label: "M0 Date"}),
			        search.createColumn({name: "custentity_bb_manual_paid_comm_amount", label: "Manual Paid Commission Amount"}),
			        search.createColumn({name: "custentity_bb_market_segment", label: "Market Segment"}),
			        search.createColumn({name: "custentity_bb_module_item", label: "Module"}),
			        search.createColumn({name: "custentity_bb_module_quantity_num", label: "Module Quantity"}),
			        search.createColumn({name: "custentity_bb_fin_orig_per_watt_amt", label: "Origination Amount / Watt"}),
			        search.createColumn({name: "custentity_bb_fin_orig_base_amt", label: "Origination Base Amount"}),
			        search.createColumn({name: "custentity_bb_fin_orig_base_per_watt_amt", label: "Origination Base Price / Watt"}),
			        search.createColumn({name: "custentity_bb_orgntr_addr_ttl_amt", label: "Originator Adder Total"}),
			        search.createColumn({name: "custentity_bb_ss_org_already_billed_amt", label: "Originator Already Billed Amount"}),
			        search.createColumn({name: "custentity_bb_originator_base_amt", label: "Originator Base Amount"}),
			        search.createColumn({name: "custentity_bb_originator_base_p_watt_amt", label: "Originator Base Amount / Watt"}),
			        search.createColumn({name: "custentity_bb_orgntr_fxd_addr_ttl_amt", label: "Originator Fixed Adder Total"}),
			        search.createColumn({name: "custentity_bb_orgntr_m0_vbill_perc", label: "Originator M0 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_orgntr_m0_vbill_amt", label: "Originator M0 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_orgntr_m1_vbill_perc", label: "Originator M1 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_orgntr_m1_vbill_amt", label: "Originator M1 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_orgntr_m2_vbill_perc", label: "Originator M2 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_orgntr_m2_vbill_amt", label: "Originator M2 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_orgntr_m3_vbill_perc", label: "Originator M3 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_orgntr_m3_vbill_amt", label: "Originator M3 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_orgntr_m4_vbill_perc", label: "Originator M4 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_orgntr_m4_vbill_amt", label: "Originator M4 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_orgntr_m5_vbill_perc", label: "Originator M5 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_orgntr_m5_vbill_amt", label: "Originator M5 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_orgntr_m6_vbill_perc", label: "Originator M6 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_orgntr_m6_vbill_amt", label: "Originator M6 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_orgntr_m7_vbill_perc", label: "Originator M7 Vendor Bill %"}),
			        search.createColumn({name: "custentity_bb_orgntr_m7_vbill_amt", label: "Originator M7 Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_sales_partner_pay_schedule", label: "Originator Payment Schedule"}),
			        search.createColumn({name: "custentity_bb_orgntr_payment_tot_amt", label: "Originator Payment Total"}),
			        search.createColumn({name: "custentity_bb_orgntr_pay_tot_p_w_amt", label: "Originator Payment Total / Watt"}),
			        search.createColumn({name: "custentity_bb_orgntr_per_ft_addr_ttl_amt", label: "Originator Per Foot Adder Total"}),
			        search.createColumn({name: "custentity_bb_orgntr_per_mod_adder_amt", label: "Originator Per Module Adder Total"}),
			        search.createColumn({name: "custentity_bb_orgntr_per_watt_adder_amt", label: "Originator Per Watt Adder Total"}),
			        search.createColumn({name: "custentity_bb_orig_tot_vendor_bill_amt", label: "Originator Total Vendor Bill Amount"}),
			        search.createColumn({name: "custentity_bb_originator_vendor", label: "Originator Vendor"}),
			        search.createColumn({name: "custentity_bb_fin_per_foot_adder_amt", label: "Per Foot Adder Total Amount"}),
			        search.createColumn({name: "custentity_bb_fin_per_module_adder_amt", label: "Per Module Adder Total Amount"}),
			        search.createColumn({name: "custentity_bb_fin_per_watt_adder_amt", label: "Per Watt Adder Total Amount"}),
			        search.createColumn({name: "custentity_bb_fin_prelim_purch_price_amt", label: "Preliminary Purchase Price"}),
			        search.createColumn({name: "custentity_bb_price_per_kwh_amount", label: "Price Per kWh"}),
			        search.createColumn({name: "custentity_bb_project_acctg_method", label: "Project Accounting Method"}),
			        search.createColumn({name: "custentity_bb_project_location", label: "Project Location"}),
			        search.createColumn({name: "custentity_bb_project_so", label: "Project SO"}),
			        search.createColumn({name: "custentity_bb_started_from_proj_template", label: "Project Template"}),
			        search.createColumn({name: "jobtype", label: "Project Type"}),
			        search.createColumn({name: "custentity_bb_sales_rep_employee", label: "Sales Rep"}),
			        search.createColumn({name: "custentity_bb_ss_sales_tax_account", label: "Sales Tax Account"}),
			        search.createColumn({name: "custentity_bb_sales_tax_amount", label: "Sales Tax Amount"}),
			        search.createColumn({name: "custentity_bb_system_size_decimal", label: "System Size (kW)"}),
			        search.createColumn({name: "custentity_bb_tot_contract_value_cpy_amt", label: "Total Contract Value (Copy)"}),
			        search.createColumn({name: "custentity_bb_total_contract_value_amt", label: "Total Contract Value"}),
			        search.createColumn({name: "custentity_bb_tot_con_value_per_watt_amt", label: "Total Contract Value / Watt"}),
			        search.createColumn({name: "custentity_bb_total_project_ar_amount", label: "Total Project AR"}),
			        search.createColumn({name: "custentity_bb_rebate_application_amount", label: "Rebate Application Amount"}),
			        search.createColumn({name: "custentity_bb_rebate_confirmation_amount", label: "Rebate Confirmation Amount"}),
			        search.createColumn({name: "custentity_bb_fin_install_per_watt_amt", label: "Financier Installation Per Watt Amount"}),
			        search.createColumn({name: "custentity_bb_fin_install_base_amt", label: "Financier Installation Base Amount"}),
			        search.createColumn({name: "custentity_bb_site_audit_amount", label: "Site Audit Amount"}),
			        search.createColumn({name: "custentity_bb_design_amount", label: "Design Amount"}),
			        search.createColumn({name: "custentity_bb_inspection_amount", label: "Inspection Amount"}),
			        search.createColumn({name: "custentity_bb_warranty_service_amount", label: "Warranty Service Amount"}),
			        search.createColumn({name: "custentity_bb_dealer_fee_percent", label: "Dealer Fee Percent"}),
			        search.createColumn({name: "custentity_bb_dealer_fee_app_method", label: "Dealer Fee Application Method"}),
					search.createColumn({name: "custentity_bb_orig_pay_total_overide_amt", label: "Originator Payment Total (Override)"}),
					search.createColumn({name: "custentity_bb_install_pay_total_ovrd_amt", label: "Installer Subcontractor Payment Total (Override)"}),
					search.createColumn({name: "custentity_bb_revenue_amount", label: "Revenue Amount"}),
					search.createColumn({name: "custentity_bb_equip_cost_amount", label: "Equipment Cost"}),
					search.createColumn({name: "custentity_bb_services_costs_amount", label: "Services Cost"}),
	              	search.createColumn({
			         	name: "custrecord_bb_orig_base_calc_method",
			         	join: "CUSTENTITY_BBSS_CONFIGURATION",
			         	label: "Origination Calculation Method"
			      	}),
	              	search.createColumn({
			         	name: "custrecord_bb_use_pay_mem_wth_label_bool",
			         	join: "CUSTENTITY_BBSS_CONFIGURATION",
			         	label: "Use Payment Memo with Record Label"
			      	}),
				]
			});
			var searchResultCount = jobSearchObj.runPaged().count;
			log.debug("Project Accounting Data Record Count",searchResultCount);
			var start = 0;
			var end = 1;
			var resultSet = jobSearchObj.run();
			var results = resultSet.getRange({
				start: start,
				end: end
			});
			for (var i = 0; i < results.length; i++) {
				for (var c = 0; c < resultSet.columns.length; c++) {
					// include finanicer schedule data in object
					if (resultSet.columns[c].name == 'custentity_bb_financier_payment_schedule' && results[i].getValue({name: resultSet.columns[c].name})) {
						var finscheduleObj = accountingCalc.getScheduleData(results[i].getValue({name: resultSet.columns[c].name}))
						projectObj['finDownPayment'] = finscheduleObj.downPayment;
						projectObj['finDownPaymentMilestoneName'] = finscheduleObj.downPaymentMilestoneName;
						projectObj['finM0Amount'] = finscheduleObj.m0Amount;
						projectObj['finM1Amount'] = finscheduleObj.m1Amount;
						projectObj['finM2Amount'] = finscheduleObj.m2Amount;
						projectObj['finM3Amount'] = finscheduleObj.m3Amount;
						projectObj['finM4Amount'] = finscheduleObj.m4Amount;
						projectObj['finM5Amount'] = finscheduleObj.m5Amount;
						projectObj['finM6Amount'] = finscheduleObj.m6Amount;
						projectObj['finM7Amount'] = finscheduleObj.m7Amount;
						log.debug('fin schedule object', finscheduleObj);
					}
					// include originator schedule data in object
					if (resultSet.columns[c].name == 'custentity_bb_sales_partner_pay_schedule' && results[i].getValue({name: resultSet.columns[c].name})) {
						var origscheduleObj = accountingCalc.getScheduleData(results[i].getValue({name: resultSet.columns[c].name}))
						projectObj['origM0Amount'] = origscheduleObj.m0Amount;
						projectObj['origM1Amount'] = origscheduleObj.m1Amount;
						projectObj['origM2Amount'] = origscheduleObj.m2Amount;
						projectObj['origM3Amount'] = origscheduleObj.m3Amount;
						projectObj['origM4Amount'] = origscheduleObj.m4Amount;
						projectObj['origM5Amount'] = origscheduleObj.m5Amount;
						projectObj['origM6Amount'] = origscheduleObj.m6Amount;
						projectObj['origM7Amount'] = origscheduleObj.m7Amount;
					}
					// include installer schedule data in object
					if (resultSet.columns[c].name == 'custentity_bb_install_part_pay_schedule' && results[i].getValue({name: resultSet.columns[c].name})) {
						var installscheduleObj = accountingCalc.getScheduleData(results[i].getValue({name: resultSet.columns[c].name}))
						projectObj['installM0Amount'] = installscheduleObj.m0Amount;
						projectObj['installM1Amount'] = installscheduleObj.m1Amount;
						projectObj['installM2Amount'] = installscheduleObj.m2Amount;
						projectObj['installM3Amount'] = installscheduleObj.m3Amount;
						projectObj['installM4Amount'] = installscheduleObj.m4Amount;
						projectObj['installM5Amount'] = installscheduleObj.m5Amount;
						projectObj['installM6Amount'] = installscheduleObj.m6Amount;
						projectObj['installM7Amount'] = installscheduleObj.m7Amount;
					}
					// add all other data per project accounting data search object
					// projectObj[resultSet.columns[c].name] = results[i].getValue({name: resultSet.columns[c].name});
					if (!resultSet.columns[c].join) {
						projectObj[resultSet.columns[c].name] = results[i].getValue({ name: resultSet.columns[c].name });
					} else {
						projectObj[resultSet.columns[c].name] = results[i].getValue({ name: resultSet.columns[c].name, join: resultSet.columns[c].join });
					}
				}
			}

		}
		// log.debug('projectDataObj', projectObj)
		return projectObj;
	}



   
    return {
        getProjectAccountingSearchData: getProjectAccountingSearchData
    };
    
});