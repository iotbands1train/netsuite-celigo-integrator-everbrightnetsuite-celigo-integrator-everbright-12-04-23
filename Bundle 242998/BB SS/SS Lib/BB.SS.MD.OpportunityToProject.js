/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Matt Lehman
 * @fileOverview Generate Project from Lead, Prospect, or Customer Record - Create Project Action Records From Template
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

define(['N/record', 'N/search', 'N/task', './BB.SS.MD.CreateAddressRecord', './BB_SS_MD_SolarConfig', './BB.SS.ScheduledScript.BatchProcessing',
        './BB.SS.MD.Entity.Document.Template.Lib', './BB.SS.DocumentStatus.Service', './BB.SS.GetLocation'],

    function (record, search, task, addressRecord, solarConfig, batchProcessor, docLib, documentStatusLib, getLocation) {

        const PROJECT_ACTION = {
            PROJECT: 'custrecord_bb_project',
            PACKAGE: 'custrecord_bb_package',
            PACKAGE_ACTION: 'custrecord_bb_project_package_action',
            PACKAGE_STEP: 'custrecord_bb_package_step_number',
            DOCUMENT: 'custrecord_bb_project_document',
            DOCUMENT_IFRAME: 'custrecord_bb_proj_dm_iframe_html',
            DOCUMENT_SAVED_DATE: 'custrecord_bb_doc_saved_date',
            REVISION_NUMBER: 'custrecord_bb_revision_number',
            DOCUMENT_STATUS: 'custrecord_bb_document_status',
            DOCUMENT_STATUS_DATE: 'custrecord_bb_document_status_date',
            REJECTION_COMMENTS: 'custrecord_bb_rejection_comments',
            REJECTION_COMMENT_HISTORY: 'custrecord_bb_doc_reject_comm_history',
            TASK_TYPE: 'custrecord_bb_project_doc_action_type',
            REQD: 'custrecord_bb_proj_doc_required_optional',
            UNIQUE_ID: 'custrecord_bb_proj_task_uuid_txt',
            DOCUMENT_MANAGER_FOLDER: 'custrecord_bb_proj_task_dm_folder_text',
            TEMPLATE_DOCUMENT_RECORD: 'custrecord_bb_proj_act_temp_doc_rec',
            PACKAGE_ACTION_TEMPLATE_DOCUMENT: 'custrecord_bb_pkg_action_temp_doc_rec',
            PACKAGE_ACTION_TEMPLATE_RECORD_JOIN_NAME: 'CUSTRECORD_BB_PROJECT_PACKAGE_ACTION',
            FROM_ACTION_RECORD: 'custrecord_bb_proj_act_from_action_rec',
            PRECEEDING_PACKAGE_ACTION_ID: 'custrecord_bb_projact_preced_pack_action',
            ASSIGNED_TO: 'custrecord_bb_proj_act_assigned_to_emp',
            ASSIGNED_TO_ROLE: 'custrecord_bb_proj_act_assigned_role',
            DOCUMENT_STATUS_TYPE: 'custrecord_bb_action_status_type',
            PRECEEDING_PACKAGE_ACTION_FROM_PACKAGE_ACTION: 'custrecord_bb_proj_preceding_action_list'
        };

        // const configcheck = search.lookupFields({
        //     type: "customrecord_bb_solar_success_configurtn",
        //     id: '1',
        //     columns: ['custrecord_bb_ss_has_subsidiaries', 'custrecord_bb_exclud_addy_record_on_proj']
        // });
        // const usesubs = configcheck.custrecord_bb_ss_has_subsidiaries;
        // const useAddressRecord = configcheck.custrecord_bb_exclud_addy_record_on_proj;


        /*
         * function transformEntityToProject
         * @param {entityId} - Internal Id of customer, prospect or lead record
         * @returns Project Internal ID after successful project creation
        */
        function transformEntityToProject(entityId, opportunityObj) {
            const configcheck = search.lookupFields({
                type: "customrecord_bb_solar_success_configurtn",
                id: '1',
                columns: ['custrecord_bb_ss_has_subsidiaries', 'custrecord_bb_exclud_addy_record_on_proj']
            });
            const usesubs = configcheck.custrecord_bb_ss_has_subsidiaries;
            const useAddressRecord = configcheck.custrecord_bb_exclud_addy_record_on_proj;
            if (entityId) {
                var entityObj = getEntityRecordData(entityId, usesubs);
                var projectId = createProjectRecord(entityObj, opportunityObj, usesubs, useAddressRecord);
                return projectId;
            }
        }


        /*
         * function createProjectRecord
         * @param {entityObj} Object - search result object with entity field ids as the object key
         * @returns project internalid
        */
        function createProjectRecord(entityObj, opportunityObj, usesubs, useAddressRecord) {
            var noSave = false;
            var noProjectActions = false;
            if (entityObj) {
                try {
                    var project = record.create({
                        type: record.Type.JOB,
                        isDynamic: true
                    });
                    var paramObj = setProjectRelatedFields(project, entityObj, opportunityObj, usesubs, useAddressRecord);
                    log.debug('param object', paramObj);
                    if (!noSave) {
                        var id = project.save({
                            ignoreMandatoryFields: true
                        });
                        log.debug('id', id);
                        if (!noProjectActions) {
                            var taskParameters = {};
                            taskParameters['custscript_project_id'] = id;
                            taskParameters['custscript_project_template_id'] = paramObj.templateId;
                            taskParameters['custscript_entity_id'] = paramObj.entityId;
                            taskParameters['custscript_file_id'] = paramObj.proposalFileId;
                            taskParameters['custscript_utility_bill_file_id'] = paramObj.utilityFileId;

                            var scriptId = 'customscript_bb_ss_project_action_create';
                            var deployment = 'customdeploy_bb_ss_proj_action_create';
                            var taskType = task.TaskType.SCHEDULED_SCRIPT;

                            batchProcessor.addToQueue(scriptId, deployment, taskParameters, taskType);
                        }
                        return id;
                    } else {
                        if (!noProjectActions) {
                            var taskParameters = {};
                            taskParameters['custscript_project_id'] = id;
                            taskParameters['custscript_project_template_id'] = paramObj.templateId;
                            taskParameters['custscript_entity_id'] = paramObj.entityId;
                            taskParameters['custscript_file_id'] = paramObj.proposalFileId;
                            taskParameters['custscript_utility_bill_file_id'] = paramObj.utilityFileId;

                            var scriptId = 'customscript_bb_ss_project_action_create';
                            var deployment = 'customdeploy_bb_ss_proj_action_create';
                            var taskType = task.TaskType.SCHEDULED_SCRIPT;

                            batchProcessor.addToQueue(scriptId, deployment, taskParameters, taskType);
                        }
                        return project;
                    }
                } catch (e) {
                    log.error('error creating project from entity record', e);
                }
            }
        }



        /*
         * function setProjectRelatedFields
         * @param {entityObj} Object - search result object with entity field ids as the object key
         * @param {project} NetSuite Record Object
         * @returns object - values needed for project action record submission
        */

        function setProjectRelatedFields(project, entityObj, opportunityObj, usesubs, useAddressRecord) {
            log.debug('set project fields', project);
            log.debug('125 use subs', usesubs);
            // set primary fields
            // project.setValue({ fieldId: 'custentity_bb_fin_prelim_purch_price_amt', value: opportunityObj.preliminaryPurchasePrice });
            // project.setValue({ fieldId: 'custentity_bb_financing_type', value: entityObj.custentity_bb_financing_type });
            // project.setValue({ fieldId: 'custentity_bb_system_size_decimal', value: entityObj.custentity_bb_system_size_decimal });

            if (usesubs) project.setValue({ fieldId: 'subsidiary', value: opportunityObj.subsidiary });

            // financing fields
            // if (entityObj.custentity_bb_financier_customer) project.setValue({ fieldId: 'custentity_bb_financier_customer', value: entityObj.custentity_bb_financier_customer });
            // if (entityObj.custentity_bb_financing_type == 1) project.setValue({ fieldId: 'custentity_bb_financier_customer', value: entityObj.internalid }); // set homeowner as financier when financing type = Cash
            // project.setValue({ fieldId: 'custentity_bb_fin_customer_id_text', value: entityObj.custentity_bb_fin_customer_id_text });

            // project.setValue({ fieldId: 'custentity_bb_homeowner_customer', value: entityObj.internalid });
            // set project expense type
            var configExpenseType = ['custrecord_bb_ss_project_expense_type'];
            var expenseTypeObj = solarConfig.getConfigurations(configExpenseType);
            project.setValue({ fieldId: 'projectexpensetype', value: expenseTypeObj.custrecord_bb_ss_project_expense_type.value });
            // project.setValue({ fieldId: 'jobtype', value: entityObj.jobtype });

            // create sub customer record
            var parent;
            if (!useAddressRecord) {
                project.setValue({ fieldId: 'custentity_bb_homeowner_customer', value: opportunityObj.entity }); //customer id
                parent = addressRecord.createAddressCustomer(opportunityObj);
            } else {
                parent = entityObj.internalid; // homeowner customer as parent
                project.setValue({ fieldId: 'custentity_bb_homeowner_customer', value: opportunityObj.entity });
                // project.setValue({fieldId: 'custentity_bb_financier_customer', value: entityObj.internalid});
            }
            project.setValue({ fieldId: 'parent', value: parent });
            // general submission fields
            project.setValue({ fieldId: 'custentity_bbss_configuration', value: entityObj.custentity_bbss_configuration });
            // if (entityObj.custentity_bb_sales_rep_employee) project.setValue({ fieldId: 'custentity_bb_sales_rep_employee', value: entityObj.custentity_bb_sales_rep_employee });
            // if (entityObj.custentity_bb_forecast_type) project.setValue({ fieldId: 'custentity_bb_forecast_type', value: entityObj.custentity_bb_forecast_type });
            // if (entityObj.custentity_bb_market_segment) project.setValue({ fieldId: 'custentity_bb_market_segment', value: entityObj.custentity_bb_market_segment });
            // if (entityObj.custentity_bb_started_from_proj_template) project.setValue({ fieldId: 'custentity_bb_started_from_proj_template', value: entityObj.custentity_bb_started_from_proj_template });

            // if (usesubs) {
            //     var projectLocation = getLocation.getLocation(entityObj.subsidiary, entityObj.jobtype);
            //     log.debug('project location', projectLocation);
            //     if (projectLocation) {
            //         project.setValue({ fieldId: 'custentity_bb_project_location', value: projectLocation });
            //     }
            // } else {
            //     var projectLocation = getLocation.getLocation(null, entityObj.jobtype);
            //     log.debug('project location', projectLocation);
            //     if (projectLocation) {
            //         project.setValue({ fieldId: 'custentity_bb_project_location', value: projectLocation });
            //     }
            // }

            // project.setValue({ fieldId: 'custentity_bb_roof_type', value: entityObj.custentity_bb_roof_type });

            // address fields
            // if (entityObj.custentity_bb_home_owner_primary_email) project.setValue({ fieldId: 'custentity_bb_home_owner_primary_email', value: entityObj.custentity_bb_home_owner_primary_email });
            // if (entityObj.custentity_bb_home_owner_phone) project.setValue({ fieldId: 'custentity_bb_home_owner_phone', value: entityObj.custentity_bb_home_owner_phone });
            // if (entityObj.custentity_bb_install_address_1_text) 			project.setValue({ fieldId: 'custentity_bb_install_address_1_text', value: entityObj.custentity_bb_install_address_1_text });
            // if (entityObj.custentity_bb_install_city_text) 			project.setValue({ fieldId: 'custentity_bb_install_city_text', value: entityObj.custentity_bb_install_city_text });
            // project.setValue({ fieldId: 'custentity_bb_install_state', value: entityObj.custentity_bb_install_state });
            // if (entityObj.custentity_bb_install_zip_code_text) 			project.setValue({ fieldId: 'custentity_bb_install_zip_code_text', value: entityObj.custentity_bb_install_zip_code_text });

            // utility fields
            // if (entityObj.custentity_bb_utility_company) project.setValue({ fieldId: 'custentity_bb_utility_company', value: entityObj.custentity_bb_utility_company });
            // project.setValue({ fieldId: 'custentity_bb_utility_rate_schedule', value: entityObj.custentity_bb_utility_rate_schedule });
            // project.setValue({ fieldId: 'custentity_bb_avg_utilitybill_month_amt', value: entityObj.custentity_bb_avg_utilitybill_month_amt });
            // // lat and long fields
            // project.setValue({ fieldId: 'custentity_bb_entity_longitude_text', value: entityObj.custentity_bb_entity_longitude_text });
            // project.setValue({ fieldId: 'custentity_bb_entity_latitude_text', value: entityObj.custentity_bb_entity_latitude_text }); //custentity_bbss_configuration

            //addition customer to project mapping feature
            mapAdditionalOpportunitytoProjectFields(opportunityObj, project);

            return {
                templateId: project.getValue({fieldId: 'custentity_bb_started_from_proj_template'}),
                entityId: project.getValue({fieldId: 'custentity_bb_homeowner_customer'}),
                proposalFileId: null,
                utilityFileId: null
            };

        };


        function mapAdditionalOpportunitytoProjectFields(opportunityObj, project) {

            var customrecord_bb_cust_to_proj_mappingSearchObj = search.create({
                //update to new record type
                type: "customrecord_bb_opp_to_proj_map",
                filters:
                    [
                        ["isinactive","is","F"]
                    ],
                columns:
                    [
                        //change customer to opportunity, update field name for project
                        search.createColumn({name: "custrecord_bb_opportunity_field_id", label: "Opportunity Field ID"}),
                        search.createColumn({name: "custrecord_bb_project_field_id", label: "Project Field ID"})
                    ]
            });
            var searchResultCount = customrecord_bb_cust_to_proj_mappingSearchObj.runPaged().count;
            log.debug("customrecord_bb_cust_to_proj_mappingSearchObj result count",searchResultCount);
            if (searchResultCount > 0) {
                //rename this var
                var opportunity = record.load({
                    type: record.Type.OPPORTUNITY,
                    id: opportunityObj.internalId,
                });
            }
            customrecord_bb_cust_to_proj_mappingSearchObj.run().each(function(result){
                //update the getValue
                var opportunityFieldId = result.getValue({name: 'custrecord_bb_opportunity_field_id'});
                var projectFieldId = result.getValue({name: 'custrecord_bb_project_field_id'});
                if (opportunityFieldId) {
                    var opportunityValue = opportunity.getValue({fieldId: opportunityFieldId});
                    if (opportunityValue && projectFieldId) {
                        project.setValue({fieldId: projectFieldId, value: opportunityValue});
                    }
                }
                return true;
            });
        };


        /*
         * function getEntityRecordData
         * @param {entityId} Internal id of customer, prospect, or lead
         * @returns Object - search result object with entity field ids as the object key
        */
        function getEntityRecordData(entityId, usesubs) {
            var entityObj = {};
            var columnsForSearch=[
                search.createColumn({ name: "internalid", label: "Internal ID" }),
                search.createColumn({ name: "entityid", label: "ID" }),
                search.createColumn({ name: "category", label: "Category" }),
                search.createColumn({ name: "companyname", label: "Company Name" }),
                search.createColumn({ name: "custentity_bb_customer_signture_date", label: "Customer Signature Date" }),
                search.createColumn({ name: "datecreated", label: "Date Created" }),
                search.createColumn({ name: "custentity_bb_epc_role", label: "EPC Role" }),
                search.createColumn({ name: "custentity_bb_financier_customer", label: "Financier" }),
                search.createColumn({ name: "custentity_bb_fin_customer_id_text", label: "Financier Customer ID" }),
                search.createColumn({ name: "custentity_bb_fincancer_email", label: "Financier Email" }),
                search.createColumn({ name: "custentity_bb_financing_type", label: "Financing Type" }),
                search.createColumn({ name: "firstname", label: "First Name" }),
                search.createColumn({ name: "custentity_bb_forecast_type", label: "Forecast Type" }),
                search.createColumn({ name: "custentity_bb_forecasted_close_date", label: "Forecasted Close Date" }),
                search.createColumn({ name: "custentity_bb_forecasted_install_date", label: "Forecasted Install Date" }),
                search.createColumn({ name: "homephone", label: "Home Phone" }),
                search.createColumn({ name: "custentity_bb_proj_home_type", label: "Home Type" }),
                search.createColumn({ name: "custentity_bb_homeowner_customer", label: "Homeowner Customer Record" }),
                search.createColumn({ name: "custentity_bb_home_owner_primary_email", label: "Homeowner Email (Primary)" }),
                search.createColumn({ name: "custentity_bb_home_owner_alt_email", label: "Homeowner Email (Alternative)" }),
                search.createColumn({ name: "custentity_bb_homeowner_finance_method", label: "Homeowner Financing Method" }),
                search.createColumn({ name: "custentity_bb_home_owner_name_text", label: "Homeowner Name (Primary)" }),
                search.createColumn({ name: "custentity_bb_home_owner_phone", label: "Homeowner Phone (Primary)" }),
                search.createColumn({ name: "custentity_bb_homeowner_association", label: "Homeowners Association" }),
                search.createColumn({ name: "custentity_bb_proj_install_type", label: "Install Type" }),
                search.createColumn({ name: "custentity_bb_install_address_1_text", label: "Installation Address 1" }),
                search.createColumn({ name: "custentity_bb_install_address_2_text", label: "Installation Address 2" }),
                search.createColumn({ name: "custentity_bb_install_city_text", label: "Installation City" }),
                search.createColumn({ name: "custentity_bb_install_state", label: "Installation State" }),
                search.createColumn({ name: "custentity_bb_install_scheduled_date", label: "Installation Scheduled" }),
                search.createColumn({ name: "custentity_bb_install_zip_code_text", label: "Installation Zip Code" }),
                search.createColumn({ name: "custentity_bb_installer_partner_vendor", label: "Installer Partner" }),
                search.createColumn({ name: "custentity_bb_install_part_pay_schedule", label: "Installer Sub-contractor Pay Schedule" }),
                search.createColumn({ name: "isperson", label: "Is Individual" }),
                search.createColumn({ name: "custentity_bb_is_address_rec_boolean", label: "Is Address Record" }),
                search.createColumn({ name: "custentity_bb_jan_kwh_integer", label: "Jan (kWh)" }),
                search.createColumn({ name: "custentity_bb_feb_kwh_integer", label: "Feb (kWh)" }),
                search.createColumn({ name: "custentity_bb_mar_kwh_integer", label: "Mar (kWh)" }),
                search.createColumn({ name: "custentity_bb_apr_kwh_integer", label: "Apr (kWh)" }),
                search.createColumn({ name: "custentity_bb_jun_kwh_integer", label: "Jun (kWh)" }),
                search.createColumn({ name: "custentity_bb_jul_kwh_integer", label: "Jul (kWh)" }),
                search.createColumn({ name: "custentity_bb_aug_kwh_integer", label: "Aug (kWh)" }),
                search.createColumn({ name: "custentity_bb_sep_kwh_integer", label: "Sep (kWh)" }),
                search.createColumn({ name: "custentity_bb_oct_kwh_integer", label: "Oct (kWh)" }),
                search.createColumn({ name: "custentity_bb_nov_kwh_integer", label: "Nov (kWh)" }),
                search.createColumn({ name: "custentity_bb_dec_kwh_integer", label: "Dec (kWh)" }),
                search.createColumn({ name: "lastname", label: "Last Name" }),
                search.createColumn({ name: "custentity_bb_entity_latitude_text", label: "Latitude" }),
                search.createColumn({ name: "leadsource", label: "Lead Source" }),
                search.createColumn({ name: "custentity_bb_entity_longitude_text", label: "Longitude" }),
                search.createColumn({ name: "custentity_bb_market_segment", label: "Market Segment" }),
                search.createColumn({ name: "custentity_bb_marketing_campaign", label: "Marketing Campaign" }),
                search.createColumn({ name: "custentity_bb_may_kwh_integer", label: "May (kWh)" }),
                search.createColumn({ name: "middlename", label: "Middle Name" }),
                search.createColumn({ name: "phone", label: "Phone" }),
                search.createColumn({ name: "custentity_bb_fin_prelim_purch_price_amt", label: "Preliminary Purchase Price" }),
                //    search.createColumn({name: "subsidiary", label: "Primary Subsidiary"}),
                search.createColumn({ name: "custentity_bb_started_from_proj_template", label: "Project Template" }),
                search.createColumn({ name: "jobtype", join: "custentity_bb_started_from_proj_template", label: "Project Type" }),
                search.createColumn({ name: "custentity_bb_entity_property_link", label: "Property Link" }),
                search.createColumn({ name: "custrecord_bb_file_system", join: 'custentity_bb_proposal_doc_proposals', label: "Proposal Document" }),
                search.createColumn({ name: "custentity_bb_proposal_generated_date", label: "Proposal Generated" }),
                search.createColumn({ name: "custentity_bb_contract_signed_date", label: "Proposal Signed" }),
                search.createColumn({ name: "custentity_bb_roof_type", label: "Roof Type" }),
                search.createColumn({ name: "custentity_bb_sales_rep_employee", label: "Sales Rep" }),
                search.createColumn({ name: "custentity_bb_system_size_decimal", label: "System Size (kW)" }),
                search.createColumn({ name: "custentity_bb_util_bill_doc_bb_file_sys", label: "Utility Bill Document" }),
                search.createColumn({ name: "custentity_bb_utility_company", label: "Utility Company" }),
                search.createColumn({ name: "custentity_bb_avg_utilitybill_month_amt", label: "Utility Monthly Avg" }),
                search.createColumn({ name: "custentity_bb_warehouse_location", label: "Warehouse Location" }),
                search.createColumn({ name: "custentity_bbss_configuration", label: "BBSS Config Reference" })
            ];

            //log.debug('requiredFieldList',requiredFieldList);
            // for(var reqFldlist=0;reqFldlist<requiredFieldList.length;reqFldlist++){
            //     columnsForSearch.push(requiredFieldList[reqFldlist].fieldId);
            //     log.debug('requiredFieldList[reqFldlist].fieldId',requiredFieldList[reqFldlist].fieldId);
            // }
            if (entityId) {
                var customerSearchObj = search.create({
                    type: "customer",
                    filters:
                        [
                            ["internalid", "anyof", entityId]
                        ],
                    columns:columnsForSearch

                });

                if (usesubs){
                    var searchColumns = customerSearchObj.columns;
                    searchColumns.push(search.createColumn({ name: "subsidiary", label: "Subsidiary" }));
                    customerSearchObj.columns = searchColumns;
                    log.debug('criteria after', searchColumns);
                }
                var searchResultCount = customerSearchObj.runPaged().count;
                log.debug("Entity Record search result count", searchResultCount);
                var start = 0;
                var end = 1;
                var resultSet = customerSearchObj.run();
                log.debug('resultSet',resultSet);
                var results = resultSet.getRange({
                    start: start,
                    end: end
                });
                for (var i = 0; i < results.length; i++) {
                    for (var c = 0; c < resultSet.columns.length; c++) {
                        if (!resultSet.columns[c].join) {
                            entityObj[resultSet.columns[c].name] = results[i].getValue({ name: resultSet.columns[c].name });
                        } else {
                            entityObj[resultSet.columns[c].name] = results[i].getValue({ name: resultSet.columns[c].name, join: resultSet.columns[c].join });
                        }
                    }
                }
                log.debug('entityObj', entityObj);
                return entityObj;
            }
            return null;
        };


        /*
         * function getTemplateRelatedProjectActions
         * @param {projectTemplateId} Internal id of project template record
         * @returns array - an array of project action records from the project template record
        */
        function getTemplateRelatedProjectActions(projectTemplateId) {
            var templateProjectActionArr = [];
            if (projectTemplateId) {
                var templateProjectActionSearch = search.create({
                    type: "customrecord_bb_project_action",
                    filters:
                        [
                            ["custrecord_bb_project", "anyof", projectTemplateId]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalid" }),
                            search.createColumn({ name: PROJECT_ACTION.PROJECT }),
                            search.createColumn({ name: PROJECT_ACTION.PACKAGE }),
                            search.createColumn({ name: PROJECT_ACTION.PACKAGE_ACTION }),
                            search.createColumn({ name: PROJECT_ACTION.PACKAGE_STEP }),
                            search.createColumn({ name: PROJECT_ACTION.DOCUMENT }),
                            search.createColumn({ name: PROJECT_ACTION.DOCUMENT_SAVED_DATE }),
                            search.createColumn({ name: PROJECT_ACTION.REVISION_NUMBER }),
                            search.createColumn({ name: PROJECT_ACTION.DOCUMENT_STATUS }),
                            search.createColumn({ name: PROJECT_ACTION.DOCUMENT_STATUS_DATE }),
                            search.createColumn({ name: PROJECT_ACTION.REJECTION_COMMENTS }),
                            search.createColumn({ name: PROJECT_ACTION.REJECTION_COMMENT_HISTORY }),
                            search.createColumn({ name: PROJECT_ACTION.TASK_TYPE }),
                            search.createColumn({ name: PROJECT_ACTION.REQD }),
                            search.createColumn({ name: PROJECT_ACTION.UNIQUE_ID }),
                            search.createColumn({ name: PROJECT_ACTION.TEMPLATE_DOCUMENT_RECORD }),
                            search.createColumn({ name: PROJECT_ACTION.ASSIGNED_TO }),
                            search.createColumn({ name: PROJECT_ACTION.ASSIGNED_TO_ROLE }),
                            search.createColumn({ name: PROJECT_ACTION.DOCUMENT_STATUS_TYPE }),
                            search.createColumn({
                                name: PROJECT_ACTION.PACKAGE_ACTION_TEMPLATE_DOCUMENT,
                                join: PROJECT_ACTION.PACKAGE_ACTION_TEMPLATE_RECORD_JOIN_NAME
                            }),
                            search.createColumn({
                                name: PROJECT_ACTION.PRECEEDING_PACKAGE_ACTION_FROM_PACKAGE_ACTION,
                                join: PROJECT_ACTION.PACKAGE_ACTION_TEMPLATE_RECORD_JOIN_NAME
                            }),
                            search.createColumn({ name: PROJECT_ACTION.FROM_ACTION_RECORD }),
                            search.createColumn({ name: PROJECT_ACTION.PRECEEDING_PACKAGE_ACTION_ID })
                        ]
                });
                var searchResultCount = templateProjectActionSearch.runPaged().count;
                log.audit("template project action result count", searchResultCount);
                templateProjectActionSearch.run().each(function (result) {
                    var actionObj = {};
                    actionObj.internalid = parseInt(result.getValue({ name: 'internalid' }));
                    actionObj.project = parseInt(result.getValue({ name: PROJECT_ACTION.PROJECT }));
                    actionObj.package = parseInt(result.getValue({ name: PROJECT_ACTION.PACKAGE }));
                    actionObj.packageAction = parseInt(result.getValue({ name: PROJECT_ACTION.PACKAGE_ACTION }));
                    actionObj.packageStep = result.getValue({ name: PROJECT_ACTION.PACKAGE_STEP });
                    actionObj.document = result.getValue({ name: PROJECT_ACTION.DOCUMENT });
                    actionObj.documentSavedDate = result.getValue({ name: PROJECT_ACTION.DOCUMENT_SAVED_DATE });
                    actionObj.revisionNumber = result.getValue({ name: PROJECT_ACTION.REVISION_NUMBER });
                    actionObj.documentStatus = result.getValue({ name: PROJECT_ACTION.DOCUMENT_STATUS });
                    actionObj.documentStatusType = result.getValue({ name: PROJECT_ACTION.DOCUMENT_STATUS_TYPE });
                    actionObj.documentStatusDate = result.getValue({ name: PROJECT_ACTION.DOCUMENT_STATUS_DATE });
                    actionObj.rejectionComments = result.getValue({ name: PROJECT_ACTION.REJECTION_COMMENTS });
                    actionObj.rejectionCommentHistory = result.getValue({ name: PROJECT_ACTION.REJECTION_COMMENT_HISTORY });
                    actionObj.taskType = result.getValue({ name: PROJECT_ACTION.TASK_TYPE });
                    actionObj.requiredOptional = result.getValue({ name: PROJECT_ACTION.REQD });
                    actionObj.uniqueId = result.getValue({ name: PROJECT_ACTION.UNIQUE_ID });
                    actionObj.template_document_record = result.getValue({ name: PROJECT_ACTION.TEMPLATE_DOCUMENT_RECORD });
                    actionObj.package_action_template_document = result.getValue({ name: PROJECT_ACTION.PACKAGE_ACTION_TEMPLATE_DOCUMENT, join: PROJECT_ACTION.PACKAGE_ACTION_TEMPLATE_RECORD_JOIN_NAME });
                    actionObj.from_action_record = result.getValue({ name: PROJECT_ACTION.FROM_ACTION_RECORD });
                    actionObj.preceeding_package_action_id = result.getValue({ name: PROJECT_ACTION.PRECEEDING_PACKAGE_ACTION_ID });
                    actionObj.assigned_to = result.getValue({ name: PROJECT_ACTION.ASSIGNED_TO });
                    actionObj.assigned_to_role = result.getValue({ name: PROJECT_ACTION.ASSIGNED_TO_ROLE });
                    actionObj.preceeding_package_action_id_from_package_action = result.getValue({ name: PROJECT_ACTION.PRECEEDING_PACKAGE_ACTION_FROM_PACKAGE_ACTION, join: PROJECT_ACTION.PACKAGE_ACTION_TEMPLATE_RECORD_JOIN_NAME });

                    templateProjectActionArr.push(actionObj);
                    return true;
                });
            }
            return templateProjectActionArr;
        };


        /*
         * function createNewProjectActionsFromTemplate
         * @param {templateProjectActionArr} array - and array of objects from project template project actions
         * @param {toProjectId} Internal id of newly created project
         * @param {utilityBillFileId} Internal id of utility bill bb file system id
         * @param {proposalFileId} Internal id of proposal bb file system id
         * @returns array - array of object from newly create project aciton records
        */
        function createNewProjectActionsFromTemplate(templateProjectActionArr, toProjectId, utilityBillFileId, proposalFileId) {
            var newProjectActionArray = [];
            var packageActionObj = getConfigUtilityAndProposalPackageActionIds(null);
            if (templateProjectActionArr.length > 0) {
                for (var i = 0; i < templateProjectActionArr.length; i++) {
                    var projActionObj = templateProjectActionArr[i];
                    log.audit('project action object to be converted to new project', projActionObj);
                    try {
                        var newProjectActionObj = createProjectActionRecord(projActionObj, toProjectId, utilityBillFileId, proposalFileId, packageActionObj);
                        newProjectActionArray.push(newProjectActionObj);
                    } catch (e) {
                        log.error('project action error object', projActionObj);
                        log.error('error generating project action', e);
                    }
                }
            }
            // loop over entity action records and define if project package action is found, if found, move document template logic,
            //if package action is not found, create project action record
            // call library to upsert project actions from entity action records
            var entityObj = docLib.getProjectDocumentTemplateRelatedData(toProjectId);
            var entityActions = docLib.getActionRecords(entityObj.projectAHJ, entityObj.projectUtility, entityObj.projectHOA, entityObj.projectState, entityObj.projectFinancier);
            newProjectActionArray = docLib.upsertProjectActions(entityActions, newProjectActionArray, toProjectId);

            try {
                var taskParameters = {};
                taskParameters['custscript_preceding_project_id'] = toProjectId;
                taskParameters['custscript_preceding_task_array'] = newProjectActionArray;

                var scriptId = 'customscript_bb_ss_set_preceding_actions';
                var deploymentId = 'customdeploy_bb_ss_set_preceding_act';
                var taskType = task.TaskType.SCHEDULED_SCRIPT;

                batchProcessor.addToQueue(scriptId, deploymentId, taskParameters, taskType);
            } catch (e) {
                log.error('error', e);
            }
            // create new checklist records after project action creation
            try {
                var taskParameters = {};
                taskParameters['custscript_bb_checklist_projectid'] = toProjectId;

                var scriptId = 'customscript_bb_ss_new_checklist';
                var deploymentId = 'customdeploy_bb_ss_new_checklist';
                var taskType = task.TaskType.SCHEDULED_SCRIPT;
                batchProcessor.addToQueue(scriptId, deploymentId, taskParameters, taskType);
            } catch (e) {
                log.error('error calling checklist record process', e);
            }

            return newProjectActionArray;
        };


        /*
         * function createProjectActionRecord
         * @param {projActionObj} object - objects from project template project actions
         * @param {toProjectId} Internal id of newly created project
         * @param {utilityBillFileId} Internal id of utility bill bb file system id
         * @param {proposalFileId} Internal id of proposal bb file system id
         * @returns object - object of newly create project aciton record
        */
        function createProjectActionRecord(projActionObj, toProjectId, utilityBillFileId, proposalFileId, packageActionObj) {
            var newProjectActionObj = {};
            if (toProjectId) {
                var projectAction = record.create({
                    type: 'customrecord_bb_project_action',
                    isDynamic: true
                });

                projectAction.setValue({
                    fieldId: PROJECT_ACTION.PROJECT,
                    value: toProjectId
                });
                newProjectActionObj.project = toProjectId;

                projectAction.setValue({
                    fieldId: PROJECT_ACTION.PACKAGE,
                    value: projActionObj.package
                });
                newProjectActionObj.package = projActionObj.package;

                projectAction.setValue({
                    fieldId: PROJECT_ACTION.PACKAGE_ACTION,
                    value: projActionObj.packageAction
                });
                newProjectActionObj.packageAction = projActionObj.packageAction;

                projectAction.setValue({
                    fieldId: PROJECT_ACTION.PACKAGE_STEP,
                    value: projActionObj.packageStep
                });
                newProjectActionObj.packageStep = projActionObj.packageStep;

                projectAction.setValue({
                    fieldId: PROJECT_ACTION.REVISION_NUMBER,
                    value: projActionObj.revisionNumber
                });
                newProjectActionObj.revisionNumber = projActionObj.revisionNumber;

                //var docStatus = documentStatusLib.findDocumentStatusByPackageAndStatusType(projActionObj.package, projActionObj.documentStatusType);
                projectAction.setValue({
                    fieldId: PROJECT_ACTION.DOCUMENT_STATUS,
                    value: projActionObj.documentStatus // docStatus[0].id
                });
                newProjectActionObj.documentStatus = projActionObj.documentStatus;//docStatus[0].id;

                projectAction.setValue({
                    fieldId: PROJECT_ACTION.TASK_TYPE,
                    value: projActionObj.taskType
                });
                newProjectActionObj.taskType = projActionObj.taskType;

                projectAction.setValue({
                    fieldId: PROJECT_ACTION.REQD,
                    value: projActionObj.requiredOptional
                });
                newProjectActionObj.requiredOptional = projActionObj.requiredOptional;

                // set correct document file for utility bill and proposal or for any document template
                if (projActionObj.packageAction == packageActionObj.utilityPackageActionId && utilityBillFileId) {

                    projectAction.setValue({
                        fieldId: PROJECT_ACTION.TEMPLATE_DOCUMENT_RECORD,
                        value: utilityBillFileId
                    });
                    newProjectActionObj.template_document_record = utilityBillFileId;

                    // set document status
                    // var utilDocStatusId = documentStatusLib.findDocumentStatusByPackageAndStatusType(projActionObj.package, 4); // get approved doc status
                    projectAction.setValue({
                        fieldId: PROJECT_ACTION.DOCUMENT_STATUS,
                        value: projActionObj.documentStatus //utilDocStatusId[0].id
                    });
                    newProjectActionObj.documentStatus = projActionObj.documentStatus; //utilDocStatusId[0].id

                    projectAction.setValue({
                        fieldId: PROJECT_ACTION.DOCUMENT_STATUS_DATE,
                        value: new Date()
                    });
                    newProjectActionObj.documentStatusDate = new Date();

                    //set file link for document field
                    // projectAction.setValue({
                    // 	fieldId: PROJECT_ACTION.DOCUMENT,
                    // 	value: projActionObj.document
                    // });

                } else if (projActionObj.packageAction == packageActionObj.proposalPackageActionId && proposalFileId) {

                    projectAction.setValue({
                        fieldId: PROJECT_ACTION.TEMPLATE_DOCUMENT_RECORD,
                        value: proposalFileId
                    });
                    newProjectActionObj.template_document_record = utilityBillFileId;

                    projectAction.setValue({
                        fieldId: PROJECT_ACTION.DOCUMENT_STATUS_DATE,
                        value: new Date()
                    });
                    newProjectActionObj.documentStatusDate = new Date();

                    // set document status
                    // var propDocStatusId = documentStatusLib.findDocumentStatusByPackageAndStatusType(projActionObj.package, 4); // get approved doc status
                    projectAction.setValue({
                        fieldId: PROJECT_ACTION.DOCUMENT_STATUS,
                        value: projActionObj.documentStatus //propDocStatusId[0].id
                    });
                    newProjectActionObj.documentStatus = projActionObj.documentStatus; //propDocStatusId[0].id

                    //set file link for document field
                    // projectAction.setValue({
                    // 	fieldId: PROJECT_ACTION.DOCUMENT,
                    // 	value: projActionObj.document
                    // });

                } else if (projActionObj.template_document_record) {

                    projectAction.setValue({
                        fieldId: PROJECT_ACTION.TEMPLATE_DOCUMENT_RECORD,
                        value: projActionObj.template_document_record
                    });
                    newProjectActionObj.template_document_record = projActionObj.template_document_record;

                } else if (projActionObj.package_action_template_document) {

                    projectAction.setValue({
                        fieldId: PROJECT_ACTION.TEMPLATE_DOCUMENT_RECORD,
                        value: projActionObj.package_action_template_document
                    });
                    newProjectActionObj.template_document_record = projActionObj.package_action_template_document;
                }
                if (projActionObj.assigned_to) {
                    projectAction.setValue({
                        fieldId: PROJECT_ACTION.ASSIGNED_TO,
                        value: projActionObj.assigned_to
                    });
                }
                if (projActionObj.assigned_to_role) {
                    projectAction.setValue({
                        fieldId: PROJECT_ACTION.ASSIGNED_TO_ROLE,
                        value: projActionObj.assigned_to_role
                    });
                }
                projectAction.setValue({
                    fieldId: PROJECT_ACTION.FROM_ACTION_RECORD,
                    value: projActionObj.from_action_record
                });
                newProjectActionObj.from_action_record = projActionObj.from_action_record;

                if (projActionObj.preceeding_package_action_id) {
                    projectAction.setValue({
                        fieldId: PROJECT_ACTION.PRECEEDING_PACKAGE_ACTION_ID,
                        value: projActionObj.preceeding_package_action_id
                    });
                    newProjectActionObj.preceeding_package_action_id = projActionObj.preceeding_package_action_id;
                } else {
                    projectAction.setValue({
                        fieldId: PROJECT_ACTION.PRECEEDING_PACKAGE_ACTION_ID,
                        value: projActionObj.preceeding_package_action_id_from_package_action
                    });
                    newProjectActionObj.preceeding_package_action_id = projActionObj.preceeding_package_action_id_from_package_action;
                }
                var id = projectAction.save({
                    ignoreMandatoryFields: true
                });
                newProjectActionObj['internalId'] = id;

                return newProjectActionObj;
            }

        };

        /*
         * function validateRequiredProjectFields
         * @param {entityObj} Object - search result object with entity field ids as the object key
         * @returns array - array of failed customer populated fields required for a project creation
        */
        // function validateRequiredProjectFields(entityObj) {
        //     var requiredFieldOb={}
        //     var requiredValues = [];
        //     var requiredFields = getProjectRequiredFieldRecords();
        //     log.debug('requiredFields.length',requiredFields.length);
        //     if (requiredFields.length > 0) {
        //         for (var i = 0; i < requiredFields.length; i++) {
        //             var requiredFieldId = requiredFields[i].fieldId;
        //             var requiredFieldJoinId = requiredFields[i].joinId;
        //
        //             var entityFieldValue = entityObj[requiredFieldId];
        //             if (!entityObj[requiredFieldId] && !requiredFieldJoinId) {
        //                 requiredValues.push(requiredFields[i].errorMessage);
        //             } else if (requiredFieldJoinId) {
        //                 var joinedFieldValue = lookupRequiredJoinCustomerFields(entityObj.internalid, requiredFieldId, requiredFieldJoinId);
        //                 if (!joinedFieldValue) {
        //                     requiredValues.push(requiredFields[i].errorMessage);
        //                 }
        //             }
        //         }
        //         requiredFieldOb.requiredValues=requiredValues;
        //         requiredFieldOb.projectRequiredFieldNotSet=false;
        //     }else if(requiredFields.length == 0){
        //         requiredFieldOb.requiredValues=requiredValues;
        //         requiredFieldOb.projectRequiredFieldNotSet=true;
        //     }
        //     return requiredFieldOb;
        // }


        /*
         * function findDocumentStalookupRequiredJoinCustomerFieldstusByPackageAndStatusType
         * @param {entityId} Internal id of customer, prospect, or lead
         * @param {fieldId} Internal id field id
         * @param {joinFieldId} Internal id of joined field id
         * @returns value from joined record value search
        */
        function lookupRequiredJoinCustomerFields(entityId, fieldId, joinFieldId) {
            var joinedRecordValue = null;
            var customerSearchObj = search.create({
                type: "customer",
                filters:
                    [
                        ["internalid", "anyof", entityId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: fieldId,
                            join: joinFieldId
                        })
                    ]
            });
            customerSearchObj.run().each(function (result) {
                joinedRecordValue = result.getValue({ name: fieldId, join: joinFieldId });
                return true;
            });
            return joinedRecordValue;
        };


        /*
         * function findDocumentStalookupRequiredJoinCustomerFieldstusByPackageAndStatusType
         * @param {configId} Internal id of configurationid
         * @returns object from search.lookupFields returns Utilty and Proposal Package Action IDs
        */
        function getConfigUtilityAndProposalPackageActionIds(configId) {
            var utilityPackageActionId = null;
            var proposalPackageActionId = null;
            var configurationId = (configId) ? configId : 1;
            if (configurationId) {
                var searchObj = search.lookupFields({
                    type: 'customrecord_bb_solar_success_configurtn',
                    id: configurationId,
                    columns: ['custrecord_bb_util_bill_package_action', 'custrecord_bb_proposal_package_action']
                });
                if (searchObj.custrecord_bb_util_bill_package_action.length > 0) {
                    utilityPackageActionId = searchObj.custrecord_bb_util_bill_package_action[0].value;
                }
                if (searchObj.custrecord_bb_proposal_package_action.length > 0) {
                    proposalPackageActionId = searchObj.custrecord_bb_proposal_package_action[0].value;
                }
            }
            return {
                utilityPackageActionId: utilityPackageActionId,
                proposalPackageActionId: proposalPackageActionId
            };
        };


        return {
            getEntityRecordData: getEntityRecordData,
            transformEntityToProject: transformEntityToProject,
            getTemplateRelatedProjectActions: getTemplateRelatedProjectActions,
            createNewProjectActionsFromTemplate: createNewProjectActionsFromTemplate
        };

    });