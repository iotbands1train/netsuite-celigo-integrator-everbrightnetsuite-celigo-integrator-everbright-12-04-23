/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
  /**
   * The RecipientEvent model module.
   * @module model/RecipientEvent
   * @version 0.0.1
   */

  /**
   * Constructs a new <code>RecipientEvent</code>.
   * @alias module:model/RecipientEvent
   * @class
   */
  var _exports = function() {
    var _this = this;
  };

  /**
   * Constructs a <code>RecipientEvent</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/RecipientEvent} obj Optional instance to populate.
   * @return {module:model/RecipientEvent} The populated <code>RecipientEvent</code> instance.
   */
  _exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new _exports();

      if (data.hasOwnProperty('includeDocuments')) {
        obj['includeDocuments'] = helpersModule.convertToType(data['includeDocuments'], 'String');
      }
      if (data.hasOwnProperty('recipientEventStatusCode')) {
        obj['recipientEventStatusCode'] = helpersModule.convertToType(data['recipientEventStatusCode'], 'String');
      }
    }
    return obj;
  };

  /**
   * When set to **true**, the PDF documents are included in the message along with the updated XML. 
   * @member {String} includeDocuments
   */
  _exports.prototype['includeDocuments'] = undefined;
  /**
   * The recipient status, this can be Sent, Delivered, Completed, Declined, AuthenticationFailed, and AutoResponded.
   * @member {String} recipientEventStatusCode
   */
  _exports.prototype['recipientEventStatusCode'] = undefined;

  return _exports;
});