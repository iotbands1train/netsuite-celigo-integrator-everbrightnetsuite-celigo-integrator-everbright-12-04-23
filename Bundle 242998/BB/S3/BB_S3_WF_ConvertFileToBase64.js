/**
 * @NApiVersion 2.0
 * @NScriptType workflowactionscript
 * @author Graham O'Daniel
 */
define(['N/file', 'N/runtime'], function (file, runtime) {
	/**
	 * Gets file contents, saves it to base64 field, and deletes the file.
	 *
	 * Expected usage: 30
	 *
	 * @param {Object} context: Context object including newRecord.
	 */
	function onAction(context) {
		log.debug('onAction', 'START');
		var script = runtime.getCurrentScript();

		var fileFieldId = script.getParameter('custscript_bb_file_field_pre');
		var base64FieldId = script.getParameter('custscript_bb_base64_field_pre');

		var record = context.newRecord;

		var image = record.getValue(fileFieldId);

		if (!image) {
			log.debug('Nothing to do', 'image is empty');
			return;
		}

		var myFile = file.load(image);

		record.setValue({
			fieldId: base64FieldId,
			value: myFile.getContents()
		});

		record.setValue({
			fieldId: fileFieldId,
			value: undefined
		});

		file['delete'](image); // delete is a key word in javascript
	}

	return {
		onAction: onAction
	};
});