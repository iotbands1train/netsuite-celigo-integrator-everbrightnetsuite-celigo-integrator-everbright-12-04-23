/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/runtime'],

    function(serverWidget, record, search, runtime) {

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
                var form = serverWidget.createForm({
                    title: 'Time Entry'
                });
                var employeeId = runtime.getCurrentUser().id;
                var employeeName = runtime.getCurrentUser().name;
                var today = new Date();
                var firstDayofWorkWeek = getMonday(today);

                var currentTimeSheet = currentTimeSheetRecord(employeeId);

                form.clientScriptModulePath = './BB.SS.CS.TimeEntry';

                var currentRunningTime = form.addField({
                    id: 'custpage_entry_display',
                    label: 'Current Running Entry',
                    type: serverWidget.FieldType.INLINEHTML,
                });
                currentRunningTime.defaultValue = timeClockHtml(employeeName, firstDayofWorkWeek);

                context.response.writePage(form);
            }

            if (context.request.method == 'POST') {
                log.debug('request parameters', context.request.parameters);
                if (context.request.parameters.action == 'upsertime') {
                    log.debug('upsert time action');
                    try {
                        var projectId = context.request.parameters.projectId;
                        var employeeId = context.request.parameters.employeeId;
                        var caseId = context.request.parameters.caseId;
                        var projectActionId = context.request.parameters.projectActionId;
                        var serviceItemId = context.request.parameters.serviceItemId;
                        var memo = context.request.parameters.memo;
                        var timeSheetLineId = context.request.parameters.timeSheetLineId;
                        var timeSheetId = currentTimeSheetRecord(employeeId);
                        var hour = context.request.parameters.hour;
                        var min = context.request.parameters.min;
                        var sec = context.request.parameters.sec;
                        var timerMode = context.request.parameters.timerMode;
                        var manualTime = context.request.parameters.manualTimeEntry;
                        var date = new Date();

                        if (projectId && (hour || min > 0) && memo && timeSheetId && date) {
                            var timeEntry = record.create({
                                type: record.Type.TIME_BILL,
                                isDynamic: true
                            });
                            timeEntry.setValue({fieldId: 'employee', value: employeeId});
                            // timeEntry.setValue({fieldId: 'timesheet', value: timeSheetId});
                            timeEntry.setValue({fieldId: 'customer', value: projectId});
                            timeEntry.setValue({fieldId: 'trandate', value: date});
                            var timeData = '';
                            var minConversion = (((parseFloat(min) * 100) / 60) / 100).toFixed(2);
                            var minutes = minConversion.split('.').pop();
                            if (timerMode == 1) {
                                var timeData = hour + '.' + minutes;
                            } else {
                                timeData = manualTime;
                            }
                            log.debug('hour', hour);
                            log.debug('min', minConversion);
                            log.debug('timeData', timeData);
                            timeEntry.setValue({fieldId: 'hours', value: timeData});

                            if (caseId != 'null' && caseId != '') {
                                timeEntry.setValue({fieldId: 'casetaskevent', value: caseId});
                            }
                            if (projectActionId != 'null' && projectActionId != '') {
                                timeEntry.setValue({fieldId: 'custcol_bb_time_project_action', value: projectActionId});
                            }
                            if (serviceItemId != 'null' && serviceItemId != '') {
                                timeEntry.setValue({fieldId: 'item', value: serviceItemId});
                            }
                            timeEntry.setValue({fieldId: 'memo', value: memo});
                            timeEntry.save({ignoreMandatoryFields: true});
                            context.response.write('success');
                            record.submitFields({
                                type: record.Type.EMPLOYEE,
                                id: context.request.parameters.employeeId,
                                values: {
                                    'custentity_bb_timer_suitelet_data': null
                                },
                                options: {
                                    ignoreMandatoryFields: true
                                }
                            });
                        } else {
                            context.response.write('failure');
                        }
                    } catch (e) {
                        log.error('error creating time entry', e);
                        context.response.write('failure');
                    }
                }

                if (context.request.parameters.action == 'replaytime') {
                    log.debug('replay time action');
                    try {
                        var projectId = context.request.parameters.projectId;
                        var employeeId = context.request.parameters.employeeId;
                        var caseId = context.request.parameters.caseId;
                        var projectActionId = context.request.parameters.projectActionId;
                        var serviceItemId = context.request.parameters.serviceItemId;
                        var memo = context.request.parameters.memo;
                        var timeSheetLineId = context.request.parameters.timeSheetLineId;
                        var timeSheetId = currentTimeSheetRecord(employeeId);
                        var hour = context.request.parameters.hour;
                        var min = context.request.parameters.min;
                        var sec = context.request.parameters.sec;
                        var date = new Date();

                        if (projectId && (hour || min > 0) && memo && timeSheetId && date) {
                            var timeEntry = record.create({
                                type: record.Type.TIME_BILL,
                                isDynamic: true
                            });
                            timeEntry.setValue({fieldId: 'employee', value: employeeId});
                            // timeEntry.setValue({fieldId: 'timesheet', value: timeSheetId});
                            timeEntry.setValue({fieldId: 'customer', value: projectId});
                            timeEntry.setValue({fieldId: 'trandate', value: date});
                            var minConversion = (((parseFloat(min) * 100) / 60) / 100).toFixed(2);
                            var minutes = minConversion.split('.').pop();
                            var timeData = hour + '.' + minutes;
                            log.debug('hour', hour);
                            log.debug('min', minConversion)
                            timeEntry.setValue({fieldId: 'hours', value: timeData});
                            log.debug('timeDate Replay', timeData);
                            if (caseId != 'null' && caseId != '') {
                                timeEntry.setValue({fieldId: 'casetaskevent', value: caseId});
                            }
                            if (projectActionId != 'null' && projectActionId != '') {
                                timeEntry.setValue({fieldId: 'custcol_bb_time_project_action', value: projectActionId});
                            }
                            if (serviceItemId != 'null' && serviceItemId != '') {
                                timeEntry.setValue({fieldId: 'item', value: serviceItemId});
                            }
                            timeEntry.setValue({fieldId: 'memo', value: memo});
                            timeEntry.save({ignoreMandatoryFields: true});
                            context.response.write('success');
                            record.submitFields({
                                type: record.Type.EMPLOYEE,
                                id: context.request.parameters.employeeId,
                                values: {
                                    'custentity_bb_timer_suitelet_data': null
                                },
                                options: {
                                    ignoreMandatoryFields: true
                                }
                            });
                        } else {
                            context.response.write('failure');
                        }
                    } catch (e) {
                        log.error('error creating time entry', e);
                        context.response.write('failure');
                    }
                }

                if (context.request.parameters.action == 'pausetimer') {
                    var projectId = context.request.parameters.projectId;
                    var employeeId = context.request.parameters.employeeId;
                    var caseId = context.request.parameters.caseId;
                    var projectActionId = context.request.parameters.projectActionId;
                    var serviceItemId = context.request.parameters.serviceItemId;
                    var memo = context.request.parameters.memo;
                    var timeSheetLineId = context.request.parameters.timeSheetLineId;
                    var timeSheetId = currentTimeSheetRecord(employeeId);
                    var hour = context.request.parameters.hour;
                    var min = context.request.parameters.min;
                    var sec = context.request.parameters.sec;
                    var date = context.request.parameters.date;

                    var employeeJson = {
                        employeeId: runtime.getCurrentUser().id,
                        projectId: projectId,
                        caseId: caseId,
                        projectActionId: projectActionId,
                        serviceItemId: serviceItemId,
                        memo: memo,
                        timeSheetLineId: timeSheetLineId,
                        timeSheetId: timeSheetId,
                        hour: hour,
                        min: min,
                        sec: sec,
                        sDate: date,
                        eDate: null
                    }
                    if (employeeId) {
                        var employee = record.submitFields({
                            type: record.Type.EMPLOYEE,
                            id: employeeId,
                            values: {
                                'custentity_bb_timer_suitelet_data': JSON.stringify(employeeJson)
                            },
                            options: {
                                ignoreMandatoryFields: true
                            }
                        });
                        context.response.write('success');
                    } else {
                        context.response.write('failure');
                    }
                }

                if (context.request.parameters.action == 'restarttimer') {
                    var employeeId = context.request.parameters.employeeId;
                    // var projectId = context.request.parameters.projectId;
                    // var caseId = context.request.parameters.caseId;
                    // var projectActionId = context.request.parameters.projectActionId;
                    // var serviceItemId = context.request.parameters.serviceItemId;
                    // var memo = context.request.parameters.memo;
                    // var timeSheetLineId = context.request.parameters.timeSheetLineId;
                    // var timeSheetId = currentTimeSheetRecord(employeeId);
                    // var hour = context.request.parameters.hour;
                    // var min = context.request.parameters.min;
                    // var sec = context.request.parameters.sec;
                    var eDate = new Date();

                    if (employeeId) {
                        var employeeObj = search.lookupFields({
                            type: search.Type.EMPLOYEE,
                            id: employeeId,
                            columns: ['custentity_bb_timer_suitelet_data']
                        });
                        var empData = employeeObj.custentity_bb_timer_suitelet_data;
                        context.response.write(empData);
                    } else {
                        context.response.write('failure');
                    }
                }

                if (context.request.parameters.action == 'clearemployeejson') {
                    if (context.request.parameters.employeeId) {
                        record.submitFields({
                            type: record.Type.EMPLOYEE,
                            id: context.request.parameters.employeeId,
                            values: {
                                'custentity_bb_timer_suitelet_data': null
                            },
                            options: {
                                ignoreMandatoryFields: true
                            }
                        });
                        context.response.write('successful');
                    } else {
                        context.response.write('failure');
                    }

                }

                return;
            }

        }

        function timeClockHtml(employeeName, firstDayofWorkWeek) {
            var html = '<!DOCTYPE html>' +
                '<head>' +
                '<title>What are you working on</title>' +
                '<style>' +

                '.inputcell {' +
                '   margin: 10px;' +
                '   border-radius: 5px;' +
                '}'+
                '.manualcell {' +
                '   margin: 10px;' +
                '   border-radius: 5px' +
                '}'+
                '/*the container must be positioned relative:*/' +
                '.autocomplete {' +
                '    position: relative;' +
                '    display: inline-block;' +
                '}' +
                '' +
                'input {' +
                '    border: 1px solid transparent;' +
                '    background-color: #f1f1f1;' +
                '    padding: 10px;' +
                '    font-size: 16px;' +
                '}' +
                '' +
                'input[type=text] {' +
                '    background-color: #f1f1f1;' +
                '}' +
                '' +
                '.play_button_img {' +
                '    padding: 0;' +
                '    border: none;' +
                '    background: none;' +
                '    vertical-align: middle;' +
                '}' +
                '' +
                '.stop_button_img {' +
                '    padding: 0;' +
                '    border: none;' +
                '    background: none;' +
                '    vertical-align: middle;' +
                '    display: none;' +
                '}' +
                '' +
                '.entry_button_img {' +
                '    padding: 0;' +
                '    border: none;' +
                '    background: none;' +
                '    vertical-align: middle;' +
                '}' +
                '' +
                '.replay_button_img {' +
                '    padding: 0;' +
                '    border: none;' +
                '    background: none;' +
                '    vertical-align: middle;' +
                '}' +
                '' +
                '.autocomplete-items {' +
                '    position: absolute;' +
                '    border: 1px solid #d4d4d4;' +
                '    border-bottom: none;' +
                '    border-top: none;' +
                '    z-index: 99;' +
                '    /*position the autocomplete items to be the same width as the container:*/' +
                '    top: 100%;' +
                '    left: 0;' +
                '    right: 0;' +
                '    width: 40%' +
                '}' +
                '' +
                '.autocomplete-items div {' +
                '    padding: 10px;' +
                '    cursor: pointer;' +
                '    background-color: #fff;' +
                '    border-bottom: 1px solid #d4d4d4;' +
                '}' +
                '' +
                '/*when hovering an item:*/' +
                '.autocomplete-items div:hover {' +
                '    background-color: #e9e9e9;' +
                '}' +
                '' +
                '/*when navigating through the items using the arrow keys:*/' +
                '.autocomplete-active {' +
                '    background-color: DodgerBlue !important;' +
                '    color: #ffffff;' +
                '}' +
                '/* timer css section */' +
                '' +
                'h1 {' +
                '    font-size: 1.5rem;' +
                '    padding: 0.5rem 1rem;' +
                '}' +
                '' +
                '.container {' +
                '    display: grid;' +
                '    grid-template-columns: repeat(2, 150px);' +
                '    max-width: 300px;' +
                '    margin: 0 auto;' +
                '    float: right;' +
                '    position: relative;' +
                '}' +
                '' +
                '.display {' +
                '    grid-column: 1/3;' +
                '    grid-row: 1/2;' +
                '    display: flex;' +
                '    align-items: center;' +
                '    justify-content: center;' +
                '    font-size: 3rem;' +
                '    border: 5px solid rgb(124, 124, 123);' +
                '    padding: 0.5rem 1rem;' +
                '    color: rgb(82, 80, 80);' +
                '    margin-bottom: 20px;' +
                '}' +
                '' +
                '' +
                '#hour::after,' +
                '#min::after,' +
                '#sec::after {' +
                '    content: ": ";' +
                '}' +
                '' +
                '/* time entered css */' +
                '.time_entered {' +
                '    width: 100%;' +
                '    border-radius: 15px;' +
                '}' +
                '.time_entered th {' +
                '    background-color: #BBBBBB;' +
                '    font-size: 14px;' +
                '    padding: 10px;' +
                '    font-family: sans-serif;' +
                '}' +
                '.time_entered tr {' +
                '    font-size: 14px;' +
                '    padding: 5px;' +
                '    font-family: sans-serif;' +
                '}' +

                '.process_buttons {' +
                '    float: right;' +
                '    width: auto;' +
                '    position:relative;' +
                '    margin: 25px;' +
                '}' +
                '.timer_button {' +
                '    display: none;' +
                '    margin: 15px;' +
                '}' +
                '.manual_time {' +
                '    margin: 15px;' +
                '}' +

                '.manual_cell {' +
                '    display: none;' +
                '    margin-top: 115px;' +
                '    border-radius: 5px;' +
                '}' +

                '.replayentry {' +
                '    position: relative;' +
                '    display: none;' +
                '    float: left;' +
                '}' +

                '.employee_details {' +
                '    float: left;' +
                '    width: auto;' +
                '    position:relative;' +
                '    left :0;' +
                '}' +
                '.employee_details h1 {' +
                '    color: rgb(82, 80, 80);' +
                '}' +

                '</style>'+
                '</head>'+
                '<body>' +

                '<div class="employee_details">' +
                '<h1 style="float: left;">' + employeeName + ' - ' +  'Current Week : ' + firstDayofWorkWeek + '</h1><br>' +
                '    <button type="button" class="timer_button">Timer</button>' +
                '    <button type="button" class="manual_time">Manual Time</button>' +
                '</div>' +

                '   <section class="container">' +
                '       <div class="display">\n' +
                '           <div id="hour">00</div>\n' +
                '           <div id="min">00</div>\n' +
                '           <div id="sec">00</div>\n' +
                '           <div id="msec">00</div>\n' +
                '       </div>' +
                '       <input class="manual_cell" id="manual_time_input" type="text" placeholder="Manual Time" size="30" style="font-size:12pt;">'+
                '   </section>'+

                '<div class="autocomplete">' +
                '    <input class="inputcell" id="project_input" type="text" placeholder="What Project are you working on?" size="50" style="font-size:12pt;">'+
                '    <input class="inputcell" id="case_input" type="text" placeholder="Case #" size="30" style="font-size:12pt;">'+
                '    <input class="inputcell" id="proj_action_input" type="text" placeholder="Project Action" size="30" style="font-size:12pt;">'+
                '    <input class="inputcell" id="service_item_input" type="text" placeholder="Service Item" size="20" style="font-size:12pt;"><br>'+
                '    <input class="inputcell" id="memo_input" type="text" placeholder="Description" size="50" style="font-size:12pt;">'+
                '    <button type="button" class="entry_button_img"><img  src="https://tstdrv1967913.app.netsuite.com/core/media/media.nl?id=135784&c=TSTDRV1967913&h=rFDQ1gKMoTI1oO9sXHbeJ97bUXSbgqOJXzWelrkbISMC-atL" width="30">&nbsp</button>' +
                '    <button type="button" class="play_button_img"><img  src="https://tstdrv1967913.app.netsuite.com/core/media/media.nl?id=133777&c=TSTDRV1967913&h=YSo6rR5czvzL_sPgMLSYWI-BQ01o57kdTSzWpbKBjUv4GHVT" width="30">&nbsp</button>' +
                '    <button type="button" class="stop_button_img"><img  src="https://tstdrv1967913.app.netsuite.com/core/media/media.nl?id=135782&c=TSTDRV1967913&h=LkauxL3CveWdMmmwJu0ezQlWh-4QGs6ENkSh-wzQvW9FphSw" width="30">&nbsp</button>' +
                '</div>' +

                '<br>'+
                '<br>'+
                '<br>'+
                '<table class="time_entered">' +
                '<thead>'+
                '  <tr>' +
                '    <th width="5%">Replay Time</th>' +
                '    <th width="15%">Project</th>' +
                '    <th width="5%">Case</th>' +
                '    <th width="15%">Project Action</th>' +
                '        <th width="5%">Service Item</th>' +
                '    <th width="5%">Billable</th>' +
                '    <th width="20%">Memo</th>' +
                '    <th width="3%">Date</th>' +
                '    <th width="4%">Time Total</th>' +
                '    <th width="5%">Entry Id</th>' +
                '  </tr>' +
                '</thead>'+
                '</table>' +

                '</body>' +
                '</html>';

            return html;
        }


        function getMonday(d) {
            d = new Date(d);
            var day = d.getDay(),
                diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
            var currentMonday = new Date(d.setDate(diff));
            var month = currentMonday.getMonth() + 1;
            var day = currentMonday.getDate();
            var year = currentMonday.getFullYear();
            var dateString = month +'/' + day + '/' + year;
            return dateString;
        }


        function getSunday() {
            var dt = new Date(); // current date of week
            var currentWeekDay = dt.getDay();
            var lessDays = currentWeekDay == 0 ? 6 : currentWeekDay - 1;
            var wkStart = new Date(new Date(dt).setDate(dt.getDate() - lessDays));
            var wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));
            log.debug('wkStart', wkStart);
            log.debug('wkEnd', wkEnd);
        }


        function currentTimeSheetRecord(employeeId) {
            var timeSheetID = null;
            var timesheetSearchObj = search.create({
                type: "timesheet",
                filters:
                    [
                        ["employee","anyof",employeeId],
                        "AND",
                        ["timesheetdate","within","thisweek"]
                    ],
                columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"}),
                        search.createColumn({
                            name: "timesheet",
                            join: "timeBill",
                            label: "Timesheet"
                        }),
                        search.createColumn({
                            name: "id",
                            sort: search.Sort.ASC,
                            label: "ID"
                        }),
                        search.createColumn({name: "startdate", label: "Start Date"})
                    ]
            });
            var searchResultCount = timesheetSearchObj.runPaged().count;
            log.debug("timesheetSearchObj result count",searchResultCount);
            timesheetSearchObj.run().each(function(result) {
                timeSheetID = result.getValue({name: 'internalid'})
            })
            log.debug('timeSheet ID', timeSheetID);
            return timeSheetID;
        }


        return {
            onRequest: onRequest
        };

    });