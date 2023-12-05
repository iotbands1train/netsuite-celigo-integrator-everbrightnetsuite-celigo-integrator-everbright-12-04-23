/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope public
 * @author Matt Lehman
 * @version 0.1.0
 * @overview - Project Form / Suitelet Project BOM and Adder Record Validations.
 */

define(["N/url", 'N/currentRecord','N/search'], function(url, currentRecord,search){

    /**
     * Function call the copy suitelet
     * 
     * @governance 0 Units
     * @param {Object} context - context of the request
     */
    function callCopyProjectSuitelet() {
        var project = currentRecord.get();
        var projectId = project.id;
        var suiteletUrl = url.resolveScript({
           scriptId: 'customscript_bb_sl_copyproject',
                deploymentId: 'customdeploy_bb_sl_copyproject',
            params: {
                recordId: projectId
            }
        });
        window.open(suiteletUrl);
    }

    /**
     * Function call the copy suitelet
     * 
     * @governance 0 Units
     * @param {Object} context - context of the request
     */
    function callLoadDevices() {
        var project = currentRecord.get();
        log.debug('project',project);
        var projectSearchDetails=search.lookupFields({
            type: 'job',
            id: project.id,
            columns: ['custentity_bb_ss_solaredge_site_id','custentity_bb_energy_production_source']
        });
       
        log.debug('siteId in add',projectSearchDetails);
        var projectId = project.id;
        var suiteletUrl = url.resolveScript({
           scriptId: 'customscript_bb_ss_solaredgecalls',
                deploymentId: 'customdeploy_bb_ss_solaredgecalls',
            params: {
                recordId: projectId,
                siteId:projectSearchDetails.custentity_bb_ss_solaredge_site_id,
                source:projectSearchDetails.custentity_bb_energy_production_source[0].value
            }
        });
        window.open(suiteletUrl,"_self");
    }

    function pageInit(){

    }

    return {
        callCopyProjectSuitelet: callCopyProjectSuitelet,
        callLoadDevices:callLoadDevices,
        pageInit: pageInit
    }

});