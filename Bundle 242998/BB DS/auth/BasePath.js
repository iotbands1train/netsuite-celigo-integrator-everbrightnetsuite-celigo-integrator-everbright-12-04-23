/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define([], function(){
    const PRODUCTION = "account.docusign.com";
    const DEMO = "account-d.docusign.com";
    const STAGE = "account-s.docusign.com";

    var _exports = {
        PRODUCTION: PRODUCTION,
        DEMO: DEMO,
        STAGE: STAGE
    };

    Object.freeze(_exports);

    return _exports;
});