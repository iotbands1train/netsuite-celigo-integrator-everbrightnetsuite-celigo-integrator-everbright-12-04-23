/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 * zbilliet 10/8/19
 */
define(['N/record', 'N/search', 'N/runtime', 'N/config'],
    /**
     * @param {record} record
     * @param {search} search
     */
    function(record, search, runtime, nsConfig) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {
                var vendorPrice;
                var actionrec;
                var scriptObj = runtime.getCurrentScript();
                var adderitem = runtime.getCurrentScript().getParameter({ name: 'custscript_adder_item' });
                var adderprice = runtime.getCurrentScript().getParameter({ name: 'custscript_adder_price' });
                var adderQty = runtime.getCurrentScript().getParameter({ name: 'custscript_adder_quantity' });
                var useFixedPrice = runtime.getCurrentScript().getParameter({ name: 'custscript_use_fixed_price' });

                log.debug('adder item parameter', adderitem);
                log.debug('adder quantity parameter', adderQty);
                log.debug('adder price parameter', adderprice);
                log.debug('use fixed adder price', useFixedPrice);

                var prjid = scriptContext.newRecord.id;
                log.debug('project Id', prjid);

                var companyInfo = nsConfig.load({
                    type: nsConfig.Type.COMPANY_INFORMATION
                });
                var accountId = companyInfo.getValue({fieldId: 'companyid'});

                var existingAdderObj = findExistingAdder(prjid, adderitem);
                log.debug('adder object', existingAdderObj);
                
                //Update case 6589: Uncommenting the below line of code
                adderprice = (adderprice) ? adderprice : existingAdderObj.adderFixedPrice;
                log.debug('adderPrice', adderprice);
                if (!adderprice && adderitem) {
                    var searchCols = [];
                    if (!useFixedPrice) {
                        searchCols.push('custitem_bb_adder_cost_amount');
                    } else {
                        searchCols.push('custitem_bb_adder_fixed_price_amt');
                    }
                    var itemObj = search.lookupFields({
                        type: search.Type.ITEM,
                        id: adderitem,
                        columns: searchCols
                    });
                    if (!useFixedPrice) {
                        adderprice = itemObj.custitem_bb_adder_cost_amount;
                    } else {
                        adderprice = itemObj.custitem_bb_adder_fixed_price_amt;
                    }
                }

                // only execute for this client account
                if (accountId == '5515123' || accountId == '5515123_SB1') {
                    var hasPodioAdder = getPodioAdderRecord(prjid);
                    if (hasPodioAdder) {
                        log.audit('project has podio adders - exiting');
                        return;
                    }
                }

                var projObj = getProjectFieldData(prjid);
                log.debug('vendor id', projObj.custentity_bb_originator_vendor);
                if (projObj.custentity_bb_originator_vendor && adderitem) {
                    vendorPrice = getVendorPricing(projObj.custentity_bb_originator_vendor, adderitem);
                    log.audit('found vendor price', vendorPrice);
                }
                // only execute for this client account
                if (accountId == '5515123' || accountId == '5515123_SB1') {
                    if (!vendorPrice && !adderprice) {
                        log.audit('exiting - vendor price not found');
                        return scriptContext.newRecord.id;
                    }
                }


                if (!existingAdderObj.existingAdderId) {
                    actionrec = record.create({
                        type: 'customrecord_bb_project_adder',
                        isDynamic: true
                    });
                } else {
                    // if needed in future context add record.load here for updates
                    if (accountId == '5515123' || accountId == '5515123_SB1') {
                        log.audit('adder is already created - exiting');
                        return scriptContext.newRecord.id;
                    } else {
                        actionrec = record.load({
                            type: 'customrecord_bb_project_adder',
                            id: existingAdderObj.existingAdderId,
                            isDynamic: true
                        });
                    }
                }

                var rate = (vendorPrice) ? vendorPrice : adderprice;

                actionrec.setValue({fieldId: 'custrecord_bb_project_adder_project', value: prjid});
                actionrec.setValue({fieldId: 'custrecord_bb_adder_item', value: adderitem});
                actionrec.setValue({fieldId: 'custrecord_bb_adder_price_amt', value: rate});

                var qty;
                var sysSize = parseFloat(projObj.custentity_bb_system_size_decimal);
                if (existingAdderObj.pricingMethod == '2') {
                    qty = parseFloat(sysSize * 1000).toFixed(0);
                } else {
                    qty = (adderQty) ? adderQty : 1;
                }

                actionrec.setValue({fieldId: 'custrecord_bb_quantity', value: qty});

                var id  = actionrec.save({
                    ignoreMandatoryFields: true
                });

                var values = {};
                var salesOrderId = getSalesOrder(prjid);
                var soId = upsertSalesOrder(salesOrderId, prjid, adderitem, qty, rate, id);

                var project = record.load({
                    type: record.Type.JOB,
                    id: prjid,
                    isDynamic: true
                });

                project.setValue({
                    fieldId: 'custentity_bb_project_so',
                    value: soId
                });

                project.save({
                    ignoreMandatoryFields: true
                });


            } catch(e) {
                log.error('error',e);
            }
        }

        function upsertSalesOrder(salesOrderId, projectId, adderItem, qty, rate, adderId) {
            var obj = getProjectFieldData(projectId);
            var salesOrder;
            if (!salesOrderId) {
                salesOrder = record.create({
                    type: record.Type.SALES_ORDER,
                    isDynamic: true
                });
                salesOrder.setValue({
                    fieldId: 'entity',
                    value: obj.custentity_bb_financier_customer
                });
                salesOrder.setValue({
                    fieldId: 'subsidiary',
                    value: obj.subsidiary
                });
                salesOrder.setValue({
                    fieldId: 'location',
                    value: obj.custentity_bb_project_location
                });
                salesOrder.setValue({
                    fieldId: 'trandate',
                    value: new Date()
                });
                salesOrder.setValue({
                    fieldId: 'custbody_bb_project',
                    value: projectId
                });
            } else {
                salesOrder = record.load({
                    type: record.Type.SALES_ORDER,
                    id: salesOrderId,
                    isDynamic: true
                });
            }

            // update salesorder line
            updateSalesOrderLine(salesOrder, adderItem, qty, rate, adderId);

            salesOrder.save({
                ignoreMandatoryFields: true
            });
        }


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
                log.debug("item vendor pricing list count",searchResultCount);
                itemSearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    vendorPrice = vendorPrice + parseFloat(result.getValue({name: 'vendorcostentered'}));
                    return true;
                });
            }
            return vendorPrice;
        }


        function findExistingAdder(projectId, itemId) {
            var existingAdder = null;
            var pricingMethod = null;
            var adderFixedPrice = 0.00
            if (projectId && itemId) {
                //Update case 6589: adding isinactive = false criteria to the search
                var customrecord_bb_project_adderSearchObj = search.create({
                    type: "customrecord_bb_project_adder",
                    filters:
                        [
                            ["custrecord_bb_project_adder_project","anyof", projectId],
                            "AND",
                            ["custrecord_bb_adder_item","anyof", itemId],
                            "AND",
                            ["isinactive","is","F"]
                        ],
                    columns:
                        [
                            "internalid",
                            search.createColumn({
                                name: "custitem_bb_adder_pricing_method",
                                join: "CUSTRECORD_BB_ADDER_ITEM"
                            }),
                            search.createColumn({
                                name: "custitem_bb_adder_fixed_price_amt",
                                join: "CUSTRECORD_BB_ADDER_ITEM"
                            })
                        ]
                });
                var searchResultCount = customrecord_bb_project_adderSearchObj.runPaged().count;
                log.debug("existing adder result count",searchResultCount);
                customrecord_bb_project_adderSearchObj.run().each(function(result){
                    existingAdder = result.getValue({name: 'internalid'});
                    pricingMethod = result.getValue({name: 'custitem_bb_adder_pricing_method', join: 'CUSTRECORD_BB_ADDER_ITEM'});
                    adderFixedPrice = result.getValue({name: 'custitem_bb_adder_fixed_price_amt', join: 'CUSTRECORD_BB_ADDER_ITEM'});
                    return true;
                });
            }
            return {
                existingAdderId: existingAdder,
                pricingMethod: pricingMethod,
                adderFixedPrice: adderFixedPrice
            }
        }


        function getSalesOrder(projectId) {
            var salesOrderId = null;
            if (projectId) {
                var transactionSearchObj = search.create({
                    type: "transaction",
                    filters:
                        [
                            ["custbody_bb_project","anyof", projectId],
                            "AND",
                            ["mainline","is","T"],
                            "AND",
                            ["type","anyof","SalesOrd"]
                        ],
                    columns:
                        [
                            "internalid"
                        ]
                });
                var searchResultCount = transactionSearchObj.runPaged().count;
                log.debug("transactionSearchObj result count",searchResultCount);
                transactionSearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    salesOrderId = result.getValue({name: 'internalid'});
                    return true;
                });
            }
            return salesOrderId;
        }


        function getProjectFieldData(projectId) {
            var obj = {};
            if (projectId) {
                var projObj = search.lookupFields({
                    type: search.Type.JOB,
                    id: projectId,
                    columns: ['custentity_bb_financier_customer', 'subsidiary', 'custentity_bb_project_location', 'custentity_bb_system_size_decimal', 'custentity_bb_originator_vendor']
                });
                if (projObj.custentity_bb_financier_customer.length > 0) {
                    obj['custentity_bb_financier_customer'] = projObj.custentity_bb_financier_customer[0].value;
                }
                if (projObj.subsidiary.length > 0) {
                    obj['subsidiary'] = projObj.subsidiary[0].value;
                }
                if (projObj.custentity_bb_project_location.length > 0) {
                    obj['custentity_bb_project_location'] = projObj.custentity_bb_project_location[0].value;
                }
                if (projObj.custentity_bb_originator_vendor.length > 0) {
                    obj['custentity_bb_originator_vendor'] = projObj.custentity_bb_originator_vendor[0].value;
                }
                obj['custentity_bb_system_size_decimal'] = projObj.custentity_bb_system_size_decimal;
            }
            // log.debug('project object values', obj);
            return obj;
        }


        function updateSalesOrderLine(salesOrder, adderItem, adderQty, price, adderId) {
            var itemLine = findLineIndex(salesOrder, adderId)
            if (itemLine == -1) { //item doesn't exist, add it
                salesOrder.selectNewLine('item');
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: adderItem
                });
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: adderQty
                });
                price = (price < 0) ? 0 : price;
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    value: price
                });
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_bb_adder_bom_id',
                    value: adderId
                });
                salesOrder.commitLine('item');
            } else { //item exists, update qty and rate
                salesOrder.selectLine({
                    sublistId: 'item',
                    line: itemLine
                });
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: adderQty
                });
                price = (price < 0) ? 0 : price;
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    value: price
                });
                salesOrder.commitLine('item');
            }
            return salesOrder;

        }


        function findLineIndex(salesOrder, adderId) {
            if (salesOrder) {

                var foundProjectBomId = salesOrder.findSublistLineWithValue({
                    sublistId: 'item',
                    fieldId: 'custcol_bb_adder_bom_id',
                    value: parseInt(adderId)
                });
                log.debug('found sales order line number', foundProjectBomId);
                return foundProjectBomId;

            }
            return -1;
        }


        function getPodioAdderRecord(projectId) {
            var adderId = null;
            if (projectId) {
                var customrecord_bb_project_adderSearchObj = search.create({
                    type: "customrecord_bb_project_adder",
                    filters:
                        [
                            ["custrecord_bb_project_adder_project","anyof",projectId],
                            "AND",
                            ["custrecord_bb_adder_item","anyof","1555"]
                        ],
                    columns:
                        [
                            "internalid"
                        ]
                });
                var searchResultCount = customrecord_bb_project_adderSearchObj.runPaged().count;
                log.debug("podio adder record count",searchResultCount);
                customrecord_bb_project_adderSearchObj.run().each(function(result){
                    adderId = result.getValue({name: 'internalId'});
                    return true;
                });
            }
            return adderId;
        }
        return {
            onAction : onAction
        };

    });