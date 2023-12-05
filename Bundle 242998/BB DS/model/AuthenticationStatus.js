/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./EventResult'], function (eventResultModel) {
    /**
     * The AuthenticationStatus model module.
     * @module model/AuthenticationStatus
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>AuthenticationStatus</code>.
     * Contains information about the authentication status.
     * @alias module:model/AuthenticationStatus
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>AuthenticationStatus</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/AuthenticationStatus} obj Optional instance to populate.
     * @return {module:model/AuthenticationStatus} The populated <code>AuthenticationStatus</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('accessCodeResult')) {
                obj['accessCodeResult'] = eventResultModel.constructFromObject(data['accessCodeResult']);
            }
            if (data.hasOwnProperty('ageVerifyResult')) {
                obj['ageVerifyResult'] = eventResultModel.constructFromObject(data['ageVerifyResult']);
            }
            if (data.hasOwnProperty('anySocialIDResult')) {
                obj['anySocialIDResult'] = eventResultModel.constructFromObject(data['anySocialIDResult']);
            }
            if (data.hasOwnProperty('facebookResult')) {
                obj['facebookResult'] = eventResultModel.constructFromObject(data['facebookResult']);
            }
            if (data.hasOwnProperty('googleResult')) {
                obj['googleResult'] = eventResultModel.constructFromObject(data['googleResult']);
            }
            if (data.hasOwnProperty('idLookupResult')) {
                obj['idLookupResult'] = eventResultModel.constructFromObject(data['idLookupResult']);
            }
            if (data.hasOwnProperty('idQuestionsResult')) {
                obj['idQuestionsResult'] = eventResultModel.constructFromObject(data['idQuestionsResult']);
            }
            if (data.hasOwnProperty('linkedinResult')) {
                obj['linkedinResult'] = eventResultModel.constructFromObject(data['linkedinResult']);
            }
            if (data.hasOwnProperty('liveIDResult')) {
                obj['liveIDResult'] = eventResultModel.constructFromObject(data['liveIDResult']);
            }
            if (data.hasOwnProperty('ofacResult')) {
                obj['ofacResult'] = eventResultModel.constructFromObject(data['ofacResult']);
            }
            if (data.hasOwnProperty('openIDResult')) {
                obj['openIDResult'] = eventResultModel.constructFromObject(data['openIDResult']);
            }
            if (data.hasOwnProperty('phoneAuthResult')) {
                obj['phoneAuthResult'] = eventResultModel.constructFromObject(data['phoneAuthResult']);
            }
            if (data.hasOwnProperty('salesforceResult')) {
                obj['salesforceResult'] = eventResultModel.constructFromObject(data['salesforceResult']);
            }
            if (data.hasOwnProperty('signatureProviderResult')) {
                obj['signatureProviderResult'] = eventResultModel.constructFromObject(data['signatureProviderResult']);
            }
            if (data.hasOwnProperty('smsAuthResult')) {
                obj['smsAuthResult'] = eventResultModel.constructFromObject(data['smsAuthResult']);
            }
            if (data.hasOwnProperty('sTANPinResult')) {
                obj['sTANPinResult'] = eventResultModel.constructFromObject(data['sTANPinResult']);
            }
            if (data.hasOwnProperty('twitterResult')) {
                obj['twitterResult'] = eventResultModel.constructFromObject(data['twitterResult']);
            }
            if (data.hasOwnProperty('yahooResult')) {
                obj['yahooResult'] = eventResultModel.constructFromObject(data['yahooResult']);
            }
        }
        return obj;
    };

    /**
     * @member {module:model/EventResult} accessCodeResult
     */
    _exports.prototype['accessCodeResult'] = undefined;
    /**
     * @member {module:model/EventResult} ageVerifyResult
     */
    _exports.prototype['ageVerifyResult'] = undefined;
    /**
     * @member {module:model/EventResult} anySocialIDResult
     */
    _exports.prototype['anySocialIDResult'] = undefined;
    /**
     * @member {module:model/EventResult} facebookResult
     */
    _exports.prototype['facebookResult'] = undefined;
    /**
     * @member {module:model/EventResult} googleResult
     */
    _exports.prototype['googleResult'] = undefined;
    /**
     * @member {module:model/EventResult} idLookupResult
     */
    _exports.prototype['idLookupResult'] = undefined;
    /**
     * @member {module:model/EventResult} idQuestionsResult
     */
    _exports.prototype['idQuestionsResult'] = undefined;
    /**
     * @member {module:model/EventResult} linkedinResult
     */
    _exports.prototype['linkedinResult'] = undefined;
    /**
     * @member {module:model/EventResult} liveIDResult
     */
    _exports.prototype['liveIDResult'] = undefined;
    /**
     * @member {module:model/EventResult} ofacResult
     */
    _exports.prototype['ofacResult'] = undefined;
    /**
     * @member {module:model/EventResult} openIDResult
     */
    _exports.prototype['openIDResult'] = undefined;
    /**
     * @member {module:model/EventResult} phoneAuthResult
     */
    _exports.prototype['phoneAuthResult'] = undefined;
    /**
     * @member {module:model/EventResult} salesforceResult
     */
    _exports.prototype['salesforceResult'] = undefined;
    /**
     * @member {module:model/EventResult} signatureProviderResult
     */
    _exports.prototype['signatureProviderResult'] = undefined;
    /**
     * @member {module:model/EventResult} smsAuthResult
     */
    _exports.prototype['smsAuthResult'] = undefined;
    /**
     * @member {module:model/EventResult} sTANPinResult
     */
    _exports.prototype['sTANPinResult'] = undefined;
    /**
     * @member {module:model/EventResult} twitterResult
     */
    _exports.prototype['twitterResult'] = undefined;
    /**
     * @member {module:model/EventResult} yahooResult
     */
    _exports.prototype['yahooResult'] = undefined;

    return _exports;
});


