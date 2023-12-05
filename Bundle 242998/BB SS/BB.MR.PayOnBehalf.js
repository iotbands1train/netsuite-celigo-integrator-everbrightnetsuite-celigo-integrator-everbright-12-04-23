/**
 * @author Mike Jarvis
 * @date 20221110
 * @description Creates vendor payments sent from Pay On Behalf Suitelet
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
 define(['N/file', 'N/record', 'N/runtime'],
 /**
* @param{file} file
* @param{record} record
* @param{runtime} runtime
*/
 (file, record, runtime) => {

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
      * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
      * @param {Object} inputContext
      * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
      *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
      * @param {Object} inputContext.ObjectRef - Object that references the input data
      * @typedef {Object} ObjectRef
      * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
      * @property {string} ObjectRef.type - Type of the record instance that contains the input data
      * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
      * @since 2015.2
      */
        /** Incoming parameters:
            custscript_bb_ije_id
            custscript_bb_je_id
            custscript_bb_paying_sub_id
            custscript_bb_paying_bank_acct_id
            custscript_bb_pri_sub_data
            custscript_bb_sec_sub_data
        */

     const getInputData = (inputContext) => {
        const func = "getInputData";
        let data = {};
        let iJeId, jeId, bankSub, bankAccount; 
        let el;
        let pri_ven_data = {}; let ven_data = {};

        iJeId = runtime.getCurrentScript().getParameter({name: "custscript_bb_ije_id"});
        jeId = runtime.getCurrentScript().getParameter({name: "custscript_bb_je_id"});
        bankSub = runtime.getCurrentScript().getParameter({name: "custscript_bb_paying_sub_id"});
        bankAccount = runtime.getCurrentScript().getParameter({name: "custscript_bb_paying_bank_acct_id"});

       try {
        log.debug(func, "Start: " + JSON.stringify({iJeId: iJeId, jeId: jeId, bankSub: bankSub, bankAccount: bankAccount}));

        if(!isNullOrEmpty(iJeId)){
            ven_data = JSON.parse(runtime.getCurrentScript().getParameter({name: "custscript_bb_sec_sub_data"}));
            log.debug(func, "keys: " + JSON.stringify(Object.keys(ven_data)));
            for(el in ven_data){
                ven_data[el]["bankSub"] = bankSub;
                ven_data[el]["iJeId"] = iJeId;
                ven_data[el]["jeId"] = jeId;
                data[el] = ven_data[el];
            };
        };

        if(!isNullOrEmpty(jeId)){
            pri_ven_data = JSON.parse(runtime.getCurrentScript().getParameter({name: "custscript_bb_pri_sub_data"}));
            log.debug(func, "keys: " + JSON.stringify(Object.keys(pri_ven_data)));
            for(el in pri_ven_data){
                pri_ven_data[el]["bankSub"] = bankSub;
                pri_ven_data[el]["iJeId"] = iJeId;
                pri_ven_data[el]["jeId"] = jeId;
                data[el] = pri_ven_data[el];
            };
        };

        log.debug(func, "Returning: " + JSON.stringify(data));
        return data;

       } catch(e) {
        log.debug(e.name, JSON.stringify(e));
       };
     };

     /**
      * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
      * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
      * context.
      * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
      *     is provided automatically based on the results of the getInputData stage.
      * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
      *     function on the current key-value pair
      * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
      *     pair
      * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
      *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
      * @param {string} mapContext.key - Key to be processed during the map stage
      * @param {string} mapContext.value - Value to be processed during the map stage
      * @since 2015.2
      */

     const map = (mapContext) => {
        let func = "map";
        let key = mapContext.key;
        let obj = JSON.parse(mapContext.value);
        let subsidiary_value = obj.subsidiary_value;
        let vendor_value = obj.vendor_value;
        let account_value = obj.account_value;
        let clear_acct = obj.clear_acct;
        let to_acct = obj.to_acct;
        let from_acct = obj.from_acct;
        let total = obj.total;
        let bankSub = obj.bankSub;
        let iJeId = obj.iJeId;
        let jeId = obj.jeId;
        let lines = obj.lines;
        let jeIdToUse, vbPmt, lineNo, vbPmtId, jeType, jeRec, numLines, lVen, lClr, x;
        let retLineVal = -1; 
        // gather the internal ids of the bills to pay/ credit memos to apply
        let tranIds = lines.reduce(function (pv, cv, i) {
            if(i === 0) { pv[i] = cv.internal_id } 
            else { pv.push(cv.internal_id); };
            return pv;
        }, []);
        jeIdToUse = (subsidiary_value === bankSub) ? jeId : iJeId;
        jeType = (subsidiary_value === bankSub) ? "journalentry" : "advintercompanyjournalentry";
        // log.debug(func, JSON.stringify({key: key, obj: obj}));
        log.debug(func, JSON.stringify({key: key}));
        log.debug(func, JSON.stringify({
            subsidiary_value: subsidiary_value,
            vendor_value: vendor_value,
            account_value: account_value,
            clear_acct: clear_acct,
            to_acct: to_acct,
            from_acct: from_acct,
            total: total,
            bankSub: bankSub,
            iJeId: iJeId,
            jeId: jeId, 
            jeIdToUse: jeIdToUse
        }));
        log.debug(func, "lines.length: " + lines.length);
        log.debug(func, JSON.stringify({tranIds: tranIds}));
        vbPmt = record.create({ type: record.Type.VENDOR_PAYMENT, isDynamic: true, defaultValues: { entity: vendor_value } });
        vbPmt.setValue({fieldId: "subsidiary", value: subsidiary_value });
        vbPmt.setValue({fieldId: "account", value: clear_acct });
        vbPmt.setValue({fieldId: "apacct", value: account_value });
        vbPmt.setValue({fieldId: "custbody_bb_pob_trans", value: jeIdToUse });
        tranIds.forEach((el) => {
            lineNo = vbPmt.findSublistLineWithValue({ sublistId: "apply", fieldId: "internalid", value: el });
            if(lineNo > -1) {
                log.debug(func, "Setting lineNo: " + lineNo + ", for el: " + el);
                vbPmt.selectLine({ sublistId: "apply", line: lineNo });
                vbPmt.setCurrentSublistValue({ sublistId: "apply", fieldId: "apply", value: true, ignoreFieldChange: false });
            } else {
                throw "internal id: " + el + " not found!";
            }
        });
       
        
        
        vbPmtId = vbPmt.save({});
        log.debug(func, "Vendor Bill Payment Id: " + vbPmtId);

        // Load the Journal Entry (jeIdToUse) 
        // Find the sublist line with  clear_acct and vendor_value combination
        // Set that line to the vbPmtId - internal id "custcol_bb_pob_trans"
        // Save the jeRec
        jeRec = record.load({ type: jeType, id: jeIdToUse, isDynamic: true });
        numLines = jeRec.getLineCount({ sublistId: "line" });
        for(x = 0; x < numLines; x += 1) {
            lVen = jeRec.getSublistValue({ sublistId: "line", fieldId: "entity", line: x});
            lClr = jeRec.getSublistValue({ sublistId: "line", fieldId: "account", line: x});
            if(lVen === vendor_value && lClr === clear_acct) {
                retLineVal = x;
                break;
            };
        };
        log.debug(func, "retLineVal: " + retLineVal);

        if(retLineVal > -1){
            jeRec.selectLine({ sublistId: "line", line: retLineVal });
            jeRec.setCurrentSublistValue({ sublistId: "line", fieldId: "custcol_bb_pob_trans", value: vbPmtId, ignoreFieldChange: false });
            jeRec.commitLine({ sublistId: "line" });  
            log.debug(func, "In if on retLineVal, setting: " + JSON.stringify({retLineVal: retLineVal, vbPmtId: vbPmtId}));
        };
        jeIdToUse = jeRec.save({});

        log.debug(func, "End, saved jeIdToUse: " + jeIdToUse);
        
        log.debug(func, "End");


        mapContext.write(vbPmtId, obj);
     };

     /**
      * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
      * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
      * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
      *     provided automatically based on the results of the map stage.
      * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
      *     reduce function on the current group
      * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
      * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
      *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
      * @param {string} reduceContext.key - Key to be processed during the reduce stage
      * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
      *     for processing
      * @since 2015.2
      */
     const reduce = (reduceContext) => {

     }


     /**
      * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
      * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
      * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
      * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
      *     script
      * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
      * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
      *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
      * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
      * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
      * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
      *     script
      * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
      * @param {Object} summaryContext.inputSummary - Statistics about the input stage
      * @param {Object} summaryContext.mapSummary - Statistics about the map stage
      * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
      * @since 2015.2
      */
     const summarize = (summary) => {
        log.debug("summarize State - summary:", summary);
        let mapResults = [];
        let reduceErrMsg = [];
        let mapErrMsg = [];

        try {
            summary.output.iterator().each(function (key, value) {
                // do something with each key here.
                return true;
            });
            log.debug('summarize', 'Start summarize.');
            summary.mapSummary.keys.iterator().each(function (key) {
                mapResults.push(key);
                return true;
            });

            summary.reduceSummary.keys.iterator().each(function (key) {
                return true;
            });

            summary.mapSummary.errors.iterator().each(function (key, value) {
                var msg = 'Error id: ' + key + '; ' + JSON.parse(value).message;
                mapErrMsg.push(msg);
                return true;
            });

            summary.reduceSummary.errors.iterator().each(function (key, value) {
                var msg = 'Error id: ' + key + '; ' + JSON.parse(value).message;
                reduceErrMsg.push(msg);
                return true;
            });

            log.audit("mapResults", "Vendor Bill Payment Ids: " + JSON.stringify(mapResults));
            log.audit('reduceSummary', 'Errors: ' + JSON.stringify(reduceErrMsg));
            log.audit('mapSummary', 'Errors: ' + JSON.stringify(mapErrMsg));
            log.audit('Summarize - End Script', 'End Script');

        } catch (ex) {
            log.error(ex.name, JSON.stringify(ex));
        }
     };

     return {getInputData, map, reduce, summarize}

 });
