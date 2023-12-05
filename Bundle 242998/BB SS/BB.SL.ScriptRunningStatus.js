/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/task", 'N/ui/serverWidget', './util.js', 'N/search', 'N/redirect', 'N/ui/message'], function (task, ui, util, search, redirect, message) {
	var SCHEDULED_SCRIPT_STATUS_PENDING = 'PENDING';
	var SCHEDULED_SCRIPT_STATUS_PROCESSING = 'PROCESSING';
	var SCHEDULED_SCRIPT_STATUS_RETRY = 'RETRY';

	/**
	 * Function creates the copy project Form and shows the progress of copy upon submission
	 * 
	 * @governance 0 Units
	 * @param {Object} context - context of the request
	 */
	function onRequest(context) {
		log.debug('context', context);
		if (context.request.method == 'POST') {
			var deploymentId = context.request.parameters.custpage_deploymentid;
			var fromSuitelet = context.request.parameters.custpage_fromstatussuitelet;
			var taskid = context.request.parameters.taskId;
			var status = {};

			//Search task id if request comes from Status Suitelet
			if (!util.isNullOrEmpty(deploymentId) && util.isNullOrEmpty(taskid)) {
				taskid = searchTask(deploymentId);
			}

			//get status of the task
			if (!util.isNullOrEmpty(taskid)) {
				var taskStatus = task.checkStatus({
					taskId: taskid
				});
				var percent = 0;
				log.debug('taskStatus.stage ' + taskStatus.stage, taskStatus);
				if (taskStatus.stage == "GET_INPUT") {
					var total = 1;
					var pending = 1;
					var processed = total - pending;
					percent = 5;
					status = {
						stage: taskStatus.stage,
						status: taskStatus.status,
						totalMapCount: total,
						pendingMapCount: pending,
						processed: processed,
						percentComplete: percent
					}
					log.debug('taskStatus.stage ' + taskStatus.stage, status);
				} else if (taskStatus.stage == "MAP") {
					percent = 10;
					var percentRemainingForMap = 50 - percent;
					var total = taskStatus.getTotalMapCount();
					var pending = taskStatus.getPendingMapCount();
					var processed = total - pending;
					var mapPercent = ((processed / total) * 100).toFixed(2);
					log.debug('mapPercent', mapPercent);
					var mapComplete = percent + (percentRemainingForMap * (mapPercent / 100));
					percent = mapComplete;
					status = {
						stage: taskStatus.stage,
						status: taskStatus.status,
						totalMapCount: total,
						pendingMapCount: pending,
						processed: processed,
						percentComplete: percent
					}
					log.debug('taskStatus.stage ' + taskStatus.stage, status);
				} else if (taskStatus.stage == "SHUFFLE") {
					status = status = {
						stage: taskStatus.stage,
						status: taskStatus.status,
						percentComplete: 50
					};
				}
				else if (taskStatus.stage == "REDUCE") {
					percent = 50;
					var percentRemainingForReduce = 90 - percent;
					var total = taskStatus.getTotalReduceCount();
					var pending = taskStatus.getPendingReduceCount();
					var processed = total - pending;
					var reducePercent = ((processed / total) * 100).toFixed(2);
					var reduceComplete = percent + (percentRemainingForReduce * (reducePercent / 100));
					percent = reduceComplete;
					status = {
						stage: taskStatus.stage,
						status: taskStatus.status,
						totalReduceCount: total,
						pendingMapCount: pending,
						processed: processed,
						percentComplete: reduceComplete
					}
					log.debug('taskStatus.stage ' + taskStatus.stage, status);
				} else if (taskStatus.stage == "SUMMARIZE") {
					status = {
						stage: taskStatus.stage,
						status: taskStatus.status,
						percentComplete: 95
					}

				} else {
					var taskStatusCheck = task.checkStatus({
						taskId: taskid
					});
					if (taskStatusCheck.status == task.TaskStatus.COMPLETE) {
						status = {
							stage: taskStatus.stage,
							status: taskStatus.status,
							percentComplete: 100
						}
					}

					if (taskStatusCheck.status == task.TaskStatus.PENDING) {
						status = {
							stage: taskStatus.stage,
							status: taskStatus.status,
							percentComplete: 0
						}
					}
				}

				log.debug('Status', status);
			}

			//if request came from Status Suitelet return to the suitelet with status result else retuurn the status as JSON object
			if (fromSuitelet) {
				redirect.toSuitelet({
					scriptId: 'customscript_bb_sl_scriptrunningstatus',
					deploymentId: 'customdeploy_bb_sl_scriptrunningstatus',
					parameters: {
						status: JSON.stringify(status),
						fromPost: true,
						deploymentAsked: deploymentId
					}
				});

			} else {
				log.debug('status returned in JSON', status);
				context.response.write({
					output: JSON.stringify(status)
				});
			}

		} else if (context.request.method == 'GET') {

			var deploymentid = context.request.parameters.deploymentId;
			var fromPost = context.request.parameters.fromPost;
			var deploymentAsked = context.request.parameters.deploymentAsked
			// create Status Suitelet UI if there no deployment id in URL else create progress bas HTML
			if (util.isNullOrEmpty(deploymentid)) {
				log.debug('in get');
				var form = ui.createForm({
					title: 'Task progress Status'
				});
				var tasksearchgroup = form.addFieldGroup({
					id: 'tasksearchgroup',
					label: 'Task Search'
				});
				var resultsGroup = form.addFieldGroup({
					id: 'resultsgroup',
					label: 'Task Status Result'
				});
				var status = context.request.parameters.status;
				log.debug('status', status);

				var deploymentIdField = form.addField({
					id: 'custpage_deploymentid',
					type: ui.FieldType.TEXT,
					label: 'Deployment ID',
					container: 'tasksearchgroup'
				});

				var fromStatusSuitelet = form.addField({
					id: 'custpage_fromstatussuitelet',
					type: ui.FieldType.CHECKBOX,
					label: 'From Status Suitelet',
				});
				fromStatusSuitelet.defaultValue = 'T';
				fromStatusSuitelet.updateDisplayType({
					displayType: ui.FieldDisplayType.HIDDEN
				});

				var statusField = form.addField({
					id: 'custpage_status',
					type: ui.FieldType.TEXT,
					label: 'Status',
					container: 'resultsgroup'
				});
				statusField.updateDisplayType({
					displayType: ui.FieldDisplayType.DISABLED
				});
				var stageField = form.addField({
					id: 'custpage_stage',
					type: ui.FieldType.TEXT,
					label: 'Stage',
					container: 'resultsgroup'
				});
				stageField.updateDisplayType({
					displayType: ui.FieldDisplayType.DISABLED
				});
				var percentField = form.addField({
					id: 'custpage_percent',
					type: ui.FieldType.TEXT,
					label: 'Percent Complete',
					container: 'resultsgroup'
				});
				percentField.updateDisplayType({
					displayType: ui.FieldDisplayType.DISABLED
				});


				if (!util.isNullOrEmpty(status)) {

					var statusObj = JSON.parse(status);
					statusField.defaultValue = statusObj.status;
					percentField.defaultValue = statusObj.percentComplete;
					stageField.defaultValue = statusObj.stage;
					deploymentIdField.defaultValue = deploymentAsked;
				} else if (!util.isNullOrEmpty(status) && fromPost) {
					form.addPageInitMessage({ type: message.Type.INFORMATION, message: 'No Task is Running at the Moment for the deployment', duration: 10000 });
				}
				form.addSubmitButton({
					label: 'Submit'
				});
				context.response.writePage(form);
				return;
			} else {
				var html = "<html><head><script type='text/javascript' charset='utf-8' async='' data-requirecontext='/SuiteScripts/Copy Project/BB.CS.ScriptRunningStatus' data-requiremodule='/SuiteScripts/Copy Project/BB.CS.ScriptRunningStatus' src='https://tstdrv1967913.app.netsuite.com/core/media/media.nl?id=3574&c=TSTDRV1967913&h=ab2b897c4cb5de4ae69c&_xt=.js'></script></head><body onLoad='mybarProgress()'><h1><progress id='file' value='' max='100'> 32% </progress></h1></body></html>";
				context.response.write(html);
			}

		}

	}


	/**
	 * Function searches for any running instance of the deployment if provided
	 * 
	 * @governance 10 Units
	 * @param {String} deploymentId - deployment id
	 * @returns {String} taskId - task id running for the deployment
	 */
	function searchTask(deploymentId) {
		var scheduledscriptinstanceSearchObj = search.create({
			type: "scheduledscriptinstance",
			filters:
				[
					["scriptdeployment.scriptid", "is", deploymentId], 'AND', ['status', 'anyof', SCHEDULED_SCRIPT_STATUS_PENDING, SCHEDULED_SCRIPT_STATUS_PROCESSING, SCHEDULED_SCRIPT_STATUS_RETRY]
				],
			columns:
				[
					search.createColumn({ name: "taskid", label: "Task ID" })
				]
		});
		var searchResultCount = scheduledscriptinstanceSearchObj.runPaged().count;
		log.debug("scheduledscriptinstanceSearchObj result count", searchResultCount);
		var taskResult = scheduledscriptinstanceSearchObj.run().getRange(0, 1); //10 units
		var taskId = '';
		if (!util.isNullOrEmpty(taskResult[0])) {
			taskId = taskResult[0].getValue('taskid')
		}

		return taskId
	}
	return {
		onRequest: onRequest
	};
}); 