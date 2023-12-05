/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope Public
 * @overview - Milestone transaction processing script
 */

 /**
 * Copyright 2017-2020 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */
 
define(['N/record', 'N/search', 'N/runtime','./BB SS/SS Lib/BB.SS.Invoice.Service', './BB SS/SS Lib/BB.SS.VendorBill.Service'],

function(record, search, runtime, invoiceService, billService) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        try {
            var tranactionArr = runtime.getCurrentScript().getParameter({
                name: 'custscript_bb_ss_transaction_array'
            });
            log.debug('tranaction Array', tranactionArr);
            var array = JSON.parse(tranactionArr);

            if (array.length > 0) {
                var project = record.load({
                    type: record.Type.JOB,
                    id: array[0].project,
                    isDynamic: true
                });

                var config = record.load({
                    type: 'customrecord_bb_solar_success_configurtn',
                    id: array[0].configId
                });
                for (var i = 0; i < array.length; i++) {

                    var milestoneName = array[i].milestoneName.toUpperCase();
                    var milestoneDate = new Date(array[i].milestoneDate)
                    if (array[i].type == 'financier') {

                        invoiceService.createInvoiceFromProjectAndMilestoneName(project, milestoneName, config, milestoneDate);

                    } else if (array[i].type == 'originator') {
                        var originatorId = project.getValue({fieldId: 'custentity_bb_originator_vendor'});

                        billService.createVendorBillFromProjectAndMilestoneName(project, milestoneName, config, milestoneDate, originatorId, null);

                    } else if (array[i].type == 'installer') {
                        var installerId = project.getValue({fieldId: 'custentity_bb_installer_partner_vendor'});

                        billService.createVendorBillFromProjectAndMilestoneName(project, milestoneName, config, milestoneDate, null, installerId);

                    } else {
                        // do nothing
                    }
                }
            }



        } catch (e) {
            log.error('', e);
        }
    }



    return {
        execute: execute
    };
    
});
