/**
 * This is a Lead service module
 *
 * @exports BB.SS.Lead.Service
 *
 * @author Michael Golichenko <mgolichenko@bluebanyansolutions.com>
 * @version 0.0.1
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 *
 * @param recordModule {record} NetSuite native record service
 * @param searchModule {search} NetSuite native search service
 * @param leadModel {module:LeadModel} NetSuite native lead model
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
function LeadService(recordModule, searchModule, leadModel, financingTypeService){

    /**
     * @module LeadService
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
     * @param lead {Record} NetSuite lead record instance
     * @returns {number|undefined}
     */
    function getFinancierByFinancingType(lead){
        var _financier = lead.getValue({fieldId: leadModel.CustomFields.FINANCIER_REF}),
            _financingType = lead.getValue({fieldId: leadModel.CustomFields.FINANCING_TYPE});
        log.debug('lead service: getFinancierByFinancingType => _financier', _financier);
        log.debug('lead service: getFinancierByFinancingType => _financingType', _financingType);
        log.debug('lead service: getFinancierByFinancingType => isCashFinancingType', financingTypeService.isCashFinancingType(_financingType));
        if(financingTypeService.isCashFinancingType(_financingType)){
            return lead.id;
        } else {
            return _financier;
        }
    }

    /*
     *  ALL DATA ACCESS FUNCTIONS
     */

    /**
     * <code>getLeadRecordById</code> function
     *
     * @governance 5
     *
     * @param leadId {number|string} Lead internal ID
     * @return {Record}
     */
    function getLeadRecordById(leadId){
        return recordModule.load({type: leadModel.Type, id: leadId});
    }

    _exports.prototype.getLeadRecordById = getLeadRecordById;
    _exports.prototype.getFinancierByFinancingType = getFinancierByFinancingType;

    return new _exports();
}



define(['N/record', 'N/search', './BB.SS.Lead.Model', './BB.SS.FinancingType.Service'], LeadService);