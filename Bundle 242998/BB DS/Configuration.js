/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./api/ApiClient'], function(apiClientModule) {
    /**
     * @module Configuration
     * @version 0.0.1
     */
    var _exports = function () {
        /**
         * The API client to use for every API call.
         */
        this.defaultApiClient = undefined;

        /**
         * The default HTTP headers to be included for all API calls.
         */
        // Add DocuSign Tracking Header
        this.defaultHeaders = { "X-DocuSign-SDK": "NS" };

    };

    /**
     * Get the default API client, which would be used when creating API
     * instances without providing an API client.
     */
    _exports.prototype.getDefaultApiClient = function getDefaultApiClient() {
        return this.defaultApiClient;
    };

    /**
     * Sets the default API client.
     */
    _exports.prototype.setDefaultApiClient = function setDefaultApiClient(defaultApiClient) {
        this.defaultApiClient = defaultApiClient;
    };

    /**
     * Creating default instance of Configuration
     * @type {_exports}
     */
    _exports.default = new _exports();

    return _exports;
});