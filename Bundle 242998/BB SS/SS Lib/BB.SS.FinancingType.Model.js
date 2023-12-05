/**
 * This is a Financing Type list module
 *
 * @exports BB.SS.FinancingType.Model
 * @author Michael Golichenko <mgolichenko@bluebanyansolutions.com>
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
function FinancingTypeModel(){

    /**
     * @module FinancingTypeModel
     * @private
     * @class
     */
    var _exports = function(){};

    /**
     * Financing Type record id
     * @type {string}
     */
    _exports.prototype.Type = 'customlist_bb_financing_type';

    /**
     * Financing Type internal id
     * @type {{CASH: number, LOAN: number, TPO: number}}
     */
    _exports.prototype.Value = {
        CASH: 1,
        LOAN: 2,
        TPO: 3
    };

    /**
     * Financing Type text value
     * @type {{CASH: string, LOAN: string, TPO: string}}
     */
    _exports.prototype.Text = {
        CASH: 'Cash',
        LOAN: 'Loan',
        TPO: 'TPO (lease, PPA)'
    };


    return new _exports();
}


define([], FinancingTypeModel);