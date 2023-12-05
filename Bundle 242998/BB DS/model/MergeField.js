/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function(helpersModule) {
    /**
     * The MergeField model module.
     * @module model/MergeField
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>MergeField</code>.
     * Contains information for transfering values between Salesforce data fields and DocuSign Tabs.
     * @alias module:model/MergeField
     * @class
     */
    var exports = function() {
        var _this = this;
    };

    /**
     * Constructs a <code>MergeField</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/MergeField} obj Optional instance to populate.
     * @return {module:model/MergeField} The populated <code>MergeField</code> instance.
     */
    exports.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new exports();

            if (data.hasOwnProperty('allowSenderToEdit')) {
                obj['allowSenderToEdit'] = helpersModule.convertToType(data['allowSenderToEdit'], 'String');
            }
            if (data.hasOwnProperty('configurationType')) {
                obj['configurationType'] = helpersModule.convertToType(data['configurationType'], 'String');
            }
            if (data.hasOwnProperty('path')) {
                obj['path'] = helpersModule.convertToType(data['path'], 'String');
            }
            if (data.hasOwnProperty('row')) {
                obj['row'] = helpersModule.convertToType(data['row'], 'String');
            }
            if (data.hasOwnProperty('writeBack')) {
                obj['writeBack'] = helpersModule.convertToType(data['writeBack'], 'String');
            }
        }
        return obj;
    };

    /**
     * When set to **true**, the sender can modify the value of the custom tab during the sending process.
     * @member {String} allowSenderToEdit
     */
    exports.prototype['allowSenderToEdit'] = undefined;
    /**
     * If merge field's are being used, specifies the type of the merge field. The only  supported value is **salesforce**.
     * @member {String} configurationType
     */
    exports.prototype['configurationType'] = undefined;
    /**
     * Sets the object associated with the custom tab. Currently this is the Salesforce Object.
     * @member {String} path
     */
    exports.prototype['path'] = undefined;
    /**
     * Specifies the row number in a Salesforce table that the merge field value corresponds to.
     * @member {String} row
     */
    exports.prototype['row'] = undefined;
    /**
     * When wet to true, the information entered in the tab automatically updates the related Salesforce data when an envelope is completed.
     * @member {String} writeBack
     */
    exports.prototype['writeBack'] = undefined;



    return exports;
});

