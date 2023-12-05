/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Michael Golichenko
 * @version 0.0.1
 */

define(['N/ui/message', 'N/https', 'N/url'], function (uiMessageModule, httpsModule, urlModule) {

    function pageInit() {
    };

    function sendEnvelope(projectId, counterPartyId) {
        if (isNaN(projectId) || isNaN(counterPartyId)) {
            log.error('ERROR: sendEnvelope()', {projectId: projectId, counterPartyId: counterPartyId});
            var _errorMessage = uiMessageModule.create({
                type: uiMessageModule.Type.ERROR,
                title: 'Could not send DocuSign documents',
                message: 'Please contact your administrator to fix following issue.',
                duration: 20000
            });
            _errorMessage.show();
            return;
        }
        var _buttonHolderId = ['#tbl_custpage_send_envelope', projectId, counterPartyId].join('_');
        var _secondaryButtonHolderId = ['#tbl_secondarycustpage_send_envelope', projectId, counterPartyId].join('_');
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
                'action': 'sendEnvelope',
                'projectId': projectId,
                'counterPartyId': counterPartyId,
                '_': (new Date()).getTime()
            }
        });
        httpsModule.post.promise({url: _scriptUrl})
            .then(function (response) {
                var _result = [];
                if (response.code !== 200) {
                    log.error('ERROR: sendEnvelope()', response);
                    _result.push('Please contact your administrator to fix following issue.');
                } else {
                    try {
                        _result = JSON.parse(response.body);
                        if (_result.status && _result.status === 'ERROR') {
                            _result = [];
                            log.error('ERROR: sendEnvelope()', response);
                            _result.push('Please contact your administrator to fix following issue.');
                        }
                    } catch (ex) {
                        log.error('ERROR: sendEnvelope()', response);
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
                    log.error('ERROR: sendEnvelope()', _result);
                    return;
                }
                var _successMessage = uiMessageModule.create({
                    type: uiMessageModule.Type.CONFIRMATION,
                    title: 'Documents are sent to counter party.',
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
                log.error('ERROR: sendEnvelope()', reason);
            });

    }

    return {
        pageInit: pageInit,
        sendEnvelope: sendEnvelope
    }
});