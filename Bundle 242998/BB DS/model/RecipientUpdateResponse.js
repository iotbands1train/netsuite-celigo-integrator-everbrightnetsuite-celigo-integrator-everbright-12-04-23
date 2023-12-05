/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ErrorDetails', './Tabs'], function (helpersModule, errorDetailsModel, tabsModel) {
    /**
     * The RecipientUpdateResponse model module.
     * @module model/RecipientUpdateResponse
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>RecipientUpdateResponse</code>.
     * @alias module:model/RecipientUpdateResponse
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>RecipientUpdateResponse</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/RecipientUpdateResponse} obj Optional instance to populate.
     * @return {module:model/RecipientUpdateResponse} The populated <code>RecipientUpdateResponse</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('errorDetails')) {
                obj['errorDetails'] = errorDetailsModel.constructFromObject(data['errorDetails']);
            }
            if (data.hasOwnProperty('recipientId')) {
                obj['recipientId'] = helpersModule.convertToType(data['recipientId'], 'String');
            }
            if (data.hasOwnProperty('tabs')) {
                obj['tabs'] = tabsModel.constructFromObject(data['tabs']);
            }
        }
        return obj;
    };

    /**
     * @member {module:model/ErrorDetails} errorDetails
     */
    _exports.prototype['errorDetails'] = undefined;
    /**
     * Unique for the recipient. It is used by the tab element to indicate which recipient is to sign the Document.
     * @member {String} recipientId
     */
    _exports.prototype['recipientId'] = undefined;
    /**
     * @member {module:model/Tabs} tabs
     */
    _exports.prototype['tabs'] = undefined;


    return _exports;
});


