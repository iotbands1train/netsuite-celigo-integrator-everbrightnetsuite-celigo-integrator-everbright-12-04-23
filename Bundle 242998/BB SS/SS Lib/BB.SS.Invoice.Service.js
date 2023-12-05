/**
 * This is an Invoice service module
 *
 * @exports BB.SS.Invoice.Service
 *
 * @author Michael Golichenko <mgolichenko@bluebanyansolutions.com>
 * @version 0.0.1
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 **/

/**
 * Copyright 2017-2018 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(
		['N/record', 'N/search', './BB.SS.Project.Service', './BB.SS.Transaction.Service', './BB.SS.Milestone.Service'],
		/**
		 * @param recordModule {record}
		 * @param searchModule {search}
		 * @param projectService
		 * @param transactionService
		 * @param milestoneService
		 */
		function(recordModule, searchModule, projectService, transactionService, milestoneService) {

			var // project fields
			PROJECT_FINANCIER_M0_AMOUNT_FIELD = 'custentity_bb_fin_m0_invoice_amount', PROJECT_FINANCIER_M1_AMOUNT_FIELD = 'custentity_bb_fin_m1_invoice_amount', PROJECT_FINANCIER_M2_AMOUNT_FIELD = 'custentity_bb_fin_m2_invoice_amount', PROJECT_FINANCIER_M3_AMOUNT_FIELD = 'custentity_bb_fin_m3_invoice_amount', PROJECT_FINANCIER_M4_AMOUNT_FIELD = 'custentity_bb_fin_m4_invoice_amount', PROJECT_FINANCIER_M5_AMOUNT_FIELD = 'custentity_bb_fin_m5_invoice_amount', PROJECT_FINANCIER_M6_AMOUNT_FIELD = 'custentity_bb_fin_m6_invoice_amount', PROJECT_FINANCIER_M7_AMOUNT_FIELD = 'custentity_bb_fin_m7_invoice_amount', PROJECT_SS_CONFIG_REF_FIELD = 'custentity_bbss_configuration', PROJECT_FINANCIER_FIELD = 'custentity_bb_financier_customer', PROJECT_SUBSIDIARY_FIELD = 'subsidiary', PROJECT_SALESREP_FIELD = 'custentity_bb_sales_rep_employee', PROJECT_ACCOUNTING_METHOD = 'custentity_bb_project_acctg_method', PROJECT_ALREADY_INVOICED_AMOUNT = 'custentity_bb_ss_already_invoiced_amount', PROJECT_SALES_ORDER_TAX = 'custentity_bb_sales_tax_amount',
			// ss config fields
			SS_CONFIG_RECORD = 'customrecord_bb_solar_success_configurtn', SS_CONFIG_FINANCIER_ITEM_FIELD = 'custrecord_bb_financier_item', SS_CONFIG_PROJECT_PAYMENT_ITEM_FIELD = 'custrecord_bb_project_payment_item', SS_CONFIG_PROJECT_ACCTG_METHOD = 'custrecord_bb_project_acctg_method', SS_CONFIG_NONTAXABLE_CODE = 'custrecord_bb_nontaxable_tax_code',
			// invoice fields
			INVOICE_PROJECT_FIELD = 'custbody_bb_project', INVOICE_MILESTONE_FIELD = 'custbody_bb_milestone', INVOICE_TRANDATE_FIELD = 'trandate', INVOICE_ENTITY_FIELD = 'entity', INVOICE_SUBSIDIARY_FIELD = 'subsidiary', INVOICE_SALESREP_FIELD = 'salesrep', INVOICE_LOCATION_FIELD = 'location', INVOICE_ACCOUNTING_METHOD = 'custbody_bb_project_acctg_method', INVOICE_ORIGINAL_TAX_AMOUNT = 'custbody_bb_orig_tax_amount_currency', INVOICE_CONFIG_REFERNCE = 'custbody_bbss_configuration',
			// transaction search fields
			TRANSACTION_INVOICE_TYPE = 'CustInvc', TRANSACTION_CREDIT_MEMO_TYPE = 'CustCred',
			// invoice item fields
			INVOICE_ITEM_RECORD = 'item', INVOICE_ITEM_ITEM_FIELD = 'item', INVOICE_ITEM_AMOUNT_FIELD = 'amount', INVOICE_ITEM_RATE_FIELD = 'rate', INVOICE_ITEM_TAX_CODE = 'taxcode';

			var _exports = {}, _mFieldsOrdered = [PROJECT_FINANCIER_M0_AMOUNT_FIELD, PROJECT_FINANCIER_M1_AMOUNT_FIELD, PROJECT_FINANCIER_M2_AMOUNT_FIELD, PROJECT_FINANCIER_M3_AMOUNT_FIELD, PROJECT_FINANCIER_M4_AMOUNT_FIELD, PROJECT_FINANCIER_M5_AMOUNT_FIELD, PROJECT_FINANCIER_M6_AMOUNT_FIELD, PROJECT_FINANCIER_M7_AMOUNT_FIELD];

			/*
			 *  ALL BUSINESS LOGIC FUNCTIONS
			 */

			/**
			 * <code>createInvoiceFromProjectIdAndMilestoneName</code> function
			 *
			 * @governance 47
			 * @param projectId {number|string} Project internal ID
			 * @param milestoneName {string} Milestone name (M0, M1, M2,  M3)
			 *
			 * @return {void}
			 *
			 * @static
			 * @function createInvoiceFromProjectIdAndMilestoneName
			 */
			function createInvoiceFromProjectIdAndMilestoneName(projectId, milestoneName, config) {
				var _project = recordModule.load({
					type : recordModule.Type.JOB,
					id : projectId
				});
				if (_project) {
					_project = createInvoiceFromProjectAndMilestoneName(_project, milestoneName, config);
				}
				return _project;
			}

			/**
			 * <code>createInvoiceFromProjectAndMilestoneName</code> function
			 *
			 * @governance 42
			 * @param project {Record} Project record
			 * @param milestoneName {string} Milestone name (M0, M1, M2,  M3)
			 * @param config {Record} BB Configuration Record
			 *
			 * @return JSON representing project from setting rev rec method
			 *
			 * @static
			 * @function createInvoiceFromProjectAndMilestoneName
			 */
			function createInvoiceFromProjectAndMilestoneName(project, milestoneName, config, milestoneDate) {

				if (milestoneName == 'M0') {
					var projectFianicingType = project.getText({
						fieldId : 'custentity_bb_financing_type'
					});
					if (projectFianicingType == 'Cash') {
						var configCashTransType = config.getText({
							fieldId : 'custrecord_bb_ss_m0_cash_trans_type'
						});
						if (configCashTransType == 'Invoice') {
							createInvoiceAction(project, milestoneName, config, milestoneDate);
						}
					}
					else {
						var configFinanceTransType = config.getText({
							fieldId : 'custrecord_bb_ss_m0_finance_tran_type'
						});
						if (configFinanceTransType == 'Invoice') {
							createInvoiceAction(project, milestoneName, config, milestoneDate);
						}
					}
				}
				else { // milestone greater than M0
					createInvoiceAction(project, milestoneName, config, milestoneDate);
				}
				return project;
			}

			function isNull(param) {
				return (param == null || param == '' || param == undefined);
			}

			function createInvoiceAction(project, milestoneName, config, milestoneDate) {
				var _shouldGenerateInvoice = config.getValue({
					fieldId : 'custrecord_bb_ss_generate_invoices'
				});
				var invoiceActuals = config.getValue({
					fieldId : 'custrecord_bb_invoice_actuals_boolean'
				});
				if (invoiceActuals)
					return project;
				if (!_shouldGenerateInvoice)
					return project;
				if (!transactionService.canGenerateTransaction(project))
					return project;
				var _milestoneNumber = milestoneService.convertMilestoneFromNameToIndex(milestoneName);
				if (_milestoneNumber < _mFieldsOrdered.length) {
					var _mFieldAmount = project.getValue({
						fieldId : _mFieldsOrdered[_milestoneNumber]
					});
					if (_mFieldAmount > 0) {
						var _financierId = project.getValue({
							fieldId : PROJECT_FINANCIER_FIELD
						});
						var directPayItem = config.getValue({fieldId: 'custrecord_bb_direct_pay_item'});
						var _invoices = transactionService.findAllTransactionsByProjectIdAndVendorId(project.id, _financierId, [TRANSACTION_INVOICE_TYPE, TRANSACTION_CREDIT_MEMO_TYPE], null, directPayItem);
						if (transactionService.milestoneInvoiceExists(_invoices, _milestoneNumber))
							return project;
						var _alreadyInvoicedAmount = project.getValue({
							fieldId : PROJECT_ALREADY_INVOICED_AMOUNT
						});
						var _newInvoiceAmount = transactionService.calculateAmount(project, _invoices, _milestoneNumber, _mFieldsOrdered, _alreadyInvoicedAmount);
						if (_newInvoiceAmount > 0) {
							var projLocation = project.getValue('custentity_bb_project_location');
							var _mField = milestoneService.findMilestoneByName(milestoneName);
							if (_mField != undefined) {
								var _locationId = (projLocation) ? projLocation : projectService.getLocationId(project, config);
								var _itemId = config.getValue({
									fieldId : SS_CONFIG_FINANCIER_ITEM_FIELD
								});
								createInvoice(project, _financierId, _mField.id, _locationId, config, _newInvoiceAmount, milestoneDate, _itemId);
								// create rebate invoice check if rebate invoice is already created
								var generateRebateOnMilestone = project.getValue({fieldId: 'custentity_bb_gen_rebate_on_milestone'});
								var deductRebateAllMilestone = project.getValue({fieldId: 'custentity_bb_dedct_rebate_all_milestone'});
								if (_mField.id == generateRebateOnMilestone && !deductRebateAllMilestone) {
									var rebateGenerated = checkForRebateInvoice(project);
									var rebateItem = config.getValue({fieldId: 'custrecord_bb_rebate_item'});
									var rebateCustomer = project.getValue({fieldId: 'custentity_bb_rebate_customer'});
									var rebateAmt = project.getValue({fieldId: 'custentity_bb_fin_rebate_inv_amount'});
									if (!rebateGenerated && rebateAmt > 0 && rebateCustomer) {
										createInvoice(project, rebateCustomer, 13, _locationId, config, rebateAmt, milestoneDate, rebateItem);
									}
								} else if (deductRebateAllMilestone) {
									var rebateGenerated = checkForRebateInvoice(project);
									var rebateItem = config.getValue({fieldId: 'custrecord_bb_rebate_item'});
									var rebateCustomer = project.getValue({fieldId: 'custentity_bb_rebate_customer'});
									var rebateAmt = project.getValue({fieldId: 'custentity_bb_fin_rebate_inv_amount'});
									if (!rebateGenerated && rebateAmt > 0 && rebateCustomer) {
										createInvoice(project, rebateCustomer, 13, _locationId, config, rebateAmt, milestoneDate, rebateItem);
									}
								}
								var projectAccountingMethod = project.getValue({
									fieldId : PROJECT_ACCOUNTING_METHOD
								});
								if (isNull(projectAccountingMethod)) {//only set if null
									project.setValue({
										fieldId : PROJECT_ACCOUNTING_METHOD,
										value : config.getValue({
											fieldId : SS_CONFIG_PROJECT_ACCTG_METHOD
										}),
									});
								}
							}
							else {
								log.error('_mField is undefined', 'According to the search from script BB.SS.Milestone.Service.js, script failed to find Milestone Custom List element for ' + 
										milestoneName + 
										'. \nPlease verify Milestone Custom List');
							}
						}
					}
				}
				return project;
			}

			function isNull(param) {
				return (param == null || param == '' || param == undefined);
			}

			/*
			 *  ALL DATA ACCESS FUNCTIONS
			 */

			/**
			 * <code>createInvoice</code> function
			 *
			 * @governance 15
			 * @param project {Record} Project record
			 * @param financierId {number|string} Financier internal ID
			 * @param milestoneId {number|string} Milestone internal ID
			 * @param locationId {number|string} Location internal ID
			 * @param config {Record} BB SS Configuration record
			 * @param invoiceValue {number} Amount of the invoice
			 *
			 * @return {void}
			 *
			 * @static
			 * @function createInvoice
			 */
			function createInvoice(project, financierId, milestoneId, locationId, config, invoiceValue, milestoneDate, itemId) {
				var _newInvoice = recordModule.create({
					type : recordModule.Type.INVOICE
				});
				if (!itemId) {
					itemId = config.getValue({
						fieldId : SS_CONFIG_PROJECT_PAYMENT_ITEM_FIELD
					});
				}
				var salesOrderTax = project.getValue({
					fieldId : PROJECT_SALES_ORDER_TAX
				});
				log.debug('project sales order tax amount in create invoice function', salesOrderTax);
				log.debug('milestone id', milestoneId);

				_newInvoice.setValue({
					fieldId : INVOICE_PROJECT_FIELD,
					value : project.id
				});
				_newInvoice.setValue({
					fieldId : INVOICE_MILESTONE_FIELD,
					value : milestoneId
				});
				_newInvoice.setValue({
					fieldId : INVOICE_TRANDATE_FIELD,
					value : (milestoneDate) ? milestoneDate : new Date()
				});
				_newInvoice.setValue({
					fieldId : INVOICE_ENTITY_FIELD,
					value : financierId
				});
				if (config.getValue({
					fieldId : 'custrecord_bb_ss_has_subsidiaries'
				}))
					_newInvoice.setValue({
						fieldId : INVOICE_SUBSIDIARY_FIELD,
						value : project.getValue({
							fieldId : PROJECT_SUBSIDIARY_FIELD
						})
					});
				_newInvoice.setValue({
					fieldId : INVOICE_SALESREP_FIELD,
					value : project.getValue({
						fieldId : PROJECT_SALESREP_FIELD
					})
				});
				_newInvoice.setValue({
					fieldId : INVOICE_LOCATION_FIELD,
					value : locationId
				});
				_newInvoice.setValue({
					fieldId : INVOICE_ACCOUNTING_METHOD,
					value : getInvoiceAccountingMethod(project, config)
				});
				_newInvoice.setValue({
					fieldId : INVOICE_CONFIG_REFERNCE,
					value : 1
				});
				if (milestoneId == 3) {
					if (salesOrderTax) {
						_newInvoice.setValue({
							fieldId : INVOICE_ORIGINAL_TAX_AMOUNT,
							value : salesOrderTax
						});
					}
				}
				// new feature to set discount item for dealer fees in the discount item field just above lines sublist.
				var dealerFeeAmt = getInvoiceDealerFeeAmount(project, invoiceValue, milestoneId);
				var dealerFeeItem = config.getValue({
					fieldId : 'custrecord_bb_dealer_fee_item'
				});
				log.debug('dealer fee amount', dealerFeeAmt);
				log.debug('dealer fee item', dealerFeeItem);

				if (dealerFeeAmt && dealerFeeItem) {
					var formattedDealerFeeAmt = parseFloat(dealerFeeAmt).toFixed(2); // format to 2 decimal places 
					_newInvoice.setValue({
						fieldId : 'discountitem',
						value : dealerFeeItem
					});
					_newInvoice.setValue({
						fieldId : 'discountrate',
						value : formattedDealerFeeAmt
					});
				}

				_newInvoice.insertLine({
					sublistId : INVOICE_ITEM_RECORD,
					line : 0
				});
				_newInvoice.setSublistValue({
					sublistId : INVOICE_ITEM_RECORD,
					line : 0,
					fieldId : INVOICE_ITEM_ITEM_FIELD,
					value : itemId
				});
				_newInvoice.setSublistValue({
					sublistId : INVOICE_ITEM_RECORD,
					line : 0,
					fieldId : INVOICE_ITEM_AMOUNT_FIELD,
					value : invoiceValue
				});
				_newInvoice.setSublistValue({
					sublistId : INVOICE_ITEM_RECORD,
					line : 0,
					fieldId : INVOICE_ITEM_RATE_FIELD,
					value : invoiceValue
				});
				_newInvoice.setSublistValue({
					sublistId : INVOICE_ITEM_RECORD,
					line : 0,
					fieldId : INVOICE_ITEM_TAX_CODE,
					value : config.getValue({
						fieldId : SS_CONFIG_NONTAXABLE_CODE
					})
				});

				// set direct pay line item here
				var directPaySavedSearch = config.getValue({fieldId: 'custrecord_bb_direct_pay_search'});
				var directPayItem = config.getValue({fieldId: 'custrecord_bb_direct_pay_item'});
				if (directPayItem && directPaySavedSearch) {
					var directPayAmt = getDirectPayTotal(directPaySavedSearch, project.id);
					var calculatedDirectPayAmt = calculateDirectPayAmount(project.id, milestoneId, directPayAmt);
					if (calculatedDirectPayAmt < 0) {
						_newInvoice.insertLine({
							sublistId : INVOICE_ITEM_RECORD,
							line : 1
						});
						_newInvoice.setSublistValue({
							sublistId : INVOICE_ITEM_RECORD,
							line : 1,
							fieldId : INVOICE_ITEM_ITEM_FIELD,
							value : directPayItem
						});
						_newInvoice.setSublistValue({
							sublistId : INVOICE_ITEM_RECORD,
							line : 1,
							fieldId : INVOICE_ITEM_AMOUNT_FIELD,
							value : calculatedDirectPayAmt
						});
						_newInvoice.setSublistValue({
							sublistId : INVOICE_ITEM_RECORD,
							line : 1,
							fieldId : INVOICE_ITEM_RATE_FIELD,
							value : calculatedDirectPayAmt
						});
					}
				}

				_newInvoice.save({
					ignoreMandatoryFields : true
				});
			}

			function getDirectPayTotal(searchId, projectId) {
				var directPayAmount = 0;
				var directPay = searchModule.load({
					id: searchId
				});
				if (projectId) {
					var additionalFilters = ["AND", ["custbody_bb_project","anyof", projectId]];
					var newFilterExpression = directPay.filterExpression.concat(additionalFilters);
					directPay.filterExpression = newFilterExpression;
					directPay.run().each(function(results) {
						directPayAmount = results.getValue({name: 'amount', summary: 'SUM'});
					});
					log.debug('direct pay amount from search', directPayAmount);
				}
				return directPayAmount
			}

			function calculateDirectPayAmount(projectId, milestoneId, directPayAmount) {
				var calculatedDirectPayAmount = 0;
				if (projectId) {
					var jobSearchObj = searchModule.create({
						type: "job",
						filters:
							[
								["isinactive", "is", "F"],
								"AND",
								["internalid", "anyof", projectId]
							],
						columns:
							[
								searchModule.createColumn({
									name: "custrecord_bb_direct_pay_app_method",
									join: "CUSTENTITY_BB_FINANCIER_PAYMENT_SCHEDULE",
									label: "Direct Pay Application Method"
								})
							]
					});
					var results = jobSearchObj.run().getRange({start: 0, end: 1});
					if (results.length > 0) {
						var directPayMethod = results[0].getValue({
							name: 'custrecord_bb_direct_pay_app_method',
							join: 'CUSTENTITY_BB_FINANCIER_PAYMENT_SCHEDULE'
						});
						var directPayMapping = mapApplicationMethodToMilestoneId(directPayMethod);
						if (directPayMapping == -1) { // apply evenly
							calculatedDirectPayAmount = 0;
						} else if (directPayMapping) {
							if (directPayMapping == milestoneId) {
								calculatedDirectPayAmount = parseFloat(directPayAmount) * -1;
							}
						}
					}
				}
				return calculatedDirectPayAmount;
			}

			function mapApplicationMethodToMilestoneId(applicationMethod) {
				if (applicationMethod == 1) {
					return -1;
				} else if (applicationMethod == 2) {
					return 1; // M0
				} else if (applicationMethod == 3) {
					return 3; // M1
				} else if (applicationMethod == 4) {
					return 4; // M2
				} else if (applicationMethod == 5) {
					return 5; // M3
				} else if (applicationMethod == 6) {
					return 8; // M4
				} else if (applicationMethod == 7) {
					return 9; // M5
				} else if (applicationMethod == 8) {
					return 10; // M6
				} else if (applicationMethod == 9) {
					return 11; // M7
				} else {
					return null
				}
			}

			function getInvoiceAccountingMethod(project, config) {
				var projectAccountingMethod = project.getValue({
					fieldId : PROJECT_ACCOUNTING_METHOD
				});
				return isNull(projectAccountingMethod) ? config.getValue({
					fieldId : SS_CONFIG_PROJECT_ACCTG_METHOD
				}) : projectAccountingMethod;
			}

			function getInvoiceDealerFeeAmount(project, invoiceValue, milestoneId) {
				var dealerFeePercent = parseFloat(project.getValue({
					fieldId : 'custentity_bb_dealer_fee_percent'
				})) / 100;
				var dealerFee = null;
				if (milestoneId == 1) { // m0
					if (project.getValue({
						fieldId : 'custentity_bb_m0_dealer_fee_amount'
					})) {
						dealerFee = (invoiceValue * dealerFeePercent) * -1;
					}
				}
				else if (milestoneId == 3) { // m1
					if (project.getValue({
						fieldId : 'custentity_bb_m1_dealer_fee_amount'
					})) {
						dealerFee = dealerFee = (invoiceValue * dealerFeePercent) * -1;
					}
				}
				else if (milestoneId == 4) { // m2
					if (project.getValue({
						fieldId : 'custentity_bb_m2_dealer_fee_amount'
					})) {
						dealerFee = dealerFee = (invoiceValue * dealerFeePercent) * -1;
					}
				}
				else if (milestoneId == 5) { // m3
					if (project.getValue({
						fieldId : 'custentity_bb_m3_dealer_fee_amount'
					})) {
						dealerFee = dealerFee = (invoiceValue * dealerFeePercent) * -1;
					}
				}
				else if (milestoneId == 8) { // m4
					if (project.getValue({
						fieldId : 'custentity_bb_m4_dealer_fee_amount'
					})) {
						dealerFee = dealerFee = (invoiceValue * dealerFeePercent) * -1;
					}
				}
				else if (milestoneId == 9) { // m5
					if (project.getValue({
						fieldId : 'custentity_bb_m5_dealer_fee_amount'
					})) {
						dealerFee = dealerFee = (invoiceValue * dealerFeePercent) * -1;
					}
				}
				else if (milestoneId == 10) { // m6
					if (project.getValue({
						fieldId : 'custentity_bb_m6_dealer_fee_amount'
					})) {
						dealerFee = dealerFee = (invoiceValue * dealerFeePercent) * -1;
					}
				}
				else if (milestoneId == 11) { // m7
					if (project.getValue({
						fieldId : 'custentity_bb_m7_dealer_fee_amount'
					})) {
						dealerFee = dealerFee = (invoiceValue * dealerFeePercent) * -1;
					}
				}
				else {
					// do nothing by default
				}

				return dealerFee;
			}

			function checkForRebateInvoice(project) {
				var rebateGenerated = false;
				var invoiceSearchObj = searchModule.create({
					type: "invoice",
					filters:
						[
							["type","anyof","CustInvc"],
							"AND",
							["mainline","is","T"],
							"AND",
							["custbody_bb_milestone","anyof","13"],
							"AND",
							["custbody_bb_project","anyof",project.id]
						],
					columns:
						[
							searchModule.createColumn({name: "internalid", label: "Internal ID"}),
							searchModule.createColumn({name: "custbody_bb_milestone", label: "Milestone"}),
							searchModule.createColumn({name: "amount", label: "Amount"})
						]
				});
				var result = invoiceSearchObj.run().getRange({start:0, end:1});
				if (result.length > 0) {
					rebateGenerated = true;
				}
				return rebateGenerated;
			}

			_exports.createInvoiceFromProjectIdAndMilestoneName = createInvoiceFromProjectIdAndMilestoneName;
			_exports.createInvoiceFromProjectAndMilestoneName = createInvoiceFromProjectAndMilestoneName;

			return _exports;
		});