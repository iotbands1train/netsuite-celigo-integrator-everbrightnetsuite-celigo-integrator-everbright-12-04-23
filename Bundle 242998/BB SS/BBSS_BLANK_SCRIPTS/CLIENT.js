/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define([], function() {
    function pageInit(scriptContext) {}
    function fieldChanged(scriptContext) {}
    function postSourcing(scriptContext) {}
    function sublistChanged(scriptContext) {}
    function lineInit(scriptContext) {}
    function validateField(scriptContext) {}
    function validateLine(scriptContext) {}
    function validateInsert(scriptContext) {}
    function validateDelete(scriptContext) {}
    function saveRecord(scriptContext) {}
    return {
    	pageInit: pageInit
    	,fieldChanged: fieldChanged
    	,postSourcing: postSourcing
    	,sublistChanged: sublistChanged
    	,lineInit: lineInit
    	,validateField: validateField
    	,validateLine: validateLine
    	,validateInsert: validateInsert
    	,validateDelete: validateDelete
    	,saveRecord: saveRecord
    }
});
