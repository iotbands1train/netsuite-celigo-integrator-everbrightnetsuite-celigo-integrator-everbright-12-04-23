/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The DobInformationInput model module.
     * @module model/DobInformationInput
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>DobInformationInput</code>.
     * Complex type containing:  * dateOfBirth * displayLevelCode * receiveInResponse
     * @alias module:model/DobInformationInput
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>DobInformationInput</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/DobInformationInput} obj Optional instance to populate.
     * @return {module:model/DobInformationInput} The populated <code>DobInformationInput</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('dateOfBirth')) {
                obj['dateOfBirth'] = helpersModule.convertToType(data['dateOfBirth'], 'String');
            }
            if (data.hasOwnProperty('displayLevelCode')) {
                obj['displayLevelCode'] = helpersModule.convertToType(data['displayLevelCode'], 'String');
            }
            if (data.hasOwnProperty('receiveInResponse')) {
                obj['receiveInResponse'] = helpersModule.convertToType(data['receiveInResponse'], 'String');
            }
        }
        return obj;
    };

    /**
     * Specifies the recipient's date, month, and year of birth.
     * @member {String} dateOfBirth
     */
    _exports.prototype['dateOfBirth'] = undefined;
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

    return _exports;
});