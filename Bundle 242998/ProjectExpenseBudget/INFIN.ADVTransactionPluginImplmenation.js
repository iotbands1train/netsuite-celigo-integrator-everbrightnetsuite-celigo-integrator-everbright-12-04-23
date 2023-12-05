/**
 * @NApiVersion 2.x
 * @NScriptType plugintypeimpl
 */
define(function() {
    return {
        setCustomBodyFields: function(transaction) {
            return transaction;
        },
        setCustomLineFields: function(transaction) {
            var projectId = transaction.getValue({fieldId: 'custbody_bb_project'});
            log.debug('transaction type', transaction.type);
            if (projectId) {
                var projectSearchObj = search.lookupFields({
                    type: search.Type.JOB,
                    id: projectId,
                    columns: ['custentity_bb_project_location', 'custentity_customer_department', 'custentity_customer_class']
                })
                var locationId = (projectSearchObj.custentity_bb_project_location.length > 0) ? projectSearchObj.custentity_bb_project_location[0].value : null;
                var departmentId = (projectSearchObj.custentity_customer_department.length > 0) ? projectSearchObj.custentity_customer_department[0].value : null;
                var classId = (projectSearchObj.custentity_customer_class.length > 0) ? projectSearchObj.custentity_customer_class[0].value : null;
                if (transaction.type == 'invoice') {
                    var lineCount = transaction.getLineCount({sublistId: 'item'});
                    for (var i = 0; i < lineCount; i++) {
                        transaction.selectLine({sublistId: 'item', line: i});
                        transaction.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'location',
                            value: locationId
                        })
                        transaction.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'department',
                            value: departmentId
                        })
                        transaction.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'class',
                            value: classId
                        })
                        transaction.commitLine({sublistId: 'item'})
                    }
                }
            }


            return transaction;
        }
    }
});