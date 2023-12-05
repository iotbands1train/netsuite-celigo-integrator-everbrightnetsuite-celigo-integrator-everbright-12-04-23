/**
 * @NApiVersion 2.0
 * @NScriptType mapreducescript
 * @NModuleScope SameAccount
 */


define(["N/runtime", "N/record", "N/search", 'N/config', 'N/task', 'N/query'], function (runtime, record, search, config, task, query) {
    var CONFIG;
    var BLUCHAT_FOLDER;
    var steps = {
        map: {
            searchProjectAction: {
                searchRecord: "customrecord_bb_project_action",
                seachColumns: [
                    {name: "internalid"}
                ],
                filterFields: [
                    {name: "custrecord_bb_project", operator: "anyof", values: []}
                ]
            },
            searchProjectBOM: {
                searchRecord: "customrecord_bb_project_bom",
                seachColumns: [
                    {name: "internalid"}
                ],
                filterFields: [
                    {name: "custrecord_bb_project_bom_project", operator: "anyof", values: []}
                ]
            },
            searchProjectEnergyMeter: {
                searchRecord: "customrecord_bb_project_energy_meter",
                searchColumns: [
                    {name: "internalid"}
                ],
                filterFields: [
                    {name: "custrecord_bb_proj_en_meter_project", operator: "anyof", values: []}
                ]
            },
            searchEnergyrRateSchedule: {
                searchRecord: "customrecord_bb_energy_rate_schedule",
                searchColumns: [
                    {name: "internalid"}
                ],
                filterFields: [
                    {name: "custrecord_bb_proj_en_rate_project", operator: "anyof", values: []}
                ]
            },
            searchProjectVendorBillSchedule: {
                searchRecord: "customrecord_bb_ss_proj_vend_bill_sched",
                searchColumns: [
                    {name: "internalid"}
                ],
                filterFields: [
                    {name: "custrecord_bb_ss_proj_vnd_bill_schd_proj", operator: "anyof", values: []}
                ]
            },
            searchInvoiceSchedule: {
                searchRecord: "customrecord_bb_ss_proj_inv_schedule",
                searchColumns: [
                    {name: "internalid"}
                ],
                filterFields: [
                    {name: "custrecord_bb_ss_proj_inv_sched_proj", operator: "anyof", values: []}
                ]
            },
            searchProjectExpense: {
                searchRecord: "customrecord_bb_project_expense",
                searchColumns: [
                    {name: "internalid"}
                ],
                filterFields: [
                    {name: "custrecord_bb_proj_exp_project", operator: "anyof", values: []}
                ]
            },
            searchRevenueSchedule: {
                searchRecord: "customrecord_bb_revenue_schedule",
                searchColumns: [
                    {name: "internalid"}
                ],
                filterFields: [
                    {name: "custrecord_bb_revenue_sched_project", operator: "anyof", values: []}
                ]
            }, searchExpenseSchedule: {
                searchRecord: "customrecord_bb_expense_schedule",
                searchColumns: [
                    {name: "internalid"}
                ],
                filterFields: [
                    {name: "custrecord_bb_exp_sched_project", operator: "anyof", values: []}
                ]
            },
            searchExpenseBudget: {
                searchRecord: "customrecord_bb_proj_exp_budget",
                searchColumns: [
                    {name: "internalid"}
                ],
                filterFields: [
                    {name: "custrecord_bb_proj_exp_budget_project", operator: "anyof", values: []}
                ]
            },
            searchExpenseBudgetLineSeq: {
                searchRecord: "customrecord_bb_proj_exp_budg_line_seq",
                searchColumns: [
                    {name: "internalid"}
                ],
                filterFields: [
                    {name: "custrecord_bb_exp_budg_line_seq_proj", operator: "anyof", values: []}
                ]
            },
            searchProjectBluChatMessages: {
                searchRecord: "customrecord_bluchat_messages",
                searchColumns: [
                    {name: "internalid"}
                ],
                filterFields: [
                    {name: "custrecord_bluchat_parent_id", operator: "anyof", values: []}
                ]
            },
            searchProjectAdders: {
                searchRecord: "customrecord_bb_project_adder",
                seachColumns: [
                    {name: "internalid"}
                ],
                filterFields: [
                    {name: "custrecord_bb_project_adder_project", operator: "anyof", values: []}
                ]
            }
        },
        reduce: {
            customrecord_bb_project_action: {
                action: "copy",
                copyFields: ["name"],
                changeFields: [
                    {fieldId: "custrecord_bb_project", value: "newProjectId"}
                ],
                hasChildRecord: true,
                childRecords: [{
                    recordType: "customrecord_bb_proj_act_transact_sched",
                    action: "copy",
                    seachColumns: [
                        {name: "internalid"}
                    ],
                    copyFields: ["name"],
                    filterFields: [
                        {name: "custrecord_bb_pats_project_action", operator: "anyof", values: []}
                    ],
                    changeFields: [
                        {fieldId: "custrecord_bb_pats_project_action"},
                        {fieldId: "custrecord_bb_pats_project", value: "newProjectId"}
                    ]
                }]
            },
            customrecord_bb_project_bom: {
                action: "copy",
                changeFields: [
                    {fieldId: "custrecord_bb_project_bom_project", value: "newProjectId"}
                ],
                hasChildRecord: false
            },
            customrecord_bb_energy_rate_schedule: {
                action: "copy",
                copyFields: ["name"],
                changeFields: [
                    {fieldId: "custrecord_bb_proj_en_rate_project", value: "newProjectId"}
                ],
                hasChildRecord: false
            }, customrecord_bb_expense_schedule: {
                action: "copy",
                copyFields: ["name"],
                changeFields: [
                    {fieldId: "custrecord_bb_exp_sched_project", value: "newProjectId"}
                ],
                hasChildRecord: false
            },
            customrecord_bb_project_energy_meter: {
                action: "copy",
                changeFields: [
                    {fieldId: "custrecord_bb_proj_en_meter_project", value: "newProjectId"}
                ],
                copyFields: ["name"],
                hasChildRecord: true,
                childRecords: [
                    {
                        recordType: "customrecord_bb_proj_enrgy_meter_reading",
                        action: "copy",
                        seachColumns: [
                            {name: "internalid"}
                        ],
                        filterFields: [
                            {name: "custrecord_bb_meter_reading_meter", operator: "anyof", values: []}
                        ],
                        changeFields: [
                            {fieldId: "custrecord_bb_meter_reading_meter"}
                        ]
                    },
                    {
                        recordType: "customrecord_bb_proj_energy_production",
                        action: "copy",
                        seachColumns: [
                            {name: "internalid"}
                        ],
                        filterFields: [
                            {name: "custrecord_bb_proj_en_prdct_meter", operator: "anyof", values: []}
                        ],
                        copyFields: ["name"],
                        changeFields: [
                            {fieldId: "custrecord_bb_proj_en_prdct_meter"},
                            {fieldId: "custrecord_bb_proj_en_prdct_project", value: "newProjectId"}
                        ]

                    }
                ]
            },
            customrecord_bb_ss_proj_vend_bill_sched: {
                action: "copy",
                changeFields: [
                    {fieldId: "custrecord_bb_ss_proj_vnd_bill_schd_proj", value: "newProjectId"}
                ],
                hasChildRecord: false,
            },
            customrecord_bb_ss_proj_inv_schedule: {
                action: "copy",
                changeFields: [
                    {fieldId: "custrecord_bb_ss_proj_inv_sched_proj", value: "newProjectId"}
                ],
                hasChildRecord: false
            },
            customrecord_bb_project_expense: {
                action: "copy",
                changeFields: [
                    {fieldId: "custrecord_bb_proj_exp_project", value: "newProjectId"}
                ],
                hasChildRecord: false
            },
            customrecord_bb_revenue_schedule: {
                action: "copy",
                changeFields: [
                    {fieldId: "custrecord_bb_revenue_sched_project", value: "newProjectId"}
                ],
                hasChildRecord: false
            },
            customrecord_bb_proj_exp_budget: {
                action: "copy",
                changeFields: [
                    {fieldId: "custrecord_bb_proj_exp_budget_project", value: "newProjectId"}
                ],
                hasChildRecord: true, childRecords: [
                    {
                        recordType: "customrecord_bb_proj_exp_budg_line",
                        action: "copy",
                        seachColumns: [
                            {name: "internalid"}
                        ],
                        filterFields: [
                            {name: "custrecord_bb_proj_exp_budget", operator: "anyof", values: []}
                        ],
                        changeFields: [
                            {fieldId: "custrecord_bb_proj_exp_budget"},
                            {fieldId: "custrecord_bb_proj_en_prdct_project", value: "newProjectId"}
                        ]
                    }
                ]

            },
            customrecord_bb_proj_exp_budg_line_seq: {
                action: "copy",
                changeFields: [
                    {fieldId: "custrecord_bb_exp_budg_line_seq_proj", value: "newProjectId"}
                ],
                hasChildRecord: false
            },
            customrecord_bb_project_adder: {
                action: "copy",
                changeFields: [
                    {fieldId: "custrecord_bb_project_adder_project", value: "newProjectId"}
                ],
                hasChildRecord: false
            }
        }
    };

    /**
     * Functio loads the confid record and finds the Bluchat folder
     * @param CONFIG
     * @param search
     * @param BLUCHAT_FOLDER
     * @param query
     * @returns {{CONFIG, BLUCHAT_FOLDER}}
     */
    function getConfigAndBluChatFolder() {
        var config = search.lookupFields({
            type: 'customrecord_bb_solar_success_configurtn',
            id: '1',
            columns: ['custrecord_bb_copy_proj_name_chng_loc', 'custrecord_bb_copy_proj_name_chng_text', 'custrecord_bb_copy_bluchat_messages']
        });
        var sql = "select appfolder from mediaitemfolder where parent=-19 AND name=?";
        var bluchatFolder = query.runSuiteQL({
            query: sql,
            params: ['com.bluebanyansolutions.bluchat']
        }).asMappedResults().length;
        return {'config': config, 'bluchatFolder': bluchatFolder};
    }

    /**
     * Function creates a search object
     *
     * @governance 0 Units
     * @param {String} type - Type of the search to be created
     * @param {Object} columns - Columns to be added in the result of the search
     * @param {Object} filters - Filters to be put for the search
     *
     * @returns {Object} search Object
     */
    function createSearch(type, columns, filters) {
        return search.create({
            type: type,
            columns: columns,
            filters: filters
        });
    }

    /**
     * Function gets the search result
     *
     * @governance 5 Units
     * @param {Object} searchObject
     *
     * @returns {Object} result - Search result
     */
    function getAllSearchResult(searchObject) {
        var pages = searchObject.runPaged({pageSize: 1000}); //5 units
        var result = [];
        for (var pageIndex = 0; pageIndex < pages.pageRanges.length; pageIndex += 1) {
            var singlePage = pages.fetch({index: pageIndex});
            for (var lineIndex = 0; lineIndex < singlePage.data.length; lineIndex += 1) {
                result.push(singlePage.data[lineIndex]);
            }
        }
        return result;
    }

    /**
     * Function adds the new subsidiary to the customer if not exits already
     *
     * @governance 15 Units
     * @param {String} customerId : customer id which needs to subsidiary to be added
     * @param {String} newSubsidiary : New Subsidiary to be added to the customer
     *
     */
    function attachNewSubsidiaryToCustomer(customerId, newSubsidiary) {
        if (!customerId) {
            return;
        }
        var customerRecord = record.load({type: "customer", id: customerId, isDynamic: true}); //5 units

        var lineCount = customerRecord.getLineCount({sublistId: "submachine"});
        var hasSameSubsidiary = false;
        for (var index = 0; index < lineCount; index++) {
            var subsidiary = customerRecord.getSublistValue({
                sublistId: "submachine",
                fieldId: "subsidiary",
                line: index
            });
            if (subsidiary == newSubsidiary) {
                hasSameSubsidiary = true;
                break;
            }

        }
        if (!hasSameSubsidiary) {
            customerRecord.selectNewLine({sublistId: "submachine"});
            customerRecord.setCurrentSublistValue({
                sublistId: "submachine",
                fieldId: "subsidiary",
                value: newSubsidiary
            });
            customerRecord.commitLine({sublistId: "submachine"});
            customerRecord.save(); // 10 units
        }
    }

    /**
     * Function creates a new project and add the new subsidiary to it
     *
     * @governance 20 Units
     * @param {String} projectId : project to be copied
     * @param {String} newSubsidiary : New Subsidiary to be added to the customer
     * @param {String} projectNumber : project name to be set
     *
     */
    function copyProjectToNewSubsidiary(projectId, newSubsidiary, projectNumber) {
        var newProjectRecord = record.copy({type: "job", id: projectId}); //5 units
        newProjectRecord.setValue({fieldId: "entityid", value: projectNumber});
        newProjectRecord.setValue({fieldId: "subsidiary", value: newSubsidiary});

        // attach cost budget and billing budget
        var hasJobcosting = config.load({type: config.Type.FEATURES}).getValue({fieldId: 'jobcosting'});
        if (hasJobcosting) {
            var columns = [];
            columns.push({name: "projectcostcategory", join: "projectBudget"});
            columns.push({name: "amount", join: "projectBudget"});
            columns.push({name: "type", join: "projectBudget"});

            var filters = [];
            filters.push({name: "internalid", operator: "anyof", values: [projectId]});

            var searchObject = createSearch("job", columns, filters);
            var searchResult = getAllSearchResult(searchObject); //5 units

            var budgetResults = {};
            for (var index = 0; index < searchResult.length; index++) {

                var type = searchResult[index].getValue({name: "type", join: "projectBudget"});
                var category = searchResult[index].getValue({name: "projectcostcategory", join: "projectBudget"});
                var amount = searchResult[index].getValue({name: "amount", join: "projectBudget"});

                if (!budgetResults[type]) {
                    budgetResults[type] = {};
                }
                budgetResults[type][category] = amount;
            }

            if (JSON.stringify(budgetResults) != "{}") {
                var budgetSublist = ["bbudget", "cbudget"];

                for (var i = 0; i < budgetSublist.length; i++) {
                    var budgetType = budgetSublist[i] == "bbudget" ? "Billing" : "Cost";

                    var lineCount = newProjectRecord.getLineCount({sublistId: budgetSublist[i]});
                    var budgetResult = budgetResults[budgetType];
                    if (!budgetResult) continue;
                    for (var j = 0; j < lineCount; j++) {
                        var categoryId = newProjectRecord.getSublistValue({
                            sublistId: budgetSublist[i],
                            fieldId: "costcategoryid",
                            line: j
                        });

                        if (budgetResult[categoryId]) {
                            newProjectRecord.setSublistValue({
                                sublistId: budgetSublist[i],
                                fieldId: "amount_1_",
                                line: j,
                                value: budgetResult[categoryId]
                            });
                        }
                    }
                }
            }
        }

        return newProjectRecord.save(); // 10 units
    }


    /**
     * Function gets the field change values
     *
     * @governance 0 Units
     * @param {String} changeValue : value to be changed
     * @param {String} reduceKey : key of reduce stage
     * @param {String} changeFieldKey : key of field to be changed
     *
     */
    function getChangeFieldValue(changeValue, reduceKey, changeFieldKey) {
        var returnValue = "";

        if (changeFieldKey) {
            returnValue = reduceKey[changeFieldKey];
        } else {
            returnValue = changeValue;
        }
        return returnValue;
    }

    /**
     * Function copy all the subrecords of the project
     *
     * @governance 9 Units
     * @param {String} recordyType : type of subrecord
     * @param {String} recordId : id of the subrecord type to be copied
     * @param {String} changeFields : fields to be changed
     * @param {String} reduceKey : key of reduce stage
     * @param {String} changeValue : value to be
     * @param {String} copyFields : field to be copied as is
     *
     * @return {String} newId : id of the new record created for the subrecords
     */
    function copySubRecord(recordyType, recordId, changeFields, reduceKey, changeValue, copyFields) {
        var newRecord = record.copy({type: recordyType, id: recordId}); // 2 units
        log.debug('newRecord', newRecord);

        for (var index = 0; index < changeFields.length; index++) {
            var changeValue = getChangeFieldValue(changeValue, reduceKey, changeFields[index].value);
            log.debug('changeValue', changeValue);
            var changeField = changeFields[index].fieldId;
            log.debug('changeField', changeField);
            if (changeField == 'name') {
                var nameToset = search.lookupFields({
                    type: recordyType,
                    id: recordId,
                    columns: ['name']
                }); // 1 unit
                record.submitFields({
                    type: recordyType,
                    id: recordId,
                    values: {
                        'name': '(inactive)' + nameToset
                    }
                }); // 2 units
                newRecord.setValue({fieldId: changeField, value: nameToset});
            }
            newRecord.setValue({fieldId: changeField, value: changeValue});
        }
        log.debug('copyFields', copyFields);
        if (copyFields) {
            var sourceRecord = record.load({type: recordyType, id: recordId});
            for (var i = 0; i < copyFields.length; i++) {
                var sourceValue = sourceRecord.getValue({fieldId: copyFields[i]});
                newRecord.setValue({fieldId: copyFields[i], value: sourceValue});
            }
        }
        var newID = newRecord.save(); // 4 units
        log.debug('newID', newID);
        return newID;
    }

    /**
     * Function inactivates the vendor schedules for old project i.e the project that got copied
     *
     * @governance 7 Units
     * @param {String} oldProjectId : id of the project that got copied
     */
    function inactiveFutureVendorSchedule(oldProjectId) {
        var columns = [];
        columns.push({name: "internalid"});

        var filters = [];
        filters.push({name: "isinactive", operator: "is", values: ["F"]});
        filters.push({name: "custrecord_bb_ss_proj_vnd_bill_schd_due", operator: "onorafter", values: ["today"]});
        filters.push({name: "custrecord_bb_ss_proj_vnd_bill_schd_proj", operator: "anyof", values: [oldProjectId]});

        var searchObject = createSearch("customrecord_bb_ss_proj_vend_bill_sched", columns, filters);
        var searchResult = getAllSearchResult(searchObject); //5 units

        log.debug('vendor schedule searchResult', searchResult);
        for (var index = 0; index < searchResult.length; index++) {
            record.submitFields({
                type: "customrecord_bb_ss_proj_vend_bill_sched",
                id: searchResult[index].getValue({name: "internalid"}),
                values: {
                    isinactive: true
                } //2 units
            });
        }
    }

    /**
     * Function inactivates the invoice schedules for old project i.e the project that got copied
     *
     * @governance 7 Units
     * @param {String} oldProjectId : id of the project that got copied
     */
    function inactiveFutureInvoiceSchedule(oldProjectId) {
        var columns = [];
        columns.push({name: "internalid"});

        var filters = [];
        filters.push({name: "isinactive", operator: "is", values: ["F"]});
        filters.push({name: "custrecord_bb_ss_proj_inv_sched_due_date", operator: "onorafter", values: ["today"]});
        filters.push({name: "custrecord_bb_ss_proj_inv_sched_proj", operator: "anyof", values: [oldProjectId]});

        var searchObject = createSearch("customrecord_bb_ss_proj_inv_schedule", columns, filters);
        var searchResult = getAllSearchResult(searchObject); //5 units

        log.debug('invoice schedule searchResult', searchResult);

        for (var index = 0; index < searchResult.length; index++) {
            record.submitFields({
                type: "customrecord_bb_ss_proj_inv_schedule",
                id: searchResult[index].getValue({name: "internalid"}),
                values: {
                    isinactive: true
                }
            }); //2 units
        }
    }


    /**
     * Function inactivates the Rate schedules for old project i.e the project that got copied
     *
     * @governance 7 Units
     * @param {String} oldProjectId : id of the project that got copied
     */
    function inactiveRateSchedule(oldProjectId) {
        var columns = [];
        columns.push({name: "internalid"});

        var filters = [];
        filters.push({name: "isinactive", operator: "is", values: ["F"]});
        filters.push({name: "custrecord_bb_proj_en_rate_project", operator: "anyof", values: [oldProjectId]});

        var searchObject = createSearch("customrecord_bb_energy_rate_schedule", columns, filters);
        var searchResult = getAllSearchResult(searchObject); // 5units

        for (var index = 0; index < searchResult.length; index++) {
            record.submitFields({
                type: "customrecord_bb_energy_rate_schedule",
                id: searchResult[index].getValue({name: "internalid"}),
                values: {
                    isinactive: true
                }
            }); // 2 units
        }
    }

    /**
     * Function searches for inactive projects
     *
     * @governance 5 Units
     * @param {String} oldProjectId : id of the project that got copied
     *
     * @returns {String} length of the search result
     */
    function searchInactiveProject(inactiveProjectNumber) {
        var columns = [];
        columns.push({name: "entityid"});

        var filters = [];
        filters.push({name: "entityid", operator: "startswith", values: [inactiveProjectNumber]});

        var searchObject = createSearch("job", columns, filters);
        var searchResult = getAllSearchResult(searchObject); // 5 units

        return searchResult.length;
    }


    /**
     * Function gets the project and its subrecord details to copy
     *
     * @governance 50 Units Or 65 Units
     * @param {String} oldProjectId : id of the project that got copied
     *
     * @returns {String} length of the search result
     */
    function getInputData() {
        var scriptObj = runtime.getCurrentScript();
        var extraMapSteps = scriptObj.getParameter({
            name: "custscript_bb_map_steps"
        });

        if (extraMapSteps != null) {
            extraMapSteps = JSON.parse(extraMapSteps.replace(/(\r\n|\n|\r)/gm, ""));
            Object.keys(extraMapSteps).forEach(function (key) {
                steps.map[key] = extraMapSteps[key];
            });
        }
        var extraReduceSteps = scriptObj.getParameter({
            name: "custscript_bb_reduce_steps"
        });
        if (extraReduceSteps != null) {
            extraReduceSteps = JSON.parse(extraReduceSteps.replace(/(\r\n|\n|\r)/gm, ""));
            Object.keys(extraReduceSteps).forEach(function (key) {
                steps.reduce[key] = extraReduceSteps[key];
            });
        }

        var configAndBluChatFolder = getConfigAndBluChatFolder();
        CONFIG = configAndBluChatFolder.config;
        BLUCHAT_FOLDER = configAndBluChatFolder.bluchatFolder;



        var projectIdSavedSearch = scriptObj.getParameter({
            name: "custscript_proj_saved_search_tocopy"
        });
        var destinationProject = scriptObj.getParameter({
            name: "custscript_bb_dest_subsidiary"
        });
        var projectId;
        var stepsArray=[];
        log.debug('projectIdSavedSearch',projectIdSavedSearch)
        if(projectIdSavedSearch){
            var projectIdSavedSearchObj = search.load({
                id: projectIdSavedSearch
            });
            var stepsMapFormultipleProject={};
            projectIdSavedSearchObj.run().each(function(result) {
                projectId=result.id;
                var projStep=processprojectforcopy(projectId,destinationProject,CONFIG,configAndBluChatFolder);
                log.debug('projStep',projStep);
                for(var projStepKeys in projStep){
                    var projStepNewKey=projStepKeys+'_'+result.id;
                    stepsMapFormultipleProject[projStepNewKey]=projStep[projStepKeys];
                }

                return true;
            });

            log.debug('stepsMapFormultipleProject',stepsMapFormultipleProject);
            return stepsMapFormultipleProject;
        }else{
            var projectId = scriptObj.getParameter({
                name: "custscript_bb_copy_project_id"
            });
            log.debug('scriptObj', scriptObj);
            var projStep=processprojectforcopy(projectId,destinationProject,CONFIG,configAndBluChatFolder);
            return projStep;
        }

    }

    function processprojectforcopy(projectId,destinationProject,CONFIG,configAndBluChatFolder){
        var projectRecord = record.load({type: "job", id: projectId}); //5 units
        var parent = projectRecord.getValue({fieldId: "parent"});
        var projectNumber = projectRecord.getValue({fieldId: "entityid"});
        var projectNumberFornew = projectRecord.getValue({fieldId: "entityid"});
        var isTemplate = projectRecord.getValue({fieldId: "custentity_bb_is_project_template"});
        var index = 0;
        log.debug('isTemplate', isTemplate);
        if (!isTemplate) {

            if (projectNumber.indexOf(CONFIG.custrecord_bb_copy_proj_name_chng_text) == -1) {
                if (CONFIG.custrecord_bb_copy_proj_name_chng_loc.length > 0 && CONFIG.custrecord_bb_copy_proj_name_chng_loc[0].text == 'Suffix') {
                    projectNumber = projectNumber + '-' + CONFIG.custrecord_bb_copy_proj_name_chng_text;
                } else if (CONFIG.custrecord_bb_copy_proj_name_chng_loc.length > 0 && CONFIG.custrecord_bb_copy_proj_name_chng_loc[0].text == 'Prefix') {
                    projectNumber = CONFIG.custrecord_bb_copy_proj_name_chng_text + '-' + projectNumber;
                }

                index = searchInactiveProject(projectNumber);
            }
            projectRecord.setValue({fieldId: "entityid", value: projectNumber + "-" + (parseFloat(index) + 1)});
            projectRecord.save(); // 10 units
            projectNumber = projectNumber.replace("(Inactive) ", "");

            var projectFinancier = projectRecord.getValue({fieldId: "custentity_bb_financier_customer"});

            attachNewSubsidiaryToCustomer(parent, destinationProject); //15 units
            if (projectFinancier) {
                attachNewSubsidiaryToCustomer(projectFinancier, destinationProject); //15 units
            }

        } else {
            if (projectNumber.indexOf("-cp-") == -1) {
                projectNumber = projectNumber + '-cp-';
                index = searchInactiveProject(projectNumber);
            }
            //projectNumber = projectNumber + (parseFloat(index) + 1);

            projectRecord.setValue({fieldId: "entityid", value: projectNumber + "-" + (parseFloat(index) + 1)});
            projectRecord.save(); // 10 units
        }

        var newProjectId = copyProjectToNewSubsidiary(projectId, destinationProject, projectNumberFornew); // 20 units

        var mapSteps = steps.map;

        for (var key in mapSteps) {
            steps.map[key].sourceProjectId = projectId;
            steps.map[key].newProjectId = newProjectId;
            steps.map[key].customerId = parent;
            steps.map[key].filterFields[0].values.push(projectId);
            steps.map[key].destinationSubsidiary = destinationProject;
            steps.map[key].reduceStage = steps.reduce[steps.map[key].searchRecord]
            steps.map[key].configAndBluChatFolder = configAndBluChatFolder
        }
        log.debug('steps.map', steps.map);

        return steps.map
    }

    /**
     * map stage of the process.
     *
     * @governance 5 Units Or 10 Units Or 20 Units
     * @param {Object} context : contex of the process
     *
     * @returns {Object} context : contex of the process
     */
    function map(context) {
        var mapObject = JSON.parse(context.value);
        log.debug('mapObject', mapObject);
        //throw 'stop map'
        CONFIG = mapObject.configAndBluChatFolder.config;
        BLUCHAT_FOLDER = mapObject.configAndBluChatFolder.bluchatFolder;
        log.debug('mapObject', mapObject);
        if (mapObject.searchRecord == 'customrecord_bluchat_messages' && CONFIG.custrecord_bb_copy_bluchat_messages && BLUCHAT_FOLDER == 1) {
            var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
            scriptTask.scriptId = 'customscript_bb_ss_ss_copybluchatmessage';
            scriptTask.deploymentId = 'customdeploy_bb_ss_ss_copybluchatmessage';
            scriptTask.params = {
                'custscript_bb_blu_chat_copy_rec_type': 'job',
                'custscript_bb_new_project_id': mapObject.newProjectId,
                'custscript_bb_source_proj_id': mapObject.sourceProjectId
            };
            var scriptTaskId = scriptTask.submit();
        } else if (mapObject.searchRecord != 'customrecord_bluchat_messages'){
            var searchObject = createSearch(mapObject.searchRecord, mapObject.searchColumns, mapObject.filterFields);
            log.debug('searchObject', searchObject);
            var searchResult = getAllSearchResult(searchObject); // 5 units
            log.debug('searchResult', searchResult);

            if (mapObject.additionalSteps) {
                mapObject.additionalSteps.filterFields[0].values.push(mapObject.sourceProjectId);
                var additionSearchObject = createSearch(mapObject.searchRecord, mapObject.additionalSteps.searchColumns,
                    mapObject.additionalSteps.filterFields);
                var additonSearchResult = getAllSearchResult(additionSearchObject); // 5 units

                for (var i = 0; i < searchResult.length; i++) {
                    if (mapObject.additionalSteps.action == "attachSubsidiaryToCustomer") {
                        attachNewSubsidiaryToCustomer(
                            additonSearchResult[i].getValue(mapObject.additionalSteps.searchColumns[0]),
                            mapObject.destinationSubsidiary
                        ); // 15 units
                    } else if (mapObject.additionalSteps.action == "createLocation") {

                    }

                }

            }

            for (var index = 0; index < searchResult.length; index++) {
                // var reduceKey = {
                //     type: mapObject.searchRecord,
                //     newProjectId: mapObject.newProjectId,
                //     index: index,
                //     sourceProjectId: mapObject.sourceProjectId,
                //     reduceStage: mapObject.reduceStage
                // };
                // var reduceValue = searchResult[index].id;
                // context.write(reduceKey, reduceValue);

                //Inverting reduceKey and reduceValue to avoid KEY_LENGTH_IS_OVER_3000_BYTES, reduceKey has a limit of 3000 characters and reduceValue limit is 10MB
                var reduceValue = {
                    type: mapObject.searchRecord,
                    newProjectId: mapObject.newProjectId,
                    index: index,
                    sourceProjectId: mapObject.sourceProjectId,
                    reduceStage: mapObject.reduceStage
                };
                var reduceKey = searchResult[index].id;
                context.write(reduceKey, reduceValue);

            }

            // context.write({action: "updateProject"}, {
            //     sourceProjectId: mapObject.sourceProjectId,
            //     newProjectId: mapObject.newProjectId
            // })

            context.write("updateProject", {
                sourceProjectId: mapObject.sourceProjectId,
                newProjectId: mapObject.newProjectId
            })

        }


    }

    /**
     * Reduce stage of the process. Copies Subrecord and creates key for summarize with new and old projects
     *
     * @governance 9 Units Or 18 Units Or 20 Units
     * @param {Object} context : contex of the process
     *
     * @returns {Object} context : contex of the process
     */
    function reduce(context) {
        // var key = JSON.parse(context.key);
        // log.debug('key in reduce', key);
        // var value = context.values[0];
        // log.debug('value in reduce', value);
        // if (key.action == "updateProject") {
        //     value = JSON.parse(context.values[0]);
        //     context.write(value.sourceProjectId, value.newProjectId);
        //
        // } else {
        //     var reduceStep = key.reduceStage;
        //     var action = reduceStep.action;
        //
        //     var subRecordId = "";
        //     if (action == "copy") {
        //         subRecordId = copySubRecord(key.type, value, reduceStep.changeFields, key, null, reduceStep.copyFields); //9 units
        //         log.debug('subRecordId', subRecordId);
        //     }
        //
        //     if (reduceStep.hasChildRecord) {
        //         log.debug('reduceStep', reduceStep);
        //         var childRecords = reduceStep.childRecords;
        //         log.debug('childRecords', childRecords);
        //         log.debug('childRecords.length', childRecords.length);
        //         for (var index = 0; index < childRecords.length; index++) {
        //             var childRecord = childRecords[index];
        //             var childRecordType = childRecord.recordType;
        //             log.debug('childRecord at 710', childRecord);
        //             childRecord.filterFields[0].values.push(value);
        //
        //             var searchObject = createSearch(childRecordType, childRecord.seachColumns, childRecord.filterFields);
        //             var searchResult = getAllSearchResult(searchObject);
        //
        //             for (var i = 0; i < searchResult.length; i++) {
        //                 copySubRecord(childRecordType, searchResult[i].getValue({name: "internalid"}),
        //                     childRecord.changeFields, key, subRecordId, childRecord.copyFields); // 9 units
        //             }
        //         }
        //     }
        // }

        var key = context.key;
        log.debug('key in reduce', key);
        var value = JSON.parse(context.values[0]);
        log.debug('value in reduce', value);
        if (key === "updateProject") {
            context.write(value.sourceProjectId, value.newProjectId);
        } else {
            var reduceStep = value.reduceStage;
            var action = reduceStep.action;

            var subRecordId = "";
            if (action == "copy") {
                subRecordId = copySubRecord(value.type, key, reduceStep.changeFields, value, null, reduceStep.copyFields); //9 units
                log.debug('subRecordId', subRecordId);
            }

            if (reduceStep.hasChildRecord) {
                log.debug('reduceStep', reduceStep);
                var childRecords = reduceStep.childRecords;
                log.debug('childRecords', childRecords);
                log.debug('childRecords.length', childRecords.length);
                for (var index = 0; index < childRecords.length; index++) {
                    var childRecord = childRecords[index];
                    var childRecordType = childRecord.recordType;
                    log.debug('childRecord at 710', childRecord);
                    childRecord.filterFields[0].values.push(key);

                    var searchObject = createSearch(childRecordType, childRecord.seachColumns, childRecord.filterFields);
                    var searchResult = getAllSearchResult(searchObject);

                    for (var i = 0; i < searchResult.length; i++) {
                        copySubRecord(childRecordType, searchResult[i].getValue({name: "internalid"}),
                            childRecord.changeFields, value, subRecordId, childRecord.copyFields); // 9 units
                    }
                }
            }
        }
    }

    /**
     * Summarize stage of the process. adds copy to and copy from field in projects and invalidates old project schedules
     *
     * @governance 9 Units Or 18 Units Or 20 Units
     * @param {Object} context : contex of the process
     *
     * @returns {Object} context : contex of the process
     */
    function summarize(summary) {

        log.debug('summary in summary', summary);

        var projectIds = [];
        summary.output.iterator().each(function (key, value) {

            var sourceProjectId = key;


            if (projectIds.indexOf(sourceProjectId) == -1) {
                projectIds.push({sourceProjectId: sourceProjectId, copyToProject: value});
            }

            return true;
        });

        log.debug('projectIds in summarize', projectIds);
        for (var index = 0; index < projectIds.length; index++) {
            var sourceProjectId = projectIds[index].sourceProjectId;
            var newProject = projectIds[index].copyToProject;

            var otherId = record.submitFields({
                type: 'job',
                id: sourceProjectId,
                values: {
                    'custentity_bb_copy_to': newProject
                }
            });
            var otherId = record.submitFields({
                type: 'job',
                id: newProject,
                values: {
                    'custentity_bb_copy_from': sourceProjectId
                }
            });


            inactiveFutureInvoiceSchedule(sourceProjectId); //7 units
            inactiveFutureVendorSchedule(sourceProjectId); // 7 units
            inactiveRateSchedule(sourceProjectId); // 7units
        }

        summary.mapSummary.errors.iterator().each(function (key, error) {
            log.error("Map Error for key: " + key, error);
            return true;
        });
        summary.reduceSummary.errors.iterator().each(function (key, error) {
            log.error("Reduce Error for key: " + key, error);
            return true;
        });
    }


    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});