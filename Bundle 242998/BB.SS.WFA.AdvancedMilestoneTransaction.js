/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 * @NModuleScope Public
 * @Overview - Invoice Actual WFA script.
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

define(['N/record', 'N/search', 'N/runtime', 'N/config', './BB SS/SS Lib/BB.MD.AdvPaymentModules'],

    function(record, search, runtime, nsConfig, advModule) {

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
                var advMilestone = scriptContext.newRecord;
                var array = advModule.getAdvPaymentScheduleTransactionToProcessFromAdvMilestoneRecord(advMilestone);
                if (array.length > 0) {
                    advModule.createAdvancedMilestoneTransaction(array[0], advMilestone);
                }
            } catch (e) {
                log.error('error generating transaction from advanced milestone record', e);
            }
            return advMilestone;
        }






        return {
            onAction : onAction
        };

    });