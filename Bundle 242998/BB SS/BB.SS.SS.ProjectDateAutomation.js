/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @NScriptType ScheduledScript
 */

/**
 * @description     Nightly scheduled script advance project dates.
 * @author          J. Jalenak
 * @version         1.0
 */

/**
 * Copyright 2017-2018 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define (['N/format', 'N/record', 'N/runtime', 'N/search'],

    function(format, record, runtime, search) {

        /* doDataGeneration -
         *      Step 1 -
         *
         */
        function doDataGeneration() {
            var searchObj, searchResultCount;
            // PM - Step 1: Bulk Mature New Project to Contract - Site Audit Pending
            searchObj = search.load({
                id: "customsearch_bb_step_01_bulk_mature_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 1", "searchResultCount = " + searchResultCount);
            var resultSet = searchObj.run();
            resultSet.getRange({start:0, end:searchResultCount}).map(function(result){
                // .run().each has a limit of 4,000 results
                updateProjectActions(resultSet, result);
                return true;
            });
        }

        /* doSiteAuditPackage -
         *      Step 2 -
         *
         */
        function doSiteAuditPackage() {
            var searchObj, searchResultCount;
            // Step 2.1 - PM - Step 2.1: Bulk Mature New Project to Contract - Contract Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_02_1_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 2.1", "searchResultCount = " + searchResultCount);
            searchObj.run().each(function(result){
                // load the Project Action record
                var recordObj = record.load({
                    type: record.Type.JOB,
                    id: result.id,
                    isDynamic: true
                });
                // set the new field value
                recordObj.setValue({
                    fieldId: "custentity_bb_ho_contacted_site_audit_dt",
                    value: format.parse({value: result.getValue({name: "custentity_bb_hoa_package_end_date"}), type: format.Type.DATE})
                });
                // save the Project Action record
                recordObj.save();
                return true;
            });
            // Step 2.2 - PM - Step 2.2: Bulk Mature New Project to Contract - Contract Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_02_2_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 2.2", "searchResultCount = " + searchResultCount);
            var resultSet = searchObj.run();
            resultSet.getRange({start:0, end:searchResultCount}).map(function(result){
                // .run().each has a limit of 4,000 results
                updateProjectActions(resultSet, result);
                return true;
            });
            // Step 2.3 - PM - Step 2.3: Bulk Mature New Project to Contract - Contract Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_02_3_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 2.3", "searchResultCount = " + searchResultCount);
            var resultSet = searchObj.run();
            resultSet.getRange({start:0, end:searchResultCount}).map(function(result){
                // .run().each has a limit of 4,000 results
                updateProjectActions(resultSet, result);
                return true;
            });
        }

        /* doContractPackage -
         *      Step 3 -
         *
         */
        function doContractPackage() {
            var searchObj, searchResultCount;
            // Step 3.2 - PM - Step 3.2: Bulk Mature New Project to Contract - Design Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_03_2_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 3.2", "searchResultCount = " + searchResultCount);
            var resultSet = searchObj.run();
            resultSet.getRange({start:0, end:searchResultCount}).map(function(result){
                // .run().each has a limit of 4,000 results
                updateProjectActions(resultSet, result);
                return true;
            });
            // Step 3.2.5 - PM - Step 3.2.5: Bulk Mature New Project to Contract - Design Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_03_2_5_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 3.2.5", "searchResultCount = " + searchResultCount);
            var resultSet = searchObj.run();
            resultSet.getRange({start:0, end:searchResultCount}).map(function(result){
                // load the Project Action record
                var recordObj = record.load({
                    type: record.Type.JOB,
                    id: result.id,
                    isDynamic: true
                });
              log.debug("step 3.2.5", "project id = " + result.id + ", ho credit approval date = " + result.getValue(resultSet.columns[1]));
                // set the new field value
                recordObj.setValue({
                    fieldId: "custentity_bb_cac_submitted_date", 
                    value: format.parse({value: result.getValue(resultSet.columns[1]), type: format.Type.DATE})
                });
                // save the Project Action record
                recordObj.save();
                return true;
            });
            // Step 3.3 - PM - Step 3.2.5: Bulk Mature New Project to Contract - Design Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_03_3_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 3.3", "searchResultCount = " + searchResultCount);
            var resultSet = searchObj.run();
            resultSet.each(function(result){
                // .run().each has a limit of 4,000 results
                updateProjectActions(resultSet, result);
                return true;
            });
            // Step 3.4 - PM - Step 3.2.5: Bulk Mature New Project to Contract - Design Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_03_4_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 3.4", "searchResultCount = " + searchResultCount);
            searchObj.run().each(function(result){
              log.debug("step 3.4", "project = " + result.id);
                // load the Project Action record
                var recordObj = record.load({
                    type: record.Type.JOB,
                    id: result.id,
                    isDynamic: true
                });
                // set the new field value
                recordObj.setValue({
                    fieldId: "custentity_bb_cac_approval_date",
                    value: format.parse({value: result.getValue({name: "custentity_bb_contract_pack_end_date"}), type: format.Type.DATE})
                });
                // save the Project Action record
                recordObj.save({
                  ignoreMandatoryFields: true
                });
                return true;
            });
        }

        /* doDesignPackage -
         *      Step 4 -
         *
         */
        function doDesignPackage() {
            var searchObj, searchResultCount;
            // Step 4.2 - PM - Step 4.2: Bulk Mature New Project to Contract - Equipment Fulfillment Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_04_2_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 4.2", "searchResultCount = " + searchResultCount);
            var resultSet = searchObj.run();
            resultSet.getRange({start:0, end:searchResultCount}).map(function(result){
                // .run().each has a limit of 4,000 results
                updateProjectActions(resultSet, result);
                return true;
            });
            // Step 4.3 - PM - Step 4.3: Bulk Mature New Project to Contract - Equipment Fulfillment Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_04_3_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 4.3", "searchResultCount = " + searchResultCount);
            var resultSet = searchObj.run();
            resultSet.getRange({start:0, end:searchResultCount}).map(function(result){
                // .run().each has a limit of 4,000 results
                updateProjectActions(resultSet, result);
                return true;
            });
        }

        /* doEquipmentFulfillment -
         *      Step 5 -
         *
         */
        function doEquipmentFulfillment() {
            var searchObj, searchResultCount;
            // Step 5.1 - PM - Step 5.1: Bulk Mature New Project to Contract - Installation Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_05_1_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 5.1", "searchResultCount = " + searchResultCount);
            searchObj.run().each(function(result){
                // load the Project Action record
                var recordObj = record.load({
                    type: record.Type.JOB,
                    id: result.id,
                    isDynamic: true
                });
                // set the new field value
                recordObj.setValue({
                    fieldId: "custentity_bb_actual_equipment_ship_date",
                    value: format.parse({value: result.getValue({name: "formuladate"}), type: format.Type.DATE})
                });
                // save the Project Action record
                recordObj.save();
                return true;
            });
        }

        /* doInstallationCompletePackage -
         *      Step 6 -
         *
         */
        function doInstallationCompletePackage() {
            var searchObj, searchResultCount;
            // Step 6.2 - PM - Step 6.2: Bulk Mature New Project to Contract - Final Acceptance Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_06_2_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 6.2", "searchResultCount = " + searchResultCount);
            var resultSet = searchObj.run();
            resultSet.getRange({start:0, end:searchResultCount}).map(function(result){
                // .run().each has a limit of 4,000 results
                updateProjectActions(resultSet, result);
                return true;
            });
            // Step 6.2.5 - PM - Step 6.2: Bulk Mature New Project to Contract - Final Acceptance Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_06_2_5_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 6.2.5", "searchResultCount = " + searchResultCount);
            searchObj.run().each(function(result){
                // load the Project Action record
                var recordObj = record.load({
                    type: record.Type.JOB,
                    id: result.id,
                    isDynamic: true
                });
                // set the new field value
                recordObj.setValue({
                    fieldId: "custentity_bb_install_scheduled_date",
                    value: format.parse({value: result.getValue({name: "formuladate"}), type: format.Type.DATE})
                });
                // save the Project Action record
                recordObj.save();
                return true;
            });
            // Step 6.2.6 - PM - Step 6.2: Bulk Mature New Project to Contract - Final Acceptance Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_06_2_6_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 6.2.6", "searchResultCount = " + searchResultCount);
            searchObj.run().each(function(result){
                // load the Project Action record
                var recordObj = record.load({
                    type: record.Type.JOB,
                    id: result.id,
                    isDynamic: true
                });
                // set the new field value
                recordObj.setValue({
                    fieldId: "custentity_bb_install_comp_pack_date",
                    value: format.parse({value: result.getValue({name: "formuladate"}), type: format.Type.DATE})
                });
                // save the Project Action record
                recordObj.save();
                return true;
            });
            // Step 6.3 - PM - Step 6.2: Bulk Mature New Project to Contract - Final Acceptance Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_06_3_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 6.3", "searchResultCount = " + searchResultCount);
            var resultSet = searchObj.run();
            resultSet.getRange({start:0, end:searchResultCount}).map(function(result){
                // .run().each has a limit of 4,000 results
                updateProjectActions(resultSet, result);
                return true;
            });
        }

        /* doFinalAcceptancePackage -
         *      Step 7 -
         *
         */
        function doFinalAcceptancePackage() {
            var searchObj, searchResultCount;
            // Step 7.1 - PM - Step 7.1: Bulk Mature New Project to Contract - Inspection Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_07_1_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 7.1", "searchResultCount = " + searchResultCount);
            searchObj.run().each(function(result){
                // load the Project Action record
                var recordObj = record.load({
                    type: record.Type.JOB,
                    id: result.id,
                    isDynamic: true
                });
                // set the new field value
                recordObj.setValue({
                    fieldId: "custentity_bb_inspection_approval_date",
                    value: format.parse({value: result.getValue({name: "formuladate"}), type: format.Type.DATE})
                });
                // save the Project Action record
                recordObj.save();
                return true;
            });
            // Step 7.2 - PM - Step 7.1: Bulk Mature New Project to Contract - Inspection Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_07_2_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 7.2", "searchResultCount = " + searchResultCount);
            var resultSet = searchObj.run();
            resultSet.getRange({start:0, end:searchResultCount}).map(function(result){
                // .run().each has a limit of 4,000 results
                updateProjectActions(resultSet, result);
                return true;
            });
            // Step 7.2.5 - PM - Step 7.1: Bulk Mature New Project to Contract - Inspection Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_07_2_5_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 7.2.5", "searchResultCount = " + searchResultCount);
            searchObj.run().each(function(result){
                // load the Project Action record
                var recordObj = record.load({
                    type: record.Type.JOB,
                    id: result.id,
                    isDynamic: true
                });
                // set the new field value
                recordObj.setValue({
                    fieldId: "custentity_bb_fa_submitted_to_fund_date",
                    value: format.parse({value: result.getValue({name: "formuladate"}), type: format.Type.DATE})
                });
                // save the Project Action record
                recordObj.save();
                return true;
            });
            // Step 7.2.6 - PM - Step 7.1: Bulk Mature New Project to Contract - Inspection Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_07_2_6_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 7.2.6", "searchResultCount = " + searchResultCount);
            searchObj.run().each(function(result){
                // load the Project Action record
                var recordObj = record.load({
                    type: record.Type.JOB,
                    type: record.Type.JOB,
                    id: result.id,
                    isDynamic: true
                });
                // set the new field value
                recordObj.setValue({
                    fieldId: "custentity_bb_final_permit_approved_date",
                    value: format.parse({value: result.getValue({name: "formuladate"}), type: format.Type.DATE})
                });
                // save the Project Action record
                recordObj.save();
                return true;
            });
            // Step 7.3 - PM - Step 7.1: Bulk Mature New Project to Contract - Inspection Package Pending
            searchObj = search.load({
                id: "customsearch_bb_step_07_3_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 7.3", "searchResultCount = " + searchResultCount);
            var resultSet = searchObj.run();
            resultSet.getRange({start:0, end:searchResultCount}).map(function(result){
                // .run().each has a limit of 4,000 results
                updateProjectActions(resultSet, result);
                return true;
            });
        }

        /* doInspectionPackage -
         *      Step 8 -
         *
         */
        function doInspectionPackage() {
            var searchObj, searchResultCount;
            // Step 8.1 - PM - Step 8.1: Bulk Mature New Project to Contract - Inspection Package Complete Pending
            searchObj = search.load({
                id: "customsearch_bb_step_08_1_bulk_mat_new"
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug("step 8.1", "searchResultCount = " + searchResultCount);
            searchObj.run().each(function(result){
                // load the Project Action record
                var recordObj = record.load({
                    type: record.Type.JOB,
                    id: result.id,
                    isDynamic: true
                });
                // set the new field value
                recordObj.setValue({
                    fieldId: "custentity_bb_pto_date",
                    value: format.parse({value: result.getValue({name: "formuladate"}), type: format.Type.DATE})
                });
                // save the Project Action record
                recordObj.save();
                return true;
            });
        }

        /* updateProjectActions -
         *      Emulates CSV update step for Project Package Task updates
         *
         */
        function updateProjectActions(resultSet, result) {
            log.debug("updateProjectAction","id = " + result.id +
                ", document status = " + result.getValue(resultSet.columns[8]) +
                ", document status date = " + result.getValue(resultSet.columns[9]) +
                ", package = " + result.getValue({name: "custrecord_bb_package"}) +
                ", package step number = " + result.getValue({name: "custrecord_bb_package_step_number"}) +
                ", project = " + result.getValue({name: "custrecord_bb_project"}) +
                ", project document = " + result.getValue(resultSet.columns[6])
            );
            // load the Project Action record
            var recordObj = record.load({
                type: "customrecord_bb_project_package_task",
                id: result.id,
                isDynamic: true
            });
            // set the new field values
            var documentStatus = translateDocumentStatus(result.getValue(resultSet.columns[8]));
            recordObj.setValue({fieldId: "custrecord_bb_document_status", value: documentStatus});
            recordObj.setValue({fieldId: "custrecord_bb_document_status_date", value: format.parse({value: result.getValue(resultSet.columns[9]), type: format.Type.DATE})});
            recordObj.setValue({fieldId: "custrecord_bb_package", value: result.getValue({name: "custrecord_bb_package"})});
            recordObj.setValue({fieldId: "custrecord_bb_package_step_number", value: result.getValue({name: "custrecord_bb_package_step_number"})});
            recordObj.setValue({fieldId: "custrecord_bb_proj_doc_required_optional", value: 1});
            recordObj.setValue({fieldId: "custrecord_bb_project", value: result.getValue({name: "internalid", join: "custrecord_bb_project"})});

            if (documentStatus == 11 || documentStatus == 12) {
                recordObj.setValue({fieldId: "custrecord_bb_project_document", value: result.getValue(resultSet.columns[6])});
            }
            // save the Project Action record
            recordObj.save();
        }

        function translateDocumentStatus(status) {
            switch(status) {
                case 'Not Started':                     return 1;
                case 'Requested':                       return 2;
                case 'Pending PM Review':               return 3;
                case 'Submitted to Engineering':        return 4;
                case 'Submitted to Fund':               return 5;
                case 'Submitted to HO':                 return 6;
                case 'Submitted to Installer':          return 7;
                case 'Submitted to Sales Partner':      return 8;
                case 'Submitted to Utility':            return 9;
                case 'Approved by Internal Reviewer':   return 10;
                case 'Approved by Fund':                return 11;
                case 'Approved by Utility':             return 12;
                case 'Rejected by Internal Reviewer':   return 13;
                case 'Rejected by Fund':                return 14;
                case 'Rejected by Installer':           return 15;
                case 'Rejected by Sales Partner':       return 16;
                case 'Rejected by Utility':             return 17;
                default:
                    return -1;
            }
        }
        return {
            /* execute -
             *      Definition of the scheduled script trigger point
             */
            execute:
                function (scriptContext) {
                    //if (scriptContext.type != scriptContext.InvocationType.ON_DEMAND)
                        //return;

                    try {
                        doDataGeneration();
                        doSiteAuditPackage();
                        doContractPackage();
                        doDesignPackage();
                        //doEquipmentFulfillment();
                        //doInstallationCompletePackage();
                        //doFinalAcceptancePackage();
                        //doInspectionPackage();
                    } catch (ex) {
                        log.error("ProjectDateAutomation", "Exception caught, is " + ex);
                    }
                }
        };
    }
);