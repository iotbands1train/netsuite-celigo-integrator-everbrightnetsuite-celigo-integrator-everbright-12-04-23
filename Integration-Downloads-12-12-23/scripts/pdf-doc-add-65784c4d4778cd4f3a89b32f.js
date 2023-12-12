/*
* postResponseMapFunction stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one 'options' argument that has the following fields:
*    'postResponseMapData' - an array of records representing the page of data after response mapping is completed. A record can be an object {} or array [] depending on the data source.
*    'responseData' - the array of responses for the page of data.  An individual response will have the following fields:
*        'statusCode' - 200 is a success.  422 is a data error.  403 means the connection went offline.
*        'errors' - [{code: '', message: '', source: ''}]
*        'ignored' - true if the record was filtered/skipped, false otherwise.
*        'data' - exports only.  the array of records returned by the export application.
*        'id' - imports only.  the id from the import application response.
*        '_json' - imports only.  the complete response data from the import application.
*        'dataURI' - imports only.  a URI for the data in the import application (populated only for errored records).
*    'oneToMany' - as configured on your export/import resource.
*    'pathToMany' - as configured on your export/import resource.
*    '_exportId' - the _exportId currently running.
*    '_importId' - the _importId currently running.
*    '_connectionId' - the _connectionId currently running.
*    '_flowId' - the _flowId currently running.
*    '_integrationId' - the _integrationId currently running.
*    'settings' - all custom settings in scope for the export/import currently running.
*    'testMode' - Boolean flag that executes script only on test mode and preview/send actions.
*
* The function needs to return the postResponseMapData array provided by options.postResponseMapData.  The length of postResponseMapData MUST remain unchanged.  Elements within postResponseMapData can be changed however needed.

* Throwing an exception will signal a fatal error and fail the entire page of records.
*/

function postResponseMap (options) {
  options.postResponseMapData.forEach(item => {
    // Ensure the necessary properties exist
    if (item.originalPayload && 
        item.originalPayload.agreement_url ) {

      // Check if agreement_url is an array, if not, initialize it
      if (!Array.isArray(item.originalPayload.agreement_url)) {
        item.originalPayload.agreement_url = [];
      } 
      // Construct the new URL using the proposal_id
      let newUrl = `https://engine.goeverbright.com/proposal/${item.ids.proposal_id_5}/pdf`;

      // Check if the new URL is already in the agreement_url array to avoid duplicates
      if (!item.originalPayload.agreement_url.includes(newUrl)) {
        // Add the new URL to the agreement_url array
        item.originalPayload.agreement_url.push(newUrl);
      }
    } else {
      // Log a message if proposal_id is missing (optional, for debugging)
      console.log("Missing proposal_id for item:", item);
    }
  }); 
 return options.postResponseMapData
}


