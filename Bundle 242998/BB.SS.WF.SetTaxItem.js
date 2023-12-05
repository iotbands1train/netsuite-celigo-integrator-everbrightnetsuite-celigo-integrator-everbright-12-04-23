/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 * @NModuleScope public
 */

/**
 * Copyright 2020 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define([
  'N/runtime',
  'N/search'
], (
  nRuntime, 
  nSearch
) => {

    /**
     * Entry point
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {Record} context.oldRecord - Old record
     * @param {Record} context.form - Form (serverWidget.form)
     * @param {string} context.type - Trigger type
     * @param {integer} context.workflowId - Internal ID of the workflow that calls the script
     */
    const onAction = (context) => {
      try {
        let record = context.newRecord;
        let script = nRuntime.getCurrentScript();
        let taxFrom = script.getParameter('custscript_bbss_wf_tax_from');
        let taxFromVal = script.getParameter('custscript_bbss_wf_tax_from_val');
        let taxTo = script.getParameter('custscript_bbss_wf_tax_to');
        let taxRateTo = script.getParameter('custscript_bbss_wf_tax_rate_to');
        let value = '';

        log.debug('record', record);
        log.debug('taxFrom', taxFrom);
        log.debug('taxTo', taxTo);
        log.debug('value', value);
        log.debug('taxFromVal', taxFromVal);
        
        if (taxFromVal) {
          value = taxFromVal;
        } else if (taxFrom) {
          value = record.getValue(taxFrom);
        }

        value = (value) ? value.toUpperCase() : '';

        log.debug('value', value);

        if (value && taxTo) {
          let id;
          let rate;
          let search = nSearch.create({
            type: 'taxgroup',
            filters: [
              ['city', 'contains', value]
            ],
            columns: ['itemid', 'rate']
          });

          search.run().each((res) => {
            id = res.id;
            rate = res.getValue('rate');

            log.debug('found id', id);
          });

          if (id) {
            record.setValue(taxTo, id);

            if (taxRateTo && rate) {
              record.setValue(taxRateTo, rate.replace(/\%/ig, ''));
            }
          } else {
            log.debug('no id found');
          }
        }
      } catch (e) {
        log.error('ERROR', e);
      }
    }

    return {
      onAction:onAction
    }
  }
);