/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
  /**
   * The Ssn9InformationInput model module.
   * @module model/Ssn9InformationInput
   * @version 0.0.1
   */

  /**
   * Constructs a new <code>Ssn9InformationInput</code>.
   * @alias module:model/Ssn9InformationInput
   * @class
   */
  var _exports = function() {
    var _this = this;
  };

  /**
   * Constructs a <code>Ssn9InformationInput</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Ssn9InformationInput} obj Optional instance to populate.
   * @return {module:model/Ssn9InformationInput} The populated <code>Ssn9InformationInput</code> instance.
   */
  _exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new _exports();

      if (data.hasOwnProperty('displayLevelCode')) {
        obj['displayLevelCode'] = helpersModule.convertToType(data['displayLevelCode'], 'String');
      }
      if (data.hasOwnProperty('ssn9')) {
        obj['ssn9'] = helpersModule.convertToType(data['ssn9'], 'String');
      }
    }
    return obj;
  };

  /**
   * Specifies the display level for the recipient.  Valid values are:   * ReadOnly * Editable * DoNotDisplay
   * @member {String} displayLevelCode
   */
  _exports.prototype['displayLevelCode'] = undefined;
  /**
   *  The recipient's Social Security Number(SSN).
   * @member {String} ssn9
   */
  _exports.prototype['ssn9'] = undefined;

  return _exports;
});


