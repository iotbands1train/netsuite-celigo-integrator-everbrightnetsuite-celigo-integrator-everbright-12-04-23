/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @version 17.2.0
 * @author Graham O'Daniel
 */

define(['N/search'], function(search) {
	function getConfiguration(fieldId) {
		return getConfigurations([fieldId])[fieldId];
	}

	function getConfigurations(fieldIds) {
		var fields = {};
		
		// Construct search
		var searchFilters = [['isinactive', 'is', 'F']];
		var searchColumns = [];
		util.each(fieldIds, function(fieldId) {
			searchColumns.push(
				search.createColumn({
					name: fieldId,
				})
			);
			return true;
		});
		
		var configSearch = search.create({
			type: 'customrecord_bb_solar_success_configurtn',
			filterExpression: searchFilters,
			columns: searchColumns
		});
		
		var searchResults = configSearch.run().each(function (result) {
			util.each(fieldIds, function(fieldId) {
				fields[fieldId] = {
						value: result.getValue({name: fieldId}),
						text: result.getText({name: fieldId})
				};
			});
			return false;
		});
		return fields;
	}
	
	return {
		getConfiguration: getConfiguration,
		getConfigurations: getConfigurations
	}
});