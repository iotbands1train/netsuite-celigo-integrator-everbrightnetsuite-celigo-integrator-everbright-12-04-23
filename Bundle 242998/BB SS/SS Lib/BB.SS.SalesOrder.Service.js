/**
 * This is a SalesOrder service module
 *
 * @exports BB.SS.SalesOrder.Service
 *
 * @author Michael Golichenko <mgolichenko@bluebanyansolutions.com>
 * @version 0.0.1
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 *
 * @param recordModule {record} NetSuite native record service
 * @param searchModule {search} NetSuite native search service
 * @param salesOrderModel {module:SalesOrderModel} NetSuite native sales order model
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
function SalesOrderService(recordModule, searchModule, salesOrderModel){

    /**
     * @module SalesOrderService
     * @private
     */
    var _exports = function(){};

    /*
     *  ALL BUSINESS LOGIC FUNCTIONS
     */

    /**
     * <code>fulfillSalesOrderByProjectId</code> function
     *
     * @governance 10, 40
     * @param projectId {number|string} Project internal ID
     *
     * @return {void}
     */
    function fulfillSalesOrderByProjectId(projectId){
        var _salesOrder = findSalesOrderByProjectId(projectId);
        if(_salesOrder){
            var _itemFulfillment = recordModule.transform({fromType: salesOrderModel.Type, fromId: _salesOrder.id, toType: 'itemfulfillment'});
            _itemFulfillment.save();
        }
    }


    /*
     *  ALL DATA ACCESS FUNCTIONS
     */

    /**
     * <code>findSalesOrderByProjectId</code> function
     *
     * @governance 10
     * @param projectId {number|string} Project internal ID
     *
     * @return {Result | undefined}
     */
    function findSalesOrderByProjectId(projectId){
        var _foundSalesOrders = searchModule.create({
            type: salesOrderModel.Type,
            filters: [
                {
                    name: salesOrderModel.CustomFields.PROJECT,
                    operator: searchModule.Operator.ANYOF,
                    values: [projectId]
                }
            ]
        }).run().getRange({
            start: 0,
            end: 1
        });
        if(_foundSalesOrders.length > 0){
            return _foundSalesOrders[0];
        }
        return undefined;
    }

    /*
     * EXPOSING PUBLIC FUNCTIONS
     */

    _exports.prototype.fulfillSalesOrderByProjectId = fulfillSalesOrderByProjectId;

    return new _exports();
}

define(['N/record', 'N/search', './BB.SS.SalesOrder.Model'], SalesOrderService);