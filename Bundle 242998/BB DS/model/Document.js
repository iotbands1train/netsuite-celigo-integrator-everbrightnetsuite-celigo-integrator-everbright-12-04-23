/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './MatchBox', './NameValue'], function (helpersModule, matchBoxModel, nameValueModel) {
    /**
     * The Document model module.
     * @module model/Document
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>Document</code>.
     * @alias module:model/Document
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>Document</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/Document} obj Optional instance to populate.
     * @return {module:model/Document} The populated <code>Document</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('applyAnchorTabs')) {
                obj['applyAnchorTabs'] = helpersModule.convertToType(data['applyAnchorTabs'], 'String');
            }
            if (data.hasOwnProperty('authoritativeCopy')) {
                obj['authoritativeCopy'] = helpersModule.convertToType(data['authoritativeCopy'], 'Boolean');
            }
            if (data.hasOwnProperty('display')) {
                obj['display'] = helpersModule.convertToType(data['display'], 'String');
            }
            if (data.hasOwnProperty('documentBase64')) {
                obj['documentBase64'] = helpersModule.convertToType(data['documentBase64'], 'String');
            }
            if (data.hasOwnProperty('documentFields')) {
                obj['documentFields'] = helpersModule.convertToType(data['documentFields'], [nameValueModel]);
            }
            if (data.hasOwnProperty('documentGroup')) {
                obj['documentGroup'] = helpersModule.convertToType(data['documentGroup'], 'String');
            }
            if (data.hasOwnProperty('documentId')) {
                obj['documentId'] = helpersModule.convertToType(data['documentId'], 'String');
            }
            if (data.hasOwnProperty('encryptedWithKeyManager')) {
                obj['encryptedWithKeyManager'] = helpersModule.convertToType(data['encryptedWithKeyManager'], 'String');
            }
            if (data.hasOwnProperty('fileExtension')) {
                obj['fileExtension'] = helpersModule.convertToType(data['fileExtension'], 'String');
            }
            if (data.hasOwnProperty('fileFormatHint')) {
                obj['fileFormatHint'] = helpersModule.convertToType(data['fileFormatHint'], 'String');
            }
            if (data.hasOwnProperty('includeInDownload')) {
                obj['includeInDownload'] = helpersModule.convertToType(data['includeInDownload'], 'String');
            }
            if (data.hasOwnProperty('matchBoxes')) {
                obj['matchBoxes'] = helpersModule.convertToType(data['matchBoxes'], [matchBoxModel]);
            }
            if (data.hasOwnProperty('name')) {
                obj['name'] = helpersModule.convertToType(data['name'], 'String');
            }
            if (data.hasOwnProperty('order')) {
                obj['order'] = helpersModule.convertToType(data['order'], 'String');
            }
            if (data.hasOwnProperty('pages')) {
                obj['pages'] = helpersModule.convertToType(data['pages'], 'String');
            }
            if (data.hasOwnProperty('password')) {
                obj['password'] = helpersModule.convertToType(data['password'], 'String');
            }
            if (data.hasOwnProperty('remoteUrl')) {
                obj['remoteUrl'] = helpersModule.convertToType(data['remoteUrl'], 'String');
            }
            if (data.hasOwnProperty('signerMustAcknowledge')) {
                obj['signerMustAcknowledge'] = helpersModule.convertToType(data['signerMustAcknowledge'], 'String');
            }
            if (data.hasOwnProperty('templateLocked')) {
                obj['templateLocked'] = helpersModule.convertToType(data['templateLocked'], 'String');
            }
            if (data.hasOwnProperty('templateRequired')) {
                obj['templateRequired'] = helpersModule.convertToType(data['templateRequired'], 'String');
            }
            if (data.hasOwnProperty('transformPdfFields')) {
                obj['transformPdfFields'] = helpersModule.convertToType(data['transformPdfFields'], 'String');
            }
            if (data.hasOwnProperty('uri')) {
                obj['uri'] = helpersModule.convertToType(data['uri'], 'String');
            }
        }
        return obj;
    };

    /**
     * Reserved: TBD
     * @member {String} applyAnchorTabs
     */
    _exports.prototype['applyAnchorTabs'] = undefined;
    /**
     * Specifies the Authoritative copy feature. If set to true the Authoritative copy feature is enabled.
     * @member {Boolean} authoritativeCopy
     */
    _exports.prototype['authoritativeCopy'] = undefined;
    /**
     *
     * @member {String} display
     */
    _exports.prototype['display'] = undefined;
    /**
     * The document's bytes. This field can be used to include a base64 version of the document bytes within an envelope definition instead of sending the document using a multi-part HTTP request. The maximum document size is smaller if this field is used due to the overhead of the base64 encoding.
     * @member {String} documentBase64
     */
    _exports.prototype['documentBase64'] = undefined;
    /**
     *
     * @member {Array.<module:model/NameValue>} documentFields
     */
    _exports.prototype['documentFields'] = undefined;
    /**
     *
     * @member {String} documentGroup
     */
    _exports.prototype['documentGroup'] = undefined;
    /**
     * Specifies the document ID number that the tab is placed on. This must refer to an existing Document's ID attribute.
     * @member {String} documentId
     */
    _exports.prototype['documentId'] = undefined;
    /**
     * When set to **true**, the document is been already encrypted by the sender for use with the DocuSign Key Manager Security Appliance.
     * @member {String} encryptedWithKeyManager
     */
    _exports.prototype['encryptedWithKeyManager'] = undefined;
    /**
     * The file extension type of the document. If the document is not a PDF it is converted to a PDF.
     * @member {String} fileExtension
     */
    _exports.prototype['fileExtension'] = undefined;
    /**
     *
     * @member {String} fileFormatHint
     */
    _exports.prototype['fileFormatHint'] = undefined;
    /**
     *
     * @member {String} includeInDownload
     */
    _exports.prototype['includeInDownload'] = undefined;
    /**
     * Matchboxes define areas in a document for document matching when you are creating envelopes. They are only used when you upload and edit a template.   A matchbox consists of 5 elements:  * pageNumber - The document page number  on which the matchbox will appear.  * xPosition - The x position of the matchbox on a page.  * yPosition - The y position of the matchbox on a page. * width - The width of the matchbox.  * height - The height of the matchbox.
     * @member {Array.<module:model/MatchBox>} matchBoxes
     */
    _exports.prototype['matchBoxes'] = undefined;
    /**
     *
     * @member {String} name
     */
    _exports.prototype['name'] = undefined;
    /**
     *
     * @member {String} order
     */
    _exports.prototype['order'] = undefined;
    /**
     *
     * @member {String} pages
     */
    _exports.prototype['pages'] = undefined;
    /**
     *
     * @member {String} password
     */
    _exports.prototype['password'] = undefined;
    /**
     * The file id from the cloud storage service where the document is located. This information is returned using [ML:GET /folders] or [ML:/folders/{folderid}].
     * @member {String} remoteUrl
     */
    _exports.prototype['remoteUrl'] = undefined;
    /**
     *
     * @member {String} signerMustAcknowledge
     */
    _exports.prototype['signerMustAcknowledge'] = undefined;
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
     * When set to **true**, PDF form field data is transformed into document tab values when the PDF form field name matches the DocuSign custom tab tabLabel. The resulting PDF form data is also returned in the PDF meta data when requesting the document PDF. See the [ML:Transform PDF Fields] section for more information about how fields are transformed into DocuSign tabs.
     * @member {String} transformPdfFields
     */
    _exports.prototype['transformPdfFields'] = undefined;
    /**
     *
     * @member {String} uri
     */
    _exports.prototype['uri'] = undefined;

    return _exports;
});