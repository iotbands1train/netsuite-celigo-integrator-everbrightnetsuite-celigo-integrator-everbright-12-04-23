/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * 
 * BB.SS.MD.Projectprofitabilityestimated.js
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

    if (data.action == 'PMProjectProfitabilityEstimated') {
        PMProjectProfitabilityEstimated();
    }else if (data.action == 'getInitialData') {
        getInitialData();
    }else if (data.action == 'updateFilters') {
        updateFilters(data.payload);
      }

  }
  }

  const getInitialData = () => {
    writeResponse({
      baseData: PMProjectProfitabilityEstimated(),
      preferences: getPreferences().filters
    })
  }

  let default_filters = [
    {
      entityid: true,
      custentity_bb_home_owner_name_text: true,
      jobtype: true,
      custentity_bb_epc_role: false,
      custentity_bb_system_size_decimal: true,
      custentity_bb_project_location: true,
      custentity_bb_tot_contract_value_cpy_amt: false,
      custentity_bb_services_costs_pr_watt_amt: false,
      custentity_bb_equip_cost_per_watt_amount: false,
      formulacurrency: false,
      formulacurrency_1: false,
      formulacurrency_2: true,
      formulacurrency_3: false,
      formulacurrency_4: false,
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
          ['name', 'is', 'projectprofitabilityestimated_filters'],
          'and',
          ['custrecord_bb_ss_pp_user', 'anyof', user],
          'and',
          ['custrecord_bb_ss_pp_service', 'is', 'projectprofitabilityestimated']
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

    record.setValue('name', 'projectprofitabilityestimated_filters');
    record.setValue('custrecord_bb_ss_pp_user', user);
    record.setValue('custrecord_bb_ss_pp_value', JSON.stringify(default_filters));
    record.setValue('custrecord_bb_ss_pp_service', 'projectprofitabilityestimated');

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

  const PMProjectProfitabilityEstimated = () => {
    let categories = [];
    var jobSearchObj = nSearch.create({
      type: "job",
      filters:
      [
        ["custentity_bb_cancellation_date","isempty",""], 
        "AND", 
        ["custentity_bb_m3_date","isempty",""], 
        "AND", 
        ["custentity_bb_is_project_template","is","F"],
        "AND", 
        ["isinactive","is","F"]
      ],
      columns:
      [
        nSearch.createColumn({
            name: "entityid",
            sort: nSearch.Sort.ASC,
            label: "ID"
        }),
        nSearch.createColumn({name: "custentity_bb_home_owner_name_text", label: "Customer"}),
        nSearch.createColumn({name: "jobtype", label: "Project Type"}),
        nSearch.createColumn({name: "custentity_bb_epc_role", label: "EPC Role"}),
        nSearch.createColumn({name: "custentity_bb_system_size_decimal", label: "System Size (kW)"}),
        nSearch.createColumn({name: "custentity_bb_tot_contract_value_cpy_amt", label: "Total Contract Value"}),
        //nSearch.createColumn({name: "custentity_bb_services_costs_pr_watt_amt", label: "Services Costs / Watt"}),
        nSearch.createColumn({
          name: "formulacurrency",
          formula: "CASE WHEN {custentity_bb_services_costs_amount} IS NULL OR {custentity_bb_system_size_decimal} IS NULL OR {custentity_bb_system_size_decimal} = 0 THEN 0 ELSE ROUND({custentity_bb_services_costs_amount}/({custentity_bb_system_size_decimal}*1000), 2) END",
          label: "Services Costs / Watt"
      }),
        nSearch.createColumn({name: "custentity_bb_equip_cost_per_watt_amount", label: "Equipment Cost / Watt"}),
        nSearch.createColumn({
            name: "formulacurrency",
            formula: "{custentity_bb_gross_trading_profit_amt}/({custentity_bb_system_size_decimal}*1000)",
            label: "Gross After Sales Profit / Watt"
        }),
        nSearch.createColumn({name: "custentity_bb_revenue_amount", label: "Revenue"}),
        nSearch.createColumn({name: "custentity_bb_sales_cost_amount", label: "Sales Cost"}),
        nSearch.createColumn({name: "custentity_bb_services_costs_amount", label: "Services Costs"}),
        nSearch.createColumn({name: "custentity_bb_equip_cost_amount", label: "Equipment Cost"}),
        nSearch.createColumn({
            name: "formulacurrency",
            formula: "NVL({custentity_bb_revenue_amount},0) - NVL({custentity_bb_sales_cost_amount},0) - NVL({custentity_bb_services_costs_amount},0) - NVL({custentity_bb_equip_cost_amount},0)",
            label: "Project Net Profit"
        }),
        //nSearch.createColumn({name: "formulacurrency", formula: "(NVL({custentity_bb_revenue_amount},0) - NVL({custentity_bb_sales_cost_amount},0) - NVL({custentity_bb_services_costs_amount},0) - NVL({custentity_bb_equip_cost_amount},0))/({custentity_bb_system_size_decimal}*1000)", label: "Project Net Profit / Watt"}),
        nSearch.createColumn({name: "formulacurrency", formula: "CASE WHEN {custentity_bb_system_size_decimal} IS NULL OR {custentity_bb_system_size_decimal} = 0 THEN 0 ELSE (COALESCE({custentity_bb_revenue_amount}, 0) - COALESCE({custentity_bb_sales_cost_amount}, 0) - COALESCE({custentity_bb_services_costs_amount}, 0) - COALESCE({custentity_bb_equip_cost_amount}, 0))/({custentity_bb_system_size_decimal}*1000) END", label: "Project Net Profit / Watt"}),
        nSearch.createColumn({
            name: "formulacurrency",
            formula: "NVL({custentity_bb_revenue_amount},0) - NVL({custentity_bb_sales_cost_amount},0)",
            label: "Gross After Sales Profit"
        }),
        nSearch.createColumn({name: "custentity_bb_project_location", label: "Project Location"}),
      ]
  });
  
  var searchResultCount = jobSearchObj.runPaged().count;
  jobSearchObj.run().each(function(result){
      categories.push(result);
      return true;
  });
  
  return categories;
  //writeResponse({
  //  categories: categories
  //});
  }

  const writeResponse = (data) => {
    response.write({output: JSON.stringify(data)});
  }

  return {
    process: process
  };
 });
 