/**
 * @NApiVersion 2.0
 * @NScriptType suitelet
 * @NModuleScope public
 * @author Graham O'Daniel
 */

define(['./Lib/BB.S3'], function (s3) {
	/**
	 * Generates a presigned URL from S3 and presents the file in an HTML form.
	 *
	 * @param {any} context
	 */
	function onRequest(context) {
		if (context.request.method == 'GET') {
			if (!context.request.parameters.name) {
				throw "Missing name parameter."
			}

			if (context.request.parameters.download=='t') {
				log.debug('download',context.request.parameters.name);
				var _s3Service = new s3.Service();
				var _img = _s3Service.getPresignedUrl(context.request.parameters.name, 60);
				log.debug("_img",_img);

				context.response.write(_img);
				return;
			}

			var controller = new s3.ObjectViewerController(context);
			var viewer = controller.getViewer();
			viewer.generateView();
		}
	}

	return {
		onRequest: onRequest
	};
});
