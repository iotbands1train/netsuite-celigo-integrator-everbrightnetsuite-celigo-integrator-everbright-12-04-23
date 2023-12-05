/**
 * Client scripts for Blue Banyan File System record type.
 * 
 * @NApiVersion 2.0
 * @NScriptType usereventscript
 * @author Graham O'Daniel
 */
define(['./Lib/BB.S3'], function(s3) {
	function beforeLoad(context) {
		log.debug('beforeLoad', 'beforeLoad');
		var currentRecord = context.newRecord;

		var fileId = currentRecord.id;
		if (!fileId) return;

		var file = new BB.S3.FileSystem.File().load(fileId);

		var suiteletUrl = [
			'/app/site/hosting/scriptlet.nl?',
			[
				'script=customscript_bb_s3_sl_uploadfiletoamazon',
				'deploy=customdeploy_bb_s3_sl_uploadfiletoamazon',
				'ifrmcntnr=T',
				'custom_bb_fileid=' + currentRecord.id,
				'custom_bb_objectname=' + file.fullpath
			].join('&')
		].join('');

		log.debug('suiteletUrl', suiteletUrl);

		var iframe = [
			'<iframe id="custom_bb_iframe" src="'+suiteletUrl + '" onload="custom_bb_iframe_onload(this)">',
			'	<div>Your browser does not support iframes.</div>',
			'</iframe>',
			'<script type="text/javascript">',
			'var loaded = false;',
			'var custom_bb_iframe_onload = function(iframe) {',
			'	if (loaded) {',
			'		var url = iframe.contentWindow.location.href;',
			'		alert(url);',
			'		if (url.indexOf("custom_bb_success=T") > 0) location.reload();',
			'		else alert("An error occurred uploading to Amazon.");',
			'	}',
			'	loaded = true;',
			'}',
			'</script>'
		].join('');

		currentRecord.setValue({
			fieldId: 'custrecord_bb_s3_amazon_iframe',
			value: iframe
		});
	}

	return {
		beforeLoad: beforeLoad
	};
})