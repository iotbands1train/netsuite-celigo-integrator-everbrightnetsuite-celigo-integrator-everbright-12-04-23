/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope public
 * @author Matt Lehman
 * @version 0.1.0
 * @overview - Project Form / Suitelet Project BOM and Adder Record Validations.
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

define(['N/record', 'N/search', 'N/currentRecord', 'N/url', './BB.SS.MD.EnergyProduction'], function (record, search, currentRecord, url, energyProdHelper) {

    function pageInit() {
        var adderRecord = currentRecord.get();
        var adderLineCount = adderRecord.getLineCount({
            sublistId: 'custpage_adder_item_list'
        });
        console.log('adderline count', adderLineCount);
        var adderGrandTotal = 0.00;
        if (adderLineCount > 0) {
            for (var a = 0; a < adderLineCount; a++) {
                var adderAmount = adderRecord.getSublistValue({
                    sublistId: 'custpage_adder_item_list',
                    fieldId: 'custpage_adder_total_amount',
                    line: a
                });
                adderGrandTotal = adderGrandTotal + adderAmount;
            }
        }
        adderRecord.setValue({
            fieldId: 'custpage_adder_grand_total',
            value: adderGrandTotal.toFixed(2)
        });

    }

    function validateDelete(context) {
        //var bomRecord = context.currentRecord;
        var bomRecord = currentRecord.get();
        var poId = bomRecord.getCurrentSublistValue({
            sublistId: 'custpage_bom_item_list',
            fieldId: 'custpage_associated_po'
        });
        var poName = bomRecord.getCurrentSublistText({
            sublistId: 'custpage_bom_item_list',
            fieldId: 'custpage_associated_po'
        });
        log.debug('po id', poId);
        if (poId) {
            alert('The line you are trying to remove is associated to a Purchase Order, This line cannot be removed');
            return false;
        } else {
            return true;
        }
    }

    function lineInit(context) {
        //var bomRecord = context.currentRecord;
        var bomRecord = currentRecord.get();
        var poId = bomRecord.getCurrentSublistValue({
            sublistId: 'custpage_bom_item_list',
            fieldId: 'custpage_associated_po'
        });
        var poName = bomRecord.getCurrentSublistText({
            sublistId: 'custpage_bom_item_list',
            fieldId: 'custpage_associated_po'
        });
        log.debug('po id', poId);
        if (poId) {
            alert('The line you are trying to remove is associated to a Purchase Order, This line cannot be removed');
            return false;
        } else {
            return true;
        }
    }

    function fieldChanged(context) {
        var currentFieldId = context.fieldId;
        var items = getAdderItemDetails();

        //var adderRecord = context.currentRecord;
        var adderRecord = currentRecord.get();
        var adderItem = adderRecord.getCurrentSublistValue({
            sublistId: 'custpage_adder_item_list',
            fieldId: 'custpage_adder_item'
        });
        var adderQty = adderRecord.getCurrentSublistValue({
            sublistId: 'custpage_adder_item_list',
            fieldId: 'custpage_adder_qty'
        });

        var fixedPrice = adderRecord.getCurrentSublistValue({
            sublistId: 'custpage_adder_item_list',
            fieldId: 'custpage_adder_fixed_price'
        });
        var priceMeth = adderRecord.getCurrentSublistValue({
            sublistId: 'custpage_adder_item_list',
            fieldId: 'custpage_adder_pricing_method'
        });

        var systemSize = adderRecord.getValue({
            fieldId: 'custpage_system_size'
        });

        var modQty = adderRecord.getValue({
            fieldId: 'custpage_module_qty'
        });

        var bomItemId = adderRecord.getCurrentSublistValue({
            sublistId: 'custpage_bom_item_list',
            fieldId: 'custpage_bom_item'
        });

        var bomQty = adderRecord.getCurrentSublistValue({
            sublistId: 'custpage_bom_item_list',
            fieldId: 'custpage_bom_item'
        });

        if (bomItemId) {
            var bomDescription = getItemDescription(bomItemId);
            log.debug('bom description', bomDescription);
            if (bomDescription) {
                adderRecord.setCurrentSublistValue({
                    sublistId: 'custpage_bom_item_list',
                    fieldId: 'custpage_bom_item_description',
                    value: bomDescription,
                    ignoreFieldChange: true
                });
                return true;
            } else {
                return false;
            }
        }
        console.log('adder item', adderItem);
        console.log('current field id', currentFieldId);

        if (adderItem && currentFieldId == 'custpage_adder_item') {
            var matchingItem = getMatchingItemDetails(adderItem, items);
            console.log('matching item object', matchingItem);
            adderRecord.setCurrentSublistValue({
                sublistId: 'custpage_adder_item_list',
                fieldId: 'custpage_adder_responsibility',
                value: matchingItem.adderResponse,
                ignoreFieldChange: true
            });
            adderRecord.setCurrentSublistValue({
                sublistId: 'custpage_adder_item_list',
                fieldId: 'custpage_adder_pricing_method',
                value: matchingItem.priceMethod,
                ignoreFieldChange: true
            });

            if (matchingItem.priceMethod == 1) {
                console.log('matchingItem.priceMethod == 1');
                var fixedQty = 1;
                adderRecord.setCurrentSublistValue({
                    sublistId: 'custpage_adder_item_list',
                    fieldId: 'custpage_adder_qty',
                    value: fixedQty,
                    ignoreFieldChange: true
                });
                adderRecord.setCurrentSublistValue({
                    sublistId: 'custpage_adder_item_list',
                    fieldId: 'custpage_adder_fixed_price',
                    value: matchingItem.fixedPrice,
                    ignoreFieldChange: true
                });
            }

            if (matchingItem.priceMethod == 2) { // per watt pricing method
                console.log('matchingItem.priceMethod == 2');
                var sysSizeQty = (systemSize) ? (systemSize * 1000).toFixed(0) : 1;
                adderRecord.setCurrentSublistValue({
                    sublistId: 'custpage_adder_item_list',
                    fieldId: 'custpage_adder_qty',
                    value: sysSizeQty,
                    ignoreFieldChange: true
                });

                console.log('updating per watt price');
                adderRecord.setCurrentSublistValue({
                    sublistId: 'custpage_adder_item_list',
                    fieldId: 'custpage_adder_fixed_price',
                    value: matchingItem.costAmt,
                    ignoreFieldChange: true
                });
            }

            if (matchingItem.priceMethod == 3) { // per foot
                console.log('matchingItem.priceMethod == 3');
                var perFootQty = 1;
                adderRecord.setCurrentSublistValue({
                    sublistId: 'custpage_adder_item_list',
                    fieldId: 'custpage_adder_qty',
                    value: perFootQty,
                    ignoreFieldChange: true
                });

                adderRecord.setCurrentSublistValue({
                    sublistId: 'custpage_adder_item_list',
                    fieldId: 'custpage_adder_fixed_price',
                    value: matchingItem.fixedPrice,
                    ignoreFieldChange: true
                });
            }

            if (matchingItem.priceMethod == 4) { // per module
                console.log('matchingItem.priceMethod == 4');
                var perModQty = (modQty) ? modQty : 1;
                adderRecord.setCurrentSublistValue({
                    sublistId: 'custpage_adder_item_list',
                    fieldId: 'custpage_adder_qty',
                    value: perModQty,
                    ignoreFieldChange: true
                });
                adderRecord.setCurrentSublistValue({
                    sublistId: 'custpage_adder_item_list',
                    fieldId: 'custpage_adder_fixed_price',
                    value: matchingItem.fixedPrice,
                    ignoreFieldChange: true
                });
            }

            return true;
        } else {
            return false;
        }

        // if (fixedPrice )

        // return false;
    }

    function validateField(context) {
        //var project = context.currentRecord;
        var project = currentRecord.get();

        var fieldId = context.fieldId;
        log.debug('fieldId', fieldId);

        //New logic for duplicated item check - Santiago Rios 10/17/22
        var logTitle = 'validateField';
        try {
            if (context.sublistId == 'custpage_bom_item_list' && fieldId == 'custpage_bom_item') {
                if (itemAlreadyExists(context, project)) {
                    //Send error message
                    alert('The selected item is already in the BOM. It cannot be duplicated. ' +
                        'If you need additional quantity of this items, please add/remove quantity from the existing item in the BOM.');
                    return false;
                }
            }
        } catch (e) {
            console.log(logTitle + ' | Error: ' + e.message);
        }
        //End of new logic

        if (fieldId == 'custpage_bom_item' || fieldId == 'custpage_bom_quantity') { //poId && fieldId == 'custpage_bom_quantity'
            var poId = project.getCurrentSublistValue({
                sublistId: 'custpage_bom_item_list',
                fieldId: 'custpage_associated_po'
            });
            log.debug('po id', poId);
            if (poId) {
                alert('This BOM Item is associated to Purchase Order and cannot be changed');
                project.cancelLine({
                    sublistId: 'custpage_bom_item_list'
                });
                return false;
            } else {
                if (fieldId == 'custpage_bom_item') {
                    var bomItem = project.getCurrentSublistValue({
                        sublistId: 'custpage_bom_item_list',
                        fieldId: 'custpage_bom_item'
                    });
                    if (bomItem) {
                        var priceObj = checkItemPrice(bomItem);
                        console.log('price object', priceObj);
                        if (priceObj.type == 'InvtPart' && priceObj.baseprice) {
                            return true;
                        } else if (priceObj.type == 'Kit' && parseFloat(priceObj.baseprice) > 0) {
                            return true;
                        } else {
                            alert('You can not add items without pricing, please set the baseprice on this item before attempting to add it.');
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }


    function itemAlreadyExists(context, objCurrentRecord) {
        var itemToAdd = objCurrentRecord.getCurrentSublistValue({
            sublistId: context.sublistId,
            fieldId: context.fieldId
        });
        var lineCount = objCurrentRecord.getLineCount({
            sublistId: context.sublistId
        });

        for (var i = 0; i < lineCount; i++) {
            var lineItem = objCurrentRecord.getSublistValue({
                sublistId: context.sublistId,
                fieldId: context.fieldId,
                line: i
            });

            if (parseInt(lineItem) == parseInt(itemToAdd)) {
                return true;
            }
        }
        return false;
    }

    function getAdderItemDetails() {
        //adderItem is sublist field
        var itemArr = [];
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["custitem_bb_item_category", "anyof", "2"]
                ],
            columns:
                [
                    "internalid",
                    "itemid",
                    "custitem_bb_adder_responsibility",
                    "custitem_bb_adder_pricing_method",
                    "custitem_bb_adder_fixed_price_amt",
                    "custitem_bb_adder_cost_amount"
                ]
        });
        var searchResultCount = itemSearchObj.runPaged().count;
        log.debug("itemSearchObj result count", searchResultCount);
        itemSearchObj.run().each(function (result) {
            var internalId = result.getValue({
                name: 'internalid'
            });
            var itemId = result.getValue({
                name: 'itemid'
            });
            var adderResponsibility = result.getValue({
                name: 'custitem_bb_adder_responsibility'
            });
            var adderPriceMethod = result.getValue({
                name: 'custitem_bb_adder_pricing_method'
            });
            var adderFixedPrice = result.getValue({
                name: 'custitem_bb_adder_fixed_price_amt'
            });
            var adderCostAmt = result.getValue({
                name: 'custitem_bb_adder_cost_amount'
            });
            itemArr.push({
                internalId: internalId,
                itemId: itemId,
                adderResponsibility: adderResponsibility,
                adderPriceMethod: adderPriceMethod,
                adderFixedPrice: adderFixedPrice,
                adderCostAmt: adderCostAmt
            });
            return true;
        });

        return itemArr;
    }

    function getMatchingItemDetails(adderItem, items) {
        if (items.length > 0) {
            for (var a = 0; a < items.length; a++) {
                var internalId = items[a].internalId;
                var itemId = items[a].itemId;
                var adderResponse = items[a].adderResponsibility;
                var priceMethod = items[a].adderPriceMethod;
                var fixedPrice = items[a].adderFixedPrice;
                var costAmt = items[a].adderCostAmt;
                if (adderItem == internalId) {
                    return {
                        internalId: internalId,
                        itemId: itemId,
                        adderResponse: adderResponse,
                        priceMethod: priceMethod,
                        fixedPrice: fixedPrice,
                        costAmt: costAmt
                    }
                }
            }
        }
    }

    function getItemDescription(bomItemId) {

        if (bomItemId) {
            var descript = search.lookupFields({
                type: search.Type.INVENTORY_ITEM,
                id: bomItemId,
                columns: ['purchasedescription']
            });
            return descript.purchasedescription;

        }

    }

    function checkItemPrice(bomItem) {
        var priceObj = {}
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalid", "anyof", bomItem]
                ],
            columns:
                [
                    "internalid",
                    "type",
                    "baseprice"
                ]
        });
        var searchResultCount = itemSearchObj.runPaged().count;
        log.debug("itemSearchObj result count", searchResultCount);
        itemSearchObj.run().each(function (result) {
            var type = result.getValue({
                name: 'type'
            });
            var baseprice = result.getValue({
                name: 'baseprice'
            });
            console.log('type', type);
            console.log('baseprice', baseprice);
            priceObj.type = type;
            priceObj.baseprice = baseprice;

            return true;
        });
        return priceObj;
    }

    function callAdderSuitelet(context) {
        var project = currentRecord.get();
        var projectId = project.id;

        var configId = 1;
        var configObj = search.lookupFields({
            type: 'customrecord_bb_solar_success_configurtn',
            id: configId,
            columns: ['custrecord_bb_mod_qty_field_id']
        });
        var modQtyFieldId = (configObj.custrecord_bb_mod_qty_field_id) ? String(configObj.custrecord_bb_mod_qty_field_id) : 'custentity_bb_module_quantity_num'

        var projectFields = search.lookupFields({
            type: search.Type.JOB,
            id: projectId,
            columns: ['custentity_bbss_configuration', 'custentity_bb_system_size_decimal', 'custentity_bb_project_so', 'custentity_bb_module_quantity_num']
        });


        var systemSize = projectFields.custentity_bb_system_size_decimal || 0;
        var salesOrder = projectFields.custentity_bb_project_so[0].value || null;
        var modQty = projectFields.custentity_bb_module_quantity_num;

        var adderSuiteletUrl = url.resolveScript({
            scriptId: 'customscript_bb_ss_sl_project_adders',
            deploymentId: 'customdeploy_bb_ss_sl_project_adders',
            params: {
                project: projectId,
                salesOrder: salesOrder,
                systemSize: systemSize,
                configId: configId,
                modQty: modQty
            }
        });
        window.open(adderSuiteletUrl);
    }

    function callBomSuitelet() {
        var project = currentRecord.get();
        var projectId = project.id;

        var projectFields = search.lookupFields({
            type: search.Type.JOB,
            id: projectId,
            columns: ['custentity_bbss_configuration', 'custentity_bb_project_so', 'custentity_bb_bom_status_list']
        });

        var salesOrder = projectFields.custentity_bb_project_so[0].value || null;
        var configId = projectFields.custentity_bbss_configuration[0].value || 1;
        var bomStatus = (projectFields.custentity_bb_bom_status_list.length > 0) ? projectFields.custentity_bb_bom_status_list[0].value : null;
        var bomSuiteletUrl = url.resolveScript({
            scriptId: 'customscript_bb_ss_sl_project_bom',
            deploymentId: 'customdeploy_bb_ss_sl_project_bom',
            params: {
                project: projectId,
                salesOrder: salesOrder,
                configId: configId,
                bomStatus: bomStatus
            }
        });
        window.open(bomSuiteletUrl)

    }

    function callExpenseSuitelet(context) {
        var project = currentRecord.get();
        var projectId = project.id;

        var projectFields = search.lookupFields({
            type: search.Type.JOB,
            id: projectId,
            columns: ['custentity_bbss_configuration', 'custentity_bb_system_size_decimal', 'custentity_bb_project_so']
        });
        var configId = projectFields.custentity_bbss_configuration[0].value || 1;
        var systemSize = projectFields.custentity_bb_system_size_decimal || 0;
        var salesOrder = projectFields.custentity_bb_project_so[0].value || null;

        var expSuiteletUrl = url.resolveScript({
            //scriptId: 'customscript_bb_ss_sl_project_expense',
            //deploymentId: 'customdeploy_bb_ss_sl_project_expense',
            scriptId: 'customscript_bb_sl_proj_exp_budget',
            deploymentId: 'customdeploy_bb_sl_proj_exp_budget',
            params: {
                project: projectId,
                salesOrder: salesOrder,
                systemSize: systemSize,
                configId: configId
            }
        });
        window.open(expSuiteletUrl);
    }

    function callBOMReport() {
        var project = currentRecord.get();
        var projectId = project.id;
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_bb_ss_sl_bom_report',
            deploymentId: 'customdeploy_bb_ss_sl_bom_report',
            params: {
                project: projectId
            }
        });
        window.open(suiteletUrl);
    }

    function callChangeOfScopeSuitelet() {
        var project = currentRecord.get();
        var projectId = project.id;
        /*
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_bb_ss_sl_changeofscope',
            deploymentId: 'customdeploy_bb_ss_sl_changeofscope',
            params: {
                project: projectId
            }
        });
        */
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_bb_sl_change_of_scope',
            deploymentId: 'customdeploy_bb_sl_change_of_scope',
            params: {
                project: projectId
            }
        });
        window.open(suiteletUrl);
    }

    function callPauseProject() {
        var
            _project = currentRecord.get()
            , _options = {
                title: 'Pause Project'
                , message: '<div class="pause-project-holder">Pause project for <input type="number" class="input uir-custom-field pause-project-days" value=""> days</div>'
                , buttons: []
            }
            , _url
            ;

        _options.buttons.push(new NS.UI.Messaging.Button({
            label: 'OK',
            value: true,
            onClick: function (event) {
                // do call to Suitelet
                var _days = jQuery('.pause-project-holder .pause-project-days').val();
                if (_days) {
                    _url = url.resolveScript({
                        scriptId: 'customscript_bb_ss_sl_pause_project'
                        , deploymentId: 'customdeploy_bb_ss_sl_pause_project'
                        , params: {
                            project: _project.id
                            , days: _days
                        }
                    });
                    jQuery.get(_url, function (data) {
                        var _successMessage = uiMessageModule.create({
                            type: uiMessageModule.Type.INFORMATION,
                            title: 'Project was paused for ' + _days + ' day' + (_days > 1 ? 's' : '') + '.',
                            messsage: 'All related data is being processed and updated.',
                            duration: 10000
                        });
                        _successMessage.show();
                    });
                }
                event.dialog.close(event);
            }
        }));

        _options.buttons.push(new NS.UI.Messaging.Button({
            label: 'Cancel',
            value: false,
            onClick: function (event) { event.dialog.close(event); }
        }));

        var myDialog = new NS.UI.Messaging.Dialog(_options);
        myDialog.open();

    }

    /**
     * Function call the copy suitelet
     *
     * @governance 0 Units
     * @param {Object} context - context of the request
     */
    function callCopyProjectSuitelet() {
        var project = currentRecord.get();
        var projectId = project.id;
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_bb_sl_copyproject',
            deploymentId: 'customdeploy_bb_sl_copyproject',
            params: {
                recordId: projectId
            }
        });
        window.open(suiteletUrl);
    }

    function callAiaSuitelet() {
        var project = currentRecord.get();
        var projectId = project.id;
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_bb_ss_sl_aia_billing',
            deploymentId: 'customdeploy_bb_ss_sl_aia_billing',
            params: {
                recordId: projectId
            }
        });
        window.open(suiteletUrl);
    }

    /**
     * Function call the copy suitelet
     *
     * @governance 0 Units
     * @param {Object} context - context of the request
     */
    function callLoadDevices() {
        var project = currentRecord.get();
        log.debug('project', project);
        var projectSearchDetails = search.lookupFields({
            type: 'job',
            id: project.id,
            columns: ['custentity_bb_ss_solaredge_site_id', 'custentity_bb_energy_production_source', 'custentity_bb_ss_alsoenergy_site_id']
        });

        log.debug('siteId in add', projectSearchDetails);
        var projectId = project.id;
        var siteId = ''
        if (projectSearchDetails.custentity_bb_energy_production_source[0].value == energyProdHelper.getEnergyProductionSource('AlsoEnergy')) {
            siteId = projectSearchDetails.custentity_bb_ss_alsoenergy_site_id;
        } else if (projectSearchDetails.custentity_bb_energy_production_source[0].value == energyProdHelper.getEnergyProductionSource('SolarEdge')) {
            siteId = projectSearchDetails.custentity_bb_ss_solaredge_site_id;
        }
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_bb_ss_createdeviceslist',
            deploymentId: 'customdeploy_bb_ss_createdeviceslist',
            params: {
                recordId: projectId,
                siteId: siteId,
                source: projectSearchDetails.custentity_bb_energy_production_source[0].value
            }
        });
        window.open(suiteletUrl, "_self");
    }


    return {
        pageInit: pageInit,
        lineInit: lineInit,
        validateDelete: validateDelete,
        fieldChanged: fieldChanged,
        validateField: validateField,
        callAdderSuitelet: callAdderSuitelet,
        callExpenseSuitelet: callExpenseSuitelet,
        callBomSuitelet: callBomSuitelet,
        callBOMReport: callBOMReport,
        callChangeOfScopeSuitelet: callChangeOfScopeSuitelet,
        callPauseProject: callPauseProject,
        callCopyProjectSuitelet: callCopyProjectSuitelet,
        callLoadDevices: callLoadDevices,
        callAiaSuitelet: callAiaSuitelet

    };
});