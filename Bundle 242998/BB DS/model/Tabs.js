/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './Approve', './Checkbox', './Company', './DateSigned', './Decline', './Email', './EmailAddress', './EnvelopeId'
    , './FirstName', './FormulaTab', './FullName', './InitialHere', './LastName', './List', './Notarize', './Note', './RadioGroup', './SignHere'
    , './SignerAttachment', './Ssn', './TabGroup', './Text', './Title', './View', './Zip'],
    function (helpersModule, approveModel, checkboxModel, companyModel, dateSignedModel, declineModel, emailModel, emailAddressModel, envelopeIdModel,
              firstNameModel, formulaTabModel, fullNameModel, initialHereModel, lastNameModel, listModel, notarizeModel, noteModel, radioGroupModel, signHereModel,
              signerAttachmentModel, ssnModel, tabGroupModel, textModel, titleModel, viewModel, zipModel) {
    /**
     * The Tabs model module.
     * @module model/Tabs
     * @version 0.0.1
     */

    /**
     * Constructs a new <code>Tabs</code>.
     * @alias module:model/Tabs
     * @class
     */
    var _exports = function () {
        var _this = this;
    };

    /**
     * Constructs a <code>Tabs</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/Tabs} obj Optional instance to populate.
     * @return {module:model/Tabs} The populated <code>Tabs</code> instance.
     */
    _exports.constructFromObject = function (data, obj) {
        if (data) {
            obj = obj || new _exports();

            if (data.hasOwnProperty('approveTabs')) {
                obj['approveTabs'] = helpersModule.convertToType(data['approveTabs'], [approveModel]);
            }
            if (data.hasOwnProperty('checkboxTabs')) {
                obj['checkboxTabs'] = helpersModule.convertToType(data['checkboxTabs'], [checkboxModel]);
            }
            if (data.hasOwnProperty('companyTabs')) {
                obj['companyTabs'] = helpersModule.convertToType(data['companyTabs'], [companyModel]);
            }
            if (data.hasOwnProperty('dateSignedTabs')) {
                obj['dateSignedTabs'] = helpersModule.convertToType(data['dateSignedTabs'], [dateSignedModel]);
            }
            if (data.hasOwnProperty('dateTabs')) {
                obj['dateTabs'] = helpersModule.convertToType(data['dateTabs'], ['Date']);
            }
            if (data.hasOwnProperty('declineTabs')) {
                obj['declineTabs'] = helpersModule.convertToType(data['declineTabs'], [declineModel]);
            }
            if (data.hasOwnProperty('emailAddressTabs')) {
                obj['emailAddressTabs'] = helpersModule.convertToType(data['emailAddressTabs'], [emailAddressModel]);
            }
            if (data.hasOwnProperty('emailTabs')) {
                obj['emailTabs'] = helpersModule.convertToType(data['emailTabs'], [emailModel]);
            }
            if (data.hasOwnProperty('envelopeIdTabs')) {
                obj['envelopeIdTabs'] = helpersModule.convertToType(data['envelopeIdTabs'], [envelopeIdModel]);
            }
            if (data.hasOwnProperty('firstNameTabs')) {
                obj['firstNameTabs'] = helpersModule.convertToType(data['firstNameTabs'], [firstNameModel]);
            }
            if (data.hasOwnProperty('formulaTabs')) {
                obj['formulaTabs'] = helpersModule.convertToType(data['formulaTabs'], [formulaTabModel]);
            }
            if (data.hasOwnProperty('fullNameTabs')) {
                obj['fullNameTabs'] = helpersModule.convertToType(data['fullNameTabs'], [fullNameModel]);
            }
            if (data.hasOwnProperty('initialHereTabs')) {
                obj['initialHereTabs'] = helpersModule.convertToType(data['initialHereTabs'], [initialHereModel]);
            }
            if (data.hasOwnProperty('lastNameTabs')) {
                obj['lastNameTabs'] = helpersModule.convertToType(data['lastNameTabs'], [lastNameModel]);
            }
            if (data.hasOwnProperty('listTabs')) {
                obj['listTabs'] = helpersModule.convertToType(data['listTabs'], [listModel]);
            }
            if (data.hasOwnProperty('notarizeTabs')) {
                obj['notarizeTabs'] = helpersModule.convertToType(data['notarizeTabs'], [notarizeModel]);
            }
            if (data.hasOwnProperty('noteTabs')) {
                obj['noteTabs'] = helpersModule.convertToType(data['noteTabs'], [noteModel]);
            }
            if (data.hasOwnProperty('numberTabs')) {
                obj['numberTabs'] = helpersModule.convertToType(data['numberTabs'], ['Number']);
            }
            if (data.hasOwnProperty('radioGroupTabs')) {
                obj['radioGroupTabs'] = helpersModule.convertToType(data['radioGroupTabs'], [radioGroupModel]);
            }
            if (data.hasOwnProperty('signerAttachmentTabs')) {
                obj['signerAttachmentTabs'] = helpersModule.convertToType(data['signerAttachmentTabs'], [signerAttachmentModel]);
            }
            if (data.hasOwnProperty('signHereTabs')) {
                obj['signHereTabs'] = helpersModule.convertToType(data['signHereTabs'], [signHereModel]);
            }
            if (data.hasOwnProperty('ssnTabs')) {
                obj['ssnTabs'] = helpersModule.convertToType(data['ssnTabs'], [ssnModel]);
            }
            if (data.hasOwnProperty('tabGroups')) {
                obj['tabGroups'] = helpersModule.convertToType(data['tabGroups'], [tabGroupModel]);
            }
            if (data.hasOwnProperty('textTabs')) {
                obj['textTabs'] = helpersModule.convertToType(data['textTabs'], [textModel]);
            }
            if (data.hasOwnProperty('titleTabs')) {
                obj['titleTabs'] = helpersModule.convertToType(data['titleTabs'], [titleModel]);
            }
            if (data.hasOwnProperty('viewTabs')) {
                obj['viewTabs'] = helpersModule.convertToType(data['viewTabs'], [viewModel]);
            }
            if (data.hasOwnProperty('zipTabs')) {
                obj['zipTabs'] = helpersModule.convertToType(data['zipTabs'], [zipModel]);
            }
        }
        return obj;
    };

    /**
     * Specifies a tag on the document where you want the recipient to approve documents in an envelope without placing a signature or initials on the document. If the recipient clicks the Approve tag during the signing process, the recipient is considered to have signed the document. No information is shown on the document for the approval, but it is recorded as a signature in the envelope history.
     * @member {Array.<module:model/Approve>} approveTabs
     */
    _exports.prototype['approveTabs'] = undefined;
    /**
     * Specifies a tag on the document in a location where the recipient can select an option.
     * @member {Array.<module:model/Checkbox>} checkboxTabs
     */
    _exports.prototype['checkboxTabs'] = undefined;
    /**
     * Specifies a tag on the document where you want the recipient's company name to appear.  When getting information that includes this tab type, the original value of the tab when the associated envelope was sent is included in the response.
     * @member {Array.<module:model/Company>} companyTabs
     */
    _exports.prototype['companyTabs'] = undefined;
    /**
     * Specifies a tab on the document where the date the document was signed will automatically appear.
     * @member {Array.<module:model/DateSigned>} dateSignedTabs
     */
    _exports.prototype['dateSignedTabs'] = undefined;
    /**
     * Specifies a tab on the document where you want the recipient to enter a date. Date tabs are single-line fields that allow date information to be entered in any format. The tooltip for this tab recommends entering the date as MM/DD/YYYY, but this is not enforced. The format entered by the signer is retained.   If you need a particular date format enforced, DocuSign recommends using a Text tab with a Validation Pattern and Validation Message to enforce the format.
     * @member {Array.<Date>} dateTabs
     */
    _exports.prototype['dateTabs'] = undefined;
    /**
     * Specifies a tag on the document where you want to give the recipient the option of declining an envelope. If the recipient clicks the Decline tag during the signing process, the envelope is voided.
     * @member {Array.<module:model/Decline>} declineTabs
     */
    _exports.prototype['declineTabs'] = undefined;
    /**
     * Specifies a location on the document where you want where you want the recipient's email, as entered in the recipient information, to display.
     * @member {Array.<module:model/EmailAddress>} emailAddressTabs
     */
    _exports.prototype['emailAddressTabs'] = undefined;
    /**
     * Specifies a tag on the document where you want the recipient to enter an email. Email tags are single-line fields that accept any characters. The system checks that a valid email format (i.e. xxx@yyy.zzz) is entered in the tag. It uses the same parameters as a Text tab, with the validation message and pattern set for email information.  When getting information that includes this tab type, the original value of the tab when the associated envelope was sent is included in the response.
     * @member {Array.<module:model/Email>} emailTabs
     */
    _exports.prototype['emailTabs'] = undefined;
    /**
     * Specifies a tag on the document where you want the envelope ID for to appear. Recipients cannot enter or change the information in this tab, it is for informational purposes only.
     * @member {Array.<module:model/EnvelopeId>} envelopeIdTabs
     */
    _exports.prototype['envelopeIdTabs'] = undefined;
    /**
     * Specifies tag on a document where you want the recipient's first name to appear. This tag takes the recipient's name, as entered in the recipient information, splits it into sections based on spaces and uses the first section as the first name.
     * @member {Array.<module:model/FirstName>} firstNameTabs
     */
    _exports.prototype['firstNameTabs'] = undefined;
    /**
     * Specifies a tag that is used to add a calculated field to a document. Envelope recipients cannot directly enter information into the tag; the formula tab calculates and displays a new value when changes are made to the reference tag values. The reference tag information and calculation operations are entered in the \"formula\" element. See the [ML:Using the Calculated Fields Feature] quick start guide or [ML:DocuSign Service User Guide] for more information about formulas.
     * @member {Array.<module:model/FormulaTab>} formulaTabs
     */
    _exports.prototype['formulaTabs'] = undefined;
    /**
     * Specifies a tag on the document where you want the recipient's name to appear.
     * @member {Array.<module:model/FullName>} fullNameTabs
     */
    _exports.prototype['fullNameTabs'] = undefined;
    /**
     * Specifies a tag location in the document at which a recipient will place their initials. The `optional` parameter specifies whether the initials are required or optional.
     * @member {Array.<module:model/InitialHere>} initialHereTabs
     */
    _exports.prototype['initialHereTabs'] = undefined;
    /**
     * Specifies a tag on a document where you want the recipient's last name to appear. This tag takes the recipient's name, as entered in the recipient information, splits it into sections based on spaces and uses the last section as the last name.
     * @member {Array.<module:model/LastName>} lastNameTabs
     */
    _exports.prototype['lastNameTabs'] = undefined;
    /**
     * Specify this tag to give your recipient a list of options, presented as a drop-down list, from which they can select.
     * @member {Array.<module:model/List>} listTabs
     */
    _exports.prototype['listTabs'] = undefined;
    /**
     *
     * @member {Array.<module:model/Notarize>} notarizeTabs
     */
    _exports.prototype['notarizeTabs'] = undefined;
    /**
     * Specifies a location on the document where you want to place additional information, in the form of a note, for a recipient.
     * @member {Array.<module:model/Note>} noteTabs
     */
    _exports.prototype['noteTabs'] = undefined;
    /**
     * Specifies a tag on the document where you want the recipient to enter a number. It uses the same parameters as a Text tab, with the validation message and pattern set for number information.  When getting information that includes this tab type, the original value of the tab when the associated envelope was sent is included in the response.
     * @member {Array.<Number>} numberTabs
     */
    _exports.prototype['numberTabs'] = undefined;
    /**
     * Specifies a tag on the document in a location where the recipient can select one option from a group of options using a radio button. The radio buttons do not have to be on the same page in a document.
     * @member {Array.<module:model/RadioGroup>} radioGroupTabs
     */
    _exports.prototype['radioGroupTabs'] = undefined;
    /**
     * Specifies a tag on the document when you want the recipient to add supporting documents to an envelope.
     * @member {Array.<module:model/SignerAttachment>} signerAttachmentTabs
     */
    _exports.prototype['signerAttachmentTabs'] = undefined;
    /**
     * A complex type the contains information about the tag that specifies where the recipient places their signature in the document. The \"optional\" parameter sets if the signature is required or optional.
     * @member {Array.<module:model/SignHere>} signHereTabs
     */
    _exports.prototype['signHereTabs'] = undefined;
    /**
     * Specifies a tag on the document where you want the recipient to enter a Social Security Number (SSN). A SSN can be typed with or without dashes. It uses the same parameters as a Text tab, with the validation message and pattern set for SSN information.  When getting information that includes this tab type, the original value of the tab when the associated envelope was sent is included in the response.
     * @member {Array.<module:model/Ssn>} ssnTabs
     */
    _exports.prototype['ssnTabs'] = undefined;
    /**
     *
     * @member {Array.<module:model/TabGroup>} tabGroups
     */
    _exports.prototype['tabGroups'] = undefined;
    /**
     * Specifies a that that is an adaptable field that allows the recipient to enter different text information.  When getting information that includes this tab type, the original value of the tab when the associated envelope was sent is included in the response.
     * @member {Array.<module:model/Text>} textTabs
     */
    _exports.prototype['textTabs'] = undefined;
    /**
     * Specifies a tag on the document where you want the recipient's title to appear.  When getting information that includes this tab type, the original value of the tab when the associated envelope was sent is included in the response.
     * @member {Array.<module:model/Title>} titleTabs
     */
    _exports.prototype['titleTabs'] = undefined;
    /**
     *
     * @member {Array.<module:model/View>} viewTabs
     */
    _exports.prototype['viewTabs'] = undefined;
    /**
     * Specifies a tag on the document where you want the recipient to enter a ZIP code. The ZIP code can be a five numbers or the ZIP+4 format with nine numbers. The zip code can be typed with or without dashes. It uses the same parameters as a Text tab, with the validation message and pattern set for ZIP code information.  When getting information that includes this tab type, the original value of the tab when the associated envelope was sent is included in the response.
     * @member {Array.<module:model/Zip>} zipTabs
     */
    _exports.prototype['zipTabs'] = undefined;

    return _exports;
});

