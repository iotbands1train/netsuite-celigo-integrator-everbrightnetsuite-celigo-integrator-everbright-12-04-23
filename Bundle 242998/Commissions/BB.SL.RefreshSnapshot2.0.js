/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/redirect', 'N/search', 'N/task', 'N/runtime', './BB.MD.Commission2.0.Lib', /*'./BB.MD.Commission2.0.Lib'*/'SuiteScripts/BB SS/SS Lib/BB.SS.ScheduledScript.BatchProcessing'],
    /**
 * @param{record} record
 * @param{redirect} redirect
 * @param{search} search
 * @param{task} task
 */
    (record, redirect, search, task, runtime, util, batchProcessor) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            if  (scriptContext.request.method === 'GET') {
                const payrollPeriod = scriptContext.request.parameters.payrollPeriod;
                const recordID = scriptContext.request.parameters.recordID;
                const recordType = scriptContext.request.parameters.recordType;

                    log.debug('payroll period', payrollPeriod);
                let taskId = null;
                if (!util.isEmpty(payrollPeriod)) {
                    const arrObjectsToProcess = util.getSnapshotsToRefresh(payrollPeriod);

                    if (arrObjectsToProcess.length > 0) {
                        util.createSnapshotProcessor(arrObjectsToProcess, payrollPeriod, 'edit');
                        log.audit('OK', 'Snapshot Processors created');

                        let taskParameters = {};
                        taskParameters['custscript_bb_mr_cm_payroll'] = payrollPeriod;
                        taskParameters['custscript_bb_mr_cm_type'] = 'edit';

                        const scriptId = 'customscript_bb_mr_commv2_main';
                        const deploymentId = 'customdeploy_bb_mr_commv2_main';
                        const taskType = task.TaskType.MAP_REDUCE;

                        taskId = batchProcessor.addToQueue(scriptId, deploymentId, taskParameters, taskType);
                        log.audit('OK taskId', taskId);
                    }

                } // end of payroll period check
                if(!util.isEmpty(recordID) && !util.isEmpty(recordType)){
                    redirect.toSuitelet({
                        scriptId: "customscript_bb_ss_sl_progressbar_v2",
                        deploymentId: "customdeploy_bb_ss_sl_progressbar_v2",
                        parameters: {
                            taskId: taskId,
                            mainrecordid: recordID,
                            mainrecordtype: recordType
                        }
                    });
                    return;
                }
                redirect.toSuitelet({
                    scriptId: "customscript_bb_ss_sl_progressbar_v2",
                    deploymentId: "customdeploy_bb_ss_sl_progressbar_v2",
                    parameters: {
                        taskId: taskId,
                        mainsuiteletid: 'customscript_bb_sl_commv2_main',
                        mainsuiteletdeploy: 'customdeploy_bb_sl_commv2_main',
                        mainsuiteletparams: "&taskId="+taskId
                    }
                });
            }// request method check
        }

        return {onRequest}

    });
