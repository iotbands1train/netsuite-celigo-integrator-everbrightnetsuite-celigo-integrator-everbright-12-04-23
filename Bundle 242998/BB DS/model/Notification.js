/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './Expirations', './Reminders'], function (helpersModule, expirationsModel, remindersModel) {
    /**
     * The Notification model module.
     * @module model/Notification
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>Notification</code>.
     * A complex element that specifies the notification options for the envelope. It consists of:  * useAccountDefaults - When set to **true**, the account default notification settings are used for the envelope.  * reminders - A complex element that specifies reminder settings for the envelope. It consists of:      * reminderEnabled - When set to **true**, a reminder message is sent to the recipient.    * reminderDelay - An interger that sets the number of days after the recipient receives the envelope that reminder emails are sent to the recipient.     * reminderFrequency - An interger that sets the interval, in days, between reminder emails.   * expirations - A complex element that specifies the expiration settings for the envelope. It consists of:     * expireEnabled - When set to **true**, the envelope expires (is no longer available for signing) in the set number of days. If false, the account default setting is used. If the account does not have an expiration setting, the DocuSign default value of 120 days is used.     * expireAfter - An integer that sets the number of days the envelope is active.    * expireWarn - An integer that sets the number of days before envelope expiration that an expiration warning email is sent to the recipient. If set to 0 (zero), no warning email is sent.
     * @alias module:model/Notification
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>Notification</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/Notification} obj Optional instance to populate.
     * @return {module:model/Notification} The populated <code>Notification</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('expirations')) {
                obj['expirations'] = expirationsModel.constructFromObject(data['expirations']);
            }
            if (data.hasOwnProperty('reminders')) {
                obj['reminders'] = remindersModel.constructFromObject(data['reminders']);
            }
            if (data.hasOwnProperty('useAccountDefaults')) {
                obj['useAccountDefaults'] = helpersModule.convertToType(data['useAccountDefaults'], 'String');
            }
        }
        return obj;
    };

    /**
     * @member {module:model/Expirations} expirations
     */
    _exports.prototype['expirations'] = undefined;
    /**
     * @member {module:model/Reminders} reminders
     */
    _exports.prototype['reminders'] = undefined;
    /**
     * When set to **true**, the account default notification settings are used for the envelope.
     * @member {String} useAccountDefaults
     */
    _exports.prototype['useAccountDefaults'] = undefined;

    return _exports;
});