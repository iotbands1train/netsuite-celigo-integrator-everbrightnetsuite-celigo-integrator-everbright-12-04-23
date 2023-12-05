/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 * @NModuleScope Public
 * @Overview - Create Calendar Event.
 */
define(['N/record', 'N/search', 'N/runtime'],

    function(record, search, runtime) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {
                //get parameters from WF
                var func = "onAction";
                var differenceInDays = 0;	// here we go  custrecord_bb_proj_act_event_single
                var assignedTo = runtime.getCurrentScript().getParameter({name: 'custscript_bb_evnt_assigned_to'});
                var company = runtime.getCurrentScript().getParameter({name: 'custscript_bb_evnt_company'});
                var sDate = runtime.getCurrentScript().getParameter({name: 'custscript_bb_evnt_start_date'});
                var startTime = runtime.getCurrentScript().getParameter({name: 'custscript_bb_evnt_start_time'});
                var endTime = runtime.getCurrentScript().getParameter({name: 'custscript_bb_evnt_end_time'});
                var title = runtime.getCurrentScript().getParameter({name: 'custscript_bb_evnt_title'});
                var seriesStartDate = runtime.getCurrentScript().getParameter({name: 'custscript_bb_evnt_series_start_date'});
                var endBy = runtime.getCurrentScript().getParameter({name: 'custscript_bb_event_end_by_date'});
                var eDate = runtime.getCurrentScript().getParameter({name: 'custscript_bb_evnt_end_date'});
                var frequency = runtime.getCurrentScript().getParameter({name: 'custscript_bb_evnt_frequency'});
                var multAtdFld = runtime.getCurrentScript().getParameter({name: 'custscript_bb_proj_act_event_attd'});
                var singleAtdFld = runtime.getCurrentScript().getParameter({name: 'custscript_bb_proj_act_event_single'});
                var atdList = scriptContext.newRecord.getValue({fieldId: multAtdFld});
                var singleAtd = scriptContext.newRecord.getValue({fieldId: singleAtdFld});
                var eventRec;
                // Add the single attendee to the array to send to createCalendarEvent
                if(!isNullOrEmpty(singleAtd)) { atdList.push(singleAtd); }
                // Remove duplicates
                atdList = atdList.reduce(function (pv, cv) {
                    if (pv.indexOf(cv) === -1) { pv.push(cv) }
                    return pv
                }, []);
                log.debug(func, "Start: " + JSON.stringify({
                    singleAtd: singleAtd,
                    singleAtdFld: singleAtdFld,
                    multAtdFld: multAtdFld,
                    atdList: atdList,
                    differenceInDays: differenceInDays,
                    assignedTo: assignedTo,
                    company: company,
                    sDate: sDate,
                    startTime: startTime,
                    endTime: endTime,
                    title: title,
                    seriesStartDate: seriesStartDate,
                    endBy: endBy,
                    eDate: eDate, 
                    frequency: frequency
                }));

                // create first event
                eventRec = createCalendarEvent(assignedTo, company, title, sDate, sDate, startTime, endTime, atdList)

                if (sDate && eDate) {
                    differenceInDays = getNumberOfDays(sDate, eDate);
                }

                // To create events spanning multiple days
                if (differenceInDays > 0) {
                    /**
                    for (var d = 0; d < differenceInDays; d++) {
                        var startDate = new Date(sDate);
                        var tomorrow = startDate;
                        tomorrow.setDate(startDate.getDate()+d+1);
                        log.debug('tomorrow', tomorrow);
                        createCalendarEvent(assignedTo, company, title, tomorrow, tomorrow, startTime, endTime, atdList);
                    }
                    */
                }
                log.debug(func, "Returning, eventRec: " + JSON.stringify({eventRec: eventRec}));

                // set the event rec id in the "Appointment Field"
                if(!isNullOrEmpty(eventRec)) {
                    scriptContext.newRecord.setValue({fieldId: "custrecord_bb_proj_action_event", value: eventRec.id});
                }
                
            } catch (e) {
                 log.error(e.name, JSON.stringify(e));
            }
        }

        function createCalendarEvent(assignedTo, company, title, startDate, endDate, startTime, endTime, atdList) {
            try{
                var func = "createCalendarEvent"; 
                var event, eventId, i; 
                if (assignedTo && company && title && startDate && endDate && !isNullOrEmpty(atdList)) {
                    event = record.create({
                        type: record.Type.CALENDAR_EVENT,
                        isDynamic: true
                    });
                    event.setValue({ fieldId: 'title', value: title });
                    if (startDate) {
                        event.setValue({ fieldId: 'startdate', value: startDate });
                    }
                    if (endDate) {
                        event.setValue({ fieldId: 'enddate', value: endDate });
                    }
                    if (startTime) {
                        event.setValue({ fieldId: 'starttime', value: startTime });
                    }
                    if (endTime) {
                        event.setValue({ fieldId: 'endtime', value: endTime });
                    }
                    if (atdList.length > 0) {
                        log.debug(func, "In attendee list.");
                        for(i = 0; i < atdList.length; i += 1) {
                            event.selectNewLine({ sublistId: 'attendee' });
                            event.setCurrentSublistValue({ sublistId: 'attendee', fieldId: 'attendee', value: atdList[i] });
                            event.setCurrentSublistValue({ sublistId: 'attendee', fieldId: 'response', value: "NORESPONSE" });
                            event.commitLine({ sublistId: 'attendee' });
                        }
                    }
                    log.debug('calendar event before save');
                    eventId = event.save({ ignoreMandatoryFields: true });
                    log.debug('calendar event saved');
                }
                log.debug("Calendar Event Id:" , eventId);
                return event;
            } catch (e) {
                 log.error(e.name, JSON.stringify(e));
            }
        }

        function getNumberOfDays(start, end) {
            const func = "getNumberOfDays";
            const date1 = new Date(start);
            const date2 = new Date(end);

            // One day in milliseconds
            const oneDay = 1000 * 60 * 60 * 24;

            // Calculating the time difference between two dates
            const diffInTime = date2.getTime() - date1.getTime();

            // Calculating the no. of days between two dates
            const diffInDays = Math.round(diffInTime / oneDay);

            log.debug(func, "Returning: " + diffInDays);
            return diffInDays;
        }

        /**
         * @description isNullOrEmpty: method that validates if a variable has null or empty value.
         * @param {*} _value [required];
         * @returns {boolean}. Return true if the variable is null or empty
         */
        function isNullOrEmpty (_value) {
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
        return {
            onAction : onAction
        };

    });
