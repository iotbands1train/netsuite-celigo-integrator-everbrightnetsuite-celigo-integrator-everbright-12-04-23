/**
 * Client scripts for Blue Banyan File System record type.
 * 
 * @NApiVersion 2.0
 * @NScriptType clientscript
 * @author Graham O'Daniel
 */
define([], function() {
	function pageInit(context) {
		log.debug('pageInit', 'pageInit');
		var currentRecord = context.currentRecord;
		var lastSync = currentRecord.getValue('custrecord_bb_file_synced_datetime');
		if (lastSync) {
			var url = '/app/site/hosting/scriptlet.nl?script=customscript_bb_s3_sl_showfile&deploy=customdeploy_bb_s3_sl_showfile&name=';

			currentRecord.setValue({
				fieldId: 'custrecord_bb_file_link',
				value: url
			});
		}
	}

	return {
		pageInit: pageInit
	};
})