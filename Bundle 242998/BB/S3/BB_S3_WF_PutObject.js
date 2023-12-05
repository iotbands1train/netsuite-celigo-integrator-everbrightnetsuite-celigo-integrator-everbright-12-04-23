/**
 * Workflow action for getting base64 text from a field, uploading to Amazon S3, and saving a link (public or private) to
 * another field.
 *
 * @NApiVersion 2.0
 * @NScriptType workflowactionscript
 * @author Graham O'Daniel
 */

define(['./Lib/BB.S3', 'N/runtime', 'N/record'], function (s3module, runtime, record) {
	var FileTypes = {
		JPG: '2',
		PNG: '5',
		PDF: '17'
	};
	
	var S3Acl = {
		'1': 'private',
		'2': 'public-read'
	};

	/**
	 * Uploads base64 to S3 and saves a link to Suitelet for serving up S3 content.
	 *
	 * Expected usage: 22 for custom records, 30 for transactions, and 25 for all others
	 *
	 * @param {any} context 
	 */
	function putObjectAndStoreLink(context) {
		try {
			log.debug('putObjectAndStoreLink', 'START');

			var script = runtime.getCurrentScript();

			var base64FieldId = script.getParameter('custscript_bb_base64_field');
			var linkFieldId = script.getParameter('custscript_bb_link_field');
			var fileType = script.getParameter('custscript_bb_file_type');
			var acl = script.getParameter('custscript_bb_s3_acl');
			var objectName = script.getParameter('custscript_bb_s3_object_name');
			var s3 = new s3module.Service();

			log.debug('wf acl', acl);
			log.debug('S3Acl[acl]', S3Acl[acl]);
			log.debug('objectName', objectName);

			var data = context.newRecord.getValue(base64FieldId);
			if (!data) {
				log.debug('Nothing to do', 'data is empty');
				return true; // No data so success
			}

			if (context.oldRecord) { // For some reason context.oldRecord is sometimes null?
				var oldData = context.oldRecord.getValue(base64FieldId);

				if (data == oldData) {
					log.debug('Nothing to do', 'data == oldData');
					return true; // Nothing to do so success
				}
			}

			log.debug('fileType', fileType);

			var fileInfo = (function (fileType) {
				switch (fileType) {
					case FileTypes.PNG:
						return { extension: 'png', contentType: 'image/png' };
					case FileTypes.JPG:
						return { extension: 'jpg', contentType: 'image/jpeg' };
					case FileTypes.PDF:
						return { extension: 'pdf', contentType: 'application/pdf' };
					default:
						throw 'Unsupported file type. Must be JPG, PNG, or PDF.';
				}
			})(fileType);

			// Get the extension script parameter
			var extension = fileInfo.extension;

			// Get the content type script parameter
			var contentType = fileInfo.contentType;

			// Set the name using a format of <record id>.<field>.<extension>
			var name = objectName ? objectName : [context.newRecord.type, context.newRecord.id, linkFieldId, extension].join('.');

			var s3Object = new s3module.Object({
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
								['script=customscript_bb_s3_sl_showfile',
									'deploy=customdeploy_bb_s3_sl_showfile',
									'name=' + name,
									'extension=' + extension
								].join('&')
							].join('');
						}

						var values = {};
						values[linkFieldId] = url;

						log.debug('values', JSON.stringify(values));

						record.submitFields({
							type: context.newRecord.type,
							id: context.newRecord.id,
							values: values
						});
					}
				);
			} catch (e) {
				log.error('error calling s3', e);
			}

			log.debug('putObjectAndStoreLink', 'END');
		} catch (outerE) {
			log.error('Unexpected error', outerE);
		}
	}

	return {
		onAction: putObjectAndStoreLink
	};
});