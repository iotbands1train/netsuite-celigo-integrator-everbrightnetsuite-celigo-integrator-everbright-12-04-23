/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The RecipientSMSAuthentication model module.
     * @module model/RecipientSMSAuthentication
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>RecipientSMSAuthentication</code>.
     * Contains the element senderProvidedNumbers which is an Array  of phone numbers the recipient can use for SMS text authentication.
     * @alias module:model/RecipientSMSAuthentication
     * @class
     */
    var exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>RecipientSMSAuthentication</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/RecipientSMSAuthentication} obj Optional instance to populate.
     * @return {module:model/RecipientSMSAuthentication} The populated <code>RecipientSMSAuthentication</code> instance.
     */
    exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new exports();

            if (data.hasOwnProperty('senderProvidedNumbers')) {
                obj['senderProvidedNumbers'] = ApiClient.convertToType(data['senderProvidedNumbers'], ['String']);
            }
        }
        return obj;
    };

    /**
     * An Array containing a list of phone numbers the recipient may use for SMS text authentication.
     * @member {Array.<String>} senderProvidedNumbers
     */
    exports.prototype['senderProvidedNumbers'] = undefined;

    return exports;
});