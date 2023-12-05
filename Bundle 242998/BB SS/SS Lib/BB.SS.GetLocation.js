/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Myron Chavez
 */
define(['N/record', 'N/search'],
    function (record, search) {

        function getLocation(subsidiary, type) {
            var locationSearchObj;
            var preferredLocation = null;

            var filters = [];
            if (subsidiary) {
                filters.push(search.createFilter({
                    name: 'subsidiary',
                    operator: search.Operator.ANYOF,
                    values: [subsidiary]
                }));
            }
            log.debug(filters);
            locationSearchObj = search.create({
                type: "location",
                filters: filters,
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                        }),
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC
                        }),
                        search.createColumn({
                            name: "custrecord_bb_project_location_type",
                        }),
                        search.createColumn({
                            name: "custrecord_bb_preferred_location",
                        })
                    ]
            });
            var projectType = type;

            var searchResultCount = locationSearchObj.runPaged().count;
            var locationSearchResultSet = locationSearchObj.run();
            var locType, locId, isPreferredLocation;
            locationSearchResultSet.each(function (result) {
                locType = result.getValue({ name: 'custrecord_bb_project_location_type' });                
                locId = result.getValue({ name: 'internalid' });
                isPreferredLocation = result.getValue({ name: 'custrecord_bb_preferred_location' });

                if (locType == projectType && isPreferredLocation) {//&& isPreferredLocation == 'T'
                    preferredLocation = locId;
                }
                return true;
            });

            //If no prefered location where project type matches, check if there is any preferred location
            if (!preferredLocation) {
                locationSearchResultSet.each(function (result) {
                    locId = result.getValue({ name: 'internalid' });
                    isPreferredLocation = result.getValue({ name: 'custrecord_bb_preferred_location' });

                    if (isPreferredLocation == 'T') {
                        preferredLocation = locId;
                    }
                    return true;
                });


            }
            //if there is no preferred location, take the first location
            if (!preferredLocation) {
                locationSearchResults = locationSearchResultSet.getRange({ start: 0, end: 0 });
                var firstLocation = locationSearchResults[0];
                if (firstLocation) {
                    preferredLocation = firstLocation.getValue({ name: 'internalid' });
                }
            }
			
            return preferredLocation;
            

        }

        return {
            getLocation: getLocation
        };
    });

/*function getLocation(subsidiary) {
        var locationSearchObj = search.create({
            type: "location",
            filters:
                [
                    ["isinactive", "is", "F"],
                    "AND",
                    ["subsidiary", "anyof", subsidiary],
                    "AND",
                    ["custrecord_bb_preferred_location", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var searchResultCount = locationSearchObj.runPaged().count;
        log.debug("locationSearchObj result count", searchResultCount);
        locationSearchObj.run().each(function (result) {
            var location;
            var obj = {};
            obj['internalid'] = result.getValue({ name: 'internalid' });
            location = obj;
            return true;
        });
        return location;
    }*/