/**
 * Workflow action for getting base64 text from a field, uploading to Amazon S3, and saving a link (public or private) to
 * another field.
 *
 * @NApiVersion 2.0
 * @NScriptType workflowactionscript
 * @author Graham O'Daniel
 */
var FileTypes = {
	JPG: 'JPGIMAGE',
	PNG: 'PNGIMAGE',
	PDF: 'PDF'
};

var S3Acl = {
	'1': 'private',
	'2': 'public-read'
};

define(['/SuiteScripts/BB/S3/Lib/BB.S3', 'N/runtime', 'N/record', 'N/file'], function (s3, runtime, record, file) {
	/**
	 * Uploads base64 to S3 and saves a link to Suitelet for serving up S3 content.
	 *
	 * Expected usage: 22 for custom records, 30 for transactions, and 25 for all others
	 *
	 * @param {any} context 
	 */
	function saveFileToAmazon(context) {
		try {
			var _returnValue = undefined;

			log.debug('saveFileToAmazon', 'START');

			var script = runtime.getCurrentScript();

			var linkFieldId = script.getParameter('custscript_vip_sfta_link_field');
			var acl = script.getParameter('custscript_vip_sfta_acl');
			var folder = script.getParameter('custscript_vip_sfta_folder');
			var fileFieldId = script.getParameter('custscript_vip_sfta_file_field');
			var fileNameFieldId = script.getParameter('custscript_vip_sfta_file_name');

			var fileId = context.newRecord.getValue(fileFieldId);
	
			if (!fileId) {
				log.debug('Nothing to do', 'fileId is empty');
				return;
			}
	
			var myFile = file.load(fileId);

			_returnValue = myFile.name;
			var objectName = [folder, myFile.name].join('/').replace(/\\\\/g, '\\');
	
			var data = myFile.getContents();

			log.debug('wf acl', acl);
			log.debug('S3Acl[acl]', S3Acl[acl]);
			log.debug('objectName', objectName);
			log.debug('fileType', myFile.fileType);

			var fileInfo = (function (fileType) {
				switch (fileType) {
					case FileTypes.PNG:
						return { extension: 'png', contentType: 'image/png' };
					case FileTypes.JPG:
						return { extension: 'jpg', contentType: 'image/jpeg' };
					case FileTypes.PDF:
						return { extension: 'pdf', contentType: 'application/pdf' };
					default:
						return { contentType: 'application/octet-stream' };
				}
			})(myFile.fileType);

			// Get the extension script parameter
			var extension = fileInfo.extension;

			// Get the content type script parameter
			var contentType = fileInfo.contentType;

			// Set the name using a format of <record id>.<field>.<extension>
			var name = objectName ? objectName : [context.newRecord.type, context.newRecord.id, linkFieldId, extension].join('.');

			name = name.replace(/ /g, '_');

			var s3Object = new BB.S3.Object({
				name: name,
				data: data,
				contentType: contentType,
				acl: S3Acl[acl]
			});

			try {
				s3.putObject(s3Object,
					function (response) {
						log.error('s3.putObject', response.status);
					},
					function (response) {
						log.debug('s3.putObject', 'SUCCESS');
						log.debug('resonse.url', response.url);

						var url = response.url;

						if (!acl || S3Acl[acl] === 'private') {
							// Create a link to our S3 File Viewer Suitelet
							url = ['/app/site/hosting/scriptlet.nl?',
								['script=customscript_vip_s3_sl_showfile',
									'deploy=customdeploy_vip_s3_sl_showfile',
									'name=' + name,
									(extension) ? 'extension=' + extension : undefined
								].filter(function(element) {
									return typeof element !== 'undefined';
								}).join('&')
							].join('');
						}

						var values = {};
						values[linkFieldId] = url;

						if (fileNameFieldId) values[fileNameFieldId] = myFile.name;

						log.debug('values', JSON.stringify(values));

						record.submitFields({
							type: context.newRecord.type,
							id: context.newRecord.id,
							values: values
						});

						file['delete'](fileId);
					}
				);
			} catch (e) {
				log.error('error calling s3', e);
			}

			log.debug('saveFileToAmazon', 'END');
		} catch (outerE) {
			log.error('Unexpected error', outerE);
		}

		return _returnValue;
	}

	return {
		onAction: saveFileToAmazon
	};
});