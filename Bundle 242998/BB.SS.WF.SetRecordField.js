/**
 * Set a record field from a workflow
 * 
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope Public
 * 
 * @copyright 2019 Blu Banyan
 * @author David Smith
 */
define(['N/runtime','N/record',],
	function(runtime, record) {

    /**
     * Entry point for the Workflow Action
     * 
     * @governance XXX
     * 
     * @param scriptContext
     *        {Object}
     * @param scriptContext.newRecord
     *        {Record} New record
     * @param scriptContext.oldRecord
     *        {Record} Old record
     * 
     * @return {*} Any value can be returned and utilized in workflow
     * 
     * @since 2016.1
     * 
     * @static
     * @function onAction
     */
    function onAction(scriptContext) {
    	try{
	    	/************** script parameters **************/
	    	var scriptObj = runtime.getCurrentScript();
			var fieldId = scriptObj.getParameter({name:"custscript_bbss_fld_id"});
			var fieldValue = scriptObj.getParameter({name:"custscript_bbss_fld_value"});
			var fieldText = scriptObj.getParameter({name:"custscript_bbss_fld_text"});
			var recordType = scriptObj.getParameter({name:"custscript_bbss_rec_type"});
			var recordId = scriptObj.getParameter({name:"custscript_bbss_rec_id"});
			var parseArray = scriptObj.getParameter({name:"custscript_bbss_parse_as_array"});
			/************** end script parameters **************/

			// get the record type and id
			log.debug('params',{recordType:recordType,recordId:recordId,fieldId:fieldId,fieldValue:fieldValue});
			if(!fieldId || !recordId || !recordType){
	    		//exit
	    		log.error('MISSING PARAM','All parameters are required');
	    		return 'MISSING PARAMETER';
	    	}

			if(!fieldText) {
				var values = {};
				if (parseArray) fieldValue = JSON.parse("[" + fieldValue + "]");
				values[fieldId] = fieldValue;
				var id = record.submitFields({
					type: recordType,
					id: recordId,
					values: values,
					options: {
						enableSourcing: false,
						ignoreMandatoryFields: true
					}
				});
				log.debug(recordType+':'+id,values);
			} else {
				var id = record.load({
					type: recordType,
					id: recordId,
					isDynamic: true
				}).setText({
					fieldId:fieldId,
					text:fieldText
				}).save({
					enableSourcing:false,
					ignoreMandatoryFields:true,
					disableTriggers:true
				});
				log.debug(recordType+':'+id,{fieldId:fieldId,fieldText:fieldText});
			}

			return 'success';
	    	
    	} catch(e){
    		log.error(e.name,e.message);
    		return 'failed with error';
    	}
    }

    return {onAction:onAction};
});
