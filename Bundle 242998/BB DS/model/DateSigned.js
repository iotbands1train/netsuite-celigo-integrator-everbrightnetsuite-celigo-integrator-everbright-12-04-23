/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ErrorDetails', './MergeField'], function (helpersModule, errorDetailsModel, mergeFieldModel) {
    /**
     * The DateSigned model module.
     * @module model/DateSigned
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>DateSigned</code>.
     * @alias module:model/DateSigned
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>DateSigned</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/DateSigned} obj Optional instance to populate.
     * @return {module:model/DateSigned} The populated <code>DateSigned</code> instance.
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
            if (data.hasOwnProperty('bold')) {
                obj['bold'] = helpersModule.convertToType(data['bold'], 'String');
            }
            if (data.hasOwnProperty('conditionalParentLabel')) {
                obj['conditionalParentLabel'] = helpersModule.convertToType(data['conditionalParentLabel'], 'String');
            }
            if (data.hasOwnProperty('conditionalParentValue')) {
                obj['conditionalParentValue'] = helpersModule.convertToType(data['conditionalParentValue'], 'String');
            }
            if (data.hasOwnProperty('customTabId')) {
                obj['customTabId'] = helpersModule.convertToType(data['customTabId'], 'String');
            }
            if (data.hasOwnProperty('documentId')) {
                obj['documentId'] = helpersModule.convertToType(data['documentId'], 'String');
            }
            if (data.hasOwnProperty('errorDetails')) {
                obj['errorDetails'] = errorDetailsModel.constructFromObject(data['errorDetails']);
            }
            if (data.hasOwnProperty('font')) {
                obj['font'] = helpersModule.convertToType(data['font'], 'String');
            }
            if (data.hasOwnProperty('fontColor')) {
                obj['fontColor'] = helpersModule.convertToType(data['fontColor'], 'String');
            }
            if (data.hasOwnProperty('fontSize')) {
                obj['fontSize'] = helpersModule.convertToType(data['fontSize'], 'String');
            }
            if (data.hasOwnProperty('italic')) {
                obj['italic'] = helpersModule.convertToType(data['italic'], 'String');
            }
            if (data.hasOwnProperty('mergeField')) {
                obj['mergeField'] = mergeFieldModel.constructFromObject(data['mergeField']);
            }
            if (data.hasOwnProperty('name')) {
                obj['name'] = helpersModule.convertToType(data['name'], 'String');
            }
            if (data.hasOwnProperty('pageNumber')) {
                obj['pageNumber'] = helpersModule.convertToType(data['pageNumber'], 'String');
            }
            if (data.hasOwnProperty('recipientId')) {
                obj['recipientId'] = helpersModule.convertToType(data['recipientId'], 'String');
            }
            if (data.hasOwnProperty('status')) {
                obj['status'] = helpersModule.convertToType(data['status'], 'String');
            }
            if (data.hasOwnProperty('tabId')) {
                obj['tabId'] = helpersModule.convertToType(data['tabId'], 'String');
            }
            if (data.hasOwnProperty('tabLabel')) {
                obj['tabLabel'] = helpersModule.convertToType(data['tabLabel'], 'String');
            }
            if (data.hasOwnProperty('tabOrder')) {
                obj['tabOrder'] = helpersModule.convertToType(data['tabOrder'], 'String');
            }
            if (data.hasOwnProperty('templateLocked')) {
                obj['templateLocked'] = helpersModule.convertToType(data['templateLocked'], 'String');
            }
            if (data.hasOwnProperty('templateRequired')) {
                obj['templateRequired'] = helpersModule.convertToType(data['templateRequired'], 'String');
            }
            if (data.hasOwnProperty('underline')) {
                obj['underline'] = helpersModule.convertToType(data['underline'], 'String');
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
     * When set to **true**, the information in the tab is bold.
     * @member {String} bold
     */
    _exports.prototype['bold'] = undefined;
    /**
     * For conditional fields this is the TabLabel of the parent tab that controls this tab's visibility.
     * @member {String} conditionalParentLabel
     */
    _exports.prototype['conditionalParentLabel'] = undefined;
    /**
     * For conditional fields, this is the value of the parent tab that controls the tab's visibility.  If the parent tab is a Checkbox, Radio button, Optional Signature, or Optional Initial use \"on\" as the value to show that the parent tab is active.
     * @member {String} conditionalParentValue
     */
    _exports.prototype['conditionalParentValue'] = undefined;
    /**
     * The DocuSign generated custom tab ID for the custom tab to be applied. This can only be used when adding new tabs for a recipient. When used, the new tab inherits all the custom tab properties.
     * @member {String} customTabId
     */
    _exports.prototype['customTabId'] = undefined;
    /**
     * Specifies the document ID number that the tab is placed on. This must refer to an existing Document's ID attribute.
     * @member {String} documentId
     */
    _exports.prototype['documentId'] = undefined;
    /**
     * @member {module:model/ErrorDetails} errorDetails
     */
    _exports.prototype['errorDetails'] = undefined;
    /**
     * The font to be used for the tab value. Supported Fonts: Arial, Arial, ArialNarrow, Calibri, CourierNew, Garamond, Georgia, Helvetica,   LucidaConsole, Tahoma, TimesNewRoman, Trebuchet, Verdana, MSGothic, MSMincho, Default.
     * @member {String} font
     */
    _exports.prototype['font'] = undefined;
    /**
     * The font color used for the information in the tab.  Possible values are: Black, BrightBlue, BrightRed, DarkGreen, DarkRed, Gold, Green, NavyBlue, Purple, or White.
     * @member {String} fontColor
     */
    _exports.prototype['fontColor'] = undefined;
    /**
     * The font size used for the information in the tab.  Possible values are: Size7, Size8, Size9, Size10, Size11, Size12, Size14, Size16, Size18, Size20, Size22, Size24, Size26, Size28, Size36, Size48, or Size72.
     * @member {String} fontSize
     */
    _exports.prototype['fontSize'] = undefined;
    /**
     * When set to **true**, the information in the tab is italic.
     * @member {String} italic
     */
    _exports.prototype['italic'] = undefined;
    /**
     * @member {module:model/MergeField} mergeField
     */
    _exports.prototype['mergeField'] = undefined;
    /**
     *
     * @member {String} name
     */
    _exports.prototype['name'] = undefined;
    /**
     * Specifies the page number on which the tab is located.
     * @member {String} pageNumber
     */
    _exports.prototype['pageNumber'] = undefined;
    /**
     * Unique for the recipient. It is used by the tab element to indicate which recipient is to sign the Document.
     * @member {String} recipientId
     */
    _exports.prototype['recipientId'] = undefined;
    /**
     * Indicates the envelope status. Valid values are:  * sent - The envelope is sent to the recipients.  * created - The envelope is saved as a draft and can be modified and sent later.
     * @member {String} status
     */
    _exports.prototype['status'] = undefined;
    /**
     * The unique identifier for the tab. The tabid can be retrieved with the [ML:GET call].
     * @member {String} tabId
     */
    _exports.prototype['tabId'] = undefined;
    /**
     * The label string associated with the tab.
     * @member {String} tabLabel
     */
    _exports.prototype['tabLabel'] = undefined;
    /**
     *
     * @member {String} tabOrder
     */
    _exports.prototype['tabOrder'] = undefined;
    /**
     * When set to **true**, the sender cannot change any attributes of the recipient. Used only when working with template recipients.
     * @member {String} templateLocked
     */
    _exports.prototype['templateLocked'] = undefined;
    /**
     * When set to **true**, the sender may not remove the recipient. Used only when working with template recipients.
     * @member {String} templateRequired
     */
    _exports.prototype['templateRequired'] = undefined;
    /**
     * When set to **true**, the information in the tab is underlined.
     * @member {String} underline
     */
    _exports.prototype['underline'] = undefined;
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


