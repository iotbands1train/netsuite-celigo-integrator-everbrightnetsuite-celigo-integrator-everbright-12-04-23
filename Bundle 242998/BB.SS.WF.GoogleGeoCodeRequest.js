/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 * @NModuleScope Public
 * @author  Matt Lehman
 * @overview - Performs Google Lat and Long Request, returns lat and long values for entity records
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

define(['N/record', './BB SS/SS Lib/BB.SS.GoogleMaps'], function(record, gmaps) {

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
        var trigger = scriptContext.type;
        switch (trigger) {
            case 'create':
            case 'edit' :
            case 'xedit' :
                var entity = scriptContext.newRecord;
                var entityId = scriptContext.newRecord.id;
                var oldRec = scriptContext.oldRecord;
                var address;
                if(trigger === 'create'){
                    var addrString = getAddressString(entity);
                    if(addrString){
                        address = gmaps.getLatLong(addrString);
                        setGetCodeFields(address, entity);
                    }
                } else {
                    var lat = entity.getValue({fieldId: 'custentity_bb_entity_latitude_text'});
                    var long = entity.getValue({fieldId: 'custentity_bb_entity_longitude_text'});
                    var oldAddrString = getAddressString(oldRec);
                    var newAddrString = getAddressString(entity);
                    if(oldAddrString !== newAddrString || (!lat && !long)){
                        address = gmaps.getLatLong(newAddrString);
                        setGetCodeFields(address, entity);
                    }
                }
                // var address1 = entity.getValue({fieldId: 'custentity_bb_install_address_1_text'});
                // var city = entity.getValue({fieldId: 'custentity_bb_install_city_text'});
                // var state = entity.getText({fieldId: 'custentity_bb_install_state'});
                // var zip = entity.getValue({fieldId:'custentity_bb_install_zip_code_text'});
                // if (address1 && city && state && zip) {
                //     var addyString = address1 + ', ' + city + ', ' + state + ', ' + zip;
                //     var address;
                //     if (trigger === 'create') {
                //         address = gmaps.getLatLong(addyString);
                //         setGetCodeFields(address, entity);
                //     } else {
                //         var lat = entity.getValue({fieldId: 'custentity_bb_entity_latitude_text'});
                //         var long = entity.getValue({fieldId: 'custentity_bb_entity_longitude_text'});
                //         if (!lat && !long) {
                //             address = gmaps.getLatLong(addyString);
                //             setGetCodeFields(address, entity);
                //         }
                //     }
                //
                //
                // }
                break;
        }

    }

    function getAddressString(entity){
        if(entity){
            var address1 = entity.getValue({fieldId: 'custentity_bb_install_address_1_text'});
            var city = entity.getValue({fieldId: 'custentity_bb_install_city_text'});
            var state = entity.getText({fieldId: 'custentity_bb_install_state'});
            var zip = entity.getValue({fieldId:'custentity_bb_install_zip_code_text'});
            if (address1 && city && state && zip) {
                return [address1, city, state, zip].join(', ').trim();
            }
        }
        return undefined;
    }

    function setGetCodeFields(address, entity) {
        if (address && address.geometry && address.geometry.location) {
            if (address.geometry.location.lat) {
                var lat = address.geometry.location.lat;
                entity.setValue({
                    fieldId: 'custentity_bb_entity_latitude_text',
                    value: lat
                });
            }
            if (address.geometry.location.lng) {
                var lng = address.geometry.location.lng;
                entity.setValue({
                    fieldId: 'custentity_bb_entity_longitude_text',
                    value: lng
                });
            }
        }
    }

    return {
        onAction : onAction
    };

});