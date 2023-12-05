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
define([ 'N/search', './BB.MD.AutoComplete' ], function(search, autoComplete) {
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
        if (scriptContext.mode !== 'edit') {
            return;
        }

        var mainCss = 'https://tstdrv1910037.app.netsuite.com/core/media/media.nl?id=50177&c=TSTDRV1910037&h=83ac64e5609bf83e3b92&_xt=.css';
        var autoCompleteCss = 'https://tstdrv1910037.app.netsuite.com/core/media/media.nl?id=49364&c=TSTDRV1910037&h=ade077629e29070f4fe8&mv=k36cc0kw&_xt=.css&fcts=20191119125902&whence=';
        var field = 'custbody_gmf_sales_order_num'; // manually set currently, but this will be specified
        var source = 'https://tstdrv1910037.app.netsuite.com/app/site/hosting/restlet.nl?script=738&deploy=1&query=fl'; // currently hard coded

        autoComplete.loadCSS(autoCompleteCss);
        autoComplete.loadCSS(mainCss);
        autoComplete.configureAutocompleteLibrary(scriptContext.currentRecord, {
            dataSource: source,
            fieldId: 'memo',
            fieldHtmlId: 'memo', // this can be diff than our fieldId in NS
        });


    }


    exports.pageInit = pageInit;
    return exports;
});
