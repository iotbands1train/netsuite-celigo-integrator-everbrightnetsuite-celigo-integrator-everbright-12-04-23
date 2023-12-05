/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope Public
 * @author Matt Lehman
 * @overview - Script is executed after BayWa get Item catalog is finished processing a request, this script runs and removes all items still marked as preferred vendor
 */
define(['N/search', 'N/record'], function(search, record) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        var ssConfig = record.load({
            type: 'customrecord_bb_solar_success_configurtn',
            id: 1
        });
        var activeStatusId = ssConfig.getValue({
            fieldId: 'custrecord_bb_bw_active_item_status'
        });
        var baywaVendorId = ssConfig.getValue({
            fieldId: 'custrecord_bb_baywa_vendor'
        });
        var itemSearchObj = search.create({
            type: "item",
            filters:
            [
                // ["formulatext: {custrecord_bb_vendor_item.internalid}","isempty",""], 
                // "AND", 
                // ["type","anyof","InvtPart"],
                // "AND", 
                // ["vendor","anyof", baywaVendorId]
                ["type","anyof","InvtPart"], 
                "AND", 
                ["ispreferredvendor","any",""], 
                "AND", 
                ["othervendor","anyof", baywaVendorId]
            ],
            columns:
                [
                    "internalid",
                    search.createColumn({
                        name: "itemid",
                        sort: search.Sort.ASC
                    }),
                    "othervendor",
                    "custitem_bb_item_status",
                    search.createColumn({
                        name: "custrecord_bb_vendor_item_stock_status",
                        join: "CUSTRECORD_BB_VENDOR_ITEM"
                    })
               ]
        });
        var searchResultCount = itemSearchObj.runPaged().count;
        log.debug("itemSearchObj result count",searchResultCount);
        itemSearchObj.run().each(function(result){
            var itemId = result.getValue({
                name: 'internalid'
            });
            var vendor = result.getValue({
                name: 'othervendor'
            });
            var itemStatus = result.getValue({
                name: 'custitem_bb_item_status'
            });
            var detailStatus = result.getValue({
                 name: 'custrecord_bb_vendor_item_stock_status',
                 join: 'CUSTRECORD_BB_VENDOR_ITEM'
            });

            var itemRec = record.load({
                type: record.Type.INVENTORY_ITEM,
                id: itemId,
                isDynamic: true
            });

            if (detailStatus == null || detailStatus != activeStatusId) {
                var vendorLineNumber = itemRec.findSublistLineWithValue({
                    sublistId: 'itemvendor',
                    fieldId: 'vendor',
                    value : baywaVendorId
                });
                if (vendorLineNumber != -1) {
                    itemRec.removeLine({
                        sublistId: 'itemvendor',
                        line: vendorLineNumber
                    });
                    itemRec.save({
                        ignoreMandatoryFields: true
                    });

                }
            }
            return true;
        });

    }

    return {
        execute: execute
    };
    
});
