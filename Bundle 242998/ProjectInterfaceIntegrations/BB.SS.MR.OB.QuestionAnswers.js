/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */
define(['N/record', 'N/search', 'N/query', 'N/runtime','N/file','N/error'],
function(record, search, query, runtime, file, error) {

	const QUESTION_TYPE_MAP = {
		"TEXT": "TEXT",
		"ENUMERATEDSINGLE":"SELECT",
		"ENUMERATEDMULTIPLE":"MULTISELECT",
		"NUMERIC":"FLOAT",
		"DATE":"DATE",
		"URL":"URL",
		"BOOLEAN":"CHECKBOX"
	}

    function getInputData() {

		/************** script parameters **************/
    	var scriptObj = runtime.getCurrentScript();
    	// The Questions in this parameter should only be the OB Checklist.Questions array
		var checkListQuestions = scriptObj.getParameter({name:"custscript_checklist_questions_json"});
		try{
			if(checkListQuestions) checkListQuestions = JSON.parse(checkListQuestions);
			else checkListQuestions = [];
		}catch (e) {
			log.error('Problem parsing question data',e);
			return;
		}

		var questionRecordId = scriptObj.getParameter({name:"custscript_checklist_quest_rec_id"});
		if(!questionRecordId){
			log.error('MISSING PARAM','custscript_checklist_quest_rec_id is required');
			return;
		}
		/************** end script parameters **************/

		// Find all the current questions associated with this custom record
		// this is the mapping record that maps the external source questions by ID to the internal custom record fields
		var mapping = [];
		var filters = [['custrecord_bb_question_record','is',questionRecordId]];
		var cols = ['custrecord_bb_question_record_fld_id', 'custrecord_bb_q_questionid', 'custrecord_bb_q_questiontype',
			'custrecord_bb_q_questionunits', 'custrecord_bb_question_record','custrecord_b_q_listrecord'];
		// SuiteQL failed on getting the custrecord_bb_question_record
		search.create({type:'customrecord_bb_question_mapping',filters:filters,columns:cols})
			.run().each(function(r){
				var mappingObj = r.toJSON().values;
				mappingObj.id = r.id;
				mapping.push(mappingObj);
			});

		// pass both arrays to the map
     	return mapping.concat(checkListQuestions) ;
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
        log.debug('map context',context);

        // context.key = index value if standard array
		// context.key = record id if search result
		// context.value = array value or search result

		var value = JSON.parse(context.value);
		var key = value.QuestionID ? value.QuestionID.Value : value.custrecord_bb_q_questionid;
		// combine the arrays into one set of data
		context.write(key, value);
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
    	// key is the UUID
		// if the values array length > 1 then the question already exists
		// if the values array length == 1 then we need to insert the question
		//      to the mapping record and to the custom question record
		var checklistQuestion, mapQuestion;
		for(var i=0; i<context.values.length; i++){
			var value = JSON.parse(context.values[i]);
			if(value.QuestionID)
				checklistQuestion = value;
			else
				mapQuestion = value;
		}

		log.debug('reduce values',{checklist:checklistQuestion,map:mapQuestion});
		if(!checklistQuestion && mapQuestion) {
			throw error.create({
				name: 'MISSING_QUESTION',
				message: 'The Question that is currently mapped is missing.',
				notifyOff: true
			});
		}
		// this is required and must have a unique QuestionId value
		if(!checklistQuestion.QuestionID || !checklistQuestion.QuestionID.Value) {
			throw error.create({
				name: 'MISSING_QUESTIONID',
				message: 'The QuestionId is required.',
				notifyOff: true
			});
		}
		if(!checklistQuestion.QuestionLabel || !checklistQuestion.QuestionLabel.Value) {
			throw error.create({
				name: 'MISSING_QUESTIONLABEL',
				message: 'The QuestionLabel is required.',
				notifyOff: true
			});
		}

		// checklistQuestion exists
		// put this here so it's consistant with new vs updates
		var desc = "Units: " + (checklistQuestion && checklistQuestion.QuestionUnits ? checklistQuestion.QuestionUnits.Value : '') + '\n' +
			"Required: " + (checklistQuestion && checklistQuestion.RequirementLevel ? checklistQuestion.RequirementLevel.Value : '') + '\n' +
			"Notes: " + (checklistQuestion && checklistQuestion.RequirementNotes ? checklistQuestion.RequirementNotes.Value : '');


		var scriptObj = runtime.getCurrentScript();
		var questionRecordId = parseInt(scriptObj.getParameter({name:"custscript_checklist_quest_rec_id"}));

		// do an upsert to the question mapping
		if(!mapQuestion && checklistQuestion){

			// create new mapping record
			var mapQuestionRec = record.create({
				type: 'customrecord_bb_question_mapping',
				isDynamic: true
			});
			mapQuestionRec.setValue({
				// field IDs in NS are mapped to OB keys
				fieldId:'custrecord_bb_question_record',
				value:questionRecordId
			});
			for(var key in checklistQuestion){
				log.debug('setting map question field',{
					fieldId:'custrecord_bb_q_'+key.toLowerCase(),
					value:checklistQuestion[key].Value
				});
				mapQuestionRec.setValue({
					// field IDs in NS are mapped to OB keys
					fieldId:'custrecord_bb_q_'+key.toLowerCase(),
					value:checklistQuestion[key].Value
				});
			};
			log.debug('initial map question record',mapQuestionRec);

			var questionField=null;
			var fldLabel = checklistQuestion.QuestionLabel.Value.substr(0,40);
			if(QUESTION_TYPE_MAP[checklistQuestion.QuestionType.Value.toUpperCase()].indexOf('SELECT')>=0){
			// if(/SELECT/ig.test(checklistQuestion.QuestionType.Value)){
			// 	log.debug('NEW SELECT FIELD',checklistQuestion.QuestionType.Value);
				// select type fields need to have the list created
				var fldOptions = {
					description: checklistQuestion.QuestionLabel.Value,
					name:'',
					values:checklistQuestion.AnswerOptions.map(function(a){return a.Value;})
				}
				log.debug('NEW SELECT FIELD',fldOptions);
				// assume the list does not exist
				// save the question field first as a text field
				// because we don't have the list yet but we need the scriptid
				// to be used in the name of the list
				questionField = record.create({type: 'customrecordcustomfield',isDynamic: false});
				questionField.setValue({fieldId:'rectype',value:questionRecordId});
				questionField.setValue({fieldId:'fieldtype',value:'TEXT'});
				questionField.setValue({fieldId:'label',value:fldLabel});

				try{
					var questionFieldId = questionField.save({enableSourcing:true,ignoreMandatoryFields:true});
					log.debug('temp field created',questionFieldId);
				}
				catch (e) {	log.audit('new select question error',e); }

				questionField = record.load({type: 'customrecordcustomfield',id:questionFieldId,isDynamic:true});
				// get the scriptid value
				var questionFldScriptId = questionField.getValue({fieldId:'scriptid'});
				// create the list using {recordId}+'_'+{scriptid}
				fldOptions.name = questionRecordId+'_'+questionFldScriptId;

				// create/update the list
				var theList = upsertCustomList(fldOptions);
				// store the list in a field on the mapping
				mapQuestionRec.setValue({
					fieldId:'custrecord_bb_q_listrecord',
					value: theList.id
				});
			}

			// create new question field on the record
			var options = {
				// TODO: There is a 40-character limit for custom field labels.
				label: fldLabel
				, rectype: questionRecordId
				, scriptid: questionFldScriptId ? questionFldScriptId : null // this will be auto-assigned
				, description: desc
				, fieldtype: QUESTION_TYPE_MAP[checklistQuestion.QuestionType.Value.toUpperCase()]
				, selectrecordtype: theList ? theList.id : null
				, storevalue: true
				, showinlist: true
			}
			log.debug('Question Field Options',options);
			// if the question field was created above for a select list, use it
			questionField = questionField != null ? questionField : record.create({
				type: 'customrecordcustomfield',
				isDynamic: true
			});
			log.debug('questionField before setValue',questionField);
			questionField.setValue({fieldId:'rectype',value:options.rectype});
			var fieldTypesObj = getFieldTypes(questionField,'fieldtype');
			// log.debug('fieldTypesObj',fieldTypesObj);
			// {
			// 	CHECKBOX: "Check Box",
			// 		CURRENCY: "Currency",
			// 	DATE: "Date",
			// 	DATETIMETZ: "Date/Time",
			// 	FLOAT: "Decimal Number",
			// 	DOCUMENT: "Document",
			// 	EMAIL: "Email Address",
			// 	TEXT: "Free-Form Text",
			// 	HELP: "Help",
			// 	URL: "Hyperlink",
			// 	IMAGE: "Image",
			// 	INLINEHTML: "Inline HTML",
			// 	INTEGER: "Integer Number",
			// 	SELECT: "List/Record",
			// 	CLOBTEXT: "Long Text",
			// 	MULTISELECT: "Multiple Select",
			// 	PASSWORD: "Password",
			// 	PERCENT: "Percent",
			// 	PHONE: "Phone Number",
			// 	RICHTEXT: "Rich Text",
			// 	TEXTAREA: "Text Area",
			// 	TIMEOFDAY: "Time Of Day"
			// }

			if (fieldTypesObj.hasOwnProperty(options.fieldtype.toUpperCase())){
				questionField.setText({fieldId:'fieldtype',text:fieldTypesObj[options.fieldtype.toUpperCase()]});
			} else {
				// case sensative text value
				questionField.setText({fieldId:'fieldtype',text:fieldTypesObj[options.fieldtype]});
			}
			// if the field is new, this should reset it from TEXT to select
			if(options.fieldtype.toUpperCase().indexOf('SELECT')>=0){
				if (!options.selectrecordtype)
					throw error.create({
						name: 'MISSING_LIST_RECORD',
						message: 'SELECT and MULTISELECT require the selectrecordtype',
						notifyOff: false
					});
				if(isNaN(options.selectrecordtype)){
					var listOptionsObj = getRecordIds(field,'selectrecordtype');
					options.selectrecordtype = listOptionsObj[options.selectrecordtype.toUpperCase()];
				}
				log.debug('setting list/record select to id', options.selectrecordtype);
				questionField.setValue({fieldId:'selectrecordtype',value:options.selectrecordtype});
			}
			for(var option in options){
				if(options[option]==null) continue;
				if(option=='rectype' || option=='fieldtype' || option=='selectrecordtype') continue;
				try{
					log.debug(option,options[option]);
					// var isSelectFld = questionField.getField({fieldId:option}).type.indexOf('select')>=0;
					// if(isSelectFld && isNaN(options[option])){
					// 	questionField.setText({fieldId:option,text:options[option]});
					// } else {
						questionField.setValue({fieldId:option,value:options[option]});
					// }
				} catch (e) {
					log.error(e.name,e.message);
				}
			}

			log.debug('Question Field',questionField);
			var questionFldId = questionField.save();
			questionField = record.load({type:'customrecordcustomfield',id:questionFldId});
			log.debug('New Question Field ID='+questionFldId,questionField);
			var fldScriptId = questionField.getValue({fieldId:'scriptid'});
			log.debug('field script id',fldScriptId);

			// only map once we have a new field on the question record
			mapQuestionRec.setValue({
				// field IDs in NS are mapped to OB keys
				fieldId:'custrecord_bb_question_record_fld_id',
				value: fldScriptId
			});



			// var fldOptions = {
			// 	description: checklistQuestion.QuestionLabel.Value,
			// 	name:'',
			// 	values:checklistQuestion.AnswerOptions.map(function(a){return a.Value;})
			// }
			// // does the select list already exist?
			// if(!mapQuestion.custrecord_b_q_listrecord){
			// 	// assume the list does not exist
			// 	// if not, save first as a text field because we don't have the list yet but we need the scriptid
			// 	var field = record.create({type: 'customrecordcustomfield',isDynamic: true});
			// 	field.setValue({fieldId:'rectype',value:'TEXT'});
			// 	var fieldId = field.save();
			// 	field = record.load({type: 'customrecordcustomfield',id:fieldId});
			// 	// get the scriptid value
			// 	var fldScriptId = field.getValue({fieldId:'scriptid'});
			// 	// create the list using {recordId}+'_'+{scriptid}
			// 	fldOptions.name = questionRecordId+'_'+fldScriptId;
			// } else {
			// 	// get the ID of this list so we can upsert values
			// 	fldOptions.name = questionRecordId+'_'+fldScriptId;
			// }
			// // create/update the list
			// var theList = upsertCustomList(fldOptions);



			var mapQId = mapQuestionRec.save();
			log.debug('new mapping question record','customrecord_bb_question_mapping:'+mapQId);



			context.write("NEW", checklistQuestion);
		} else {
			// this question field already exists
			// check to see if it needs to be updated (type/label)
			if(checklistQuestion){

				// create new mapping record
				var updateObj = {
					"custrecord_bb_question_record":questionRecordId
				}
				for(var key in checklistQuestion){
					updateObj['custrecord_bb_q_'+key.toLowerCase()] = (util.isArray(checklistQuestion[key]) ? JSON.stringify(checklistQuestion[key]) : checklistQuestion[key].Value)
				};

				// update the mapping
				record.submitFields({
					type: 'customrecord_bb_question_mapping',
					id: mapQuestion.id,
					values: updateObj
				});

				// update the main question field
				var sql = "select internalid, name, scriptid, fieldtype, fieldvaluetyperecord, ismandatory, recordtype," +
					" fieldvaluetype, description from customfield where LOWER(scriptid) LIKE ?";

				var results = query.runSuiteQL({
					query: sql,
					params:[mapQuestion.custrecord_bb_question_record_fld_id]
				});
				log.debug('results',results);
				log.debug('results mapped',results.asMappedResults());
				var resultsObj = results.asMappedResults()[0];

				// name = label,
				var questionField = record.load({type:'customrecordcustomfield',id:resultsObj.internalid,isDynamic:true});
				log.debug('question field',questionField);

				var isChanged=false;
				if(resultsObj.name != checklistQuestion.QuestionLabel.Value){
					questionField.setValue({fieldId:'label',value:checklistQuestion.QuestionLabel.Value});
					isChanged=true;
				}
				if(resultsObj.description != desc){
					questionField.setValue({fieldId:'description',value:desc});
					isChanged=true;
				}

				if(resultsObj.fieldtype != QUESTION_TYPE_MAP[checklistQuestion.QuestionType.Value.toUpperCase()]){
					questionField.setValue({fieldId:'fieldtype',value:QUESTION_TYPE_MAP[checklistQuestion.QuestionType.Value.toUpperCase()]});
					isChanged=true;
				}

				//
				if(QUESTION_TYPE_MAP[checklistQuestion.QuestionType.Value.toUpperCase()].indexOf('SELECT')>=0){
					var fldOptions = {
						description: checklistQuestion.QuestionLabel.Value,
						name:'',
						values:checklistQuestion.AnswerOptions.map(function(a){return a.Value;})
					}
					var questionFldScriptId = questionField.getValue({fieldId:'scriptid'});
					// create/update the list using {recordId}+'_'+{scriptid}
					fldOptions.name = questionRecordId+'_'+questionFldScriptId;
					// create/update the list
					var theList = upsertCustomList(fldOptions);

					// get the new list id
					if(resultsObj.fieldvaluetyperecord != theList.id){
						questionField.setValue({fieldId:'selectrecordtype',value:theList.id});
						isChanged=true;
					}

				}

				if(isChanged) questionField.save();


				context.write("UPDATE", checklistQuestion);
			} else {
				context.write("MISSING CHECKLIST QUESTION", mapQuestion);
			}

		}


    }
	function getFieldTypes(rec,fieldId){
		var fldArray = rec.getField({fieldId:fieldId}).getSelectOptions();
		// convert array to key/pair
		var fldObj = {};
		for(var s=0; s<fldArray.length; s++){
			fldObj[fldArray[s].value] = fldArray[s].text
		}
		return fldObj;
	}
	function getRecordIds(rec,fieldId){
		var fldArray = rec.getField({fieldId:fieldId}).getSelectOptions();
		// convert array to key/pair
		var fldObj = {};
		for(var s=0; s<fldArray.length; s++){
			fldObj[fldArray[s].text.toUpperCase()] = fldArray[s].value
		}
		return fldObj;
	}
	function getRecordId(scriptId){
		var id;
		if(scriptId.indexOf('customlist')==0)
			search.create({type:'customlist',filters:[['scriptid','is',scriptId]]}).run().each(function(r){id=r.id});
		else if(scriptId.indexOf('customrecord')==0)
			search.create({type:'customrecordtype',filters:[['scriptid','is',scriptId]]}).run().each(function(r){id=r.id});
		else if(scriptId.indexOf('customdeploy')==0)
			search.create({type:'scriptdeployment',filters:[['scriptid','is',scriptId]]}).run().each(function(r){id=r.id});
		log.debug('custom record id',id);
		return id;
	}

	/**
	 *
	 * @param options @type {object}
	 * {Object} options
	 * {string} options.scriptid
	 * {string} options.name		**required for new list
	 * {string} options.description
	 * {Array.string} options.values[]
	 *
	 * @returns {customlist}
	 */
	function upsertCustomList(options){
		log.debug('upsert custom list',options);
    	var theList;
    	// search for the list existing
		var sql = "select internalid,scriptid,name,isinactive,description from customlist where LOWER({fld}) LIKE ?";
		var searchFld = options.name ? options.name : options.scriptid;
		if(options.name) sql = sql.replace(/{fld}/,'name');
		if(options.scriptid) sql = sql.replace(/{fld}/,'scriptid');

		var results = query.runSuiteQL({query: sql,params:[searchFld]}).asMappedResults();
		results = results[0] ? results[0] : null;
		log.debug('found the list?',results);

		// load or create base record
		if(results){
			theList = record.load({type:'customlist',isDynamic:true,id:results.internalid});
			log.debug('list',theList);
		} else {
			theList = record.create({type:'customlist',isDynamic:true});
			log.debug('new list',theList);
		}

		for(var v=0; v<options.values.length; v++) {
			// look for existing values
			var mylistvalue = options.values[v];
			var lineNumber = theList.findSublistLineWithValue({
				sublistId: 'customvalue',
				fieldId: 'value',
				value: mylistvalue
			});

			log.debug('has value',{line:lineNumber,value:mylistvalue});
			if(lineNumber>=0){
				log.debug('found value in list already',mylistvalue);
			} else {
				log.debug('new list value',mylistvalue);
				// create values
				theList.selectNewLine({sublistId: 'customvalue'});
				theList.setCurrentSublistValue({sublistId: 'customvalue',fieldId: 'value',
					value: mylistvalue
				});
				theList.commitLine({sublistId: 'customvalue'});
			}
		}
		if(options.scriptid) theList.setValue({fieldId:'scriptid',value:options.scriptid});
		if(options.name) theList.setValue({fieldId:'name',value:options.name});
		if(options.description) theList.setValue({fieldId:'description',value:options.description});
		// save record
		var listId = theList.save();
		theList = record.load({type:'customlist',id:listId,isDynamic:true});
		return theList;
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

        var mapErrorKeys = [];
	    summary.mapSummary.errors.iterator().each(function (key, error)
	        {
	            log.error('Map Error for key: ' + key, error);
	            // mapErrorKeys.push(key);
	            return true;
	        });
	    // log.debug('map error keys',mapErrorKeys);
	    var reduceErrorKeys = [];
	    summary.reduceSummary.errors.iterator().each(function (key, error)
	        {
	            log.error('Reduce Error for key: ' + key, error);
	            // reduceErrorKeys.push(key);
	            return true;
	        });
	    // log.debug('reduce error keys',reduceErrorKeys);
    
    	var contents = '';
    	summary.output.iterator().each(function(key, value) {
            // iterator key/value is from the reduce stage context.write(key,value)
			log.debug(key,value);
    		contents += (key + ' ' + value + '\n');
            return true;
        });


    	/************** PROCESS THE ANSWERS *****************/
    	// this is done AFTER the possibility that the questions may have changed
		var scriptObj = runtime.getCurrentScript();
		var questionRecordId = scriptObj.getParameter({name:"custscript_checklist_quest_rec_id"});
		if(!questionRecordId){
			log.error('MISSING PARAM','custscript_checklist_quest_rec_id is required');
		}
		var checkListAnswers = scriptObj.getParameter({name:"custscript_checklist_answers_json"});
		try{
			if(checkListAnswers) checkListAnswers = JSON.parse(checkListAnswers);
		}catch (e) {
			log.error('Problem parsing answer data',e);
		}

		// find the record we need to set
		// map the fields with the QuestionId
		// Loop the fields to set the values sent in





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
		log.debug('complete',contents);
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize,
        
        config:{
        	retryCount: 0,
            exitOnError: false
        }
    };
    
});


