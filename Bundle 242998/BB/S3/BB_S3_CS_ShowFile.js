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
		var
			_fileViewerImage = jQuery('.file-viewer-image'),
			_zoomOut = function(){
				_fileViewerImage.css('max-width', 'none');
				_fileViewerImage.css('max-height', 'none');
				_fileViewerImage.css('cursor', 'zoom-out');
				_fileViewerImage.removeClass('zoomed-in');
			},
			_zoomIn = function(){
				_fileViewerImage.css('max-width', '100%');
				_fileViewerImage.css('max-height', '80vh');
				_fileViewerImage.css('cursor', 'zoom-in');
				_fileViewerImage.addClass('zoomed-in');
			}
		;
		if (jQuery('#s3url').length > 0) {
			window.location.replace(jQuery('#s3url').val());
		}
		if(_fileViewerImage.length > 0){
			_zoomIn();
			_fileViewerImage.on('click', function(){
				if(_fileViewerImage.hasClass('zoomed-in')){
					_zoomOut();
				} else {
					_zoomIn();
				}
			});
		}

	}

	function goToUrl(path){
		if(!path) return;
		var _url = new URL(window.location);
		_url.searchParams.set('name', path);
		window.location.replace(_url.toString());
	}

	return {
		pageInit: pageInit
		, goToUrl: goToUrl
	};
});