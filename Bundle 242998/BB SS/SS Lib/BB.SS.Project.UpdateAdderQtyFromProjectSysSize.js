/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Brendan Boyd - Matt Lehman
 * @version 0.1.1
 */

/**
 * Copyright 2017-2018 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */
define(['N/record', 'N/search'],
    function(record, search) {
        var PER_WATT_PRICING = 2;

        function getAddersForProject(scriptContext) {
            try {
                var type = scriptContext.type;
                if (type == scriptContext.UserEventType.DELETE) return;
                var oldProject = scriptContext.oldRecord;
                var oldSystemSize = 0;
                if (type != scriptContext.UserEventType.CREATE) {
                    oldSystemSize = oldProject.getValue({
                        fieldId: 'custentity_bb_system_size_decimal'
                    }) || 0;
                }
                var project = scriptContext.newRecord;
                var systemSize = project.getValue({
                    fieldId: 'custentity_bb_system_size_decimal'
                }) || 0;
                if (systemSize != oldSystemSize) {
                    searchAddersBy(project.id).forEach(function(adderResult) {
                        var recordId = record.submitFields({
                            type: 'customrecord_bb_project_adder',
                            id: adderResult.id,
                            values: {
                                "custrecord_bb_quantity": systemSize * 1000
                            },
                          	options: {
                          		ignoreMandatoryFields: true
                          	}
                        });
                    });
                }
            } catch (error) {
                log.debug('error', error);
            }
        }

        function searchAddersBy(projectId) {
            return search.create({
                type: "customrecord_bb_project_adder",
                filters: [
                    ["custrecord_bb_project_adder_project", "anyof", projectId],
                    "AND",
                    ["custrecord_bb_adder_pricing_method", "anyof", 2] // PER_WATT
                ],
                columns: [
                    search.createColumn({
                        name: "id",
                        sort: search.Sort.ASC
                    }),
                    "custrecord_bb_project_adder_project",
                    "custrecord_bb_adder_item",
                    "custrecord_bb_adder_item_name",
                    "custrecord_bb_adder_responsibility",
                    "custrecord_bb_adder_pricing_method",
                    "custrecord_bb_adder_price_amt",
                    "custrecord_bb_quantity",
                    "custrecord_bb_adder_total_amount",
                    "custrecord_bb_stock_description"
                ]

            }).run().getRange({
                start: 0,
                end: 1000
            });
        }

        return {
            getAddersForProject: getAddersForProject
        };
    });