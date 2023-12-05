/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './BccEmailAddress'], function (helpersModule, bccEmailAddressModel) {
    /**
     * The EmailSettings model module.
     * @module model/EmailSettings
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>EmailSettings</code>.
     * A complex element that allows  the sender to override some envelope email setting information. This can be used to override the Reply To email address and name associated with the envelope and to override the BCC email addresses to which an envelope is sent.   When the emailSettings information is used for an envelope, it only applies to that envelope.   **IMPORTANT**: The emailSettings information is not returned in the GET for envelope status. Use GET /email_settings to return information about the emailSettings.   EmailSettings consists of:   * replyEmailAddressOverride - The Reply To email used for the envelope. DocuSign will verify that a correct email format is used, but does not verify that the email is active. Maximum Length: 100 characters. * replyEmailNameOverride - The name associated with the Reply To email address. Maximum Length: 100 characters. * bccEmailAddresses - An array of up to five email addresses to which the envelope is sent to as a BCC email. Only users with canManageAccount setting set to true can use this option.  DocuSign verifies that the email format is correct, but does not verify that the email is active. Using this overrides the BCC for Email Archive information setting for this envelope. Maximum Length: 100 characters. *Example*: if your account has BCC for Email Archive set up for the email address &#39;archive@mycompany.com&#39; and you send an envelope using the BCC Email Override to send a BCC email to &#39;salesarchive@mycompany.com&#39;, then a copy of the envelope is only sent to the &#39;salesarchive@mycompany.com&#39; email address.
     * @alias module:model/EmailSettings
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>EmailSettings</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/EmailSettings} obj Optional instance to populate.
     * @return {module:model/EmailSettings} The populated <code>EmailSettings</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('bccEmailAddresses')) {
                obj['bccEmailAddresses'] = helpersModule.convertToType(data['bccEmailAddresses'], [bccEmailAddressModel]);
            }
            if (data.hasOwnProperty('replyEmailAddressOverride')) {
                obj['replyEmailAddressOverride'] = helpersModule.convertToType(data['replyEmailAddressOverride'], 'String');
            }
            if (data.hasOwnProperty('replyEmailNameOverride')) {
                obj['replyEmailNameOverride'] = helpersModule.convertToType(data['replyEmailNameOverride'], 'String');
            }
        }
        return obj;
    };

    /**
     * A list of email addresses that receive a copy of all email communications for an envelope. You can use this for archiving purposes.
     * @member {Array.<module:model/BccEmailAddress>} bccEmailAddresses
     */
    _exports.prototype['bccEmailAddresses'] = undefined;
    /**
     *
     * @member {String} replyEmailAddressOverride
     */
    _exports.prototype['replyEmailAddressOverride'] = undefined;
    /**
     *
     * @member {String} replyEmailNameOverride
     */
    _exports.prototype['replyEmailNameOverride'] = undefined;

    return _exports;
});


