/**
 * This is a Proposal model module
 *
 * @exports BB.SS.Proposal.Model
 *
 * @author Michael Golichenko <mgolichenko@bluebanyansolutions.com>
 * @version 0.0.1
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
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
function ProposalModel(){

    /**
     * @module ProposalModel
     * @class
     */
    var _exports = function(){};

    /**
     * Proposal record type
     * @type {string}
     */
    _exports.prototype.Type = 'customrecord_bb_proposal';

    /**
     * Proposal native sublist IDs
     */
    _exports.prototype.Sublists = {

    };

    /**
     * Proposal native field IDs
     */
    _exports.prototype.Fields = {

    };

    /**
     * Proposal custom field IDs
     */
    _exports.prototype.CustomFields = {
        LEAD_REF: 'custrecord_bb_lead',
        FILE_REF: 'custrecord_bb_file_system',
        PROJECT_TEMPLATE_REF: 'custrecord_bb_project_template',
        SEQUENCE_NUMBER: 'custrecord_bb_proposal_seq_number',
        SELECTED: 'custrecord_bb_is_selected_proposal',
        FINANCIER_PROPOSAL_ID: 'custrecord_bb_financier_proposal_id_txt'
    };

    return new _exports();
}


define([], ProposalModel);