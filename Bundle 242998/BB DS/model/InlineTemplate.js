/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './CustomFields', './Document', './Envelope', './Recipients'],
    function (helpersModule, customFieldsModel, documentModel, envelopeModel, recipientsModel) {
        /**
         * The InlineTemplate model module.
         * @module model/InlineTemplate
         * @version 0.0.1
         */

        /**
         * Constructs a new <code>InlineTemplate</code>.
         * @alias module:model/InlineTemplate
         * @class
         */
        var _exports = function () {
            var _this = this;
        };

        /**
         * Constructs a <code>InlineTemplate</code> from a plain JavaScript object, optionally creating a new instance.
         * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @param {module:model/InlineTemplate} obj Optional instance to populate.
         * @return {module:model/InlineTemplate} The populated <code>InlineTemplate</code> instance.
         */
        _exports.constructFromObject = function (data, obj) {
            if (data) {
                obj = obj || new _exports();

                if (data.hasOwnProperty('customFields')) {
                    obj['customFields'] = customFieldsModel.constructFromObject(data['customFields']);
                }
                if (data.hasOwnProperty('documents')) {
                    obj['documents'] = helpersModule.convertToType(data['documents'], [documentModel]);
                }
                if (data.hasOwnProperty('envelope')) {
                    obj['envelope'] = envelopeModel.constructFromObject(data['envelope']);
                }
                if (data.hasOwnProperty('recipients')) {
                    obj['recipients'] = recipientsModel.constructFromObject(data['recipients']);
                }
                if (data.hasOwnProperty('sequence')) {
                    obj['sequence'] = helpersModule.convertToType(data['sequence'], 'String');
                }
            }
            return obj;
        };

        /**
         * @member {module:model/CustomFields} customFields
         */
        _exports.prototype['customFields'] = undefined;
        /**
         * Complex element contains the details on the documents in the envelope.
         * @member {Array.<module:model/Document>} documents
         */
        _exports.prototype['documents'] = undefined;
        /**
         * @member {module:model/Envelope} envelope
         */
        _exports.prototype['envelope'] = undefined;
        /**
         * @member {module:model/Recipients} recipients
         */
        _exports.prototype['recipients'] = undefined;
        /**
         * Specifies the order in which templates are overlaid.
         * @member {String} sequence
         */
        _exports.prototype['sequence'] = undefined;

        return _exports;
    });