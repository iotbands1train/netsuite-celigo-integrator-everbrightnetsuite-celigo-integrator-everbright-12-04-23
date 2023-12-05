/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['./Lib/BBSS.S3','N/record', 'N/search', 'N/runtime','N/file','N/error','N/xml','N/task','N/cache','N/https','./Lib/crypto-js'],
/**
 * @param {record} record
 * @param {search} search
 */
function(s3, record, search, runtime, file, error, xml, task, cache, https, CryptoJS) {
	/**
	 * 
	 * SuiteScript 2.0 Map/Reduce Script Error Handling
	 * https://netsuite.custhelp.com/app/answers/detail/a_id/65500
	 * 
	 * Get Input Data

The script ends the function invocation and exits the stage. It proceeds directly to the summarize stage.

inputSummary.error

SSS_USAGE_LIMIT_EXCEEDED error causes a script to exit the map or reduce stage immediately


Hard Limits on Total Persisted Data
https://netsuite.custhelp.com/app/answers/detail/a_id/48911#bridgehead_4479525364


	 */
	
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     * Get Input Data Acquires a collection of data.
     * This stage is always processed first and is required. 
     * The input stage runs sequentially.
     * 10,000 units
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * "return" options: https://netsuite.custhelp.com/app/answers/detail/a_id/48752
     * @since 2015.1
     * 
     */
    function getInputData() {

		/************** script parameters **************/
    	var scriptObj = runtime.getCurrentScript();
    	var files = scriptObj.getParameter({name:"custscript_file_obj_array"});
    	if(!files){
    		//exit
    		log.error('MISSING PARAM','custscript_file_obj_array is required');
    		return [];
    	}

    	// find the project action path
		var pa = scriptObj.getParameter({name:"custscript_bb_msi_copyto_proj_action"});
		if(!pa){
			//exit
			log.error('MISSING PARAM','custscript_bb_msi_copyto_proj_action is required');
			return [];
		}
    	/************** end script parameters **************/

		log.debug('project action to use',pa);
		// look up the document path for this project action
		var customrecord_bb_project_actionSearchObj = search.create({
			type: "customrecord_bb_project_action",
			filters:
				[
					["internalid","is",pa]
				],
			columns:
				[
					search.createColumn({
						name: "formulatext",
						formula: "'projects/'||{custrecord_bb_project.entityid}||'/'||{custrecord_bb_package}||'/'||{custrecord_bb_project_package_action}||'_'||{custrecord_bb_revision_number}",
						label: "Document Manager Path"
					}),
					search.createColumn({name: 'custrecord_bb_proj_task_dm_folder_text'})
				]
		});
		var searchResultCount = customrecord_bb_project_actionSearchObj.runPaged().count;
		log.debug("customrecord_bb_project_actionSearchObj result count",searchResultCount);
		var docMgr;
		customrecord_bb_project_actionSearchObj.run().each(function(result){
			docMgr = result.getValue(customrecord_bb_project_actionSearchObj.columns[0]);
			log.debug('project action file path',result.toJSON());
			return false;
		});

		if(!docMgr) {
			throw error.create({
				name: 'MISSING_FILE_PATH',
				message: 'Cannot copy files without a destination.',
				notifyOff: true
			});
		}
		// store the path and PA in cache to use in summary
		/************** CACHE ************************/
		var scriptCache = cache.getCache({name: 's3path'});
		// add key/value to cache
		scriptCache.put({
			key: 'prefix',
			value: docMgr
		});
		scriptCache.put({
			key: 'pa',
			value: pa
		});
		/******************* end cache ****************/

		try{
			files=JSON.parse(files);
			for(var f=0; f<files.length; f++){
				files[f].destination = docMgr;
			}
		} catch (e) {
			log.error('already an object or malformed',files);
			return [];
		}
		log.debug('param custscript_file_obj_array',files);

     	// return an array of data
     	return files;
        
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     * Map - Parses each row of data into a key/value pair. One pair (key/value) is passed per function invocation.
     * Array - key is the index value of the array.
     * Search - var searchResult = JSON.parse(context.value);var recordtype = searchResult.recordType;var id = searchResult.id;var columnVals  = searchResult.values;
     * If this stage is skipped, the reduce stage is required. 
     * Data is processed in parallel in this stage.
     * 1,000 units
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     * 
     * "return" key/value to the Shuffle stage example: context.write(key, value);
     * 
     * To prevent unintended alteration of data when it is passed between stages, 
     * key/value pairs are always serialized into strings. 
     * For map/reduce scripts, SuiteScript 2.0 checks if the data passed to the next stage is a string, 
     * and uses JSON.stringify() to convert the key or value into a string as necessary.
     * 
     * https://netsuite.custhelp.com/app/answers/detail/a_id/48753
     */
    function map(context) {
        log.debug(context.executionNo+' map value',context.value);
		try{
			var msiFileInfo=JSON.parse(context.value);
		} catch (e) {
			log.error(context.executionNo+' value malformed',context.value);
			throw error.create({
				name: 'JSON_MAP_VALUE',
				message: 'Cannot create object: '+e.message,
				notifyOff: true
			});
		}
		var newFileName = msiFileInfo.destination + msiFileInfo.value.substr(msiFileInfo.value.lastIndexOf('/'));
		log.debug('new file path/name',newFileName);

		// Connects to bucket that we're copying TO
		var S3 = new s3.Service();

		var accountId = runtime.accountId.toLowerCase();
		// sourceBucket should always be the same for the MSI integration
		var sourceBucket = 'ns-'+accountId.replace('_','-');

		var response = S3.copyObject(sourceBucket+'/'+msiFileInfo.value, newFileName);
		var copyResult = response.body;
		//log.audit('copy response',response);
		log.audit('copy obj',copyResult);

		var copyResultXML = xml.Parser.fromString({
			text : copyResult
		});
		var reqError = copyResultXML.getElementsByTagName({tagName: 'Error'})[0];
		if(reqError){
			// {
			// 	fieldId: fields[qLabel].id,
			// 		value: qAttachment.S3FilePath
			// }
			var fileInfo = {
				value: msiFileInfo.value
			}
			throw error.create({
				name: reqError.getElementsByTagName({tagName: 'Code'})[0].textContent,
				message: JSON.stringify(fileInfo)+'{::} '+reqError.getElementsByTagName({tagName: 'Message'})[0].textContent,
				notifyOff: true
			});
		}

    }
    
    
    /*************************************************************************************************
     * Shuffle - Groups values based on keys.
     * This is an automatic process that always follows completion of the map stage. 
     * There is no direct access to this stage as it is handled by the map/reduce script framework. 
     * Data is processed sequentially in this stage.
     *************************************************************************************************/


    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     * Reduce - Evaluates the data in each group. One group (key/values) is passed per function invocation.
     * If this stage is skipped, the map stage is required. 
     * Data is processed in parallel in this stage.
     * 5,000 units
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     * 
     * "return" key example: context.write(key); // does not have to be the same key that the map stage passed in
     * 
     * https://netsuite.custhelp.com/app/answers/detail/a_id/48754
     */
    function reduce(context) {

    }
    
    
    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     * Summarize - Summarizes the output of the previous stages. Developers can use this stage to summarize the data from the entire map/reduce process and write it to a file or send an email.
     * This stage is optional and is not technically a part of the map/reduce process. 
     * The summarize stage runs sequentially.
     * 10,000 units
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     * 
     * https://netsuite.custhelp.com/app/answers/detail/a_id/48755
     */
    function summarize(summary) {
    	// InputSummary
    	//log.audit('InputSummary', JSON.stringify(summary.inputSummary));
    	
    	/*
    	 * ERRORS
    	 */
    	if (summary.inputSummary.error)
        {
            log.error('Input Error', summary.inputSummary.error);
        };
        var mapErrorKeys = [];
        var retryFiles = [];
	    summary.mapSummary.errors.iterator().each(function (key, mapError)
	        {
	            log.error('Map Error for key: ' + key, mapError);
	            var mErr = mapError;
	            try{mErr=JSON.parse(mapError)}catch(e){log.error(e.name,e.message)}
	            mapErrorKeys.push(key);
	            try{
	            	var msiFileInfo = mErr.message.substr(0,mErr.message.indexOf('{::}'));
	            	retryFiles.push(JSON.parse(msiFileInfo));
				}catch (e) {
					log.error(e.name,e.message)
				}
	            return true;
	        });
	    log.debug('map error keys',mapErrorKeys);
	    log.audit('map files to retry',retryFiles);
	    // var reduceErrorKeys = [];
	    // summary.reduceSummary.errors.iterator().each(function (key, error)
	    //     {
	    //         log.error('Reduce Error for key: ' + key, error);
	    //         reduceErrorKeys.push(key);
	    //         return true;
	    //     });
	    // log.debug('reduce error keys',reduceErrorKeys);
    
    	
    	// MapSummary
    	//log.audit('MapSummary', JSON.stringify(summary.mapSummary));
    	// summary
    	//log.audit(summary.toString(), JSON.stringify(summary));
    	
    	
    	var mapKeys = [];
    	var successfulMapKeys = [];
    	summary.mapSummary.keys.iterator().each(function (key)
    	    {
    	        mapKeys.push(key);
    	        if(mapErrorKeys.indexOf(key)<0){
    	        	successfulMapKeys.push(key);
    	        }
    	        return true;
    	    });
    	
    	//log.audit('MAP keys processed', mapKeys);
    	log.audit('MAP keys successfully processed', successfulMapKeys);
    	
    	
    	// var reduceKeys = [];
    	// var successfulReduceKeys = [];
        // summary.reduceSummary.keys.iterator().each(function (key)
        //     {
        //         reduceKeys.push(key);
        //         if(reduceErrorKeys.indexOf(key)<0){
        //         	successfulReduceKeys.push(key);
    	//         }
        //         return true;
        // });
        // //log.audit('REDUCE keys processed', reduceKeys);
        // log.audit('REDUCE keys successfully processed', successfulReduceKeys);
    	
        
        var contents = '';
    	summary.output.iterator().each(function(key, value) {
            // iterator key/value is from the reduce stage context.write(key,value)
    		contents += (key + ' ' + value + '\n');
            return true;
        });
    	// log.debug('output',contents);
    	// if(contents){
    	// 	var fileObj = file.create({
    	// 		name: 'wordCountResult.txt',
    	// 		fileType: file.Type.PLAINTEXT,
    	// 		contents: contents
    	// 	});
    	// 	fileObj.folder = -15;
    	// 	var fid = fileObj.save();
    	// 	log.debug('file:'+fid);
    	// }


		/************** script parameters **************/
		var scriptObj = runtime.getCurrentScript();
		// var files = scriptObj.getParameter({name:"custscript_file_obj_array"});
		var paId = scriptObj.getParameter({name:"custscript_bb_msi_copyto_proj_action"});
		var retryCnt = scriptObj.getParameter({name:"custscript_bb_msi_retry_count"}) || 0;
		/************** end script parameters **************/

		try {
			// update the file count on the PA
			var prefix = cache.getCache({name: 's3path'}).get({key: 'prefix'});
			if (prefix) {
				log.debug('GET S3 FILE LIST', prefix);
				updateFileCount(prefix, paId);
			}
		} catch (e) {
			log.error('S3FILELIST - '+e.name,e.message);
		}

		if(paId && retryFiles.length>0 && retryCnt<3){
			retryCnt++;
			log.debug('Image Files to retry copy',retryFiles);
			try{
				var mrTask = task.create({
					taskType: task.TaskType.MAP_REDUCE,
					scriptId: 'customscript_bb_msi_copy_s3_files',
					params: {
						custscript_file_obj_array: retryFiles,
						custscript_bb_msi_copyto_proj_action: paId,
						custscript_bb_msi_retry_count: retryCnt
					}
				});
				log.debug('M/R task',mrTask);
				var mrTaskId = mrTask.submit();
			} catch (error){
				if(error.name=='NO_DEPLOYMENTS_AVAILABLE'){
					// create a new deployment and try again
					createNewDeployment();
					// attempt to schedule task again
					var mrTask = task.create({
						taskType: task.TaskType.MAP_REDUCE,
						scriptId: 'customscript_bb_msi_copy_s3_files',
						params: {
							custscript_file_obj_array: retryFiles,
							custscript_bb_msi_copyto_proj_action: paId,
							custscript_bb_msi_retry_count: retryCnt
						}
					});
					log.debug('M/R task',mrTask);
					var mrTaskId = mrTask.submit();
				}
			}

			log.debug('M/R is queued to copy files',mrTaskId);

			log.debug('RETRY',contents);
		} else {
			log.debug('COMPLETE',contents);
		}


    }

	function createNewDeployment(){
		// create a new deployment to use automatically
		var script = search.create({
			type: "script",
			columns:['internalid'],
			filters:['scriptid', 'is', 'customscript_bb_msi_copy_s3_files']
		}).run().getRange({start: 0, end: 1}) || [];
		var scriptId = script[0].id;
		var deployments=[];
		search.create({
			type: record.Type.SCRIPT_DEPLOYMENT,
			columns: ['internalid', 'title', 'scriptid'],
			filters: [['script', 'anyof', [scriptId]], 'and', ["status","anyof","NOTSCHEDULED"]]
		}).run().each(function (dep) {
			deployments.push(dep);
			return true;
		});

		var dep = record.create({
			type: record.Type.SCRIPT_DEPLOYMENT,
			defaultValues: {'script': scriptId}
		});
		var formattedDeployName = '_bb_msi_copy_s3_files';
		log.debug('deployment count', deployments.length);
		var scriptIdSuffix = deployments.length+1;
		dep.setValue('scriptid', formattedDeployName + scriptIdSuffix);
		dep.setValue('status', 'NOTSCHEDULED');
		var createdDepId = dep.save();
		log.debug(createdDepId+' new deployment created',formattedDeployName + scriptIdSuffix);
		return createdDepId;
	}

	function updateFileCount(prefix, pa){
		if (!prefix) {
			throw "Missing prefix parameter to set file count.";
		}
		if (!pa) {
			throw "Missing project action parameter to set file count.";
		}

		require(['SuiteBundles/Bundle 207067/BB/S3/Lib/BB.S3','N/record'],function(s3,record)
		{
			var acl = 'private';
			log.debug('prefix', prefix);
			var amzDate = s3.Service.getAmzDate();
			var datestamp = amzDate.split("T")[0];
			var successStatus = "201";
			var s3service = new s3.Service();
			s3service.loadCredentials();
			s3service._service = 's3';
			var amzAlgorithm = s3service.ALGORITHM;
			var amzCredential = [s3service._accessKey, datestamp, s3service._region, s3service._service, 'aws4_request'].join('/');
			var policy = new s3.Policy({
				"expiration": "2027-12-01T12:00:00.000Z", // TODO: replace with now + 30 minutes
				"conditions": [
					{"prefix": prefix},
					{"bucket": s3service._bucket},
					{"acl": acl},
					{"success_action_status": successStatus},
					{"x-amz-credential": amzCredential},
					{"x-amz-algorithm": amzAlgorithm},
					{"x-amz-date": amzDate},
					{"content-disposition": "inline"},
					["starts-with", "$content-type", ""], // Any content type for now
					["starts-with", "$key", ""] // User can name it anything
				]
			});
			var policyBase64 = policy.toBase64();
			var signingKey = s3service.getSignatureKey(s3service._service, s3service._secretKey, datestamp);
			var signature = CryptoJS.HmacSHA256(policyBase64, signingKey);
			log.debug('signature', JSON.stringify(signature));
			var presignedUrl = s3service.getPresignedListUrl(prefix, 60);
			var response = https.get({url: presignedUrl});
			// log.debug('folder list', response.body);

			if (response.code / 100 !== 2) {
				throw ["Error occurred calling Amazon (", response.code, ").", "\n", response.body].join('');
			}

			var responseString = response.body.replace('xmlns="http://s3.amazonaws.com/doc/2006-03-01/"', '');
			//log.debug('responseString',responseString);
			var xmlDocument = xml.Parser.fromString({text: responseString});
			var fileCount = xmlDocument.getElementsByTagName({tagName: 'Key'}).length || 0;
			log.debug('file count = ' + fileCount, prefix);
			record.submitFields({
				type: 'customrecord_bb_project_action',
				id: pa,
				values: {
					'custrecord_bb_proj_action_file_cnt_int': fileCount
				},
				disableTriggers: true
			});
			log.debug('Count set','customrecord_bb_project_action:'+pa);
		});
	}

    return {
        getInputData: getInputData,
        map: map,
        //reduce: reduce,
        summarize: summarize,
        
        config:{
        	retryCount: 0,
            exitOnError: true
        }
    };
    
});


