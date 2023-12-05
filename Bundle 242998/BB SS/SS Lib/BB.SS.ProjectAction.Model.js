/**
 * This is a Project Action model module
 *
 * @exports BB.SS.ProjectAction.Model
 *
 * @author Michael Golichenko <mgolichenko@bluebanyansolutions.com>
 * @version 0.0.2
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
function ProjectActionModel(){

    /**
     * @module ProjectActionModel
     * @private
     * @class
     */
    var _exports = function(){};

    /**
     * Project Action record type
     * @type {string}
     */
    _exports.prototype.Type = 'customrecord_bb_project_action';

    /**
     * Project Action native sublist IDs
     */
    _exports.prototype.Sublists = {

    };
    /**
     * Project Action native field IDs
     */
    _exports.prototype.Fields = {
        NAME: 'name'
    };
    /**
     * Project Action custom field IDs
     */
    _exports.prototype.CustomFields = {
        PROJECT: 'custrecord_bb_project',
        PACKAGE: 'custrecord_bb_package',
        PROJECT_PACKAGE_ACTION: 'custrecord_bb_project_package_action',
        PACKAGE_STEP: 'custrecord_bb_package_step_number',
        DOCUMENT: 'custrecord_bb_project_document',
        DOCUMENT_MANAGER: 'custrecord_bb_proj_dm_iframe_html',
        DOCUMENT_SAVED_DATE: 'custrecord_bb_doc_saved_date',
        REVISION_NUMBER: 'custrecord_bb_revision_number',
        DOCUMENT_STATUS: 'custrecord_bb_document_status',
        DOCUMENT_STATUS_DATE: 'custrecord_bb_document_status_date',
        REJECTION_COMMENTS: 'custrecord_bb_rejection_comments',
        REJECTION_COMMENT_HISTORY: 'custrecord_bb_doc_reject_comm_history',
        ACTION_TYPE: 'custrecord_bb_project_doc_action_type',
        REQUIRED: 'custrecord_bb_proj_doc_required_optional',
        UNIQUE_ID: 'custrecord_bb_proj_task_uuid_txt',
        DOCUMENT_MANAGER_FOLDER: 'custrecord_bb_proj_task_dm_folder_text'
    };

    return new _exports();
}


define([], ProjectActionModel);