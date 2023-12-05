/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './ErrorDetails', './MergeField'], function (helpersModule, errorDetailsModel, mergeFieldModel) {
  /**
   * The Ssn model module.
   * @module model/Ssn
   * @version 0.0.1
   */

  /**
   * Constructs a new <code>Ssn</code>.
   * @alias module:model/Ssn
   * @class
   */
  var _exports = function() {
    var _this = this;
  };

  /**
   * Constructs a <code>Ssn</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Ssn} obj Optional instance to populate.
   * @return {module:model/Ssn} The populated <code>Ssn</code> instance.
   */
  _exports.constructFromObject = function(data, obj) {
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
      if (data.hasOwnProperty('concealValueOnDocument')) {
        obj['concealValueOnDocument'] = helpersModule.convertToType(data['concealValueOnDocument'], 'String');
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
      if (data.hasOwnProperty('disableAutoSize')) {
        obj['disableAutoSize'] = helpersModule.convertToType(data['disableAutoSize'], 'String');
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
      if (data.hasOwnProperty('locked')) {
        obj['locked'] = helpersModule.convertToType(data['locked'], 'String');
      }
      if (data.hasOwnProperty('maxLength')) {
        obj['maxLength'] = helpersModule.convertToType(data['maxLength'], 'Number');
      }
      if (data.hasOwnProperty('mergeField')) {
        obj['mergeField'] = mergeFieldModel.constructFromObject(data['mergeField']);
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = helpersModule.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('originalValue')) {
        obj['originalValue'] = helpersModule.convertToType(data['originalValue'], 'String');
      }
      if (data.hasOwnProperty('pageNumber')) {
        obj['pageNumber'] = helpersModule.convertToType(data['pageNumber'], 'String');
      }
      if (data.hasOwnProperty('recipientId')) {
        obj['recipientId'] = helpersModule.convertToType(data['recipientId'], 'String');
      }
      if (data.hasOwnProperty('requireAll')) {
        obj['requireAll'] = helpersModule.convertToType(data['requireAll'], 'String');
      }
      if (data.hasOwnProperty('required')) {
        obj['required'] = helpersModule.convertToType(data['required'], 'String');
      }
      if (data.hasOwnProperty('requireInitialOnSharedChange')) {
        obj['requireInitialOnSharedChange'] = helpersModule.convertToType(data['requireInitialOnSharedChange'], 'String');
      }
      if (data.hasOwnProperty('senderRequired')) {
        obj['senderRequired'] = helpersModule.convertToType(data['senderRequired'], 'String');
      }
      if (data.hasOwnProperty('shared')) {
        obj['shared'] = helpersModule.convertToType(data['shared'], 'String');
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
      if (data.hasOwnProperty('validationMessage')) {
        obj['validationMessage'] = helpersModule.convertToType(data['validationMessage'], 'String');
      }
      if (data.hasOwnProperty('validationPattern')) {
        obj['validationPattern'] = helpersModule.convertToType(data['validationPattern'], 'String');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = helpersModule.convertToType(data['value'], 'String');
      }
      if (data.hasOwnProperty('width')) {
        obj['width'] = helpersModule.convertToType(data['width'], 'Number');
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
   * When set to **true**, the field appears normally while the recipient is adding or modifying the information in the field, but the data is not visible (the characters are hidden by asterisks) to any other signer or the sender.  When an envelope is completed the information is available to the sender through the Form Data link in the DocuSign Console.  This setting applies only to text boxes and does not affect list boxes, radio buttons, or check boxes.
   * @member {String} concealValueOnDocument
   */
  _exports.prototype['concealValueOnDocument'] = undefined;
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
   * When set to **true**, disables the auto sizing of single line text boxes in the signing screen when the signer enters data. If disabled users will only be able enter as much data as the text box can hold. By default this is false. This property only affects single line text boxes.
   * @member {String} disableAutoSize
   */
  _exports.prototype['disableAutoSize'] = undefined;
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
   * When set to **true**, the signer cannot change the data of the custom tab.
   * @member {String} locked
   */
  _exports.prototype['locked'] = undefined;
  /**
   * An optional value that describes the maximum length of the property when the property is a string.
   * @member {Number} maxLength
   */
  _exports.prototype['maxLength'] = undefined;
  /**
   * @member {module:model/MergeField} mergeField
   */
  _exports.prototype['mergeField'] = undefined;
  /**
   * Specifies the tool tip text for the tab.
   * @member {String} name
   */
  _exports.prototype['name'] = undefined;
  /**
   * The initial value of the tab when it was sent to the recipient. 
   * @member {String} originalValue
   */
  _exports.prototype['originalValue'] = undefined;
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
   * When set to **true** and shared is true, information must be entered in this field to complete the envelope. 
   * @member {String} requireAll
   */
  _exports.prototype['requireAll'] = undefined;
  /**
   * When set to **true**, the signer is required to fill out this tab
   * @member {String} required
   */
  _exports.prototype['required'] = undefined;
  /**
   * Optional element for field markup. When set to **true**, the signer is required to initial when they modify a shared field.
   * @member {String} requireInitialOnSharedChange
   */
  _exports.prototype['requireInitialOnSharedChange'] = undefined;
  /**
   * When set to **true**, the sender must populate the tab before an envelope can be sent using the template.   This value tab can only be changed by modifying (PUT) the template.   Tabs with a `senderRequired` value of true cannot be deleted from an envelope.
   * @member {String} senderRequired
   */
  _exports.prototype['senderRequired'] = undefined;
  /**
   * When set to **true**, this custom tab is shared.
   * @member {String} shared
   */
  _exports.prototype['shared'] = undefined;
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
   * The message displayed if the custom tab fails input validation (either custom of embedded).
   * @member {String} validationMessage
   */
  _exports.prototype['validationMessage'] = undefined;
  /**
   * A regular expression used to validate input for the tab.
   * @member {String} validationPattern
   */
  _exports.prototype['validationPattern'] = undefined;
  /**
   * Specifies the value of the tab. 
   * @member {String} value
   */
  _exports.prototype['value'] = undefined;
  /**
   * Width of the tab in pixels.
   * @member {Number} width
   */
  _exports.prototype['width'] = undefined;
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