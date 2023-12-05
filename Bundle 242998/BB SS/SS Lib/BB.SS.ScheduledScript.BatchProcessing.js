/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author blubanyan
 * @fileOverview schedule batch processing
 */
/**
 * Copyright 2017-2020 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */


define(['N/record', 'N/search', 'N/task', 'N/query'],

    function(record, search, task, query) {

        function getScriptInternalId(scriptId, taskType){
            if(typeof scriptId === 'string'){
                var scriptType = getScriptType(taskType);
                var script = search.create({
                    type: scriptType,
                    columns:['internalid', 'name', 'scriptid'],
                    filters:['scriptid', 'is', scriptId]
                }).run().getRange({start: 0, end: 1});
                scriptId = script[0] ? script[0].id : '';
                return scriptId;
            }
            else if (typeof scriptId === 'number' ) {
                return scriptId;
            }
        }

        function getScriptType(taskType){
            switch(taskType){
                case task.TaskType.SCHEDULED_SCRIPT:
                    return record.Type.SCHEDULED_SCRIPT;
                    break;
                case task.TaskType.MAP_REDUCE:
                    return record.Type.MAP_REDUCE_SCRIPT;
                    break;
                default:
                    return 'Not valid type';
            }
        }

        function createDeployment(scriptId,taskType){
            try {
                var createdDepId;
                var scriptInternalId = getScriptInternalId(scriptId, taskType);
                if (!scriptInternalId) {
                   throw "Missing deployment, running lib again"
                }
                var dep = record.create({
                    type: record.Type.SCRIPT_DEPLOYMENT,
                    defaultValues: {'script': scriptInternalId},
                    isDynamic: true
                });
                dep.setValue('status', 'NOTSCHEDULED');
                createdDepId = dep.save();
            } catch (e) {
                log.error("Error creating new deployment",e);
            }
            return createdDepId;
        }

        function getDeployment(scriptId,taskType){


          var scheduledscriptinstanceSearchObj = search.create({
             type: "scheduledscriptinstance",
             filters:
             [
                ["datecreated","on","today"],
                "AND",
                ["script.scriptid","is",scriptId],
                "AND",
                ["status","anyof","PENDING","PROCESSING","RESTART","RETRY","INPROGRESS"]
             ],
             columns:
             [
                search.createColumn({
                   name: "scriptid",
                   join: "scriptDeployment",
                   label: "Custom ID"
                })
             ]
          });
          var ids = [];
          scheduledscriptinstanceSearchObj.run().each(function(result){
             ids.push(result.getValue(scheduledscriptinstanceSearchObj.columns[0]));
             return true;
          });

          var filters = [["script.scriptid","is",scriptId]];
          for(var i=0; i<ids.length; i++){
            filters.push("AND");
            filters.push(["scriptid","isnot",ids[i].toUpperCase()]);
          }
          var scriptdeploymentSearchObj = search.create({
             type: "scriptdeployment",
             filters:filters,
             columns:
             [
                search.createColumn({name: "scriptid", label: "Custom ID"})
             ]
          });
          var r;
          scriptdeploymentSearchObj.run().each(function(result){
             r=result.toJSON();
             return false;
          });
          return r ? r.values.scriptid : createDeployment(scriptId,taskType);
        }

        function createTask(scriptId, params, taskType){
            log.debug('createTask scriptId', {scriptId:scriptId,type:taskType,params:params});
            var id=null;
            try {
                // deploymentId is optional only for M/R - NS will auto select first available when not present
              var depId = getDeployment(scriptId,taskType);
                var t = task.create({
                    taskType: taskType,
                    scriptId: scriptId,
                    deploymentId: depId,
                    params: params
                });
                id = t.submit();
                log.debug('TASK1',{id:id,task:t});
            } catch(e){
                // this is and expected "error" so logging as audit so we don't try and track down a known problem
                log.audit(scriptId+'/'+taskType+' create task error', e);
                var depId = getDeployment(scriptId,taskType);
                log.debug('new deployment id created',{scriptid:scriptId,deploymentid:depId});
                try {// again....
                    var t2 = task.create({
                        taskType: taskType,
                        scriptId: scriptId,
                        deploymentId: depId,
                        params: params
                    });
                    id = t2.submit();
                    log.debug('TASK2',{id:id,task:t2});
                } catch (e2) {
                    // final error after creating new deployment
                    log.audit(scriptId+'/'+taskType+' create task error #2', e2);
                    return false;
                }
            }
            return id;
        }

        // leaving the deploymentText param for backwards compatibility with current scripts
        function addToQueue(scriptId, deploymentText, params, taskType){
            var taskId = false;
            // create up to this many new deployments as needed
            var retryMax = 10,
                retryCount = 0;
            do {
                taskId = createTask(scriptId, params, taskType);
                log.debug(retryCount+' TASK',taskId);
                retryCount++;
            } while(!taskId && retryCount < retryMax);
            if (retryCount == retryMax) {
                throw new Error('Unable to process at this time. Please try again.');
            }
            return taskId;
        }

        return {
            addToQueue: addToQueue,
        };

    });