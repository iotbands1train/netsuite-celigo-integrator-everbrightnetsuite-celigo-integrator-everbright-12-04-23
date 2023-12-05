/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope public
 * @author Graham O'Daniel
 */
define(['N/runtime', './SS Lib/BB.SS.Projects'], function(runtime, project) {
	function getInputData() {
		var thisScript = runtime.getCurrentScript();
		var tasks = thisScript.getParameter('custscript_bb_ss_mr_projpkgtsk_impt_json');
		return JSON.parse(tasks);
	}

	function map(context) {
		var taskData = JSON.parse(context.value);
		var task = new project.ProjectPackageTask(taskData);
		log.debug('task', JSON.stringify(task));
		task.save();
	}

	return {
		getInputData: getInputData,
		map: map
	}
});