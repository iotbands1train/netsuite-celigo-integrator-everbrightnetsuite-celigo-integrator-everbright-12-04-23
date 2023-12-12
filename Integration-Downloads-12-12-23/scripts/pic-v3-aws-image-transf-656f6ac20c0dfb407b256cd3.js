/*
* preSavePageFunction stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one 'options' argument that has the following fields:
*   'data' - an array of records representing one page of data. A record can be an object {} or array [] depending on the data source.
*   'files' - file exports only. files[i] contains source file metadata for data[i]. i.e. files[i].fileMeta.fileName.
*   'errors' - an array of errors where each error has the structure {code: '', message: '', source: '', retryDataKey: ''}.
*   'retryData' - a dictionary object containing the retry data for all errors: {retryDataKey: { data: <record>, stage: '', traceKey: ''}}.
*   '_exportId' - the _exportId currently running.
*   '_connectionId' - the _connectionId currently running.
*   '_flowId' - the _flowId currently running.
*   '_integrationId' - the _integrationId currently running.
*   'pageIndex' - 0 based. context is the batch export currently running.
*   'lastExportDateTime' - delta exports only.
*   'currentExportDateTime' - delta exports only.
*   'settings' - all custom settings in scope for the export currently running.
*   'testMode' - Boolean flag that executes script only on test mode and preview/send actions.
*
* The function needs to return an object that has the following fields:
*   'data' - your modified data.
*   'errors' - your modified errors.
*   'abort' - instruct the batch export currently running to stop generating new pages of data.
*   'newErrorsAndRetryData' - return brand new errors linked to retry data: [{retryData: <record>, errors: [<error>]}].
* Throwing an exception will signal a fatal error and stop the flow.
*/
function preSavePage (options) {
  // sample code that simply passes on what has been exported
  options = preMap(options);
  return {
    data: options.data,
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}

function preMap(options) {
  // Loop through the data array
  for (let i = 0; i < options.data.length; i++) {
    let dataItem = options.data[i];
    let files = dataItem.originalPayload.files;
    let agreementFile = dataItem.originalPayload.agreement_url;
    
    // Check if 'files' is null or not an array
    if (!files || !Array.isArray(files))
      files = []; 
      
    if (agreementFile) {
      //if(files.length>1)
      files.push({"name": "Agreement", "url": agreementFile});
      
    }

    
    // Generate the HTML table
    let tableRows = files.map(file => `
      <tr>
        <td style="border: 1px solid #ddd;padding: 8px;">Google-Map-Image</td>
        <td style="border: 1px solid #ddd;padding: 8px;"><a href="${file.url}">${file.url}</a></td>
      </tr>
    `);

    let htmlTable = `
      <table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;border-collapse: collapse;width: 100%;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd;padding: 8px;padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #4CAF50;color: white;">Friendly Name</th>
            <th style="border: 1px solid #ddd;padding: 8px;padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #4CAF50;color: white;">Image Link</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows.join('')}
        </tbody>
      </table>
    `;

    // Add the HTML table to the current data item as "image_table"
    //dataItem.originalPayload.image_table = htmlTable;
    options.data[i].image_table = htmlTable;
  }
 // console.log(JSON.stringify(options.data[i].originalPayload.image_table));
  // Return the modified options
  return options;
}