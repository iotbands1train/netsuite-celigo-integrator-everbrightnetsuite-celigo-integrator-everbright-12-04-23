/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 * @version 0.0.1
 * @author Michael Golichenko
 **/

define(['./../DocuSign'],
    function(docuSignModule) {

      var _exports = {};

      function onRequest(context){
        var _envelopeId = context.request.parameters.envelopeId;
        log.debug('_envelopeId', _envelopeId);
        var _response = ['Could not load console view for envelope: ', _envelopeId, '.'].join('');
        if(context.request.method === 'GET' && typeof _envelopeId === 'string' && _envelopeId.trim().length > 0) {
          var _envelopesApi = new docuSignModule.EnvelopesApi();
          var _consoleViewRequest = new docuSignModule.ConsoleViewRequest();
          _consoleViewRequest.envelopeId = _envelopeId;
          _envelopesApi.apiClient.addAuthentication(new docuSignModule.OAuth()).setupFromRecord().authenticate();
          log.debug('_consoleViewRequest', _consoleViewRequest);
          var _result = _envelopesApi.createConsoleView({consoleViewRequest: _consoleViewRequest});
          if (typeof _result.url === 'string' && _result.url.trim().length > 0) {
            _response = ['<html><script type="text/javascript">window.location = "', _result.url, '";</script></html>'].join('');
            //_response = ['<html>', _result.url, '</html>'].join('');
          }
        }
        context.response.write(_response);
      }


      _exports.onRequest = onRequest;
      return _exports;

    });