/**
 * Copyright 2020 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

/**
 * @NApiVersion 2.1
 * @NScriptType workflowactionscript
 * @NModuleScope public
 * @author Santiago Rios
 * @fileOverview Workflow Action used to delete duplicate Notes created from Enerflo because of the BluChat logic.
 */

define(['N/record', 'N/runtime', 'N/search'], function (record, runtime, search) {

    function onAction(scriptContext) {
        let logTitle = 'onAction';

        try {
            let noteMemo = runtime.getCurrentScript().getParameter('custscript_bb_note_memo');

            let dupeNoteId;
            let objNoteSearch = search.create({
                type: record.Type.NOTE,
                filters:
                    [
                        ['note', 'is', noteMemo],
                        'AND',
                        ['notedate', 'onorafter', 'minutesago5'],
                        'AND',
                        ['custrecord_bb_pi_enerflo_id', 'isempty', ''],
                        'AND',
                        ['notetype', 'noneof', '9'] //bluChat type
                    ],
                columns:
                    [
                        search.createColumn({name: 'internalid', label: 'Internal ID'})
                    ]
            });
            log.debug(logTitle, objNoteSearch.filters);
            objNoteSearch.run().each(function (result) {
                dupeNoteId = result.id;
                return true;
            });

            log.debug(logTitle, dupeNoteId);
            if (dupeNoteId) {
                record.delete({
                    type: record.Type.NOTE,
                    id: dupeNoteId,
                });
                log.audit(logTitle, dupeNoteId + ' Note deleted.');
            }

        }catch(e){
            log.error(logTitle, e.message);
        }
    }

    return {
        onAction: onAction
    };

});