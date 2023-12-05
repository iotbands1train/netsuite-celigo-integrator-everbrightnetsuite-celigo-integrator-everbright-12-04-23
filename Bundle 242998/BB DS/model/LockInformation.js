/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ErrorDetails', './UserInfo'], function (helpersModule, errorDetailsModel, userInfoModel) {
    /**
     * The LockInformation model module.
     * @module model/LockInformation
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>LockInformation</code>.
     * @alias module:model/LockInformation
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>LockInformation</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/LockInformation} obj Optional instance to populate.
     * @return {module:model/LockInformation} The populated <code>LockInformation</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('errorDetails')) {
                obj['errorDetails'] = errorDetailsModel.constructFromObject(data['errorDetails']);
            }
            if (data.hasOwnProperty('lockDurationInSeconds')) {
                obj['lockDurationInSeconds'] = helpersModule.convertToType(data['lockDurationInSeconds'], 'String');
            }
            if (data.hasOwnProperty('lockedByApp')) {
                obj['lockedByApp'] = helpersModule.convertToType(data['lockedByApp'], 'String');
            }
            if (data.hasOwnProperty('lockedByUser')) {
                obj['lockedByUser'] = userInfoModel.constructFromObject(data['lockedByUser']);
            }
            if (data.hasOwnProperty('lockedUntilDateTime')) {
                obj['lockedUntilDateTime'] = helpersModule.convertToType(data['lockedUntilDateTime'], 'String');
            }
            if (data.hasOwnProperty('lockToken')) {
                obj['lockToken'] = helpersModule.convertToType(data['lockToken'], 'String');
            }
            if (data.hasOwnProperty('lockType')) {
                obj['lockType'] = helpersModule.convertToType(data['lockType'], 'String');
            }
            if (data.hasOwnProperty('useScratchPad')) {
                obj['useScratchPad'] = helpersModule.convertToType(data['useScratchPad'], 'String');
            }
        }
        return obj;
    };

    /**
     * @member {module:model/ErrorDetails} errorDetails
     */
    _exports.prototype['errorDetails'] = undefined;
    /**
     * Sets the time, in seconds, until the lock expires when there is no activity on the envelope.  If no value is entered, then the default value of 300 seconds is used. The maximum value is 1,800 seconds.  The lock duration can be extended.
     * @member {String} lockDurationInSeconds
     */
    _exports.prototype['lockDurationInSeconds'] = undefined;
    /**
     * Specifies the friendly name of  the application that is locking the envelope.
     * @member {String} lockedByApp
     */
    _exports.prototype['lockedByApp'] = undefined;
    /**
     * @member {module:model/UserInfo} lockedByUser
     */
    _exports.prototype['lockedByUser'] = undefined;
    /**
     * The datetime until the envelope lock expires.
     * @member {String} lockedUntilDateTime
     */
    _exports.prototype['lockedUntilDateTime'] = undefined;
    /**
     * A unique identifier provided to the owner of the envelope lock.   Used to prove ownership of the lock.
     * @member {String} lockToken
     */
    _exports.prototype['lockToken'] = undefined;
    /**
     * The type of envelope lock.  Currently \"edit\" is the only supported type.
     * @member {String} lockType
     */
    _exports.prototype['lockType'] = undefined;
    /**
     * Reserved for future use.  Indicates whether a scratchpad is used for editing information.
     * @member {String} useScratchPad
     */
    _exports.prototype['useScratchPad'] = undefined;


    return _exports;
});


