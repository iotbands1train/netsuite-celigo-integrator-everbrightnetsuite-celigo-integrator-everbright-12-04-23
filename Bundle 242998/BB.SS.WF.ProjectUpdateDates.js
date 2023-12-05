/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope public
 * @author Ashley Wallace
 * @version 0.1.1
 * @fileOverview This workflow action script updates the project milestone dates and trigger invoice
 * and bill creation when a milestone completion date has been manually marked completed by the user. 
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

define(['N/record',	'./BB SS/SS Lib/BB.SS.Invoice.Service', './BB SS/SS Lib/BB.SS.VendorBill.Service', 'N/runtime'],
    function(record, invoiceService, vendorBillService, runtime) {
    
        /**
         * Entry point
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {Record} scriptContext.form - Form (serverWidget.form)
         * @param {string} scriptContext.type - Trigger type
         * @param {integer} scriptContext.workflowId - Internal ID of the workflow that calls the script
         */
        function onAction(scriptContext) {
            try{
                var milestone = runtime.getCurrentScript().getParameter({name:'custscript_bb_ss_wf_milestone_txt'}); 
                var newMilestoneDate = runtime.getCurrentScript().getParameter({name:'custscript_bb_ss_wf_new_milestone_dt'}); 

                var config = record.load({
                	type: 'customrecord_bb_solar_success_configurtn',
                	id: scriptContext.newRecord.getValue({fieldId: 'custentity_bbss_configuration'}),
                });

                var project = invoiceService.createInvoiceFromProjectAndMilestoneName(scriptContext.newRecord, milestone.toUpperCase(), config, newMilestoneDate);
                project = vendorBillService.createVendorBillFromProjectAndMilestoneName(project, milestone.toUpperCase(), config, newMilestoneDate);
                project = updateMilestoneDates(milestone, newMilestoneDate, project);

                var invoiceUpload = runtime.getCurrentScript();
                log.debug('Remaining governance units', invoiceUpload.getRemainingUsage());

            } catch (e){
                     log.error('ERROR', e);
            }
        }




        function updateMilestoneDates(milestone, newMilestoneDate, project)
        {
            var eventMap = {};
            eventMap['m0'] = setM0Fields;
            eventMap['m1'] = setM1Fields;
            eventMap['m2'] = setM2Fields;
            eventMap['m3'] = setM3Fields;
    
            eventMap[milestone] ? eventMap[milestone](project, newMilestoneDate) : milestoneError(milestone);
        }




        function setM0Fields(project, newMilestoneDate){
            var startDate = project.getValue('custentity_bb_contract_pack_start_date');

            project.setValue({ 
                fieldId: 'custentity_bb_contract_pack_status_text',
                value: 'Approved by Internal Reviewer'
            }).setValue({
                fieldId: 'custentity_bb_contract_pack_start_date',
                value: startDate ? startDate : newMilestoneDate
            }).setValue({
                fieldId: 'custentity_bb_contract_pack_last_mod_dt',
                value: newMilestoneDate
            }).setValue({
                fieldId:'custentity_bb_contract_pack_end_date',
                value: newMilestoneDate
            })
                    
            return project;
        }




        function setM1Fields(project, newMilestoneDate){
            var startDate = project.getValue('custentity_bb_install_comp_pack_start_dt');

            project.setValue({
                fieldId: 'custentity_bb_install_comp_pack_stat_txt',
                value: 'Approved by Internal Reviewer'
            }).setValue({
                fieldId: 'custentity_bb_install_comp_pack_start_dt',
                value: startDate ? startDate : newMilestoneDate
            }).setValue({
                fieldId: 'custentity_bb_install_comp_pack_last_dt',
                value: newMilestoneDate
            }).setValue({
                fieldId: 'custentity_bb_install_comp_pack_end_date',
                value: newMilestoneDate
            })
            
            return project;
                    
        }




        function setM2Fields(project, newMilestoneDate){
            var startDate = project.getValue('custentity_bb_subst_compl_pack_start_dt');

            project.setValue({
                fieldId: 'custentity_bb_subst_compl_status_txt',
                value: 'Approved by Internal Reviewer'
            }).setValue({
                fieldId: 'custentity_bb_subst_compl_pack_start_dt',
                value: startDate ? startDate : newMilestoneDate
            }).setValue({
                fieldId: 'custentity_bb_subst_compl_last_mod_dt',
                value: newMilestoneDate
            }).setValue({
                fieldId: 'custentity_bb_subst_compl_pack_end_dt',
                value: newMilestoneDate
            })
            
            return project;
        }




        function setM3Fields(project, newMilestoneDate){
            var startDate = project.getValue('custentity_bb_final_acc_pack_start_date');

            project.setValue({
                fieldId: 'custentity_bb_final_acc_pack_status_text',
                value: 'Approved by Internal Reviewer'
            }).setValue({
                fieldId: 'custentity_bb_final_acc_pack_start_date',
                value: startDate ? startDate : newMilestoneDate
            }).setValue({
                fieldId: 'custentity_bb_final_acc_pack_last_mod_dt',
                value: newMilestoneDate
            }).setValue({
                fieldId: 'custentity_bb_final_acc_pack_end_date',
                value: newMilestoneDate
            })
            
            return project;

        }




        function milestoneError(milestone){
            log.debug('set milestone field error', 'milestone: ' + milestone);
        }


        return {
            onAction:onAction
        }
    
    }
);