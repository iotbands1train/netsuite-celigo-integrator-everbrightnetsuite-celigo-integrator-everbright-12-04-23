/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './AddressInformation'], function (helpersModule, addressInformationModel) {
    /**
     * The AddressInformationInput model module.
     * @module model/AddressInformationInput
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>AddressInformationInput</code>.
     * Contains address input information.
     * @alias module:model/AddressInformationInput
     * @class
     */
    var exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>AddressInformationInput</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/AddressInformationInput} obj Optional instance to populate.
     * @return {module:model/AddressInformationInput} The populated <code>AddressInformationInput</code> instance.
     */
    exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new exports();

            if (data.hasOwnProperty('addressInformation')) {
                obj['addressInformation'] = addressInformationModel.constructFromObject(data['addressInformation']);
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
     * @member {module:model/AddressInformation} addressInformation
     */
    exports.prototype['addressInformation'] = undefined;
    /**
     * Specifies the display level for the recipient.  Valid values are:   * ReadOnly * Editable * DoNotDisplay
     * @member {String} displayLevelCode
     */
    exports.prototype['displayLevelCode'] = undefined;
    /**
     * When set to **true**, the information needs to be returned in the response.
     * @member {String} receiveInResponse
     */
    exports.prototype['receiveInResponse'] = undefined;

    return exports;
});


