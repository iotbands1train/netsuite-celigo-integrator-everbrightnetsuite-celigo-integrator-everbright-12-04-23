/**
* @NApiVersion 2.x
* @NScriptType ScheduledScript
* @NModuleScope Public
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

define(['N/record', 'N/runtime', 'N/search'],
  function (record, runtime, search) {
    var PROJ_STAT_SEARCH_ID = 'customsearch_bb_cashflow_projection_st_2';
    var PROJ_STAT_RECORDS_SEARCH_ID = 'customsearch_bb_cashflow_projection';
    var PROJ_STAT_RECORD_ID = 'customrecord_bb_project_statistics';
    var PROJ_STAT_SEARCH_FIELDS;
    var FINANCING_TYPE = { 1: 'Cash', 2: 'Loan', 3: 'TPO (lease, PPA)' };

    /**
     * Function deletes any projects statistics record created today and creates the latest ones for today again
     * 
     * @governance 0 Units
     * @param {Object} context - context of the request
     */
    function execute(context) {
      if (todayExists().length) {
        clearToday();
        createTodayStats();
      }
      else
        createTodayStats();

    }


    /**
     * Function creats the Project statistics records for today
     * @returns - void
     */
    function createTodayStats() {

      //search the Saved Search and outlier percentage to be used for creating the Project statistics 
      var bbSolarSearch = search.lookupFields({
        type: 'customrecord_bb_solar_success_configurtn',
        id: '1',
        columns: ['custrecord_bb_proj_stat_gen_search', 'custrecord_outlier_removal_percent']
      });//1 units
      if(bbSolarSearch.custrecord_bb_proj_stat_gen_search.length==0) return;

      var projStatSearch = search.load({
        id: bbSolarSearch.custrecord_bb_proj_stat_gen_search[0].value
      });//5 units

      PROJ_STAT_SEARCH_FIELDS = getSearchColumnNames(projStatSearch);
      //get All the fields which needs outliers removed
      var outlierRemovalFields = getOutlierRemovalField();

      var resultArray = [];
      projStatSearch.run().each(function (result) {
        var projresult = createProjectObject(result)
        resultArray.push(projresult);
        return true;
      });//10 units



      //Sort and remove(replace with '') the outliers
      var removedsorted = sortAndEmptyOutLierValues(resultArray, bbSolarSearch.custrecord_outlier_removal_percent, outlierRemovalFields);
      //create groups of all projects based on Project type, financing type, Finacier and installation state
      var groupedRecords = createGroups(removedsorted);
      createProjectStatRecordNew(groupedRecords);
    }

    /**
     * Function gets all the fields from the search that needs outliers removed
     * @returns - fieldsToOutRm - Array of fields
     */
    function getOutlierRemovalField() {
      var fieldsToOutRm = [];
      var keysArray = Object.keys(PROJ_STAT_SEARCH_FIELDS);
      for (var len = 0; len < keysArray.length; len++) {
        var fieldSplit = keysArray[len].split('/');
        if (fieldSplit[2] && fieldSplit[2] == 'outrm') {
          fieldsToOutRm.push(keysArray[len]);
        }
      }

      return fieldsToOutRm;
    }


    /**
     * Function sorts and removes the outliers
     * @param - resultArray - array of all projects from the search
     * @param - outlierRemovalPercent - Percentage of total project rows to be removed for outlier removal
     * @param - outlierRemovalFields - fields that needs to ne processed for outlier removal
     * @returns - resultArray - project records with outliers removed
     */
    function sortAndEmptyOutLierValues(resultArray, outlierRemovalPercent, outlierRemovalFields) {
      if (outlierRemovalPercent > 0) {
        for (var len = 0; len < outlierRemovalFields.length; len++) {
          sortBYAvgdaysnewtoM0(resultArray, outlierRemovalFields[len]);
          removeOutLiers(resultArray, outlierRemovalPercent, outlierRemovalFields[len]);

        }
      }

      return resultArray;
    }


    /**
     * Function creates object from each search result row
     * @param - result - array of all projects from the search
     * @returns - projObj - project object
     */
    function createProjectObject(result) {

      var projObj = {};
      projObj.id = result.getValue('id');
      for (var key in PROJ_STAT_SEARCH_FIELDS) {
        projObj[key] = result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS[key]])
      }
      return projObj;
    }

    /**
     * Function sorts the objects based on the outlier removal fields
     * @param - resultArray - array of all projects from the search
     * @param - outlierRemovalField - field to be used for sorting
     * @returns - resultArray - sorted result 
     */
    function sortBYAvgdaysnewtoM0(resultArray, outlierRemovalField) {
      resultArray.sort(function (a, b) {
        return a[outlierRemovalField] - b[outlierRemovalField];
      });
      return resultArray;
    }

    /**
     * Function replaces the field with '' for top and bottom rows of the result set based on the percetage
     * @param - sorted - sorted array of all projects 
     * @param - outlierRemovalPercent - Percentage of total project rows to be removed for outlier removal
     * @param - outlierRemovalFields - field that needs to ne processed for outlier removal
     * @returns - sorted - result array with oulier removed
     */
    function removeOutLiers(sorted, oulierRemovePercent, outlierRemovalField) {
      var totalRec = sorted.length;
      var removeLine = Math.round(totalRec * (oulierRemovePercent / 100));
      for (var len = 0; len < removeLine; len++) {
        sorted[len][outlierRemovalField] = '';
      }
      for (var len = sorted.length - 1; len >= (sorted.length - removeLine); len--) {
        sorted[len][outlierRemovalField] = '';
      }
      return sorted;
    }

    /**
     * function create groups of all projects based on Project type, financing type, Finacier and installation state
     * @param - removedsorted - sorted and  outlier removed array of all projects 
     * @returns - groupedRecs - grouped result array
     */
    function createGroups(removedsorted) {
      var groupedRecs = {};

      for (var len = 0; len < removedsorted.length; len++) {
        var projectType = removedsorted[len].custrecord_bb_jobtype;
        var financier = removedsorted[len].custentity_bb_financier_customer;
        var financingtype = removedsorted[len].custrecord_bb_financing_type;
        var state = removedsorted[len].custrecord_bb_installation_state;

        var key = projectType + '?' + financier + '?' + financingtype + '?' + state;
        var groupItems = groupedRecs[key];
        if (groupItems) {

          var item = removedsorted[len];
          groupItems.push(item);
          groupedRecs[key] = groupItems;
        } else {
          var arr = [];
          arr.push(removedsorted[len]);
          groupedRecs[key] = arr;
        }
        
      }
      
      return groupedRecs;
    }

    /**
     * Determines if records for today already exist in the project statistics table
     * @returns {array} - array of results for the saved search of project statistics records from today 
    */
    function todayExists() {
      var results = [];
      search.create({
        type: PROJ_STAT_RECORD_ID,
        columns: ['id', 'custrecord_bb_proj_stat_date'],
        filters: ['custrecord_bb_proj_stat_date', 'on', ['today']],
      }).run().each(function (result) {
        results.push(result);
        return true;
      });
      return results;
    }


    /**
     * turns saved search into a literal so columns can be referenced by label
     * @param {search} projSearch 
     */
    function getSearchColumnNames(projSearch) {
      return projSearch.columns.reduce(function (map, current, index) {
        var label = current.label.toLowerCase();
        map[label] = index;
        return map;
      }, {});
    }

    /**
     * creates a project statistic record from the grouped resultset
     * @param {result} result 
     */
    function createProjectStatRecordNew(result) {

      for (groupKey in result) {
        var projStatRec = record.create({
          type: PROJ_STAT_RECORD_ID,
          isDynamic: true
        });
        projStatRec.setValue({
          fieldId: 'custrecord_bb_proj_stat_date',
          value: DateNow(),
          ignoreFieldChange: true
        })

        var groupKeySplitArr = groupKey.split('?');

        projStatRec.setValue({
          fieldId: 'custrecord_bb_jobtype',
          value: groupKeySplitArr[0],
          ignoreFieldChange: true
        })

        projStatRec.setValue({
          fieldId: 'custrecord_bb_financing_type',
          value: groupKeySplitArr[2],
          ignoreFieldChange: true
        })

        projStatRec.setValue({
          fieldId: 'custrecord_bb_statistics_financier',
          value: groupKeySplitArr[1],
          ignoreFieldChange: true
        })


        projStatRec.setValue({
          fieldId: 'custrecord_bb_installation_state',
          value: groupKeySplitArr[3],
          ignoreFieldChange: true
        })
        var totalProjects=getProjectIds(groupKeySplitArr[0], groupKeySplitArr[2], groupKeySplitArr[3],groupKeySplitArr[1]);

        projStatRec.setValue({
          fieldId: 'custrecord_bb_included_projects',
          value: totalProjects,
          ignoreFieldChange: true
        })
        


        for (key in result[groupKey][0]) {

          var fieldDetails = key.split('/');
          var field = fieldDetails[0];
          var summary = fieldDetails[1];
          var round = fieldDetails[3];
          if (summary) {
           
            var resultSummary = calculateFieldSummary(result[groupKey], summary, key, round);
           
           
            projStatRec.setValue({
              fieldId: field,
              value: resultSummary,
              ignoreFieldChange: true
            })
          }
        }
      /*  projStatRec.setValue({
          fieldId: 'custrecord_bb_total_project_count',
          value: totalProjects.length,
          ignoreFieldChange: true
        })*/
        projStatRec.save({
          enableSourcing: true,
          ignoreMandatoryFields: true
        });
      }

    }

    /**
     * function create groups of all projects based on Project type, financing type, Finacier and installation state
     * @param - result - a project array for one group
     * @param - summary - summary operation to be performed
     * @param - key - field that needs to be summarized
     * @param - round - Fields needs rounding or not
     * @returns - summarized value 
     */
    function calculateFieldSummary(result, summary, key, round) {
      var summaryRes = 0;
      var count = 0;
      var countTotal = 0
      
      for (var len = 0; len < result.length; len++) {
        if (result[len][key] != '') {
          summaryRes = summaryRes + parseFloat(result[len][key]);
          if (summary == 'avg') {
            count = count + 1;
          }
        }
        countTotal = countTotal + 1;

      }
      if (summary == 'avg') {

        var avg;
        if (round) {
          avg = Math.round(summaryRes / count)
        } else {
          avg = summaryRes / count;
        }
        return (isNaN(avg) ? '' : avg.toFixed(2));
      } else if (summary == 'sum') {

        return (isNaN(Math.round(summaryRes)) ? '' : Math.round(summaryRes));
      } else if (summary == 'count') {
        return (isNaN(Math.round(countTotal)) ? '' : Math.round(countTotal));
      }
    }


    /**
     * creates a project statistic record based on a saved search result
     * @param {result} result 
     */
    function createProjectStatRecord(result) {
      var financingType = result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['financing type']]);
      var financier = '';
      if (financingType != 1) {
        financier = result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['financier']]);
      }
      return record.create({
        type: PROJ_STAT_RECORD_ID,
        isDynamic: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_stat_date',
        value: DateNow(),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_jobtype',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['project type']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_financing_type',
        value: financingType,
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_installation_state',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['installation state']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_avg_contract_value_p_w',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['avg contract value']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_avg_service_cost_p_w',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['avg services cost / watt']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_avg_equip_cost_p_w',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['avg equip cost / watt']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_total_project_count',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['total project count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_avg_system_size_decimal',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['avg system size (kw)']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_avg_sales_cost_p_w',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['avg sales cost / watt']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_avg_margin_p_w',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['avg margin / watt']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_anticipated_project_count',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['anticipated project count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_ave_days_new_to_m0_ct',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['anticipated to m0 day count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_ave_days_new_to_m1_ct',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['anticipated to m1 day count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_ave_days_new_to_m2_ct',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['anticipated to m2 day count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_ave_days_new_to_m3_ct',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['anticipated to m3 day count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_in_m0_count',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['projects in m0 count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_ave_days_m0_to_m1_ct',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['m0 to m1 day count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_ave_days_m0_to_m2_ct',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['m0 to m2 day count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_ave_days_m0_to_m3_ct',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['m0 to m3 day count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_in_m1_count',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['projects in m1 count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_ave_days_m1_to_m2_ct',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['m1 to m2 day count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_ave_days_m1_to_m3_ct',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['m1 to m3 day count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_in_m2_count',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['projects in m2 count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_ave_days_m2_to_m3_ct',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['m2 to m3 day count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_proj_in_m3_count',
        value: result.getValue(result.columns[PROJ_STAT_SEARCH_FIELDS['projects in m3 count']]),
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_statistics_financier',
        value: financier,
        ignoreFieldChange: true
      }).setValue({
        fieldId: 'custrecord_bb_included_projects',
        value: getProjectIds(result),
        ignoreFieldChange: true
      }).save({
        enableSourcing: true,
        ignoreMandatoryFields: true
      });
    };



    /**
     * Returns a date object for the current date
     * @returns {date} - today's date. 
     */
    function DateNow() { return new Date(); };


    /**
     * takes a search result that will become the project statistic record, and returns a list of project IDs to be included
     * in the included projects field. 
     * @param {result} projectStatResult - search result that will become the project statistic record
     * @returns {array} projIdList - array of project internal ID's to be included in the
     * included projects field 
     */
    function getProjectIds(projectType, financingType, installationState,financier) {
      var projIdList = new Array();

      var idSearch = search.create({
        type: record.Type.JOB,
        columns: ['internalId'],
        filters: addFilterExpression(projectType, financingType, installationState,financier),
      });
      idSearch.run().each(function (result) {
        projIdList.push(result.getValue(result.columns[0]).toString());
        return true;
      });
      return projIdList;
    }



    /**
     * Creates a saved search filter array based on project statistics grouping criteria
     * @param {searchResult} statResult 
     * @returns - saved search filter array
     */
    function addFilterExpression(projectType, financingType, installationState,financier) {
      var filterExpression =[];
      filterExpression.push(['custentity_bb_project_start_date', 'onorbefore', ['today']],
      'AND', ['jobtype', 'anyof', addFilterValue(projectType)],
      'AND', ['custentity_bb_financing_type', 'anyof', addFilterValue(financingType)],
      'AND', ['custentity_bb_install_state', 'anyof', addFilterValue(installationState)],
      'AND', ['isinactive', 'is', 'F'],
      "AND", 
      [[["custentity_bb_install_comp_pack_date","isempty",""],"OR",["custentity_bb_install_comp_pack_date","after","daysago90"]],"OR",[["custentity_bb_install_scheduled_date","isempty",""],"OR",["custentity_bb_install_scheduled_date","after","daysago90"]]])
      if(financier){
        filterExpression.push('AND',[['custentity_bb_financier_customer.parent', 'anyof', addFilterValue(financier)],"OR",['custentity_bb_financier_customer', 'anyof', addFilterValue(financier)]])
      }
      

      return filterExpression;
    }

    /**
     * Takes the field value for a saved search filter, and returns '@NONE@' if it is empty
     * in order for the saved search to run properly, otherwise returns the field value
     * @param {any} fieldValue 
     */
    function addFilterValue(fieldValue) { return fieldValue ? fieldValue : '@NONE@'; }


    /**
     * clears cashflow statistics record for the current day. 
     * @returns - void
     */
    function clearToday() {

      return search.create({
        type: PROJ_STAT_RECORD_ID,
        columns: ['id', 'custrecord_bb_proj_stat_date'],
        filters: ['custrecord_bb_proj_stat_date', 'on', ['today']],
      }).run().each(function (result) {
        record.delete({
          type: PROJ_STAT_RECORD_ID,
          id: result.getValue(result.columns[0])
        });
        return true;
      });

    };

    /**
     * clears all records from the cashflow statistics table
     * @returns - void
     */
    function clearAll() {

      search.load({
        id: PROJ_STAT_RECORDS_SEARCH_ID
      }).run().each(function (result) {
        record.delete({
          type: PROJ_STAT_RECORD_ID,
          id: result.getValue(result.columns[0])
        });
        return true;
      });

    };


    return {
      execute: execute
    }

  });