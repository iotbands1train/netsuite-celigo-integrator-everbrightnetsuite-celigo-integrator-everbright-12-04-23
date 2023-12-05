/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 * @NModuleScope public
 * @author Michael Golichenko
 */
define(['N/record', 'N/search'],
    /**
     *
     * @param recordModule {record}
     * @param searchModule {search}
     * @returns {{execute: execute}}
     */
    function(recordModule, searchModule) {

        function process(type, field, formula){
            var _updates = [];
            var _search = searchModule.create({
                type: type,
                filters: [[field, searchModule.Operator.ISEMPTY, '']],
                columns: [{name: 'formulatext', formula: formula}]
            });
            _search.run().each(function(row){
                var _values = {};
                _values[field] = row.getValue({name: 'formulatext'});
                _updates.push({
                    type: type,
                    id: row.id,
                    values: _values
                });
                return true;
            });
            log.debug(type, _updates);
            if(_updates.length > 0){
                _updates.forEach(function(update){
                    recordModule.submitFields(update);
                });
            }
        }

        function execute(){
            process('customrecord_bb_vendor_license', 'custrecord_bb_ss_vend_license_s3_path', '\'vendors/licenses/\'||LOWER(SYS_GUID())');
            process('customrecord_bb_vendor_insurance', 'custrecord_bb_ss_vend_insurance_s3_path', '\'vendors/insurances/\'||LOWER(SYS_GUID())');
        }

        return {
            execute: execute
        }
    });