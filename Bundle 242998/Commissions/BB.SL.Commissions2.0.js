/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/record', 'N/config', 'N/query', 'N/runtime', 'N/search', 'N/task', 'N/ui/message', 'N/ui/serverWidget', 'N/redirect', './BB.MD.Commission2.0.Lib', '../BB SS/SS Lib/BB.SS.ScheduledScript.BatchProcessing'],
    /**
 * @param{config} config
 * @param{query} query
 * @param{runtime} runtime
 * @param{search} search
 * @param{task} task
 * @param{message} message
 * @param{serverWidget} serverWidget
 */
    (record, nsconfig, query, runtime, search, task, message, serverWidget, redirect, util, batchProcessor) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
                if(scriptContext.request.method === 'GET') {

                    let initialOperation = scriptContext.request.parameters.operation;
                    log.debug('runtime.getCurrentScript().deploymentId', runtime.getCurrentScript().deploymentId);
                    log.debug('scriptContext.request.parameters.operation', scriptContext.request.parameters.operation);
                    if(runtime.getCurrentScript().deploymentId === 'customdeploy_bb_sl_commv2_main_claw' && util.isEmpty(scriptContext.request.parameters.operation)){
                        initialOperation = 'clawback';
                    }
                    if(runtime.getCurrentScript().deploymentId === 'customdeploy_bb_sl_commv2_main' && util.isEmpty(scriptContext.request.parameters.operation)){
                        initialOperation = 'create';
                    }
                    const operation = initialOperation;
                    log.debug('Initial operation', operation);
                    const period = (scriptContext.request.parameters.payrollPeriod) ? scriptContext.request.parameters.payrollPeriod : util.getCurrentPayrollPeriod();
                    const submittedTaskId = scriptContext.request.parameters.taskId;
                    const payee = scriptContext.request.parameters.payee;

                    var form = createForm(operation, period, submittedTaskId, payee);

                    form.clientScriptModulePath = './BB.CS.Commissions2.0';

                    scriptContext.response.writePage(form);

                }
                if(scriptContext.request.method === 'POST') {
                    log.audit('OK', 'POST starts here');
                    // process here after button click get sublist values from parameters and send details from Array to scheduled or map reduce to create snap shot records.

                    const operation = scriptContext.request.parameters.custpage_operation;
                    const payPeriod = scriptContext.request.parameters.custpage_payroll_period;
                    const payDate = scriptContext.request.parameters.custpage_pay_date
                    log.debug('post operation', operation);
                    log.debug('post payPeriod', payPeriod);
                    log.debug('post payDate', payDate);

                    var arrObjectsToProcess = [];

                    var objCommissionMappings = getCommissionMappings();
                    log.debug('objCommissionMappings', objCommissionMappings);
                    const arrSublistID = getSublistID(operation);
                    log.debug('arrSublistID', arrSublistID);
                    for(let i=0; i<arrSublistID.length; i++){
                        let sublistID = arrSublistID[i].sublistID;
                        log.debug('sublistID', sublistID);

                        let sublistNumLines = scriptContext.request.getLineCount({
                            group: sublistID
                        });
                        log.debug('sublistNumLines', sublistNumLines);

                        for(let sublistIndex = 0; sublistIndex<sublistNumLines; sublistIndex++){
                            const sublistCheckbox = scriptContext.request.getSublistValue({
                                group: sublistID,
                                name: 'custpage_checkbox',
                                line: sublistIndex
                            });
                            log.debug('sublistCheckbox', sublistCheckbox);
                            if(sublistCheckbox === 'T' || sublistCheckbox === true){
                                let objCommissionSnapshotProcessor = {};
                                for (let key of Object.keys(objCommissionMappings)) {
                                    log.debug('objCommissionMappings','custpage_'+arrSublistID[i].datasetID+'_'+key + " -> " + objCommissionMappings[key]);
                                    objCommissionSnapshotProcessor[objCommissionMappings[key]] = scriptContext.request.getSublistValue({
                                        group: sublistID,
                                        name: 'custpage_'+arrSublistID[i].datasetID+'_'+key,
                                        line: sublistIndex
                                    });
                                }
                                log.debug('objCommissionSnapshotProcessor', objCommissionSnapshotProcessor);
                                arrObjectsToProcess.push(objCommissionSnapshotProcessor);
                            }
                        }
                    }
                    log.debug('arrObjectsToProcess', arrObjectsToProcess);

                    var taskId = null;
                    if (arrObjectsToProcess.length > 0) {
                        // load payroll period and set rechmach sublist method of snap shot processing records
                        util.createSnapshotProcessor(arrObjectsToProcess, payPeriod, operation);
                        log.audit('OK', 'Snapshot Processors created');


                        let taskParameters = {};
                        taskParameters['custscript_bb_mr_cm_payroll'] = payPeriod;
                        taskParameters['custscript_bb_mr_cm_type'] = operation;
                        taskParameters['custscript_bb_mr_cm_date'] = payDate;

                        const scriptId = 'customscript_bb_mr_commv2_main';
                        const deploymentId = 'customdeploy_bb_mr_commv2_main';
                        const taskType = task.TaskType.MAP_REDUCE;

                        taskId = batchProcessor.addToQueue(scriptId, deploymentId, taskParameters, taskType);
                        log.audit('OK taskId', taskId);
                    }

                    redirect.toSuitelet({
                        scriptId: "customscript_bb_ss_sl_progressbar_v2",
                        deploymentId: "customdeploy_bb_ss_sl_progressbar_v2",
                        parameters: {
                            taskId: taskId,
                            mainsuiteletid: runtime.getCurrentScript().id,
                            mainsuiteletdeploy: runtime.getCurrentScript().deploymentId,
                            mainsuiteletparams: "&taskId="+taskId
                        }
                    });

                }
            }catch (e) {
                log.error('ERROR', e);
                pageHandler(scriptContext.response, e.message);
            }
        }


        const pageHandler = (response, message) => {
            let form = serverWidget.createForm({
                title: "Something Went Wrong"
            });
            let script = "win = window.close();";
            form.addButton({
                id: 'custpage_btn_close',
                label: 'Close',
                functionName: script
            });
            let outputHTMLField = form.addField({
                id: 'custpage_output_html',
                label: 'Output',
                type: serverWidget.FieldType.INLINEHTML
            });
            outputHTMLField.defaultValue = message;
            outputHTMLField.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
            });
            response.writePage(form);
        }

        const getCommissionMappings = () => {
            let objCommissionMapping = {};

            const customrecord_bbss_comm_snapshot_mappingSearchObj = search.create({
                type: "customrecord_bbss_comm_snapshot_mapping",
                filters:
                    [
                        ["isinactive","is","F"],
                        "AND",
                        ["custrecord_bbs_comm_dataset_field","isnotempty",""],
                        "AND",
                        ["custrecord_bbss_comm_rec_field_id","isnotempty",""]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({name: "custrecord_bbss_comm_rec_field_id", label: "Record Field ID"}),
                        search.createColumn({name: "custrecord_bbs_comm_dataset_field", label: "Commission Data set Field"})
                    ]
            });
            var searchResultCount = customrecord_bbss_comm_snapshot_mappingSearchObj.runPaged().count;
            log.debug("customrecord_bbss_comm_snapshot_mappingSearchObj result count",searchResultCount);
            customrecord_bbss_comm_snapshot_mappingSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results
                objCommissionMapping[result.getValue('custrecord_bbs_comm_dataset_field')] = result.getValue('custrecord_bbss_comm_rec_field_id');
                return true;
            });

            return objCommissionMapping;
        }

        const getSublistID = (operation) => {
            let arrSubslistID = [];
            const arrSubtabObjects = util.getSuiteletSubtabs(runtime.getCurrentScript().deploymentId, operation);
            log.debug('getSublistID arrSubtabObjects', arrSubtabObjects);
            for(let i=0; i<arrSubtabObjects.length; i++){
                let sublistOperation = arrSubtabObjects[i].operation;
                if(sublistOperation === operation){
                    arrSubslistID.push(
                        {
                            'sublistID': 'custpage_sublistid_' + arrSubtabObjects[i].operation + '_' + arrSubtabObjects[i].datasetID,
                            'datasetID': arrSubtabObjects[i].datasetID
                        });
                }
            }

            return arrSubslistID;
        }

        /**
         * createForm (operation, period)
         * @param operation - string
         * @param period - integer
         * @returns {form}
         */
        const createForm = (operation, period, submittedTaskId, payee) => {
            let formTitle = 'Commissions';
            let form = serverWidget.createForm({
                title: formTitle,
            });

            //Adding a field to get the deployment id from the client script
            var deployID = form.addField({
                id: 'custpage_deployid',
                type: serverWidget.FieldType.TEXT,
                label: 'Deploy ID'
            });
            deployID.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
            deployID.defaultValue = runtime.getCurrentScript().deploymentId;

            let sublistType = serverWidget.SublistType.LIST;
            var payrollPeriod = form.addField({
                id: 'custpage_payroll_period',
                type: serverWidget.FieldType.SELECT,
                label: 'Select Payroll Period',
                source: 'customrecord_bb_payroll_period'
            });
            payrollPeriod.defaultValue = period

            var recordType = form.addField({
                id: 'custpage_operation',
                type: serverWidget.FieldType.TEXT,
                label: 'Operation'
            });
            recordType.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
            recordType.defaultValue = operation;

            var taskID = form.addField({
                id: 'custpage_taskid',
                type: serverWidget.FieldType.TEXT,
                label: 'Task ID'
            });
            taskID.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
            taskID.defaultValue = submittedTaskId;

            var fldPayee = form.addField({
                id: 'custpage_payee',
                type: serverWidget.FieldType.SELECT,
                label: 'Select Payee',
                //source: 'employee'
            });
            //fldPayee.defaultValue = payee;
          addValuesToPayeeField(fldPayee);

            var currentTotal = form.addField({
                id: 'custpage_current_total',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Current Total Amount'
            });
            currentTotal.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.INLINE
            });
            currentTotal.defaultValue = 0;

            switch(operation) {
                case 'pay':
                    formTitle = 'Create Commission Payment';

                    form.addSubmitButton({
                        label: 'Create Commission Snapshot Payments'
                    });
                    form.addButton({
                        id: 'custpage_return_to_home',
                        label: 'Back',
                        functionName: 'returnToHome'
                    });
                    //Refresh functionality is out of scope for Bundle (for now)
                    /*form.addButton({
                        id: 'custpage_refesh_list',
                        label: 'Refresh Snapshot',
                        functionName: 'refreshSnapShot'
                    });*/

                    form.addField({
                        id: 'custpage_pay_date',
                        type: serverWidget.FieldType.DATE,
                        label: 'Payment Date'
                    });

                    break;
                case 'edit':
                    formTitle = 'Edit Commission Snapshot';
                    sublistType = serverWidget.SublistType.LIST;
                    form.addSubmitButton({
                        label: 'Save'
                    });
                    form.addButton({
                        id: 'custpage_return_to_home',
                        label: 'Back',
                        functionName: 'returnToHome'
                    });
                    /*form.addButton({
                        id: 'custpage_refesh_list',
                        label: 'Refresh Snapshot',
                        functionName: 'refreshSnapShot'
                    });*/

                    break;
                case 'delete':
                    formTitle = 'Delete Commission Snapshot';
                    form.addSubmitButton({
                        label: 'Delete Snapshot'
                    });
                    form.addButton({
                        id: 'custpage_return_to_home',
                        label: 'Back',
                        functionName: 'returnToHome'
                    });

                    break;
                case 'clawback':
                    formTitle = 'Create Commission Clawback';
                    form.addSubmitButton({
                        label: 'Create Clawback'
                    });
                    //Used to know sublist line number for X project ID (to later access it in Order(1) from the fieldChanged on the Client Script)
                    const clawProjectIDs = form.addField({
                        id : 'custpage_claw_proj_id',
                        type : serverWidget.FieldType.LONGTEXT,
                        label : 'Claw Project ID'
                    });
                    clawProjectIDs.updateDisplayType({
                        displayType : serverWidget.FieldDisplayType.HIDDEN
                    });
                    clawProjectIDs.defaultValue = 'testing';

                    break;
                default:
                    //'create'
                    form.addSubmitButton({
                        label: 'Create Commission Snapshot'
                    });
                    form.addButton({
                        id: 'custpage_edit_snapshot',
                        label: 'Edit Commission Snapshot',
                        functionName: 'editSnapShot'
                    });
                    form.addButton({
                        id: 'custpage_delete_snapshot',
                        label: 'Delete Commission Snapshot',
                        functionName: 'deleteSnapShot'
                    });
                    form.addButton({
                        id: 'custpage_create_comm_payment',
                        label: 'Create Commission Payments',
                        functionName: 'createCommJe'
                    });
            }

            //Updating the form title accordingly
            form.title = formTitle;

            return createSnapshotSublists(form, sublistType, operation, payee);
        }

      const addValuesToPayeeField = (fldPayee) => {
        fldPayee.addSelectOption({
          value : '',
          text : ''
        });
        const payeeSearchId = search.lookupFields({
          type: "customrecord_bb_solar_success_configurtn",
          id: 1,
          columns: ['custrecord_bb_comm_payee_search']
        }).custrecord_bb_comm_payee_search;

        if(payeeSearchId){
          const searchObj = search.load(payeeSearchId);
          searchObj.run().each(function(result){
            // .run().each has a limit of 4,000 results
            fldPayee.addSelectOption({
              value : result.getValue('internalid'),
              text : result.getValue('formulatext')
            });
            return true;
          });
        }
      }

        /**
         * createSnapshotSublists (form)
         * @param form - NetSuite Server Widget Generated form
         * @returns {form}
         */
        const createSnapshotSublists = (form, sublistType, operation, payee) => {
            const arrSubtabObjects = util.getSuiteletSubtabs(runtime.getCurrentScript().deploymentId, operation);
            log.debug('arrSubtabObjects', arrSubtabObjects);
            for(let i=0; i<arrSubtabObjects.length; i++){
                let sublistID = ('custpage_sublistid_'+operation+'_'+arrSubtabObjects[i].datasetID).toLowerCase();
                let sublist = form.addSublist({
                    id: sublistID,
                    type: sublistType,
                    label: arrSubtabObjects[i].title
                });
                sublist.addMarkAllButtons();
                sublist.addButton({
                    id: 'custpage_exportcsv_'+i,
                    label: 'Export to CSV',
                    functionName: 'exportCSV('+JSON.stringify(sublistID)+')'
                });
                sublist.addField({
                    id: 'custpage_checkbox',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Select'
                });
                let loadedQuery = query.load({
                    id: ('custdataset'+arrSubtabObjects[i].datasetID).toLowerCase()
                });
                if(operation === 'clawback') {//We need to group clawback by project id
                     loadedQuery.createColumn({
                        fieldId: 'job.id',
                        alias: 'mapping id',
                        groupedBy: true
                     });
                }
                createSuiteletFields(sublist, loadedQuery, arrSubtabObjects[i].datasetID);
                processQueryResults(sublist, loadedQuery, arrSubtabObjects[i].datasetID, payee);
            }
            return form;
        }
        /**
         * createSuiteletFields (sublist, myLoadedQuery)
         * @param sublist - NetSuite Server Widget Generated sublist
         * @param myLoadedQuery - N/query loaded query
         * @returns {sublist}
         */
        const createSuiteletFields = (sublist, myLoadedQuery, datasetID) => {
            //log.debug('myLoadedQuery.columns', myLoadedQuery.columns);
            for (let index in myLoadedQuery.columns) {
                let fieldCode = myLoadedQuery.columns[index];
                //log.debug('fieldCode', fieldCode);
                let fieldArr = fieldCode.label.split('.');
                //log.debug('fieldArr', fieldArr);
                let fieldType = resolveFieldType(fieldArr[0]);
                let fieldID = fieldArr[1].toLowerCase();
                let fieldLabel = fieldArr[2];
                let fieldDisplayType = fieldArr[3].toLowerCase();
                var sublistField;

                // log.debug('fieldID', 'custpage_'+fieldID);
                // log.audit('fieldLabel', fieldLabel);
                // log.audit('fieldType', fieldType);
                // log.audit('fieldDisplayType', fieldDisplayType);
                if (fieldArr.length === 5) {
                    let fieldSource = fieldArr[4];
                    sublistField = sublist.addField({
                        id: 'custpage_'+datasetID+'_'+fieldID,
                        type: fieldType,
                        label: fieldLabel,
                        source: fieldSource
                    });
                } else {
                    sublistField = sublist.addField({
                        id: 'custpage_'+datasetID+'_'+fieldID,
                        type: fieldType,
                        label: fieldLabel
                    });
                }

                sublistField.updateDisplayType({
                    displayType : fieldDisplayType
                });
            }
            return sublist;
        }

        /**
         * processQueryResults (sublist, loadedQuery)
         * @param loadedQuery - loaded NetSuite query object
         * @param sublist - server widget sublist
         */
        const processQueryResults = (sublist, loadedQuery, datasetID, payee) => {
            let resultSet = loadedQuery.run();
            //log.debug('resultSet', resultSet);
            let columnArr = [];
            for (let index in loadedQuery.columns) {
                let fieldCode = loadedQuery.columns[index];
                let fieldArr = fieldCode.label.split('.');
                let fieldId = fieldArr[1];
                columnArr.push(fieldId)
            }
            let sublistIndex = 0;
            for (let ind = 0; ind < resultSet.results.length; ind++) {
                /*Requested a filter by Payee. Since this value comes from a record that is not directly related to Project,
                 can't add the condition using the query module, so we are going to filter the query results while adding these
                 to the sublist.*/

                //This boolean is going to be use to determine if we add the query result to the sublist row or not
                let addResultRow = false;
                if(!util.isEmpty(payee)) {
                    for (let num = 0; num < columnArr.length; num++) {
                        //columnArr[num] is the column field id
                        //resultSet.results[ind].values[num] is the column value
                        //payee is the value from the header field that we want to filter by
                        if(columnArr[num].toLowerCase() === 'payee' && String(resultSet.results[ind].values[num]) === String(payee)){
                            addResultRow = true;
                        }
                    }
                }else{
                    //If there is not a value on the header filter field, then add all the results to the sublist
                    addResultRow = true;
                }

                //Only adding result to the sublist if we have to
                if(addResultRow === true) {
                    for (let num = 0; num < columnArr.length; num++) {
                        // log.audit('columnArr[num]', 'num: '+num+' columnArr[num]: '+columnArr[num]);
                        // log.audit('resultSet.results[ind].values[num]', 'resultSet.results[ind]: '+resultSet.results[ind]);
                        // log.audit('resultSet.results[ind].values[num]', 'resultSet.results[ind].values[num]: '+resultSet.results[ind].values[num]);
                        let auxValue = resultSet.results[ind].values[num];
                        if(columnArr[num].toLowerCase() === 'snap_internalid')
                            auxValue = parseInt(auxValue);
                        sublist.setSublistValue({
                            id: ('custpage_' + datasetID + '_' + columnArr[num]).toLowerCase(),
                            line: sublistIndex,
                            value: auxValue
                        });
                    }
                    sublistIndex++;
                }
            }
        }

        /**
         * resolveFieldType (fieldType)
         * @param fieldType - string
         * @returns {server widget field type}
         */
        const resolveFieldType = (fieldType) => {
            let type;
            fieldType = fieldType.toLowerCase();

            if (fieldType === 'url') {
                type = serverWidget.FieldType.URL
            } else if (fieldType === 'integer') {
                type = serverWidget.FieldType.INTEGER
            } else if (fieldType === 'date') {
                type = serverWidget.FieldType.DATE
            } else if (fieldType === 'text') {
                type = serverWidget.FieldType.TEXT
            } else if (fieldType === 'select') {
                type = serverWidget.FieldType.SELECT
            } else if (fieldType === 'multiselect') {
                type = serverWidget.FieldType.MULTISELECT
            } else if (fieldType === 'currency') {
                type = serverWidget.FieldType.FLOAT
            } else {
                type = serverWidget.FieldType.TEXT
            }
            return type
        }

        return {onRequest}

    });
