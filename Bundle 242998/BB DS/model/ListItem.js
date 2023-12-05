/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The ListItem model module.
     * @module model/ListItem
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>ListItem</code>.
     * @alias module:model/ListItem
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>ListItem</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ListItem} obj Optional instance to populate.
     * @return {module:model/ListItem} The populated <code>ListItem</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('selected')) {
                obj['selected'] = helpersModule.convertToType(data['selected'], 'String');
            }
            if (data.hasOwnProperty('text')) {
                obj['text'] = helpersModule.convertToType(data['text'], 'String');
            }
            if (data.hasOwnProperty('value')) {
                obj['value'] = helpersModule.convertToType(data['value'], 'String');
            }
        }
        return obj;
    };

    /**
     * When set to **true**, indicates that this item is the default selection shown to a signer.   Only one selection can be set as the default.
     * @member {String} selected
     */
    _exports.prototype['selected'] = undefined;
    /**
     * Specifies the text that is shown in the dropdown list.
     * @member {String} text
     */
    _exports.prototype['text'] = undefined;
    /**
     * Specifies the value that is used when the list item is selected.
     * @member {String} value
     */
    _exports.prototype['value'] = undefined;

    return _exports;
});


