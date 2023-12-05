/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './BulkEnvelopeStatus', './ErrorDetails', './ListCustomField', './LockInformation', './RecipientUpdateResponse', './Tabs', './TextCustomField'],
    function(helpersModule, bulkEnvelopeStatusModel, errorDetailsModel, listCustomFieldModel, lockInformationModel, recipientUpdateResponseModel, tabsModel, textCustomFieldModel) {
    /**
     * The EnvelopeUpdateSummary model module.
     * @module model/EnvelopeUpdateSummary
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>EnvelopeUpdateSummary</code>.
     * @alias module:model/EnvelopeUpdateSummary
     * @class
     */
    var _exports = function() {
        var _this = this;
    };

    /**
     * Constructs a <code>EnvelopeUpdateSummary</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/EnvelopeUpdateSummary} obj Optional instance to populate.
     * @return {module:model/EnvelopeUpdateSummary} The populated <code>EnvelopeUpdateSummary</code> instance.
     */
    _exports.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('bulkEnvelopeStatus')) {
                obj['bulkEnvelopeStatus'] = bulkEnvelopeStatusModel.constructFromObject(data['bulkEnvelopeStatus']);
            }
            if (data.hasOwnProperty('envelopeId')) {
                obj['envelopeId'] = helpersModule.convertToType(data['envelopeId'], 'String');
            }
            if (data.hasOwnProperty('errorDetails')) {
                obj['errorDetails'] = errorDetailsModel.constructFromObject(data['errorDetails']);
            }
            if (data.hasOwnProperty('listCustomFieldUpdateResults')) {
                obj['listCustomFieldUpdateResults'] = helpersModule.convertToType(data['listCustomFieldUpdateResults'], [listCustomFieldModel]);
            }
            if (data.hasOwnProperty('lockInformation')) {
                obj['lockInformation'] = lockInformationModel.constructFromObject(data['lockInformation']);
            }
            if (data.hasOwnProperty('recipientUpdateResults')) {
                obj['recipientUpdateResults'] = helpersModule.convertToType(data['recipientUpdateResults'], [recipientUpdateResponseModel]);
            }
            if (data.hasOwnProperty('tabUpdateResults')) {
                obj['tabUpdateResults'] = tabsModel.constructFromObject(data['tabUpdateResults']);
            }
            if (data.hasOwnProperty('textCustomFieldUpdateResults')) {
                obj['textCustomFieldUpdateResults'] = helpersModule.convertToType(data['textCustomFieldUpdateResults'], [textCustomFieldModel]);
            }
        }
        return obj;
    };

    /**
     * @member {module:model/BulkEnvelopeStatus} bulkEnvelopeStatus
     */
    _exports.prototype['bulkEnvelopeStatus'] = undefined;
    /**
     * The envelope ID of the envelope status that failed to post.
     * @member {String} envelopeId
     */
    _exports.prototype['envelopeId'] = undefined;
    /**
     * @member {module:model/ErrorDetails} errorDetails
     */
    _exports.prototype['errorDetails'] = undefined;
    /**
     *
     * @member {Array.<module:model/ListCustomField>} listCustomFieldUpdateResults
     */
    _exports.prototype['listCustomFieldUpdateResults'] = undefined;
    /**
     * @member {module:model/LockInformation} lockInformation
     */
    _exports.prototype['lockInformation'] = undefined;
    /**
     *
     * @member {Array.<module:model/RecipientUpdateResponse>} recipientUpdateResults
     */
    _exports.prototype['recipientUpdateResults'] = undefined;
    /**
     * @member {module:model/Tabs} tabUpdateResults
     */
    _exports.prototype['tabUpdateResults'] = undefined;
    /**
     *
     * @member {Array.<module:model/TextCustomField>} textCustomFieldUpdateResults
     */
    _exports.prototype['textCustomFieldUpdateResults'] = undefined;



    return _exports;
});