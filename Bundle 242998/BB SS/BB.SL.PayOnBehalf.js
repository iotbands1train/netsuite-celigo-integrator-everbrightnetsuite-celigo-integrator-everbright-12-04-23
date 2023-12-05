/**
 * @author Mike Jarvis
 * @date 20220914
 * @description Allows one subsidiary to pay other subsidiaries' vendor bills
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/redirect', 'N/util', 'N/ui/serverWidget', 'N/log', 'N/search', 'N/runtime', 'N/task', 'N/url'],
    function(record, redirect, util, serverWidget, log, search, runtime, task, url) {

        let BB = {
            Vars: {}
        };

        /**
         * @description populates global variable BB with various maps
         * a map for the sub due to account, sub due from account, and sub clearing account
         */
        function populateGlobal() {
            const func = "populateGlobal";
            log.debug(func, "Start");
            let acctSearch = search.create({
                type: "account",
                filters: [ ["type","anyof","Bank"] ],
                columns:
                [
                search.createColumn({ name: "name", sort: search.Sort.ASC, label: "Name" }),
                search.createColumn({name: "displayname", label: "Display Name"}),
                search.createColumn({name: "subsidiary", label: "Subsidiary"})
                ]
            });
            let subSearch = search.create({
                type: "subsidiary",
                filters: [ ],
                columns:
                [ search.createColumn({ name: "name", sort: search.Sort.ASC, label: "Name" }),
                   search.createColumn({name: "custrecord_bb_clear_acct", label: "Clearing Account"}),
                   search.createColumn({name: "custrecord_bb_from_acct", label: "Due From Account"}),
                   search.createColumn({name: "custrecord_bb_to_acct", label: "Due To Account"}) ]
             });
            let vendSearch = search.create({
                type: "vendor",
                filters: [ ["isinactive","is","F"], "AND", ["balance","greaterthan","0.00"]],
                columns: [ search.createColumn({ name: "entityid", sort: search.Sort.ASC, label: "Name" }) ]
            });
            try{
                BB.Vars.BankMap = {};
                BB.Vars.SubClearMap = {};
                BB.Vars.SubToMap = {};
                BB.Vars.SubFromMap = {};
                BB.Vars.SubNameMap = {};
                BB.Vars.VendNameMap = {};
                searchForEachResult( acctSearch, function(result) { BB.Vars.BankMap[result.id] = result.getValue({name: "subsidiary"}); });
                searchForEachResult( subSearch, function(result) {  BB.Vars.SubClearMap[result.id] = result.getValue({name: "custrecord_bb_clear_acct"});
                                                                    BB.Vars.SubToMap[result.id] = result.getValue({name: "custrecord_bb_to_acct"});
                                                                    BB.Vars.SubFromMap[result.id] = result.getValue({name: "custrecord_bb_from_acct"});
                                                                    BB.Vars.SubNameMap[result.id] = result.getValue({name: "name"}); }); 
                searchForEachResult( vendSearch, function(result) { BB.Vars.VendNameMap[result.id] = result.getValue({name: "entityid"}); }); 
                log.debug(func, "End: " + JSON.stringify({
                    bankmap: BB.Vars.BankMap,
                    sub_clear_map: BB.Vars.SubClearMap,
                    sub_to_map: BB.Vars.SubToMap,
                    sub_from_map: BB.Vars.SubFromMap,
                    sub_name_map: BB.Vars.SubNameMap, 
                    vend_name_map: BB.Vars.VendNameMap
                }));

            } catch(e) {
                log.error(e.name, JSON.stringify(e));
            };
        };


        function onRequest(context) {
            let func = "onRequest";
            let clientPath = "./BB.CS.PayOnBehalf.js";
            BB.Vars.Form = serverWidget.createForm({ title: "Pay on Behalf" , hideNavBar: false });
            BB.Vars.Form.clientScriptModulePath = clientPath;
            BB.Vars.ScriptId = "customscript_bb_sl_payonbehalf";
            BB.Vars.DeploymentId = "customdeploy_bb_sl_payonbehalf";
            let request = context.request;
            log.debug("request parameters", request.parameters);
            log.debug("request body", request.body);

            switch (context.request.method) {
                case "GET":
                    if(request.parameters.custparam_showerror) {
                        // Build error page
                        populateGlobal();
                        build_Error(request);
                    } else {
                        buildUI_Phase1(request);
                    }
                    break;

                case "POST":
                    populateGlobal();
                    processTransactions(request);
                    break;

                default:
                    break;

            };
            context.response.writePage(BB.Vars.Form);
        };

        /**
         * @description creates the User Interface for Phase I:
         * @param {Object} request; the request object
         */
        function processTransactions(request) {
            const func = "processTransactions";
            let tmpField, t2, t3;
            let dataObj = [];
            let ven_data = {};
            let sub_data = {};
            let pri_ven_data = {};
            let pri_sub_data = {};
            let jeId, iJeId;
            let negBillPay = [];
            let mr_params = {};
            let mrTask, mrTaskId, mrStatus;
            const subDelim = /\u0005/;
            const memo = "Created Pay on Behalf of Suitelet";
            const bankAccount = request.parameters.custpage_bankaccount;
            let bankSub = BB.Vars.BankMap[bankAccount];
            const subsidiary = request.parameters.custpage_subsidiaries.split(subDelim);
            const apaccount = request.parameters.custpage_apaccounts;
            const vendor = request.parameters.custpage_vendor;
            const afterdate = request.parameters.custpage_start_date;
            const beforedate = request.parameters.custpage_end_date;
            const MR_SCRIPT_ID = "customscript_bb_mr_payonbehalf";
            const MR_DEPLOYMENT_ID = "customdeploy_bb_mr_payonbehalf";
            let getPrimary = false;

            try {
                // Add Reset Button
                BB.Vars.Form.addButton({ id: "custpage_resetbutton", label: "Reset", functionName: "resetPage()" });

                tmpField = BB.Vars.Form.addField({ id : "custpage_status", type : serverWidget.FieldType.INLINEHTML, label : "Status" })
                                .defaultValue = "<p style='font-size:14px'>Creating InterCompany Journal Entry and processing bill payments.</p>";
                t2 = BB.Vars.Form.addField({ id : "custpage_request", type : serverWidget.FieldType.INLINEHTML, label : "Request" })
                                .defaultValue = "<p style='font-size:12px'>Request.parameters: " + JSON.stringify({
                                    bankAccount: bankAccount, subsidiary: subsidiary, apaccount: apaccount, 
                                    vendor: vendor, afterdate: afterdate, beforedate: beforedate
                                }) + "</p>";

                dataObj = getMainData(request);
                getPrimary = false;
                ven_data = getHelperObj(dataObj, ["subsidiary_value", "vendor_value", "account_value"], bankSub, getPrimary);
                // check negative bill pay amounts
                checkNegBillPay(ven_data, negBillPay);
                sub_data = getHelperObj(dataObj, ["subsidiary_value"], bankSub, getPrimary);

                getPrimary = true;
                pri_ven_data = getHelperObj(dataObj, ["subsidiary_value", "vendor_value", "account_value"], bankSub, getPrimary);
                // check negative bill pay amounts
                checkNegBillPay(pri_ven_data, negBillPay);
                pri_sub_data = getHelperObj(dataObj, ["subsidiary_value"], bankSub, getPrimary);

                if(isNullOrEmpty(negBillPay) && !isNullOrEmpty(pri_ven_data)){
                    jeId = createRegularJE(request, pri_ven_data, pri_sub_data);
                };
                if(isNullOrEmpty(negBillPay) && !isNullOrEmpty(ven_data)){
                    iJeId = createInterCompanyJE(request, ven_data, sub_data);
                };

                // Build Journal Entries; Call the map reduce; build the parameters
                if(isNullOrEmpty(negBillPay) && (!isNullOrEmpty(iJeId) || !isNullOrEmpty(jeId))) {

                    mr_params.custscript_bb_ije_id = iJeId;
                    mr_params.custscript_bb_je_id = jeId;
                    mr_params.custscript_bb_paying_sub_id = bankSub;
                    mr_params.custscript_bb_paying_bank_acct_id = bankAccount; 
                    mr_params.custscript_bb_pri_sub_data = pri_ven_data;
                    mr_params.custscript_bb_sec_sub_data = ven_data;

                    log.debug(func, JSON.stringify({mr_params: mr_params}));
                    // Launch map reduce

                    mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: MR_SCRIPT_ID,
                        deploymentId: MR_DEPLOYMENT_ID,
                        params: mr_params
                    });
                    mrTaskId = mrTask.submit();
                    mrStatus = task.checkStatus(mrTaskId);
                    log.debug(func, JSON.stringify({mrTaskId: mrTaskId, mrStatus: mrStatus}));

                    //if (mrTaskId) then redirect to progressbar suitelet
                    // setting "custpage_taskid" triggers pageInit on BB.CS.PayOnBehalf.js
                    if(!isNullOrEmpty(mrTaskId)){

                        redirect.toSuitelet({
                            scriptId: "customscript_get_mr_ss_progress_status",
                            deploymentId: "customdeploy_get_mr_ss_progress_status",
                            parameters: {
                                taskId: mrTaskId,
                                scriptId: MR_SCRIPT_ID,
                                deploymentId: MR_DEPLOYMENT_ID,
                                show: true,
                                rje: jeId,
                                ije: iJeId
                            }
                        });
                    }; 

                } else {

                    // if negative bill pay amount, call the suitelet with errors
                    redirect.toSuitelet({
                        scriptId: BB.Vars.ScriptId,
                        deploymentId: BB.Vars.DeploymentId,
                        parameters: {
                            custparam_showerror: true,
                            custparam_negbillpay: negBillPay.join() 
                        }
                    });
                    log.debug(func, JSON.stringify({ven_data: ven_data}));
                    log.debug(func, JSON.stringify({pri_ven_data: pri_ven_data}));
                    log.debug(func, "No journal entries were built, ending.");
                };
                    //    ven_data: ven_data, sub_data: sub_data, pri_ven_data: pri_ven_data, pri_sub_data: pri_sub_data }) + "</p>";
                    // mrTaskId: mrTaskId, mrStatus: mrStatus }) + "</p>";

                log.debug(func, "End");

            } catch(e) {
                log.error(e.name, JSON.stringify(e));
            }
        };

        /**
         * @description checks an object for negative totals indicating that credit memos exceed vendor bills and errors will result
         * @param {Object} checkObj; the vendor data object to check for negative totals. Object should look like:
         * "8_1518_1820": {
			"subsidiary_value": "8",
			"vendor_value": "1518",
			"account_value": "1820",
			"clear_acct": "3022",
			"to_acct": "2803",
			"from_acct": "2803",
			"total": -965,
			"lines": [{.....
         * @param {Object} negBillPay; array containing negative bill pay codes of form: subsidiary_vendor_amount
         */
        const checkNegBillPay = (checkObj, negBillPay) => {
            const func = "checkNegBillPay";
            let val, key;
            try {
                // log.debug(func, "Start: " + JSON.stringify({ negBillPay: negBillPay }));
                for(val in checkObj) {
                    if(checkObj[val].total < 0) {
                        key = checkObj[val].subsidiary_value + "_" + checkObj[val].vendor_value + "_" + checkObj[val].total;
                        negBillPay.push(key);
                    };
                };

                log.debug(func, "End: " + JSON.stringify({negBillPay: negBillPay}));
            } catch(e) {
                log.error(e.name, JSON.stringify(e));
            };
        };

        /**
         * @description returns the checked transactions for processing
         * @param {Object} data; the original data object of user selected transactions
         * @param {Object} keyArray; array showing the elements to group by in order of importance, i.e. ["subsidiary_value", "vendor_value"]
         * @param {String} bankSub; the subsidiary of the pay from account
         * @param {boolean} getPrimary; if true, then only process where subsidiary is equal to pay from bank subsidiary
         * @returns {Object}; retObj; key sorted data object, e.g. "3_271358": { "sub": "3", "sub_clear": "3021", 
         *                                                                      "ven": "271358", "total": 17084.86, "lines": [{...}] }
         */
        const getHelperObj = (data, keyArray, bankSub, getPrimary) => {
            const func = "getHelperObj";
            let val = 0;
            let retObj = {};
            let tmp = {};
            let cleanData = [];
            try {
                log.debug(func, "Start: " + JSON.stringify({ keyArray: keyArray, bankSub: bankSub, getPrimary: getPrimary }));
                // either get the primary sub data or remove it based on the getPrimary boolean parameter
                cleanData = data.reduce(function(m, v) {
                    if(getPrimary && v.subsidiary_value === bankSub )  {
                        m.push(v);
                    } else if (!getPrimary && v.subsidiary_value !== bankSub ) {
                        m.push(v);
                    };
                    return m;
                }, []);

                retObj = cleanData.reduce(function(m, v) {
                    // this creates the key, e.g. ["value1", "value2"] becomes value1_value2
                    // v is current element in cleanData, v[dv] references either the subsidiary id or the vendor id or whatever id
                    let key = keyArray.reduce(function(dm, dv, idx, arr) {
                        if(idx === 0) { return v[dv]; } 
                        else if (arr.length >= idx + 1) { return dm + "_" + v[dv]; };
                    }, "");

                    // for credit memos and journals, need to set amount_remaining to negative based on amount; 
                    // only amount is positive or negative; if the original amount is negative, then amount remaining needs to be negative
                    val = (getAsNumber(v.amount) < 0) ? getAsNumber(v.amount_remaining) * -1 : getAsNumber(v.amount_remaining);
                    
                    if(isNullOrEmpty(m[key])) {
                        tmp = {};
                        keyArray.forEach(function(el) { tmp[el] = v[el]; });
                        tmp.clear_acct = BB.Vars.SubClearMap[v.subsidiary_value]; 
                        tmp.to_acct = BB.Vars.SubToMap[v.subsidiary_value]; 
                        tmp.from_acct = BB.Vars.SubFromMap[v.subsidiary_value]; 
                        tmp.total = val;
                        tmp.lines = [v];
                        m[key] = tmp;
                    } else {
                        m[key]["total"] += val;
                        m[key]["lines"].push(v);
                    }; 
                    m[key]["total"] = getAsNumber(m[key]["total"]);
                    return m;
                }, {});

                log.debug(func, "End: " + JSON.stringify({retObj: retObj}));
                return retObj;
            } catch(e) {
                log.error(e.name, JSON.stringify(e));
            };
        };

        /**
         * @description returns the checked transactions for processing
         * @param {Object} request; the request object from POST
         * @returns {Object}; data; array of JSON objects; each object is a selected transaction
         */
        const getMainData = (request) => {
            const func = "getMainData";
            let x, chk, t4;
            let tranSearch = search.load({ 
                id: runtime.getCurrentScript().getParameter({name: "custscript_pob_trans_search" })
            });
            let transLength = request.getLineCount({group:"custpage_transactions"});
            // get the columns from the search and dynamically create the list columns using search columns custom labels
            // JSON.parse(JSON.stringify(lotSearch.columns)) breaks the bond to Search.columns, i.e. makes a new copy;
            let cols = JSON.parse(JSON.stringify(tranSearch.columns));
            let data = [];
            cols = insertCustomCols(cols);
            try{
                for(x = 0; x < transLength; x += 1) {
                    tmp = {}; val = null; 
                    chk = request.getSublistValue({ group: "custpage_transactions" , name:  "custpage_checkbox", line: x });
                    if(chk === "T") {
                        cols.forEach(function(col){ 
                            tmp[col.name_text] = request.getSublistValue({ group: "custpage_transactions" , name: col.suiteletName, line: x });
                            if(col.suiteletName_value && !isNullOrEmpty(request.getSublistValue({ group: "custpage_transactions" , name: col.suiteletName_value, line: x }))) {
                                    tmp[col.name_value] = request.getSublistValue({ group: "custpage_transactions" , name: col.suiteletName_value, line: x });
                            };
                        });
                        data.push(tmp);
                    };
                };
                // t4 = BB.Vars.Form.addField({ id : "custpage_request_iii", type : serverWidget.FieldType.INLINEHTML, label : "Request" })
                                // .defaultValue = "<p style='font-size:12px'>totals: " + JSON.stringify({data: data}) + "</p>";
                // log.debug(func, "End. Returning: " + JSON.stringify({data: data}));
                log.debug(func, "End. Returning: " + data.length + ", elements."); 
                return data;
            } catch(e) {
                log.error(e.name, JSON.stringify(e));
            };
        };

        /**
         * @description creates the regular journal entry by the paying subsidiary
         * @param {Object} request; the request object from POST
         * @param {Object} ven_data; JSON object containing the vendor data
         * @param {Object} sub_data; JSON object containing the subsidiary data
         * @returns {string} jeId; the internal id of the journal entry
         */
        const createRegularJE = (request, ven_data, sub_data) => {
            const func = "createRegularJE";
            const memo = "Created By Pay on Behalf of Suitelet";
            const bankAccount = request.parameters.custpage_bankaccount;
            let bankSub = BB.Vars.BankMap[bankAccount];
            let jeId, je;
            let tmp = {}; let jeObj = []; let stotal = 0; let vtotal = 0; let ctr = 0;
            let debits = 0; let credits = 0;
            for(el in ven_data) { vtotal += getAsNumber(ven_data[el].total); };
            for(el in sub_data) { stotal += getAsNumber(sub_data[el].total); };
            vtotal = getAsNumber(vtotal);
            stotal = getAsNumber(stotal);
            log.debug(func, "Start, data object totals: " + JSON.stringify({vtotal: vtotal, stotal: stotal}));

            try {
                // Start building the lines
                tmp = {};
                tmp = {"account": bankAccount, "debit": "", "credit" : stotal, "entity": ""};
                jeObj.push(tmp);
                for(el in ven_data) { 
                    tmp = {};
                    tmp = {"account": ven_data[el].clear_acct, "debit": ven_data[el].total, "credit" : "", "entity": ven_data[el].vendor_value};
                    jeObj.push(tmp);
                };

                jeObj.forEach(function(el){
                    (el.debit) ? debits += el.debit : "";
                    (el.credit) ? credits += el.credit : "";
                });
                debits = getAsNumber(debits); credits = getAsNumber(credits);
                log.debug(func, JSON.stringify({debits: debits, credits: credits}));

                // create the Regular JE
                je = record.create({
                    type: record.Type.JOURNAL_ENTRY,
                    isDynamic: false
                });
                je.setValue({fieldId: "subsidiary", value: bankSub });
                je.setValue({fieldId: "memo", value: memo });
                ctr = 0;
                jeObj.forEach(function(el){
                    log.debug(func, "Setting JE lines: " + JSON.stringify({ctr: ctr, el: el}));
                    je.setSublistValue({ sublistId: "line", fieldId: "account", line: ctr, value: el.account });
                    if(el.debit)
                        je.setSublistValue({ sublistId: "line", fieldId: "debit", line: ctr, value: el.debit });
                    if(el.credit)
                        je.setSublistValue({ sublistId: "line", fieldId: "credit", line: ctr, value: el.credit });
                    if(el.entity)
                        je.setSublistValue({ sublistId: "line", fieldId: "entity", line: ctr, value: el.entity });
                    ctr += 1;
                });

                jeId = je.save({ignoreMandatoryFields: true});
                log.debug(func, "End, returning jeId: " + jeId);

                return jeId;

            } catch(e) {
                log.error(e.name, JSON.stringify(e));
            }
        };

        /**
         * @description creates the inter-company Journal Entry
         * @param {Object} request; the request object from POST
         * @param {Object} ven_data; JSON object containing the vendor data
         * @param {Object} sub_data; JSON object containing the subsidiary data
         * @returns {string} jeId; the internal id of the journal entry
         */
        const createInterCompanyJE = (request, ven_data, sub_data) => {
            const func = "createInterCompanyJE";
            const memo = "Created By Pay on Behalf of Suitelet";
            const bankAccount = request.parameters.custpage_bankaccount;
            let bankSub = BB.Vars.BankMap[bankAccount];
            let el, jeId, je, ctr; 
            let tmp = {}; let jeObj = []; let stotal = 0; let vtotal = 0;
            let debits = 0; let credits = 0;
            for(el in ven_data) { vtotal += getAsNumber(ven_data[el].total); };
            for(el in sub_data) { stotal += getAsNumber(sub_data[el].total); };
            vtotal = getAsNumber(vtotal);
            stotal = getAsNumber(stotal);

            log.debug(func, "Start, data object totals: " + JSON.stringify({vtotal: vtotal, stotal: stotal}));
                
            try {

                // Start building the lines
                tmp = {};
                tmp = {"linesubsidiary": bankSub, "account": bankAccount, "debit": "", "credit" : stotal, "entity": ""};
                jeObj.push(tmp);
                for(el in sub_data) { 
                    tmp = {};
                    tmp = {"linesubsidiary": bankSub, "account": sub_data[el].to_acct, "debit": sub_data[el].total, "credit" : "", "entity": ""};
                    log.debug(func, "Account: sub_data[el].to_acct: " + sub_data[el].to_acct);
                    jeObj.push(tmp);
                };
                for(el in sub_data) { 
                    tmp = {};
                    tmp = {"linesubsidiary": el, "account": BB.Vars.SubFromMap[bankSub], "debit": "", "credit" : sub_data[el].total, "entity": ""};
                    log.debug(func, "Account: sub_data[el].to_acct: " + sub_data[el].to_acct);
                    jeObj.push(tmp);
                };
                for(el in ven_data) { 
                    tmp = {};
                    tmp = {"linesubsidiary": ven_data[el].subsidiary_value, "account": ven_data[el].clear_acct, 
                        "debit": ven_data[el].total, "credit" : "", "entity": ven_data[el].vendor_value};
                    log.debug(func, "Account: ven_data[el].sub_clear: " + ven_data[el].clear_acct);
                    jeObj.push(tmp);
                };

                jeObj.forEach(function(el){
                    (el.debit) ? debits += el.debit : "";
                    (el.credit) ? credits += el.credit : "";
                });
                debits = getAsNumber(debits); credits = getAsNumber(credits);
                log.debug(func, JSON.stringify({debits: debits, credits: credits}));

                // create the intercompany JE
                je = record.create({
                    type: record.Type.ADV_INTER_COMPANY_JOURNAL_ENTRY,
                    isDynamic: false
                });
                je.setValue({fieldId: "subsidiary", value: bankSub });
                je.setValue({fieldId: "memo", value: memo });
                ctr = 0;
                jeObj.forEach(function(el){
                    log.debug(func, "Setting JE lines: " + JSON.stringify({ctr: ctr, el: el}));
                    je.setSublistValue({ sublistId: "line", fieldId: "linesubsidiary", line: ctr, value: el.linesubsidiary });
                    je.setSublistValue({ sublistId: "line", fieldId: "account", line: ctr, value: el.account });
                    if(el.debit)
                        je.setSublistValue({ sublistId: "line", fieldId: "debit", line: ctr, value: el.debit });
                    if(el.credit)
                        je.setSublistValue({ sublistId: "line", fieldId: "credit", line: ctr, value: el.credit });
                    if(el.entity)
                        je.setSublistValue({ sublistId: "line", fieldId: "entity", line: ctr, value: el.entity });
                    ctr += 1;
                });

                jeId = je.save({ignoreMandatoryFields: true});
                log.debug(func, "End, returning jeId: " + jeId);
                return jeId;
            } catch(e) {
                log.error(e.name, JSON.stringify(e));
            }
        };

        /**
         * @description creates the error page
         * @param {Object} request; the request object
         */
        function build_Error(request) {
            var func = "build_Error";
            let t1, t2, t3;
            let ctr = 0;
            let c2 = 0;
            let errorGroup, val, widgetType;
            let errCols = ["Subsidiary", "Vendor", "Amount"];
            let errMap = {
                "Subsidiary": BB.Vars.SubNameMap, 
                "Vendor": BB.Vars.VendNameMap
            };
            let tmpField;
            // Add Reset Button
            BB.Vars.Form.addButton({ id: "custpage_resetbutton", label: "Return to Pay On Behalf", functionName: "resetPage()" });
            t2 = BB.Vars.Form.addField({ id : "custpage_request", type : serverWidget.FieldType.INLINEHTML, label : "Request" })
                            .defaultValue = "<p style='font-size:12px'> An error occurred.  Either no transactions were selected, or bill credits " + 
                                "exceeded bill payment amounts.  Please press the return button to re-process. </p>";

            errorGroup = BB.Vars.Form.addFieldGroup({ id : "error_group", label : "Error Information" });
            if (!isNullOrEmpty(request.parameters.custparam_negbillpay)){
                t1 = request.parameters.custparam_negbillpay;
                t1 = t1.split(",");
                log.debug(func, JSON.stringify({custparam_negbillpay: request.parameters.custparam_negbillpay, t1: t1}))
                list = BB.Vars.Form.addSublist({ id: "custpage_errors", label: "Bill Credits Exceed Bill Payments for the following: ", type: serverWidget.SublistType.LIST });
                errCols.forEach(function(el){
                    widgetType = (el === "Amount") ? serverWidget.FieldType.CURRENCY : serverWidget.FieldType.TEXT;
                    tmpField = list.addField({ id: "custpage_" + el.toLowerCase(), label: el, type: widgetType });
                });

                t1.forEach(function(d1) {
                    d1 = d1.split("_");
                    c2 = 0;
                    errCols.forEach(function(el){
                        val = (el !== "Amount") ? errMap[el][d1[c2]] : getAsNumber(d1[c2]); 
                        log.debug(func, "val: " + val);
                        list.setSublistValue({ id: "custpage_" + el.toLowerCase(), line: ctr, value: val });
                        c2 += 1;
                    });
                    ctr += 1;
                });

            }
        };

        /**
         * @description creates the User Interface for Phase I:
         * @param {Object} request; the request object
         */
        function buildUI_Phase1(request) {
            var func = "buildUI_Phase1";
            var startDate, endDate, accountField, tmpObj, id;
            var subField, apField, vendField, val, d1, t1;
            var data = {};
            var ctr = 0;
            var list;
            var tmpField, widgetType, sname;
            var searchGroup, total, selected, available;
            let HIDDEN_FIELDS = ["internalid"];
            let acctSearch = search.create({
                type: "account",
                filters: [ ["type","anyof","Bank"] ],
                columns:
                [
                search.createColumn({ name: "name", sort: search.Sort.ASC, label: "Name" }),
                search.createColumn({name: "displayname", label: "Display Name"})
                ]
            });
            let subSearch = search.create({
                type: "subsidiary",
                filters: [  ],
                columns:
                [
                search.createColumn({ name: "name", sort: search.Sort.ASC, label: "Name" })
                ]
            });

            let apSearch = search.create({
                type: "account",
                filters: [ ["type","anyof","AcctPay"] ],
                columns:
                [
                search.createColumn({ name: "name", sort: search.Sort.ASC, label: "Name" }),
                search.createColumn({name: "displayname", label: "Display Name"})
                ]
            });

            let vendSearch = search.create({
                type: "vendor",
                filters: [ ["isinactive","is","F"], "AND", ["balance","greaterthan","0.00"]],
                columns: [ search.createColumn({ name: "entityid", sort: search.Sort.ASC, label: "Name" }) ]
            });
            
            let tranSearch = search.load({ 
                id: runtime.getCurrentScript().getParameter({name: "custscript_pob_trans_search" })
            });
            try {
                log.debug(func, 'Start.');

                submissionGroup = BB.Vars.Form.addFieldGroup({ id : "submission_group", label : "Submission Information" });
                searchGroup = BB.Vars.Form.addFieldGroup({ id : "search_group", label : "Search Filters" });

                // Add the bank accounts 
                tmpObj = getSelectOptionsBasedOnSearch(acctSearch, "displayname");
                accountField = BB.Vars.Form.addField({ id: "custpage_bankaccount", label: "Pay From Bank Account", type: serverWidget.FieldType.SELECT, container: "submission_group" });
                accountField.isMandatory = true;
                accountField.addSelectOption({ value: "", text: "" });
                for (id in tmpObj) { accountField.addSelectOption({ value: id, text: tmpObj[id] }); };
                if (!isNullOrEmpty(request.parameters.custparam_bankaccount)){
                    log.debug(func, JSON.stringify({custparam_bankaccount: request.parameters.custparam_bankaccount}))
                    accountField.defaultValue = request.parameters.custparam_bankaccount;
                }

                // Add submission information
                total = BB.Vars.Form.addField({ id: "custpage_total", label: "Total $: ", type: serverWidget.FieldType.CURRENCY, container: "submission_group" })
                        .updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED});
                selected = BB.Vars.Form.addField({ id: "custpage_selected", label: "Number Records Selected: ", type: serverWidget.FieldType.INTEGER, container: "submission_group" })
                        .updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED});
                available = BB.Vars.Form.addField({ id: "custpage_available", label: "Number Records From Search: ", type: serverWidget.FieldType.INTEGER, container: "submission_group" })
                        .updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED});

                // Add the subsidiaries
                tmpObj = getSelectOptionsBasedOnSearch(subSearch, "name");
                subField = BB.Vars.Form.addField({ id: "custpage_subsidiaries", label: "Subsidiary", type: serverWidget.FieldType.MULTISELECT, container: "search_group"  });
                subField.addSelectOption({ value: "", text: "" });
                for (id in tmpObj) { subField.addSelectOption({ value: id, text: tmpObj[id] }); };
                // update the tranSearch filters based on the parameters
                if (!isNullOrEmpty(request.parameters.custparam_subsidiary)){
                    t1 = request.parameters.custparam_subsidiary;
                    t1 = t1.split(",");
                    log.debug(func, JSON.stringify({custparam_subsidiary: request.parameters.custparam_subsidiary, t1: t1}))
                    tranSearch.filters.push(
                        search.createFilter({ name: "subsidiary", operator: search.Operator.ANYOF, values: t1 })
                    );
                    subField.defaultValue = t1;
                }

                // Add the AP accounts
                tmpObj = getSelectOptionsBasedOnSearch(apSearch, "displayname");
                apField = BB.Vars.Form.addField({ id: "custpage_apaccounts", label: "AP Account", type: serverWidget.FieldType.SELECT, container: "search_group" });
                apField.addSelectOption({ value: "", text: "" });
                for (id in tmpObj) { apField.addSelectOption({ value: id, text: tmpObj[id] }); };
                // update the tranSearch filters based on the parameters
                if (!isNullOrEmpty(request.parameters.custparam_apaccount)){
                    tranSearch.filters.push(
                        search.createFilter({ name: "account", operator: search.Operator.ANYOF, values: request.parameters.custparam_apaccount })
                    );
                    apField.defaultValue = request.parameters.custparam_apaccount;
                }

                // Add the vendors
                tmpObj = getSelectOptionsBasedOnSearch(vendSearch, "entityid");
                vendField = BB.Vars.Form.addField({ id: "custpage_vendor", label: "Vendors with balance greater than zero", type: serverWidget.FieldType.SELECT, container: "search_group" });
                vendField.addSelectOption({ value: "", text: "" });
                for (id in tmpObj) { vendField.addSelectOption({ value: id, text: tmpObj[id] }); };
                // update the tranSearch filters based on the parameters
                if (!isNullOrEmpty(request.parameters.custparam_vendor)){
                    tranSearch.filters.push(
                        search.createFilter({ name: "name", operator: search.Operator.ANYOF, values: request.parameters.custparam_vendor })
                    );
                    vendField.defaultValue = request.parameters.custparam_vendor;
                }

                // Add start and end date filters
                startDate = BB.Vars.Form.addField({ id : "custpage_start_date", type : serverWidget.FieldType.DATE, label : "Due Date On Or After", container: "search_group" });
                if (!isNullOrEmpty(request.parameters.custparam_afterdate)){
                    d1 = request.parameters.custparam_afterdate;
                    tranSearch.filters.push(
                        search.createFilter({ name: "duedate", operator: search.Operator.ONORAFTER, values: d1 })
                    );
                    startDate.defaultValue = new Date(d1);
                }
                endDate = BB.Vars.Form.addField({ id : "custpage_end_date", type : serverWidget.FieldType.DATE, label : "Due Date On Or Before", container: "search_group" });
                if (!isNullOrEmpty(request.parameters.custparam_beforedate)){
                    d1 = request.parameters.custparam_beforedate;
                    tranSearch.filters.push(
                        search.createFilter({ name: "duedate", operator: search.Operator.ONORBEFORE, values: d1 })
                    );
                    endDate.defaultValue =  new Date(d1);
                }

                // Add Reset Button
                BB.Vars.Form.addButton({ id: "custpage_resetbutton", label: "Reset", functionName: "resetPage()" });

                // Add Run With Filters Button
                BB.Vars.Form.addButton({ id: "custpage_filtersbutton", label: "Show/Filter Transactions", functionName: "runWithFilters()" });

                // Add Calculate Total Button
                BB.Vars.Form.addButton({ id: "custpage_calc_total", label: "Calculate Total", functionName: "calculateTotal()" });
                

                // get the columns from the search and dynamically create the list columns using search columns custom labels
                // JSON.parse(JSON.stringify(lotSearch.columns)) breaks the bond to Search.columns, i.e. makes a new copy;
                cols = JSON.parse(JSON.stringify(tranSearch.columns));
                cols = insertCustomCols(cols);
                log.debug(func, "cols: " + JSON.stringify(cols));

                // Add sublist
                list = BB.Vars.Form.addSublist({ id: "custpage_transactions", label: "Bill Payments On Behalf", type: serverWidget.SublistType.LIST, tab: "trantab" });
                
                // add sublist fields
                cols.forEach(function(col){
                    switch (col.type) {
                        case "date":
                            widgetType = serverWidget.FieldType.DATE;
                            break;
                        case "select":
                        case "text":
                            widgetType = serverWidget.FieldType.TEXT;
                            break;
                        case "currency":
                            widgetType = serverWidget.FieldType.CURRENCY;
                            break;
                        case "float":
                            widgetType = serverWidget.FieldType.FLOAT;
                            break;
                        case "inline":
                            widgetType = serverWidget.FieldType.INLINEHTML;
                            break;
                        case "checkbox":
                            widgetType = serverWidget.FieldType.CHECKBOX;
                            break;
                        default:
                            widgetType = serverWidget.FieldType.TEXT;
                            break;
                    };
                    tmpField = list.addField({ id: col.suiteletName, label: col.label, type: widgetType });

                    if(HIDDEN_FIELDS.indexOf(col.name) > -1) {
                        tmpField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
                    } 

                    // add place holder for internal ids
                    if (!isNullOrEmpty(col.suiteletName_value)) {
                        // log.debug(func, "IN _value if: " + JSON.stringify(col));
                        tmpField = list.addField({ id: col.suiteletName_value, label: col.label, type: widgetType })
                                                .updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
                    };
                    // make the payment editable
                    if(col.suiteletName === "custpage_payment" || col.suiteletName === "custpage_ref_no") {
                        tmpField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.ENTRY });
                    }
                });
                list.addMarkAllButtons();

                /**
                var internalId = sublist.addField({
                    id : 'id',
                    label : 'Internal ID',
                type : serverWidget.FieldType.TEXT
                });
                internalId.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY})
                */
                log.debug(func, "tranSearch.filters: " + JSON.stringify(tranSearch.filters));
                if (!isNullOrEmpty(request.parameters.custparam_show_data)){
                    // Add the final submit button after data has been pulled in  
                    BB.Vars.Form.addSubmitButton({ label : "Submit to Generate Transactions" });

                    searchForEachResult(tranSearch,  
                        function(result) {
                            data = result.getAllValues();
                            if(ctr === 0) { log.debug(func, JSON.stringify({data: data})); }
                            
                            cols.forEach(function(col){ 
                                if(col.searchName) {
                                    val = (!util.isArray(data[col.searchName]))
                                            ? data[col.searchName]
                                            : data[col.searchName][0].text;
                                    sname = col.suiteletName;
                                    // In case a result field is blank, i.e. there is nothing in val, do not try to set value for that column
                                    if(!isNullOrEmpty(val)) {
                                        list.setSublistValue({ id: col.suiteletName, line: ctr, value: val });
                                        if(util.isArray(data[col.searchName])){
                                            list.setSublistValue({ id: col.suiteletName_value, line: ctr, value: data[col.searchName][0].value });
                                        };
                                    };
                                } else if(col.type === "checkbox"){
                                    // add the default value for checkbox as empty
                                    list.setSublistValue({ id: col.suiteletName, line: ctr, value: "F" });
                                } else if(col.suiteletName === "custpage_payment") {
                                    list.setSublistValue({ id: col.suiteletName, line: ctr, value: 0 });
                                };
                            });
                            
                            ctr += 1;
                    });
                    available.defaultValue = ctr;
                };

                log.debug(func, "End function.");
            } catch (e) {
                log.error(func, 'Error: ' + JSON.stringify({ ctr: ctr, val: val, suiteletName: sname, data: data }) + JSON.stringify(e));
            }
        };
        return {
            onRequest: onRequest
        };

        /**
         * @description Inserts custom columns for dynamically building a suitelet and 
         * dynamically getting search results using "result.getAllValues()";
         * and the suitelet requirement of "custpage_" plus some descriptive thing
         * @param {Object} cols; columns from the search 
         * @returns {Object} cols; columns with added fields 
         */
        function insertCustomCols(cols) { 
            var func = "insertCustomCols"; 
            var innerName, searchName, suiteletName;
            var checkBox, paymentAmtField, baseName;

            try {
                // log.debug(func, "Start: ");
                cols = cols.map(function(col) { 
                    // Build something that looks like this:  "GROUP(CUSTRECORD_ITEM.custrecord_lot_number)"
                    // or "GROUP(custrecord_lot_number)" or "CUSTRECORD_ITEM.custrecord_lot_number" or "custrecord_lot_number"
                    innerName = (!isNullOrEmpty(col.join)) ? col.join + "." + col.name : col.name;
                    searchName = (!isNullOrEmpty(col.summary)) ? col.summary + "(" + innerName + ")" : innerName;
                    col.searchName = searchName;
                    // Build something that looks like this: " "custpage_transaction_name" - use the label to avoid same internal id name
                    baseName =  col.label.toLowerCase().replace(/ /g, "_").replace(/[^a-z_]/g, '');
                    suiteletName = "custpage_" + baseName;
                    col.suiteletName = suiteletName;
                    col.suiteletName_value = suiteletName + "_value";
                    col.name_text = baseName;
                    col.name_value = baseName + "_value";
                    // log.debug(func, JSON.stringify({searchName: searchName, suiteletName: suiteletName, col: col}));
                    return col;
                }, []);
                checkBox = {
                    "name": "checkbox",
                    "label": "Check Box",
                    "type": "checkbox",
                    "sortdir": "NONE",
                    "searchName": "",
                    "suiteletName": "custpage_checkbox", 
                    "name_text": "checkbox"
                };
                paymentAmtField = {
                    "name": "payment",
                    "label": "Payment",
                    "type": "float",
                    "sortdir": "NONE",
                    "searchName": "",
                    "suiteletName": "custpage_payment",
                    "name_text": "payment"
                };
                cols.unshift(checkBox);
                // uncomment the paymentAmtField field for phase 2 when user will be able to pay less than full amount
                // cols.push(paymentAmtField);
                // log.debug(func, "End, returning: " + JSON.stringify(cols));
                log.debug(func, "End");
                return cols;
            } catch(e) {
                log.error(e.name, JSON.stringify(e));
            }
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
            try {
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
            } catch(e) {
                log.error(e.name, JSON.stringify(e));
            };
        };
        /**
         * @description getAsNumber: returns a number
         * @param {*} _value [required];
         * @param {*} _defaultNumber [optional];
         * @returns {number}. Returns a number
         */
        function getAsNumber(_value, _defaultNumber) {
            if (isNullOrEmpty(_defaultNumber)) {
                _defaultNumber = 0;
            }
            let number = isNaN(parseFloat(_value)) ? _defaultNumber : parseFloat(parseFloat(_value).toFixed(2));
            return number;
        };

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
         * @description Gets the select options for a suitelet field
         * @param {string} _mySearch; the search to use to get the select options
         * @param {string} _nameField; name field to use for display purposes in the suitelet
         * @returns {Object};
         */
        function getSelectOptionsBasedOnSearch(_mySearch, _nameField) {
            var list = {};
            if (!isNullOrEmpty(_mySearch)) {
                searchForEachResult(
                    _mySearch, 
                    function(result) {
                        list[result.id] = result.getValue({name: _nameField });
                }); 
            }
            return list;
        };
        /**
         * @description creates a search and returns a mapping of column text to internal id
         * @param {string} searchType; the search type to create
         * @param {string} column; the name of the column
         * @returns {Object}; map of column text to internal id
         */
        function getMap(searchType, column) {
            var func = "getMap";
            var theSearch = search.create({
                type: searchType,
                filters: [ ],
                columns: [ search.createColumn({name: column, label: "Heading"}) ]
             });
             var retVal = {};
             try {
                log.debug(func, "Start: " + JSON.stringify({searchType: searchType, column: column }));
                searchForEachResult(theSearch,  
                    function(result) {
                        retVal[result.getValue({name: column })] = result.id;
                    }
                );
                // log.debug(func, "Returning: " + JSON.stringify(retVal));
                log.debug(func, "Returning, retVal length: " + Object.keys(retVal).length);
                return retVal;

             } catch(e) {
                log.error(e.name, JSON.stringify(e));
             }
        };
    });
