/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ErrorDetails', './MergeField'], function (helpersModule, errorDetailsModel, mergeFieldModel) {
    /**
     * The DocumentVisibility model module.
     * @module model/DocumentVisibility
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>DocumentVisibility</code>.
     * @alias module:model/DocumentVisibility
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>DocumentVisibility</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/DocumentVisibility} obj Optional instance to populate.
     * @return {module:model/DocumentVisibility} The populated <code>DocumentVisibility</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('documentId')) {
                obj['documentId'] = helpersModule.convertToType(data['documentId'], 'String');
            }
            if (data.hasOwnProperty('errorDetails')) {
                obj['errorDetails'] = ErrorDetails.constructFromObject(data['errorDetails']);
            }
            if (data.hasOwnProperty('recipientId')) {
                obj['recipientId'] = helpersModule.convertToType(data['recipientId'], 'String');
            }
            if (data.hasOwnProperty('rights')) {
                obj['rights'] = helpersModule.convertToType(data['rights'], 'String');
            }
            if (data.hasOwnProperty('visible')) {
                obj['visible'] = helpersModule.convertToType(data['visible'], 'String');
            }
        }
        return obj;
    };

    /**
     * Specifies the document ID number that the tab is placed on. This must refer to an existing Document's ID attribute.
     * @member {String} documentId
     */
    _exports.prototype['documentId'] = undefined;
    /**
     * @member {module:model/ErrorDetails} errorDetails
     */
    _exports.prototype['errorDetails'] = undefined;
    /**
     * Unique for the recipient. It is used by the tab element to indicate which recipient is to sign the Document.
     * @member {String} recipientId
     */
    _exports.prototype['recipientId'] = undefined;
    /**
     *
     * @member {String} rights
     */
    _exports.prototype['rights'] = undefined;
    /**
     *
     * @member {String} visible
     */
    _exports.prototype['visible'] = undefined;

    return _exports;
});