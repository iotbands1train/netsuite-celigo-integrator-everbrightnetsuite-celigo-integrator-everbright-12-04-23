/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The AddressInformation model module.
     * @module model/AddressInformation
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>AddressInformation</code>.
     * Contains address information.
     * @alias module:model/AddressInformation
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>AddressInformation</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/AddressInformation} obj Optional instance to populate.
     * @return {module:model/AddressInformation} The populated <code>AddressInformation</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('city')) {
                obj['city'] = helpersModule.convertToType(data['city'], 'String');
            }
            if (data.hasOwnProperty('country')) {
                obj['country'] = helpersModule.convertToType(data['country'], 'String');
            }
            if (data.hasOwnProperty('fax')) {
                obj['fax'] = helpersModule.convertToType(data['fax'], 'String');
            }
            if (data.hasOwnProperty('phone')) {
                obj['phone'] = helpersModule.convertToType(data['phone'], 'String');
            }
            if (data.hasOwnProperty('state')) {
                obj['state'] = helpersModule.convertToType(data['state'], 'String');
            }
            if (data.hasOwnProperty('street1')) {
                obj['street1'] = helpersModule.convertToType(data['street1'], 'String');
            }
            if (data.hasOwnProperty('street2')) {
                obj['street2'] = helpersModule.convertToType(data['street2'], 'String');
            }
            if (data.hasOwnProperty('zip')) {
                obj['zip'] = helpersModule.convertToType(data['zip'], 'String');
            }
        }
        return obj;
    };

    /**
     * The city associated with the address.
     * @member {String} city
     */
    _exports.prototype['city'] = undefined;
    /**
     * Specifies the country associated with the address.
     * @member {String} country
     */
    _exports.prototype['country'] = undefined;
    /**
     * A Fax number associated with the address if one is available.
     * @member {String} fax
     */
    _exports.prototype['fax'] = undefined;
    /**
     * A phone number associated with the address.
     * @member {String} phone
     */
    _exports.prototype['phone'] = undefined;
    /**
     * The state or province associated with the address.
     * @member {String} state
     */
    _exports.prototype['state'] = undefined;
    /**
     * The first line of the address.
     * @member {String} street1
     */
    _exports.prototype['street1'] = undefined;
    /**
     * The second line of the address (optional).
     * @member {String} street2
     */
    _exports.prototype['street2'] = undefined;
    /**
     * The zip or postal code associated with the address.
     * @member {String} zip
     */
    _exports.prototype['zip'] = undefined;

    return _exports;
});