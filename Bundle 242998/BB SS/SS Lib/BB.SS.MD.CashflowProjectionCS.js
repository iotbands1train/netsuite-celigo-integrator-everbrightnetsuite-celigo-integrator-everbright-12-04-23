/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Ashley Wallace
 * @version 0.1.0
 * @copyright Blue Banyan Solutions 2018
 * @fileOverview This Custom Module library is used with the Cashflow
 * projection client script
 */

define(['N/record', 'N/search'], function (record, search) {

    
    /**
     * returns a project statistic record from a given 
     * internal ID. 
     * @param {integer} recordID 
     * @returns {record} - NS project statistics record
     */
    function getProjStatRecord(recordID) {
        return record.load({
            type: 'customrecord_bb_project_statistics',
            id: recordID,
            isDynamic: false,
        });
    }



    /**
     * looks for cash flow what if records with a given name.
     * returns either 0 or the internal ID of the first existing record
     * @param {string} nameStr 
     * @returns {integer} - internal ID of the first existing record, or 0
     */
    function nameExists(nameStr) 
    {
        var nameSearch = search.create({
            type: 'customrecord_cashflow_projection_what_if',
            columns: [{
                name: 'internalid'
            }, {
                name: 'name'
            }],
            filters: [{
                name: 'name',
                operator: 'is',
                values: [nameStr]
            }]
        }).run().getRange({
            start: 0,
            end: 1000
        });
        
        if(!nameSearch.length)
           return 0;

        return nameSearch[0].getValue(nameSearch[0].columns[0]);
    };


    function getStatID(projType, finType, installState) {
        
        var searchResults =  getProjStatSearch(projType, finType, installState).run().getRange({
            start: 0,
            end: 1000
        });
      
        if(!searchResults.length) {
            return 0;
        } else {
            return searchResults[0].getValue(searchResults[0].columns[0]);
        }
        
    
    }


    function getProjStatSearch(projType, finType, installState)
    {
        var statSearch = search.load({ id: 'customsearch_bb_proj_stat_by_type_date' });
        var statFilters = statSearch.filters;

        statFilters.push(search.createFilter({
            name: 'custrecord_bb_jobtype',
            operator: search.Operator.ANYOF,
            values: projType
        }));
        statFilters.push(search.createFilter({
            name: 'custrecord_bb_installation_state',
            operator: search.Operator.ANYOF,
            values: installState
        }));
        statFilters.push(search.createFilter({
            name: 'custrecord_bb_financing_type',
            operator: search.Operator.ANYOF,
            values: finType
        }));

        statSearch.filters = statFilters;

        return statSearch;
    }


    return {
        getProjStatRecord: getProjStatRecord,
        nameExists: nameExists,
        getStatID: getStatID
    }
});