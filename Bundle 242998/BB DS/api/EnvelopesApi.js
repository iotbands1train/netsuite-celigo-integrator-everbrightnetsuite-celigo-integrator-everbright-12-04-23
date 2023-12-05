/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Configuration', './ApiClient', './../model/DocumentTemplateList', './../model/EnvelopeSummary', './../model/EnvelopeUpdateSummary'
    , './../model/Tabs', './../model/Recipients', './../model/TemplateInformation', './../model/Envelope', './../model/EnvelopesInformation'
    , './../model/ViewUrl'],
    function(configurationModule, apiClientModule, documentTemplateListModel, envelopeSummaryModel, envelopeUpdateSummaryModel
    , tabsModel, recipientsModel, templateInformationModel, envelopeModel, envelopesInformationModel, viewUrlModel) {
        /**
         * Envelopes service.
         * @module api/EnvelopesApi
         * @version 0.0.1
         */

        var _exports = function(){
            this.apiClient = configurationModule.default.getDefaultApiClient() || apiClientModule.instance;
        };

        _exports.prototype.setApiClient = function(apiClient) {
            this.apiClient = apiClient;
        };

        _exports.prototype.getApiClient = function() {
            return this.apiClient;
        };

        /**
         * Adds templates to an envelope.
         * Adds templates to the specified envelope.
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {module:model/DocumentTemplateList} opts.documentTemplateList
         * @return {module:model/DocumentTemplateList}
         */
        _exports.prototype.applyTemplate = function(envelopeId, opts) {
            opts = opts || {};

            var postBody = opts['documentTemplateList'];

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling applyTemplate");
            }

            var pathParams = {
                'envelopeId': envelopeId
            };
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = documentTemplateListModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}/templates', 'POST',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {String} opts.cdseMode
         * @param {String} opts.changeRoutingOrder
         * @param {String} opts.completedDocumentsOnly If set to true then we want to set the sourceEnvelopeId to indicate that this is a\&quot;forward\&quot; envelope action
         * @param {String} opts.mergeRolesOnDraft When set to **true**, merges template roles and remove empty recipients when you create an envelope with multiple templates.
         * @param {String} opts.preserveTemplateRecipientids
         * @param {module:model/EnvelopeDefinition} opts.envelopeDefinition
         * @return {module:model/EnvelopeSummary}
         */
        _exports.prototype.createEnvelope = function(opts) {
            opts = opts || {};

            var postBody = opts['envelopeDefinition'];

            var pathParams = {};
            var queryParams = {
                'cdse_mode': opts['cdseMode'],
                'change_routing_order': opts['changeRoutingOrder'],
                'completed_documents_only': opts['completedDocumentsOnly'],
                'merge_roles_on_draft': opts['mergeRolesOnDraft'],
                'preserve_template_recipientids': opts['preserveTemplateRecipientids']
            };
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = envelopeSummaryModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes', 'POST',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {String} opts.advancedUpdate When set to **true**, allows the caller to update recipients, tabs, custom fields, notification, email settings and other envelope attributes.
         * @param {String} opts.resendEnvelope When set to **true**, sends the specified envelope again.
         * @param {module:model/Envelope} opts.envelope
         * @return {module:model/EnvelopeUpdateSummary}
         */
        _exports.prototype.update = function(envelopeId, opts) {
            opts = opts || {};

            var postBody = opts['envelope'];

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling update");
            }

            var pathParams = {
                'envelopeId': envelopeId
            };
            var queryParams = {
                'advanced_update': opts['advancedUpdate'],
                'resend_envelope': opts['resendEnvelope']
            };
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = envelopeUpdateSummaryModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}', 'PUT',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Adds tabs for a recipient.
         * Adds one or more tabs for a recipient.
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {String} recipientId The ID of the recipient being accessed.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {module:model/Tabs} opts.tabs
         * @return {module:model/Tabs}
         */
        _exports.prototype.createTabs = function(envelopeId, recipientId, opts) {
            opts = opts || {};
            var postBody = opts['tabs'];

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling createTabs");
            }

            // verify the required parameter 'recipientId' is set
            if (typeof recipientId === 'undefined' || recipientId == null) {
                throw new Error("Missing the required parameter 'recipientId' when calling createTabs");
            }

            var pathParams = {
                'envelopeId': envelopeId,
                'recipientId': recipientId
            };
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = tabsModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}/recipients/{recipientId}/tabs', 'POST',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Deletes the tabs associated with a recipient.
         * Deletes one or more tabs associated with a recipient in a draft envelope.
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {String} recipientId The ID of the recipient being accessed.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {module:model/Tabs} opts.tabs
         * @return {module:model/Tabs}
         */
        _exports.prototype.deleteTabs = function(envelopeId, recipientId, opts) {
            opts = opts || {};
            var postBody = opts['tabs'];

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling deleteTabs");
            }

            // verify the required parameter 'recipientId' is set
            if (typeof recipientId === 'undefined' || recipientId == null) {
                throw new Error("Missing the required parameter 'recipientId' when calling deleteTabs");
            }

            var pathParams = {
                'envelopeId': envelopeId,
                'recipientId': recipientId
            };
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = tabsModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}/recipients/{recipientId}/tabs', 'DELETE',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Gets the tabs information for a signer or sign-in-person recipient in an envelope.
         * Retrieves information about the tabs associated with a recipient in a draft envelope.
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {String} recipientId The ID of the recipient being accessed.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {String} opts.includeAnchorTabLocations When set to **true**, all tabs with anchor tab properties are included in the response.
         * @param {String} opts.includeMetadata
         * @return {module:model/Tabs}
         */
        _exports.prototype.listTabs = function(envelopeId, recipientId, opts) {
            opts = opts || {};
            var postBody = null;

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling deleteTabs");
            }

            // verify the required parameter 'recipientId' is set
            if (typeof recipientId === 'undefined' || recipientId == null) {
                throw new Error("Missing the required parameter 'recipientId' when calling deleteTabs");
            }

            var pathParams = {
                'envelopeId': envelopeId,
                'recipientId': recipientId
            };
            var queryParams = {
                'include_anchor_tab_locations': opts['includeAnchorTabLocations'],
                'include_metadata': opts['includeMetadata']
            };
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = tabsModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}/recipients/{recipientId}/tabs', 'GET',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Updates the tabs for a recipient.
         * Updates one or more tabs for a recipient in a draft envelope.
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {String} recipientId The ID of the recipient being accessed.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {module:model/Tabs} opts.tabs
         * @return {module:model/Tabs}
         */
        _exports.prototype.updateTabs = function(envelopeId, recipientId, opts) {
            opts = opts || {};

            var postBody = opts['tabs'];

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling deleteTabs");
            }

            // verify the required parameter 'recipientId' is set
            if (typeof recipientId === 'undefined' || recipientId == null) {
                throw new Error("Missing the required parameter 'recipientId' when calling deleteTabs");
            }

            var pathParams = {
                'envelopeId': envelopeId,
                'recipientId': recipientId
            };
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = tabsModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}/recipients/{recipientId}/tabs', 'PUT',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Adds one or more recipients to an envelope.
         * Adds one or more recipients to an envelope.

         For an in process envelope, one that has been sent and has not been completed or voided, an email is sent to a new recipient when they are reached in the routing order. If the new recipient's routing order is before or the same as the envelope's next recipient, an email is only sent if the optional `resend_envelope` query string is set to **true**.
        * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
        * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
        * @param {String} opts.resendEnvelope When set to **true**, re-sends the envelope if the new recipient's routing order is before or the same as the envelope's next recipient.
        * @param {module:model/Recipients} opts.recipients
        * @return {module:model/Recipients}
        */
        _exports.prototype.createRecipient = function(envelopeId, opts) {
            opts = opts || {};
            var postBody = opts['recipients'];

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling createRecipient");
            }

            var pathParams = {
                'envelopeId': envelopeId
            };
            var queryParams = {
                'resend_envelope': opts['resendEnvelope']
            };
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = recipientsModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}/recipients', 'POST',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Deletes a recipient from an envelope.
         * Deletes the specified recipient file from the specified envelope. This cannot be used if the envelope has been sent.
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {String} recipientId The ID of the recipient being accessed.
         * @return {module:model/Recipients}
         */
        _exports.prototype.deleteRecipient = function(envelopeId, recipientId) {
            var postBody = null;

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling deleteRecipient");
            }

            // verify the required parameter 'recipientId' is set
            if (typeof recipientId === 'undefined' || recipientId == null) {
                throw new Error("Missing the required parameter 'recipientId' when calling deleteRecipient");
            }

            var pathParams = {
                'envelopeId': envelopeId,
                'recipientId': recipientId
            };
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = recipientsModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}/recipients/{recipientId}', 'DELETE',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Deletes recipients from an envelope.
         * Deletes one or more recipients from a draft or sent envelope. Recipients to be deleted are listed in the request, with the `recipientId` being used as the key for deleting recipients.
         If the envelope is `In Process`, meaning that it has been sent and has not  been completed or voided, recipients that have completed their actions cannot be deleted.
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {module:model/Recipients} opts.recipients
         * @return {module:model/Recipients}
         */
        _exports.prototype.deleteRecipients = function(envelopeId, opts) {
            opts = opts || {};

            var postBody = opts['recipients'];

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === undefined || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling deleteRecipients");
            }

            var pathParams = {
                'envelopeId': envelopeId
            };
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = recipientsModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}/recipients', 'DELETE',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Gets the status of recipients for an envelope.
         * Retrieves the status of all recipients in a single envelope and identifies the current recipient in the routing list.
         The `currentRoutingOrder` property of the response contains the `routingOrder` value of the current recipient indicating that the envelope has been sent to the recipient, but the recipient has not completed their actions.
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {String} opts.includeAnchorTabLocations  When set to **true** and &#x60;include_tabs&#x60; is set to **true**, all tabs with anchor tab properties are included in the response.
         * @param {String} opts.includeExtended  When set to **true**, the extended properties are included in the response.
         * @param {String} opts.includeTabs When set to **true**, the tab information associated with the recipient is included in the response.
         * @return {module:model/Recipients}
         */
        _exports.prototype.listRecipients = function(envelopeId, opts) {
            opts = opts || {};

            var postBody = null;

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling listRecipients");
            }

            var pathParams = {
                'envelopeId': envelopeId
            };
            var queryParams = {
                'include_anchor_tab_locations': optsOrCallback['includeAnchorTabLocations'],
                'include_extended': optsOrCallback['includeExtended'],
                'include_tabs': optsOrCallback['includeTabs']
            };
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = recipientsModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}/recipients', 'GET',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Adds templates to a document in an  envelope.
         * Adds templates to a document in the specified envelope.
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {String} documentId The ID of the document being accessed.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {module:model/DocumentTemplateList} opts.documentTemplateList
         * @return {module:model/DocumentTemplateList}
         */
        _exports.prototype.applyTemplateToDocument = function(envelopeId, documentId, opts) {
            opts = opts || {};

            var postBody = opts['documentTemplateList'];

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling applyTemplateToDocument");
            }

            // verify the required parameter 'documentId' is set
            if (typeof documentId === 'undefined' || documentId == null) {
                throw new Error("Missing the required parameter 'documentId' when calling applyTemplateToDocument");
            }

            var pathParams = {
                'envelopeId': envelopeId,
                'documentId': documentId
            };
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = documentTemplateListModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}/documents/{documentId}/templates', 'POST',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Deletes a template from a document in an existing envelope.
         * Deletes the specified template from a document in an existing envelope.
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {String} documentId The ID of the document being accessed.
         * @param {String} templateId The ID of the template being accessed.
         */
        _exports.prototype.deleteTemplatesFromDocument = function(envelopeId, documentId, templateId) {
            var postBody = null;

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling deleteTemplatesFromDocument");
            }

            // verify the required parameter 'documentId' is set
            if (typeof documentId === 'undefined' || documentId == null) {
                throw new Error("Missing the required parameter 'documentId' when calling deleteTemplatesFromDocument");
            }

            // verify the required parameter 'templateId' is set
            if (typeof templateId === 'undefined' || templateId == null) {
                throw new Error("Missing the required parameter 'templateId' when calling deleteTemplatesFromDocument");
            }

            var pathParams = {
                'envelopeId': envelopeId,
                'documentId': documentId,
                'templateId': templateId
            };
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = null;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}/documents/{documentId}/templates/{templateId}', 'DELETE',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Get List of Templates used in an Envelope
         * This returns a list of the server-side templates, their name and ID, used in an envelope.
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {String} opts.include The possible values are:  matching_applied - This returns template matching information for the template.
         * @return {module:model/TemplateInformation}
         */
        _exports.prototype.listTemplates = function(envelopeId, opts) {
            opts = opts || {};

            var postBody = null;

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling listTemplates");
            }

            var pathParams = {
                'envelopeId': envelopeId
            };
            var queryParams = {
                'include': opts['include']
            };
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = templateInformationModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}/templates', 'GET',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Gets the templates associated with a document in an existing envelope.
         * Retrieves the templates associated with a document in the specified envelope.
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {String} documentId The ID of the document being accessed.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {String} opts.include
         * @return {module:model/TemplateInformation}
         */
        _exports.prototype.listTemplatesForDocument = function(envelopeId, documentId, opts) {
            opts = opts || {};

            var postBody = null;

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling listTemplatesForDocument");
            }

            // verify the required parameter 'documentId' is set
            if (typeof documentId === 'undefined' || documentId == null) {
                throw new Error("Missing the required parameter 'documentId' when calling listTemplatesForDocument");
            }

            var pathParams = {
                'envelopeId': envelopeId,
                'documentId': documentId
            };
            var queryParams = {
                'include': opts['include']
            };
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = templateInformationModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}/documents/{documentId}/templates', 'GET',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Gets the status of a envelope.
         * Retrieves the overall status for the specified envelope.
         * @param {String} envelopeId The envelopeId Guid of the envelope being accessed.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {String} opts.advancedUpdate When true, envelope information can be added or modified.
         * @param {String} opts.include
         * @return {module:model/Envelope}
         */
        _exports.prototype.getEnvelope = function(envelopeId, opts) {
            opts = opts || {};

            var postBody = null;

            // verify the required parameter 'envelopeId' is set
            if (typeof envelopeId === 'undefined' || envelopeId == null) {
                throw new Error("Missing the required parameter 'envelopeId' when calling getEnvelope");
            }
            var pathParams = {
                'envelopeId': envelopeId
            };
            var queryParams = {
                'advanced_update': opts['advancedUpdate'],
                'include': opts['include']
            };
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = envelopeModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/{envelopeId}', 'GET',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Gets the envelope status for the specified envelopes.
         * Retrieves the envelope status for the specified envelopes.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {String} opts.email
         * @param {String} opts.fromDate
         * @param {String} opts.startPosition
         * @param {String} opts.toDate
         * @param {String} opts.envelopeIds
         * @param {module:model/EnvelopeIdsRequest} opts.envelopeIdsRequest
         * @return {module:model/EnvelopesInformation}
         */
        _exports.prototype.listStatus = function(opts) {
            opts = opts || {};

            var postBody = opts['envelopeIdsRequest'];

            var pathParams = {};
            var queryParams = {
                'email': opts['email'],
                'from_date': opts['fromDate'],
                'start_position': opts['startPosition'],
                'to_date': opts['toDate'],
                'envelope_ids': opts['envelopeIds']
            };
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = envelopesInformationModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/envelopes/status', 'PUT',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        /**
         * Returns a URL to the authentication view UI.
         * Returns a URL that allows you to embed the authentication view of the DocuSign UI in your applications.
         * @param {Object} opts Optional parameters, if you are passing no optional parameters, you can either pass a null or omit this parameter entirely.
         * @param {module:model/ConsoleViewRequest} opts.consoleViewRequest
         * data is of type: {@link module:model/ViewUrl}
         */
        _exports.prototype.createConsoleView = function(opts) {
            opts = opts || {};


            var postBody = opts['consoleViewRequest'];

            var pathParams = {};
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var contentTypes = [];
            var accepts = ['application/json'];
            var returnType = viewUrlModel;

            return this.apiClient.callApi(
                '/v2/accounts/{accountId}/views/console', 'POST',
                pathParams, queryParams, headerParams, formParams, postBody,
                contentTypes, accepts, returnType
            );
        };

        return  _exports;

    });