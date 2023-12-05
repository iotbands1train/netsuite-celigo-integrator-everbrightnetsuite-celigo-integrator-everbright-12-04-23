'use strict';
/**
 * autoComplete.js client script
 * 
 * 
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope public
 * 
 * @copyright 2019
 * @author Richard Tuttle
 */

/**
 * Copyright 2019 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */
define([ 'N/search', 'N/url', './GMF.MD.AutoComplete' ], function(search, url, bbAutoComplete) {
    var exports = {};

    /**
     * Function to be executed after page is initialized.
     * 
     * @governance 
     * 
     * @param scriptContext
     *        {Object}
     * @param scriptContext.currentRecord
     *        {Record} Current form record
     * @param scriptContext.mode
     *        {String} The mode in which the record is being accessed (create,
     *        copy, or edit)
     * 
     * @return {void}
     * 
     * @since 2015.2
     * 
     * @static
     * @function pageInit
     */
    function pageInit(scriptContext) {
        if (scriptContext.mode !== 'edit' && scriptContext.mode !== 'create') {
            return;
        }
        var source = url.resolveScript({
            scriptId: 'customscript_autocomplete_search',
            deploymentId: 'customdeploy_autocomplete_search',
            returnExternalUrl: false
        });
        search.create({
            type: "file",
            filters:[["folder","anyof","61344"],"AND",["filetype","anyof","STYLESHEET"]],
            columns:["url"]
        }).run().each(function(result){
            var cssUrl = result.getValue({name:'url'});
            //console.log('CSS URL',cssUrl);
            bbAutoComplete.loadCSS(cssUrl);
            return true;
        });

        var field = 'custbody_gmf_back_charge_search'; // manually set currently, but this will be specified
        var destinationField = 'custbody_backcharge_salesorder';

        bbAutoComplete.configureAutocompleteLibrary(scriptContext.currentRecord, {
            dataSource: source,
            fieldId: field,
            fieldHtmlId: field, // this can be diff than our fieldId in NS
            destinationField: destinationField
        });


    }


    exports.pageInit = pageInit;
    return exports;
});
