/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Suhail Akhtar
 */
/* jshint unused:true, undef:true */
define( // jshint ignore:line
    ['N/record','N/plugin'],

    function (record,plugin) {


        function createJournalEntry(project, amount, credit, debit, subsidiary) {

            var jeRecord = record.create({
                type: 'journalentry',
                isDynamic: true
            })
            jeRecord.setValue({
                fieldId: 'subsidiary',
                value: subsidiary
            })
            jeRecord.setValue({
                fieldId: 'custbody_bb_project',
                value: project
            })
            

            var impls = plugin.findImplementations({
                type: 'customscript_bb_ss_plg_createjournals',
                includeDefault: false
            });
            var jePlugImpl = null;
            if (impls.length > 0) {
                log.debug('plugin found')
                var jePlugImpl = plugin.loadImplementation({
                    type: "customscript_bb_ss_plg_createjournals",
                    implementation: impls[0]
                });
            }

            if (jePlugImpl) {
                jeRecord = jePlugImpl.setCustomBodyFields(jeRecord)
            }


            jeRecord = setLineFields(jeRecord, project, amount, credit, true, jePlugImpl)
            jeRecord = setLineFields(jeRecord, project, amount, debit, false, jePlugImpl)

            log.debug('jeRecord',jeRecord)
            var jeID = jeRecord.save();
            return jeID;
        }

        function setLineFields(jeRecord, project, amount, account, isCredit, jePlugImpl) {
            jeRecord.selectNewLine('line');

            jeRecord.setCurrentSublistValue({
                sublistId: 'line',
                fieldId: 'account',
                value: account
            });

            if (isCredit) {
                jeRecord.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    value: amount
                });
            } else {
                jeRecord.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    value: amount
                });
            }

            jeRecord.setCurrentSublistValue({
                sublistId: 'line',
                fieldId: 'entity',
                value: project
            });
            if (jePlugImpl) {
                jeRecord = jePlugImpl.setCustomLineFields(jeRecord)
            }

            jeRecord.commitLine('line');


            return jeRecord;
        }


        return {
            createJournalEntry: createJournalEntry
        };
    })
