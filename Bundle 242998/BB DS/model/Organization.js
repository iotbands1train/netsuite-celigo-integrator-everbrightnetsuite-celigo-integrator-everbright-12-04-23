/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './Link'], function(helpersModule, linkModule) {
    /**
     * The Organization model module.
     * @module oauth/Organization
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>Organization</code>.
     * @alias module:oauth/Organization
     * @class
     */
    var exports = function() {
        var _this = this;
    };

    /**
     * Constructs a <code>Organization</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:oauth/Organization} obj Optional instance to populate.
     * @return {module:oauth/Organization} The populated <code>Organization</code> instance.
     */
    exports.constructFromObject = function(data, obj) {

        if (data) {
            obj = obj || new exports();

            if (data.hasOwnProperty('organization_id')) {
                obj['organization_id'] = helpersModule.convertToType(data['organization_id'], 'String');
            }
            if (data.hasOwnProperty('links')) {
                obj['links'] = helpersModule.convertToType(data['links'], [linkModule]);
            }
        }

        return obj;
    };

    /**
     *
     * @member {String} sub
     */
    exports.prototype['organization_id'] = undefined;
    /**
     *
     * @member {String} email
     */
    exports.prototype['links'] = undefined;


    return exports;
});