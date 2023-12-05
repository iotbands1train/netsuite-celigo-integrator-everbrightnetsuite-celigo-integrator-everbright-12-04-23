/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './TabMetadata'], function(helpersModule, tabMetadataModel) {
    /**
     * The TabMetadataList model module.
     * @module model/TabMetadataList
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>TabMetadataList</code>.
     * @alias module:model/TabMetadataList
     * @class
     */
    var exports = function() {
        var _this = this;
    };

    /**
     * Constructs a <code>TabMetadataList</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/TabMetadataList} obj Optional instance to populate.
     * @return {module:model/TabMetadataList} The populated <code>TabMetadataList</code> instance.
     */
    exports.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new exports();

            if (data.hasOwnProperty('tabs')) {
                obj['tabs'] = helpersModule.convertToType(data['tabs'], [tabMetadataModel]);
            }
        }
        return obj;
    };

    /**
     *
     * @member {Array.<module:model/TabMetadata>} tabs
     */
    exports.prototype['tabs'] = undefined;



    return exports;
});

