/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

const PRODUCTION_BASE_PATH = 'https://docusign.net/restapi';
const DEMO_BASE_PATH = 'https://demo.docusign.net/restapi';
const STAGE_BASE_PATH = 'https://stage.docusign.net/restapi';

var _exports = {
    BasePath: {
        PRODUCTION: PRODUCTION_BASE_PATH,
        DEMO: DEMO_BASE_PATH,
        STAGE: STAGE_BASE_PATH
    }
};

Object.freeze(_exports);

define([], function(){
    return _exports;
});