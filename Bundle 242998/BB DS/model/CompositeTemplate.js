/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './Document', './InlineTemplate', './ServerTemplate'],
    function (helpersModule, documentModel, inlineTemplateModel, serverTemplateModel) {
    /**
     * The CompositeTemplate model module.
     * @module model/CompositeTemplate
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>CompositeTemplate</code>.
     * @alias module:model/CompositeTemplate
     * @class
     */
    var _exports = function () {
        var _this = this;


    };

    /**
     * Constructs a <code>CompositeTemplate</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/CompositeTemplate} obj Optional instance to populate.
     * @return {module:model/CompositeTemplate} The populated <code>CompositeTemplate</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('compositeTemplateId')) {
                obj['compositeTemplateId'] = helpersModule.convertToType(data['compositeTemplateId'], 'String');
            }
            if (data.hasOwnProperty('document')) {
                obj['document'] = documentModel.constructFromObject(data['document']);
            }
            if (data.hasOwnProperty('inlineTemplates')) {
                obj['inlineTemplates'] = helpersModule.convertToType(data['inlineTemplates'], [inlineTemplateModel]);
            }
            if (data.hasOwnProperty('pdfMetaDataTemplateSequence')) {
                obj['pdfMetaDataTemplateSequence'] = helpersModule.convertToType(data['pdfMetaDataTemplateSequence'], 'String');
            }
            if (data.hasOwnProperty('serverTemplates')) {
                obj['serverTemplates'] = helpersModule.convertToType(data['serverTemplates'], [serverTemplateModel]);
            }
        }
        return obj;
    };

    /**
     * The identify of this composite template. It is used as a reference when adding document object information. If used, the document's `content-disposition` must include the composite template ID to which the document should be added. If a composite template ID is not specified in the content-disposition, the document is applied based on the value of the `documentId` property only. If no document object is specified, the composite template inherits the first document.
     * @member {String} compositeTemplateId
     */
    _exports.prototype['compositeTemplateId'] = undefined;
    /**
     * @member {module:model/Document} document
     */
    _exports.prototype['document'] = undefined;
    /**
     *  Zero or more inline templates and their position in the overlay. If supplied, they are overlaid into the envelope in the order of their Sequence value.
     * @member {Array.<module:model/InlineTemplate>} inlineTemplates
     */
    _exports.prototype['inlineTemplates'] = undefined;
    /**
     *
     * @member {String} pdfMetaDataTemplateSequence
     */
    _exports.prototype['pdfMetaDataTemplateSequence'] = undefined;
    /**
     * 0 or more server-side templates and their position in the overlay. If supplied, they are overlaid into the envelope in the order of their Sequence value
     * @member {Array.<module:model/ServerTemplate>} serverTemplates
     */
    _exports.prototype['serverTemplates'] = undefined;

    return _exports;
});