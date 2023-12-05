/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Matt Lehman
 * @fileOverview Execute Wip Accrual
 */

/**
 * Copyright 2017-2020 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/record', 'N/search', 'N/format'], function(record, search, format) {

    /**
     * getRevenueAmount(searchId, projectId) - function used to return Revenue amount per project
     * @param config - NS bb configuration record loaded
     * @param projectId - project internal id - used to filter down result
     * @param startDate - start date of transaction search
     * @param endDate - end date of transaction search
     * @returns {Number} - returns revenue amount
     */
    function getRevenueAmount(config, projectId, startDate) {
        var revenueAmount = 0;
        var revenueArray = [];
        if (config) {
            var lookBySegment = config.getValue({fieldId: 'custrecord_bbss_wip_by_project_segment'})
            if (lookBySegment) {
                var segmentValue = getProjectSegmentByProjectId(projectId);
            }
            var searchId = config.getValue({fieldId: 'custrecord_bb_wip_revenue_saved_search'});
            if (searchId && projectId) {
                var revAmountSearch = search.load({
                    id: searchId
                });
                if (startDate) {
                    var dateFilters = ["AND", ["trandate", "onorbefore", startDate]];
                    var dateFilterExpression = revAmountSearch.filterExpression.concat(dateFilters);
                    revAmountSearch.filterExpression = dateFilterExpression;
                }
                revAmountSearch.run().each(function (result) {
                    var obj = {};
                    obj['projectId'] = parseInt(result.getValue(revAmountSearch.columns[0]));
                    obj['amount'] = (result.getValue(revAmountSearch.columns[1]) > 0) ? parseFloat(result.getValue(revAmountSearch.columns[1])) : 0;
                    revenueArray.push(obj);
                    return true;
                });
                log.debug('revenueArray', revenueArray);
                if (lookBySegment) projectId = segmentValue;
                var revenueObj = getAmountFromProject(revenueArray, projectId);
                log.debug('revenue amount', revenueObj);
                if (revenueObj != -1) {
                    revenueAmount = revenueObj.amount;
                }
            }
        }
        return revenueAmount;
    }

    /**
     * getCogsAmount(searchId, projectId) - function used to return COGS amount per project
     * @param config - NS bb configuration record loaded
     * @param projectId - project internal id - used to filter down results
     * @param startDate - start date of transaction search
     * @param endDate - end date of transaction search
     * @returns {Number} - returns cogs amount
     */
    function getCogsAmount(config, projectId, startDate, endDate) {
        var cogsAmount = 0;
        var cogsArray = [];
        if (config) {
            var lookBySegment = config.getValue({fieldId: 'custrecord_bbss_wip_by_project_segment'})
            if (lookBySegment) {
                var segmentValue = getProjectSegmentByProjectId(projectId);
            }
            var searchId = config.getValue({fieldId: 'custrecord_bb_wip_cogs_saved_search'});
            if (searchId && projectId) {
                var cogsAmountSearch = search.load({
                    id: searchId
                });
                // Used for WIP Records
                if (startDate && endDate) {
                    var sDate = createDateString(startDate);
                    var eDate = createDateString(endDate);
                    var dateFilters = ["AND", ["trandate", "within", sDate, eDate]];
                    var dateFilterExpression = cogsAmountSearch.filterExpression.concat(dateFilters);
                    cogsAmountSearch.filterExpression = dateFilterExpression;
                } else if (!startDate && endDate) { // used for percent complete records
                    var sDate = createDateString(startDate);
                    var eDate = createDateString(endDate);
                    var dateFilters = ["AND", ["trandate", "onorbefore", eDate]];
                    var dateFilterExpression = cogsAmountSearch.filterExpression.concat(dateFilters);
                    cogsAmountSearch.filterExpression = dateFilterExpression;
                }
                cogsAmountSearch.run().each(function (result) {
                    var obj = {};
                    obj['projectId'] = parseInt(result.getValue(cogsAmountSearch.columns[0]));
                    obj['amount'] = (result.getValue(cogsAmountSearch.columns[1]) > 0) ? parseFloat(result.getValue(cogsAmountSearch.columns[1])) : 0;
                    cogsArray.push(obj);
                    return true;
                });
                log.debug('cogsArray', cogsArray);
                if (lookBySegment) projectId = segmentValue;
                var cogsObj = getAmountFromProject(cogsArray, projectId);
                log.debug('cogs amount', cogsObj);
                if (cogsObj != -1) {
                    cogsAmount = cogsObj.amount;
                }
            }
        }
        return cogsAmount;
    }

    /**
     * getProjectedCogsAmount(projectId, config)
     * @param projectId - integer
     * @param config - bb configuration record loaded in NS
     * @returns {number}
     */
    function getProjectedCogsAmount(projectId, config) {
        var amount = 0;
        var projectedCogsArray = [];
        if (config.getValue({fieldId: 'custrecord_bb_wip_projected_cogs_srch'})) {
            var lookBySegment = config.getValue({fieldId: 'custrecord_bbss_wip_by_project_segment'})
            if (lookBySegment) {
                var segmentValue = getProjectSegmentByProjectId(projectId);
            }
            var projectedCogsSearch = search.load({
                id: config.getValue({fieldId: 'custrecord_bb_wip_projected_cogs_srch'})
            });
            projectedCogsSearch.run().each(function(result) {
                var obj = {};
                obj['projectId'] = parseInt(result.getValue(projectedCogsSearch.columns[0]));
                obj['amount'] = (result.getValue(projectedCogsSearch.columns[1]) > 0) ? parseFloat(result.getValue(projectedCogsSearch.columns[1])) : 0;
                projectedCogsArray.push(obj);
                return true;
            });
            log.debug('projectedCogsArray', projectedCogsArray);
            if (lookBySegment) projectId = segmentValue;
            var projectedCogsObj = getAmountFromProject(projectedCogsArray, projectId);
            log.debug('projectedCogsObj amount', projectedCogsObj);
            if (projectedCogsObj != -1) {
                amount = projectedCogsObj.amount;
            }
        }
        return amount;
    }


    /**
     * getProjectCalculatedContractValue(projectId, config)
     * @param projectId - integer
     * @param config - bb configuration record loaded in NS
     * @returns {number}
     */
    function getProjectCalculatedContractValue(projectId, config) {
        var amount = 0;
        var tcvArray = [];
        if (config) {
            var lookBySegment = config.getValue({fieldId: 'custrecord_bbss_wip_by_project_segment'})
            if (lookBySegment) {
                var segmentValue = getProjectSegmentByProjectId(projectId);
            }
        }
        if (config.getValue({fieldId: 'custrecord_bb_wip_tcv_saved_search'})) {
            var tcvSearch = search.load({
                id: config.getValue({fieldId: 'custrecord_bb_wip_tcv_saved_search'})
            });
            tcvSearch.run().each(function(result) {
                var obj = {};
                obj['projectId'] = parseInt(result.getValue(tcvSearch.columns[0]));
                obj['amount'] = (result.getValue(tcvSearch.columns[1]) > 0) ? parseFloat(result.getValue(tcvSearch.columns[1])) : 0;
                tcvArray.push(obj);
                return true;
            });
            log.debug('tcvArray', tcvArray);
            if (lookBySegment) projectId = segmentValue;
            var tcvObj = getAmountFromProject(tcvArray, projectId);
            log.debug('Total Contract Value amount', tcvObj);
            if (tcvObj != -1) {
                amount = tcvObj.amount;
            }
        }
        return amount;
    }


    /**
     * createWIPAccrualRecord(wipId, projectId, config, revenueAmount, cogsAmount, costByPercent)
     * @param wipId - integer
     * @param projectId - integer
     * @param config - bb configuration record loaded from NS
     * @param revenueAmount - currency
     * @param cogsAmount - currency
     * @param projectedCogsAmount - currency
     * @param costByPercent - boolean
     */
    function createWIPAccrualRecord(wipId, project, config, revenueAmount, cogsAmount, projectedCogsAmount, costByPercent, periodObj, locationDeptClassObj) {
        log.debug('wipid', wipId)
        var accountingPeriod = null;
        if (wipId) {
            var wipRecord = record.load({
                type: 'customrecord_bb_project_wip_by_period',
                id: wipId,
                isDynamic: true
            });
        } else {
            var wipRecord = record.create({
                type: 'customrecord_bb_project_wip_by_period',
                isDynamic: true
            });
        }
        wipRecord.setValue({
            fieldId: 'custrecord_bb_project_wip_project',
            value: project.id
        });
        // date functions
        if (!periodObj) {
            var today = new Date();
            var currentMonthNum = getCurrentMonth(today);
            var previousMonth = getPreviousMonth(today);
            var currentYear = getCurrentYear(today);
            var monthAbbrev = convertMonthToAbbrev(previousMonth);
            var accountingPeriodString = monthAbbrev + ' ' + currentYear
            accountingPeriod = getPeriodDetailsByName(accountingPeriodString);
        } else {
            accountingPeriod = periodObj;
        }

        wipRecord.setValue({
            fieldId: 'custrecord_bb_project_wip_period',
            value: accountingPeriod.internalid
        });

        // config percent complete journal entry accounts
        var wipCreditAccount = config.getValue({fieldId: 'custrecord_bb_wip_account'});
        var wipDebitAccount = config.getValue({fieldId: 'custrecord_bb_pre_dev_expenses_account'});

        // config cost by percent journal entry accounts
        var costByPercentCreditAccount = config.getValue({fieldId: 'custrecord_bb_unbilled_revenue_account'});
        var costByPercentDebitAccountOver = config.getValue({fieldId: 'custrecord_bb_unrecognized_reven_account'});
        var costByPercentDebitAccountUnder = config.getValue({fieldId: 'custrecord_bb_unrecog_reven_acct_under'});

        var totalContractValue = 0;
        var calculatedTcv = getProjectCalculatedContractValue(project.id, config);
        if (calculatedTcv > 0) {
            totalContractValue = calculatedTcv;
        } else {
            totalContractValue = project.getValue({fieldId: 'custentity_bb_fin_prelim_purch_price_amt'});
        }

        wipRecord.setValue({
            fieldId: 'custrecord_bb_actual_cost_amt',
            value: cogsAmount
        });
        wipRecord.setValue({
            fieldId: 'custrecord_bb_wip_projected_cogs_exp_amt',
            value: projectedCogsAmount
        });
        wipRecord.setValue({
            fieldId: 'custrecord_bb_wip_actual_revenue_amt',
            value: revenueAmount
        });

        // generate cost by percent journal
        if (costByPercent) {
            var totalCogsPercentAmt = parseFloat(cogsAmount) / parseFloat(projectedCogsAmount);
            log.debug('totalCogsPercentAmt', totalCogsPercentAmt);
            wipRecord.setValue({
                fieldId: 'custrecord_bb_wip_total_cogs_percnt_amt',
                value: totalCogsPercentAmt
            });
            if (totalCogsPercentAmt) {
                var totalRevToRecognize = parseFloat(totalContractValue) * totalCogsPercentAmt;
                var revenueToRecognizeJeTotal = totalRevToRecognize - revenueAmount;
                log.debug('totalRevToRecognize', totalRevToRecognize);
                log.debug('revenueToRecognize', revenueToRecognizeJeTotal);
                wipRecord.setValue({
                    fieldId: 'custrecord_bb_total_rev_to_date_amt',
                    value: totalRevToRecognize
                });
            }
            var costByPercentDebitAcct = null;
            if (totalRevToRecognize < revenueAmount) {
                costByPercentDebitAcct = costByPercentDebitAccountOver
            } else {
                costByPercentDebitAcct = costByPercentDebitAccountUnder
            }
            if (totalCogsPercentAmt < 1) {
                var jeId = createJournal(project, revenueToRecognizeJeTotal, costByPercentDebitAcct, costByPercentCreditAccount, config, costByPercent, periodObj, locationDeptClassObj);
                wipRecord.setValue({
                    fieldId: 'custrecord_bb_project_wip_journal',
                    value: jeId
                });
            } else if (totalCogsPercentAmt > 1) { // create journal to equal exactly 100%
                var cogsPercentTo100 = 1; // gives the left over percent over 100%
                var totalRevToRec = parseFloat(totalContractValue) * cogsPercentTo100;
                var updatedRevenueToRecognizeJeTotal = totalRevToRec - revenueAmount;
                log.debug('totalRevToRecognize to equal total to 100%', totalRevToRec);
                log.debug('revenueToRecognize  to equal total to 100%', updatedRevenueToRecognizeJeTotal);
                var isWIPCompleted = checkProjectWIPCompleted(project.id);
                if (!isWIPCompleted) {
                    var jeId = createJournal(project, updatedRevenueToRecognizeJeTotal, costByPercentDebitAcct, costByPercentCreditAccount, config, costByPercent, periodObj, locationDeptClassObj);
                    wipRecord.setValue({
                        fieldId: 'custrecord_bb_project_wip_journal',
                        value: jeId
                    });
                    wipRecord.setValue({
                        fieldId: 'custrecord_bb_wip_total_cogs_percnt_amt',
                        value: 1
                    });
                }
            }
            wipRecord.setValue({ // 2 = Cost By Percent
                fieldId: 'custrecord_bb_wip_journal_type',
                value: 2
            });


        } else { // execute wip journal
            wipRecord.setValue({
                fieldId: 'custrecord_bb_actual_cost_amt',
                value: cogsAmount
            });
            // reversed the account parameters per Spencer from detailed testing with client
            var jeId = createJournal(project, cogsAmount, wipCreditAccount, wipDebitAccount, config, costByPercent, periodObj, locationDeptClassObj);
            wipRecord.setValue({
                fieldId: 'custrecord_bb_project_wip_journal',
                value: jeId
            });
            wipRecord.setValue({ // 2 = Cost By Percent
                fieldId: 'custrecord_bb_wip_journal_type',
                value: 1
            });
        }

        wipRecord.save({
            ignoreMandatoryFields: true
        });

    }

    /**
     * createJournal(project, amount, debitAccount, creditAccount, config)
     * @param project - scriptContext.newRecord - NS project
     * @param amount - currency: amount of journal entry
     * @param debitAccount - integer
     * @param creditAccount - integer
     * @param config - bb configuration record loaded from NS
     * @returns jeId  journal entry internal id
     */
    function createJournal(project, amount, debitAccount, creditAccount, config, costByPercent, periodObj, locationDeptClassObj) {
        log.debug('periodObj', periodObj);
        log.debug('amount', amount);
        log.debug('debitAccount', debitAccount);
        log.debug('creditAccount', creditAccount);
        var journal = record.create({
            type: record.Type.JOURNAL_ENTRY,
            isDynamic: true
        });
        if (!periodObj) {
            journal.setValue({
                fieldId: 'trandate',
                value: getLastDayOfPreviousMonth()
            });
        } else {
            journal.setValue({
                fieldId: 'trandate',
                value: periodObj.enddate
            });
        }
        if (config.getValue({fieldId: 'custrecord_bb_ss_has_subsidiaries'})) {
            journal.setValue({
                fieldId: 'subsidiary',
                value: project.getValue({fieldId: 'subsidiary'})
            });
        }
        // reversal date update with known reversal date
        if (costByPercent) {
            journal.setValue({
                fieldId: 'reversaldate',
                value: (!periodObj) ? getFirstDayOfCurrentMonth() : getLastDayOfCurrentMonthWithDate(periodObj.startdate)
            });
        }
        var memo = 'WIP Accrual';
        log.debug('journal entry line amount', amount);
        addJournalLine(journal, debitAccount, amount, project.id, memo, true, locationDeptClassObj); // add debit line
        addJournalLine(journal, creditAccount, amount, project.id, memo, false, locationDeptClassObj); // add credit line
        var jeId = journal.save({
            ignoreMandatoryFields: true
        });
        return jeId;
    }

    /**
     * addJournalLine(journal, accountId, amount, projectId, memo, isDebit)
     * @param journal - NS journal record
     * @param accountId - integer
     * @param amount - currency
     * @param projectId - integer
     * @param memo - string
     * @param isDebit - boolean
     */
    function addJournalLine(journal, accountId, amount, projectId, memo, isDebit, locationDeptClassObj) {
        journal.selectNewLine({
            sublistId: 'line'
        });
        journal.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: 'account',
            value: accountId
        });
        journal.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: (isDebit) ? 'debit' : 'credit',
            value: amount
        });
        journal.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: 'entity',
            value: projectId
        });
        journal.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: 'memo',
            value: memo
        });
        if (locationDeptClassObj.wipLocation) {
            journal.setCurrentSublistValue({
                sublistId: 'line',
                fieldId: 'location',
                value: locationDeptClassObj.wipLocation
            });
        }
        if (locationDeptClassObj.wipDepartment) {
            journal.setCurrentSublistValue({
                sublistId: 'line',
                fieldId: 'department',
                value: locationDeptClassObj.wipDepartment
            });
        }
        if (locationDeptClassObj.wipClass) {
            journal.setCurrentSublistValue({
                sublistId: 'line',
                fieldId: 'class',
                value: locationDeptClassObj.wipClass
            });
        }
        journal.commitLine({
            sublistId: 'line'
        });
    }

    /**
     * createDateString(date) - function used to create a date string for saved searches
     * @param date - date object
     * @returns {string} - returns date sting : '12/25/2020'
     */
    function createDateString(date) {
        var today = new Date(date);
        var formatedDate = format.format({
            value: today,
            type: format.Type.DATE,
            //timezone: format.Timezone.AMERICA_CHICAGO
        });
        log.debug('formattedDate', formatedDate);

        var MM = today.getMonth() + 1;
        var DD = today.getDate();
        var YYYY = today.getFullYear();

        var dateString = MM + '/' + DD + '/' + YYYY;
        log.debug('todays date', dateString);
        return dateString;
    }

    /**
     * getCurrentYear(date) - returns current year in number format
     * @param date - date object
     * @returns {Number}
     */
    function getCurrentYear(date) {
        var today = new Date(date);
        var formatedDate = format.format({
            value: today,
            type: format.Type.DATE,
            //timezone: format.Timezone.AMERICA_CHICAGO
        });
        log.debug('formattedDate', formatedDate);
        return  today.getFullYear();
    }

    /**
     * getCurrentMonth(date) Returns current month in number format
     * @param date - date objct
     * @returns {number}
     */
    function getCurrentMonth(date) {
        var today = new Date(date);
        var formatedDate = format.format({
            value: today,
            type: format.Type.DATE,
            //timezone: format.Timezone.AMERICA_CHICAGO
        });
        log.debug('formattedDate', formatedDate);

        var MM = today.getMonth() + 1;
        return MM;
    }

    /**
     * getPreviousMonth(date) Returns previous month in number format
     * @param date - date object
     * @returns {Number} Month in number format
     */
    function getPreviousMonth(date) {
        var today = new Date(date);
        var formatedDate = format.format({
            value: today,
            type: format.Type.DATE,
            //timezone: format.Timezone.AMERICA_CHICAGO
        });
        log.debug('formattedDate', formatedDate);

        var MM = today.getMonth();
        return MM;
    }

    /**
     * convertMonthToAbbrev(monthNumber)
     * @param monthNumber - Month in number form
     * @returns {string|number}
     */
    function convertMonthToAbbrev(monthNumber) {
        switch (monthNumber) {
            case 1: return 'Jan';
            case 2: return 'Feb';
            case 3: return 'Mar';
            case 4: return 'Apr';
            case 5: return 'May';
            case 6: return 'Jun';
            case 7: return 'Jul';
            case 8: return 'Aug';
            case 9: return 'Sep';
            case 10: return 'Oct';
            case 11: return 'Nov';
            case 12: return 'Dec';
            default: return -1;
                break;
        }
    }

    /**
     * getLastDayOfPreviousMonth() returns last day of previous month
     * @returns {Date}
     */
    function getLastDayOfPreviousMonth() {
        var today = new Date();
        var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        log.debug('last day of previous month', lastDayOfMonth);
        return lastDayOfMonth;
    }

    /**
     * getFirstDayOfPreviousMonth() return first day of previous month
     * @returns {Date}
     */
    function getFirstDayOfPreviousMonth() {
        var today = new Date();
        var firstDayOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        log.debug('first day of previous month', firstDayOfMonth);
        return firstDayOfMonth;
    }

    /**
     * getFirstDayOfCurrentMonth() return first day of previous month
     * @returns {Date}
     */
    function getFirstDayOfCurrentMonth() {
        var today = new Date();
        var firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        log.debug('first day of previous month', firstDayOfMonth);
        return firstDayOfMonth;

    }

    /**
     * getFirstDayOfCurrentMonth() return first day of previous month
     * @returns {Date}
     */
    function getLastDayOfCurrentMonthWithDate(date) {
        var today = new Date(date);
        var lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
        log.debug('last day of current month', lastDay);
        return lastDay;

    }

    /**
     * getFirstDayOfNextMonth() return first day of previous month
     * @returns {Date}
     */
    function getFirstDayOfNextMonth(date) {
        var today = new Date(date);
        var firstDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        log.debug('first day of previous month', firstDayOfMonth);
        return firstDayOfMonth;

    }

    /**
     * getPeriodDetailsByName(periodName)  returns accounting period details
     * @param periodName - string 'Dec 2020'
     * @returns {{enddate: null, arlocked: null, year: null, name: null, aplocked: null, startdate: null, alllocked: null, quarter: null}}
     */
    function getPeriodDetailsByName(periodName, periodId) {
        var filters = [];
        if (periodName) {
            filters.push(["periodname","is", periodName]);
        }
        if (periodId) {
            filters.push(["internalid","anyof", periodId]);
        }
        var periodObj = {
            internalid: null,
            name: null,
            startdate: null,
            enddate: null,
            aplocked: null,
            arlocked: null,
            alllocked: null,
            quarter: null,
            year: null
        }
        if (periodName) {
            var accountingperiodSearchObj = search.create({
                type: "accountingperiod",
                filters: filters,
                columns:
                    [
                        search.createColumn({
                            name: "periodname",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({name: "internalid", label: "Internal ID"}),
                        search.createColumn({name: "startdate", label: "Start Date"}),
                        search.createColumn({name: "enddate", label: "End Date"}),
                        search.createColumn({name: "aplocked", label: "AP Locked"}),
                        search.createColumn({name: "arlocked", label: "AR Locked"}),
                        search.createColumn({name: "alllocked", label: "All Locked"}),
                        search.createColumn({name: "isquarter", label: "Quarter"}),
                        search.createColumn({name: "isyear", label: "Year"})
                    ]
            });
            var searchResultCount = accountingperiodSearchObj.runPaged().count;
            log.debug("accountingperiodSearchObj result count",searchResultCount);
            accountingperiodSearchObj.run().each(function(result){
                periodObj.internalid = result.getValue({name: 'internalid'});
                periodObj.startdate = result.getValue({name: 'startdate'});
                periodObj.enddate = result.getValue({name: 'enddate'});
                periodObj.aplocked = result.getValue({name: 'aplocked'});
                periodObj.arlocked = result.getValue({name: 'arlocked'});
                periodObj.alllocked = result.getValue({name: 'alllocked'});
                periodObj.isquarter = result.getValue({name: 'isquarter'});
                periodObj.isyear = result.getValue({name: 'isyear'});
                periodObj.name = result.getValue({name: 'name'});
                return true;
            });
        }
        return periodObj;
    }

    /**
     * getAllWIPRecordsByProject(projectId) - gets all wip records per project that does not have reversed journals
     * @param projectId - project internal id
     * @returns {[]} returns an array of objects, wip project by period records
     */
    function getAllWIPRecordsByProject(projectId) {
        var reversalArray = [];
        var customrecord_bb_project_wip_by_periodSearchObj = search.create({
            type: "customrecord_bb_project_wip_by_period",
            filters:
                [
                    ["custrecord_bb_project_wip_project","anyof", projectId],
                    "AND",
                    ["custrecord_bb_project_wip_reversed_date","isempty",""],
                    "AND",
                    ["custrecord_bb_project_wip_reversal_je","anyof","@NONE@"]
                    // "AND",
                    // ["custrecord_bb_wip_journal_type","anyof","1"]
                ],
            columns:
                [
                    search.createColumn({name: "internalid", label: "Internal ID"}),
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({name: "id", label: "ID"}),
                    search.createColumn({name: "custrecord_bb_project_wip_project", label: "Project"}),
                    search.createColumn({name: "custrecord_bb_project_wip_period", label: "As of Period"}),
                    search.createColumn({name: "custrecord_bb_wip_status", label: "WIP Status"}),
                    search.createColumn({name: "custrecord_bb_total_rev_to_date_amt", label: "Total Revenue to Date"}),
                    search.createColumn({name: "custrecord_bb_invoiced_paid_to_date_amt", label: "Payments to Date"}),
                    search.createColumn({name: "custrecord_bb_open_ar_amt", label: "Open A/R"}),
                    search.createColumn({name: "custrecord_bb_actual_cost_amt", label: "Actual Cost"}),
                    search.createColumn({name: "custrecord_bb_actual_cost_wo_ctc_amt", label: "Actual Cost Without Cost-to-Complete Holdback"}),
                    search.createColumn({name: "custrecord_bb_project_wip_journal", label: "Journal Entry"}),
                    search.createColumn({name: "custrecord_bb_project_wip_reversed_date", label: "Reversal Date"}),
                    search.createColumn({name: "custrecord_bb_project_wip_reversal_je", label: "Reversal Journal Entry"})
                ]
        });
        var searchResultCount = customrecord_bb_project_wip_by_periodSearchObj.runPaged().count;
        log.debug("Project Wip by period result count",searchResultCount);
        customrecord_bb_project_wip_by_periodSearchObj.run().each(function(result){
            reversalArray.push({
                id: result.getValue({name: 'internalid'}),
                jeId: result.getValue({name: 'custrecord_bb_project_wip_journal'}),
            })
            return true;
        });
        return reversalArray;
    }

    /**
     * reversalAllWIPJEs(projectId) - reverses all Project WIP records that have journal entries that have not been reversed
     * @param projectId - project internalid
     */
    function reversalAllWIPJEs(projectId) {
        var wipRecords = getAllWIPRecordsByProject(projectId);
        if (wipRecords.length > 0) {
            for (var i = 0; i < wipRecords.length; i++) {
                var jeId = wipRecords[i].jeId;
                if (jeId) {
                    record.submitFields({
                        type: record.Type.JOURNAL_ENTRY,
                        id: jeId,
                        values: {
                            'reversaldate': getLastDayOfPreviousMonth()
                        },
                        options: {
                            ignoreMandatoryFields: true
                        }
                    });
                }
            }
        }
    }

    /**
     * getWipRecordByAccountingPeriod(accountingPeriod)
     * @param accountingPeriod - integer
     * @param projectId - integer
     * @returns wip record internal id
     */
    function getWipRecordByAccountingPeriod(accountingPeriod, projectId) {
        var wipId = null;
        if (accountingPeriod && projectId) {
            var customrecord_bb_project_wip_by_periodSearchObj = search.create({
                type: "customrecord_bb_project_wip_by_period",
                filters:
                    [
                        ["custrecord_bb_project_wip_period", "anyof", accountingPeriod],
                        "AND",
                        ["custrecord_bb_project_wip_project", "anyof", projectId]
                    ],
                columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"})
                    ]
            });
            var searchResultCount = customrecord_bb_project_wip_by_periodSearchObj.runPaged().count;
            log.debug("customrecord_bb_project_wip_by_periodSearchObj result count", searchResultCount);
            customrecord_bb_project_wip_by_periodSearchObj.run().each(function (result) {
                wipId = result.getValue({name: 'internalid'})
                return true;
            });
        }
        return wipId;
    }

    function getAmountFromProject(array, projectId) {
        if (array.length > 0) {
            var index = array.map(function(data) {return data.projectId}).indexOf(projectId);
            if (index != -1) {
                return array[index];
            } else {
                return -1;
            }
        } else {
            return -1;
        }
    }

    function getProjectSegmentByProjectId(projectId) {
        var segmentId = null;
        if (projectId) {
            var customrecord_cseg_bb_projectSearchObj = search.create({
                type: "customrecord_cseg_bb_project",
                filters:
                    [
                        ["custrecord_seg_project","anyof",projectId]
                    ],
                columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"}),
                        search.createColumn({name: "custrecord_seg_project", label: "Project"}),
                        search.createColumn({name: "cseg_bb_project_filterby_subsidiary", label: 'filter by "Subsidiary"'})
                    ]
            });
            var searchResultCount = customrecord_cseg_bb_projectSearchObj.runPaged().count;
            log.debug("customrecord_cseg_bb_projectSearchObj result count",searchResultCount);
            customrecord_cseg_bb_projectSearchObj.run().each(function(result){
                segmentId = parseInt(result.getValue({name: 'internalid'}));
                return true;
            });
        }
        return segmentId;
    }
    
    function checkProjectWIPCompleted(projectId) {
        var isWIPComplete = false;
        if (projectId) {
            var customrecord_bb_project_wip_by_periodSearchObj = search.create({
                type: "customrecord_bb_project_wip_by_period",
                filters:
                    [
                        ["isinactive","is","F"],
                        "AND",
                        ["custrecord_bb_wip_total_cogs_percnt_amt","equalto","1"],
                        "AND",
                        ["custrecord_bb_project_wip_project","anyof",projectId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({name: "internalid", label: "ID"}),
                        search.createColumn({name: "custrecord_bb_wip_total_cogs_percnt_amt", label: "Total Cogs %"})

                    ]
            });
            var searchResultCount = customrecord_bb_project_wip_by_periodSearchObj.runPaged().count;
            log.debug("WIP by Project Completed result count",searchResultCount);
            if (searchResultCount > 0) {
                isWIPComplete = true
            }
        }
        return isWIPComplete;
    }

    return {
        getCogsAmount: getCogsAmount,
        getRevenueAmount: getRevenueAmount,
        getProjectedCogsAmount: getProjectedCogsAmount,
        createWIPAccrualRecord: createWIPAccrualRecord,
        reversalAllWIPJEs: reversalAllWIPJEs,
        getLastDayOfPreviousMonth: getLastDayOfPreviousMonth,
        getFirstDayOfPreviousMonth: getFirstDayOfPreviousMonth,
        createDateString: createDateString,
        getPeriodDetailsByName: getPeriodDetailsByName,
        getWipRecordByAccountingPeriod: getWipRecordByAccountingPeriod
    }
});