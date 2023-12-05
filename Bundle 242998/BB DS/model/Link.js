/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function(helpersModule) {
    /**
     * The Link model module.
     * @module oauth/Link
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>Link</code>.
     * @alias module:oauth/Link
     * @class
     */
    var _exports = function() {
        var _this = this;
    };

    /**
     * Constructs a <code>Link</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:oauth/Link} obj Optional instance to populate.
     * @return {module:oauth/Link} The populated <code>Link</code> instance.
     */
    _exports.constructFromObject = function(data, obj) {


        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('rel')) {
                obj['rel'] = helpersModule.convertToType(data['rel'], 'String');
            }
            if (data.hasOwnProperty('href')) {
                obj['href'] = helpersModule.convertToType(data['href'], 'String');
            }
        }

        return obj;
    };

    /**
     *
     * @member {String} rel
     */
    _exports.prototype['rel'] = undefined;
    /**
     *
     * @member {String} href
     */
    _exports.prototype['href'] = undefined;

    return _exports;
});