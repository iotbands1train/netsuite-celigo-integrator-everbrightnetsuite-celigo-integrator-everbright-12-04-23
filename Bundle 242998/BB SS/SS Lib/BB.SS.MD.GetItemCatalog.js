/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Matt Lehman
 * @overview - Custom Library for processing get item catalog from Baywa API
 */
define(['N/search', 'N/record'],

function(search, record) {

    function getItemDetailRecords(vendorId) {
        var vendorItemDetailArr = [];
        var vendorItemDetails = search.create({
            type: "customrecord_bb_vendor_item_details",
            filters:
            [
                ["custrecord_bb_vendor_item_vendor", "anyof", vendorId]
            ],
            columns:
            [
                "internalid",
                "custrecord_bb_vendor_item",
                "custrecord_bb_vendor_item_vendor",
                "custrecord_bb_vendor_item_text",
                search.createColumn({
                    name: "isinactive",
                    join: "CUSTRECORD_BB_VENDOR_ITEM"
                })
            ]
        });
        var searchResultCount = vendorItemDetails.runPaged().count;
        log.debug("customrecord_bb_vendor_item_detailsSearchObj result count",searchResultCount);
        vendorItemDetails.run().each(function(result){
            var itemDetailId = result.getValue({
                name: 'internalid'
            });
            var itemId = result.getValue({
                name: 'custrecord_bb_vendor_item'
            });
            var itemText = result.getValue({
                name: 'custrecord_bb_vendor_item_text'
            });
            var vendorId = result.getValue({
                name: 'custrecord_bb_vendor_item_vendor'
            });
            var inactive = result.getValue({
                name: 'isinactive',
                join: 'CUSTRECORD_BB_VENDOR_ITEM'
            });
            vendorItemDetailArr.push({
                itemDetailId: itemDetailId,
                itemId: itemId,
                itemText: itemText,
                vendorId: vendorId,
                inactive: inactive
            });

            return true;
        });
        return vendorItemDetailArr;

    }


    function getMatchingDetailRecord(itemDetails, detailRecords) { // add indexOf for Vendor, must be set incase of more then 1 item record but has different vendors
        if (itemDetails) {
            var itemText = itemDetails.itemname;
            var detailIndex = detailRecords.map(function(result) {return result.itemText;}).indexOf(itemText);
            if (detailIndex != -1) {
                return detailRecords[detailIndex];
            } else {
                return -1;
            }
        } else {
            return -1;
        }


    }

    function upsertVendorItemDetailRecord(detailRecord, itemDetails, vendorId, ssConfig, categories) {
        log.debug('detailRecord', detailRecord);
        log.debug('itemDetails', itemDetails);
        log.debug('categories', categories);
        log.debug('vendorId', vendorId);
        var itemDetailRec;
        if (!detailRecord.inactive) {
            var category = productCategory(categories, itemDetails);
            if (detailRecord != -1) {
                itemDetailRec = record.load({
                    type: 'customrecord_bb_vendor_item_details',
                    id: detailRecord.itemDetailId
                });
            } else {
                itemDetailRec = record.create({
                    type: 'customrecord_bb_vendor_item_details'
                });
            }

            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_text',
                value: itemDetails.itemname
            });

            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_vendor',
                value: vendorId
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_descript_txt',
                value: itemDetails.itemdescription
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_unit_price_cur',
                value: itemDetails.unitprice
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_mfg_name_txt',
                value: itemDetails.legalManufacturerName
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_common_mfg_txt',
                value: itemDetails.commonManufacturerName
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_mfg_code_txt',
                value: itemDetails.manufacturerCode
            });

            var active =  ssConfig.getValue({
                fieldId: 'custrecord_bb_bw_active_item_status'
            });
            var inactive = ssConfig.getValue({
                fieldId: 'custrecord_bb_bw_inactive_item_status'
            });

            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_stock_status',
                value: (itemDetails.itemStockStatus == 'Active') ? active : inactive
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_product_category',
                value: category.productCategory
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_product_sub_cat',
                value: category.productSubCategory
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_product_sub_cat_grp',
                value: category.productSubCatGroup
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_watt',
                value: itemDetails.watt
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_panel_watt_range',
                value: itemDetails.panelWattRange
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_panel_frame_color',
                value: itemDetails.panelFrameColor
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_panel_bck_sheet_clr',
                value: itemDetails.panelBackSheetColor
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_cell_count',
                value: itemDetails.cellCount
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_inverter_range',
                value: itemDetails.inverterRange
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_voltage',
                value: itemDetails.voltage
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_ship_length',
                value: itemDetails.itemShipLength
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_ship_width',
                value: itemDetails.itemShipWidth
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_ship_height',
                value: itemDetails.itemShipHeight
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_ship_weight',
                value: itemDetails.itemShipWeight
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_ship_wght_dims',
                value: itemDetails.itemWeightDims
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_frame_depth',
                value: itemDetails.frameDepth
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_pallet_qty',
                value: itemDetails.palletQty
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_pallet_weight',
                value: itemDetails.palletWeight
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_pallet_dims',
                value: itemDetails.palletDims
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_freight_class',
                value: itemDetails.freightClass
            });
            itemDetailRec.setValue({
                fieldId: 'custrecord_bb_vendor_item_commodity_name',
                value: itemDetails.commodityName
            });
            if (itemDetails.datasheet) {
                itemDetailRec.setValue({
                    fieldId: 'custrecord_bb_vendor_item_data_doc_link',
                    value: itemDetails.datasheet
                });
            }
            if (itemDetails.installationManual) {
                itemDetailRec.setValue({
                    fieldId: 'custrecord_bb_vendor_item_instl_doc_link',
                    value: itemDetails.installationManual
                });
            }
            if (itemDetails.warrantyGuide) {
                itemDetailRec.setValue({
                    fieldId: 'custrecord_bb_vendor_item_wrnty_doc_link',
                    value: itemDetails.warrantyGuide
                });
            }
            if (itemDetails.imageThumbnailUrl) {
                itemDetailRec.setValue({
                    fieldId: 'custrecord_bb_vendor_item_thumbnail_url',
                    value: itemDetails.imageThumbnailUrl
                });
            }

            itemDetailRec.save({
                ignoreMandatoryFields: true
            });
        }


    }

    function getProductCategory(){
        var productCategories = [];
        var itemCategories = search.create({
            type: "customrecord_bb_item_category",
            filters:
            [
            ],
            columns:
            [
                "internalid",
                "name"
           ]
        });
        itemCategories.run().each(function(result){
            var categoryName = result.getValue({
                name: 'name'
            });
            var categoryId = result.getValue({
                name: 'internalid'
            });
            productCategories.push({
                categoryName: categoryName,
                categoryId: categoryId
            });
            return true;
        });
        return productCategories;
    }

    function getProductSubCategory(){
        var productSubCategories = [];
        var itemSubCategories = search.create({
            type: "customrecord_bb_item_sub_category",
            filters:
            [
            ],
            columns:
            [
                "internalid",
                "name"
           ]
        });
        itemSubCategories.run().each(function(result){
            var subCategoryName = result.getValue({
                name: 'name'
            });
            var subCategoryId = result.getValue({
                name: 'internalid'
            });
            productSubCategories.push({
                subCategoryName: subCategoryName,
                subCategoryId: subCategoryId
            });
            return true;
        });
        return productSubCategories;
    }

    function getProductSubCategoryGroup(){
        var productSubCategoryGroup = [];
        var itemSubCategoryGroup = search.create({
            type: "customrecord_bb_item_sub_category_group",
            filters:
            [
            ],
            columns:
            [
                "internalid",
                "name"
           ]
        });
        itemSubCategoryGroup.run().each(function(result){
            var subCategoryGroupName = result.getValue({
                name: 'name'
            });
            var subCategoryGroupId = result.getValue({
                name: 'internalid'
            });
            productSubCategoryGroup.push({
                subCategoryGroupName: subCategoryGroupName,
                subCategoryGroupId: subCategoryGroupId
            });
            return true;
        });
        return productSubCategoryGroup;
    }



    function productCategory(categories, itemDetails) {
        var categoryObj = {};

        var productCategory = categories.productCategory;
        var productSubCategory = categories.productSubCategory;
        var productSubCategoryGroup = categories.productSubCategoryGroup;

        if (itemDetails.productCat) {
            var prodCategoryName = itemDetails.productCat;
            var productCatIndex = productCategory.map(function(result) {return result.categoryName;}).indexOf(prodCategoryName);
            if (productCatIndex != -1) {
                categoryObj.productCategory = productCategory[productCatIndex].categoryId;
            } else {
                categoryObj.productCategory = null;
            }
        }
        if (itemDetails.productSubCat) {
            var productSubCategoryName = itemDetails.productSubCat;
            var productSubCatIndex = productSubCategory.map(function(result) {return result.subCategoryName;}).indexOf(productSubCategoryName);
            if (productSubCatIndex != -1) {
                categoryObj.productSubCategory = productSubCategory[productSubCatIndex].subCategoryId;
            } else {
                categoryObj.productSubCategory = null;
            }
        }
        if (itemDetails.productSubCatGroup) {
            var productSubCatGroupName = itemDetails.productSubCatGroup;
            var productSubCatGroupIndex = productSubCategoryGroup.map(function(result) {return result.subCategoryGroupName}).indexOf(productSubCatGroupName);
            if (productSubCatGroupIndex != -1) {
                categoryObj.productSubCatGroup = productSubCategoryGroup[productSubCatGroupIndex].subCategoryGroupId;
            } else {
                categoryObj.productSubCatGroup =  null;
            }
        }
        return categoryObj;
    }

    function translateItemType(type) {
        switch(type) {
            case "Assembly"     : return record.Type.ASSEMBLY_ITEM;
            case "Description"  : return record.Type.DESCRIPTION_ITEM;
            case "Discount"     : return record.Type.DISCOUNT_ITEM;
            case "DwnLdItem"    : return record.Type.DOWNLOAD_ITEM;
            //case "EndGroup"     : return record.Type.;
            case "GiftCert"     : return record.Type.GIFT_CERTIFICATE_ITEM;
            case "Group"        : return record.Type.ITEM_GROUP;
            case "InvtPart"     : return record.Type.INVENTORY_ITEM;
            case "Kit"          : return record.Type.KIT_ITEM;
            case "Markup"       : return record.Type.MARKUP_ITEM;
            case "NonInvtPart"  : return record.Type.NON_INVENTORY_ITEM;
            case "OthCharge"    : return record.Type.OTHER_CHARGE_ITEM;
            case "Payment"      : return record.Type.PAYMENT_ITEM;
            case "Service"      : return record.Type.SERVICE_ITEM;
            case "ShipItem"     : return record.Type.SHIP_ITEM;
            case "Subtotal"     : return record.Type.SUBTOTAL_ITEM;
            //case "TaxGroup"     : return record.Type.;
            //case "TaxItem"      : return record.Type.;
            default             : return null;
        }
    }


    return {
        getItemDetailRecords: getItemDetailRecords,
        translateItemType: translateItemType,
        getMatchingDetailRecord: getMatchingDetailRecord,
        upsertVendorItemDetailRecord: upsertVendorItemDetailRecord,
        getProductCategory: getProductCategory,
        getProductSubCategory: getProductSubCategory,
        getProductSubCategoryGroup: getProductSubCategoryGroup
    };

});