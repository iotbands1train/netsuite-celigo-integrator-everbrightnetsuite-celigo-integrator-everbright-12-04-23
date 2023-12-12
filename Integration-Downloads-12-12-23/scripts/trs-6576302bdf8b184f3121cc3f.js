function preSavePage232(options) {
  // Apply existing transformations 

  // Iterate through each item in the data array
  options.data.forEach(item => {
    // Check if firstName and lastName are present in salesRep
    if (item.originalPayload.projectData.salesRep.firstName && item.originalPayload.projectData.salesRep.lastName) {
      // Combine firstName and lastName into fullName
      item.originalPayload.projectData.salesRep.fullName =
        item.originalPayload.projectData.salesRep.firstName + ' ' + item.originalPayload.projectData.salesRep.lastName;
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
