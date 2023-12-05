/**
 * @NApiVersion 2.0
 * @NModuleScope public
 * @Author Matt Lehman
 * @version 0.1.1
 * @overview - Commission Total Value History Library
 */

/**
 * Copyright 2017-2018 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/record', 'N/search', 'N/render', 'N/error'], function(record, search, render, errorModule) {

    const HTML_TABLE = [
        '<table>',
        '   <tr>',
        '       <th style="font-weight: bold; text-align: left;">Date</th>',
        '       <th style="font-weight: bold; text-align: right;">Commission Value</th>',
        '   </tr>',
        '   <#list results.resultList as result>',
        '    <tr>',
        '       <td>${result.date}</td>',
        '       <td align="right">$ ${result.amount}</td>',
        '   </tr>',
        '   </#list>',
        '</table>'
    ].join('\n');


    function commissionHistory(project) {
        try {
            var data = getResultObject(getSearchResults(project));
            var renderer = render.create();
            renderer.templateContent = HTML_TABLE;
            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: 'results',
                data: {
                    resultList: data
                }
            });

            return renderer.renderAsString();

        } catch (error) {
            log.error({
                title: 'Error - Contract Value History',
                details: 'Current Record ID: ' + project.id || 'new unsaved record'
            });
        }
    }


    /**
     * gets the search results for the contract value history field
     * @param {record} project - NS Project Record
     */
    function getSearchResults(project) {
        var noteSearch = search.load({
            id: 'customsearch_bb_ss_comm_calc_val_history'
        });

        noteSearch.filters = getFilters(noteSearch, project);

        var results = noteSearch.run().getRange({ //run search & get results
            start: 0,
            end: 1000
        });

        return results;
    }

    /**
     * Gets the updated filters for a search to include the current project id
     * @param {search} noteSearch 
     * @param {record} project 
     */
    function getFilters(noteSearch, project) {
        var noteSearchFilters = noteSearch.filters;
        var addFilters = search.createFilter({
            name: 'internalid',
            operator: search.Operator.ANYOF,
            values: project.id
        });
        noteSearchFilters.push(addFilters);
        return noteSearchFilters;
    }

    /**
     * Gets the object with the results for the saved search to be used in the template
     * @param {object} results - resultSet Object
     */
    function getResultObject(results) {
        var resultList = [];
        for (var i = 0; i < results.length; i++) {
            resultList.push({
                date: results[i].getValue(results[i].columns[2]),
                amount: results[i].getValue(results[i].columns[4])
            });
        };
        return resultList;
    }

    return {
        commissionHistory: commissionHistory
    };

});