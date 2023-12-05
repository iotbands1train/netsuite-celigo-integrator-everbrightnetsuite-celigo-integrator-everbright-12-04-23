/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The RecipientPhoneAuthentication model module.
     * @module model/RecipientPhoneAuthentication
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>RecipientPhoneAuthentication</code>.
     * A complex type that Contains the elements:  * recipMayProvideNumber - Boolean. When set to **true**, the recipient can use whatever phone number they choose. * senderProvidedNumbers - ArrayOfString.  A list of phone numbers the recipient can use. * recordVoicePrint - Reserved. * validateRecipProvidedNumber - Reserved.
     * @alias module:model/RecipientPhoneAuthentication
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>RecipientPhoneAuthentication</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/RecipientPhoneAuthentication} obj Optional instance to populate.
     * @return {module:model/RecipientPhoneAuthentication} The populated <code>RecipientPhoneAuthentication</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('recipMayProvideNumber')) {
                obj['recipMayProvideNumber'] = helpersModule.convertToType(data['recipMayProvideNumber'], 'String');
            }
            if (data.hasOwnProperty('recordVoicePrint')) {
                obj['recordVoicePrint'] = helpersModule.convertToType(data['recordVoicePrint'], 'String');
            }
            if (data.hasOwnProperty('senderProvidedNumbers')) {
                obj['senderProvidedNumbers'] = helpersModule.convertToType(data['senderProvidedNumbers'], ['String']);
            }
            if (data.hasOwnProperty('validateRecipProvidedNumber')) {
                obj['validateRecipProvidedNumber'] = helpersModule.convertToType(data['validateRecipProvidedNumber'], 'String');
            }
        }
        return obj;
    };

    /**
     * Boolean. When set to **true**, the recipient can supply a phone number their choice.
     * @member {String} recipMayProvideNumber
     */
    _exports.prototype['recipMayProvideNumber'] = undefined;
    /**
     * Reserved.
     * @member {String} recordVoicePrint
     */
    _exports.prototype['recordVoicePrint'] = undefined;
    /**
     * An Array containing a list of phone numbers the recipient may use for SMS text authentication.
     * @member {Array.<String>} senderProvidedNumbers
     */
    _exports.prototype['senderProvidedNumbers'] = undefined;
    /**
     *  Reserved.
     * @member {String} validateRecipProvidedNumber
     */
    _exports.prototype['validateRecipProvidedNumber'] = undefined;

    return _exports;
});