/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './TemplateMatch'], function (helpersModule, templateMatchModel) {
    /**
     * The TemplateSummary model module.
     * @module model/TemplateSummary
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>TemplateSummary</code>.
     * @alias module:model/TemplateSummary
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>TemplateSummary</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/TemplateSummary} obj Optional instance to populate.
     * @return {module:model/TemplateSummary} The populated <code>TemplateSummary</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('applied')) {
                obj['applied'] = helpersModule.convertToType(data['applied'], 'String');
            }
            if (data.hasOwnProperty('documentId')) {
                obj['documentId'] = helpersModule.convertToType(data['documentId'], 'String');
            }
            if (data.hasOwnProperty('documentName')) {
                obj['documentName'] = helpersModule.convertToType(data['documentName'], 'String');
            }
            if (data.hasOwnProperty('name')) {
                obj['name'] = helpersModule.convertToType(data['name'], 'String');
            }
            if (data.hasOwnProperty('templateId')) {
                obj['templateId'] = helpersModule.convertToType(data['templateId'], 'String');
            }
            if (data.hasOwnProperty('templateMatch')) {
                obj['templateMatch'] = templateMatchModel.constructFromObject(data['templateMatch']);
            }
            if (data.hasOwnProperty('uri')) {
                obj['uri'] = helpersModule.convertToType(data['uri'], 'String');
            }
        }
        return obj;
    }

    /**
     * Reserved: TBD
     * @member {String} applied
     */
    _exports.prototype['applied'] = undefined;
    /**
     * Specifies the document ID number that the tab is placed on. This must refer to an existing Document's ID attribute.
     * @member {String} documentId
     */
    _exports.prototype['documentId'] = undefined;
    /**
     *
     * @member {String} documentName
     */
    _exports.prototype['documentName'] = undefined;
    /**
     *
     * @member {String} name
     */
    _exports.prototype['name'] = undefined;
    /**
     * The unique identifier of the template. If this is not provided, DocuSign will generate a value.
     * @member {String} templateId
     */
    _exports.prototype['templateId'] = undefined;
    /**
     * @member {module:model/TemplateMatch} templateMatch
     */
    _exports.prototype['templateMatch'] = undefined;
    /**
     *
     * @member {String} uri
     */
    _exports.prototype['uri'] = undefined;

    return _exports;
});


