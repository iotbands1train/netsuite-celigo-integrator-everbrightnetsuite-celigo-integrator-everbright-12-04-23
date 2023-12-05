/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The PaymentLineItem model module.
     * @module model/PaymentLineItem
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>PaymentLineItem</code>.
     * @alias module:model/PaymentLineItem
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>PaymentLineItem</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/PaymentLineItem} obj Optional instance to populate.
     * @return {module:model/PaymentLineItem} The populated <code>PaymentLineItem</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('amountReference')) {
                obj['amountReference'] = helpersModule.convertToType(data['amountReference'], 'String');
            }
            if (data.hasOwnProperty('description')) {
                obj['description'] = helpersModule.convertToType(data['description'], 'String');
            }
            if (data.hasOwnProperty('itemCode')) {
                obj['itemCode'] = helpersModule.convertToType(data['itemCode'], 'String');
            }
            if (data.hasOwnProperty('name')) {
                obj['name'] = helpersModule.convertToType(data['name'], 'String');
            }
        }
        return obj;
    };

    /**
     *
     * @member {String} amountReference
     */
    _exports.prototype['amountReference'] = undefined;
    /**
     *
     * @member {String} description
     */
    _exports.prototype['description'] = undefined;
    /**
     *
     * @member {String} itemCode
     */
    _exports.prototype['itemCode'] = undefined;
    /**
     *
     * @member {String} name
     */
    _exports.prototype['name'] = undefined;

    return _exports;
});


