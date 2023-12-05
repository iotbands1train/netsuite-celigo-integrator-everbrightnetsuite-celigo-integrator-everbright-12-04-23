/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Ashley Wallace
 * @version 0.1.0
 * @copyright Blue Banyan Solutions 2018
 * @fileOverview This Custom Module library is used with the Cashflow
 * projection suitelet & client script
 */

define(['N/record', 'N/search', 'N/file', 'N/render'], function (record, search, file, render) {

    //var TEMPLATE_ROOT = 'Templates/Code Gen/';
    var TEMPLATES = {
        REVENUE: { 
            TEMPLATE_0_30: 'cashflow-whatif-revenue-0-30.txt', 
            TEMPLATE_31_60: 'cashflow-whatif-revenue-31-60.txt',
            TEMPLATE_61_90: 'cashflow-whatif-revenue-61-90.txt'
        },
        EXPENSES: {
            TEMPLATE_0_30: 'cashflow-whatif-expenses-0-30.txt',
            TEMPLATE_31_60: 'cashflow-whatif-expenses-31-60.txt',
            TEMPLATE_61_90: 'cashflow-whatif-expenses-61-90.txt'
        },
        NET: {
            TEMPLATE_0_30: 'cashflow-whatif-net-0-30.txt',
            TEMPLATE_31_60: 'cashflow-whatif-net-31-60.txt',
            TEMPLATE_61_90: 'cashflow-whatif-net-61-90.txt'
        }
    };

    var CHART_TEMPLATE = 'revenue-cashflow-chart.html';
    var DATA_TABLE_TEMPLATE = 'cashflow-chart-data-table.ftl';
    var ANALYSIS_TEMPLATE = 'cashflow-analysis.ftl';
    var KPI_SEARCH_ID = 'customsearch_bb_cashflow_kpi_usd_by_scpt';
    var ANALYSIS_SEARCH_ID = 'customsearch_bb_cash_flow_stats';
    var CHART_TYPE = {REVENUE:'REVENUE', EXPENSES:'EXPENSES', NET:'NET'};

    var CHART_SETTINGS = {
        REVENUE: {
            DATA_TABLE: {origText: 'DATA_TABLE', replaceText: ''},
            CHART_DATA: {origText: 'CHART_DATA', replaceText: ''},
            TITLE: {origText: 'CHART_TITLE', replaceText: 'Revenue'},
            COLOR1: {origText: 'COLOR1', replaceText: '#0B6138'},
            COLOR2: {origText: 'COLOR2', replaceText: '#01DF74'},
            DIV_ID: {origText: 'DIV_ID', replaceText: 'rev_chart'}
        },
        EXPENSES: {
            DATA_TABLE: {origText: 'DATA_TABLE', replaceText: ''},
            CHART_DATA: {origText: 'CHART_DATA', replaceText: ''},
            TITLE: {origText: 'CHART_TITLE', replaceText: 'Expenses'},
            COLOR1: {origText: 'COLOR1', replaceText: '#8A0808'},
            COLOR2: {origText: 'COLOR2', replaceText: '#FF0000'},
            DIV_ID: {origText: 'DIV_ID', replaceText: 'exp_chart'}
        },
        NET: {
            DATA_TABLE: {origText: 'DATA_TABLE', replaceText: ''},
            CHART_DATA: {origText: 'CHART_DATA', replaceText: ''},
            TITLE: {origText: 'CHART_TITLE', replaceText: 'Net'},
            COLOR1: {origText: 'COLOR1', replaceText: '#0B0B61'},
            COLOR2: {origText: 'COLOR2', replaceText: '#045FB4'},
            DIV_ID: {origText: 'DIV_ID', replaceText: 'net_chart'}
        }
    };




    /**
     * takes the ID of a project statistic record and 
     * returns the record object
     * @param {integer} recordID - NS record ID 
     */
    function getProjStatRecord(recordID) {
        return record.load({
            type: 'customrecord_bb_project_statistics',
            id: recordID,
            isDynamic: false,
        });
    }




    /**
     * creates chart & data table HTML to be used for inline HTML fields
     * @param {object} uiData - object containing field data for chart
     * @param {string} chartType - string for the type of chart
     */
    function createKPISearchHTML(uiData, chartType) {
        var chartTemplate = getTemplate(CHART_TEMPLATE);
        var searchResults = getKPISearchResults(uiData, chartType);

        CHART_SETTINGS[chartType].CHART_DATA.replaceText = JSON.stringify(getChartDataString(searchResults));
        CHART_SETTINGS[chartType].DATA_TABLE.replaceText = getHTMLDataTable(searchResults);

        for(setting in CHART_SETTINGS[chartType])
            chartTemplate = replaceAll(chartTemplate, CHART_SETTINGS[chartType][setting].origText, CHART_SETTINGS[chartType][setting].replaceText);
        
        return chartTemplate;
    }



   /**
     * creates chart & data table HTML to be used for inline HTML fields
     * @param {object} uiData - object containing field data for chart
     * @returns {object} - object holding search results
     */
    function createAnalysisText(uiData) {
        var netResults = getNetValues(uiData);
        var analysisObj = calculateAnalysisStats(analysisSearch(uiData));

        analysisObj['netIncrease30'] = netResults.whatif_30_days - netResults.current_30_days;
        analysisObj['netIncrease60'] = netResults.whatif_60_days - netResults.current_60_days;
        analysisObj['netIncrease90'] = netResults.whatif_90_days - netResults.current_90_days;
        
        return renderAnalysis(analysisObj);
    }



    function analysisSearch(uiData)
    {
        var projStatSearch = search.load({ id: ANALYSIS_SEARCH_ID });
        projSearchFields = getSearchColumnNames(projStatSearch);
        var searchFilters = projStatSearch.filters;

        searchFilters.push(search.createFilter({
            name: 'jobtype',
            operator: search.Operator.ANYOF,
            values: uiData.projType
        }));
        searchFilters.push(search.createFilter({
            name: 'custentity_bb_install_state',
            operator: search.Operator.ANYOF,
            values: uiData.installState
        }));
        searchFilters.push(search.createFilter({
            name: 'custentity_bb_financing_type',
            operator: search.Operator.ANYOF,
            values: uiData.finType
        }));

        projStatSearch.filters = searchFilters;

        return projStatSearch.run().getRange({
            start: 0,
            end: 1000
        });
    }


    function calculateAnalysisStats(searchResults)
    {
		var today = new Date();
        var analysisData= {
            numProjects: 0,
            totalRevenue: 0,
            remainingRevenue: 0,
            remainingExpenses: 0,
            minStartDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            maxStartDate: new Date(today.getFullYear()-10, today.getMonth(), today.getDate()),
            newCount: 0,
            m0Count: 0,
            m1Count: 0,
            m2Count: 0,
            newRemaining: 0,
            m0Remaining: 0,
            m1Remaining: 0,
            m2Remaining: 0
        }
        

        for(var i = 0; i < searchResults.length; i++)
        {
            var startDate = new Date(searchResults[i].getValue(searchResults[i].columns[projSearchFields['start date']]));
            var milestone = searchResults[i].getValue(searchResults[i].columns[projSearchFields['most recent milestone']]);
            
            analysisData.numProjects++;
            analysisData.totalRevenue += Number(searchResults[i].getValue(searchResults[i].columns[projSearchFields['total contract value']]));
            analysisData.remainingRevenue += Number(searchResults[i].getValue(searchResults[i].columns[projSearchFields['remaining revenue']]));
            analysisData.remainingExpenses += Number(searchResults[i].getValue(searchResults[i].columns[projSearchFields['remaining expenses']]));
            analysisData.minStartDate = (analysisData.minStartDate > startDate) ? startDate : analysisData.minStartDate;
            analysisData.maxStartDate = (analysisData.maxStartDate < startDate) ? startDate : analysisData.maxStartDate;

            switch (milestone) {
                case 'New': 
					analysisData.newCount++; 
					analysisData.newRemaining += Number(searchResults[i].getValue(searchResults[i].columns[projSearchFields['remaining revenue']])); 
					break;
                case 'M0' : 
					analysisData.m0Count++; 
					analysisData.m0Remaining += Number(searchResults[i].getValue(searchResults[i].columns[projSearchFields['remaining revenue']])); 
					break;
                case 'M1' : 
					analysisData.m1Count++; 
					analysisData.m1Remaining += Number(searchResults[i].getValue(searchResults[i].columns[projSearchFields['remaining revenue']])); 
					break;
                case 'M2' : 
					analysisData.m2Count++; 
					analysisData.m2Remaining += Number(searchResults[i].getValue(searchResults[i].columns[projSearchFields['remaining revenue']])); 
					break;
            };            
        }
		
		analysisData.minStartDate = dateDiff(analysisData.minStartDate, new Date(today.getFullYear(), today.getMonth(), today.getDate() ));
		analysisData.maxStartDate = dateDiff(analysisData.maxStartDate, new Date(today.getFullYear(), today.getMonth(), today.getDate() ));

        return analysisData;

    }


	// Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
	function dateDiff(first, second) {
		return Math.round((second-first)/(1000*60*60*24));
	}
	

    function renderAnalysis(analysisObj)
    {
        var renderer = render.create();
        renderer.templateContent = getTemplate(ANALYSIS_TEMPLATE);
        renderer.addCustomDataSource({
            format: render.DataSource.OBJECT,
            alias: 'data',
            data: analysisObj
        });
        return renderer.renderAsString();
    }



    function getNetValues(uiData)
    {
        var searchResults = getKPISearchResults(uiData, CHART_TYPE.NET);

        return {
            whatif_30_days: nullTo0(searchResults[0].getValue(searchResults[0].columns[0])),
            whatif_60_days: nullTo0(searchResults[0].getValue(searchResults[0].columns[1])),
            whatif_90_days: nullTo0(searchResults[0].getValue(searchResults[0].columns[2])),
            current_30_days: nullTo0(searchResults[0].getValue(searchResults[0].columns[3])),
            current_60_days: nullTo0(searchResults[0].getValue(searchResults[0].columns[4])),
            current_90_days: nullTo0(searchResults[0].getValue(searchResults[0].columns[5]))
        };
    }




    function getSearchColumnNames(projSearch) {
        return projSearch.columns.reduce(function(map, current, index) {
          var label = current.label.toLowerCase();
          map[label] = index;
          return map;
        }, {});
    }



    /**
     * string replace function
     * @param {string} str 
     * @param {string} find 
     * @param {string} replace 
     */
    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }



    /**
     * Creates and returns data table html from template & saved search
     * results
     * @param {array} searchResults - array of NS saved search result objects
     * @returns {string} - html for data table
     */
    function getHTMLDataTable(searchResults)
    {
        var renderer = render.create();
        renderer.templateContent = getTemplate(DATA_TABLE_TEMPLATE);
        renderer.addCustomDataSource({
            format: render.DataSource.OBJECT,
            alias: 'tabledata',
            data: {
                whatif_30_days: nullTo0(searchResults[0].getValue(searchResults[0].columns[0])),
                whatif_60_days: nullTo0(searchResults[0].getValue(searchResults[0].columns[1])),
                whatif_90_days: nullTo0(searchResults[0].getValue(searchResults[0].columns[2])),
                current_30_days: nullTo0(searchResults[0].getValue(searchResults[0].columns[3])),
                current_60_days: nullTo0(searchResults[0].getValue(searchResults[0].columns[4])),
                current_90_days: nullTo0(searchResults[0].getValue(searchResults[0].columns[5]))
                }
        });

        return renderer.renderAsString();
    }



    /**
     * Creates and returns array to be used for google bar chart
     * @param {array} searchResults - array of NS saved search results
     */
    function getChartDataString(searchResults)
    {
        return [
            ['Period', 'Baseline', 'What-if'],
            ['0-30 Days', 
            nullTo0(searchResults[0].getValue(searchResults[0].columns[3])),
             nullTo0(searchResults[0].getValue(searchResults[0].columns[0]))],
            ['31-60 Days', 
            nullTo0(searchResults[0].getValue(searchResults[0].columns[4])),
            nullTo0(searchResults[0].getValue(searchResults[0].columns[1]))],
            ['61-90 Days', 
            nullTo0(searchResults[0].getValue(searchResults[0].columns[5])),
            nullTo0(searchResults[0].getValue(searchResults[0].columns[2]))]
        ];  
    }



    /**
     * swap function to return 0 if a given variable is null
     * @param {integer} val 
     */
    function nullTo0(val)
    {
        if(!val)
            return 0;
        else 
            return Number(val);
    }



    /**
     * loads KPI search, replaces formula field values, runs the search
     * and returns the array of results
     * @param {object} uiData - object containing field data for chart
     * @param {string} chartType - string for the type of chart being created
     * @returns {array} - array of NS saved search results
     */
    function getKPISearchResults(uiData, chartType) {

        var kpiSearch = search.load({ id: KPI_SEARCH_ID });

        kpiSearch.filters = getKpiSearchFilters(uiData.projType, uiData.installState, uiData.finType, kpiSearch.filters);
        kpiSearch.columns = getKpiSearchCols(uiData.intervals, kpiSearch.columns, uiData.statId, chartType);
        
        var results = kpiSearch.run().getRange({
            start: 0,
            end: 1000
        });
        return results;
    }


    
    /**
     * Adds the project type, install state, and financing type
     * to the filters of an existing saved search and returns it. 
     * @param {integer} projectType - int. id for the project type
     * @param {integer} installState - int. id for the install state
     * @param {ingeter} finType - int. id for the financing type
     * @param {object} searchFilters - NS saved search filters object
     * @returns {object} - NS saved search filters object
     */
    function getKpiSearchFilters(projectType, installState, finType, searchFilters) {

        searchFilters.push(search.createFilter({
            name: 'jobtype',
            operator: search.Operator.ANYOF,
            values: projectType
        }));
        searchFilters.push(search.createFilter({
            name: 'custentity_bb_install_state',
            operator: search.Operator.ANYOF,
            values: installState
        }));
        searchFilters.push(search.createFilter({
            name: 'custentity_bb_financing_type',
            operator: search.Operator.ANYOF,
            values: finType
        }));

        return searchFilters;
    }



    /**
     * Takes the columns for a NS saved search and adds formulas to the columns,
     * array and returns it. 
     * @param {object} intervals - object containing field data to be inserted into saved search formulas
     * @param {array} searchCols - array of saved search columns
     * @param {integer} statId - integer for the stat ID record to pull data from
     * @param {string} chartType - string for the type of chart being made
     * @returns {array} - array of saved search columms
     */
    function getKpiSearchCols(intervals, searchCols, statId, chartType) {
        searchCols = searchColsCalc(intervals, searchCols, 0, chartType); //what-if results
        searchCols = searchColsCalc(getStatRecordIntervals(statId), searchCols, 3, chartType); //current results
        return searchCols;
    }



    /**
     * loads a template and replaces text with values in the interval object,
     * then returns it
     * @param {object} intervals - object containing field data to be inserted into saved search formulas
     * @param {array} searchCols - array of saved search columns
     * @param {integer} colNum - integer for the column number to start from
     * @param {string} chartType - string for the type of chart being made
     * @returns {array} - array of saved search column objects
     */
    function searchColsCalc(intervals, searchCols, colNum, chartType)
    {
        var tempFiles = TEMPLATES[chartType];

        for (path in tempFiles) {        
            var renderer = render.create();
            renderer.templateContent = getTemplate(tempFiles[path]);
            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: 'data',
                data: intervals
            });
        //currTemplate = currTemplate.replace(/\r|\n/g, '');
        searchCols[colNum].formula = renderer.renderAsString();
        colNum++;            
        };

        return searchCols;
    }



    /**
     * Loads the template
     * @return {string} template contents
     */
    function getTemplate(template) {
        var id = '';
        var templateLookup = search.create({
            type: "file",
            filters:
            [
                ["name","is",template] 
            ],
            columns:
            [
               "internalid",
            ]
        }).run().getRange({
            start: 0,
            end: 1
        });
        if (templateLookup.length > 0) {
            log.debug('template id', templateLookup[0].getValue({name: 'internalid'}));
            id = templateLookup[0].getValue({
                name : 'internalid'
            });
        }
        if (id) {
            return file.load({
                id: id
            }).getContents();
        } else {
            throw 'File not found. Could not get template id for ' + template;
        }
    }



    /**
     * looks for cash flow what if records with a given name.
     * returns either 0 or the internal ID of the first existing record
     * @param {string} nameStr 
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



    /**
     * Creates an object with interval numbers from a given project
     * statistic record.
     * @param {integer} statId - internal ID of the statistic record 
     */
    function getStatRecordIntervals(statId)
    {
        statRec = getProjStatRecord(statId)
        var intervals= {
            NEW_TO_M0: {text: 'NEW_TO_M0', value: statRec.getValue('custrecord_bb_proj_ave_days_new_to_m0_ct') },
            NEW_TO_M1: {text: 'NEW_TO_M1', value: statRec.getValue('custrecord_bb_proj_ave_days_new_to_m1_ct') }, 
            NEW_TO_M2: {text: 'NEW_TO_M2', value: statRec.getValue('custrecord_bb_proj_ave_days_new_to_m2_ct') },
            NEW_TO_M3: {text: 'NEW_TO_M3', value: statRec.getValue('custrecord_bb_proj_ave_days_new_to_m3_ct') },
            M0_TO_M1: {text: 'M0_TO_M1', value: statRec.getValue('custrecord_bb_proj_ave_days_m0_to_m1_ct') },
            M0_TO_M2: {text: 'M0_TO_M2', value: statRec.getValue('custrecord_bb_proj_ave_days_m0_to_m2_ct') },
            M0_TO_M3: {text: 'M0_TO_M3', value: statRec.getValue('custrecord_bb_proj_ave_days_m0_to_m3_ct') },
            M1_TO_M2: {text: 'M1_TO_M2', value: statRec.getValue('custrecord_bb_proj_ave_days_m1_to_m2_ct') },
            M1_TO_M3: {text: 'M1_TO_M3', value: statRec.getValue('custrecord_bb_proj_ave_days_m1_to_m3_ct') },
            M2_TO_M3: {text: 'M2_TO_M3', value: statRec.getValue('custrecord_bb_proj_ave_days_m2_to_m3_ct') }
        }
        return intervals;

    }


    return {
        getProjStatRecord: getProjStatRecord,
        createKPISearchHTML: createKPISearchHTML,
        nameExists:nameExists,
        createAnalysisText:createAnalysisText
    }
});