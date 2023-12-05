/**
 * This is a Prospect service module
 *
 * @exports BB.SS.Prospect.Service
 *
 * @author Matt Lehman <mlehman@bluebanyansolutions.com>
 * @version 0.0.1
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 *
 * @param recordModule {record} NetSuite native record service
 * @param searchModule {search} NetSuite native search service
 * @param prospectModel {module:ProspectModel} NetSuite native Prospect model
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
function ProspectService(recordModule, searchModule, prospectModel, financingTypeService){

    /**
     * @module ProspectService
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
     * @param prospect {Record} NetSuite prospect record instance
     * @returns {number|undefined}
     */
    function getFinancierByFinancingType(prospect){
        var _financier = prospect.getValue({fieldId: prospectModel.CustomFields.FINANCIER_REF}),
            _financingType = prospect.getValue({fieldId: prospectModel.CustomFields.FINANCING_TYPE});
        if(financingTypeService.isCashFinancingType(_financingType)){
            return prospect.id;
        }

        return undefined;
    }

    /*
     *  ALL DATA ACCESS FUNCTIONS
     */

    /**
     * <code>getProspectRecordById</code> function
     *
     * @governance 5
     *
     * @param customerId {number|string} Prospect internal ID
     * @return {Record}
     */
    function getProspectRecordById(prospectId){
        return recordModule.load({type: prospectModel.Type, id: prospectId});
    }

    _exports.prototype.getProspectRecordById = getProspectRecordById;
    _exports.prototype.getFinancierByFinancingType = getFinancierByFinancingType;

    return new _exports();
}



define(['N/record', 'N/search', './BB.SS.Prospect.Model', './BB.SS.FinancingType.Service'], ProspectService);