/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The TemplateMatch model module.
     * @module model/TemplateMatch
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>TemplateMatch</code>.
     * @alias module:model/TemplateMatch
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>TemplateMatch</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/TemplateMatch} obj Optional instance to populate.
     * @return {module:model/TemplateMatch} The populated <code>TemplateMatch</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('documentEndPage')) {
                obj['documentEndPage'] = helpersModule.convertToType(data['documentEndPage'], 'String');
            }
            if (data.hasOwnProperty('documentStartPage')) {
                obj['documentStartPage'] = helpersModule.convertToType(data['documentStartPage'], 'String');
            }
            if (data.hasOwnProperty('matchPercentage')) {
                obj['matchPercentage'] = helpersModule.convertToType(data['matchPercentage'], 'String');
            }
        }
        return obj;
    }

    /**
     *
     * @member {String} documentEndPage
     */
    _exports.prototype['documentEndPage'] = undefined;
    /**
     *
     * @member {String} documentStartPage
     */
    _exports.prototype['documentStartPage'] = undefined;
    /**
     *
     * @member {String} matchPercentage
     */
    _exports.prototype['matchPercentage'] = undefined;

    return _exports;
});


