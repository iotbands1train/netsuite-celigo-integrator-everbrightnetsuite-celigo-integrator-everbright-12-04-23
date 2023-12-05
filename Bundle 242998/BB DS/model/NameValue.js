/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './../model/ErrorDetails'], function(helpersModule, errorDetailsModel) {
    /**
     * The NameValue model module.
     * @module model/NameValue
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>NameValue</code>.
     * @alias module:model/NameValue
     * @class
     */
    var exports = function() {
        var _this = this;
    };

    /**
     * Constructs a <code>NameValue</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/NameValue} obj Optional instance to populate.
     * @return {module:model/NameValue} The populated <code>NameValue</code> instance.
     */
    exports.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new exports();

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
    exports.prototype['errorDetails'] = undefined;
    /**
     * The name or key of a name/value pair.
     * @member {String} name
     */
    exports.prototype['name'] = undefined;
    /**
     * The initial value of the tab when it was sent to the recipient.
     * @member {String} originalValue
     */
    exports.prototype['originalValue'] = undefined;
    /**
     * The value field of a name/value pair.
     * @member {String} value
     */
    exports.prototype['value'] = undefined;



    return exports;
});

