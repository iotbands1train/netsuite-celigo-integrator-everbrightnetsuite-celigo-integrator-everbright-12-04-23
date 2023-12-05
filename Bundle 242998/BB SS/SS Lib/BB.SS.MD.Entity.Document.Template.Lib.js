 /**
  * @NApiVersion 2.x
  * @NModuleScope public
  * @author Matt Lehman
  * @overview - Entity Document Template library
  */

/**
 * Copyright 2017-2019 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/search', 'N/record', 'N/task', 'N/runtime', 'N/file', './BB.SS.ScheduledScript.BatchProcessing'],

function(search, record, task, runtime, nFile, batchProcessor) {

	function getProjectDocumentTemplateRelatedData(projectId) {
		var func = "getProjectDocumentTemplateRelatedData";
		var ahj = null;
		var utility = null;
		var hoa = null;
		var state = null;
		var financier = null;

    log.debug('projectId', projectId);

		if (projectId) {
			var projObj = search.lookupFields({
				type: search.Type.JOB,
				id: projectId,
				columns: ['custentity_bb_auth_having_jurisdiction',  'custentity_bb_utility_company', 'custentity_bb_homeowner_association', 
					'custentity_bb_install_state', 'custentity_bb_financier_customer']
			});

      log.debug('projObj', projObj);
			if (projObj.custentity_bb_auth_having_jurisdiction && projObj.custentity_bb_auth_having_jurisdiction.length > 0) {
				ahj = parseInt(projObj.custentity_bb_auth_having_jurisdiction[0].value);
			}
			if (projObj.custentity_bb_utility_company && projObj.custentity_bb_utility_company.length > 0) {
				utility = parseInt(projObj.custentity_bb_utility_company[0].value);
			}
			if (projObj.custentity_bb_homeowner_association && projObj.custentity_bb_homeowner_association.length > 0) {
				hoa = parseInt(projObj.custentity_bb_homeowner_association[0].value);
			}
			if (projObj.custentity_bb_install_state && projObj.custentity_bb_install_state.length > 0) {
				state = parseInt(projObj.custentity_bb_install_state[0].value);
			}
			if (projObj.custentity_bb_financier_customer && projObj.custentity_bb_financier_customer.length > 0) {
				financier = parseInt(projObj.custentity_bb_financier_customer[0].value);
			}
		}

		var returnObj = {
			projectAHJ: ahj,
			projectUtility: utility,
			projectHOA: hoa,
			projectState: state,
			projectFinancier: financier
		};
		log.debug(func, 'returnObj: ' + JSON.stringify(returnObj));
		return returnObj;
	}

	function scriptContextProjectDocumentTemplateRelatedData(currentProject, oldProject) {
		var oldObject = {};
		var currentObject = {};

		oldObject['custentity_bb_auth_having_jurisdiction'] = oldProject.getValue({fieldId: 'custentity_bb_auth_having_jurisdiction'});
		oldObject['custentity_bb_utility_company'] = oldProject.getValue({fieldId: 'custentity_bb_utility_company'});
		oldObject['custentity_bb_homeowner_association'] = oldProject.getValue({fieldId: 'custentity_bb_homeowner_association'});
		oldObject['custentity_bb_install_state'] = oldProject.getValue({fieldId: 'custentity_bb_install_state'});
		oldObject['custentity_bb_financier_customer'] = oldProject.getValue({fieldId: 'custentity_bb_financier_customer'});

		currentObject['custentity_bb_auth_having_jurisdiction'] = currentProject.getValue({fieldId: 'custentity_bb_auth_having_jurisdiction'});
		currentObject['custentity_bb_utility_company'] = currentProject.getValue({fieldId: 'custentity_bb_utility_company'});
		currentObject['custentity_bb_homeowner_association'] = currentProject.getValue({fieldId: 'custentity_bb_homeowner_association'});
		currentObject['custentity_bb_install_state'] = currentProject.getValue({fieldId: 'custentity_bb_install_state'});
		currentObject['custentity_bb_financier_customer'] = currentProject.getValue({fieldId: 'custentity_bb_financier_customer'});

		return {
			oldProject: oldObject,
			currentProject: currentObject
		};
	}

	function updateEntityDocumentTemplateData(scriptContext, newRecord, oldRecord) {
		log.debug('before if');
		var updateProjectActions = false;
		var projectEntityId = newRecord.getValue({fieldId: 'entityid'});
		log.debug('projectEntityId', projectEntityId);
		log.debug('newRecord', newRecord);
		if (!projectEntityId) return;
		log.debug('after if');
		var trigger = scriptContext.type;

		if (trigger == 'edit' || trigger == 'xedit') {
			var project = newRecord;
			var oldProject = oldRecord;
			var entityValues = scriptContextProjectDocumentTemplateRelatedData(project, oldProject);
			log.debug('updateEntityDocumentTemplateData entityValues', entityValues);
			if (entityValues.oldProject.custentity_bb_auth_having_jurisdiction != entityValues.currentProject.custentity_bb_auth_having_jurisdiction) {
				updateProjectActions = true;
			} else if (entityValues.oldProject.custentity_bb_utility_company != entityValues.currentProject.custentity_bb_utility_company) {
				updateProjectActions = true;
			} else if (entityValues.oldProject.custentity_bb_homeowner_association != entityValues.currentProject.custentity_bb_homeowner_association) {
				updateProjectActions = true;
			} else if (entityValues.oldProject.custentity_bb_install_state != entityValues.currentProject.custentity_bb_install_state) {
				updateProjectActions = true;
			} else if (entityValues.oldProject.custentity_bb_financier_customer != entityValues.currentProject.custentity_bb_financier_customer) {
				updateProjectActions = true;
			} else {
				// do nothing
			}
			log.audit('update project action entity document templates', updateProjectActions);
			if (updateProjectActions) {
				// call map reduce script to update project action entity document templates
				var taskParameters = {};
                taskParameters['custscript_bb_proj_action_project_id'] = newRecord.id;

                var scriptId = 'customscript_bb_ss_upsert_entity_action';
                var deploymentId = 'customdeploy_bb_ss_upsert_action';
                var taskType = task.TaskType.SCHEDULED_SCRIPT;

                batchProcessor.addToQueue(scriptId, deploymentId, taskParameters, taskType);

			}

		}

	}


    function upsertProjectActions(entityRecordsArray, projectActionArray, projectId) {
		var func = "upsertProjectActions";
    	log.debug(func, 'entity record array: ' + JSON.stringify(entityRecordsArray));
    	log.debug(func, 'project action record array: ' + JSON.stringify(projectActionArray));
    	log.debug(func, 'project id: ' + projectId);
		if (entityRecordsArray.length > 0) {
			for (var i = 0; i < entityRecordsArray.length; i++) {
				var ahjIndex = projectActionArray.map(function(data){return data.packageAction}).indexOf(entityRecordsArray[i].custrecord_bb_ahj_package_action);
				var utilIndex = projectActionArray.map(function(data){return data.packageAction}).indexOf(entityRecordsArray[i].custrecord_bb_utility_package_action);
				var hoaIndex = projectActionArray.map(function(data){return data.packageAction}).indexOf(entityRecordsArray[i].custrecord_bb_hoa_package_action);
				var stateIndex = projectActionArray.map(function(data){return data.packageAction}).indexOf(entityRecordsArray[i].custrecord_bb_state_package_action);
				var financierIndex = projectActionArray.map(function(data){return data.packageAction}).indexOf(entityRecordsArray[i].custrecord_bb_fin_package_action);
				log.debug(func, JSON.stringify({
					ahjIndex: ahjIndex,
					utilIndex: utilIndex,
					hoaIndex: hoaIndex,
					stateIndex: stateIndex,
					financierIndex: financierIndex
				}));
				if (ahjIndex != -1) { //project action not found create new project action
					var ahjObj = projectActionArray[ahjIndex];
					try {
						updateProjectAction(ahjObj.internalid, projectId, ahjObj.package, ahjObj.packageAction, 
							entityRecordsArray[i].custrecord_bb_ahj_req_optional_list, entityRecordsArray[i].custrecord_bb_ahj_doc_template, 'AHJ',
							entityRecordsArray[i].custrecord_bb_ahj_act_preced_ahj_act);
					} catch (e) {
						log.error('error on ahj action object', e);
						log.error('error updating ahj project action from Entity Actions', ahjObj);
					}
				} else if (ahjIndex == -1 && entityRecordsArray[i].custrecord_bb_ahj_package_action) {
					try {
						createProjectAction(projectId, entityRecordsArray[i].custrecord_bb_package_detail, 
							entityRecordsArray[i].custrecord_bb_ahj_package_action, entityRecordsArray[i].custrecord_bb_ahj_req_optional_list, 
							entityRecordsArray[i].custrecord_bb_ahj_doc_template, 'AHJ', projectActionArray,
							entityRecordsArray[i].custrecord_bb_ahj_act_preced_ahj_act);
					} catch (e) {
						log.error('error on ahj action object', e);
						log.error('error creating ahj project action from Entity Actions', entityRecordsArray[i]);
					}
				}

				if (utilIndex != -1) { //project action not found create new project action
					var utilObj = projectActionArray[utilIndex];
					try {
						updateProjectAction(utilObj.internalid, projectId, utilObj.package, utilObj.packageAction, 
							entityRecordsArray[i].custrecord_bb_utility_req_optional_list, 
							entityRecordsArray[i].custrecord_bb_utility_doc_template, 'UTILITY',
							entityRecordsArray[i].custrecord_bb_util_act_preced_util_act);
					} catch (e) {
						log.error('error on utility action object', e);
						log.error('error updating utility project action from Entity Actions', utilObj);
					}
				} else if (utilIndex == -1 && entityRecordsArray[i].custrecord_bb_utility_package_action) {
					try {
						createProjectAction(projectId, entityRecordsArray[i].custrecord_bb_package_detail, 
							entityRecordsArray[i].custrecord_bb_utility_package_action, entityRecordsArray[i].custrecord_bb_utility_req_optional_list, 
							entityRecordsArray[i].custrecord_bb_utility_doc_template, 'UTILITY', projectActionArray,
							entityRecordsArray[i].custrecord_bb_util_act_preced_util_act);
					} catch (e) {
						log.error('error on utility action object', e);
						log.error('error creating utility project action from Entity Actions', entityRecordsArray[i]);
					}
				}


				if (hoaIndex != -1) { //project action not found create new project action
					var hoaObj = projectActionArray[hoaIndex];
					try {
						updateProjectAction(hoaObj.internalid, projectId, hoaObj.package, hoaObj.packageAction, 
							entityRecordsArray[i].custrecord_bb_hoa_req_optional_list, entityRecordsArray[i].custrecord_bb_hoa_doc_template, 'HOA',
							entityRecordsArray[i].custrecord_bb_hoa_act_preced_hoa_act);
					} catch (e) {
						log.error('error on hoa action object', e);
						log.error('error updating hoa project action from Entity Actions', hoaObj);
					}
				} else if (hoaIndex == -1 && entityRecordsArray[i].custrecord_bb_hoa_package_action) {
					try {
						createProjectAction(projectId, entityRecordsArray[i].custrecord_bb_package_detail, 
							entityRecordsArray[i].custrecord_bb_hoa_package_action, entityRecordsArray[i].custrecord_bb_hoa_req_optional_list, 
							entityRecordsArray[i].custrecord_bb_hoa_doc_template, 'HOA', projectActionArray,
							entityRecordsArray[i].custrecord_bb_hoa_act_preced_hoa_act);
					} catch (e) {
						log.error('error on hoa action object', e);
						log.error('error creating hoa project action from Entity Actions', entityRecordsArray[i]);
					}
				}


				if (stateIndex != -1) { //project action not found create new project action
					var stateObj = projectActionArray[stateIndex];
					try {
						updateProjectAction(stateObj.internalid, projectId, stateObj.package, stateObj.packageAction, 
							entityRecordsArray[i].custrecord_bb_state_req_optional_list, entityRecordsArray[i].custrecord_bb_state_doc_template, 'STATE', 
							entityRecordsArray[i].custrecord_bb_state_act_preced_state_act);
					} catch (e) {
						log.error('error on state action object', e);
						log.error('error updating state project action from Entity Actions', stateObj);
					}
				} else if (stateIndex == -1 && entityRecordsArray[i].custrecord_bb_state_package_action) {
					try {
						createProjectAction(projectId, entityRecordsArray[i].custrecord_bb_package_detail, 
							entityRecordsArray[i].custrecord_bb_state_package_action, entityRecordsArray[i].custrecord_bb_state_req_optional_list, 
							entityRecordsArray[i].custrecord_bb_state_doc_template, 'STATE', projectActionArray,
							entityRecordsArray[i].custrecord_bb_state_act_preced_state_act);
					} catch (e) {
						log.error('error on state action object', e);
						log.error('error creating state project action from Entity Actions', entityRecordsArray[i]);
					}
				}


				if (financierIndex != -1) { //project action not found create new project action
					log.debug('financier entity record array value', entityRecordsArray[i]);
					var finObj = projectActionArray[financierIndex];
					log.debug('finObj', finObj);
					try {
						updateProjectAction(finObj.internalid, projectId, finObj.package, finObj.packageAction, 
							entityRecordsArray[i].custrecord_bb_fin_req_optional_list, entityRecordsArray[i].custrecord_bb_fin_doc_template, 'FINANCIER',
							entityRecordsArray[i].custrecord_bb_finan_act_preced_finan_act);
					} catch (e) {
						log.error('error on financier action object', e);
						log.error('error updating financier project action from Entity Actions', finObj);
					}
				} else if (financierIndex == -1 && entityRecordsArray[i].custrecord_bb_fin_package_action) {
					try {
						createProjectAction(projectId, entityRecordsArray[i].custrecord_bb_package_detail, 
							entityRecordsArray[i].custrecord_bb_fin_package_action, entityRecordsArray[i].custrecord_bb_fin_req_optional_list, 
							entityRecordsArray[i].custrecord_bb_fin_doc_template, 'FINANCIER', projectActionArray,
							entityRecordsArray[i].custrecord_bb_finan_act_preced_finan_act);
					} catch (e) {
						log.error('error on financier action object', e);
						log.error('error creating financier project action from Entity Actions', entityRecordsArray[i]);
					}
				}
			}
		}
		return projectActionArray;
	}


	function createProjectAction(projectId, package, packageAction, required, templateFile, fromAction, projectActionArray, precedAction) {
		log.debug('creating project action');
		log.audit('project id', projectId);
		log.audit('packageAction', packageAction);
		log.audit('package', package);
		log.audit('required', required);
		log.audit('templateFile', templateFile);
		log.audit('fromAction', fromAction);
		log.audit('precedAction', precedAction);
		var idCheck = checkForProjectAction(packageAction, projectId);
		log.audit('returned id for project action', idCheck);
		// if (idCheck) return projectActionArray; 
		if (idCheck) {
			var projectAction = record.load({
				type: 'customrecord_bb_project_action',
				id: idCheck,
				isDynamic: true
			});
		} else {
			var projectAction = record.create({ type: 'customrecord_bb_project_action', isDynamic: true });
			projectAction.setValue({ fieldId: 'custrecord_bb_project', value: projectId });
			projectAction.setValue({ fieldId: 'custrecord_bb_package', value: package });
			projectAction.setValue({ fieldId: 'custrecord_bb_project_package_action', value: packageAction });
			projectAction.setValue({ fieldId: 'custrecord_bb_projact_preced_pack_action', value: precedAction });

			log.debug('package id for status', package);
			var status = getDocumentStatusByPackage(package, 1)
			log.debug('status id ', status);

			projectAction.setValue({
				fieldId: 'custrecord_bb_document_status',
				value: status
			});
		}
		projectAction.setValue({
			fieldId: 'custrecord_bb_proj_doc_required_optional',
			value: required
		});
		projectAction.setValue({
			fieldId: 'custrecord_bb_proj_act_from_action_rec',
			value: fromAction
		});


		if (templateFile) {
      try {
        var link;

        var mySearch = search.create({
          type: 'customrecord_bb_file',
          filters: [
            ['isinactive', 'is', 'F'],
            'and',
            ['internalid', 'anyof', templateFile]
          ], 
          columns: ['custrecord_bb_file_link']
        });
        mySearch.run().each(function (res) {
          link = res.getValue('custrecord_bb_file_link')
        })

        projectAction.setValue({
          fieldId: 'custrecord_bb_action_document_template',
          value: link
        });
      } catch (e) {
        log.debug('e', e);
        log.debug('templateFile', 'was a number and the file was not found on the file cabinet, not erroring out');
      }
		}
    
		var step = projectAction.getValue({
			fieldId: 'custrecord_bb_package_step_number'
		});
		var id = projectAction.save({
			ignoreMandatoryFields: true,
			disableTriggers: true
		});
		projectActionArray.push({
			internalid: id,
			project: projectId,
			package: package,
			packageAction: packageAction,
			step: step,
			docStatus: status,
			required: required,
			templateFile: templateFile
		});
		//return projectActionArray;
	}


	function updateProjectAction(projectActionId, projectId, package, packageAction, required, templateFile, fromAction, precedAction) {
		var func = "updateProjectAction";
		log.debug(func, "updating project action: " + JSON.stringify({
			projectActionId: projectActionId,
			projectId: projectId,
			package: package,
			packageAction: packageAction,
			required: required,
			templateFile: templateFile,
			fromAction: fromAction,
			precedAction: precedAction
		}));
		var idCheck = checkForProjectAction(packageAction, projectId);
		if (idCheck) {
			var projectAction = record.load({
				type: 'customrecord_bb_project_action',
				id: idCheck,
				isDynamic: true
			});
			projectAction.setValue({ fieldId: 'custrecord_bb_proj_doc_required_optional', value: required });
			projectAction.setValue({ fieldId: 'custrecord_bb_proj_act_from_action_rec', value: fromAction });
			projectAction.setValue({ fieldId: 'custrecord_bb_projact_preced_pack_action', value: precedAction });
			
			var currentStatus = projectAction.getValue({
				fieldId: 'custrecord_bb_document_status'
			});
			if (!currentStatus) {
				var status = getDocumentStatusByPackage(package, 1);
				log.debug('status in update action', status);
				projectAction.setValue({
					fieldId: 'custrecord_bb_document_status',
					value: status
				});
			}

			if (templateFile && required == 1) {
				projectAction.setValue({
					fieldId: 'custrecord_bb_proj_act_temp_doc_rec',
					value: templateFile
				});
			} else {
				var currentTemplate =  projectAction.getValue({fieldId: 'custrecord_bb_proj_act_temp_doc_rec'});
				if (!currentTemplate && templateFile) {
					projectAction.setValue({
						fieldId: 'custrecord_bb_proj_act_temp_doc_rec',
						value: templateFile
					});
				}
			}
			projectAction.save({
				ignoreMandatoryFields: true,
				disableTriggers: true
			});
		}

	}

	function checkForProjectAction(packageActionId, projectId) {
		var projectActionId = null;
		if (packageActionId && projectId) {
			search.create({
				type: 'customrecord_bb_project_action',
				filters:
			    [
			    	["custrecord_bb_project_package_action","anyof", packageActionId],
			    	"AND",
			    	["custrecord_bb_project","anyof", projectId]
			    ],
			    columns:
			    [
			        "internalid"
			    ]
			}).run().each(function(result) {
				projectActionId = result.id;
				return true;
			});
		}
		return projectActionId;
	}


	function getActionRecords(ahj, utility, hoa, state, financier) {
		var func = "getActionRecords";
		var array = [];
		if (ahj) {
			array = getAHJSpecificActions(ahj, array);
		}

		if (utility) {
			array = getUtilitySpecificActions(utility, array);
		}

		if (hoa) {
			array = getHOASpecificActions(hoa, array);
		}

		if (state) {
			array = getStateSpecificActions(state, array);
		}

		if (financier) {
			array = getFinancierSpecificActions(financier, array);
		}
		log.debug(func, "entity action record array: " + JSON.stringify(array));
		return array;
	}


	function getAHJSpecificActions(ahj, array) {
		if (ahj) {
			var customrecord_bb_ahj_actionSearchObj = search.create({
			    type: "customrecord_bb_ahj_action",
			    filters:
			    [
			    	["custrecord_bb_ahj_record","anyof", ahj]
			    ],
			    columns:
			    [
			        "internalid",
			        "custrecord_bb_ahj_record",
			        "custrecord_bb_ahj_package_action",
			        "custrecord_bb_ahj_req_optional_list",
			        "custrecord_bb_ahj_doc_template",
			        "custrecord_bb_ahj_act_preced_ahj_act",
			       	search.createColumn({
			            name: "custrecord_bb_package_detail",
			            join: "custrecord_bb_ahj_package_action"
			        })
			   	]
			});
			var searchResultCount = customrecord_bb_ahj_actionSearchObj.runPaged().count;
			log.debug("customrecord_bb_ahj_actionSearchObj result count",searchResultCount);
			customrecord_bb_ahj_actionSearchObj.run().each(function(result){
			    // .run().each has a limit of 4,000 results
			    var ahjObj = {};
			    ahjObj['internalid'] = parseInt(result.getValue({name: 'internalid'}));
			    ahjObj['custrecord_bb_ahj_record'] = parseInt(result.getValue({name: 'custrecord_bb_ahj_record'}));
			    ahjObj['custrecord_bb_ahj_package_action'] = parseInt(result.getValue({name: 'custrecord_bb_ahj_package_action'}));
			    ahjObj['custrecord_bb_ahj_req_optional_list'] = parseInt(result.getValue({name: 'custrecord_bb_ahj_req_optional_list'}));
			    ahjObj['custrecord_bb_ahj_doc_template'] = parseInt(result.getValue({name: 'custrecord_bb_ahj_doc_template'}));
			    ahjObj['custrecord_bb_ahj_act_preced_ahj_act'] = result.getValue({name: 'custrecord_bb_ahj_act_preced_ahj_act'});
			    ahjObj['custrecord_bb_package_detail'] = parseInt(result.getValue({name: 'custrecord_bb_package_detail', join: 'custrecord_bb_ahj_package_action'}));
			    array.push(ahjObj);
			    return true; 
			});
		}

    log.debug('getAhjSpecificActions', array);
    log.debug('ahj', ahj);
		return array;
	}


	function getUtilitySpecificActions(utility, array) {
		if (utility) {
			var customrecord_bb_utility_actionSearchObj = search.create({
			    type: "customrecord_bb_utility_action",
			    filters:
			    [
			    	["custrecord_bb_utility_record","anyof", utility]
			    ],
			    columns:
			    [
			        "internalid",
			        "custrecord_bb_utility_record",
			        "custrecord_bb_utility_package_action",
			        "custrecord_bb_utility_req_optional_list",
			        "custrecord_bb_utility_doc_template",
			        "custrecord_bb_util_act_preced_util_act",
			        search.createColumn({
			            name: "custrecord_bb_package_detail",
			            join: "custrecord_bb_utility_package_action"
			        })
			    ]
			});
			var searchResultCount = customrecord_bb_utility_actionSearchObj.runPaged().count;
			log.debug("customrecord_bb_utility_actionSearchObj result count",searchResultCount);
			customrecord_bb_utility_actionSearchObj.run().each(function(result){
			    // .run().each has a limit of 4,000 results
			    var utilObj = {};
			    utilObj['internalid'] = parseInt(result.getValue({name: 'internalid'}));
			    utilObj['custrecord_bb_utility_record'] = parseInt(result.getValue({name: 'custrecord_bb_utility_record'}));
			    utilObj['custrecord_bb_utility_package_action'] = parseInt(result.getValue({name: 'custrecord_bb_utility_package_action'}));
			    utilObj['custrecord_bb_utility_req_optional_list'] = parseInt(result.getValue({name: 'custrecord_bb_utility_req_optional_list'}));
			    utilObj['custrecord_bb_utility_doc_template'] = parseInt(result.getValue({name: 'custrecord_bb_utility_doc_template'}));
			    utilObj['custrecord_bb_util_act_preced_util_act'] = result.getValue({name: 'custrecord_bb_util_act_preced_util_act'});
			    utilObj['custrecord_bb_package_detail'] = parseInt(result.getValue({name: 'custrecord_bb_package_detail', join: 'custrecord_bb_utility_package_action'}));
			    array.push(utilObj);
			    return true;
			});
		}
		return array;
	}


	function getHOASpecificActions(hoa, array) {

		if (hoa) {
			var customrecord_bb_hoa_actionSearchObj = search.create({
			    type: "customrecord_bb_hoa_action",
			    filters:
			    [
			    	["custrecord_bb_hoa_record","anyof", hoa]
			    ],
			    columns:
			    [
			        "internalid",
			        "custrecord_bb_hoa_record",
			        "custrecord_bb_hoa_package_action",
			        "custrecord_bb_hoa_req_optional_list",
			        "custrecord_bb_hoa_doc_template",
			        "custrecord_bb_hoa_act_preced_hoa_act",
			        search.createColumn({
			            name: "custrecord_bb_package_detail",
			            join: "custrecord_bb_hoa_package_action"
			        })
			    ]
			});
			var searchResultCount = customrecord_bb_hoa_actionSearchObj.runPaged().count;
			log.debug("customrecord_bb_hoa_actionSearchObj result count",searchResultCount);
			customrecord_bb_hoa_actionSearchObj.run().each(function(result){
			    // .run().each has a limit of 4,000 results
			    var hoaObj = {};
			    hoaObj['internalid'] = parseInt(result.getValue({name: 'internalid'}));
			    hoaObj['custrecord_bb_hoa_record'] = parseInt(result.getValue({name: 'custrecord_bb_hoa_record'}));
			    hoaObj['custrecord_bb_hoa_package_action'] = parseInt(result.getValue({name: 'custrecord_bb_hoa_package_action'}));
			    hoaObj['custrecord_bb_hoa_req_optional_list'] = parseInt(result.getValue({name: 'custrecord_bb_hoa_req_optional_list'}));
			    hoaObj['custrecord_bb_hoa_doc_template'] = parseInt(result.getValue({name: 'custrecord_bb_hoa_doc_template'}));
			    hoaObj['custrecord_bb_hoa_act_preced_hoa_act'] = result.getValue({name: 'custrecord_bb_hoa_act_preced_hoa_act'});
			    hoaObj['custrecord_bb_package_detail'] = parseInt(result.getValue({name: 'custrecord_bb_package_detail', join: 'custrecord_bb_hoa_package_action'}));
			    array.push(hoaObj);
			    return true;
			});
		}
		return array;
	}


	function getStateSpecificActions(state, array) {
		var func = "getStateSpecificActions";

		if (state) {
			var customrecord_bb_state_actionSearchObj = search.create({
			    type: "customrecord_bb_state_action",
			    filters:
			    [
			    	["custrecord_bb_state_record","anyof", state]
			    ],
			    columns:
			    [
			        "internalid",
			        "custrecord_bb_state_record",
			        "custrecord_bb_state_package_action",
			        "custrecord_bb_state_req_optional_list",
			        "custrecord_bb_state_doc_template",
			        "custrecord_bb_state_act_preced_state_act",
			     	search.createColumn({
			            name: "custrecord_bb_package_detail",
			            join: "custrecord_bb_state_package_action"
			        })
			    ]
			});
			var searchResultCount = customrecord_bb_state_actionSearchObj.runPaged().count;
			log.debug("customrecord_bb_state_actionSearchObj result count",searchResultCount);
			customrecord_bb_state_actionSearchObj.run().each(function(result){
			    // .run().each has a limit of 4,000 results
			    var stateObj = {};
			    stateObj['internalid'] = parseInt(result.getValue({name: 'internalid'}));
			    stateObj['custrecord_bb_state_record'] = parseInt(result.getValue({name: 'custrecord_bb_state_record'}));
			    stateObj['custrecord_bb_state_package_action'] = parseInt(result.getValue({name: 'custrecord_bb_state_package_action'}));
			    stateObj['custrecord_bb_state_req_optional_list'] = parseInt(result.getValue({name: 'custrecord_bb_state_req_optional_list'}));
			    stateObj['custrecord_bb_state_doc_template'] = parseInt(result.getValue({name: 'custrecord_bb_state_doc_template'}));
			    stateObj['custrecord_bb_state_act_preced_state_act'] = result.getValue({name: 'custrecord_bb_state_act_preced_state_act'});
			    stateObj['custrecord_bb_package_detail'] = parseInt(result.getValue({name: 'custrecord_bb_package_detail', join: 'custrecord_bb_state_package_action'}));
			    array.push(stateObj);
			    return true;
			});
		}
		log.debug(func, "Returning: " + JSON.stringify(array));
		return array;
	}


	function getFinancierSpecificActions(financier, array) {

		if (financier) {
			var customrecord_bb_financier_actionSearchObj = search.create({
			    type: "customrecord_bb_financier_action",
			    filters:
			    [
			    	["custrecord_bb_financier_record","anyof", financier]
			    ],
			    columns:
			    [
			        "internalid",
			        "custrecord_bb_financier_record",
			        "custrecord_bb_fin_package_action",
			        "custrecord_bb_fin_req_optional_list",
			        "custrecord_bb_fin_doc_template",
			        "custrecord_bb_finan_act_preced_finan_act",
			        search.createColumn({
			            name: "custrecord_bb_package_detail",
			            join: "CUSTRECORD_BB_FIN_PACKAGE_ACTION"
			        })
			    ]
			});
			var searchResultCount = customrecord_bb_financier_actionSearchObj.runPaged().count;
			log.debug("customrecord_bb_financier_actionSearchObj result count",searchResultCount);
			customrecord_bb_financier_actionSearchObj.run().each(function(result){
			    // .run().each has a limit of 4,000 results
			    var finObj = {};
			    finObj['internalid'] = parseInt(result.getValue({name: 'internalid'}));
			    finObj['custrecord_bb_financier_record'] = parseInt(result.getValue({name: 'custrecord_bb_financier_record'}));
			    finObj['custrecord_bb_fin_package_action'] = parseInt(result.getValue({name: 'custrecord_bb_fin_package_action'}));
			    finObj['custrecord_bb_fin_req_optional_list'] = parseInt(result.getValue({name: 'custrecord_bb_fin_req_optional_list'}));
			    finObj['custrecord_bb_fin_doc_template'] = parseInt(result.getValue({name: 'custrecord_bb_fin_doc_template'}));
			    finObj['custrecord_bb_finan_act_preced_finan_act'] = result.getValue({name: 'custrecord_bb_finan_act_preced_finan_act'});
			    finObj['custrecord_bb_package_detail'] = parseInt(result.getValue({name: 'custrecord_bb_package_detail', join: 'CUSTRECORD_BB_FIN_PACKAGE_ACTION'}));
			    array.push(finObj);
			    return true;
			});
		}
		return array;
	}


	function getProjectActionRecords(projectId) {
		var projectActionArray = [];
		if (projectId) {
			var customrecord_bb_project_actionSearchObj = search.create({
			    type: "customrecord_bb_project_action",
			    filters:
			    [
			        ["custrecord_bb_project","anyof",projectId]
			    ],
			    columns:
			    [
			        "internalid",
			        "custrecord_bb_project",
			        "custrecord_bb_package",
			        "custrecord_bb_project_package_action",
			        "custrecord_bb_package_step_number",
			        "custrecord_bb_document_status",
			        "custrecord_bb_proj_doc_required_optional",
			        'custrecord_bb_proj_act_temp_doc_rec'
			    ]
			});
			var searchResultCount = customrecord_bb_project_actionSearchObj.runPaged().count;
			log.debug("customrecord_bb_project_actionSearchObj result count",searchResultCount);
			customrecord_bb_project_actionSearchObj.run().each(function(result){
			    var obj = {};
			    obj['internalid'] = parseInt(result.getValue({name: 'internalid'}));
			    obj['project'] = parseInt(result.getValue({name: 'custrecord_bb_project'}));
			    obj['package'] = parseInt(result.getValue({name: 'custrecord_bb_package'}));
			    obj['packageAction'] = parseInt(result.getValue({name: 'custrecord_bb_project_package_action'}));
			    obj['step'] = parseInt(result.getValue({name: 'custrecord_bb_package_step_number'}));
			    obj['docStatus'] = parseInt(result.getValue({name: 'custrecord_bb_document_status'}));
			    obj['required'] = parseInt(result.getValue({name: 'custrecord_bb_proj_doc_required_optional'}));
			    obj['templateFile'] = parseInt(result.getValue({name: 'custrecord_bb_proj_act_temp_doc_rec'}));
			    projectActionArray.push(obj);
			    return true;
			});	
		}
		return projectActionArray;
	}

	function getDocumentStatusByPackage(package, configStatus) {
		var docStatusId = null;
		if (package && configStatus) {
			var customrecord_bb_document_statusSearchObj = search.create({
				type: "customrecord_bb_document_status",
				filters:
					[
						["custrecord_bb_doc_status_package", "anyof", package],
						"AND",
						["custrecord_bb_doc_status_type", "anyof", configStatus]
					],
				columns:
					[
						search.createColumn({name: "internalid", label: "Internal ID"}),
						search.createColumn({
							name: "name",
							sort: search.Sort.ASC,
							label: "Name"
						}),
						search.createColumn({name: "custrecord_bb_doc_status_package", label: "Action Group"}),
						search.createColumn({name: "custrecord_bb_doc_status_type", label: "Status Type"})
					]
			});
			var resultSet = customrecord_bb_document_statusSearchObj.run().getRange({start: 0, end: 1});
			if (resultSet.length > 0) {
				docStatusId = resultSet[0].getValue({name: 'internalid'});
			}
		}
		return docStatusId;
	}


    return {
        getProjectDocumentTemplateRelatedData: getProjectDocumentTemplateRelatedData,
        updateEntityDocumentTemplateData: updateEntityDocumentTemplateData,
        upsertProjectActions: upsertProjectActions,
        getActionRecords: getActionRecords,
        getProjectActionRecords: getProjectActionRecords
    };
    
});