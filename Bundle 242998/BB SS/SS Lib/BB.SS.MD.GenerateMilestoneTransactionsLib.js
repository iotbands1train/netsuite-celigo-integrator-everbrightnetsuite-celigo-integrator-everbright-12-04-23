/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Matt Lehman
 * @overview - Auto Generate Project Action Related Transations - Create Financier Invoices, Originator Vendor Bills, Installer Subcontractor Vendor Bills
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

define(['N/record', 'N/search', 'N/task', './BB.SS.ScheduledScript.BatchProcessing'],

function(record, search, task, batchProcessor) {

	function generateMilestoneTransactions(scriptContext, config, changedFields) {
		if (!scriptContext) return;

		var trigger = scriptContext.type;
		if (trigger != 'create') {
			var project = scriptContext.newRecord;
			var oldProject = scriptContext.oldRecord;
			var dateObj = getProjectDateObject(project, oldProject);

			var transactionObj = sendTransactionRecordsForProcessing(dateObj, project, changedFields, config)
			
			if (transactionObj.transactionArr.length > 0) {
				var taskParameters = {};
                taskParameters['custscript_bb_ss_transaction_array'] = transactionObj.transactionArr;

                var scriptId = 'customscript_bb_ss_proj_dt_processor';
                var deploymentId = 'customdeploy_bb_ss_proj_dt_processor';
                var taskType = task.TaskType.SCHEDULED_SCRIPT;

                batchProcessor.addToQueue(scriptId, deploymentId, taskParameters, taskType);
                // return changed project fields
                return transactionObj.changedFields;
			} 
		}
		return changedFields;
	}


	function sendTransactionRecordsForProcessing(dateObj, project, changedFields, config) {
		var transactionArr = [];

		var milestoneActionName = getProjectMilestoneActionNames(project);
        log.debug('milestoneActionName', milestoneActionName);
		if (!dateObj.origDateObj.newPaymentOnHold) {
			
			transactionArr = sendOriginatorForBilling(transactionArr, dateObj, config, project);
			transactionArr = sendInstallerForBilling(transactionArr, dateObj, config, project);

		}
		// else if (dateObj.origDateObj.newOrigOverrideAmt && !dateObj.origDateObj.newPaymentOnHold) {
		//
		// 	transactionArr = sendInstallerForBilling(transactionArr, dateObj, config, project);
		//
		// }
		transactionArr = sendFinancierForInvoicing(project, config, transactionArr, dateObj, changedFields,milestoneActionName);

		log.audit('transaction array', transactionArr);

		return {
			transactionArr: transactionArr,
			changedFields: changedFields
		}

	}


	function sendOriginatorForBilling(transactionArr, dateObj, config, project) {
		if ((!dateObj.origDateObj.oldM0Date && dateObj.origDateObj.newM0Date) || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.origDateObj.newM0Date)) {
			// create m0 originator bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.origDateObj.newM0Date, 'm0', config.id, 'originator');
		}

		if (!dateObj.origDateObj.oldM1Date && dateObj.origDateObj.newM1Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.origDateObj.newM1Date)) {
			// create m1 originator bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.origDateObj.newM1Date, 'm1', config.id, 'originator');
		}

		if (!dateObj.origDateObj.oldM2Date && dateObj.origDateObj.newM2Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.origDateObj.newM2Date)) {
			// create m2 originator bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.origDateObj.newM2Date, 'm2', config.id, 'originator');
		}

		if (!dateObj.origDateObj.oldM3Date && dateObj.origDateObj.newM3Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.origDateObj.newM3Date)) {
			// create m3 originator bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.origDateObj.newM3Date, 'm3', config.id, 'originator');
		}

		if ((!dateObj.origDateObj.oldM4Date && dateObj.origDateObj.newM4Date) || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.origDateObj.newM4Date)) {
			// create m0 originator bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.origDateObj.newM4Date, 'm4', config.id, 'originator');
		}

		if (!dateObj.origDateObj.oldM5Date && dateObj.origDateObj.newM5Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.origDateObj.newM5Date)) {
			// create m1 originator bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.origDateObj.newM5Date, 'm5', config.id, 'originator');
		}

		if (!dateObj.origDateObj.oldM6Date && dateObj.origDateObj.newM6Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.origDateObj.newM6Date)) {
			// create m2 originator bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.origDateObj.newM6Date, 'm6', config.id, 'originator');
		}

		if (!dateObj.origDateObj.oldM7Date && dateObj.origDateObj.newM7Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.origDateObj.newM7Date)) {
			// create m3 originator bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.origDateObj.newM7Date, 'm7', config.id, 'originator');
		}

		return transactionArr;
	}


	function sendInstallerForBilling(transactionArr, dateObj, config, project) {
		if (!dateObj.installDateObj.oldM0Date && dateObj.installDateObj.newM0Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.installDateObj.newM0Date)) {
			// create m0 installer bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.installDateObj.newM0Date, 'm0', config.id, 'installer');
		}

		if (!dateObj.installDateObj.oldM1Date && dateObj.installDateObj.newM1Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.installDateObj.newM1Date)) {
			// create m1 installer bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.installDateObj.newM1Date, 'm1', config.id, 'installer');
		}

		if (!dateObj.installDateObj.oldM2Date && dateObj.installDateObj.newM2Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.installDateObj.newM2Date)) {
			// create m2 installer bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.installDateObj.newM2Date, 'm2', config.id, 'installer');		
		}

		if (!dateObj.installDateObj.oldM3Date && dateObj.installDateObj.newM3Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.installDateObj.newM3Date)) {
			// create m3 installer bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.installDateObj.newM3Date, 'm3', config.id, 'installer');
		}

		if (!dateObj.installDateObj.oldM4Date && dateObj.installDateObj.newM4Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.installDateObj.newM4Date)) {
			// create m0 installer bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.installDateObj.newM4Date, 'm4', config.id, 'installer');
		}

		if (!dateObj.installDateObj.oldM5Date && dateObj.installDateObj.newM5Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.installDateObj.newM5Date)) {
			// create m1 installer bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.installDateObj.newM5Date, 'm5', config.id, 'installer');
		}

		if (!dateObj.installDateObj.oldM6Date && dateObj.installDateObj.newM6Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.installDateObj.newM6Date)) {
			// create m2 installer bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.installDateObj.newM6Date, 'm6', config.id, 'installer');		
		}

		if (!dateObj.installDateObj.oldM7Date && dateObj.installDateObj.newM7Date || (dateObj.origDateObj.oldPaymentOnHold && !dateObj.origDateObj.newPaymentOnHold && dateObj.installDateObj.newM7Date)) {
			// create m3 installer bill
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.installDateObj.newM7Date, 'm7', config.id, 'installer');
		}

		return transactionArr;
	}


	function sendFinancierForInvoicing(project, config, transactionArr, dateObj, changedFields,milestoneActionName) {
		if (!dateObj.finDateObj.oldM0Date && dateObj.finDateObj.newM0Date) {
			// create m0 financier invoice
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.finDateObj.newM0Date, 'm0', config.id, 'financier',milestoneActionName.m0);

			changedFields['custentity_bb_contract_pack_status_text'] = 'Approved by Internal Reviewer';
			changedFields['custentity_bb_contract_pack_start_date'] = new Date(dateObj.finDateObj.newM0Date);
			changedFields['custentity_bb_contract_pack_start_date'] = new Date(dateObj.finDateObj.newM0Date);
			changedFields['custentity_bb_contract_pack_last_mod_dt'] = new Date(dateObj.finDateObj.newM0Date);
			changedFields['custentity_bb_contract_pack_end_date'] = new Date(dateObj.finDateObj.newM0Date);
			// changedFields['custentity_bb_m0_date'] = new Date(dateObj.finDateObj.newM0Date);
		}
		if (!dateObj.finDateObj.oldM1Date && dateObj.finDateObj.newM1Date) {
			// create m1 financier invoice
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.finDateObj.newM1Date, 'm1', config.id, 'financier',milestoneActionName.m1);

			changedFields['custentity_bb_install_comp_pack_stat_txt'] = 'Approved by Internal Reviewer';
			changedFields['custentity_bb_install_comp_pack_start_dt'] = new Date(dateObj.finDateObj.newM1Date);
			changedFields['custentity_bb_install_comp_pack_last_dt'] = new Date(dateObj.finDateObj.newM1Date);
			changedFields['custentity_bb_install_comp_pack_end_date'] = new Date(dateObj.finDateObj.newM1Date);

		}
		if (!dateObj.finDateObj.oldM2Date && dateObj.finDateObj.newM2Date) {
			// create m2 financier invoice
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.finDateObj.newM2Date, 'm2', config.id, 'financier',milestoneActionName.m2);

			changedFields['custentity_bb_subst_compl_status_txt'] = 'Approved by Internal Reviewer';
			changedFields['custentity_bb_subst_compl_pack_start_dt'] = new Date(dateObj.finDateObj.newM2Date);
			changedFields['custentity_bb_subst_compl_last_mod_dt'] = new Date(dateObj.finDateObj.newM2Date);
			changedFields['custentity_bb_subst_compl_pack_end_dt'] = new Date(dateObj.finDateObj.newM2Date);

		}
		if (!dateObj.finDateObj.oldM3Date && dateObj.finDateObj.newM3Date) {
			// create m3 financier invoice
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.finDateObj.newM3Date, 'm3', config.id, 'financier',milestoneActionName.m3);

			changedFields['custentity_bb_final_acc_pack_status_text'] = 'Approved by Internal Reviewer';
			changedFields['custentity_bb_final_acc_pack_start_date'] = new Date(dateObj.finDateObj.newM0Date);
			changedFields['custentity_bb_final_acc_pack_last_mod_dt'] = new Date(dateObj.finDateObj.newM0Date);
			changedFields['custentity_bb_final_acc_pack_end_date'] = new Date(dateObj.finDateObj.newM0Date);

		}

		if (!dateObj.finDateObj.oldM4Date && dateObj.finDateObj.newM4Date) {
			// create m0 financier invoice
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.finDateObj.newM4Date, 'm4', config.id, 'financier',milestoneActionName.m4);

		}
		if (!dateObj.finDateObj.oldM5Date && dateObj.finDateObj.newM5Date) {
			// create m1 financier invoice
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.finDateObj.newM5Date, 'm5', config.id, 'financier',milestoneActionName.m5);

		}
		if (!dateObj.finDateObj.oldM6Date && dateObj.finDateObj.newM6Date) {
			// create m2 financier invoice
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.finDateObj.newM6Date, 'm6', config.id, 'financier',milestoneActionName.m6);

		}
		if (!dateObj.finDateObj.oldM7Date && dateObj.finDateObj.newM7Date) {
			// create m3 financier invoice
			transactionArr = pushValuesToTransactionArray(transactionArr, project.id, dateObj.finDateObj.newM7Date, 'm7', config.id, 'financier',milestoneActionName.m7);

		}
		return transactionArr;
	}


	function getProjectDateObject(project, oldProject) {
		var finDateObj = {};
		var origDateObj = {};
		var installDateObj = {};

		// financier date object fields
		finDateObj['newM0Date'] = project.getValue({fieldId: 'custentity_bb_m0_date'});
		finDateObj['oldM0Date'] = oldProject.getValue({fieldId: 'custentity_bb_m0_date'});

		finDateObj['newM1Date'] = project.getValue({fieldId: 'custentity_bb_m1_date'});
		finDateObj['oldM1Date'] = oldProject.getValue({fieldId: 'custentity_bb_m1_date'});

		finDateObj['newM2Date'] = project.getValue({fieldId: 'custentity_bb_m2_date'});
		finDateObj['oldM2Date'] = oldProject.getValue({fieldId: 'custentity_bb_m2_date'});

		finDateObj['newM3Date'] = project.getValue({fieldId: 'custentity_bb_m3_date'});
		finDateObj['oldM3Date'] = oldProject.getValue({fieldId: 'custentity_bb_m3_date'});

		finDateObj['newM4Date'] = project.getValue({fieldId: 'custentity_bb_m4_date'});
		finDateObj['oldM4Date'] = oldProject.getValue({fieldId: 'custentity_bb_m4_date'});

		finDateObj['newM5Date'] = project.getValue({fieldId: 'custentity_bb_m5_date'});
		finDateObj['oldM5Date'] = oldProject.getValue({fieldId: 'custentity_bb_m5_date'});

		finDateObj['newM6Date'] = project.getValue({fieldId: 'custentity_bb_m6_date'});
		finDateObj['oldM6Date'] = oldProject.getValue({fieldId: 'custentity_bb_m6_date'});

		finDateObj['newM7Date'] = project.getValue({fieldId: 'custentity_bb_m7_date'});
		finDateObj['oldM7Date'] = oldProject.getValue({fieldId: 'custentity_bb_m7_date'});

		// originator date object fields
		origDateObj['newM0Date'] = project.getValue({fieldId: 'custentity_bb_m0_origination_date'});
		origDateObj['oldM0Date'] = oldProject.getValue({fieldId: 'custentity_bb_m0_origination_date'});

		origDateObj['newM1Date'] = project.getValue({fieldId: 'custentity_bb_m1_origination_date'});
		origDateObj['oldM1Date'] = oldProject.getValue({fieldId: 'custentity_bb_m1_origination_date'});

		origDateObj['newM2Date'] = project.getValue({fieldId: 'custentity_bb_m2_origination_date'});
		origDateObj['oldM2Date'] = oldProject.getValue({fieldId: 'custentity_bb_m2_origination_date'});
		
		origDateObj['newM3Date'] = project.getValue({fieldId: 'custentity_bb_m3_origination_date'});
		origDateObj['oldM3Date'] = oldProject.getValue({fieldId: 'custentity_bb_m3_origination_date'});

		origDateObj['newM4Date'] = project.getValue({fieldId: 'custentity_bb_m4_origination_date'});
		origDateObj['oldM4Date'] = oldProject.getValue({fieldId: 'custentity_bb_m4_origination_date'});

		origDateObj['newM5Date'] = project.getValue({fieldId: 'custentity_bb_m5_origination_date'});
		origDateObj['oldM5Date'] = oldProject.getValue({fieldId: 'custentity_bb_m5_origination_date'});

		origDateObj['newM6Date'] = project.getValue({fieldId: 'custentity_bb_m6_origination_date'});
		origDateObj['oldM6Date'] = oldProject.getValue({fieldId: 'custentity_bb_m6_origination_date'});
		
		origDateObj['newM7Date'] = project.getValue({fieldId: 'custentity_bb_m7_origination_date'});
		origDateObj['oldM7Date'] = oldProject.getValue({fieldId: 'custentity_bb_m7_origination_date'});

		origDateObj['newOrigOverrideAmt'] = project.getValue({fieldId: 'custentity_bb_orig_pay_total_overide_amt'});
		origDateObj['oldOrigOverrideAmt'] = oldProject.getValue({fieldId: 'custentity_bb_orig_pay_total_overide_amt'});

		origDateObj['newPaymentOnHold'] = project.getValue({fieldId: 'custentity_bb_orig_payments_on_hold_bool'});
		origDateObj['oldPaymentOnHold'] = oldProject.getValue({fieldId: 'custentity_bb_orig_payments_on_hold_bool'});

		//installer date object fields
		installDateObj['newM0Date'] = project.getValue({fieldId: 'custentity_bb_m0_sub_install_date'});
		installDateObj['oldM0Date'] = oldProject.getValue({fieldId: 'custentity_bb_m0_sub_install_date'});

		installDateObj['newM1Date'] = project.getValue({fieldId: 'custentity_bb_m1_sub_install_date'});
		installDateObj['oldM1Date'] = oldProject.getValue({fieldId: 'custentity_bb_m1_sub_install_date'});

		installDateObj['newM2Date'] = project.getValue({fieldId: 'custentity_bb_m2_sub_install_date'});
		installDateObj['oldM2Date'] = oldProject.getValue({fieldId: 'custentity_bb_m2_sub_install_date'});
		
		installDateObj['newM3Date'] = project.getValue({fieldId: 'custentity_bb_m3_sub_install_date'});
		installDateObj['oldM3Date'] = oldProject.getValue({fieldId: 'custentity_bb_m3_sub_install_date'});

		installDateObj['newM4Date'] = project.getValue({fieldId: 'custentity_bb_m4_sub_install_date'});
		installDateObj['oldM4Date'] = oldProject.getValue({fieldId: 'custentity_bb_m4_sub_install_date'});

		installDateObj['newM5Date'] = project.getValue({fieldId: 'custentity_bb_m5_sub_install_date'});
		installDateObj['oldM5Date'] = oldProject.getValue({fieldId: 'custentity_bb_m5_sub_install_date'});

		installDateObj['newM6Date'] = project.getValue({fieldId: 'custentity_bb_m6_sub_install_date'});
		installDateObj['oldM6Date'] = oldProject.getValue({fieldId: 'custentity_bb_m6_sub_install_date'});
		
		installDateObj['newM7Date'] = project.getValue({fieldId: 'custentity_bb_m7_sub_install_date'});
		installDateObj['oldM7Date'] = oldProject.getValue({fieldId: 'custentity_bb_m7_sub_install_date'});

		return {
			finDateObj: finDateObj,
			origDateObj: origDateObj,
			installDateObj: installDateObj
		}

	}

	function pushValuesToTransactionArray(array, projectId, milestoneDate, milestoneName, configId, type, milestoneActionName) {
		array.push({
			project: projectId,
			milestoneDate: milestoneDate,
			milestoneName: milestoneName,
			configId: configId,
			type: type,
			milestoneActionName:milestoneActionName
		});
		return array;
	}

	/**
	 * Function gets the milestone action names from the project's Milestone payment schedule
	 * @param project
	 * @returns {{}}
	 */
	function getProjectMilestoneActionNames(project){
		var milestonePayment = search.lookupFields({
			type: 'job',
			id: project.id,
			columns: ['custentity_bb_financier_payment_schedule']
		});
        if (milestonePayment.custentity_bb_financier_payment_schedule.length > 0) {
			var customrecord_bb_milestone_pay_scheduleSearchObj = search.create({
				type: "customrecord_bb_milestone_pay_schedule",
				filters:
					[
						["internalid","anyof",milestonePayment.custentity_bb_financier_payment_schedule[0].value]
					],
				columns:
					[
						search.createColumn({name: "custrecord_bb_m0_package_action"}),
						search.createColumn({name: "custrecord_bb_m1_package_action"}),
						search.createColumn({name: "custrecord_bb_m2_package_action"}),
						search.createColumn({name: "custrecord_bb_m3_package_action"}),
						search.createColumn({name: "custrecord_bb_m4_package_action"}),
						search.createColumn({name: "custrecord_bb_m5_package_action"}),
						search.createColumn({name: "custrecord_bb_m6_package_action"}),
						search.createColumn({name: "custrecord_bb_m7_package_action"})
					]
			});
			var milestoneActionName={};
			customrecord_bb_milestone_pay_scheduleSearchObj.run().each(function(result){
				milestoneActionName.m0=result.getText({
					name: "custrecord_bb_m0_package_action"
				});
				milestoneActionName.m1=result.getText({
					name: "custrecord_bb_m1_package_action"
				})
				milestoneActionName.m2=result.getText({
					name: "custrecord_bb_m2_package_action"
				})
				milestoneActionName.m3=result.getText({
					name: "resucustrecord_bb_m3_package_action"
				})
				milestoneActionName.m4=result.getText({
					name: "custrecord_bb_m4_package_action"
				})
				milestoneActionName.m5=result.getText({
					name: "custrecord_bb_m5_package_action"
				})
				milestoneActionName.m6=result.getText({
					name: "custrecord_bb_m6_package_action"
				})
				milestoneActionName.m7=result.getText({
					name: "custrecord_bb_m7_package_action"
				})
				return true;
			});
			return milestoneActionName;
		}
	}
   
    return {
        generateMilestoneTransactions: generateMilestoneTransactions,
        pushValuesToTransactionArray: pushValuesToTransactionArray
    };
    
});