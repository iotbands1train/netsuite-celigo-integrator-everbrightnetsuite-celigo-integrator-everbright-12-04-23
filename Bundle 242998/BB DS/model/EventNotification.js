/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './EnvelopeEvent', './RecipientEvent'], function (helpersModule, envelopeEventModel, recipientEventModel) {
    /**
     * The EventNotification model module.
     * @module model/EventNotification
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>EventNotification</code>.
     * This optional complex element allows a message to be sent a specified URL when the envelope or recipient changes status. It is similar to DocuSign Connect. For example, if an envelope changes from \&quot;Sent\&quot; to \&quot;Delivered\&quot;, a message containing the updated envelope status and optionally the documents is sent to the URL. When an eventNotification is attached to an envelope using the API, it only applies to the envelope (treating the envelope as the sender). This is different from envelopes created through the console user interface, where the user is treated as the sender.
     * @alias module:model/EventNotification
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>EventNotification</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/EventNotification} obj Optional instance to populate.
     * @return {module:model/EventNotification} The populated <code>EventNotification</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('envelopeEvents')) {
                obj['envelopeEvents'] = helpersModule.convertToType(data['envelopeEvents'], [envelopeEventModel]);
            }
            if (data.hasOwnProperty('includeCertificateOfCompletion')) {
                obj['includeCertificateOfCompletion'] = helpersModule.convertToType(data['includeCertificateOfCompletion'], 'String');
            }
            if (data.hasOwnProperty('includeCertificateWithSoap')) {
                obj['includeCertificateWithSoap'] = helpersModule.convertToType(data['includeCertificateWithSoap'], 'String');
            }
            if (data.hasOwnProperty('includeDocumentFields')) {
                obj['includeDocumentFields'] = helpersModule.convertToType(data['includeDocumentFields'], 'String');
            }
            if (data.hasOwnProperty('includeDocuments')) {
                obj['includeDocuments'] = helpersModule.convertToType(data['includeDocuments'], 'String');
            }
            if (data.hasOwnProperty('includeEnvelopeVoidReason')) {
                obj['includeEnvelopeVoidReason'] = helpersModule.convertToType(data['includeEnvelopeVoidReason'], 'String');
            }
            if (data.hasOwnProperty('includeSenderAccountAsCustomField')) {
                obj['includeSenderAccountAsCustomField'] = helpersModule.convertToType(data['includeSenderAccountAsCustomField'], 'String');
            }
            if (data.hasOwnProperty('includeTimeZone')) {
                obj['includeTimeZone'] = helpersModule.convertToType(data['includeTimeZone'], 'String');
            }
            if (data.hasOwnProperty('loggingEnabled')) {
                obj['loggingEnabled'] = helpersModule.convertToType(data['loggingEnabled'], 'String');
            }
            if (data.hasOwnProperty('recipientEvents')) {
                obj['recipientEvents'] = helpersModule.convertToType(data['recipientEvents'], [recipientEventModel]);
            }
            if (data.hasOwnProperty('requireAcknowledgment')) {
                obj['requireAcknowledgment'] = helpersModule.convertToType(data['requireAcknowledgment'], 'String');
            }
            if (data.hasOwnProperty('signMessageWithX509Cert')) {
                obj['signMessageWithX509Cert'] = helpersModule.convertToType(data['signMessageWithX509Cert'], 'String');
            }
            if (data.hasOwnProperty('soapNameSpace')) {
                obj['soapNameSpace'] = helpersModule.convertToType(data['soapNameSpace'], 'String');
            }
            if (data.hasOwnProperty('url')) {
                obj['url'] = helpersModule.convertToType(data['url'], 'String');
            }
            if (data.hasOwnProperty('useSoapInterface')) {
                obj['useSoapInterface'] = helpersModule.convertToType(data['useSoapInterface'], 'String');
            }
        }
        return obj;
    };

    /**
     * A list of envelope-level event statuses that will trigger Connect to send updates to the endpoint specified in the `url` property.   To receive notifications, you must include either an `envelopeEvents` node or a `recipientEvents` node. You do not need to specify both.
     * @member {Array.<module:model/EnvelopeEvent>} envelopeEvents
     */
    _exports.prototype['envelopeEvents'] = undefined;
    /**
     * When set to **true**, the Connect Service includes the Certificate of Completion with completed envelopes.
     * @member {String} includeCertificateOfCompletion
     */
    _exports.prototype['includeCertificateOfCompletion'] = undefined;
    /**
     * When set to **true**, this tells the Connect service to send the DocuSign signedby certificate as part of the outgoing SOAP xml. This appears in the XML as wsse:BinarySecurityToken.
     * @member {String} includeCertificateWithSoap
     */
    _exports.prototype['includeCertificateWithSoap'] = undefined;
    /**
     * When set to **true**, the Document Fields associated with envelope documents are included in the data. Document Fields are optional custom name-value pairs added to documents using the API.
     * @member {String} includeDocumentFields
     */
    _exports.prototype['includeDocumentFields'] = undefined;
    /**
     * When set to **true**, the PDF documents are included in the message along with the updated XML.
     * @member {String} includeDocuments
     */
    _exports.prototype['includeDocuments'] = undefined;
    /**
     * When set to **true**, this tells the Connect Service to include the void reason, as entered by the person that voided the envelope, in the message.
     * @member {String} includeEnvelopeVoidReason
     */
    _exports.prototype['includeEnvelopeVoidReason'] = undefined;
    /**
     * When set to **true**, the sender account ID is included as a envelope custom field in the data.
     * @member {String} includeSenderAccountAsCustomField
     */
    _exports.prototype['includeSenderAccountAsCustomField'] = undefined;
    /**
     * When set to **true**, the envelope time zone information is included in the message.
     * @member {String} includeTimeZone
     */
    _exports.prototype['includeTimeZone'] = undefined;
    /**
     * When set to **true**, logging is turned on for envelope events on the Web Console Connect page.
     * @member {String} loggingEnabled
     */
    _exports.prototype['loggingEnabled'] = undefined;
    /**
     * A list of recipient event statuses that will trigger Connect to send updates to   the endpoint specified in the url property.  To receive notifications, you must include either an `envelopeEvents` node or a `recipientEvents` node. You do not need to specify both.
     * @member {Array.<module:model/RecipientEvent>} recipientEvents
     */
    _exports.prototype['recipientEvents'] = undefined;
    /**
     * When set to **true**, the DocuSign Connect service checks that the message was received and retries on failures.
     * @member {String} requireAcknowledgment
     */
    _exports.prototype['requireAcknowledgment'] = undefined;
    /**
     * When set to **true**, messages are signed with an X509 certificate. This provides support for 2-way SSL in the envelope.
     * @member {String} signMessageWithX509Cert
     */
    _exports.prototype['signMessageWithX509Cert'] = undefined;
    /**
     * This lists the namespace in the SOAP listener provided.
     * @member {String} soapNameSpace
     */
    _exports.prototype['soapNameSpace'] = undefined;
    /**
     * Specifies the endpoint to which envelope updates are sent. Updates are sent as XML unless `useSoapInterface` property is set to **true**.
     * @member {String} url
     */
    _exports.prototype['url'] = undefined;
    /**
     * When set to **true**, this tells the Connect service that the user's endpoint has implemented a SOAP interface.
     * @member {String} useSoapInterface
     */
    _exports.prototype['useSoapInterface'] = undefined;

    return _exports;
});