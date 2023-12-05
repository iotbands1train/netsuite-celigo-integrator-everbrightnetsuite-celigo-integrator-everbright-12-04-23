/**
 * @NApiVersion 2.0
 * @NScriptType plugintypeimpl
 */
 define(
[
  'N/search',
  'N/log'
],
function(
  nSearch,
  log
) {
  return {
    setCustomBodyFields: function(object, type) {
      return object;
    },

    setCustomLineFields: function(object, type) {
      var projectId = object.getValue('custbody_bb_project');

      log.debug('projectId', projectId);

      if (projectId) {
        var fields = nSearch.lookupFields({
          type: 'job',
          id: projectId,
          columns: ['custentity_bb_project_location']
        });

        log.debug('fields', fields);

        if (fields.custentity_bb_project_location[0]) {
          var location = fields.custentity_bb_project_location[0].value;

          log.debug('location', location);

          if (location) {
            log.debug('type', type);
            object.setCurrentSublistValue({
              sublistId: (type == 'bill') ? 'item' : 'line',
              fieldId: 'location',
              value: location
            });
          }
        }
      }

      return object;
    }
  }
});