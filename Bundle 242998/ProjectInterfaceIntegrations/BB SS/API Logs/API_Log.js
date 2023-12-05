/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 *
 * Requires the API Log custom record
 */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* @ FILENAME      : API_Log.js
* @ AUTHOR        : David Smith
* @ DATE          : 2019/07
* @Descriptin - Library script to add or update an API Log
* Copyright (c) 2019 MultiPoint Videos, LLC.
* All Rights Reserved.
*
* This software is the confidential and proprietary information of
* MultiPoint Videos, LLC. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with MultiPoint Videos, LLC.
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


define(['N/runtime','N/record','N/https','N/http','N/error'],function(rt,rec,https,http,error){
function APILog(options){
	var runtime = rt;
	var record = rec;

	this.debug = (options && options.debug) ? options.debug : false;
	
	var scriptObj = runtime.getCurrentScript();
	this.scriptId = scriptObj.id;
	this.deploymentId = scriptObj.deploymentId;
	this.envType = runtime.envType;
	
	this.currentLogId = null;
	
	if(this.debug) log.debug('APILog Init', this.scriptId +" "+ this.deploymentId);
	
	// add a new "APILog" record for processing
	/*
	 * @param options
     *        {Object} 
     *        Keys:
     *        	ur, method, payload, response, error, transaction, entity, item
     * 
     * @return {Object} <code>{"success":true, "id":apiId}</code> record created and script started
     *         <code>{"error":{"name":e.name,"message":e.message}};</code> error creating record
     * 
     * @since 2015.2
     * 
     * @static
     * @function addLog
	 */
	this.addLog = function(options){
		try{
			if(this.debug) log.debug('API Log ADD',options);
			// default to M/R
			var api = record.create({
				type: 'customrecord_api_log',
				isDynamic: true
			});
			api.setValue({fieldId: 'custrecord_api_scriptid', value: this.scriptId}); 
			api.setValue({fieldId: 'custrecord_api_deploymentid', value: this.deploymentId}); 
			
			if(options.request){  // typically a suitelet request
				var request = options.request;
				//if(this.debug) log.debug('API LOG request',request);
				options.ip = request.clientIpAddress || '';
				options.method = request.method || '';
				options.parameters = request.parameters || '';
				options.body = request.body || '';
				options.files = request.files || '';
				options.headers = request.headers || '';
				options.url = request.url || '';
				delete options.request;
			}
			if(options.params && !options.parameters) {
				options.parameters = options.params;
				delete options.params;
			}
			
			for(var field in options){
				try{
					var value = options[field];
					if(typeof value == 'object'){
						value = JSON.stringify(value);
					}
					value = typeof value == 'string' ? value.substr(0,1000000) : value;
					// try to set the field by the key
					api.setValue({fieldId: 'custrecord_api_'+field, value: value});
				} catch(err){
					log.error('API LOG ERROR: '+err.name, err.message);
				}
			}
			var apiId = api.save({enableSourcing: false,ignoreMandatoryFields: false});
			if(this.debug) log.debug('API LOG record created','customrecord_api_log:'+apiId);
			
			this.currentLogId = apiId;
			
			return {"success":true, "id":apiId};
		} catch(e){
			log.error('API LOG addLog ERROR - '+e.name,e.message);
			return {"error":{"name":e.name,"message":e.message}};
		}
	}
	/*
	 * Set existing log record field values
	 */
	this.setLog = this.setValue = function(options){
		// requires and instance of this log already be created or the id is sent in with the options
		var apiId = this.currentLogId ? this.currentLogId : options.id;
		if(!apiId){
			log.error('API LOG setLog ERROR - NO_ID','No API Log Id. Cannot set values.');
			return {"error":{"name":'NO_ID',"message":'No API Log Id. Cannot set values.'}};
		}

		if(options.fieldId && options.value){
			// support NetSuite setValue formatting
			options[options.fieldId] = options.value;
			delete options.fieldId;
			delete options.value;
		}
		
		var errors = [];
		for(var field in options){
			if(field=='id') continue;
			var values = {};
			var value = options[field];
			if(this.debug) log.debug('API LOG - '+field,value);
			if(typeof value == 'object'){
				if(field=='transaction' || field=='entity' || field=='item'){
					value = value.value; // get the id from the select object passed in
					if(this.debug) log.debug('API LOG get value - '+field,value);
				} else {
					value = JSON.stringify(value);
					if(this.debug) log.debug('API LOG stringify - '+field,value);
				}
			}
			try{value = String(value);} catch(strerror) {if(this.debug) log.debug('API LOG string - '+field,'counld not convert to string');};
			value = typeof value == 'string' ? value.substr(0,1000000) : value;
			values['custrecord_api_'+field] = value;
			// this takes longer to execute but will fill in fields that are successful
			// if some fields are not working, check the role used to set them
			try{
				var id = record.submitFields({
				    type: 'customrecord_api_log',
				    id: apiId,
				    values: values,
				    options: {
				        enableSourcing: false,
				        ignoreMandatoryFields : true
				    }
				});
			} catch(err){
				log.error('API LOG addLog ERROR - '+err.name,err.message);
				errors.push( {"error":{"name":err.name,"message":err.message}} );
			}
		}
		
		if(errors.length==0){
			return {"success":true, "id":id};
		}
		try{
			var id = record.submitFields({
			    type: 'customrecord_api_log',
			    id: apiId,
			    values: {
			    	custrecord_api_error: JSON.stringify(errors)
			    },
			    options: {
			        enableSourcing: false,
			        ignoreMandatoryFields : true
			    }
			});
		} catch(e){
			log.error(e.name,e.message);
		}
		return {"success":false, "errors":errors};
	}
	
	if(options){
		this.addLog(options);
	}
}

function post(options){
	try {
		options.method = "POST";
		var response,apiLog;
		// what module should we use?
		var protocal = http;
		if(options.url.indexOf('https')==0) protocal = https;
		
		if(options.params && !options.body){
			options.body = options.params;
		}
		if(options.parameters && !options.body){
			options.body = options.parameters;
		}
		if(typeof options.body == 'object'){
			options.body = JSON.stringify(options.body);
			if(this.debug) log.debug('API LOG POST stringify body',options.body);
		}
		
		// create the log record
		var apiLog = new APILog(options);
		
		// send the request to the URL
		var response = protocal.post(options);
		// log the response to the request
		var resBody = response.body;
		try{resBody = JSON.parse(response.body);} catch(bdyerr){if(this.debug) log.debug('API LOG','Response is not JSON');}
		apiLog.setLog({
			"response": resBody,
			"type": response.type,
			"code": response.code,
			"response_headers": response.headers 
		}); 
		// check for error codes
		if(response.code!=200){
			var errObj = error.create({
				name: 'RESPONSE_CODE_'+response.code, 
				message : response.body, 
				notifyOff: true
				});                 
            log.error(errObj.name , errObj.message);  
            throw errObj;  
		}
		
		// return the log ID with the response so further log editing can be done
		return {"response":response,"apilog":apiLog};
		
	} catch (e) {
		log.error('API LOG POST ERROR - '+e.name,e.message);
		return {"error":requestErrors(e,apiLog),"response":response,"apilog":apiLog};
	}
}

function put(options){
	try {
		options.method = "PUT";
		var response,apiLog;
		// what module should we use?
		var protocal = http;
		if(options.url.indexOf('https')==0) protocal = https;
		
		if(options.params && !options.body){
			options.body = options.params;
		}
		if(options.parameters && !options.body){
			options.body = options.parameters;
		}
		if(typeof options.body == 'object'){
			options.body = JSON.stringify(options.body);
			if(this.debug) log.debug('API LOG PUT stringify body',options.body);
		}
		
		// create the log record
		var apiLog = new APILog(options);
		
		// send the request to the URL
		var response = protocal.put(options);
		// log the response to the request
		var resBody = response.body;
		try{resBody = JSON.parse(response.body);} catch(bdyerr){if(this.debug) log.debug('API LOG','Response is not JSON');}
		apiLog.setLog({
			"response": resBody,
			"type": response.type,
			"code": response.code,
			"response_headers": response.headers 
		}); 
		// check for error codes
		if(response.code!=200){
			var errObj = error.create({
				name: 'RESPONSE_CODE_'+response.code, 
				message : response.body, 
				notifyOff: true
				});                 
            log.error(errObj.name , errObj.message);  
            throw errObj;  
		}
		
		
		// return the log ID with the response so further log editing can be done
		return {"response":response,"apilog":apiLog};
		
	} catch (e) {
		log.error('API LOG PUT ERROR - '+e.name,e.message);
		return {"error":requestErrors(e,apiLog),"response":response,"apilog":apiLog};
	}
}

function get(options){
	try {
		options.method = "GET";
		var response,apiLog;
		// what module should we use?
		var protocal = http;
		if(options.url.indexOf('https')==0) protocal = https;
		
		var apiLog = new APILog(options);
		
		var response = protocal.get(options);
		// log the response to the request
		var resBody = response.body;
		try{resBody = JSON.parse(response.body);} catch(bdyerr){if(this.debug) log.debug('API LOG','Response is not JSON');}
		apiLog.setLog({
			"response": resBody,
			"type": response.type,
			"code": response.code,
			"response_headers": response.headers 
		}); 
		// check for error codes
		if(response.code!=200){
			var errObj = error.create({
				name: 'RESPONSE_CODE_'+response.code, 
				message : response.body, 
				notifyOff: true
				});                 
            log.error(errObj.name , errObj.message);  
            throw errObj;  
		}
		
		// return the log ID with the response so further log editing can be done
		return {"response":response,"apilog":apiLog};
		
	} catch (e) {
		log.error('API LOG GET ERROR - '+e.name,e.message);
		return {"error":requestErrors(e,apiLog),"response":response,"apilog":apiLog};
	}
}

function requestErrors(e,apilog){
	var errordetails;
	var errorcode = e.name;
	if(errorcode.indexOf("RESPONSE_CODE_")==0) errorcode = "RESPONSE_CODE_";
	switch(errorcode) {
		case "SSS_REQUEST_TIME_EXCEEDED":
			errordetails = "Connection closed because it has exceed the time out period (NetSuite has not received a response after 5 seconds on initial connection or after 45 seconds on the request).";
			break;
		case "SSS_CONNECTION_TIME_OUT":
			errordetails = "Connection closed because it has exceed the time out period (NetSuite has not received a response after 5 seconds on initial connection or after 45 seconds on the request).";
			break;
		case "SSS_CONNECTION_CLOSED":
			errordetails = "Connection closed because it was unresponsive.";
			break;
		case "SSS_INVALID_URL":
			errordetails = "Connection closed because of an invalid URL.  The URL must be a fully qualified HTTP or HTTPS URL if it is referencing a non-NetSuite resource.  The URL cannot contain white space.";
			break;
		case "SSS_TIME_LIMIT_EXCEEDED":
			errordetails = "NetSuite Suitescript execution time limit of 180 seconds exceeded.";
			break;
		case "SSS_USAGE_LIMIT_EXCEEDED":
			errordetails = "NetSuite User Event Suitescript usage limit of 1000 units exceeded.";
			break;
		case "RESPONSE_CODE_":
			errorcode = error.name;
			errordetails = 'NetSuite received a non-200 response code.';
			break;
		default:
			// unexpected error
			errordetails = error.message;
	}
	var err = {name:errorcode,message:e.message,detail:errordetails};
	if(apilog) apilog.setLog({
		request_error: err
	});
	return err;
}

return {
	APILog: APILog,
	post: post,
	get: get,
	put: put
}
});