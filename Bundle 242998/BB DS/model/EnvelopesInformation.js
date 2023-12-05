/**
 /**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './Envelope', './EnvelopeTransactionStatus'], function (ApiClient, Envelope, EnvelopeTransactionStatus) {
    /**
     * The EnvelopesInformation model module.
     * @module model/EnvelopesInformation
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>EnvelopesInformation</code>.
     * @alias module:model/EnvelopesInformation
     * @class
     */
    var exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>EnvelopesInformation</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/EnvelopesInformation} obj Optional instance to populate.
     * @return {module:model/EnvelopesInformation} The populated <code>EnvelopesInformation</code> instance.
     */
    exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new exports();

            if (data.hasOwnProperty('endPosition')) {
                obj['endPosition'] = ApiClient.convertToType(data['endPosition'], 'String');
            }
            if (data.hasOwnProperty('envelopes')) {
                obj['envelopes'] = ApiClient.convertToType(data['envelopes'], [Envelope]);
            }
            if (data.hasOwnProperty('envelopeTransactionStatuses')) {
                obj['envelopeTransactionStatuses'] = ApiClient.convertToType(data['envelopeTransactionStatuses'], [EnvelopeTransactionStatus]);
            }
            if (data.hasOwnProperty('nextUri')) {
                obj['nextUri'] = ApiClient.convertToType(data['nextUri'], 'String');
            }
            if (data.hasOwnProperty('previousUri')) {
                obj['previousUri'] = ApiClient.convertToType(data['previousUri'], 'String');
            }
            if (data.hasOwnProperty('resultSetSize')) {
                obj['resultSetSize'] = ApiClient.convertToType(data['resultSetSize'], 'String');
            }
            if (data.hasOwnProperty('startPosition')) {
                obj['startPosition'] = ApiClient.convertToType(data['startPosition'], 'String');
            }
            if (data.hasOwnProperty('totalSetSize')) {
                obj['totalSetSize'] = ApiClient.convertToType(data['totalSetSize'], 'String');
            }
        }
        return obj;
    };

    /**
     * The last position in the result set.
     * @member {String} endPosition
     */
    exports.prototype['endPosition'] = undefined;
    /**
     *
     * @member {Array.<module:model/Envelope>} envelopes
     */
    exports.prototype['envelopes'] = undefined;
    /**
     *
     * @member {Array.<module:model/EnvelopeTransactionStatus>} envelopeTransactionStatuses
     */
    exports.prototype['envelopeTransactionStatuses'] = undefined;
    /**
     * The URI to the next chunk of records based on the search request. If the endPosition is the entire results of the search, this is null.
     * @member {String} nextUri
     */
    exports.prototype['nextUri'] = undefined;
    /**
     * The postal code for the billing address.
     * @member {String} previousUri
     */
    exports.prototype['previousUri'] = undefined;
    /**
     * The number of results returned in this response.
     * @member {String} resultSetSize
     */
    exports.prototype['resultSetSize'] = undefined;
    /**
     * Starting position of the current result set.
     * @member {String} startPosition
     */
    exports.prototype['startPosition'] = undefined;
    /**
     * The total number of items available in the result set. This will always be greater than or equal to the value of the property returning the results in the in the response.
     * @member {String} totalSetSize
     */
    exports.prototype['totalSetSize'] = undefined;

    return exports;
});