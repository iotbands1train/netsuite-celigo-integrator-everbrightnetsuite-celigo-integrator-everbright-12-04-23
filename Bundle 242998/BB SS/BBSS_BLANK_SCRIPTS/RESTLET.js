/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope Public
 */
define([],function() {
    function doGet(requestParams) {}
    function doPut(payload) {}
    function doPost(requestBody) {}
    function doDelete(requestParams) {}
    return {
    	get: doGet,
        post: doPost,
        put: doPut,
        delete: doDelete
    };
});
