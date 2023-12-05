/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Tyler Mann
 * @version 0.0.1
 * @fileOverview This Custom Module library is used to create
 * Revenue Recognition Journal entries
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
define(['N/record', 'N/search', './BB_SS_MD_SolarConfig'], 
	function(record, search, solarConfig) {
		
		function setTransactionAccountingMethod(transactionRecord){
	    	var projectID = transactionRecord.getValue({fieldId: 'custbody_bb_project'});
	    	if(isNull(projectID)){
	    		return transactionRecord;
	    	}
	    	var projectFieldLookup = search.lookupFields({
	    		type: search.Type.JOB,
	    		id: projectID,
	    		columns: ['custentity_bb_project_acctg_method']
	    	});
	    	var projectAccountingMethod = (projectFieldLookup.custentity_bb_project_acctg_method.length > 0) ? projectFieldLookup.custentity_bb_project_acctg_method[0].value : null;
	    	if(isNull(projectAccountingMethod)){//if accounting method has not been set on project
	    		//get Accounting method from BB Config
	    		var config = solarConfig.getConfigurations(['custrecord_bb_project_acctg_method']);
	    		projectAccountingMethod = config['custrecord_bb_project_acctg_method'].value;
	    		//Set value on Project
	    		var project = record.submitFields({
	    			type: record.Type.JOB,
	    			id: projectID,
	    			values:{
	    				custentity_bb_project_acctg_method: projectAccountingMethod
	    			},
	    			options: {
	    				ignoreMandatoryFields: true
	    			}
	    		});
	    		
	    	}
	    	//set on transaction record either from project or from the search results
	    	transactionRecord.setValue({
	    		fieldId: 'custbody_bb_project_acctg_method',
	    		value: projectAccountingMethod
	    	});
	    	return transactionRecord;
		}
		
		/**
		 * @param param - string or object or array
		 * @returns true if the parameter is null, empty string, or undefined
		 */
		function isNull(param){
			return param == null || param == '' || param == undefined;
		}

	
		return {
			setTransactionAccountingMethod:setTransactionAccountingMethod
		};
	});