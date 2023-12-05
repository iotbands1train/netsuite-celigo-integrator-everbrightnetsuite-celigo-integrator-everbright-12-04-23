/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Brendan Boyd
 * @version 0.1.3
 * @fileOverview This module renders and saves A/R and A/P payment memos based on project type and role to the project.
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
define(['N/record', 'N/search', 'N/render', 'N/file', './BB_SS_MD_SolarConfig', './BB.SS.Project.UpdateProjectFinancierOverview'],
    function(record, search, render, file, solarConfig, adderTotals) {

        var EPC_INSTALLER_TEMPLATE = 'bb-epc-installer-memo.ftl';
        var EPC_ORIGINATOR_TEMPLATE = 'bb-epc-originator-memo.ftl';
        var FULL_SERVICE_TEMPLATE = 'bb-full-service-memo.ftl';
        var ORIGINATOR_TEMPLATE = 'bb-originator-payment-memo.ftl';
        var INSTALLER_TEMPLATE = 'bb-installer-sub-contractor-payment-memo.ftl';
        var EPC_INSTALLER_TEMPLATE_NO_LABEL = 'bb-epc-installer-memo-no-labels.ftl';
        var EPC_ORIGINATOR_TEMPLATE_NO_LABEL = 'bb-epc-originator-memo-no-labels.ftl';
        var FULL_SERVICE_TEMPLATE_NO_LABEL = 'bb-full-service-memo-no-labels.ftl';
        var ORIGINATOR_TEMPLATE_NO_LABEL = 'bb-originator-payment-memo-no-labels.ftl';
        var INSTALLER_TEMPLATE_NO_LABEL = 'bb-installer-sub-contractor-payment-memo-no-labels.ftl';
        var pricingMethods;
        var adderResponsibility;
        var EPC_ROLE = {'INSTALLER': 1, 'ORIGINATOR': 2};
        var PROJECT_FIELD_LIST = [
            'custentity_bb_system_size_decimal','custentity_bb_price_per_kwh_amount',
            'custentity_bb_fin_install_per_watt_amt','custentity_bb_fin_install_base_amt',
            'custentity_bb_fin_fixed_adder_amt','custentity_bb_fin_per_watt_adder_amt',
            'custentity_bb_fin_per_module_adder_amt',
            'custentity_bb_fin_per_foot_adder_amt','custentity_bb_total_contract_value_amt',
            'custentity_bb_fin_m0_invoice_amount','custentity_bb_fin_m1_invoice_amount',
            'custentity_bb_fin_m2_invoice_amount','custentity_bb_fin_m3_invoice_amount',
            'custentity_bb_fin_m4_invoice_amount','custentity_bb_fin_m5_invoice_amount',
            'custentity_bb_fin_m6_invoice_amount','custentity_bb_fin_m7_invoice_amount',
            'custentity_bb_fin_prelim_purch_price_amt','custentity_bb_fin_orig_base_per_watt_amt',
            'custentity_bb_fin_orig_per_watt_amt','custentity_bb_fin_orig_base_amt',
            'custentity_bb_fin_owned_equip_costs_amt','custentity_bb_fin_base_fees_amount',
            'custentity_bb_fin_monitoring_fee_amount', 'custentity_bb_fin_total_fees_amount',
            'custentity_bb_fin_total_invoice_amount','custentity_bb_installer_price_p_w',
            'custentity_bb_installer_amt','custentity_bb_installer_fxd_addr_ttl_amt',
            'custentity_bb_instllr_pr_wt_addr_ttl_amt','custentity_bb_installr_p_ft_addr_ttl_amt',
            'custentity_bb_instllr_pr_md_addr_ttl_amt',
            'custentity_bb_installer_adder_total_amt','custentity_bb_installer_m0_vbill_amt',
            'custentity_bb_installer_m1_vbill_amt','custentity_bb_installer_m2_vbill_amt',
            'custentity_bb_installer_m3_vbill_amt','custentity_bb_installer_m4_vbill_amt',
            'custentity_bb_installer_m5_vbill_amt','custentity_bb_installer_m6_vbill_amt',
            'custentity_bb_installer_m7_vbill_amt','custentity_bb_installer_vbill_ttl_amt',
            'custentity_bb_fin_pur_price_p_watt_amt','custentity_bb_originator_base_p_watt_amt',
            'custentity_bb_originator_per_watt_amt','custentity_bb_originator_base_amt',
            'custentity_bb_orgntr_fxd_addr_ttl_amt','custentity_bb_orgntr_per_watt_adder_amt',
            'custentity_bb_orgntr_per_mod_adder_amt',
            'custentity_bb_orgntr_per_ft_addr_ttl_amt','custentity_bb_orgntr_addr_ttl_amt',
            'custentity_bb_orgntr_m0_vbill_amt','custentity_bb_orgntr_m1_vbill_amt',
            'custentity_bb_orgntr_m2_vbill_amt','custentity_bb_orgntr_m3_vbill_amt',
            'custentity_bb_orgntr_m4_vbill_amt','custentity_bb_orgntr_m5_vbill_amt',
            'custentity_bb_orgntr_m6_vbill_amt','custentity_bb_orgntr_m7_vbill_amt',
            'custentity_bb_orig_tot_vendor_bill_amt'
        ];

        /**
         * Saves a A/R and A/P payment memo formatted based based on project type and role to the project.
         * @param projectDataObj - Object Data Values from project record
         * @param {Record} project - The project to save to
         */
        function savePaymentMemo(project, projectDataObj) {
            var adderObj = adderTotals.getTemplateAdderItemDetails(project.id);
            // log.debug('adder object values', adderObj);
            return {
                financierPaymentMemo: getARPaymentMemo(project, projectDataObj, adderObj),
                originatorPaymentMemo: getOriginatorPaymentMemo(project, projectDataObj, adderObj),
                installerPaymentMemo: getInstallerPaymentMemo(project, projectDataObj, adderObj)
            };
        }

        /**
         * Returns the rendered AR Payment memo
         * @param project - NS Project Record
         * @param projectDataObj - Object Data Values from project record
         * @param adderObj - Adder Object Array values for each adder pricing method
         * @returns the payment memo
         */
        function getARPaymentMemo(project, projectDataObj, adderObj) {
            var PROJECT_TYPE = getProjectType(); 
            if(!getRequiredFieldStatus(project, projectDataObj))
                return null;

            var projType = (project.getValue({fieldId: 'jobtype'})) ? project.getValue({fieldId: 'jobtype'}) :
                ((projectDataObj.jobtype) ? projectDataObj.jobtype : null);
            var epcRole = (project.getValue({fieldId: 'custentity_bb_epc_role'})) ? project.getValue({fieldId: 'custentity_bb_epc_role'}) :
                ((projectDataObj.custentity_bb_epc_role) ? projectDataObj.custentity_bb_epc_role : null);

            var template = '';
            if (projType == PROJECT_TYPE.EPC) {
                if (epcRole == EPC_ROLE.INSTALLER) {
                    template = epcInstallerTemplate(projectDataObj);
                } else {
                    template = epcOriginatorTemplate(projectDataObj);
                }
            } else {
                template = nonEpcTemplate(projectDataObj);
            }
            return renderARPaymentMemo(template, project, projectDataObj, adderObj);
        }


        /**
         * Returns the rendered Originator Payment Memo
         * @param project - NS Project Record
         * @param projectDataObj - Object Data Values from project record
         * @param adderObj - Adder Object Array values for each adder pricing method
         * @returns the originator payment memo
         */
        function getOriginatorPaymentMemo(project, projectDataObj, adderObj)
        {
            var originatorVendor = (project.getValue({fieldId: 'custentity_bb_originator_vendor'})) ? project.getValue({fieldId: 'custentity_bb_originator_vendor'}) :
                ((projectDataObj.custentity_bb_originator_vendor) ? projectDataObj.custentity_bb_originator_vendor : null);

            if (originatorVendor) {
                var template = originatorPaymentMemoTemplate(projectDataObj);
                return renderAPOriginatorPaymentMemo(template, project, projectDataObj, adderObj);
            }
            return null;
        }


        /**
         * Returns the rendered Installer Payment Memo
         * @param project - NS Project Record
         * @param projectDataObj - Object Data Values from project record
         * @param adderObj - Adder Object Array values for each adder pricing method
         * @returns the installer payment memo
         */
        function getInstallerPaymentMemo(project, projectDataObj, adderObj)
        {
            var installerVendor = (project.getValue({fieldId: 'custentity_bb_installer_partner_vendor'})) ? project.getValue({fieldId: 'custentity_bb_installer_partner_vendor'}) :
                ((projectDataObj.custentity_bb_installer_partner_vendor) ? projectDataObj.custentity_bb_installer_partner_vendor : null);

            if(installerVendor){
                var template = installerPaymentMemoTemplate(projectDataObj);
                return renderAPInstallerPaymentMemo(template, project, projectDataObj, adderObj);
            }
            return null;
        }


        /**
         * Determines if all the required fields for the AR Payment memo have been set before population
         * @param {record} project - NS Project record
         * @param projectDataObj - Object Data Values from project record
         * @returns - boolean
         */
        function getRequiredFieldStatus(project, projectDataObj) {
            var PROJECT_TYPE = getProjectType(); 
            var projType = (project.getValue('jobtype')) ? project.getValue('jobtype') : ((projectDataObj.jobtype) ? projectDataObj.jobtype : null);

            var epcRole = (project.getValue('custentity_bb_epc_role')) ? project.getValue('custentity_bb_epc_role') : 
                ((projectDataObj.custentity_bb_epc_role) ? projectDataObj.custentity_bb_epc_role :  null);

            var systemSize = (project.getValue('custentity_bb_system_size_decimal')) ? project.getValue('custentity_bb_system_size_decimal') : 
                ((projectDataObj.custentity_bb_system_size_decimal) ? projectDataObj.custentity_bb_system_size_decimal : 0);

            var prelimPurchPrice = (project.getValue('custentity_bb_fin_prelim_purch_price_amt')) ? project.getValue('custentity_bb_fin_prelim_purch_price_amt') :
                ((projectDataObj.custentity_bb_fin_prelim_purch_price_amt) ? projectDataObj.custentity_bb_fin_prelim_purch_price_amt : 0);

            var installerBasePerWatt = (project.getValue('custentity_bb_fin_install_per_watt_amt')) ? project.getValue('custentity_bb_fin_install_per_watt_amt') :
                ((projectDataObj.custentity_bb_fin_install_per_watt_amt) ? projectDataObj.custentity_bb_fin_install_per_watt_amt : 0);

            var origBasePerWattAmt = (project.getValue('custentity_bb_fin_orig_base_per_watt_amt')) ? project.getValue('custentity_bb_fin_orig_base_per_watt_amt') :
                ((projectDataObj.custentity_bb_fin_orig_base_per_watt_amt) ? projectDataObj.custentity_bb_fin_orig_base_per_watt_amt : 0);

            if(!systemSize)
                return false;

            if(projType == PROJECT_TYPE.FULL_SERVICE && prelimPurchPrice)
                return true;
            else if (projType == PROJECT_TYPE.EPC && epcRole == EPC_ROLE.INSTALLER && installerBasePerWatt)
                return true;
            else if (projType == PROJECT_TYPE.EPC && epcRole == EPC_ROLE.ORIGINATOR && origBasePerWattAmt)
                return true;
            else
                return false;
        }




        /**
         * Returns a rendered payment memo based on the provided freemarker template and project.
         * @param {string} template - The freemarker template text to data bind to
         * @param {Record} project - The project record
         * @param projectDataObj - Object Data Values from project record
         * @param adderObj - Adder Object Array values for each adder pricing method
         */
        function renderARPaymentMemo(template, project, projectDataObj, adderObj) {
             var renderer = render.create();
            renderer.templateContent = template;
            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: 'project',
                data: getProjectFields(project, projectDataObj, adderObj)
            });
            renderer.addRecord({
                templateName: 'record',
                record: project
            });

            return renderer.renderAsString();
        }

        /**
         * render the Originator Payment Memo
         * @param {string} template - the html template file
         * @param {record} project - NS Project Record
         * @param projectDataObj - Object Data Values from project record
         * @param adderObj - Adder Object Array values for each adder pricing method
         * @returns - completed template string
         */
        function renderAPOriginatorPaymentMemo(template, project, projectDataObj, adderObj){
             var renderer = render.create();
            renderer.templateContent = template;
            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: 'project',
                data: getProjectFields(project, projectDataObj, adderObj)
            });
            renderer.addRecord({
                templateName: 'record',
                record: project
            });

            return renderer.renderAsString();
        }


        /**
         * render the Installer Payment Memo
         * @param {string} template - the html template file
         * @param {record} project - NS Project Record
         * @param projectDataObj - Object Data Values from project record
         * @param adderObj - Adder Object Array values for each adder pricing method
         * @returns - completed template string
         */
        function renderAPInstallerPaymentMemo(template, project, projectDataObj, adderObj){
            var renderer = render.create();
            renderer.templateContent = template;
            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: 'project',
                data: getProjectFields(project, projectDataObj, adderObj)
            });
            renderer.addRecord({
                templateName: 'record',
                record: project
            });


            return renderer.renderAsString();
       }





        /**
         * Loads the epc installer memo freemarker template
         * @return {string} Freemarker template contents
         */
        function epcInstallerTemplate(projectDataObj) { // REVEIW EPC INSTALLER TEMPLATE FOR RENDER ERRORS
            var template = (projectDataObj.custrecord_bb_use_pay_mem_wth_label_bool) ? FULL_SERVICE_TEMPLATE : FULL_SERVICE_TEMPLATE_NO_LABEL;
            log.debug('template value', template);
            return file.load({
                id: getTemplateId(template)
            }).getContents();
        }

        /**
         * Loads the epc originator memo freemarker template
         * @return {string} Freemarker template contents
         */
        function epcOriginatorTemplate(projectDataObj) {
            var template = (projectDataObj.custrecord_bb_use_pay_mem_wth_label_bool) ? EPC_ORIGINATOR_TEMPLATE : EPC_ORIGINATOR_TEMPLATE_NO_LABEL;
            log.debug('template value', template);
            return file.load({
                id: getTemplateId(template)
            }).getContents();
        }

        /**
         * Loads the full service installer memo freemarker template
         * @return {string} Freemarker template contents
         */
        function nonEpcTemplate(projectDataObj) {
            var template = (projectDataObj.custrecord_bb_use_pay_mem_wth_label_bool) ? FULL_SERVICE_TEMPLATE : FULL_SERVICE_TEMPLATE_NO_LABEL;
            log.debug('template value', template);
            return file.load({
                id: getTemplateId(template)
            }).getContents();
        }

        /**
         * Loads the originator payment memo freemarker template
         * @return {string} Freemarker template contents
         */
        function originatorPaymentMemoTemplate(projectDataObj){
            var template = (projectDataObj.custrecord_bb_use_pay_mem_wth_label_bool) ? ORIGINATOR_TEMPLATE : ORIGINATOR_TEMPLATE_NO_LABEL;
            log.debug('template value', template);
            return file.load({
                id: getTemplateId(template)
            }).getContents();
        }

        /**
         * Loads the installer payment memo freemarker template
         * @return {string} Freemarker template contents
         */
        function installerPaymentMemoTemplate(projectDataObj) {
            var template = (projectDataObj.custrecord_bb_use_pay_mem_wth_label_bool) ? INSTALLER_TEMPLATE : INSTALLER_TEMPLATE_NO_LABEL;
            log.debug('template value', template);
            return file.load({
                id: getTemplateId(template)
            }).getContents();
        }


    /**
     * Creates anonymous object with fields from a project record
     * @param {record} project - NS Project Record
     * @param projectDataObj - Object Data Values from project record
     * @param adderObj - Adder Object Array values for each adder pricing method
     * @returns - object with fields from a project record
     */
    function getProjectFields(project, projectDataObj, adderObj) {
        var dynamicProject = {};
        for(var i = 0; i < PROJECT_FIELD_LIST.length; i++){
            dynamicProject[PROJECT_FIELD_LIST[i]] = {value: project.getValue(PROJECT_FIELD_LIST[i])};
        }
        dynamicProject['finFixedAdders'] = adderObj.finFixedAdders;
        dynamicProject['finPerWattAdders'] = adderObj.finPerWattAdders;
        dynamicProject['finPerFootAdders'] = adderObj.finFixedAdders;
        dynamicProject['finPerModAdders'] = adderObj.finPerModAdders;
        dynamicProject['origFixedAdders'] = adderObj.origFixedAdders;
        dynamicProject['origPerWattAdders'] = adderObj.origPerWattAdders;
        dynamicProject['origPerFootAdders'] = adderObj.origPerFootAdders;
        dynamicProject['origPerModAdders'] = adderObj.origPerModAdders;
        dynamicProject['installFixedAdders'] = adderObj.installFixedAdders;
        dynamicProject['installPerWattAdders'] = adderObj.installPerWattAdders;
        dynamicProject['installPerFootAdders'] = adderObj.installPerFootAdders;
        dynamicProject['installPerModAdders'] = adderObj.installPerModAdders;


        return dynamicProject;
    }



    function getTemplateId(templateName){  
        var templateLookup = search.create({
            type: "file",
            filters:
            [
                ["name","is",templateName] 
            ],
            columns:
            [
               "internalid",
            ]
        }).run().getRange({
            start: 0,
            end: 1
        });
        if (templateLookup.length > 0) {
            log.debug('template id', templateLookup[0].getValue({name: 'internalid'}));
            return templateLookup[0].getValue({
                name : 'internalid'
            });
        }
    }

    function getProjectType() {
        var configItems = ['custrecord_bb_full_service_type', 'custrecord_bb_epc_type'];
        var projType = solarConfig.getConfigurations(configItems);
        if (projType) {
            return {
                FULL_SERVICE : projType.custrecord_bb_full_service_type.value,
                EPC : projType.custrecord_bb_epc_type.value
            };
            
        }
    }

        return {
            savePaymentMemo: savePaymentMemo
        };
    });