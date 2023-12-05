/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ErrorDetails'], function (helpersModule, errorDetailsModel) {
    /**
     * The ListCustomField model module.
     * @module model/ListCustomField
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>ListCustomField</code>.
     * @alias module:model/ListCustomField
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>ListCustomField</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ListCustomField} obj Optional instance to populate.
     * @return {module:model/ListCustomField} The populated <code>ListCustomField</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('configurationType')) {
                obj['configurationType'] = helpersModule.convertToType(data['configurationType'], 'String');
            }
            if (data.hasOwnProperty('errorDetails')) {
                obj['errorDetails'] = errorDetailsModel.constructFromObject(data['errorDetails']);
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
    }

    /**
     * If merge field's are being used, specifies the type of the merge field. The only  supported value is **salesforce**.
     * @member {String} configurationType
     */
    _exports.prototype['configurationType'] = undefined;
    /**
     * @member {module:model/ErrorDetails} errorDetails
     */
    _exports.prototype['errorDetails'] = undefined;
    /**
     * An ID used to specify a custom field.
     * @member {String} fieldId
     */
    _exports.prototype['fieldId'] = undefined;
    /**
     *
     * @member {Array.<String>} listItems
     */
    _exports.prototype['listItems'] = undefined;
    /**
     * The name of the custom field.
     * @member {String} name
     */
    _exports.prototype['name'] = undefined;
    /**
     * When set to **true**, the signer is required to fill out this tab
     * @member {String} required
     */
    _exports.prototype['required'] = undefined;
    /**
     * A boolean indicating if the value should be displayed.
     * @member {String} show
     */
    _exports.prototype['show'] = undefined;
    /**
     * The value of the custom field.  Maximum Length: 100 characters.
     * @member {String} value
     */
    _exports.prototype['value'] = undefined;


    return _exports;
});


