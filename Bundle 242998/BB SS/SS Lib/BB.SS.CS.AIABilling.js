/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/currentRecord', 'N/url'],

    function(record, search, currentRecord, url) {

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
            return true;
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
            var currRecord = currentRecord.get();
            //console.log(currRecord);
            var field = scriptContext.fieldId;
            console.log('field',field);
            var lineId = scriptContext.line;
            var sublistId = scriptContext.sublistId;
            if (field == 'custpage_bb_aia_bill_line_gc_percent') {
                console.log('triggered');
                var gcPercent = currRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: field});

                console.log(gcPercent);
                var scheduledAmount = currRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_aia_bill_lin_scheduled_amt'});
                var fromPrevApp = currRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_aia_bill_from_prev_app_amt'}) || 0;
                var materialsStored = currRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_aia_bill_line_mat_store_prcnt'}) || 0;
                var thisPerAmt = (gcPercent) ? parseFloat(scheduledAmount - fromPrevApp) * parseFloat(gcPercent) / 100 : 0;
                currRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_aia_bill_line_period_amt', value: thisPerAmt});
                var totalComplAndStoredToDate = fromPrevApp + thisPerAmt + materialsStored;
                var balToFinish = scheduledAmount - (fromPrevApp + thisPerAmt + materialsStored);
                currRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_aia_bill_line_cmpt_str_amt', value: totalComplAndStoredToDate});
                currRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_bb_aia_bill_line_bal_fin_amt', value: balToFinish});
            }
            if (field == 'custpage_aia_bill_from_prev_app_amt') {
                console.log('triggered');
                var gcPercent = currRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_bb_aia_bill_line_gc_percent'});
                console.log('gc Percent', gcPercent);
                var scheduledAmount = currRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_aia_bill_lin_scheduled_amt'});
                var fromPrevApp = currRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_aia_bill_from_prev_app_amt'}) || 0;
                var materialsStored = currRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_aia_bill_line_mat_store_prcnt'}) || 0;
                var thisPerAmt = (gcPercent) ? parseFloat(scheduledAmount - fromPrevApp) * parseFloat(gcPercent) / 100 : 0;
                currRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_aia_bill_line_period_amt', value: thisPerAmt});
                var totalComplAndStoredToDate = fromPrevApp + thisPerAmt + materialsStored;
                var balToFinish = scheduledAmount - (fromPrevApp + thisPerAmt + materialsStored);
                currRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_aia_bill_line_cmpt_str_amt', value: totalComplAndStoredToDate});
                currRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_bb_aia_bill_line_bal_fin_amt', value: balToFinish});
            }
            //sum all the 'This Period Amount' lines and set on 'Current Payment Due' in header
            // var lineCount = currRecord.getLineCount({sublistId: 'custpage_aia_list'});
            // var currPaymentDue = 0;
            // for (var i = 0; i < lineCount; i++) {
            //     currPaymentDue = currPaymentDue + currRecord.getSublistValue({sublistId: 'custpage_aia_list', fieldId: 'custpage_aia_bill_line_period_amt', line: i});
            // };
            // currRecord.setValue({fieldId: 'custpage_bb_aia_bill_curr_pay_due_amt', value: currPaymentDue});

            return true;
        }


        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {
            console.log('sublist changed triggered');
            var currRecord = currentRecord.get();
            //sum all the 'This Period Amount' lines and set on 'Current Payment Due' in header
            var lineCount = currRecord.getLineCount({sublistId: 'custpage_aia_list'});
            var currPaymentDue = 0;
            for (var i = 0; i < lineCount; i++) {
                currPaymentDue = currPaymentDue + currRecord.getSublistValue({sublistId: 'custpage_aia_list', fieldId: 'custpage_aia_bill_line_period_amt', line: i});
            };
            currRecord.setValue({fieldId: 'custpage_bb_aia_bill_curr_pay_due_amt', value: currPaymentDue});
            return true;
        }


        function print(){
            var objRecord = currentRecord.get();
            var recordID = objRecord.getValue('custpage_bb_aia_bill_id');
            var output = url.resolveScript({
                scriptId: 'customscript_bbss_sl_pmtappl_print',
                deploymentId: 'customdeploy_bbss_sl_pmtappl_print',
                returnExternalUrl: false,
                params: {
                    'custparam_recordID': recordID
                }
            });
            var newWindow = window.open(output, '_blank');
            newWindow.focus();
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            sublistChanged: sublistChanged,
            print: print
        };

    });
