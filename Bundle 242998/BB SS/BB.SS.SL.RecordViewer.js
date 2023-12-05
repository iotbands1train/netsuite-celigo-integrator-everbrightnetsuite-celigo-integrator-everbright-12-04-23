/**
 * @NApiVersion 2.0
 * @NScriptType suitelet
 * @NModuleScope Public
 * @author Graham O'Daniel
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
define(['N/redirect'], function(redirect) {
	function onRequest(context) {
		redirect.toRecord({
			id: context.request.parameters.recordId,
			type: context.request.parameters.recordType,
			isEditMode: context.request.parameters.edit ? true : false
		});
	}

	return {
		onRequest: onRequest
	};
});

