/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * 
 * BB.SS.ProjectProfitability.Endpoint.js
 */
define([
    'N/search', 
    'N/runtime', 
    'N/util', 
    'N/https',
    'N/record',
    'N/cache'
  ], (
    nSearch, 
    nRuntime, 
    nUtil, 
    nHttps,
    nRecord,
    nCache
  ) => {
    let response;
    
   const process = (context) => {

      let request = context.request;
      response = context.response; 

      if (request.method == 'POST') {
         let data = JSON.parse(request.body);

         if (data.action == 'PMProjectProfitability') {
            PMProjectProfitability();
         }else if (data.action == 'getInitialData') {
            getInitialData();
         }else if (data.action == 'updateFilters') {
            updateFilters(data.payload);
          }

      }
   }

   const getInitialData = () => {
      writeResponse({
        baseData: PMProjectProfitability(),
        preferences: getPreferences().filters
      })
   }

   let default_filters = [
      {
         entityid: true,
         custentity_bb_home_owner_name_text: true,
         formulatext: true,
         custentity_bb_project_location: true,
         custentity_bbss_proj_class: false,
         custentity_bbss_proj_department: false,
         custentity_bb_total_contract_value_amt: true,
         formulapercent: true,
       }
    ]

   const getPreferences = () => {

      let id = nRuntime.getCurrentUser().id;
      let user = (id == -4) ? 4285 : id;

      let search = nSearch.create({
         type: 'customrecord_bb_ss_personal_preferences',
         filters: [
            ['isinactive', 'is', 'F'],
            'and',
            ['name', 'is', 'projectprofitability_filters'],
            'and',
            ['custrecord_bb_ss_pp_user', 'anyof', user],
            'and',
            ['custrecord_bb_ss_pp_service', 'is', 'projectprofitability']
         ],
         columns: ['custrecord_bb_ss_pp_value']
      });

      let result;

      search.run().each((r) => { 
         result = {
            filters: JSON.parse(r.getValue('custrecord_bb_ss_pp_value')),
            id: r.id
         }
      });

      if (!result) {
         return createPreferences(user);
      }

      return result;
   }

   const createPreferences = (user) => {
      let record = nRecord.create({
        type: 'customrecord_bb_ss_personal_preferences'
      });
  
      record.setValue('name', 'projectprofitability_filters');
      record.setValue('custrecord_bb_ss_pp_user', user);
      record.setValue('custrecord_bb_ss_pp_value', JSON.stringify(default_filters));
      record.setValue('custrecord_bb_ss_pp_service', 'projectprofitability');
  
      record.save();
  
      return {
        filters: default_filters,
        id: record.save()
      }
   }

   const updateFilters = (payload) => {
      let filters = payload.filters;
  
      
  
      if (filters && Object.keys(filters).length) {
        let preferences = getPreferences();
        log.debug('filters', filters);
        log.debug('preferences', preferences);
        nRecord.submitFields({
          type: 'customrecord_bb_ss_personal_preferences',
          id: preferences.id,
          values: {
            custrecord_bb_ss_pp_value: JSON.stringify(filters)
          }
        });
      }
    }
  
   const PMProjectProfitability = () => {
      let categories = [];
      var jobSearchObj = nSearch.create({
      type: "job",
      filters:
      [
         ["isinactive","is","F"], 
         "AND", 
         ["custentity_bb_is_project_template","is","F"], 
         "AND", 
         ["custentity_bb_gross_profit_percent","greaterthan","1"]
      ],
      columns:
      [
         nSearch.createColumn({
            name: "entityid",
            sort: nSearch.Sort.ASC,
            label: "ID"
         }),
         nSearch.createColumn({name: "entitynumber", label: "Number"}),
         nSearch.createColumn({name: "custentity_bb_home_owner_name_text", label: "Customer"}),
         nSearch.createColumn({
            name: "formulatext",
            formula: "CASE WHEN {custentity_bb_m3_date} IS NOT NULL THEN 'M3' WHEN {custentity_bb_m2_date} IS NOT NULL THEN 'M2'  WHEN {custentity_bb_m1_date} IS NOT NULL THEN 'M1' WHEN {custentity_bb_m0_date} IS NOT NULL THEN 'M0' ELSE 'New' END",
            label: "Most Recent Milestone Complete"
         }),
         nSearch.createColumn({name: "custentity_bb_total_contract_value_amt", label: "Total Contract Value"}),
         nSearch.createColumn({name: "custentity_bb_total_project_ar_amount", label: "Total Project AR"}),
         nSearch.createColumn({name: "custentity_bb_revenue_amount", label: "Revenue"}),
         nSearch.createColumn({name: "custentity_bb_equip_cost_amount", label: "Equipment Cost"}),
         nSearch.createColumn({name: "custentity_bb_services_costs_amount", label: "Services Costs"}),
         nSearch.createColumn({
            name: "formulacurrency",
            formula: "NVL({custentity_bb_gross_profit_amount},NVL({custentity_bb_revenue_amount},0)-NVL({custentity_bb_equip_cost_amount},0) - NVL({custentity_bb_services_costs_amount},0))",
            label: "Gross Profit"
         }),
         nSearch.createColumn({
            name: "formulapercent",
            formula: "NVL2({custentity_bb_revenue_amount},(NVL({custentity_bb_gross_profit_amount},NVL({custentity_bb_revenue_amount},0)-NVL({custentity_bb_equip_cost_amount},0) - NVL({custentity_bb_services_costs_amount},0)))/NULLIF({custentity_bb_revenue_amount},0),0)",
            label: "Gross Profit %"
         }),
         nSearch.createColumn({name: "custentity_bb_project_location", label: "Project Location"}),
         nSearch.createColumn({name: "custentity_bbss_proj_class", label: "Project Class"}),
         nSearch.createColumn({name: "custentity_bbss_proj_department", label: "Project Department"})
      ]
   });

   var searchResultCount = jobSearchObj.runPaged().count;
   jobSearchObj.run().each(function(result){
      categories.push(result);
      return true;
   });
     
   return categories;
     //writeResponse({
     // categories: categories
    //});
    }
  
   const writeResponse = (data) => {
      response.write({output: JSON.stringify(data)});
   }
  
   return {
      process: process
   };
  });
  