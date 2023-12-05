/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['./../Helpers', './Agent', './CarbonCopy', './CertifiedDelivery', './Editor', './ErrorDetails', './InPersonSigner', './Intermediary', './SealSign', './Signer'],
    function (helpersModule, agentModel, carbonCopyModel, certifiedDeliveryModel, editorModel, errorDetailsModel, inPersonSignerModel, intermediaryModel, sealSignModel, signerModel) {
        /**
         * The Recipients model module.
         * @module model/Recipients
         * @version 0.0.1
         */

        /**
         * Constructs a new <code>Recipients</code>.
         * Specifies the envelope recipients.
         * @alias module:model/Recipients
         * @class
         */
        var _exports = function () {
            var _this = this;
        };

        /**
         * Constructs a <code>Recipients</code> from a plain JavaScript object, optionally creating a new instance.
         * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @param {module:model/Recipients} obj Optional instance to populate.
         * @return {module:model/Recipients} The populated <code>Recipients</code> instance.
         */
        _exports.constructFromObject = function (data, obj) {
            if (data) {
                obj = obj || new _exports();

                if (data.hasOwnProperty('agents')) {
                    obj['agents'] = helpersModule.convertToType(data['agents'], [agentModel]);
                }
                if (data.hasOwnProperty('carbonCopies')) {
                    obj['carbonCopies'] = helpersModule.convertToType(data['carbonCopies'], [carbonCopyModel]);
                }
                if (data.hasOwnProperty('certifiedDeliveries')) {
                    obj['certifiedDeliveries'] = helpersModule.convertToType(data['certifiedDeliveries'], [certifiedDeliveryModel]);
                }
                if (data.hasOwnProperty('currentRoutingOrder')) {
                    obj['currentRoutingOrder'] = helpersModule.convertToType(data['currentRoutingOrder'], 'String');
                }
                if (data.hasOwnProperty('editors')) {
                    obj['editors'] = helpersModule.convertToType(data['editors'], [editorModel]);
                }
                if (data.hasOwnProperty('errorDetails')) {
                    obj['errorDetails'] = errorDetailsModel.constructFromObject(data['errorDetails']);
                }
                if (data.hasOwnProperty('inPersonSigners')) {
                    obj['inPersonSigners'] = helpersModule.convertToType(data['inPersonSigners'], [inPersonSignerModel]);
                }
                if (data.hasOwnProperty('intermediaries')) {
                    obj['intermediaries'] = helpersModule.convertToType(data['intermediaries'], [intermediaryModel]);
                }
                if (data.hasOwnProperty('recipientCount')) {
                    obj['recipientCount'] = helpersModule.convertToType(data['recipientCount'], 'String');
                }
                if (data.hasOwnProperty('seals')) {
                    obj['seals'] = helpersModule.convertToType(data['seals'], [sealSignModel]);
                }
                if (data.hasOwnProperty('signers')) {
                    obj['signers'] = helpersModule.convertToType(data['signers'], [signerModel]);
                }
            }
            return obj;
        };

        /**
         * A complex type defining the management and access rights of a recipient assigned assigned as an agent on the document.
         * @member {Array.<module:model/Agent>} agents
         */
        _exports.prototype['agents'] = undefined;
        /**
         * A complex type containing information about recipients who should receive a copy of the envelope, but does not need to sign it.
         * @member {Array.<module:model/CarbonCopy>} carbonCopies
         */
        _exports.prototype['carbonCopies'] = undefined;
        /**
         * A complex type containing information on a recipient the must receive the completed documents for the envelope to be completed, but the recipient does not need to sign, initial, date, or add information to any of the documents.
         * @member {Array.<module:model/CertifiedDelivery>} certifiedDeliveries
         */
        _exports.prototype['certifiedDeliveries'] = undefined;
        /**
         *
         * @member {String} currentRoutingOrder
         */
        _exports.prototype['currentRoutingOrder'] = undefined;
        /**
         * A complex type defining the management and access rights of a recipient assigned assigned as an editor on the document.
         * @member {Array.<module:model/Editor>} editors
         */
        _exports.prototype['editors'] = undefined;
        /**
         * @member {module:model/ErrorDetails} errorDetails
         */
        _exports.prototype['errorDetails'] = undefined;
        /**
         * Specifies a signer that is in the same physical location as a DocuSign user who will act as a Signing Host for the transaction. The recipient added is the Signing Host and new separate Signer Name field appears after Sign in person is selected.
         * @member {Array.<module:model/InPersonSigner>} inPersonSigners
         */
        _exports.prototype['inPersonSigners'] = undefined;
        /**
         * Identifies a recipient that can, but is not required to, add name and email information for recipients at the same or subsequent level in the routing order (until subsequent Agents, Editors or Intermediaries recipient types are added).
         * @member {Array.<module:model/Intermediary>} intermediaries
         */
        _exports.prototype['intermediaries'] = undefined;
        /**
         *
         * @member {String} recipientCount
         */
        _exports.prototype['recipientCount'] = undefined;
        /**
         *
         * @member {Array.<module:model/SealSign>} seals
         */
        _exports.prototype['seals'] = undefined;
        /**
         * A complex type containing information about the Signer recipient.
         * @member {Array.<module:model/Signer>} signers
         */
        _exports.prototype['signers'] = undefined;

        return _exports;
    });


