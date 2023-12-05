/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Configuration', './ApiClient', './../model/TabMetadata', './../model/TabMetadataList'],
    function(configurationModule, apiClientModule, tabMetadataModel, tabMetadataListModel) {
    /**
     * CustomTabs service.
     * @module api/CustomTabsApi
     * @version 0.0.1
     */

    /**
     * Constructs a new CustomTabsApi.
     * @alias module:api/CustomTabsApi
     * @class
     * @param {module:ApiClient} apiClient Optional API client implementation to use,
     * default to {@link module:ApiClient#instance} if unspecified.
     */
    var _exports = function() {
        this.apiClient = configurationModule.default.getDefaultApiClient() || apiClientModule.instance;

        this.setApiClient = function(apiClient) {
            this.apiClient = apiClient;
        };

        this.getApiClient = function() {
            return this.apiClient;
        };

        /**
         * Deletes custom tab information.
         * Deletes the custom from the specified account.
         * @param {String} customTabId
         */
        this._delete = function(customTabId) {
            var postBody = null;

            // verify the required parameter 'customTabId' is set
            if (typeof customTabId === 'undefined' || customTabId == null) {
                throw new Error("Missing the required parameter 'customTabId' when calling _delete");
            }

            var pathParams = {
                'customTabId': customTabId
            };
            var queryParams = {
            };
            var headerParams = {
            };
            var formParams = {
            };

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = null;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/tab_definitions/{customTabId}', 'DELETE',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Creates a custom tab.
         * Creates a tab with pre-defined properties, such as a text tab with a certain font type and validation pattern. Users can access the custom tabs when sending documents through the DocuSign web application.

         Custom tabs can be created for approve, checkbox, company, date, date signed, decline, email, email address, envelope ID, first name, formula, full name, initial here, last name, list, note, number, radio, sign here, signer attachment, SSN, text, title, and zip tabs.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {module:model/TabMetadata} opts.tabMetadata
         */
        this.create = function(opts) {
            var postBody = opts['tabMetadata'];

            var pathParams = {};
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = tabMetadataModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/tab_definitions', 'POST',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Gets custom tab information.
         * Retrieves information about the requested custom tab on the specified account.
         * @param {String} customTabId
         */
        this.get = function(customTabId) {
            var postBody = null;

            // verify the required parameter 'customTabId' is set
            if (typeof customTabId === 'undefined' || customTabId == null) {
                throw new Error("Missing the required parameter 'customTabId' when calling get");
            }

            var pathParams = {
                'customTabId': customTabId
            };
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = tabMetadataModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/tab_definitions/{customTabId}', 'GET',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Gets a list of all account tabs.
         * Retrieves a list of all tabs associated with the account.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {Boolean} opts.customTabOnly
         */
        this.list = function(opts) {
            var postBody = null;
            opts = typeof opts !== 'undefined' ? opts : {};
            var queryParams = {
                'custom_tab_only': opts['customTabOnly']
            };
            var pathParams = {};
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = tabMetadataListModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/tab_definitions', 'GET',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType);
        };

        /**
         * Updates custom tab information.
         * Updates the information in a custom tab for the specified account.
         * @param {String} customTabId
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {module:model/TabMetadata} opts.tabMetadata
         */
        this.update = function(customTabId, opts) {
            opts = typeof opts !== 'undefined' ? opts : {};
            var postBody = opts['tabMetadata'];

            // verify the required parameter 'customTabId' is set
            if (typeof customTabId === 'undefined' || customTabId == null) {
                throw new Error("Missing the required parameter 'customTabId' when calling update");
            }

            var pathParams = {
                'customTabId': customTabId
            };
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = tabMetadataModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/tab_definitions/{customTabId}', 'PUT',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };
    };

    return _exports;
});