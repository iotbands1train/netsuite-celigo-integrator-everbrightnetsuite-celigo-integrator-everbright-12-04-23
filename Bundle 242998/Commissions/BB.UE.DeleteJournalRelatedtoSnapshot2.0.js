/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', './BB.MD.Commission2.0.Lib.js'],
    /**
 * @param{record} record
 */
    (record, search, util) => {
        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            try {
                if (scriptContext.type === 'delete') {
                    const objRecord = scriptContext.oldRecord;
                    const commissionSnapshotID = objRecord.getValue('custbody_bb_tran_comm_snap');
                    log.debug('commissionSnapshotID', commissionSnapshotID);

                    //If the transaction does not have a Commission Snapshot 2.0 linked, exit script
                    if (util.isEmpty(commissionSnapshotID)) {
                        log.audit('OK','Transaction with id '+objRecord.id +' did not have a snapshot linked. Exit script.');
                        return;
                    }

                    //Get the project/record id linked on the Commission Snapshot 2.0
                    const projectID = getProjectFromSnapshot(commissionSnapshotID);

                    if (util.isEmpty(projectID)) {
                        log.audit('Warning','Commission Snapshot 2.0 with id '+commissionSnapshotID +' does not have a project/record linked. Exit script.');
                        return;
                    }

                    //Get the sum of amounts from all Commission Snapshot Processor records for this project/record. This amount will be the updated Paid Amount
                    const updatedProjectCommissionPaidAmount = getTotalCommissionPaidAmt(projectID, commissionSnapshotID);
                    log.debug('New Project Commission Paid Amount', updatedProjectCommissionPaidAmount);

                    //Update the project/record Commission Paid Amount with the updated value.
                    record.submitFields({
                        type: 'job',
                        id: projectID,
                        values: {
                            'custentity_bb_paid_comm_amount': updatedProjectCommissionPaidAmount,
                            'custentity_bb_current_sequence': getCurrentSequence(projectID)
                        },
                        options: {
                            ignoreMandatoryFields: true
                        }
                    });

                    /*
                    * TO-DO: what should happen with the snapshot processor linked to the JE/Bill once the transaction is deleted?
                    */
                    log.audit('OK','Project Paid Amount correctly updated. Exit script');

                }
            }catch (e) {
                log.error("ERROR", e);
            }
        }

        const getProjectFromSnapshot = (commissionSnapshotID) => {
            var projectID = null;
            var arrLookupFieldsValues = search.lookupFields({
                type: 'customrecord_bbss_comm_snapshot_v2',
                id: commissionSnapshotID,
                columns: ['custrecord_bbss_comm_snapshot_proj']
            })['custrecord_bbss_comm_snapshot_proj'];
            if(!util.isEmpty(arrLookupFieldsValues)){
                projectID = arrLookupFieldsValues[0].value;
            }
            log.debug('projectID', projectID);

            return projectID;
        }

        function getTotalCommissionPaidAmt(projectID, snapshotID) {
            var projectCurrentPaidAmount = 0;

            if (!util.isEmpty(projectID)) {
                var customrecord_bb_comm_snapshot_SearchObj = search.create({
                    type: "customrecord_bbss_comm_snapshot_v2",
                    filters:
                        [
                            ["custrecord_bbss_comm_snapshot_payment","noneof","@NONE@"],
                            "AND",
                            ["isinactive","is","F"],
                            "AND",
                            ["custrecord_bbss_comm_snapshot_proj","anyof",projectID],
                            "AND",
                            ["internalid","noneof",snapshotID]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "custrecord_bbss_comm_snapshot_paid_amt",
                                summary: "SUM",
                                label: "Amount"
                            })
                        ]
                });
                var searchResultCount = customrecord_bb_comm_snapshot_SearchObj.runPaged().count;
                log.debug("customrecord_bb_comm_snapshot_processorSearchObj result count",searchResultCount);
                customrecord_bb_comm_snapshot_SearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    log.debug('getTotalCommissionPaidAmt', result);
                    projectCurrentPaidAmount = result.getValue({
                        name: 'custrecord_bbss_comm_snapshot_paid_amt',
                        summary: 'SUM'
                    });
                    return false;
                });
            }

            return projectCurrentPaidAmount;
        }

        const getCurrentSequence = (projectId) => {
            let seq;
            let columns = [
                search.createColumn({
                    name: "custrecord_bb_comm_payment_seq_num",
                    summary: "GROUP",
                    label: "Sequence Number"
                }),
                search.createColumn({
                    name: "formulanumeric",
                    summary: "SUM",
                    formula: "1",
                    label: "Formula (Numeric)"
                }),
                search.createColumn({
                    name: "formulanumeric",
                    summary: "SUM",
                    formula: "CASE WHEN {custrecord_bb_comm_payment_snapshot.custrecord_bbss_comm_snapshot_payment.id} IS NULL THEN 0 ELSE 1 END",
                    label: "Formula (Numeric)"
                })
            ];
            let objSearch = search.create({
                type: 'customrecord_bb_comm_payment_rule',
                filters: [
                    ['isinactive', 'is', 'F'],
                    'and',
                    ['custrecord_bb_comm_payment_project', 'is', projectId]
                ],
                columns: columns
            });

            objSearch.run().each((res) => {
                let sequence = res.getValue(columns[0]);
                let total = res.getValue(columns[1]);
                let paid = res.getValue(columns[2]);

                if (total === paid) {
                    seq = sequence;
                    return false;
                }
                return true;
            });

            return seq;
        }

        return {afterSubmit}

    });
