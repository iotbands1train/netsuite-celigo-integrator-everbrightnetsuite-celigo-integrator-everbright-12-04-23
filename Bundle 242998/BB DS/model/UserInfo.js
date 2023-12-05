/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018j
 */

define(['./../Helpers', './../model/Account'], function(helpersModule, accountModule) {
    /**
     * The UserInfo model module.
     * @module model/UserInfo
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>UserInfo</code>.
     * @alias module:model/UserInfo
     * @class
     */
    var exports = function() {
        var _this = this;
    };

    /**
     * Constructs a <code>UserInfo</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/UserInfo} obj Optional instance to populate.
     * @return {module:model/UserInfo} The populated <code>UserInfo</code> instance.
     */
    exports.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new exports();

            if (data.hasOwnProperty('sub')) {
                obj['sub'] = helpersModule.convertToType(data['sub'], 'String');
            }
            if (data.hasOwnProperty('email')) {
                obj['email'] = helpersModule.convertToType(data['email'], 'String');
            }
            if (data.hasOwnProperty('accounts')) {
                obj['accounts'] = helpersModule.convertToType(data['accounts'], [accountModule]);
            }
            if (data.hasOwnProperty('name')) {
                obj['name'] = helpersModule.convertToType(data['name'], 'String');
            }
            if (data.hasOwnProperty('given_name')) {
                obj['givenName'] = helpersModule.convertToType(data['given_name'], 'String');
            }
            if (data.hasOwnProperty('family_name')) {
                obj['familyName'] = helpersModule.convertToType(data['family_name'], 'String');
            }
            if (data.hasOwnProperty('created')) {
                obj['created'] = helpersModule.convertToType(data['created'], 'String');
            }
        }

        return obj;
    };

    /**
     *
     * @member {String} sub
     */
    exports.prototype['sub'] = undefined;
    /**
     *
     * @member {String} email
     */
    exports.prototype['email'] = undefined;
    /**
     * @member {module:oauth/Account} accounts
     */
    exports.prototype['accounts'] = undefined;
    /**
     *
     * @member {String} name
     */
    exports.prototype['name'] = undefined;
    /**
     *
     * @member {String} givenName
     */
    exports.prototype['givenName'] = undefined;
    /**
     *
     * @member {String} familyName
     */
    exports.prototype['familyName'] = undefined;
    /**
     *
     * @member {String} created
     */
    exports.prototype['created'] = undefined;

    return exports;
});

