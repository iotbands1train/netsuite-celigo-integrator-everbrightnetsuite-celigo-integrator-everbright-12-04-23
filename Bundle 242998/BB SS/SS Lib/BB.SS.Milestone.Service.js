/**
 * This is a Milestone list service module
 *
 * @exports BB.SS.Lists.Milestone.Service
 *
 * @author Michael Golichenko <mgolichenko@bluebanyansolutions.com>
 * @version 0.0.1
 *
 * @NApiVersion 2.x
 * @NModuleScope public
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

define(['N/search'],
    /**
     * @param searchModule {search}
     */
    function(searchModule){
        var // milestone fields
            MILESTONE_RECORD = 'customlist_bb_milestone',
            MILESTONE_NAME_FIELD = 'name'
        ;

        var _exports = {};



        /**
         * <code>convertMilestoneFromNameToIndex</code> function
         *
         * @governance 0
         * @param milestoneName {string} Milestone name (M0, M1, M2,  M3)
         *
         * @return {number}
         *
         * @static
         * @function convertMilestoneFromNameToIndex
         */
        function convertMilestoneFromNameToIndex(milestoneName){
            return typeof milestoneName === 'string' ?  parseInt(milestoneName.replace(/^m/gi, '')) : -1;
        }

        /**
         * <code>findMilestoneByName</code> function
         *
         * @governance 10
         * @param milestoneName {string} Milestone name (M0, M1, M2,  M3)
         *
         * @return {Result|undefined}
         *
         * @static
         * @function findMilestoneByName
         */
        function findMilestoneByName(milestoneName){
            var _mField = searchModule.create({
                type: MILESTONE_RECORD,
                filters: [{
                    name: MILESTONE_NAME_FIELD,
                    operator: searchModule.Operator.IS,
                    values: milestoneName
                }]
            }).run().getRange({start:0, end: 1});
            if(_mField.length === 1){
                return _mField[0];
            }
            return undefined;
        }


        /**
         * Exports configuration
         */
        _exports.convertMilestoneFromNameToIndex = convertMilestoneFromNameToIndex;
        _exports.findMilestoneByName = findMilestoneByName;

        return _exports;
    });