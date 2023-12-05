/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/runtime', 'N/ui/serverWidget', 'N/record', 'N/search', 'N/error', './BB.MD.Commission2.0.Lib.js'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (runtime, serverWidget, record, search, error, util) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            const objBBSolarSuccessConfigRecord = record.load({
                type: 'customrecord_bb_solar_success_configurtn',
                id: 1
            });

            const roles = objBBSolarSuccessConfigRecord.getValue('custrecord_bb_comm_roles_update_rule');
            log.debug('roles', roles);

            var userRole = String(runtime.getCurrentUser().role);
            log.debug('userRole', userRole);
            log.debug('includes', roles.includes(userRole));
            if(roles.includes(userRole)){
                let form = scriptContext.form;
                let ruleField = form.getField({
                    id : 'custentity_bbss_comm_rule'
                });
                ruleField.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.NORMAL
                });
            }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            log.debug('scriptContext.type', scriptContext.type);

            if (runtime.executionContext !== runtime.ContextType.USER_INTERFACE)
                return;

            if(scriptContext.type !== 'edit' && scriptContext.type !== 'xedit')
                return;

            let objNewRecord = scriptContext.newRecord;
            let objOldRecord = scriptContext.oldRecord;

            let oldRule = objOldRecord.getValue('custentity_bbss_comm_rule');
            let newRule = objNewRecord.getValue('custentity_bbss_comm_rule');
            log.debug('beforeSubmit oldRule', oldRule);
            log.debug('beforeSubmit newRule', newRule);
            if(!util.isEmpty(oldRule) && newRule !== oldRule){
                let canRemove = canRemoveRule(oldRule, objNewRecord.id);
                log.debug('beforeSubmit canRemove', canRemove);
                if(canRemove.hasSnapshotSet === false){
                    deleteCommissionPayments(canRemove.arrCommPayIdsToDelete);
                }else{
                    throw error.create({
                        name: 'ERROR',
                        message: 'This rule already has Commission Snapshots created and linked to Commission Payment'
                    })
                }
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            try{
                let applicableRuleID = null;
                log.audit('OK - Start', '*** Start script for project '+scriptContext.newRecord.id);
                const project = scriptContext.newRecord;

                const projectCommissionRule = project.getValue('custentity_bbss_comm_rule');
                if(!util.isEmpty(projectCommissionRule)){
                    log.audit('Note', 'Project already has a Commission Rule set. Project internalid: '+scriptContext.newRecord.id);
                    const oldProject = scriptContext.oldRecord;
                    const oldRule = oldProject.getValue('custentity_bbss_comm_rule');
                    if(oldRule !== projectCommissionRule){
                        applicableRuleID = projectCommissionRule;
                    }else{
                        log.audit('Note', 'Project already has a Commission Rule set and it did not change. Project internalid: '+scriptContext.newRecord.id);
                        return;
                    }
                }else {

                    //Load BBSS Config record
                    const objBBSolarSuccessConfigRecord = record.load({
                        type: 'customrecord_bb_solar_success_configurtn',
                        id: 1
                    });
                    /* I don't think we need this, scripts are built for Project fields only
                    const executionRecord = objBBSolarSuccessConfigRecord.getText('custrecord_bb_comm_exe_record_type');
                     */
                    const ruleSearchID = objBBSolarSuccessConfigRecord.getValue('custrecord_bb_master_comm_rule_search');
                    log.audit('ruleSearchID', ruleSearchID);
                    if (util.isEmpty(ruleSearchID)) {
                        log.error('ERROR', 'Commission Rule search id on SolarSuccess Config record is empty. Exit script. Project internalid ' + scriptContext.newRecord.id);
                    }
                    const effectiveDateFieldID = objBBSolarSuccessConfigRecord.getValue('custrecord_bb_comm_rule_effct_dt_fieldid');
                    log.audit('effectiveDateFieldID', effectiveDateFieldID);
                    if (util.isEmpty(effectiveDateFieldID)) {
                        log.error('ERROR', 'Commission Effective Date field id on SolarSuccess Config record is empty. Exit script. Project internalid ' + scriptContext.newRecord.id);
                    }


                    const projectEffectiveDate = project.getValue(effectiveDateFieldID);
                    const projectEffectiveDateText = project.getText(effectiveDateFieldID);
                    log.audit('projectEffectiveDate', projectEffectiveDate);
                    log.audit('projectEffectiveDateText', projectEffectiveDateText);
                    if (util.isEmpty(projectEffectiveDate)) {
                        log.error('ERROR', 'Project Commission Effective Date field id is empty. Exit script. Project internalid: ' + scriptContext.newRecord.id);
                        return;
                    }

                    applicableRuleID = searchCommissionRule(projectEffectiveDateText, scriptContext.newRecord.id, ruleSearchID);
                    if (util.isEmpty(applicableRuleID)) {
                        log.audit('Note', 'No applicable rules were found for this project. Exit script. Project internalid: ' + scriptContext.newRecord.id);
                        return;
                    }
                }

                searchCommissionPaymentRuleTemplate(applicableRuleID, scriptContext.newRecord.id);

                record.submitFields({
                    type: 'job',
                    id: scriptContext.newRecord.id,
                    values: {
                        'custentity_bbss_comm_rule': applicableRuleID
                    }
                });
                log.audit('OK - End', '*** Finish script for project '+scriptContext.newRecord.id);

            }catch (e) {
                log.error('ERROR for Project '+scriptContext.newRecord.id, e);
            }
        }

        const searchCommissionRule = (projectEffectiveDate, projectID, ruleSearchID) =>{
            var applicableRuleID = null;
            var customrecord_bb_commission_ruleSearchObj = search.create({
                type: "customrecord_bb_commission_rule",
                filters:
                    [
                        ["isinactive","is","F"],
                        "AND",
                        ["custrecord_bb_comm_eff_start_date","onorbefore",projectEffectiveDate],
                        "AND",
                        [["custrecord_bb_comm_eff_end_date","onorafter",projectEffectiveDate],"OR",["custrecord_bb_comm_eff_end_date","isempty",""]]
                    ],
                columns:
                    [
                        search.createColumn({name: "name", label: "Name"}),
                        search.createColumn({name: "id", label: "ID"}),
                        search.createColumn({name: "internalid", label: "Internal ID"}),
                        search.createColumn({
                            name: "custrecord_bb_comm_rule_order_int",
                            sort: search.Sort.ASC,
                            label: "Rule Order"
                        }),
                        search.createColumn({name: "custrecord_bb_rule_condition", label: "Rule Condition"}),
                        search.createColumn({name: "custrecord_bb_comm_eff_start_date", label: "Effective Start Date"}),
                        search.createColumn({name: "custrecord_bb_comm_eff_end_date", label: "Effective End Date"})
                    ]
            });
            var searchResultCount = customrecord_bb_commission_ruleSearchObj.runPaged().count;
            log.debug("customrecord_bb_commission_ruleSearchObj result count",searchResultCount);
            customrecord_bb_commission_ruleSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results

                var ruleConditionForSearch = result.getValue('custrecord_bb_rule_condition');

                if(!util.isEmpty(ruleConditionForSearch) && isRecordApplicableToRule(ruleConditionForSearch, projectID, ruleSearchID) === true){
                    /*Now this means the current Project meets this rule criteria,
                    meaning we must save the details to create Commission Payment Rules once all rules condition have been verified against this Project */
                    applicableRuleID = result.getValue('internalid');

                    //Now that I have found a rule for which my project meets the criteria and the rule has the lowes sequence number (meaning higher priority) we end the loop
                    return false;
                }

                return true;
            });

            return applicableRuleID;
        }

        const searchCommissionPaymentRuleTemplate = (ruleID, projectID) => {

            var customrecord_bb_comm_payout_ruleSearchObj = search.create({
                type: "customrecord_bb_comm_payout_rule",
                filters:
                    [
                        ["custrecord_bb_comm_payout_comm_rule","anyof",ruleID],
                        "AND",
                        ["isinactive","is","F"]
                    ],
                columns:
                    [
                        search.createColumn({name: "name", label: "Name"}),
                        search.createColumn({name: "id", label: "ID"}),
                        search.createColumn({
                            name: "custrecord_bb_comm_payout_comm_rule",
                            sort: search.Sort.ASC,
                            label: "Commission Rule"
                        }),
                        search.createColumn({name: "custrecord_bb_comm_payout_pay_type", label: "Payment Type"}),
                        search.createColumn({name: "custrecord_bb_comm_payout_pay_method", label: "Payment Method"}),
                        search.createColumn({name: "custrecord_bb_comm_payout_cal_val_int", label: "Calculation Value"}),
                        search.createColumn({name: "custrecord_bb_comm_payout_payee", label: "Commission Payee"}),
                        search.createColumn({
                            name: "custrecord_bb_comm_payout_seq_num",
                            sort: search.Sort.ASC,
                            label: "Sequence Number"
                        }),
                        search.createColumn({name: "custrecord_bb_comm_payout_rule_item", label: "Payment Item"}),
                        search.createColumn({name: "custrecord_bb_comm_payout_credit_acct", label: "Payment Credit Account"}),
                        search.createColumn({name: "custrecord_bb_comm_payout_debit_acct", label: "Payment Debit Account"})
                    ]
            });
            var searchResultCount = customrecord_bb_comm_payout_ruleSearchObj.runPaged().count;
            log.debug("customrecord_bb_comm_payout_ruleSearchObj result count",searchResultCount);
            customrecord_bb_comm_payout_ruleSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results

                /*Per each Commission Payment Rule Template, get the fields data and create an object.
                This object keys should match Commission Payment Rule fields id for easy processing later */
                var objCommissionPaymentRuleInput = {
                    "name": result.getValue('name') + ' Project: '+projectID,//TO-DO review what Name nomenclature should be use for new Commission Payment Rule records
                    "custrecord_bb_comm_payment_comm_rule": result.getValue('custrecord_bb_comm_payout_comm_rule'),
                    "custrecord_bb_comm_payment_type": result.getValue('custrecord_bb_comm_payout_pay_type'),
                    "custrecord_bb_comm_payment_pay_method": result.getValue('custrecord_bb_comm_payout_pay_method'),
                    "custrecord_bb_comm_payment_cal_val_int": result.getValue('custrecord_bb_comm_payout_cal_val_int'),
                    "custrecord_bb_comm_payment_payee": getPayeeFromProject(result.getValue('custrecord_bb_comm_payout_payee'), projectID),
                    "custrecord_bb_comm_payment_seq_num": result.getValue('custrecord_bb_comm_payout_seq_num'),//TO-DO review if Sequence Number should come from Commission Payment Rule Template or be calculated
                    "custrecord_bb_comm_payment_project": projectID,
                    "custrecord_bb_comm_payment_rule_item": result.getValue('custrecord_bb_comm_payout_rule_item'),
                    "custrecord_bb_comm_payment_credit_acct": result.getValue('custrecord_bb_comm_payout_credit_acct'),
                    "custrecord_bb_comm_payment_debit_acct": result.getValue('custrecord_bb_comm_payout_debit_acct')
                };

                //Function that will be in charge of actually creating the Commission Payment Rule records
                createCommissionPaymentRule(objCommissionPaymentRuleInput);

                return true;
            });

        }

        const getPayeeFromProject = (payeeFieldID, projectID) => {
            var recordPayee = null;
            var arrLookupFieldsValues = search.lookupFields({
                type: 'job',
                id: projectID,
                columns: [payeeFieldID]
            })[payeeFieldID];
            if(!util.isEmpty(arrLookupFieldsValues)){
                recordPayee = arrLookupFieldsValues[0].value;
            }
            log.debug('recordPayee', recordPayee);

            return recordPayee;
        }

        const createCommissionPaymentRule = (objCommissionPaymentRuleInput) => {
            if(util.isEmpty(objCommissionPaymentRuleInput)){
                log.error('ERROR', 'objCommissionPaymentRuleInput is empty');
                //TO-DO review if just log the error, return or throw exception error
            }

            //Create the Commission Payment Rule record instance
            const objCommissionPaymentRule = record.create({
                type: 'customrecord_bb_comm_payment_rule',
                isDynamic: true
            });

            //Loops through the parameter object key/values and sets the field values on Commission Payment Rule record
            for (var key of Object.keys(objCommissionPaymentRuleInput)) {
                log.debug('objCommissionPaymentRuleInput data', key + " -> " + objCommissionPaymentRuleInput[key])
                objCommissionPaymentRule.setValue(key, objCommissionPaymentRuleInput[key]);
            }

            objCommissionPaymentRule.save();
        }

        const isRecordApplicableToRule = (ruleConditionForSearch, projectID, ruleSearchID) =>{
            if(!util.isEmpty(ruleConditionForSearch)){
                ruleConditionForSearch = JSON.parse(ruleConditionForSearch);
            }
            log.debug('ruleConditionForSearch', ruleConditionForSearch);
            log.debug('ruleConditionForSearch typeof', typeof ruleConditionForSearch);
            var recordSearchObj = search.load(ruleSearchID);

            var filterExpression = recordSearchObj.filterExpression;
            if(filterExpression.length > 0) {
                filterExpression.push("AND");
                filterExpression.push(ruleConditionForSearch);
                filterExpression.push("AND");
                filterExpression.push(["internalid","anyof",projectID]);
                recordSearchObj.filterExpression = filterExpression;
            }else{
                recordSearchObj.filterExpression = ruleConditionForSearch;
            }

            log.debug('projectSearchObj.filterExpression', recordSearchObj.filterExpression);
            log.debug('projectSearchObj.filterExpression typeof', typeof recordSearchObj.filterExpression);

            var searchResult = recordSearchObj.run().getRange({
                start: 0,
                end: 1
            });


            return searchResult.length === 1;
        }

        const canRemoveRule = (ruleID, projectID) => {

            let customrecord_bb_comm_payment_ruleSearchObj = search.create({
                type: "customrecord_bb_comm_payment_rule",
                filters:
                    [
                        ["custrecord_bb_comm_payment_comm_rule","anyof",ruleID],
                        "AND",
                        ["isinactive","is","F"],
                        "AND",
                        ["custrecord_bb_comm_payment_project","anyof",projectID]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "id",
                            sort: search.Sort.ASC,
                            label: "ID"
                        }),
                        search.createColumn({name: "internalid", label: "Internal ID"}),
                        search.createColumn({name: "custrecord_bb_comm_payment_comm_rule", label: "Commission Rule"}),
                        search.createColumn({name: "custrecord_bb_comm_payment_type", label: "Payment Type"}),
                        search.createColumn({name: "custrecord_bb_comm_payment_pay_method", label: "Payment Method"}),
                        search.createColumn({name: "custrecord_bb_comm_payment_cal_val_int", label: "Calculation Value"}),
                        search.createColumn({name: "custrecord_bb_comm_payment_payee", label: "Commission Payee"}),
                        search.createColumn({name: "custrecord_bb_comm_payment_seq_num", label: "Sequence Number"}),
                        search.createColumn({name: "custrecord_bb_comm_payment_project", label: "Project"}),
                        search.createColumn({name: "custrecord_bb_comm_payment_snapshot", label: "Commission Snap Shot"})
                    ]
            });
            let hasSnapshotSet = false;
            let arrCommPayIdsToDelete = [];
            customrecord_bb_comm_payment_ruleSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results
                let snapshotID = result.getValue('custrecord_bb_comm_payment_snapshot');
                if(!util.isEmpty(snapshotID)){
                    hasSnapshotSet = true;
                    return false;
                }else{
                    arrCommPayIdsToDelete.push(result.getValue('internalid'))
                }
                return true;
            });

            return {
                hasSnapshotSet: hasSnapshotSet,
                arrCommPayIdsToDelete: arrCommPayIdsToDelete
            }
        }

        const deleteCommissionPayments = (arrCommPayIdsToDelete) => {
            log.debug('deleteCommissionPayments arrCommPayIdsToDelete', arrCommPayIdsToDelete);
            for(let i=0; i<arrCommPayIdsToDelete.length; i++){
                record.delete({
                    type: 'customrecord_bb_comm_payment_rule',
                    id: arrCommPayIdsToDelete[i]
                });
            }
        }


        return {beforeLoad, beforeSubmit, afterSubmit}

    });
