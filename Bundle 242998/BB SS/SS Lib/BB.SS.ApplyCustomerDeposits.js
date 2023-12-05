/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Matt Lehman
 * @overview Customer Deposit Library
 */

define(['N/record', 'N/search'], function(record, search) {

	function applyDepositToInvoices(projectId, scriptContext, newApprovalStatus) {
		var milestone = scriptContext.newRecord.getText({
            fieldId: 'custbody_bb_milestone'
        });
        var invoiceId = scriptContext.newRecord.id;
        var invoiceAmt = scriptContext.newRecord.getValue({
        	fieldId: 'amountremaining'
        });
        if (milestone == 'M1' || milestone == 'M2' || milestone == 'M3') {
        	var depositRecords = getDepositRecord(projectId);
        	if (depositRecords.length > 0) {
        		for (var d = 0; d < depositRecords.length; d++) {
        			var depositId = depositRecords[d].internalId;
        			var depositAmount = depositRecords[d].depositAmt;
        			var depositStatus = depositRecords[d].depositStatus;
        			log.debug('Deposit Record Status - Fully applied or Not Deposited', depositStatus);
        			if (depositStatus != 'applied' && newApprovalStatus != 'Paid in Full') {
        				transformDepositRecord(depositId, depositAmount, invoiceId, invoiceAmt);
        			}
        		}//end of loop
        	}// end of deposit record check
        }// end of milestone check
		
	}

	function transformDepositRecord(depositId, depositAmount, invoiceId, invoiceAmt) {
		var depositApplication = record.transform({
			fromType: record.Type.CUSTOMER_DEPOSIT,
			fromId: depositId,
			toType: record.Type.DEPOSIT_APPLICATION,
			isDynamic: true
		});
		depositApplication.setValue({
			fieldId: 'trandate',
			value: new Date()
		});
		depositApplication.setValue({
			fieldId: 'memo',
			value: 'Auto applied deposit to Milestone Invoice'
		});
		var applicationLines = depositApplication.getLineCount({
			sublistId: 'apply'
		});
		if (applicationLines > 0) {
			for (var a = 0; a < applicationLines; a++) {
				var sublistInvId = depositApplication.getSublistValue({
					sublistId: 'apply',
					fieldId: 'internalid',
					line: a
				});
				if (sublistInvId == invoiceId) {
					depositApplication.selectLine({
						sublistId: 'apply',
						line: a
					});
					if (depositAmount > invoiceAmt) { // if the deposit amount > invoice amount, only apply only a deposit amount = to the invoice amount.
						depositApplication.setCurrentSublistValue({
							sublistId: 'apply',
							fieldId: 'amount',
							value: invoiceAmt,
							ignoreFieldChange: false
						});
					} else {
						depositApplication.setCurrentSublistValue({
							sublistId: 'apply',
							fieldId: 'amount',
							value: depositAmount,
							ignoreFieldChange: false
						});						
					}
					depositApplication.setCurrentSublistValue({
						sublistId: 'apply',
						fieldId: 'apply',
						value: true,
						ignoreFieldChange: false
					});
				}// end of matching invoice number on apply lines
			}// end of loop
			depositApplication.save({
				ignoreMandatoryFields: true
			});
		}// end of application line check, save is inserted above, prevents error if deposit application doesnt not have anylines, you cant save the record.


	}

	function getDepositRecord(projectId) {
		var depositRecArr = [];
		var customerdepositSearchObj = search.create({
		    type: "customerdeposit",
		    filters:
		    [
		        ["type","anyof","CustDep"], 
		        "AND", 
		        ["custbody_bb_project","anyof", projectId], 
		        "AND", 
		        ["mainline","is","T"]
		    ],
		    columns:
		    [
		        "internalid",
		        "tranid",
		        "entity",
		        "custbody_bb_project",
		        "statusref",
		        "status",
		        "amount"
		    ]
		});
		customerdepositSearchObj.run().each(function(result){
			var internalId = result.getValue({
				name: 'internalid'
			});
			var docNumber = result.getValue({
				name: 'tranid'
			});
			var customer = result.getValue({
				name: 'entity'
			});
			var projectNum = result.getValue({
				name: 'custbody_bb_project'
			});
			var depositStatusRef = result.getValue({
				name: 'statusref'
			});
			var depositStatus = result.getValue({
				name: 'status'
			});
			var depositAmt = result.getValue({
				name: 'amount'
			});
			if (depositStatus != 'applied') {
				depositRecArr.push({
					internalId: internalId,
					docNumber: docNumber,
					customer: customer,
					projectNum: projectNum,
					depositStatusRef: depositStatusRef,
					depositStatus: depositStatus,
					depositAmt: depositAmt
				});
			}
		    return true;
		});
		return depositRecArr;
    }
   
    return {
        applyDepositToInvoices: applyDepositToInvoices,
        getDepositRecord: getDepositRecord
    };
    
});