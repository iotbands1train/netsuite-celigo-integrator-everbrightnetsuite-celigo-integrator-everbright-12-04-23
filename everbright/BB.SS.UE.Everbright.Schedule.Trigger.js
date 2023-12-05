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
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @author Santiago Rios
 * @fileOverview This UserEvent script is to trigger a Schedule Script for the everbright's integration
 *               main logic after a Project Interface record with an everbright ID is created.
 */

define(['N/runtime', 'N/task', 'N/search', 'N/query', 'N/record', 'SuiteBundles/Bundle 242998/BB SS/SS Lib/BB_SS_MD_SolarConfig', 
'SuiteBundles/Bundle 242998/BB SS/SS Lib/BB.SS.ScheduledScript.BatchProcessing'],
(runtime, task, search, query, record, solarConfig, batchProcessing) => {

   const afterSubmit = (context) => {
      let logTitle = 'afterSubmit';
      let objNewRecord = context.newRecord;
      try{

         let everbrightId = objNewRecord.getValue('custrecordcustrecord_everbright_proj_id');
         if (!everbrightId) {return;}
         let everbrightPayload = JSON.parse(objNewRecord.getValue('custrecordcustrecord_everbright_payload'));
         let objData = getData(everbrightPayload, objNewRecord.id);
         if (!objData) {
            let errMsg = 'Error while generating data object from everbright payload.';
            log.error(logTitle, errMsg);
            throw errMsg;
         }

         log.debug(logTitle, 'Run Task');
         createScheduleTask(objData);

      }catch(e){
         log.error(logTitle, e && e.message ? e.message : e);
         record.submitFields({
            type: 'customrecord_bb_ss_project_interface',
            id: objNewRecord.id,
            values: {
                'custrecord_bb_pi_send_error_email': true,
                'custrecord_bb_pi_error_details': createHtmlText([{'System': 'SolarSuccess', 'Stage': 'Process Trigger', 'Field': 'N/A', 'Value': 'N/A',  'Details': e && e.message ? e.message : e, 'Date': (new Date(Date.now())).toISOString()}])
            }
         });
      }
   }

   const createScheduleTask = (objData) => {
      let logTitle = 'createScheduleTask';

      let scheduleScriptID = runtime.getCurrentScript().getParameter('custscript_schedule_script_id');
      log.debug(logTitle, scheduleScriptID);
      scheduleScriptID = scheduleScriptID ? scheduleScriptID : 'customscript_bb_ss_ss_main_logic';
      let params = {'custscript_obj_data_trismart': JSON.stringify(objData)};

      batchProcessing.addToQueue(scheduleScriptID, null, params, task.TaskType.SCHEDULED_SCRIPT);
   }

   const getData = (everbrightPayload, projectInterfaceId) => {
      let logTitle = 'getData';

      try{
         let contactData = everbrightPayload.contactData;
         let projectData = everbrightPayload.projectData;
         let v2DealData = everbrightPayload.v2DealData;
         let stateId = getStateId(contactData.state) || '';
         let salesRepField = projectData.salesRep && projectData.salesRep.partner ? 'partner' : 'salesrep';
         let objData = {
            'projectInterfaceId': projectInterfaceId,
            'customerData': {
               'customform': solarConfig.getConfiguration('custrecord_everbright_cust_template').value,
               'category': solarConfig.getConfiguration('custrecord_everbright_category').value,
               'entitystatus': solarConfig.getConfiguration('custrecord_everbright_status_type').value,
               'subsidiary': 2, //TriSMART Solar
               'isperson': 'T',
               'custentity_bbss_everbright_customer_id': contactData.everbrightCustomerId,
               'custentity_bbss_everbright_project_id': projectData.everbrightProjectId,
               'firstname': contactData.firstName,
               'lastname': contactData.lastName,
               'custentity_bb_home_owner_phone': contactData.phoneNumber,
               'custentity_bb_home_owner_primary_email': contactData.primaryEmail,
               'custentity_bb_install_address_1_text': contactData.street,
               'custentity_bb_install_city_text': contactData.city,
               'custentity_bb_install_state': stateId,
               'custentity_bb_install_zip_code_text': contactData.zip,
               //[salesRepField]: getSalesRep(projectData.salesRep),
               'custentity_ts_external_sales_list': getVendorSaleOrg(projectData.salesOrgId) ,
               'custentity_ts_energ_consult': projectData.salesRep.fullName,
               'custentity_tss_energy_consultant_phone': projectData.salesRep.phoneNumber,
               'custentity_ts_energy_consultant_email': projectData.salesRep.primaryEmail,
               'custentity_bb_project_location': getLocation(projectData.locationId),
               'custentity_bb_utility_company': getUtilityCompanyId(projectData.utility, stateId),
               'custentity_bb_avg_utilitybill_month_amt': projectData.avgUtilityBill,
               'custentity_bb_started_from_proj_template': solarConfig.getConfiguration('custrecord_everbright_project_template').value,
               'custentity_bb_system_size_decimal': projectData.systemSize,
               'custentity_bb_roof_type': solarConfig.getConfiguration('custrecord_everbright_roof_type').value,
               'custentity_bb_module_item': getItemId(projectData.equipment && projectData.equipment.panel && projectData.equipment.panel.name, 'InvtPart'),
               'custentity_bb_module_quantity_num': projectData.panelCount,
               'custentity_bb_inverter_item': getItemId(projectData.equipment && projectData.equipment.inverter && projectData.equipment.inverter.name, 'InvtPart'),
               'custentity_bb_inverter_quantity_num': projectData.inverterCount == 'false' ? 0 : projectData.inverterCount,
               'custentity_bb_fin_prelim_purch_price_amt': projectData.contractPrice,
               'custentity_bb_financing_type': projectData.advPaySch && projectData.advPaySch.lenderName == 'Cash' ? 1 : 2, //1 = Cash, 2 = Loan
               'custentity_bb_financier_customer': projectData.advPaySch && projectData.advPaySch.lenderName != 'Cash' ? getFinancierId(projectData.advPaySch.lenderName) : '',
               'custentity_bb_financier_adv_pmt_schedule': projectData.advPaySch && projectData.advPaySch.lenderName != 'Cash' ?
                  getAdvPmtScheduleId(
                     projectData.advPaySch.lenderName,
                     projectData.advPaySch.loanTermYears ? projectData.advPaySch.loanTermYears : 0,
                     projectData.advPaySch.apr) : ''
            },
            'addersData': getAdders(projectData.adders),
            'batteriesData': getBatteries(projectData.adders),
            'arraysData': v2DealData.objArrays
         }

         return objData;

      }catch(e){
         log.error(logTitle, e && e.message ? e.message : e);
         return null;
      }
   }

   const getStateId = (stateName) => {
      let logTitle = 'getStateId';
      try{
         if (!stateName) {
            return 'Empty Value';
         }
         let sql =
            `SELECT
               ID,
               name,
            FROM
               customrecord_bb_state
            WHERE
               name = ?`;
         let results = query.runSuiteQL({
            query: sql,
            params: [stateName]
         }).asMappedResults();
         if (results.length <= 0) {
            return stateName;
         }
         return results[0].id;
      }catch(e){
         log.error(logTitle, e.message);
         return stateName;
      }
   }

   const getLocation = (locationId) => {
      let logTitle = 'getLocation';
      if (!locationId) {
         return 'Empty Value';
      }
      try{
         let recordId;
         let objSearch = search.create({
            type: "location",
            filters:
               [
                     ["externalid", "is", locationId]
               ],
            columns:
               [
                     search.createColumn({ name: "internalid", label: "Internal ID" })
               ]
         });
         objSearch.run().each(function (result) {
            recordId = result.id;
            return true;
         });

         return recordId;
      }catch(e){
         log.error(logTitle, e.message);
         return salesOrgId;
      }
   }

   const getVendorSaleOrg = (salesOrgId) => {
      let logTitle = 'getVendorSaleOrg';
      if (!salesOrgId) {
         return 'Empty Value';
      }
      try{
         let vendorId;
         let objSearch = search.create({
            type: "vendor",
            filters:
               [
                     ["externalid", "is", salesOrgId]
               ],
            columns:
               [
                     search.createColumn({ name: "internalid", label: "Internal ID" })
               ]
         });
         objSearch.run().each(function (result) {
            vendorId = result.id;
            return true;
         });

         return vendorId;
      }catch(e){
         log.error(logTitle, e.message);
         return salesOrgId;
      }
   }

   const getSalesRep = (objData) => {
      let logTitle = 'getSalesRep';
      try{
         let type = objData.partner ? 'partner' : objData.employee ? 'employee' : null;
         let everbrightRepId = type == 'partner' ? objData.partner : objData.employee;

         log.debug(logTitle, everbrightRepId + ' | ' + type);
         if (!everbrightRepId || !type) {
            return 'Wrong Sales Rep Type or ID';
         }
         let entitySearch = search.create({
            type: type,
            filters: [['externalid', 'is', everbrightRepId]],
            columns: [search.createColumn({ name: 'internalid', label: 'Internal ID' })]
         });
         let resultEntity;
         entitySearch.run().each(function (result) {
            log.debug(logTitle, result);
            resultEntity = result.id;
            return true;
         });
         return resultEntity ? resultEntity : objData.fullName;
      }catch(e){
         log.error(logTitle, e.message);
         return objData.fullName;
      }
   }

   const getUtilityCompanyId = (utilityCompany, stateId) => {
      let logTitle = 'getUtilityCompanyId';
      if (!utilityCompany) {
         return 'Empty Value';
      }
      try{
         let utilityCompanyId = utilityCompany;
         let customrecord_bb_utility_companySearchObj = search.create({
            type: "customrecord_bb_utility_company",
            filters:
               [
                     ["name", "is", utilityCompany],
                     "AND",
                     ["custrecord_bb_utility_company_state", "anyof", stateId]
               ],
            columns:
               [
                     search.createColumn({ name: "internalid", label: "Internal ID" })
               ]
         });
         customrecord_bb_utility_companySearchObj.run().each(function (result) {
            utilityCompanyId = result.id;
            return true;
         });

         return utilityCompanyId;
      }catch(e){
         log.error(logTitle, e.message);
         return utilityCompany;
      }
   }

   const getItemId = (itemName) => {
      let logTitle = 'getItemId';
      try{
         if (!itemName) {
            return 'Empty Value';
         }
         let sql =
            `SELECT
               ID,
               itemid,
            FROM
               item
            WHERE
               LOWER(itemid) LIKE ?`;
         let results = query.runSuiteQL({
            query: sql,
            params: [itemName.toLowerCase()]
         }).asMappedResults();
         if (results.length <= 0) {
            return itemName;
         }
         return results[0].id;
      }catch(e){
         log.error(logTitle, e.message);
         return itemName;
      }
   }

   const getAdders = (rawData) => {
      let logTitle = 'getAdders';
      try{
         addersArray = [];
         for (let i = 0; i < rawData.length; i++){
            if (rawData[i].is_battery == 0){
               addersArray.push({
                  'custrecord_bb_adder_item': getItemId(rawData[i].parent_product_name, 'NonInvtPart'),
                  'custrecord_bb_quantity': rawData[i].quantity,
                  'custrecord_bb_adder_price_amt': rawData[i].cost,
               });
            }
         }
         return addersArray;
      }catch(e){
         log.error(logTitle, e.message);
         return [];
      }
   }

   const getBatteries = (rawData) => {
      let logTitle = 'getBatteries';
      try{
         batteriesArray = [];
         for (let i = 0; i < rawData.length; i++){
            if (rawData[i].is_battery == 1){
               batteriesArray.push({
                  'id': getItemId(rawData[i].name, 'NonInvtPart'),
                  'name': rawData[i].name,
                  'quantity': rawData[i].quantity
               });
            }
         }
         return batteriesArray;
      }catch(e){
         log.error(logTitle, e.message);
         return [];
      }
   }

   const getFinancierId = (name) => {
      let logTitle = 'getFinancierId';
      try{
         let sql =
            `SELECT
               ID,
               entityid,
               companyname,
               category,
               altname
            FROM
               customer
            WHERE
               companyname LIKE '%${name}%'
            AND
               category = 4
            AND
               isinactive = 'F'`;//category id: 4 = Financier
         let results = query.runSuiteQL({
            query: sql
         }).asMappedResults();
         if (results.length <= 0) {
            return name;
         }
         return results[0].id;
      }catch(e){
         log.error(logTitle, e.message);
         return name;
      }
   }

   const getAdvPmtScheduleId = (lenderName, loanTermYears, loanApr) => {
      let logTitle = 'getAdvPmtScheduleId';
      try{
         let sql =
            `SELECT
               aps.ID,
               aps.name,
               aps.custrecord_bb_finaps_dealer_fee_percent as percent,
               cus.companyname
            FROM
               customrecord_bb_financier_adv_pmt_sch aps
               join customer cus on cus.id = aps.custrecord_bb_finaps_financier
            WHERE
                  LOWER(cus.companyname) LIKE '%${lenderName.toLowerCase()}%'
               AND
                  aps.name LIKE '%${loanTermYears}%'
               AND
                  aps.name LIKE '%${loanApr}%'`;

         let results = query.runSuiteQL({
            query: sql,
         }).asMappedResults();
         if (results.length <= 0) {
            return lenderName + '/' + loanTermYears + '/' + loanApr;
         }
         return results[0].id;
      }catch(e){
         log.error(logTitle, e.message);
         return lenderName + '/' + loanTermYears + '/' + loanApr;
      }
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
          return JSON.stringify(recordData);
      }
  }

   return {
      afterSubmit: afterSubmit
   }
});