/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ErrorDetails'], function (helpersModule, errorDetailsModel) {
    /**
     * The Radio model module.
     * @module model/Radio
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>Radio</code>.
     * @alias module:model/Radio
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>Radio</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/Radio} obj Optional instance to populate.
     * @return {module:model/Radio} The populated <code>Radio</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('anchorCaseSensitive')) {
                obj['anchorCaseSensitive'] = helpersModule.convertToType(data['anchorCaseSensitive'], 'String');
            }
            if (data.hasOwnProperty('anchorHorizontalAlignment')) {
                obj['anchorHorizontalAlignment'] = helpersModule.convertToType(data['anchorHorizontalAlignment'], 'String');
            }
            if (data.hasOwnProperty('anchorIgnoreIfNotPresent')) {
                obj['anchorIgnoreIfNotPresent'] = helpersModule.convertToType(data['anchorIgnoreIfNotPresent'], 'String');
            }
            if (data.hasOwnProperty('anchorMatchWholeWord')) {
                obj['anchorMatchWholeWord'] = helpersModule.convertToType(data['anchorMatchWholeWord'], 'String');
            }
            if (data.hasOwnProperty('anchorString')) {
                obj['anchorString'] = helpersModule.convertToType(data['anchorString'], 'String');
            }
            if (data.hasOwnProperty('anchorUnits')) {
                obj['anchorUnits'] = helpersModule.convertToType(data['anchorUnits'], 'String');
            }
            if (data.hasOwnProperty('anchorXOffset')) {
                obj['anchorXOffset'] = helpersModule.convertToType(data['anchorXOffset'], 'String');
            }
            if (data.hasOwnProperty('anchorYOffset')) {
                obj['anchorYOffset'] = helpersModule.convertToType(data['anchorYOffset'], 'String');
            }
            if (data.hasOwnProperty('errorDetails')) {
                obj['errorDetails'] = errorDetailsModel.constructFromObject(data['errorDetails']);
            }
            if (data.hasOwnProperty('locked')) {
                obj['locked'] = helpersModule.convertToType(data['locked'], 'String');
            }
            if (data.hasOwnProperty('pageNumber')) {
                obj['pageNumber'] = helpersModule.convertToType(data['pageNumber'], 'String');
            }
            if (data.hasOwnProperty('required')) {
                obj['required'] = helpersModule.convertToType(data['required'], 'String');
            }
            if (data.hasOwnProperty('selected')) {
                obj['selected'] = helpersModule.convertToType(data['selected'], 'String');
            }
            if (data.hasOwnProperty('tabId')) {
                obj['tabId'] = helpersModule.convertToType(data['tabId'], 'String');
            }
            if (data.hasOwnProperty('tabOrder')) {
                obj['tabOrder'] = helpersModule.convertToType(data['tabOrder'], 'String');
            }
            if (data.hasOwnProperty('value')) {
                obj['value'] = helpersModule.convertToType(data['value'], 'String');
            }
            if (data.hasOwnProperty('xPosition')) {
                obj['xPosition'] = helpersModule.convertToType(data['xPosition'], 'String');
            }
            if (data.hasOwnProperty('yPosition')) {
                obj['yPosition'] = helpersModule.convertToType(data['yPosition'], 'String');
            }
        }
        return obj;
    };

    /**
     * When set to **true**, the anchor string does not consider case when matching strings in the document. The default value is **true**.
     * @member {String} anchorCaseSensitive
     */
    _exports.prototype['anchorCaseSensitive'] = undefined;
    /**
     * Specifies the alignment of anchor tabs with anchor strings. Possible values are **left** or **right**. The default value is **left**.
     * @member {String} anchorHorizontalAlignment
     */
    _exports.prototype['anchorHorizontalAlignment'] = undefined;
    /**
     * When set to **true**, this tab is ignored if anchorString is not found in the document.
     * @member {String} anchorIgnoreIfNotPresent
     */
    _exports.prototype['anchorIgnoreIfNotPresent'] = undefined;
    /**
     * When set to **true**, the anchor string in this tab matches whole words only (strings embedded in other strings are ignored.) The default value is **true**.
     * @member {String} anchorMatchWholeWord
     */
    _exports.prototype['anchorMatchWholeWord'] = undefined;
    /**
     * Anchor text information for a radio button.
     * @member {String} anchorString
     */
    _exports.prototype['anchorString'] = undefined;
    /**
     * Specifies units of the X and Y offset. Units could be pixels, millimeters, centimeters, or inches.
     * @member {String} anchorUnits
     */
    _exports.prototype['anchorUnits'] = undefined;
    /**
     * Specifies the X axis location of the tab, in anchorUnits, relative to the anchorString.
     * @member {String} anchorXOffset
     */
    _exports.prototype['anchorXOffset'] = undefined;
    /**
     * Specifies the Y axis location of the tab, in anchorUnits, relative to the anchorString.
     * @member {String} anchorYOffset
     */
    _exports.prototype['anchorYOffset'] = undefined;
    /**
     * @member {module:model/ErrorDetails} errorDetails
     */
    _exports.prototype['errorDetails'] = undefined;
    /**
     * When set to **true**, the signer cannot change the data of the custom tab.
     * @member {String} locked
     */
    _exports.prototype['locked'] = undefined;
    /**
     * Specifies the page number on which the tab is located.
     * @member {String} pageNumber
     */
    _exports.prototype['pageNumber'] = undefined;
    /**
     * When set to **true**, the signer is required to fill out this tab
     * @member {String} required
     */
    _exports.prototype['required'] = undefined;
    /**
     * When set to **true**, the radio button is selected.
     * @member {String} selected
     */
    _exports.prototype['selected'] = undefined;
    /**
     * The unique identifier for the tab. The tabid can be retrieved with the [ML:GET call].
     * @member {String} tabId
     */
    _exports.prototype['tabId'] = undefined;
    /**
     *
     * @member {String} tabOrder
     */
    _exports.prototype['tabOrder'] = undefined;
    /**
     * Specifies the value of the tab.
     * @member {String} value
     */
    _exports.prototype['value'] = undefined;
    /**
     * This indicates the horizontal offset of the object on the page. DocuSign uses 72 DPI when determining position.
     * @member {String} xPosition
     */
    _exports.prototype['xPosition'] = undefined;
    /**
     * This indicates the vertical offset of the object on the page. DocuSign uses 72 DPI when determining position.
     * @member {String} yPosition
     */
    _exports.prototype['yPosition'] = undefined;
  
    return _exports;
});