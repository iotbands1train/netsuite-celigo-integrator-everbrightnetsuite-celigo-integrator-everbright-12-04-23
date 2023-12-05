/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope Public
 */
define(['N/runtime', 'N/record', 'N/search'],

function(runtime, record, search) {
   
    /**
     * Definition of the Scheduled script trigger point.
     * 
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        try {
            var object;
            var salesOrder;
            var expenseObj = runtime.getCurrentScript().getParameter({
                name: 'custscript_bb_expense_object'
            });
            
            if (typeof expenseObj == 'string') {
                object = JSON.parse(expenseObj);
            } else {
                object = expenseObj;
            }
            log.debug('expense object', expenseObj);
            var projectId = object.project;
            var salesOrderId = searchProjectSalesOrder(projectId);
            var lines = object.items;

            log.debug('sales order line object', lines);
            var salesOrder;
            if (projectId) {
                var projectFields = search.lookupFields({
                    type: search.Type.JOB,
                    id: projectId,
                    columns: ['custentity_bb_financier_customer', 'custentity_bb_project_location', 'subsidiary']
                });

                var financier = (projectFields.custentity_bb_financier_customer.length > 0) ? projectFields.custentity_bb_financier_customer[0].value : null;
                var location = (projectFields.custentity_bb_project_location.length > 0) ? projectFields.custentity_bb_project_location[0].value : null;
                var subsidiary = (projectFields.subsidiary.length > 0) ? projectFields.subsidiary[0].value : null;
                if (!financier)  throw 'Project is Missing Fiancier';
                log.debug('financier', financier);
                log.debug('location', location);
                log.debug('subsid', subsidiary);

                if (salesOrderId) {
                    salesOrder = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId,
                        isDynamic: true
                    });
                } else {
                    log.debug('creating new sales order');
                    salesOrder = record.create({
                        type: record.Type.SALES_ORDER,
                        isDynamic: true
                    });
                    // set fields related to 
                    salesOrder.setValue({
                        fieldId: 'entity',
                        value: financier
                    });
                    log.debug('entity set');
                    salesOrder.setValue({
                        fieldId: 'subsidiary',
                        value: subsidiary
                    });
                    salesOrder.setValue({
                        fieldId: 'location',
                        value: location
                    });
                    salesOrder.setValue({
                        fieldId: 'custbody_bb_project',
                        value: projectId
                    });
                    salesOrder.setValue({
                        fieldId: 'custbody_bb_milestone',
                        value: 2
                    });
                    salesOrder.setValue({
                        fieldId: 'trandate',
                        value: new Date()
                    });
                }

                // setLineItemFields

                if (lines.length > 0) {
                    for (var i = 0; i < lines.length; i++) {
                        // check to delete line item
                        var itemId = lines[i].itemId;
                        var quantity = lines[i].quantity || 1;
                        var recordId = lines[i].recordId;
                        var amount = lines[i].amount;
                        var projId = lines[i].projectId;

                        if (lines[i].delete) {
                            log.debug('removing line item');
                            var removeIndex = getLineIndex(salesOrder, recordId);
                            if (removeIndex != -1) {
                                salesOrder.removeLine({
                                    sublistId: 'item',
                                    line: removeIndex
                                });
                            }

                        } else if (recordId && !lines[i].delete) {
                            // update line item
                            var lineIndex = getLineIndex(salesOrder, recordId);
                            if (lineIndex != -1) {
                                log.debug('Update expense upsert so line');
                                updateSOLine(salesOrder, itemId, quantity, amount, lineIndex);
                            } else {
                                log.debug('else expense upsert so line');
                                addSOLine(salesOrder, itemId, quantity, amount, recordId);
                            }
                        } else {
                            // add new bom upsert so line
                            log.debug('add new expense upsert so line');
                            addSOLine(salesOrder, itemId, quantity, amount, recordId);
                        }


                    }// end of line loop
                    values = {};
                    // var inventoryAmount = getInventoryAmount(salesOrder);
                    // var taxObj = upsertSO.getSalesTaxDetails(projectId);
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
                        record.submitFields({
                            type: record.Type.JOB,
                            id: projectId,
                            values: values,
                            options: {
                                ignoreMandatoryFields: true,
                                disableTriggers: true
                            }
                        });
                        
                    } else if (lineCountCheck <= 0 && salesOrderId) {
                        record.delete({
                            type: record.Type.SALES_ORDER,
                            id: salesOrderId
                        });
                    } else {
                        // do nothing
                    }


                    

                }

            }// end of project id check

        } catch (e) {
            log.error('error upserting expense sales order', e);
        }
    }


    // general functions
    function searchProjectSalesOrder(projectId) {
        var soId = null;
        if (projectId) {
            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                [
                    ["type","anyof","SalesOrd"], 
                    "AND", 
                    ["mainline","is","T"], 
                    "AND", 
                   ["custbody_bb_project","anyof", projectId]
                ],
                columns:
                [
                    "internalid"
                ]
            });
            var searchResultCount = salesorderSearchObj.runPaged().count;
            log.debug("Project Sales Order Record Count",searchResultCount);
            salesorderSearchObj.run().each(function(result){
                soId = result.getValue({name: 'internalid'});
                return true;
            });
        }
        return soId;
    }

    function getLineIndex(salesOrder, recordId) {
        log.debug('recordId', recordId);
        var removeLineIndex = salesOrder.findSublistLineWithValue({
            sublistId: 'item',
            fieldId: 'custcol_bb_adder_bom_id',
            value: parseInt(recordId)
        });
        log.debug('get line index', removeLineIndex);
        if (removeLineIndex != -1) {
            return removeLineIndex
        } else {
            return -1
        }
    }

    function addSOLine(salesOrder, itemId, quantity, rate, recordId) {
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

        salesOrder.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_bb_adder_bom_id',
            value: recordId
        });

        salesOrder.commitLine('item');
    }

    function updateSOLine(salesOrder, item, quantity, rate, lineNumber) {
       log.debug(salesOrder, item, quantity, rate, lineNumber);
        salesOrder.selectLine({
            sublistId: 'item',
            line: lineNumber
        });
        salesOrder.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            value: item
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

        salesOrder.commitLine({
            sublistId: 'item'
        });
    }


    return {
        execute: execute
    };
    
});
