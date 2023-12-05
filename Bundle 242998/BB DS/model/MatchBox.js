/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The MatchBox model module.
     * @module model/MatchBox
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>MatchBox</code>.
     * @alias module:model/MatchBox
     * @class
     */
    var _exports = function () {
        var _this = this;


    };

    /**
     * Constructs a <code>MatchBox</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/MatchBox} obj Optional instance to populate.
     * @return {module:model/MatchBox} The populated <code>MatchBox</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('height')) {
                obj['height'] = helpersModule.convertToType(data['height'], 'Number');
            }
            if (data.hasOwnProperty('pageNumber')) {
                obj['pageNumber'] = helpersModule.convertToType(data['pageNumber'], 'Number');
            }
            if (data.hasOwnProperty('width')) {
                obj['width'] = helpersModule.convertToType(data['width'], 'Number');
            }
            if (data.hasOwnProperty('xPosition')) {
                obj['xPosition'] = helpersModule.convertToType(data['xPosition'], 'Number');
            }
            if (data.hasOwnProperty('yPosition')) {
                obj['yPosition'] = helpersModule.convertToType(data['yPosition'], 'Number');
            }
        }
        return obj;
    };

    /**
     * Height of the tab in pixels.
     * @member {Number} height
     */
    _exports.prototype['height'] = undefined;
    /**
     * Specifies the page number on which the tab is located.
     * @member {Number} pageNumber
     */
    _exports.prototype['pageNumber'] = undefined;
    /**
     * Width of the tab in pixels.
     * @member {Number} width
     */
    _exports.prototype['width'] = undefined;
    /**
     * This indicates the horizontal offset of the object on the page. DocuSign uses 72 DPI when determining position.
     * @member {Number} xPosition
     */
    _exports.prototype['xPosition'] = undefined;
    /**
     * This indicates the vertical offset of the object on the page. DocuSign uses 72 DPI when determining position.
     * @member {Number} yPosition
     */
    _exports.prototype['yPosition'] = undefined;

    return _exports;
});