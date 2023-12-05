/**
 * SA-44630 SuiteScript Versioning Guidelines
 * SA-43522 SuiteScript 2.x JSDoc Validation
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 *
 * @description Set start dates based on preceeding actions
 *
 * Created by David Smith on 6/14/2022
 *
 * @copyright 2022 Blue Banyan Solutions
 */

define(['N/task','N/query', './BB SS/SS Lib/BB.SS.ScheduledScript.BatchProcessing'],
    function (task,query, batchProcessor) {

        function afterSubmit(ctx) {
            if(ctx.type=='delete') return;
            var paNew = ctx.newRecord,
                paOld = ctx.oldRecord
            ;
            let prjQ = query.runSuiteQL({
                query: `SELECT id, 
                            custrecord_bb_recurrence_start_date as start, 
                            custrecord_bb_project as project
                        from customrecord_bb_project_action 
                        where id=? AND isinactive='F'`,
                params: [paNew.id]
            }).asMappedResults()[0];

            //if(!prjQ.start){
            if(!prjQ?.start){
                log.error('No start date on this action');
            }
            //if(!prjQ.project){
            if(!prjQ?.project){
                log.error('No project on this action');
            }

            if(!paOld){
                // create
                startUpdateScript(paNew.id);
                return;
            }

            //if(paOld.getValue({fieldId:'custrecord_bb_recurrence_start_date'}) != prjQ.start){
            if(paOld.getValue({fieldId:'custrecord_bb_recurrence_start_date'}) != prjQ?.start){
                // updated value
                startUpdateScript(paNew.id);
            }

        }

        function startUpdateScript(prjAct){
            // var ssTask = task.create({
            //     taskType: task.TaskType.SCHEDULED_SCRIPT,
            //     scriptId: 'customscript_bbss_prj_act_milestone_date',
            //     //deploymentId: 'customdeploy_bbss_prj_act_milestone_date',
            //     params: {
            //         custscript_prj_action_id: prjAct.id
            //     }
            // }).submit();
            // log.debug('TASK',ssTask);

            let taskParameters = {};
            taskParameters['custscript_prj_action_id'] = prjAct;

            const scriptId = 'customscript_bbss_prj_act_milestone_date';
            const deploymentId = 'customdeploy_bbss_prj_act_milestone_date';
            const taskType = task.TaskType.SCHEDULED_SCRIPT;

            var taskId = batchProcessor.addToQueue(scriptId, deploymentId, taskParameters, taskType);
            log.audit('OK taskId', taskId);
        }

        return {
            //beforeLoad: beforeLoad,
            //beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    });
