/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope public
 * @author Tyler Mann
 * @version 0.1.1
 * @fileOverview This user event script updates the Project dates based on updates from the Project Actions
 * It also updates related project actions to approved if milestone completed
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

define(['N/task', './BB SS/SS Lib/BB.SS.ScheduledScript.BatchProcessing'],
    function(task, batchProcessing) {
        function onAction(scriptContext) {
					var _recOrgProject = scriptContext.newRecord;
					var _projectId = _recOrgProject.id;
					batchProcessing.addToQueue(
							'customscript_bb_ss_copy_proj_tpl'
							,'customdeploy_bb_ss_copy_proj_tpl'
							, {custscript_bb_project_template_id: _projectId}
							, task.TaskType.MAP_REDUCE);
        }

        return {
        	onAction: onAction
        };
    });
