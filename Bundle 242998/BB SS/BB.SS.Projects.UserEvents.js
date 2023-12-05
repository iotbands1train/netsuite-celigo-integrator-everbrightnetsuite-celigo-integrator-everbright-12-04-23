/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @author Matt Lehman
 * @author Ashley Wallace
 * @version 0.2.0
 */

/**
 * Copyright 2017-2019 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/record', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/runtime', './BB SS/SS Lib/BB.SS.MD.UpsertSalesOrder', './BB SS/SS Lib/BB.SS.Project.AccountingFields', './BB SS/SS Lib/BB.SS.Project.Service', './BB SS/SS Lib/BB.SS.SalesOrder.Service', './BB SS/SS Lib/BB.SS.MD.Project.BOM.Adders.InlineEditor', './BB SS/SS Lib/BB.SS.MD.CommissionValueHistory', './BB DS/scripts/BB.DS.Envelope.Service'],
    function(record, searchModule, serverWidget, url, runtime, upsertSalesOrder, accountingFields, projectService, salesOrderService, inlineEditor, commHistory, envelopeService){
        function getSendContractForSignatureButtonId(){
            var _templateName = 'custpage_button_docusign_custom';
            try{
                var _search = searchModule.create({
                    type: 'customrecord_docusign_custom_button',
                    filters: ['name', searchModule.Operator.IS, 'Send Contract for Signature']
                });
                var _result = _search.run().getRange({start: 0, end: 1});
                if(_result.length === 1){
                    return [_templateName, _result[0].id].join('');
                }
            } catch(ex) {}
            return undefined;
        }

        function addGenerateBomReportButton(scriptContext) {
            log.debug('addGenerateBomReportButton');
            if (scriptContext.type != scriptContext.UserEventType.VIEW) {
                return;
            }

            var projectRecord = scriptContext.newRecord;
            var m1Date = projectRecord.getValue({
                fieldId: 'custentity_bb_m1_date'
            });

            if (m1Date) {
                return;
            }

            scriptContext.form.addButton({
                id: 'custpage_generatebomrep',
                label: 'Generate BOM Report',
                functionName: 'callBOMReport'
            });
        }

        function beforeLoad (scriptContext) { // 40 units of execution when sublist is executed


            var configId = scriptContext.newRecord.getValue({fieldId: 'custentity_bbss_configuration'});
            var config = record.load({
                type: 'customrecord_bb_solar_success_configurtn',
                id: configId
            });

            scriptContext.form.removeButton("createtemplate");

            var altName = scriptContext.form.getField({
                id: 'altname'
            });
            if (altName) {
                altName.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
            }

            var _form = scriptContext.form;
            var _trigger = scriptContext.type;
            var _record = scriptContext.newRecord;
            if(_trigger === 'view'){
                var _isFilledIn = function(fieldValue){
                    return fieldValue instanceof Date || (typeof fieldValue === 'string' && fieldValue.trim().length > 0);
                };
                var _valueContractPackStartDate = _record.getValue({fieldId: 'custentity_bb_contract_pack_start_date'}); // not empty
                var _valueContractPackEndDate = _record.getValue({fieldId: 'custentity_bb_contract_pack_end_date'}); // empty
                var _valueActualEquipmentShipDate = _record.getValue({fieldId: 'custentity_bb_actual_equipment_ship_date'}); // empty
                var _valueCancellationDate = _record.getValue({fieldId: 'custentity_bb_cancellation_date'}); // empty
                var _valueM0Date = _record.getValue({fieldId: 'custentity_bb_m0_date'}); // empty
                var _valueM1Date = _record.getValue({fieldId: 'custentity_bb_m1_date'}); // empty
                var _valueM2Date = _record.getValue({fieldId: 'custentity_bb_m2_date'}); // empty
                var _valueM3Date = _record.getValue({fieldId: 'custentity_bb_m3_date'}); // empty
                var _isVisible = _isFilledIn(_valueContractPackStartDate) && !_isFilledIn(_valueContractPackEndDate) && !_isFilledIn(_valueActualEquipmentShipDate)
                    && !_isFilledIn(_valueCancellationDate) && !_isFilledIn(_valueM0Date) && !_isFilledIn(_valueM1Date) && !_isFilledIn(_valueM2Date) && !_isFilledIn(_valueM3Date);
                if(!_isVisible){
                    var _buttonId = getSendContractForSignatureButtonId();
                    if(_buttonId){
                        var _docuSignButton = _form.getButton({id: _buttonId});
                        if(_docuSignButton){
                            _form.removeButton({id: _buttonId});
                        }
                    }
                }
            }
            if (['edit', 'view'].indexOf(_trigger)) {
                var _shouldAddScript = false;
                envelopeService.envelopeButtonsConfig.forEach(function(config){
                    if (envelopeService.canProcessCounterParty(_record, config.nameField, config.emailField, config.counterPartyId)) {
                        _shouldAddScript = true;
                        var _button = _form.addButton({
                            id: ['custpage_send_envelope', _record.id, config.counterPartyId].join('_'),
                            label: ['Send to', config.sendToText].join(' '),
                            functionName: ['sendEnvelope(', _record.id, ', ', config.counterPartyId, ')'].join('')
                        });
                    }
                });
                if(_shouldAddScript){
                    _form.clientScriptModulePath = './BB DS/scripts/BB.DS.CS.Project.js';
                }
            }

            addSuiteletButtons(config, scriptContext);
            addCopyProjectButton(scriptContext, _record);

        }

        function beforeSubmit (scriptContext) {
            if (scriptContext.type !== scriptContext.UserEventType.EDIT)
                return;

            try {
                var project = scriptContext.newRecord;
                project = accountingFields.setAccountingFields(project, false); //180 Units of execution
                //set commission value history
                project.setValue({
                    fieldId: 'custentity_bb_comm_history_notes',
                    value: commHistory.commissionHistory(project)
                }); // 10 units of execution - commission history

            }
            catch(e) {
                log.error("accounting Fields", e);
            }
        }


        function afterSubmit(scriptContext) {

            try {
                var trigger = scriptContext.type;
                var project = scriptContext.newRecord;
                var _changedFields = {};
                //project = record.load({type: project.type, id: project.id});

                var config = record.load({
                    type: 'customrecord_bb_solar_success_configurtn',
                    id: scriptContext.newRecord.getValue({fieldId: 'custentity_bbss_configuration'})
                });
                switch (trigger) {
                    case 'create':
                    case 'edit':
                    case 'xedit':
                        var tcv = project.getValue({fieldId: 'custentity_bb_total_contract_value_amt'});
                        log.audit('Project total contract value', tcv);
                        accountingFields.setAccountingFields(project, true); // 200 Units of execution
                        // _changedFields = accountingFields.getChangesAccountingFields(project); // 200 Units of execution
                        var solarSalesItems = upsertSalesOrder.getSolarConfigSalesItems(); // 10 units
                        var projectType = project.getText({
                            fieldId: 'jobtype'
                        });
                        if (projectType == 'EPC') {
                            var epcRole = project.getText({
                                fieldId: 'custentity_bb_epc_role'
                            });
                        }
                        if (epcRole != 'Originator') {
                            var salesOrderId;
                            // process sublist with new check box feature else process is complete with suitelet
                            var processSublist = config.getValue({fieldId: 'custrecord_bb_show_bom_adder_sublist'});
                            if (processSublist) {
                                log.debug('running sublist on project form')
                                var salesOrderId = inlineEditor.upsertBomItemLines(project, scriptContext, _changedFields, solarSalesItems); // 99 units with 2 items + 6-8 units per each item
                                inlineEditor.upsertAdderItems(project, scriptContext, solarSalesItems, salesOrderId, _changedFields); // 70 units with no items + 2-4 units per each adder item
                            }

                        } else {
                            //Process items on sales order for EPC Originator Projects
                            log.debug('saving to sales order originator project');
                            var salesOrderRec;
                            salesOrderRec = upsertSalesOrder.getSalesOrder(project, scriptContext, null);
                            if (!salesOrderRec) {
                                salesOrderRec = upsertSalesOrder.createSalesOrderHeader(project, scriptContext); // 10 units
                            } else {
                                salesOrderRec = upsertSalesOrder.updateSalesOrderHeader(project, salesOrderRec, scriptContext); // 10 units
                            }
                            var salesOrderRecId = salesOrderRec.save({
                                ignoreMandatoryFields: true
                            });

                            if (salesOrderRecId) {
                                var taxObj = upsertSalesOrder.getSalesTaxDetails(project.id);
                                _changedFields['custentity_bb_project_so'] = salesOrderRecId;
                                _changedFields['custentity_bb_sales_tax_amount'] = (taxObj) ? taxObj.amount : null;
                                _changedFields['custentity_bb_ss_sales_tax_account'] = (taxObj) ? taxObj.account : null;

                            }

                        }
                        var projectUE = runtime.getCurrentScript();
                        log.debug('Remaining governance units', projectUE.getRemainingUsage());
                        break;

                    case 'delete':
                        break;
                }
                var _hasChangedFields = false;
                for(var prop in _changedFields){
                    if(_changedFields.hasOwnProperty(prop)){
                        _hasChangedFields = true;
                        break;
                    }
                }
                if(_hasChangedFields){
                    record.submitFields({
                        type: record.Type.JOB,
                        id: project.id,
                        values: _changedFields,
                        ignoreMandatoryFields: true
                    })
                }
            } catch (e) {
                log.error('ERROR', e);
            }

            try {
                if(scriptContext.type == 'edit' || scriptContext.type == 'xedit') {
                    projectService.changeProjectTemplate(scriptContext.newRecord, scriptContext.oldRecord);
                }
            } catch (e){
                log.error('error', e);
                throw e;
            }

            /** try {
                if(scriptContext.type == 'edit' || scriptContext.type == 'xedit'){
                    if(projectService.isM1FieldInitiallyUpdated(scriptContext.newRecord, scriptContext.oldRecord)){
                        salesOrderService.fulfillSalesOrderByProjectId(project.id);
                    }
                }
            } catch (e){
                log.error('error', e);
                throw e;
            }**/

        } // end of after submit

        function callBomSuitelet(scriptContext) {

            scriptContext.form.addButton({
                id: 'custpage_add_bom_records',
                label: 'Add/Edit Project BOM',
                functionName: 'callBomSuitelet'
            });

        }

        function callAdderSuitelet(scriptContext) {

            scriptContext.form.addButton({
                id: 'custpage_adder_records',
                label: 'Add/Edit Project Adder',
                functionName: 'callAdderSuitelet'
            });

        }


        function callExpenseSuitelet(scriptContext) {
            scriptContext.form.addButton({
                id: 'custpage_expense_records',
                label: 'Add/Edit Expenses',
                functionName: 'callExpenseSuitelet'
            });
        }

        function addSuiteletButtons(config, scriptContext) {
            // BOM/Adder inline editor list
            var trigger = scriptContext.type;
            var showBomAdderSublist = config.getValue({fieldId: 'custrecord_bb_show_bom_adder_sublist'});

            var showAdderOrExpense = config.getText({fieldId: 'custrecord_bb_ss_show_adder_or_expense'}) || 'Adder';


            switch(trigger) {
                case 'view':
                case 'edit':
                case 'xedit':
                    if (showBomAdderSublist) {
                        inlineEditor.createBOMSublist(scriptContext);
                        inlineEditor.createAdderSublist(scriptContext, config);
                    } else {
                        //add suitelet button here on form for boms and adders
                        scriptContext.form.clientScriptModulePath = './BB SS/SS Lib/BB.CLI.SL.BOM.AdderValidations';
                        callBomSuitelet(scriptContext);
                        if (showAdderOrExpense == 'Adder') {
                            callAdderSuitelet(scriptContext);
                        } else {
                            callExpenseSuitelet(scriptContext);
                        }
                    }

                    break;
            }
            addGenerateBomReportButton(scriptContext);
        }

        function addCopyProjectButton(context, newRecord) {
            if (context.type == context.UserEventType.VIEW) {
                // var suiteletUrl = url.resolveScript({
                //     scriptId: "customscript_bb_sl_copy_project",
                //     deploymentId: "customdeploy_bb_sl_copy_project",
                //     params: { "recordId": context.newRecord.id }
                // });
                //
                // var fullUrl = "https://" + url.resolveDomain({ hostType: url.HostType.APPLICATION }) + suiteletUrl;
                var copyTo = newRecord.getValue({fieldId: "custentity_c2_copy_to"});
                var roleId = runtime.getCurrentUser().role;
                var searchVal = searchModule.lookupFields({type: "role", id: roleId, columns: [ "name" ]});
                var roleText = searchVal.name;

                if (["C2 CFO"].indexOf(roleText) > -1 && !copyTo ) {
                    context.form.addButton({
                        id: 'custpage_copyproject',
                        label: 'Copy Project',
                        functionName: "callCopyProjectSuitelet"
                    });
                }

                if (roleId == 3) {
                    context.form.addButton({
                        id: 'custpage_copyproject',
                        label: 'Copy Project',
                        functionName: "callCopyProjectSuitelet"
                    });
                }

                if (copyTo && roleId != 3) {
                    context.form.removeButton({id: "edit"})
                }
            }
        }


        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });
