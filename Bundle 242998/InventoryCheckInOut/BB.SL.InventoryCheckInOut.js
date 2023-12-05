/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/ui/serverWidget', 'N/record', 'N/redirect', 'N/file', 'N/runtime', 'N/search', '../BB SS/SS Lib/BB_SS_MD_SolarConfig'],

  function (serverWidget, record, redirect, file, runtime, searchModule, configModule) {

  function renderForm(context){
    var
      _cssUrl
      , _jQueryUiUrl
      , _form
      , _cssUrlField
      , _jQueryUiUrlField
      , _locationField
      , _projectField
      , _checkInTypeField
      , _itemSublist
      , _itemEntryField
      , _itemField
      , _qtyField
      , _serialNumberEnterField
      , _serialNumbersField
      , _isSerialNumberItemField
      , _invAdjAccountField
      , _submitButton
      , _invAdjAccountId
    ;

    _cssUrl = file.load({id: './BB.Style.InventoryCheckInOut.css'}).url;
    _jQueryUiUrl = file.load({id: './jquery-ui.js'}).url;
    _invAdjAccountId = getAdjustmentAccount();
    _form = serverWidget.createForm({
      title: 'Inventory Check In/Check Out',
      hideNavBar: true
    });
    _form.clientScriptModulePath = './BB.CS.InventoryCheckInOut.js';

    _cssUrlField = _form.addField({
      id: 'custpage_css_url',
      type: serverWidget.FieldType.TEXT,
      label: 'CssUrl'
    });
    _cssUrlField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
    _cssUrlField.defaultValue = _cssUrl;

    _jQueryUiUrlField = _form.addField({
      id: 'custpage_jquery_ui_url',
      type: serverWidget.FieldType.TEXT,
      label: 'CssUrl'
    });
    _jQueryUiUrlField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
    _jQueryUiUrlField.defaultValue = _jQueryUiUrl;

    _invAdjAccountField = _form.addField({
      id: 'custpage_inv_acc_adj',
      type: serverWidget.FieldType.TEXT,
      label: 'Inventory Adjustment Account'
    });
    _invAdjAccountField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
    _invAdjAccountField.defaultValue = _invAdjAccountId;
    _checkInTypeField = _form.addField({
      id: 'custpage_check_type',
      type: serverWidget.FieldType.SELECT,
      label: 'Process Type'
    });
    _checkInTypeField.addSelectOption({
      value: 1,
      text: 'Check In'
    });
    _checkInTypeField.addSelectOption({
      value: 2,
      text: 'Check Out'
    });
    _checkInTypeField.updateLayoutType({
      layoutType: serverWidget.FieldLayoutType.OUTSIDE
    });
    _checkInTypeField.updateBreakType({
      breakType: serverWidget.FieldBreakType.STARTROW
    });
    _locationField = _form.addField({
      id: 'custpage_location',
      type: serverWidget.FieldType.SELECT,
      label: 'Location',
      source: 'location'
    });
    _locationField.isMandatory = true;
    _locationField.updateLayoutType({
      layoutType: serverWidget.FieldLayoutType.OUTSIDE
    });
    _locationField.updateBreakType({
      breakType: serverWidget.FieldBreakType.STARTROW
    });
    _projectField = _form.addField({
      id: 'custpage_project',
      type: serverWidget.FieldType.SELECT,
      label: 'Project',
      source: 'job'
    });
    // _projectField.isMandatory = true;
    _projectField.updateLayoutType({
      layoutType: serverWidget.FieldLayoutType.OUTSIDE
    });
    _projectField.updateBreakType({
      breakType: serverWidget.FieldBreakType.STARTROW
    });
    _itemSublist = _form.addSublist({
      id: 'custpage_inventory_check_in_out',
      label: 'Add Inventory Here',
      type: serverWidget.SublistType.INLINEEDITOR
    });
    _itemEntryField = _itemSublist.addField({
      id: 'custpage_item_entry',
      type: serverWidget.FieldType.TEXT,
      label: 'Item'
    });
    _itemField = _itemSublist.addField({
      id: 'custpage_item',
      type: serverWidget.FieldType.SELECT,
      label: 'Item Data',
      source: 'item'
    });
    _itemField.updateDisplayType({
      displayType : serverWidget.FieldDisplayType.HIDDEN
    });
    _qtyField = _itemSublist.addField({
      id: 'custpage_quantity',
      type: serverWidget.FieldType.INTEGER,
      label: 'Quantity'
    });
    _serialNumberEnterField = _itemSublist.addField({
      id: 'custpage_serial_numbers_enter',
      type: serverWidget.FieldType.TEXT,
      label: 'Serial Numbers'
    });
    _serialNumbersField = _itemSublist.addField({
      id: 'custpage_serial_numbers',
      type: serverWidget.FieldType.TEXTAREA,
      label: 'Serial Numbers'
    });
    _serialNumbersField.updateDisplayType({
      displayType : serverWidget.FieldDisplayType.HIDDEN
    });
    // _isSerialNumberItemField = _itemSublist.addField({
    //   id: 'custpage_is_serial_number_item',
    //   type: serverWidget.FieldType.INTEGER,
    //   label: 'Is Serial Number Item'
    // });
    // _isSerialNumberItemField.updateDisplayType({
    //   displayType : serverWidget.FieldDisplayType.HIDDEN
    // });
    _submitButton = _form.addSubmitButton({
      label: 'Submit'
    });
    _submitButton.isDisabled = isNaN(parseInt(_invAdjAccountId));

    context.response.writePage(_form);
  }

  function getSubsidiaryId(locationId){
    var _location = record.load({
      type: record.Type.LOCATION,
      id: locationId
    });
    return _location.getValue({fieldId: 'subsidiary'});
  }

  function getAdjustmentAccount(){
    var _config;
    _config = configModule.getConfiguration('custrecord_bb_ss_check_inout_inv_adj_acc');
    if(_config && _config.value){
      return _config.value;
    }
    return undefined;
  }

  function getItemDetails(items){
    var _search
      , _result
    ;
    if(items instanceof Array){
      _result = {};
      _search = searchModule.create({
        type: searchModule.Type.INVENTORY_ITEM,
        filters: [
          ['internalid', searchModule.Operator.ANYOF, items]
        ],
        columns: [
          searchModule.createColumn('isserialitem'),
          searchModule.createColumn('inventorynumber', 'inventorynumber'),
          searchModule.createColumn('location', 'inventorynumber'),
          searchModule.createColumn('quantityavailable', 'inventorynumber'),
        ]
      });
      _search.run().each(function(item){
        var _location
          , _qty
        ;
        if(!_result.hasOwnProperty(item.id)){
          _result[item.id] = {
            isSerialItem: item.getValue({name: 'isserialitem'})
          };
        }
        if(_result[item.id].isSerialItem){
          _qty = item.getValue({name: 'quantityavailable', join: 'inventorynumber'});
          if(_qty > 0){
            _location = item.getValue({name: 'location', join: 'inventorynumber'});
            if(!_result[item.id].serialNumbers.hasOwnProperty(_location)){
              _result[item.id].serialNumbers[_location] = []
            }
            _result[item.id].serialNumbers[_location].push(item.getValue({name: 'inventorynumber', join: 'inventorynumber'}));
          }
        }
        return true;
      });
    }
    return _result;
  }

  function getFormData(context){
    var _request
      , _parameters
      , _data = {}
      , _correction
      , _items = []
      , _itemDetails
    ;

    _request = context.request;
    _parameters = _request.parameters;
    _correction = parseInt(_parameters.custpage_check_type) === 1 ? 1 : -1;
    _data.location = _parameters.custpage_location;
    _data.project = _parameters.custpage_project;
    _data.subsidiary = getSubsidiaryId(_data.location);
    _data.isOut = _correction === -1;
    _data.lines = [];
    _data.lineCount = _request.getLineCount({
      group: 'custpage_inventory_check_in_out'
    });

    if (_data.lineCount > -1) {
      for (var i = 0; i < _data.lineCount; i++) {
        var _lineData = {
          item: _request.getSublistValue({
            group: 'custpage_inventory_check_in_out',
            name: 'custpage_item',
            line: i
          }),
          qty: _request.getSublistValue({
            group: 'custpage_inventory_check_in_out',
            name: 'custpage_quantity',
            line: i
          }),
          serialNumbers: _request.getSublistValue({
            group: 'custpage_inventory_check_in_out',
            name: 'custpage_serial_numbers',
            line: i
          })
        };
        if(_items.indexOf(_lineData.item) === -1){
          _items.push(_lineData.item);
        }
        _lineData.serialNumbers = typeof _lineData.serialNumbers === 'string' ? _lineData.serialNumbers.split('\\r\\n') : [];
        _lineData.qty = _lineData.qty * _correction;
        _data.lines.push(_lineData);
      }
      _itemDetails = getItemDetails(_items);
      _data.lines.forEach(function(line){
        line.isSerialNumberItem = _itemDetails[line.item].isSerialItem;
        if(!line.isSerialNumberItem){
          line.serialNumbers = undefined;
        } else {

        }
      })
    }
    return _data;
  }

  function searchItemSerialNumber(location, item, serialNumbers){
    var
      _itemSerialSearch
    ;

    _itemSerialSearch = searchModule.create({
      type: searchModule.Type.INVENTORY_NUMBER,
      filters: [
        ['']
      ]
    })
  }

  function createInventoryAdjustment(formData){
    var _invAdjRecord
      , _adjAccount
      , _invDetailsRecord
      , _invDetailsSerialNumberField
    ;

    _adjAccount = getAdjustmentAccount();

    _invAdjRecord = record.create({
      type: record.Type.INVENTORY_ADJUSTMENT,
      isDynamic: true
    });
    _invAdjRecord.setValue({
      fieldId: 'subsidiary',
      value: formData.subsidiary
    });
    _invAdjRecord.setValue({
      fieldId: 'custbody_bb_project',
      value: formData.project
    });
    _invAdjRecord.setValue({
      fieldId: 'trandate',
      value: new Date()
    });
    _invAdjRecord.setValue({
      fieldId: 'memo',
      value: 'Inventory Adjustment by Inventory Check In/Check Out'
    });
    // inventory adjustment account set for testing
    _invAdjRecord.setValue({
      fieldId: 'account',
      value: _adjAccount
    });

    // loop over suitelet lines and add new lines to inventory adjustment record.
    for (var i = 0; i < formData.lineCount; i++) {
      _invAdjRecord.selectNewLine({
        sublistId: 'inventory'
      });
      _invAdjRecord.setCurrentSublistValue({
        sublistId: 'inventory',
        fieldId: 'item',
        value: formData.lines[i].item
      });
      _invAdjRecord.setCurrentSublistValue({
        sublistId: 'inventory',
        fieldId: 'adjustqtyby',
        value: formData.lines[i].qty
      });
      _invAdjRecord.setCurrentSublistValue({
        sublistId: 'inventory',
        fieldId: 'location',
        value: formData.location
      });
      if(formData.lines[i].isSerialNumberItem){
        _invDetailsRecord = _invAdjRecord.getCurrentSublistSubrecord({
          sublistId: 'inventory',
          fieldId: 'inventorydetail'
        });
        _invDetailsSerialNumberField = formData.lines[i].isOut ? 'issueinventorynumber' : 'receiptinventorynumber';

        formData.lines[i].serialNumbers.forEach(function(serialNumber, idx){
          log.debug('serialNumber', serialNumber);
          _invDetailsRecord.selectNewLine({
            sublistId: 'inventoryassignment'
          });
          _invDetailsRecord.setCurrentSublistValue({
            sublistId: 'inventoryassignment',
            fieldId: _invDetailsSerialNumberField,
            value: serialNumber
          });
          _invDetailsRecord.commitLine({
            sublistId: 'inventoryassignment'
          });
        });
      }
      _invAdjRecord.commitLine({
        sublistId: 'inventory'
      });
    }
    _invAdjRecord.save({
      ignoreMandatoryFields: true
    });

  }

  /**
   * Definition of the Suitelet script trigger point.
   *
   * @param {Object} context
   * @param {ServerRequest} context.request - Encapsulation of the incoming request
   * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
   * @Since 2015.2
   */
  function onRequest(context) {
    if (context.request.method == 'GET') {
      renderForm(context);
    } else {
      var _currentScript
        , _formData
      ;
      _currentScript = runtime.getCurrentScript();
      _formData = getFormData(context);
      createInventoryAdjustment(_formData);
      redirect.toSuitelet({
        scriptId: _currentScript.id,
        deploymentId: _currentScript.deploymentId
      });
    }

  }

  return {
    onRequest: onRequest
  };

});
