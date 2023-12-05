/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 * @NModuleScope public
 * @author Matt Lehman
 * @overview -  checks for related Purchase Order on each line item
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

define(['N/record'], function(record) {

    function onAction(scriptContext) {
        var createdPOLinesArr = [];
        var nonCreatedPOLinesArr = [];
        var salesOrder = scriptContext.newRecord;
        var id = scriptContext.newRecord.id;

        var lineCount = salesOrder.getLineCount({
            sublistId: 'item'
        });
        for (var i = 0; i < lineCount; i++) {
            var itemType = salesOrder.getSublistValue({
                sublistId: 'item',
                fieldId: 'itemtype',
                line: i
            });
            if (itemType == 'InvtPart' || itemType == 'NonInvtPart') {
                var poVendor = salesOrder.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'povendor',
                    line: i
                });
                var autoPO = salesOrder.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_bb_purchase_order_id',
                    line: i
                });
                if (poVendor && autoPO) {
                    createdPOLinesArr.push('T');
                }
                if (poVendor && !autoPO) {
                    nonCreatedPOLinesArr.push('F');
                }
            }
        }
        if (nonCreatedPOLinesArr.length >= 1) {
            return 'T';
        } else {
            return 'F'
        }
    }

    return {
        onAction : onAction
    };
    
});