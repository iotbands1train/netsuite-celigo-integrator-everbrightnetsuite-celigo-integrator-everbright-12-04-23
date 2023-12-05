/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @author Richard Tuttle
 * @overview 
 */
define(['N/record', './SS Lib/BB_SS_MD_SolarConfig','./SS Lib/BB.SS.MD.ProjectCost', 'N/search', 'N/runtime'], function(record, solarConfig, projectCostUtil, search, runtime) {



    var PROJECT_EXPENSE_SETTINGS = {
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


    function afterSubmit(scriptContext) {
        if (runtime.executionContext !== runtime.ContextType.USER_INTERFACE &&
         runtime.executionContext !== runtime.ContextType.CSV_IMPORT)
        return;

        var trigger = scriptContext.type;
        var projectId;
        var projectExpense = scriptContext.newRecord;
        var projectExpenseSettings = PROJECT_EXPENSE_SETTINGS[projectExpense.type];

        switch (trigger) {
            case 'create':
            case 'edit':
            case 'xedit':
            case 'delete':
                var projectId = (trigger == 'delete' ? scriptContext.oldRecord : projectExpense).getValue({
                    fieldId: projectExpenseSettings.projectField
                });
                if (projectId) {
                    projectCostUtil.processCostBudget(projectId, projectExpense);
                    //projectCostUtil.processBillingBudget(projectId, projectExpense);
                }
            default: break;
        }
    }

    return {
        afterSubmit: afterSubmit
    };

});