/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 * zbilliet 10/8/19
 */
define(['N/record', 'N/search', 'N/runtime', 'N/file'],
    /**
     * @param {record} record
     * @param {search} search
     */
    function (record, search, runtime, file) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {
                log.debug('on action', JSON.stringify(scriptContext));
                var scriptObj = runtime.getCurrentScript();

                var updateaction = runtime.getCurrentScript().getParameter({ name: 'custscript_wfa_url_package_action' });
                var updatestatus = runtime.getCurrentScript().getParameter({ name: 'custscript_wfa_url_field_value' });
                log.debug('params', updateaction + ' status ' + updatestatus);
                var type = scriptContext.newRecord.type;
                log.debug('type', type);
                if (type == 'job') {
                    var prjid = scriptContext.newRecord.id;
                } else if (type == 'customrecord_bb_project_action') {
                    var prjid = scriptContext.newRecord.getValue('custrecord_bb_project');
                } else {
                    return;
                };
                log.debug('prjid', prjid);
                var actionsearch = search.load({
                    id: 'customsearch_bb_wfa_updatereqlist'
                });
                var expr = actionsearch.filterExpression.slice();
                //  edit copy
                expr.push('AND', ["custrecord_bb_project_package_action", "anyof", updateaction]);
                expr.push('AND', ["custrecord_bb_project", "anyof", prjid]);
                expr.push('AND', ["custrecord_bb_proj_doc_required_optional", "noneof", updatestatus]);
                actionsearch.filterExpression = expr;
                var searchResultCount = actionsearch.runPaged().count;
                log.audit("parentdata result count", searchResultCount);
                actionsearch.run().each(function (result) {
                    log.debug('result', result);
                    var actionid = result.getValue({
                        name: "internalid",
                        summary: "MAX"
                    });
                    log.debug('action id', actionid);
                    var test = record.submitFields({
                        type: "customrecord_bb_project_action",
                        id: actionid,
                        values: {
                            'custrecord_bb_proj_doc_required_optional': updatestatus
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    log.debug('test', test);

                });
            } catch (e) {
                log.debug('error', e);
            }
        }

        return {
            onAction: onAction
        };

    });
