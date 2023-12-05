/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */

define(["N/ui/serverWidget", "N/record", "N/task", "N/redirect", "N/search", "N/ui/message", "N/search", './util.js', './SS Lib/BB.SS.ScheduledScript.BatchProcessing'],
    function (ui, record, task, redirect, search, message, search, util, batchProcessor) {

        /**
         * Function creates the copy project Form and shows the progress of copy upon submission
         * 
         * @governance 0 Units
         * @param {Object} context - context of the request
         */
        function onRequest(context) {
            var req = context.request;
            var projectId = context.request.parameters.recordId;
            var taskId = context.request.parameters.taskId;
            var destinationSubsidiary = context.request.parameters.destinationSubsidiary

            if (req.method == "GET") {

                var form = ui.createForm({ title: "Copy Project" });
                form.clientScriptModulePath = './BB.CS.CopyProject.js';


                var fld_project = form.addField({
                    id: "custpage_project",
                    type: ui.FieldType.SELECT,
                    label: "Project",
                    source: "job"
                });
                fld_project.defaultValue = context.request.parameters.recordId;
                fld_project.updateDisplayType({
                    displayType: ui.FieldDisplayType.INLINE
                });

                var fld_fromSubsidiary = form.addField({
                    id: "custpage_from_subsidiary",
                    type: ui.FieldType.SELECT,
                    label: "From Subsidiary",
                    source: "subsidiary"
                });

                var fld_task = form.addField({
                    id: "custpage_taskid",
                    type: ui.FieldType.TEXT,
                    label: 'task id'
                });

                fld_task.defaultValue = taskId;

                fld_task.updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
                var projectField = search.lookupFields({
                    type: "job",
                    id: context.request.parameters.recordId,
                    columns: ["subsidiary"]
                });

                var subsidiaryId = projectField["subsidiary"][0].value;
                fld_fromSubsidiary.defaultValue = subsidiaryId;
                fld_fromSubsidiary.updateDisplayType({
                    displayType: ui.FieldDisplayType.INLINE
                });
                var fld_toSubsidiary = form.addField({
                    id: "custpage_to_subsidiary",
                    type: ui.FieldType.SELECT,
                    label: "To Subsidiary",
                    source: "subsidiary"
                });
                fld_toSubsidiary.isMandatory = true;

                updateFormFieldsAfterPostRequest(taskId, form, destinationSubsidiary);


                context.response.writePage(form);

            } else {
                var projectId = context.request.parameters.custpage_project;
                var destinationSubsidiary = context.request.parameters.custpage_to_subsidiary;

                log.debug('projectId', projectId);
                log.debug('destinationSubsidiary', destinationSubsidiary);

                // var scriptTask = task.create({
                //     taskType: task.TaskType.MAP_REDUCE,
                //     params: { custscript_bb_copy_project_id: projectId, custscript_bb_dest_subsidiary: destinationSubsidiary }
                // });
                // scriptTask.scriptId = 'customscript_bb_mr_copyproject';
                // scriptTask.deploymentId = 'customdeploy_bb_mr_copyproject';
                // var scriptTaskId = scriptTask.submit();
                //
                // redirect.toSuitelet({
                //     scriptId: 'customscript_bb_sl_copyproject',
                //     deploymentId: 'customdeploy_bb_sl_copyproject',
                //     parameters: {
                //         taskId: scriptTaskId,
                //         recordId: projectId,
                //         destinationSubsidiary: destinationSubsidiary
                //     }
                // });

                var taskParameters = {};
                taskParameters['custscript_bb_copy_project_id'] = projectId;
                taskParameters['custscript_bb_dest_subsidiary'] = destinationSubsidiary;

                var scriptId = 'customscript_bb_mr_copyproject';
                var deploymentId = 'customdeploy_bb_mr_copyproject';
                var taskType = task.TaskType.MAP_REDUCE;

                var taskId = batchProcessor.addToQueue(scriptId, deploymentId, taskParameters, taskType);
                log.audit('OK taskId', taskId);

                redirect.toSuitelet({
                    scriptId: "customscript_bb_ss_sl_progressbar_v2",
                    deploymentId: "customdeploy_bb_ss_sl_progressbar_v2",
                    parameters: {
                        taskId: taskId,
                        mainrecordid: projectId,
                        mainrecordtype: 'job'
                    }
                });
            }
        }



        /**
         * Function adds submit button for first time request to the page and if request has been submitted it disables changes to subsidiary field
         * 
         * @governance 0 Units
         * @param {String} taskId - task id of map reduce
         * @param {Object} form - serverwidget form object
         * @param {String} destinationSubsidiary - subsidiary id to be copied to the new project
         */
        function updateFormFieldsAfterPostRequest(taskId, form, destinationSubsidiary) {
            log.debug('taskId in show percenrt', taskId);
            log.debug('taskId in show percenrt in string', JSON.stringify(taskId))
            if (util.isNullOrEmpty(taskId)) {
                form.addSubmitButton({
                    label: 'Submit'
                });
            } else {
                var subsidiaryField = form.getField({
                    id: "custpage_to_subsidiary"
                });
                subsidiaryField.defaultValue = destinationSubsidiary;
                subsidiaryField.updateDisplayType({
                    displayType: ui.FieldDisplayType.DISABLED
                });
            }
        }

        return {
            onRequest: onRequest
        };
    });
