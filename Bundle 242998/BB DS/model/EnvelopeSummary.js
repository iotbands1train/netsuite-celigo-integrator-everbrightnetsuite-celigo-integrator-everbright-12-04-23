/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function(helpersModule) {
    /**
     * The EnvelopeSummary model module.
     * @module model/EnvelopeSummary
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>EnvelopeSummary</code>.
     * @alias module:model/EnvelopeSummary
     * @class
     */
    var _exports = function() {
        var _this = this;
    };

    /**
     * Constructs a <code>EnvelopeSummary</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/EnvelopeSummary} obj Optional instance to populate.
     * @return {module:model/EnvelopeSummary} The populated <code>EnvelopeSummary</code> instance.
     */
    _exports.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('envelopeId')) {
                obj['envelopeId'] = helpersModule.convertToType(data['envelopeId'], 'String');
            }
            if (data.hasOwnProperty('status')) {
                obj['status'] = helpersModule.convertToType(data['status'], 'String');
            }
            if (data.hasOwnProperty('statusDateTime')) {
                obj['statusDateTime'] = helpersModule.convertToType(data['statusDateTime'], 'String');
            }
            if (data.hasOwnProperty('uri')) {
                obj['uri'] = helpersModule.convertToType(data['uri'], 'String');
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
     * Indicates the envelope status. Valid values are:  * sent - The envelope is sent to the recipients.  * created - The envelope is saved as a draft and can be modified and sent later.
     * @member {String} status
     */
    _exports.prototype['status'] = undefined;
    /**
     * The DateTime that the envelope changed status (i.e. was created or sent.)
     * @member {String} statusDateTime
     */
    _exports.prototype['statusDateTime'] = undefined;
    /**
     *
     * @member {String} uri
     */
    _exports.prototype['uri'] = undefined;



    return _exports;
});