/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function(helpersModule, bulkEnvelopeModel) {
  /**
   * The BulkEnvelopeStatus model module.
   * @module model/BulkEnvelopeStatus
   * @version 0.0.1
   */

  /**
   * Constructs a new <code>BulkEnvelopeStatus</code>.
   * @alias module:model/BulkEnvelopeStatus
   * @class
   */
  var _exports = function() {
    var _this = this;
  };

  /**
   * Constructs a <code>BulkEnvelopeStatus</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/BulkEnvelopeStatus} obj Optional instance to populate.
   * @return {module:model/BulkEnvelopeStatus} The populated <code>BulkEnvelopeStatus</code> instance.
   */
  _exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new _exports();

      if (data.hasOwnProperty('batchId')) {
        obj['batchId'] = helpersModule.convertToType(data['batchId'], 'String');
      }
      if (data.hasOwnProperty('batchSize')) {
        obj['batchSize'] = helpersModule.convertToType(data['batchSize'], 'String');
      }
      if (data.hasOwnProperty('bulkEnvelopes')) {
        obj['bulkEnvelopes'] = helpersModule.convertToType(data['bulkEnvelopes'], [bulkEnvelopeModel]);
      }
      if (data.hasOwnProperty('bulkEnvelopesBatchUri')) {
        obj['bulkEnvelopesBatchUri'] = helpersModule.convertToType(data['bulkEnvelopesBatchUri'], 'String');
      }
      if (data.hasOwnProperty('endPosition')) {
        obj['endPosition'] = helpersModule.convertToType(data['endPosition'], 'String');
      }
      if (data.hasOwnProperty('failed')) {
        obj['failed'] = helpersModule.convertToType(data['failed'], 'String');
      }
      if (data.hasOwnProperty('nextUri')) {
        obj['nextUri'] = helpersModule.convertToType(data['nextUri'], 'String');
      }
      if (data.hasOwnProperty('previousUri')) {
        obj['previousUri'] = helpersModule.convertToType(data['previousUri'], 'String');
      }
      if (data.hasOwnProperty('queued')) {
        obj['queued'] = helpersModule.convertToType(data['queued'], 'String');
      }
      if (data.hasOwnProperty('resultSetSize')) {
        obj['resultSetSize'] = helpersModule.convertToType(data['resultSetSize'], 'String');
      }
      if (data.hasOwnProperty('sent')) {
        obj['sent'] = helpersModule.convertToType(data['sent'], 'String');
      }
      if (data.hasOwnProperty('startPosition')) {
        obj['startPosition'] = helpersModule.convertToType(data['startPosition'], 'String');
      }
      if (data.hasOwnProperty('submittedDate')) {
        obj['submittedDate'] = helpersModule.convertToType(data['submittedDate'], 'String');
      }
      if (data.hasOwnProperty('totalSetSize')) {
        obj['totalSetSize'] = helpersModule.convertToType(data['totalSetSize'], 'String');
      }
    }
    return obj;
  };

  /**
   * Specifies an identifier which can be used to retrieve a more detailed status of individual bulk recipient batches.
   * @member {String} batchId
   */
  _exports.prototype['batchId'] = undefined;
  /**
   * The number of items returned in this response.
   * @member {String} batchSize
   */
  _exports.prototype['batchSize'] = undefined;
  /**
   * Reserved: TBD
   * @member {Array.<module:model/BulkEnvelope>} bulkEnvelopes
   */
  _exports.prototype['bulkEnvelopes'] = undefined;
  /**
   * Reserved: TBD
   * @member {String} bulkEnvelopesBatchUri
   */
  _exports.prototype['bulkEnvelopesBatchUri'] = undefined;
  /**
   * The last position in the result set. 
   * @member {String} endPosition
   */
  _exports.prototype['endPosition'] = undefined;
  /**
   * The number of entries with a status of failed. 
   * @member {String} failed
   */
  _exports.prototype['failed'] = undefined;
  /**
   * The URI to the next chunk of records based on the search request. If the endPosition is the entire results of the search, this is null. 
   * @member {String} nextUri
   */
  _exports.prototype['nextUri'] = undefined;
  /**
   * The postal code for the billing address.
   * @member {String} previousUri
   */
  _exports.prototype['previousUri'] = undefined;
  /**
   * The number of entries with a status of queued. 
   * @member {String} queued
   */
  _exports.prototype['queued'] = undefined;
  /**
   * The number of results returned in this response. 
   * @member {String} resultSetSize
   */
  _exports.prototype['resultSetSize'] = undefined;
  /**
   * The number of entries with a status of sent.
   * @member {String} sent
   */
  _exports.prototype['sent'] = undefined;
  /**
   * Starting position of the current result set.
   * @member {String} startPosition
   */
  _exports.prototype['startPosition'] = undefined;
  /**
   * 
   * @member {String} submittedDate
   */
  _exports.prototype['submittedDate'] = undefined;
  /**
   * The total number of items available in the result set. This will always be greater than or equal to the value of the property returning the results in the in the response.
   * @member {String} totalSetSize
   */
  _exports.prototype['totalSetSize'] = undefined;

  return _exports;
});