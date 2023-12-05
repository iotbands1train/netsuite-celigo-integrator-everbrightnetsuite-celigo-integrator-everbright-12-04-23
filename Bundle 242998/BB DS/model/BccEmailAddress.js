/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers'], function (helpersModule) {
    /**
     * The BccEmailAddress model module.
     * @module model/BccEmailAddress
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>BccEmailAddress</code>.
     * Contains information about the BCC email address.
     * @alias module:model/BccEmailAddress
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>BccEmailAddress</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/BccEmailAddress} obj Optional instance to populate.
     * @return {module:model/BccEmailAddress} The populated <code>BccEmailAddress</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('bccEmailAddressId')) {
                obj['bccEmailAddressId'] = helpersModule.convertToType(data['bccEmailAddressId'], 'String');
            }
            if (data.hasOwnProperty('email')) {
                obj['email'] = helpersModule.convertToType(data['email'], 'String');
            }
        }
        return obj;
    };

    /**
     * Only users with canManageAccount setting can use this option. An array of up to 5 email addresses the envelope is sent to as a BCC email.    Example: If your account has BCC for Email Archive set up for the email address 'archive@mycompany.com' and you send an envelope using the BCC Email Override to send a BCC email to 'salesarchive@mycompany.com', then a copy of the envelope is only sent to the 'salesarchive@mycompany.com' email address.
     * @member {String} bccEmailAddressId
     */
    _exports.prototype['bccEmailAddressId'] = undefined;
    /**
     * Specifies the BCC email address. DocuSign verifies that the email format is correct, but does not verify that the email is active.Using this overrides the BCC for Email Archive information setting for this envelope.  Maximum of length: 100 characters.
     * @member {String} email
     */
    _exports.prototype['email'] = undefined;

    return _exports;
});


