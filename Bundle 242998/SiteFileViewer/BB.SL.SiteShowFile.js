/**
 * @NApiVersion 2.0
 * @NScriptType suitelet
 */

define(['N/encode', 'SuiteBundles/Bundle 207067/BB/S3/Lib/BB.S3'], function (encodeModule, s3) {
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
      // var encode.convert({
      //   string: stringInput,
      //   inputEncoding: encode.Encoding.UTF_8,
      //   outputEncoding: encode.Encoding.HEX
      // })
      var controller = new s3.ObjectViewerController(context);
      var viewer = controller.getViewer();
      viewer.generateView();
    }
  }

  return {
    onRequest: onRequest
  };
});