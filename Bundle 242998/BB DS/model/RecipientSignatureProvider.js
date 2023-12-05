/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './RecipientSignatureProviderOptions'], function (helpersModule, recipientSignatureProviderOptionsModel) {
    /**
     * The RecipientSignatureProvider model module.
     * @module model/RecipientSignatureProvider
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>RecipientSignatureProvider</code>.
     * @alias module:model/RecipientSignatureProvider
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>RecipientSignatureProvider</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/RecipientSignatureProvider} obj Optional instance to populate.
     * @return {module:model/RecipientSignatureProvider} The populated <code>RecipientSignatureProvider</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('sealDocumentsWithTabsOnly')) {
                obj['sealDocumentsWithTabsOnly'] = helpersModule.convertToType(data['sealDocumentsWithTabsOnly'], 'String');
            }
            if (data.hasOwnProperty('sealName')) {
                obj['sealName'] = helpersModule.convertToType(data['sealName'], 'String');
            }
            if (data.hasOwnProperty('signatureProviderName')) {
                obj['signatureProviderName'] = helpersModule.convertToType(data['signatureProviderName'], 'String');
            }
            if (data.hasOwnProperty('signatureProviderOptions')) {
                obj['signatureProviderOptions'] = recipientSignatureProviderOptionsModel.constructFromObject(data['signatureProviderOptions']);
            }
        }
        return obj;
    };

    /**
     *
     * @member {String} sealDocumentsWithTabsOnly
     */
    _exports.prototype['sealDocumentsWithTabsOnly'] = undefined;
    /**
     *
     * @member {String} sealName
     */
    _exports.prototype['sealName'] = undefined;
    /**
     *
     * @member {String} signatureProviderName
     */
    _exports.prototype['signatureProviderName'] = undefined;
    /**
     * @member {module:model/RecipientSignatureProviderOptions} signatureProviderOptions
     */
    _exports.prototype['signatureProviderOptions'] = undefined;
    
    return _exports;
});