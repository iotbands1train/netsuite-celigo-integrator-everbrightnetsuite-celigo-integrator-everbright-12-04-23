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
 * @NScriptType MapReduceScript
 * @NModuleScope public
 * @author Santiago Rios
 * @fileOverview MapReduce script to create Array custom records for Project from Enerflo integration.
 */

define(['N/record', 'N/runtime'], function(record, runtime) {

    function getInputData(inputContext) {
        let logTitle = 'getInputData';
        try {

            log.debug(logTitle, 'Start Process');

            var objArrays = JSON.parse(runtime.getCurrentScript().getParameter('custscript_obj_arrays'));

            log.debug(logTitle, objArrays);

            return objArrays;
        } catch (error) {
            log.error(logTitle, 'error: ' + error.message);
        }
    }

    function reduce(reduceContext) {
        let logTitle = 'reduce';
        try{
            var projectId = runtime.getCurrentScript().getParameter('custscript_array_project_id');
            log.debug(logTitle, reduceContext);
            var objArray = JSON.parse(reduceContext.values[0]);
            log.debug(logTitle, objArray);

            if (projectId && objArray) {
                let projectArray = record.create({ type: "customrecord_ts_arrays", isDynamic: true });
                projectArray.setValue({ fieldId: "custrecord_ts_arrays_proj", value: projectId });
                projectArray.setValue({ fieldId: "custrecord_ts_name", value: objArray.name });
                projectArray.setValue({ fieldId: "custrecord_ts_array_mod_tilt", value: objArray.tilt });
                projectArray.setValue({ fieldId: "custrecord_ts_array_mod_azi", value: objArray.azimuth });
                projectArray.setValue({ fieldId: "custrecord_ts_array_mod_qty", value: objArray.panelCount });

                let newArrayId = projectArray.save();
                log.debug(logTitle, 'New Array created with id: ' + newArrayId);
            } else {
                log.audit(logTitle, 'Array could not be created because of missing data.');
            }

        }catch (error) {
            log.error(logTitle, 'error: ' + error.message);
        }
    }

    function summarize(summarizeContext) {
        let logTitle = 'summarize';
        log.debug(logTitle, 'End Process');
    }

    return {
        getInputData: getInputData,
        reduce: reduce,
        summarize: summarize
    }
});