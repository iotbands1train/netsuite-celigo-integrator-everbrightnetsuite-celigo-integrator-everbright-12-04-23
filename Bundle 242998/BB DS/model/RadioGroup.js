/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './Radio'], function (helpersModule, radioModel) {
    /**
     * The RadioGroup model module.
     * @module model/RadioGroup
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>RadioGroup</code>.
     * @alias module:model/RadioGroup
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>RadioGroup</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/RadioGroup} obj Optional instance to populate.
     * @return {module:model/RadioGroup} The populated <code>RadioGroup</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('conditionalParentLabel')) {
                obj['conditionalParentLabel'] = helpersModule.convertToType(data['conditionalParentLabel'], 'String');
            }
            if (data.hasOwnProperty('conditionalParentValue')) {
                obj['conditionalParentValue'] = helpersModule.convertToType(data['conditionalParentValue'], 'String');
            }
            if (data.hasOwnProperty('documentId')) {
                obj['documentId'] = helpersModule.convertToType(data['documentId'], 'String');
            }
            if (data.hasOwnProperty('groupName')) {
                obj['groupName'] = helpersModule.convertToType(data['groupName'], 'String');
            }
            if (data.hasOwnProperty('radios')) {
                obj['radios'] = helpersModule.convertToType(data['radios'], [radioModel]);
            }
            if (data.hasOwnProperty('recipientId')) {
                obj['recipientId'] = helpersModule.convertToType(data['recipientId'], 'String');
            }
            if (data.hasOwnProperty('requireAll')) {
                obj['requireAll'] = helpersModule.convertToType(data['requireAll'], 'String');
            }
            if (data.hasOwnProperty('requireInitialOnSharedChange')) {
                obj['requireInitialOnSharedChange'] = helpersModule.convertToType(data['requireInitialOnSharedChange'], 'String');
            }
            if (data.hasOwnProperty('shared')) {
                obj['shared'] = helpersModule.convertToType(data['shared'], 'String');
            }
            if (data.hasOwnProperty('templateLocked')) {
                obj['templateLocked'] = helpersModule.convertToType(data['templateLocked'], 'String');
            }
            if (data.hasOwnProperty('templateRequired')) {
                obj['templateRequired'] = helpersModule.convertToType(data['templateRequired'], 'String');
            }
        }
        return obj;
    };

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
     * Specifies the document ID number that the tab is placed on. This must refer to an existing Document's ID attribute.
     * @member {String} documentId
     */
    _exports.prototype['documentId'] = undefined;
    /**
     * The name of the group.
     * @member {String} groupName
     */
    _exports.prototype['groupName'] = undefined;
    /**
     * Specifies the locations and status for radio buttons that are grouped together.
     * @member {Array.<module:model/Radio>} radios
     */
    _exports.prototype['radios'] = undefined;
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
     * Optional element for field markup. When set to **true**, the signer is required to initial when they modify a shared field.
     * @member {String} requireInitialOnSharedChange
     */
    _exports.prototype['requireInitialOnSharedChange'] = undefined;
    /**
     * When set to **true**, this custom tab is shared.
     * @member {String} shared
     */
    _exports.prototype['shared'] = undefined;
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

    return _exports;
});


