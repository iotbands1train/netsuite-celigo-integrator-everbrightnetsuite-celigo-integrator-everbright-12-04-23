/**
 *
 * @NApiVersion 2.0
 * @NScriptType usereventscript
 * @author Nick Weeks
 */
define(['N/record', 'N/search', 'SuiteScripts/BB/Data Processor/BB.Module.Transaction', 'N/plugin'], function(record, task, transaction, plugin) {

    function beforeSubmit(context) {
        var impls = plugin.findImplementations({
            type: 'customscript_bb_plugin_dataprocessor'
        });
        var myplugin = plugin.loadImplementation({
            type: 'customscript_bb_plugin_dataprocessor',
            implementation: 'customscript_angc_plugin_trans_request'
        });
        var json = {
            "request_id": "test_create_transfer_module2",
            "request_type": "Transfer Request",
            "to_location": 1,
            "from_location": 2,
            "date": "11/21/2018",
            "department": 1,
            "class": 1,
            "lines": [{
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }, {
                "item": 387,
                "quantity": 1,
                "units": 1
            }]
        };

        myplugin.process(json);
    }

    function afterSubmit(context) {
        var cur_rec = context.newRecord;
        var sendToSFTP = cur_rec.getValue({
            fieldId: 'custbody_bb_send_to_sftp'
        })
        if (sendToSFTP) {
            var pdf = transaction.createPickTicket(cur_rec);
            var success = transaction.sendToSftp(pdf);
            if (success) {
                log.debug('sent to sftp');
            }

        }

    }
    return {
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
});