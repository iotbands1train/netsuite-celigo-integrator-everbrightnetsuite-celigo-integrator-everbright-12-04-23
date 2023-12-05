/**
 * @NApiVersion 2.0
 * @NScriptType suitelet
 * @author Graham O'Daniel
 */

/**
 * Copyright 2017-2019 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */
define(['N/render', 'N/search', 'N/file', 'N/url', './SS Lib/BB_SS_MD_SolarConfig', 'N/runtime', 'N/record'], function (render, search, file, url, config, runtime, record) {
    function getProject(projectId) {
        var projectSearch = search.load({
            id: 'customsearch_bb_proj_bom_items_report_hd'
        });

        var projectFilter = search.createFilter({
            name: 'internalid',
            operator: search.Operator.ANYOF,
            values: [
                projectId
            ]
        });
        projectSearch.filters = [
            projectFilter
        ];

        var columns = projectSearch.columns;

        var project = {};
        projectSearch.run().each(function (result) {
            columns.forEach(function (column) {
                project[column.label] = {
                    value: result.getValue(column),
                    text: result.getText(column)
                };
            });
        });

        return project;
    }

    function getBomList(projectId, configObj, location,isBinEnabled) {
        var bomList = [];
        var includeAllItems = !configObj || !configObj.custrecord_bb_bom_report_restrict_items.value;

        var projectBomSearch = search.load({
            id: 'customsearch_bb_proj_bom_items_report'
        });

        var filterValues = [projectId];
        if (includeAllItems) {
            filterValues.push('@NONE@');
        }

        var projectFilter = search.createFilter({
            name: 'custrecord_bb_project_bom_project',
            join: 'custrecord_bb_project_bom_item',
            operator: search.Operator.ANYOF,
            values: filterValues
        });
        projectBomSearch.filters.push(projectFilter);

        var columns = projectBomSearch.columns;

        //Get All the internal ids of items required for a project to get thier bin availability
        var itemInternalIds = []
        var searchResultCount = projectBomSearch.runPaged().count;
        if (searchResultCount == 0){throw "No BOM found for this project."};
        projectBomSearch.run().each(function (result) {
            itemInternalIds.push(result.id);
            return true;
        });

        //===========Get Item Bin Details
        if (isBinEnabled) {
            log.debug('location object', location);
            if(location.custentity_bb_project_location.length == 0){
                throw 'Please fill out the Project Location Before Printing the BOM!'
            }
            var projectBomBinSearch = search.load({
                id: 'customsearch_item_bin_count_search'
            });
            var idFilter = search.createFilter({
                name: 'internalid',
                operator: search.Operator.ANYOF,
                values: itemInternalIds
            });
            var locationFilter = search.createFilter({
                name: 'location',
                join: 'binonhand',
                operator: search.Operator.ANYOF,
                values: [location.custentity_bb_project_location[0].value]
            });
            var binfilter = search.createFilter({
                name: 'quantityonhand',
                join: 'binonhand',
                operator: search.Operator.GREATERTHAN,
                values: [0]
            });
            projectBomBinSearch.filters = [
                idFilter, locationFilter, binfilter
            ];
            var bomItem = {}
            var binColumns = projectBomBinSearch.columns;
            var binsFound = projectBomBinSearch.runPaged().count > 0 ? true : false; // to be used to add bin details in Bom list
            projectBomBinSearch.run().each(function (result) {
                if (!bomItem[result.id]) {
                    bomItem[result.id] = []
                }
                var itemEntry = {}
                itemEntry.id = result.id;
                binColumns.forEach(function (column) {
                    itemEntry[column.label] = {
                        value: result.getValue(column),
                        text: result.getText(column)
                    };
                });
                bomItem[result.id].push(itemEntry);
                return true;
            });
        }

        //Get the project Bom details
        projectBomSearch.run().each(function (result) {
            var bomEntry = {};

            bomEntry.system_internalId = result.id;
            columns.forEach(function (column) {
                bomEntry[column.label] = {
                    value: result.getValue(column),
                    text: result.getText(column)
                };
            });
            //add items in bin details if items are found in bins.
            if (binsFound) {
                for (var key in bomItem) {
                    if (key == result.id) {
                        bomEntry['binDetails'] = bomItem[key]
                    }
                }
            }
            bomList.push(bomEntry);
            return true;
        });
        log.debug('bomList',bomList);
        return bomList;
    }

    function getItemThumbnails() {
        var thumbnails = {};
        var thumbnailSearch = search.load({
            id: 'customsearch_bb_itm_thmb_urls'
        });

        var columns = thumbnailSearch.columns;
        var itemIdColumn = {};
        var urlColumn = {};
        columns.forEach(function (column) {
            if (column.label === 'itemInternalId') {
                itemIdColumn = column;
            } else if (column.label === 'url') {
                urlColumn = column;
            }
        });

        thumbnailSearch.run().each(function (result) {
            var itemId = result.getValue(itemIdColumn);
            var url = result.getValue(urlColumn);
            thumbnails[itemId] = url;
        });

        return thumbnails;
    }

    function onRequest(context) {
        var projectId = context.request.parameters.project;
        if (!projectId) {
            throw 'Missing project parameter.';
        }

        var templateFileId = -1;
        var configItems = ['custrecord_bb_bom_rpt_tmplt_file_id_num', 'custrecord_bb_bom_report_restrict_items'];
        var configObj = config.getConfigurations(configItems);
        if (configObj) {
            templateFileId = configObj.custrecord_bb_bom_rpt_tmplt_file_id_num.value;
        }
        if (templateFileId === -1) {
            throw 'Bill of Materials Report Template ID is not set.';
        }
        var domainUrl = url.resolveDomain({
            hostType: url.HostType.FORM
        });
        // check if bin management is enabled
        var isBinEnabled = runtime.isFeatureInEffect({
            feature: 'BINMANAGEMENT'
        });
        //get the location to find the items in bin
        var projectLocationLookUp = search.lookupFields({
            type: 'job',
            id: projectId,
            columns: ['custentity_bb_project_location']
        });

        var project = getProject(projectId);
        project.isBinEnabled=isBinEnabled; // Add isBinEnabled to update the BOM report table structure if Bin Management is enabled
        project.bomList = getBomList(projectId, configObj, projectLocationLookUp,isBinEnabled);
        project.bomList.forEach(function (bom) {
            if (bom.thumbnailUrl && typeof bom.thumbnailUrl.value === 'string' && bom.thumbnailUrl.value.trim().length > 0 && !/^https?:\/\//i.test(bom.thumbnailUrl.value)) {
                bom.thumbnailUrl.value = ['https://', domainUrl, bom.thumbnailUrl.value].join('');
            }
        });
        // var itemThumbnails = getItemThumbnails();
        // project.bomList.forEach(function (bom) {
        //     bom.thumbnailUrl = {
        //         value: itemThumbnails[bom.system_internalId]
        //     };
        // });

        var templateFile = file.load({
            id: templateFileId
        });
        var pdfRender = render.create();
        pdfRender.templateContent = templateFile.getContents();
        pdfRender.addCustomDataSource({
            alias: 'project',
            format: render.DataSource.OBJECT,
            data: project
        });

        context.response.addHeader({
            name: 'Content-Type:',
            value: 'application/pdf'
        });

        context.response.addHeader({
            name: 'Content-Disposition',
            value: 'inline; filename="report.pdf"'
        });
        record.submitFields({
          type: 'job',
          id: projectId,
          values: {
            'custentity_bb_bom_printed_date': new Date(), 
            'custentity_bb_bom_edited' : false
          }
        }); // 5 units
        pdfRender.renderPdfToResponse(context.response);
    }

    return {
        onRequest: onRequest
    };
});

