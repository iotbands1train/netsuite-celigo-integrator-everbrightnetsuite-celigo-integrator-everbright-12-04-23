/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

const SIGNATURE = 'signature';
const EXTENDED = 'extended';
const IMPERSONATION = 'impersonation';

var _exports = {
    SIGNATURE: SIGNATURE,
    EXTENDED: EXTENDED,
    IMPERSONATION: IMPERSONATION
};

Object.freeze(_exports);

define([], function(){
    return _exports;
});