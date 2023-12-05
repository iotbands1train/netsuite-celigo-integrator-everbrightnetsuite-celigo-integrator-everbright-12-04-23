/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ErrorDetails', './MergeField'], function (helpersModule, errorDetailsModel, mergeFieldModel) {
    /**
     * The CustomField model module.
     * @module model/CustomField
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>CustomField</code>.
     * @alias module:model/CustomField
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>CustomField</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/CustomField} obj Optional instance to populate.
     * @return {module:model/CustomField} The populated <code>CustomField</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('customFieldType')) {
                obj['customFieldType'] = helpersModule.convertToType(data['customFieldType'], 'String');
            }
            if (data.hasOwnProperty('errorDetails')) {
                obj['errorDetails'] = ErrorDetails.constructFromObject(data['errorDetails']);
            }
            if (data.hasOwnProperty('fieldId')) {
                obj['fieldId'] = helpersModule.convertToType(data['fieldId'], 'String');
            }
            if (data.hasOwnProperty('listItems')) {
                obj['listItems'] = helpersModule.convertToType(data['listItems'], ['String']);
            }
            if (data.hasOwnProperty('name')) {
                obj['name'] = helpersModule.convertToType(data['name'], 'String');
            }
            if (data.hasOwnProperty('required')) {
                obj['required'] = helpersModule.convertToType(data['required'], 'String');
            }
            if (data.hasOwnProperty('show')) {
                obj['show'] = helpersModule.convertToType(data['show'], 'String');
            }
            if (data.hasOwnProperty('value')) {
                obj['value'] = helpersModule.convertToType(data['value'], 'String');
            }
        }
        return obj;
    };

    /**
     *
     * @member {String} customFieldType
     */
    _exports.prototype['customFieldType'] = undefined;
    /**
     * @member {module:model/ErrorDetails} errorDetails
     */
    _exports.prototype['errorDetails'] = undefined;
    /**
     *
     * @member {String} fieldId
     */
    _exports.prototype['fieldId'] = undefined;
    /**
     *
     * @member {Array.<String>} listItems
     */
    _exports.prototype['listItems'] = undefined;
    /**
     *
     * @member {String} name
     */
    _exports.prototype['name'] = undefined;
    /**
     * When set to **true**, the signer is required to fill out this tab
     * @member {String} required
     */
    _exports.prototype['required'] = undefined;
    /**
     *
     * @member {String} show
     */
    _exports.prototype['show'] = undefined;
    /**
     * Specifies the value of the tab.
     * @member {String} value
     */
    _exports.prototype['value'] = undefined;

    return _exports;
});