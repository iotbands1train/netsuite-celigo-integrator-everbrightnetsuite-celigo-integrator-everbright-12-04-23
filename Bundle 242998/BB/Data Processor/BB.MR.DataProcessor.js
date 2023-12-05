/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/runtime', 'N/task', 'N/plugin', 'N/record'], function (search, runtime, task, plugin, record) {
    'use strict';

    var DATA_QUEUE_SEARCH_ID = 'customsearch_bb_data_queue_pending',
        DATA_QUEUE_RECORD_TYPE_ID = 'customrecord_bb_data_queue',
        DATA_QUEUE_RECORD_STATUS_FIELD_ID = 'custrecord_bb_data_proc_status',
        DATA_QUEUE_RECORD_LINKED_PLUGIN_TYPE_FIELD_ID = 'custrecord_bb_data_proc_rec_type.custrecord_bb_data_processor_impl_id',
        DATA_QUEUE_RECORD_JSON_DATA_FIELD_ID = 'custrecord_bb_data_proc_json_text',
        DATA_QUEUE_RECORD_ERROR_MESSAGE_FIELD_ID = 'custrecord_bb_data_proc_error_message',
        DATA_PROCESSOR_PLUGIN_SCRIPT_ID = 'customscript_bb_plugin_dataprocessor',
        MAP_REDUCE_SCRIPT_ID = 'customscript_bb_mr_data_processor',
        DEFAULT_MAP_REDUCE_DEPLOYMENT_ID = 'customdeploy_bb_mr_data_processor';

    var DATA_QUEUE_STATUSES = {
        PENDING: 1,
        PROCESSING: 2,
        COMPLETED: 3,
        FAILED: 4
    };

    function updateDataQueueStatus (params) {
        var id = params.id;
        var status = params.status;
        var values = params.values || {};
        values[DATA_QUEUE_RECORD_STATUS_FIELD_ID] = status;
        return record.submitFields({
            type: DATA_QUEUE_RECORD_TYPE_ID,
            id: id,
            values: values,
            options: {
                enableSourcing: false,
                ignoreMandatoryFields: true
            }
        });
    }

    return {
        /**
         * Provides data in the form of a saved search.
         */
        getInputData: function () {
            // Return saved search
            return search.load({
                id: DATA_QUEUE_SEARCH_ID
            });
        },
        /**
         * Groups results by ID for later processing by reduce function.
         * Provides 1,000 units for governance.
         */
        map: function (context) {
            // Get search results
            var result = JSON.parse(context.value);
            // Gather calls by Processor ID
            context.write(result.values.custrecord_bb_data_proc_id, result.values.internalid.value);
        },
        /**
         * Marks superceded queue entries before processing data by loading Data Processor plugin.
         * Provides 10,000 units for governance.
         */
        reduce: function (context) {
            // Deal with duplicate queued data.
            log.debug('context.values', context.values);
            for (var i = 0; i < context.values.length-1; i++) {
                log.debug('marking superceded', context.values[i]);
                updateDataQueueStatus({
                    id: context.values[i],
                    status: DATA_QUEUE_STATUSES.COMPLETED
                });
            }
            // Retreive plugin ID and call process
            var dataQueueRecordId = context.values[context.values.length-1];

            try {
                var lookupResults = search.lookupFields({
                    type: DATA_QUEUE_RECORD_TYPE_ID,
                    id: dataQueueRecordId,
                    columns: [DATA_QUEUE_RECORD_LINKED_PLUGIN_TYPE_FIELD_ID, DATA_QUEUE_RECORD_JSON_DATA_FIELD_ID]
                });

                var pluginId = lookupResults[DATA_QUEUE_RECORD_LINKED_PLUGIN_TYPE_FIELD_ID];
                log.debug('pluginId', JSON.stringify(pluginId));
                var data = JSON.parse(lookupResults[DATA_QUEUE_RECORD_JSON_DATA_FIELD_ID]);
                log.debug('data', JSON.stringify(data));

                var myplugin = plugin.loadImplementation({
                    type: DATA_PROCESSOR_PLUGIN_SCRIPT_ID,
                    implementation: pluginId
                });

                try {
                    updateDataQueueStatus({
                        id: dataQueueRecordId,
                        status: DATA_QUEUE_STATUSES.PROCESSING
                    });
                    myplugin.process(data, dataQueueRecordId);
                    updateDataQueueStatus({
                        id: dataQueueRecordId,
                        status: DATA_QUEUE_STATUSES.COMPLETED
                    });
                } catch (e) {
                    myplugin.handleError(data);
                    var values = {};
                    values[DATA_QUEUE_RECORD_ERROR_MESSAGE_FIELD_ID] = JSON.stringify(e);
                    updateDataQueueStatus({
                        id: dataQueueRecordId,
                        status: DATA_QUEUE_STATUSES.FAILED,
                        values: values
                    });
                    log.error('myplugin.process', JSON.stringify(e));
                }
            } catch (e) {
                updateDataQueueStatus({
                    id: dataQueueRecordId,
                    status: DATA_QUEUE_STATUSES.FAILED
                });
                log.error('plugin.load', JSON.stringify(e));
            }
        },
        /**
         * Ensures the Map Reduce script will run again.
         *
         * @context - Summary information.
         */
        summarize: function (context) {
            this.schedule();
        },
        /**
         * Encapsulates code to [re]schedule the map/reduce script. Can be used by external
         * scripts after importing the module.
         */
        schedule: function () {
            var script = runtime.getCurrentScript(),
                deploymentId = DEFAULT_MAP_REDUCE_DEPLOYMENT_ID;

            // Test whether we need to swap over to the other deployment as scheduling
            // our own deployment to run again doesn't seem to work as documented.
            if (script.deploymentId === deploymentId) {
                deploymentId += "_2";
            }

            var t = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: MAP_REDUCE_SCRIPT_ID,
                deploymentId: deploymentId
            });
            t.submit();
        }
    };
});