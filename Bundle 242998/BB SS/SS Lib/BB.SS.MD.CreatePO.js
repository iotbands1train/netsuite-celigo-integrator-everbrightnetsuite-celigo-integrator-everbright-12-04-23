/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Matthew Lehman
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
define([
  'N/search',
  'N/record',
  './BB_SS_MD_SolarConfig'
], function (
  nSearch,
  nRecord,
  bConfig
) {

  function createPoForVendor(vendId, salesOrder, shipAddy, items, location, subsidiary) {
    var purchaseOrder = createPoRecord(vendId);

    setPurchaseOrderHeaderFields(purchaseOrder, salesOrder, location, subsidiary);
    //setPurchaseOrderAddress(salesOrder, purchaseOrder, shipAddy);

    for (var n = 0; items != null && n < items.length; n++) {
      var item = items[n].item;
      var qty = items[n].qty;
      var bomId = items[n].bomId;

      addPOLineItem(purchaseOrder, item, qty, bomId);
    }

    return purchaseOrder.save({
      ignoreMandatoryFields: true
    });
  }

  function createPurchaseOrder(salesOrder) {
    var purchaseOrderDataForSalesOrderArr = [];
    var poData = getSOLineData(salesOrder);
    var isCrossSubsidiary = salesOrder.getValue('iscrosssubtransaction');
    var vendors = poData.vendorNames; // array of vendor names from SO Lines
    var shipAddy = getShippingAddressFields(salesOrder);

    if (vendors.length > 0) {
      for (var v = 0; v < vendors.length; v++) {
        var vendId = vendors[v];

        if (vendId) {
          var itemArr = getVendorMatchingItems(poData, vendId, isCrossSubsidiary);

          if (isCrossSubsidiary) {
            var locations = Object.keys(itemArr);

            for (var i = 0; i < locations.length; i++) {
              var items = itemArr[locations[i]];
              if (items.length > 0) {
                log.debug('items', items);

                var soLineObj = {
                  vendId: vendId,
                  purchaseOrderId: createPoForVendor(vendId, salesOrder, shipAddy, items, locations[i], items[0].subsidiary),
                  locationId: locations[i]
                };

                purchaseOrderDataForSalesOrderArr.push(soLineObj);
              }
            }
          } else {
            if (itemArr.length > 0) {
              var soLineObj = {
                vendId: vendId,
                purchaseOrderId: createPoForVendor(vendId, salesOrder, shipAddy, itemArr)
              };

              purchaseOrderDataForSalesOrderArr.push(soLineObj);
            }
          }
        }
      }
    } else {
      log.debug('Warning', 'There are no new items present for a New Purchase Order on Sales Order Internal ID - ' + salesOrder.id);
    }

    return purchaseOrderDataForSalesOrderArr;
  }


  function createPoRecord(entityId) {
    var purchaseOrder = nRecord.create({
      type: nRecord.Type.PURCHASE_ORDER,
      isDynamic: true,
      defaultValues: {
        entity: entityId
      }
    });

    return purchaseOrder;
  }

  function setPurchaseOrderHeaderFields(purchaseOrder, salesOrder, location, subsidiary) {
    if (!location)
      location = salesOrder.getValue({
        fieldId: 'location'
      });

    if (!subsidiary)
      subsidiary = salesOrder.getValue({
        fieldId: 'subsidiary'
      });

    var currency = salesOrder.getValue({
      fieldId: 'currency'
    });
    var department = salesOrder.getValue({
      fieldId: 'department'
    });
    var soClass = salesOrder.getValue({
      fieldId: 'class'
    });
    var project = salesOrder.getValue({
      fieldId: 'custbody_bb_project'
    });

    if (subsidiary)
      purchaseOrder.setValue({
        fieldId: 'subsidiary',
        value: subsidiary
      });

    if (location)
      purchaseOrder.setValue({
        fieldId: 'location',
        value: location
      });

    if (currency)
      purchaseOrder.setValue({
        fieldId: 'currency',
        value: currency
      });

    if (department)
      purchaseOrder.setValue({
        fieldId: 'department',
        value: department
      });

    if (soClass)
      purchaseOrder.setValue({
        fieldId: 'class',
        value: soClass
      });

    if (project)
      purchaseOrder.setValue({
        fieldId: 'custbody_bb_project',
        value: project
      });


    purchaseOrder.setValue({
      fieldId: 'custbody_bb_ss_created_from_so',
      value: salesOrder.id
    });

    var config = bConfig.getConfigurations([
      'custrecord_bb_shipment_milestone_list',
      'custrecord_bb_ship_to_address_default',
      'custrecord_bb_full_serv_proj_site_loc'
    ]);
    var shipmentId = config.custrecord_bb_shipment_milestone_list.value;

    if (shipmentId)
      purchaseOrder.setValue({ // 2 = Shipment milestone
        fieldId: 'custbody_bb_milestone',
        value: shipmentId
      });

    var configLocPref = config.custrecord_bb_ship_to_address_default.text;

    // Need to check config file for setting ship to address default
    if (project && !salesOrder.getValue('iscrosssubtransaction')) {
      var projectLookup = nSearch.lookupFields({
        type: 'job',
        id: project,
        columns: [
          'custentity_bb_project_location',
          'custentity_bb_proj_address_text'
        ]
      });

      log.debug('projectLookup', projectLookup);

      log.debug('configLocPref', config);

      // if is warehouse
      // 
      if (/project/gi.test(configLocPref)) { // project location
        log.debug('project', project);
        purchaseOrder.setValue({
          fieldId: 'location',
          value: config.custrecord_bb_full_serv_proj_site_loc.value
        });
        purchaseOrder.setValue({
          fieldId: 'shipaddress',
          value: projectLookup.custentity_bb_proj_address_text
        });
      }
    }
  }

  function setPurchaseOrderAddress(salesOrder, purchaseOrder, shipAddy) {
    //set ship to address
    purchaseOrder.setValue({
      fieldId: 'shipaddresslist',
      value: null
    });
    var addressRecord = purchaseOrder.getSubrecord({
      fieldId: 'shippingaddress'
    });
    addressRecord.setValue({
      fieldId: 'country',
      value: shipAddy.country
    });
    addressRecord.setValue({
      fieldId: 'addr1',
      value: shipAddy.address1
    });
    addressRecord.setValue({
      fieldId: 'addr2',
      value: shipAddy.address2
    });
    addressRecord.setValue({
      fieldId: 'addr3',
      value: shipAddy.address3
    });
    addressRecord.setValue({
      fieldId: 'city',
      value: shipAddy.city
    });
    addressRecord.setValue({
      fieldId: 'state',
      value: shipAddy.state
    });
    addressRecord.setValue({
      fieldId: 'zip',
      value: shipAddy.zipCode
    });
  }

  function getShippingAddressFields(salesOrder) {
    var shippingAddress = salesOrder.getSubrecord({
      fieldId: 'shippingaddress'
    });
    var attention = shippingAddress.getValue({
      fieldId: 'attention',
    });
    var addressee = shippingAddress.getValue({
      fieldId: 'addressee',
    });
    var country = shippingAddress.getValue({
      fieldId: 'country',
    });
    var address1 = shippingAddress.getValue({
      fieldId: 'addr1',
    });
    var address2 = shippingAddress.getValue({
      fieldId: 'addr2',
    });
    var address3 = shippingAddress.getValue({
      fieldId: 'addr3',
    });
    var city = shippingAddress.getValue({
      fieldId: 'city',
    });
    var state = shippingAddress.getValue({
      fieldId: 'state',
    });
    var zipCode = shippingAddress.getValue({
      fieldId: 'zip',
    });

    return {
      attention: attention,
      addressee: addressee,
      country: country,
      address1: address1,
      address2: address2,
      address3: address3,
      city: city,
      state: state,
      zipCode: zipCode
    };
  }

  function addPOLineItem(purchaseOrder, item, qty, bomId) {
    purchaseOrder.selectNewLine('item');
    purchaseOrder.setCurrentSublistValue({
      sublistId: 'item',
      fieldId: 'item',
      value: item
    });
    purchaseOrder.setCurrentSublistValue({
      sublistId: 'item',
      fieldId: 'quantity',
      value: qty
    });
    purchaseOrder.setCurrentSublistValue({
      sublistId: 'item',
      fieldId: 'custcol_bb_adder_bom_id',
      value: bomId
    });

    purchaseOrder.commitLine({
      sublistId: 'item'
    });
  }

  function getVendorMatchingItems(poData, vendor, isCrossSubsidiary) {
    var items = poData.poItems;
    var vendorItems = (isCrossSubsidiary) ? {} : [];

    for (var p = 0; items != null && p < items.length; p++) {
      if (items[p].vendorId == vendor) {
        if (items[p].processed == false) {
          items[p].processed = true;

          var obj = {
            vendorName: items[p].vendorName,
            vendorId: items[p].vendorId,
            item: items[p].item,
            qty: items[p].qty,
            qtyCmtd: items[p].qtyCmtd,
            bomId: items[p].bomId,
            location: items[p].location,
            subsidiary: items[p].subsidiary
          };

          if (isCrossSubsidiary) {
            vendorItems[items[p].location] = (vendorItems[items[p].location]) ? vendorItems[items[p].location] : [];

            vendorItems[items[p].location].push(obj);
          } else {
            vendorItems.push(obj);
          }
        }
      }
    }

    return vendorItems;
  }

  function getSOLineData(salesOrder) {
    var vendorNames = [];
    var poItems = [];
    var soLineCount = salesOrder.getLineCount({
      sublistId: 'item'
    });
    var ignoreCommitted = bConfig.getConfigurations(['custrecord_bb_so_to_po_ignore_committed']).custrecord_bb_so_to_po_ignore_committed.value;

    for (var i = 0; soLineCount != null && i < soLineCount; i++) {
      var vendorId = salesOrder.getSublistValue({
        sublistId: 'item',
        fieldId: 'povendor',
        line: i
      });
      var vendorName = salesOrder.getSublistText({
        sublistId: 'item',
        fieldId: 'povendor',
        line: i
      });

      //set object name as vendor
      if (vendorId) {
        var item = salesOrder.getSublistValue({
          sublistId: 'item',
          fieldId: 'item',
          line: i
        });
        var qty = salesOrder.getSublistValue({
          sublistId: 'item',
          fieldId: 'quantity',
          line: i
        });
        var quantityCommitted = salesOrder.getSublistValue({
          sublistId: 'item',
          fieldId: 'quantitycommitted',
          line: i
        }) || 0;
        var bomId = salesOrder.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_bb_adder_bom_id',
          line: i
        });
        var setPoId = salesOrder.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_bb_purchase_order_id',
          line: i
        });
        var location = salesOrder.getSublistValue({
          sublistId: 'item',
          fieldId: 'inventorylocation',
          line: i
        });
        var subsidiary = salesOrder.getSublistValue({
          sublistId: 'item',
          fieldId: 'inventorysubsidiary',
          line: i
        });

        if (!setPoId) {
          if ((ignoreCommitted && qty - quantityCommitted != 0) || !ignoreCommitted) {
            poItems.push({
              vendorName: vendorName,
              vendorId: vendorId,
              item: item,
              qty: (ignoreCommitted) ? qty - quantityCommitted : qty,
              bomId: bomId,
              processed: false,
              location: location,
              subsidiary: subsidiary
            });

            if (vendorNames.indexOf(vendorId) == -1) {
              vendorNames.push(vendorId);
            }
          }
        }
      }
    }

    return {
      vendorNames: vendorNames,
      poItems: poItems
    };
  }

  return {
    createPurchaseOrder: createPurchaseOrder
  };
})