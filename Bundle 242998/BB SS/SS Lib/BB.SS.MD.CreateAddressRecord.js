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

	function createAddressCustomer(entityObj) {
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
			id: entityObj.custentity_bb_install_state,
			columns: ['name']
		});
		var stateName = state.name;

		if(solarConfig.getConfiguration('custrecord_bb_ss_has_subsidiaries'))
			subCustomer.setValue({
				fieldId: 'subsidiary',
				value: entityObj.subsidiary
			});
		subCustomer.setValue({ // property owner field
			fieldId: 'parent',
			value: entityObj.internalid
		});
		var firstname = entityObj.custentity_bb_install_address_1_text + ' ' + entityObj.custentity_bb_install_address_2_text;
		if (firstname.length > 32) {
			firstname = firstname.slice(0, 32);
		}
		var lastname = entityObj.custentity_bb_install_city_text + ' ' + stateName + ' ' + entityObj.custentity_bb_install_zip_code_text;

		var companyName;
		var recordCount = checkExistingCustomer(entityObj.custentity_bb_install_address_1_text);
		if (recordCount) {
			existingCount = parseInt(recordCount) + 1;
		}
		if (recordCount) {
			var existingCount = parseInt(recordCount) + 1;
			companyName = firstname + ' ' + lastname + ' [' + existingCount + ']';
		} else {
			companyName = firstname + ' ' + lastname;
		}
		subCustomer.setValue({ 
			fieldId: 'companyname',
			value: companyName
		});
		subCustomer.setValue({
			fieldId: 'firstname',
			value: firstname
		});
		subCustomer.setValue({
			fieldId: 'lastname',
			value: lastname
		});
		subCustomer.setValue({
			fieldId: 'custentity_bb_install_address_1_text',
			value: entityObj.custentity_bb_install_address_1_text
		});
		subCustomer.setValue({
			fieldId: 'custentity_bb_install_address_2_text',
			value: entityObj.custentity_bb_install_address_2_text
		});

		subCustomer.setValue({
			fieldId: 'custentity_bb_install_city_text',
			value: entityObj.custentity_bb_install_city_text
		});

		subCustomer.setValue({
			fieldId: 'custentity_bb_install_state',
			value: entityObj.custentity_bb_install_state
		});
		subCustomer.setValue({
			fieldId: 'custentity_bb_install_zip_code_text',
			value: entityObj.custentity_bb_install_zip_code_text
		});
		subCustomer.setValue({
			fieldId: 'custentity_bb_utility_company',
			value: entityObj.custentity_bb_utility_company
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
        createAddressCustomer: createAddressCustomer
    };
    
});