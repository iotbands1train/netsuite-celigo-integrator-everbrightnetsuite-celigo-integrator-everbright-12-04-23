/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Richard Tuttle
 * @version 1.5.3
 * @fileOverview This Custom Module library is used by the project user event to
 *      adjust the project cost budgets sublist on the project record
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

define(['N/record', 'N/search', 'N/runtime', 'N/task', './BB.SS.ScheduledScript.BatchProcessing'], function(record, search, runtime, task, batchProcessor) {
    const PROJECT_EXPENSE_SETTINGS = {
        customrecord_bb_project_adder: {
            projectField: 'custrecord_bb_project_adder_project',
            costCategoryType: 'LABOR',
            costCategorySubType: 'ITEM',
            costTotalSearch: 'customsearch_bb_project_adder_totals',
            sumColumn: 'custrecord_bb_adder_total_amount',
            itemColumn: 'custrecord_bb_adder_item',
        },
        customrecord_bb_project_bom: {
            projectField: 'custrecord_bb_project_bom_project',
            costCategoryType: 'SUPPLIER',
            costCategorySubType: 'ITEM',
            costTotalSearch: 'customsearch_bb_project_bom_totals',
            sumColumn: 'formulacurrency',
            itemColumn: 'custrecord_bb_project_bom_item',
        },
        customrecord_bb_project_expense: {
            projectField: 'custrecord_bb_proj_exp_project',
            costCategoryType: 'SUPPLIER',
            costCategorySubType: 'ITEM',
            costTotalSearch: 'customsearch_bb_project_expense_totals',
            sumColumn: 'custrecord_bb_proj_exp_amount',
            itemColumn: 'custrecord_bb_proj_exp_item',
        }
    }

    /**
     * [clearProjectCostBudgetSublist clears the cost budget for a project]
     * @param  {[Object]} project [The project to clear the cost budget on]
     * @return {void} 
     */
    function clearProjectCostBudgetSublist(project) {
        clearProjectBudgetSublist(project, 'cbudget');
    }
    /**
     * [clearProjectBillingBudgetSublist clears the billing budget for a project]
     * @param  {[Object]} project [The project to clear the cost budget on]
     * @return {[void]}
     */
    function clearProjectBillingBudgetSublist(project) {
        clearProjectBudgetSublist(project, 'bbudget');
    }
    /**
     * [clearProjectBudgetSublist clears the specified budget for a project]
     * @param  {[Object]} project [The project to clear the budget on]
     * @param  {[String]} sublist [The sublist to clear (cbudget, bbudget)]
     * @return {[void]}
     */
    function clearProjectBudgetSublist(project, sublist) {
        var sublistLineCount = project.getLineCount({
            sublistId: sublist
        });
        for (var r = 0; r < sublistLineCount; r++) {
            project.setSublistValue({
                sublistId: sublist,
                fieldId: 'amount_1_',
                line: r,
                value: null
            });
        }
    }



    /**
     * updateCostBudget - updates the cost budget sublist for a project
     * @param  {[type]} project                [The project that should have the cost budget updated]
     * @param  {[type]} costsByItem            [A hash/map object with keys as the item name and values as the expense amount]
     * @param  {[type]} [projectExpenseSettings] [Optional configuration settings for the record]
     * @return {[void]}                        [void]
     */
    function updateCostBudget(project, costsByItem, projectExpenseSettings) {
        updateBudget('cbudget', project, costsByItem, projectExpenseSettings);
    }
    /**
     * [updateBillingBudget updates the billing budget sublist for a project]
     * @param  {[type]} project                [The project that should have the cost budget updated]
     * @param  {[type]} costsByItem            [A hash/map object with keys as the item name and values as the expense amount]
     * @param  {[type]} [projectExpenseSettings] [Optional configuration settings for the record]
     * @return {[void]}                        [void]
     */
    function updateBillingBudget(project, costsByItem, projectExpenseSettings) {
        updateBudget('bbudget', project, costsByItem, projectExpenseSettings);
    }
    /**
     * [updateBudget updates either of the budget sublists for a project]
     * @param  {[type]} sublistId              [The sublist id to update (cbudget, bbudget)]
     * @param  {[type]} project                [The project that should have the cost budget updated]
     * @param  {[type]} costsByItem            [A hash/map object with keys as the item name and values as the expense amount]
     * @param  {[type]} [projectExpenseSettings] [Optional configuration settings for the record]
     * @return {[void]}                        [void]
     */
    function updateBudget(sublistId, project, costsByItem, projectExpenseSettings) {
        if (!sublistId || !project || !costsByItem)
            throw new Error('Missing critical variable in updateBudget function', 'BB.SS.MD.ProjectBudget');

        log.debug('updateBudget started', {
            sublistId: sublistId,
            project: project.id,
            costsByItem: costsByItem,
            projectExpenseSettings: projectExpenseSettings
        });

        var sublistLineCount = project.getLineCount({
            sublistId: sublistId
        });
        var amountField = 'amount_1_'; // potential to set this based on months later (amount_1_1, amount_1_2, etc)

        for (var i = 0; i < sublistLineCount; i++) {
            var costCategoryRef = project.getSublistValue({
                sublistId: sublistId,
                fieldId: 'costcategoryref',
                line: i
            });
            var costCategoryType = project.getSublistValue({
                sublistId: sublistId,
                fieldId: 'costcategorytype',
                line: i
            });
            var costCategorySubType = project.getSublistValue({
                sublistId: sublistId,
                fieldId: 'costcategorysubtype',
                line: i
            });
            var costCategoryName = project.getSublistValue({
                sublistId: sublistId,
                fieldId: 'costcategoryname',
                line: i
            });

            // log.debug({
            //     title: 'Item details',
            //     details: {
            //         costCategoryRef: costCategoryRef,
            //         costsByItem: costsByItem
            //     }
            // });

            if (costCategoryRef) {

                var itemTotal = costsByItem['' + costCategoryRef];
                if (itemTotal) {
                    log.debug('item total (from costsByItem)', {
                        itemTotal: itemTotal,
                        costCategoryRef: costCategoryRef,
                        costCategoryName: costCategoryName
                    });
                    project.setSublistValue({
                        sublistId: sublistId,
                        fieldId: amountField,
                        line: i,
                        value: itemTotal
                    });
                }
            }
        }
    }

    /**
     * [calculateExpenseCosts calculates the sum of each expense item group]
     * @param  {[Object]} project                [The project associated to the expenses to sum]
     * @param  {[Object]} projectExpense         [The expense record (BOM/Adder/Expense)]
     * @return {[Object]}                        [A hash/map object with group names as key and sums as value (generally item: amount)]
     */
    function calculateExpenseCosts(projectId, projectExpenseSettings) {
        log.debug('calculateExpenseCosts starting', '');
        var costsByItem = {};
        var searchId = projectExpenseSettings.costTotalSearch;
        var expenseSearch = search.load({
            id: searchId
        });
        var projectFilter = search.createFilter({
            name: projectExpenseSettings.projectField,
            operator: search.Operator.ANYOF,
            values: projectId,
        });
        expenseSearch.filters.push(projectFilter);

        
        expenseSearch.run().each(function(result) {
            log.debug({
                title: 'calculateExpenseCosts:expenseSearch result',
                details: result
            });
            var item = result.getValue({
                name: projectExpenseSettings.itemColumn,
                summary: search.Summary.GROUP
            });
            var total = result.getValue({
                name: projectExpenseSettings.sumColumn,
                summary: search.Summary.SUM
            });
            log.debug({
                title: 'item and total',
                details: {
                    item: item,
                    total: total
                }
            });
            costsByItem[item] = total || 0;
            return true;
        });
        log.debug('calculateExpenseCosts return', costsByItem);
        return costsByItem;
    }

    /**
     * [getProjectExpenseSettings Supplies a merge of default project settings and optional settings for the type of expense provided]
     * @param  {[Object]} projectExpenseType  [The project expense record type]
     * @param  {[Object]} optionalSettings [An object with settings to override defaults]
     * @return {[Object]}                  [The merged or default settings]
     */
    function getProjectExpenseSettings(projectExpenseType, optionalSettings) {
        var defaultSettings = getDefaultProjectExpenseSettings(projectExpenseType);

        return optionalSettings ? Object.assign(defaultSettings, optionalSettings) :  defaultSettings;
    }

    /**
     * [getDefaultProjectExpenseSettings Supplies the default project settings for the type of expense provided]
     * @param  {[string]} projectExpenseType [The type of expense]
     * @return {[Object]}                    [The default project settings]
     */
    function getDefaultProjectExpenseSettings(projectExpenseType) {
        var defaultSettings = PROJECT_EXPENSE_SETTINGS[projectExpenseType];

        return defaultSettings;
    }

    /**
     * [getProjectIdFromExpense retrieves the project id from the expense]
     * @param  {[Object]} projectExpense [the expense to retrieve the project id from]
     * @return {[String]}                [the project id]
     */
    function getProjectIdFromExpense(projectExpense) {
        var projectExpenseSettings = getDefaultProjectExpenseSettings(projectExpense.type);

        return projectExpenseSettings.projectField;
    }

    /**
     * [processCostBudgetMap processes a map/reduce run to avoid delaying the UI]
     * @param  {[type]} projectId          [project Id to be updated]
     * @param  {[type]} projectExpenseType [expense types to calculate]
     * @return {[type]}                    [description]
     */
    function processCostBudgetMap(projectId, projectExpenseType, configId) {
        var id = configId || 1;
        if (id) {
            var configFields = search.lookupFields({
                type: 'customrecord_bb_solar_success_configurtn',
                id: id,
                columns: ['custrecord_bb_project_budget_enabled']
            });
            var standardBudgetEnabled = configFields.custrecord_bb_project_budget_enabled || false;
            if (standardBudgetEnabled) {
                var taskParameters = {};
                taskParameters['custscript_bb_project_id'] = projectId;
                taskParameters['custscript_bb_expense_type'] = projectExpenseType;

                var scriptId = 'customscript_bb_ss_mr_projectcostbudget';
                var deploymentId = 'customdeploy_bb_ss_mr_projcostbudget';
                var taskType = task.TaskType.MAP_REDUCE;

                batchProcessor.addToQueue(scriptId, deploymentId, taskParameters, taskType);
            }
        }
    }
    /**
     * [processCostBudget processes the cost budget list]
     * @param  {[string]} projectId      [The project Id to update]
     * @param  {[Object || string]} projectExpense [The expense or type of expense (don't rely on getting an object)]
     * @return {[void]}
     */
    function processCostBudget(projectId, projectExpense, optionalSettings) {
        if (projectId && projectExpense) {
            var project = record.load({
                type: record.Type.JOB,
                id: projectId,
                isDynamic: false
            });

            var bbConfigId = project.getValue({
                fieldId: 'custentity_bbss_configuration'
            }) || 1;

            var configFields = search.lookupFields({
                type: 'customrecord_bb_solar_success_configurtn',
                id: bbConfigId,
                columns: ['custrecord_bb_project_budget_enabled']
            });

            log.debug('configFields', configFields);

            var standardBudgetEnabled = configFields.custrecord_bb_project_budget_enabled || false;

            if (standardBudgetEnabled) {
                // change projectexpense to projectexpensetype
                if (typeof projectExpense != 'string') {
                    projectExpense = projectExpense.type;
                }
                // get the default settings merged with any option settings provided
                var projectExpenseSettings = getProjectExpenseSettings(projectExpense, optionalSettings);

                clearProjectCostBudgetSublist(project);

                var costsByItem = calculateExpenseCosts(project, projectExpenseSettings);

                if (Object.keys(costsByItem).length) {
                    // set sublist values on project for cost budget
                    updateCostBudget(project, costsByItem, projectExpenseSettings);
                }

                project.save({
                    ignoreMandatoryFields: true
                });
            }

        } else {
            log.debug('no project id or expense passed',{
                projectId: projectId,
                projectExpense: projectExpense
            });
        }
    }

    return {
        clearProjectCostBudgetSublist: clearProjectCostBudgetSublist,
        clearProjectBillingBudgetSublist: clearProjectBillingBudgetSublist,
        clearProjectBudgetSublist: clearProjectBudgetSublist, 
        updateCostBudget: updateCostBudget,
        updateBillingBudget: updateBillingBudget,
        updateBudget: updateBudget,
        calculateExpenseCosts: calculateExpenseCosts,
        processCostBudget: processCostBudget,
        processCostBudgetMap: processCostBudgetMap,
        getProjectIdFromExpense: getProjectIdFromExpense
    };
});