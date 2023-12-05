/**
 * Copyright 2020 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope public
 * @author Santiago Rios
 * @fileOverview This Schedule script is to be used for the main Project process starting from an existing Project Interface.
 *               It will create the Customer record, trigger the Solar Success customization for the Project creation and create the Adders.
 */

define(['N/runtime', 'N/record', 'N/query', 'N/error', 'SuiteBundles/Bundle 242998/BB SS/SS Lib/BB.SS.MD.LeadToProject'], (runtime, record, query, error, leadToProject) => {

    /**
     *
     * The following parameters must be created in the script record and
     * send when calling the Schedule script from another source.
     * 
     * If the error fields are not set, the errors content will only appear in the script logs.
     *
     * @param custscript_errors_email_flag = { field ID, ex: custrecord_bb_pi_send_error_email } (OPTIONAL)
     * @param custscript_errors_field = { field ID, ex: custrecord_bb_pi_error_details } (OPTIONAL)
     * @param custscript_data_obj = {
            "projectInterfaceId": 12345,
            "customerData": {
                "firstname": "First",
                "lastname": "Last",
                "custentity_bb_home_owner_primary_email": "email@email.com",
                .
                .
            },
            "addersData": [
                {
                    "custrecord_bb_adder_item": 5678,
                    "custrecord_bb_quantity": 2,
                    "custrecord_bb_adder_price_amt": 135
                },
                .
                .
            ]
        } (MANDATORY)
     */
    const execute = (context) => {
        let logTitle = 'execute';
        let objData = JSON.parse(runtime.getCurrentScript().getParameter('custscript_data_obj'));
        let objErrors = [];
        try{

            log.debug(logTitle, 'Start Process');

            let customerResult = createCustomer(objData.customerData);
            objErrors = objErrors.concat(customerResult && customerResult.errorsData);
            updateProjectInterface('Customer', customerResult, objData.projectInterfaceId);

            let projectId;
            try{
                projectId = leadToProject.transformEntityToProject(customerResult.customerId, false, false);
            }catch(e){
                log.error(logTitle, e && e.message ? e.message : e);
                projectId = null;
            }
            if (projectId) {
                updateProjectInterface('Project', projectId, objData.projectInterfaceId);
            }else {
                log.debug(logTitle, projectId);
                objErrors.push({'System': 'SolarSuccess', 'Stage': 'Project Creation', 'Field': 'N/A', 'Value': 'N/A', 'Details': 'Error while creating the Project record.', 'Date': getDate()});
                updateProjectInterface('Errors', objErrors, objData.projectInterfaceId);
                throw error.create({
                    name: 'Project Creation',
                    message: 'Ignore'
                });
            }

            let addersResult = createAdders(objData.addersData, projectId);
            objErrors = objErrors.concat(addersResult && addersResult.errorsData);

            log.debug(logTitle, objErrors);
            updateProjectInterface('Errors', objErrors, objData.projectInterfaceId);

        }catch(e){
            if (e.message == 'Ignore') {
                return;
            }
            log.error(logTitle, e && e.message ? e.message : e);
            objErrors.push({'System': 'SolarSuccess', 'Stage': 'Main Process', 'Field': 'N/A', 'Value': 'N/A', 'Details': e.message, 'Date': getDate()});
            updateProjectInterface('Errors', objErrors, objData.projectInterfaceId);
        }
    }

    const createCustomer = (customerData) => {
        let logTitle = 'createCustomer';

        let objCustomerRecord;
        let customerExists = getLead(customerData.custentity_bb_home_owner_primary_email);
        if (customerExists != null) {
            try{
                objCustomerRecord = record.load({
                    type: record.Type.CUSTOMER,
                    id: customerExists.id,
                    isDynamic: true
                });
            }catch(e){
                log.error(logTitle, 'Error loading the Customer, creating a new one instead.');
                objCustomerRecord = record.create({type: record.Type.CUSTOMER, isDynamic: true});
            }
        }else {
            objCustomerRecord = record.create({type: record.Type.CUSTOMER, isDynamic: true});
        }

        let objErrors = [];
        for (const fieldId in customerData){
            try{
                objCustomerRecord.setValue({
                    fieldId: fieldId,
                    value: customerData[fieldId]
                });
            }catch(e){
                objErrors.push({'System': 'SolarSuccess', 'Stage': 'Customer Creation', 'Field': fieldId, 'Value': customerData[fieldId], 'Details': e.message, 'Date': getDate()});
                continue;
            }
        }

        let customerId = objCustomerRecord.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });

        return {customerId: customerId, errorsData: objErrors};
    }

    const getLead = (email) => {
        let logTitle = 'getLead';

        let sql =
            `SELECT
                ID,
                entityid,
                custentity_bb_home_owner_primary_email
            FROM
                customer
            WHERE
                custentity_bb_home_owner_primary_email LIKE '%${email}%'`;

        let results = query.runSuiteQL({
            query: sql
        }).asMappedResults();
        if (results.length <= 0) {
            return null;
        }
        return results[0];
    }

    const updateProjectInterface = (type, recordData, projIntId) => {
        let logTitle = 'updateProjectInterface';

        if (type == 'Customer') {
            record.submitFields({
                type: 'customrecord_bb_ss_project_interface',
                id: projIntId,
                values: {
                    'custrecord_bb_pi_customer': recordData.customerId
                }
            });
        }

        if (type == 'Project') {
            record.submitFields({
                type: 'customrecord_bb_ss_project_interface',
                id: projIntId,
                values: {
                    'custrecord_bb_pi_project': recordData
                }
            });
        }

        if (type == 'Errors') {
            let errorEmailField = runtime.getCurrentScript().getParameter('custscript_errors_email_flag') || '';
            let errorDetailsField = runtime.getCurrentScript().getParameter('custscript_errors_field') || '';
            log.error(logTitle, recordData);
            let htmlErrors = createHtmlText(recordData);
            record.submitFields({
                type: 'customrecord_bb_ss_project_interface',
                id: projIntId,
                values: {
                    [errorEmailField]: recordData.length <= 0 ? false : true,
                    [errorDetailsField]: recordData.length <= 0 ? '' : htmlErrors
                }
            });
        }
    }

    const createAdders = (objAdders, projectId) => {
        let logTitle = 'createAdders';

        if (objAdders.length <= 0) {
            return {errorsData: []};
        }
        let projectAdderIds = [];
        let objErrors = [];
        for (let i = 0; i < objAdders.length; i++) {
            try{
                let projectAdder = record.create({ type: "customrecord_bb_project_adder", isDynamic: true });
                projectAdder.setValue({ fieldId: "custrecord_bb_project_adder_project", value: projectId });
                projectAdder.setValue({ fieldId: "custrecord_bb_adder_item", value: objAdders[i].custrecord_bb_adder_item });
                projectAdder.setValue({ fieldId: "custrecord_bb_quantity", value: objAdders[i].custrecord_bb_quantity });
                let AdderPrice = objAdders[i].custrecord_bb_adder_price_amt;
                if (!(AdderPrice == 0 || AdderPrice == "" || AdderPrice == null)) {
                    projectAdder.setValue({ fieldId: "custrecord_bb_adder_price_amt", value: objAdders[i].custrecord_bb_adder_price_amt });
                }

                projectAdderIds.push(projectAdder.save());
            }catch(e){
                objErrors.push({'System': 'SolarSuccess', 'Stage': 'Adder Creation', 'Field': 'custrecord_bb_adder_item', 'Value': objAdders[i].custrecord_bb_adder_item, 'Details': e.message, 'Date': getDate()});
            }
        }
        return {adders: projectAdderIds, errorsData: objErrors};
    }

    const getDate = () => {
        let logTitle = 'getDate';
        var nowDate = (new Date(Date.now())).toISOString();

        return nowDate;
    }

    const createHtmlText = (recordData) => {
        let logTitle = 'createHtmlText';
        try {

            let body = `<br><br>`;
            let thStyle = ` style="border: 1px solid #ddd;padding: 8px;padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #4CAF50;color: white;"`;
            let tdStyle = ` style="border: 1px solid #ddd;padding: 8px;"`;
    		
    		if (recordData.length > 0) {
    			body += `<table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;border-collapse: collapse;width: 100%;"><tr><th ${thStyle}>System</th><th ${thStyle}>Stage</th><th ${thStyle}>Field</th><th ${thStyle}>Value</th><th ${thStyle}>Details</th><th ${thStyle}>Date</th></tr>`;
    			
    			for(let i = 0; i < recordData.length; i++){
    				let error = recordData[i];
    				body += `<tr><td ${tdStyle}> ${error.System} </td><td ${tdStyle}> ${error.Stage} </td><td ${tdStyle}> ${error.Field} </td><td ${tdStyle}> ${error.Value} </td><td ${tdStyle}> ${error.Details} </td><td ${tdStyle}> ${error.Date} </td></tr>`;
    			}
    			
    			body += `</table><br><br>`;
    		}

            return body;

        }catch(e){
            log.error(logTitle, e && e.message ? e.message : e);
            return JSON.stringify(recordData);
        }
    }

    return {
        execute
    }
});