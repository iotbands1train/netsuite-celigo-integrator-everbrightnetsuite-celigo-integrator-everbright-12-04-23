/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './Attachment', './CompositeTemplate', './CustomFields', './Document', './EmailSettings'
        , './EventNotification', './LockInformation', './Notification', './Recipients', './TemplateRole'],
    function (helpersModule, attachmentModel, compositeTemplateModel, customFieldsModel, documentModel, emailSettingsModel
              , eventNotificationModel, lockInformationModel, notificationModel, recipientsModel, templateRoleModel) {
        /**
         * The EnvelopeDefinition model module.
         * @module model/EnvelopeDefinition
         * @version 0.0.1
         */

        /**
         * Constructs a new <code>EnvelopeDefinition</code>.
         * @alias module:model/EnvelopeDefinition
         * @class
         */
        var _exports = function () {
            var _this = this;
        };

        /**
         * Constructs a <code>EnvelopeDefinition</code> from a plain JavaScript object, optionally creating a new instance.
         * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @param {module:model/EnvelopeDefinition} obj Optional instance to populate.
         * @return {module:model/EnvelopeDefinition} The populated <code>EnvelopeDefinition</code> instance.
         */
        _exports.constructFromObject = function (data, obj) {
            if (data) {
                obj = obj || new _exports();

                if (data.hasOwnProperty('accessibility')) {
                    obj['accessibility'] = helpersModule.convertToType(data['accessibility'], 'String');
                }
                if (data.hasOwnProperty('allowMarkup')) {
                    obj['allowMarkup'] = helpersModule.convertToType(data['allowMarkup'], 'String');
                }
                if (data.hasOwnProperty('allowReassign')) {
                    obj['allowReassign'] = helpersModule.convertToType(data['allowReassign'], 'String');
                }
                if (data.hasOwnProperty('allowRecipientRecursion')) {
                    obj['allowRecipientRecursion'] = helpersModule.convertToType(data['allowRecipientRecursion'], 'String');
                }
                if (data.hasOwnProperty('allowViewHistory')) {
                    obj['allowViewHistory'] = helpersModule.convertToType(data['allowViewHistory'], 'String');
                }
                if (data.hasOwnProperty('asynchronous')) {
                    obj['asynchronous'] = helpersModule.convertToType(data['asynchronous'], 'String');
                }
                if (data.hasOwnProperty('attachments')) {
                    obj['attachments'] = helpersModule.convertToType(data['attachments'], [attachmentModel]);
                }
                if (data.hasOwnProperty('attachmentsUri')) {
                    obj['attachmentsUri'] = helpersModule.convertToType(data['attachmentsUri'], 'String');
                }
                if (data.hasOwnProperty('authoritativeCopy')) {
                    obj['authoritativeCopy'] = helpersModule.convertToType(data['authoritativeCopy'], 'String');
                }
                if (data.hasOwnProperty('authoritativeCopyDefault')) {
                    obj['authoritativeCopyDefault'] = helpersModule.convertToType(data['authoritativeCopyDefault'], 'String');
                }
                if (data.hasOwnProperty('autoNavigation')) {
                    obj['autoNavigation'] = helpersModule.convertToType(data['autoNavigation'], 'String');
                }
                if (data.hasOwnProperty('brandId')) {
                    obj['brandId'] = helpersModule.convertToType(data['brandId'], 'String');
                }
                if (data.hasOwnProperty('brandLock')) {
                    obj['brandLock'] = helpersModule.convertToType(data['brandLock'], 'String');
                }
                if (data.hasOwnProperty('certificateUri')) {
                    obj['certificateUri'] = helpersModule.convertToType(data['certificateUri'], 'String');
                }
                if (data.hasOwnProperty('completedDateTime')) {
                    obj['completedDateTime'] = helpersModule.convertToType(data['completedDateTime'], 'String');
                }
                if (data.hasOwnProperty('compositeTemplates')) {
                    obj['compositeTemplates'] = helpersModule.convertToType(data['compositeTemplates'], [compositeTemplateModel]);
                }
                if (data.hasOwnProperty('createdDateTime')) {
                    obj['createdDateTime'] = helpersModule.convertToType(data['createdDateTime'], 'String');
                }
                if (data.hasOwnProperty('customFields')) {
                    obj['customFields'] = customFieldsModel.constructFromObject(data['customFields']);
                }
                if (data.hasOwnProperty('customFieldsUri')) {
                    obj['customFieldsUri'] = helpersModule.convertToType(data['customFieldsUri'], 'String');
                }
                if (data.hasOwnProperty('declinedDateTime')) {
                    obj['declinedDateTime'] = helpersModule.convertToType(data['declinedDateTime'], 'String');
                }
                if (data.hasOwnProperty('deletedDateTime')) {
                    obj['deletedDateTime'] = helpersModule.convertToType(data['deletedDateTime'], 'String');
                }
                if (data.hasOwnProperty('deliveredDateTime')) {
                    obj['deliveredDateTime'] = helpersModule.convertToType(data['deliveredDateTime'], 'String');
                }
                if (data.hasOwnProperty('documents')) {
                    obj['documents'] = helpersModule.convertToType(data['documents'], [documentModel]);
                }
                if (data.hasOwnProperty('documentsCombinedUri')) {
                    obj['documentsCombinedUri'] = helpersModule.convertToType(data['documentsCombinedUri'], 'String');
                }
                if (data.hasOwnProperty('documentsUri')) {
                    obj['documentsUri'] = helpersModule.convertToType(data['documentsUri'], 'String');
                }
                if (data.hasOwnProperty('emailBlurb')) {
                    obj['emailBlurb'] = helpersModule.convertToType(data['emailBlurb'], 'String');
                }
                if (data.hasOwnProperty('emailSettings')) {
                    obj['emailSettings'] = emailSettingsModel.constructFromObject(data['emailSettings']);
                }
                if (data.hasOwnProperty('emailSubject')) {
                    obj['emailSubject'] = helpersModule.convertToType(data['emailSubject'], 'String');
                }
                if (data.hasOwnProperty('enableWetSign')) {
                    obj['enableWetSign'] = helpersModule.convertToType(data['enableWetSign'], 'String');
                }
                if (data.hasOwnProperty('enforceSignerVisibility')) {
                    obj['enforceSignerVisibility'] = helpersModule.convertToType(data['enforceSignerVisibility'], 'String');
                }
                if (data.hasOwnProperty('envelopeId')) {
                    obj['envelopeId'] = helpersModule.convertToType(data['envelopeId'], 'String');
                }
                if (data.hasOwnProperty('envelopeIdStamping')) {
                    obj['envelopeIdStamping'] = helpersModule.convertToType(data['envelopeIdStamping'], 'String');
                }
                if (data.hasOwnProperty('envelopeUri')) {
                    obj['envelopeUri'] = helpersModule.convertToType(data['envelopeUri'], 'String');
                }
                if (data.hasOwnProperty('eventNotification')) {
                    obj['eventNotification'] = eventNotificationModel.constructFromObject(data['eventNotification']);
                }
                if (data.hasOwnProperty('initialSentDateTime')) {
                    obj['initialSentDateTime'] = helpersModule.convertToType(data['initialSentDateTime'], 'String');
                }
                if (data.hasOwnProperty('is21CFRPart11')) {
                    obj['is21CFRPart11'] = helpersModule.convertToType(data['is21CFRPart11'], 'String');
                }
                if (data.hasOwnProperty('isSignatureProviderEnvelope')) {
                    obj['isSignatureProviderEnvelope'] = helpersModule.convertToType(data['isSignatureProviderEnvelope'], 'String');
                }
                if (data.hasOwnProperty('lastModifiedDateTime')) {
                    obj['lastModifiedDateTime'] = helpersModule.convertToType(data['lastModifiedDateTime'], 'String');
                }
                if (data.hasOwnProperty('lockInformation')) {
                    obj['lockInformation'] = lockInformationModel.constructFromObject(data['lockInformation']);
                }
                if (data.hasOwnProperty('messageLock')) {
                    obj['messageLock'] = helpersModule.convertToType(data['messageLock'], 'String');
                }
                if (data.hasOwnProperty('notification')) {
                    obj['notification'] = notificationModel.constructFromObject(data['notification']);
                }
                if (data.hasOwnProperty('notificationUri')) {
                    obj['notificationUri'] = helpersModule.convertToType(data['notificationUri'], 'String');
                }
                if (data.hasOwnProperty('password')) {
                    obj['password'] = helpersModule.convertToType(data['password'], 'String');
                }
                if (data.hasOwnProperty('purgeState')) {
                    obj['purgeState'] = helpersModule.convertToType(data['purgeState'], 'String');
                }
                if (data.hasOwnProperty('recipients')) {
                    obj['recipients'] = recipientsModel.constructFromObject(data['recipients']);
                }
                if (data.hasOwnProperty('recipientsLock')) {
                    obj['recipientsLock'] = helpersModule.convertToType(data['recipientsLock'], 'String');
                }
                if (data.hasOwnProperty('recipientsUri')) {
                    obj['recipientsUri'] = helpersModule.convertToType(data['recipientsUri'], 'String');
                }
                if (data.hasOwnProperty('sentDateTime')) {
                    obj['sentDateTime'] = helpersModule.convertToType(data['sentDateTime'], 'String');
                }
                if (data.hasOwnProperty('signerCanSignOnMobile')) {
                    obj['signerCanSignOnMobile'] = helpersModule.convertToType(data['signerCanSignOnMobile'], 'String');
                }
                if (data.hasOwnProperty('signingLocation')) {
                    obj['signingLocation'] = helpersModule.convertToType(data['signingLocation'], 'String');
                }
                if (data.hasOwnProperty('status')) {
                    obj['status'] = helpersModule.convertToType(data['status'], 'String');
                }
                if (data.hasOwnProperty('statusChangedDateTime')) {
                    obj['statusChangedDateTime'] = helpersModule.convertToType(data['statusChangedDateTime'], 'String');
                }
                if (data.hasOwnProperty('templateId')) {
                    obj['templateId'] = helpersModule.convertToType(data['templateId'], 'String');
                }
                if (data.hasOwnProperty('templateRoles')) {
                    obj['templateRoles'] = helpersModule.convertToType(data['templateRoles'], [templateRoleModel]);
                }
                if (data.hasOwnProperty('templatesUri')) {
                    obj['templatesUri'] = helpersModule.convertToType(data['templatesUri'], 'String');
                }
                if (data.hasOwnProperty('transactionId')) {
                    obj['transactionId'] = helpersModule.convertToType(data['transactionId'], 'String');
                }
                if (data.hasOwnProperty('useDisclosure')) {
                    obj['useDisclosure'] = helpersModule.convertToType(data['useDisclosure'], 'String');
                }
                if (data.hasOwnProperty('voidedDateTime')) {
                    obj['voidedDateTime'] = helpersModule.convertToType(data['voidedDateTime'], 'String');
                }
                if (data.hasOwnProperty('voidedReason')) {
                    obj['voidedReason'] = helpersModule.convertToType(data['voidedReason'], 'String');
                }
            }
            return obj;
        };

        /**
         * Sets the document reading zones for screen reader applications.  This element can only be used if Document Accessibility is enabled for the account.   ###### Note: This information is currently generated from the DocuSign web console by setting the reading zones when creating a template, exporting the reading zone string information, and adding it here.
         * @member {String} accessibility
         */
        _exports.prototype['accessibility'] = undefined;
        /**
         * When set to **true**, Document Markup is enabled for envelope. Account must have Document Markup enabled to use this
         * @member {String} allowMarkup
         */
        _exports.prototype['allowMarkup'] = undefined;
        /**
         * When set to **true**, the recipient can redirect an envelope to a more appropriate recipient.
         * @member {String} allowReassign
         */
        _exports.prototype['allowReassign'] = undefined;
        /**
         * When set to **true**, this enables the Recursive Recipients feature and allows a recipient to appear more than once in the routing order.
         * @member {String} allowRecipientRecursion
         */
        _exports.prototype['allowRecipientRecursion'] = undefined;
        /**
         *
         * @member {String} allowViewHistory
         */
        _exports.prototype['allowViewHistory'] = undefined;
        /**
         * When set to **true**, the envelope is queued for processing and the value of the `status` property is set to 'Processing'. Additionally, get status calls return 'Processing' until completed.
         * @member {String} asynchronous
         */
        _exports.prototype['asynchronous'] = undefined;
        /**
         *
         * @member {Array.<module:model/Attachment>} attachments
         */
        _exports.prototype['attachments'] = undefined;
        /**
         *
         * @member {String} attachmentsUri
         */
        _exports.prototype['attachmentsUri'] = undefined;
        /**
         * Specifies the Authoritative copy feature. If set to true the Authoritative copy feature is enabled.
         * @member {String} authoritativeCopy
         */
        _exports.prototype['authoritativeCopy'] = undefined;
        /**
         *
         * @member {String} authoritativeCopyDefault
         */
        _exports.prototype['authoritativeCopyDefault'] = undefined;
        /**
         *
         * @member {String} autoNavigation
         */
        _exports.prototype['autoNavigation'] = undefined;
        /**
         * This sets the brand profile format used for the envelope. The value in the string is the brandId associated with the profile. Account branding must be enabled for the account to use this option.
         * @member {String} brandId
         */
        _exports.prototype['brandId'] = undefined;
        /**
         *
         * @member {String} brandLock
         */
        _exports.prototype['brandLock'] = undefined;
        /**
         * Retrieves a URI for an endpoint that allows you to easily retrieve certificate information.
         * @member {String} certificateUri
         */
        _exports.prototype['certificateUri'] = undefined;
        /**
         * Specifies the date and time this item was completed.
         * @member {String} completedDateTime
         */
        _exports.prototype['completedDateTime'] = undefined;
        /**
         * A complex type that can be added to create envelopes from a combination of DocuSign templates and PDF forms. The basic envelope remains the same, while the Composite Template adds new document and template overlays into the envelope. There can be any number of Composite Template structures in the envelope.
         * @member {Array.<module:model/CompositeTemplate>} compositeTemplates
         */
        _exports.prototype['compositeTemplates'] = undefined;
        /**
         * Indicates the date and time the item was created.
         * @member {String} createdDateTime
         */
        _exports.prototype['createdDateTime'] = undefined;
        /**
         * @member {module:model/CustomFields} customFields
         */
        _exports.prototype['customFields'] = undefined;
        /**
         * Contains a URI for an endpoint that you can use to retrieve the custom fields.
         * @member {String} customFieldsUri
         */
        _exports.prototype['customFieldsUri'] = undefined;
        /**
         * The date and time the recipient declined the document.
         * @member {String} declinedDateTime
         */
        _exports.prototype['declinedDateTime'] = undefined;
        /**
         * Specifies the data and time the item was deleted.
         * @member {String} deletedDateTime
         */
        _exports.prototype['deletedDateTime'] = undefined;
        /**
         * Reserved: For DocuSign use only.
         * @member {String} deliveredDateTime
         */
        _exports.prototype['deliveredDateTime'] = undefined;
        /**
         * Complex element contains the details on the documents in the envelope.
         * @member {Array.<module:model/Document>} documents
         */
        _exports.prototype['documents'] = undefined;
        /**
         *
         * @member {String} documentsCombinedUri
         */
        _exports.prototype['documentsCombinedUri'] = undefined;
        /**
         * Contains a URI for an endpoint that you can use to retrieve the documents.
         * @member {String} documentsUri
         */
        _exports.prototype['documentsUri'] = undefined;
        /**
         * Optional element. This is the same as the email body. If specified it is included in email body for all envelope recipients. This can be a maximum of 10000 characters
         * @member {String} emailBlurb
         */
        _exports.prototype['emailBlurb'] = undefined;
        /**
         * @member {module:model/EmailSettings} emailSettings
         */
        _exports.prototype['emailSettings'] = undefined;
        /**
         * Specifies the subject of the email that is sent to all recipients.  See [ML:Template Email Subject Merge Fields] for information about adding merge field information to the email subject.
         * @member {String} emailSubject
         */
        _exports.prototype['emailSubject'] = undefined;
        /**
         * When set to **true**, the signer is allowed to print the document and sign it on paper.
         * @member {String} enableWetSign
         */
        _exports.prototype['enableWetSign'] = undefined;
        /**
         * When set to **true**, documents with tabs can only be viewed by signers that have a tab on that document. Recipients that have an administrative role (Agent, Editor, or Intermediaries) or informational role (Certified Deliveries or Carbon Copies) can always see all the documents in an envelope, unless they are specifically excluded using this setting when an envelope is sent. Documents that do not have tabs are always visible to all recipients, unless they are specifically excluded using this setting when an envelope is sent.  Your account must have Document Visibility enabled to use this.
         * @member {String} enforceSignerVisibility
         */
        _exports.prototype['enforceSignerVisibility'] = undefined;
        /**
         * The envelope ID of the envelope status that failed to post.
         * @member {String} envelopeId
         */
        _exports.prototype['envelopeId'] = undefined;
        /**
         * When set to **true**, Envelope ID Stamping is enabled.
         * @member {String} envelopeIdStamping
         */
        _exports.prototype['envelopeIdStamping'] = undefined;
        /**
         * Contains a URI for an endpoint that you can use to retrieve the envelope or envelopes.
         * @member {String} envelopeUri
         */
        _exports.prototype['envelopeUri'] = undefined;
        /**
         * @member {module:model/EventNotification} eventNotification
         */
        _exports.prototype['eventNotification'] = undefined;
        /**
         *
         * @member {String} initialSentDateTime
         */
        _exports.prototype['initialSentDateTime'] = undefined;
        /**
         * When set to **true**, indicates that this module is enabled on the account.
         * @member {String} is21CFRPart11
         */
        _exports.prototype['is21CFRPart11'] = undefined;
        /**
         *
         * @member {String} isSignatureProviderEnvelope
         */
        _exports.prototype['isSignatureProviderEnvelope'] = undefined;
        /**
         * The date and time the item was last modified.
         * @member {String} lastModifiedDateTime
         */
        _exports.prototype['lastModifiedDateTime'] = undefined;
        /**
         * @member {module:model/LockInformation} lockInformation
         */
        _exports.prototype['lockInformation'] = undefined;
        /**
         * When set to **true**, prevents senders from changing the contents of `emailBlurb` and `emailSubject` properties for the envelope.   Additionally, this prevents users from making changes to the contents of `emailBlurb` and `emailSubject` properties when correcting envelopes.   However, if the `messageLock` node is set to true**** and the `emailSubject` property is empty, senders and correctors are able to add a subject to the envelope.
         * @member {String} messageLock
         */
        _exports.prototype['messageLock'] = undefined;
        /**
         * @member {module:model/Notification} notification
         */
        _exports.prototype['notification'] = undefined;
        /**
         * Contains a URI for an endpoint that you can use to retrieve the notifications.
         * @member {String} notificationUri
         */
        _exports.prototype['notificationUri'] = undefined;
        /**
         *
         * @member {String} password
         */
        _exports.prototype['password'] = undefined;
        /**
         * Initiates a purge request. Valid values are: * documents_queued: Places envelope documents in the purge queue. * documents_and_metadata_queued: Places envelope documents and metadata in the purge queue.
         * @member {String} purgeState
         */
        _exports.prototype['purgeState'] = undefined;
        /**
         * @member {module:model/Recipients} recipients
         */
        _exports.prototype['recipients'] = undefined;
        /**
         * When set to **true**, prevents senders from changing, correcting, or deleting the recipient information for the envelope.
         * @member {String} recipientsLock
         */
        _exports.prototype['recipientsLock'] = undefined;
        /**
         * Contains a URI for an endpoint that you can use to retrieve the recipients.
         * @member {String} recipientsUri
         */
        _exports.prototype['recipientsUri'] = undefined;
        /**
         * The date and time the envelope was sent.
         * @member {String} sentDateTime
         */
        _exports.prototype['sentDateTime'] = undefined;
        /**
         *
         * @member {String} signerCanSignOnMobile
         */
        _exports.prototype['signerCanSignOnMobile'] = undefined;
        /**
         * Specifies the physical location where the signing takes place. It can have two enumeration values; InPerson and Online. The default value is Online.
         * @member {String} signingLocation
         */
        _exports.prototype['signingLocation'] = undefined;
        /**
         * Indicates the envelope status. Valid values are:  * sent - The envelope is sent to the recipients.  * created - The envelope is saved as a draft and can be modified and sent later.
         * @member {String} status
         */
        _exports.prototype['status'] = undefined;
        /**
         * The data and time the status changed.
         * @member {String} statusChangedDateTime
         */
        _exports.prototype['statusChangedDateTime'] = undefined;
        /**
         * The unique identifier of the template. If this is not provided, DocuSign will generate a value.
         * @member {String} templateId
         */
        _exports.prototype['templateId'] = undefined;
        /**
         * Specifies the template recipients. Each roleName in the template must have a recipient assigned to it. This is made up elements:  * email - The recipient's email address. * name - The recipient's name. * roleName - The template roleName associated with the recipient. * clientUserId - Optional, this sets if the signer is This specifies if the recipient is embedded or remote. If the clientUserId is not null then the recipient is embedded. Note that if a ClientUserId is used and the account settings SignerMustHaveAccount or SignerMustLoginToSign are true, an error is generated on sending. * defaultRecipient - Optional, When set to **true**, this recipient is the default recipient and any tabs generated by the transformPdfFields option are mapped to this recipient. * routingOrder - This specifies the routing order of the recipient in the envelope. * accessCode - This optional element specifies the access code a recipient has to enter to validate the identity. This can be a maximum of 50 characters. * inPersonSignerName - Optional, if the template role is an in person signer, this is the full legal name of the signer. This can be a maximum of 100 characters. * emailNotification - This is an optional complex element that has a role specific emailSubject, emailBody, and language. It follows the same format as the emailNotification node for Recipients. * tabs - This allows the tab values to be specified for matching to tabs in the template.
         * @member {Array.<module:model/TemplateRole>} templateRoles
         */
        _exports.prototype['templateRoles'] = undefined;
        /**
         * Contains a URI for an endpoint which you can use to retrieve the templates.
         * @member {String} templatesUri
         */
        _exports.prototype['templatesUri'] = undefined;
        /**
         *  Used to identify an envelope. The id is a sender-generated value and is valid in the DocuSign system for 7 days. It is recommended that a transaction ID is used for offline signing to ensure that an envelope is not sent multiple times. The `transactionId` property can be used determine an envelope's status (i.e. was it created or not) in cases where the internet connection was lost before the envelope status was returned.
         * @member {String} transactionId
         */
        _exports.prototype['transactionId'] = undefined;
        /**
         * When set to **true**, the disclosure is shown to recipients in accordance with the account's Electronic Record and Signature Disclosure frequency setting. When set to **false**, the Electronic Record and Signature Disclosure is not shown to any envelope recipients.   If the `useDisclosure` property is not set, then the account's normal disclosure setting is used and the value of the `useDisclosure` property is not returned in responses when getting envelope information.
         * @member {String} useDisclosure
         */
        _exports.prototype['useDisclosure'] = undefined;
        /**
         * The date and time the envelope or template was voided.
         * @member {String} voidedDateTime
         */
        _exports.prototype['voidedDateTime'] = undefined;
        /**
         * The reason the envelope or template was voided.
         * @member {String} voidedReason
         */
        _exports.prototype['voidedReason'] = undefined;

        return _exports;
    });