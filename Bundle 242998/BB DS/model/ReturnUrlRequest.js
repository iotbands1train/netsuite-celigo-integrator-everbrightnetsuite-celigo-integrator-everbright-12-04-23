/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function(helpersModule){
    /**
     * The ReturnUrlRequest model module.
     * @module model/ReturnUrlRequest
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>ReturnUrlRequest</code>.
     * @alias module:model/ReturnUrlRequest
     * @class
     */
    var exports = function() {
        var _this = this;


    };

    /**
     * Constructs a <code>ReturnUrlRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ReturnUrlRequest} obj Optional instance to populate.
     * @return {module:model/ReturnUrlRequest} The populated <code>ReturnUrlRequest</code> instance.
     */
    exports.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new exports();

            if (data.hasOwnProperty('returnUrl')) {
                obj['returnUrl'] = helpersModule.convertToType(data['returnUrl'], 'String');
            }
        }
        return obj;
    };

    /**
     * Identifies the return point after sending the envelope. DocuSign returns to the URL and includes an event parameter that can be used to redirect the recipient to another location. The possible event parameters returned are:   * send (user sends the envelope) * save (user saves the envelope) * cancel (user cancels the sending transaction. No envelopeId is returned in this case.) * error (there is an error when performing the send) * sessionEnd (the sending session ends before the user completes another action).
     * @member {String} returnUrl
     */
    exports.prototype['returnUrl'] = undefined;



    return exports;
});