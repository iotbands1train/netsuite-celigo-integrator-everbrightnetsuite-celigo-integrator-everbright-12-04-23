/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./Configuration', './api/ApiClient', './oauth/OAuth', './api/RestApi'
        , './model/ErrorDetails', './model/MergeField', './model/NameValue', './model/PropertyMetadata', './model/TabMetadata', './model/TabMetadataList'
        , './model/ReturnUrlRequest', './model/ViewUrl', './model/Envelope', './model/EnvelopeDefinition', './model/CompositeTemplate', './model/ServerTemplate'
        , './model/Tabs', './model/TemplateRole', './model/Text', './model/EnvelopeSummary', './model/ConsoleViewRequest'
        , './api/CustomTabsApi', './api/TemplatesApi', './api/EnvelopesApi'
    ],
    function(Configuration, ApiClient, OAuth, RestApi
             , ErrorDetails, MergeField, NameValue, PropertyMetadata, TabMetadata, TabMetadataList
             , ReturnUrlRequest, ViewUrl, Envelope, EnvelopeDefinition, CompositeTemplate, ServerTemplate
             , Tabs, TemplateRole, Text, EnvelopeSummary, ConsoleViewRequest
             , CustomTabsApi, TemplatesApi, EnvelopesApi) {
    /**
     * DocuSign NetSuite API client..<br>
     * The <code>index</code> module provides access to constructors for all the classes which comprise the public API.
     * <p>
     * <pre>
     * var xxxSvc = new Docusign.XxxApi(); // Allocate the API class we're going to use.
     * var yyyModel = new Docusign.Yyy(); // Construct a model instance.
     * yyyModel.someProperty = 'someValue';
     * ...
     * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
     * ...
     * </pre>
     * </p>
     * @module DocuSign
     * @version 0.0.1
     */
    var _exports = {
        /**
         * The configuration constructor.
         * @property {module:Configuration}
         */
        Configuration: Configuration,
        /**
         * The ApiClient constructor.
         * @property {module:ApiClient}
         */
        ApiClient: ApiClient,
        /**
         * The OAuthClient constructor.
         * @property {module:OAuth}
         */
        OAuth: OAuth,
        /**
         * The RestApi constructor.
         * @property {module:RestApi}
         */
        RestApi: RestApi,
        /**
         * The ErrorDetails model constructor.
         * @property {module:model/ErrorDetails}
         */
        ErrorDetails: ErrorDetails,
        /**
         * The MergeField model constructor.
         * @property {module:model/MergeField}
         */
        MergeField: MergeField,
        /**
         * The NameValue model constructor.
         * @property {module:model/NameValue}
         */
        NameValue: NameValue,
        /**
         * The PropertyMetadata model constructor.
         * @property {module:model/PropertyMetadata}
         */
        PropertyMetadata: PropertyMetadata,
        /**
         * The TabMetadata model constructor.
         * @property {module:model/TabMetadata}
         */
        TabMetadata: TabMetadata,
        /**
         * The TabMetadataList model constructor.
         * @property {module:model/TabMetadataList}
         */
        TabMetadataList: TabMetadataList,
        /**
         * The ReturnUrlRequest model constructor.
         * @property {module:model/ReturnUrlRequest}
         */
        ReturnUrlRequest: ReturnUrlRequest,
        /**
         * The ViewUrl model constructor.
         * @property {module:model/ViewUrl}
         */
        ViewUrl: ViewUrl,
        /**
         * The Envelope model constructor.
         * @property {module:model/Envelope}
         */
        Envelope: Envelope,
        /**
         * The EnvelopeDefinition model constructor.
         * @property {module:model/EnvelopeDefinition}
         */
        EnvelopeDefinition: EnvelopeDefinition,
        /**
         * The EnvelopeSummary model constructor.
         * @property {module:model/EnvelopeSummary}
         */
        EnvelopeSummary: EnvelopeSummary,
        /**
         * The CompositeTemplate model constructor.
         * @property {module:model/CompositeTemplate}
         */
        CompositeTemplate: CompositeTemplate,
        /**
         * The ServerTemplate model constructor.
         * @property {module:model/ServerTemplate}
         */
        ServerTemplate: ServerTemplate,
        /**
         * The ConsoleViewRequest model constructor.
         * @property {module:model/ConsoleViewRequest}
         */
        ConsoleViewRequest: ConsoleViewRequest,
        /**
         * The ServerTemplate model constructor.
         * @property {module:model/ServerTemplate}
         */
        Tabs: Tabs,
        /**
         * The Text model constructor.
         * @property {module:model/Text}
         */
        Text: Text,
        /**
         * The ServerTemplate model constructor.
         * @property {module:model/ServerTemplate}
         */
        TemplateRole: TemplateRole,
        /**
         * The CustomTabsApi service constructor.
         * @property {module:api/CustomTabsApi}
         */
        CustomTabsApi: CustomTabsApi,
        /**
         * The TemplatesApi service constructor.
         * @property {module:api/TemplatesApi}
         */
        TemplatesApi: TemplatesApi,
        /**
         * The EnvelopesApi service constructor.
         * @property {module:api/EnvelopesApi}
         */
        EnvelopesApi: EnvelopesApi
    };

    return _exports;

});