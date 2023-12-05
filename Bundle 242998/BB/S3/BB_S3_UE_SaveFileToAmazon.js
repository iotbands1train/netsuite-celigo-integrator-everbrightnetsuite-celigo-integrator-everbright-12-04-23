/**
 * Workflow action for getting base64 text from a field, uploading to Amazon S3, and saving a link (public or private) to
 * another field.
 *
 * @NApiVersion 2.0
 * @NScriptType usereventscript
 * @NModuleScope public
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

define(['./Lib/BB.S3', 'N/runtime', 'N/record', 'N/file', 'N/search'], function (s3module, runtime, record, file, search) {
	/**
	 * Uploads file to S3 and saves a link to Suitelet for serving up S3 content.
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

			var linkFieldId = 'custrecord_bb_file_link';
			var fileFieldId = 'custrecord_bb_file_file_cabinet_file';
			var permissionFieldId = 'custrecord_bb_file_permission';

			var permission = context.newRecord.getValue(permissionFieldId);
			var folderId = context.newRecord.getValue('custrecord_bb_file_bb_folder');
			var s3 = new s3module.Service();
			

			var fileId = context.newRecord.getValue(fileFieldId);
	
			if (!fileId) {
				log.debug('Nothing to do', 'fileId is empty');
				return;
			}
	
			var myFile = file.load(fileId);

			_returnValue = myFile.name;
			var objectName = myFile.name;

			var folder = undefined;
			if (folderId) {
				var fields = search.lookupFields({
					type: 'customrecord_bb_folder',
					id: folderId,
					columns: ['name']
				});

				objectName = [fields.name, objectName].join('/');
			}
	
			var data = myFile.getContents();

			log.debug('wf acl', permission);
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

			var s3Object = new s3module.Object({
				name: name,
				data: data,
				contentType: contentType,
				acl: S3Acl[permission]
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

						if (!permission || S3Acl[permission] === 'private') {
							// Create a link to our S3 File Viewer Suitelet
							url = ['/app/site/hosting/scriptlet.nl?',
								['script=customscript_bb_s3_sl_showfile',
									'deploy=customdeploy_bb_s3_sl_showfile',
									'name=' + name
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
		afterSubmit: saveFileToAmazon
	};
});