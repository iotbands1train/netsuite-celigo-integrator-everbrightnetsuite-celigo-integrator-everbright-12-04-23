/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The RecipientAttachment model module.
     * @module model/RecipientAttachment
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>RecipientAttachment</code>.
     * @alias module:model/RecipientAttachment
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>RecipientAttachment</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/RecipientAttachment} obj Optional instance to populate.
     * @return {module:model/RecipientAttachment} The populated <code>RecipientAttachment</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('attachmentId')) {
                obj['attachmentId'] = helpersModule.convertToType(data['attachmentId'], 'String');
            }
            if (data.hasOwnProperty('attachmentType')) {
                obj['attachmentType'] = helpersModule.convertToType(data['attachmentType'], 'String');
            }
            if (data.hasOwnProperty('data')) {
                obj['data'] = helpersModule.convertToType(data['data'], 'String');
            }
            if (data.hasOwnProperty('label')) {
                obj['label'] = helpersModule.convertToType(data['label'], 'String');
            }
            if (data.hasOwnProperty('name')) {
                obj['name'] = helpersModule.convertToType(data['name'], 'String');
            }
            if (data.hasOwnProperty('remoteUrl')) {
                obj['remoteUrl'] = helpersModule.convertToType(data['remoteUrl'], 'String');
            }
        }
        return obj;
    };

    /**
     *
     * @member {String} attachmentId
     */
    _exports.prototype['attachmentId'] = undefined;
    /**
     *
     * @member {String} attachmentType
     */
    _exports.prototype['attachmentType'] = undefined;
    /**
     *
     * @member {String} data
     */
    _exports.prototype['data'] = undefined;
    /**
     *
     * @member {String} label
     */
    _exports.prototype['label'] = undefined;
    /**
     *
     * @member {String} name
     */
    _exports.prototype['name'] = undefined;
    /**
     *
     * @member {String} remoteUrl
     */
    _exports.prototype['remoteUrl'] = undefined;

    return _exports;
});


