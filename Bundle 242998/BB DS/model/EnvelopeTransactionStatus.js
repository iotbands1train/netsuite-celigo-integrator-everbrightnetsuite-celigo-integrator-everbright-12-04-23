/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ErrorDetails'], function (helpersModule, errorDetailsModel) {
    /**
     * The EnvelopeTransactionStatus model module.
     * @module model/EnvelopeTransactionStatus
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>EnvelopeTransactionStatus</code>.
     * @alias module:model/EnvelopeTransactionStatus
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>EnvelopeTransactionStatus</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/EnvelopeTransactionStatus} obj Optional instance to populate.
     * @return {module:model/EnvelopeTransactionStatus} The populated <code>EnvelopeTransactionStatus</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('envelopeId')) {
                obj['envelopeId'] = helpersModule.convertToType(data['envelopeId'], 'String');
            }
            if (data.hasOwnProperty('errorDetails')) {
                obj['errorDetails'] = errorDetailsModel.constructFromObject(data['errorDetails']);
            }
            if (data.hasOwnProperty('status')) {
                obj['status'] = helpersModule.convertToType(data['status'], 'String');
            }
            if (data.hasOwnProperty('transactionId')) {
                obj['transactionId'] = helpersModule.convertToType(data['transactionId'], 'String');
            }
        }
        return obj;
    };

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
     * Indicates the envelope status. Valid values are:  * sent - The envelope is sent to the recipients.  * created - The envelope is saved as a draft and can be modified and sent later.
     * @member {String} status
     */
    _exports.prototype['status'] = undefined;
    /**
     *  Used to identify an envelope. The id is a sender-generated value and is valid in the DocuSign system for 7 days. It is recommended that a transaction ID is used for offline signing to ensure that an envelope is not sent multiple times. The `transactionId` property can be used determine an envelope's status (i.e. was it created or not) in cases where the internet connection was lost before the envelope status was returned.
     * @member {String} transactionId
     */
    _exports.prototype['transactionId'] = undefined;

    return _exports;
});


