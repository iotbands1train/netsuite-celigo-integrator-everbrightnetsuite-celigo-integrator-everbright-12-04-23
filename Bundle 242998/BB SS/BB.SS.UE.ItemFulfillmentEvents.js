/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @author Tyler Mann
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

define(['N/record', 'N/search', './SS Lib/BB.SS.SetTransactionAccountingMethod'], function(record, search, accountingMethod) {
	var SHIPPED_STATUS = 'C';
	function beforeSubmit(scriptContext) {
		var trigger = scriptContext.type;
		if (trigger == 'create') {
			var newItemFulfillment = scriptContext.newRecord;
			newItemFulfillment = accountingMethod.setTransactionAccountingMethod(newItemFulfillment);
			setlineUUIDS(scriptContext.newRecord);
		}
		if (trigger == 'edit') {
			setlineUUIDS(scriptContext.newRecord);
		}

	}

	function afterSubmit(scriptContext) {
		var itemFulfillment = scriptContext.newRecord;

		var projectId = itemFulfillment.getValue({
			fieldId : 'custbody_bb_project'
		});

		var epcRole = itemFulfillment.getText({
			fieldId : 'custbody_bb_ss_if_epc_role'
		});

		var status = itemFulfillment.getValue({
			fieldId : 'shipstatus'
		});

		if (projectId && epcRole == 'Installer' && status == SHIPPED_STATUS) {
			var purchaseOrderArr = getProjectPurchaseOrders(projectId);

			if (purchaseOrderArr.length > 0) {
				for (var p = 0; p < purchaseOrderArr.length; p++) {
					var poId = purchaseOrderArr[p];
					var purchaseOrder = record.load({
						type : record.Type.PURCHASE_ORDER,
						id : poId,
						isDynamic : true
					});
					closePOLines(purchaseOrder, itemFulfillment);
					purchaseOrder.save({
						ignoreMandatoryFields : true
					});
				}
			}
		}
	}

	function getProjectPurchaseOrders(projectId) {
		var purchaseOrderArr = [];
		var purchaseorderSearchObj = search.create({
			type : "purchaseorder",
			filters : [["custbody_bb_project", "anyof", projectId], "AND", ["type", "anyof", "PurchOrd"], "AND", ["mainline", "is", "T"]],
			columns : ["type", "internalid", "custbody_bb_project"]
		});
		purchaseorderSearchObj.run().each(function(result) {
			var poId = result.getValue({
				name : 'internalid'
			});
			purchaseOrderArr.push(poId);
			return true;
		});
		return purchaseOrderArr;
	}

	function closePOLines(purchaseOrder, itemFulfillment) {
		var ifItems = getItemFulfillmentLines(itemFulfillment); // array of IF item Id's
		var poLineCount = purchaseOrder.getLineCount({
			sublistId : 'item'
		});
		for (var i = 0; i < poLineCount; i++) {
			purchaseOrder.selectLine({
				sublistId : 'item',
				line : i
			});
			var poItemId = purchaseOrder.getCurrentSublistValue({
				sublistId : 'item',
				fieldId : 'item'
			});

			var index = ifItems.indexOf(poItemId);
			if (index != -1) {
				purchaseOrder.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'isclosed',
					value : true
				});
				purchaseOrder.commitLine({
					sublistId : 'item'
				});
			}

		}
	}

	function getItemFulfillmentLines(itemfulfillment) {
		var itemsArr = [];
		var ifLineCount = itemfulfillment.getLineCount({
			sublistId : 'item'
		});
		if (ifLineCount > 0) {
			for (var x = 0; x < ifLineCount; x++) {

				var ifItemId = itemfulfillment.getSublistValue({
					sublistId : 'item',
					fieldId : 'item',
					line : x
				});
				itemsArr.push(ifItemId);
			}
		}
		return itemsArr;
	}

	function setlineUUIDS(itemFulfillment) {
		var ifLineCount = itemFulfillment.getLineCount({
			sublistId : 'item'
		});
		if (ifLineCount > 0) {
			for (var x = 0; x < ifLineCount; x++) {

				var ifUUID = itemFulfillment.getSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_bb_bos_item_fulfil_line_id',
					line : x
				});
				if (!ifUUID) {
					itemFulfillment.setSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_bb_bos_item_fulfil_line_id',
						value: create_UUID(),
						line : x
					});
				}
			}
		}
	}

	function create_UUID(){
		var dt = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (dt + Math.random()*16)%16 | 0;
			dt = Math.floor(dt/16);
			return (c=='x' ? r :(r&0x3|0x8)).toString(16);
		});
		return uuid;
	}

	return {
		beforeSubmit : beforeSubmit,
		afterSubmit : afterSubmit
	};
});