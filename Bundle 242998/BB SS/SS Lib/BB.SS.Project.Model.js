/**
 * This is a Project model module
 *
 * @exports BB.SS.Project.Model
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
function ProjectModel(){

    /**
     * @module ProjectModel
     * @private
     * @class
     */
    var _exports = function(){};

    /**
     * Project record type
     * @type {string}
     */
    _exports.prototype.Type = 'job';

    /**
     * Project native sublist IDs
     */
    _exports.prototype.Sublists = {

    };
    /**
     * Project native field IDs
     */
    _exports.prototype.Fields = {
        JOB_TYPE: 'jobtype'
    };
    /**
     * Project custom field IDs
     */
    _exports.prototype.CustomFields = {
        PROJECT_TEMPLATE: 'custentity_bb_started_from_proj_template',
        FINANCIER_REF: 'custentity_bb_financier_customer',
        FINANCING_TYPE: 'custentity_bb_financing_type',
        M1_DATE: 'custentity_bb_m1_date'
    };

    return new _exports();
}


define([], ProjectModel);