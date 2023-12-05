/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './SamlAssertionAttribute'], function (helpersModule, samlAssertionAttributeModel) {
    /**
     * The RecipientSAMLAuthentication model module.
     * @module model/RecipientSAMLAuthentication
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>RecipientSAMLAuthentication</code>.
     * Contains the name/value pair information for the SAML assertion attributes:  * name - The name of the SAML assertion attribute. * value - The value associated with the named SAML assertion attribute.   Your account must be set up to use SSO to use this.
     * @alias module:model/RecipientSAMLAuthentication
     * @class
     */
    var _exports = function () {
        var _this = this;


    };

    /**
     * Constructs a <code>RecipientSAMLAuthentication</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/RecipientSAMLAuthentication} obj Optional instance to populate.
     * @return {module:model/RecipientSAMLAuthentication} The populated <code>RecipientSAMLAuthentication</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('samlAssertionAttributes')) {
                obj['samlAssertionAttributes'] = helpersModule.convertToType(data['samlAssertionAttributes'], [samlAssertionAttributeModel]);
            }
        }
        return obj;
    };

    /**
     *
     * @member {Array.<module:model/SamlAssertionAttribute>} samlAssertionAttributes
     */
    _exports.prototype['samlAssertionAttributes'] = undefined;

    return _exports;
});