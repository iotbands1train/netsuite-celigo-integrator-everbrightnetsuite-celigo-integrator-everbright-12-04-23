/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Michael Golichenko
 * @version 0.0.1
 */

define(['N/ui/message', 'N/https', 'N/url'], function (uiMessageModule, httpsModule, urlModule) {

  function pageInit(){}
  function createUrl(scriptId, deploymentId, params){
    var _scriptUrl = urlModule.resolveScript({
      scriptId: scriptId,
      deploymentId: deploymentId,
      returnExternalUrl: false,
      params: params
    });
    if(typeof _scriptUrl === 'string' && _scriptUrl.trim().length > 0){
      console.log(_scriptUrl);
      window.open(_scriptUrl, '_blank');
    }
  }

  function openTemplateEditView(templateId){
    createUrl('customscript_bb_ds_sl_template_edit_view', 'customdeploy_bb_ds_sl_template_edit_view', {'templateId':templateId});
  }

  function openConsoleView(envelopeId){
    createUrl('customscript_bb_ds_sl_console_view', 'customdeploy_bb_ds_sl_console_view', {'envelopeId':envelopeId});
  }

  function sendEnvelopeFromProjectAction(projectActionId) {
    if (isNaN(projectActionId)) {
      log.error('ERROR: sendEnvelopeFromProjectAction()', {projectActionId: projectActionId});
      var _errorMessage = uiMessageModule.create({
        type: uiMessageModule.Type.ERROR,
        title: 'Could not send DocuSign documents',
        message: 'Please contact your administrator to fix following issue.',
        duration: 20000
      });
      _errorMessage.show();
      return;
    }
    var _buttonHolderId = ['#tbl_custpage_send_envelope_pa', projectActionId].join('_');
    var _secondaryButtonHolderId = ['#tbl_secondarycustpage_send_envelope_pa', projectActionId].join('_');
    jQuery(_buttonHolderId).hide();
    jQuery(_secondaryButtonHolderId).hide();
    var _infoMessage = uiMessageModule.create({
      type: uiMessageModule.Type.INFORMATION,
      title: 'Documents being prepared and send',
      message: 'Documents being prepared and send, you do not have to wait for result and can continue working on your project. We will notify you when processing is completed.',
      duration: 20000
    });
    _infoMessage.show();
    var _scriptUrl = urlModule.resolveScript({
      scriptId: 'customscript_bb_ds_sl_action',
      deploymentId: 'customdeploy_bb_ds_sl_action',
      returnExternalUrl: false,
      params: {
        'action': 'sendEnvelopeFromProjectAction',
        'projectActionId': projectActionId,
        '_': (new Date()).getTime()
      }
    });
    httpsModule.post.promise({url: _scriptUrl})
      .then(function (response) {
        var _result = [];
        if (response.code !== 200) {
          log.error('ERROR: sendEnvelopeFromProjectAction()', response);
          _result.push('Please contact your administrator to fix following issue.');
        } else {
          try {
            _result = JSON.parse(response.body);
            if (_result.status && _result.status === 'ERROR') {
              _result = [];
              log.error('ERROR: sendEnvelopeFromProjectAction()', response);
              _result.push('Please contact your administrator to fix following issue.');
            }
          } catch (ex) {
            log.error('ERROR: sendEnvelopeFromProjectAction()', response);
            _result.push('Please contact your administrator to fix following issue.');
          }
        }
        _infoMessage.hide();
        if (_result instanceof Array && _result.length > 0) {
          var _errorExecMessage = uiMessageModule.create({
            type: uiMessageModule.Type.ERROR,
            title: 'Could not send DocuSign documents',
            message: _result.join('<br />'),
            duration: 20000
          });
          _errorExecMessage.show();
          log.error('ERROR: sendEnvelopeFromProjectAction()', _result);
          return;
        }
        var _successMessage = uiMessageModule.create({
          type: uiMessageModule.Type.CONFIRMATION,
          title: 'Documents are sent.',
          duration: 20000
        });
        _successMessage.show();
      })
      .catch(function(reason){
        var _errorMessage = uiMessageModule.create({
          type: uiMessageModule.Type.ERROR,
          title: 'Could not send DocuSign documents',
          message: 'Please contact your administrator to fix following issue.',
          duration: 20000
        });
        _errorMessage.show();
        log.error('ERROR: sendEnvelopeFromProjectAction()', reason);
      });

  }

  return {
    pageInit: pageInit,
    openTemplateEditView: openTemplateEditView,
    openConsoleView: openConsoleView,
    sendEnvelopeFromProjectAction: sendEnvelopeFromProjectAction
  }
});