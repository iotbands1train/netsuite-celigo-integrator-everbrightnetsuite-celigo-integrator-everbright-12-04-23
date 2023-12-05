/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define([
  'N/search', 
  'N/redirect',
  'N/record',
  'N/xml',
  'N/format'
], (
  nSearch, 
  nRedirect,
  nRecord,
  nXml,
  nFormat
) => {
  let response;

  const process = (context) => {
    let request = context.request;

    //getConfiguration();

    if (request.method == 'POST') {
      let data = JSON.parse(request.body); 
      // available globally
      response = context.response; 

      if (data.action == 'getInitialData') {
        getInitialData();
      } else if (data.action == 'edit') {
        edit(data.payload);
      }
    } else if (request.method == 'GET') {
      // let parameters = request.parameters;

      // if (parameters.goToProject) {
      //   let projectId = parameters.goToProject;

      //   nRedirect.toRecord({
      //     id: projectId,
      //     type: 'job'
      //   });
      // } else if (parameters.goToTransaction) {
      //   nRedirect.toRecord({
      //     id: parameters.goToTransaction,
      //     type: parameters.type
      //   });
      // } else if (parameters.goToExpense) {
      //   nRedirect.toRecord({
      //     id: parameters.goToExpense,
      //     type: 'customrecord_bb_ss_scheduled_forecast'
      //   });
      // }
    }
  }

  const edit = (payload) => {
    let responseObj = {
      success: false,
      id: null
    }

    if (!payload.id) writeResponse(responseObj);

    responseObj.success = updateProjectAction(payload);
    responseObj.id = payload.id;

    return responseObj;
  }

  const updateProjectAction = (params) => {
    try {
      nRecord.submitFields({
        type: 'customrecord_bb_project_action',
        id: params.id,
        values: {
          custrecord_bb_document_status: params.status,
          custrecord_bb_document_status_date: fromMMDDYYYY(params.date),
          custrecord_bb_proj_act_assigned_to_emp: params.assignedto,
          custrecord_bb_proj_act_assigned_to_tech: params.assignedtech,
          custrecord_bb_rejection_comments: params.comments
        }
      });

      writeResponse({status: 'ok'});
      /*let record = nRecord.load({
        type: 'customrecord_bb_project_action',
        id: params.id,
        isDynamic: true
      });

      log.debug('hello', params);

      record.setValue({
        fieldId: 'custrecord_bb_document_status',
        text: params.status
      });

      record.setValue({
        fieldId: 'custrecord_bb_document_status_date',
        value: fromMMDDYYYY(params.date)
      });

      record.setText({
        fieldId: 'custrecord_bb_proj_act_assigned_to_emp',
        text: params.assignedto
      });

      record.setText({
        fieldId: 'custrecord_bb_proj_act_assigned_to_tech',
        text: params.assignedtech
      });

      record.setValue({
        fieldId: 'custrecord_bb_rejection_comments',
        value: params.comments
      });

      record.save();*/
    } catch(e) {
      log.error(`error processing PA with internal id ${params.id}`, e.toString());
      return false;
    }

    return true;
  }

  const fromMMDDYYYY = (str) => {
    let obj = new Date(str)
    
    return obj;
  }

  const toMMDDYYYY = (d) => {
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let year = d.getFullYear();

    return `${month}/${day}/${year}`;
  }

  const getInitialData = () => {
    // Pull Project Action records
    let baseDataSet = [];
    let projectId;  // for use in url.resolveRecord
    let projectActionId;  // for use in url.resolveRecord
    let arrFilters = [
      ["custrecord_bb_project.custentity_bb_project_status","anyof",2], // working. full list in customlist_bb_project_status
      "AND", 
      ["custrecord_bb_project.isinactive", "is", false],
      "AND", 
      ["isinactive", "is", false],
      "AND", 
      ["custrecord_bb_proj_doc_required_optional","anyof",1], // 1 = required, 2 = optional,
      'AND',
      ['custrecord_bb_action_status_type', 'noneof', 4],
      'AND',
      ['custrecord_bb_project.custentity_bb_is_project_template', 'is', 'F']
     /* 'and',
      [
        ['internalidnumber', 'equalto', 5712364],
        'or',
        ['internalidnumber', 'equalto', 5712470]
      ]*/
    ];

    let customrecord_bb_project_actionSearchObj = nSearch.create({
      type: "customrecord_bb_project_action",
      filters: arrFilters,
      columns:
      [
        nSearch.createColumn({
          name: "id",
          label: "Id"
        }),
        nSearch.createColumn({
          name: "custrecord_bb_project",
          label: "ProjectId"
        }),
        nSearch.createColumn({
          name: "entityid",
          join: "custrecord_bb_project",
          label: "ProjectName",
          sort: nSearch.Sort.ASC
        }),
        nSearch.createColumn({
          name: "custentity_bb_home_owner_name_text",
          join: "custrecord_bb_project",
          label: "ProjectName",
          sort: nSearch.Sort.ASC
        }),
        nSearch.createColumn({
          name: "custrecord_bb_package",
          label: "ActionGroup"
        }),
        nSearch.createColumn({
          name: "custrecord_bb_project_package_action",
          label: "ProjectAction"
        }),
        nSearch.createColumn({
          name: "custrecord_bb_proj_doc_required_optional",
          label: "Required"
        }),
        nSearch.createColumn({
          name: "custrecord_bb_document_status",
          label: "ActionStatus"
        }),
        nSearch.createColumn({
          name: "custrecord_bb_document_status_date",
          label: "ActionStatusDate"
        }),
        nSearch.createColumn({
          name: "custrecord_bb_proj_act_assigned_to_emp",
          label: "AssignedTo"
        }),
        nSearch.createColumn({
          name: "custrecord_bb_proj_act_assigned_to_tech",
          label: "AssignedToTech"
        }),
        nSearch.createColumn({
          name: "custentity_bb_project_manager_employee",
          join: "custrecord_bb_project",
          label: "ProjectManager"
        }),
        nSearch.createColumn({
          name: "custrecord_bb_rejection_comments",
          label: "Comments"
        }),
        nSearch.createColumn({
          name: "custrecord_bb_doc_reject_comm_history",
          label: "CommentHistory"
        }),
        nSearch.createColumn({
          name: "custrecord_bb_proj_act_overall_step_int",
          label: "ActionSequence"
        }),
        nSearch.createColumn({
          name: "custrecord_bb_package_sequence_num",
          join: "custrecord_bb_package",
          label: "GroupSequence",
          sort: nSearch.Sort.ASC
        })
      ]
    });
    
    // run paged search instead of run().each()
    let pagedData = customrecord_bb_project_actionSearchObj.runPaged({
      pageSize: 1000
    });

    let pagedDataCount = pagedData.count;
    let pageCount = pagedData.pageRanges.length;

    for(let x = 0; x < pageCount; x++) {
      let searchPage = pagedData.fetch({
        index: x
      })
      
      let searchResults = searchPage.data;

      searchResults.forEach((result) => {
        let Id = result.getValue('id');
        let ProjectId = result.getValue('custrecord_bb_project');
        ProjectId = nXml.escape({xmlText : ProjectId});
        let ProjectName = result.getValue({
          name: 'entityid',
          join: 'custrecord_bb_project'
        });
        ProjectName += " ";
        ProjectName += result.getValue({
          name: 'custentity_bb_home_owner_name_text',
          join: 'custrecord_bb_project'
        });
        ProjectName = nXml.escape({xmlText : ProjectName});
        let ActionGroup = result.getText('custrecord_bb_package');
        ActionGroup = nXml.escape({xmlText : ActionGroup});
        let ProjectAction = result.getText('custrecord_bb_project_package_action');
        ProjectAction = nXml.escape({xmlText : ProjectAction});
        let Required = result.getText('custrecord_bb_proj_doc_required_optional');
        let ActionStatus = result.getText('custrecord_bb_document_status');
        ActionStatus = nXml.escape({xmlText : ActionStatus});
        let ActionStatusId = result.getValue('custrecord_bb_document_status');
        let ActionStatusDate = result.getValue('custrecord_bb_document_status_date');
        ActionStatusDate = ActionStatusDate && toMMDDYYYY(nFormat.parse({value: ActionStatusDate, type: "date"}));
        let AssignedTo = result.getValue('custrecord_bb_proj_act_assigned_to_emp');
        AssignedTo = nXml.escape({xmlText : AssignedTo});
        let AssignedToTech = result.getValue('custrecord_bb_proj_act_assigned_to_tech');
        AssignedToTech = nXml.escape({xmlText : AssignedToTech});

        let AssignedToTechText = result.getText('custrecord_bb_proj_act_assigned_to_tech');
        let AssignedToText = result.getText('custrecord_bb_proj_act_assigned_to_emp');

        let ProjectManager = result.getText({
          name: 'custentity_bb_project_manager_employee',
          join: 'custrecord_bb_project'
        });
        ProjectManager = nXml.escape({xmlText : ProjectManager});
        let Comments = result.getValue('custrecord_bb_rejection_comments');
        Comments = nXml.escape({xmlText : Comments});
        let CommentHistory = result.getValue('custrecord_bb_doc_reject_comm_history');
        let ActionSequence = result.getValue('custrecord_bb_proj_act_overall_step_int');
        let GroupSequence = result.getValue({
          name: 'custrecord_bb_package_sequence_num',
          join: 'custrecord_bb_package'
        });

        let obj = {};

        obj.Id = Id;
        obj.ProjectId = ProjectId;
        obj.ProjectName = ProjectName;
        obj.ProjectAction = ProjectAction;
        obj.ActionGroup = ActionGroup;
        obj.Required = Required;
        obj.ActionStatus = ActionStatus;
        obj.ActionStatusId = ActionStatusId;
        obj.ActionStatusDate = ActionStatusDate;
        obj.AssignedToText = AssignedToText;
        obj.AssignedToTechText = AssignedToTechText;
        obj.AssignedTo = AssignedTo;
        obj.AssignedToTech = AssignedToTech;
        obj.ProjectManager = ProjectManager;
        obj.Comments = Comments;
        obj.ActionSequence = ActionSequence;
        obj.GroupSequence = GroupSequence;
        baseDataSet.push(obj);

        return true;
      });
    }

    writeResponse({
      baseData: baseDataSet,
      actionStatuses: getActionStatuses(),
      employees: getEmployees()
    });

  /*  if (baseDataSet && baseDataSet != "" && baseDataSet != null) {
        contentDocument = contentDocument.replace("[baseDataSet]", JSON.stringify(baseDataSet));

        var actionStatusList = getActionStatusList();                
        contentDocument = contentDocument.replace("[statusDataSet]", JSON.stringify(actionStatusList));

        var empList = getEmpList();                
        contentDocument = contentDocument.replace("[empDataSet]", JSON.stringify(empList));

        var projURL = getRecordURL('job', baseDataSet[0].ProjectId);
        contentDocument = contentDocument.replace("[dataGridPrefProjURL]", projURL);

        var actionURL = getRecordURL('customrecord_bb_project_action', baseDataSet[0].Id);
        contentDocument = contentDocument.replace("[dataGridPrefActionURL]", actionURL);

        log.debug("Setting Project Action Data", JSON.stringify(baseDataSet))
    }*/
  }

  const getEmployees = () => {
    let arr = [];
    
    let search = nSearch.create({
      type: "employee",
      filters:
      [
        ["isinactive","is",false]
      ],
      columns:
      [
        nSearch.createColumn({
          name: "entityid"
        })
      ]
    });

    search.run().each((result) => {
      let name = result.getValue('entityid');

      arr.push({
        text: name,
        value: result.id
      });

      return true;
    });

    return arr;
}

  const getActionStatuses = () => {
    let statusList = [];
    
    let search = nSearch.create({
      type: "customrecord_bb_document_status",
      filters:
      [
        ["isinactive","is",false]
      ],
      columns:
      [
        nSearch.createColumn({
          name: "name",
          label: "Name"
        }),
        nSearch.createColumn({
          name: "custrecord_bb_doc_status_package",
          label: "Grouping"
        })
      ]
    });
    search.run().each((result) => {
      let Id = result.id;
      let Name = result.getValue('name');
      let Grouping = result.getText('custrecord_bb_doc_status_package');

      let obj = {};

      obj.text = Name;
      obj.value = Id;
      obj.grouping = Grouping;
      statusList.push(obj);

      return true;
    });

    return statusList;
}

  const writeResponse = (data) => {
    response.write({output: JSON.stringify(data)});
  }

  return {
    process: process
  };
});