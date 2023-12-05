/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The Money model module.
     * @module model/Money
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>Money</code>.
     * @alias module:model/Money
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>Money</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/Money} obj Optional instance to populate.
     * @return {module:model/Money} The populated <code>Money</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('amountInBaseUnit')) {
                obj['amountInBaseUnit'] = helpersModule.convertToType(data['amountInBaseUnit'], 'String');
            }
            if (data.hasOwnProperty('currency')) {
                obj['currency'] = helpersModule.convertToType(data['currency'], 'String');
            }
            if (data.hasOwnProperty('displayAmount')) {
                obj['displayAmount'] = helpersModule.convertToType(data['displayAmount'], 'String');
            }
        }
        return obj;
    };

    /**
     *
     * @member {String} amountInBaseUnit
     */
    _exports.prototype['amountInBaseUnit'] = undefined;
    /**
     *
     * @member {String} currency
     */
    _exports.prototype['currency'] = undefined;
    /**
     *
     * @member {String} displayAmount
     */
    _exports.prototype['displayAmount'] = undefined;

    return _exports;
});


