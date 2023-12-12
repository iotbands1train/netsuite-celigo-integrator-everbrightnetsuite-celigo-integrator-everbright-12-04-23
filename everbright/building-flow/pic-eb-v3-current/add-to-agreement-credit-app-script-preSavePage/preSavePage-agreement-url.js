function preSavePage(options) {
  
    let i=0;
    // Iterate over each item in the data array
    options.data.forEach(item => {
      // Ensure the necessary properties exist
      if (item.originalPayload && 
          item.originalPayload.agreement_url ) {
  
        // Check if agreement_url is an array, if not, initialize it
        if (!Array.isArray(item.originalPayload.agreement_url)) {
          item.originalPayload.agreement_url = [];
        }
        i=i+1;
        // Construct the new URL using the proposal_id
        let newUrl = `https://engine.goeverbright.com/proposal/${item.originalPayload.projectData.everbrightProjectId}/pdf`;
  
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
    // Return the modified options object
    return {
      data: options.data,
      errors: options.errors,
      abort: false,
      newErrorsAndRetryData: []
    };
  }
  
  
  
  