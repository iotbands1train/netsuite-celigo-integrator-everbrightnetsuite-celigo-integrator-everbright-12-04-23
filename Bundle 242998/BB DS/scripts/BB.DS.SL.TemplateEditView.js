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
            var templateId = context.request.parameters.templateId;
            var _response = ['Could not load edit view for template: ', templateId, '.'].join('');
            if(context.request.method === 'GET' && typeof templateId === 'string' && templateId.trim().length > 0) {
                var _templatesApi = new docuSignModule.TemplatesApi();
                _templatesApi.apiClient.addAuthentication(new docuSignModule.OAuth()).setupFromRecord().authenticate();
                var _result = _templatesApi.createEditView(templateId);
                if (typeof _result.url === 'string' && _result.url.trim().length > 0) {
                    _response = ['<html><script type="text/javascript">window.location = "', _result.url, '";</script></html>'].join('');
                }
            }
            context.response.write(_response);
        }


        _exports.onRequest = onRequest;
        return _exports;

    });