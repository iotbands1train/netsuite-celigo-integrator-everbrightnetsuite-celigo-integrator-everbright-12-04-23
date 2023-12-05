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

define(['N/record', 'N/search', 'N/currentRecord', 'N/url'], function(record, search, currentRecord, url) {

    function pageInit() {
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

        var systemSize = adderRecord.getValue({
            fieldId: 'custpage_system_size'
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

        if (adderItem) {
            var matchingItem = getMatchingItemDetails(adderItem, items);
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

            if (!fixedPrice) {
                adderRecord.setCurrentSublistValue({
                    sublistId: 'custpage_adder_item_list',
                    fieldId: 'custpage_adder_fixed_price',
                    value: matchingItem.fixedPrice,
                    ignoreFieldChange: true
                });

            }
            if (matchingItem.priceMethod == 2) { // per watt pricing method
                var sysSizeQty = (systemSize * 1000).toFixed(0);
                adderRecord.setCurrentSublistValue({
                    sublistId: 'custpage_adder_item_list',
                    fieldId: 'custpage_adder_qty',
                    value: sysSizeQty,
                    ignoreFieldChange: true
                });
            }


            if (matchingItem.priceMethod == 1 && adderQty == 1) {
                var fixedQty = 1;
                adderRecord.setCurrentSublistValue({
                    sublistId: 'custpage_adder_item_list',
                    fieldId: 'custpage_adder_qty',
                    value: fixedQty,
                    ignoreFieldChange: true
                });

            }
            adderRecord.setCurrentSublistValue({
                sublistId: 'custpage_adder_item_list',
                fieldId: 'custpage_adder_cost_amount',
                value: matchingItem.costAmt,
                ignoreFieldChange: true
            });
            return true;
        } else {
            return false;
        }

        if (fixedPrice )

            return false;
    }

    function validateField(context) {
        //var project = context.currentRecord;
        var project = currentRecord.get();

        var fieldId = context.fieldId;
        log.debug('fieldId', fieldId);
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
                        } else if (priceObj.type == 'Kit' && !priceObj.baseprice) {
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


    function getAdderItemDetails() {
        //adderItem is sublist field
        var itemArr = [];
        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["custitem_bb_item_category","anyof","2"]
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
        log.debug("itemSearchObj result count",searchResultCount);
        itemSearchObj.run().each(function(result){
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

    function getItemDescription(bomItemId){

        if (bomItemId) {
            var descript = search.lookupFields({
                type: search.Type.INVENTORY_ITEM,
                id: bomItemId,
                columns:['purchasedescription']
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
                    ["internalid","anyof",bomItem]
                ],
            columns:
                [
                    "internalid",
                    "type",
                    "baseprice"
                ]
        });
        var searchResultCount = itemSearchObj.runPaged().count;
        log.debug("itemSearchObj result count",searchResultCount);
        itemSearchObj.run().each(function(result){
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
        var project, projectId, configId, systemSize, salesOrder;
        project = currentRecord.get();
        projectId = project.id;

        var projectFields = search.lookupFields({
            type: search.Type.JOB,
            id: projectId,
            columns: ['custentity_bbss_configuration', 'custentity_bb_system_size_decimal', 'custentity_bb_project_so']
        });

        if (projectFields.custentity_bbss_configuration.length > 0) {
            configId = projectFields.custentity_bbss_configuration[0].value;
        } else {
            configId = 1;
        }

        if (projectFields.custentity_bb_project_so.length > 0) {
            salesOrder = projectFields.custentity_bb_project_so[0].value
        } else {
            salesOrder = null;
        }

        systemSize = projectFields.custentity_bb_system_size_decimal || 0;

        var adderSuiteletUrl = url.resolveScript({
            scriptId: 'customscript_bb_ss_sl_project_adders',
            deploymentId: 'customdeploy_bb_ss_sl_project_adders',
            params: {
                project: projectId,
                salesOrder: salesOrder,
                systemSize: systemSize,
                configId: configId
            }
        });
        window.open(adderSuiteletUrl);
    }

    function callBomSuitelet() {

        var project, projectId, salesOrder, configId, bomStatus;
        project = currentRecord.get();
        projectId = project.id;

        var projectFields = search.lookupFields({
            type: search.Type.JOB,
            id: projectId,
            columns: ['custentity_bbss_configuration', 'custentity_bb_project_so', 'custentity_bb_bom_status_list']
        });

        if (projectFields.custentity_bb_project_so.length > 0) {
            salesOrder = projectFields.custentity_bb_project_so[0].value;
        } else {
            salesOrder = null;
        }

        if (projectFields.custentity_bbss_configuration.length > 0) {
            configId = projectFields.custentity_bbss_configuration[0].value;
        } else {
            configId = null;
        }


        if (projectFields.custentity_bb_bom_status_list.length > 0) {
            bomStatus = projectFields.custentity_bb_bom_status_list[0].value
        } else {
            bomStatus = 1;
        }

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
        window.open(bomSuiteletUrl);

    }

    function callExpenseSuitelet(context) {
        var project, projectId, configId, systemSize, salesOrder;
        project = currentRecord.get();
        projectId = project.id;

        var projectFields = search.lookupFields({
            type: search.Type.JOB,
            id: projectId,
            columns: ['custentity_bbss_configuration', 'custentity_bb_system_size_decimal', 'custentity_bb_project_so']
        });

        if (projectFields.custentity_bbss_configuration.length > 0) {
            configId = projectFields.custentity_bbss_configuration[0].value
        } else {
            configId = 1;
        }

        if (projectFields.custentity_bb_project_so.length > 0) {
            salesOrder = projectFields.custentity_bb_project_so[0].value
        } else {
            salesOrder = null;
        }

        systemSize = projectFields.custentity_bb_system_size_decimal || 0;

        var expSuiteletUrl = url.resolveScript({
            scriptId: 'customscript_bb_ss_sl_project_expense',
            deploymentId: 'customdeploy_bb_ss_sl_project_expense',
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

    function callCopyProjectSuitelet() {
        var project = currentRecord.get();
        var projectId = project.id;
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_bb_sl_copy_project',
            deploymentId: 'customdeploy_bb_sl_copy_project',
            params: {
                recordId: projectId
            }
        });
        window.open(suiteletUrl);
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
        callCopyProjectSuitelet: callCopyProjectSuitelet

    };
});