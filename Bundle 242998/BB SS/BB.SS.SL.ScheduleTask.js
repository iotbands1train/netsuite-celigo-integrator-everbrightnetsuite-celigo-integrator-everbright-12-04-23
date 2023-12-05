/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *
 * Submit a scheduled or m/r task via client script
 *
 * When submitting data for parameters use POST method with "p" param
 *
 * @param s = script ID
 * @param d = deployment ID (optional)
 * @param p = parameters to include on the deployment task
 *
 */
define(['N/runtime', 'N/url', 'N/task'],
    function(runtime, url, task) {
        function onRequest(context) {
        	var request = context.request;
        	var response = context.response;
			// force the response to be JSON
			response.setHeader({
				name: 'Content-Type',
				value: 'application/json; charset=utf-8',
			});
			var output = {success: false,taskId:null};

			var scriptId = request.parameters.s || null;
			var depId = request.parameters.d || null;
			var taskType = request.parameters.t == 'mr' ? task.TaskType.MAP_REDUCE : task.TaskType.SCHEDULED_SCRIPT;
			var paramData = request.parameters.p || null;
			if(paramData && paramData.indexOf('{')==0){
				// attempt to parse
				try {
					paramData = JSON.parse(paramData);
				} catch (e) {
					log.error('Error parsing JSON for params',e);
					// exit or continue ??
				}
			}

			var userObj = runtime.getCurrentUser();
			log.debug(userObj,request.parameters);

			try {
				var t = task.create({
					taskType: taskType,
					scriptId: scriptId,
					deploymentId: depId,
					params: paramData
				});
				output.taskId = t.submit();
				log.debug('TASK', {id: output.taskId, task: t});

				if (output.taskId) output.success = true;
			} catch (e) {
				log.error('Could not submit task',e);
				output.error = {name:e.name,message:e.message};
			}

			response.write( JSON.stringify(output) );
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
        
        return {
            onRequest: onRequest
        };
});
