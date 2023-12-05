/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
  /**
   * The EnvelopeEvent model module.
   * @module model/EnvelopeEvent
   * @version 0.0.1
   */

  /**
   * Constructs a new <code>EnvelopeEvent</code>.
   * @alias module:model/EnvelopeEvent
   * @class
   */
  var _exports = function() {
    var _this = this;
  };

  /**
   * Constructs a <code>EnvelopeEvent</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/EnvelopeEvent} obj Optional instance to populate.
   * @return {module:model/EnvelopeEvent} The populated <code>EnvelopeEvent</code> instance.
   */
  _exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new _exports();

      if (data.hasOwnProperty('envelopeEventStatusCode')) {
        obj['envelopeEventStatusCode'] = helpersModule.convertToType(data['envelopeEventStatusCode'], 'String');
      }
      if (data.hasOwnProperty('includeDocuments')) {
        obj['includeDocuments'] = helpersModule.convertToType(data['includeDocuments'], 'String');
      }
    }
    return obj;
  };

  /**
   * he envelope status, this can be Sent, Delivered, Completed, Declined, or Voided.
   * @member {String} envelopeEventStatusCode
   */
  _exports.prototype['envelopeEventStatusCode'] = undefined;
  /**
   * When set to **true**, the PDF documents are included in the message along with the updated XML. 
   * @member {String} includeDocuments
   */
  _exports.prototype['includeDocuments'] = undefined;

  return _exports;
});