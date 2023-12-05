/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ErrorDetails', './PropertyMetadata'], function (helpersModule, errorDetailsModel, propertyMetadataModel) {
  /**
   * The TabGroup model module.
   * @module model/TabGroup
   * @version 0.0.1
   */

  /**
   * Constructs a new <code>TabGroup</code>.
   * @alias module:model/TabGroup
   * @class
   */
  var _exports = function() {
    var _this = this;
  };

  /**
   * Constructs a <code>TabGroup</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/TabGroup} obj Optional instance to populate.
   * @return {module:model/TabGroup} The populated <code>TabGroup</code> instance.
   */
  _exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new _exports();

      if (data.hasOwnProperty('childTabLabels')) {
        obj['childTabLabels'] = helpersModule.convertToType(data['childTabLabels'], ['String']);
      }
      if (data.hasOwnProperty('childTabLabelsMetadata')) {
        obj['childTabLabelsMetadata'] = propertyMetadataModel.constructFromObject(data['childTabLabelsMetadata']);
      }
      if (data.hasOwnProperty('errorDetails')) {
        obj['errorDetails'] = errorDetailsModel.constructFromObject(data['errorDetails']);
      }
      if (data.hasOwnProperty('groupLabel')) {
        obj['groupLabel'] = helpersModule.convertToType(data['groupLabel'], 'String');
      }
      if (data.hasOwnProperty('groupLabelMetadata')) {
        obj['groupLabelMetadata'] = propertyMetadataModel.constructFromObject(data['groupLabelMetadata']);
      }
      if (data.hasOwnProperty('groupRule')) {
        obj['groupRule'] = helpersModule.convertToType(data['groupRule'], 'String');
      }
      if (data.hasOwnProperty('groupRuleMetadata')) {
        obj['groupRuleMetadata'] = propertyMetadataModel.constructFromObject(data['groupRuleMetadata']);
      }
      if (data.hasOwnProperty('maximumAllowed')) {
        obj['maximumAllowed'] = helpersModule.convertToType(data['maximumAllowed'], 'String');
      }
      if (data.hasOwnProperty('maximumAllowedMetadata')) {
        obj['maximumAllowedMetadata'] = propertyMetadataModel.constructFromObject(data['maximumAllowedMetadata']);
      }
      if (data.hasOwnProperty('minimumRequired')) {
        obj['minimumRequired'] = helpersModule.convertToType(data['minimumRequired'], 'String');
      }
      if (data.hasOwnProperty('minimumRequiredMetadata')) {
        obj['minimumRequiredMetadata'] = propertyMetadataModel.constructFromObject(data['minimumRequiredMetadata']);
      }
      if (data.hasOwnProperty('recipientId')) {
        obj['recipientId'] = helpersModule.convertToType(data['recipientId'], 'String');
      }
      if (data.hasOwnProperty('recipientIdMetadata')) {
        obj['recipientIdMetadata'] = propertyMetadataModel.constructFromObject(data['recipientIdMetadata']);
      }
      if (data.hasOwnProperty('tabId')) {
        obj['tabId'] = helpersModule.convertToType(data['tabId'], 'String');
      }
      if (data.hasOwnProperty('tabIdMetadata')) {
        obj['tabIdMetadata'] = propertyMetadataModel.constructFromObject(data['tabIdMetadata']);
      }
      if (data.hasOwnProperty('templateLocked')) {
        obj['templateLocked'] = helpersModule.convertToType(data['templateLocked'], 'String');
      }
      if (data.hasOwnProperty('templateLockedMetadata')) {
        obj['templateLockedMetadata'] = propertyMetadataModel.constructFromObject(data['templateLockedMetadata']);
      }
      if (data.hasOwnProperty('templateRequired')) {
        obj['templateRequired'] = helpersModule.convertToType(data['templateRequired'], 'String');
      }
      if (data.hasOwnProperty('templateRequiredMetadata')) {
        obj['templateRequiredMetadata'] = propertyMetadataModel.constructFromObject(data['templateRequiredMetadata']);
      }
      if (data.hasOwnProperty('validationMessage')) {
        obj['validationMessage'] = helpersModule.convertToType(data['validationMessage'], 'String');
      }
      if (data.hasOwnProperty('validationMessageMetadata')) {
        obj['validationMessageMetadata'] = propertyMetadataModel.constructFromObject(data['validationMessageMetadata']);
      }
    }
    return obj;
  };

  /**
   * 
   * @member {Array.<String>} childTabLabels
   */
  _exports.prototype['childTabLabels'] = undefined;
  /**
   * @member {module:model/PropertyMetadata} childTabLabelsMetadata
   */
  _exports.prototype['childTabLabelsMetadata'] = undefined;
  /**
   * @member {module:model/ErrorDetails} errorDetails
   */
  _exports.prototype['errorDetails'] = undefined;
  /**
   * 
   * @member {String} groupLabel
   */
  _exports.prototype['groupLabel'] = undefined;
  /**
   * @member {module:model/PropertyMetadata} groupLabelMetadata
   */
  _exports.prototype['groupLabelMetadata'] = undefined;
  /**
   * 
   * @member {String} groupRule
   */
  _exports.prototype['groupRule'] = undefined;
  /**
   * @member {module:model/PropertyMetadata} groupRuleMetadata
   */
  _exports.prototype['groupRuleMetadata'] = undefined;
  /**
   * 
   * @member {String} maximumAllowed
   */
  _exports.prototype['maximumAllowed'] = undefined;
  /**
   * @member {module:model/PropertyMetadata} maximumAllowedMetadata
   */
  _exports.prototype['maximumAllowedMetadata'] = undefined;
  /**
   * 
   * @member {String} minimumRequired
   */
  _exports.prototype['minimumRequired'] = undefined;
  /**
   * @member {module:model/PropertyMetadata} minimumRequiredMetadata
   */
  _exports.prototype['minimumRequiredMetadata'] = undefined;
  /**
   * Unique for the recipient. It is used by the tab element to indicate which recipient is to sign the Document.
   * @member {String} recipientId
   */
  _exports.prototype['recipientId'] = undefined;
  /**
   * @member {module:model/PropertyMetadata} recipientIdMetadata
   */
  _exports.prototype['recipientIdMetadata'] = undefined;
  /**
   * The unique identifier for the tab. The tabid can be retrieved with the [ML:GET call].     
   * @member {String} tabId
   */
  _exports.prototype['tabId'] = undefined;
  /**
   * @member {module:model/PropertyMetadata} tabIdMetadata
   */
  _exports.prototype['tabIdMetadata'] = undefined;
  /**
   * When set to **true**, the sender cannot change any attributes of the recipient. Used only when working with template recipients. 
   * @member {String} templateLocked
   */
  _exports.prototype['templateLocked'] = undefined;
  /**
   * @member {module:model/PropertyMetadata} templateLockedMetadata
   */
  _exports.prototype['templateLockedMetadata'] = undefined;
  /**
   * When set to **true**, the sender may not remove the recipient. Used only when working with template recipients.
   * @member {String} templateRequired
   */
  _exports.prototype['templateRequired'] = undefined;
  /**
   * @member {module:model/PropertyMetadata} templateRequiredMetadata
   */
  _exports.prototype['templateRequiredMetadata'] = undefined;
  /**
   * The message displayed if the custom tab fails input validation (either custom of embedded).
   * @member {String} validationMessage
   */
  _exports.prototype['validationMessage'] = undefined;
  /**
   * @member {module:model/PropertyMetadata} validationMessageMetadata
   */
  _exports.prototype['validationMessageMetadata'] = undefined;

  return _exports;
});