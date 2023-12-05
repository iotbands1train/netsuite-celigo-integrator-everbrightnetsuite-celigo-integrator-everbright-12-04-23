/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 * @author Matt Lehman
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

define(['N/https', 'N/runtime', 'N/ui/serverWidget', 'N/redirect', 'N/xml', 'N/render', 'N/encode'], function(https, runtime,serverWidget, redirect, xmlMod, render, encode) {

    function onRequest(context) {
        if (context.request.method == 'GET') {

            var userGuides = getUserGuideList();
            var form = serverWidget.createForm({
                title: 'SolarSuccess User Guides'
            });

            var accountingPDF = form.addField({
                id: 'custpage_accnt_pdf',
                label: 'Select a Document for Download',
                type: 'SELECT'
            });
            accountingPDF.addSelectOption({
                value: '',
                text: ''
            });

            var sublist = form.addSublist({
                id: 'custpage_user_guide_list',
                label: 'User Guide Document List',
                type: 'LIST'
            });

            var docName = sublist.addField({
                id: 'custpage_doc_name',
                label: 'Document Name',
                type: 'TEXT'
            });

            var docId = sublist.addField({
                id: 'custpage_doc_id',
                label: 'Document ID',
                type: 'TEXT'
            });

            var pageId = sublist.addField({
                id: 'custpage_page_id',
                label: 'Page ID',
                type: 'TEXT'
            });
            docId.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });

            pageId.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });

            if (userGuides.length > 0) {
                for (var i = 0; i < userGuides.length; i++) {
                    var id = userGuides[i].id;
                    var name = userGuides[i].name;
                    var exportId = userGuides[i].templateId;
                    var pageId = userGuides[i].pageId;

                    sublist.setSublistValue({id: 'custpage_doc_name', line: i, value: name});
                    sublist.setSublistValue({id: 'custpage_doc_id', line: i, value: id});
                    sublist.setSublistValue({id: 'custpage_page_id', line: i, value: pageId});

                    accountingPDF.addSelectOption({
                        value: pageId,
                        text: name
                    });

                } // end of loop
            }

            form.clientScriptModulePath = './BB SS/SS Lib/BB.SS.CS.UserGuides.js';
            var accountingButton = form.addButton({
                id: 'custpage_download_doc',
                label: 'Download Document',
                functionName: 'callConfluence'
            });
            context.response.writePage(form);

        } 

    }


    function getUserGuideList() {
        var listArr = [];

        listArr.push({id: 'create_project_from_entity', name: 'Create a Project from Lead, Prospect or Customer', pageId: '189693955'});

        listArr.push({id: 'lead_prospt_customer_contact_pdf', name: 'Lead, Prospects, Customers and Contacts', pageId: '189399045'});

        listArr.push({id: 'maturing_proj_package_action_pdf', name: 'Mature Project Package Actions', pageId: '189628437'});

        listArr.push({id: 'proj_boms_adders_cost_sheet_pdf', name: 'Project BOMs, Adders, and Cost Sheets', pageId: '189693969'});

        return listArr;
    }

    return {
        onRequest: onRequest
    };
    
});