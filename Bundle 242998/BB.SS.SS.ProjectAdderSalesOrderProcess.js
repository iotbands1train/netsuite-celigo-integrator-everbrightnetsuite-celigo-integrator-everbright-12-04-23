/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search', './BB SS/SS Lib/BB.SS.MD.UpsertSalesOrder', './BB SS/SS Lib/BB.SS.MD.Project.BOM.Adders.InlineEditor'],

function(runtime, record, search, upsertSO, editor) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        try {
            var soArr = runtime.getCurrentScript().getParameter({
                name: 'custscript_bb_ss_adder_item_array'
            });
            log.debug('Sales Order Array - Get Input Values', soArr);
            var obj = JSON.parse(soArr);
            log.debug('array object', obj);

            var configId = (obj[0].configId) ? obj[0].configId : 1;
            var projectId = obj[0].projectId;
            var salesOrderId = (obj[0].soId) ? obj[0].soId : searchProjectSalesOrder(projectId);
            var lines = obj[0].items;
            var deleteAddersArray = obj[0].removeRecords;
            log.debug('configId', configId);
            log.debug('projectId', projectId);
            log.debug('salesOrderId', salesOrderId);
            log.debug('lines', lines);
            var config = record.load({
                type: 'customrecord_bb_solar_success_configurtn',
                id: configId
            });

            log.debug('so id', salesOrderId);
            log.debug('project id', projectId);
            log.debug('sales order line', lines);


            var salesOrder, financier, location, subsidiary, originator;
            if (projectId) {
                var columns = ['custentity_bb_financier_customer', 'custentity_bb_project_location', 'custentity_bb_originator_vendor']
                if (config.getValue({fieldId: 'custrecord_bb_ss_has_subsidiaries'})) {
                    columns.push('subsidiary');
                }
                var projectFields = search.lookupFields({
                    type: search.Type.JOB,
                    id: projectId,
                    columns: columns
                });
                

                financier = (projectFields.custentity_bb_financier_customer.length > 0) ? projectFields.custentity_bb_financier_customer[0].value : null;
                location = (projectFields.custentity_bb_project_location.length > 0) ? projectFields.custentity_bb_project_location[0].value : null;
                originator = (projectFields.custentity_bb_originator_vendor.length > 0) ? projectFields.custentity_bb_originator_vendor[0].value : null;

                
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

                    if (config.getValue({fieldId: 'custrecord_bb_ss_has_subsidiaries'})) {
                        subsidiary = (projectFields.subsidiary.length > 0) ? projectFields.subsidiary[0].value : null;
                        salesOrder.setValue({
                            fieldId: 'subsidiary',
                            value: subsidiary
                        });
                    }
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

                if (lines.length >= 0 || adderRecords.length > 0) {
                    for (var i = 0; i < lines.length; i++) {
                        // check to delete line item
                        var itemId = lines[i].itemId;
                        var quantity = lines[i].quantity;
                        var bomId = lines[i].adderId;
                        var fixedPrice = lines[i].fixedPrice;
                        var description = lines[i].description;
                        var responsibility = lines[i].responsibility;
                        var pricingMethod = lines[i].pricingMethod;
                        var costAmount = lines[i].costAmount;
                        var adderTotal = lines[i].adderTotal;
                        var adderId = lines[i].adderId;


                        if (adderId) {
                            var vendorPrice = editor.getVendorPricing(originator, itemId);
                            if (vendorPrice) {
                                fixedPrice = vendorPrice;
                                if (pricingMethod != 2) {
                                    quantity = 1;
                                }
                            }
                            fixedPrice = (fixedPrice < 0) ? 0.00 : fixedPrice
                            log.debug('fixedPrice', fixedPrice);
                            var lineIndex = getLineIndex(salesOrder, adderId);
                            if (lineIndex != -1) {
                                updateSOLine(salesOrder, itemId, quantity, fixedPrice, lineIndex, location, config);
                            } else {
                                addSOLine(salesOrder, itemId, quantity, fixedPrice, adderId, location, config);
                            }
                        } else {
                            // do nothing
                        }


                    }// end of line loop

                    // check delete array values for lines to be removed from the sales order
                    if (deleteAddersArray.length > 0) {
                        for (var d = 0; d < deleteAddersArray.length; d++) {
                            var bomAdderId = parseInt(deleteAddersArray[d].adderId);
                            var deleteIndex = getLineIndex(salesOrder, bomAdderId);
                            if (deleteIndex != -1) {
                                removeLine(salesOrder, deleteIndex);
                            }
                        }
                    }

                    var soLineCount = salesOrder.getLineCount({
                        sublistId: 'item'
                    });
                    if (soLineCount > 0) {
                        var id = salesOrder.save({
                            ignoreMandatoryFields: true
                        });
                        log.debug('sales order id', id);

                        record.submitFields({
                            type: record.Type.JOB,
                            id: projectId,
                            values: {
                                'custentity_bb_project_so': id,
                            },
                            options: {
                                ignoreMandatoryFields: true,
                                disableTriggers: true
                            }
                        });
                    } else {
                        if (salesOrder.id) {
                            log.debug('deleting sales order, has no lines to process');
                            record.delete({
                                type: record.Type.SALES_ORDER,
                                id: salesOrder.id
                            });
                        }
                    }
                }
            }// end of project id check
        } catch (e) {
            log.error('', e);
        }
    }

    
    function updateSOLine(salesOrder, itemId, quantity, basePrice, lineIndex, location, config) {
        salesOrder.selectLine({
            sublistId: 'item',
            line: lineIndex
        });
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
        salesOrder.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            value: basePrice
        });
        if (location && config.getValue({fieldId: 'custrecord_bb_set_loc_on_so_bool'})) {
            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'location',
                value: location
            });  
        }

        salesOrder.commitLine({
            sublistId: 'item'
        });
    }


    function addSOLine(salesOrder, itemId, quantity, rate, adderId, location, config) {
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
        salesOrder.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            value: rate
        });
        if (location && config.getValue({fieldId: 'custrecord_bb_set_loc_on_so_bool'})) {
            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'location',
                value: location
            });
        }
        salesOrder.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_bb_adder_bom_id',
            value: adderId
        });

        salesOrder.commitLine('item');
    }


    function getLineIndex(salesOrder, adderId) {
        var removeLineIndex = salesOrder.findSublistLineWithValue({
            sublistId: 'item',
            fieldId: 'custcol_bb_adder_bom_id',
            value: parseInt(adderId)
        });
        if (removeLineIndex != -1) {
            return removeLineIndex
        } else {
            return -1
        }
    }


    function removeLine(salesOrder, lineNumber) {
        salesOrder.removeLine({
            sublistId: 'item',
            line: lineNumber
        });
    }

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

    return {
        execute: execute
    };
    
});