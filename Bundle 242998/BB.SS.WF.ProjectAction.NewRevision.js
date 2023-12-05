/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope public
 * @author Michael Golichenko
 * @version 0.0.1
 */

/**
 * Copyright 2017-2018 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/record', 'N/redirect', 'N/search'], function(record, redirect, search) {
	/**
	 * Function definition to be triggered before record is loaded.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @param {Record} scriptContext.form - Form (serverWidget.form)
	 * @param {string} scriptContext.type - Trigger type
	 * @param {integer} scriptContext.workflowId - Internal ID of the workflow that calls the script
	 * @Since 2015.2
	 */
	function onAction(scriptContext) {
		var _record = scriptContext.newRecord;
		var _toCopyFieldsValues = ['name', 
			'custrecord_bb_package', 
			'custrecord_bb_project_package_action', 
			'custrecord_bb_package_step_number', 
			'custrecord_bb_project', 
			'custrecord_bb_proj_doc_required_optional', 
			'custrecord_bb_project_doc_action_type',
			'custrecord_bb_projact_preced_pack_action'
		//, 'custrecord_bb_revision_number'
		//, 'custrecord_bb_ss_proj_action_s3_folder'
		//, 'custrecord_bb_document_status'
		];

		var _newRecord = record.create({
			type : 'customrecord_bb_project_action'
		});
		
		_toCopyFieldsValues.forEach(function(field) {
			_newRecord.setValue({
				fieldId : field,
				value : _record.getValue({
					fieldId : field
				})
			});
		});
		
		// get Package ID
		// create a search to find out the minimum sequence action status id
		// set value for 'custrecord_bb_document_status'
		var packageId = _record.getValue({
			fieldId : 'custrecord_bb_package'
		});
		var statusId = searchForMinActionStatusSequence(packageId);
		_newRecord.setValue({
			fieldId : 'custrecord_bb_document_status',
			value : statusId
		});

		var _revisionNumber = parseInt(_record.getValue({
			fieldId : 'custrecord_bb_revision_number'
		}));
		_revisionNumber = isNaN(_revisionNumber) ? 1 : _revisionNumber + 1;
		_newRecord.setValue({
			fieldId : 'custrecord_bb_revision_number',
			value : _revisionNumber
		});
		var _newRecordId = _newRecord.save({
			ignoreMandatoryFields : true
		});

		_record.setValue({
			fieldId : 'custrecord_bb_new_rev_action',
			value : _newRecordId
		});

		// redirect to created record in edit
		/*redirect.toRecord({
		  type : 'customrecord_bb_project_action',
		  id : _recordId,
		  isEditMode: true
		});*/

		log.debug('test log at end of script', 'log');
	}

	function searchForMinActionStatusSequence(pacakgeId) {
		var statusId = '';
		var actionStatusSearch = search.create({
			type : 'customrecord_bb_document_status',
			filters : [['custrecord_bb_doc_status_package', 'anyof', pacakgeId], "AND", ["isinactive", "is", "F"]],
			columns : [search.createColumn({
				name : 'internalid'
			}), search.createColumn({
				name : 'custrecord_bb_doc_status_seq',
				sort : search.Sort.ASC
			})]
		}); // in this case it is mandatory to populate the sequence numbers for each action status
		var searchResult = actionStatusSearch.run().getRange({
            start: 0,
            end: 1
        });
		if(searchResult.length!= 0){
			var sequence = searchResult[0].getValue({
				name : 'custrecord_bb_doc_status_seq',
				sort : search.Sort.ASC
			});
			if (sequence != '' && sequence != null){
				statusId = searchResult[0].getValue({
					name : 'internalid'
				});
			}
		}
		return statusId;
	}

	return {
		onAction : onAction
	};
});