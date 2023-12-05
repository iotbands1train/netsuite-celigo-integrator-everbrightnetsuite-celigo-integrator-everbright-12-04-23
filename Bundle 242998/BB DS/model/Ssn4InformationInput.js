/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The Ssn4InformationInput model module.
     * @module model/Ssn4InformationInput
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>Ssn4InformationInput</code>.
     * @alias module:model/Ssn4InformationInput
     * @class
     */
    var _exports = function () {
        var _this = this;


    };

    /**
     * Constructs a <code>Ssn4InformationInput</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/Ssn4InformationInput} obj Optional instance to populate.
     * @return {module:model/Ssn4InformationInput} The populated <code>Ssn4InformationInput</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('displayLevelCode')) {
                obj['displayLevelCode'] = helpersModule.convertToType(data['displayLevelCode'], 'String');
            }
            if (data.hasOwnProperty('receiveInResponse')) {
                obj['receiveInResponse'] = helpersModule.convertToType(data['receiveInResponse'], 'String');
            }
            if (data.hasOwnProperty('ssn4')) {
                obj['ssn4'] = helpersModule.convertToType(data['ssn4'], 'String');
            }
        }
        return obj;
    };

    /**
     * Specifies the display level for the recipient.  Valid values are:   * ReadOnly * Editable * DoNotDisplay
     * @member {String} displayLevelCode
     */
    _exports.prototype['displayLevelCode'] = undefined;
    /**
     * When set to **true**, the information needs to be returned in the response.
     * @member {String} receiveInResponse
     */
    _exports.prototype['receiveInResponse'] = undefined;
    /**
     * The last four digits of the recipient's Social Security Number (SSN).
     * @member {String} ssn4
     */
    _exports.prototype['ssn4'] = undefined;

    return _exports;
});


