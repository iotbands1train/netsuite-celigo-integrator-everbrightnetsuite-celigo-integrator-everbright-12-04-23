/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/search', 'N/runtime', 'N/https', 'N/url'],

    function(currentRecord, search, runtime, https, url) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */

        function pageInit(scriptContext) {
            var timerMode = 1;
            var timerIsRunning = false;
            var replay = 0;
            var replayLineId = null;
            var replayArray = [];

            populateTimeEntryLines();

            // get project array values for auto complete
            var projectArray = getProjects();

            // start autocomplete feature
            autocomplete(document.getElementById("project_input"), projectArray);

            // check if project field value was entered project_inputautocomplete-list
            document.getElementById("project_input").addEventListener("input", function() {
                try {
                    document.getElementById("project_inputautocomplete-list").addEventListener("click", function () {
                        var selectedProject = document.getElementById("project_input").value;
                        console.log('selected project', selectedProject);

                        var selectedProjectId = selectedProject.split('||').pop().trim();
                        console.log('selectedProjectId', selectedProjectId);

                        if (selectedProjectId) {
                            var caseArray = getProjectRelatedCases(selectedProjectId);
                            console.log('caseArray', caseArray)
                            autocomplete(document.getElementById("case_input"), caseArray);

                            // project action auto complete
                            var projectActionArray = getProjectRelatedProjectActions(selectedProjectId);
                            console.log('projectActionArray', projectActionArray)
                            autocomplete(document.getElementById("proj_action_input"), projectActionArray);
                        }
                    })
                } catch (e) {
                    console.log('error', e)
                }
            });
            var serviceItemArray = getServiceItems();
            autocomplete(document.getElementById("service_item_input"), serviceItemArray);

            // button and timer section
            var msec = 0,
                sec = 1,
                min = 1,
                hour = 1,
                timerOn = 0;
            var msecVar, secVar, minVar, hourVar;

            function setMSec() {
                if (msec < 10) {
                    document.getElementById("msec").innerHTML = "0" + msec;
                } else {
                    document.getElementById("msec").innerHTML = msec;
                }
                msec = msec + 1;
                msecVar = setTimeout(setMSec, 100);
                if (msec >= 10) {
                    setSec();
                    msec = 0;
                }
            }

            function setSec() {
                if (sec >= 60) {
                    setMin();
                    sec = 0;
                }
                if (sec < 10) {
                    document.getElementById("sec").innerHTML = "0" + sec;
                } else {
                    document.getElementById("sec").innerHTML = sec;
                }
                sec = sec + 1;
            }

            function setMin() {
                if (min >= 60) {
                    setHour();
                    min = 0;
                }
                if (min < 10) {
                    document.getElementById("min").innerHTML = "0" + min;
                } else {
                    document.getElementById("min").innerHTML = min;
                }
                min = min + 1;
            }

            function setHour() {
                if (hour < 10) {
                    document.getElementById("hour").innerHTML = "0" + hour;
                } else {
                    document.getElementById("hour").innerHTML = hour;
                }
                hour = hour + 1;
            }

            function start() {
                if (!timerOn) {
                    timerOn = 1;
                    setMSec();
                }
            }

            function stop() {
                clearTimeout(msecVar);
                timerOn = 0;
            }

            function resetTimer() {
                msec = 0, sec = 1, min = 1, hour = 1;
            }

            // hide stop button
            jQuery('.stop_button_img').hide();

            //start button
            jQuery('.play_button_img').click(function (){
                // alert('button click successful');
                start();
                timerMode = 1;
                timerIsRunning = true;
                jQuery('.play_button_img').hide();
                jQuery('.stop_button_img').show()
            });

            //stop button
            jQuery('.stop_button_img').click(function (){
                // alert('button click successful');
                timerIsRunning = false;
                var urlValue = url.resolveScript({
                    scriptId: 'customscript_bb_sl_time_entry',
                    deploymentId: 'customdeploy_bb_sl_time_entry'
                });
                stop();
                jQuery('.play_button_img').show();
                jQuery('.stop_button_img').hide();
                var stopJson = {
                    action: 'clearemployeejson',
                    employeeId: runtime.getCurrentUser().id
                }
                var stopResp = https.post({
                    url: urlValue,
                    body: stopJson
                });
                console.log('stopResp', stopResp.body);

            });

            //submit entry button
            jQuery('.entry_button_img').click(function (){
                // get data entry field data and submit time entry to week
                var hour = jQuery("#hour").text();
                var min = jQuery("#min").text();
                var second = jQuery("#sec").text();

                console.log('hour', hour);
                console.log('min', min);
                console.log('replay', replay);
                console.log('replayArray', replayArray);

                if (replay == 0) {
                    var projectId = getAutoCompleteCellValueId(jQuery("#project_input").val());
                    var caseId = getAutoCompleteCellValueId(jQuery("#case_input").val());
                    var projectActionId = getAutoCompleteCellValueId(jQuery("#proj_action_input").val());
                    var serviceItemId = getAutoCompleteCellValueId(jQuery("#service_item_input").val());
                    var memo = jQuery("#memo_input").val();
                    var manualTimeEntry = jQuery("#manual_time_input").val();
                    console.log('manualTimeEntry', manualTimeEntry);
                    var urlValue = url.resolveScript({
                        scriptId: 'customscript_bb_sl_time_entry',
                        deploymentId: 'customdeploy_bb_sl_time_entry'
                    });
                    var body = {
                        action: 'upsertime',
                        employeeId: runtime.getCurrentUser().id,
                        projectId: projectId,
                        caseId: caseId,
                        projectActionId: projectActionId,
                        serviceItemId: serviceItemId,
                        memo: memo,
                        timeSheetLineId: null,
                        timeSheetId: null,
                        hour: hour,
                        min: min,
                        sec: second,
                        manualTimeEntry: manualTimeEntry,
                        timerMode: timerMode,
                        date: null
                    }
                    var response = https.post({
                        url: urlValue,
                        body: body
                    });
                    console.log('response', response.body);
                    if (response.body != 'failure') {
                        //set line value to sublist???

                        // remove all rows except first row
                        jQuery(".time_entered > tbody").empty()

                        //re populate lines with new list
                        populateTimeEntryLines();
                    }
                }

                if (replay == 1 && replayArray.length > 0 && min >= 1) {

                    var urlValue = url.resolveScript({
                        scriptId: 'customscript_bb_sl_time_entry',
                        deploymentId: 'customdeploy_bb_sl_time_entry'
                    });
                    var projectId = getAutoCompleteCellValueId(jQuery("#project_input").val());
                    var caseId = getAutoCompleteCellValueId(jQuery("#case_input").val());
                    var projectActionId = getAutoCompleteCellValueId(jQuery("#proj_action_input").val());
                    var serviceItemId = getAutoCompleteCellValueId(jQuery("#service_item_input").val());
                    var memo = jQuery("#memo_input").val();
                    console.log('projectId', projectId);
                    console.log('caseId', caseId);
                    console.log('projectActionId', projectActionId);
                    console.log('serviceItemId', serviceItemId);
                    console.log('memo', memo);
                    var body = {
                        action: 'replaytime',
                        employeeId: runtime.getCurrentUser().id,
                        projectId: projectId,
                        caseId: caseId,
                        projectActionId: projectActionId,
                        serviceItemId: serviceItemId,
                        memo: memo,
                        timeSheetLineId: replayArray[0].timesheetlineid,
                        timeSheetId: replayArray[0].timesheetid,
                        hour: hour,
                        min: min,
                        sec: second,
                        date: replayArray[0].date
                    }
                    var response = https.post({
                        url: urlValue,
                        body: body
                    });
                    console.log('response', response.body);
                    if (response.body != 'failure') {
                        // remove all rows except first row
                        jQuery(".time_entered > tbody").empty()

                        //re populate lines with new list
                        populateTimeEntryLines();
                        replay = 0; // turn off replay until clicked again.
                        replayLineId = null;
                        replayArray.length = 0; // empty the array;
                    }
                }
                window.location.reload(true);
            });

            //replay button click
            jQuery('.replay_button_img').click(function () {
                timerIsRunning = true;
                var text = jQuery(this).closest("tr").find('#timesheetid_line').text();    // Find the row text
                console.log('found text', text);
                if (text != replayLineId) {
                    replayLineId = text;
                    replayArray.length = 0;
                    console.log('replayData', replayArray)
                }
                var lineEntries = getTimeEntriesLines(runtime.getCurrentUser().id);

                if (text) {
                    var index = lineEntries.map(function (data) {
                        return data.timesheetlineid
                    }).indexOf(text);
                    console.log('line entry index number', index);
                    if (index != -1) {
                        replay = 1;// turn on replay
                        timerMode = 1;
                        resetTimer(); // restart timer to 0
                        start(); // start timer again

                        jQuery('.play_button_img').hide();
                        jQuery('.stop_button_img').show();

                        var replayData = lineEntries[index]; // get replay object
                        console.log('replayData', replayData);
                        replayArray.push(replayData); // push to array for later use on upsert via button stop
                        // input data to entries cells for updates
                        if (replayArray[0].customer.text) {
                            jQuery('#project_input').val(replayArray[0].customer.text + '||' + replayArray[0].customer.value);
                        }
                        if (replayArray[0].case.text) {
                            jQuery('#case_input').val(replayArray[0].case.text + '||' + replayArray[0].case.value);
                        }
                        if (replayArray[0].projectaction.text) {
                            jQuery('#proj_action_input').val(replayArray[0].projectaction.text + '||' + replayArray[0].projectaction.value);
                        }
                        if (replayArray[0].item.text) {
                            jQuery('#service_item_input').val(replayArray[0].item.text + '||' + replayArray[0].item.value);
                        }
                        jQuery('#memo_input').val(replayArray[0].memo);
                    }
                }
            });

            jQuery('.manual_time').click(function() {
                timerIsRunning = false;
                var urlValue = url.resolveScript({
                    scriptId: 'customscript_bb_sl_time_entry',
                    deploymentId: 'customdeploy_bb_sl_time_entry'
                });
                jQuery('.display').hide();
                jQuery('.manual_time').hide();
                jQuery('.timer_button').show();
                jQuery('.manual_cell').show();
                jQuery('.play_button_img').hide();
                jQuery('.stop_button_img').hide();
                timerMode = 0;
                var empJson = {
                    action: 'clearemployeejson',
                    employeeId: runtime.getCurrentUser().id
                }
                var empClearResp = https.post({
                    url: urlValue,
                    body: empJson
                });
                console.log('empClearResp', empClearResp.body);
            });

            jQuery('.timer_button').click(function() {
                jQuery('.display').show();
                jQuery('.manual_time').show();
                jQuery('.timer_button').hide();
                jQuery('.manual_cell').hide();
                jQuery('.play_button_img').show();
            });

            //pause timer or restart time based on tab focus of browser window
            document.addEventListener('visibilitychange', function() {
                if(document.hidden) {
                    console.log('timer paused, browser out of focus');
                    // tab is now inactive
                    // temporarily clear timer using clearInterval() / clearTimeout()
                    var urlValue = url.resolveScript({
                        scriptId: 'customscript_bb_sl_time_entry',
                        deploymentId: 'customdeploy_bb_sl_time_entry'
                    });
                    var projectId = getAutoCompleteCellValueId(jQuery("#project_input").val());
                    var caseId = getAutoCompleteCellValueId(jQuery("#case_input").val());
                    var projectActionId = getAutoCompleteCellValueId(jQuery("#proj_action_input").val());
                    var serviceItemId = getAutoCompleteCellValueId(jQuery("#service_item_input").val());
                    var memo = jQuery("#memo_input").val();
                    console.log('projectId', projectId);
                    console.log('caseId', caseId);
                    console.log('projectActionId', projectActionId);
                    console.log('serviceItemId', serviceItemId);
                    console.log('memo', memo);
                    var body = {
                        action: 'pausetimer',
                        employeeId: runtime.getCurrentUser().id,
                        projectId: projectId,
                        caseId: caseId,
                        projectActionId: projectActionId,
                        serviceItemId: serviceItemId,
                        memo: memo,
                        timeSheetLineId: null,
                        timeSheetId: null,
                        hour: hour,
                        min: min,
                        sec: sec,
                        date: new Date()
                    }
                    if (timerMode == 1 && timerIsRunning) {
                        var response = https.post({
                            url: urlValue,
                            body: body
                        });
                        console.log('response', response.body);
                    }
                } else {
                    // tab is active again
                    // restart timers
                    console.log('timer restarted')
                    var urlValue = url.resolveScript({
                        scriptId: 'customscript_bb_sl_time_entry',
                        deploymentId: 'customdeploy_bb_sl_time_entry'
                    });
                    // var projectId = getAutoCompleteCellValueId(jQuery("#project_input").val());
                    // var caseId = getAutoCompleteCellValueId(jQuery("#case_input").val());
                    // var projectActionId = getAutoCompleteCellValueId(jQuery("#proj_action_input").val());
                    // var serviceItemId = getAutoCompleteCellValueId(jQuery("#service_item_input").val());
                    // var memo = jQuery("#memo_input").val();
                    // console.log('projectId', projectId);
                    // console.log('caseId', caseId);
                    // console.log('projectActionId', projectActionId);
                    // console.log('serviceItemId', serviceItemId);
                    // console.log('memo', memo);
                    var body = {
                        action: 'restarttimer',
                        employeeId: runtime.getCurrentUser().id,
                    }
                    if (timerMode == 1 && timerIsRunning) {
                        var response = https.post({
                            url: urlValue,
                            body: body
                        });
                        console.log(response.body);
                        if (response.body != 'failure') {

                            var response = JSON.parse(response.body);

                            var projectId = response.projectId;
                            var caseId = response.caseId;
                            var projectActionId = response.projectActionId;
                            var serviceItemId = response.serviceItemId;
                            var memo = response.memo;
                            var sDate = response.sDate;
                            console.log('sDate', sDate);
                            var eDate = new Date();
                            var dateDiffObj = getTimeDifference(sDate, eDate);
                            console.log('dateDiffObj', dateDiffObj);
                            var addingSec = 0;
                            var addMin = 0;
                            var addHrs = 0;
                            addingSec = dateDiffObj.seconds.toFixed(0);
                            addMin = dateDiffObj.minutes.toFixed(0);
                            addHrs = dateDiffObj.hours.toFixed(0);
                            console.log('seconds', addingSec);
                            console.log('addMin', addMin);
                            console.log('addHrs', addHrs);
                            console.log('sec', sec);
                            console.log('min', min);
                            console.log('hour', hour);

                            if (addingSec > 0) {
                                console.log('adding seconds')
                                sec = sec + parseInt(addingSec)
                            }
                            if (addMin > 0) {
                                console.log('adding min');
                                min = min + parseInt(addMin) - 1;
                            }
                            if (addHrs > 0) {
                                console.log('adding hrs')
                                hour = hour + parseInt(addHrs) - 1;
                            }
                        }
                    }
                }
            });

        }// end of page init function

        // set the time entry lines in html table
        function populateTimeEntryLines() {
            var lineEntries = getTimeEntriesLines(runtime.getCurrentUser().id);
            var baseNSUrl = getBaseURL();
            if (lineEntries.length > 0) {
                jQuery('.time_entered').append('<tbody>');
                for (var i = 0; i < lineEntries.length; i++) {
                    console.log('lineEntries', lineEntries[i]);
                    var projectName = lineEntries[i].customer.text;
                    var projectId = lineEntries[i].customer.value;
                    var timeSheetId = lineEntries[i].timesheetid;
                    var timeSheetLineId = lineEntries[i].timesheetlineid;

                    var date = lineEntries[i].date;
                    var employeeName = lineEntries[i].employee.text;
                    var employeeId = lineEntries[i].employee.value;
                    var serviceItemName = lineEntries[i].item.text;
                    var serviceItemId = lineEntries[i].item.value;
                    var billable = (lineEntries[i].billable == true) ? 'Yes' : 'No' ;
                    var memo = lineEntries[i].memo;
                    var hours = lineEntries[i].hours;
                    var caseName = lineEntries[i].case.text;
                    var caseId = lineEntries[i].case.value;
                    var projectActionName = lineEntries[i].projectaction.text;
                    var projectActionId = lineEntries[i].projectaction.value;
                    jQuery('.time_entered  > tbody:last-child').append(
                        '<tr id='+ i +'>' +
                        '<td id="replay_button_line" style="text-align: center"><button type="button" class="replay_button_img"><img  src="https://tstdrv1967913.app.netsuite.com/core/media/media.nl?id=136888&c=TSTDRV1967913&h=EinM_DP1V5lE_3q6BpnKqJ7D01PR3BgIFNg0_eL2Q27Oe-XG" width="30">&nbsp</button></td>' +
                        //'<td id="project_line">' + projectName + '</td>' +
                        '<td id="project_line" name="project_line"><a href="'+baseNSUrl+getProjectURLExtension()+projectId+'" target="_blank">'+projectName+'</a></td>'+
                        //'<td id="case_line">' + caseName + '</td>' +
                        '<td id="case_line" name="case_line"><a href="'+baseNSUrl+getCaseURLExtension()+caseId+'" target="_blank">'+caseName+'</a></td>'+
                        '<td id="projectaction_line">' + projectActionName + '</td>' +
                        //'<td id="projectaction_line" name="projectaction_line"><a href="'+baseNSUrl+getProjectActionURLExtension()+projectActionId+'" target="_blank">'+projectActionName+'</a></td>'+
                        '<td id="service_item_line">' + serviceItemName + '</td>' +
                        '<td id="billable_line">' + billable + '</td>' + // billable check box
                        '<td id="memo_line">' + memo + '</td>'+
                        '<td id="date_line">' + date + '</td>'+// Sunday
                        '<td id="hours_line">' + hours + '</td>'+//Total Time
                        //'<td id="timesheetid_line" name="time_line_id">' + timeSheetLineId + '</td>'+
                        '<td id="timesheetid_line" name="time_line_id"><a href="'+baseNSUrl+getTimeEntryURLExtension()+timeSheetLineId+'" target="_blank">'+timeSheetLineId+'</a></td>'+
                        '</tr>'
                    );
                }
                jQuery(document).ready(function() {
                    jQuery(".time_entered").find("tr:odd").css({
                        "background-color":"#E9E9E9",
                        "color":"#000000"
                    });
                });
            }
        }

        function getBaseURL(){
            var accountId = runtime.accountId;
            return 'https://'+accountId+'.app.netsuite.com';
        }
        function getTimeEntryURLExtension(){
            return '/app/accounting/transactions/timebill.nl?id=';
        }

        function getProjectURLExtension(){
            return '/app/common/entity/custjob.nl?id=';
        }

        function getCaseURLExtension(){
            return'/app/crm/support/supportcase.nl?id=';
        }

        function getProjectActionURLExtension(){
            //how can I find the recType or use the id of customrecord_bb_project_action
            return 'app/common/custom/custrecordentry.nl?rectype=300&id=&';
        }


        // gets all time time entry lines for this week
        function getTimeEntriesLines(employeeId) {
            var lineArray = [];
            if (employeeId) {
                var timebillSearchObj = search.create({
                    type: "timebill",
                    filters:
                        [
                            ["timesheet.timesheetdate","within","thisweek"],
                            "AND",
                            ["timesheet.employee","anyof", employeeId]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Time Sheet Line ID", sort: search.Sort.DESC,}),
                            search.createColumn({name: "timesheet", label: "Weekly Time Sheet ID"}),
                            search.createColumn({name: "date", label: "Date"}),
                            search.createColumn({name: "employee", label: "Employee"}),
                            search.createColumn({name: "customer", label: "Customer"}),
                            search.createColumn({name: "item", label: "Item"}),
                            search.createColumn({
                                name: "displayname",
                                join: "item",
                                label: "Display Name"
                            }),
                            search.createColumn({name: "isbillable", label: "Billable"}),
                            search.createColumn({name: "memo", label: "Note"}),
                            search.createColumn({name: "hours", label: "Duration"}),
                            search.createColumn({name: "type", label: "Type"}),
                            search.createColumn({name: "approvalstatus", label: "Approval Status"}),
                            search.createColumn({name: "casetaskevent", label: "Case/Task/Event"}),
                            search.createColumn({name: "custcol_bb_time_project_action", label: "Project Action Time"}),
                            search.createColumn({
                                name: "internalid",
                                join: "item",
                                label: "Internal ID"
                            })
                        ]
                });
                var searchResultCount = timebillSearchObj.runPaged().count;
                log.debug("timebillSearchObj result count",searchResultCount);
                timebillSearchObj.run().each(function(result){
                    log.debug("result",result);
                    lineArray.push({
                        timesheetlineid: result.getValue({name: 'internalid'}),
                        timesheetid: result.getValue({name: 'timesheet'}),
                        date: result.getValue({name: 'date'}),
                        employee: {
                            text: result.getText({name: 'employee'}),
                            value: result.getValue({name: 'employee'})
                        },
                        customer: {
                            text: result.getText({name: 'customer'}),
                            value: result.getValue({name: 'customer'})
                        },
                        item: {
                            text: result.getValue({name: 'item'}) + ' '+ result.getValue({name: 'displayname', join:'item'}),
                            value: result.getValue({name: 'internalid', join: 'item'})
                        },
                        billable: result.getValue({name: 'isbillable'}),
                        memo: result.getValue({name: 'memo'}),
                        hours: result.getValue({name: 'hours'}),
                        case: {
                            text: result.getText({name: 'casetaskevent'}),
                            value: result.getValue({name: 'casetaskevent'})
                        },
                        projectaction: {
                            text: result.getText({name: 'custcol_bb_time_project_action'}),
                            value: result.getValue({name: 'custcol_bb_time_project_action'})
                        },
                    })
                    return true;
                });
            }
            return lineArray;
        }


        // get project for autocomplete field
        function getProjects() {
            var array = [];
            var jobSearchObj = search.create({
                type: "job",
                filters:
                    [
                        ["isinactive","is","F"],
                        "AND",
                        ["allowtime","is","T"],
                        "AND",
                        ["status","noneof","21","1"]
                    ],
                columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"}),
                        search.createColumn({name: "altname", label: "Name"})
                    ]
            });
            jobSearchObj.run().each(function(result){
                array.push(
                    result.getValue({name: 'altname'}) + ' || ' + result.getValue({name: 'internalid'})
                )
                return true;
            });
            return array;
        }


        // get cases related to rpoject
        function getProjectRelatedCases(projectId) {
            var array = [];
            var filters = [["isinactive","is","F"], "AND", ["stage","noneof","CLOSED"]];
            if (projectId) {
                filters.push("AND", ["custevent_bb_project", "anyof", projectId]);
                //filters.push("AND", ["company.internalidnumber","equalto","projectId"])
                //filters.push("AND",[["company.internalidnumber","equalto","projectId"],"OR",["custevent_bb_project","anyof","projectId"]]);
            }
            console.log(filters);
            log.debug('case filters', filters);
            var supportcaseSearchObj = search.create({
                type: "supportcase",
                filters: filters,
                columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"}),
                        search.createColumn({
                            name: "casenumber",
                            sort: search.Sort.ASC,
                            label: "Number"
                        }),
                        search.createColumn({name: "title", label: "Subject"})
                    ]
            });
            supportcaseSearchObj.run().each(function(result){
                var id = result.getValue({name: 'internalid'});
                var caseNum = result.getValue({name: 'casenumber'});
                var subject = result.getValue({name: 'title'});
                var autoCompleteString = caseNum + '-' + subject + ' || ' + id;
                array.push(autoCompleteString)
                return true;
            });
            log.debug('support cases', array);
            console.log('support case values', array)
            return array;
        }


        // get project actions related to project
        function getProjectRelatedProjectActions(projectId) {
            var array = [];
            if (projectId) {
                var customrecord_bb_project_actionSearchObj = search.create({
                    type: "customrecord_bb_project_action",
                    filters:
                        [["isinactive","is","F"], "AND", ["custrecord_bb_project","anyof", projectId]],
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
                customrecord_bb_project_actionSearchObj.run().each(function(result){
                    var id = result.getValue({name: 'internalid'});
                    var name = result.getValue({name: 'name'});
                    var autoCompleteString = name + ' || ' + id;
                    array.push(autoCompleteString)
                    return true;
                });
            }
            return array;
        }


        //get service items for autocomplete
        function getServiceItems() {
            var array = [];
            var serviceitemSearchObj = search.create({
                type: "serviceitem",
                filters:
                    [
                        ["isinactive","is","F"],
                        "AND",
                        ["type","anyof","Service"]
                    ],
                columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"}),
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({name: "displayname", label: "Display Name"})
                    ]
            });
            serviceitemSearchObj.run().each(function(result){
                //array.push(result.getValue({name: 'itemid'}) + ' || ' + result.getValue({name: 'internalid'}))
                array.push(result.getValue({name: 'itemid'}) + ' ' + result.getValue({name: 'displayname'})+ ' || ' + result.getValue({name: 'internalid'}) )
                return true;
            });
            return array;
        }


        // auto complete function
        function autocomplete(inp, arr) {
            /*the autocomplete function takes two arguments,
            the text field element and an array of possible autocompleted values:*/
            var currentFocus;
            /*execute a function when someone writes in the text field:*/
            inp.addEventListener("input", function(e) {
                var a, b, i, val = this.value;
                /*close any already open lists of autocompleted values*/
                closeAllLists();
                if (!val) { return false;}
                currentFocus = -1;
                /*create a DIV element that will contain the items (values):*/
                a = document.createElement("DIV");
                a.setAttribute("id", this.id + "autocomplete-list");
                a.setAttribute("class", "autocomplete-items");
                a.style.left = this.getBoundingClientRect().x + "px";
                /*append the DIV element as a child of the autocomplete container:*/
                this.parentNode.appendChild(a);
                /*for each item in the array...*/
                for (i = 0; i < arr.length; i++) {
                    /*check if the item starts with the same letters as the text field value:*/
                    if ((arr[i].toUpperCase()).includes(val.toUpperCase())) {
                        /*create a DIV element for each matching element:*/
                        b = document.createElement("DIV");
                        /*make the matching letters bold:*/
                        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                        b.innerHTML += arr[i].substr(val.length);
                        /*insert a input field that will hold the current array item's value:*/
                        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                        /*execute a function when someone clicks on the item value (DIV element):*/
                        b.addEventListener("click", function(e) {
                            /*insert the value for the autocomplete text field:*/
                            inp.value = this.getElementsByTagName("input")[0].value;
                            /*close the list of autocompleted values,
                            (or any other open lists of autocompleted values:*/
                            closeAllLists();
                        });
                        a.appendChild(b);
                    }
                }
            });
            /*execute a function presses a key on the keyboard:*/
            inp.addEventListener("keydown", function(e) {
                var x = document.getElementById(this.id + "autocomplete-list");
                if (x) x = x.getElementsByTagName("div");
                if (e.keyCode == 40) {
                    /*If the arrow DOWN key is pressed,
                    increase the currentFocus variable:*/
                    currentFocus++;
                    /*and and make the current item more visible:*/
                    addActive(x);
                } else if (e.keyCode == 38) { //up
                    /*If the arrow UP key is pressed,
                    decrease the currentFocus variable:*/
                    currentFocus--;
                    /*and and make the current item more visible:*/
                    addActive(x);
                } else if (e.keyCode == 13) {
                    /*If the ENTER key is pressed, prevent the form from being submitted,*/
                    e.preventDefault();
                    if (currentFocus > -1) {
                        /*and simulate a click on the "active" item:*/
                        if (x) x[currentFocus].click();
                    }
                }
            });
            function addActive(x) {
                /*a function to classify an item as "active":*/
                if (!x) return false;
                /*start by removing the "active" class on all items:*/
                removeActive(x);
                if (currentFocus >= x.length) currentFocus = 0;
                if (currentFocus < 0) currentFocus = (x.length - 1);
                /*add class "autocomplete-active":*/
                x[currentFocus].classList.add("autocomplete-active");
            }
            function removeActive(x) {
                /*a function to remove the "active" class from all autocomplete items:*/
                for (var i = 0; i < x.length; i++) {
                    x[i].classList.remove("autocomplete-active");
                }
            }
            function closeAllLists(elmnt) {
                /*close all autocomplete lists in the document,
                except the one passed as an argument:*/
                var x = document.getElementsByClassName("autocomplete-items");
                for (var i = 0; i < x.length; i++) {
                    if (elmnt != x[i] && elmnt != inp) {
                        x[i].parentNode.removeChild(x[i]);
                    }
                }
            }
            /*execute a function when someone clicks in the document:*/
            document.addEventListener("click", function (e) {
                closeAllLists(e.target);
            });
        }


        // get the internal id value from autocomplete cell value
        function getAutoCompleteCellValueId(value) {
            var id = null;
            if (value) {
                var pattern = new RegExp('||');
                var test = pattern.test(value);
                if (test) {
                    id = value.split('||').pop().trim();
                }
            }
            return id;
        }


        //gets the time difference between 2 dates
        function getTimeDifference(date1, date2) {
            console.log('date1', date1)
            console.log('date2', date2)
            var a = new Date(date1).getTime(),
                b = new Date(date2).getTime(),
                diff = {};

            diff.milliseconds = a > b ? a % b : b % a;
            diff.seconds = diff.milliseconds / 1000;
            diff.minutes = diff.seconds / 60;
            diff.hours = diff.minutes / 60;
            diff.days = diff.hours / 24;
            diff.weeks = diff.days / 7;

            return diff;
        }

        return {
            pageInit: pageInit
        };

    });