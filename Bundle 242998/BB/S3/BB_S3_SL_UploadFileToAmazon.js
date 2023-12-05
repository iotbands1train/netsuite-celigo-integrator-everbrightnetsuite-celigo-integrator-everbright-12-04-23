/**
 * @NScriptType suitelet
 * @NApiVersion 2.0
 * @NModuleScope public
 * @author Graham O'Daniel
 */
define(['./Lib/BB.S3', 'N/record', './Lib/crypto-js'], function(s3module, record, CryptoJS) {
	const HTML_HEADER = [
		'<head>',
		'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />',
		'<style>',
		'body {',
		'	font-family: \'Open Sans\';',
		'	font-style: normal;',
		'	font-weight: 400;',
		'	src: local(\'Open Sans\'), local(\'OpenSans\');',
		'}',
		'</style>',
		'<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">',
		'<style>',
		'body {',
		'	font-family: \'Open Sans\', sans-serif;',
		'	font-style: normal;',
		'	font-size: 14;',
		'	font-weight: 300;',
		'}',
		'</style>',
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.slim.min.js" integrity="sha512-6ORWJX/LrnSjBzwefdNUyLCMTIsGoNP6NftMy2UAm1JBm6PRZCO1d7OHBStWpVFZLO+RerTvqX/Z9mBFfCJZ4A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>',
		'</head>'
	].join('\n');

	function onRequest(params) {
		var html = undefined,
			success = params.request.parameters.custom_bb_success,
			key = params.request.parameters.key,
			bucket = params.request.parameters.bucket,
			etag = params.request.parameters.etag,
			folder = params.request.parameters.custom_bb_folder,
			acl = params.request.parameters.custom_bb_acl || 'private';

		if (!folder) throw 'Missing custom_bb_folder parameter.';

		folder = folder.replace(/ /g, '_');

		var amzDate = s3module.Service.getAmzDate();
		var datestamp = amzDate.split("T")[0];
		var redirectUrl = [
			params.request.url,
			[
				['script', params.request.parameters.script].join('='),
				['deploy', params.request.parameters.deploy].join('='),
				['custom_bb_folder', folder].join('='),
				['custom_bb_success', 'T'].join('=')
			].join('&')
		].join('?');
		
		var s3 = new s3module.Service();
		s3.loadCredentials();
		s3._service = 's3';

		var amzCredential = [s3._accessKey, datestamp, s3._region, s3._service, 'aws4_request'].join('/');

		var policy = new s3module.Policy({
			"expiration": "2027-12-01T12:00:00.000Z", // TODO: replace with now + 30 minutes
			"conditions": [
				{"folder": folder},
				{"bucket": s3._bucket},
				{"acl": acl},
				{"success_action_redirect": redirectUrl},
				{"x-amz-credential": amzCredential},
				{"x-amz-algorithm": s3.ALGORITHM},
				{"x-amz-date": amzDate},
				{"content-disposition": "inline"},
				["starts-with", "$content-type", ""], // Any content type for now
				["starts-with", "$key", ""] // User can name it anything
			]
		});

		var stringToSign = policy.toBase64();

		var signingKey = s3.getSignatureKey(s3._service, s3._secretKey, datestamp);

		var signature = CryptoJS.HmacSHA256(stringToSign, signingKey);
log.debug('redirectUrl',redirectUrl);
		html = getForm(key, success, folder, s3._bucket, acl, redirectUrl, amzCredential, s3.ALGORITHM, amzDate,
			stringToSign, signature);

		params.response.write(html);
	}

	function getForm(key, success, folder, bucket, acl, redirect, amzCredential, amzAlgorithm, amzDate, policyBase64, signature) {
		var url = [
			'/app/site/hosting/scriptlet.nl?',
			[
				'script=customscript_bb_s3_sl_showfile',
				'deploy=customdeploy_bb_s3_sl_showfile',
				'name=' + key
			].join('&'),
		].join('');

		return [
			'<html>',
			HTML_HEADER,
			'<body>Upload your file here.<br><br>',
			'<script type="text/javascript">',
			'function onFileChange(input) {',
			'	var folder = document.getElementById("folder").value;',
			'	var filePath = input.value;',
			'	var fileName = filePath.replace(/\\\\/g, "/").split("/").pop();',
			'	var extension = filePath.split(".").pop();',
			'	var contentType = (function(extension) {',
			'		switch(extension) {',
			'			case "pdf":',
			'				return "application/pdf";',
			'			case "png":',
			'				return "image/png";',
			'			case "jpg":',
			'			case "jpeg":',
			'				return "image/jpeg";',
			'			case "gif":',
			'				return "image/gif";',
			'			default:',
			'				return "binary/octet-stream";',
			'		}',
			'	})(extension);',
			'	document.getElementById("contentType").value = contentType;',
			'	document.getElementById("key").value = [folder, fileName].join("/").replace(/ /g,"_");',
			'}',
          'function awsredirect(el){'+
          'var url=el.contentWindow.location.href;'+
          'console.log(url);if(url.indexOf("https")!=0) return;'+
          'url = url.indexOf("&redirect=")>0 ? window.top.location.origin+decodeURIComponent(url.substr(url.indexOf("&redirect=")+10)) : url;'+
          'console.log(url);'+
          'location=url;'+
          '}',
			'</script>',
			success == 'T' ? getHiddenField('url', 'url', url) : '',
			success == 'T' ? 'File uploaded successfully.<br />' : '',
          '<iframe name="submitaws" style="display:none;" width="150px" height="50px" onLoad="awsredirect(this)"></iframe>',
            '<form id="awsupload" action="https://' + bucket + '.s3.amazonaws.com/" method="post" enctype="multipart/form-data" target="submitaws">',
			getHiddenField('folder', 'folder', folder),
			getHiddenField('key', 'key', undefined),
			getHiddenField('acl', 'acl', acl),
			getHiddenField('success_action_redirect', undefined, redirect),
			getHiddenField('Content-Type', 'contentType', 'binary/octet-stream'),
			getHiddenField('Content-Disposition', undefined, 'inline'),
			getHiddenField('X-Amz-Credential', undefined, amzCredential),
			getHiddenField('X-Amz-Algorithm', undefined, amzAlgorithm),
			getHiddenField('X-Amz-Date', undefined, amzDate),
			getHiddenField('Policy', undefined, policyBase64),
			getHiddenField('X-Amz-Signature', undefined, signature),
			getInputField('file', 'file', 'file', undefined, 'onFileChange(this)', true),
			getInputField('submit', 'submit', 'submit', 'Upload to Amazon S3', undefined, false),
			'</form>',
			'</body></html>'
		].join('\n');
	}

	function getInputField(type, name, id, value, onchange, br) {
		return [
			'<input',
			type ? 'type="' + type + '"' : '',
			name ? 'name="' + name + '"'  : '',
			id ? 'id="' + id + '"' : '',
			typeof value !== 'undefined' ? 'value="' + value + '"' : '',
			onchange ? 'onchange="' + onchange + '"' : '',
			'/>',
			br ? '<br />': ''
		].join(' ');
	}

	function getHiddenField(name, id, value) {
		return getInputField('hidden', name, id, value, undefined, false);
	}

	return {
		onRequest: onRequest
	}
});