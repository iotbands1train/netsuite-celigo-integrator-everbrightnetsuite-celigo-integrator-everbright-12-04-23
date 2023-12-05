/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

define(['N/runtime'],
function(runtime) {
	const UUID_FIELD = runtime.getCurrentScript().getParameter({name:"custscript_uuid_field_id"});
    function beforeLoad(scriptContext) {
    	if(scriptContext.type!='create') return;
		scriptContext.newRecord.setValue({fieldId:UUID_FIELD,value:create_UUID()});
    }

    function beforeSubmit(scriptContext) {
		if(scriptContext.type != scriptContext.UserEventType.CREATE &&
			(scriptContext.newRecord.getFields().indexOf(UUID_FIELD)>=0 && !scriptContext.newRecord.getValue({fieldId:UUID_FIELD})))
		{
			// set the UUID for this record
			scriptContext.newRecord.setValue({fieldId:UUID_FIELD,value:create_UUID()});
		}
    }

	function create_UUID(){
		var dt = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (dt + Math.random()*16)%16 | 0;
			dt = Math.floor(dt/16);
			return (c=='x' ? r :(r&0x3|0x8)).toString(16);
		});
		return uuid;
	}

    return {
    	beforeLoad: 	beforeLoad,
    	beforeSubmit: 	beforeSubmit
    };
});
