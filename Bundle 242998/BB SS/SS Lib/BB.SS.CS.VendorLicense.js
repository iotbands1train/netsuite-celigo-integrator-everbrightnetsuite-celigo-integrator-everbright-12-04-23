/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope public
 */
define(['N/record', 'N/https', 'N/url', './BB.SS.MD.FileDelete'], function(record, https, url, fileDelete) {

    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        var _record = scriptContext.currentRecord;
        var _path =  _record.getValue({
            fieldId: 'custrecord_bb_ss_vend_license_s3_path'
        });
        var _suiteletUrl = url.resolveScript({
            scriptId: 'customscript_bb_s3_sl_delete_amz_objects',
            deploymentId: 'customdeploy_bb_s3_sl_delete_amz_objects',
            returnExternalUrl: false,
        });
        var _fileDeleteJs = fileDelete.createFileDelete();
        _fileDeleteJs
            .setPath(_path)
            .setSuiteletUrl(_suiteletUrl)
            .renderJavascript();
    }

    return {
        pageInit: pageInit
    };

});