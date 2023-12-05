/* jshint unused:true, undef:true */
/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 */
define( // jshint ignore:line
    ['N/url', 'N/https', './util.js', 'N/search'],

    function (url, https, util, search) {
        var intervalId = null;
        /**
         * Function gets the response body from the suitelet and sets the percentage to the progress bar
         * 
         * @governance 0 Units
         * @param {Object} body - response from the suitelet
         */
        function addPercentInProgressBar(body) {
            console.log(body);
            jQuery('#file').attr('value', body.percentComplete);
        }

        /**
         * Function adds the progress bar and sends request to suitelet to get the task status
         * 
         * @governance 0 Units
         * @param {String} taskId - Task id of the Map reduce script
         * @param {Object} context - Context object of the current request
         */
        function callMapReduceStatusCheck(taskId, context) {

            if (!util.isNullOrEmpty(taskId)) {
                var txt1 = "<label for='file'>Copy progress:</label>";
                var txt2 = "<progress id='file' value='' max='100'> 32% </progress>";
                jQuery('#body').append(txt1, txt2);
                intervalId = setInterval(function () { callSuitelet(taskId, context) }, 10000);

            }
        }


        /**
         * Function sends request to suitelet to get the task status and redirects to new Project upon completion of copy
         * 
         * @governance 0 Units
         * @param {String} taskId - Task id of the Map reduce script
         * @param {Object} context - Context object of the current request
         */
        function callSuitelet(taskId, context) {
            var headerObj = {
                name: 'Content-Type',
                value: 'application/json'
            };
            var param = {
                taskId: taskId
            }

            var scriptStatusUrl=url.resolveScript({
                scriptId: 'customscript_bb_sl_scriptrunningstatus',
                deploymentId: 'customdeploy_bb_sl_scriptrunningstatus'
            });
            var response = https.post({
                url: scriptStatusUrl,
                headers: headerObj,
                body: param
            });
            var respObj = JSON.parse(response.body);
            if (respObj.status == 'COMPLETE' || respObj.status == 'FAILED') {
                clearInterval(intervalId);
            }

            if (respObj.status == 'COMPLETE') {
                var projectSource = context.currentRecord.getValue({
                    fieldId: 'custpage_project'
                });

                var fieldLookUp = search.lookupFields({
                    type: 'job',
                    id: projectSource,
                    columns: ['custentity_bb_copy_to']
                });

                var output = url.resolveRecord({
                    recordType: 'job',
                    recordId: fieldLookUp.custentity_bb_copy_to[0].value,
                    isEditMode: false
                });

                window.location = output;
            }
            addPercentInProgressBar(respObj);

        }

        /**
         * Function checks if there is a task id in the hidden task id field then its calls the functions to get status
         * 
         * @governance 0 Units
         * @param {Object} context - Context object of the current request
         */
        function pageInit(context) {
            var taskId = context.currentRecord.getValue({
                fieldId: 'custpage_taskid'
            });
            if (!util.isNullOrEmpty(taskId)) {
                callMapReduceStatusCheck(taskId, context);
            }

        }

        return {
            addPercentInProgressBar: addPercentInProgressBar,
            callMapReduceStatusCheck: callMapReduceStatusCheck,
            callSuitelet: callSuitelet,
            pageInit: pageInit
        };
    })
