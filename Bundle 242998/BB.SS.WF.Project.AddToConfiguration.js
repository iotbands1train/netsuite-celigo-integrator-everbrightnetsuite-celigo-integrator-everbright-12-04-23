/**
 * @NApiVersion 2.0
 * @NScriptType workflowactionscript
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

define(['N/record'], function(record) {
	function onAction(context) {
		var project = context.newRecord;
		
		var conf = record.load({type: 'customrecord_bb_solar_success_configurtn', id: 1});
		
		var currentProjects = conf.getValue('custrecord_bb_linked_projects');

		var newProjects = [];

		util.each(currentProjects, function(p) {
			newProjects.push(p);
		});
		
		conf.setValue('custrecord_bb_linked_projects', newProjects);
		conf.save();
	}

	return {
		onAction: onAction
	};
});