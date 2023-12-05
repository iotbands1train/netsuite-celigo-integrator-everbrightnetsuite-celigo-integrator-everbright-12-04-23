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

define(['N/record', 'N/runtime', './SS Lib/BB.SS.SetTransactionAccountingMethod'],
	function(record, runtime,  accountingMethod) {
		function beforeSubmit(scriptContext) {
			var trigger = scriptContext.type;
			var runtimeExe = runtime.executionContext;

			if(trigger == 'create' && runtimeExe != 'WORKFLOW'){
				log.debug('execution type',runtimeExe);
				var newVendorBill = scriptContext.newRecord;
				newVendorBill = accountingMethod.setTransactionAccountingMethod(newVendorBill);
			}
		}
		
		return {
			beforeSubmit: beforeSubmit
		};    
});