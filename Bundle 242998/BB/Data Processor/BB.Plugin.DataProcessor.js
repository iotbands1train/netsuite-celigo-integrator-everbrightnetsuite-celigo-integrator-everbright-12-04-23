/**
 * Includes a plugin definition for a Data Processor.
 * 
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @NScriptType plugintypeimpl
 */
define([], function() {
    'use strict';

    return {
        /**
         * Function meant to be implemented by Plugin Implementation scripts to confirm the data matches expected format.
         *
         * @data - object representing the type associated with the Data Processor.
         */
        validate: function(data) {
            return true;
        },
        /**
         * Function meant to be implemented by Plugin Implementation scripts to provide estimated governance usage.
         *
         * @data - object representing the type associated with the Data Processor.
         */
        estimateUsage: function(data) {
            return 0;
        },
        /**
         * Function meant to be implemented by Plugin Implementation scripts to do something with the data.
         *
         * @data - object representing the type associated with the Data Processor.
         */
        process: function (data, queueRecordId) {
            try {
                return true;
            } catch (e) {
                return false;
            }
        },
        /**
         * Function meant to be implmeneted by Plugin Implementation scripts
         * if additional error handling is required.
         *
         * @data - object representing the type associated with the Data Processor.
         */
        handleError: function (data) {
            return true;
        },

        getRequestStatus: function (queueRecord, statusObj) {
            return {};
        }
    };
});