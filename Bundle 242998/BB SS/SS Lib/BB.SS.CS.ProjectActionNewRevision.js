/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Matt Lehman
 * @overview Call New Revision Suitelet to process Project Action New Revisions
 */
define(['N/currentRecord', 'N/url'],

    function(currentRecord, url) {

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

        }


        function callNewRevision(scriptContext) {
            var projectAction = currentRecord.get();
            var projectActionId = projectAction.id;
            console.log('attemping post request');
            var urlLink = url.resolveScript({
                deploymentId: 'customdeploy_bb_sl_proj_act_new_revision',
                scriptId: 'customscript_bb_sl_proj_act_new_revision',
                params: {
                    id: projectActionId
                },
                returnExternalUrl: false
            })
            window.open(urlLink,"_self");
            
        }

        return {
            pageInit: pageInit,
            callNewRevision: callNewRevision
        };

    });
