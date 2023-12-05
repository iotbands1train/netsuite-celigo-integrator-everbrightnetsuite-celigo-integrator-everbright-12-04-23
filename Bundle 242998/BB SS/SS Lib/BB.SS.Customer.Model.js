/**
 * This is a Customer model module
 *
 * @exports BB.SS.Customer.Model
 *
 * @author Matt Lehman <mlehman@bluebanyansolutions.com>
 * @version 0.0.1
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 *
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
function CustomerModel(){

    /**
     * @module CustomerModel
     * @private
     * @class
     */
    var _exports = function(){};

    /**
     * Customer record type
     * @type {string}
     */
    _exports.prototype.Type = 'customer';

    /**
     * Customer native sublist IDs
     */
    _exports.prototype.Sublists = {

    };
    /**
     * Customer native field IDs
     */
    _exports.prototype.Fields = {
        INTERNAL_ID: 'internalid'
    };
    /**
     * Customer custom field IDs
     */
    _exports.prototype.CustomFields = {
        FINANCIER_REF: 'custentity_bb_financier_customer',
        FINANCING_TYPE: 'custentity_bb_financing_type'
    };

    return new _exports();
}


define([], CustomerModel);