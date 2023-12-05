/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope Public
 * @author Mats Blomqvist
 * @overview - Need more rights
 *
 * Copyright 2017-2021 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 *
 *
 * Description
 * -------------------------------------------------------------------------------------------------
 * Set comment history to:
 * {today} || ' - ' || {user.entityid} || ': ' || {custrecord_bb_rejection_comments} || '; ' || NVL(chr(10) || {custrecord_bb_doc_reject_comm_history}|| chr(10) || ' ','')
 * Corrected: {today} || ' - ' || {user.entityid} || ': ' || {custrecord_bb_rejection_comments} || ';' || NVL(chr(10) || {custrecord_bb_doc_reject_comm_history}, '')
 *
 * History
 * When            Who             Where           What
 * -------------------------------------------------------------------------------------------------
 * 2020-12-07      Mats Blomqvist                  Initial release.
 *
 */

define(['N/runtime', 'N/url'], function(runtime, url) {
	function onAction(scriptContext) {
		var custrecord_bb_rejection_comments = scriptContext.newRecord.getValue('custrecord_bb_rejection_comments');
        var custrecord_bb_doc_reject_comm_history;
        if (scriptContext.oldRecord){
          custrecord_bb_doc_reject_comm_history = scriptContext.oldRecord.getValue('custrecord_bb_doc_reject_comm_history');
        }

		if(custrecord_bb_rejection_comments && custrecord_bb_rejection_comments.length) {
			var now = new Date();
			var today = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
			var user = runtime.getCurrentUser();
			var userid = user.name;
			var value = today + ' - ' + userid + ': ' + custrecord_bb_rejection_comments + ';'
				+ ((custrecord_bb_doc_reject_comm_history && custrecord_bb_doc_reject_comm_history.length)? '\n' + custrecord_bb_doc_reject_comm_history : '');
			scriptContext.newRecord.setValue('custrecord_bb_doc_reject_comm_history', value);
		}
	}
	return {
		onAction: onAction,
	};
});
