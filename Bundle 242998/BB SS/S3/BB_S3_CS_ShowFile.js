/**
 * @NApiVersion 2.0
 * @NScriptType clientscript
 * @NModuleScope public
 * @author Graham O'Daniel
 */
define([], function () {
	/**
	 * Redirects the browser to the S3 URL if one is provided.
	 * 
	 * @param {any} context The standard context passed in to client script functions.
	 */
	function pageInit(context) {
		if ($('s3url') === undefined) return;
		window.location.replace($('s3url').value);
	}

	return {
		pageInit: pageInit
	};
});