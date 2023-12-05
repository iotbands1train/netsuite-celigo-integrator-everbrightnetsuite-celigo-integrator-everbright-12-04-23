/**
 * This is a Transaction service module
 *
 * @exports BB.SS.Transaction.Service
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

define(['N/search'],
    /**
     * @param searchModule {search}
     */
    function(searchModule){

        var // transaction search fields
            TRANSACTION_PROJECT_FIELD = 'custbody_bb_project',
            TRANSACTION_ENTITY_FIELD = 'entity',
            TRANSACTION_RECORD = 'transaction',
            TRANSACTION_GROSS_AMOUNT_FIELD = 'grossamount',
            TRANSACTION_TYPE_FIELD = 'type',
            TRANSACTION_MAIN_LINE_FIELD = 'mainline',
            TRANSACTION_MILESTONE_FIELD = 'custbody_bb_milestone',
            TRANSACTION_VENDOR_BILL_TYPE = 'VendBill',
            TRANSACTION_VENDOR_CREDIT_TYPE = 'VendCred',
            TRANSACTION_ACCOUNT_TYPE_FIELD = 'accounttype',
            TRANSACTION_TAX_LINE = 'taxline',
            TRANSACTION_CUSTOM_GL = 'customgl',
            TRANSACTION_DISCOUNT = 'transactiondiscount',
            // default values
            TRANSACTION_DEFAULT_MAIN_LINE = 'F',
            TRANSACTION_LINE = 'line'
        ;

        var _exports = {};

        /*
         *  ALL BUSINESS LOGIC FUNCTIONS
         */


        /**
         * <code>calculateAmount</code> function
         *
         * @governance 0
         * @param project {Record} Project record
         * @param transactions {Result[]} BB SS Configuration record
         * @param milestoneIndex {number} Milestone index number
         * @param milestoneFields {string[]} Project milestone fields
         *
         * @return {number}
         *
         * @static
         * @function calculateAmount
         */
        function calculateAmount(project, transactions, milestoneIndex, milestoneFields, alreadyPaidAmount){
            log.debug('milestoneIndex', milestoneIndex)
            log.debug('milestoneFields', milestoneFields)
            var _alreadyPaid = typeof alreadyPaidAmount === 'number' ? alreadyPaidAmount : 0;
            var _paid = transactions.map(function(trans){
                var _amount = trans.getValue({name: TRANSACTION_GROSS_AMOUNT_FIELD});
                if(typeof _amount === 'string'){
                    _amount = parseFloat(_amount);
                }
                if(isNaN(_amount)){
                    _amount = 0;
                }
                return _amount;
            }).reduce(function(total, value){
                return total + value;
            }, 0);
            var _due = milestoneFields.map(function(field, idx){
                return idx > milestoneIndex ? 0 : parseFloat(project.getValue({fieldId: field}));
            }).reduce(function(total, value){
                return total + value;
            }, 0);
            log.debug('due', _due);
            log.debug('_alreadyPaid', _alreadyPaid);
            log.debug('_paid', _paid);
            return _due - _alreadyPaid - _paid;
        }

        /*
         *  ALL DATA ACCESS FUNCTIONS
         */

        /**
         * <code>findAllTransactionsByProjectIdAndVendorId</code> function
         *
         * @governance 10
         * @param projectId {number|string} Project internal ID
         * @param vendorId {number|string} Vendor internal ID
         * @param types {string[]} Transaction types to filter by
         *
         * @return {Result[]}
         *
         * @static
         * @function findAllTransactionsByProjectIdAndVendorId
         */
        function findAllTransactionsByProjectIdAndVendorId(projectId, vendorId, types, milestone, directPayItem, status){
            var _invoices =  [];
            var _filters = [
                {
                    name: TRANSACTION_MAIN_LINE_FIELD,
                    operator: searchModule.Operator.IS,
                    values: [TRANSACTION_DEFAULT_MAIN_LINE]
                },
                {
                    name: TRANSACTION_TAX_LINE,
                    operator: searchModule.Operator.IS,
                    values: ['F']
                },
                {
                    name: TRANSACTION_PROJECT_FIELD,
                    operator: searchModule.Operator.ANYOF,
                    values: [projectId]
                },
                {
                    name: TRANSACTION_CUSTOM_GL,
                    operator: searchModule.Operator.IS,
                    values: ['F']
                },
                {
                    name: TRANSACTION_DISCOUNT,
                    operator: searchModule.Operator.IS,
                    values: ['F']
                },
                {
                    name: TRANSACTION_TYPE_FIELD,
                    operator: searchModule.Operator.ANYOF,
                    values: types
                }];
            if (!isNull(status)) {
                _filters.push({
                    name: 'status',
                    operator: searchModule.Operator.NONEOF,
                    values: [status]
                });
            }
            if(!isNull(milestone)){
                _filters.push({
                    name: TRANSACTION_MILESTONE_FIELD,
                    operator: searchModule.Operator.ANYOF,
                    values:[milestone]
                });
            } else {
                _filters.push({
                    name: TRANSACTION_MILESTONE_FIELD,
                    operator: searchModule.Operator.ANYOF,
                    values:[1, 3, 4, 5, 6, 8, 9, 10, 11]
                });
            }
            if (directPayItem) {
                _filters.push({
                    name: TRANSACTION_ITEM_FIELD,
                    operator: searchModule.Operator.NONEOF,
                    values:[directPayItem]
                });
            }

            if(!isNull(vendorId)){
                _filters.push({
                    name: TRANSACTION_ENTITY_FIELD,
                    operator: searchModule.Operator.ANYOF,
                    values:[vendorId]
                });
            }

            searchModule.create({
                type: TRANSACTION_RECORD,
                filters: _filters,
                columns: [{name: TRANSACTION_GROSS_AMOUNT_FIELD}, {name: TRANSACTION_MILESTONE_FIELD}]
            }).run().each(function(invoice){
                _invoices.push(invoice);
                return true;
            });
            log.debug('vendor bills created', _invoices);
            return _invoices;
        }

        function isNull(param){
            return param ==  null || param == '' || param == undefined;
        }

        /**
         * <code>milestoneInvoiceExists</code> function
         *
         * @governance 0
         * @param transactions {Result[]} BB SS Configuration record
         * @param milestoneIndex {number} Milestone index number
         *
         * @return {boolean}
         *
         * @static
         * @function milestoneInvoiceExists
         */
        function milestoneInvoiceExists(transactions, milestoneIndex){
            var _result = transactions.filter(function(transaction){
                var _milestoneText = transaction.getText({name: TRANSACTION_MILESTONE_FIELD});
                var _regex = new RegExp(['m', milestoneIndex].join(''), 'ig');
                return _regex.test(_milestoneText);
            });
            return _result && _result.length > 0;
        }

        /**
         * <code>canGenerateTransaction</code> function
         *
         * @governance 0
         * @param project {Record} Project to check if can generate transactions
         * @returns {boolean}
         */
        function canGenerateTransaction(project){
            var _finalDateCompleted = project ? project.getValue({fieldId: 'custentity_bb_final_completion_date'}) : undefined;
            return typeof _finalDateCompleted === 'undefined' || _finalDateCompleted == null || (typeof _finalDateCompleted === 'string' && _finalDateCompleted.length === 0);
        }

        _exports.calculateAmount = calculateAmount;
        _exports.findAllTransactionsByProjectIdAndVendorId = findAllTransactionsByProjectIdAndVendorId;
        _exports.milestoneInvoiceExists = milestoneInvoiceExists;
        _exports.canGenerateTransaction = canGenerateTransaction;

        return _exports;
    });