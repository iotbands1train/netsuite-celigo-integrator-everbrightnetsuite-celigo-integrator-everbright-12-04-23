/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The EventResult model module.
     * @module model/EventResult
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>EventResult</code>.
     * @alias module:model/EventResult
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>EventResult</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/EventResult} obj Optional instance to populate.
     * @return {module:model/EventResult} The populated <code>EventResult</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('eventTimestamp')) {
                obj['eventTimestamp'] = helpersModule.convertToType(data['eventTimestamp'], 'String');
            }
            if (data.hasOwnProperty('failureDescription')) {
                obj['failureDescription'] = helpersModule.convertToType(data['failureDescription'], 'String');
            }
            if (data.hasOwnProperty('status')) {
                obj['status'] = helpersModule.convertToType(data['status'], 'String');
            }
            if (data.hasOwnProperty('vendorFailureStatusCode')) {
                obj['vendorFailureStatusCode'] = helpersModule.convertToType(data['vendorFailureStatusCode'], 'String');
            }
        }
        return obj;
    };

    /**
     *
     * @member {String} eventTimestamp
     */
    _exports.prototype['eventTimestamp'] = undefined;
    /**
     *
     * @member {String} failureDescription
     */
    _exports.prototype['failureDescription'] = undefined;
    /**
     * Indicates the envelope status. Valid values are:  * sent - The envelope is sent to the recipients.  * created - The envelope is saved as a draft and can be modified and sent later.
     * @member {String} status
     */
    _exports.prototype['status'] = undefined;
    /**
     *
     * @member {String} vendorFailureStatusCode
     */
    _exports.prototype['vendorFailureStatusCode'] = undefined;

    return _exports;
});