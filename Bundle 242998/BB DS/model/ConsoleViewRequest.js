/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'],
    function (helpersModule) {
      /**
       * The ConsoleViewRequest model module.
       * @module model/ConsoleViewRequest
       * @version 0.0.1
       */

      /**
       * Constructs a new <code>ConsoleViewRequest</code>.
       * @alias module:model/ConsoleViewRequest
       * @class
       */
      var _exports = function () {
        var _this = this;
      };

      /**
       * Constructs a <code>ConsoleViewRequest</code> from a plain JavaScript object, optionally creating a new instance.
       * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
       * @param {Object} data The plain JavaScript object bearing properties of interest.
       * @param {module:model/ConsoleViewRequest} obj Optional instance to populate.
       * @return {module:model/ConsoleViewRequest} The populated <code>ConsoleViewRequest</code> instance.
       */
      _exports.constructFromObject = function(data, obj) {
        if (data) {
          obj = obj || new exports();

          if (data.hasOwnProperty('envelopeId')) {
            obj['envelopeId'] = helpersModule.convertToType(data['envelopeId'], 'String');
          }
          if (data.hasOwnProperty('returnUrl')) {
            obj['returnUrl'] = helpersModule.convertToType(data['returnUrl'], 'String');
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
       * The URL to be redirected to after the console view session has ended.
       * @member {String} returnUrl
       */
      _exports.prototype['returnUrl'] = undefined;



      return _exports;
    });