/**
 * This is a Financing Type service module
 *
 * @exports BB.SS.FinancingType.Service
 *
 * @author Michael Golichenko <mgolichenko@bluebanyansolutions.com>
 * @version 0.0.1
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 *
 * @param financingTypeModel {module:FinancingTypeModel} NetSuite financing type list model
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

function FinancingTypeService(financingTypeModel){

    /**
     * @module FinancingTypeService
     * @private
     * @class
     */
    var _exports = function(){};

    /*
     *  ALL BUSINESS LOGIC FUNCTIONS
     */

    /**
     * Check if value is Cash Financing type
     * @param value {number|string} Value of possible Financing type
     * @returns {boolean}
     */
    function isCashFinancingType(value){
        if(!isNaN(parseInt(value))){
            value = parseInt(value);
        }
        switch (typeof value){
            case 'number':
                return value == financingTypeModel.Value.CASH;
            case 'string':
                return value == financingTypeModel.Text.CASH;
            default:
                return false;
        }
    }

    _exports.prototype.isCashFinancingType = isCashFinancingType;

    return new _exports();
}


define(['./BB.SS.FinancingType.Model'], FinancingTypeService);