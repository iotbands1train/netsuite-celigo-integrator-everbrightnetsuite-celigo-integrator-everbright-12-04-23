/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([],
    
    () => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
                try {
                        if (scriptContext.type === scriptContext.UserEventType.VIEW) {
                                var form = scriptContext.form;
                                form.addButton({
                                        id: 'custpage_refesh_snap',
                                        label: 'Refresh Snapshot',
                                        functionName: 'refreshSnapShot('+scriptContext.newRecord.getValue('custrecord_bbss_comm_snapshot_pay_period')+')'
                                });
                                form.clientScriptModulePath = './BB.CS.CommSnapshot2.0';
                        }
                } catch (e) {
                        log.error('ERROR', e);
                }
        }

        return {beforeLoad}

    });
