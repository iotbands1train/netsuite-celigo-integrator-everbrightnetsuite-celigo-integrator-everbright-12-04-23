/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './../model/NameValue'], function(helpersModule, nameValueModel) {
    /**
     * The OauthAccess model module.
     * @module model/OAuthToken
     * @version 0.0.1
     */
    /**
     * Constructs a new <code>OAuthToken</code>.
     * @alias module:model/OAuthToken
     * @class
     */
    var exports = function() {
        var _this = this;


    };

    /**
     * Constructs a <code>OauthAccess</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/OAuthToken} obj Optional instance to populate.
     * @return {module:model/OAuthToken} The populated <code>OauthAccess</code> instance.
     */
    exports.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new exports();

            if (data.hasOwnProperty('access_token')) {
                obj['accessToken'] = helpersModule.convertToType(data['access_token'], 'String');
            }
            if (data.hasOwnProperty('data')) {
                obj['data'] = helpersModule.convertToType(data['data'], [nameValueModel]);
            }
            if (data.hasOwnProperty('expires_in')) {
                obj['expiresIn'] = helpersModule.convertToType(data['expires_in'], 'String');
            }
            if (data.hasOwnProperty('refresh_token')) {
                obj['refreshToken'] = helpersModule.convertToType(data['refresh_token'], 'String');
            }
            if (data.hasOwnProperty('scope')) {
                obj['scope'] = helpersModule.convertToType(data['scope'], 'String');
            }
            if (data.hasOwnProperty('token_type')) {
                obj['tokenType'] = helpersModule.convertToType(data['token_type'], 'String');
            }
        }
        return obj;
    };

    /**
     * Access token information.
     * @member {String} access_token
     */
    exports.prototype['accessToken'] = undefined;
    /**
     *
     * @member {Array.<module:model/NameValue>} data
     */
    exports.prototype['data'] = undefined;
    /**
     *
     * @member {String} expires_in
     */
    exports.prototype['expiresIn'] = undefined;
    /**
     *
     * @member {String} refresh_token
     */
    exports.prototype['refreshToken'] = undefined;
    /**
     * Must be set to \"api\".
     * @member {String} scope
     */
    exports.prototype['scope'] = undefined;
    /**
     *
     * @member {String} token_type
     */
    exports.prototype['tokenType'] = undefined;
    /**
     *
     * @member {Date} created
     */
    exports.prototype['created'] = undefined;

    return exports;
});

