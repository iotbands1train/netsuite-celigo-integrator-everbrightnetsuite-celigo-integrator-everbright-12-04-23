/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 *
 * Error codes used found at
 * https://restfulapi.net/http-status-codes/
 *
 * Copyright 2020 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/record','N/search','../BB.SS.MD.FlatToObjConvert'],
function(record, search, convertModule) {

    function postRecGen(options) {
        var _output = {};
        var apiErrors = [];
        //log.debug('POST',options);

        // This can be changed if needed since the majority of the code is generic
        var recordType = record.Type.LEAD,
            isEntity=true,
            isItem=false,
            isTransaction=false,
            isCustom=false
        ;

        // get the field mapping from the script parameter
        var _fieldMap = parseMapping(options.map);
        log.debug('parsed mapping',_fieldMap);

        var _payloadFlat = convertModule.objectToFlat(options.payload);
        log.debug('payloadFlat ',_payloadFlat);

        // create Rec
        var _rec = record.create({
            type: recordType,
            isDynamic: true
        });
        //log.debug('new Record',_rec);
        log.debug('is person',Object.keys(_fieldMap).indexOf('firstname')>=0);
        _rec.setValue({
            fieldId:'isperson',
            value: Object.keys(_fieldMap).indexOf('firstname')>=0 ? 'T':'F'
        });

        for(var fld in _fieldMap){
            var _field,
                _value = _payloadFlat[_fieldMap[fld]];

            log.debug(fld,_payloadFlat[_fieldMap[fld]]);
            // set rec value here
            try{
                if(fld.indexOf('.text')>=0){
                    log.debug('set text for',fld);
                    _rec.setText({
                        fieldId: fld.replace('.text',''),
                        text: _value
                    });
                } else {
                    _field = _rec.getField({fieldId: fld});
                    if(_field) {
                        if(/date|time/i.test(_field.type)){
                            // validate ISO formatted date
                            if(/^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/.test(_value)){
                                _value = new Date(_value);
                                log.debug('set date/time for '+fld,_value);
                            } else {
                                log.error('ISO Date Format',{name:'ISO_DATE_FORMAT',message:'Attempt to set field '+fld+' to invalid date format.'});
                                apiErrors.push({name:'ISO_DATE_FORMAT',code:'412', message:'Attempt to set field '+fld+' to invalid date format. ISO date format expected. ( YYYY-MM-DD )'});
                                _value = null;
                            }
                        } else if(/currency|integer|float|percent/i.test(_field.type)) {
                            if(typeof _value === 'string'){
                                _value = _value.replace(/[^0-9.]/, '').replace(',', '');
                                _value = Number(_value);
                                log.debug('set number/currency for '+fld,_value);
                                if(isNaN(_value)){
                                    log.error('number/currency error',{name:'NOT_A_NUMBER',code:'415',message:'Attempt to set field '+fld+' to invalid number.'});
                                    apiErrors.push({name:'NAN',message:'Attempt to set field '+fld+' to invalid number.'});
                                    _value = null;
                                }
                            }
                        }
                        if(_value!=null) // allow for empty string
                            _rec.setValue({fieldId: fld, value: _value});

                    } else {
                        apiErrors.push({name:'FIELD_NOT_FOUND',code:'406',message:'Attempt to set field '+fld+' failed. Field cannot be found.'});
                        log.error('FIELD_NOT_FOUND', {fieldId:fld,value:_value});
                    }

                }

            } catch (e){
                log.error('_rec set value error',e);
                apiErrors.push({name:e.name,code:e.code,message:e.message});
            }
        }

        // save _rec
        try{
            var _recId = _rec.save();
            log.debug('_rec was saved',_recId);

            // get the UUID from the record
            var uuid = search.lookupFields({
                type: recordType, id:_recId,
                columns: ['custentity_bb_ob_project_uuid']
            }).custentity_bb_ob_project_uuid;

            // _output.success = true;
            // _output.message = null;
            _output.Site = {
                    Contacts: [
                        {
                            ContactType: 'Homeowner',
                            ContactID: uuid
                        }
                    ]
            };
            if(isEntity)
                options.apilog.setValue({fieldId:'entity',value:_recId});
            else if(isTransaction)
                options.apilog.setValue({fieldId:'transaction',value:_recId});
            else if(isItem)
                options.apilog.setValue({fieldId:'item',value:_recId});
        } catch (e) {
            log.error('_rec save failed with error',e);
            apiErrors.push({name:e.name,code:e.code,message:e.message});
            _output.message = e.message;
        }

        if(apiErrors.length>0) {
            // reformat NS date errors to respond with correct date format for ISO to match OB JSON formatting
            for(var err in apiErrors){
                if (/Invalid date value/i.test(err.message)) {
                    err.message = "Invalid date value. ISO date format expected. ( YYYY-MM-DD )"
                }
            }
            options.apilog.setValue({
                fieldId: 'error',
                value: JSON.stringify(apiErrors)
            });
            log.error('ERRORS',apiErrors);
            _output.Errors = apiErrors;
        }
        return _output;
    }

    function getRecGen(payload,apiLog) {
        log.debug('GET',payload);
        return {"success":true,
            "message": "GET Connection to this API was successful."
        };
    }

    function putRecGen(payload,apiLog) {
        log.debug('PUT',payload);
        return {"success":true,
            "message": "PUT Connection to this API was successful."
        };
    }

    function deleteRecGen(payload,apiLog) {
        log.debug('DELETE',payload);
        return {"success":true,
            "message": "DELETE Connection to this API was successful."
        };
    }

    function parseMapping(mappingStr, reverse) {
        var
            _mapping = {}
            , _mappingArray
            , _keyValueArray
            , _key
            , _value
        ;
        _mappingArray = mappingStr ? mappingStr.trim().split(/\r?\n/g) : [];
        _mappingArray.forEach(function(mapping){
            _keyValueArray = mapping.trim().split(':');
            _key = reverse ? _keyValueArray[1] : _keyValueArray[0];
            _value = reverse ? _keyValueArray[0] : _keyValueArray[1];
            _key = _key ? _key.trim() : null;
            _value = _value ? _value.trim() : '';
            if(_key){
                _mapping[_key] = _value;
            }
        })
        return _mapping;
    }

    return {
        name: 'recordGeneration',
        post: postRecGen,
        // get: getRecGen,
        // put: putRecGen,
        // delete: deleteRecGen
    };
});
