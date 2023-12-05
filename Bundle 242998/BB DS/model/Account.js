/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './Organization'], function(helpersModule, organizationModule) {
    /**
     * The Account model module.
     * @module oauth/Account
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>Account</code>.
     * @alias module:model/Account
     * @class
     */
    var exports = function() {
        var _this = this;
    };

    exports.constructFromObject = function (data, obj){
        if (data) {
            obj = obj || new exports();
            if (data.hasOwnProperty('account_id')) {
                obj['accountId'] = helpersModule.convertToType(data['account_id'], 'String');
            }
            if (data.hasOwnProperty('is_default')) {
                obj['isDefault'] = helpersModule.convertToType(data['is_default'], 'String');
            }
            if (data.hasOwnProperty('account_name')) {
                obj['accountName'] = helpersModule.convertToType(data['account_name'], 'String');
            }
            if (data.hasOwnProperty('base_uri')) {
                obj['baseUri'] = helpersModule.convertToType(data['base_uri'], 'String');
            }
            if(data.hasOwnProperty('organization')) {
                obj['organization'] = helpersModule.convertToType(data['organization'], organizationModule)
            }
        }
        return obj;
    };

    /**
     *
     * @member {String} accountId
     */
    exports.prototype['accountId'] = undefined;
    /**
     *
     * @member {String} isDefault
     */
    exports.prototype['isDefault'] = undefined;
    /**
     * @member {String} accountName
     */
    exports.prototype['accountName'] = undefined;
    /**
     * @member {String} baseUri
     */
    exports.prototype['baseUri'] = undefined;
    /**
     * @member {module:oauth/Organization} organization
     */
    exports.prototype['organization'] = undefined;


    return exports;
});