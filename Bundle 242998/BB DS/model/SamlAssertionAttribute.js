/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ErrorDetails'], function (helpersModule, errorDetailsModel) {
    /**
     * The SamlAssertionAttribute model module.
     * @module model/SamlAssertionAttribute
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>SamlAssertionAttribute</code>.
     * @alias module:model/SamlAssertionAttribute
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>SamlAssertionAttribute</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/SamlAssertionAttribute} obj Optional instance to populate.
     * @return {module:model/SamlAssertionAttribute} The populated <code>SamlAssertionAttribute</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('errorDetails')) {
                obj['errorDetails'] = errorDetailsModel.constructFromObject(data['errorDetails']);
            }
            if (data.hasOwnProperty('name')) {
                obj['name'] = helpersModule.convertToType(data['name'], 'String');
            }
            if (data.hasOwnProperty('originalValue')) {
                obj['originalValue'] = helpersModule.convertToType(data['originalValue'], 'String');
            }
            if (data.hasOwnProperty('value')) {
                obj['value'] = helpersModule.convertToType(data['value'], 'String');
            }
        }
        return obj;
    };

    /**
     * @member {module:model/ErrorDetails} errorDetails
     */
    _exports.prototype['errorDetails'] = undefined;
    /**
     *
     * @member {String} name
     */
    _exports.prototype['name'] = undefined;
    /**
     * The initial value of the tab when it was sent to the recipient.
     * @member {String} originalValue
     */
    _exports.prototype['originalValue'] = undefined;
    /**
     * The value associated with the named SAML assertion attribute
     * @member {String} value
     */
    _exports.prototype['value'] = undefined;

    return _exports;
});