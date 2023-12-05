/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Matt Lehman
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

	function createSubCustomer(lead) {
		var formId = getFormId();

		var subCustomer = record.create({
			type: record.Type.CUSTOMER,
		});
		subCustomer.setValue({
			fieldId: 'customform',
			value: formId
		});
		var state = search.lookupFields({
			type: 'CUSTOMRECORD_BB_STATE',
			id: lead.installationState,
			columns: ['name']
		});
		var stateName = state.name;

		if(solarConfig.getConfiguration('custrecord_bb_ss_has_subsidiaries'))
			subCustomer.setValue({
				fieldId: 'subsidiary',
				value: lead.subsidiary
			});
		subCustomer.setValue({ // property owner field
			fieldId: 'parent',
			value: lead.internalId
		});
		var firstname = lead.installationAddr1 + ' ' + lead.installationAddr2;
		var lastname = lead.installationCity + ' ' + stateName + ' ' + lead.installationZip;

		var companyName;
		var recordCount = checkExistingCustomer(lead.installationAddr1);
		if (recordCount) {
			existingCount = parseInt(recordCount) + 1;
		}
		if (recordCount) {
			var existingCount = parseInt(recordCount) + 1;
			companyName = firstname + ' ' + lastname + ' [' + existingCount + ']';
		} else {
			companyName = firstname + ' ' + lastname;
		}
		// var companyString =  (companyName.length > 32) ? companyName.substring(0,32) : companyName;
		subCustomer.setValue({ 
			fieldId: 'companyname',
			value: companyName
		});
		var firstNameString = (firstname.length > 32) ? firstname.substring(0,32) : firstname;
		subCustomer.setValue({
			fieldId: 'firstname',
			value: firstNameString
		});
		var lastNameString = (lastname.length > 32) ? lastname.substring(0,32) : lastname;
		subCustomer.setValue({
			fieldId: 'lastname',
			value: lastNameString
		});
		subCustomer.setValue({
			fieldId: 'custentity_bb_install_address_1_text',
			value: lead.installationAddr1
		});
		subCustomer.setValue({
			fieldId: 'custentity_bb_install_address_2_text',
			value: lead.installationAddr2
		});

		subCustomer.setValue({
			fieldId: 'custentity_bb_install_city_text',
			value: lead.installationCity
		});

		subCustomer.setValue({
			fieldId: 'custentity_bb_install_state',
			value: lead.installationState
		});
		subCustomer.setValue({
			fieldId: 'custentity_bb_install_zip_code_text',
			value: lead.installationZip
		});
		subCustomer.setValue({
			fieldId: 'custentity_bb_utility_company',
			value: lead.utilityCompany
		});
		subCustomer.setValue({
			fieldId: 'custentity_bb_is_address_rec_boolean',
			value: true
		});

		var subCustId = subCustomer.save({
			ignoreMandatoryFields: true
		});

		return subCustId;

	}

	function checkExistingCustomer(address1) {
		var recordCount = 0;
		if (address1) {
			var customerSearchObj = search.create({
			    type: "customer",
			    filters:
			    [
			        ["custentity_bb_is_address_rec_boolean","is","T"], 
			        "AND", 
			        ["custentity_bb_install_address_1_text","contains", address1]
			    ],
			    columns:
			    [
			        "internalid",
			        "companyname"
			    ]
			});
			var recordCount = customerSearchObj.runPaged().count;
			log.debug("existing address record count",recordCount);
		}
		return recordCount;
	}

	function getFormId(){
		var configItem = ['custrecord_bb_project_sub_cust_form'];
		var subCustomerForm = solarConfig.getConfigurations(configItem);
		if (subCustomerForm) {
			var formId = subCustomerForm.custrecord_bb_project_sub_cust_form.value;
			return formId;
		}
   	}
   
    return {
        createSubCustomer: createSubCustomer
    };
    
});