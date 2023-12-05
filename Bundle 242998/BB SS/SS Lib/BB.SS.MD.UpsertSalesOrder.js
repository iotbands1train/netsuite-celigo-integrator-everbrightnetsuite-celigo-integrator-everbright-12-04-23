/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Tyler Mann
 * @version 0.1.5 
 * @fileOverview This Custom Module library is used by both the BOM and Adder UpsertSalesOrder
 * to consolidate several key function for both scripts to UpsertSalesOrders
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

define(['N/record', 'N/search', 'N/runtime', './BB_SS_MD_SolarConfig'], function(record, search, runtime, solarConfig) {

        /**
         * Loads the Sales Order based on custom SO field.
         *
         * @param project - NS record object for the project
         * @param insertLine - boolean. If we are inserting it is true, if update then false.
         * This is needed to drive whether the record is dynamic or not.
         * @returns - NS record object for salesOrder.
         * If custom SO field is blank, returns null
         */
        function getSalesOrder(project, salesOrderId) {
            var salesOrder = null;
            var soID = searchProjectSalesOrder(project.id);
            if (soID) {
                var projectState = project.getText({fieldId: 'custentity_bb_install_state'});
                log.debug('Project State value in get sales order function', projectState);
                var customer = '';
                var financier = project.getValue({fieldId: 'custentity_bb_financier_customer'});
                if (financier) {
                    customer = financier;
                } else {
                    customer = project.getValue({fieldId: 'parent'});
                }
                log.debug('sales order id', soID);
                salesOrder = record.load({
                    type: record.Type.SALES_ORDER,
                    id: soID,
                    isDynamic: true
                });
                var shipToAddress = getProjectAddress(project);
                salesOrder = setAddress(salesOrder, shipToAddress, project);
            }
            return salesOrder;
        }

        /**
         * Called if salesOrder does not exist, then create the header of the salesOrder
         * based on values from the project.
         *
         * @param project - NS record object for the project
         * @returns - NS record object for salesOrder
         */
        function createSalesOrderHeader(project, solarSalesItems) {
            var config = record.load({type: 'customrecord_bb_solar_success_configurtn', id: 1});

            //set needed data on Sales Order
            var projectState = project.getText({fieldId: 'custentity_bb_install_state'});
            log.debug('Project State value in create sales order header', projectState);
            var customer;
            var financier = project.getValue({fieldId: 'custentity_bb_financier_customer'});
            log.debug('financier value', financier);
            if (financier) {
                customer = financier;
            } else {
                customer = project.getValue({fieldId: 'parent'});
            }
            log.debug('customer id', customer);

            var _defaultValues = {
                entity: customer
            };

            var salesOrder = record.create({
                type: record.Type.SALES_ORDER,
                isDynamic: true,
                defaultValues: _defaultValues
            });

            if (config.getValue({fieldId: 'custrecord_bb_ss_has_subsidiaries'})) {
                var subsid = project.getValue({
                    fieldId: 'subsidiary'
                });
                salesOrder.setValue({
                    fieldId: 'subsidiary',
                    value: subsid
                });
                var location = getLocation(project, config);
                log.debug('Location', location);
                salesOrder.setValue({
                    fieldId: 'location',
                    value: location
                });
            }

            var orderDate = new Date();
            salesOrder.setValue({
                fieldId: 'trandate',
                value: orderDate
            });

            return updateSalesOrderHeader(project, salesOrder, solarSalesItems, config);
        }

       /**
        * Updates the sales order header of an existing order from a project.
        * @param {Record} project
        * @param {Record} salesOrder
        * @return {Record} salesOrder
        */
        function updateSalesOrderHeader(project, salesOrder, solarSalesItems, config){
            //get needed data from Project
            //var customer = project.getValue('parent');
            var currentLocation = project.getValue({fieldId: 'custentity_bb_project_location'});
            
            var location = (currentLocation) ? currentLocation : getLocation(project, config);
            var shipToAddress = getProjectAddress(project);
            salesOrder = setAddress(salesOrder, shipToAddress, project);
            salesOrder.setValue({
                fieldId: 'location',
                value: location
            });
            salesOrder.setValue({
                fieldId: 'custbody_bb_project',
                value: project.id
            });

            //var solarSalesItems = getSolarConfigSalesItems();
            upsertSolarSalesItems(project, salesOrder, solarSalesItems);

            var shipmentId = solarSalesItems.shipmentId;
            if (shipmentId) {
                salesOrder.setValue({ // 2 = Shipment milestone
                    fieldId: 'custbody_bb_milestone',
                    value: shipmentId
                });
            }
            return salesOrder;
        }

        /**
         * Returns the internal ID of the proper location based on the project Type (EPC vs non-EPC)
         *
         * @param project - NS record object for the project
         * @returns - valid location ID based on project Type
         */


        function getLocation(project, config) {
            if (config.getValue({fieldId: 'custrecord_bb_ss_has_subsidiaries'})) {
                var subsid = project.getValue('subsidiary');

                var preferredLocation;

                var locationSearchObj = search.create({
                    type: "location",
                    filters:
                    [
                        ["custrecord_bb_preferred_location","is","T"], 
                        "AND", 
                        ["subsidiary","anyof",subsid]
                    ],
                    columns:
                    [
                        "internalid",
                        search.createColumn({
                             name: "name",
                             sort: search.Sort.ASC
                        }),
                        "custrecord_bb_project_location_type",
                        "subsidiary"
                    ]
                });
            } else {
                var locationSearchObj = search.create({
                    type: "location",
                    filters:
                    [
                        ["custrecord_bb_preferred_location","is","T"]
                    ],
                    columns:
                    [
                        "internalid",
                        search.createColumn({
                             name: "name",
                             sort: search.Sort.ASC
                        }),
                        "custrecord_bb_project_location_type",
                    ]
                });
            }
            var projectType = project.getText('jobtype');

            try{
                // check if there are subsidiaries for this account
                var searchResultCount = locationSearchObj.runPaged().count;
            } catch(e){
                log.audit(e.name,e.message);
                log.debug('No subsidiaries for this account','or location search has other problems');
                var locationSearchObj = search.create({
                    type: "location",
                    filters:
                        [
                            ["custrecord_bb_preferred_location","is","T"]
                        ],
                    columns:
                        [
                            "internalid",
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC
                            }),
                            "custrecord_bb_project_location_type"
                        ]
                });
                var searchResultCount = locationSearchObj.runPaged().count;
            }
            log.debug("locationSearchObj result count",searchResultCount);
            locationSearchObj.run().each(function(result){
                var locType = result.getText({name: 'custrecord_bb_project_location_type'});
                var locId = result.getValue({name: 'internalid'});
                if (locType == projectType) {
                    preferredLocation = locId;
                } else {
                    log.error('There is no preferred location set for subsidiary ' + subsid + ' and projectType ' +  projectType + ' \n  Please contact your administrator to setup a preferred location for this subsidiary');
                }

                return true;
            });
            
            return preferredLocation;

        }
        /**
         * Use the Equipment Fulfillment Package Address if not empty
         * If the Equipment Fulfillment Package Address is empty, use the Project Installation address
         *
         * @param project - NS record object for the project
         * @returns JS object for an address
         */
        function getProjectAddress(project) {
            var address1;
            var address2;
            var address3 = ''; //here for future scalability for international
            var city;
            var state;
            var zip;
            var country = 'US';
            var attention = '';
            var addressee = '';

            address1 = project.getValue('custentity_bb_ship_address_1_text');
            //if Equipment Fulfillment Package Address is not empty, use that
            if (address1) {
                address2 = project.getValue('custentity_bb_ship_address_2_text');
                city = project.getValue('custentity_bb_ship_city_text');
                state = project.getText('custentity_bb_ship_state');
                log.debug('shipping state in address function', state);
                zip = project.getValue('custentity_bb_ship_zip_text');
                //              country = project.getValue(''); //here for future scalability for international. Just add new field ID
            } else { //else use Project Installation address
                address1 = project.getValue('custentity_bb_install_address_1_text');
                address2 = project.getValue('custentity_bb_install_address_2_text');
                city = project.getValue('custentity_bb_install_city_text');
                state = project.getText('custentity_bb_install_state');
                zip = project.getValue('custentity_bb_install_zip_code_text');
                log.debug('Project State in address function', state);
                //country = project.getValue(''); //here for future scalability for international. Just add new field ID
            }

            return {
                //attention: attention,
                //addressee: addressee,
                address1: address1,
                address2: address2,
                address3: address3,
                city: city,
                state: state,
                zip: zip,
                country: country
            };
        }

        function setAddress(salesOrder, shipToAddress, project){
			var logTitle = 'upsertSO - setAddress';
			log.debug(logTitle+ 'shipToAddress: ', shipToAddress);
            //set ship to address
            var addrText = project.getValue({fieldId: 'custentity_bb_proj_address_text'});

            var addressRecord = salesOrder.getSubrecord({
                fieldId: 'shippingaddress'
            });

            // addressRecord.setValue({
            //     fieldId: 'country',
            //     value: shipToAddress.country
            // });
            addressRecord.setValue({
                fieldId: 'addr1',
                value: shipToAddress.address1
            });
            addressRecord.setValue({
                fieldId: 'addr2',
                value: shipToAddress.address2
            });
            addressRecord.setValue({
                fieldId: 'addr3',
                value: shipToAddress.address3
            });
            addressRecord.setValue({
                fieldId: 'city',
                value: shipToAddress.city
            });
            addressRecord.setValue({
                fieldId: 'state',
                value: shipToAddress.state
            });
            addressRecord.setValue({
                fieldId: 'zip',
                value: shipToAddress.zip
            });
            salesOrder.setValue({
                fieldId: 'shipaddress',
                value: addrText
            });
 
            return salesOrder;
        }

        /**
         * findLineIndex is built to work for either a project BOM or project Adder
         * When a BOM or Adder is created, it sets the same field with the internal id of the record.
         * This code loops over the SO lines and looks for a match with the current ID and that custom field.
         *
         * @param salesOrder - NS Record object for the Sales Order related to the Project BOM
         * or Project Ader
         * @param projectBOMAdder - NS record object for the Project BOM or Project Adder
         * @returns SO line index, 0 based, that the BOM or Adder is tied to. Returns -1 if not found
         */
        function findLineIndex(salesOrder, projectBOMAdder) {
            if (isNotNull(salesOrder)) {
                var projectBOMAdderId = projectBOMAdder.id;
                if (typeof projectBOMAdderId == 'number') {
                    var BOMId = projectBOMAdder.id.toFixed(0); 
                } else {
                    var BOMId = projectBOMAdder.id;
                }

                var foundProjectBomId = salesOrder.findSublistLineWithValue({
                    sublistId: 'item',
                    fieldId: 'custcol_bb_adder_bom_id', 
                    value: parseInt(BOMId)
                });

                return foundProjectBomId;
  
            }
            return -1;
        }

        function getSolarConfigSalesItems() { 
            var siteAuditItem;
            var systemDesignItem;
            var installationItem;
            var inspectionItem;
            var originatorItem;
            var shippingItem;
            var warrantyItem;
            var shipmentId;

            var configItems = ['custrecord_bb_site_audit_item', 'custrecord_bb_system_design_item', 'custrecord_bb_installation_item', 'custrecord_bb_inspection_item', 
                  'custrecord_bb_def_res_instl_amt_per_watt', 'custrecord_bb_originator_item', 'custrecord_bb_shipping_cost_percent', 'custrecord_bb_warranty_reserv_proj_perct', 
                  'custrecord_bb_shipping_item', 'custrecord_bb_warranty_reserve_item', 'custrecord_bb_shipment_milestone_list', 'custrecord_bb_def_res_instl_amt_per_watt',
                  'custrecord_bb_def_com_instl_amt_per_watt','custrecord_bb_def_utl_instl_amt_per_watt'];

            var solarConfigItems = solarConfig.getConfigurations(configItems);
            if (solarConfigItems) {
                if (solarConfigItems['custrecord_bb_site_audit_item']) {
                    siteAuditItem = {
                        siteAuditId: solarConfigItems['custrecord_bb_site_audit_item'].value,
                        siteAuditName: solarConfigItems['custrecord_bb_site_audit_item'].text
                    };
                }
                if (solarConfigItems['custrecord_bb_system_design_item']) {
                    systemDesignItem = {
                        systemDesignId: solarConfigItems['custrecord_bb_system_design_item'].value,
                        systemDesignName: solarConfigItems['custrecord_bb_system_design_item'].text
                    };
                }
                if (solarConfigItems['custrecord_bb_installation_item']) {
                    installationItem = {
                        installItemId: solarConfigItems['custrecord_bb_installation_item'].value,
                        installItemName: solarConfigItems['custrecord_bb_installation_item'].text,
                        defaultPerWatt: .19, // .19 is the current default per watt amount
                        defaultResidential: solarConfigItems['custrecord_bb_def_res_instl_amt_per_watt'].value,
                        defaultCommercial: solarConfigItems['custrecord_bb_def_com_instl_amt_per_watt'].value,
                        defaultUtility: solarConfigItems['custrecord_bb_def_res_instl_amt_per_watt'].value
                    };
                }
                if (solarConfigItems['custrecord_bb_inspection_item']) {
                    inspectionItem = {
                        inspectionItemId: solarConfigItems['custrecord_bb_inspection_item'].value,
                        inspectionItemName: solarConfigItems['custrecord_bb_inspection_item'].text
                    };
                }
                if (solarConfigItems['custrecord_bb_originator_item']) {
                    originatorItem = {
                        originatorItemId: solarConfigItems['custrecord_bb_originator_item'].value,
                        originatorItemName: solarConfigItems['custrecord_bb_originator_item'].text,
                    };
                }
                // Need validation on these 2 fields to be set on the sales order
                if (solarConfigItems['custrecord_bb_shipping_item']) {
                    shippingItem = {
                        shippingItemId: solarConfigItems['custrecord_bb_shipping_item'].value,
                        shippingItemName: solarConfigItems['custrecord_bb_shipping_item'].text,
                        shippingPercent: solarConfigItems['custrecord_bb_shipping_cost_percent'].value || .03
                    };
                }
                if (solarConfigItems['custrecord_bb_warranty_reserve_item']) {
                    warrantyItem = {
                        warrantyItemId: solarConfigItems['custrecord_bb_warranty_reserve_item'].value,
                        warrantyItemName: solarConfigItems['custrecord_bb_warranty_reserve_item'].text,
                        warrantyPercent: solarConfigItems['custrecord_bb_warranty_reserv_proj_perct'].value || .01
                    };
                }
                if (solarConfigItems['custrecord_bb_shipment_milestone_list']) {
                    shipmentId = solarConfigItems.custrecord_bb_shipment_milestone_list.value;
                }

            } else {
                log.error('ERROR', 'An error has occured when trying to access the fields from the solar configuration record.');
            }
                return {
                    siteAuditItem: siteAuditItem,
                    systemDesignItem: systemDesignItem,
                    installationItem: installationItem,
                    inspectionItem: inspectionItem,
                    originatorItem: originatorItem,
                    shippingItem: shippingItem,
                    warrantyItem: warrantyItem,
                    shipmentId: shipmentId
                };

        }

        function upsertSolarSalesItems(project, salesOrder, solarSalesItems) {
            upsertSiteAuditItem(project, salesOrder, solarSalesItems);
            upsertSystemDesignItem(project, salesOrder, solarSalesItems);
            upsertInstallItem(project, salesOrder, solarSalesItems);
            upsertInspectionItem(project, salesOrder, solarSalesItems);
            upsertWarrantyItem(project, salesOrder, solarSalesItems);
            upsertOriginatorItem(project, salesOrder, solarSalesItems);

        }

        function upsertSiteAuditItem(project, salesOrder, solarSalesItems) {
            if (solarSalesItems.siteAuditItem.siteAuditId) {
                var itemId = solarSalesItems.siteAuditItem.siteAuditId;

                var siteAuditVendor = project.getValue({
                    fieldId: 'custentity_bb_site_audit_vendor'
                });
                var siteAuditAmt = project.getValue({
                    fieldId: 'custentity_bb_site_audit_amount'
                });
                var lineId = salesOrder.findSublistLineWithValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: itemId
                });
                var rate = siteAuditAmt;
                var qty = 1;
                if (siteAuditVendor && siteAuditAmt > 0) {
                    if (lineId != -1) {
                        var poId = getPurchaseOrderId(salesOrder, lineId);
                        updateSOLine(salesOrder, itemId, qty, rate, lineId);
                        upsertVendorPO(salesOrder, siteAuditVendor, itemId, qty, rate, project, 1, 'Site Audit', poId);
                    } else {
                        var poId = upsertVendorPO(salesOrder, siteAuditVendor, itemId, qty, rate, project, 1, 'Site Audit', null);
                        addSOLine(salesOrder, itemId, qty, rate, poId);
                    }
                } 
                if (lineId != -1 && !siteAuditVendor) {
                    removeSOLine(salesOrder,  itemId);
                } 
                if (lineId != -1 && siteAuditVendor && !siteAuditAmt) {
                    removeSOLine(salesOrder,  itemId);
                }

            }

        }

        function upsertSystemDesignItem(project, salesOrder, solarSalesItems) {
            if (solarSalesItems.systemDesignItem.systemDesignId) {
                var itemId = solarSalesItems.systemDesignItem.systemDesignId;

                var sysDesignVendor = project.getValue({
                    fieldId: 'custentity_bb_design_partner_vendor'
                });
                var sysDesignAmt = project.getValue({
                    fieldId: 'custentity_bb_design_amount'
                });
                var lineId = salesOrder.findSublistLineWithValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: itemId
                });
                var rate = sysDesignAmt;
                var qty  =1;
                if (sysDesignVendor && sysDesignAmt > 0) {
                    if (lineId != -1) {
                        var poId = getPurchaseOrderId(salesOrder, lineId);
                        updateSOLine(salesOrder, itemId, qty, rate, lineId);
                        upsertVendorPO(salesOrder, sysDesignVendor, itemId, qty, rate, project, 1, 'System Design', poId);
                    } else {
                        var poId = upsertVendorPO(salesOrder, sysDesignVendor, itemId, qty, rate, project, 1, 'System Design', null);
                        addSOLine(salesOrder, itemId, qty, rate, poId); 
                    }
                }
                if (lineId != -1 && !sysDesignVendor) { 
                    removeSOLine(salesOrder,  itemId);    
                } 
                if (lineId != -1 && sysDesignVendor && !sysDesignAmt) {
                    removeSOLine(salesOrder,  itemId);
                }

            }

        }

        function upsertInstallItem(project, salesOrder, solarSalesItems) {  
            if (solarSalesItems.installationItem.installItemId) {
                var itemId = solarSalesItems.installationItem.installItemId;
                //var defaultWattAmt = solarSalesItems.installationItem.defaultPerWatt;

                var subContractorVendor = project.getValue({
                    fieldId: 'custentity_bb_installer_partner_vendor'
                });
                var subContractorTotalPayment = project.getValue({
                    fieldId: 'custentity_bb_installer_total_pay_amt'
                });
                var lineId = salesOrder.findSublistLineWithValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: itemId
                });
                var sysSize = project.getValue({
                    fieldId: 'custentity_bb_system_size_decimal'
                });
                if (subContractorVendor && subContractorTotalPayment > 0) {
                    var qty = 1;
                    var rate = subContractorTotalPayment;
                    if (lineId != -1) {
                        //var poId = getPurchaseOrderId(salesOrder, lineId);
                        updateSOLine(salesOrder, itemId, qty, rate, lineId);
                        //upsertVendorPO(salesOrder, subContractorVendor, itemId, qty, rate, project, 3, 'Site Installation', poId);
                    } else {
                        //var poId = upsertVendorPO(salesOrder, subContractorVendor, itemId, qty, rate, project, 3, 'Site Installation', null);
                        addSOLine(salesOrder, itemId, qty, rate, null);
                    }
                }
                if (!subContractorVendor || !subContractorTotalPayment) {
                    var marketSegment = project.getText({
                        fieldId: 'custentity_bb_market_segment'
                    });
                    var defaultWattAmt = getDefaultInstalltionAmount(marketSegment, solarSalesItems);
                    log.debug('system size', sysSize);
                    var qty = (sysSize * 1000);
                    var rate = defaultWattAmt;
                    if (lineId != -1) {
                        updateSOLine(salesOrder, itemId, qty, rate, lineId);
                    } else {
                        addSOLine(salesOrder, itemId, qty, rate);
                    }
                }
            }
            
        }

        function getDefaultInstalltionAmount(marketSegment, solarSalesItems) {
                switch (marketSegment) {
                    case 'Residential' : return solarSalesItems.installationItem.defaultResidential;
                    case 'Commerical'  : return solarSalesItems.installationItem.defaultCommercial;
                    case 'Utility'     : return solarSalesItems.installationItem.defaultUtility;
                default : return .19;
            }
        }

        function upsertInspectionItem(project, salesOrder, solarSalesItems) {
            if (solarSalesItems.inspectionItem.inspectionItemId) {
                var itemId = solarSalesItems.inspectionItem.inspectionItemId;

                var inspectionVendor = project.getValue({
                    fieldId: 'custentity_bb_inspection_partner_vendor'
                });
                var inspectionAmt = project.getValue({
                    fieldId: 'custentity_bb_inspection_amount'
                });
                var lineId = salesOrder.findSublistLineWithValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: itemId
                });
                var qty = 1;
                var rate = inspectionAmt;
                if (inspectionVendor && inspectionAmt > 0) {
                    if (lineId != -1) {
                        var poId = getPurchaseOrderId(salesOrder, lineId);
                        updateSOLine(salesOrder, itemId, qty, rate, lineId);
                        upsertVendorPO(salesOrder, inspectionVendor, itemId, qty, rate, project, 5, 'Site Inspection', poId);
                    } else {
                        var poId = upsertVendorPO(salesOrder, inspectionVendor, itemId, qty, rate, project, 5, 'Site Inspection', null);
                        addSOLine(salesOrder, itemId, qty, rate, poId);  
                    }
                }
                if (lineId != -1 && !inspectionVendor) { 
                    removeSOLine(salesOrder,  itemId);
                }
                if (lineId != -1 && inspectionVendor && !inspectionAmt) {
                    removeSOLine(salesOrder,  itemId);
                }
            }

        }

        function upsertWarrantyItem(project, salesOrder, solarSalesItems) {
            if (solarSalesItems.warrantyItem.warrantyItemId) {
                var projectType = project.getText({
                    fieldId: 'jobtype'
                });
                if (projectType == 'EPC'){
                    var epcRole = project.getText({
                        fieldId: 'custentity_bb_epc_role'
                    });
                }
                log.debug('Project Type', projectType);
                if (epcRole != 'Installer') {
                    var itemId = solarSalesItems.warrantyItem.warrantyItemId;
                    var warranty = solarSalesItems.warrantyItem.warrantyPercent;
                    var warrantyPercent = parseFloat(warranty);
                    var warrPercent = (warrantyPercent / 100);

                    var contractValue = parseFloat(project.getValue({
                        fieldId: 'custentity_bb_total_contract_value_amt'
                    }));
                    var lineId = salesOrder.findSublistLineWithValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: itemId
                    });
                    var warrantyAmount = (contractValue * warrPercent);
                    var qty = 1;
                    var rate = warrantyAmount
                    if (contractValue > 0) {
                        if (lineId != -1) {
                            updateSOLine(salesOrder, itemId, qty, rate, lineId);
                        } else {
                            addSOLine(salesOrder, itemId, qty, rate);
                        }
                    } else {
                        log.debug('Warranty Item can not be added, the total contract value has a negative total', rate);
                    }
                }

            }

        }

        function upsertOriginatorItem(project, salesOrder, solarSalesItems) {
            if (solarSalesItems.originatorItem.originatorItemId) {
                var itemId = solarSalesItems.originatorItem.originatorItemId;

                var originatorVendor = project.getValue({
                    fieldId: 'custentity_bb_originator_vendor'
                });
                var originatorPayment = project.getValue({
                    fieldId: 'custentity_bb_orgntr_payment_tot_amt'
                });
                var lineId = salesOrder.findSublistLineWithValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: itemId
                });
                var qty = 1;
                var rate = originatorPayment;
                if (originatorVendor && originatorPayment > 0) {
                    if (lineId != -1) {
                        //var poId = getPurchaseOrderId(salesOrder, lineId);
                        updateSOLine(salesOrder, itemId, qty, rate, lineId);
                        //upsertVendorPO(salesOrder, originatorVendor, itemId, qty, rate, project, 3, 'Sales Partner Fee', poId);
                    } else {
                        //var poId = upsertVendorPO(salesOrder, originatorVendor, itemId, qty, rate, project, 3, 'Sales Partner Fee', null);
                        addSOLine(salesOrder, itemId, qty, rate, null);
                        
                    }
                }
                if (lineId != -1 && !originatorVendor) { // the amount is inline and not editible. check vendor first then check total, 
                    removeSOLine(salesOrder,  itemId);
                }
                if (lineId != -1 && originatorVendor && !originatorPayment) {
                    removeSOLine(salesOrder,  itemId);
                }

            }

        }

        function upsertShippingItem(project, salesOrder, solarSalesItems) {
            if (solarSalesItems.shippingItem.shippingItemId) {
                var projectType = project.getText({
                    fieldId: 'jobtype'
                });
                if (projectType == 'EPC'){
                    var epcRole = project.getText({
                        fieldId: 'custentity_bb_epc_role'
                    });
                }
                log.debug('Project Type', projectType);
                if (epcRole != 'Installer') {
                    var itemId = solarSalesItems.shippingItem.shippingItemId;
                    var shipMasterPrice = parseFloat(getShippingPrice(salesOrder));
                    var lineId = salesOrder.findSublistLineWithValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: itemId
                    });
                    if (shipMasterPrice > 0.00) {
                        var shipPercentage = parseFloat(solarSalesItems.shippingItem.shippingPercent);
                        var shipPercent = (shipPercentage / 100);
                        var qty = 1;
                        var rate = (shipMasterPrice * shipPercent);
                        if (lineId != -1) {
                            updateSOLine(salesOrder, itemId, qty, rate, lineId);
                        } else {
                            addSOLine(salesOrder, itemId, qty, rate);
                        }
                    } 
                    if (shipMasterPrice == 0.00 && lineId != -1) {
                        removeSOLine(salesOrder,  itemId);
                    }
                }

            }

        }

        function getShippingPrice(salesOrder) {
            var lineCount = salesOrder.getLineCount({
                sublistId: 'item'
            });

            var shippingPrices = 0.00;
            for (var l = 0; l < lineCount; l++) {
                var itemId = salesOrder.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: l
                });

                var typeName = salesOrder.getSublistText({
                    sublistId: 'item',
                    fieldId: 'itemtype',
                    line: l
                });
                log.debug('get shipping price - item type', typeName);

                if (typeName == 'InvtPart') {
                    shippingPrices += parseFloat(salesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: l
                    }));
                }
            } 
            log.debug('shipping Price', shippingPrices);
            return shippingPrices;

        }

        function addSOLine(salesOrder, itemId, qty, rate, poId) {
            if (itemId && qty && rate) {
                salesOrder.selectNewLine('item');
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: itemId
                });
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: qty
                });
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    value: rate
                });
                if (poId) {
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_bb_purchase_order_id',
                        value: poId
                    });
                }
                salesOrder.commitLine('item');
            }

        }

        function updateSOLine(salesOrder, itemId, qty, rate, lineId, purchaseOrderId) {
            if (itemId && qty && rate) {
                salesOrder.selectLine({
                    sublistId: 'item',
                    line: lineId
                });
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: qty
                });
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    value: rate
                });
                if (purchaseOrderId) {
                    salesOrder.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_bb_purchase_order_id',
                        value: purchaseOrderId
                    });
                }
                salesOrder.commitLine({
                    sublistId: 'item'
                });
            }

        }

        function removeSOLine(salesOrder,  itemId) {
            var removeSoLine = salesOrder.findSublistLineWithValue({
                sublistId: 'item',
                fieldId: 'item',
                value: itemId
            });
            log.debug('salesOrder Line Id', removeSoLine);

            salesOrder.removeLine({
                sublistId: 'item',
                line: removeSoLine
            });

        }

        function getShippingItemAmount(salesOrder, solarSalesItems) {
            var shipAmt;
            var configItem = solarConfig.getConfigurations(['custrecord_bb_shipping_item']);
            // var shippingItem = solarSalesItems.shippingItem.shippingItemId;
            var shippingItem = configItem['custrecord_bb_shipping_item'].value;
            var lineId = salesOrder.findSublistLineWithValue({
                sublistId: 'item',
                fieldId: 'item',
                value: parseInt(shippingItem)
            });
            if (lineId != -1){
                salesOrder.selectLine({
                    sublistId: 'item',
                    line: lineId
                });
                shipAmt = salesOrder.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'amount'

                });
            }
            return shipAmt;

        }

        function getSalesTaxDetails(projectId) {
            var taxAmount = parseFloat(0.00);
            var taxAccount = null;
            var accountName = '';
            var memo = '';
            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                    [
                        ["custbody_bb_project","anyof", projectId],
                        "AND",
                        ["type","anyof","SalesOrd"],
                        "AND",
                        ["taxline","is","T"],
                        "AND",
                        ["amount","greaterthan","0.00"]
                    ],
                columns:
                    [
                        "account",
                        "memo",
                        "amount"
                    ]
            });
            salesorderSearchObj.run().each(function(result) {
                var amount = parseFloat(result.getValue({name: 'amount'}));
                taxAmount = taxAmount + amount;
                taxAccount = result.getValue({name: 'account'});
                accountName = result.getText({name: 'account'});
                memo = result.getValue({name: 'memo'});
                return true;
            });
            return {
                account: taxAccount,
                accountName: accountName,
                memo: memo,
                amount: taxAmount
            };
        }

        function upsertVendorPO(salesOrder, vendor, item, qty, amount, project, milestone, memo, poId) {
            var purchaseOrder;
            if (poId) {
                purchaseOrder = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: poId,
                    isDynamic: true
                });
                
                var lineIndex = purchaseOrder.findSublistLineWithValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: item
                });
                if (lineIndex != -1) {
                    updateSOLine(purchaseOrder, item, qty, amount, lineIndex, null);
                }

            } else {
                purchaseOrder = record.create({
                    type: record.Type.PURCHASE_ORDER,
                    isDynamic: true
                });
                purchaseOrder.setValue({
                    fieldId: 'custbody_bb_project',
                    value: project.id
                });
                purchaseOrder.setValue({
                    fieldId: 'entity',
                    value: vendor
                });
                purchaseOrder.setValue({
                    fieldId: 'custbody_bb_milestone',
                    value: milestone
                });
                if (memo) {
                    purchaseOrder.setValue({
                        fieldId: 'memo',
                        value: memo
                    });
                }
                addSOLine(purchaseOrder, item, qty, amount);

            }
            var poId = purchaseOrder.save({
                ignoreMandatoryFields: true
            });
            return poId;

        }

        function getPurchaseOrderId(salesOrder, lineNumber) {
            if (lineNumber != -1) {
                var poId = salesOrder.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_bb_purchase_order_id',
                    line: lineNumber
                });
                log.debug('Purchase Order Id', poId);
                return poId;
            }
        }
        
        function isNotNull(str) {
            return !isNull(str);
        }

        function isNull(str) {
            return (str === null || str === '' || str === undefined);
        }

    function searchProjectSalesOrder(projectId) {
        var soId = null;
        if (projectId) {
            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                    [
                        ["type","anyof","SalesOrd"],
                        "AND",
                        ["mainline","is","T"],
                        "AND",
                        ["custbody_bb_project","anyof", projectId]
                    ],
                columns:
                    [
                        "internalid"
                    ]
            });
            var searchResultCount = salesorderSearchObj.runPaged().count;
            log.debug("Project Sales Order Record Count",searchResultCount);
            var result = salesorderSearchObj.run().getRange({start:0, end:1});
            if (result.length > 0) {
                soId = result[0].getValue({name: 'internalid'});
            }

        }
        return soId;
    }


        return {
            getSalesOrder: getSalesOrder,
            createSalesOrderHeader: createSalesOrderHeader,
            updateSalesOrderHeader: updateSalesOrderHeader,
            getLocation: getLocation,
            setAddress: setAddress,
            getProjectAddress: getProjectAddress,
            findLineIndex: findLineIndex,
            upsertSolarSalesItems: upsertSolarSalesItems,
            getSolarConfigSalesItems: getSolarConfigSalesItems,
            upsertShippingItem: upsertShippingItem,
            upsertOriginatorItem: upsertOriginatorItem,
            upsertWarrantyItem: upsertWarrantyItem,
            getShippingPrice: getShippingPrice,
            getShippingItemAmount: getShippingItemAmount,
            getSalesTaxDetails: getSalesTaxDetails,
            searchProjectSalesOrder: searchProjectSalesOrder

        };
    });