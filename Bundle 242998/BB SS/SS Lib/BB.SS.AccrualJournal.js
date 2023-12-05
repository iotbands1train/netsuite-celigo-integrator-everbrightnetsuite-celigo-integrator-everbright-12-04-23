/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Tyler Mann
 * @author Matt Lehman
 * @version 0.0.3
 * @fileOverview This Custom Module library is used to create
 * Revenue Recognition Journal entries
 */

/**
 * Copyright 2017-2020 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/record', 'N/search', 'N/config', './BB_SS_MD_SolarConfig', './BB.SS.Transaction.Service'],
	function(record, search, nsConfig, solarConfig, transactionService) {

		var // project fields
			PROJECT_SUBSIDIARY_FIELD = 'subsidiary',
			// ss config fields
			SS_CONFIG_RECORD = 'customrecord_bb_solar_success_configurtn',
			SS_CONFIG_DEFERRED_REVENUE_ACCOUNT_FIELD = 'custrecord_bb_deferred_revenue_account',
			SS_CONFIG_REVENUE_ACCOUNT_FIELD = 'custrecord_bb_revenue_account',
			SS_CONFIG_DEFERRED_REVENUE_ACCOUNT_MULTI_FIELD = 'custrecord_bb_defered_revenue_accounts',
			SS_CONFIG_DEFERRED_PROJECT_COST_ACCOUNT_FIELD = 'custrecord_bb_deferred_proj_cost_account',
			SS_CONFIG_DEFERRED_PROJECT_COST_ACCOUNT_MULTI_FIELD = 'custrecord_bb_deferred_proj_expnse_accnt',
			SS_CONFIG_EQUIPMENT_COST_ACCOUNT_FIELD = 'custrecord_bb_equipment_costs_account',
			SS_CONFIG_LABOR_COST_ACCOUNT_FIELD = 'custrecord_bb_direct_labor_cost_account',
			SS_CONFIG_OUTSIDE_LABOR_ACCOUNT_FIELD = 'custrecord_bb_ss_outside_labor_cost_acct',
			SS_CONFIG_SHIPPING_ACCOUNT_FIELD = 'custrecord_bb_proj_shipping_cost_account',
			SS_CONFIG_UNBILLED_AR_ACCOUNT_FIELD = 'custrecord_bb_unbilled_ar_account',
			// Journal fields
			JOURNAL_PROJECT_FIELD = 'custbody_bb_project',
			JOURNAL_MILESTONE_FIELD = 'custbody_bb_milestone',
			JOURNAL_SUBSIDIARY_FIELD = 'subsidiary',
			// transaction search fields
			TRANSACTION_JOURNAL_TYPE = 'Journal',
			// invoice item fields
			JOURNAL_LINE_RECORD = 'line',
			JOURNAL_LINE_ACCOUNT_FIELD = 'account',
			JOURNAL_LINE_DEBIT_FIELD = 'debit',
			JOURNAL_LINE_CREDIT_FIELD = 'credit',
			JOURNAL_LINE_PROJECT_FIELD = 'entity',
			JOURNAL_LINE_MEMO_FIELD = 'memo',
			JOURNAL_LINE_CLASS_FIELD = 'class',
			JOURNAL_LINE_DEPARTMENT_FIELD = 'department',
			JOURNAL_LINE_LOCATION_FIELD = 'location',
			//search fields
			JOURNAL_MILESTONE_ID = '7'//Accrual
		;

		function createAccrualJE(project, config, jeDateParam){
			var configValues = getConfigValues(config);
			var _recJournals = transactionService.findAllTransactionsByProjectIdAndVendorId(project.id, null, [TRANSACTION_JOURNAL_TYPE], JOURNAL_MILESTONE_ID);
			if(_recJournals.length <= 0){
				var o_accountAmounts = getJEAccountAmount(project.id);
				if (o_accountAmounts.length == 0) return;
				var accrualJE = createAccrualJEHeader(project, config, null, jeDateParam);
				accrualJE = addLines(accrualJE, project.id, o_accountAmounts, configValues, true);//add revenue lines
				accrualJE = addLines(accrualJE, project.id, o_accountAmounts, configValues, false);//add COGS lines
				var jeRecord = accrualJE.save({
					ignoreMandatoryFields: true
				});
				return jeRecord;
			}
		}


		function createMilestoneRecognitionJe(project, config, obj) {
			var configValues = getConfigValues(config);
			log.debug('bb config accounts', configValues);
			var o_accountAmounts = getJEAccountAmountForAdvancedPaymentSchedules(project.id, obj.milestone, false, obj);
			if (o_accountAmounts.length == 0) return;
			var accrualJE = createAccrualJEHeader(project, config, obj);
			accrualJE = addLines(accrualJE, project.id, o_accountAmounts, configValues, true);//add revenue lines
			accrualJE = addLines(accrualJE, project.id, o_accountAmounts, configValues, false);//add COGS lines
			var jeRecord = accrualJE.save({
				ignoreMandatoryFields: true
			});
			return jeRecord;
		}


		function createProjectedRevenueRecognitionJe(project, config, obj, submitObj, advScheduleCount) {
			log.debug('adv schedule count for project revenue cogs actuals JE creation', advScheduleCount);
			log.debug('adv schedule object value', obj);
			var deptId = null;
			var classId = null;
			var locationId = project.getValue({fieldId: 'custentity_bb_project_location'});

			var configValues = getConfigValues(config);
			var projectedRevenueJe = getProjectRevenueAccrualJournal(project);
			if((!projectedRevenueJe && advScheduleCount == 1) || (advScheduleCount > 1)) {
				var projectedRevenueJe = getProjectedRevenueJE(project.id)
				var o_accountAmounts = getJEAccountAmountForAdvancedPaymentSchedules(project.id, null, true, submitObj);

				var accrualJE = createAccrualJEHeader(project, config, obj);
				// add the projected revenue lines here if no rolled in roofing adv line exists process as normal with unbilled AR
				// if the adv schedule has rolled in roofing journal line then reduce revenue by the difference of the roofing total - unbilled AR
				// Example: Revenue = 20000 Roofing Total = 7000, Unbilled AR Invoice total = 5000
				// Revenue: 20000 - (7000 - 5000) = 18000 Revenue Line and 2000 Unbilled AR Total

				// add logic here to detect if the the deferral account contains unbilled ar for the invoice
				log.debug('executing projected revenue lines');
				addProjectedRevenueLines(accrualJE, obj, config, deptId, classId, locationId, o_accountAmounts);

				if (o_accountAmounts.length > 0) {
					accrualJE = addLines(accrualJE, project.id, o_accountAmounts, configValues, true);//add revenue lines
					accrualJE = addLines(accrualJE, project.id, o_accountAmounts, configValues, false);//add COGS lines
					deptId = o_accountAmounts[0].department;
					classId = o_accountAmounts[0].class;
					locationId = o_accountAmounts[0].location;
				}

				var jeRecord = accrualJE.save({
					ignoreMandatoryFields: true
				});
				return jeRecord;
			}
		}


		function createPercentCompleteRecognitionJe(project, config, invArray, obj, dealerFeeAmount) {
			var configValues = getConfigValues(config);
			log.debug('bb config accounts', configValues);
			var o_accountAmounts = getJEAccountAmountsForPercentComplete(project.id, invArray, obj);
			if (o_accountAmounts.length == 0) return;
			var accrualJE = createAccrualJEHeader(project, config, obj);
			accrualJE = addLines(accrualJE, project.id, o_accountAmounts, configValues, true, obj.percent);//add revenue lines
			accrualJE = addLines(accrualJE, project.id, o_accountAmounts, configValues, false, obj.percent);//add COGS lines
			var jeRecord = accrualJE.save({
				ignoreMandatoryFields: true
			});
			return jeRecord;
		}


		function createRolledInRoofingRecognitionJe(project, config, obj) {
			var configValues = getConfigValues(config);
			log.debug('bb config accounts', configValues);
			var o_accountAmounts = getJEAccountAmountsForRolledInRoofing(project.id, obj);
			if (o_accountAmounts.length == 0) return;
			var accrualJE = createAccrualJEHeader(project, config, obj);
			accrualJE = addLines(accrualJE, project.id, o_accountAmounts, configValues, true, obj.percent);//add revenue lines
			accrualJE = addLines(accrualJE, project.id, o_accountAmounts, configValues, false, obj.percent);//add COGS lines
			var jeRecord = accrualJE.save({
				ignoreMandatoryFields: true
			});
			return jeRecord;
		}


		function createAccrualJEHeader(project, config, obj, jeDate){
			var journal = record.create({
				type: record.Type.JOURNAL_ENTRY,
				isDynamic: true
			});
			// set accrual je form
			journal.setValue({
				fieldId: 'customform',
				value: config.getValue({fieldId: 'custrecord_bb_accrual_je_form'})
			});

			if(config.getValue({fieldId: 'custrecord_bb_ss_has_subsidiaries'})){
				var subsidiary = project.getValue({fieldId: PROJECT_SUBSIDIARY_FIELD});

				journal.setValue({
					fieldId: JOURNAL_SUBSIDIARY_FIELD,
					value: subsidiary,
				});
			}

			//set project header
			journal.setValue({
				fieldId: JOURNAL_PROJECT_FIELD,
				value: project.id,
			});
			journal.setText({
				fieldId: JOURNAL_MILESTONE_FIELD,
				text: 'Accrual'
			});

			if (obj) {
				if (obj.advParentId) {
					journal.setValue({fieldId: 'custbody_bbss_adv_payschedlist', value: obj.advParentId});
				}
				if (obj.advChildId) {
					journal.setValue({fieldId: 'custbody_bbss_adv_pay_subschedlink', value: obj.advChildId});
				}
				if (obj.milestoneDate) {
					journal.setValue({
						fieldId: 'trandate',
						value: new Date(obj.milestoneDate)
					});
				}
			} else if(jeDate){
				journal.setValue({
					fieldId: 'trandate',
					value: new Date(jeDate)
				});
			} else {
				journal.setValue({
					fieldId: 'trandate',
					value: new Date()
				});
			}
			return journal;
		}


		function addProjectedRevenueLines(journal, obj, config, deptId, classId, locationId, o_accountAmounts) {
			log.debug('advanced payment object', obj)
			log.debug('o_accountAmounts in project revenue lines', o_accountAmounts);
			if (obj.custrecord_bbss_adv_subpay_item_list) {
				var itemSearchObj = search.lookupFields({
					type: search.Type.ITEM,
					id: obj.custrecord_bbss_adv_subpay_item_list,
					columns: ['incomeaccount']
				});
				var revenueAcct = (itemSearchObj.incomeaccount.length > 0) ? itemSearchObj.incomeaccount[0].value : null;
			}
			var unbilledARAmount = getCalculatedUnBilledAmount(obj.custrecord_bbss_adv_subpay_schedule);
			var amount = (obj.custrecord_bbss_adv_subpay_amount) ? obj.custrecord_bbss_adv_subpay_amount : unbilledARAmount;

			var unbilledARAccount = config.getValue({fieldId: 'custrecord_bb_unbilled_ar_account'});
			var roofingAmt = getRolledInRoofingTotal(obj.custrecord_bbss_adv_subpay_schedule); // get total of rolled in roofing amount from payment schedule
			var revenueIndex = o_accountAmounts.map(function(data) {return data.accountType}).indexOf('Income');
			var deferredRevenueIndex = o_accountAmounts.map(function(data) {return data.accountType}).indexOf('Deferred Revenue');

			log.debug('revenueIndex', revenueIndex);
			log.debug('deferredRevenueIndex', deferredRevenueIndex);
			log.debug('unbilledARAccount', unbilledARAccount);
			log.debug('revenueAcct', revenueAcct);
			log.debug('amount', amount);
			log.debug('roofingAmt', roofingAmt);

			var adjustedAmt = parseFloat(roofingAmt) - parseFloat(unbilledARAmount);
			log.debug('adjustedAmt', adjustedAmt);

			if (revenueAcct && unbilledARAccount && amount && roofingAmt == 0) {
				addProjectedRevLine(journal, obj.custrecord_bbss_adv_subpay_project, revenueAcct, amount, true, deptId, classId, locationId);// add revenue line
				addProjectedRevLine(journal, obj.custrecord_bbss_adv_subpay_project, unbilledARAccount, amount, false, deptId, classId, locationId);// add deferral line
			} else if (unbilledARAccount && adjustedAmt > 0 && revenueIndex != -1) {
				var revenueObj = o_accountAmounts[revenueIndex];
				var revenueAmt = revenueObj.amount;
				revenueObj.totalAmt = (parseFloat(revenueAmt) - adjustedAmt) * -1;
				log.debug('revised revenue line object', revenueObj);
				addProjectedRevLine(journal, obj.custrecord_bbss_adv_subpay_project, unbilledARAccount, adjustedAmt, true, deptId, classId, locationId);

			} else if (unbilledARAccount && adjustedAmt < 0 && deferredRevenueIndex != -1) {
				var deferredRevenueObj = o_accountAmounts[deferredRevenueIndex];
				var deferredRevenueAmt = deferredRevenueObj.amount;
				deferredRevenueObj.totalAmt = (parseFloat(deferredRevenueAmt) + adjustedAmt); // adjusted amount is expected as a negative, adding the number executes subtraction
				log.debug('revised deferredRevenueObj line object', deferredRevenueObj);
				addProjectedRevLine(journal, obj.custrecord_bbss_adv_subpay_project, unbilledARAccount, adjustedAmt, true, deptId, classId, locationId);// add deferral line
			} else {
				log.debug('The project revenue lines are missing the account id or amount for object ', obj);
			}
		}


		function addProjectedRevLine(journal, projectId, account, amount, isRevenue, deptId, classId, locationId) {
			var featureObj = checkNativeEnabledFeatures();
			log.debug('addLines isRevenue', isRevenue);
			// log.debug('deptId', deptId);
			// log.debug('classId', classId);
			// log.debug('locationId', locationId);
			log.debug('projected revenue line amount', amount);
			var memo = '100% Revenue Projected and COGS Actuals Recognition';

			journal.selectNewLine(JOURNAL_LINE_RECORD);
			journal.setCurrentSublistValue({
				sublistId: JOURNAL_LINE_RECORD,
				fieldId: JOURNAL_LINE_ACCOUNT_FIELD,
				value: account
			});
			if (isRevenue) {
				journal.setCurrentSublistValue({
					sublistId: JOURNAL_LINE_RECORD,
					fieldId: (amount > 0) ? JOURNAL_LINE_CREDIT_FIELD : JOURNAL_LINE_DEBIT_FIELD,
					value: amount
				});
			} else {
				journal.setCurrentSublistValue({
					sublistId: JOURNAL_LINE_RECORD,
					fieldId: JOURNAL_LINE_DEBIT_FIELD,
					value: amount
				});
			}
			journal.setCurrentSublistValue({
				sublistId: JOURNAL_LINE_RECORD,
				fieldId: (isRevenue) ? JOURNAL_LINE_CREDIT_FIELD : JOURNAL_LINE_DEBIT_FIELD,
				value: amount
			});

			journal.setCurrentSublistValue({
				sublistId: JOURNAL_LINE_RECORD,
				fieldId: JOURNAL_LINE_PROJECT_FIELD,
				value: projectId
			});

			journal.setCurrentSublistValue({
				sublistId: JOURNAL_LINE_RECORD,
				fieldId: JOURNAL_LINE_MEMO_FIELD,
				value: memo
			});
			if (featureObj.isClassEnabled && classId) {
				journal.setCurrentSublistValue({
					sublistId: JOURNAL_LINE_RECORD,
					fieldId: JOURNAL_LINE_CLASS_FIELD,
					value: classId
				});
			}
			if (featureObj.isDeptEnabled && deptId) {
				journal.setCurrentSublistValue({
					sublistId: JOURNAL_LINE_RECORD,
					fieldId: JOURNAL_LINE_DEPARTMENT_FIELD,
					value: deptId
				});
			}
			if (featureObj.isLocationEnabled && locationId) {
				journal.setCurrentSublistValue({
					sublistId: JOURNAL_LINE_RECORD,
					fieldId: JOURNAL_LINE_LOCATION_FIELD,
					value: locationId
				});
			}
			journal.commitLine(JOURNAL_LINE_RECORD);

			return journal;
		}


		function addLines(journal, projectInternalId, accountAmounts, configValues, isRevenue, percent){
			var featureObj = checkNativeEnabledFeatures();
			var memoText = (isRevenue)?'Revenue':'Cost'
			var memo = 'Automatic '+memoText+' Recognition';
			var isDebit;
			log.debug('addLines isRevenue', isRevenue);
			var salesTaxAmt = checkProjectForTaxDeduction(projectInternalId);

			for (var accountIndex = 0; accountIndex < accountAmounts.length; accountIndex++) {

				var accountId = accountAmounts[accountIndex].account;
				var deferredFromAccountName = accountAmounts[accountIndex].deferredFromAccountName;
				var deferredAccount = accountAmounts[accountIndex].deferredAccount;
				log.debug('Deferred Account Value', deferredAccount);

				// returns true or false to process JE line details
				var processLine = getMatchAccrualAccountId(configValues, accountId, isRevenue);
				log.debug('processLine', processLine + ': ' + isRevenue);

				if (processLine) {

					log.debug('addLines isDeferred', accountAmounts[accountIndex].isDeferredAccount);
					isDebit = (isRevenue === accountAmounts[accountIndex].isDeferredAccount);
					log.debug('addLines isDebit', isDebit);
					log.debug('addLines accountAmounts object', accountAmounts[accountIndex]);

					var lineAmount = accountAmounts[accountIndex].totalAmt;
					log.debug('JE Total Line Amount', lineAmount);

					var isDebitOnRevenue = false;
					var totalAmt = Math.abs(parseFloat(accountAmounts[accountIndex].totalAmt));
					log.debug('total line amount', totalAmt);
					var percentFormatted = parseFloat(percent);
					log.debug('percentFormatted', percentFormatted);
					if (percentFormatted) {
						totalAmt = Math.abs(parseFloat(accountAmounts[accountIndex].totalAmt)) * (percentFormatted / 100);
					}

					journal.selectNewLine(JOURNAL_LINE_RECORD);
					journal.setCurrentSublistValue({
						sublistId: JOURNAL_LINE_RECORD,
						fieldId: JOURNAL_LINE_ACCOUNT_FIELD,
						value: accountAmounts[accountIndex].account
					});
					if (accountAmounts[accountIndex].accountType == 'Deferred Revenue') {

						if (accountAmounts[accountIndex].debitAmount) {
							if (lineAmount < 0) { // clawback
								journal.setCurrentSublistValue({
									sublistId: JOURNAL_LINE_RECORD,
									fieldId: JOURNAL_LINE_CREDIT_FIELD,
									value: totalAmt
								});
							} else {
								journal.setCurrentSublistValue({
									sublistId: JOURNAL_LINE_RECORD,
									fieldId: (isDebit) ? JOURNAL_LINE_DEBIT_FIELD : JOURNAL_LINE_CREDIT_FIELD,
									value: totalAmt
								});
							}
						} else {
							journal.setCurrentSublistValue({
								sublistId: JOURNAL_LINE_RECORD,
								fieldId: (isDebit) ? JOURNAL_LINE_DEBIT_FIELD : JOURNAL_LINE_CREDIT_FIELD,
								value: totalAmt
							});
						}
					} else if (accountAmounts[accountIndex].accountType == 'Income') {
						if (salesTaxAmt > 0 && accountAmounts[accountIndex].taxAmount > 0) {
							totalAmt = totalAmt - parseFloat(salesTaxAmt);
							log.debug('line amount minus taxes', totalAmt);
						}
						if (accountAmounts[accountIndex].creditAmount) {
							if (lineAmount < 0) { // scenario covers when revenue needs to be credited due to income gl accounted used on vendor bills
								journal.setCurrentSublistValue({
									sublistId: JOURNAL_LINE_RECORD,
									fieldId: (isDebit) ? JOURNAL_LINE_DEBIT_FIELD : JOURNAL_LINE_CREDIT_FIELD,
									value: totalAmt
								});
							} else {
								// journal.setCurrentSublistValue({
								//     sublistId: JOURNAL_LINE_RECORD,
								//  	fieldId: (!isDebit) ? JOURNAL_LINE_DEBIT_FIELD : JOURNAL_LINE_CREDIT_FIELD,
								//  	value: totalAmt
								//  });
								journal.setCurrentSublistValue({
									sublistId: JOURNAL_LINE_RECORD,
									fieldId: JOURNAL_LINE_DEBIT_FIELD,
									value: totalAmt
								});
							}

						} else {
							journal.setCurrentSublistValue({
								sublistId: JOURNAL_LINE_RECORD,
								fieldId: (!isDebit) ? JOURNAL_LINE_CREDIT_FIELD: JOURNAL_LINE_DEBIT_FIELD,
								value: totalAmt
							});
						}

					} else if (accountAmounts[accountIndex].accountType == 'Cost of Goods Sold' || accountAmounts[accountIndex].accountType == 'Expense') {
						if (lineAmount < 0) {
							journal.setCurrentSublistValue({
								sublistId: JOURNAL_LINE_RECORD,
								fieldId: (isDebit) ? JOURNAL_LINE_DEBIT_FIELD : JOURNAL_LINE_CREDIT_FIELD,
								value: totalAmt
							});
						} else {
							// adds single clawback line
							journal.setCurrentSublistValue({
								sublistId: JOURNAL_LINE_RECORD,
								fieldId: JOURNAL_LINE_CREDIT_FIELD,
								value: totalAmt
							});
						}
					} else if (accountAmounts[accountIndex].accountType == 'Deferred Expense') {
						if (lineAmount > 0) {
							journal.setCurrentSublistValue({
								sublistId: JOURNAL_LINE_RECORD,
								fieldId: (isDebit) ? JOURNAL_LINE_DEBIT_FIELD : JOURNAL_LINE_CREDIT_FIELD,
								value: totalAmt
							});
						} else {
							// adds single clawback line
							journal.setCurrentSublistValue({
								sublistId: JOURNAL_LINE_RECORD,
								fieldId: JOURNAL_LINE_DEBIT_FIELD,
								value: totalAmt
							});
						}
					} else {

						journal.setCurrentSublistValue({
							sublistId: JOURNAL_LINE_RECORD,
							fieldId: (isDebit) ? JOURNAL_LINE_DEBIT_FIELD : JOURNAL_LINE_CREDIT_FIELD,
							value: totalAmt
						});
					}

					journal.setCurrentSublistValue({
						sublistId: JOURNAL_LINE_RECORD,
						fieldId: JOURNAL_LINE_PROJECT_FIELD,
						value: projectInternalId
					});
					var lineMemo = (deferredFromAccountName != ' ') ? memo + ' || ' + deferredFromAccountName : memo;
					journal.setCurrentSublistValue({
						sublistId: JOURNAL_LINE_RECORD,
						fieldId: JOURNAL_LINE_MEMO_FIELD,
						value: lineMemo
					});
					if (featureObj.isClassEnabled && accountAmounts[accountIndex].class) {
						journal.setCurrentSublistValue({
							sublistId: JOURNAL_LINE_RECORD,
							fieldId: JOURNAL_LINE_CLASS_FIELD,
							value: accountAmounts[accountIndex].class
						});
					}
					if (featureObj.isDeptEnabled && accountAmounts[accountIndex].department) {
						journal.setCurrentSublistValue({
							sublistId: JOURNAL_LINE_RECORD,
							fieldId: JOURNAL_LINE_DEPARTMENT_FIELD,
							value: accountAmounts[accountIndex].department
						});
					}
					if (featureObj.isLocationEnabled && accountAmounts[accountIndex].location) {
						journal.setCurrentSublistValue({
							sublistId: JOURNAL_LINE_RECORD,
							fieldId: JOURNAL_LINE_LOCATION_FIELD,
							value: accountAmounts[accountIndex].location
						});
					}

					journal.commitLine(JOURNAL_LINE_RECORD);
				}

			}// end of account detail search result loop

			return journal;
		}


		/**
		 * Runs a search for all the accounts that have been deferred
		 * and gets the amounts and whether they are deferred or not
		 *
		 * @param project - NS JSON for the project record
		 * @returns - JSON - with key:value pairs for:
		 *  isDeferredAccount, account, amount, creditAmount, debitAmount
		 */
		function getJEAccountAmount(projectInternalId){
			var strLogTitle = 'getJEAccountAmount';

			//this search
			var transactionSearchObj = search.load({
				id: 'customsearch_bb_txn_proj_accural'
			});

			var additionalFilters = [ "AND", ["custbody_bb_project","anyof", projectInternalId]];
			var newFilterExpression = transactionSearchObj.filterExpression.concat(additionalFilters);
			transactionSearchObj.filterExpression = newFilterExpression;
			var featureObj = checkNativeEnabledFeatures()

			var searchColumns = transactionSearchObj.columns;
			if (featureObj.isClassEnabled) {
				searchColumns.push(search.createColumn({name: 'class', summary: 'GROUP'}));
			}
			if (featureObj.isDeptEnabled) {
				searchColumns.push(search.createColumn({name: 'department', summary: 'GROUP'}));
			}
			if (featureObj.isLocationEnabled) {
				searchColumns.push(search.createColumn({name: 'location', summary: 'GROUP'}));
			}

			transactionSearchObj.columns = searchColumns;

			var finalResults = processResults(transactionSearchObj);

			var billFinalResults = getBillAssociatedTransactions(finalResults, projectInternalId, true);

			var finalArr = getJournalAssociatedTransactions(billFinalResults, projectInternalId, null, true);

			return finalArr;
		}


		function getJEAccountAmountForAdvancedPaymentSchedules(projectInternalId, milestoneId, isProjectedRevenue, obj){
			var strLogTitle = 'getJEAccountAmount';

			var transactionSearchObj = search.load({
				id: 'customsearch_bb_txn_proj_accural'
			});

			var featureObj = checkNativeEnabledFeatures();

			var searchColumns = transactionSearchObj.columns;
			if (featureObj.isClassEnabled) {
				searchColumns.push(search.createColumn({name: 'class', summary: 'GROUP'}));
			}
			if (featureObj.isDeptEnabled) {
				searchColumns.push(search.createColumn({name: 'department', summary: 'GROUP'}));
			}
			if (featureObj.isLocationEnabled) {
				searchColumns.push(search.createColumn({name: 'location', summary: 'GROUP'}));
			}

			transactionSearchObj.columns = searchColumns;

			var additionalFilters = [ "AND", ["custbody_bb_project","anyof", projectInternalId]];
			var newFilterExpression = transactionSearchObj.filterExpression.concat(additionalFilters);
			transactionSearchObj.filterExpression = newFilterExpression;
			var advScheduleCount = getProjectADVScheduleCount(projectInternalId);
			var projectedRevContainsMilestoneLines = doesProjectRevenueScheduleContainMilestoneLines(obj.advParentId);
			log.debug('contains milestone lines with projected revenue', projectedRevContainsMilestoneLines);

			if (isProjectedRevenue) {
				if (advScheduleCount > 1 && projectedRevContainsMilestoneLines) {
					var advProjectedFilters = ["AND", ["custbody_bbss_adv_payschedlist", "anyof", obj.advParentId], "AND", ["accounttype","anyof","Income","DeferRevenue"], "AND", ["custbody_bb_adv_pay_recognition_type","anyof","2"]]
					var advFilterExpression = transactionSearchObj.filterExpression.concat(advProjectedFilters);
					transactionSearchObj.filterExpression = advFilterExpression;

				} else if (advScheduleCount == 1 && projectedRevContainsMilestoneLines) {
					var projectedRevenueFilter = ["AND", ["accounttype", "anyof", "Income", "DeferRevenue"], "AND", ["custbody_bb_adv_pay_recognition_type", "anyof", "2"]];
					var projectedRevFilterExpression = transactionSearchObj.filterExpression.concat(projectedRevenueFilter);
					transactionSearchObj.filterExpression = projectedRevFilterExpression;

				} else if (advScheduleCount > 1 && !projectedRevContainsMilestoneLines) {
					var advProjectedFilters = ["AND", ["custbody_bbss_adv_payschedlist", "anyof", obj.advParentId], "AND", ["accounttype","noneof","Income","DeferRevenue"], "AND", ["custbody_bbss_adv_payschedlist","anyof","@NONE@"]]
					var advFilterExpression = transactionSearchObj.filterExpression.concat(advProjectedFilters);
					transactionSearchObj.filterExpression = advFilterExpression;

				} else if (advScheduleCount == 1 && !projectedRevContainsMilestoneLines) {
					// for stand alone transactions not related to advanced payment schedule
					var acctMethodFilter = [ "AND", ["custbody_bb_project_acctg_method","anyof","4"], "AND", ["custbody_bbss_adv_payschedlist","anyof","@NONE@"], "AND", ["accounttype","noneof","Income","DeferRevenue"]];
					var acctMethodFilterExpression = transactionSearchObj.filterExpression.concat(acctMethodFilter);
					transactionSearchObj.filterExpression = acctMethodFilterExpression;
				}
			}
			if (milestoneId) {
				var milestoneFilters;
				if (obj) {
					var includeDownPaymentInRecognition = shouldIncludeDownPayment(obj.advParentId, obj.milestone);
					if (includeDownPaymentInRecognition) {
						milestoneFilters = [ "AND", ["custbody_bb_milestone","anyof", milestoneId, 12]];
						var milestoneFilterExpression = transactionSearchObj.filterExpression.concat(milestoneFilters);
						transactionSearchObj.filterExpression = milestoneFilterExpression;
					} else {
						milestoneFilters = [ "AND", ["custbody_bb_milestone","anyof", milestoneId]];
						var milestoneFilterExpression = transactionSearchObj.filterExpression.concat(milestoneFilters);
						transactionSearchObj.filterExpression = milestoneFilterExpression;
					}
					//check for transactions that belong to the processed advanced payment schedule
					// double check if there is more then one adv payment schedule, if there is only 1 schedule dont use the filter set below
					// if there are more then 1 include any of advanced payment schedule is that ID OR include transaction without advanced payment schedules set and
					// ADVPAY: RECOGNITION JE is empty on the transaction
					if (advScheduleCount > 1) {
						//needed filter expression [[["custbody_bbss_adv_pay_subschedlink","anyof","33"]],"OR",[["custbody_bb_adv_pay_recognition_je","anyof","@NONE@"]]]
						var advFilters = ["AND", [[["custbody_bbss_adv_payschedlist", "anyof", obj.advParentId]],"OR",[["custbody_bb_adv_pay_recognition_je","anyof","@NONE@"], "AND", [["custbody_bbss_adv_payschedlist", "anyof", "@NONE@"]]]]];
						var advFilterExpression = transactionSearchObj.filterExpression.concat(advFilters);
						transactionSearchObj.filterExpression = advFilterExpression;
					}

				} else {
					// if the object is empty, use the milestone id only
					// maybe not needed for stand alone transactions that need to be included in this
					milestoneFilters = [ "AND", ["custbody_bb_milestone","anyof", milestoneId]];
					var milestoneFilterExpression = transactionSearchObj.filterExpression.concat(milestoneFilters);
					transactionSearchObj.filterExpression = milestoneFilterExpression;
				}
				var recognizedFilters = [ "AND", ["custbody_bb_adv_milestone_rec_bool","is", "F"]];
				var recognizedFilterExpression = transactionSearchObj.filterExpression.concat(recognizedFilters);
				transactionSearchObj.filterExpression = recognizedFilterExpression;

				// milestone recognition process - column for deferred revenue matching account,
				//this separates the deferral and income accounts can be used as future enhancement for multiple deferred revenue accounts
				searchColumns.push(
					search.createColumn({
						name: "formulanumeric",
						summary: "GROUP",
						formula: "CASE WHEN {accounttype} = 'Income' OR {accounttype} = 'Deferred Revenue' THEN {custbody_bb_deferral_account.id} ELSE -1 END"
					})
				);
			}
			log.debug('transaction filter expression ', transactionSearchObj.filterExpression)
			var finalResults = processResults(transactionSearchObj);
			var billFinalResults = getBillAssociatedTransactions(finalResults, projectInternalId);
			// need to test and debug concat arrays for JE's and reg transactions

			if (!isProjectedRevenue) {
				var finalArr = getJournalAssociatedTransactionsForMilestoneRec(billFinalResults, projectInternalId, milestoneId);
				log.debug('final array results', finalArr);
				return finalArr;
			} else {
				return billFinalResults;
			}
			return billFinalResults;
		}


		function getJEAccountAmountsForPercentComplete(projectId, invArray, obj) {
			var transactionSearchObj = search.load({
				id: 'customsearch_bb_txn_proj_accural'
			});
			var featureObj = checkNativeEnabledFeatures();

			var searchColumns = transactionSearchObj.columns;
			if (featureObj.isClassEnabled) {
				searchColumns.push(search.createColumn({name: 'class', summary: 'GROUP'}));
			}
			if (featureObj.isDeptEnabled) {
				searchColumns.push(search.createColumn({name: 'department', summary: 'GROUP'}));
			}
			if (featureObj.isLocationEnabled) {
				searchColumns.push(search.createColumn({name: 'location', summary: 'GROUP'}));
			}

			transactionSearchObj.columns = searchColumns;

			var additionalFilters = [ "AND", ["custbody_bb_project","anyof", projectId]];
			var newFilterExpression = transactionSearchObj.filterExpression.concat(additionalFilters);
			transactionSearchObj.filterExpression = newFilterExpression;

			if (invArray) {
				log.debug('invArray', invArray);
				var lookupString = invArray.join(',');
				log.debug('lookupString', lookupString);
				var invoiceArrayFilter = [ "AND", ["internalid","anyof", lookupString]];
				var invoiceArrayFilterExpression = transactionSearchObj.filterExpression.concat(invoiceArrayFilter);
				transactionSearchObj.filterExpression = invoiceArrayFilterExpression;

				// var advScheduleFilter = [ "AND", ["custbody_bbss_adv_payschedlist","anyof",obj.advParentId]];
				// var advScheduleFilterExpression = transactionSearchObj.filterExpression.concat(advScheduleFilter);
				// transactionSearchObj.filterExpression = advScheduleFilterExpression;
			}
			var finalResults = processResults(transactionSearchObj);
			var billFinalResults = getBillAssociatedTransactions(finalResults, projectId);

			return billFinalResults;
		}//////


		function getJEAccountAmountsForRolledInRoofing(projectId, obj) {
			var array = [];
			var incomeAccount = null;
			var dererredAccount = null;
			if (obj.item) {
				var itemObj = search.lookupFields({
					type: search.Type.ITEM,
					id: obj.item,
					columns: ['incomeaccount', 'custitem_bb_deferred_rev_account']
				})
				if (itemObj.incomeaccount.length > 0) {
					incomeAccount = itemObj.incomeaccount[0].value;
				}
				if (itemObj.custitem_bb_deferred_rev_account.length > 0) {
					dererredAccount = itemObj.custitem_bb_deferred_rev_account[0].value;
				}
				if (incomeAccount && dererredAccount && obj.amount) {
					array.push({
						isDeferredAccount: true,
						accountType: 'Deferred Revenue',
						account: String(dererredAccount),
						amount: obj.amount,
						creditAmount: 0,
						debitAmount: 0,
						totalAmt: obj.amount,
						taxAmount: 0,
						class: null,
						department: null,
						location: null,
						deferredRevAcct: null
					});
					array.push({
						isDeferredAccount: false,
						accountType: 'Income',
						account: String(incomeAccount),
						amount: obj.amount,
						creditAmount: 0,
						debitAmount: 0,
						totalAmt: parseFloat(obj.amount) * -1,
						taxAmount: 0,
						class: null,
						department: null,
						location: null,
						deferredRevAcct: null
					});
				}
			}
			return array;
		}//////


		function doesProjectRevenueScheduleContainMilestoneLines(advParentId) {
			var hasSplitLines = false;
			var projectRevenueLine = false;
			var milestoneLine = false;
			var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
				type: "customrecord_bbss_adv_sub_pay_schedule",
				filters:
					[
						["custrecord_bbss_adv_subpay_schedule.internalid","anyof", advParentId]
					],
				columns:
					[
						search.createColumn({name: "custrecord_bbss_adv_subpay_recog_je_type", label: "Recognition JE Type"})
					]
			});
			var searchResultCount = customrecord_bbss_adv_sub_pay_scheduleSearchObj.runPaged().count;
			log.debug("customrecord_bbss_adv_sub_pay_scheduleSearchObj result count",searchResultCount);
			customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().each(function(result){
				if (result.getValue({name: 'custrecord_bbss_adv_subpay_recog_je_type'}) == 1) {
					projectRevenueLine = true;
				}
				if (result.getValue({name: 'custrecord_bbss_adv_subpay_recog_je_type'}) == 2) {
					milestoneLine = true;
				}
				return true;
			});
			if (projectRevenueLine && !milestoneLine) {
				hasSplitLines = false;
			}
			if (projectRevenueLine && milestoneLine) {
				hasSplitLines = true;
			}
			return hasSplitLines;
		}


		function getProjectADVScheduleCount(projectId) {
			var resultCount = 0;
			if (projectId) {
				var customrecord_bbss_adv_payment_scheduleSearchObj = search.create({
					type: "customrecord_bbss_adv_payment_schedule",
					filters:
						[
							["custrecord_bbss_advpay_project_list", "anyof", projectId]
						],
					columns:
						[
							search.createColumn({name: "internalid", label: "Internal ID"})
						]
				});
				resultCount = customrecord_bbss_adv_payment_scheduleSearchObj.runPaged().count;
				log.debug("advanced payment schedule record count by project", resultCount);
			}
			return resultCount;
		}


		function getConfigValues(config){
			var overallArray = [];
			var revenueArray = [];
			var cogsArray = [];

			revenueArray.push(config.getValue({fieldId: SS_CONFIG_DEFERRED_REVENUE_ACCOUNT_FIELD})); // single account
			revenueArray.push(config.getValue({fieldId: SS_CONFIG_UNBILLED_AR_ACCOUNT_FIELD})); // single account

			cogsArray.push(config.getValue({fieldId: SS_CONFIG_DEFERRED_PROJECT_COST_ACCOUNT_FIELD})); // single account
			cogsArray.push(config.getValue({fieldId: SS_CONFIG_SHIPPING_ACCOUNT_FIELD})); // single account

			var revArray = revenueArray.concat(config.getValue({fieldId: SS_CONFIG_REVENUE_ACCOUNT_FIELD}), config.getValue({fieldId: SS_CONFIG_DEFERRED_REVENUE_ACCOUNT_MULTI_FIELD}))
			var cgArray = cogsArray.concat(config.getValue({fieldId: SS_CONFIG_EQUIPMENT_COST_ACCOUNT_FIELD}), config.getValue({fieldId: SS_CONFIG_LABOR_COST_ACCOUNT_FIELD}), config.getValue({fieldId: SS_CONFIG_OUTSIDE_LABOR_ACCOUNT_FIELD}),
				config.getValue({fieldId: SS_CONFIG_DEFERRED_PROJECT_COST_ACCOUNT_MULTI_FIELD}))
			return {
				revArray: revArray,
				cogArray: cgArray
			};
		}


		function isNull(param){
			return param == null || param == '' || param == undefined;
		}

		function isNotNull(param) {
			return param != null && param != '' && param != undefined;
		}

		function getJournalAssociatedTransactions(transactionArr, projectInternalId, milestoneId, isCombineSearch) {
			if (!isCombineSearch) {
        var additionalFilters = ['AND', ["name","anyof", projectInternalId ]];
        var searchObj = getJournalSearchResults(transactionArr, projectInternalId, additionalFilters);
        var finalResults = processResults(searchObj);


        var secondaryFilters = ['AND', ["custbody_bb_project","anyof", projectInternalId ]];
        var secondSearchObj = getJournalSearchResults(transactionArr, projectInternalId, secondaryFilters);
        var secondaryResult = processResults(secondSearchObj);

        return transactionArr.concat(finalResults, secondaryResult);
			} else {
				var additionalFilters = ['AND', [["name","anyof", projectInternalId ], 'OR', ["custbody_bb_project","anyof", projectInternalId ]]];
				var searchObj = getJournalSearchResults(transactionArr, projectInternalId, additionalFilters);
				var finalResults = processResults(searchObj);

				log.debug('getJournalAssociatedTransactions finalResults', finalResults);

        return transactionArr.concat(finalResults);
			}
		}

		function getBillAssociatedTransactions(transactionArr, projectInternalId, isCombineSearch) {
			if (!isCombineSearch) {
        var additionalFilters = ['AND', ["name","anyof", projectInternalId ]];
        var searchObj = getVendorBillSearchResults(transactionArr, projectInternalId, additionalFilters);
        var finalResults = processResults(searchObj);


        var secondaryFilters = ['AND', ["custbody_bb_project","anyof", projectInternalId ]];
        var secondSearchObj = getVendorBillSearchResults(transactionArr, projectInternalId, secondaryFilters);
        var secondaryResult = processResults(secondSearchObj);

        return transactionArr.concat(finalResults, secondaryResult);
			} else {
				var additionalFilters = ['AND', [["name","anyof", projectInternalId ], 'OR', ["custbody_bb_project","anyof", projectInternalId ]]];
				var searchObj = getVendorBillSearchResults(transactionArr, projectInternalId, additionalFilters);
				var finalResults = processResults(searchObj);

				log.debug('getBillAssociatedTransactions finalResults', finalResults);

				return transactionArr.concat(finalResults);
			}
		}


		function getJournalAssociatedTransactionsForMilestoneRec(transactionArr, projectInternalId, milestoneId) {
			var secondaryFilters = ['AND', ["custbody_bb_project","anyof", projectInternalId ], 'AND', ["custbody_bb_milestone","anyof", milestoneId ]];
			var secondSearchObj = getJournalSearchResults(transactionArr, projectInternalId, secondaryFilters);
			var secondaryResult = processResults(secondSearchObj);
			if (secondaryResult.length > 0) {
				return transactionArr.concat(secondaryResult);
			} else {
				return transactionArr;
			}

		}


		function getJournalSearchResults(transactionArr, projectInternalId, additionalFilters) {
			var strLogTitle = 'getJournalEntryAccount';
			var transactionSearchObj = search.load({
				id: 'customsearch_bb_je_txn_proj_accural'
			});
			var featureObj = checkNativeEnabledFeatures();

			var searchColumns = transactionSearchObj.columns;
			if (featureObj.isClassEnabled) {
				searchColumns.push(search.createColumn({name: 'class', summary: 'GROUP'}));
			}
			if (featureObj.isDeptEnabled) {
				searchColumns.push(search.createColumn({name: 'department', summary: 'GROUP'}));
			}
			if (featureObj.isLocationEnabled) {
				searchColumns.push(search.createColumn({name: 'location', summary: 'GROUP'}));
			}
			transactionSearchObj.columns = searchColumns;

			var newFilterExpression = transactionSearchObj.filterExpression.concat(additionalFilters);
			transactionSearchObj.filterExpression = newFilterExpression;
			return transactionSearchObj;
		}

		function getVendorBillSearchResults(transactionArr, projectInternalId, additionalFilters) {

			var transactionSearchObj = search.load({
				id: 'customsearch_bb_vb_txn_proj_accural'
			});
			var featureObj = checkNativeEnabledFeatures();

			var searchColumns = transactionSearchObj.columns;
			if (featureObj.isClassEnabled) {
				searchColumns.push(search.createColumn({name: 'class', summary: 'GROUP'}));
			}
			if (featureObj.isDeptEnabled) {
				searchColumns.push(search.createColumn({name: 'department', summary: 'GROUP'}));
			}
			if (featureObj.isLocationEnabled) {
				searchColumns.push(search.createColumn({name: 'location', summary: 'GROUP'}));
			}
			transactionSearchObj.columns = searchColumns;

			var newFilterExpression = transactionSearchObj.filterExpression.concat(additionalFilters);
			transactionSearchObj.filterExpression = newFilterExpression;
			return transactionSearchObj;
		}


		function getMatchAccrualAccountId(configValues, accountId, isRevenue) {

			if (isRevenue) {
				var revArray = configValues.revArray;
				var revProceed = revArray.indexOf(accountId);
				if (revProceed != -1) {
					return true
				} else {
					return false;
				}
			} else {
				var cogsArray = configValues.cogArray;
				var cogsProceed = cogsArray.indexOf(accountId);
				if (cogsProceed != -1) {
					return true
				} else {
					return false;
				}
			}
		}


		function processResults(transactionSearchObj) {
			var featureObj = checkNativeEnabledFeatures();

			var resultSet = transactionSearchObj.run();
			var finalResults = [];
			var getMoreResults = true;
			var i_start = 0;
			var i_end = 1000;
			do{
				var results = resultSet.getRange({start:i_start, end: i_end}).map(function(result, index, array){
					return {
						isDeferredAccount: (result.getText(resultSet.columns[0]).indexOf('Deferred')>-1),
						accountType: result.getText(resultSet.columns[0]),
						account: result.getValue(resultSet.columns[1]),
						amount: isNull(result.getValue(resultSet.columns[2]))?result.getValue(resultSet.columns[3]):result.getValue(resultSet.columns[2]),
						creditAmount: result.getValue(resultSet.columns[2]),
						debitAmount: result.getValue(resultSet.columns[3]),
						totalAmt: result.getValue(resultSet.columns[4]),
						taxAmount: result.getValue(resultSet.columns[5]),
						deferredFromAccountName: result.getValue(resultSet.columns[6]),
						deferredAccount: result.getValue(resultSet.columns[7]),
						class: (featureObj.isClassEnabled) ? result.getValue({name: 'class', summary: 'GROUP'}) : null,
						department: (featureObj.isDeptEnabled) ? result.getValue({name: 'department', summary: 'GROUP'}) : null,
						location: (featureObj.isLocationEnabled) ? result.getValue({name: 'location', summary: 'GROUP'}) : null,
						deferredRevAcct: (result.getValue({name: 'formulanumeric', summary: 'GROUP', formula: "CASE WHEN {accounttype} = 'Income' OR {accounttype} = 'Deferred Revenue' THEN {custbody_bb_deferral_account.id} ELSE -1 END"})) ?
							result.getValue({name: 'formulanumeric', summary: 'GROUP', formula: "CASE WHEN {accounttype} = 'Income' OR {accounttype} = 'Deferred Revenue' THEN {custbody_bb_deferral_account.id} ELSE -1 END"}) : null
					};
				});
				if(results.length > 0){
					finalResults = finalResults.concat(results);
					i_start = i_end;
					i_end += 1000;
				}
				else{
					getMoreResults = false;
				}
			} while (getMoreResults)

			return finalResults;
		}


		function getProjectRevenueAccrualJournal(project) {
			var accrualJe = null;
			if (project.id) {
				var projectObj = search.lookupFields({
					type: search.Type.JOB,
					id: project.id,
					columns: ['custentity_bb_ss_accrual_journal']
				});
				accrualJe = (projectObj.custentity_bb_ss_accrual_journal.length > 0) ? projectObj.custentity_bb_ss_accrual_journal[0].value : null;
			}
			return accrualJe;
		}


		function getProjectedRevenueJE(projectId) {
			var values = [];
			if (projectId) {
				var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
					type: "customrecord_bbss_adv_sub_pay_schedule",
					filters:
						[
							["custrecord_bbss_adv_subpay_project","anyof", projectId],
							"AND",
							["custrecord_bbss_adv_subpay_trans_type","anyof","1"],
							"AND",
							["custrecord_bbss_adv_subpay_project.custentity_bb_project_acctg_method","anyof","4"]
						],
					columns:
						[
							search.createColumn({name: "custrecord_bbss_adv_subpay_transaction", label: "Transaction"})
						]
				});
				customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().each(function(result){
					values.push(result.getValue({name: 'custrecord_bbss_adv_subpay_transaction'}));
					return true;
				});
			}
			if (values.length > 0) {
				var stringValues = values.toString();
				return stringValues;
			} else {
				return null;
			}
		}


		function checkNativeEnabledFeatures() {
			var featureInfo = nsConfig.load({
				type: nsConfig.Type.FEATURES
			});

			var isClassEnabled = featureInfo.getValue({
				fieldId: 'classes'
			});
			var isDeptEnabled = featureInfo.getValue({
				fieldId: 'departments'
			});
			var isLocationEnabled = featureInfo.getValue({
				fieldId: 'locations'
			});
			return {
				isClassEnabled: isClassEnabled,
				isDeptEnabled: isDeptEnabled,
				isLocationEnabled: isLocationEnabled
			}
		}


		function shouldIncludeDownPayment(paymentScheduleId, milestoneId) {
			var includeDownPayment = false;
			var downPaymentRecognized = false;
			var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
				type: "customrecord_bbss_adv_sub_pay_schedule",
				filters:
					[
						["custrecord_bbss_adv_subpay_schedule","anyof", paymentScheduleId]
					],
				columns:
					[
						search.createColumn({
							name: "custrecord_bbss_adv_subpay_milestone",
							summary: "GROUP",
							sort: search.Sort.ASC,
							label: "Milestone"
						}),
						search.createColumn({
							name: "formulanumeric",
							summary: "GROUP",
							formula: "{custrecord_bbss_adv_subpay_recog_je.id}"
						})
					]
			});
			customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().each(function(result){

				var milestone = result.getValue({name: 'custrecord_bbss_adv_subpay_milestone', summary: 'GROUP'});
				var recognitionJe = result.getValue({name: 'formulanumeric', summary: 'GROUP', formula: '{custrecord_bbss_adv_subpay_recog_je.id}'});
				if (milestone == 12 && isNotNull(recognitionJe)) {
					downPaymentRecognized = true;
				} else if (milestone == milestoneId && milestone != 12 && !downPaymentRecognized) {
					includeDownPayment = true;
				}
				return true;
			});
			if (!downPaymentRecognized && includeDownPayment) {
				return true;
			} else {
				return false;
			}
		}


		function getCalculatedUnBilledAmount(parentId) {
			var total = 0;
			if (parentId) {
				var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
					type: "customrecord_bbss_adv_sub_pay_schedule",
					filters:
						[
							["custrecord_bbss_adv_subpay_schedule", "anyof", parentId],
							"AND",
							["custrecord_bbss_adv_subpay_trans_type", "anyof", "7"],
							"AND",
							["custrecord_bbss_adv_subpay_transaction", "anyof", "@NONE@"]
						],
					columns:
						[
							search.createColumn({
								name: "custrecord_bbss_adv_subpay_amount",
								summary: "SUM",
								label: "Amount"
							})
						]
				});
				var searchResultCount = customrecord_bbss_adv_sub_pay_scheduleSearchObj.runPaged().count;
				log.debug("customrecord_bbss_adv_sub_pay_scheduleSearchObj result count", searchResultCount);
				customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().each(function (result) {
					total = total + parseFloat(result.getValue({
						name: 'custrecord_bbss_adv_subpay_amount',
						summary: 'SUM'
					}))
					return true;
				});
			}
			log.debug('advanced milestone unbilled invoice total', total);
			return total
		}


		function getRolledInRoofingTotal(parentId) {
			// get roofing reduction amount and reduce that amount from unbilled AR
			log.debug('parentId in rolled in roofing total review', parentId);
			var roofingTotal = 0;
			if (parentId) {
				var customrecord_bbss_adv_sub_pay_scheduleSearchObj = search.create({
					type: "customrecord_bbss_adv_sub_pay_schedule",
					filters:
						[
							["custrecord_bbss_adv_subpay_schedule","anyof", parentId],
							"AND",
							["custrecord_bbss_adv_subpay_trans_type","anyof","1"],
							"AND",
							["custrecord_bbss_adv_subpay_category","anyof","1"]
						],
					columns:
						[
							search.createColumn({name: "custrecord_bbss_adv_subpay_amount", label: "Amount"})
						]
				});
				customrecord_bbss_adv_sub_pay_scheduleSearchObj.run().each(function(result){
					roofingTotal = roofingTotal + parseFloat(result.getValue({name: 'custrecord_bbss_adv_subpay_amount'}))
					return true;
				});
			}
			return roofingTotal;
		}


		function checkProjectForTaxDeduction(projectId) {
			var taxAmt = 0;
			if (projectId) {
				var invoiceSearchObj = search.create({
					type: "invoice",
					filters:
						[
							["custbody_bb_project", "anyof", projectId],
							"AND",
							["mainline", "is", "F"],
							"AND",
							["custbody_bb_milestone", "anyof", "3"],
							"AND",
							["type", "anyof", "CustInvc"],
							"AND",
							["formulatext: {account}", "contains", "tax"]
						],
					columns:
						[
							search.createColumn({name: "internalid", label: "Internal Id"}),
							search.createColumn({name: "entity", label: "Name"}),
							search.createColumn({name: "amount", label: "Amount"}),
							search.createColumn({name: "account", label: "Account"}),
							search.createColumn({name: "accounttype", label: "Account Type"})
						]
				});
				var searchResultCount = invoiceSearchObj.runPaged().count;
				log.debug("project transaction tax count", searchResultCount);
				invoiceSearchObj.run().each(function (result) {
					taxAmt = result.getValue({name: 'amount'})
					return true;
				});
			}
			return taxAmt;
		}


		return {
			createAccrualJE:createAccrualJE,
			createProjectedRevenueRecognitionJe: createProjectedRevenueRecognitionJe,
			createMilestoneRecognitionJe: createMilestoneRecognitionJe,
			createPercentCompleteRecognitionJe: createPercentCompleteRecognitionJe,
			createRolledInRoofingRecognitionJe: createRolledInRoofingRecognitionJe
		};
	});