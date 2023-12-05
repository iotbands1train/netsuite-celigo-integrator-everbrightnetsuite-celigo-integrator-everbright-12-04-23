/**
 * @author Mike Jarvis
 * @date 20220910
 * @description Client Script for Suitelet Refresh on Button Clicks
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define([
        'N/currentRecord',
        'N/url',
        'N/ui/dialog',
        'N/record',
        'N/runtime',
        'N/search'
    ],

    function (currentRecord, url, dialog, record, runtime, search) {

        // Global variables
        var LOC_MAP = {}; // location map { "internal id" : "Display Name"}
        var SCRIPT_ID =  "customscript_bb_sl_payonbehalf";
        var DEPLOYMENT_ID = "customdeploy_bb_sl_payonbehalf";

        /**
         * @description isNullOrEmpty: method that validates if a variable has null or empty value.
         * @param {*} _value [required];
         * @returns {boolean}. Return true if the variable is null or empty
         */
        function isNullOrEmpty(_value) {
            if (typeof _value === 'undefined' || _value === null) {
                return true;
            } else if (util.isString(_value)) {
                if (_value.trim() === '' || _value.length === 0) {
                    return true;
                }
            } else if (util.isArray(_value)) {
                if (_value.length === 0) {
                    return true;
                }
            } else if (util.isObject(_value)) {
                for (var key in _value) {
                    if (_value.hasOwnProperty(key)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };

        /**
         * Function adds the progress bar and sends request to suitelet to get the task status
         * 
         * @governance 0 Units
         * @param {String} taskId - Task id of the Map reduce script
         * @param {Object} context - Context object of the current request
         */
        function callMapReduceStatusCheck(taskId, context) {
            const func = "callMapReduceStatusCheck";
            console.log(func + ", Start: " + JSON.stringify({taskId: taskId}));

            /**
            if (!isNullOrEmpty(taskId)) {
                var txt1 = "<label for='file'>Pay On Behalf progress:</label>";
                var txt2 = "<progress id='file' value='' max='100'> 32% </progress>";
                jQuery('#body').append(txt1, txt2);
                intervalId = setInterval(function () { callSuitelet(taskId, context) }, 10000);
            };
            */
        };

        function pageInit(context) {
            var func = "pageInit";
            // Initialize global variables
            LOC_MAP = getActiveObject("location");
            var taskId = context.currentRecord.getValue({ fieldId: "custpage_taskid" });
            if (!isNullOrEmpty(taskId)) {
                console.log("pageInit: Got taskId: " + taskId);
                callMapReduceStatusCheck(taskId, context);
            }
        };

        function fieldChanged(context) {
            var func = "fieldChange";
            var currentRec = context.currentRecord;
            var fieldName = context.fieldId;
            var selectAll, tmpObj;
            if (fieldName === "custpage_selectall") {
                selectAll = currentRec.getValue({ fieldId: "custpage_selectall"});
                console.log(func + ", " + JSON.stringify({ selectAll: selectAll, fieldName: fieldName}));
                if(selectAll) {
                    // tmpObj = BB.getActiveObject("location");
                    currentRec.setValue({ fieldId: "custpage_location", value: Object.keys(LOC_MAP)});
                } else {
                    currentRec.setValue({ fieldId: "custpage_location", value: [""]});
                }
            }
        };

        /**
         * @description Takes date string "Mon Jul 04 2022 00:00:00 GMT-0600 (Mountain Daylight Time)"
         * and converts it to "7/4/2022"
         * @returns The converted string */
        function convertDateString(dString) {
            var func = "convertDateString";
            var d1, nds;
            try{
                console.log(func + ", Start: dString " + dString);
                d1 = new Date(dString);
                nds = d1.getMonth() + 1 + "/" + d1.getDate() + "/" + d1.getFullYear();
                console.log(func + ", returning: " + nds);
                return nds;

            } catch(e) {
                console.log(e.name + ", " + JSON.stringify(e));
            }
        };

        /**
         * @description Gets the search parameters off the suitelet and re-launches the suitelet
         * with the search parameters.
         * @returns Same suitelet relaunched with new parameters */

        function runWithFilters() {
            var func = "runWithFilters";
            var currentRec = currentRecord.get();
            var sltUrl;
            var params = {};

            var bankaccount = currentRec.getValue({ fieldId: "custpage_bankaccount"});
            var subsidiary = currentRec.getValue({ fieldId: "custpage_subsidiaries"});
            subsidiary = (!isNullOrEmpty(subsidiary)) ? subsidiary.join(",") : subsidiary;
            var apaccount = currentRec.getValue({ fieldId: "custpage_apaccounts"});
            var vendor = currentRec.getValue({ fieldId: "custpage_vendor"});
            var afterdate = currentRec.getValue({ fieldId: "custpage_start_date"});
            afterdate = (!isNullOrEmpty(afterdate)) ? convertDateString(afterdate) : afterdate;
            var beforedate = currentRec.getValue({ fieldId: "custpage_end_date"});
            beforedate = (!isNullOrEmpty(beforedate)) ? convertDateString(beforedate) : beforedate;

            console.log(func + ", Starting:  " + JSON.stringify({
                bankaccount: bankaccount,
                subsidiary: subsidiary,
                apaccount: apaccount,
                vendor: vendor,
                afterdate: afterdate,
                beforedate: beforedate
            }));

            params.custparam_bankaccount = bankaccount;
            params.custparam_subsidiary = subsidiary;
            params.custparam_apaccount = apaccount;
            params.custparam_vendor = vendor;
            params.custparam_afterdate = afterdate;
            params.custparam_beforedate = beforedate;
            params.custparam_show_data = true;
            sltUrl = url.resolveScript({
                scriptId: SCRIPT_ID,
                deploymentId: DEPLOYMENT_ID,
                params: params
            });
            console.log(func + ", Relaunching:  " + JSON.stringify({params: params, sltUrl: sltUrl}));
            window.onbeforeunload = null;
            window.open(sltUrl, '_self');
        };

        
        function resetPage() {
            var sletURL = url.resolveScript({
                scriptId: 'customscript_bb_sl_payonbehalf',
                deploymentId: 'customdeploy_bb_sl_payonbehalf',
            });
            window.open(sletURL, '_self');
        };


        /**
         * @description Get a NS List as an object.
         * @param {string} _listId; The List Id. Example: 'customlist_status'.
         * @returns {Object};
         */
        function getActiveObject(_listId) {
            var list = {};

            if (!isNullOrEmpty(_listId)) {
                searchForEachResult(
                    search.create({
                        type: _listId,
                        filters: [["isinactive", "is", false]],
                        columns: [{ name: 'name' }, { name: 'internalid' }]
                    }),
                    
                    function(result) {
                        list[result.id] = result.getValue({name: "name"});
                });
            }
            return list;
        };
        /**
         * Performs callback function on each result from all results of a search
         * @param {mySearch} - a netSuite search
         * @param {callback} - function to be run on each element of the callback
         * @returns {}  - 
         * @since 2015.2
         */
        function searchForEachResult(mySearch, callback) {
            var pageData, page;
            pageData = mySearch.runPaged({ pageSize: 1000 });
            pageData.pageRanges.forEach(function (pageRange) {
                // log.debug("searchForEachResult batch: " + pageRange.index);
                page = pageData.fetch({
                    index: pageRange.index
                });
                page.data.forEach(function (result) {
                    callback(result);
                });
            });
            log.debug("searchForEachResult complete ");
        };

        /**
         * Updates the total dollar amount and number of records selected.
         * @returns {}  - 
         * @since 2015.2
         */
        function calculateTotal() {
            var func = "calculateTotal";
            var rec = currentRecord.get();
            var x, selected, tmp;
            var ctr = 0;
            var total = 0;
            var orig = 0;
            var count = rec.getLineCount({ sublistId: "custpage_transactions" });
            try {
                console.log(func + ", " + JSON.stringify({count: count, ctr: ctr}));
                for (x = 0; x < count; x += 1) {
                    selected = rec.getSublistValue({ sublistId: "custpage_transactions", fieldId: "custpage_checkbox", line: x });
                    if (selected) {
                        orig = rec.getSublistValue({ sublistId: "custpage_transactions", fieldId: "custpage_amount", line: x });
                        tmp = rec.getSublistValue({ sublistId: "custpage_transactions", fieldId: "custpage_amount_remaining", line: x });
                        total += (orig < 0) ? tmp * -1 : tmp; 
                        ctr += 1;
                    };
                };
                total = (Math.round(total * 100) / 100).toFixed(2);
                console.log(func + ", " + JSON.stringify({total: total, ctr: ctr}));
                rec.setValue({ fieldId: "custpage_total", value: total, ignoreFieldChange: true });
                rec.setValue({ fieldId: "custpage_selected", value: ctr, ignoreFieldChange: true });

            } catch(e) {

            }
        };

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            runWithFilters: runWithFilters,
            resetPage: resetPage,
            calculateTotal: calculateTotal,
            callMapReduceStatusCheck: callMapReduceStatusCheck
        };
    });