/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope public
 * @author Tyler Mann
 * @version 0.1.1
 * @fileOverview This user event script updates the Project dates based on updates from the Project Actions
 * It also updates related project actions to approved if milestone completed
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

define(['N/record', 'N/search', 'N/runtime','N/https', './BB SS/SS Lib/BB_SS_MD_SolarConfig',
	'./BB SS/SS Lib/BB.SS.Invoice.Service', './BB SS/SS Lib/BB.SS.VendorBill.Service', './BB SS/SS Lib/BB.SS.DocumentStatus.Service'],
    function(record, search,  runtime, https, solarConfig, invoiceService, vendorBillService, documentStatusService) {
		/**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {Record} scriptContext.form - Form (serverWidget.form)
         * @param {string} scriptContext.type - Trigger type
         * @param {integer} scriptContext.workflowId - Internal ID of the workflow that calls the script
         * @Since 2015.2
         */
        function onAction(scriptContext) {
        	var trigger = scriptContext.type;
    		var stLogger = 'afterSubmit';
        	var a_results = [];
        	log.debug(stLogger + ' executionContext', runtime.executionContext);
        	log.debug(stLogger + ' trigger', trigger);

        	var recProjectAction = scriptContext.newRecord;
    		var iProjectID = recProjectAction.getValue('custrecord_bb_project');
    		log.debug(stLogger + 'Project ID: ', iProjectID);
    		
    		var recProject = record.load({
    			type: 'job',
    			id: iProjectID,
    			isDynamic: true,
    		});
    		
    		recProject = updateProjectDates(recProject, recProjectAction, scriptContext);
    		// recProject.save({
    		// 	ignoreMandatoryFields:true
    		// });



        }
        
        function updateProjectDates(project, projectAction, scriptContext){
        	var projectId = project.id;
        	var stLogger = 'updateProjectDates';
    		var strCurrentPackage = projectAction.getText('custrecord_bb_package');
    		var iCurrentPackage = projectAction.getValue('custrecord_bb_package');
    		var strPackageStatus = projectAction.getText('custrecord_bb_document_status');
			var dtPackageLastModDate = projectAction.getValue('custrecord_bb_document_status_date');
            var config = record.load({
            	type: 'customrecord_bb_solar_success_configurtn',
            	id: project.getValue({
            		fieldId: 'custentity_bbss_configuration'
            	}),
            });

			//if doesn't match any milestone action, then returns -1
			var milestoneNumCompleted = getMilestoneNumCompleted(project, projectAction, config); 
			log.debug('updateProjectDates milestoneCompleted', milestoneNumCompleted);
        	
			var packageCompletion = (milestoneNumCompleted!==-1)||getPackageCompletion(iCurrentPackage, project.id);
			log.debug('updateProjectDates packageCompletion', packageCompletion);
			var packageEndDate = setPackageEndDate(dtPackageLastModDate, iCurrentPackage, packageCompletion, milestoneNumCompleted);
	        if(milestoneNumCompleted !== -1){

		        approveRelatedProjectActions(projectAction, iCurrentPackage, project.id,  milestoneNumCompleted, config);
				//project = updateMilestoneDates(project, projectAction, milestoneNumCompleted);
				updateMilestoneDates(project, projectAction, milestoneNumCompleted);
	        	project = sendInvoiceBillCreation(project, milestoneNumCompleted, config); // confirmed working, creates invoice
	        	// project = updateMilestoneDates(project, projectAction, milestoneNumCompleted);
	        }

			
    		switch (strCurrentPackage) {
			case 'Site Audit Package':		
				var dtSiteAuditPackageStartDate = setPackageStartDate(project.getValue('custentity_bb_site_audit_pack_start_date'), dtPackageLastModDate);
	
				//Set Project field values
				var values = {
					'custentity_bb_site_audit_pack_status_txt':strPackageStatus,
					'custentity_bb_site_audit_pack_start_date': dtSiteAuditPackageStartDate,
					'custentity_bb_site_audit_pack_last_date': dtPackageLastModDate,
					'custentity_bb_site_audit_pack_end_date': packageEndDate
				};

				log.debug('Confirm', 'Site Audit Package Fields');

				setProjectFields(values, projectId);


				break;
			case 'Contract Package':
				var dtContractPackageStartDate = setPackageStartDate(project.getValue('custentity_bb_contract_pack_start_date'), dtPackageLastModDate);
								
				//Set Project field values
				var values = {
					'custentity_bb_contract_pack_status_text': strPackageStatus,
					'custentity_bb_contract_pack_start_date': dtContractPackageStartDate,
					'custentity_bb_contract_pack_last_mod_dt': dtPackageLastModDate,
					'custentity_bb_contract_pack_end_date': packageEndDate
				};

				setProjectFields(values, projectId);
				log.debug('Confirm', 'Contract Package Fields');

				break;
			case 'Utility Package':		
				var dtUtilityPackageStartDate = setPackageStartDate(project.getValue('custentity_bb_utility_package_start_date'), dtPackageLastModDate);
				strUtilityPackageStatus = processUtilityPackage(project, strUtilityPackageStatus, projectPackageTask);

				//Set Project field values
				var values = {
					'custentity_bb_utility_package_status': strPackageStatus,
					'custentity_bb_utility_package_start_date': strPackageStatus,
					'custentity_bb_utility_pack_last_mod_date': dtPackageLastModDate,
					'custentity_bb_utility_package_end_date': packageEndDate
				};

				setProjectFields(values, projectId);
				log.debug('Confirm', 'Utility Package Fields');

				break;	
				
			case 'Rebate Package':	
				var dtRebatePackageStartDate = setPackageStartDate(project.getValue('custentity_bb_rebate_package_start_date'), dtPackageLastModDate);

				//Set Project field values
				var values = {
					'custentity_bb_rebate_package_status_text': strPackageStatus,
					'custentity_bb_rebate_package_start_date': dtRebatePackageStartDate,
					'custentity_bb_rebate_package_last_mod_dt': dtPackageLastModDate,
					'custentity_bb_rebate_package_end_date': packageEndDate
				};
				
				setProjectFields(values, projectId);
				log.debug('Confirm', 'Rebate Package Fields');
				break;
				
			case 'HOA Package':		
				var dtHOAPackageStartDate = setPackageStartDate(project.getValue('custentity_bb_hoa_package_start_date'), dtPackageLastModDate);

				//Set Project field values
				var values = {
					'custentity_bb_hoa_package_status_text': strPackageStatus,
					'custentity_bb_hoa_package_start_date': dtHOAPackageStartDate,
					'custentity_bb_hoa_package_last_mod_date': dtPackageLastModDate,
					'custentity_bb_hoa_package_end_date': packageEndDate
				};

				setProjectFields(values, projectId);
				log.debug('Confirm', 'HOA Package Fields');
				

				break;
			case 'Design Package':		
				var dtDesignPackageStartDate = setPackageStartDate(project.getValue('custentity_bb_design_package_start_date'), dtPackageLastModDate);

				//Set Project field values
				var values = {
					'custentity_bb_design_pack_status_text': strPackageStatus,
					'custentity_bb_design_package_start_date': dtDesignPackageStartDate,
					'custentity_bb_design_pack_last_mod_date': dtPackageLastModDate,
					'custentity_bb_design_package_end_date': packageEndDate
				};


				setProjectFields(values, projectId);
				log.debug('Confirm', 'Design Package Fields');

				break;
			case 'Installation Completion Package':		
				var dtInstallationCompletionPackageStartDate = setPackageStartDate(project.getValue('custentity_bb_install_comp_pack_start_dt'), dtPackageLastModDate);
				//Set Project field values
				var values = {
					'custentity_bb_install_comp_pack_stat_txt': strPackageStatus,
					'custentity_bb_install_comp_pack_start_dt': dtInstallationCompletionPackageStartDate,
					'custentity_bb_install_comp_pack_last_dt': dtPackageLastModDate,
					'custentity_bb_install_comp_pack_end_date': packageEndDate
				}

				setProjectFields(values, projectId);
				log.debug('Confirm', 'Installation Completion Package Fields');

				break;
			case 'Substantial Completion Package':		
				var dtInstallationCompletionPackageStartDate = setPackageStartDate(project.getValue('custentity_bb_subst_compl_pack_start_dt'), dtPackageLastModDate);

				//Set Project field values
				var values = {
					'custentity_bb_subst_compl_status_txt': strPackageStatus,
					'custentity_bb_subst_compl_pack_start_dt': dtInstallationCompletionPackageStartDate,
					'custentity_bb_subst_compl_last_mod_dt': dtPackageLastModDate,
					'custentity_bb_subst_compl_pack_end_dt': packageEndDate
				}

				setProjectFields(values, projectId);
				log.debug('Confirm', 'Substantial Package Fields');

				break;
				
			case 'Final Acceptance Package':		
				var dtFinalAcceptancePackageStartDate = setPackageStartDate(project.getValue('custentity_bb_final_acc_pack_start_date'), dtPackageLastModDate);

				//Set Project field values

				var values = {
	    				'custentity_bb_final_acc_pack_status_text': strPackageStatus,
	    				'custentity_bb_final_acc_pack_start_date': dtFinalAcceptancePackageStartDate,
	    				'custentity_bb_final_acc_pack_last_mod_dt': dtPackageLastModDate,
	    				'custentity_bb_final_acc_pack_end_date': packageEndDate
	    			}

				setProjectFields(values, projectId);
				log.debug('Confirm', 'Final Acceptance Package Fields');

				break;				
    		}
				

        	return project;
        }
        
        function getMilestoneNumCompleted(project, projectAction, config){ 
        	var projectFinancingType = project.getText('custentity_bb_financing_type');
        	var packageAction = projectAction.getValue('custrecord_bb_project_package_action');
        	var actionStatusText = projectAction.getText('custrecord_bb_document_status');
        	var actionStatusValue = projectAction.getValue('custrecord_bb_document_status');
        	//if(actionStatusText.indexOf('Approved') === -1) return -1;
        	if(!documentStatusService.isApprovedStatusType(actionStatusValue)) return -1;
			if(projectFinancingType == 'Cash'){
        		var configs = {
        				custrecord_bb_cash_m0_package_action: config.getValue('custrecord_bb_cash_m0_package_action'),
        				custrecord_bb_cash_m1_package_action: config.getValue('custrecord_bb_cash_m1_package_action'),
        				custrecord_bb_cash_m2_package_action: config.getValue('custrecord_bb_cash_m2_package_action'),
        				custrecord_bb_cash_m3_package_action: config.getValue('custrecord_bb_cash_m3_package_action'),
        		};
        		if(packageAction == configs.custrecord_bb_cash_m0_package_action){
        			return 0;
        		}
        		else if(packageAction == configs.custrecord_bb_cash_m1_package_action){
        			return 1;
        		}
        		else if(packageAction == configs.custrecord_bb_cash_m2_package_action){
        			return 2;
        		}
        		else if(packageAction == configs.custrecord_bb_cash_m3_package_action){
        			return 3;
        		}
        	}
        	else{//loan or TPO
        		var configs = {
        				custrecord_bb_loan_m0_package_action: config.getValue('custrecord_bb_loan_m0_package_action'),
        				custrecord_bb_loan_m1_package_action: config.getValue('custrecord_bb_loan_m1_package_action'),
        				custrecord_bb_loan_m2_package_action: config.getValue('custrecord_bb_loan_m2_package_action'),
        				custrecord_bb_loan_m3_package_action: config.getValue('custrecord_bb_loan_m3_package_action'),
        		};
        		if(packageAction == configs.custrecord_bb_loan_m0_package_action){
        			return 0;
        		}
        		else if(packageAction == configs.custrecord_bb_loan_m1_package_action){
        			return 1;
        		}
        		else if(packageAction == configs.custrecord_bb_loan_m2_package_action){
        			return 2;
        		}
        		else if(packageAction == configs.custrecord_bb_loan_m3_package_action){
        			return 3;
        		}
        	}
        	return -1;        	
        }
                  
        function isNotNull(str){
        	return (str !== null && str !== '' && str !== undefined);
        }
        
        function isNull(str){
        	return (str === null || str === '' || str === undefined);
        }
        
        function setPackageStartDate( dtPackageStartDate, dtPackageLastModDate)
        {
        	if (isNull(dtPackageStartDate)){
        		dtPackageStartDate = dtPackageLastModDate;		
        	}
        	
        	return dtPackageStartDate;
        }

        function setPackageEndDate(dtPackageLastModDate, iPackageID, packageCompletion, milestoneNumSet)
        {
        	var dtPackageEndDate = null;
        	
        	if (milestoneNumSet !== -1 || packageCompletion){
        		dtPackageEndDate = dtPackageLastModDate;		
        	}
        	else{
        		dtPackageEndDate = null; 
        	}
        	
        	return dtPackageEndDate;
        }
        
        function updateMilestoneDates(project, projectAction, iMilestoneCompleted){
        	var lastModDate = projectAction.getValue('custrecord_bb_document_status_date');
        	var projectId = project.id;
    		// project.setValue({
    		// 	fieldId: 'custentity_bb_m'+iMilestoneCompleted+'_date', 
    		// 	value: lastModDate
    		// });
    		var milestoneDate = 'custentity_bb_m'+iMilestoneCompleted+'_date';

    		record.submitFields({
    			type: record.Type.JOB,
    			id: projectId,
    			values: {
    				milestoneDate: lastModDate
    			},
    			options: {
    				ignoreMandatoryFields: true
    			}
    		});
        	return project;
        }
        
        function approveRelatedProjectActions(projectAction, packageID, projectID,  milestoneNumCompleted, config){
        	var actionStatusValue = projectAction.getValue('custrecord_bb_document_status');
        	var actionStatusText = projectAction.getText('custrecord_bb_document_status');
        	var lastModDate = projectAction.getValue('custrecord_bb_document_status_date');

        	var approveAllActions = config.getValue({
        		fieldId: 'custrecord_bb_apprv_related_proj_action'
        	});

        	if (approveAllActions) {

	        	//if(actionStatusText.indexOf('Approved') !== -1 && milestoneNumCompleted !== -1){
				if(documentStatusService.isApprovedStatusType(actionStatusValue) && milestoneNumCompleted !== -1){
	        		var relatedProjActionsSearchObj = search.create({
	        			   type: "customrecord_bb_project_action",
	        			   filters: [
	        			      ["isinactive","is","F"], 
	        			      "AND", 
	        			      ["custrecord_bb_project","anyof", projectID], 
	        			      "AND", 
	        			      ["custrecord_bb_package","anyof", packageID]
	        			   ],
	        			   columns: [
	        			      "internalid",
	        			   ]
	        			});
	        		var results = relatedProjActionsSearchObj.run().getRange({start:0, end: 1000});//we would never have over 1000 actions for the same package/project
	        		for(var i = 0; i < results.length; i++){
	        			var result = results[i];
	        			var internalId = result.getValue('internalid');
	        			record.submitFields({
	        				type: 'customrecord_bb_project_action',
	        				id: internalId,
	        				values: {
	        					custrecord_bb_document_status: actionStatusValue,
	        					custrecord_bb_document_status_date: lastModDate,
	        				},
	        				options: {
	        					ignoreMandatoryFields: true
	        				}
	        			});
	        		}
	        	}

	        }
        }
        
        function getPackageCompletion(packageID, projectID){
        	//if all project actions for "this" package that are Required are Approved AND (All Optional are either not started or Approved)
        	//tech design - search for all actions that are tied to this package that are required and not approved OR optional and none of (not started, approved)
        	//If results.length = 0, then we know we can set the date
        	var searchObj = search.load({
    			id: 'customsearch_bb_proj_actions_completed'
    		});
    		searchObj.filters.push(search.createFilter({
    			name: 'custrecord_bb_project',
    			operator: search.Operator.ANYOF,
    			values: [projectID]	
    		}));
    		searchObj.filters.push(search.createFilter({
    			name: 'custrecord_bb_package',
    			operator: search.Operator.ANYOF,
    			values: [packageID]	
    		}));
    		var resultSet = searchObj.run();
       		var results = resultSet.getRange({start:0, end: 1});
       		return (results.length == 0);
        }
        
       function sendInvoiceBillCreation(project, milestone, config){
        	var milestoneValue = project.getValue('custentity_bb_m'+milestone+'_date'); 
        	if(isNotNull(milestoneValue)){
            	// project = invoiceService.createInvoiceFromProjectAndMilestoneName(project, 'M'+milestone, config, milestoneValue);
            	invoiceService.createInvoiceFromProjectAndMilestoneName(project, 'M'+milestone, config, milestoneValue);
            	// project = vendorBillService.createVendorBillFromProjectAndMilestoneName(project, 'M'+milestone, config, milestoneValue);
            	vendorBillService.createVendorBillFromProjectAndMilestoneName(project, 'M'+milestone, config, milestoneValue);
        	}
        	return project;
    	}

    	function setProjectFields(values, projectId) {
    		if (values && projectId) {
    			record.submitFields({
	    			type: record.Type.JOB,
	    			id: projectId,
	    			values: values,
	    			options: {
	    				ignoreMandatoryFields: true
	    			}
	    		});
    		}
    	}

 
        return {
        	onAction: onAction
        };
    });