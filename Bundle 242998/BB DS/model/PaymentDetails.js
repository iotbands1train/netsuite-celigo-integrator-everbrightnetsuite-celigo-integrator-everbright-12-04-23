/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './Money', './PaymentLineItem'], function (helpersModule, moneyModel, paymentLineItemModel) {
    /**
     * The PaymentDetails model module.
     * @module model/PaymentDetails
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>PaymentDetails</code>.
     * @alias module:model/PaymentDetails
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>PaymentDetails</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/PaymentDetails} obj Optional instance to populate.
     * @return {module:model/PaymentDetails} The populated <code>PaymentDetails</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('allowedPaymentMethods')) {
                obj['allowedPaymentMethods'] = helpersModule.convertToType(data['allowedPaymentMethods'], ['String']);
            }
            if (data.hasOwnProperty('chargeId')) {
                obj['chargeId'] = helpersModule.convertToType(data['chargeId'], 'String');
            }
            if (data.hasOwnProperty('currencyCode')) {
                obj['currencyCode'] = helpersModule.convertToType(data['currencyCode'], 'String');
            }
            if (data.hasOwnProperty('gatewayAccountId')) {
                obj['gatewayAccountId'] = helpersModule.convertToType(data['gatewayAccountId'], 'String');
            }
            if (data.hasOwnProperty('gatewayDisplayName')) {
                obj['gatewayDisplayName'] = helpersModule.convertToType(data['gatewayDisplayName'], 'String');
            }
            if (data.hasOwnProperty('gatewayName')) {
                obj['gatewayName'] = helpersModule.convertToType(data['gatewayName'], 'String');
            }
            if (data.hasOwnProperty('lineItems')) {
                obj['lineItems'] = helpersModule.convertToType(data['lineItems'], [paymentLineItemModel]);
            }
            if (data.hasOwnProperty('status')) {
                obj['status'] = helpersModule.convertToType(data['status'], 'String');
            }
            if (data.hasOwnProperty('total')) {
                obj['total'] = moneyModel.constructFromObject(data['total']);
            }
        }
        return obj;
    };

    /**
     *
     * @member {Array.<String>} allowedPaymentMethods
     */
    _exports.prototype['allowedPaymentMethods'] = undefined;
    /**
     *
     * @member {String} chargeId
     */
    _exports.prototype['chargeId'] = undefined;
    /**
     *
     * @member {String} currencyCode
     */
    _exports.prototype['currencyCode'] = undefined;
    /**
     *
     * @member {String} gatewayAccountId
     */
    _exports.prototype['gatewayAccountId'] = undefined;
    /**
     *
     * @member {String} gatewayDisplayName
     */
    _exports.prototype['gatewayDisplayName'] = undefined;
    /**
     *
     * @member {String} gatewayName
     */
    _exports.prototype['gatewayName'] = undefined;
    /**
     *
     * @member {Array.<module:model/PaymentLineItem>} lineItems
     */
    _exports.prototype['lineItems'] = undefined;
    /**
     * Indicates the envelope status. Valid values are:  * sent - The envelope is sent to the recipients.  * created - The envelope is saved as a draft and can be modified and sent later.
     * @member {String} status
     */
    _exports.prototype['status'] = undefined;
    /**
     * @member {module:model/Money} total
     */
    _exports.prototype['total'] = undefined;

    return _exports;
});


