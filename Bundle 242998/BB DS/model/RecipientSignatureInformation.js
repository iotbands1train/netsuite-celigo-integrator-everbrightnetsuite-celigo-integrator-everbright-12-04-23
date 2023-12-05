/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The RecipientSignatureInformation model module.
     * @module model/RecipientSignatureInformation
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>RecipientSignatureInformation</code>.
     * Allows the sender to pre-specify the signature name, signature initials and signature font used in the signature stamp for the recipient.  Used only with recipient types In Person Signers and Signers.
     * @alias module:model/RecipientSignatureInformation
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>RecipientSignatureInformation</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/RecipientSignatureInformation} obj Optional instance to populate.
     * @return {module:model/RecipientSignatureInformation} The populated <code>RecipientSignatureInformation</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('fontStyle')) {
                obj['fontStyle'] = helpersModule.convertToType(data['fontStyle'], 'String');
            }
            if (data.hasOwnProperty('signatureInitials')) {
                obj['signatureInitials'] = helpersModule.convertToType(data['signatureInitials'], 'String');
            }
            if (data.hasOwnProperty('signatureName')) {
                obj['signatureName'] = helpersModule.convertToType(data['signatureName'], 'String');
            }
        }
        return obj;
    };

    /**
     *
     * @member {String} fontStyle
     */
    _exports.prototype['fontStyle'] = undefined;
    /**
     *
     * @member {String} signatureInitials
     */
    _exports.prototype['signatureInitials'] = undefined;
    /**
     * Specifies the user signature name.
     * @member {String} signatureName
     */
    _exports.prototype['signatureName'] = undefined;
    
    return _exports;
});