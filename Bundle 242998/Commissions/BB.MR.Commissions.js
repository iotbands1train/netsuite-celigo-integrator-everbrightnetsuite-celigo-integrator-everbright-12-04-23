/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/search','N/record','N/plugin','N/runtime','./BB.MD.Commission2.0.Lib'],
(nSearch, nRecord, nPlugin, nRuntime, util) => {
    let mapping;

    const getPayrollPeriod = () => {
        const script = nRuntime.getCurrentScript();
        const payrollPeriodId = script.getParameter('custscript_bb_mr_cm_payroll');

        return nRecord.load({
            type: 'customrecord_bb_payroll_period',
            id: payrollPeriodId,
            isDynamic: true
        });
    }

    const getSnapshots = (scriptType) => {
        let payrollPeriod = getPayrollPeriod();
        let results = [];
        let count = payrollPeriod.getLineCount('recmachcustrecord_bb_comm_proc_pay_period')

        for (let i = 0; i < count; i++) {
            let type = payrollPeriod.getSublistValue({
                sublistId: 'recmachcustrecord_bb_comm_proc_pay_period',
                fieldId: 'custrecord_bb_comm_proc_type',
                line: i
            });

            if (type == scriptType) {
                results.push({
                    id: payrollPeriod.getSublistValue({
                      sublistId: 'recmachcustrecord_bb_comm_proc_pay_period',
                      fieldId: 'id',
                      line: i
                    }),
                    snapshotId: payrollPeriod.getSublistValue({
                      sublistId: 'recmachcustrecord_bb_comm_proc_pay_period',
                      fieldId: 'custrecord_bb_comm_proc_snapid',
                      line: i
                    })
                });
            }
        }

        return results;
    }

    const getInputData = () => {
        const script = nRuntime.getCurrentScript();
        const type = script.getParameter('custscript_bb_mr_cm_type');
        log.debug('getInputData type', type);
        const results = getSnapshots(type);

        log.debug('getInputData results', results);

        return results;
    }

    const map = (context) => {
        const script = nRuntime.getCurrentScript();
        const type = script.getParameter('custscript_bb_mr_cm_type');
        log.debug('map type', type);

        if (type === 'create' || type === 'clawback') {
          handleCreate(context, type);
        } else if (type === 'pay' || type === 'clawbackpay') {
          handlePay(context, type);
        } else if (type === 'edit') {
          handleEdit(context);
        } else if (type === 'delete') {
          handleDelete(context);
        }
    }

    const summarize = (summary) => {
        if (summary.inputSummary.error) {
          log.debug('Input Error: ', summary.inputSummary.error);
        }

        summary.mapSummary.errors.iterator().each(function (key, error)
        {
          log.debug('error', error);

          return true;
        });

        summary.output.iterator().each(function (key, value)
        {
          return true;
        });

        log.debug('SCRIPT END', '------------------------------');
    }

    const getMapping = () => {
        if (!this.mapping) {
          let search = nSearch.create({
              type: 'customrecord_bbss_comm_snapshot_mapping',
              columns: [
                'name',
                'custrecord_bbss_comm_snapshot_field',
                'custrecord_bbss_comm_rec_field_id',
                'custrecord_bbs_comm_dataset_field',
                'custrecord_bbss_is_amount',
                'custrecord_bbss_group_key',
                'custrecord_bbss_is_integer'
              ],
              filters: [
                ['isinactive', 'is', 'F'],
                'and',
                ['custrecord_bbss_comm_snapshot_field', 'isnot', ''],
                'and',
                ['custrecord_bbss_comm_rec_field_id', 'isnot', '']
              ]
          });
          this.mapping = [];

          search.run().each((res) => {
              this.mapping.push({
                snapshotField: res.getValue('custrecord_bbss_comm_snapshot_field'),
                processorField: res.getValue('custrecord_bbss_comm_rec_field_id')
              });

              return true;
          });
        }

        return this.mapping;
    }

    const getValues = (processor) => {
      let fields = getMapping();
      let values = {};

      fields.forEach((field) => {
          values[field['snapshotField']] = processor.getValue(field['processorField']);
      });

      return values;
    }

    const loadProcessor = (id) => {
      return nRecord.load({
          type: 'customrecord_bb_comm_snapshot_processor',
          id: id
      });
    }

    const getSnapshot = (id) => {
      if (id) {
          return nRecord.load({
              type: 'customrecord_bbss_comm_snapshot_v2',
              id: id
          });
      }

      return nRecord.create({
          type: 'customrecord_bbss_comm_snapshot_v2'
      });
    }

    const handleDelete = (context) => {
        let val = JSON.parse(context.value);
        let processor = loadProcessor(val.id);
        let snapshot = getSnapshot(val.snapshotId);
        let rule = getRule(snapshot.getValue('custrecord_bbss_comm_rule'));

        rule.setValue('custrecord_bb_comm_payment_snapshot');
        rule.save();

        nRecord.delete({
            type: 'customrecord_bbss_comm_snapshot_v2',
            id: val.snapshotId
        });

        processor.setValue('custrecord_bb_comm_proc_pay_period', null);
        processor.save();
    }

    const handleEdit = (context) => {
        let val = JSON.parse(context.value);
        let processor = loadProcessor(val.id);
        let values = getValues(processor);
        let snapshot = getSnapshot(val.snapshotId);

        Object.keys(values).forEach((key) => {
            if (values[key]) {
              snapshot.setValue(key, values[key]);
            }
        });

        snapshot.save();

        processor.setValue('custrecord_bb_comm_proc_pay_period', null);
        processor.save();
    }

    const handleCreate = (context, type) => {
        let val = JSON.parse(context.value);
        log.debug('handleCreate val', val);
        let processor = loadProcessor(val.id);
        log.debug('handleCreate processor', processor);
        let values = getValues(processor);
        log.debug('handleCreate values', values);
        let snapshot = getSnapshot();
        log.debug('handleCreate snapshot', snapshot);
        let rule = getRule(processor.getValue('custrecord_bb_comm_proc_ruleid'));
        log.debug('handleCreate rule', rule);
        let salesrep = rule?.getValue('custrecord_bb_comm_payment_payee');
        log.debug('handleCreate salesrep', salesrep);

        //log.debug('values', values);

        // load snapshot proc record and fill in the blanks
        Object.keys(values).forEach((key) => {
            snapshot.setValue(key, values[key]);
        });

        if (salesrep)
            snapshot.setValue('custrecord_bbss_comm_snapshot_payee', salesrep);

        if (type === 'create') {
            let snapshotId = snapshot.save();

            rule.setValue('custrecord_bb_comm_payment_snapshot', snapshotId);
            rule.save();
        } else {
            snapshot.setValue('custrecord_bbss_comm_clawback', true);
            let snapshotId = snapshot.save();
            log.debug('handleCreate snapshotId', snapshotId);
            createTransaction(snapshot, snapshotId, processor, true);
        }

        processor.setValue('custrecord_bb_comm_proc_pay_period', null);
        const processorId = processor.save();
        log.debug('handleCreate processorId', processorId);

        return snapshot;
    }

    const createJournal = (accounts, projectId, subsidiary, snapshot, snapshotId) => {
        let amount = snapshot.getValue('custrecord_bbss_comm_snapshot_owed_amt');
        log.debug('createJournal amount', amount);
        let trandate = nRuntime.getCurrentScript().getParameter('custscript_bb_mr_cm_date');
        log.debug('createJournal trandate', trandate + ' '+ typeof trandate);
        let je = nRecord.create({
            type: 'journalentry',
            isDynamic: true
        });

        je.setValue('custbody_bb_tran_comm_snap', snapshotId);

        je.setValue('subsidiary', subsidiary);
        je.setValue('custbody_bb_project', projectId);
        if(trandate)
            je.setValue('trandate', util.stringToDate(trandate));

        log.debug('createJournal', 'Plugin goes next');

        let implementations = nPlugin.findImplementations({
            type: 'customscript_bb_ss_createje'
        });
        let plugin = null;

        if (implementations.length > 0) {
            plugin = nPlugin.loadImplementation({
                type: 'customscript_bb_ss_createje',
                implementation: implementations[0]
            });
        }

        if (plugin) {
            je = plugin.setCustomBodyFields(je);
        }
        const entity = snapshot.getValue('custrecord_bbss_comm_snapshot_payee');
        addJournalLine(je, plugin, accounts.credit, amount, entity, true);
        addJournalLine(je, plugin, accounts.debit, amount, entity);

        let transactionId = je.save({
            ignoremandatoryfields: true
        });

        /*snapshot.setValue('custrecord_bbss_comm_snapshot_payment', transactionId);

        snapshot.setValue('custrecord_bbss_comm_snapshot_paid_amt', amount);

        const snapshotIdSaved = snapshot.save();*/

        let snapshotUpdates = {};
        snapshotUpdates['custrecord_bbss_comm_snapshot_payment'] = transactionId;
        snapshotUpdates['custrecord_bbss_comm_snapshot_paid_amt'] = amount;

        const snapshotIdSaved = nRecord.submitFields({
            type: 'customrecord_bbss_comm_snapshot_v2',
            id: snapshotId,
            values: snapshotUpdates
        });
        
        log.debug('createJournal snapshotIdSaved', snapshotIdSaved)
    }

    const createBill = (transactionType, projectId, subsidiary, snapshot, snapshotId, item) => {
        let amount = snapshot.getValue('custrecord_bbss_comm_snapshot_owed_amt');
        let trandate = nRuntime.getCurrentScript().getParameter('custscript_bb_mr_cm_date');

        let record = nRecord.create({
            type: transactionType,
            isDynamic: true,
            defaultValues: {
                entity: snapshot.getValue('custrecord_bbss_comm_snapshot_payee')
            }
        });

        record.setValue('subsidiary', subsidiary);
        if(trandate)
            record.setValue('trandate', util.stringToDate(trandate));

        record.setValue('custbody_bb_project', projectId);
        record.setValue('custbody_bb_tran_comm_snap', snapshotId);

        let location = getLocation(projectId);
        if (location) {
          record.setValue('location', location);
        }

        let implementations = nPlugin.findImplementations({
            type: 'customscript_bb_ss_createje'
        });
        let plugin = null;

        if (implementations.length > 0) {
            plugin = nPlugin.loadImplementation({
                type: 'customscript_bb_ss_createje',
                implementation: implementations[0]
            });
        }

        if (plugin) {
            record = plugin.setCustomBodyFields(record);
        }

        addBillLine(record, plugin, Math.abs(parseFloat(amount)), projectId, item);

        let transactionId = record.save({
            ignoremandatoryfields: true
        });

        //Below code is creating a duplicated snapshot record, record submitfield is the correct approach
        /*snapshot.setValue('custrecord_bbss_comm_snapshot_payment', transactionId);

        snapshot.setValue('custrecord_bbss_comm_snapshot_paid_amt', amount);

        const snapshotIdSaved = snapshot.save();*/
        let snapshotUpdates = {};
        snapshotUpdates['custrecord_bbss_comm_snapshot_payment'] = transactionId;
        snapshotUpdates['custrecord_bbss_comm_snapshot_paid_amt'] = amount;

        const snapshotIdSaved = nRecord.submitFields({
            type: 'customrecord_bbss_comm_snapshot_v2',
            id: snapshotId,
            values: snapshotUpdates
        });
        log.debug('createBill snapshotIdSaved', snapshotIdSaved)
    }

    const getLocation = (projectId) => {
        let fields = nSearch.lookupFields({
            type: 'job',
            id: projectId,
            columns: ['custentity_bb_project_location']
        });

        let location = fields.custentity_bb_project_location[0].value;

        return location;
    }

    const createTransaction = (snapshot, snapshotId, processor, isClawback) => {

        let projectId = snapshot.getValue('custrecord_bbss_comm_snapshot_proj');
        let subsidiary = getSubsidiary(projectId);
        let rule = getRule(snapshot.getValue('custrecord_bbss_comm_rule'));
        let paymentType = rule.getText('custrecord_bb_comm_payment_pay_method');

        let paymentRule = util.getPaymentRule(snapshotId, projectId);
        log.debug('createTransaction paymentRule', paymentRule);

        log.debug('createTransaction paymentType', paymentType);
        if (/journal/gi.test(paymentType)) {
            let accounts = getAccounts(paymentRule);
            log.debug('accounts', accounts);
            createJournal(accounts, projectId, subsidiary, snapshot, snapshotId);
        } else if (/bill/gi.test(paymentType)) {
            let item = getPaymentItem(paymentRule);
            log.debug('createTransaction item', item);
            let transactionType = 'vendorbill'
            log.debug('createTransaction isClawback', isClawback);
            if(isClawback === true){
                transactionType = 'vendorcredit';
            }

            createBill(transactionType, projectId, subsidiary, snapshot, snapshotId, item);
        }

        if (!isClawback) {
            processor.setValue('custrecord_bb_comm_proc_pay_period', null);
            const processorId = processor.save();
            log.debug('createTransaction processorId', processorId);
        }

        let paidAmount = getPaidAmount(projectId);

        let values = {
            custentity_bb_paid_comm_amount: paidAmount
        };

        if (!isClawback) {
            values['custentity_bb_current_sequence'] = getCurrentSequence(projectId);
        }

        nRecord.submitFields({
            type: 'job',
            id: projectId,
            values: values
        });
    }

    const addBillLine = (transaction, plugin, amount, projectId, item) => {
        transaction.selectNewLine('item');

        transaction.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            value: item // Project Item
        });

        transaction.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            value: 1
        });

        transaction.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            value: amount
        });

        if (plugin) {
          transaction = plugin.setCustomLineFields(transaction, 'bill');
        }

        transaction.commitLine('item');
    }

    const addJournalLine = (transaction, plugin, account, amount, entity, isCredit) => {
        transaction.selectNewLine('line');

        transaction.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: 'account',
            value: account
        });

        if (isCredit) {
            transaction.setCurrentSublistValue({
                sublistId: 'line',
                fieldId: 'credit',
                value: amount
            });
        } else {
            transaction.setCurrentSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                value: amount
            });
        }

        transaction.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: 'entity',
            value: entity
        });

        if (plugin) {
            transaction = plugin.setCustomLineFields(transaction);
        }

        transaction.commitLine('line');
    }

    const getCurrentSequence = (projectId) => {
        let seq;
        let columns = [
          nSearch.createColumn({
              name: 'custrecord_bb_comm_payment_seq_num',
              summary: 'GROUP',
              label: 'Sequence Number',
              sort: nSearch.Sort.ASC
          }),
          nSearch.createColumn({
              name: 'formulanumeric',
              summary: 'SUM',
              formula: '1',
              label: 'Formula (Numeric)'
          }),
          nSearch.createColumn({
              name: 'formulanumeric',
              summary: 'SUM',
              formula: 'CASE WHEN {custrecord_bb_comm_payment_snapshot.custrecord_bbss_comm_snapshot_payment.id} IS NULL THEN 0 ELSE 1 END',
              label: 'Formula (Numeric)'
          })
        ];
        let search = nSearch.create({
            type: 'customrecord_bb_comm_payment_rule',
            filters: [
              ['isinactive', 'is', 'F'],
              'and',
              ['custrecord_bb_comm_payment_project', 'is', projectId]
            ],
            columns: columns
        });

        search.run().each((res) => {
            let sequence = res.getValue(columns[0]);
            let total = res.getValue(columns[1]);
            let paid = res.getValue(columns[2]);

            if (total === paid) {
                seq = sequence;
                return true;
            }
        });

        return seq;
    }

    const handlePay = (context, type) => {
        let val = JSON.parse(context.value);
        let snapshot = getSnapshot(val.snapshotId);
        let processor = loadProcessor(val.id);

        createTransaction(snapshot, val.snapshotId, processor, type === 'clawback');
    }


    const getPaymentItem = (paymentRule) => {
        let item = null;

        if(!util.isEmpty(paymentRule)){
            item = paymentRule.getValue('custrecord_bb_comm_payment_rule_item');
        }
        if(util.isEmpty(item)){
            let arrItem = nSearch.lookupFields({
              type: 'customrecord_bb_solar_success_configurtn',
              id: 1,
              columns: ['custrecord_bb_comm_payment_item']
            });
            item = arrItem.custrecord_bb_comm_payment_item[0].value;
        }

        return item;
    }

    const getAccounts = (paymentRule) => {
        let accountCredit = null;
        let accountDebit = null;
        if(!util.isEmpty(paymentRule)){
            accountCredit = paymentRule.getValue('custrecord_bb_comm_payment_credit_acct');
            accountDebit = paymentRule.getValue('custrecord_bb_comm_payment_debit_acct');
        }
        if(util.isEmpty(accountCredit) || util.isEmpty(accountDebit)){
            let accounts = nSearch.lookupFields({
                type: 'customrecord_bb_solar_success_configurtn',
                id: 1,
                columns: ['custrecord_bb_comm_payable_account', 'custrecord_bb_comm_expense_account']
            });
            accountCredit = accounts.custrecord_bb_comm_payable_account[0].value;
            accountDebit = accounts.custrecord_bb_comm_expense_account[0].value;
        }

        return {
            credit: accountCredit,
            debit: accountDebit
        }
    }

    const getSubsidiary = (jobId) => {
        var lookup = nSearch.lookupFields({
            type: 'job',
            id: jobId,
            columns: ['subsidiary']
        });

        return lookup.subsidiary[0].value;
    }

    const getPaidAmount = (projectId) => {
        let columns = [
            nSearch.createColumn({
                name: 'custrecord_bbss_comm_snapshot_paid_amt',
                summary: 'SUM'
            })
        ];
        let search = nSearch.create({
            type: 'customrecord_bbss_comm_snapshot_v2',
            filters: [
              ['isinactive', 'is', 'F'],
              'and',
              ['custrecord_bbss_comm_snapshot_proj', 'anyof', projectId]
            ],
            columns: columns
        });
        let amount;

        search.run().each((res) => {
            amount = res.getValue(columns[0]) || 0;
        });

        return amount;
    }

    const getRule = (id) => {
        return nRecord.load({
          type: 'customrecord_bb_comm_payment_rule',
          id: id
        })
    }

  return {
    getInputData: getInputData,
    map: map,
    summarize: summarize
  }
});