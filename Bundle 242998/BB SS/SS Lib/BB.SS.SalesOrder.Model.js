/**
 * This is a SalesOrder model module
 *
 * @exports BB.SS.SalesOrder.Model
 *
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
function SalesOrderModel(){

    /**
     * @module SalesOrderModel
     * @class
     */
    var _exports = function(){};

    /**
     * SalesOrder record type
     * @type {string}
     */
    _exports.prototype.Type = 'salesorder';

    /**
     * SalesOrder native sublist IDs
     */
    _exports.prototype.Sublists = {

    };

    /**
     * SalesOrder native field IDs
     */
    _exports.prototype.Fields = {

    };

    /**
     * SalesOrder custom field IDs
     */
    _exports.prototype.CustomFields = {
        PROJECT: 'custbody_bb_project'
    };

    return new _exports();
}


define([], SalesOrderModel);