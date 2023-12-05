/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The Reminders model module.
     * @module model/Reminders
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>Reminders</code>.
     * A complex element that specifies reminder settings for the envelope
     * @alias module:model/Reminders
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>Reminders</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/Reminders} obj Optional instance to populate.
     * @return {module:model/Reminders} The populated <code>Reminders</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('reminderDelay')) {
                obj['reminderDelay'] = helpersModule.convertToType(data['reminderDelay'], 'String');
            }
            if (data.hasOwnProperty('reminderEnabled')) {
                obj['reminderEnabled'] = helpersModule.convertToType(data['reminderEnabled'], 'String');
            }
            if (data.hasOwnProperty('reminderFrequency')) {
                obj['reminderFrequency'] = helpersModule.convertToType(data['reminderFrequency'], 'String');
            }
        }
        return obj;
    };

    /**
     * An interger that sets the number of days after the recipient receives the envelope that reminder emails are sent to the recipient.
     * @member {String} reminderDelay
     */
    _exports.prototype['reminderDelay'] = undefined;
    /**
     * When set to **true**, the envelope expires (is no longer available for signing) in the set number of days. If false, the account default setting is used. If the account does not have an expiration setting, the DocuSign default value of 120 days is used.
     * @member {String} reminderEnabled
     */
    _exports.prototype['reminderEnabled'] = undefined;
    /**
     * An interger that sets the interval, in days, between reminder emails.
     * @member {String} reminderFrequency
     */
    _exports.prototype['reminderFrequency'] = undefined;

    return _exports;
});


