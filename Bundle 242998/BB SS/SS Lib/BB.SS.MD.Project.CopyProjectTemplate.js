/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Michael Golichenko
 * @version 0.1.1
 * @fileOverview This module is responsable for copying project template.
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

define(['N/record', 'N/search', 'N/redirect', 'N/error'],
    function(record, search,  redirect, errorRec) {

      function getCopyData(orgProjectId){
        var lookupData = search.lookupFields({
          type: 'job',
          id: orgProjectId,
          columns: [
              'parent'
              , 'jobtype'
              , 'custentity_bb_homeowner_finance_method'
          ]
        });
        var result = {
          'custentity_bb_started_from_proj_template' : orgProjectId
        };
        for(var prop in lookupData){
          if(lookupData.hasOwnProperty(prop)){
            if(lookupData[prop] instanceof Array){
              result[prop] = lookupData[prop][0];
            } else {
              result[prop] = lookupData[prop];
            }
          }
        }
        return result;
      }

      function createCopy(projectData) {
        try{
          //set values
          var recNewProject = record.create({
            type: 'job',
            isDynamic: true
          });
          recNewProject.setValue({
            fieldId: 'parent',
            value: projectData.parent
          });
          recNewProject.setValue({
            fieldId:'jobtype',
            value: projectData.jobtype
          });
          recNewProject.setValue({
            fieldId:'custentity_bb_homeowner_finance_method',
            value: projectData.custentity_bb_homeowner_finance_method
          });
          recNewProject.setValue({
            fieldId:'custentity_bb_started_from_proj_template',
            value: projectData.custentity_bb_started_from_proj_template
          });

          var strCopyErrorText = 'Copied from ' + recOrigProject.id + '.\n';

          //Set all employees as Project Resources
          strCopyErrorText = addEmployeeProjectResources(recNewProject, strCopyErrorText);

          return recNewProject.save({
            ignoreMandatoryFields: true,
          });
        }
        catch (error)
        {
          if (error.getDetails != undefined)
          {
            log.error('Process Error', error.getCode() + ':  ' + error.getDetails());
            throw errorRec.create({
              name:error.getCode(),
              message: error.getDetails(),
              notifyOff: true
            });
          }
          else
          {
            log.error('Unexpected Error', error.toString());
            throw errorRec.create({
              name:'99999',
              message: error.toString(),
              notifyOff: true
            });
          }
        }
      }

      function addEmployeeProjectResources(recNewProject, strCopyErrorText)
      {
        var stLoggerTitle = 'addEmployeeProjectResources';
        var strEmail;
        var iEmployeeInternalId;
        var iRole;

        //get current list of employees
        var arrResults = getCurrentEmployeeResults();
        log.debug(stLoggerTitle, 'arrResults.length:  ' + arrResults.length);

        for (var i in arrResults)
        {
          var result = arrResults[i];
          var columns = result.columns;
          var columnLen = columns.length;
          log.debug(stLoggerTitle, 'columnLen:  ' + columnLen);

          strEmail = result.getValue(columns[1]);
          iEmployeeInternalId = result.getValue(columns[0]);
          iRole = -3; //Staff

          log.debug(stLoggerTitle,'Looking at ' + strEmail + ' with id ' + iEmployeeInternalId);

          recNewProject.selectNewLine({sublistId:'jobresources'});
          recNewProject.setCurrentSublistValue({
            sublistId:'jobresources',
            fieldId:'email',
            value: strEmail,
          });
          recNewProject.setCurrentSublistValue({
            sublistId:'jobresources',
            fieldId:'jobresource',
            value: iEmployeeInternalId,
          });
          recNewProject.setCurrentSublistValue({
            sublistId:'jobresources',
            fieldId:'role',
            value: iRole,
          });
          recNewProject.commitLine({sublistId:'jobresources'});
          log.debug(stLoggerTitle,'Saved ' + strEmail);
        }
        return strCopyErrorText;
      }

      function getCurrentEmployeeResults(){
        var searchObj = search.load({
          id: 'customsearch_bb_current_employees'
        });
        var resultSet = searchObj.run();
        var finalResults = [];
        var getMoreResults = true;
        var i_start = 0;
        var i_end = 1000;
        do{
          var results = resultSet.getRange({start:i_start, end: i_end});
          if(results.length > 0){
            finalResults = finalResults.concat(results);
            i_start = i_end;
            i_end += 1000;
          }
          else{
            getMoreResults = false;
          }
        }while(getMoreResults)
        return finalResults;
      }

      function copyProjectPackageAction (orgProjectId, newProjectId)
      {
        var stLoggerTitle = 'copyProjectPackageAction';
        var strPackageName;
        var strPackageDocument;
        var iPackageStep;
        var iActionType;
        var iRequiredOptional;
        var iRevisionNumber = 1;
        var iDocumentStatus = 1; //Not Started

        //get original Project Package Task record for new Project Package Task
        log.debug(stLoggerTitle, 'Project ID:  ' + orgProjectId);

        var arrResults = getProjectActionResults(orgProjectId);
        log.debug(stLoggerTitle, 'arrResults.length:  ' + arrResults.length);

        for (var i in arrResults)
        {
          var result = arrResults[i];
          var columns = result.columns;
          var columnLen = columns.length;
          log.debug(stLoggerTitle, 'columnLen:  ' + columnLen);

          strPackageName = result.getValue(columns[0]);
          iPackageAction = result.getValue(columns[1]);
          iPackageStep = result.getValue(columns[3]);
          iTaskType = result.getValue(columns[9]);
          iRequiredOptional = result.getValue(columns[10]);

          log.debug(stLoggerTitle,'Looking at ' + strPackageName
              + ' step:  ' + iPackageStep
              + '; doc: ' + strPackageDocument
              + '; task type: ' + iTaskType
              + '; required/optional: ' + iRequiredOptional);

          var recProjectPackageAction = record.create({
            type: 'customrecord_bb_project_action',
            isDynamic: true
          });

          recProjectPackageAction.setValue({
            fieldId:'custrecord_bb_project',
            value: newProjectId
          });
          recProjectPackageAction.setValue({
            fieldId:'custrecord_bb_package',
            value: strPackageName
          });
          recProjectPackageAction.setValue({
            fieldId:'custrecord_bb_project_package_action',
            value: iPackageAction
          });
          recProjectPackageAction.setValue({
            fieldId:'custrecord_bb_package_step_number',
            value: iPackageStep
          });
          recProjectPackageAction.setValue({
            fieldId:'customrecord_bb_project_doc_action_type',
            value: iActionType
          });
          recProjectPackageAction.setValue({
            fieldId:'custrecord_bb_proj_doc_required_optional',
            value: iRequiredOptional
          });
          recProjectPackageAction.setValue({
            fieldId:'custrecord_bb_revision_number',
            value: iRevisionNumber
          });
          recProjectPackageAction.setValue({
            fieldId:'custrecord_bb_document_status',
            value: iDocumentStatus
          });

          var iProjectPackageActionId = recProjectPackageAction.save({
            ignoreMandatoryFields: true
          });

          log.debug(stLoggerTitle,'Saved ' + iProjectPackageActionId
              + '; Package: ' + strPackageName
              + '; step:  ' + iPackageStep
              + '; doc: ' + strPackageDocument
              + '; task type: ' + iTaskType
              + '; required/optional: ' + iRequiredOptional);
        }
      }

      function getProjectActionResults(projectId){
        log.debug('getProjectActionResults projectId', projectId);
        var searchObj = search.load({
          id: 'customsearch_bb_proj_pack_task_by_templ'
        });
        searchObj.filters.push(search.createFilter({
          name: 'custrecord_bb_project',
          operator: search.Operator.ANYOF,
          values: projectId
        }))
        log.debug('getProjectActionResults filters', searchObj.filters);
        var resultSet = searchObj.run();
        var finalResults = [];
        var getMoreResults = true;
        var i_start = 0;
        var i_end = 1000;
        do{
          var results = resultSet.getRange({start:i_start, end: i_end});
          if(results.length > 0){
            finalResults = finalResults.concat(results);
            i_start = i_end;
            i_end += 1000;
          }
          else{
            getMoreResults = false;
          }
        }while(getMoreResults)
        return finalResults;
      }

      return {
        getCopyData: getCopyData,
        createCopy: createCopy,
        copyProjectPackageAction: copyProjectPackageAction
      };
    });