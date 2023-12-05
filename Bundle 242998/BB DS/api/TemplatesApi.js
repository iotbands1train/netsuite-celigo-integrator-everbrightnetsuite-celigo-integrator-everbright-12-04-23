/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Configuration', './ApiClient', './../model/ViewUrl'],
    function(configurationModule, apiClientModule, viewUrlModel) {
        /**
         * TemplateViews service.
         * @module api/TemplatesApi
         * @version 0.0.1
         */

        var _exports = function(){
            this.apiClient = configurationModule.default.getDefaultApiClient() || apiClientModule.instance;

            this.setApiClient = function(apiClient) {
                this.apiClient = apiClient;
            };

            this.getApiClient = function() {
                return this.apiClient;
            };

            this.createEditView = function(templateId, opts){
                var _postBody = typeof opts !== 'undefined' && typeof opts['returnUrlRequest'] !== 'undefined' ? opts['returnUrlRequest'] : {};

                var _pathParams = {
                    'templateId': templateId
                };
                var _queryParams = {};
                var _headerParams = {};
                var _formParams = {};

                var _contentTypes = [];
                var _accepts = ['application/json'];
                var _returnType = viewUrlModel;

                return this.apiClient.callApi(
                    '/v2/accounts/{accountId}/templates/{templateId}/views/edit', 'POST',
                    _pathParams, _queryParams, _headerParams, _formParams, _postBody,
                    _contentTypes, _accepts, _returnType
                );
            }
        };

        return  _exports;

    });