/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The RecipientSignatureProviderOptions model module.
     * @module model/RecipientSignatureProviderOptions
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>RecipientSignatureProviderOptions</code>.
     * @alias module:model/RecipientSignatureProviderOptions
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>RecipientSignatureProviderOptions</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/RecipientSignatureProviderOptions} obj Optional instance to populate.
     * @return {module:model/RecipientSignatureProviderOptions} The populated <code>RecipientSignatureProviderOptions</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('cpfNumber')) {
                obj['cpfNumber'] = helpersModule.convertToType(data['cpfNumber'], 'String');
            }
            if (data.hasOwnProperty('oneTimePassword')) {
                obj['oneTimePassword'] = helpersModule.convertToType(data['oneTimePassword'], 'String');
            }
            if (data.hasOwnProperty('signerRole')) {
                obj['signerRole'] = helpersModule.convertToType(data['signerRole'], 'String');
            }
            if (data.hasOwnProperty('sms')) {
                obj['sms'] = helpersModule.convertToType(data['sms'], 'String');
            }
        }
        return obj;
    };

    /**
     *
     * @member {String} cpfNumber
     */
    _exports.prototype['cpfNumber'] = undefined;
    /**
     *
     * @member {String} oneTimePassword
     */
    _exports.prototype['oneTimePassword'] = undefined;
    /**
     *
     * @member {String} signerRole
     */
    _exports.prototype['signerRole'] = undefined;
    /**
     *
     * @member {String} sms
     */
    _exports.prototype['sms'] = undefined;


    return _exports;
});