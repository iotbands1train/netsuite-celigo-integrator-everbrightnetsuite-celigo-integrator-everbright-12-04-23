/**
 * Client scripts for Blue Banyan File System record type.
 * 
 * @NApiVersion 2.0
 * @NScriptType usereventscript
 * @NModuleScope public
 * @author Graham O'Daniel
 */
define(['N/runtime'], function(runtime) {
	function beforeLoad(context) {
		if (context.type != 'create' && context.type != 'edit')
			return;

		if (runtime.executionContext != runtime.ContextType.USER_INTERFACE)
			return;

		log.debug('beforeLoad', 'beforeLoad');

		var currentRecord = context.newRecord;
		var recordType = currentRecord.type;

		var script = runtime.getCurrentScript();

		var iframeField = script.getParameter('custscript_bb_s3_ue_generichandler_ifrm'),
			uniqueIdField = script.getParameter('custscript_bb_s3_ue_generichandler_uuid'),
			linkField = script.getParameter('custscript_bb_s3_ue_generichandler_link'),
			folderField = script.getParameter('custscript_bb_s3_ue_generichandler_fldr');

		if (!uniqueIdField) return;

		log.debug('uniqueIdField', uniqueIdField);

		var uniqueId = currentRecord.getValue({fieldId: uniqueIdField});

		var folder = folderField ? currentRecord.getValue({fieldId: folderField}) : undefined;
		folder = folder || [recordType, uniqueId].join('/');

		var suiteletUrl = [
			'/app/site/hosting/scriptlet.nl?',
			[
				'script=customscript_bb_s3_sl_uploadfiletoamazon',
				'deploy=customdeploy_bb_s3_sl_uploadfiletoamazon',
				'ifrmcntnr=T',
				'custom_bb_folder=' + folder
			].join('&')
		].join('');

		log.debug('suiteletUrl', suiteletUrl);

		var iframe = [
			'<iframe id="custom_bb_iframe" src="'+suiteletUrl + '" onload="custom_bb_iframe_onLoad(this)">',
			'	<div>Your browser does not support iframes.</div>',
			'</iframe>',
			'<script type="text/javascript">',
			'function custom_bb_iframe_onLoad() {',
			'	var iframe = document.getElementById("custom_bb_iframe").contentWindow.document;',
			'	var linkField = document.getElementById("' + linkField + '");',
			'	if (!iframe.getElementById("url")) return;',
			'	linkField.value = iframe.getElementById("url").value;',
			'	linkField.onchange();',
			'}',
			'</script>'
		].join('\n');

		currentRecord.setValue({
			fieldId: iframeField,
			value: iframe
		});
	}

	return {
		beforeLoad: beforeLoad
	};
})