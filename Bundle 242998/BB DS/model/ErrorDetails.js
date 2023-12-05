/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function(helpersModule) {
    /**
     * The ErrorDetails model module.
     * @module model/ErrorDetails
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>ErrorDetails</code>.
     * This object describes errors that occur. It is only valid for responses, and ignored in requests.
     * @alias module:model/ErrorDetails
     * @class
     */
    var exports = function() {
        var _this = this;
    };

    /**
     * Constructs a <code>ErrorDetails</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ErrorDetails} obj Optional instance to populate.
     * @return {module:model/ErrorDetails} The populated <code>ErrorDetails</code> instance.
     */
    exports.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new exports();

            if (data.hasOwnProperty('errorCode')) {
                obj['errorCode'] = helpersModule.convertToType(data['errorCode'], 'String');
            }
            if (data.hasOwnProperty('message')) {
                obj['message'] = helpersModule.convertToType(data['message'], 'String');
            }
        }
        return obj;
    };

    /**
     * An error code associated with the error.
     * @member {String} errorCode
     */
    exports.prototype['errorCode'] = undefined;
    /**
     * A short error message.
     * @member {String} message
     */
    exports.prototype['message'] = undefined;

    return exports;
});

