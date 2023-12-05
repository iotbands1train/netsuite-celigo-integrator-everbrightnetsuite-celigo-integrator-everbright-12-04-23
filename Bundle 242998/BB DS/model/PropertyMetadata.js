/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function(helpersModule) {
    /**
     * The PropertyMetadata model module.
     * @module model/PropertyMetadata
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>PropertyMetadata</code>.
     * @alias module:model/PropertyMetadata
     * @class
     */
    var exports = function() {
        var _this = this;


    };

    /**
     * Constructs a <code>PropertyMetadata</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/PropertyMetadata} obj Optional instance to populate.
     * @return {module:model/PropertyMetadata} The populated <code>PropertyMetadata</code> instance.
     */
    exports.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new exports();

            if (data.hasOwnProperty('options')) {
                obj['options'] = helpersModule.convertToType(data['options'], ['String']);
            }
            if (data.hasOwnProperty('rights')) {
                obj['rights'] = helpersModule.convertToType(data['rights'], 'String');
            }
        }
        return obj;
    };

    /**
     *
     * @member {Array.<String>} options
     */
    exports.prototype['options'] = undefined;
    /**
     *
     * @member {String} rights
     */
    exports.prototype['rights'] = undefined;



    return exports;
});

