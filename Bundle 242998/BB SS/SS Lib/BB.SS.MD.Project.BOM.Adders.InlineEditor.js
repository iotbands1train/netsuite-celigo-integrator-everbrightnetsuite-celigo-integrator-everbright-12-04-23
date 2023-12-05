/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Matt Lehman
 * @overview - Library for Project BOM and adder sublist deployed on Project Form
 */

/**
 * Copyright 2017-2019 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/record', 'N/search', 'N/runtime', 'N/ui/serverWidget', './BB.SS.MD.UpsertSalesOrder','./BB.SS.Project.AccountingFields', './BB.SS.Project.TotalContractValueHistory'],
    function(record, search, runtime, serverWidget, upsertSalesOrder, accountingFields, contractHistory) {

        var DYNAMIC_COLUMNS_SEARCH = 'customsearch_bb_bom_inventory_item_list';

        /**
         * createBOMSublist(scriptContext) - creates bom sublist and inserts to project form sublist
         * @param  scriptContext{[NS Script Context Entry Point]}
         * @return void {[void]}
         */
        function createBOMSublist(scriptContext) {
            var project = scriptContext.newRecord;
            var projectId = scriptContext.newRecord.id;
            var form = scriptContext.form;
            var soId = project.getValue({
                fieldId: 'custentity_bb_project_so'
            });
            var bomSubTab = form.addTab({
                id: 'custpage_bom_sub_tab',
                label: 'Project BOM',
            });
            var projectTabs = form.getTabs();

            form.insertTab({
                tab: bomSubTab,
                nexttab: 's_relation'
            });

            var bomSublist = form.addSublist({
                id: 'custpage_bom_item_list',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'BOM Items',
                tab: 'custpage_bom_sub_tab'
            });
            var bomItem = bomSublist.addField({
                id: 'custpage_bom_item',
                type: serverWidget.FieldType.SELECT,
                label: 'BOM Item'
            });
            bomItem.addSelectOption({
                value: '',
                text: ''
            });
            bomItemSelection(bomItem);

            var bomQty = bomSublist.addField({
                id: 'custpage_bom_quantity',
                type: serverWidget.FieldType.INTEGER,
                label: 'Quantity'
            });

            var bomId = bomSublist.addField({
                id: 'custpage_bom_id',
                type: serverWidget.FieldType.INTEGER,
                label: 'BOM Internal ID'
            });

            var itemDescription = bomSublist.addField({
                id: 'custpage_bom_item_description',
                type: serverWidget.FieldType.TEXTAREA,
                label: 'BOM Description',
            });

            var purchaseOrder = bomSublist.addField({
                id: 'custpage_associated_po',
                type: serverWidget.FieldType.SELECT,
                label: 'Related Purchase Order',
                source: 'transaction'
            });
            var relatedKitItem = bomSublist.addField({
                id: 'custpage_related_kit_item',
                type: serverWidget.FieldType.SELECT,
                label: 'From Kit Item',
                source: 'kititem'
            });
            var itemType = bomSublist.addField({
                id: 'custpage_item_type',
                type: serverWidget.FieldType.TEXT,
                label: 'Item Type'
            });

            bomItem.isMandatory = true;
            bomQty.isMandatory = true;

            bomId.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
            itemDescription.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.DISABLED
            });
            purchaseOrder.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.DISABLED
            });
            relatedKitItem.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.DISABLED
            });
            var recType = 'BOM';
            if (soId) {
                var salesOrder = record.load({
                    type: record.Type.SALES_ORDER,
                    id: soId,
                    isDynamic: true
                });
                var bomItems = getSublistValues(projectId, salesOrder, recType);
                if (bomItems.length > 0) {
                    for (var b = 0; b < bomItems.length; b++) {
                        var bomObj = {
                            bomItem: bomItems[b].bomItem,
                            bomQty: bomItems[b].bomQty,
                            purchaseOrder: bomItems[b].purchaseOrder,
                            description: bomItems[b].description,
                            bomId: bomItems[b].bomId,
                            itemObj: bomItem,
                            itemQtyObj: bomQty,
                            kitItemId: bomItems[b].kitItemId
                        };
                        setCustomSublistValues(bomSublist, b, bomObj, recType);
                    }
                }
            }
        }

        /**
         * @param scriptContext {NS Script Context from entry point} - creates adder sublist and inserts to project form sublist
         * @param  config {NS BB SS configuration record loaded}
         * @return void {void}
         */
        function createAdderSublist(scriptContext, config) {
            var recType = 'ADDER';
            var projectId = scriptContext.newRecord.id;
            var projectForm = scriptContext.form;


            var adderSubTab = projectForm.addTab({
                id: 'custpage_adder_sub_tab',
                label: 'Project Adder',
            });
            var projectTabs = projectForm.getTabs();

            projectForm.insertTab({
                tab: adderSubTab,
                nexttab: 's_relation' //s_relation custpage_bom_sub_tab
            });
            var adderSublist = projectForm.addSublist({
                id: 'custpage_adder_item_list',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'Adder Items',
                tab: 'custpage_adder_sub_tab'
            });
            var adderItem = adderSublist.addField({
                id: 'custpage_adder_item',
                type: serverWidget.FieldType.SELECT,
                label: 'Adder Item',
            });
            adderItem.addSelectOption({
                value: '',
                text: ''
            });
            adderItemSelection(adderItem);
            var adderResponsiblity = adderSublist.addField({
                id: 'custpage_adder_responsibility',
                type: serverWidget.FieldType.SELECT,
                label: 'Adder Responsibility',
                source: 'customlist_bb_adder_responsibility'
            });
            var adderPricingMethod = adderSublist.addField({
                id: 'custpage_adder_pricing_method',
                type: serverWidget.FieldType.SELECT,
                label: 'Adder Pricing Method',
                source: 'customlist_bb_adder_pricing_method'
            });
            var adderFixedPrice = adderSublist.addField({
                id: 'custpage_adder_fixed_price',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Adder Fixed Price'
            });
            var adderQty = adderSublist.addField({ // default value = 1
                id: 'custpage_adder_qty',
                type: serverWidget.FieldType.INTEGER,
                label: 'Adder Quantity'
            });
            adderQty.defaultValue = 1;
            var adderCostAmount = adderSublist.addField({
                id: 'custpage_adder_cost_amount',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Adder Cost Amount'
            });
            adderCostAmount.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            var adderTotalAmount = adderSublist.addField({
                id: 'custpage_adder_total_amount',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Adder Total Amount'
            });
            var adderId = adderSublist.addField({
                id: 'custpage_adder_id',
                type: serverWidget.FieldType.INTEGER,
                label: 'Adder Internal ID'
            });
            adderId.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });

            var displayPricing = config.getValue({
                fieldId: 'custrecord_bb_display_adder_pricing'
            });

            var currentUser = runtime.getCurrentUser();
            var currentRoleId = currentUser.role;
            log.debug('current user role', currentRoleId);
            var hideRoles = config.getValue({fieldId: 'custrecord_bb_display_adder_pricing'});
            var displayPricing = hidePricing(hideRoles, currentRoleId);

            if (!displayPricing) {
                adderFixedPrice.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });

                adderTotalAmount.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
            }

            adderItem.isMandatory = true;
            var adderItems = getSublistValues(projectId, null, recType);
            if (adderItems.length > 0) {
                for (var a = 0; a < adderItems.length; a++) {
                    var adderObj = {
                        adderItem: adderItems[a].adderItemId,
                        responsibility: adderItems[a].adderResponse,
                        method: adderItems[a].adderMethod,
                        fixedPrice: adderItems[a].adderFixPrice,
                        qty: adderItems[a].adderQty,
                        costAmt: adderItems[a].costAmt,
                        totalAmt: adderItems[a].totalAmt,
                        internalId: adderItems[a].id
                    };
                    setCustomSublistValues(adderSublist, a, adderObj, recType);
                }
            }
            return adderSublist;
        }

        /**
         * @param  scriptContext{NS Script Context Entry Point} creates expense sublist and inserts to project form sublist
         * @param  config {NS BB SS configuration record loaded}
         * @return void {void}
         */
        function createExpenseSublist(scriptContext, config) {
            var recType = 'EXPENSE';
            var projectId = scriptContext.newRecord.id;
            var projectForm = scriptContext.form;


            var expenseSubTab = projectForm.addTab({
                id: 'custpage_expense_sub_tab',
                label: 'Project Expense',
            });
            var projectTabs = projectForm.getTabs();

            projectForm.insertTab({
                tab: expenseSubTab,
                nexttab: 's_relation' //s_relation custpage_bom_sub_tab
            });
            var expenseSublist = projectForm.addSublist({
                id: 'custpage_expense_item_list',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'Expense Items',
                tab: 'custpage_expense_sub_tab'
            });
            var expenseItem = expenseSublist.addField({
                id: 'custpage_expense_item',
                type: serverWidget.FieldType.SELECT,
                label: 'Expense Item',
            });
            expenseItem.addSelectOption({
                value: '',
                text: ''
            });
            expenseItemSelection(expenseItem);
            var expenseAmount = expenseSublist.addField({
                id: 'custpage_expense_amount',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Expense Amount'
            });
            var expenseDescription = expenseSublist.addField({
                id: 'custpage_expense_desc',
                type: serverWidget.FieldType.TEXT,
                label: 'Expense Description'
            });
            var expenseId = expenseSublist.addField({
                id: 'custpage_expense_id',
                type: serverWidget.FieldType.INTEGER,
                label: 'Expense Internal ID'
            });
            expenseId.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });

            expenseItem.isMandatory = true;
            var expenseItems = getSublistValues(projectId, null, recType);
            if (expenseItems.length > 0) {
                for (var a = 0; a < expenseItems.length; a++) {
                    var expenseObj = {
                        expenseItem: expenseItems[a].expenseItemId,
                        amount: expenseItems[a].amount,
                        description: expenseItems[a].description,
                        internalId: expenseItems[a].id
                    };
                    setCustomSublistValues(expenseSublist, a, expenseObj, recType);
                }
            }
            return expenseSublist;
        }


        /**
         * @param  adderItem {[NS Adder Item Field Object Context from Server Widget]} - gets adder select options for suitelet field for adder item
         * @return adderItemId {[NS Adder Item Field Object Context from Server Widget]}
         */
        function adderItemSelection(adderItem) {

            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["custitem_bb_item_category","anyof","2"],
                        "AND",
                        ["isinactive","is","F"]
                    ],
                columns:
                    [
                        "internalid",
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.ASC
                        }),
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
                if (adderItem) {
                    adderItem.addSelectOption({
                        value: internalId,
                        text: itemId
                    });
                }
                return true;
            });
            if (adderItem) {
                return adderItem
            }

        }

        /**
         * @param  bomItem {[NS BOM Item Field Object Context from Server Widget]} - gets BOM select options for suitelet field for BOM item
         * @return bomItem {[NS BOM Item Field Object Context from Server Widget]}
         */
        function bomItemSelection(bomItem) {
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["type","anyof","Kit","InvtPart"],
                        "AND",
                        ["isinactive","is","F"]
                    ],
                columns:
                    [
                        "internalid",
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.ASC
                        })
                    ]
            });
            // var searchResultCount = itemSearchObj.runPaged().count;
            // log.debug("itemSearchObj result count",searchResultCount);
            var pages = itemSearchObj.runPaged();
            pages.pageRanges.forEach(function(pageRange) {
                var page = pages.fetch(pageRange);
                page.data.forEach(function(result) {
                    var id = result.getValue({
                        name: 'internalid'
                    });
                    var text = result.getValue({
                        name: 'itemid'
                    });
                    if (bomItem) {
                        bomItem.addSelectOption({
                            value: id,
                            text: text
                        });
                    }
                });
            });

            if (bomItem) {
                return bomItem;
            }
        }


        /**
         * @param  expenseItem {[NS Expense Item Field Object Context from Server Widget]} - gets Expense select options for suitelet field for Expense item
         * @return expenseItem {[NS Expense Item Field Object Context from Server Widget]}
         */
        function expenseItemSelection(expenseItem) {
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["type","anyof","NonInvtPart"],
                        "AND",
                        ["subtype","anyof","Sale","Resale"],
                        "AND",
                        ["isinactive","is","F"]
                    ],
                columns:
                    [
                        "internalid",
                        "itemid"
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
                if (expenseItem) {
                    expenseItem.addSelectOption({
                        value: internalId,
                        text: itemId
                    });
                }
                return true;
            });
            if (expenseItem) {
                return expenseItem
            }

        }

        /**
         * @param projectId {[integer || string]} - '123456' || 123456 - gets array of objects of all record type by project
         * @param salesOrder {[NS Record Object]} - NS Sales Order Object Loaded
         * @param recType {[string]} - EXAMPLE - 'BOM', 'ADDER', 'EXPENSE'
         * @return array of objects {[array]}
         */
        function getSublistValues(projectId, salesOrder, recType) {
            var bomItemArr = [];
            var adderItemArr = [];
            var expenseItemArr = [];
            if (recType == 'BOM' || recType == 'BOM_SUITELET') {

                var isFromSuiteLet = recType == 'BOM_SUITELET' ? true : false;
                var customrecord_bb_project_bomSearchObj = search.create({
                    type: "customrecord_bb_project_bom",
                    filters:
                        [
                            ["custrecord_bb_project_bom_project.internalid","anyof",projectId],
                            "AND",
                            ["isinactive","is","F"]
                        ],
                    columns:
                        [
                            "custrecord_bb_project_bom_item",
                            "custrecord_bb_project_bom_quantity",
                            search.createColumn({
                                name: "internalid",
                                sort: search.Sort.ASC
                            }),
                            "custrecord_bb_ss_bom_item_description",
                            "custrecord_bb_proj_bom_related_kit_item",
                            search.createColumn({
                                name: "type",
                                join: "CUSTRECORD_BB_PROJECT_BOM_ITEM"
                            })

                        ]
                });

                var searchResultCount = customrecord_bb_project_bomSearchObj.runPaged().count;
                log.debug("customrecord_bb_project_bomSearchObj result count",searchResultCount);
                customrecord_bb_project_bomSearchObj.run().each(function(result){
                    var bomItem = parseInt(result.getValue({
                        name: 'custrecord_bb_project_bom_item'
                    }));
                    var bomName = result.getText({
                        name: 'custrecord_bb_project_bom_item'
                    });
                    var bomQty = result.getValue({
                        name: 'custrecord_bb_project_bom_quantity'
                    });
                    var bomId = parseInt(result.getValue({
                        name: 'internalid'
                    }));
                    var bomDescription = result.getValue({
                        name: 'custrecord_bb_ss_bom_item_description'
                    });

                    var itemType = result.getValue({
                        name: 'type',
                        join: 'CUSTRECORD_BB_PROJECT_BOM_ITEM'
                    });

                    var kitItemId = result.getValue({
                        name: 'custrecord_bb_proj_bom_related_kit_item'
                    });
                    var poId = null;
                    var poName = null;
                    if (salesOrder) {
                        var purchaseOrder = getRelatedPurchaseOrder(bomId, salesOrder);
                        var poId = '';
                        var poName = '';
                        if (purchaseOrder) {
                            poId = purchaseOrder.purchaseOrder;
                            poName = purchaseOrder.purchaseOrderName;
                        }
                    }
                    if (bomItem) {
                        bomItemArr.push({
                            bomItem: bomItem,
                            bomName: bomName,
                            bomQty: bomQty,
                            bomId: bomId,
                            purchaseOrder: poId,
                            description: bomDescription,
                            kitItemId: kitItemId,
                            purchaseOrderName: poName,
                            itemType: itemType
                        });
                    }
                    return true;
                });
                if (isFromSuiteLet) {
                    var objItemsToSearch = [];
                    for (var i = 0; i < bomItemArr.length; i++) {
                        objItemsToSearch.push(bomItemArr[i].bomItem);
                    }
                    if(objItemsToSearch.length > 0) {
                        var objDynamicColumns = search.load({
                            id: DYNAMIC_COLUMNS_SEARCH
                        }).columns;
                        var objItemsSearch = search.create({
                            type: search.Type.ITEM,
                            columns: objDynamicColumns,
                            filters: [{
                                name: 'internalid',
                                operator: 'anyof',
                                values: objItemsToSearch
                            }]
                        });
                        objItemsSearch.run().each(function(result){
                            var itemPos;
                            for (var i = 0; i < bomItemArr.length; i++) {
                                if (result.id == bomItemArr[i].bomItem) {
                                    itemPos = i;
                                }
                            }
                            for (var i = 0; i < objDynamicColumns.length; i++) {
                                if (result && result.columns && result.columns[i]) {
                                    if (result.getText({ name: result.columns[i] })) {
                                        bomItemArr[itemPos]['custpage_dynamic_columns_' + i] = result.getText({
                                            name: result.columns[i]
                                        });
                                    } else {
                                        bomItemArr[itemPos]['custpage_dynamic_columns_' + i] = result.getValue({
                                            name: result.columns[i]
                                        });
                                    }
                                } else {
                                    log.audit('ERROR:', 'Error while trying to set a dynamic column in the SuiteLet, please review if all of them are correctly set in the saved search.');
                                    throw 'Error with a dynamic column.'
                                }
                            }
                            return true;
                        });
                    }
                }
                return bomItemArr;
            } else if (recType == 'ADDER') {
                var adderRecordSearch = search.create({
                    type: "customrecord_bb_project_adder",
                    filters:
                        [
                            ["custrecord_bb_project_adder_project","anyof",projectId],
                            "AND",
                            ["isinactive","is","F"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "internalid",
                                sort: search.Sort.ASC
                            }),
                            "custrecord_bb_adder_item",
                            "custrecord_bb_adder_responsibility",
                            "custrecord_bb_adder_pricing_method",
                            "custrecord_bb_adder_price_amt",
                            "custrecord_bb_quantity",
                            "custrecord_bb_adder_cost_amount",
                            "custrecord_bb_adder_total_amount",
                            "custrecord_bb_note_description"
                        ]
                });
                adderRecordSearch.run().each(function(result){
                    var adderItemId =  result.getValue({
                        name: 'custrecord_bb_adder_item'
                    });
                    var adderResponse = result.getValue({
                        name: 'custrecord_bb_adder_responsibility'
                    });
                    var adderMethod = result.getValue({
                        name: 'custrecord_bb_adder_pricing_method'
                    });
                    var adderFixPrice = result.getValue({
                        name: 'custrecord_bb_adder_price_amt'
                    });
                    var adderQty = result.getValue({
                        name: 'custrecord_bb_quantity'
                    });
                    var costAmt =  result.getValue({
                        name: 'custrecord_bb_adder_cost_amount'
                    });
                    var totalAmt = result.getValue({
                        name: 'custrecord_bb_adder_total_amount'
                    });
                    var notes = result.getValue({
                        name: 'custrecord_bb_note_description'
                    });
                    var id =  result.getValue({
                        name: 'internalid'
                    });
                    adderItemArr.push({
                        adderItemId: adderItemId,
                        adderResponse: adderResponse,
                        adderMethod: adderMethod,
                        adderFixPrice: adderFixPrice,
                        adderQty: adderQty,
                        costAmt: costAmt,
                        totalAmt: totalAmt,
                        notes: notes,
                        id: id
                    });
                    return true;
                });
                return adderItemArr;
            } else {
                var expenseRecordSearch = search.create({
                    type: "customrecord_bb_project_expense",
                    filters:
                        [
                            ["custrecord_bb_proj_exp_project","anyof",projectId],
                            "AND",
                            ["isinactive","is","F"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "internalid",
                                sort: search.Sort.ASC
                            }),
                            "custrecord_bb_proj_exp_item",
                            "custrecord_bb_proj_exp_amount",
                            "custrecord_bb_proj_exp_item_desc"
                        ]
                });
                expenseRecordSearch.run().each(function(result){
                    var expenseItemId =  result.getValue({
                        name: 'custrecord_bb_proj_exp_item'
                    });
                    var amount = result.getValue({
                        name: 'custrecord_bb_proj_exp_amount'
                    });
                    var description = result.getValue({
                        name: 'custrecord_bb_proj_exp_item_desc'
                    });
                    var id =  result.getValue({
                        name: 'internalid'
                    });
                    expenseItemArr.push({
                        expenseItemId: expenseItemId,
                        description: description,
                        amount: amount,
                        id: id
                    });
                    return true;
                });
                return expenseItemArr;
            }

        }

        /**
         * @param  bomId {[integer]}
         * @param  salesOrder {[NS Record Object Loaded]}
         * @return object {[object]} - returns purchase order id and name in object matched to bom line on sales order
         */
        function getRelatedPurchaseOrder(bomId, salesOrder) {
            var lineId = salesOrder.findSublistLineWithValue({
                sublistId: 'item',
                fieldId: 'custcol_bb_adder_bom_id',
                value: bomId
            });
            if (lineId != -1) {
                salesOrder.selectLine({
                    sublistId: 'item',
                    line: lineId
                });
                var purchaseOrder = salesOrder.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_bb_purchase_order_id'
                });
                var purchaseOrderName = salesOrder.getCurrentSublistText({
                    sublistId: 'item',
                    fieldId: 'custcol_bb_purchase_order_id'
                });
                if (purchaseOrder) {
                    // return purchaseOrder;
                    return {
                        purchaseOrder: purchaseOrder,
                        purchaseOrderName: purchaseOrderName
                    };
                }
            }
        }

        /**
         * @param sublist {[NS server widget sublist object]}
         * @param lineNum {[integer]}
         * @param obj {[obj]} - record type object returned from search array
         * @param recType {[string]} - EXAMPLE - 'BOM', 'ADDER', 'EXPENSE'
         */
        function setCustomSublistValues(sublist, lineNum, obj, recType) {
            if (recType == 'BOM' || recType == 'BOM_SUITELET') {
                var isFromSuiteLet = recType == 'BOM_SUITELET' ? true : false;
                var item = sublist.setSublistValue({
                    id: 'custpage_bom_item',
                    line: lineNum,
                    value: obj.bomItem
                });
                if (obj.description) {
                    sublist.setSublistValue({
                        id: 'custpage_bom_item_description',
                        line: lineNum,
                        value: obj.description
                    });
                }

                sublist.setSublistValue({
                    id: 'custpage_bom_id',
                    line: lineNum,
                    value: parseInt(obj.bomId).toFixed(0)
                });

                var qty = sublist.setSublistValue({
                    id: 'custpage_bom_quantity',
                    line: lineNum,
                    value: obj.bomQty
                });
                if (obj.itemType) {
                    sublist.setSublistValue({
                        id: 'custpage_item_type',
                        line: lineNum,
                        value: obj.itemType
                    });
                }

                if (obj.purchaseOrder) {
                    sublist.setSublistValue({
                        id: 'custpage_associated_po',
                        line: lineNum,
                        value: obj.purchaseOrder
                    });

                }
                if (obj.kitItemId) {
                    sublist.setSublistValue({
                        id: 'custpage_related_kit_item',
                        line: lineNum,
                        value: obj.kitItemId
                    });
                }

                if (isFromSuiteLet) {
                    var objDynamicColumns = search.load({
                        id: DYNAMIC_COLUMNS_SEARCH
                    }).columns;
                    for (var i = 0; i < objDynamicColumns.length; i++) {
                        if (obj['custpage_dynamic_columns_' + i]) {
                            sublist.setSublistValue({
                                id: 'custpage_dynamic_columns_' + i,
                                line: lineNum,
                                value: obj['custpage_dynamic_columns_' + i]
                            });
                        }
                    }
                }
            } else if (recType == 'ADDER') {
                sublist.setSublistValue({
                    id: 'custpage_adder_item',
                    line: lineNum,
                    value: obj.adderItem
                });
                if (obj.responsibility) {
                    sublist.setSublistValue({
                        id: 'custpage_adder_responsibility',
                        line: lineNum,
                        value: obj.responsibility
                    });
                }
                if (obj.method) {
                    sublist.setSublistValue({
                        id: 'custpage_adder_pricing_method',
                        line: lineNum,
                        value: obj.method
                    });
                }
                if (obj.fixedPrice) {

                    sublist.setSublistValue({
                        id: 'custpage_adder_fixed_price',
                        line: lineNum,
                        value: obj.fixedPrice
                    });
                }
                sublist.setSublistValue({
                    id: 'custpage_adder_cost_amount',
                    line: lineNum,
                    value: obj.costAmt ? obj.costAmt : 0
                });
                if (obj.totalAmt) {
                    sublist.setSublistValue({
                        id: 'custpage_adder_total_amount',
                        line: lineNum,
                        value: obj.totalAmt
                    });
                }
                if (obj.qty) {
                    sublist.setSublistValue({
                        id: 'custpage_adder_qty',
                        line: lineNum,
                        value: obj.qty
                    });
                }
                if (obj.notes) {
                    sublist.setSublistValue({
                        id: 'custpage_adder_notes',
                        line: lineNum,
                        value: obj.notes
                    });
                }
                sublist.setSublistValue({
                    id: 'custpage_adder_id',
                    line: lineNum,
                    value: obj.internalId
                });
            } else {
                sublist.setSublistValue({
                    id: 'custpage_expense_item',
                    line: lineNum,
                    value: obj.expenseItem
                });
                sublist.setSublistValue({
                    id: 'custpage_expense_amount',
                    line: lineNum,
                    value: obj.amount ? obj.amount : 0
                });
                if (obj.description) {
                    sublist.setSublistValue({
                        id: 'custpage_expense_desc',
                        line: lineNum,
                        value: obj.description
                    });
                }
                sublist.setSublistValue({
                    id: 'custpage_expense_id',
                    line: lineNum,
                    value: obj.internalId
                });
            }

        }


        /**
         * @param  project {[NS Record Object loaded]}
         * @param  scriptContext {[NS Record Context From Entry Point]}
         * @param  changedFields {[object]} - object of field values passed to append value for project save
         * @param  solarSalesItems {[object]} - object of sales items used for config sales order updates, add lines specific to configuration record.
         * @return salesorderId {[type]} - returns salesorder id
         */
        function upsertBomItemLines(project, scriptContext, changedFields, solarSalesItems) {
            var trigger = scriptContext.type;
            switch (trigger) {
                case 'edit':
                case 'xedit':
                    var recType = 'BOM';
                    var sublistItemIdArr = [];
                    var bomItemList = scriptContext.newRecord.getLineCount({
                        sublistId: 'custpage_bom_item_list'
                    });
                    var soId = project.getValue({
                        fieldId: 'custentity_bb_project_so'
                    });
                    var projectType = project.getText({
                        fieldId: 'jobtype'
                    });
                    if (projectType == 'EPC') {
                        var epcRole = project.getText({
                            fieldId: 'custentity_bb_epc_role'
                        });
                    }
                    if (epcRole != 'Originator') {
                        var bomRecord = scriptContext.newRecord;
                        if (bomItemList >= 0) {
                            var salesOrder = upsertSalesOrder.getSalesOrder(project, scriptContext);
                            if(!salesOrder){
                                soCreated = true;
                                salesOrder = upsertSalesOrder.createSalesOrderHeader(project, scriptContext, solarSalesItems);
                            } else {
                                salesOrder = upsertSalesOrder.updateSalesOrderHeader(project, salesOrder, scriptContext, solarSalesItems);
                            }

                            for (var i = 0; i < bomItemList; i++) {
                                var bomId = bomRecord.getSublistValue({
                                    sublistId: 'custpage_bom_item_list',
                                    fieldId: 'custpage_bom_id',
                                    line: i
                                });
                                var poId = bomRecord.getSublistValue({
                                    sublistId: 'custpage_bom_item_list',
                                    fieldId: 'custpage_associated_po',
                                    line: i
                                });
                                var bomItem = bomRecord.getSublistValue({
                                    sublistId: 'custpage_bom_item_list',
                                    fieldId: 'custpage_bom_item',
                                    line: i
                                });
                                var bomQty = bomRecord.getSublistValue({
                                    sublistId: 'custpage_bom_item_list',
                                    fieldId: 'custpage_bom_quantity',
                                    line: i
                                });

                                var itemTypeObj = search.lookupFields({ // 5 units per lookup
                                    type: search.Type.ITEM,
                                    id: bomItem,
                                    columns: ['type']
                                });
                                var itemType = itemTypeObj.type[0].value;

                                log.debug('item type from Sublist', itemType);

                                if (itemType == 'Kit') {
                                    // get item id of kit and/or kit item name for setting value on line item
                                    // run search on item and get member items, then set all items from loop with qty using
                                    var kitItemArr = getKitItems(bomItem);
                                    if (kitItemArr.length > 0) {
                                        for (x in kitItemArr) {
                                            var kitItemId = kitItemArr[x].kitItemId;
                                            var subItemId = kitItemArr[x].memberItemId;
                                            var subItemQty = (bomQty > 1) ? kitItemArr[x].memberQty * bomQty : kitItemArr[x].memberQty;
                                            var bomId = createBomRecord(subItemId, subItemQty, kitItemId, project.id);
                                            addSalesOrderLine(salesOrder, bomId, subItemId, subItemQty, null, null, null, null, location, config);
                                            sublistItemIdArr.push({
                                                id: bomId,
                                                itemId: subItemId,
                                                recType: 'BOM'
                                            });
                                        }// end of kit sub item loop
                                    }
                                } else {
                                    if (bomId && !poId) {
                                        //update sales order line, update bom item
                                        updateBomRecord(bomItem, bomQty, bomId);
                                        updateSalesOrderLine(salesOrder, bomId, bomItem, bomQty, null, null, null, null, location, config);
                                        sublistItemIdArr.push({
                                            id: bomId,
                                            itemId: bomItem,
                                            recType: 'BOM'
                                        });
                                    } else if (!bomId && !poId) {
                                        //create bom record and set sales order line item
                                        var bomId = createBomRecord(bomItem, bomQty, null, project.id);
                                        addSalesOrderLine(salesOrder, bomId, bomItem, bomQty, null, null, null, null, location, config);
                                        sublistItemIdArr.push({
                                            id: bomId,
                                            itemId: bomItem,
                                            recType: 'BOM'
                                        });
                                    } else {
                                        sublistItemIdArr.push({
                                            id: bomId,
                                            itemId: bomItem,
                                            recType: 'BOM'
                                        });
                                    }
                                }
                            } // end of loop

                            upsertSalesOrder.upsertShippingItem(project, salesOrder, solarSalesItems);

                            //var soBomAdderItemArr = getSalesOrderBomAdderIds(salesOrder, recType);

                            var bomRecordArr = getProjectBOMRecords(project);
                            removeRecordCheck(salesOrder, sublistItemIdArr, bomRecordArr);

                            var soLineCheck = salesOrder.getLineCount({
                                sublistId: 'item'
                            });

                            if (soLineCheck > 0) {
                                var salesOrderId = salesOrder.save({
                                    ignoreMandatoryFields: true
                                });
                            } else {
                                if (salesOrder.id) {
                                    record.delete({
                                        type: record.Type.SALES_ORDER,
                                        id: salesOrder.id
                                    });
                                }
                            }


                            var invItemsPrices = upsertSalesOrder.getShippingPrice(salesOrder); //Inventory Item price -  no governance cost
                            var shippingAmt = upsertSalesOrder.getShippingItemAmount(salesOrder); // retrieves shipping amount -  no governance cost
                            var taxObj = upsertSalesOrder.getSalesTaxDetails(project.id); // (taxObj) ? taxObj.amount : 0.00,
                            log.debug('tax object', taxObj);

                            var _taxChanges = {
                                'custentity_bb_sales_tax_amount': (taxObj) ? taxObj.amount : null,
                                'custentity_bb_ss_sales_tax_account': (taxObj) ? taxObj.account : null,
                                'custentity_bb_inventory_amount': (invItemsPrices) ? invItemsPrices : 0.00,
                                'custentity_bb_shipping_amount': (shippingAmt) ? shippingAmt : 0.00,
                                'custentity_bb_project_so': (salesOrderId) ? salesOrderId : null
                            };
                            if(changedFields) {
                                for(var prop in _taxChanges){
                                    if(_taxChanges.hasOwnProperty(prop)){
                                        changedFields[prop] = _taxChanges[prop];
                                    }
                                }
                            } else {
                                record.submitFields({
                                    type: record.Type.JOB,
                                    id: project.id,
                                    values: _taxChanges,
                                    options: {
                                        ignoreMandatoryFields: true
                                    }
                                });
                            }
                        }
                    }
                    return salesOrderId;

                    break;
            }

        }

        /**
         * @param  project {[NS Record Object loaded]}
         * @param  scriptContext {[NS Record Context From Entry Point]}
         * @param  solarSalesItems {[object]} - object of sales items used for config sales order updates, add lines specific to configuration record.
         * @param  salesorderId {[integer]}
         * @param  changedFields {[object]} - object of field values passed to append value for project save
         * @return salesorderId {[type]} - returns salesorder id
         */
        function upsertAdderItems(project, scriptContext, solarSalesItems, salesOrderId, changedFields) {
            var trigger = scriptContext.type;
            switch (trigger) {
                case 'edit':
                case 'xedit':
                    var recType = 'ADDER';
                    var sublistItemIdArr = [];
                    var adderItemList = scriptContext.newRecord.getLineCount({
                        sublistId: 'custpage_adder_item_list'
                    });
                    var soId = project.getValue({
                        fieldId: 'custentity_bb_project_so'
                    });
                    var projectType = project.getText({
                        fieldId: 'jobtype'
                    });
                    if (projectType == 'EPC') {
                        var epcRole = project.getText({
                            fieldId: 'custentity_bb_epc_role'
                        });
                    }
                    if (epcRole != 'Originator') {
                        var adderRecord = scriptContext.newRecord;
                        if (adderItemList >= 0) {
                            var salesOrder = upsertSalesOrder.getSalesOrder(project, scriptContext, salesOrderId);
                            if(!salesOrder){
                                soCreated = true;
                                salesOrder = upsertSalesOrder.createSalesOrderHeader(project, scriptContext, solarSalesItems);
                            }
                            for (var i = 0; i < adderItemList; i++) {
                                var adderLineItemId = adderRecord.getSublistValue({
                                    sublistId: 'custpage_adder_item_list',
                                    fieldId: 'custpage_adder_item',
                                    line: i
                                });
                                var adderLineResponsibility = adderRecord.getSublistValue({
                                    sublistId: 'custpage_adder_item_list',
                                    fieldId: 'custpage_adder_responsibility',
                                    line: i
                                });
                                var adderLinePriceMethod = adderRecord.getSublistValue({
                                    sublistId: 'custpage_adder_item_list',
                                    fieldId: 'custpage_adder_pricing_method',
                                    line: i
                                });
                                var adderLineFixedPrice = adderRecord.getSublistValue({
                                    sublistId: 'custpage_adder_item_list',
                                    fieldId: 'custpage_adder_fixed_price',
                                    line: i
                                });
                                var adderLineQty = adderRecord.getSublistValue({
                                    sublistId: 'custpage_adder_item_list',
                                    fieldId: 'custpage_adder_qty',
                                    line: i
                                });
                                var adderLineCostAmt = adderRecord.getSublistValue({
                                    sublistId: 'custpage_adder_item_list',
                                    fieldId: 'custpage_adder_cost_amount',
                                    line: i
                                });
                                var adderLineTotalAmt = adderRecord.getSublistValue({
                                    sublistId: 'custpage_adder_item_list',
                                    fieldId: 'custpage_adder_total_amount',
                                    line: i
                                });
                                var adderLineInternalId = adderRecord.getSublistValue({
                                    sublistId: 'custpage_adder_item_list',
                                    fieldId: 'custpage_adder_id',
                                    line: i
                                });
                                if (adderLineItemId && !adderLineInternalId) {
                                    var adderId = upsertAdderItemLine(adderLineItemId, adderLineResponsibility, adderLinePriceMethod, adderLineFixedPrice, adderLineQty,  adderLineCostAmt, adderLineTotalAmt, adderLineInternalId, project.id);
                                    addSalesOrderLine(salesOrder, adderId, adderLineItemId, adderLineQty, adderLineCostAmt, adderLinePriceMethod, adderLineFixedPrice, null, location, config);
                                    sublistItemIdArr.push({
                                        id: adderId,
                                        itemId: adderLineItemId,
                                        recType: 'ADDER'
                                    });
                                } else if (adderLineItemId && adderLineInternalId) {
                                    var adderId = upsertAdderItemLine(adderLineItemId, adderLineResponsibility, adderLinePriceMethod, adderLineFixedPrice, adderLineQty, adderLineCostAmt, adderLineTotalAmt, adderLineInternalId, project.id);
                                    updateSalesOrderLine(salesOrder, adderId, adderLineItemId, adderLineQty, adderLineCostAmt, adderLinePriceMethod, adderLineFixedPrice, null, location, config);
                                    sublistItemIdArr.push({
                                        id: adderId,
                                        itemId: adderLineItemId,
                                        recType: 'ADDER'
                                    });
                                } else {
                                    sublistItemIdArr.push({
                                        id: adderLineInternalId,
                                        itemId: adderLineItemId,
                                        recType: 'ADDER'
                                    });
                                }
                            }// end of loop
                            upsertSalesOrder.upsertOriginatorItem(project, salesOrder, solarSalesItems);

                            //var soBomAdderItemArr = getSalesOrderBomAdderIds(salesOrder, recType); // array of values from sales order bom adder ids
                            var adderRecordArr = getProjectAdderRecords(project.id);
                            removeRecordCheck(salesOrder, sublistItemIdArr, adderRecordArr);

                            var soLineCheck = salesOrder.getLineCount({
                                sublistId: 'item'
                            });

                            if (soLineCheck > 0) {
                                var salesOrderId = salesOrder.save({
                                    ignoreMandatoryFields: true
                                });
                            } else {
                                if (salesOrder.id) {
                                    record.delete({
                                        type: record.Type.SALES_ORDER,
                                        id: salesOrder.id
                                    });
                                }
                            }

                            //accountingFields.setAccountingFields(project, false);

                            var _updateProject = {
                                'custentity_bb_contract_value_hist_html': contractHistory.contractHistory(project),
                                'custentity_bb_project_so': salesOrderId
                            };
                            if(changedFields){
                                for(var prop in _updateProject){
                                    if(_updateProject.hasOwnProperty(prop)){
                                        changedFields[prop] = _updateProject[prop];
                                    }
                                }
                            } else {
                                record.submitFields({
                                    type: record.Type.JOB,
                                    id: project.id,
                                    values: _updateProject,
                                    options: {ignoreMandatoryFields: true}
                                });
                            }

                        }
                    }

                    break;
            }

        }


        /**
         * @param  salesOrder {[NS Record Object Loaded]} - checks values between arrays and removes sales order line and deletes record
         * @param  sublistItemIdArr {[array]} array of objects containing value passed from sublist values
         * @param  soBomAdderItemArr {[array]} current values from sales order line values as an array of objects
         * @return void {[void]}
         */
        function removeRecordCheck(salesOrder, sublistItemIdArr, soBomAdderItemArr) {
            var removeItems = [];
            if (soBomAdderItemArr.length > 0) {
                for (var r = 0; r < soBomAdderItemArr.length; r++) {
                    var itemId = soBomAdderItemArr[r].itemId;
                    var soAddBomId = soBomAdderItemArr[r].bomAdderId;
                    var recordType = soBomAdderItemArr[r].recType;
                    var matchingId = matchingBomAdderId(sublistItemIdArr, itemId, soAddBomId);
                    if (!matchingId) {
                        if (soAddBomId) {
                            var lineId = salesOrder.findSublistLineWithValue({
                                sublistId: 'item',
                                fieldId: 'custcol_bb_adder_bom_id',
                                value: parseInt(soAddBomId)
                            });
                            if (lineId != -1) {
                                log.debug('removing salesorder line')
                                salesOrder.removeLine({
                                    sublistId: 'item',
                                    line: lineId
                                });
                            }
                        }

                        if (soAddBomId) {
                            log.debug('deleting bom/adder record');
                            deleteBomAdderRecord(recordType, soAddBomId);
                        }


                    }// end of matching id check

                } // end of loop


            }

        }


        /**
         * @param  projectId {[integer]}
         * @return {[array]} returns an array of objects for adder records associated to a project
         */
        function getProjectAdderRecords(projectId) { // 10 units
            var adderRecords = [];
            var jobSearchObj = search.create({
                type: "job",
                filters:
                    [
                        ["internalid","is",projectId],
                        "AND",
                        ["CUSTRECORD_BB_PROJECT_ADDER_PROJECT.isinactive","is","F"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            join: "CUSTRECORD_BB_PROJECT_ADDER_PROJECT"
                        }),
                        search.createColumn({
                            name: "custrecord_bb_adder_item",
                            join: "CUSTRECORD_BB_PROJECT_ADDER_PROJECT"
                        })
                    ]
            });
            var searchResultCount = jobSearchObj.runPaged().count;
            log.debug("jobSearchObj result count",searchResultCount);
            jobSearchObj.run().each(function(result){
                adderRecords.push({
                    bomAdderId: parseInt(result.getValue({name: 'internalid', join: 'CUSTRECORD_BB_PROJECT_ADDER_PROJECT'})),
                    itemId:  parseInt(result.getValue({name: 'custrecord_bb_adder_item', join: 'CUSTRECORD_BB_PROJECT_ADDER_PROJECT'})),
                    recType: 'ADDER'
                });
                return true;
            });
            return adderRecords;

        }

        /**
         * @param  projectId {[integer]}
         * @return {[array]} returns an array of objects for BOM records associated to a project
         */
        function getProjectBOMRecords(project) { // 10 units
            var bomRecords = [];
            var jobSearchObj = search.create({
                type: "job",
                filters:
                    [
                        ["internalid","is",project.id],
                        "AND",
                        ["CUSTRECORD_BB_PROJECT_ADDER_PROJECT.isinactive","is","F"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            join: "CUSTRECORD_BB_PROJECT_BOM_PROJECT"
                        }),
                        search.createColumn({
                            name: "custrecord_bb_project_bom_item",
                            join: "CUSTRECORD_BB_PROJECT_BOM_PROJECT"
                        })
                    ]
            });
            var searchResultCount = jobSearchObj.runPaged().count;
            log.debug("jobSearchObj result count",searchResultCount);
            jobSearchObj.run().each(function(result){
                bomRecords.push({
                    bomAdderId: parseInt(result.getValue({name: 'internalid', join: 'CUSTRECORD_BB_PROJECT_BOM_PROJECT'})),
                    itemId: parseInt(result.getValue({name: 'custrecord_bb_project_bom_item', join: 'CUSTRECORD_BB_PROJECT_BOM_PROJECT'})),
                    recType: 'BOM'
                });
                return true;
            });
            return bomRecords;

        }

        /**
         * @param  projectId {[integer]}
         * @return {[array]} returns an array of objects for Expense records associated to a project
         */
        function getProjectExpenseRecords(project) { // 10 units
            var expRecords = [];
            var jobSearchObj = search.create({
                type: "job",
                filters:
                    [
                        ["internalid","is",project.id]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            join: "CUSTRECORD_BB_PROJ_EXP_PROJECT"
                        }),
                        search.createColumn({
                            name: "custrecord_bb_proj_exp_item",
                            join: "CUSTRECORD_BB_PROJ_EXP_PROJECT"
                        })
                    ]
            });
            var searchResultCount = jobSearchObj.runPaged().count;
            log.debug("jobSearchObj result count",searchResultCount);
            jobSearchObj.run().each(function(result){
                expRecords.push({
                    bomAdderId: result.getValue({name: 'internalid', join: 'CUSTRECORD_BB_PROJ_EXP_PROJECT'}),
                    itemId: result.getValue({name: 'custrecord_bb_proj_exp_item', join: 'CUSTRECORD_BB_PROJ_EXP_PROJECT'}),
                    recType: 'EXPENSE'
                });
                return true;
            });
            return expRecords;

        }


        /**
         * @param  sublistItemIdArr {[array]} array of objects containing sublist values
         * @param  itemId {[integer]}
         * @param  adderBomId {[integer]}
         * @return {[integer]} retuns record id from sublist
         */
        function matchingBomAdderId(sublistItemIdArr, itemId, adderBomId) {
            if (sublistItemIdArr.length > 0) {
                for (var t = 0; t < sublistItemIdArr.length; t++) {
                    var id = sublistItemIdArr[t].id;
                    var itemRecId = sublistItemIdArr[t].itemId;
                    if (itemRecId == itemId && id == adderBomId) {
                        return id;
                    }
                }
            }
        }

        /**
         * @param  recordType {[string]}
         * @param  id {[integer]}
         * @return void {[void]}
         */
        function deleteBomAdderRecord(recordType, id) { // 4 units per record when deleting
            if (recordType == 'BOM') {
                record.submitFields({
                    type: 'customrecord_bb_project_bom',
                    id: id,
                    values: {
                        'isinactive': true
                    },
                    options: {
                        ignoreMandatoryFields: true
                    }
                });
            } else if(recordType == 'ADDER') {
                record.submitFields({
                    type: 'customrecord_bb_project_adder',
                    id: id,
                    values: {
                        'isinactive': true
                    },
                    options: {
                        ignoreMandatoryFields: true
                    }
                });
            } else {
                record.submitFields({
                    type: 'customrecord_bb_project_expense',
                    id: id,
                    values: {
                        'isinactive': true
                    },
                    options: {
                        ignoreMandatoryFields: true
                    }
                });
            }
        }


        /**
         * @param  salesOrder {[NS Record Object Loaded]}
         * @param  recType {[stirng]}
         * @return {[array]} returns an array object objects based on bom adder record id from sales order
         */
        function getSalesOrderBomAdderIds(salesOrder, recType) {
            var bomAdderIdArr = [];
            var soLineCount = salesOrder.getLineCount({
                sublistId: 'item'
            });
            if (soLineCount > 0) {
                for (var z = 0; z < soLineCount; z++) {
                    var itemId = salesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: z
                    });
                    var bomAdderId = salesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_bb_adder_bom_id',
                        line: z
                    });
                    var itemType = salesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemtype',
                        line: z
                    });
                    if (recType == 'BOM') {
                        if (bomAdderId && itemType == 'InvtPart') {
                            bomAdderIdArr.push({
                                itemId: itemId,
                                bomAdderId: bomAdderId,
                                recType: 'BOM'
                            });
                        }
                    } else {
                        if (bomAdderId && itemType == 'NonInvtPart') {
                            bomAdderIdArr.push({
                                itemId: itemId,
                                bomAdderId: bomAdderId,
                                recType: recType
                            });
                        }
                    }

                }
            }
            return bomAdderIdArr;
        }


        /**
         * @param  bomItem {[integer]} - Item Record internal id
         * @param  bomQty {[integer]} - Bom Record quantity
         * @param  bomId {[integer]} - BOM Record internal id
         * @return {[type]}
         */
        function updateBomRecord(bomItem, bomQty, bomId) {
            var bomRec = record.load({
                type: 'customrecord_bb_project_bom',
                id: bomId,
                isDynamic: true
            });
            var item = parseFloat(bomItem)
            bomRec.setValue({
                fieldId: 'custrecord_bb_project_bom_item',
                value: item.toFixed(0)
            });
            bomRec.setValue({
                fieldId: 'custrecord_bb_project_bom_quantity',
                value: bomQty
            });
            bomRec.save({
                ignoreMandatoryFields: true
            });
        }

        /**
         * @param  bomItem {[integer]}
         * @param  bomQty {[integer]}
         * @param  kitItemId {[integer]}
         * @param  projectId {[integer]}
         * @return bom record internal id {[integer]}
         */
        function createBomRecord(bomItem, bomQty, kitItemId, projectId) { // 2 units custom record
            if (bomItem) {
                var bomRec = record.create({
                    type: 'customrecord_bb_project_bom',
                    isDynamic: true
                });
                bomRec.setValue({
                    fieldId: 'custrecord_bb_project_bom_item',
                    value: bomItem
                });
                bomRec.setValue({
                    fieldId: 'custrecord_bb_project_bom_project',
                    value: projectId
                });
                bomRec.setValue({
                    fieldId: 'custrecord_bb_project_bom_quantity',
                    value: bomQty
                });
                if (kitItemId){
                    bomRec.setValue({
                        fieldId: 'custrecord_bb_proj_bom_related_kit_item',
                        value: kitItemId
                    });
                }
                var id = bomRec.save({
                    ignoreMandatoryFields: true
                });
                return id;
            }

        }


        /**
         * @param  item {[integer]} NS Item Record internal id
         * @param  responsibility {[integer]} - responsibility list internal id value
         * @param  pricingMethod {[integer]} - pricing method list internal id value
         * @param  fixedPrice {[integer]} - fixed price list internal id value
         * @param  qty {[integer]} - adder record quantity
         * @param  costAmount {[float]} - cost amount value as a currency
         * @param  totalAmount {[float]} - adder record total amount as a currency
         * @param  internalId {[integer]} - adder record internal id
         * @param  projectId {[integer]} - project record internal id
         * @return adder record internal id {[integer]}
         */
        function upsertAdderItemLine(item, responsibility, pricingMethod, fixedPrice, qty, costAmount, totalAmount, internalId, projectId, notes) { // 2 units per custom record
            if (internalId) {
                var adderRec = record.load({
                    type: 'customrecord_bb_project_adder',
                    id: internalId,
                    isDynamic: true
                });
            } else {
                var adderRec = record.create({
                    type: 'customrecord_bb_project_adder',
                    isDynamic: true
                });
            }
            log.debug('itemid', item);
            if (item) {
                adderRec.setValue({
                    fieldId: 'custrecord_bb_adder_item',
                    value: item
                });
                adderRec.setValue({
                    fieldId: 'custrecord_bb_adder_responsibility',
                    value: responsibility
                });
                adderRec.setValue({
                    fieldId: 'custrecord_bb_adder_pricing_method',
                    value: pricingMethod
                });
                adderRec.setValue({
                    fieldId: 'custrecord_bb_adder_price_amt',
                    value: fixedPrice
                });
                adderRec.setValue({
                    fieldId: 'custrecord_bb_quantity',
                    value: qty
                }); //custrecord_bb_adder_cost_amount
                adderRec.setValue({
                    fieldId: 'custrecord_bb_adder_cost_amount',
                    value: costAmount
                });
                adderRec.setValue({
                    fieldId: 'custrecord_bb_adder_total_amount',
                    value: totalAmount
                });
                adderRec.setValue({
                    fieldId: 'custrecord_bb_project_adder_project',
                    value: projectId
                });
                if (notes) {
                    adderRec.setValue({
                        fieldId: 'custrecord_bb_note_description',
                        value: notes
                    });
                }
                var id = adderRec.save({
                    ignoreMandatoryFields: true
                });
                log.debug('adder updated or created', id);
                return id;
            }
        }


        /**
         * @param  project {[NS Record Object Loaded]}
         * @param  scriptContext {[NS Script Context Entry Point]}
         * @param  solarSalesItems {[object]} - object of BB SS sales order items
         * @param  salesOrderId {[integer]} - sales order internal id
         * @param  changedFields {[object]} object of field values used for project save
         * @return void {[void]}
         */
        function upsertExpenseItems(project, scriptContext, solarSalesItems, salesOrderId, changedFields) {
            var trigger = scriptContext.type;
            switch (trigger) {
                case 'edit':
                case 'xedit':
                    var recType = 'EXPENSE';
                    var sublistItemIdArr = [];
                    var expenseItemList = scriptContext.newRecord.getLineCount({
                        sublistId: 'custpage_expense_item_list'
                    });
                    var soId = project.getValue({
                        fieldId: 'custentity_bb_project_so'
                    });
                    var projectType = project.getText({
                        fieldId: 'jobtype'
                    });
                    if (projectType == 'EPC') {
                        var epcRole = project.getText({
                            fieldId: 'custentity_bb_epc_role'
                        });
                    }
                    if (epcRole != 'Originator') {
                        var expenseRecord = scriptContext.newRecord;
                        if (expenseItemList >= 0) {
                            var salesOrder = upsertSalesOrder.getSalesOrder(project, scriptContext, salesOrderId);
                            if(!salesOrder){
                                soCreated = true;
                                salesOrder = upsertSalesOrder.createSalesOrderHeader(project, scriptContext, solarSalesItems);
                            }
                            for (var i = 0; i < expenseItemList; i++) {
                                var expenseLineItemId = expenseRecord.getSublistValue({
                                    sublistId: 'custpage_expense_item_list',
                                    fieldId: 'custpage_expense_item',
                                    line: i
                                });
                                var expenseLineAmount = expenseRecord.getSublistValue({
                                    sublistId: 'custpage_expense_item_list',
                                    fieldId: 'custpage_expense_amount',
                                    line: i
                                });
                                var expenseLineDescription = expenseRecord.getSublistValue({
                                    sublistId: 'custpage_expense_item_list',
                                    fieldId: 'custpage_expense_desc',
                                    line: i
                                });
                                var expenseLineQty = 1; //  hard coded now, but here if we need to add this later
                                // var expenseLineTotalAmt = expenseRecord.getSublistValue({
                                //     sublistId: 'custpage_expense_item_list',
                                //     fieldId: 'custpage_expense_total_amount',
                                //     line: i
                                // });
                                var expenseLineInternalId = expenseRecord.getSublistValue({
                                    sublistId: 'custpage_expense_item_list',
                                    fieldId: 'custpage_expense_id',
                                    line: i
                                });
                                if (expenseLineItemId && !expenseLineInternalId) {
                                    var expenseId = upsertExpenseItemLine(expenseLineItemId, expenseLineAmount, expenseLineDescription, expenseLineInternalId, project);
                                    addSalesOrderLine(salesOrder, expenseId, expenseLineItemId, expenseLineQty, expenseLineAmount, null, null,null, location, config);
                                    sublistItemIdArr.push({
                                        id: expenseId,
                                        itemId: expenseLineItemId,
                                        recType: 'EXPENSE'
                                    });
                                } else if (expenseLineItemId && expenseLineInternalId) {
                                    var expenseId = upsertExpenseItemLine(expenseLineItemId, expenseLineAmount, expenseLineDescription, expenseLineInternalId, project);
                                    updateSalesOrderLine(salesOrder, expenseId, expenseLineItemId, expenseLineQty, expenseLineAmount, null, null, null, location, config);
                                    sublistItemIdArr.push({
                                        id: expenseId,
                                        itemId: expenseLineItemId,
                                        recType: 'EXPENSE'
                                    });
                                } else {
                                    sublistItemIdArr.push({
                                        id: expenseLineInternalId,
                                        itemId: expenseLineItemId,
                                        recType: 'EXPENSE'
                                    });
                                }
                            }// end of loop
                            upsertSalesOrder.upsertOriginatorItem(project, salesOrder, solarSalesItems);

                            //var soBomExpenseItemArr = getSalesOrderBomExpenseIds(salesOrder, recType); // array of values from sales order bom expense ids
                            var expenseRecordArr = getProjectExpenseRecords(project);
                            removeRecordCheck(salesOrder, sublistItemIdArr, expenseRecordArr);

                            var soLineCheck = salesOrder.getLineCount({
                                sublistId: 'item'
                            });
                            log.debug('sales order line count expense suitelet', soLineCheck);

                            if (soLineCheck > 0) {
                                var salesOrderId = salesOrder.save({
                                    ignoreMandatoryFields: true
                                });
                            } else {
                                if (salesOrder.id) {
                                    record.delete({
                                        type: record.Type.SALES_ORDER,
                                        id: salesOrder.id
                                    });
                                }
                            }

                            //accountingFields.setAccountingFields(project, false);

                            var _updateProject = {
                                'custentity_bb_contract_value_hist_html': contractHistory.contractHistory(project),
                                'custentity_bb_project_so': salesOrderId
                            };
                            if(changedFields){
                                for(var prop in _updateProject){
                                    if(_updateProject.hasOwnProperty(prop)){
                                        changedFields[prop] = _updateProject[prop];
                                    }
                                }
                            } else {
                                record.submitFields({
                                    type: record.Type.JOB,
                                    id: project.id,
                                    values: _updateProject,
                                    options: {ignoreMandatoryFields: true}
                                });
                            }

                        }
                    }

                    break;
            }

        }


        /**
         * @param  item {[integer]} item record internal id
         * @param  amount {[float]} amount of expense line
         * @param  description {[text area]}
         * @param  internalId {[integer]}
         * @param  project {[NS Record Object Loaded]}
         * @return {[type]}
         */
        function upsertExpenseItemLine(item, amount, description, internalId, project) { // 2 units per custom record
            if (internalId) {
                var expenseRec = record.load({
                    type: 'customrecord_bb_project_expense',
                    id: internalId,
                    isDynamic: true
                });
            } else {
                var expenseRec = record.create({
                    type: 'customrecord_bb_project_expense',
                    isDynamic: true
                });
            }
            if (item) {
                expenseRec.setValue({
                    fieldId: 'custrecord_bb_proj_exp_item',
                    value: item
                });
                expenseRec.setValue({
                    fieldId: 'custrecord_bb_proj_exp_amount',
                    value: amount
                });
                expenseRec.setValue({
                    fieldId: 'custrecord_bb_proj_exp_item_desc',
                    value: description
                });
                expenseRec.setValue({
                    fieldId: 'custrecord_bb_proj_exp_project',
                    value: project.id
                });
                var id = expenseRec.save({
                    ignoreMandatoryFields: true
                });
                return id;
            }
        }



        /**
         * @param  salesOrder {[NS Record Object Loaded]}
         * @param  id {[integer]} adder/bom record id
         * @param  itemId {[integer]}
         * @param  qty {[integer]}
         * @param  rate {[float]}
         * @param  priceMethod {[integer]}
         * @param  fixedPrice {[integer]}
         * @param  description {[text area]}
         * @return void {[void]}
         */
        function updateSalesOrderLine(salesOrder, id, itemId, qty, rate, priceMethod, fixedPrice, description, location, config) {
            var lineId = salesOrder.findSublistLineWithValue({
                sublistId: 'item',
                fieldId: 'custcol_bb_adder_bom_id',
                value: parseInt(id)
            });
            if (lineId != -1) {
                salesOrder.selectLine({
                    sublistId: 'item',
                    line: lineId
                });
                var item = parseFloat(itemId)
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: item.toFixed(0)
                });


                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: qty
                });
                if (id) {
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_bb_adder_bom_id',
                        value: id
                    });
                }

                if (description) {
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
                        value: description
                    });
                }

                if (priceMethod == 1) {
                    if (fixedPrice) {
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: fixedPrice
                        });
                    }
                } else {
                    if (rate) {
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: rate
                        });
                    }

                }
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'createpo',
                    value: null
                });
                if (location && config.getValue({fieldId: 'custrecord_bb_set_loc_on_so_bool'})) {
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        value: location
                    });
                }

                salesOrder.commitLine('item');
                log.debug('updated sales order line');

            } else {
                log.debug('added sales order line');
                addSalesOrderLine(salesOrder, id, itemId, qty, rate, priceMethod, fixedPrice, null, location, config)
            }

        }


        /**
         * @param  salesOrder {[NS Record Object Loaded]}
         * @param  id {[integer]} adder/bom record id
         * @param  itemId {[integer]}
         * @param  qty {[integer]}
         * @param  rate {[float]}
         * @param  priceMethod {[integer]}
         * @param  fixedPrice {[integer]}
         * @param  description {[text area]}
         * @return void {[void]}
         */
        function addSalesOrderLine(salesOrder, id, itemId, qty, rate, priceMethod, fixedPrice, description, location, config) {
            salesOrder.selectNewLine({
                sublistId: 'item'
            });
            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: parseInt(itemId).toFixed(0)
            });
            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: qty
            });
            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_bb_adder_bom_id',
                value: id
            });

            if (description) {
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'description',
                    value: description
                });
            }

            if (priceMethod == 1) {
                if (fixedPrice) {
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        value: fixedPrice
                    });
                }
            } else {
                if (rate) {
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        value: rate
                    });
                }
            }

            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'createpo',
                value: null
            });
            if (location && config.getValue({fieldId: 'custrecord_bb_set_loc_on_so_bool'})) {
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'location',
                    value: location
                });
            }

            salesOrder.commitLine('item');
        }


        /**
         * @param  itemId{[integer]}
         * @return {[array]} returns an array of objects from the kit item components results
         */
        function getKitItems(itemId) { // 5 units
            var kitItems = [];
            if (itemId) {
                var itemSearchObj = search.create({
                    type: "item",
                    filters:
                        [
                            ["internalid","anyof",itemId]
                        ],
                    columns:
                        [
                            "internalid",
                            search.createColumn({
                                name: "internalid",
                                join: "memberItem"
                            }),
                            "memberitem",
                            "memberquantity",
                            search.createColumn({
                                name: "itemid",
                                sort: search.Sort.ASC
                            })
                        ]
                });
                var searchResultCount = itemSearchObj.runPaged().count;
                log.debug("Component Item Count",searchResultCount);

                itemSearchObj.run().each(function(result){
                    var kitItemId = result.getValue({
                        name: 'internalid'
                    });
                    var memberItemId = result.getValue({
                        name: 'internalid',
                        join: 'memberItem'
                    });
                    var memberItemName = result.getValue({
                        name: 'memberitem'
                    });
                    var memberQty = result.getValue({
                        name: 'memberquantity'
                    });
                    var kitName = result.getText({
                        name: 'itemid'
                    });
                    kitItems.push({
                        kitItemId: kitItemId,
                        memberItemId: memberItemId,
                        memberItemName: memberItemName,
                        memberQty: memberQty,
                        kitName: kitName
                    });
                    return true;

                });
                return kitItems;
            } else {
                return kitItems;
            }
        }

        /**
         * @param  hideRoles {[array]} array of values from configuration record multi select
         * @param  currentUserRole {[integer]}
         * @return boolean {[boolean]}
         */
        function hidePricing(hideRoles, currentUserRole) {
            var roleArr = [];
            if (hideRoles.constructor === Array) {
                for (var i = 0; i < hideRoles.length; i++) {
                    roleArr.push(parseInt(hideRoles[i]));
                }
            } else {
                roleArr.push(hideRoles);
            }
            log.debug('role array', roleArr);
            var index = roleArr.indexOf(currentUserRole);
            log.debug('index', index);
            if (index != -1) {
                return false
            } else {
                return true;
            }
        }


        /**
         * @param  originator {[integer || string]}
         * @param  itemId {[integer || string]}
         * @return vendor price {[currency]}
         */
        function getVendorPricing(originator, itemId) {
            var vendorPrice = parseFloat(0.00);
            if (originator && itemId) {
                var itemSearchObj = search.create({
                    type: "item",
                    filters:
                        [
                            ["othervendor","anyof", originator],
                            "AND",
                            ["internalid","anyof", itemId]
                        ],
                    columns:
                        [
                            "othervendor",
                            "vendorcostentered"
                        ]
                });
                var searchResultCount = itemSearchObj.runPaged().count;
                log.debug("itemSearchObj result count",searchResultCount);
                itemSearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    vendorPrice = vendorPrice + parseFloat(result.getValue({name: 'vendorcostentered'}));
                    return true;
                });
            }
            return vendorPrice;
        }

        return {
            createBOMSublist: createBOMSublist,
            createAdderSublist: createAdderSublist,
            upsertBomItemLines: upsertBomItemLines,
            upsertAdderItems: upsertAdderItems,
            getSublistValues: getSublistValues,
            setCustomSublistValues: setCustomSublistValues,
            getKitItems: getKitItems,
            updateBomRecord: updateBomRecord,
            createBomRecord: createBomRecord,
            updateSalesOrderLine: updateSalesOrderLine,
            addSalesOrderLine: addSalesOrderLine,
            getProjectBOMRecords: getProjectBOMRecords,
            removeRecordCheck: removeRecordCheck,
            adderItemSelection: adderItemSelection,
            upsertAdderItemLine: upsertAdderItemLine,
            getProjectAdderRecords: getProjectAdderRecords,
            hidePricing: hidePricing,
            bomItemSelection: bomItemSelection,
            createExpenseSublist: createExpenseSublist,
            expenseItemSelection: expenseItemSelection,
            upsertExpenseItems: upsertExpenseItems,
            upsertExpenseItemLine: upsertExpenseItemLine,
            getProjectExpenseRecords: getProjectExpenseRecords,
            getVendorPricing: getVendorPricing
        };

    });