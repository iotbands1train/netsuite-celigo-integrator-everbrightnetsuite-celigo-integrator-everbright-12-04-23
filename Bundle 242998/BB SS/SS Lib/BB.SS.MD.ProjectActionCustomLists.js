/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Matt Lehman
 * @fileOverview Add custom sublists to project action record
 */

define(['N/record', 'N/search', 'N/ui/serverWidget', 'N/url'], function(record, search, serverWidget, urlModule) {

  const
    // https://blog.prolecto.com/2014/03/24/netsuite-transaction-type-internal-id-numbers/
    _typeMapping = {
        17: record.Type.VENDOR_BILL
      , 7: record.Type.INVOICE
      , 15: record.Type.PURCHASE_ORDER
      , 31: record.Type.SALES_ORDER
    }
  ;

    function projectActionTractionScheduleSublist(context) {
        var projectAction = context.newRecord;
        var projectId = projectAction.getValue({fieldId: 'custrecord_bb_project'});
        var projectActionId = projectAction.id;
        var form = context.form;
        var subtab = form.addTab({
            id: 'custpage_proj_act_trans_sch_tab',
            label: 'Project Action Transaction Schedule'
        });
        var tabs = form.getTabs();
        log.audit('available tabs', tabs);

        form.insertTab({ // was set as 'notes'
            tab: subtab,
            nexttab: 'notes'
        });

        var sublist = form.addSublist({ // add tab parameter set set tab id from form.insertTab
            id: 'custpage_proj_action_tran_sch_list',
            type: serverWidget.SublistType.INLINEEDITOR,
            label: 'Project Action Transaction Schedule',
            tab: 'custpage_proj_act_trans_sch_tab'
        });

        // add sublist fields
        var item = sublist.addField({
            id: 'custpage_pats_budget_item',
            type: serverWidget.FieldType.SELECT,
            label: 'Budget Item',
            source: 'item'
        });
        var impact = sublist.addField({
          id: 'custpage_pats_project_schedule_impact',
          type: serverWidget.FieldType.SELECT,
          label: 'Project Schedule Impact',
          source: 'customlist_bb_proj_schedule_impact'
        });
      var errorMargin = sublist.addField({
        id: 'custpage_pats_error_margin',
        type: serverWidget.FieldType.PERCENT,
        label: 'Error Margin'
      });
      var budgetAmount = sublist.addField({
            id: 'custpage_pats_budget_amount',
            type: serverWidget.FieldType.FLOAT,
            label: 'Budget Amount',
        });
      var cashSource = sublist.addField({
        id: 'custpage_pats_cash_source',
        type: serverWidget.FieldType.SELECT,
        label: 'Cash Source',
        source: 'customlist_bb_cash_source_list'
      });

        var transType = sublist.addField({
            id: 'custpage_pats_trans_type',
            type: serverWidget.FieldType.SELECT,
            label: 'Transaction Type',
            source: 'transactiontype'
        });
        var entity = sublist.addField({
            id: 'custpage_pats_entity',
            type: serverWidget.FieldType.SELECT,
            label: 'Entity',
            source: 'vendor'
        });
        var commitmentfromStartDateCount = sublist.addField({
            id: 'custpage_pats_comit_start_dt_count',
            type: serverWidget.FieldType.INTEGER,
            label: 'Commitment From Start Day Count',
        });
        var committedDate = sublist.addField({
            id: 'custpage_pats_committed_date',
            type: serverWidget.FieldType.DATE,
            label: 'Committed Date'
        });
        committedDate.updateDisplayType({
            displayType : serverWidget.FieldDisplayType.DISABLED
        });
        var deliveryFromStartDayCount = sublist.addField({
            id: 'custpage_pats_deliv_start_dt_count',
            type: serverWidget.FieldType.INTEGER,
            label: 'Delivery From Start Day Count',
        });
        var deliveryDate = sublist.addField({
            id: 'custpage_pats_delivery_date',
            type: serverWidget.FieldType.DATE,
            label: 'Delivery Date'
        });
        deliveryDate.updateDisplayType({
            displayType : serverWidget.FieldDisplayType.DISABLED
        });
        var terms = sublist.addField({
            id: 'custpage_pats_terms',
            type: serverWidget.FieldType.SELECT,
            label: 'Terms',
            source: 'term'
        });
        deliveryDate.updateDisplayType({
            displayType : serverWidget.FieldDisplayType.DISABLED
        });
        var expectedPaymentDate = sublist.addField({
            id: 'custpage_pats_expect_pay_date',
            type: serverWidget.FieldType.DATE,
            label: 'Expected Payment Date'
        });
        expectedPaymentDate.updateDisplayType({
            displayType : serverWidget.FieldDisplayType.DISABLED
        });
        //custpage_pats_obligation_level
      var cashSource = sublist.addField({
        id: 'custpage_pats_obligation_level',
        type: serverWidget.FieldType.SELECT,
        label: 'Obligation Level',
        source: 'customlist_bb_obligation_level'
      });

        var transaction = sublist.addField({
            id: 'custpage_pats_transaction',
            // type: serverWidget.FieldType.SELECT,
            type: serverWidget.FieldType.TEXT,
            label: 'Transaction',
            //source: 'transaction'
        });
        transaction.updateDisplayType({
            displayType : serverWidget.FieldDisplayType.DISABLED
        });
        // var transactionCreate = sublist.addField({
        //   id: 'custpage_pats_transaction_create',
        //   type: serverWidget.FieldType.TEXT,
        //   label: ' ',
        // });
        // transactionCreate.updateDisplayType({
        //   displayType : serverWidget.FieldDisplayType.DISABLED
        // });

        var transactionStatus = sublist.addField({
            id: 'custpage_pats_transaction_status',
            type: serverWidget.FieldType.TEXT,
            label: 'Transaction Status'
        });
        transactionStatus.updateDisplayType({
            displayType : serverWidget.FieldDisplayType.DISABLED
        });

        var transactionAmount = sublist.addField({
          id: 'custpage_pats_transaction_amount',
          type: serverWidget.FieldType.FLOAT,
          label: 'Transaction Amount'
        });
        transactionAmount.updateDisplayType({
          displayType : serverWidget.FieldDisplayType.DISABLED
        });

        var id = sublist.addField({
            id: 'custpage_pats_internalid',
            type: serverWidget.FieldType.SELECT,
            label: 'Internalid',
            source: 'customrecord_bb_proj_act_transact_sched'
        });
        // id.updateDisplayType({
        //     displayType : serverWidget.FieldDisplayType.HIDDEN
        // });
        var proj = sublist.addField({
            id: 'custpage_pats_project',
            type: serverWidget.FieldType.SELECT,
            label: 'Project',
            source: 'job'
        });
        proj.updateDisplayType({
            displayType : serverWidget.FieldDisplayType.HIDDEN
        });
        var projActionId = sublist.addField({
            id: 'custpage_pats_project_action',
            type: serverWidget.FieldType.SELECT,
            label: 'Project Action',
            source: 'customrecord_bb_project_action'
        });
        projActionId.updateDisplayType({
            displayType : serverWidget.FieldDisplayType.HIDDEN
        });
        // get sublist records via search
        var transScheduleRecords = getTransactionScheduleRecords(projectId, projectActionId);
        if (transScheduleRecords.length > 0) {
            for (var i = 0; i < transScheduleRecords.length; i++) {
                var lineObj = transScheduleRecords[i];
                setProjectActionTransactionScheduleSublistValues(sublist, i, lineObj, /view/i.test(context.type));
            }
        }
    }

    function setProjectActionTransactionScheduleSublistValues(sublist, line, lineObj, isView) {
        log.debug('list value object', lineObj);
        if (lineObj.internalid) {
            sublist.setSublistValue({
                id: 'custpage_pats_internalid',
                line: line,
                value: lineObj.internalid
            });
        }

        if (lineObj.custrecord_bb_pats_transaction_type) {
            sublist.setSublistValue({
                id: 'custpage_pats_trans_type',
                line: line,
                value: lineObj.custrecord_bb_pats_transaction_type
            });
        }
        if (lineObj.custrecord_bb_pats_committed_date) {
            sublist.setSublistValue({
                id: 'custpage_pats_committed_date',
                line: line,
                value: lineObj.custrecord_bb_pats_committed_date
            });
        }
        if (lineObj.custrecord_bb_pats_delivery_date) {
            sublist.setSublistValue({
                id: 'custpage_pats_delivery_date',
                line: line,
                value: lineObj.custrecord_bb_pats_delivery_date
            });
        }
        if (lineObj.custrecord_bb_pats_commit_srt_day_num) {
            sublist.setSublistValue({
                id: 'custpage_pats_comit_start_dt_count',
                line: line,
                value: lineObj.custrecord_bb_pats_commit_srt_day_num
            });
        }
        if (lineObj.custrecord_bb_pats_delivery_fm_start_ct) {
            sublist.setSublistValue({
                id: 'custpage_pats_deliv_start_dt_count',
                line: line,
                value: lineObj.custrecord_bb_pats_delivery_fm_start_ct
            });
        }
        if (lineObj.custrecord_bb_pats_item) {
            sublist.setSublistValue({
                id: 'custpage_pats_budget_item',
                line: line,
                value: lineObj.custrecord_bb_pats_item
            });
        }
        if (lineObj.custrecord_bb_pats_amount_num) {
            sublist.setSublistValue({
                id: 'custpage_pats_budget_amount',
                line: line,
                value: lineObj.custrecord_bb_pats_amount_num
            });
        }
        if (lineObj.custrecord_bb_pats_entity) {
            sublist.setSublistValue({
                id: 'custpage_pats_entity',
                line: line,
                value: lineObj.custrecord_bb_pats_entity
            });
        }
        if (lineObj.custrecord_bb_pats_terms) {
            sublist.setSublistValue({
                id: 'custpage_pats_terms',
                line: line,
                value: lineObj.custrecord_bb_pats_terms
            });
        }
        if (lineObj.custrecord_bb_pats_expected_payment_date) {
            sublist.setSublistValue({
                id: 'custpage_pats_expect_pay_date',
                line: line,
                value: lineObj.custrecord_bb_pats_expected_payment_date
            });
        }
        if (lineObj.custrecord_bb_pats_transaction) {
            // sublist.setSublistValue({
            //     id: 'custpage_pats_transaction',
            //     line: line,
            //     value: lineObj.custrecord_bb_pats_transaction
            // });
            var _value = lineObj.custrecord_bb_pats_transaction_text;
            if(isView && _typeMapping[lineObj.custrecord_bb_pats_transaction_type]) {
              var _url = urlModule.resolveRecord({
                recordType: _typeMapping[lineObj.custrecord_bb_pats_transaction_type]
                , recordId: lineObj.custrecord_bb_pats_transaction
              });
              _value = ['<a href="', _url, '" class="dottedlink" target="_blank">', _value ,'</a>'].join('')
            }
          sublist.setSublistValue({
            id: 'custpage_pats_transaction'
            , line: line
            , value: _value
          })

        } else if(isView) {
          var _url = urlModule.resolveScript({
            scriptId: 'customscript_bb_ss_sl_gen_tran_create'
            , deploymentId: 'customdeploy_bb_ss_sl_gen_tran_create'
            , params: {
              project: lineObj.custrecord_bb_pats_project
              , item: lineObj.custrecord_bb_pats_item
              , type: lineObj.custrecord_bb_pats_transaction_type
              , amount: 0
              , id: lineObj.internalid
            }
          });
          sublist.setSublistValue({
            id: 'custpage_pats_transaction'
            , line: line
            , value: ['<a href="', _url, '" class="dottedlink" target="_blank">Create Transaction</a>'].join('')
          })
        }
        if (lineObj.custrecord_bb_pats_transaction_status) {
            sublist.setSublistValue({
                id: 'custpage_pats_transaction_status',
                line: line,
                value: lineObj.custrecord_bb_pats_transaction_status
            });
        }

        if (lineObj.custrecord_bb_pats_transaction_amount) {
          sublist.setSublistValue({
            id: 'custpage_pats_transaction_amount',
            line: line,
            value: lineObj.custrecord_bb_pats_transaction_amount
          });
        }

        if (lineObj.custrecord_bb_pats_project) {
            sublist.setSublistValue({
                id: 'custpage_pats_project',
                line: line,
                value: lineObj.custrecord_bb_pats_project
            });
        }
        if (lineObj.custrecord_bb_pats_project_action) {
            sublist.setSublistValue({
                id: 'custpage_pats_project_action',
                line: line,
                value: lineObj.custrecord_bb_pats_project_action
            });
        }
        if (lineObj.custrecord_bb_pats_project_schedule_impact) {
          sublist.setSublistValue({
            id: 'custpage_pats_project_schedule_impact',
            line: line,
            value: lineObj.custrecord_bb_pats_project_schedule_impact
          });
        }
      if (lineObj.custrecord_bb_pats_cash_source) {
        sublist.setSublistValue({
          id: 'custpage_pats_cash_source',
          line: line,
          value: lineObj.custrecord_bb_pats_cash_source
        });
      }
      if (lineObj.custrecord_bb_pats_obligation_level) {
        sublist.setSublistValue({
          id: 'custpage_pats_obligation_level',
          line: line,
          value: lineObj.custrecord_bb_pats_obligation_level
        });
      }
      if (lineObj.custrecord_bb_pats_error_margin) {
        sublist.setSublistValue({
          id: 'custpage_pats_error_margin',
          line: line,
          value: lineObj.custrecord_bb_pats_error_margin
        });
      }
    }


    function getTransactionScheduleRecords(projectId, projectActionId) {
        var array = [];
        if (projectId && projectActionId) {
            var customrecord_proj_action_transaction_schSearchObj = search.create({
                type: "customrecord_bb_proj_act_transact_sched",
                filters:
                [
                    ["custrecord_bb_pats_project","anyof",projectId], 
                    "AND", 
                    ["custrecord_bb_pats_project_action","anyof", projectActionId],
                    "AND",
                    ["isinactive", "is", "F"],
                    "AND",
                    [[["custrecord_bb_pats_transaction","anyof","@NONE@"]],"OR",[["custrecord_bb_pats_transaction.mainline","is","T"],"AND",["custrecord_bb_pats_transaction","noneof","@NONE@"]]]

                ],
                columns:
                [
                    search.createColumn({name: "internalid",label: "Internal ID"}), 
                    search.createColumn({name: "custrecord_bb_pats_project", label: "Project"}),
                    search.createColumn({name: "custrecord_bb_pats_project_action", label: "Project Action"}),
                    search.createColumn({name: "custrecord_bb_pats_transaction_type", label: "Transaction Type"}),
                    search.createColumn({name: "custrecord_bb_pats_commit_srt_day_num", label: "Commitment From Start Day Count"}),
                    search.createColumn({name: "custrecord_bb_pats_delivery_fm_start_ct", label: "Delivery From Start Day Count"}),
                    search.createColumn({name: "custrecord_bb_pats_item", label: "Item"}),
                    search.createColumn({name: "custrecord_bb_pats_amount_num", label: "Amount"}),
                    search.createColumn({name: "custrecord_bb_pats_entity", label: "Entity"}),
                    search.createColumn({name: "custrecord_bb_pats_terms", label: "Terms"}),
                    search.createColumn({name: "custrecord_bb_pats_transaction", label: "Transaction"}),
                    search.createColumn({
                        name: "statusref",
                        join: "CUSTRECORD_BB_PATS_TRANSACTION",
                        label: "Status"
                    }),
                    search.createColumn({
                        name: "formuladate",
                        formula: "TO_DATE({custrecord_bb_pats_delivery_date})+{custrecord_bb_pats_terms.daysuntilnetdue}",
                        label: "Expected Payment Date"
                    }),
                    search.createColumn({
                        name: "formuladate",
                        formula: "TO_DATE({custrecord_bb_pats_project_action.custrecord_bb_recurrence_start_date})+{custrecord_bb_pats_commit_srt_day_num}",
                        label: "Committed Date"
                    }),
                    search.createColumn({
                        name: "formuladate",
                        formula: "TO_DATE({custrecord_bb_pats_project_action.custrecord_bb_recurrence_start_date}) + {custrecord_bb_pats_delivery_fm_start_ct}",
                        label: "Delivery Date"
                    }),
                    search.createColumn({name: "custrecord_bb_transaction_amount", label: "Transaction Amount"}),
                    search.createColumn({name: "custrecord_bb_obligation_level"}),
                    search.createColumn({name: "custrecord_bb_cash_source"}),
                    search.createColumn({name: "custrecord_bb_error_margin"}),
                    search.createColumn({name: "custrecord_bb_proj_schedule_impact"}),
                ]
            });
            var searchResultCount = customrecord_proj_action_transaction_schSearchObj.runPaged().count;
            log.debug("customrecord_proj_action_transaction_schSearchObj result count",searchResultCount);
            customrecord_proj_action_transaction_schSearchObj.run().each(function(result){
                array.push({
                    internalid: result.getValue({name: 'internalid'}),
                    custrecord_bb_pats_project: result.getValue({name: 'custrecord_bb_pats_project'}),
                    custrecord_bb_pats_project_action: result.getValue({name: 'custrecord_bb_pats_project_action'}),
                    custrecord_bb_pats_transaction_type: result.getValue({name: 'custrecord_bb_pats_transaction_type'}),
                    custrecord_bb_pats_commit_srt_day_num: result.getValue({name: 'custrecord_bb_pats_commit_srt_day_num'}),
                    custrecord_bb_pats_committed_date: result.getValue(customrecord_proj_action_transaction_schSearchObj.columns[13]),
                    custrecord_bb_pats_delivery_fm_start_ct: result.getValue({name: 'custrecord_bb_pats_delivery_fm_start_ct'}),
                    custrecord_bb_pats_item: result.getValue({name: 'custrecord_bb_pats_item'}),
                    custrecord_bb_pats_amount_num: result.getValue({name: 'custrecord_bb_pats_amount_num'}),
                    custrecord_bb_pats_entity: result.getValue({name: 'custrecord_bb_pats_entity'}),
                    custrecord_bb_pats_terms: result.getValue({name: 'custrecord_bb_pats_terms'}),
                    custrecord_bb_pats_expected_payment_date: result.getValue(customrecord_proj_action_transaction_schSearchObj.columns[12]),
                    custrecord_bb_pats_transaction: result.getValue({name: 'custrecord_bb_pats_transaction'}),
                    custrecord_bb_pats_transaction_text: result.getText({name: 'custrecord_bb_pats_transaction'}),
                    custrecord_bb_pats_transaction_status: result.getValue({name: 'statusref', join: 'CUSTRECORD_BB_PATS_TRANSACTION'}),
                    custrecord_bb_pats_transaction_amount: result.getValue({name: 'custrecord_bb_transaction_amount'}),
                    custrecord_bb_pats_obligation_level: result.getValue({name: 'custrecord_bb_obligation_level'}),
                    custrecord_bb_pats_cash_source: result.getValue({name: 'custrecord_bb_cash_source'}),
                    custrecord_bb_pats_error_margin: result.getValue({name: 'custrecord_bb_error_margin'}),
                    custrecord_bb_pats_project_schedule_impact: result.getValue({name: 'custrecord_bb_proj_schedule_impact'}),
                    custrecord_bb_pats_delivery_date: result.getValue(customrecord_proj_action_transaction_schSearchObj.columns[14])
                });
                return true;
            });
        }
        return array;
    }


    function predecessorSublist(context) {
        var projectAction = context.newRecord;
        var projectId = projectAction.getValue({fieldId: 'custrecord_bb_project'});
        var projectActionId = projectAction.id;
        var form = context.form;
        var subtab = form.addTab({
            id: 'custpage_proj_act_pred_task_tab',
            label: 'Predecessors'
        });
        var tabs = form.getTabs();
        log.audit('available tabs', tabs);

        form.insertTab({
            tab: subtab,
            nexttab: 'notes'
        });

        var sublist = form.addSublist({ // add tab parameter set set tab id from form.insertTab
            id: 'custpage_proj_action_pred_tasks',
            type: serverWidget.SublistType.INLINEEDITOR,
            label: 'Predecessors',
            tab: 'custpage_proj_act_pred_task_tab'
        });
        // add sublist fields
        var task = sublist.addField({
            id: 'custpage_pred_task_id',
            type: serverWidget.FieldType.SELECT,
            label: 'Task',
        }); 
        // add selection option
        task.addSelectOption({
            value: '',
            text: ''
        });
        getProjectTaskValues(task, projectId);

        var type = sublist.addField({
            id: 'custpage_pred_type',
            type: serverWidget.FieldType.SELECT,
            label: 'Type'
        });
        // add select option
        type.addSelectOption({
            value: 'FS',
            text: 'Finish-To-Start (FS)'
        });
        // type.addSelectOption({
        //     value: 'SS',
        //     text: 'Start-To-Start (SS)'
        // });
        // type.addSelectOption({
        //     value: 'FF',
        //     text: 'Finish-To-Finish (FF)'
        // });
        // type.addSelectOption({
        //     value: 'SF',
        //     text: 'Start-to-Finish (SF)'
        // });
        var lagTime = sublist.addField({
            id: 'custpage_pred_lagdays',
            type: serverWidget.FieldType.INTEGER,
            label: 'Lag Time'
        });
        var startDate = sublist.addField({
            id: 'custpage_pred_start_date',
            type: serverWidget.FieldType.DATE,
            label: 'Start Date'
        });
        startDate.updateDisplayType({
            displayType : serverWidget.FieldDisplayType.DISABLED
        });
        var endDate = sublist.addField({
            id: 'custpage_pred_end_date',
            type: serverWidget.FieldType.DATE,
            label: 'End Date',
        });
        endDate.updateDisplayType({
            displayType : serverWidget.FieldDisplayType.DISABLED
        });
        var parentTaskId = sublist.addField({
            id: 'custpage_pred_parent_task_id',
            type: serverWidget.FieldType.INTEGER,
            label: 'Parent Task ID',
        });
        parentTaskId.updateDisplayType({
            displayType : serverWidget.FieldDisplayType.HIDDEN
        });
        var predecessorTasks = getPredecessorTasks(projectActionId);
        if (predecessorTasks.length > 0) {
            for (var i = 0; i < predecessorTasks.length; i++) {
                var lineObj = predecessorTasks[i];
                setPredecessorTaskSublistValues(sublist, i, lineObj);
            }
        }


    }


    function getPredecessorTasks(projectActionId) {
        var predecessorArray = [];
        if (projectActionId) {
            var projecttaskSearchObj = search.create({
                type: "projecttask",
                filters:
                [
                    ["custevent_bb_ss_project_action_list","anyof", projectActionId]
                ],
                columns:
                [
                    search.createColumn({name: "internalid", label: "Parent Project Task Internal ID"}),
                    search.createColumn({
                        name: "internalid",
                        join: "predecessor",
                        label: "Predecessor Task Internal ID"
                    }),
                    search.createColumn({
                        name: "title",
                        join: "predecessor",
                        label: "Task Name"
                    }),
                    search.createColumn({
                        name: "startdate",
                        join: "predecessor",
                        label: "Start Date"
                    }),
                    search.createColumn({
                        name: "enddate",
                        join: "predecessor",
                        label: "End Date"
                    }),
                    search.createColumn({
                        name: "successortype",
                        join: "predecessor",
                        label: "Successor Type"
                    }),
                    search.createColumn({name: "predecessorlagdays", label: "Predecessor Lag Days"})
                ]
            });
            var searchResultCount = projecttaskSearchObj.runPaged().count;
            log.debug("projecttaskSearchObj result count",searchResultCount);
            projecttaskSearchObj.run().each(function(result){
                var type = '';
                if (result.getValue({name: 'successortype', join: 'predecessor'}) == 'Finish-To-Start (FS)') {
                    type = 'FS';
                } else if (result.getValue({name: 'successortype', join: 'predecessor'}) == 'Start-To-Start (SS)') {
                    type = 'SS';
                } else if (result.getValue({name: 'successortype', join: 'predecessor'}) == 'Finish-To-Finish (FF)') {
                    type = 'FF'
                } else if (result.getValue({name: 'successortype', join: 'predecessor'}) == 'Start-to-Finish (SF)') {
                    type = 'SF'
                }
                predecessorArray.push({
                    parentTaskId: result.getValue({name: 'internalid'}),
                    predecessorTaskId: result.getValue({name: 'internalid', join: 'predecessor'}),
                    predecessorTaskText: result.getValue({name: 'title', join: 'predecessor'}),
                    startDate: result.getValue({name: 'startdate', join: 'predecessor'}),
                    type: type,
                    endDate: result.getValue({name: 'enddate', join: 'predecessor'}),
                    lagDays: result.getValue({name: 'predecessorlagdays'})
                })
                return true;
            });
        }
        return predecessorArray;
    }


    function setPredecessorTaskSublistValues(sublist, line, lineObj) {
        log.debug('list value object', lineObj);
        if (lineObj.predecessorTaskId) {
            sublist.setSublistValue({
                id: 'custpage_pred_task_id',
                line: line,
                value: lineObj.predecessorTaskId
            });
        }

        if (lineObj.type) {
            sublist.setSublistValue({
                id: 'custpage_pred_type',
                line: line,
                value: lineObj.type
            });
        }
        if (lineObj.startDate) {
            sublist.setSublistValue({
                id: 'custpage_pred_start_date',
                line: line,
                value: lineObj.startDate
            });
        }
        if (lineObj.endDate) {
            sublist.setSublistValue({
                id: 'custpage_pred_end_date',
                line: line,
                value: lineObj.endDate
            });
        }
        if (lineObj.parentTaskId) {
            sublist.setSublistValue({
                id: 'custpage_pred_parent_task_id',
                line: line,
                value: lineObj.parentTaskId
            });
        }
        if (lineObj.lagDays) {
            sublist.setSublistValue({
                id: 'custpage_pred_lagdays',
                line: line,
                value: lineObj.lagDays
            });
        }
    }


    function getProjectTaskValues(fieldObj, projectId) {

        if (projectId) {
            var customrecord_bb_packageSearchObj = search.create({
                type: "projecttask",
                filters:
                [
                    ["company","anyof", projectId]
                ],
                columns:
                [
                    "internalid",
                    search.createColumn({name: "title", label: "Parent Project Task Internal ID", sort: search.Sort.ASC})
                ]
            });
            customrecord_bb_packageSearchObj.run().each(function(result){
                var textValue;
                var id = result.getValue({name: 'internalid'});
                var text = result.getValue({name: 'title'});
                if (text.indexOf(':')) {
                    textValue = text.split(':').pop();
                } else {
                    textValue = result.getValue({name: 'title'});
                }
                if (fieldObj) {
                    fieldObj.addSelectOption({
                        value: id,
                        text: textValue
                    });
                }
                return true;
            });
            if (fieldObj) {
                return fieldObj;
            }
        }

    }

    return {
        projectActionTractionScheduleSublist: projectActionTractionScheduleSublist,
        predecessorSublist: predecessorSublist
    }
});