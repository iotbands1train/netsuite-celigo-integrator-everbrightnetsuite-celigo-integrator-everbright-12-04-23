/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define([
  'N/search', 
  'N/runtime', 
  'N/util', 
  'N/https',
  'N/record',
  'N/cache',
  'N/query'
], (
  nSearch, 
  nRuntime, 
  nUtil, 
  nHttps,
  nRecord,
  nCache,
  nQuery
) => {
  let response;
  let default_filters = [
    {
      name: 'Project Manager',
      field: 'project_manager'
    },
    {
      name: 'Action',
      field: 'action'
    },
    {
      name: 'Assigned To Tech',
      field: 'assigned_to_tech'
    }
  ]

  const process = (context) => {
    let request = context.request;

    //getConfiguration();

    if (request.method == 'POST') {
      let data = JSON.parse(request.body);
      //log.debug('data', data);
      // available globally
      response = context.response; 

      if (data.action == 'getAllProjects') {
        getAllProjects();
      } else if (data.action == 'getInitialData') {
        getInitialData();
      } else if (data.action == 'getEmployees') {
        getEmployees();
      } else if (data.action == 'getAssignedToTech') {
        getAssignedToTech();
      } else if (data.action == 'getProjectActionTemplate') {
        getProjectActionTemplate();
      } else if (data.action == 'updateProject') {
        updateProject(data.payload);
      } else if (data.action == 'getProjects') {
        getProjects(true);
      } else if (data.action == 'getProjectActions') {
        getProjectActions(data.payload);
      } else if (data.action == 'updateFilters') {
        updateFilters(data.payload);
      }
    } else if (request.method == 'GET') {

    }
  }

  const updateFilters = (payload) => {
    let filters = payload.filters;

    log.debug('filters', filters);

    if (filters && filters.length) {
      let preferences = getPreferences();

      nRecord.submitFields({
        type: 'customrecord_bb_ss_personal_preferences',
        id: preferences.id,
        values: {
          custrecord_bb_ss_pp_value: JSON.stringify(filters)
        }
      });
    }
  }

  const getInitialData = () => {
    writeResponse({
      baseData: getAllProjects(),
      projects: getProjects(),
      employees: getEmployees(),
      //projectActions: getProjectActions(getProjects()),
      assignedToTech: getAssignedToTech(),
      projectActionTemplate: getProjectActionTemplate(),
      preferences: getPreferences().filters
    })
  }

  const getPreferences = () => {
    let id = nRuntime.getCurrentUser().id;
    let user = (id == -4) ? 4285 : id;

    let search = nSearch.create({
      type: 'customrecord_bb_ss_personal_preferences',
      filters: [
        ['isinactive', 'is', 'F'],
        'and',
        ['name', 'is', 'scheduler_filters'],
        'and',
        ['custrecord_bb_ss_pp_user', 'anyof', user],
        'and',
        ['custrecord_bb_ss_pp_service', 'is', 'scheduler']
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

    record.setValue('name', 'scheduler_filters');
    record.setValue('custrecord_bb_ss_pp_user', user);
    record.setValue('custrecord_bb_ss_pp_value', JSON.stringify(default_filters));
    record.setValue('custrecord_bb_ss_pp_service', 'scheduler');

    record.save();

    return {
      filters: default_filters,
      id: record.save()
    }
  }

  const getAllResults = (s) => {
    let results = s.run();
    let searchResults = [];
    let searchid = 0;
    let resultsSlice = [];
    do {
      resultsSlice = results.getRange({start:searchid,end:searchid+1000});
      resultsSlice.forEach((slice) => {
        searchResults.push(slice);
        searchid++;
      });
    } while (resultsSlice.length >= 1000);

    return searchResults;
  }

  const getAllProjects = () => {
    log.debug('getAllProjects','start')
    let projSearch = nSearch.create({ 
      type: 'customrecord_bb_project_action',
      filters: [
        ["custrecord_bb_project.custentity_bb_is_project_template","is","F"], 
        "AND", 
        ['custrecord_msi_schdl_date', 'isnotempty', ''],
        'AND',
        ['custrecord_bb_proj_act_sch_end_date', 'isnotempty', ''],
        'AND',
        ["isinactive","is","F"]      
      ],
      columns:
      [
        nSearch.createColumn({
          name: "id",
          sort: nSearch.Sort.ASC,
          label: "ID"
        }),
        nSearch.createColumn({
          name: 'custentity_bb_project_location',
          join: 'CUSTRECORD_BB_PROJECT'
        }),
        nSearch.createColumn({
          name: 'custentity_bb_sales_rep_employee',
          join: 'CUSTRECORD_BB_PROJECT'
        }),
        nSearch.createColumn({name: "custrecord_bb_project", label: "Project"}),
        nSearch.createColumn({
          name: "entityid",
          join: "CUSTRECORD_BB_PROJECT",
          label: "ID"
        }),
        nSearch.createColumn({
          name: "custentity_bb_home_owner_name_text",
          join: "CUSTRECORD_BB_PROJECT",
          label: "homeownername"
        }),
        nSearch.createColumn({
          name: "custentity_bb_project_manager_employee",
          join: "CUSTRECORD_BB_PROJECT",
          label: "projectmanager"
        }),
        nSearch.createColumn({name: "custrecord_bb_doc_reject_comm_history", label: "comment history"}),
        nSearch.createColumn({name: "custrecord_bb_package", label: "actiongroupid"}),
        nSearch.createColumn({name: "custrecord_bb_project_package_action", label: "Package Action"}),
        nSearch.createColumn({name: "custrecord_bb_document_status", label: "Action Status"}),
        nSearch.createColumn({name: "custrecord_bb_proj_act_assigned_to_emp", label: "Assigned To"}),
        nSearch.createColumn({name: "custrecord_bb_proj_act_assigned_to_tech", label: "Assigned To Tech"}),
        nSearch.createColumn({
          name: "custrecord_bb_doc_status_type",
          join: "CUSTRECORD_BB_DOCUMENT_STATUS",
          label: "Status Type"
        }),
        nSearch.createColumn({name: "custrecord_bb_proj_action_response_date", label: "Expected Response Date"}),
        nSearch.createColumn({
          name: "formulatext",
          formula: "{custrecord_bb_project.entityid} || ' ' || {custrecord_bb_project_package_action} || ' ' || TO_CHAR({custrecord_bb_proj_action_response_date},'MON-YY')",
          label: "title"
        }),
        nSearch.createColumn({name: "custrecord_msi_schdl_date", label: "Start Date"}),
        nSearch.createColumn({name: "custrecord_bb_proj_act_sch_end_date", label: "End Date"}),
        nSearch.createColumn({name: "custrecord_bb_proj_act_scheduled_time", label: "Start Time"}),
        nSearch.createColumn({name: "custrecord_bb_proj_act_scheduled_end_tim", label: "End Time"}),
        nSearch.createColumn({name: "custrecord_bb_proj_act_project_ovrvw_htm", label: "Project Overview"})
      ]
    });

    let results = getAllResults(projSearch).map((result) => {
      
      function combineDateAndTime(dateString, timeString) {
        if (!dateString) return null;
        if (!timeString) return new Date(dateString).toISOString();
      
        const [month, day, year] = dateString.split("/");
        const [time, period] = timeString.split(" ");
        let [hours, minutes] = time.split(":");
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);
      
        if (isNaN(hours) || isNaN(minutes)) return new Date(dateString).toISOString();
      
        if (period.toLowerCase() === "pm" && hours !== 12) {
          hours += 12;
        } else if (period.toLowerCase() === "am" && hours === 12) {
          hours = 0;
        }
      
        const dateObject = new Date(year, month - 1, day, hours, minutes);
        const timezoneOffset = dateObject.getTimezoneOffset() * 60 * 1000;
        const localDateObject = new Date(dateObject.getTime() - timezoneOffset);
      
        return localDateObject.toISOString();
      }
  
      let formattedStart;
      let formattedEnd;
  
      if (result.getValue({name: 'custrecord_msi_schdl_date'})) {
        formattedStart = combineDateAndTime(result.getValue({name: 'custrecord_msi_schdl_date'}), result.getValue({name: 'custrecord_bb_proj_act_scheduled_time'}));
      } else if (result.getValue({name: 'custrecord_bb_proj_act_scheduled_time'})) {
        formattedStart = new Date(result.getValue({name: 'custrecord_bb_proj_act_scheduled_time'})).toISOString();
      } else {
        formattedStart = null;
      }
  
      if (result.getValue({name: 'custrecord_bb_proj_act_sch_end_date'})) {
        formattedEnd = combineDateAndTime(result.getValue({name: 'custrecord_bb_proj_act_sch_end_date'}), result.getValue({name: 'custrecord_bb_proj_act_scheduled_end_tim'}));
      } else if (result.getValue({name: 'custrecord_bb_proj_act_scheduled_end_tim'})) {
        formattedEnd = new Date(result.getValue({name: 'custrecord_bb_proj_act_scheduled_end_tim'})).toISOString();
      } else {
        formattedEnd = null;
      }

      return {
      project : result.getValue({name: 'custrecord_bb_project'}),
      homeownername : result.getValue({name: 'custentity_bb_home_owner_name_text',join:'CUSTRECORD_BB_PROJECT'}),
      Start: formattedStart,
      End: formattedEnd,
      StartTime: result.getValue({name: 'custrecord_bb_proj_act_scheduled_time'}),
      EndTime: result.getValue({name: 'custrecord_bb_proj_act_scheduled_end_tim'}),
      CommentsHistory: result.getValue({name: 'custrecord_bb_doc_reject_comm_history'}),
      Tech: result.getValue({name: 'custrecord_bb_proj_act_assigned_to_tech'}),
      Employee: result.getValue({name: 'custrecord_bb_proj_act_assigned_to_emp'}),
      projectmanager: result.getValue({name: 'custentity_bb_project_manager_employee',join: "CUSTRECORD_BB_PROJECT"}),
      projectmanagertext: result.getText({name: 'custentity_bb_project_manager_employee',join: "CUSTRECORD_BB_PROJECT"}),
      actiongroupid: result.getValue({name: 'custrecord_bb_package'}),
      projectaction: result.getValue({name: 'id'}),
      AppointmentID: result.getValue({name: 'custrecord_bb_project'}),             
      actiontemplateid: result.getValue({name: 'custrecord_bb_project_package_action'}),
      actiongroup: result.getText({name: 'custrecord_bb_package'}),
      actiontemplate: result.getValue({name: 'custrecord_bb_project_package_action'}),
      status: result.getValue({name: 'custrecord_bb_document_status'}),
      statustext: result.getText({name: 'custrecord_bb_document_status'}),
      projectoverview: result.getValue({name: 'custrecord_bb_proj_act_project_ovrvw_htm'}),

      project_manager: result.getValue({name: 'custentity_bb_project_manager_employee',join: "CUSTRECORD_BB_PROJECT"}),
      project_manager_text: result.getText({name: 'custentity_bb_project_manager_employee',join: "CUSTRECORD_BB_PROJECT"}),
      action: result.getValue({name: 'custrecord_bb_project_package_action'}),
      action_text: result.getText({name: 'custrecord_bb_project_package_action'}),
      assigned_to_tech: result.getValue({name: 'custrecord_bb_proj_act_assigned_to_tech'}),
      assigned_to_tech_text: result.getText({name: 'custrecord_bb_proj_act_assigned_to_tech'}),
      assigned_to: result.getValue('custrecord_bb_proj_act_assigned_to_emp'),
      assigned_to_text: result.getText('custrecord_bb_proj_act_assigned_to_emp'),
      assigned_to_partner: result.getValue('custrecord_bb_assigned_to_partner'),
      assigned_to_partner_text: result.getText('custrecord_bb_assigned_to_partner'),
      project_location: result.getValue({name: 'custentity_bb_project_location', join: 'CUSTRECORD_BB_PROJECT'}),
      project_location_text: result.getText({name: 'custentity_bb_project_location', join: 'CUSTRECORD_BB_PROJECT'}),
      sales_rep: result.getValue({name: 'custentity_bb_sales_rep_employee', join: 'CUSTRECORD_BB_PROJECT'}),
      sales_rep_text: result.getText({name: 'custentity_bb_sales_rep_employee', join: 'CUSTRECORD_BB_PROJECT'}),
      action_status: result.getValue('custrecord_bb_document_status'),
      action_status_text: result.getText('custrecord_bb_document_status')
      }
    });
    
    return results;
  }

  const getProjects = (api) => {
    let projectSearch = nSearch.create({
      type: 'job',
      filters: [
        ["custentity_bb_is_project_template", "is", "F"], 
        "AND", 
        ["isinactive", "is", "F"], 
        "AND", 
        ["custrecord_bb_project.custrecord_bb_action_status_type", "noneof", "1", "4"]
      ],
      columns: [
        nSearch.createColumn({name: "internalid", label: "internalid"}),
        nSearch.createColumn({name: "entityid", label: "ID"}),
        nSearch.createColumn({name: "custentity_bb_home_owner_name_text", label: "Homeowner Name (Primary)"}),
        nSearch.createColumn({name: "altname", label: "Name"}),
        nSearch.createColumn({name: "custentity_bb_project_manager_employee", label: "Project Manager"})
      ]
    });

    let results = getAllResults(projectSearch).map((res) => {
      return {
        id: res.getValue({ name: 'internalid' }),
        name: res.getValue({ name: 'custentity_bb_home_owner_name_text' }) + " : " + res.getValue({ name: 'entityid' }),
        projectmanager: res.getValue({ name: 'custentity_bb_project_manager_employee' })
      }
    });

    if (api) {
      writeResponse(results);
    } else {
      return results;
    }
  }  
  
  const getProjectActions = (payload) => {

    let projectactionrecordid;

    let customRecordSearch = nSearch.create({
      type: 'customrecordtype',
      filters: [
         ['scriptid', 'is', 'customrecord_bb_project_action']
      ],
      columns: [
         'internalid',
         'scriptid',
         'name'
      ]
    });

    customRecordSearch.run().each(function(result) {
      projectactionrecordid = result.getValue({name: 'internalid'});
      return true;
    });
    
    var results = nQuery.runSuiteQL({
      query: `SELECT
      projectactions.id AS actionid,
      projectactions.custrecord_bb_project AS id,
      projectactions.name AS projectactionname        
      FROM 
          customrecord_bb_project_action AS projectactions
      JOIN 
          job ON projectactions.custrecord_bb_project = job.id
      JOIN
          customrecord_bb_package_task ON projectactions.custrecord_bb_project_package_action = customrecord_bb_package_task.id
      WHERE 
          job.custentity_bb_is_project_template = 'F' 
          AND projectactions.custrecord_bb_proj_doc_required_optional = 1 
          AND projectactions.custrecord_bb_project = ${payload.projectId}`
    });       
   
    var data = results.asMappedResults().map((element) => {
      return {
        id: element.actionid,
        projectId: element.id,           
        name: element.projectactionname,
        projectActionRecordId: projectactionrecordid         
      };
    });
    //log.debug('data',data)
    writeResponse({
      data: data
    });
  }

  const updateProject = (payload) => {
    log.debug('updateProject payload',payload);
    let actionStatusId;
    if(payload.actiongroupid){
    log.debug('payload.actiongroupid',payload.actiongroupid);
      let actionStatusReady = nSearch.create({
        type: 'customrecord_bb_document_status',
        filters:
        [
          ["custrecord_bb_doc_status_package","anyof",payload.actiongroupid], 
          "AND", 
          //inprogress
          ["custrecord_bb_doc_status_type", "anyof", 2],
        ],
        columns:
        [
            nSearch.createColumn({
              name: "name",
              sort: nSearch.Sort.ASC,
              label: "Name"
            }),
            nSearch.createColumn({name: "internalid", label: "Internal ID"})
        ]
      });
      actionStatusReady.run().each(function(result){
        actionStatusId = result.getValue('internalid') || '';
        return true;
      });
  
      log.debug('actionStatusId',actionStatusId);
      
    }

    let values = {
      custrecord_msi_schdl_date : payload.Start,
      custrecord_bb_proj_act_sch_end_date : payload.End,              
      custrecord_bb_proj_act_assigned_to_tech: payload.Tech,
      custrecord_bb_proj_act_scheduled_time:payload.StartTime,
      custrecord_bb_proj_act_scheduled_end_tim:payload.EndTime,
      custrecord_bb_rejection_comments: payload.Comments
    };
    
    if (actionStatusId) {
      values.custrecord_bb_document_status = actionStatusId;
    }

    let updatedRecord = nRecord.submitFields({
      type : 'customrecord_bb_project_action',
      id : payload.ProjectAction,
      values : values,
      options : {
        ignoreMandatoryFields : true
      }
    });
    log.debug('updatedRecord',updatedRecord);
    getInitialData();
  }

  const getProjectActionTemplate = () => {
    var results = nQuery.runSuiteQL({
      query: `SELECT
      CUSTOMRECORD_BB_PACKAGE_TASK.custrecord_bb_package_detail,	
      CUSTOMRECORD_BB_PACKAGE_TASK.id,
      CUSTOMRECORD_BB_PACKAGE_TASK.name,
      CUSTOMRECORD_BB_PACKAGE_TASK.isInactive,
    FROM
      CUSTOMRECORD_BB_PACKAGE_TASK
    WHERE
      CUSTOMRECORD_BB_PACKAGE_TASK.isInactive = 'F'
      ORDER BY custrecord_bb_package_detail`
    });       

    var data = results.asMappedResults().map((element) => {
      return {
        id: element.id,           
        name: element.name          
      };
    });

    return data;
  }

  const getAssignedToTech = () => {
    var results = nQuery.runSuiteQL({
      query: `SELECT
              employee.id,
              employee.firstName,
              employee.lastName
              FROM
                  employee
              ORDER BY
              employee.firstName ASC;`
    });

    var data = results.asMappedResults().map((element) => {
      return {
        id: element.id,           
        name: element.firstname          
      };
    });

    return data;
  }

  const getEmployees = () => {
    let results = nQuery.runSuiteQL({
      query: `SELECT
              employee.id,
              employee.firstName,	
              employee.lastName
              FROM
              employee`
    });

    let data = results.asMappedResults().map((element) => {
      return {
        id: element.id,           
        name: element.firstname          
      };
    });

    return data;
  }

  const writeResponse = (data) => {
    response.write({output: JSON.stringify(data)});
  }

  return {
    process: process
  };
});
