/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ErrorDetails'], function(helpersModule, errorDetailsModel) {
    /**
     * The DocumentTemplate model module.
     * @module model/DocumentTemplate
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>DocumentTemplate</code>.
     * @alias module:model/DocumentTemplate
     * @class
     */
    var _exports = function() {
        var _this = this;
    };

    /**
     * Constructs a <code>DocumentTemplate</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/DocumentTemplate} obj Optional instance to populate.
     * @return {module:model/DocumentTemplate} The populated <code>DocumentTemplate</code> instance.
     */
    _exports.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('documentEndPage')) {
                obj['documentEndPage'] = helpersModule.convertToType(data['documentEndPage'], 'String');
            }
            if (data.hasOwnProperty('documentId')) {
                obj['documentId'] = helpersModule.convertToType(data['documentId'], 'String');
            }
            if (data.hasOwnProperty('documentStartPage')) {
                obj['documentStartPage'] = helpersModule.convertToType(data['documentStartPage'], 'String');
            }
            if (data.hasOwnProperty('errorDetails')) {
                obj['errorDetails'] = errorDetailsModel.constructFromObject(data['errorDetails']);
            }
            if (data.hasOwnProperty('templateId')) {
                obj['templateId'] = helpersModule.convertToType(data['templateId'], 'String');
            }
        }
        return obj;
    };

    /**
     *
     * @member {String} documentEndPage
     */
    _exports.prototype['documentEndPage'] = undefined;
    /**
     * Specifies the document ID number that the tab is placed on. This must refer to an existing Document's ID attribute.
     * @member {String} documentId
     */
    _exports.prototype['documentId'] = undefined;
    /**
     *
     * @member {String} documentStartPage
     */
    _exports.prototype['documentStartPage'] = undefined;
    /**
     * @member {module:model/ErrorDetails} errorDetails
     */
    _exports.prototype['errorDetails'] = undefined;
    /**
     * The unique identifier of the template. If this is not provided, DocuSign will generate a value.
     * @member {String} templateId
     */
    _exports.prototype['templateId'] = undefined;

    return _exports;
});