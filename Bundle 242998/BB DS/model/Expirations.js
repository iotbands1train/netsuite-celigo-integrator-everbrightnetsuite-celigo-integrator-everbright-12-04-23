/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The Expirations model module.
     * @module model/Expirations
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>Expirations</code>.
     * A complex element that specifies the expiration settings for the envelope.
     * @alias module:model/Expirations
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>Expirations</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/Expirations} obj Optional instance to populate.
     * @return {module:model/Expirations} The populated <code>Expirations</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('expireAfter')) {
                obj['expireAfter'] = helpersModule.convertToType(data['expireAfter'], 'String');
            }
            if (data.hasOwnProperty('expireEnabled')) {
                obj['expireEnabled'] = helpersModule.convertToType(data['expireEnabled'], 'String');
            }
            if (data.hasOwnProperty('expireWarn')) {
                obj['expireWarn'] = helpersModule.convertToType(data['expireWarn'], 'String');
            }
        }
        return obj;
    };

    /**
     * An integer that sets the number of days the envelope is active.
     * @member {String} expireAfter
     */
    _exports.prototype['expireAfter'] = undefined;
    /**
     * When set to **true**, the envelope expires (is no longer available for signing) in the set number of days. If false, the account default setting is used. If the account does not have an expiration setting, the DocuSign default value of 120 days is used.
     * @member {String} expireEnabled
     */
    _exports.prototype['expireEnabled'] = undefined;
    /**
     * An integer that sets the number of days before envelope expiration that an expiration warning email is sent to the recipient. If set to 0 (zero), no warning email is sent.
     * @member {String} expireWarn
     */
    _exports.prototype['expireWarn'] = undefined;


    return _exports;
});


