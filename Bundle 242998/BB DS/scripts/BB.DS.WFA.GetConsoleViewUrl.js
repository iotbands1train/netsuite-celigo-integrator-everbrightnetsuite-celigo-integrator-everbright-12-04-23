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
        , _envelopeId = _currentScript.getParameter({name: 'custscript_bb_ds_wfa_gcvu_envelope_id'})
      ;
      return envelopeService.getConsoleView(_envelopeId);
    }

    return { onAction: onAction };
  });