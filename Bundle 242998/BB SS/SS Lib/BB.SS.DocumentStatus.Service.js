/**
 * This is a Demo data generation service module
 *
 * @exports BB.SS.DemoDataGeneration.Service
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

function DemoDataGenerationService (searchModule, recordModule){

    var _recordTypes = {
            DEMO_DATA_SEARCH_RECORD_TYPE: 'customrecord_bb_ss_demo_data_search'
        },
        _fields = {
            IS_INACTIVE: 'isinactive',
            SEARCH_SEQUENCE_FIELD: 'custrecord_bb_ss_demo_data_search_seq',
            SEARCH_REF: 'custrecord_bb_ss_demo_data_search_ref'
        },
        _mapping = {
            project: 'job',
            project_action: 'customrecord_bb_project_action'
        };

    var _export = {};

    /*
     *  ALL BUSINESS LOGIC FUNCTIONS
     */

    /**
     * <code>processDemoDataGeneration</code> function
     *
     * @governance 25+
     *
     * @return {void}
     *
     * @static
     * @function processDemoDataGeneration
     */
    function processDemoDataGeneration(){
        var _searchIds = getListOfSearchIds();
        _searchIds.forEach(function(id){
            var _data = executeSearch(id),
                _loadFields = getLoadFields(_data.columns),
                _setFields = getSetFields(_data.columns);
            _data.rows.forEach(function(row){
                var _updates = {};
                _loadFields.forEach(function(load){
                    if(load.type){
                        _updates[load.type] = {type: load.type, id: row.getValue(load.column), values: {}, update: false};
                    }
                });
                _setFields.forEach(function(set){
                    if(_updates[set.type] && set.field){
                        _updates[set.type].update = true;
                        _updates[set.type].values[set.field] = row.getValue(set.column);
                    }
                });
                for(var prop in _updates){
                    if(_updates.hasOwnProperty(prop) && _updates[prop].update){
                        delete _updates[prop].update;
                        updateRecord(_updates[prop]);
                    }
                }
            });
        });
    }

    /**
     * <code>getLoadFields</code> function searches for 'load' prefixed columns names (eg: load.project.internalid)
     *
     * @governance 0
     * @param columns {Column[]} List of all search columns
     *
     * @return {object}
     *
     * @static
     * @function getLoadFields
     */
    function getLoadFields(columns){
        var _regex = /^load\.(project|project_action)\.(.*)$/ig;
        return getFieldsByRegex(_regex, columns);
    }

    /**
     * <code>getGetFields</code> function searches for 'get' prefixed columns names (eg: get.project.internalid)
     *
     * @governance 0
     * @param columns {Column[]} List of all search columns
     *
     * @return {object}
     *
     * @static
     * @function getGetFields
     */
    function getGetFields(columns){
        var _regex = /^get\.(project|project_action)\.(.*)$/ig;
        return getFieldsByRegex(_regex, columns);
    }

    /**
     * <code>getSetFields</code> function searches for 'set' prefixed columns names (eg: set.project.internalid)
     *
     * @governance 0
     * @param columns {Column[]} List of all search columns
     *
     * @return {object}
     *
     * @static
     * @function getSetFields
     */
    function getSetFields(columns){
        var _regex = /^set\.(project|project_action)\.(.*)$/ig;
        return getFieldsByRegex(_regex, columns);
    }

    /**
     * <code>getFieldsByRegex</code> function searches for regular expression specified columns names
     *
     * @governance 0
     * @param regex {RegExp} Regular expression to search for
     * @param columns {Column[]} List of all search columns
     *
     * @return {object}
     *
     * @static
     * @function getSetFields
     */
    function getFieldsByRegex(regex, columns){
        var _split = undefined,
            _result = [];
        columns.forEach(function(column, idx){
            regex.lastIndex = 0;
            if(regex.test(column.label)){
                regex.lastIndex = 0;
                _split = regex.exec(column.label);
                _result.push({index: idx, type: _mapping[_split[1]], field: _split[2], column: column});
            }
        });
        return _result;
    }

    /*
     *  ALL DATA ACCESS FUNCTIONS
     */

    /**
     * <code>updateRecord</code> function
     *
     * @governance 10 for Transaction, 2 for Custom, 5 for All other records
     * @param data {object} Object containing saving data information
     * @param data.type {string} Record type
     * @param data.id {number} Record internal ID
     * @param data.values {object} Key value pair of field and its value
     *
     * @return {number}
     *
     * @static
     * @function updateRecord
     */
    function updateRecord(data){
        return recordModule.submitFields(data);
    }

    /**
     * <code>getListOfSearchIds</code> function
     *
     * @governance 10
     *
     * @return {number[]}
     *
     * @static
     * @function getListOfSearchIds
     */
    function getListOfSearchIds(){
        var _searches = getListOfSearches(),
            _ids = [];
        _searches.forEach(function(search){
            _ids.push(search.getValue({name: _fields.SEARCH_REF}));
        });
        return _ids;
    }

    /**
     * <code>getListOfSearches</code> function
     *
     * @governance 10
     *
     * @return {Search[]}
     *
     * @static
     * @function getListOfSearches
     */
    function getListOfSearches(){
        var _searches = [];
        searchModule.create({
            type: _recordTypes.DEMO_DATA_SEARCH_RECORD_TYPE,
            filters: [{name: _fields.IS_INACTIVE, operator: 'is', values: ['F']}],
            columns: [{name: _fields.SEARCH_SEQUENCE_FIELD, sort: searchModule.Sort.ASC}, _fields.SEARCH_REF]
        }).run().each(function(search){
            _searches.push(search);
            return true;
        });
        return _searches;
    }

    /**
     * <code>executeSearch</code> function
     *
     * @governance 15
     * @param searchId {number|string} Search internal ID
     *
     * @return {object}
     *
     * @static
     * @function executeSearch
     */
    function executeSearch(searchId){
        var _items = [],
            _resultSet = searchModule.load({id: searchId}).run(),
            _columns = _resultSet.columns;
            _resultSet.each(function(item){
                _items.push(item);
                return true;
            });
        return {rows: _items, columns: _columns};
    }

    _export.processDemoDataGeneration = processDemoDataGeneration;

    return _export;
}

define(['N/search', 'N/record'], DemoDataGenerationService);