/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Tyler Mann
 * @version 0.1.0
 */
define(['N/record', 'N/search', 'N/task'],
	/**
	 * @param {record} record
	 * @param {search} search
	 */
	function(record, search, task) {
	function getAvailableDeployments(scriptId, deploymentName, taskType){
		var deployments = [];
		var tasks = [];
		var availableDeployments;
		
		var scriptInternalId = getScriptInternalId(scriptId, taskType);
		log.debug('getAvailableDeployments scriptInternalId', scriptInternalId);
		//get all deployments for this scriptId
		search.create({
            type: record.Type.SCRIPT_DEPLOYMENT,
            columns: ['internalid', 'title', 'scriptid'],
            filters: [['script', 'anyof', [scriptInternalId]], 'and', ["status","anyof","NOTSCHEDULED"]]
        }).run().each(function (dep) {
            deployments.push(dep);
            return true;
        });
		log.debug('afterSearch for deployments',deployments);
		//get all actively running instances (tasks) of this scriptId
        tasks = search.create({
            type: record.Type.SCHEDULED_SCRIPT_INSTANCE,
            filters: [['script.internalid', 'anyof', [scriptInternalId]], 'and', ['status', 'anyof', ['RETRY', 'PROCESSING', 'PENDING']]],
            columns: ['script.internalid', 'scriptdeployment.internalid', 'datecreated', 'enddate', 'formulacurrency', 'formuladate', 'formuladatetime', 'formulanumeric', 'formulapercent', 'formulatext', 'percentcomplete', 'queue', 'queueposition', 'startdate', 'status']
        }).run().getRange({start: 0, end: 1000});
        
        //determine all availableDeployments
        availableDeployments = deployments.filter(function (dep) {
            var takenTask = tasks.filter(function (task) {
                var deploymentId = task.getValue({name: 'internalid', join: 'scriptdeployment'});
                return deploymentId == dep.id;
            });
            return !(takenTask instanceof Array) || takenTask.length == 0;
        });

        log.debug('avail deps', availableDeployments);

        if (!(availableDeployments instanceof Array) || availableDeployments.length == 0) {
        	var dep = record.create({
                type: record.Type.SCRIPT_DEPLOYMENT,
                defaultValues: {'script': scriptInternalId}
            });
        	var scriptIdSuffix = deployments.length+1;
        	log.debug('script id', deploymentName + scriptIdSuffix);
            dep.setValue('scriptid', deploymentName + scriptIdSuffix);
            dep.setValue('status', 'NOTSCHEDULED');

            try{
            	var createdDepId = dep.save();
	            var createdDep = record.load({
	                type: record.Type.SCRIPT_DEPLOYMENT,
	                id: createdDepId
	            });
	            availableDeployments = [createdDep];
            }
            catch(e){
            	log.debug('failed to create new deployment', e.message || e);
            }
        }
        //log.debug('getAvailableDeployments deploymentid', availableDeployments[0].getValue('scriptid'));
        return availableDeployments[0];
	}
		
	function getScriptInternalId(scriptId, taskType){
		if(typeof scriptId === 'string'){
			log.debug('getScriptInternalId scriptId', scriptId);
			var scriptType = getScriptType(taskType);
			log.debug('getScriptInternalId scriptType',scriptType);
	        var script = search.create({
                type: getScriptType(taskType),
                columns:['internalid', 'name', 'scriptid'],
                filters:['scriptid', 'is', scriptId]
            }).run().getRange({start: 0, end: 1});
        log.debug('getScriptInternalId script', script);
	        scriptId = script[0].id;
	        return scriptId;
		}
		else if(typeof scriptId === 'number' ){
			return scriptId;
		}
	}
	
	function getScriptType(taskType){
//		log.debug('getScriptType taskType', taskType);
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
	
	function createTask(scriptId, deployment, params, taskType){
		var deploymentId = deployment.getValue('scriptid');
		log.debug('createTask scriptId', scriptId);
		log.debug('createTask deploymentId', deploymentId);
		log.debug('createTask params', params);
		log.debug('createTask taskType', taskType);

	    try {
            var t = task.create({
            	taskType: taskType,
            	scriptId: scriptId, 
            	deploymentId: deployment.getValue('scriptid'),
            	params: params
            });
            t.submit();		        
	    }catch(e){
	    	log.error('create task error', e);
	        return false;
	    }
	    return true;
	}
	
	function addToQueue(scriptId, deploymentText, params, taskType){
		var retryMax = 100,
		retryCount = 0;
		var availableDeployment = getAvailableDeployments(scriptId, deploymentText, taskType);
		while(!createTask(scriptId, availableDeployment, params, taskType) && retryCount < retryMax){
			sleep(1000);
			availableDeployment = getAvailableDeployments(scriptId, deploymentText, taskType);
			retryCount++;
		}
		if (retryCount == retryMax) {
			throw new Error('Unable to process at this time. Please try again.');
		}
	}
	
	function sleep(sleepDuration){
		var now = new Date().getTime();
		while(new Date().getTime() < now + sleepDuration){/* do nothing*/ }
	}
    return {
    	addToQueue: addToQueue,
    };
	    
});
