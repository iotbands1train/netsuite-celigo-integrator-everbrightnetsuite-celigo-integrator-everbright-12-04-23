/**
 * This is a Customer service module
 *
 * @exports BB.SS.Customer.Service
 *
 * @author Matt Lehman <mlehman@bluebanyansolutions.com>
 * @version 0.0.1
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 *
 * @param recordModule {record} NetSuite native record service
 * @param searchModule {search} NetSuite native search service
 * @param customerModel {module:CustomerModel} NetSuite native Customer model
 * @param financingTypeService {module:FinancingTypeService} NetSuite financing type list model
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
function CustomerService(recordModule, searchModule, customerModel, financingTypeService){

    /**
     * @module CustomerService
     * @private
     * @class
     */
    var _exports = function(){};

    /*
     *  ALL BUSINESS LOGIC FUNCTIONS
     */

    /**
     * <code>getFinancierByFinancingType</code> function
     *
     * @governance 0
     *
     * @param customer {Record} NetSuite customer record instance
     * @returns {number|undefined}
     */
    function getFinancierByFinancingType(customer){
        var _financier = customer.getValue({fieldId: customerModel.CustomFields.FINANCIER_REF}),
            _financingType = customer.getValue({fieldId: customerModel.CustomFields.FINANCING_TYPE});
        if(financingTypeService.isCashFinancingType(_financingType)){
            return customer.id;
        }

        return undefined;
    }

    /*
     *  ALL DATA ACCESS FUNCTIONS
     */

    /**
     * <code>getCustomerRecordById</code> function
     *
     * @governance 5
     *
     * @param customerId {number|string} Lead internal ID
     * @return {Record}
     */
    function getCustomerRecordById(customerId){
        return recordModule.load({type: customerModel.Type, id: customerId});
    }

    _exports.prototype.getCustomerRecordById = getCustomerRecordById;
    _exports.prototype.getFinancierByFinancingType = getFinancierByFinancingType;

    return new _exports();
}



define(['N/record', 'N/search', './BB.SS.Customer.Model', './BB.SS.FinancingType.Service'], CustomerService);