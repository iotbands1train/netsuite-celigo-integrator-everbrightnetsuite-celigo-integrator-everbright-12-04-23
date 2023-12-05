/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ErrorDetails'], function(helpersModule, errorDetailsModel) {
  /**
   * The BulkEnvelope model module.
   * @module model/BulkEnvelope
   * @version 0.0.1
   */

  /**
   * Constructs a new <code>BulkEnvelope</code>.
   * @alias module:model/BulkEnvelope
   * @class
   */
  var _exports = function() {
    var _this = this;
  };

  /**
   * Constructs a <code>BulkEnvelope</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/BulkEnvelope} obj Optional instance to populate.
   * @return {module:model/BulkEnvelope} The populated <code>BulkEnvelope</code> instance.
   */
  _exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new _exports();

      if (data.hasOwnProperty('bulkRecipientRow')) {
        obj['bulkRecipientRow'] = helpersModule.convertToType(data['bulkRecipientRow'], 'String');
      }
      if (data.hasOwnProperty('bulkStatus')) {
        obj['bulkStatus'] = helpersModule.convertToType(data['bulkStatus'], 'String');
      }
      if (data.hasOwnProperty('email')) {
        obj['email'] = helpersModule.convertToType(data['email'], 'String');
      }
      if (data.hasOwnProperty('envelopeId')) {
        obj['envelopeId'] = helpersModule.convertToType(data['envelopeId'], 'String');
      }
      if (data.hasOwnProperty('envelopeUri')) {
        obj['envelopeUri'] = helpersModule.convertToType(data['envelopeUri'], 'String');
      }
      if (data.hasOwnProperty('errorDetails')) {
        obj['errorDetails'] = errorDetailsModel.constructFromObject(data['errorDetails']);
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = helpersModule.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('submittedDateTime')) {
        obj['submittedDateTime'] = helpersModule.convertToType(data['submittedDateTime'], 'String');
      }
      if (data.hasOwnProperty('transactionId')) {
        obj['transactionId'] = helpersModule.convertToType(data['transactionId'], 'String');
      }
    }
    return obj;
  };

  /**
   * Reserved: TBD
   * @member {String} bulkRecipientRow
   */
  _exports.prototype['bulkRecipientRow'] = undefined;
  /**
   * Indicates the status of the bulk send operation. Returned values can be: * queued * processing * sent * failed
   * @member {String} bulkStatus
   */
  _exports.prototype['bulkStatus'] = undefined;
  /**
   * 
   * @member {String} email
   */
  _exports.prototype['email'] = undefined;
  /**
   * The envelope ID of the envelope status that failed to post.
   * @member {String} envelopeId
   */
  _exports.prototype['envelopeId'] = undefined;
  /**
   * Contains a URI for an endpoint that you can use to retrieve the envelope or envelopes.
   * @member {String} envelopeUri
   */
  _exports.prototype['envelopeUri'] = undefined;
  /**
   * @member {module:model/ErrorDetails} errorDetails
   */
  _exports.prototype['errorDetails'] = undefined;
  /**
   * 
   * @member {String} name
   */
  _exports.prototype['name'] = undefined;
  /**
   * 
   * @member {String} submittedDateTime
   */
  _exports.prototype['submittedDateTime'] = undefined;
  /**
   *  Used to identify an envelope. The id is a sender-generated value and is valid in the DocuSign system for 7 days. It is recommended that a transaction ID is used for offline signing to ensure that an envelope is not sent multiple times. The `transactionId` property can be used determine an envelope's status (i.e. was it created or not) in cases where the internet connection was lost before the envelope status was returned.
   * @member {String} transactionId
   */
  _exports.prototype['transactionId'] = undefined;



  return _exports;
}));


