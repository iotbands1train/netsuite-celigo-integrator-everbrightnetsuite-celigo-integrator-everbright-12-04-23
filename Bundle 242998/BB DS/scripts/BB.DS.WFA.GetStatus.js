/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope Public
 * @author Michael Golichenko
 */
define(['N/runtime', './BB.DS.Envelope.Service'],
  function(runtimeModule, envelopeService) {
    /**
     * Defines the WorkflowAction script trigger point.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.workflowId - Internal ID of workflow which triggered this action
     * @param {string} scriptContext.type - Event type
     * @param {Form} scriptContext.form - Current form that the script uses to interact with the record
     * @since 2016.1
     */
    function onAction(scriptContext) {
      var
        _currentScript = runtimeModule.getCurrentScript()
        , _envelopeId = _currentScript.getParameter({name: 'custscript_bb_ds_wfa_envelope_id'})
        , _result = envelopeService.getEnvelopesStatus([_envelopeId])
      ;
      log.debug('_result[0].status', _result[0].status);
      return _result instanceof Array && _result[0] ? _result[0].status : '';
    }

    return { onAction: onAction };
  });
