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
 * @fileOverview This ScheduleScript script is for the Enerflo integration main logic. It will be triggered
 *               when a new Project Interface record gets created through Celigo, create the Customer record,
 *               trigger the Solar Success customization for the Project creation and create the Adders.
 */

define(['N/runtime', 'N/record', 'N/query', 'N/search', 'N/error', 'SuiteBundles/Bundle 242998/BB SS/SS Lib/BB.SS.MD.LeadToProject.js'], (runtime, record, query, search, error, leadToProject) => {

    const execute = (context) => {
        let logTitle = 'execute';
        let objData = JSON.parse(runtime.getCurrentScript().getParameter('custscript_obj_data_trismart'));
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

            let batteriesAndFilesResult = updateBatteriesAndFilesData(objData.batteriesData, objData.projectInterfaceId, projectId, customerResult && customerResult.customerId);
            objErrors = objErrors.concat(batteriesAndFilesResult && batteriesAndFilesResult.errorsData);

            let arraysResult = createArrays(objData.arraysData, projectId);
            objErrors = objErrors.concat(arraysResult && arraysResult.errorsData);

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
        let customerExists = getCustomer(customerData.custentity_bbss_enerflo_customer_id);
        if (customerExists != null) {
            objCustomerRecord = record.load({
                type: record.Type.CUSTOMER,
                id: customerExists.id,
                isDynamic: true
            });
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

        let customerId;
        try{
            customerId = objCustomerRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
        }catch(e){
            objErrors.push({'System': 'SolarSuccess', 'Stage': 'Customer Creation', 'Field': 'N/A', 'Value': 'N/A', 'Details': e.message, 'Date': getDate()});
        }

        return {customerId: customerId, errorsData: objErrors};
    }

    const getCustomer = (enerfloCustId) => {
        let logTitle = 'getCustomer';

        let sql =
            `SELECT 
                ID, 
                entityid,
                custentity_bbss_enerflo_customer_id
            FROM
                customer 
            WHERE
                (
                    custentity_bbss_enerflo_customer_id = ?
                )`;
        let results = query.runSuiteQL({
            query: sql,
            params: [
                enerfloCustId
            ]
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
            let htmlErrors = createHtmlText(recordData);
            record.submitFields({
                type: 'customrecord_bb_ss_project_interface',
                id: projIntId,
                values: {
                    'custrecord_bb_pi_send_error_email': recordData.length <= 0 ? false : true,
                    'custrecord_bb_pi_error_details': recordData.length <= 0 ? '' : htmlErrors
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
                let AdderPrice = projectAdder.getValue({ fieldId: 'custrecord_bb_adder_price_amt' });
                if (AdderPrice == 0 || AdderPrice == "" || AdderPrice == null) {
                    projectAdder.setValue({ fieldId: "custrecord_bb_adder_price_amt", value: objAdders[i].custrecord_bb_adder_price_amt });
                }

                projectAdderIds.push(projectAdder.save());
            }catch(e){
                objErrors.push({'System': 'SolarSuccess', 'Stage': 'Adder Creation', 'Field': 'custrecord_bb_adder_item', 'Value': objAdders[i].custrecord_bb_adder_item, 'Details': e.message, 'Date': getDate()});
            }
        }
        return {adders: projectAdderIds, errorsData: objErrors};
    }

    const createArrays = (objArrays, projectId) => {
        let logTitle = 'createArrays';

        if (objArrays.length <= 0) {
            return {errorsData: []};
        }
        let projectArrayIds = [];
        let objErrors = [];
        for (let i = 0; i < objArrays.length; i++) {
            try{
                let projectArray = record.create({ type: "customrecord_ts_arrays", isDynamic: true });
                projectArray.setValue({ fieldId: "custrecord_ts_arrays_proj", value: projectId });
                projectArray.setValue({ fieldId: "name", value: objArrays[i].name });
                projectArray.setValue({ fieldId: "custrecord_ts_array_mod_tilt", value: objArrays[i].tilt });
                projectArray.setValue({ fieldId: "custrecord_ts_array_mod_azi", value: objArrays[i].azimuth });
                projectArray.setValue({ fieldId: "custrecord_ts_array_mod_qty", value: objArrays[i].panelCount });

                projectArrayIds.push(projectArray.save());
            }catch(e){
                objErrors.push({'System': 'SolarSuccess', 'Stage': 'Array Creation', 'Field': 'N/A', 'Value': objArrays[i].name, 'Details': e.message, 'Date': getDate()});
            }
        }
        return {adders: projectArrayIds, errorsData: objErrors};
    }

    const updateBatteriesAndFilesData = (objBatteries, projectInterfaceId, projectId, customerId) => {
        let logTitle = 'updateBatteriesAndFilesData';

        let objErrors = [];
        try{
            let fieldsToUpdate = {};
            if (objBatteries.length > 0) {
                fieldsToUpdate['custrecord_bb_pi_battery_item_txt'] = objBatteries[0].name;
                fieldsToUpdate['custrecord_bb_pi_battery_qty_txt'] = objBatteries[0].quantity;
                fieldsToUpdate['custentity_bb_battery'] = objBatteries[0].id;
                fieldsToUpdate['custentity_bb_battery_quantity'] = objBatteries[0].quantity;
            }  

            if (projectInterfaceId) {
                record.submitFields({
                    type: 'customrecord_bb_ss_project_interface',
                    id: projectInterfaceId,
                    values: {
                        'custrecord_bb_pi_battery_item_txt': fieldsToUpdate.custrecord_bb_pi_battery_item_txt,
                        'custrecord_bb_pi_battery_qty_txt': fieldsToUpdate.custrecord_bb_pi_battery_qty_txt
                    }
                });
                delete fieldsToUpdate['custrecord_bb_pi_battery_item_txt']
                delete fieldsToUpdate['custrecord_bb_pi_battery_qty_txt']

                let filesTable = search.lookupFields({
                    type: 'customrecord_bb_ss_project_interface',
                    id: projectInterfaceId,
                    columns: ['custrecord_bb_pi_enerflo_proj_images']
                });

                if (filesTable && filesTable.custrecord_bb_pi_enerflo_proj_images) {
                    fieldsToUpdate['custentity_bb_enerflo_proj_images'] = filesTable.custrecord_bb_pi_enerflo_proj_images;
                }
            }

            if (projectId){
                record.submitFields({
                    type: record.Type.JOB,
                    id: projectId,
                    values: fieldsToUpdate
                });
            }

            if (customerId && fieldsToUpdate.custentity_bb_enerflo_proj_images){
                record.submitFields({
                    type: record.Type.CUSTOMER,
                    id: customerId,
                    values: {'custentity_bb_enerflo_proj_images': fieldsToUpdate.custentity_bb_enerflo_proj_images}
                });
            }
        }catch(e){
            objErrors.push({'System': 'SolarSuccess', 'Stage': 'Batteries and Files Update', 'Field': 'Batteries ID/QTY | Files Table', 'Value': 'N/A', 'Details': e.message, 'Date': getDate()});
        }
        return {errorsData: objErrors};
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