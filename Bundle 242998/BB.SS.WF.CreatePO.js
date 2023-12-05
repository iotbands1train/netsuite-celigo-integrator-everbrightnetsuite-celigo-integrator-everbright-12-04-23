/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 * @NModuleScope public
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
define([
  'N/record',
  './BB SS/SS Lib/BB.SS.MD.CreatePO',
  './BB SS/SS Lib/BB_SS_MD_SolarConfig'
], function (
  record,
  upsertPO,
  bConfig
) {

  function onAction(scriptContext) {
    var salesOrder = record.load({
      type: record.Type.SALES_ORDER,
      id: scriptContext.newRecord.id,
      isDynamic: true
    });

    var purchaseOrderIds = upsertPO.createPurchaseOrder(salesOrder, scriptContext); // returns an array of object for sales order lines containing po id
    setPurchaseOrderIds(purchaseOrderIds, salesOrder);
    salesOrder.save({
      ignoreMandatoryFields: true
    });
  }

  function setPurchaseOrderIds(purchaseOrderIds, salesOrder) {
    var soLineCount = salesOrder.getLineCount({
      sublistId: 'item'
    });
    var isCrossSubsidiary = salesOrder.getValue('iscrosssubtransaction');
    var ignoreCommitted = bConfig.getConfigurations(['custrecord_bb_so_to_po_ignore_committed']).custrecord_bb_so_to_po_ignore_committed.value;

    if (purchaseOrderIds.length > 0) {
      for (var p = 0; p < purchaseOrderIds.length; p++) {
        var vendor = purchaseOrderIds[p].vendId;
        var poId = purchaseOrderIds[p].purchaseOrderId;
        var location = purchaseOrderIds[p].locationId;

        for (var s = 0; s < soLineCount; s++) {
          var vendorId = salesOrder.getSublistValue({
            sublistId: 'item',
            fieldId: 'povendor',
            line: s
          });
          var autoPoNum = salesOrder.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_bb_purchase_order_id',
            line: s
          });
          var qty = salesOrder.getSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            line: s
          });
          var quantityCommitted = salesOrder.getSublistValue({
            sublistId: 'item',
            fieldId: 'quantitycommitted',
            line: s
          }) || 0;
          var inventorylocation = salesOrder.getSublistValue({
            sublistId: 'item',
            fieldId: 'inventorylocation',
            line: s
          });
          if (vendorId == vendor && !autoPoNum) {
            if (((isCrossSubsidiary && inventorylocation == location) || !isCrossSubsidiary) && ((ignoreCommitted && qty - quantityCommitted != 0) || !ignoreCommitted)) {

              log.debug('qty', qty);
              log.debug('quantityCommitted', quantityCommitted);
              log.debug('ignoreCommitted', ignoreCommitted);
              salesOrder.selectLine({
                sublistId: 'item',
                line: s
              });
              salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_bb_purchase_order_id',
                value: poId
              });
              salesOrder.commitLine({
                sublistId: 'item'
              });
            }
          }
        }// end of sales order loop
      }// end of po data loop
    }
  }

  return {
    onAction: onAction
  };
});
