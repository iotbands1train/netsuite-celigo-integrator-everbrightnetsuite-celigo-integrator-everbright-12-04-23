/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ListCustomField', './TextCustomField'], function (helpersModule, listCustomFieldModel, textCustomFieldModel) {
    /**
     * The CustomFields model module.
     * @module model/CustomFields
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>CustomFields</code>.
     * Contains information about custom fields.
     * @alias module:model/CustomFields
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>CustomFields</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/CustomFields} obj Optional instance to populate.
     * @return {module:model/CustomFields} The populated <code>CustomFields</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('listCustomFields')) {
                obj['listCustomFields'] = helpersModule.convertToType(data['listCustomFields'], [listCustomFieldModel]);
            }
            if (data.hasOwnProperty('textCustomFields')) {
                obj['textCustomFields'] = helpersModule.convertToType(data['textCustomFields'], [textCustomFieldModel]);
            }
        }
        return obj;
    };

    /**
     * An array of list custom fields.
     * @member {Array.<module:model/ListCustomField>} listCustomFields
     */
    _exports.prototype['listCustomFields'] = undefined;
    /**
     * An array of text custom fields.
     * @member {Array.<module:model/TextCustomField>} textCustomFields
     */
    _exports.prototype['textCustomFields'] = undefined;

    return _exports;
});


