/**
 * @NApiVersion 2.x
 * @NModuleScope public
 */

define(['N/record'],  function(recordModule) {

    var _annotations = {
        records: {
            VENDOR: 'vendor'
        },
        sublists: {
            VENDOR_SUBSIDIARIES_SUBLIST: 'submachine'
        },
        fields: {
            VENDOR_SUBSIDIARIES_SUBLIST_SUBSIDIARY: 'subsidiary'
        }
    };

    function hasVendorSubsidiary(vendor, subsidiary){
        var _vendor = vendor;
        var _subsidiary = subsidiary;
        if(_vendor && _subsidiary){
            if(typeof _vendor === 'number' || (typeof _vendor === 'string' && !isNaN(parseInt(_vendor)))){
                _vendor = recordModule.load({
                    type: _annotations.records.VENDOR
                    , id: _vendor
                });
            }
            if(typeof _subsidiary === 'object'){
                _subsidiary = _subsidiary.id;
            }
            var _vendorSubsidiariesCount = _vendor.getLineCount({
                sublistId: _annotations.sublists.VENDOR_SUBSIDIARIES_SUBLIST
            });
            var _found = false;
            for(var i = 0; i < _vendorSubsidiariesCount; i++){
                var _vendorSubsidiary = _vendor.getSublistValue({
                    sublistId: _annotations.sublists.VENDOR_SUBSIDIARIES_SUBLIST
                    , fieldId: _annotations.fields.VENDOR_SUBSIDIARIES_SUBLIST_SUBSIDIARY
                    , line: i
                });
                if(_vendorSubsidiary === _subsidiary){
                    _found = true;
                    break;
                }
            }
            return _found;
        }
    }

    function addSubsidiaryToVendor(vendor, subsidiary){
        var _vendor = vendor;
        var _subsidiary = subsidiary;
        if(_vendor && _subsidiary){
            if(typeof _vendor === 'number' || (typeof _vendor === 'string' && !isNaN(parseInt(_vendor)))){
                _vendor = recordModule.load({
                    type: _annotations.records.VENDOR
                    , id: _vendor
                });
            }
            if(typeof _subsidiary === 'object'){
                _subsidiary = _subsidiary.id;
            }
            var _vendorSubsidiariesCount = _vendor.getLineCount({
                sublistId: _annotations.sublists.VENDOR_SUBSIDIARIES_SUBLIST
            });
            _vendor.insertLine({
                sublistId: _annotations.sublists.VENDOR_SUBSIDIARIES_SUBLIST,
                line: _vendorSubsidiariesCount
            });
            _vendor.setSublistValue({
                sublistId: _annotations.sublists.VENDOR_SUBSIDIARIES_SUBLIST,
                line: _vendorSubsidiariesCount,
                fieldId: _annotations.fields.VENDOR_SUBSIDIARIES_SUBLIST_SUBSIDIARY,
                value: _subsidiary
            });
            _vendor.save({
                ignoreMandatoryFields: true
            });
        }
    }

    return {
        hasVendorSubsidiary: hasVendorSubsidiary,
        addSubsidiaryToVendor: addSubsidiaryToVendor
    }
});