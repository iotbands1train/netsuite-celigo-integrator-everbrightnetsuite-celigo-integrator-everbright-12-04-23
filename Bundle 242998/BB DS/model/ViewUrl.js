/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function(helpersModule) {
    /**
     * The ViewUrl model module.
     * @module model/ViewUrl
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>ViewUrl</code>.
     * @alias module:model/ViewUrl
     * @class
     */
    var _exports = function () {
        var _this = this;
    };


    /**
     * Constructs a <code>ViewUrl</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ViewUrl} obj Optional instance to populate.
     * @return {module:model/ViewUrl} The populated <code>ViewUrl</code> instance.
     */
    _exports.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('url')) {
                obj['url'] = helpersModule.convertToType(data['url'], 'String');
            }
        }
        return obj;
    };


    /**
     * An url of the edit view for template
     * @member {String} url
     */
    _exports.prototype['url'] = undefined;

    return _exports;
});