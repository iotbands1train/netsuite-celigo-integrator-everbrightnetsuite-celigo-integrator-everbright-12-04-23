/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record','N/runtime'],

    function(search, record,runtime) {

        /**
         * Definition of the Scheduled script trigger point.
         *
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
         */
        function execute(scriptContext) {
            var paramsObj = runtime.getCurrentScript();
            var copyrecType=paramsObj.getParameter({
                name: 'custscript_bb_blu_chat_copy_rec_type'
            });
            var newRecId=paramsObj.getParameter({
                name: 'custscript_bb_new_project_id'
            });
            var oldRecId=paramsObj.getParameter({
                name: 'custscript_bb_source_proj_id'
            });
            log.debug('copyrecType',copyrecType);
            log.debug('newRecId',newRecId);
            log.debug('oldRecId',oldRecId);
            var customrecord_bluchat_messagesSearchObj = search.create({
                type: "customrecord_bluchat_messages",
                filters:
                    [
                        ["custrecord_bluchat_parent_type","is",copyrecType],
                        "AND",
                        ["custrecord_bluchat_parent_id","equalto",oldRecId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "id",
                            sort: search.Sort.ASC,
                            label: "ID"
                        })
                    ]
            });
            var searchResultCount = customrecord_bluchat_messagesSearchObj.runPaged().count;
            log.debug("customrecord_bluchat_messagesSearchObj result count",searchResultCount);
            customrecord_bluchat_messagesSearchObj.run().each(function(result){
                log.debug('result.id',result);
                log.debug('result.customrecord_bluchat_messages',result.customrecord_bluchat_messages);
                log.debug('result.id',result.id);
                var copyRecs=record.copy({
                    type: result.recordType,
                    id: result.id,
                    isDynamic: true
                });
                copyRecs.setValue({
                    fieldId: 'custrecord_bluchat_parent_id',
                    value: newRecId,
                })
                copyRecs.save();
                return true;
            });
        }

        return {
            execute: execute
        };

    });
