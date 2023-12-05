/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './DocumentTemplate'], function(helpersModule, documentTemplateModel) {
    /**
     * The DocumentTemplateList model module.
     * @module model/DocumentTemplateList
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>DocumentTemplateList</code>.
     * @alias module:model/DocumentTemplateList
     * @class
     */
    var _exports = function() {
        var _this = this;
    };

    /**
     * Constructs a <code>DocumentTemplateList</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/DocumentTemplateList} obj Optional instance to populate.
     * @return {module:model/DocumentTemplateList} The populated <code>DocumentTemplateList</code> instance.
     */
    _exports.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('documentTemplates')) {
                obj['documentTemplates'] = helpersModule.convertToType(data['documentTemplates'], [documentTemplateModel]);
            }
        }
        return obj;
    };

    /**
     *
     * @member {Array.<module:model/DocumentTemplate>} documentTemplates
     */
    _exports.prototype['documentTemplates'] = undefined;

    return _exports;
});