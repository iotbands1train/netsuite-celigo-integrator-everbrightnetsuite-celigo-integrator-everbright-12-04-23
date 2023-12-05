/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime','N/file','N/error'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search, runtime, file, error) {
    function getInputData() {
		/************** script parameters **************/
    	var scriptObj = runtime.getCurrentScript();
		var recType = scriptObj.getParameter({name:"custscript_bludocs_rectype"});
		var fieldId = scriptObj.getParameter({name:"custscript_bludocs_fieldid"});
		if(!recType && !fieldId){
    		//exit
    		log.error('MISSING PARAM','rec type and field id are required');
    		return;
    	}
    	/************** end script parameters **************/

    	var customrecord_SearchObj = search.create({
 		   type: recType,
 		   filters: [
 		      // ["isinactive","is","F"],
			   // 'and',
			   [fieldId,'isempty','']
 		   ],
 		   columns: ['internalid']
 		});
 		var searchResultCount = customrecord_SearchObj.runPaged().count;
 		log.debug('search count',searchResultCount);
     	
     	// return the custom search
     	return customrecord_SearchObj;
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     * Map - Parses each row of data into a key/value pair. One pair (key/value) is passed per function invocation.
     * Array - key is the index value of the array.
     * Search - var searchResult = JSON.parse(context.value);var recordtype = searchResult.recordType;var id = searchResult.id;var columnVals  = searchResult.values;
     * If this stage is skipped, the reduce stage is required. 
     * Data is processed in parallel in this stage.
     * 1,000 units
	 * SSS_TIME_LIMIT_EXCEEDED = 5 minutes
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
		context.write(context.key, context.values);
    }

	function create_UUID() {
		var dt = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (dt + Math.random() * 16) % 16 | 0;
			dt = Math.floor(dt / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
		return uuid;
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
	 * SSS_TIME_LIMIT_EXCEEDED = 15 minutes
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     * 
     * "return" key example: context.write(key); // does not have to be the same key that the map stage passed in
     * 
     * https://netsuite.custhelp.com/app/answers/detail/a_id/48754
     */
    function reduce(context) {
		var scriptObj = runtime.getCurrentScript();
		var recType = scriptObj.getParameter({name:"custscript_bludocs_rectype"});
		var fieldId = scriptObj.getParameter({name:"custscript_bludocs_fieldid"});

		try{
			var values={}
			values[fieldId] = create_UUID();
			record.submitFields({
				type: recType,
				id: context.key,
				values: values,
				options: {
					enableSourcing: false,
					ignoreMandatoryFields : true,
					disableTriggers: true
				}
			});
		} catch (e) {
			log.error('SET FIELD FAILED',e);
		}
    }
    
    
    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     * Summarize - Summarizes the output of the previous stages. Developers can use this stage to summarize the data from the entire map/reduce process and write it to a file or send an email.
     * This stage is optional and is not technically a part of the map/reduce process. 
     * The summarize stage runs sequentially.
     * 10,000 units
	 * SSS_TIME_LIMIT_EXCEEDED = 60 minutes
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     * 
     * https://netsuite.custhelp.com/app/answers/detail/a_id/48755
     */
    function summarize(summary) {
    	// InputSummary
    	log.audit('InputSummary', JSON.stringify(summary.inputSummary));
    	

    	var reduceKeys = [];
    	var successfulReduceKeys = [];
        summary.reduceSummary.keys.iterator().each(function (key)
            {
                reduceKeys.push(key);
                if(reduceErrorKeys.indexOf(key)<0){
                	successfulReduceKeys.push(key);
    	        }
                return true;
        });
        log.audit('REDUCE # keys processed', reduceKeys.length);
        log.audit('REDUCE # keys successfully processed', successfulReduceKeys.length);

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize,
        
        config:{
        	retryCount: 0,
            exitOnError: true
        }
    };
    
});


