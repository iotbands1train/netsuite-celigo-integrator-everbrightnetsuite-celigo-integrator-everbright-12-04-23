/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/https', 'N/url', 'N/currentRecord'],
/**
 * @param{https} https
 * @param{url} url
 */
function(https, url, currentRecord) {
    
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

    function refreshSnapShot(payrollPeriod){
        var currRecord = currentRecord.get();
        console.log('currRecord: '+JSON.stringify(currRecord));
        //var payrollPeriod = currRecord.getValue('custrecord_bbss_comm_snapshot_pay_period');
        console.log('payrollPeriod: '+payrollPeriod);
        var refreshSuitelet = url.resolveScript({
            scriptId: 'customscript_bb_sl_commv2_refresh_snap',
            deploymentId: 'customdeploy_bb_sl_commv2_refresh_snap',
            params: {
                'payrollPeriod': payrollPeriod,
                'recordID': currRecord.id,
                'recordType': currRecord.type
            }
        });
        // alert('Your are attempting a snap shot refresh. Are you sure you want to continue?')
        if (confirm('Your are attempting a snap shot refresh. Are you sure you want to continue?')) {
            window.open(refreshSuitelet, '_self', false);
        }
    }

    return {
        pageInit: pageInit,
        refreshSnapShot: refreshSnapShot
    };
    
});
