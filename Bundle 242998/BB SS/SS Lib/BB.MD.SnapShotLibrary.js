/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Matt Lehman
 * @overview - Commission snap shot library, contains functions to create forms and process sublist results.
 */

define(['N/ui/serverWidget', 'N/search', 'N/url', 'N/config'],

function(serverWidget, search, url, config) {

    /*
    * function createSnapShotSublistFields(context, period, editSublist, config, recType)
    *
    * context - NS Suitelet context containing parameter data
    * period - payroll period selected from main form
    * editSublist - value passed from Suitelet to determine type of suitelet form and sublist to load
    * config - NS configuration record passed in as already loaded NS record using record.load method 
    * recType - value passed from client script to determine form loaded and list results
    */

    function createSnapShotSublistFields(context, period, editSublist, config, recType) {
        if (recType == 'CreateSnapShot' || !recType) {
            var form = serverWidget.createForm({
                title: 'Create Commission Snap Shots'
            });
            var payrollPeriod = form.addField({
                id: 'custpage_payroll_period',
                type: serverWidget.FieldType.SELECT,
                label: 'Select Payroll Period',
                source: 'customrecord_bb_payroll_period'
            });

            var period = context.request.parameters.payrollPeriod;

            var currentPeriod = getCurrentPayrollPeriod();
            log.debug('newest payroll period', currentPeriod);

            payrollPeriod.defaultValue = (period) ? period : currentPeriod;

            var recordType = form.addField({
                id: 'custpage_record_type',
                type: serverWidget.FieldType.TEXT,
                label: 'Record Type'
            });
            recordType.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
            recordType.defaultValue = recType;

            var snapShotSearchId = config.getValue({
                fieldId: 'custrecord_bb_comm_snap_shot_search'
            });

            if (snapShotSearchId) {

                var sublist = form.addSublist({
                    id: 'custpage_snap_shot_list',
                    label: 'Records Available to Add to Snap Shot',
                    type: serverWidget.SublistType.LIST
                });

                sublist = createSuiteletFields(sublist, recType);

                processSnapShotResults(snapShotSearchId, sublist, period, false, false, false);

                sublist.addButton({
                    id: 'custpage_mark_all',
                    label: 'Mark All',
                    functionName: 'markAll(true, "custpage_snap_shot_list")'
                });
                sublist.addButton({
                    id: 'custpage_mark_all',
                    label: 'Unmark All',
                    functionName: 'markAll(false, "custpage_snap_shot_list")'
                });

            } else {
                form.addPageInitMessage({
                    type: message.Type.INFORMATION,
                    message: 'There is no saved search setup on the configuration record for Commission Snap Shots, please see your adminstrator.',
                    duration: 10000
                });
            }

            form.addSubmitButton({
                label: 'Save Commission SnapShot'
            });
            var editSnapShot = form.addButton({
                id: 'custpage_delete_snap_shot',
                label: 'Edit Snap Shot',
                functionName: 'editSnapShot'
            });

            var deleteSnapShot = form.addButton({
                id: 'custpage_delete_snap_shot',
                label: 'Delete Snap Shot',
                functionName: 'deleteSnapShot'
            });

            var createCommJournal = form.addButton({
                id: 'custpage_create_comm_je',
                label: 'Create Commission Journals',
                functionName: 'createCommJe'
            });


            return form;
        }
        
    }

   /*
    * function createSnapShotSublistFields(context, period, editSublist, config, recType)
    *
    * context - NS Suitelet context containing parameter data
    * period - payroll period selected from main form
    * editSublist - value passed from Suitelet to determine type of suitelet form and sublist to load
    * config - NS configuration record passed in as already loaded NS record using record.load method 
    * recType - value passed from client script to determine form loaded and list results
    */

    function createEditSnapShotSublistFields(context, period, editSublist, config, recType) {
            var form = serverWidget.createForm({
                title: 'Edit Commission Snap Shots'
            });
            var payrollPeriod = form.addField({
                id: 'custpage_payroll_period',
                type: serverWidget.FieldType.SELECT,
                label: 'Select Payroll Period',
                source: 'customrecord_bb_payroll_period'
            });
            var recordType = context.request.parameters.recType;
            var period = context.request.parameters.payrollPeriod;

            var currentPeriod = getCurrentPayrollPeriod();
            log.debug('newest payroll period', currentPeriod);

            payrollPeriod.defaultValue = (period) ? period : currentPeriod;

            var recordTypeField = form.addField({
                id: 'custpage_record_type',
                type: serverWidget.FieldType.TEXT,
                label: 'Record Type'
            });
            recordTypeField.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
            recordTypeField.defaultValue = recType;

            var sublist = form.addSublist({
                id: 'custpage_edit_snap_shot',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'Edit Snap Shot Records'
            });

            form.addSubmitButton({
                label: 'Save'
            });

            var returnToHome = form.addButton({
                id: 'custpage_return_to_home',
                label: 'Back',
                functionName: 'returnToHome'
            });

            sublist = createSuiteletFields(sublist, recType);
            sublist.addButton({
                id: 'custpage_mark_all',
                label: 'Mark All',
                functionName: 'markAll(true, "custpage_edit_snap_shot")'
            });
            sublist.addButton({
                id: 'custpage_mark_all',
                label: 'Unmark All',
                functionName: 'markAll(false, "custpage_edit_snap_shot")'
            });

            var showButton = processSnapShotResults('customsearch_bb_edit_comm_snap_shot', sublist, period, true, false);
            if (showButton) {
                var refresh = form.addButton({
                    id: 'custpage_refesh_list',
                    label: 'Refresh Snap Shot',
                    functionName: 'refreshSnapShot'
                });
            }
            
            return form;
        
    }

    function createSnapShotJournalSublistFields(context, period, editSublist, config, recType) {
        var form = serverWidget.createForm({
            title: 'Create Commission Snap Shot Journal Entries'
        });

        var payrollPeriod = form.addField({
            id: 'custpage_payroll_period',
            type: serverWidget.FieldType.SELECT,
            label: 'Select Payroll Period',
            source: 'customrecord_bb_payroll_period'
        });

        var recordType = form.addField({
            id: 'custpage_record_type',
            type: serverWidget.FieldType.TEXT,
            label: 'Record Type'
        });
        recordType.updateDisplayType({
            displayType : serverWidget.FieldDisplayType.HIDDEN
        });
        recordType.defaultValue = 'SnapShotJE';
        payrollPeriod.defaultValue = period;

        var jeDate = form.addField({
            id: 'custpage_journal_date',
            type: serverWidget.FieldType.DATE,
            label: 'Journal Date'
        });

        var payrollLookup = search.lookupFields({
            type: 'customrecord_bb_payroll_period',
            id: period,
            columns: ['custrecord_bb_payroll_end_date']
        });

        var periodEndDate = payrollLookup.custrecord_bb_payroll_end_date;
        jeDate.defaultValue = (periodEndDate) ? periodEndDate : null;

        var sublist = form.addSublist({
            id: 'custpage_snap_shot_je_list',
            type: serverWidget.SublistType.LIST,
            label: 'Commission Snap Shot Records'
        });

        sublist = createSuiteletFields(sublist, 'SnapShotJE');
        sublist.addButton({
            id: 'custpage_mark_all',
            label: 'Mark All',
            functionName: 'markAll(true, "custpage_snap_shot_je_list")'
        });
        sublist.addButton({
            id: 'custpage_mark_all',
            label: 'Unmark All',
            functionName: 'markAll(false, "custpage_snap_shot_je_list")'
        });

        var showButton = processSnapShotResults('customsearch_bb_edit_comm_snap_shot', sublist, period, false, false, true);
        if (showButton) {
            var refresh = form.addButton({
                id: 'custpage_refesh_list',
                label: 'Refresh Snap Shot',
                functionName: 'refreshSnapShot'
            });
        }

        form.addSubmitButton({
            label: 'Create Commission Snap Shot Journals'
        });

        var returnToHome = form.addButton({
            id: 'custpage_return_to_home',
            label: 'Back',
            functionName: 'returnToHome'
        });




        return form;

    }


    function createDeleteSublist(context, payrollPeriod, recType) {
            var form = serverWidget.createForm({
                title: 'Delete Snap Shot'
            });

            var period = form.addField({
                id: 'custpage_payroll_period',
                type: serverWidget.FieldType.SELECT,
                label: 'Select Payroll Period',
                source: 'customrecord_bb_payroll_period'
            });

            var recordType = form.addField({
                id: 'custpage_record_type',
                type: serverWidget.FieldType.TEXT,
                label: 'Record Type'
            });
            recordType.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
            recordType.defaultValue = recType;

            log.debug('payroll period', payrollPeriod);

            var currentPeriod = getCurrentPayrollPeriod();
            log.debug('newest payroll period', currentPeriod);

            period.defaultValue = (payrollPeriod) ? payrollPeriod : currentPeriod;

            if (payrollPeriod) {

                var sublist = form.addSublist({
                    id: 'custpage_delete_snap_shot_list',
                    type: serverWidget.SublistType.LIST,
                    label: 'Commission Snap Shot Records'
                });

                sublist = createSuiteletFields(sublist, recType);

                 processSnapShotResults('customsearch_bb_edit_comm_snap_shot', sublist, payrollPeriod, false, true);

                sublist.addButton({
                    id: 'custpage_mark_all',
                    label: 'Mark All',
                    functionName: 'markAll(true, "custpage_delete_snap_shot_list")'
                });
                sublist.addButton({
                    id: 'custpage_mark_all',
                    label: 'Unmark All',
                    functionName: 'markAll(false, "custpage_delete_snap_shot_list")'
                });

            } else {
                form.addPageInitMessage({
                    type: message.Type.INFORMATION,
                    message: 'There is no saved search setup on the configuration record for Commission Snap Shots, please see your adminstrator',
                    duration: 10000
                });
            }

            form.addSubmitButton({
                label: 'Delete Snap Shot'
            });
            var returnToHome = form.addButton({
                id: 'custpage_return_to_home',
                label: 'Back',
                functionName: 'returnToHome'
            });


            return form;
    }

    function createSuiteletFields(sublist, recType) {

        var checkBox = sublist.addField({
            id: 'custpage_check_box',
            type: serverWidget.FieldType.CHECKBOX,
            label: 'Mark'
        });
        log.debug('record type when creating sublist fields', recType);
        if (recType == 'SnapShotJE') {
            checkBox.defaultValue = 'T';
        }

        var urlLink = sublist.addField({
            id: 'custpage_url',
            type: serverWidget.FieldType.URL,
            label: 'Project Link'
        });
        urlLink.linkText = 'View Project';

        var project = sublist.addField({
            id: 'custpage_project',
            type: serverWidget.FieldType.SELECT,
            label: 'Project',
            source: 'job'
        });

        var salesRep = sublist.addField({
            id: 'custpage_salesrep',
            type: serverWidget.FieldType.SELECT,
            label: 'Sales Rep',
            source: 'employee'
        });

        var commissionAmt = sublist.addField({
            id: 'custpage_comm_amount',
            type: serverWidget.FieldType.FLOAT,
            label: 'Commission Amount Owed'
        });

        var commissionCalcAmt = sublist.addField({
            id: 'custpage_comm_calc_amount',
            type: serverWidget.FieldType.FLOAT,
            label: 'Commission Calculated Amount'
        });

        var commOverrideAmt = sublist.addField({
            id: 'custpage_comm_override_amount',
            type: serverWidget.FieldType.FLOAT,
            label: 'Commission Override Amount'
        });

        var paidCommAmount = sublist.addField({
            id: 'custpage_comm_paid_amount',
            type: serverWidget.FieldType.FLOAT,
            label: 'Commission Paid Amount'
        });

        var manualPaidAmount = sublist.addField({
            id: 'custpage_manual_paid_amount',
            type: serverWidget.FieldType.FLOAT,
            label: 'Manual Paid Commission Amount'
        });
        var journal = sublist.addField({
            id: 'custpage_journal_entry',
            type: serverWidget.FieldType.SELECT,
            label: 'Journal Entry',
            source: 'transaction'
        });
        var snapShotId = sublist.addField({
            id: 'custpage_internalid',
            type: serverWidget.FieldType.INTEGER,
            label: 'Snap Shot ID'
        });

        var payRollPeriod = sublist.addField({
            id: 'custpage_pay_period',
            type: serverWidget.FieldType.INTEGER,
            label: 'Payroll Period'
        });
        if (recType == 'EditSnapShot') {
            urlLink.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
            project.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.DISABLED
            });
            salesRep.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.DISABLED
            });
            // commissionAmt.updateDisplayType({
            //     displayType : serverWidget.FieldDisplayType.ENTRY
            // });
            commissionCalcAmt.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.DISABLED
            });
            commOverrideAmt.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.DISABLED
            });
            paidCommAmount.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.DISABLED
            });
            manualPaidAmount.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.DISABLED
            });

            journal.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.INLINE
            });

            snapShotId.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
            payRollPeriod.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
            urlLink.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
        }

        if (recType == 'DeleteSnapShot' || recType == 'SnapShotJE' || recType == 'CreateSnapShot') {

            project.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.INLINE
            });

            salesRep.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.INLINE
            });

            journal.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.INLINE
            });
            payRollPeriod.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
            snapShotId.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
        }
        return sublist
    }


    function setSnapShotSublistValues(sublist, lineNum, snapShotObj, accountId) {
        // setting sublist values
        //log.debug('setting sublist values from saved search');

        if (snapShotObj.project) {
            sublist.setSublistValue({
                id: 'custpage_project',
                line: lineNum,
                value: snapShotObj.project
            });
        }

        if (snapShotObj.salesRep) {
            sublist.setSublistValue({
                id: 'custpage_salesrep',
                line: lineNum,
                value: snapShotObj.salesRep
            });
        }

        if (snapShotObj.commissionAmt) {
            sublist.setSublistValue({
                id: 'custpage_comm_amount',
                line: lineNum,
                value: snapShotObj.commissionAmt
            });
        }
        if (snapShotObj.commissionCalcAmt) {
            sublist.setSublistValue({
                id: 'custpage_comm_calc_amount',
                line: lineNum,
                value: snapShotObj.commissionCalcAmt
            });
        }

        if (snapShotObj.salesRepOverRideAmt) {
            sublist.setSublistValue({
                id: 'custpage_comm_override_amount',
                line: lineNum,
                value: snapShotObj.salesRepOverRideAmt
            });
        }

        if (snapShotObj.paidCommAmt) {
            sublist.setSublistValue({
                id: 'custpage_comm_paid_amount',
                line: lineNum,
                value: snapShotObj.paidCommAmt
            });
        }

        if (snapShotObj.manualPaidAmt) {
            sublist.setSublistValue({
                id: 'custpage_manual_paid_amount',
                line: lineNum,
                value: snapShotObj.manualPaidAmt
            });
        }
        if (snapShotObj.journal) {
            sublist.setSublistValue({
                id: 'custpage_journal_entry',
                line: lineNum,
                value: snapShotObj.journal
            });
        }
        if (snapShotObj.snapShotId) {
            sublist.setSublistValue({
                id: 'custpage_internalid',
                line: lineNum,
                value: snapShotObj.snapShotId
            });
        }

        if (snapShotObj.payPeriod) {
            sublist.setSublistValue({
                id: 'custpage_pay_period',
                line: lineNum,
                value: snapShotObj.payPeriod
            });
        }
        if (snapShotObj.url) {
            var fullurl = 'https://' + accountId + '.app.netsuite.com/app/accounting/project/project.nl?id=' + snapShotObj.url
            sublist.setSublistValue({
                id: 'custpage_url',
                line: lineNum,
                value:fullurl
            });
        }

    }

    function processSnapShotResults(searchId, sublist, payrollPeriod, editSublist, deleteSublist, createJe) {

        log.debug('search id', searchId);
        log.debug('sublist', sublist);
        log.debug('payroll period', payrollPeriod);

        var companyInfo = config.load({
            type: config.Type.COMPANY_INFORMATION
        });
        var accountNum = companyInfo.getValue({
            fieldId: 'companyid'
        });
        var accountId = '';
        var pattern = new RegExp(/[_]/);
        var patternNumber = new RegExp(/[1]/);
        if (pattern.test(accountNum)) {
            var sbacctId = accountNum.split('_').shift();
            var number = accountNum.split('_').pop();
            accountId = sbacctId + '-' + number;
        } else {
            accountId = accountNum;
        }

        var snapShotSearch = search.load({
            id: searchId
        });
        var currentPeriod = getCurrentPayrollPeriod();
        var pPeriod = (payrollPeriod) ? payrollPeriod : currentPeriod;
        if (!editSublist && !deleteSublist && !createJe) {
            //for create snap shot list
            var formulaTxt = 'formulanumeric: CASE WHEN {custentity_bb_comm_snap_shot_record.custrecord_bb_comm_snap_shot_journal.id} IS NOT NULL AND {custentity_bb_paid_comm_amount} != NVL({custentity_bb_sales_rep_comm_amt_overrid}, NVL({custentity_bb_sales_rep_comm_amt},0)) AND {custentity_bb_snap_shot_pay_roll_period.id} < ' + pPeriod + ' THEN 1 ELSE 0 END';
            var textString = String(formulaTxt);
            log.debug('filters add sublist', textString);
            var payPeriodFilter = ["OR", [textString, "equalto","1"]];

            var periodFilter = snapShotSearch.filterExpression.concat(payPeriodFilter);
            snapShotSearch.filterExpression = periodFilter;

        } else if (editSublist && !deleteSublist) {
            //for editing snap shot
            var additionalFilters = [["custrecord_bb_comm_snap_shot_pay_period","anyof", pPeriod]];
            log.debug('filters edit sublist', additionalFilters);
            var newFilterExpression = snapShotSearch.filterExpression.concat(additionalFilters);
            snapShotSearch.filterExpression = newFilterExpression;

        } else if (!editSublist && deleteSublist) {
            // deleting snap shot records
            var additionalDeleteFilters = [["custrecord_bb_comm_snap_shot_pay_period","anyof", pPeriod], "AND", ["custrecord_bb_comm_snap_shot_journal","anyof","@NONE@"]];
            var newDeleteFilterExpression = snapShotSearch.filterExpression.concat(additionalDeleteFilters);
            snapShotSearch.filterExpression = newDeleteFilterExpression;

        } else if (!editSublist && !deleteSublist && createJe) {
            //create journal entry records
            var additionalFilters = [["custrecord_bb_comm_snap_shot_pay_period","anyof", payrollPeriod], "AND", ["custrecord_bb_comm_snap_shot_journal","anyof","@NONE@"]];
            var newFilterExpression = snapShotSearch.filterExpression.concat(additionalFilters);
            snapShotSearch.filterExpression = newFilterExpression;

        } else {
            //do nothing
        }

        var lineHasJE = [];
        var resultIndex = 0;
        var resultStep = 1000; 
        if (!editSublist && !deleteSublist && !createJe) {
            log.debug('add new records');
            do {
                var resultSet = snapShotSearch.run();
                var results = resultSet.getRange({
                    start : resultIndex,
                    end : resultIndex + resultStep
                });

                for (var i = 0; i < results.length; i++) {
                    var snapShotObj = {};
                    snapShotObj.project = results[i].getValue({
                        name : resultSet.columns[0],
                        summary: 'GROUP'
                    });

                    snapShotObj.salesRep = results[i].getValue({
                        name : resultSet.columns[1],
                        summary: 'GROUP'
                    });
                    snapShotObj.commissionAmt = results[i].getValue({
                        name : resultSet.columns[2],
                        summary: 'MAX'
                    });
                    snapShotObj.salesRepOverRideAmt = results[i].getValue({
                        name : resultSet.columns[3],
                        summary: 'MAX'
                    });
                    snapShotObj.paidCommAmt = results[i].getValue({
                        name : resultSet.columns[4],
                        summary: 'MAX'
                    });
                    snapShotObj.manualPaidAmt = results[i].getValue({
                        name : resultSet.columns[5],
                        summary: 'MAX'
                    });
                    snapShotObj.journal = results[i].getValue({
                        name : resultSet.columns[6],
                        summary: 'MAX'
                    });
                    snapShotObj.snapShotId = results[i].getValue({
                        name : resultSet.columns[7],
                        summary: 'MAX'
                    });
                    snapShotObj.payPeriod = results[i].getValue({
                        name : resultSet.columns[8],
                        summary: 'MAX'
                    });
                    snapShotObj.url = results[i].getValue({
                        name : resultSet.columns[9],
                        summary: 'MAX'
                    });
                    snapShotObj.commissionCalcAmt = results[i].getValue({
                        name : resultSet.columns[10],
                        summary: 'MAX'
                    });
                    if (results[i].getValue({name: resultSet.columns[6], summary: 'MAX'})) {
                        lineHasJE.push(1)
                    }

                    setSnapShotSublistValues(sublist, i, snapShotObj, accountId);
                }

                resultIndex = resultIndex + resultStep;

            } while (results.length > 0)

        } else {
            log.debug('edit or delete sublist');
            do {
                var resultSet = snapShotSearch.run();
                var results = resultSet.getRange({
                    start : resultIndex,
                    end : resultIndex + resultStep
                });

                for (var i = 0; i < results.length; i++) {
                    var snapShotObj = {};
                    snapShotObj.project = results[i].getValue({
                        name : resultSet.columns[0]
                    });
                    snapShotObj.salesRep = results[i].getValue({
                        name : resultSet.columns[1]
                    });
                    snapShotObj.commissionAmt = results[i].getValue({
                        name : resultSet.columns[2]
                    });
                    snapShotObj.salesRepOverRideAmt = results[i].getValue({
                        name : resultSet.columns[3]
                    });
                    snapShotObj.paidCommAmt = results[i].getValue({
                        name : resultSet.columns[4]
                    });
                    snapShotObj.manualPaidAmt = results[i].getValue({
                        name : resultSet.columns[5]
                    });
                    snapShotObj.journal = results[i].getValue({
                        name : resultSet.columns[6]
                    });
                    snapShotObj.snapShotId = results[i].getValue({
                        name : resultSet.columns[7]
                    });
                    snapShotObj.payPeriod = results[i].getValue({
                        name : resultSet.columns[8]
                    });
                    snapShotObj.url = results[i].getValue({
                        name : resultSet.columns[9]
                    });
                    snapShotObj.commissionCalcAmt = results[i].getValue({
                        name : resultSet.columns[10]
                    });
                    if (results[i].getValue({name: resultSet.columns[6]})) {
                        lineHasJE.push(1)
                    }

                    setSnapShotSublistValues(sublist, i, snapShotObj, accountId);
                }

                resultIndex = resultIndex + resultStep;

            } while (results.length > 0)
        }
        if ((results.length != lineHasJE.length) || lineHasJE.length == 0) {
            return true
        } else {
            return false
        }
        
    }

    function getCurrentPayrollPeriod() {
        var period;
        var customrecord_bb_payroll_periodSearchObj = search.create({
           type: "customrecord_bb_payroll_period",
           filters:
           [
           ],
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
        var searchResultCount = customrecord_bb_payroll_periodSearchObj.runPaged().count;
        log.debug("customrecord_bb_payroll_periodSearchObj result count",searchResultCount);
        customrecord_bb_payroll_periodSearchObj.run().each(function(result){
            period = result.getValue({
                name: 'internalid',
                summary: 'GROUP'
            })
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
            log.debug("customrecord_bb_commission_snap_shotSearchObj result count",searchResultCount);
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
            log.debug("customrecord_bb_commission_snap_shotSearchObj result count",searchResultCount);
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


    return {
        createSnapShotSublistFields: createSnapShotSublistFields,
        createEditSnapShotSublistFields: createEditSnapShotSublistFields,
        createDeleteSublist: createDeleteSublist,
        getCurrentPayrollPeriod: getCurrentPayrollPeriod,
        getTotalCommissionPaidAmt: getTotalCommissionPaidAmt,
        getSnapShotRecordAfterDelete: getSnapShotRecordAfterDelete,
        createSnapShotJournalSublistFields: createSnapShotJournalSublistFields
    };
    
});
