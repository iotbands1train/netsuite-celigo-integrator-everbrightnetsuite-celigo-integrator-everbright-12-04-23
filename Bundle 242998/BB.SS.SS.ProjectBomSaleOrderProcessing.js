/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope public
 * @overview - Schedule script processing script for Project BOM, used from Suitelet BOM List and Project UE script Execution
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

define(['N/runtime', 'N/record', 'N/search', './BB SS/SS Lib/BB.SS.MD.UpsertSalesOrder'],

    function(runtime, record, search, upsertSO) {

        /**
         * Definition of the Scheduled script trigger point.
         *
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
         * @Since 2015.2
         */
        function execute(scriptContext) {
            try {
                var hasInvoicedLines = false;
                var hasPurchasedLines = false;
                var hasFulfilledLines = false;
                var soArr = runtime.getCurrentScript().getParameter({
                    name: 'custscript_bb_ss_bom_item_array'
                });
                log.debug('Sales Order Array - Get Input Values', soArr);
                var array = JSON.parse(soArr);
                var salesOrderId = array[0].soId;
                var projectId = array[0].project;
                var bomStatus = array[0].bomStatus;
                var lines = array[0].items;

                log.debug('so id', salesOrderId);
                log.debug('project id', projectId);
                log.debug('sales order line', lines);

                // run bom records first to allow execution of UE scripts then save sales order afterwards
                if (lines.length > 0) {
                    for (var i = 0; i < lines.length; i++) {
                        // check to delete line item
                        var itemId = lines[i].itemId;
                        var quantity = lines[i].quantity;
                        var bomId = lines[i].bomId;
                        var basePrice = lines[i].basePrice;
                        var projId = lines[i].projectId;
                        var description = lines[i].description;
                        var invQty = lines[i].invoicedQty;
                        var isPurchased = lines[i].relatedPurchaseOrder;
                        var isFulfilled = lines[i].fulfilledQty;

                        if (lines[i].delete && !invQty && !isPurchased) {
                            log.debug('deleting bom');
                            deleteBom(bomId);
                        } else if (bomId && !lines[i].delete && !isPurchased) {
                            log.debug('updating bom');
                            var updateId = upsertBOM(bomId, itemId, quantity, basePrice, description, projectId);
                            lines[i].bomId = updateId;
                        } else if (!bomId) {
                            // add new bom upsert so line
                            // update here to check for new bom id based on itemId
                            var foundId = getBOMByItemId(projId, itemId);
                            if (!foundId) {
                                log.debug('adding new bom, no bom id found');
                                var newBomId = upsertBOM(bomId, itemId, quantity, basePrice, description, projectId);
                                lines[i].bomId = newBomId;
                            } else {
                                log.debug('updating found bom');
                                upsertBOM(foundId, itemId, quantity, basePrice, description, projectId);
                            }
                        }

                        if (invQty > 0) {
                            hasInvoicedLines = true;
                        }
                        if (isPurchased) {
                            hasPurchasedLines = true;
                        }
                        if (isFulfilled > 0) {
                            hasFulfilledLines = true;
                        }
                    }// end of bom loop
                }

                // var start sales order updates
                log.debug('after bom record updates to sales order lines', lines);
                var salesOrder;
                if (projectId) {
                    var project = record.load({
                        type: record.Type.JOB,
                        id: projectId,
                        isDynamic: true
                    });
                    var bbconfigId = project.getValue({fieldId: 'custentity_bbss_configuration'}) || 1;
                    var config = record.load({
                        type: 'customrecord_bb_solar_success_configurtn',
                        id: bbconfigId
                    });

                    var financier = project.getValue({fieldId: 'custentity_bb_financier_customer'});
                    var location = project.getValue({fieldId: 'custentity_bb_project_location'});

                    if (config.getValue({fieldId: 'custrecord_bb_ss_has_subsidiaries'})) {
                        var subsidiary = project.getValue({fieldId: 'subsidiary'});
                        log.debug('subsid', subsidiary);
                    }

                    if (!financier)  throw 'Project is Missing Fiancier';
                    log.debug('financier', financier);
                    log.debug('location', location);


                    if (salesOrderId) {
                        salesOrder = upsertSO.getSalesOrder(project, salesOrderId);
                    } else {
                        log.debug('creating new sales order');
                        var solarSalesItems = upsertSO.getSolarConfigSalesItems();
                        salesOrder = upsertSO.createSalesOrderHeader(project, solarSalesItems);
                    }
                    // setLineItemFields if invoice actuals is turned off
                    if (lines.length > 0 && !config.getValue({fieldId: 'custrecord_bb_invoice_actuals_boolean'})) {
                        log.debug('132 sales order line loop', lines.length);
                        for (var i = 0; i < lines.length; i++) {
                            // check to delete line item
                            var itemId = lines[i].itemId;
                            var quantity = lines[i].quantity;
                            var bomId = lines[i].bomId;
                            var basePrice = lines[i].basePrice;
                            var projId = lines[i].projectId;
                            var bomDescription = lines[i].description;

                            if (lines[i].delete) {
                                log.debug('removing line item');
                                var removeIndex = getLineIndex(salesOrder, bomId);
                                if (removeIndex != -1) {
                                    salesOrder.removeLine({
                                        sublistId: 'item',
                                        line: removeIndex
                                    });
                                }
                            } else if (bomId && !lines[i].delete) {
                                // update line item
                                var lineIndex = getLineIndex(salesOrder, bomId);
                                log.debug('154 line index', lineIndex);
                                if (lineIndex != -1) {
                                    updateSOLine(salesOrder, itemId, quantity, basePrice, lineIndex, location, bomDescription, config);
                                } else {
                                    addSOLine(salesOrder, itemId, quantity, basePrice, bomId, location, bomDescription, config);
                                }
                            } else {
                                // add new bom upsert so line
                                addSOLine(salesOrder, itemId, quantity, basePrice, bomId, location, bomDescription, config);
                            }
                        }// end of line loop
                        values = {};
                        var inventoryAmount = getInventoryAmount(salesOrder);
                        var taxObj = upsertSO.getSalesTaxDetails(projectId);
                        var lineCountCheck = salesOrder.getLineCount({
                            sublistId: 'item'
                        });
                        log.debug('lineCountCheck', lineCountCheck);
                        var savedSoId = null;
                        if (lineCountCheck > 0) {
                            savedSoId = salesOrder.save({
                                ignoreMandatoryFields: true
                            });
                            values['custentity_bb_project_so'] = savedSoId;

                        } else if (lineCountCheck <= 0 && salesOrderId) {
                            record.delete({
                                type: record.Type.SALES_ORDER,
                                id: salesOrderId
                            });
                        } else {
                            // do nothing
                        }
                        values['custentity_bb_inventory_amount'] = inventoryAmount;
                        values['custentity_bb_sales_tax_amount'] = (taxObj) ? taxObj.amount : null;
                        values['custentity_bb_ss_sales_tax_account'] = (taxObj) ? taxObj.account : null;

                        // currnetly turned off due to record has changed error issues after the project is saved from other scripts and client account automations

                        /*This is removed due to a conflict with BB.SS.MD.LeadToProject script that might run in parellel and end up having a record has been changed error
                         * record.submitFields({
                            type: record.Type.JOB,
                            id: projectId,
                            values: values,
                            options: {
                                ignoreMandatoryFields: true,
                                disableTriggers: true
                            }
                        });*/
                        // end of line execution for bom records
                    } else if (lines.length > 0 && config.getValue({fieldId: 'custrecord_bb_invoice_actuals_boolean'}))  { // execute invoice actuals line items
                        // build line set for invoice actuals
                        if (!hasInvoicedLines && !hasPurchasedLines && !hasFulfilledLines) {
                            var finalArray = buildInvoiceActualLineSet(salesOrder, lines, true);
                            log.debug('clearing all items');
                            // returns all non inventory items on the sales order lines to be added back after parent sub parent items are added.
                            var nonInventoryArray = clearAllSalesOrderLines(salesOrder);
                            setNewSalesOrderLines(salesOrder, finalArray, config, location);
                        } else {
                            var updatefinalArray = buildInvoiceActualLineSet(salesOrder, lines, false);
                            updateSalesOrderLines(salesOrder, config, updatefinalArray, lines, location);
                        }
                        // add back all adder and/or expense lines
                        if (nonInventoryArray.length > 0) {
                            for (var n = 0; n < nonInventoryArray.length; n++) {
                                var obj = nonInventoryArray[n];
                                addSOLine(salesOrder, obj.itemId, obj.qty, obj.rate, obj.bomAdderId, location, null, config);
                            }
                        }
                        values = {};
                        var inventoryAmount = getInventoryAmount(salesOrder);
                        var taxObj = upsertSO.getSalesTaxDetails(projectId);
                        var lineCountCheck = salesOrder.getLineCount({
                            sublistId: 'item'
                        });
                        log.debug('lineCountCheck', lineCountCheck);
                        var savedSoId = null;
                        if (lineCountCheck > 0) {
                            savedSoId = salesOrder.save({
                                ignoreMandatoryFields: true
                            });
                            values['custentity_bb_project_so'] = savedSoId;

                        } else if (lineCountCheck <= 0 && salesOrderId) {
                            record.delete({
                                type: record.Type.SALES_ORDER,
                                id: salesOrderId
                            });
                        }

                        values['custentity_bb_inventory_amount'] = inventoryAmount;
                        values['custentity_bb_sales_tax_amount'] = (taxObj) ? taxObj.amount : null;
                        values['custentity_bb_ss_sales_tax_account'] = (taxObj) ? taxObj.account : null;
                        // currently turned off due to record has changed error issues after the project is saved from other scripts and client account automations
                      /*This is removed due to a conflict with BB.SS.MD.LeadToProject script that might run in parellel and end up having a record has been changed error  
                      record.submitFields({
                            type: record.Type.JOB,
                            id: projectId,
                            values: values,
                            options: {
                                ignoreMandatoryFields: true,
                                disableTriggers: true
                            }
                        });*/
                    }
                }// end of project id check
            } catch (e) {
                log.error('error updating bom to sales order', e);
            }
        }


        function getLineIndex(salesOrder, bomId) {
            log.debug('getLineIndex bomid', bomId);
            var removeLineIndex = salesOrder.findSublistLineWithValue({
                sublistId: 'item',
                fieldId: 'custcol_bb_adder_bom_id',
                value: parseInt(bomId)
            });
            log.debug('get line index after', removeLineIndex);
            if (removeLineIndex != -1) {
                return removeLineIndex
            } else {
                return -1
            }
        }

        function addSOLine(salesOrder, itemId, quantity, rate, bomId, location, bomDescription, config) {
            salesOrder.selectNewLine('item');
            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: itemId
            });
            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: quantity
            });
            if (rate) {
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    value: rate
                });
            }
            if (location && config.getValue({fieldId: 'custrecord_bb_set_loc_on_so_bool'})) {
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'location',
                    value: location
                });
            }
            if (bomDescription) {
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'description',
                    value: bomDescription
                });
            }
            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_bb_adder_bom_id',
                value: bomId
            });

            salesOrder.commitLine('item');
        }

        function updateSOLine(salesOrder, item, quantity, rate, lineNumber, location, bomDescription, config) {
            log.debug('updateSOLine', [item, quantity, rate, lineNumber, location, bomDescription, config] );
            salesOrder.selectLine({
                sublistId: 'item',
                line: lineNumber
            });
            var isLineCommitted = salesOrder.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantityfulfilled'
            });
            if (item && !isLineCommitted) {
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: item
                });
            }
            if (quantity) {
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: quantity
                });
            }
            if (rate && !isLineCommitted) {
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    value: rate
                });
            }
            if (location && config.getValue({fieldId: 'custrecord_bb_set_loc_on_so_bool'}) && !isLineCommitted) {
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'location',
                    value: location
                });
            }
            if (bomDescription && !isLineCommitted) {
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'description',
                    value: bomDescription
                });
            }
            salesOrder.commitLine({
                sublistId: 'item'
            });
            log.debug('line committed', [item, quantity, rate, lineNumber, location, bomDescription]);
        }

        function clearAllSalesOrderLines(salesOrder) {
            var nonInventoryArray = [];
            var lineCount = salesOrder.getLineCount({sublistId: 'item'});
            if (lineCount > 0) {
                // get lines with non inventory items and bom/adder id populated
                for (var s = 0; s < lineCount; s++) {
                    var itemType = salesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemtype',
                        line: s
                    });
                    log.debug('itemType', itemType);
                    var bomAdderId = salesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_bb_adder_bom_id',
                        line: s
                    });
                    if (itemType == 'NonInvtPart') {
                        nonInventoryArray.push({
                            itemId: salesOrder.getSublistValue({sublistId: 'item', fieldId: 'item', line: s}),
                            qty: salesOrder.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: s}),
                            rate: salesOrder.getSublistValue({sublistId: 'item', fieldId: 'rate', line: s}),
                            amount: salesOrder.getSublistValue({sublistId: 'item', fieldId: 'amount', line: s}),
                            bomAdderId: salesOrder.getSublistValue({sublistId: 'item', fieldId: 'amount', line: s}),
                        });
                    }
                }
                // remove lines
                for (var i = lineCount - 1; i >= 0; i--) {
                    salesOrder.removeLine({
                        sublistId: 'item',
                        line: i
                    });
                }
            }
            return nonInventoryArray;
        }

        function buildInvoiceActualLineSet(salesOrder, lines, newLines) {
            var finalArray = {};

            for (var i = 0; i < lines.length; i++) {
                // check to delete line item
                var bomId = lines[i].bomId;
                if (lines[i].delete && !lines[i].relatedPurchaseOrder) {
                    log.debug('removing line item');
                    var removeIndex = getLineIndex(salesOrder, bomId);
                    if (removeIndex != -1) {
                        salesOrder.removeLine({
                            sublistId: 'item',
                            line: removeIndex
                        });
                    }
                } else {
                    // check if line is invoiced here already
                    var indexCheck = getLineIndex(salesOrder, bomId);
                    if (indexCheck != -1) {
                        var currentSOQty = salesOrder.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: indexCheck
                        });
                        var invoicedQty = salesOrder.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantitybilled',
                            line: indexCheck
                        });
                    }

                    // only build invoice set here for new lines OR line has a related purchase order and quantity does not = the current so Line
                    if ((indexCheck == -1 && !newLines) || (lines[i].relatedPurchaseOrder && currentSOQty != lines[i].quantity) && !newLines) {
                        // upsert new bom if line has related purchase order and quantity is differnt
                        if (lines[i].relatedPurchaseOrder && currentSOQty != lines[i].quantity) {
                            lines[i].quantity = parseInt(lines[i].quantity) - parseInt(currentSOQty);
                            var updateId = upsertBOM(null, lines[i].itemId, lines[i].quantity, lines[i].basePrice, lines[i].description, lines[i].projectId);
                            lines[i].bomId = updateId;
                            log.debug('created a new bom record when line has purchase order already associcated');
                        }

                        var invoiceParentId = lines[i].itemCategory;
                        var invoiceSubParent = lines[i].invoiceSubParent;
                        // check if existing property for this id, if not initialize new array
                        if (!finalArray[invoiceParentId]) {

                            finalArray[invoiceParentId] = {};

                            if (!finalArray[invoiceParentId][invoiceSubParent] && invoiceSubParent) {
                                finalArray[invoiceParentId][invoiceSubParent] = [];
                            } else if (invoiceParentId) {
                                finalArray[invoiceParentId] = [];
                            }
                        } else {
                            if (!finalArray[invoiceParentId][invoiceSubParent] && invoiceSubParent) {
                                finalArray[invoiceParentId][invoiceSubParent] = [];
                            }
                        }
                        if (invoiceParentId && !invoiceSubParent) {
                            finalArray[invoiceParentId].push(lines[i]);
                        } else if (invoiceParentId && invoiceSubParent) {
                            finalArray[invoiceParentId][invoiceSubParent].push(lines[i]);
                        }

                    } else if (newLines) { // return all lines none have been invoiced or new sales order lines
                        var invoiceParentId1 = lines[i].itemCategory;
                        var invoiceSubParent1 = lines[i].invoiceSubParent;
                        // check if existing property for this id, if not initialize new array
                        if (!finalArray[invoiceParentId1]) {

                            finalArray[invoiceParentId1] = {};

                            if (!finalArray[invoiceParentId1][invoiceSubParent1] && invoiceSubParent1) {
                                finalArray[invoiceParentId1][invoiceSubParent1] = [];
                            } else if (invoiceParentId1) {
                                finalArray[invoiceParentId1] = [];
                            }
                        } else {
                            if (!finalArray[invoiceParentId1][invoiceSubParent1] && invoiceSubParent1) {
                                finalArray[invoiceParentId1][invoiceSubParent1] = [];
                            }
                        }

                        if (invoiceParentId1 && !invoiceSubParent1) {
                            finalArray[invoiceParentId1].push(lines[i]);
                        } else if (invoiceParentId1 && invoiceSubParent1) {
                            finalArray[invoiceParentId1][invoiceSubParent1].push(lines[i]);
                        }
                        // finalArray[invoiceParentId][invoiceSubParent].push(lines[i]);
                    }
                }
            }// end of line loop
            log.debug('final array object', finalArray);

            return finalArray;
        }


        function setNewSalesOrderLines(salesOrder, finalArray, config, location) {
            log.debug('final line object', finalArray);
            var subTotalItemId = config.getValue({fieldId: 'custrecord_bb_sub_total_inv_act_item'});
            //loop over object keys
            for (var key in finalArray) {
                // add new sales order line with description item as invoice parent
                if (finalArray.hasOwnProperty(key) && key != undefined && key != 'null') {
                    log.debug('key', key)
                    if (key) {
                        salesOrder.selectNewLine('item');
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: key
                        });
                        salesOrder.commitLine('item');
                    }
                    log.debug('finalArray[key] instanceof Array', finalArray[key] instanceof Array);
                    if (finalArray[key] instanceof Array) {
                        // array value of lines that belong to the sub parent item -- testing for invoice actuals without subparentid
                        var soLines = finalArray[key];
                        log.debug('invoice actual key array value', soLines);
                        if (soLines.length > 0) {
                            for (var l = 0; l < soLines.length; l++) {
                                var itemId = soLines[l].itemId;
                                var quantity = soLines[l].quantity;
                                var bomId = soLines[l].bomId;
                                var basePrice = parseFloat(soLines[l].basePrice);
                                var projId = soLines[l].projectId;
                                var bomDescription = soLines[l].description;
                                addSOLine(salesOrder, itemId, quantity, basePrice, bomId, location, bomDescription, config);
                            }
                            // add sub total line
                            salesOrder.selectNewLine('item');
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: subTotalItemId
                            });
                            salesOrder.commitLine('item');
                        }
                    } else {
                        for (var secondKey in finalArray[key]) {
                            //add sub parent line
                            salesOrder.selectNewLine('item');
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: secondKey
                            });
                            salesOrder.commitLine('item');

                            // array value of lines that belong to the sub parent item -- testing for invoice actuals without subparentid
                            var soLines = (finalArray[key][secondKey]) ? finalArray[key][secondKey] : finalArray[key];
                            log.debug('invoice actual key array value', soLines);
                            if (soLines.length > 0) {
                                for (var l = 0; l < soLines.length; l++) {
                                    var itemId = soLines[l].itemId;
                                    var quantity = soLines[l].quantity;
                                    var bomId = soLines[l].bomId;
                                    var basePrice = parseFloat(soLines[l].basePrice);
                                    var projId = soLines[l].projectId;
                                    var bomDescription = soLines[l].description;
                                    addSOLine(salesOrder, itemId, quantity, basePrice, bomId, location, bomDescription, config);
                                }
                                // add sub total line
                                salesOrder.selectNewLine('item');
                                salesOrder.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    value: subTotalItemId
                                });
                                salesOrder.commitLine('item');
                            }
                        }
                    }
                }
            }
        }


        function updateSalesOrderLines(salesOrder, config, finalArray, lines, location) { // use finalArray object to check and detect lines
            log.debug('final line object', finalArray);
            var subTotalItemId = config.getValue({fieldId: 'custrecord_bb_sub_total_inv_act_item'});
            //loop over object keys
            for(var x = 0; x < lines.length; x++) {
                var lineIndexCheck = getLineIndex(salesOrder, lines[x].bomId);
                if (lineIndexCheck != -1) {
                    // update so line only
                    var currentSoQty = salesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId:'quantity',
                        line: lineIndexCheck
                    });
                    // update already invoiced lines
                    updateSOLine(salesOrder, null, lines[x].quantity, lines[x].basePrice, lineIndexCheck, location, lines[x].bomDescription, config);
                    log.debug('updating so line');

                }
            }// end of loop

            // add new lines that are not not found on the SO with parent and subparent groups
            log.debug('adding new so line line group');
            for (var key in finalArray) {
                // add new sales order line with description item as invoice parent
                if (finalArray.hasOwnProperty(key) && key != undefined) {
                    log.debug('key', key)
                    salesOrder.selectNewLine('item');
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: key
                    });
                    salesOrder.commitLine('item');

                    for (var secondKey in finalArray[key]) {
                        //add sub parent line
                        salesOrder.selectNewLine('item');
                        salesOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: secondKey
                        });
                        salesOrder.commitLine('item');
                        // array value of lines that belong to the sub parent item
                        var soLines = finalArray[key][secondKey];
                        log.debug('invoice actual key array value', soLines);
                        if (soLines.length > 0) {
                            for (var l = 0; l < soLines.length; l++) {
                                var invoiced = soLines[l].invoiced;
                                var itemId = soLines[l].itemId;
                                var quantity = soLines[l].quantity;
                                var bomId = soLines[l].bomId;
                                var basePrice = parseFloat(soLines[l].basePrice);
                                var projId = soLines[l].projectId;
                                var bomDescription = soLines[l].description;
                                var index = getLineIndex(salesOrder, bomId);
                                if (index == -1) {
                                    addSOLine(salesOrder, itemId, quantity, basePrice, bomId, location, bomDescription, config);
                                }
                            }
                            // add sub total line
                            salesOrder.selectNewLine('item');
                            salesOrder.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: subTotalItemId
                            });
                            salesOrder.commitLine('item');
                        }
                    }
                }
            }
        }


        function getInventoryAmount(salesOrder) {
            var lineCount = salesOrder.getLineCount({
                sublistId: 'item'
            });

            var inventoryAmount = 0.00;
            for (var l = 0; l < lineCount; l++) {
                var itemId = salesOrder.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: l
                });

                var typeName = salesOrder.getSublistText({
                    sublistId: 'item',
                    fieldId: 'itemtype',
                    line: l
                });

                if (typeName == 'InvtPart') {
                    inventoryAmount += parseFloat(salesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: l
                    }));
                }
            }
            log.debug('shipping Price', inventoryAmount);
            return inventoryAmount;
        }


        function upsertBOM(bomId, itemId, qty, basePrice, description, projectId) {
            log.debug('upsertBOM start', {bom: bomId, item: itemId, qty: qty, price: basePrice});
            var bom;
            if (!bomId) {
                bom = record.create({
                    type: 'customrecord_bb_project_bom',
                    isDynamic: true
                })
            } else {
                bom = record.load({
                    type: 'customrecord_bb_project_bom',
                    id: bomId,
                    isDynamic: true
                });
            }
            bom.setValue({
                fieldId: 'custrecord_bb_project_bom_project',
                value: projectId
            });
            bom.setValue({
                fieldId: 'custrecord_bb_project_bom_item',
                value: itemId
            });
            bom.setValue({
                fieldId: 'custrecord_bb_project_bom_quantity',
                value: qty
            });
            bom.setValue({
                fieldId: 'custrecord_bb_ss_bom_item_description',
                value: description
            });
            bom.setValue({
                fieldId: 'custrecord_bb_bom_amount',
                value: basePrice
            });
            var id = bom.save({
                ignoreMandatoryFields: true
            });
            return id;
        }


        function deleteBom(bomId) {
            if (bomId) {
                record.submitFields({
                    type: 'customrecord_bb_project_bom',
                    id: bomId,
                    values: {
                        'isinactive': true
                    },
                    options: {
                        ignoreMandatoryFields: true
                    }
                });
            }
        }

        function getBOMByItemId(projectId, itemId) {
            var bomId = null;
            if (projectId && itemId) {
                var customrecord_bb_project_bomSearchObj = search.create({
                    type: "customrecord_bb_project_bom",
                    filters:
                        [
                            ["custrecord_bb_project_bom_item","anyof",itemId],
                            "AND",
                            ["custrecord_bb_project_bom_project.internalid","anyof", projectId],
                            "AND",
                            ["isinactive", "is", "F"]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"})
                        ]
                });
                var searchResultCount = customrecord_bb_project_bomSearchObj.runPaged().count;
                log.debug("customrecord_bb_project_bomSearchObj result count",searchResultCount);
                customrecord_bb_project_bomSearchObj.run().each(function(result){
                    bomId = result.getValue({name: 'internalid'})
                    return true;
                });
            }
            return bomId;
        }

        return {
            execute: execute
        };

    });