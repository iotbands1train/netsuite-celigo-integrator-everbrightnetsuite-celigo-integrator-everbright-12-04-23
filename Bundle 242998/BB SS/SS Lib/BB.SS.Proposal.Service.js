/**
 * This is a Proposal service module
 *
 * @exports BB.SS.Proposal.Service
 *
 * @copyright Blue Banyan Solutions
 * @author Michael Golichenko <mgolichenko@bluebanyansolutions.com>
 * @version 0.0.1
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 *
 * @param recordModule {record} NetSuite native record service
 * @param searchModule {search} NetSuite native search service
 * @param proposalModel {module:ProposalModel} NetSuite native proposal model
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
function ProposalService(recordModule, searchModule, proposalModel){

    /**
     * @module ProposalService
     * @private
     */
    var _exports = function(){};

    /*
     *  ALL BUSINESS LOGIC FUNCTIONS
     */

    /**
     * <code>uncheckSelectedProposals</code> function
     *
     * @governance 0, 12+
     * @param proposal {Record} Prooposal object
     *
     * @return {void}
     */
    function uncheckSelectedProposals(proposal){
        var _leadId = proposal.getValue({fieldId: proposalModel.CustomFields.LEAD_REF});
        log.debug('proposal service: leadId', _leadId);
        log.debug('proposal service: isProposalSelected', isProposalSelected(proposal));
        if(_leadId && isProposalSelected(proposal)){
            uncheckSelectedProposalsByLeadId(_leadId, proposal.id);
        }
    }

    /**
     * <code>uncheckSelectedProposalsByLeadId</code> function
     *
     * @governance 12+
     *
     * @param leadId {number|string} Lead internal ID
     * @param ignoreProposalId {number|string} Proposal internal ID to be ignored during un-checking
     *
     * @return {void}
     */
    function uncheckSelectedProposalsByLeadId(leadId, ignoreProposalId){
        var _selectedProposalIds = findSelectedProposalIdsByLeadId(leadId);
        if(_selectedProposalIds.length > 0){
            _selectedProposalIds.forEach(function(proposalId){
                if(ignoreProposalId != proposalId){
                    uncheckSelectedProposal(proposalId);
                }
            });
        }
    }

    /**
     * <code>setProposalSequenceNumber</code> function
     *
     * @governance 12
     * @param proposal {Record} Proposal record
     * @param updateRecord {boolean} trigger if record update is required
     *
     * @return {Record}
     */
    function setProposalSequenceNumber(proposal, updateRecord){
        var _leadId = proposal.getValue({fieldId: proposalModel.CustomFields.LEAD_REF}),
            _allProposalIds = findAllProposalIdsByLeadId(_leadId),
            _sequence = _allProposalIds.length + 1;
        proposal.setValue({fieldId: proposalModel.CustomFields.SEQUENCE_NUMBER, value: _sequence});
        if(typeof updateRecord === 'boolean' && updateRecord){
            updateProposalSequence(proposal.id, _sequence);
        }
        return proposal;
    }

    /**
     * <code>isProposalSelected</code> function
     *
     * @governance 0
     * @param proposal {Record} Proposal record
     *
     * @return {boolean}
     */
    function isProposalSelected(proposal){
        var _selected = proposal.getValue({fieldId: proposalModel.CustomFields.SELECTED});
        log.debug('proposal service: selected', _selected);
        return _selected && (_selected == true || /T/ig.test(_selected));
    }

    /*
     *  ALL DATA ACCESS FUNCTIONS
     */

    /**
     * <code>findSelectedProposalByLeadIdForLeadToProjectConversion</code> function
     *
     * @governance 10
     * @param leadId {number|string} Lead internal ID
     *
     * @return {Result | undefined}
     */
    function findSelectedProposalByLeadIdForLeadToProjectConversion(leadId){
        var _selectedProposal = searchModule.create({
            type: proposalModel.Type,
            filters: [
                {
                    name: proposalModel.CustomFields.LEAD_REF,
                    operator: searchModule.Operator.ANYOF,
                    values: [leadId]
                },
                {
                    name: proposalModel.CustomFields.SELECTED,
                    operator: searchModule.Operator.IS,
                    values: ['T']
                }
            ],
            columns: [
                {name: proposalModel.CustomFields.FILE_REF},
                {name: proposalModel.CustomFields.PROJECT_TEMPLATE_REF}
            ]
        }).run().getRange({
            start: 0,
            end: 1
        });
        if(_selectedProposal.length > 0){
            return _selectedProposal[0];
        }
        return undefined;
    }

    /**
     * <code>findAllProposalIdsByLeadId</code> function
     *
     * @governance 10
     * @param leadId {number|string} Lead internal ID
     *
     * @return {number[]}
     */
    function findAllProposalIdsByLeadId(leadId){
        var _selectedProposalIds = [];
        searchModule.create({
            type: proposalModel.Type,
            filters: [
                {
                    name: proposalModel.CustomFields.LEAD_REF,
                    operator: searchModule.Operator.IS,
                    values: [leadId]
                }
            ]
        }).run().each(function(proposal){
            _selectedProposalIds.push(proposal.id);
            return true;
        });
        return _selectedProposalIds;
    }

    /**
     * <code>findSelectedProposalIdsByLeadId</code> function
     *
     * @governance 10
     * @param leadId {number|string} Lead internal ID
     *
     * @return {number[]}
     */
    function findSelectedProposalIdsByLeadId(leadId){
        var _selectedProposalIds = [];
        searchModule.create({
            type: proposalModel.Type,
            filters: [
                {
                    name: proposalModel.CustomFields.LEAD_REF,
                    operator: searchModule.Operator.ANYOF,
                    values: [leadId]
                },
                {
                    name: proposalModel.CustomFields.SELECTED,
                    operator: searchModule.Operator.IS,
                    values: ['T']
                }
            ]
        }).run().each(function(proposal){
            _selectedProposalIds.push(proposal.id);
            return true;
        });
        return _selectedProposalIds;
    }

    /**
     * <code>uncheckSelectedProposal</code> function
     *
     * @governance 2
     * @param proposalId {number|string} Proposal internal ID
     *
     * @return {void}
     *
     * @static
     * @function uncheckSelectedProposal
     */
    function uncheckSelectedProposal(proposalId){
        var _values = {};
        _values[proposalModel.CustomFields.SELECTED] = false;
        updateProposalFieldsWithValues(proposalId, _values);
    }

    /**
     * <code>updateProposalSequence</code> function
     *
     * @governance 2
     * @param proposalId {number|string} Proposal internal ID
     * @param sequence {number} Sequence number
     *
     * @return {void}
     *
     * @static
     * @function updateProposalSequence
     */
    function updateProposalSequence(proposalId, sequence){
        var _values = {};
        _values[proposalModel.CustomFields.SEQUENCE_NUMBER] = sequence;
        updateProposalFieldsWithValues(proposalId, _values);
    }

    /**
     * <code>updateProposalFieldsWithValues</code> function
     *
     * @governance 2
     * @param proposalId {number|string} Proposal internal ID
     * @param values {object} Values object (KEY = property, VALUE = value) Example: {'sequence': 3}
     *
     * @return {void}
     *
     * @static
     * @function updateProposalFieldsWithValues
     */
    function updateProposalFieldsWithValues(proposalId, values){
        recordModule.submitFields({
            type: proposalModel.Type,
            id: proposalId,
            values: values,
          	options: {
              	ignoreMandatoryFields: true
            }
        });
    }

    /*
     * EXPOSING PUBLIC FUNCTIONS
     */

    _exports.prototype.uncheckSelectedProposals = uncheckSelectedProposals;
    _exports.prototype.setProposalSequenceNumber = setProposalSequenceNumber;
    _exports.prototype.findSelectedProposalByLeadIdForLeadToProjectConversion = findSelectedProposalByLeadIdForLeadToProjectConversion;
    _exports.prototype.isProposalSelected = isProposalSelected;

    return new _exports();
}

define(['N/record', 'N/search', './BB.SS.Proposal.Model'], ProposalService);