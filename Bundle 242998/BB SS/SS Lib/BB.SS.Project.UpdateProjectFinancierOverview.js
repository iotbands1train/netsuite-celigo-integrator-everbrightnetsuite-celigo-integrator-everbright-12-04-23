/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Brendan Boyd
 * @version 0.1.3
 * @fileOverview On Project Adder change, update the Project Financier Overview Adder total fields.
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
define(['N/record', 'N/search'],

    function(record, search) {
        var FIXED = 1;
        var PER_WATT = 2;
        var PER_FOOT = 3;
        var PER_MODULE = 4;

        var PAID_BY_INSTALLER = 1;
        var PAID_BY_ORIGINATOR = 2;
        var PAID_BY_ORIGINATOR_TO_INSTALLER = 3;
        var PAID_TO_INSTALLER = 4;
        var PAID_TO_ORIGINATOR = 5;

        var pricingMethods;
        var adderResponsibility;

        /**
         * Function updateProjectFinancier(project, projectDataObj)
         *
         * @param {project} NS Project record - from script context
         * @param {projectDataObj} Project Search Data Object, contains values from Project Search
         * @returns - adder total object
         */
        function updateProjectFinancier(project, projectDataObj) {
            try {
                var systemSize = (project.getValue({fieldId: 'custentity_bb_system_size_decimal'})) ? project.getValue({fieldId: 'custentity_bb_system_size_decimal'}) :
                    ((projectDataObj.custentity_bb_system_size_decimal) ? projectDataObj.custentity_bb_system_size_decimal : 0);
                var adderTotals = getAllAdderTotals(project.id, systemSize);
                return adderTotals;

            } catch (error) {
                log.debug('error', error);
                log.debug('error message', error.message);
                log.debug('error', error.linenumber);
            }
        }

        /**
         * Get the adder total
         * @param {array} adders
         * @returns - the sumed value of an array of adder values
         */
        function totalAdders(adders) {
            return adders.reduce(function(sum, value) {
                return sum + value;
            }, 0);
        }

        function getAdderTotalFromArray(array) {
            if (array.length > 0) {
                var modArray = array.map(function(total) {
                    if (total.adderTotal) {
                        return parseFloat(total.adderTotal);
                    } else {
                        return 0;
                    }
                });
                return modArray;
            } else {
                return [];
            }
        }

        function getPricingMethodAdderRecords(array, pricingMethodId) {
            if (array.length > 0) {
                var modArray = array.filter(function(result) {
                    if (result.pricingMethodId == pricingMethodId) {
                        return result;
                    }
                });

                return modArray;

            } else {
                return [];
            }
        }


        function getResponsibilityAdderRecords(array, responsibilityId1, responsibilityId2) {
            if (array.length > 0) {
                var modArray = array.filter(function(result) {
                    if ((parseInt(result.responsibilityId) != parseInt(responsibilityId1)) && (parseInt(result.responsibilityId) != parseInt(responsibilityId2))) {
                        return result;
                    }
                });

                return modArray;

            } else {
                return [];
            }
        }

        /**
         * Function getAllAdderTotals(projectId, systemSize) - Used to get adder totals per pricing method and return calculated amounts
         * @param {string/integer} projectId
         * @param {decimal} system size
         */

        function getAllAdderTotals(projectId, systemSize) {

            var financierAdderFields = {};
            var originatorAdderFields = {};
            var installerAdderFields = {};

            var adderArray = [];
            if (projectId) {
                var customrecord_bb_project_adderSearchObj = search.create({
                    type: "customrecord_bb_project_adder",
                    filters:
                        [
                            ["custrecord_bb_project_adder_project","anyof", projectId],
                            "AND",
                            ["isinactive","is","F"],
                            "AND",
                            ["custrecord_bb_adder_responsibility", "anyof", "1","2","3","4","5"]
                        ],
                    columns:
                        [
                            "internalid",
                            "custrecord_bb_project_adder_project",
                            "custrecord_bb_adder_item",
                            "custrecord_bb_adder_item_name",
                            "custrecord_bb_adder_responsibility",
                            "custrecord_bb_adder_pricing_method",
                            "custrecord_bb_adder_price_amt",
                            "custrecord_bb_quantity",
                            "custrecord_bb_adder_total_amount"
                        ]
                });
                var searchResultCount = customrecord_bb_project_adderSearchObj.runPaged().count;
                // log.debug("all project adder record count",searchResultCount);
                customrecord_bb_project_adderSearchObj.run().each(function(result){
                    var adderObj = {};

                    adderObj['adderId'] = result.getValue({name: 'internalid'});
                    adderObj['project'] = result.getValue({name: 'custrecord_bb_project_adder_project'});
                    adderObj['adderItem'] = result.getValue({name: 'custrecord_bb_adder_item'});
                    adderObj['adderItemName'] = result.getValue({name: 'custrecord_bb_adder_item_name'});
                    adderObj['responsibilityId'] = result.getValue({name: 'custrecord_bb_adder_responsibility'});
                    adderObj['responsibilityName'] = result.getText({name: 'custrecord_bb_adder_responsibility'});
                    adderObj['pricingMethodId'] = result.getValue({name: 'custrecord_bb_adder_pricing_method'});
                    adderObj['pricingMethodName'] = result.getText({name: 'custrecord_bb_adder_pricing_method'});
                    adderObj['adderAmount'] = result.getValue({name: 'custrecord_bb_adder_price_amt'});
                    adderObj['quantity'] = result.getValue({name: 'custrecord_bb_quantity'});
                    if (adderObj.responsibilityId == PAID_TO_INSTALLER || adderObj.responsibilityId == PAID_TO_ORIGINATOR) {
                        if (result.getValue({name: 'custrecord_bb_adder_total_amount'}) > 0) {
                            adderObj['adderTotal'] = parseFloat(result.getValue({name: 'custrecord_bb_adder_total_amount'})) * -1;
                        } else {
                            adderObj['adderTotal'] = parseFloat(result.getValue({name: 'custrecord_bb_adder_total_amount'}))
                        }
                    } else {
                        adderObj['adderTotal'] = result.getValue({name: 'custrecord_bb_adder_total_amount'});
                    }

                    adderArray.push(adderObj);
                    return true;
                });



                // financier adders
                if (adderArray.length > 0) {
                    // fixed price adder total
                    var financerFixedAdders = getPricingMethodAdderRecords(adderArray, FIXED);
                    if (financerFixedAdders.length > 0) {
                        var finFixedArr = getAdderTotalFromArray(financerFixedAdders);

                        financierAdderFields['fixedAdderTotal'] = totalAdders(finFixedArr);
                    } else {
                        financierAdderFields['fixedAdderTotal'] = 0.00;
                    }

                    // per watt adder total
                    var financerWattAdders = getPricingMethodAdderRecords(adderArray, PER_WATT);
                    if (financerWattAdders.length > 0) {
                        var finWattArr = getAdderTotalFromArray(financerWattAdders);

                        financierAdderFields['perWattAdderTotal'] = totalAdders(finWattArr);
                    } else {
                        financierAdderFields['perWattAdderTotal'] = 0.00;
                    }

                    // per foot adder total
                    var financerFootAdders = getPricingMethodAdderRecords(adderArray, PER_FOOT);
                    if (financerFootAdders.length > 0) {
                        var finFootArr = getAdderTotalFromArray(financerFootAdders);
                        financierAdderFields['perFootAdderTotal'] = totalAdders(finFootArr);
                    } else {
                        financierAdderFields['perFootAdderTotal'] = 0.00;
                    }

                    // per module adder total
                    var financerModuleAdders = getPricingMethodAdderRecords(adderArray, PER_MODULE);
                    if (financerModuleAdders.length > 0) {
                        var finModArr = getAdderTotalFromArray(financerModuleAdders);
                        financierAdderFields['perModuleAdderTotal'] = totalAdders(finModArr);
                    } else {
                        financierAdderFields['perModuleAdderTotal'] = 0.00;
                    }

                } else { // if no adder records found, return 0.00 for each adder type
                    financierAdderFields['fixedAdderTotal'] = 0.00;
                    financierAdderFields['perWattAdderTotal'] = 0.00;
                    financierAdderFields['perFootAdderTotal'] = 0.00;
                    financierAdderFields['perModuleAdderTotal'] = 0.00;
                }


                // all originator adders
                if (adderArray.length > 0) {
                    var originatorAdders = getResponsibilityAdderRecords(adderArray, PAID_BY_INSTALLER, PAID_TO_INSTALLER); //PAID_BY_INSTALLER, PAID_TO_INSTALLER
                    log.debug('originator adders excluded by paid by installer and paid to installer', originatorAdders);
                    if (originatorAdders.length > 0) {

                        // originator fixed adders
                        var origFixedAdders = getPricingMethodAdderRecords(originatorAdders, FIXED);
                        log.debug('fixed adder records', origFixedAdders);
                        if (origFixedAdders.length > 0) {
                            var origFixedArr = getAdderTotalFromArray(origFixedAdders);
                            log.debug('fixed adder records total from total from array', origFixedArr);
                            originatorAdderFields['fixedAdderTotal'] = totalAdders(origFixedArr);
                            log.debug('totalAdder function', totalAdders(origFixedArr));
                        } else {
                            originatorAdderFields['fixedAdderTotal'] = 0.00;
                        }

                        // originator per watt adders
                        var origWattAdders = getPricingMethodAdderRecords(originatorAdders, PER_WATT);
                        if (origWattAdders.length > 0) {
                            var origWattArr = getAdderTotalFromArray(origWattAdders);
                            originatorAdderFields['perWattAdderTotal'] = totalAdders(origWattArr);
                        } else {
                            originatorAdderFields['perWattAdderTotal'] = 0.00;
                        }

                        // originator per foot adders
                        var origFootAdders = getPricingMethodAdderRecords(originatorAdders, PER_FOOT);
                        if (origFootAdders.length > 0) {
                            var origFootArr = getAdderTotalFromArray(origFootAdders);
                            originatorAdderFields['perFootAdderTotal'] = totalAdders(origFootArr);
                        } else {
                            originatorAdderFields['perFootAdderTotal'] = 0.00;
                        }

                        // originator per module adders
                        var origModAdders = getPricingMethodAdderRecords(originatorAdders, PER_MODULE);
                        if (origModAdders.length > 0) {
                            var origModArr = getAdderTotalFromArray(origModAdders);
                            originatorAdderFields['perModuleAdderTotal'] = totalAdders(origModArr);
                        } else {
                            originatorAdderFields['perModuleAdderTotal'] = 0.00;
                        }

                        var origAdderTotal = parseFloat(originatorAdderFields.fixedAdderTotal) + parseFloat(originatorAdderFields.perWattAdderTotal) +
                            parseFloat(originatorAdderFields.perFootAdderTotal) + parseFloat(originatorAdderFields.perModuleAdderTotal);
                        log.debug('originator adder total', origAdderTotal);
                        originatorAdderFields['adderTotal'] = origAdderTotal;
                        if (systemSize > 0 && origAdderTotal > 0) {
                            originatorAdderFields['adderTotalPerWatt'] = parseFloat(origAdderTotal / (parseFloat(systemSize) * 1000)).toFixed(2);
                        } else {
                            originatorAdderFields['adderTotalPerWatt'] = 0.00
                        }

                        log.debug('originator adder total per watt amount', originatorAdderFields.adderTotalPerWatt);

                    } else {
                        originatorAdderFields['fixedAdderTotal'] = 0.00;
                        originatorAdderFields['perWattAdderTotal'] = 0.00;
                        originatorAdderFields['perFootAdderTotal'] = 0.00;
                        originatorAdderFields['perModuleAdderTotal'] = 0.00;
                        originatorAdderFields['adderTotal'] = 0.00;
                        originatorAdderFields['adderTotalPerWatt'] = 0.00;
                    }

                } else {
                    originatorAdderFields['fixedAdderTotal'] = 0.00;
                    originatorAdderFields['perWattAdderTotal'] = 0.00;
                    originatorAdderFields['perFootAdderTotal'] = 0.00;
                    originatorAdderFields['perModuleAdderTotal'] = 0.00;
                    originatorAdderFields['adderTotal'] = 0.00;
                    originatorAdderFields['adderTotalPerWatt'] = 0.00;
                }



                // add installer adders
                if (adderArray.length > 0) {
                    var installerAdders = getResponsibilityAdderRecords(adderArray, PAID_BY_ORIGINATOR, PAID_TO_ORIGINATOR); //PAID_BY_ORIGINATOR, PAID_TO_ORIGINATOR
                    log.emergency('')
                    if (installerAdders.length > 0) {

                        // installer fixed adder totals
                        var installerFixedAdders = getPricingMethodAdderRecords(installerAdders, FIXED);
                        if (installerFixedAdders.length > 0) {
                            var installerFixedArr = getAdderTotalFromArray(installerFixedAdders);
                            installerAdderFields['fixedAdderTotal'] = totalAdders(installerFixedArr);
                        } else {
                            installerAdderFields['fixedAdderTotal'] = 0.00;
                        }

                        // originator per watt adders
                        var installerWattAdders = getPricingMethodAdderRecords(installerAdders, PER_WATT);
                        if (installerWattAdders.length > 0) {
                            var installerWattArr = getAdderTotalFromArray(installerWattAdders);
                            installerAdderFields['perWattAdderTotal'] = totalAdders(installerWattArr);
                        } else {
                            installerAdderFields['perWattAdderTotal'] = 0.00;
                        }

                        // installer per foot adders
                        var installerFootAdders = getPricingMethodAdderRecords(installerAdders, PER_FOOT);
                        if (installerFootAdders.length > 0) {
                            var installerFootArr = getAdderTotalFromArray(installerFootAdders);
                            installerAdderFields['perFootAdderTotal'] = totalAdders(installerFootArr);
                        } else {
                            installerAdderFields['perFootAdderTotal'] = 0.00;
                        }

                        // originator per module adders
                        var installerModAdders = getPricingMethodAdderRecords(installerAdders, PER_MODULE);
                        if (installerModAdders.length > 0) {
                            var installerModArr = getAdderTotalFromArray(installerModAdders);
                            installerAdderFields['perModuleAdderTotal'] = totalAdders(installerModArr);
                        } else {
                            installerAdderFields['perModuleAdderTotal'] = 0.00;
                        }


                        var installerAdderTotal = installerAdderFields.fixedAdderTotal + installerAdderFields.perWattAdderTotal + installerAdderFields.perFootAdderTotal + installerAdderFields.perModuleAdderTotal;
                        installerAdderFields['adderTotal'] = installerAdderTotal;
                        if (systemSize > 0 && installerAdderTotal > 0) {
                            installerAdderFields['adderTotalPerWatt'] = parseFloat(installerAdderTotal / (systemSize * 1000)).toFixed(2);
                        } else {
                            installerAdderFields['adderTotalPerWatt'] = 0.00;
                        }

                    } else {
                        installerAdderFields['fixedAdderTotal'] = 0.00;
                        installerAdderFields['perWattAdderTotal'] = 0.00;
                        installerAdderFields['perFootAdderTotal'] = 0.00;
                        installerAdderFields['perModuleAdderTotal'] = 0.00;
                        installerAdderFields['adderTotal'] = 0.00;
                        installerAdderFields['adderTotalPerWatt'] = 0.00;
                    }
                } else {
                    installerAdderFields['fixedAdderTotal'] = 0.00;
                    installerAdderFields['perWattAdderTotal'] = 0.00;
                    installerAdderFields['perFootAdderTotal'] = 0.00;
                    installerAdderFields['perModuleAdderTotal'] = 0.00;
                    installerAdderFields['adderTotal'] = 0.00;
                    installerAdderFields['adderTotalPerWatt'] = 0.00;
                }

                // log.debug('financierAdderFields', financierAdderFields);
                // log.debug('originatorAdderFields', originatorAdderFields);
                // log.debug('installerAdderFields', installerAdderFields);

                return {
                    financierAdderFields: financierAdderFields,
                    originatorAdderFields: originatorAdderFields,
                    installerAdderFields: installerAdderFields
                }

            }// end of project id check

        }

        /**
         * Function getTemplateAdderItemDetails(projectId) - Used to get payment memo line data for adders by type
         * @param {string} projectId
         */
        function getTemplateAdderItemDetails(projectId) {
            var adderObject = {};
            var finFixedAdders = [];
            var finPerWattAdders = [];
            var finPerFootAdders = [];
            var finPerModAdders = [];
            var origFixedAdders = [];
            var origPerWattAdders = [];
            var origPerFootAdders = [];
            var origPerModAdders = [];
            var installFixedAdders = [];
            var installPerWattAdders = [];
            var installPerFootAdders = [];
            var installPerModAdders = [];

            if (projectId) {
                var customrecord_bb_project_adderSearchObj = search.create({
                    type: "customrecord_bb_project_adder",
                    filters:
                        [
                            ["custrecord_bb_project_adder_project","anyof", projectId],
                            "AND",
                            ["isinactive","is","F"],
                            "AND",
                            ["custrecord_bb_adder_responsibility", "anyof", "1","2","3","4","5"]
                        ],
                    columns:
                        [
                            "internalid",
                            "custrecord_bb_project_adder_project",
                            "custrecord_bb_adder_item",
                            "custrecord_bb_adder_item_name",
                            "custrecord_bb_adder_responsibility",
                            "custrecord_bb_adder_pricing_method",
                            "custrecord_bb_adder_price_amt",
                            "custrecord_bb_quantity",
                            "custrecord_bb_adder_total_amount"
                        ]
                });
                var searchResultCount = customrecord_bb_project_adderSearchObj.runPaged().count;
                // log.debug("all project adder record count",searchResultCount);
                customrecord_bb_project_adderSearchObj.run().each(function(result){
                    var adderObj = {};

                    adderObj['custrecord_bb_adder_item'] = result.getText({name: 'custrecord_bb_adder_item'});
                    adderObj['responsibilityId'] = result.getValue({name: 'custrecord_bb_adder_responsibility'});
                    adderObj['pricingMethodId'] = result.getValue({name: 'custrecord_bb_adder_pricing_method'});
                    adderObj['custrecord_bb_adder_price_amt'] = result.getValue({name: 'custrecord_bb_adder_price_amt'});
                    adderObj['custrecord_bb_quantity'] = result.getValue({name: 'custrecord_bb_quantity'});
                    adderObj['custrecord_bb_adder_total_amount'] = result.getValue({name: 'custrecord_bb_adder_total_amount'});
                    // fin adders
                    if (adderObj.pricingMethodId == FIXED) {
                        finFixedAdders.push({
                            custrecord_bb_adder_item: adderObj.custrecord_bb_adder_item,
                            custrecord_bb_adder_price_amt: adderObj.custrecord_bb_adder_price_amt,
                            custrecord_bb_quantity: adderObj.custrecord_bb_quantity,
                            "custrecord_bb_adder_total_amount": adderObj.custrecord_bb_adder_total_amount
                        });
                    }
                    if (adderObj.pricingMethodId == PER_WATT) {
                        finPerWattAdders.push({
                            custrecord_bb_adder_item: adderObj.custrecord_bb_adder_item,
                            custrecord_bb_adder_price_amt: adderObj.custrecord_bb_adder_price_amt,
                            custrecord_bb_quantity: adderObj.custrecord_bb_quantity,
                            custrecord_bb_adder_total_amount: adderObj.custrecord_bb_adder_total_amount
                        });
                    }
                    if (adderObj.pricingMethodId == PER_FOOT) {
                        finPerFootAdders.push({
                            custrecord_bb_adder_item: adderObj.custrecord_bb_adder_item,
                            custrecord_bb_adder_price_amt: adderObj.custrecord_bb_adder_price_amt,
                            custrecord_bb_quantity: adderObj.custrecord_bb_quantity,
                            custrecord_bb_adder_total_amount: adderObj.custrecord_bb_adder_total_amount
                        });
                    }
                    if (adderObj.pricingMehthodId == PER_MODULE) {
                        finPerModAdders.push({
                            custrecord_bb_adder_item: adderObj.custrecord_bb_adder_item,
                            custrecord_bb_adder_price_amt: adderObj.custrecord_bb_adder_price_amt,
                            custrecord_bb_quantity: adderObj.custrecord_bb_quantity,
                            custrecord_bb_adder_total_amount: adderObj.custrecord_bb_adder_total_amount
                        });
                    }

                    // originator adders
                    if (adderObj.pricingMethodId == FIXED && (adderObj.responsibilityId != PAID_BY_INSTALLER || adderObj.responsibilityId != PAID_TO_INSTALLER)) {
                        var adderFixedTotal = (adderObj.responsibilityId == PAID_TO_ORIGINATOR) ? ((adderObj.custrecord_bb_adder_total_amount > 0) ? parseFloat(adderObj.custrecord_bb_adder_total_amount) * -1 :  adderObj.custrecord_bb_adder_total_amount) : adderObj.custrecord_bb_adder_total_amount;
                        origFixedAdders.push({
                            custrecord_bb_adder_item: adderObj.custrecord_bb_adder_item,
                            custrecord_bb_adder_price_amt: adderObj.custrecord_bb_adder_price_amt,
                            custrecord_bb_quantity: adderObj.custrecord_bb_quantity,
                            custrecord_bb_adder_total_amount: adderFixedTotal
                        });
                    }
                    if (adderObj.pricingMethodId == PER_WATT && (adderObj.responsibilityId != PAID_BY_INSTALLER || adderObj.responsibilityId != PAID_TO_INSTALLER)) {
                        var adderWattTotal = (adderObj.responsibilityId == PAID_TO_ORIGINATOR) ? ((adderObj.custrecord_bb_adder_total_amount > 0) ? parseFloat(adderObj.custrecord_bb_adder_total_amount) * -1 :  adderObj.custrecord_bb_adder_total_amount) : adderObj.custrecord_bb_adder_total_amount;
                        origPerWattAdders.push({
                            custrecord_bb_adder_item: adderObj.custrecord_bb_adder_item,
                            custrecord_bb_adder_price_amt: adderObj.custrecord_bb_adder_price_amt,
                            custrecord_bb_quantity: adderObj.custrecord_bb_quantity,
                            custrecord_bb_adder_total_amount: adderWattTotal
                        });
                    }
                    if (adderObj.pricingMethodId == PER_FOOT && (adderObj.responsibilityId != PAID_BY_INSTALLER || adderObj.responsibilityId != PAID_TO_INSTALLER)) {
                        var adderFootTotal = (adderObj.responsibilityId == PAID_TO_ORIGINATOR) ? ((adderObj.custrecord_bb_adder_total_amount > 0) ? parseFloat(adderObj.custrecord_bb_adder_total_amount) * -1 :  adderObj.custrecord_bb_adder_total_amount) : adderObj.custrecord_bb_adder_total_amount;
                        origPerFootAdders.push({
                            custrecord_bb_adder_item: adderObj.custrecord_bb_adder_item,
                            custrecord_bb_adder_price_amt: adderObj.custrecord_bb_adder_price_amt,
                            custrecord_bb_quantity: adderObj.custrecord_bb_quantity,
                            custrecord_bb_adder_total_amount: adderFootTotal
                        });
                    }
                    if (adderObj.pricingMethodId == PER_MODULE && (adderObj.responsibilityId != PAID_BY_INSTALLER || adderObj.responsibilityId != PAID_TO_INSTALLER)) {
                        var adderModuleTotal = (adderObj.responsibilityId == PAID_TO_ORIGINATOR) ? ((adderObj.custrecord_bb_adder_total_amount > 0) ? parseFloat(adderObj.custrecord_bb_adder_total_amount) * -1 :  adderObj.custrecord_bb_adder_total_amount) : adderObj.custrecord_bb_adder_total_amount;
                        origPerModAdders.push({
                            custrecord_bb_adder_item: adderObj.custrecord_bb_adder_item,
                            custrecord_bb_adder_price_amt: adderObj.custrecord_bb_adder_price_amt,
                            custrecord_bb_quantity: adderObj.custrecord_bb_quantity,
                            custrecord_bb_adder_total_amount: adderModuleTotal
                        });
                    }

                    //installer adders
                    if (adderObj.pricingMethodId == FIXED && (adderObj.responsibilityId != PAID_BY_ORIGINATOR || adderObj.responsibilityId != PAID_TO_ORIGINATOR)) {
                        var installFixedTotal =  (adderObj.responsibilityId == PAID_TO_INSTALLER) ? ((adderObj.custrecord_bb_adder_total_amount > 0) ? parseFloat(adderObj.custrecord_bb_adder_total_amount) * -1 :  adderObj.custrecord_bb_adder_total_amount) :
                            ((adderObj.responsibilityId == PAID_BY_ORIGINATOR_TO_INSTALLER) ? parseFloat(adderObj.custrecord_bb_adder_total_amount) * -1 : adderObj.custrecord_bb_adder_total_amount);
                        installFixedAdders.push({
                            custrecord_bb_adder_item: adderObj.custrecord_bb_adder_item,
                            custrecord_bb_adder_price_amt: adderObj.custrecord_bb_adder_price_amt,
                            custrecord_bb_quantity: adderObj.custrecord_bb_quantity,
                            custrecord_bb_adder_total_amount: installFixedTotal
                        });
                    }
                    if (adderObj.pricingMethodId == PER_WATT && (adderObj.responsibilityId != PAID_BY_ORIGINATOR || adderObj.responsibilityId != PAID_TO_ORIGINATOR)) {
                        var installWattTotal =  (adderObj.responsibilityId == PAID_TO_INSTALLER) ? ((adderObj.custrecord_bb_adder_total_amount > 0) ? parseFloat(adderObj.custrecord_bb_adder_total_amount) * -1 :  adderObj.custrecord_bb_adder_total_amount) :
                            ((adderObj.responsibilityId == PAID_BY_ORIGINATOR_TO_INSTALLER) ? parseFloat(adderObj.custrecord_bb_adder_total_amount) * -1 : adderObj.custrecord_bb_adder_total_amount);
                        installPerWattAdders.push({
                            custrecord_bb_adder_item: adderObj.custrecord_bb_adder_item,
                            custrecord_bb_adder_price_amt: adderObj.custrecord_bb_adder_price_amt,
                            custrecord_bb_quantity: adderObj.custrecord_bb_quantity,
                            custrecord_bb_adder_total_amount: installWattTotal
                        });
                    }
                    if (adderObj.pricingMethodId == PER_FOOT && (adderObj.responsibilityId != PAID_BY_ORIGINATOR || adderObj.responsibilityId != PAID_TO_ORIGINATOR)) {
                        var installFootTotal =  (adderObj.responsibilityId == PAID_TO_INSTALLER) ? ((adderObj.custrecord_bb_adder_total_amount > 0) ? parseFloat(adderObj.custrecord_bb_adder_total_amount) * -1 :  adderObj.custrecord_bb_adder_total_amount) :
                            ((adderObj.responsibilityId == PAID_BY_ORIGINATOR_TO_INSTALLER) ? parseFloat(adderObj.custrecord_bb_adder_total_amount) * -1 : adderObj.custrecord_bb_adder_total_amount);
                        installPerFootAdders.push({
                            custrecord_bb_adder_item: adderObj.custrecord_bb_adder_item,
                            custrecord_bb_adder_price_amt: adderObj.custrecord_bb_adder_price_amt,
                            custrecord_bb_quantity: adderObj.custrecord_bb_quantity,
                            custrecord_bb_adder_total_amount: installFootTotal
                        });
                    }
                    if (adderObj.pricingMethodId == PER_MODULE && (adderObj.responsibilityId != PAID_BY_ORIGINATOR || adderObj.responsibilityId != PAID_TO_ORIGINATOR)) {
                        var installModuleTotal =  (adderObj.responsibilityId == PAID_TO_INSTALLER) ? parseFloat(adderObj.custrecord_bb_adder_total_amount) * -1 :
                            ((adderObj.responsibilityId == PAID_BY_ORIGINATOR_TO_INSTALLER) ? parseFloat(adderObj.custrecord_bb_adder_total_amount) * -1 : adderObj.custrecord_bb_adder_total_amount);
                        installPerModAdders.push({
                            custrecord_bb_adder_item: adderObj.custrecord_bb_adder_item,
                            custrecord_bb_adder_price_amt: adderObj.custrecord_bb_adder_price_amt,
                            custrecord_bb_quantity: adderObj.custrecord_bb_quantity,
                            custrecord_bb_adder_total_amount: installModuleTotal
                        });
                    }

                    return true;
                });

                adderObject['finFixedAdders'] = finFixedAdders;
                adderObject['finPerWattAdders'] = finPerWattAdders;
                adderObject['finPerFootAdders'] = finPerFootAdders;
                adderObject['finPerModAdders'] = finPerModAdders;
                adderObject['origFixedAdders'] = origFixedAdders;
                adderObject['origPerWattAdders'] = origPerWattAdders;
                adderObject['origPerFootAdders'] = origPerFootAdders;
                adderObject['origPerModAdders'] = origPerModAdders;
                adderObject['installFixedAdders'] = installFixedAdders;
                adderObject['installPerWattAdders'] = installPerWattAdders;
                adderObject['installPerFootAdders'] = installPerFootAdders;
                adderObject['installPerModAdders'] = installPerModAdders;

                return adderObject;

            } // end of project id check
        }

        return {
            updateProjectFinancier: updateProjectFinancier,
            getTemplateAdderItemDetails: getTemplateAdderItemDetails
        };
    });