/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/currentRecord', 'N/url'],

    function(currentRecord, url) {

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

        }


        function searchTasks() {

            var currRecord = currentRecord.get();

            var startDate = currRecord.getValue({
                fieldId: 'custpage_start_date'
            });
            var endDate = currRecord.getValue({
                fieldId: 'custpage_end_date'
            });
            var assignedTo = currRecord.getValue({
                fieldId: 'custpage_assigned_to'
            });
            var status = currRecord.getValue({
                fieldId: 'custpage_status'
            });
            console.log('assigned to', assignedTo);
            console.log('status', status);
            var statusString = status.toString();
            var assignedToString = assignedTo.toString();

            var dateObj = getDateStrings(startDate, endDate);

            if (startDate || endDate || assignedTo || status) {
                var searchRecords = url.resolveScript({
                    scriptId: 'customscript_bb_sl_view_tasks',
                    deploymentId: 'customdeploy_bb_sl_view_tasks',
                    params: {
                        'sDate': dateObj.firstday,
                        'eDate': dateObj.lastday,
                        'assignedTo': assignedToString,
                        'statusString': statusString
                    }
                });
                window.onbeforeunload = null;
                window.open(searchRecords, '_self', false);
            }

        }


        function searchPhoneCalls() {

            var currRecord = currentRecord.get();

            var startDate = currRecord.getValue({
                fieldId: 'custpage_start_date'
            });
            var endDate = currRecord.getValue({
                fieldId: 'custpage_end_date'
            });
            var assignedTo = currRecord.getValue({
                fieldId: 'custpage_assigned_to'
            });
            var status = currRecord.getValue({
                fieldId: 'custpage_status'
            });
            console.log('assigned to', assignedTo);
            console.log('status', status);
            var statusString = status.toString();
            var assignedToString = assignedTo.toString();

            var dateObj = getDateStrings(startDate, endDate);

            if (startDate || endDate || assignedTo || status) {
                var searchRecords = url.resolveScript({
                    scriptId: 'customscript_bb_sl_part_phone_call',
                    deploymentId: 'customdeploy_bb_sl_part_phone_call',
                    params: {
                        'sDate': dateObj.firstday,
                        'eDate': dateObj.lastday,
                        'assignedTo': assignedToString,
                        'statusString': statusString
                    }
                });
                window.onbeforeunload = null;
                window.open(searchRecords, '_self', false);
            }

        }


        function searchCalendarEvents() {

            var currRecord = currentRecord.get();

            var startDate = currRecord.getValue({
                fieldId: 'custpage_start_date'
            });
            var endDate = currRecord.getValue({
                fieldId: 'custpage_end_date'
            });
            var assignedTo = currRecord.getValue({
                fieldId: 'custpage_assigned_to'
            });
            var status = currRecord.getValue({
                fieldId: 'custpage_status'
            });
            console.log('assigned to', assignedTo);
            console.log('status', status);
            var statusString = status.toString();
            var assignedToString = assignedTo.toString();

            var dateObj = getDateStrings(startDate, endDate);

            if (startDate || endDate || assignedTo || status) {
                var searchRecords = url.resolveScript({
                    scriptId: 'customscript_bb_sl_part_calen_event',
                    deploymentId: 'customdeploy_bb_sl_part_calen_event',
                    params: {
                        'sDate': dateObj.firstday,
                        'eDate': dateObj.lastday,
                        'assignedTo': assignedToString,
                        'statusString': statusString
                    }
                });
                window.onbeforeunload = null;
                window.open(searchRecords, '_self', false);
            }

        }


        function getDateStrings(startDate, endDate){
            var first = null;
            var last = null;
            if (startDate) {
                var sDay = new Date(startDate);
                first = String((sDay.getMonth()+1) + '/' + sDay.getDate() + '/' + sDay.getFullYear());
            }
            if (endDate) {
                var eDay = new Date(endDate);
                last = String((eDay.getMonth()+1)+ '/' + eDay.getDate() + '/' + eDay.getFullYear());
            }
            console.log('first day', first);
            console.log('last day', last);
            return {
                firstday: first,
                lastday: last
            }
        }

        return {
            pageInit: pageInit,
            searchTasks: searchTasks,
            searchPhoneCalls: searchPhoneCalls,
            searchCalendarEvents: searchCalendarEvents
        };

    });
