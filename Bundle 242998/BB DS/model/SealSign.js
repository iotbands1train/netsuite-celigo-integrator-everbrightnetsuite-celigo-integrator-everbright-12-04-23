/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './AuthenticationStatus', './DocumentVisibility', './ErrorDetails', './IdCheckInformationInput', './RecipientAttachment', './RecipientEmailNotification'
        , './RecipientPhoneAuthentication', './RecipientSAMLAuthentication', './RecipientSignatureProvider', './RecipientSMSAuthentication', './SocialAuthentication', './Tabs'],
    function (helpersModule, authenticationStatusModel, documentVisibilityModel, errorDetailsModel, idCheckInformationInputModel, recipientAttachmentModel, recipientEmailNotificationModel
        , recipientPhoneAuthenticationModel, recipientSAMLAuthenticationModel, recipientSignatureProviderModel, recipientSMSAuthenticationModel, socialAuthenticationModel, tabsModel) {
        /**
         * The SealSign model module.
         * @module model/SealSign
         * @version 0.0.1
         */

        /**
         * Constructs a new <code>SealSign</code>.
         * @alias module:model/SealSign
         * @class
         */
        var _exports = function () {
            var _this = this;


        };

        /**
         * Constructs a <code>SealSign</code> from a plain JavaScript object, optionally creating a new instance.
         * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @param {module:model/SealSign} obj Optional instance to populate.
         * @return {module:model/SealSign} The populated <code>SealSign</code> instance.
         */
        _exports.constructFromObject = function (data, obj) {
            if (data) {
                obj = obj || new _exports();

                if (data.hasOwnProperty('accessCode')) {
                    obj['accessCode'] = helpersModule.convertToType(data['accessCode'], 'String');
                }
                if (data.hasOwnProperty('addAccessCodeToEmail')) {
                    obj['addAccessCodeToEmail'] = helpersModule.convertToType(data['addAccessCodeToEmail'], 'String');
                }
                if (data.hasOwnProperty('clientUserId')) {
                    obj['clientUserId'] = helpersModule.convertToType(data['clientUserId'], 'String');
                }
                if (data.hasOwnProperty('customFields')) {
                    obj['customFields'] = helpersModule.convertToType(data['customFields'], ['String']);
                }
                if (data.hasOwnProperty('declinedDateTime')) {
                    obj['declinedDateTime'] = helpersModule.convertToType(data['declinedDateTime'], 'String');
                }
                if (data.hasOwnProperty('declinedReason')) {
                    obj['declinedReason'] = helpersModule.convertToType(data['declinedReason'], 'String');
                }
                if (data.hasOwnProperty('deliveredDateTime')) {
                    obj['deliveredDateTime'] = helpersModule.convertToType(data['deliveredDateTime'], 'String');
                }
                if (data.hasOwnProperty('deliveryMethod')) {
                    obj['deliveryMethod'] = helpersModule.convertToType(data['deliveryMethod'], 'String');
                }
                if (data.hasOwnProperty('documentVisibility')) {
                    obj['documentVisibility'] = helpersModule.convertToType(data['documentVisibility'], [documentVisibilityModel]);
                }
                if (data.hasOwnProperty('emailNotification')) {
                    obj['emailNotification'] = recipientEmailNotificationModel.constructFromObject(data['emailNotification']);
                }
                if (data.hasOwnProperty('embeddedRecipientStartURL')) {
                    obj['embeddedRecipientStartURL'] = helpersModule.convertToType(data['embeddedRecipientStartURL'], 'String');
                }
                if (data.hasOwnProperty('errorDetails')) {
                    obj['errorDetails'] = errorDetailsModel.constructFromObject(data['errorDetails']);
                }
                if (data.hasOwnProperty('faxNumber')) {
                    obj['faxNumber'] = helpersModule.convertToType(data['faxNumber'], 'String');
                }
                if (data.hasOwnProperty('idCheckConfigurationName')) {
                    obj['idCheckConfigurationName'] = helpersModule.convertToType(data['idCheckConfigurationName'], 'String');
                }
                if (data.hasOwnProperty('idCheckInformationInput')) {
                    obj['idCheckInformationInput'] = idCheckInformationInputModel.constructFromObject(data['idCheckInformationInput']);
                }
                if (data.hasOwnProperty('inheritEmailNotificationConfiguration')) {
                    obj['inheritEmailNotificationConfiguration'] = helpersModule.convertToType(data['inheritEmailNotificationConfiguration'], 'String');
                }
                if (data.hasOwnProperty('name')) {
                    obj['name'] = helpersModule.convertToType(data['name'], 'String');
                }
                if (data.hasOwnProperty('note')) {
                    obj['note'] = helpersModule.convertToType(data['note'], 'String');
                }
                if (data.hasOwnProperty('phoneAuthentication')) {
                    obj['phoneAuthentication'] = recipientPhoneAuthenticationModel.constructFromObject(data['phoneAuthentication']);
                }
                if (data.hasOwnProperty('recipientAttachments')) {
                    obj['recipientAttachments'] = helpersModule.convertToType(data['recipientAttachments'], [recipientAttachmentModel]);
                }
                if (data.hasOwnProperty('recipientAuthenticationStatus')) {
                    obj['recipientAuthenticationStatus'] = authenticationStatusModel.constructFromObject(data['recipientAuthenticationStatus']);
                }
                if (data.hasOwnProperty('recipientId')) {
                    obj['recipientId'] = helpersModule.convertToType(data['recipientId'], 'String');
                }
                if (data.hasOwnProperty('recipientIdGuid')) {
                    obj['recipientIdGuid'] = helpersModule.convertToType(data['recipientIdGuid'], 'String');
                }
                if (data.hasOwnProperty('recipientSignatureProviders')) {
                    obj['recipientSignatureProviders'] = helpersModule.convertToType(data['recipientSignatureProviders'], [recipientSignatureProviderModel]);
                }
                if (data.hasOwnProperty('requireIdLookup')) {
                    obj['requireIdLookup'] = helpersModule.convertToType(data['requireIdLookup'], 'String');
                }
                if (data.hasOwnProperty('roleName')) {
                    obj['roleName'] = helpersModule.convertToType(data['roleName'], 'String');
                }
                if (data.hasOwnProperty('routingOrder')) {
                    obj['routingOrder'] = helpersModule.convertToType(data['routingOrder'], 'String');
                }
                if (data.hasOwnProperty('samlAuthentication')) {
                    obj['samlAuthentication'] = recipientSAMLAuthenticationModel.constructFromObject(data['samlAuthentication']);
                }
                if (data.hasOwnProperty('sentDateTime')) {
                    obj['sentDateTime'] = helpersModule.convertToType(data['sentDateTime'], 'String');
                }
                if (data.hasOwnProperty('signedDateTime')) {
                    obj['signedDateTime'] = helpersModule.convertToType(data['signedDateTime'], 'String');
                }
                if (data.hasOwnProperty('smsAuthentication')) {
                    obj['smsAuthentication'] = recipientSMSAuthenticationModel.constructFromObject(data['smsAuthentication']);
                }
                if (data.hasOwnProperty('socialAuthentications')) {
                    obj['socialAuthentications'] = helpersModule.convertToType(data['socialAuthentications'], [socialAuthenticationModel]);
                }
                if (data.hasOwnProperty('status')) {
                    obj['status'] = helpersModule.convertToType(data['status'], 'String');
                }
                if (data.hasOwnProperty('tabs')) {
                    obj['tabs'] = tabsModel.constructFromObject(data['tabs']);
                }
                if (data.hasOwnProperty('templateLocked')) {
                    obj['templateLocked'] = helpersModule.convertToType(data['templateLocked'], 'String');
                }
                if (data.hasOwnProperty('templateRequired')) {
                    obj['templateRequired'] = helpersModule.convertToType(data['templateRequired'], 'String');
                }
                if (data.hasOwnProperty('totalTabCount')) {
                    obj['totalTabCount'] = helpersModule.convertToType(data['totalTabCount'], 'String');
                }
                if (data.hasOwnProperty('userId')) {
                    obj['userId'] = helpersModule.convertToType(data['userId'], 'String');
                }
            }
            return obj;
        };

        /**
         * If a value is provided, the recipient must enter the value as the access code to view and sign the envelope.   Maximum Length: 50 characters and it must conform to the account's access code format setting.  If blank, but the signer `accessCode` property is set in the envelope, then that value is used.  If blank and the signer `accessCode` property is not set, then the access code is not required.
         * @member {String} accessCode
         */
        _exports.prototype['accessCode'] = undefined;
        /**
         * This Optional attribute indicates that the access code will be added to the email sent to the recipient; this nullifies the Security measure of Access Code on the recipient.
         * @member {String} addAccessCodeToEmail
         */
        _exports.prototype['addAccessCodeToEmail'] = undefined;
        /**
         * Specifies whether the recipient is embedded or remote.   If the `clientUserId` property is not null then the recipient is embedded. Note that if the `ClientUserId` property is set and either `SignerMustHaveAccount` or `SignerMustLoginToSign` property of the account settings is set to  **true**, an error is generated on sending.ng.   Maximum length: 100 characters.
         * @member {String} clientUserId
         */
        _exports.prototype['clientUserId'] = undefined;
        /**
         * An optional array of strings that allows the sender to provide custom data about the recipient. This information is returned in the envelope status but otherwise not used by DocuSign. Each customField string can be a maximum of 100 characters.
         * @member {Array.<String>} customFields
         */
        _exports.prototype['customFields'] = undefined;
        /**
         * The date and time the recipient declined the document.
         * @member {String} declinedDateTime
         */
        _exports.prototype['declinedDateTime'] = undefined;
        /**
         * The reason the recipient declined the document.
         * @member {String} declinedReason
         */
        _exports.prototype['declinedReason'] = undefined;
        /**
         * Reserved: For DocuSign use only.
         * @member {String} deliveredDateTime
         */
        _exports.prototype['deliveredDateTime'] = undefined;
        /**
         * Reserved: For DocuSign use only.
         * @member {String} deliveryMethod
         */
        _exports.prototype['deliveryMethod'] = undefined;
        /**
         *
         * @member {Array.<module:model/DocumentVisibility>} documentVisibility
         */
        _exports.prototype['documentVisibility'] = undefined;
        /**
         * @member {module:model/RecipientEmailNotification} emailNotification
         */
        _exports.prototype['emailNotification'] = undefined;
        /**
         * Specifies a sender provided valid URL string for redirecting an embedded recipient. When using this option, the embedded recipient still receives an email from DocuSign, just as a remote recipient would. When the document link in the email is clicked the recipient is redirected, through DocuSign, to the supplied URL to complete their actions. When routing to the URL, the sender's system (the server responding to the URL) must request a recipient token to launch a signing session.   If set to `SIGN_AT_DOCUSIGN`, the recipient is directed to an embedded signing or viewing process directly at DocuSign. The signing or viewing action is initiated by the DocuSign system and the transaction activity and Certificate of Completion records will reflect this. In all other ways the process is identical to an embedded signing or viewing operation that is launched by any partner.  It is important to remember that in a typical embedded workflow the authentication of an embedded recipient is the responsibility of the sending application, DocuSign expects that senders will follow their own process for establishing the recipient's identity. In this workflow the recipient goes through the sending application before the embedded signing or viewing process in initiated. However, when the sending application sets `EmbeddedRecipientStartURL=SIGN_AT_DOCUSIGN`, the recipient goes directly to the embedded signing or viewing process bypassing the sending application and any authentication steps the sending application would use. In this case, DocuSign recommends that you use one of the normal DocuSign authentication features (Access Code, Phone Authentication, SMS Authentication, etc.) to verify the identity of the recipient.  If the `clientUserId` property is NOT set, and the `embeddedRecipientStartURL` is set, DocuSign will ignore the redirect URL and launch the standard signing process for the email recipient. Information can be appended to the embedded recipient start URL using merge fields. The available merge fields items are: envelopeId, recipientId, recipientName, recipientEmail, and customFields. The `customFields` property must be set fort the recipient or envelope. The merge fields are enclosed in double brackets.   *Example*:   `http://senderHost/[[mergeField1]]/ beginSigningSession? [[mergeField2]]&[[mergeField3]]`
         * @member {String} embeddedRecipientStartURL
         */
        _exports.prototype['embeddedRecipientStartURL'] = undefined;
        /**
         * @member {module:model/ErrorDetails} errorDetails
         */
        _exports.prototype['errorDetails'] = undefined;
        /**
         * Reserved:
         * @member {String} faxNumber
         */
        _exports.prototype['faxNumber'] = undefined;
        /**
         * Specifies authentication check by name. The names used here must be the same as the authentication type names used by the account (these name can also be found in the web console sending interface in the Identify list for a recipient,) This overrides any default authentication setting.  *Example*: Your account has ID Check and SMS Authentication available and in the web console Identify list these appear as 'ID Check $' and 'SMS Auth $'. To use ID check in an envelope, the idCheckConfigurationName should be 'ID Check '. If you wanted to use SMS, it would be 'SMS Auth $' and you would need to add you would need to add phone number information to the `smsAuthentication` node.
         * @member {String} idCheckConfigurationName
         */
        _exports.prototype['idCheckConfigurationName'] = undefined;
        /**
         * @member {module:model/IdCheckInformationInput} idCheckInformationInput
         */
        _exports.prototype['idCheckInformationInput'] = undefined;
        /**
         * When set to **true** and the envelope recipient creates a DocuSign account after signing, the Manage Account Email Notification settings are used as the default settings for the recipient's account.
         * @member {String} inheritEmailNotificationConfiguration
         */
        _exports.prototype['inheritEmailNotificationConfiguration'] = undefined;
        /**
         *
         * @member {String} name
         */
        _exports.prototype['name'] = undefined;
        /**
         * Specifies a note that is unique to this recipient. This note is sent to the recipient via the signing email. The note displays in the signing UI near the upper left corner of the document on the signing screen.  Maximum Length: 1000 characters.
         * @member {String} note
         */
        _exports.prototype['note'] = undefined;
        /**
         * @member {module:model/RecipientPhoneAuthentication} phoneAuthentication
         */
        _exports.prototype['phoneAuthentication'] = undefined;
        /**
         * Reserved:
         * @member {Array.<module:model/RecipientAttachment>} recipientAttachments
         */
        _exports.prototype['recipientAttachments'] = undefined;
        /**
         * @member {module:model/AuthenticationStatus} recipientAuthenticationStatus
         */
        _exports.prototype['recipientAuthenticationStatus'] = undefined;
        /**
         * Unique for the recipient. It is used by the tab element to indicate which recipient is to sign the Document.
         * @member {String} recipientId
         */
        _exports.prototype['recipientId'] = undefined;
        /**
         *
         * @member {String} recipientIdGuid
         */
        _exports.prototype['recipientIdGuid'] = undefined;
        /**
         *
         * @member {Array.<module:model/RecipientSignatureProvider>} recipientSignatureProviders
         */
        _exports.prototype['recipientSignatureProviders'] = undefined;
        /**
         * When set to **true**, the recipient is required to use the specified ID check method (including Phone and SMS authentication) to validate their identity.
         * @member {String} requireIdLookup
         */
        _exports.prototype['requireIdLookup'] = undefined;
        /**
         * Optional element. Specifies the role name associated with the recipient.<br/><br/>This is required when working with template recipients.
         * @member {String} roleName
         */
        _exports.prototype['roleName'] = undefined;
        /**
         * Specifies the routing order of the recipient in the envelope.
         * @member {String} routingOrder
         */
        _exports.prototype['routingOrder'] = undefined;
        /**
         * @member {module:model/RecipientSAMLAuthentication} samlAuthentication
         */
        _exports.prototype['samlAuthentication'] = undefined;
        /**
         * The date and time the envelope was sent.
         * @member {String} sentDateTime
         */
        _exports.prototype['sentDateTime'] = undefined;
        /**
         * Reserved: For DocuSign use only.
         * @member {String} signedDateTime
         */
        _exports.prototype['signedDateTime'] = undefined;
        /**
         * @member {module:model/RecipientSMSAuthentication} smsAuthentication
         */
        _exports.prototype['smsAuthentication'] = undefined;
        /**
         *  Lists the social ID type that can be used for recipient authentication.
         * @member {Array.<module:model/SocialAuthentication>} socialAuthentications
         */
        _exports.prototype['socialAuthentications'] = undefined;
        /**
         * Indicates the envelope status. Valid values are:  * sent - The envelope is sent to the recipients.  * created - The envelope is saved as a draft and can be modified and sent later.
         * @member {String} status
         */
        _exports.prototype['status'] = undefined;
        /**
         * @member {module:model/Tabs} tabs
         */
        _exports.prototype['tabs'] = undefined;
        /**
         * When set to **true**, the sender cannot change any attributes of the recipient. Used only when working with template recipients.
         * @member {String} templateLocked
         */
        _exports.prototype['templateLocked'] = undefined;
        /**
         * When set to **true**, the sender may not remove the recipient. Used only when working with template recipients.
         * @member {String} templateRequired
         */
        _exports.prototype['templateRequired'] = undefined;
        /**
         *
         * @member {String} totalTabCount
         */
        _exports.prototype['totalTabCount'] = undefined;
        /**
         *
         * @member {String} userId
         */
        _exports.prototype['userId'] = undefined;

        return _exports;
    });