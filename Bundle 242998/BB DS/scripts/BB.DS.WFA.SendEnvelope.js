/**
 *@NApiVersion 2.x
 *@NScriptType WorkflowActionScript
 *@NModuleScope Public
 *@author Michael Golichenko
 */

define(['N/runtime', './BB.DS.Envelope.Service'],
  function(runtimeModule, envelopeService) {

    function onAction(scriptContext) {

      var
        _currentScript = runtimeModule.getCurrentScript()
        , _record = scriptContext.newRecord || scriptContext.oldRecord
        , _templateId = _currentScript.getParameter({name: 'custscript_bb_ds_wfa_template_id'})
        // , _emailTo = _currentScript.getParameter({name: 'custscript_bb_ds_wfa_email_to'})
        // , _nameTo = _currentScript.getParameter({name: 'custscript_bb_ds_wfa_name_to'})
        , _envelopeIdField = _currentScript.getParameter({name: 'custscript_bb_ds_wfa_envelope_id_field'})
        , _statusField = _currentScript.getParameter({name: 'custscript_bb_ds_wfa_status_field'})
        , _recipients = []
        , _idx = 1
        , _error = false
        , _lastValidIndex = 1
      ;

      do {
        // log.debug('custscript_bb_ds_wfa_name_to_' + _idx, _currentScript.getParameter({name: 'custscript_bb_ds_wfa_name_to_' + _idx}))
        // log.debug('custscript_bb_ds_wfa_email_to_' + _idx, _currentScript.getParameter({name: 'custscript_bb_ds_wfa_email_to_' + _idx}))
        // log.debug('custscript_bb_ds_wfa_role_' + _idx, _currentScript.getParameter({name: 'custscript_bb_ds_wfa_role_' + _idx}))
        var _recipient = {
          name: _currentScript.getParameter({name: 'custscript_bb_ds_wfa_name_to_' + _idx})
          , email: _currentScript.getParameter({name: 'custscript_bb_ds_wfa_email_to_' + _idx})
          , role: _currentScript.getParameter({name: 'custscript_bb_ds_wfa_role_' + _idx})
        };
        if((_recipient.name && _recipient.email && _recipient.role) || _recipient.role) {
          _recipients.push(_recipient);
          _lastValidIndex = _idx;
        }
        _idx++;
      } while(!_error && _idx < 100 && _idx - _lastValidIndex < 10)

      _recipients = _recipients.filter(function(r){
        return (r.name && r.email && r.role) || r.role;
      })


      log.debug('wfa data', {
        record: _record.type.toLowerCase()
        , id: _record.id
        , templateId: _templateId
        , recipients: _recipients
        , envelopeIdField: _envelopeIdField
        , statusField: _statusField
      });

      return envelopeService.createEnvelopeFromRecord(_record.type.toLowerCase(), _record.id, _recipients, _templateId, _envelopeIdField, _statusField);
    }

    return { onAction: onAction };

  });