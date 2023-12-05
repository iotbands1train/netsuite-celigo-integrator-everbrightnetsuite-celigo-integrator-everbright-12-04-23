/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The OfflineAttributes model module.
     * @module model/OfflineAttributes
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>OfflineAttributes</code>.
     * Reserved for DocuSign use.
     * @alias module:model/OfflineAttributes
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>OfflineAttributes</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/OfflineAttributes} obj Optional instance to populate.
     * @return {module:model/OfflineAttributes} The populated <code>OfflineAttributes</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('accountEsignId')) {
                obj['accountEsignId'] = helpersModule.convertToType(data['accountEsignId'], 'String');
            }
            if (data.hasOwnProperty('deviceModel')) {
                obj['deviceModel'] = helpersModule.convertToType(data['deviceModel'], 'String');
            }
            if (data.hasOwnProperty('deviceName')) {
                obj['deviceName'] = helpersModule.convertToType(data['deviceName'], 'String');
            }
            if (data.hasOwnProperty('gpsLatitude')) {
                obj['gpsLatitude'] = helpersModule.convertToType(data['gpsLatitude'], 'String');
            }
            if (data.hasOwnProperty('gpsLongitude')) {
                obj['gpsLongitude'] = helpersModule.convertToType(data['gpsLongitude'], 'String');
            }
            if (data.hasOwnProperty('offlineSigningHash')) {
                obj['offlineSigningHash'] = helpersModule.convertToType(data['offlineSigningHash'], 'String');
            }
        }
        return obj;
    };

    /**
     * A GUID identifying the account associated with the consumer disclosure
     * @member {String} accountEsignId
     */
    _exports.prototype['accountEsignId'] = undefined;
    /**
     * A string containing information about the model of the device used for offline signing.
     * @member {String} deviceModel
     */
    _exports.prototype['deviceModel'] = undefined;
    /**
     * A string containing information about the type of device used for offline signing.
     * @member {String} deviceName
     */
    _exports.prototype['deviceName'] = undefined;
    /**
     * A string containing the latitude of the device location at the time of signing.
     * @member {String} gpsLatitude
     */
    _exports.prototype['gpsLatitude'] = undefined;
    /**
     * A string containing the longitude of the device location at the time of signing.
     * @member {String} gpsLongitude
     */
    _exports.prototype['gpsLongitude'] = undefined;
    /**
     *
     * @member {String} offlineSigningHash
     */
    _exports.prototype['offlineSigningHash'] = undefined;

    return _exports;
});


