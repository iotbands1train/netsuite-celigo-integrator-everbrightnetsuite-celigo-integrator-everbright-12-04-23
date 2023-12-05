/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The ServerTemplate model module.
     * @module model/ServerTemplate
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>ServerTemplate</code>.
     * @alias module:model/ServerTemplate
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>ServerTemplate</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ServerTemplate} obj Optional instance to populate.
     * @return {module:model/ServerTemplate} The populated <code>ServerTemplate</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('sequence')) {
                obj['sequence'] = helpersModule.convertToType(data['sequence'], 'String');
            }
            if (data.hasOwnProperty('templateId')) {
                obj['templateId'] = helpersModule.convertToType(data['templateId'], 'String');
            }
        }
        return obj;
    }

    /**
     *
     * @member {String} sequence
     */
    _exports.prototype['sequence'] = undefined;
    /**
     * The unique identifier of the template. If this is not provided, DocuSign will generate a value.
     * @member {String} templateId
     */
    _exports.prototype['templateId'] = undefined;

    return _exports;
});