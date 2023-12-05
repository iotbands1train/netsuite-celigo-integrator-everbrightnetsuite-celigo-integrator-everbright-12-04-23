define(['N/search', 'N/url', 'N/query', 'N/dataset', 'N/record', 'N/format'],

    function(search, url, query, dataset, record, format) {


            const getCurrentPayrollPeriod = () => {
                    var period;
                    var customrecord_bb_payroll_periodSearchObj = search.create({
                            type: "customrecord_bb_payroll_period",
                            filters:[],
                            columns:
                                [
                                        search.createColumn({
                                                name: "internalid",
                                                summary: "GROUP"
                                        }),
                                        search.createColumn({
                                                name: "custrecord_bb_payroll_end_date",
                                                summary: "MAX",
                                                sort: search.Sort.DESC
                                        })
                                ]
                    });
                    customrecord_bb_payroll_periodSearchObj.run().each(function(result){
                            period = result.getValue({
                                    name: 'internalid',
                                    summary: 'GROUP'
                            });
                            return false;
                    });
                    return period;

            }


            function getTotalCommissionPaidAmt(projectId) {
                    var totalAmt = parseFloat(0.00);
                    if (projectId) {
                            var customrecord_bb_commission_snap_shotSearchObj = search.create({
                                    type: "customrecord_bb_commission_snap_shot",
                                    filters:
                                        [
                                                ["custrecord_bb_comm_snap_shot_project","anyof", projectId],
                                                "AND",
                                                ["custrecord_bb_comm_snap_shot_journal","noneof","@NONE@"]
                                        ],
                                    columns:
                                        [
                                                search.createColumn({
                                                        name: "custrecord_bb_snap_shot_paid_comm_amt",
                                                        summary: "SUM"
                                                })
                                        ]
                            });
                            var searchResultCount = customrecord_bb_commission_snap_shotSearchObj.runPaged().count;
                            // log.debug("customrecord_bb_commission_snap_shotSearchObj result count",searchResultCount);
                            customrecord_bb_commission_snap_shotSearchObj.run().each(function(result){
                                    totalAmt = result.getValue({
                                            name: 'custrecord_bb_snap_shot_paid_comm_amt',
                                            summary: 'SUM'
                                    });

                                    return true;
                            });
                            return totalAmt;
                    } else {
                            return 0.00;
                    }

            }


            function getSnapShotRecordAfterDelete(projectId) {
                    var snapshotId = '';
                    if (projectId) {
                            var customrecord_bb_commission_snap_shotSearchObj = search.create({
                                    type: "customrecord_bb_commission_snap_shot",
                                    filters:
                                        [
                                                ["custrecord_bb_comm_snap_shot_project","anyof", projectId]
                                        ],
                                    columns:
                                        [
                                                search.createColumn({
                                                        name: "internalid",
                                                        summary: "MAX",
                                                        sort: search.Sort.DESC
                                                })
                                        ]
                            });
                            var searchResultCount = customrecord_bb_commission_snap_shotSearchObj.runPaged().count;
                            //log.debug("customrecord_bb_commission_snap_shotSearchObj result count",searchResultCount);
                            customrecord_bb_commission_snap_shotSearchObj.run().each(function(result){
                                    snapshotId = result.getValue({
                                            name: 'internalid',
                                            summary: 'MAX'
                                    });
                                    return true;
                            });
                    }
                    return snapshotId;
            }


            function getSnapShotRecordChanges(payrollPeriod) {
                    var changedRecordArr = [];
                    if (payrollPeriod) {
                            var customrecord_bb_commission_snap_shotSearchObj = search.create({
                                    type: "customrecord_bb_commission_snap_shot",
                                    filters:
                                        [
                                                ["systemnotes.field","anyof","CUSTRECORD_BB_COMM_SNAP_SHOT_COMM_AMT"],
                                                "AND",
                                                ["systemnotes.oldvalue","isnotempty",""],
                                                "AND",
                                                ["systemnotes.newvalue","isnotempty",""],
                                                "AND",
                                                ["custrecord_bb_comm_snap_shot_pay_period","anyof", payrollPeriod]
                                        ],
                                    columns:
                                        [
                                                "internalid",
                                                "custrecord_bb_comm_snap_shot_pay_period",
                                                "custrecord_bb_comm_snap_shot_project"
                                        ]
                            });
                            var searchResultCount = customrecord_bb_commission_snap_shotSearchObj.runPaged().count;
                            //log.debug("changed record count",searchResultCount);
                            customrecord_bb_commission_snap_shotSearchObj.run().each(function(result){
                                    changedRecordArr.push(parseInt(result.getValue({name: 'internalId'})));
                                    return true;
                            });
                    }
                    return changedRecordArr;
            }


            function projectsWithClawBacks(payrollPeriod) {
                    var clawBackArr = [];
                    if (payrollPeriod) {
                            var jobSearchObj = search.create({
                                    type: "job",
                                    filters:
                                        [
                                                ["custentity_bb_comm_snap_shot_record.custrecord_bb_comm_snap_shot_pay_period","anyof", payrollPeriod],
                                                "AND",
                                                ["count(formulanumeric: CASE WHEN COUNT({custrecord_bb_comm_snap_shot_project.internalid}) > 1 THEN 1 ELSE 0 END)","equalto","1"]
                                        ],
                                    columns:
                                        [
                                                search.createColumn({
                                                        name: "internalid",
                                                        summary: "GROUP"
                                                }),
                                                search.createColumn({
                                                        name: "internalid",
                                                        join: "CUSTRECORD_BB_COMM_SNAP_SHOT_PROJECT",
                                                        summary: "COUNT"
                                                })
                                        ]
                            });
                            jobSearchObj.run().each(function(result){
                                    // .run().each has a limit of 4,000 results
                                    var projectId = parseInt(result.getValue({name: 'internalid', summary: 'GROUP'}));
                                    clawBackArr.push(projectId);
                                    return true;
                            });
                    }
                    return clawBackArr;
            }

            const getSnapshotsToRefresh = (payrollPeriod) => {
                var customrecord_bbss_comm_snapshot_v2SearchObj = search.create({
                    type: "customrecord_bbss_comm_snapshot_v2",
                    filters:
                        [
                            ["custrecord_bbss_comm_snapshot_pay_period","anyof",payrollPeriod]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "id",
                                sort: search.Sort.ASC,
                                label: "ID"
                            }),
                            search.createColumn({name: "internalid", label: "Internal ID"}),
                            search.createColumn({name: "custrecord_bbss_comm_snapshot_proj", label: "Project"}),
                            search.createColumn({name: "custrecord_bbss_comm_snapshot_payee", label: "Payee"}),
                            search.createColumn({name: "custrecord_bbss_comm_snapshot_pay_period", label: "Payroll Period"}),
                            search.createColumn({name: "custrecord_bbss_comm_snapshot_payment", label: "Payment Transaction"}),
                            search.createColumn({name: "custrecord_bbss_comm_snapshot_owed_amt", label: "Commission Owed Amount"}),
                            search.createColumn({name: "custrecord_bbss_comm_snapshot_paid_amt", label: "Commission Paid Amount"}),
                            search.createColumn({name: "custrecord_bbss_comm_snapshot_calc_amt", label: "Commission Calculated Amount for Payee"}),
                            search.createColumn({name: "custrecord_bbss_comm_snapshot_manual_amt", label: "Commission Manual Paid Amount"}),
                            search.createColumn({name: "custrecord_bbss_comm_snapshot_seq", label: "Sequence"}),
                            search.createColumn({name: "custrecord_bbss_comm_clawback", label: "Clawback"})
                        ]
                });

                const objRefreshCommissionMapping = getRefreshCommissionMappings();
                let arrObjectsToProcess = [];

                customrecord_bbss_comm_snapshot_v2SearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    let objCommissionSnapshotProcessor = {};
                    for (let key of Object.keys(objRefreshCommissionMapping)) {
                        log.debug('objRefreshCommissionMapping',key + " -> " + objRefreshCommissionMapping[key]);
                        objCommissionSnapshotProcessor[key] = result.getValue(objRefreshCommissionMapping[key]);
                    }
                    log.debug('objCommissionSnapshotProcessor', objCommissionSnapshotProcessor);
                    arrObjectsToProcess.push(objCommissionSnapshotProcessor);
                    return true;
                });

                return arrObjectsToProcess;
            }

        const getRefreshCommissionMappings = () => {
            let objRefreshCommissionMapping = {};

            const customrecord_bbss_comm_snapshot_mappingSearchObj = search.create({
                type: "customrecord_bbss_comm_snapshot_mapping",
                filters:
                    [
                        ["isinactive","is","F"],
                        "AND",
                        ["custrecord_bbss_comm_snapshot_field","isnotempty",""],
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
                        search.createColumn({name: "custrecord_bbss_comm_snapshot_field", label: "Commission Data set Field"})
                    ]
            });
            customrecord_bbss_comm_snapshot_mappingSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results
                objRefreshCommissionMapping[result.getValue('custrecord_bbss_comm_rec_field_id')] = result.getValue('custrecord_bbss_comm_snapshot_field');
                return true;
            });

            return objRefreshCommissionMapping;
        }


        const getSuiteletSubtabs = (deployID, operation) => {
                    log.debug('getSuiteletSubtabs operation', operation);
                    log.debug('getSuiteletSubtabs deployID', deployID);
                    if(isEmpty(operation)){
                            operation = 'create';
                    }
                    log.debug('getSuiteletSubtabs operation', operation);
                    let objSearch = search.create({
                            type: 'customrecord_bb_comm_suitelet_subtab',
                            filters: [
                                    ['isinactive', 'is', 'F'],
                                    "AND",
                                    ['custrecord_bb_comm_sl_deploy_id', 'is', deployID],
                                    "AND",
                                    ['custrecord_bb_comm_sl_subtab_operation', 'anyof', getOperationID(operation)],
                                    "AND",
                                    ["custrecord_bb_comm_sl_subtab_datasetid","isnotempty",""],

                            ],
                            columns: [
                                search.createColumn({name: "custrecord_bb_comm_sl_subtab_title", label: "Subtab Title"}),
                                search.createColumn({name: "custrecord_bb_comm_sl_subtab_datasetid", label: "Subtab Dataset ID"}),
                                search.createColumn({name: "custrecord_bb_comm_sl_deploy_id", label: "Deployment ID"}),
                                search.createColumn({name: "custrecord_bb_comm_sl_subtab_operation", label: "Operation"}),
                                search.createColumn({
                                    name: "custrecord_bb_comm_sl_subtab_order",
                                    sort: search.Sort.ASC,
                                    label: "Display Order"
                                })
                            ]
                    });
                    let results = [];

                    objSearch.run().each((res) => {
                            results.push({
                                    title: res.getValue('custrecord_bb_comm_sl_subtab_title'),
                                    datasetID: res.getValue('custrecord_bb_comm_sl_subtab_datasetid'),
                                    operation: res.getText('custrecord_bb_comm_sl_subtab_operation'),
                                    id: res.id,
                                    order: res.getValue('custrecord_bb_comm_sl_subtab_order')
                            });

                            return true;
                    });

                    return results;
            }

        const getOperationID = (operation) => {
                    let operationID = null;
                    const customrecord_bb_comm_suitelet_operationSearchObj = search.create({
                            type: "customrecord_bb_comm_suitelet_operation",
                            filters:
                                [
                                        ["isinactive","is","F"],
                                        "AND",
                                        ["name","is",operation]
                                ],
                            columns:
                                [
                                        search.createColumn({
                                                name: "name",
                                                sort: search.Sort.ASC,
                                                label: "Name"
                                        }),
                                        search.createColumn({name: "internalid", label: "Internal ID"})
                                ]
                    });
                    customrecord_bb_comm_suitelet_operationSearchObj.run().each(function(result){
                            // .run().each has a limit of 4,000 results
                            operationID = result.getValue('internalid');
                            return true;
                    });

                    return operationID;
            }

        const createSnapshotProcessor = (arrObjectsToProcess, payrollPeriod, operation) => {
            log.debug('payroll period processing record', payrollPeriod)
            log.debug('arrObjectsToProcess', arrObjectsToProcess)
            if (payrollPeriod && arrObjectsToProcess.length > 0) {
                var payPeriod = record.load({
                    type: 'customrecord_bb_payroll_period',
                    id: payrollPeriod,
                    isDynamic: false
                });
                for (let i=0; i<arrObjectsToProcess.length; i++) {
                    let objSnapshotProcessor = arrObjectsToProcess[i];
                    log.debug('objSnapshotProcessor mapping', objSnapshotProcessor);
                    //Now loop through the Commission Mapping record obj to get the fields mapping ids and complete the Processor setting
                    for (let key of Object.keys(objSnapshotProcessor)) {
                        payPeriod.setSublistValue({
                            sublistId: 'recmachcustrecord_bb_comm_proc_pay_period',
                            fieldId: key,
                            value: objSnapshotProcessor[key],
                            line: i
                        });
                    }
                    //setting the operation on the Snapshot Processor
                    payPeriod.setSublistValue({
                        sublistId: 'recmachcustrecord_bb_comm_proc_pay_period',
                        fieldId: 'custrecord_bb_comm_proc_type',
                        value: operation,
                        line: i
                    });

                }
                payPeriod.save({ignoreMandatoryFields:true})
            }
        }

            const isEmpty = (stValue) => {
                    return ((stValue === '' || stValue == null || false) || (stValue.constructor === Array && stValue.length === 0) || (stValue.constructor === Object && (function (v) {
                            for (var k in v)
                                    return false;
                            return true;
                    })(stValue)));
            };

            /**
             * Get all of the results from the search even if the results are more than 1000.
             * @param {String} stRecordType - the record type where the search will be executed.
             * @param {String} stSearchId - the search id of the saved search that will be used.
             * @param {nlobjSearchFilter[]} arrSearchFilter - array of nlobjSearchFilter objects. The search filters to be used or will be added to the saved search if search id was passed.
             * @param {nlobjSearchColumn[]} arrSearchColumn - array of nlobjSearchColumn objects. The columns to be returned or will be added to the saved search if search id was passed.
             * @returns {nlobjSearchResult[]} - an array of nlobjSearchResult objects
             */
            const customSearch = (stRecordType, stSearchId, arrSearchFilter, arrSearchColumn, stSearchType) => {
                    if (stRecordType == null && stSearchId == null) {
                            error.create({
                                    name: 'SSS_MISSING_REQD_ARGUMENT',
                                    message: 'search: Missing a required argument. Either stRecordType or stSearchId should be provided.',
                                    notifyOff: false
                            });
                    }

                    var arrReturnSearchResults = [];
                    var objSavedSearch;

                    var maxResults = 1000;

                    if (stSearchId != null) {
                            if(stSearchType != null){
                                    objSavedSearch = search.load({
                                            id: stSearchId,
                                            type: stSearchType
                                    });
                            }else{
                                    objSavedSearch = search.load({
                                            id: stSearchId
                                    });
                            }

                            // add search filter if one is passed
                            if (arrSearchFilter != null) {
                                    if (arrSearchFilter[0] instanceof Array || (typeof arrSearchFilter[0] == 'string')) {
                                            let filterExpression = objSavedSearch.filterExpression;
                                            if(filterExpression.length > 0) {
                                                    filterExpression.push("AND");
                                                    filterExpression.push(arrSearchFilter);
                                                    objSavedSearch.filterExpression = filterExpression;
                                            }else{
                                                    objSavedSearch.filterExpression = arrSearchFilter;
                                            }

                                    } else {
                                            objSavedSearch.filters = objSavedSearch.filters.concat(arrSearchFilter);
                                    }
                            }

                            // add search column if one is passed
                            if (arrSearchColumn != null) {
                                    objSavedSearch.columns = objSavedSearch.columns.concat(arrSearchColumn);
                            }
                    } else {
                            objSavedSearch = search.create({
                                    type: stRecordType
                            });

                            // add search filter if one is passed
                            if (arrSearchFilter != null) {
                                    if (arrSearchFilter[0] instanceof Array || (typeof arrSearchFilter[0] == 'string')) {
                                            let filterExpression = objSavedSearch.filterExpression;
                                            if(filterExpression.length > 0) {
                                                    filterExpression.push("AND");
                                                    filterExpression.push(arrSearchFilter);
                                                    objSavedSearch.filterExpression = filterExpression.concat(arrSearchFilter);
                                            }else{
                                                    objSavedSearch.filterExpression = arrSearchFilter;
                                            }
                                    } else {
                                            objSavedSearch.filters = arrSearchFilter;
                                    }
                            }

                            // add search column if one is passed
                            if (arrSearchColumn != null) {
                                    objSavedSearch.columns = arrSearchColumn;
                            }
                    }

                    var objResultset = objSavedSearch.run();
                    var intSearchIndex = 0;
                    var arrResultSlice = null;
                    do {
                            arrResultSlice = objResultset.getRange(intSearchIndex, intSearchIndex + maxResults);
                            if (arrResultSlice == null) {
                                    break;
                            }

                            arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);
                            intSearchIndex = arrReturnSearchResults.length;
                    }
                    while (arrResultSlice.length >= maxResults);

                    return arrReturnSearchResults;
            };

            const getPaymentRule = (snapshotID, projectID) => {
                let objPaymentRule = null;
                const customrecord_bb_comm_payment_ruleSearchObj = search.create({
                    type: "customrecord_bb_comm_payment_rule",
                    filters:
                        [
                            ["custrecord_bb_comm_payment_snapshot","anyof",snapshotID],
                            "AND",
                            ["custrecord_bb_comm_payment_project","anyof",projectID]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "id",
                                sort: search.Sort.ASC,
                                label: "ID"
                            }),
                            search.createColumn({name: "internalid", label: "Internal ID"}),
                            search.createColumn({name: "custrecord_bb_comm_payment_comm_rule", label: "Commission Rule"}),
                            search.createColumn({name: "custrecord_bb_comm_payment_type", label: "Payment Type"}),
                            search.createColumn({name: "custrecord_bb_comm_payment_pay_method", label: "Payment Method"}),
                            search.createColumn({name: "custrecord_bb_comm_payment_cal_val_int", label: "Calculation Value"}),
                            search.createColumn({name: "custrecord_bb_comm_payment_payee", label: "Commission Payee"}),
                            search.createColumn({name: "custrecord_bb_comm_payment_seq_num", label: "Sequence Number"}),
                            search.createColumn({name: "custrecord_bb_comm_payment_project", label: "Project"}),
                            search.createColumn({name: "custrecord_bb_comm_payment_snapshot", label: "Commission Snap Shot"}),
                            search.createColumn({name: "custrecord_bb_comm_payment_credit_acct", label: "Payment Credit Account"}),
                            search.createColumn({name: "custrecord_bb_comm_payment_debit_acct", label: "Payment Debit Account"}),
                            search.createColumn({name: "custrecord_bb_comm_payment_rule_item", label: "Payment Item"})
                        ]
                });
                customrecord_bb_comm_payment_ruleSearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    objPaymentRule = result;
                    return false;
                });

                return objPaymentRule;
            }

        const getAdderTotal = (project) => {
            var adderTotal = parseFloat(0.00);
            log.debug('project id', project.id);
            var customrecord_bb_project_adderSearchObj = search.create({
                type: "customrecord_bb_project_adder",
                filters:
                    [
                        ["custrecord_bb_project_adder_project.internalid","anyof", project.id],
                        "AND",
                        ["isinactive", "is", "F"]
                    ],
                columns:
                    [
                        "custrecord_bb_adder_total_amount"
                    ]
            });
            var searchResultCount = customrecord_bb_project_adderSearchObj.runPaged().count;
            log.debug("customrecord_bb_project_adderSearchObj result count",searchResultCount);
            customrecord_bb_project_adderSearchObj.run().each(function(result){
                adderTotal += parseFloat(result.getValue({name: 'custrecord_bb_adder_total_amount'}));
                // log.debug('adder total in loop', adderTotal);
                return true;
            });
            // log.debug('adder total', adderTotal);
            return adderTotal;
        }

        //Formats a string to a date
        const stringToDate = (value) => {
            return format.parse({
                value: value,
                type: format.Type.DATE
            });
        }




            return {
                getCurrentPayrollPeriod: getCurrentPayrollPeriod,
                getTotalCommissionPaidAmt: getTotalCommissionPaidAmt,
                getSnapShotRecordAfterDelete: getSnapShotRecordAfterDelete,
                getSuiteletSubtabs: getSuiteletSubtabs,
                isEmpty: isEmpty,
                customSearch: customSearch,
                createSnapshotProcessor: createSnapshotProcessor,
                getSnapshotsToRefresh: getSnapshotsToRefresh,
                getPaymentRule: getPaymentRule,
                getAdderTotal: getAdderTotal,
                stringToDate: stringToDate
            };

    });