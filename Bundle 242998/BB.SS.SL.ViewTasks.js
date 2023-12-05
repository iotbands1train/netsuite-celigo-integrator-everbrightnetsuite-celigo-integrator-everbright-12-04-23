/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/search', 'N/ui/serverWidget', 'N/task', 'N/redirect', 'N/runtime', 'N/url', 'N/config'],

    function(record, search, serverWidget, task, redirect, runtime, url, config) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            if (context.request.method == 'GET') {
                var sDate = context.request.parameters.sDate;
                var eDate = context.request.parameters.eDate;
                var assignedToSelection = (context.request.parameters.assignedTo) ? context.request.parameters.assignedTo : runtime.getCurrentUser().id;
                var statusSelection = (context.request.parameters.statusString) ? context.request.parameters.statusString : 'NOTSTART';
                log.audit('sDate', sDate);
                log.audit('eDate', eDate);
                log.audit('assignedToSelection', assignedToSelection);
                log.audit('statusSelection', context.request.parameters.statusString);
                // var dateObj = getLastMonthDates();

                var firstDay = (sDate) ? decodeURIComponent(sDate) : null; //String(dateObj.firstday);
                var lastDay = (eDate) ? decodeURIComponent(eDate) : null; //String(dateObj.lastday);

                log.audit('suitelet start date', firstDay);
                log.audit('suitelet end date', lastDay);

                var form = serverWidget.createForm({
                    title: 'Tasks',
                    hideNavBar: true
                });

                var startDateFilter = form.addField({
                    id: 'custpage_start_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Start Date (Filter)'
                });
                startDateFilter.defaultValue = firstDay;

                var endDateFilter = form.addField({
                    id: 'custpage_end_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'End Date (Filter)'
                });
                endDateFilter.defaultValue = lastDay;

                var assignedToFilter = form.addField({
                    id: 'custpage_assigned_to',
                    type: serverWidget.FieldType.MULTISELECT,
                    label: 'Assigned To',
                    source: 'partner'
                });
                var assignedToDefaultSelection;
                if (assignedToSelection) {
                    if (String(assignedToSelection).indexOf(',') != -1) {
                        assignedToDefaultSelection = assignedToSelection.split(',')
                    } else {
                        assignedToDefaultSelection = assignedToSelection;
                    }
                }
                log.debug('assignedToDefaultSelection', assignedToDefaultSelection)
                assignedToFilter.defaultValue = assignedToDefaultSelection;

                var statusFilter = form.addField({
                    id: 'custpage_status',
                    type: serverWidget.FieldType.MULTISELECT,
                    label: 'Status',
                });
                statusFilter.addSelectOption({
                    text: 'Not Started',
                    value: 'NOTSTART'
                }),statusFilter.addSelectOption({
                    text: 'In Progress',
                    value: 'PROGRESS'
                }),
                    statusFilter.addSelectOption({
                        text: 'Completed',
                        value: 'COMPLETE'
                    });
                var defaultStatusSelection;
                if (statusSelection) {
                    if (statusSelection.indexOf(',') != -1) {
                        defaultStatusSelection = statusSelection.split(',').map(String);
                    } else {
                        defaultStatusSelection = statusSelection
                    }
                }
                statusFilter.defaultValue = (defaultStatusSelection) ? defaultStatusSelection : 'NOTSTART';


                var sublist = form.addSublist({
                    id: 'custpage_task_list',
                    type: serverWidget.SublistType.LIST,
                    label: 'Tasks'
                });
                // var urlLink = sublist.addField({
                //     id: 'custpage_task_url',
                //     type: serverWidget.FieldType.URL,
                //     label: 'View Task'
                // });
                // urlLink.linkText = 'View Task';
                //
                // var title = sublist.addField({
                //     id: 'custpage_task_title',
                //     type: serverWidget.FieldType.TEXT,
                //     label: 'Title'
                // });
                // var status = sublist.addField({
                //     id: 'custpage_task_status',
                //     type: serverWidget.FieldType.TEXT,
                //     label: 'Status'
                // });
                // var assignedTo = sublist.addField({
                //     id: 'custpage_task_assigned_to',
                //     type: serverWidget.FieldType.SELECT,
                //     label: 'Assigned To',
                //     source: 'partner'
                // });
                // var startDate = sublist.addField({
                //     id: 'custpage_task_start_date',
                //     type: serverWidget.FieldType.DATE,
                //     label: 'Start Date'
                // });
                // var dueDate = sublist.addField({
                //     id: 'custpage_task_due_date',
                //     type: serverWidget.FieldType.DATE,
                //     label: 'Due Date'
                // });

                setSublistValues(sublist, firstDay, lastDay, assignedToSelection, statusSelection);

                form.addButton({
                    id: 'custpage_search_tasks',
                    label: 'Search Tasks',
                    functionName: 'searchTasks()'
                });
                form.clientScriptModulePath = './BB SS/SS Lib/BB.SS.CS.ActivitiesValidations';
                context.response.writePage(form);
            }
        }


        function getLastMonthDates(){
            var now = new Date();
            var lastday  = new Date(now.getFullYear(), now.getMonth(), 0);
            var last = (lastday.getMonth()+1) + '/' + lastday.getDate() + '/' + lastday.getFullYear();

            var firstday = new Date(lastday.getFullYear(), lastday.getMonth(), 1);
            var first = (firstday.getMonth()+1) + '/' + firstday.getDate() + '/' + firstday.getFullYear();

            // var lastMonth = firstday.getDate()+'/'+(firstday.getMonth()+1)+'/'+firstday.getFullYear()+' - '+lastday.getDate()+'/'+(firstday.getMonth()+1)+'/'+lastday.getFullYear();
            log.debug('first day', first);
            log.debug('last day', last);
            return {
                firstday: first,
                lastday: last
            }
        }


        function setSublistValues(sublist, sDate, eDate, assignedTo, status) {
            // check sales orders associated to deposits and bind so status to
            var searchId = runtime.getCurrentScript().getParameter({name: 'custscript_bb_all_task_search'});
            if (searchId) {
                var taskSearch = search.load({
                    id: searchId
                });
                log.debug('task filter expression', taskSearch.filterExpression);
                // date filters
                if (sDate && !eDate) {
                    log.debug('start date only filter');
                    if (taskSearch.filterExpression.length > 0) {
                        var startDateOnlyFilters = ["AND", ["createddate", "onorafter", sDate]];
                    } else {
                        var startDateOnlyFilters = [["createddate", "onorafter", sDate]];
                    }
                    var startDateFilterExpression = taskSearch.filterExpression.concat(startDateOnlyFilters);
                    taskSearch.filterExpression = startDateFilterExpression;
                } else if (!sDate && eDate) {
                    log.debug('end date only filter');
                    if (taskSearch.filterExpression.length > 0) {
                        var endDateOnlyFilters = ["AND", ["createddate", "onorbefore", eDate]];
                    } else {
                        var endDateOnlyFilters = [["createddate", "onorbefore", eDate]];
                    }
                    var endDateFilterExpression = taskSearch.filterExpression.concat(endDateOnlyFilters);
                    taskSearch.filterExpression = endDateFilterExpression;
                } else if (sDate && eDate) {
                    log.debug('start and end date filter');
                    if (taskSearch.filterExpression.length > 0) {
                        var allDateOnlyFilters = ["AND", ["createddate", "within", sDate, eDate]];
                    } else {
                        var allDateOnlyFilters = [["createddate", "within", sDate, eDate]];
                    }
                    var allDateFilterExpression = taskSearch.filterExpression.concat(allDateOnlyFilters);
                    taskSearch.filterExpression = allDateFilterExpression;
                }

                // assigned to filter
                var assignedToFilter;
                if (assignedTo) {
                    if (typeof assignedTo == 'string') {
                        if (assignedTo.indexOf(',') != -1) {
                            assignedToFilter = assignedTo.split(',').map(Number);
                        }
                        // get related employee records
                        var relatedEmployees = getEmployeeRelatedValue(assignedTo);
                        log.debug('relatedEmployee Array', relatedEmployees)
                        if (relatedEmployees.length > 0) {
                            assignedToFilter = relatedEmployees.map(Number);
                        }
                    } else { // number used by default parameter
                        assignedToFilter = assignedTo;
                    }
                    log.debug('assigned to filter', assignedToFilter);
                    if (taskSearch.filterExpression.length > 0) {
                        var assignedToFilters = ["AND", ["assigned", "anyof", assignedToFilter]];
                    } else {
                        var assignedToFilters = [["assigned", "anyof", assignedToFilter]];
                    }
                    var assignedToFilterExpression = taskSearch.filterExpression.concat(assignedToFilters);
                    taskSearch.filterExpression = assignedToFilterExpression;
                }

                // status to filter
                if (status) {
                    if (status.indexOf(',') != -1) {
                        var statusString = status.split(',').map(function(data) {
                            return String(data)
                        });
                    } else {
                        var statusString = status
                    }
                    log.debug('status filter after array mapping', statusString);
                    if (taskSearch.filterExpression.length > 0) {
                        var statusFilters = ["AND", ["status", "anyof", statusString]];
                    } else {
                        var statusFilters = [["status", "anyof", statusString]];
                    }
                    var statusFilterExpression = taskSearch.filterExpression.concat(statusFilters);
                    taskSearch.filterExpression = statusFilterExpression;
                }
                // create fields from columns
                var taskColumnsSearch = taskSearch.run();
                for (var c = 0; c < taskColumnsSearch.columns.length; c++) {
                    log.audit('column value', taskColumnsSearch.columns[c]);
                    var fieldArr = taskColumnsSearch.columns[c].label.split('.');
                    var fieldType = fieldArr[0];
                    var fieldId = fieldArr[1];
                    var fieldLabel = fieldArr[2];
                    var source = null;
                    if (fieldArr.length == 4) {
                        source = fieldArr[3];
                        log.debug('source', source);
                    }
                    log.audit('fieldType', fieldType);
                    log.audit('fieldId', fieldId);
                    log.audit('fieldLabel', fieldLabel);
                    var resovledFieldType = resolveFieldType(fieldType);

                    log.audit('resolved field type', resovledFieldType);
                    if (!source) {
                        var customField = sublist.addField({
                            id: 'custpage' + fieldId,
                            type: resovledFieldType,
                            label: fieldLabel
                        });
                    } else {
                        var customField = sublist.addField({
                            id: 'custpage' + fieldId,
                            type: resovledFieldType,
                            label: fieldLabel,
                            source: source
                        });
                    }
                    if (fieldType == 'url') {
                        customField.linkText = 'View Task';
                    }

                }

                log.debug('final task filter expression', taskSearch.filterExpression);

                var counter = 0;
                taskSearch.run().each(function (result) {
                    var lineObj = {};
                    for (var c = 0; c < taskSearch.columns.length; c++) {
                        var fieldArr = taskSearch.columns[c].label.split('.');
                        var fieldId = fieldArr[1];
                        lineObj[fieldId] = result.getValue({name: taskSearch.columns[c].name});
                    }
                    log.debug('lineobj',lineObj)
                    setSuiteletFields(sublist, counter, lineObj);
                    counter++;
                    return true;
                });
            } else {
                throw 'Please set the saved search parameter you want to show for tasks.'
            }


        }

        function resolveFieldType(fieldType) {
            var type;
            if (fieldType == 'url') {
                type = serverWidget.FieldType.URL
            }
            else if (fieldType == 'integer') {
                type = serverWidget.FieldType.INTEGER
            }
            else if (fieldType == 'date') {
                type = serverWidget.FieldType.DATE
            }
            else if (fieldType == 'text') {
                type = serverWidget.FieldType.TEXT
            }
            else if (fieldType == 'select') {
                type = serverWidget.FieldType.SELECT
            }
            else if (fieldType == 'multiselect') {
                type = serverWidget.FieldType.MULTISELECT
            }
            return type
        }


        function setSuiteletFields(sublist, lineNumber, lineObj) {

            for (var key in lineObj) {
                var fieldObj = sublist.getField({id: 'custpage' + key});
                log.debug('found field object', fieldObj);
                var matchingKey = fieldObj.id.split('custpage').pop();
                log.debug('matchingKey value', matchingKey);
                if (key == 'internalid' && key == matchingKey && lineObj[key]) {
                    var companyInfo = config.load({
                        type: config.Type.COMPANY_INFORMATION
                    });
                    var accountId = companyInfo.getValue({fieldId: 'companyid'});

                    var urlDomain = url.resolveRecord({
                        recordId: lineObj[key],
                        recordType: 'task',
                        isEditMode: false
                    });
                    var taskLink = urlDomain;
                    sublist.setSublistValue({
                        id: 'custpage' + key,
                        line: lineNumber,
                        value: taskLink
                    });
                }
                if (lineObj[key] && key == matchingKey && key != 'internalid') {
                    sublist.setSublistValue({
                        id: 'custpage' + key,
                        line: lineNumber,
                        value: lineObj[key]
                    });
                }
            }


            // if (lineObj.internalid) {
            //     var companyInfo = config.load({
            //         type: config.Type.COMPANY_INFORMATION
            //     });
            //     var accountId = companyInfo.getValue({fieldId: 'companyid'});
            //
            //     var urlDomain = url.resolveRecord({
            //         recordId: lineObj.internalid,
            //         recordType: 'task',
            //         isEditMode: false
            //     });
            //     var taskLink = urlDomain;
            //     // log.debug('task link', taskLink)
            //     sublist.setSublistValue({
            //         id: 'custpage_task_url',
            //         line: lineNumber,
            //         value: taskLink
            //     });
            // }
            // if (lineObj.title) {
            //     sublist.setSublistValue({
            //         id: 'custpage_task_title',
            //         line: lineNumber,
            //         value: lineObj.title
            //     });
            // }
            //
            // if (lineObj.status) {
            //     sublist.setSublistValue({
            //         id: 'custpage_task_status',
            //         line: lineNumber,
            //         value: lineObj.status
            //     });
            // }
            // if (lineObj.startDate) {
            //     sublist.setSublistValue({
            //         id: 'custpage_task_start_date',
            //         line: lineNumber,
            //         value: lineObj.startDate
            //     });
            // }
            // if (lineObj.dueDate) {
            //     sublist.setSublistValue({
            //         id: 'custpage_task_due_date',
            //         line: lineNumber,
            //         value: lineObj.dueDate
            //     });
            // }
            // if (lineObj.assignedTo) {
            //     sublist.setSublistValue({
            //         id: 'custpage_task_assigned_to',
            //         line: lineNumber,
            //         value: lineObj.assignedTo
            //     });
            // }
        }


        function getEmployeeRelatedValue(assignedTo) {
            var relatedEmployeeArray;
            if (typeof assignedTo == 'string') {
                if (assignedTo.indexOf(',') != -1) {
                    relatedEmployeeArray = assignedTo.split(',');
                } else {
                    relatedEmployeeArray = [assignedTo];
                }
            }
            log.debug('relatedEmployeeArray', relatedEmployeeArray);
            if (assignedTo) {
                var entitySearchObj = search.create({
                    type: "entity",
                    filters:
                        [
                            ["internalid","anyof", relatedEmployeeArray],
                            "AND",
                            ["formulatext: {custentity_bb_emp_login_entity}","isnotempty",""]
                        ],
                    columns:
                        [
                            search.createColumn({name: "custentity_bb_emp_login_entity", label: "Employee Login Entity"})
                        ]
                });
                var searchResultCount = entitySearchObj.runPaged().count;
                log.debug("entitySearchObj result count",searchResultCount);
                entitySearchObj.run().each(function(result){
                    relatedEmployeeArray.push(result.getValue({name: 'custentity_bb_emp_login_entity'}));
                    return true;
                });
            }
            log.debug('final related employee array', relatedEmployeeArray);
            return relatedEmployeeArray;
        }


        return {
            onRequest: onRequest
        };

    });