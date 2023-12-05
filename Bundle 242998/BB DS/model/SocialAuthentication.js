/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The SocialAuthentication model module.
     * @module model/SocialAuthentication
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>SocialAuthentication</code>.
     * @alias module:model/SocialAuthentication
     * @class
     */
    var exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>SocialAuthentication</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/SocialAuthentication} obj Optional instance to populate.
     * @return {module:model/SocialAuthentication} The populated <code>SocialAuthentication</code> instance.
     */
    exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new exports();

            if (data.hasOwnProperty('authentication')) {
                obj['authentication'] = ApiClient.convertToType(data['authentication'], 'String');
            }
        }
        return obj;
    };

    /**
     * Reserved: TBD
     * @member {String} authentication
     */
    exports.prototype['authentication'] = undefined;

    return exports;
});

