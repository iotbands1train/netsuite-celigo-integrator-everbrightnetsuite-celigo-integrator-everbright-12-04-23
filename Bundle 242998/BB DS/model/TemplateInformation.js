/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './TemplateSummary'], function (helpersModule, templateSummaryModel) {
    /**
     * The TemplateInformation model module.
     * @module model/TemplateInformation
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>TemplateInformation</code>.
     * @alias module:model/TemplateInformation
     * @class
     */
    var _exports = function () {
        var _this = this;


    };

    /**
     * Constructs a <code>TemplateInformation</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/TemplateInformation} obj Optional instance to populate.
     * @return {module:model/TemplateInformation} The populated <code>TemplateInformation</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('templates')) {
                obj['templates'] = helpersModule.convertToType(data['templates'], [templateSummaryModel]);
            }
        }
        return obj;
    };

    /**
     *
     * @member {Array.<module:model/TemplateSummary>} templates
     */
    _exports.prototype['templates'] = undefined;


    return _exports;
});


