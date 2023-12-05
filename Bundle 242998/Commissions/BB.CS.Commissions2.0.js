/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/https', 'N/search', 'N/url', './BB.MD.Commission2.0.Lib'],
/**
 * @param{currentRecord} currentRecord
 * @param{https} https
 * @param{search} search
 * @param{url} url
 */
function(currentRecord, https, search, url, util) {

    var arrSubtabObjects;
        function pageInit(scriptContext) {
        try{
            var currRecord = currentRecord.get();

            arrSubtabObjects = util.getSuiteletSubtabs(currRecord.getValue('custpage_deployid'), currRecord.getValue('custpage_operation'));

        }catch (e) {
            log.error('ERROR', e);
        }

    }


    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        try{
            var currRecord = currentRecord.get();
            var operation = currRecord.getValue('custpage_operation');

            if(scriptContext.fieldId === 'custpage_payroll_period') {
                redirectToSuitelet(operation);
            }
            if(scriptContext.fieldId === 'custpage_payee') {
                redirectToSuitelet(operation);
            }

            if(operation === 'clawback' && scriptContext.fieldId === 'custpage_payroll_period') {
                redirectToSuitelet(operation);
            }
            if(scriptContext.fieldId === 'custpage_checkbox') {

                if(!isEmpty(arrSubtabObjects)){
                    var amountSublistFieldID = 'custpage_' + arrSubtabObjects[0].datasetID + '_snap_owed';
                    var sublistCheckbox = currRecord.getCurrentSublistValue({
                        sublistId: scriptContext.sublistId,
                        fieldId: scriptContext.fieldId
                    });
                    var currentTotal = parseFloat(currRecord.getValue('custpage_current_total'));
                    var lineAmount = currRecord.getSublistValue({
                        sublistId: scriptContext.sublistId,
                        fieldId: amountSublistFieldID,
                        line: scriptContext.line
                    });
                    if(!isEmpty(lineAmount)){
                        if (sublistCheckbox === 'T' || sublistCheckbox === true) {
                            currentTotal += parseFloat(lineAmount);
                        }else{
                            currentTotal -= parseFloat(lineAmount);
                        }
                        currRecord.setValue('custpage_current_total', currentTotal);
                    }
                }
            }
        }catch (e) {
            log.error('ERROR', e);
        }

    }
    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        var currRecord = currentRecord.get();
        var payrollPeriod = currRecord.getValue('custpage_payroll_period');
        console.log('payroll period', payrollPeriod);
        if (isEmpty(payrollPeriod)) {
            alert('The payroll period MUST BE SELECTED before you can proceed with creating a Snap Shot');
            return false;
        }

        return true;
    }

    function refreshSnapShot() {
        var currRecord = currentRecord.get();
        var payrollPeriod = currRecord.getValue('custpage_payroll_period');
        var refreshSuitelet = url.resolveScript({
            scriptId: 'customscript_bb_sl_commv2_refresh_snap',
            deploymentId: 'customdeploy_bb_sl_commv2_refresh_snap',
            params: {
                'payrollPeriod': payrollPeriod
            }
        });
        // alert('Your are attempting a snap shot refresh. Are you sure you want to continue?')
        if (confirm('Your are attempting a snap shot refresh. Are you sure you want to continue?')) {
            window.open(refreshSuitelet, '_self', false);
        }
    }

    function returnToHome() {
        redirectToSuitelet();
    }
    function editSnapShot(){
        redirectToSuitelet('edit');
    }
    function deleteSnapShot(){
        redirectToSuitelet('delete');
    }
    function createCommJe(){
        redirectToSuitelet('pay');
    }

    function redirectToSuitelet(operation, getTaskIDFromSuitelet){
        console.log('operation: '+operation);
        var currRecord = currentRecord.get();
        var deployID = currRecord.getValue('custpage_deployid');
        var payrollPeriod = currRecord.getValue('custpage_payroll_period');
        var currentTaskId = currRecord.getValue('custpage_taskid');
        console.log('deployID: '+deployID);
        var payee = currRecord.getValue('custpage_payee');

        if(getTaskIDFromSuitelet === false){
            currentTaskId = null;
        }

        if (isEmpty(payrollPeriod)) {
            if(operation === 'pay') {
                alert('No Payroll Period has been selected. Please enter in Payroll Period before attempting to create Journal Entries.');
                return;
            }

            if(operation === 'delete') {
                alert('No Payroll Period has been selected. Please enter in Payroll Period before attempting to delete Commission Snapshots.');
                return;
            }

            if(operation === 'edit') {
                alert('No Payroll Period has been selected. Please enter in Payroll Period before attempting to edit Commission Snapshots.');
                return;
            }
        }

        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_bb_sl_commv2_main',
            deploymentId: deployID,
            params: {
                'payrollPeriod': payrollPeriod,
                'operation': operation,
                'taskId': currentTaskId,
                'payee': payee
            }
        });
        console.log('suiteletURL: '+suiteletURL);
        window.open(suiteletURL, '_self', false);
    }

    function isEmpty (stValue) {
        return ((stValue === '' || stValue == null || false) || (stValue.constructor === Array && stValue.length === 0) || (stValue.constructor === Object && (function (v) {
            for (var k in v)
                return false;
            return true;
        })(stValue)));
    };

    function exportCSV(sublistID) {
        var currRecord = currentRecord.get();

        var splitSublistId = sublistID.split('_');
        var datasetId = splitSublistId[splitSublistId.length - 1];

        // var sublistNumLines = currRecord.getLineCount({
        //     sublistId: sublistID
        // });
        // console.log('sublistNumLines', sublistNumLines);
        //
        // for(var sublistIndex = 0; sublistIndex<sublistNumLines; sublistIndex++){
        //     var sublistCheckbox = currRecord.getSublistValue({
        //         sublistId: sublistID,
        //         fieldId: 'custpage_checkbox',
        //         line: sublistIndex
        //     });
        //     console.log('sublistCheckbox', sublistCheckbox);
        //     if(sublistCheckbox === 'T' || sublistCheckbox === true){
        //         console.log("%%%%%%%%");
        //     }else{
        //         console.log("$$$$$$");
        //     }
        // }
        //console.log("%%%%%%%% "+sublistID);

        //
        // var arrStringValuesToPrint = getValuesFromSublist(currRecord);
        //
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_bb_sl_comm_v2_export_csv',
            deploymentId: 'customdeploy_bb_sl_comm_v2_export_csv',
            params: {
                'datasetId': datasetId,
            }
        });
        window.open(suiteletURL, '_self', 'resizable=0,scrollbars=0,width=470,height=400');
    }

    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
        returnToHome: returnToHome,
        refreshSnapShot: refreshSnapShot,
        editSnapShot: editSnapShot,
        deleteSnapShot: deleteSnapShot,
        createCommJe: createCommJe,
        pageInit: pageInit,
        exportCSV: exportCSV
    };
    
});
