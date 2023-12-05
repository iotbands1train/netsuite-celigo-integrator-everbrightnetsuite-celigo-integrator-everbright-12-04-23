/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Michael Golichenko
 * @version 0.0.1
 */

define(['N/ui/message', 'N/https', 'N/url', 'N/record', 'N/search', 'N/currentRecord', './BB.MD.ItemAutoComplete.InventoryCheckInOut'],
  function (uiMessageModule, httpsModule, urlModule, recordModule, searchModule, currentRecordModule, autoCompleteModule) {

  var _cachedData = {
    items: {}
  }
    , _lastMessage;


  function generateSerialNumbersListHtml(currentRecord, element, value, readonly, rowIdx, isNewRow){
    var _serialNumbers, _item, _location, _checkType;
    if(!isNaN(rowIdx) && !isNewRow){
      _serialNumbers = currentRecord.getSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_serial_numbers', line: rowIdx});
      _item = currentRecord.getSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_item', line: rowIdx});
    } else {
      _serialNumbers = currentRecord.getCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_serial_numbers'});
      _item = currentRecord.getCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_item'});
    }
    _location = currentRecord.getValue({fieldId: 'custpage_location'});
    _checkType = currentRecord.getValue({fieldId: 'custpage_check_type'});
    var _serialNumbersArray = typeof _serialNumbers === 'string' ? _serialNumbers.split('\\r\\n') : [];
    _serialNumbersArray = _serialNumbersArray.filter(function(serialNumber){
      return typeof serialNumber === 'string' && serialNumber.trim().length > 0;
    });
    _serialNumbersArray = _serialNumbersArray.map(function(serialNumber){
      return serialNumber.trim();
    });
    if(typeof value === 'string' && value.trim().length > 0 && _serialNumbersArray.indexOf(value.trim()) === -1) {
      if(_checkType == 2){
        if(isSerialNumberUsed(_item, value, _location)){
          _serialNumbersArray.unshift(value.trim());
        }
      } else {
        _serialNumbersArray.unshift(value.trim());
      }
    }
    var _qty = _serialNumbersArray.length;
    var _html = '';
    if(_serialNumbersArray instanceof Array){
      _serialNumbersArray.forEach(function(serialNumber, idx){
        var _isUsed = isSerialNumberUsed(_item, serialNumber, _location);
        var _deleteTemplate = [
          '<img class="delete-serial-number" data-serial-number="'
          , serialNumber
          ,'" data-serial-number-idx="'
          , idx
          ,'" src="/images/forms/icon_remove_row_default.png" alt="Delete" border="0" style="margin-left: 5px; position: relative; top:2px;">'
        ].join('');
        var _template = [
          '<div class="'
          , _checkType == 1 && _isUsed ? 'used-serialnumber' : ''
          , '"><span>'
          , serialNumber
          , '</span>'
          , readonly ? '': _deleteTemplate
          , '</div>'
        ].join('');
        _html = [_html, _template].join('');
      });
      var _target;
      if(element){
        _target = jQuery(element);
        _target.next('.serial-numbers-list').remove();
      }
      if(_serialNumbersArray.length > 0){
        _serialNumbers = _serialNumbersArray.join('\\r\\n')
        _html = ['<div class="serial-numbers-list">', _html, '</div>'].join('');
        if(_target){
          var _serialNumbersList = jQuery(_html);
          _target.after(_serialNumbersList);
          jQuery('.delete-serial-number', _serialNumbersList).on('click', function(event){
            var _target = jQuery(event.currentTarget);
            var _serialNumber = _target.data('serial-number');
            var _serialNumberIdx = parseInt(_target.data('serial-number-idx'));
            _target.parent().remove();
            var _currentRecord = currentRecordModule.get();
            var _currentSerialNumbers = _currentRecord.getCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_serial_numbers'});
            var _serialNumbersArray = typeof _currentSerialNumbers === 'string' ? _currentSerialNumbers.split('\\r\\n') : [];
            if(_serialNumbersArray.length > 0 && !isNaN(_serialNumberIdx)){
              _serialNumbersArray.splice(_serialNumberIdx, 1);
              _currentSerialNumbers = _serialNumbersArray.join('\\r\\n');
              _currentRecord.setCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_serial_numbers', value: _currentSerialNumbers});
              _currentRecord.setCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_quantity', value: _serialNumbersArray.length});
            }
          });
        }
      }
    }
    return {qty: _qty, html: _html, serialNumbers: _serialNumbers};
  }

  function generateSelectedItemHtml(currentRecord, element, rowIdx, isNewRow){
    var _item, _data;
    if(!isNaN(rowIdx) && !isNewRow){
      _item = currentRecord.getSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_item', line: rowIdx});
    } else {
      _item = currentRecord.getCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_item'});
    }
    if(element){
      var _selectedItemInfo = jQuery('.selected-item-details', element);
      _selectedItemInfo.empty();
    }
    if(typeof _item === 'string' && _item.length > 0){
      var _itemRec = getItem(_item).record;
      var _data = {
        displayname: _itemRec.getValue({fieldId: 'itemid'}),
        upccode: _itemRec.getValue({fieldId: 'upccode'})
      };
      if(_data) {
        var _html;
        if (typeof _data.displayname === 'string' && _data.displayname.trim().length > 0)
          _html = [_html, '<div class"item-displayname">', _data.displayname, '</div>'].join('');
        if (typeof _data.upccode === 'string' && _data.upccode.trim().length > 0) {
          _html = [_html, '<div class="item-upccode">', _data.upccode, '</div>'].join('')
        }
      }
      if(_html && element){
        _selectedItemInfo.append(_html);
      }
    }
    return {html: _html}
  }

  function onKeyUpEvent(event){
    var _keycode = (event.keyCode ? event.keyCode : event.which);
    var _rowIdx = event.data.rowIdx;
    var _cellIdx = event.data.cellIdx;
    if(['10','13', 10, 13].indexOf(_keycode) > -1){
      //console.log('keyup args', arguments);
      var _value = event.currentTarget.value;
      if(typeof _value === 'string' && _value.length > 0){
        var _currentRecord = currentRecordModule.get();
        var _result = generateSerialNumbersListHtml(_currentRecord, event.currentTarget, _value);
        event.currentTarget.value = '';
        _currentRecord.setCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_serial_numbers', value: _result.serialNumbers});
        _currentRecord.setCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_quantity', value: _result.qty});
      }
    }
  }

  function onItemKeyUpEvent(event){
    var _keycode = (event.keyCode ? event.keyCode : event.which);
    if(['10','13', 10, 13].indexOf(_keycode) > -1){
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function loadHeadFiles(currentRecord){
    var _cssUrl = currentRecord.getValue({fieldId: 'custpage_css_url'});
    var _jQueryUiUrl = currentRecord.getValue({fieldId: 'custpage_jquery_ui_url'});
    var _cssUrls = [
      '//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css'
    ];

    if(typeof _cssUrl === 'string' && _cssUrl.length > 0){
      _cssUrls.push(_cssUrl);
      /* create the link element */
      var metaElement = document.createElement('meta');
      var bodyElement = document.getElementsByTagName('body')[0];
      /* add attributes */
      metaElement.setAttribute('name', 'viewport');
      metaElement.setAttribute('content', 'width=device-width, initial-scale=1.7');
      /* attach to the document head */
      document.getElementsByTagName('head')[0].appendChild(metaElement);
    }

    _cssUrls.forEach(function(css){
      var linkElement = document.createElement('link');
      linkElement.setAttribute('rel', 'stylesheet');
      linkElement.setAttribute('href', css);
      document.getElementsByTagName('head')[0].appendChild(linkElement);
    });

    if(typeof _jQueryUiUrl === 'string' && _jQueryUiUrl.trim().length > 0){
      var scriptElement = document.createElement('script');
      var head = document.getElementsByTagName('head')[0];
      scriptElement.setAttribute('src', _jQueryUiUrl);
      head.appendChild(scriptElement);
      //head.insertBefore(scriptElement, head.firstChild);
    }
  }

  function pageInit(scriptContext) {
    var _currentRecord = scriptContext.currentRecord;
    var _invAdjAcc = _currentRecord.getValue({fieldId: 'custpage_inv_acc_adj'});
    var _machineName = 'custpage_inventory_check_in_out';

    loadHeadFiles(_currentRecord);

    var source = urlModule.resolveScript({
      scriptId: 'customscript_bb_sl_item_ac_inv_inout',
      deploymentId: 'customdeploy_bb_sl_item_ac_inv_inout',
      returnExternalUrl: false
    });
    searchModule.create({
      type: "file",
      filters:[["folder","anyof","977"],"AND",["filetype","anyof","STYLESHEET"]],
      columns:["url"]
    }).run().each(function(result){
      var cssUrl = result.getValue({name:'url'});
      //console.log('CSS URL',cssUrl);
      autoCompleteModule.loadCSS(cssUrl);
      return true;
    });

    if(typeof _invAdjAcc === 'string' && _invAdjAcc.length === 0){
      uiMessageModule.create({
        type: uiMessageModule.Type.WARNING,
        title: 'Missing Inventory Adjustment Account',
        message: 'Make sure BB Solar Success Configuration record has "Accounting Setup > Default Check In/Out Inventory Adjustment Account" set.'
      }).show();
    }

    custpage_inventory_check_in_out_machine.getFieldOverride = function(inputArray, currentRow, rowIdx, cellIdx){
      // console.log('getFieldOverride', arguments);
      var _currentRecord = currentRecordModule.get();
      var _fieldId = this.getFormElementName(cellIdx);
      if(['custpage_serial_numbers_enter'].indexOf(_fieldId) > -1){
        var _label = this.getFormElementLabel(cellIdx);
        var _editor = inputArray[cellIdx];
        // console.log(_input);
        var _editorObj = jQuery(_editor);
        var _inputObj = jQuery('input', _editorObj);
        _inputObj.off('keyup', onKeyUpEvent).on('keyup', {rowIdx: rowIdx, cellIdx: cellIdx}, onKeyUpEvent);
        generateSerialNumbersListHtml(_currentRecord, _inputObj);
        // console.log(_editorObj.html());
        return [_editorObj[0], _label];
      }
      if(['custpage_item_entry'].indexOf(_fieldId) > -1){
        var _label = this.getFormElementLabel(cellIdx);
        var _editor = inputArray[cellIdx];
        var _editorObj = jQuery(_editor);
        var _inputObj = jQuery('input', _editorObj);
        var _hasAutoComplete = _editorObj.data('has-autocomplete');
        if(!_hasAutoComplete) {
          _inputObj.after('<div class="selected-item-details"></div>');
          _inputObj.off('keypress', onItemKeyUpEvent).on('keypress', onItemKeyUpEvent);
          // autoCompleteModule.configureAutocompleteLibrary({
          //   dataSource: source,
          //   fieldId: 'custpage_item_entry',
          //   targetFieldId: 'custpage_item',
          //   onSelect: function (feedback) {
          //     //generateSelectedItemHtml(_currentRecord, _editorObj, feedback.selection.value);
          //     _currentRecord.setCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_item', value: feedback.selection.value.id});
          //     _inputObj.val('');
          //   }
          // });
          // _inputObj.off('autoComplete').on("autoComplete", function(event){
          //   console.log(event);
          //   //   const detail = event.detail;
          //   // if (detail.event.key === "Enter" && detail.matches > 0) {
          //   //   detail.selection = detail.results[0];
          //   //   autoCompleteModule.onSelection(detail);
          //   //   autoCompleteModule.resultsList.view.innerHTML = "";
          //   // }
          // });
          jQuery(function(){
            setTimeout(function(){
              console.log('jQuery.ui', jQuery.ui);
              _inputObj.autocomplete({
                source: function(request, response){
                  var
                    _term = request.term,
                    _endpoint = [source, 'query'].join('&');
                  ;
                  jQuery.ajax({
                    url: source,
                    dataType: "json",
                    data: {
                      query: _term
                    },
                    success: function( data ) {
                      console.log(data);
                      var _data = data.map(function(line){
                        return {
                          value: line.id,
                          label: line.displayname
                        };
                      });
                      response( data );
                    }
                  })
                },
                minLength: 3,
                select: function(event, ui){
                  _currentRecord.setCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_item', value: ui.item.id});
                  _inputObj.val('');
                },
                response: function(event, ui) {
                  if (ui.content.length == 1)
                  {
                    _currentRecord.setCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_item', value: ui.content[0].id});
                    _inputObj.val('');
                    jQuery(this).autocomplete('close');
                  }
                },

              });
              var _autocompleteInstance = _inputObj.autocomplete('instance');
              _autocompleteInstance._renderItem = function( ul, item ) {
                var _holderDiv = jQuery('<div class="ui-menu-item-wrapper"></div>');
                _holderDiv.append(item.displayname);
                var _upcCodeDiv = jQuery('<div class="autocomplete-details"><span>UPC Code:</span></div>');
                _upcCodeDiv.append(item.upccode);
                _holderDiv.append(_upcCodeDiv);
                if(!ul.hasClass('autocomplete-list')){
                  ul.addClass('autocomplete-list');
                }
                return jQuery( '<li>' )
                  .attr( 'data-value', item.id )
                  .append(_holderDiv)
                  .appendTo( ul );
              };
              _editorObj.data('has-autocomplete', true);
            }, 1000);
          });
        }
        generateSelectedItemHtml(_currentRecord, _editorObj);
        return [_editorObj[0], _label];
      }
      return null;
    }

    custpage_inventory_check_in_out_machine.isFieldEditableOverride = function(cellIdx, rowIdx){
      //console.log('isFieldEditableOverride', arguments);
      var _fieldId = this.getFormElementName(cellIdx);
      var _return = null;
      var _currentRecord = currentRecordModule.get();
      var _rowCount = _currentRecord.getLineCount({sublistId: 'custpage_inventory_check_in_out'});
      var _isNewRow = _rowCount === rowIdx - 1;
      var _item;
      if(_isNewRow){
        _item = _currentRecord.getCurrentSublistValue({fieldId: 'custpage_item', sublistId: 'custpage_inventory_check_in_out'});
      } else {
        _item = _currentRecord.getSublistValue({fieldId: 'custpage_item', sublistId: 'custpage_inventory_check_in_out', line: rowIdx - 1});
      }
      if(_item){
        var _isSerialItem = isSerialItem(_item);
        switch(_fieldId){
          case 'custpage_quantity':
            _return = !_isSerialItem;
            break;
          case 'custpage_serial_numbers_enter':
            _return = _isSerialItem;
            break;
          default:
        }
      } else if(['custpage_serial_numbers_enter'].indexOf(_fieldId) > -1){
        _return = false;
      }
      return _return;
    }

    custpage_inventory_check_in_out_machine.getDisplayCellContentOverride = function(cellIdx, defaultContent, rowIdx){
      // console.log('getDisplayCellContentOverride', arguments);
      var _fieldId = this.getFormElementName(cellIdx);
      var _isFieldEditable = this.isFieldEditable(cellIdx, rowIdx);
      if(['custpage_serial_numbers_enter'].indexOf(_fieldId) > -1){
        var _currentRecord = currentRecordModule.get();
        var _serialNumbers =  _currentRecord.getCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_serial_numbers'});
        var _rowCount = _currentRecord.getLineCount({sublistId: 'custpage_inventory_check_in_out'});
        var _isNewRow = _rowCount === rowIdx - 1;
        if(!_isFieldEditable){
          return '&nbsp;';
        }
        if(_isNewRow && (typeof _serialNumbers !== 'string' || _serialNumbers.length === 0)){
          return '&nbsp;';
        }
        return generateSerialNumbersListHtml(_currentRecord, undefined, undefined, true, rowIdx-1, _isNewRow).html;
      }
      if(['custpage_item_entry'].indexOf(_fieldId) > -1){
        var _currentRecord = currentRecordModule.get();
        var _rowCount = _currentRecord.getLineCount({sublistId: 'custpage_inventory_check_in_out'});
        var _item = _currentRecord.getCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_item'});
        var _isNewRow = _rowCount === rowIdx - 1;
        if(!_isFieldEditable){
          return '&nbsp;';
        }
        if(_isNewRow && (typeof _item !== 'string' || _item.length === 0)){
          return '&nbsp;';
        }
        return generateSelectedItemHtml(_currentRecord, undefined, rowIdx-1, _isNewRow).html;
      }
      return null;
    }
  }

  function getItem(item){
    if(!_cachedData.items.hasOwnProperty(item)){
      var
        _data = {
          serialNumbers: {}
          , allSerialNumbers: []
        }
        , _search
      ;
      _search = searchModule.create({
        type: 'item',
        filters: [
          ['internalid', 'anyof', [item]]
        ],
        columns:[
          searchModule.createColumn('isserialitem'),
          searchModule.createColumn('inventorynumber', 'inventorynumber'),
          searchModule.createColumn('location', 'inventorynumber'),
          searchModule.createColumn('quantityavailable', 'inventorynumber'),
        ]
      });

      _search.run().each(function(row){
        var _location
          , _qty
          , _serialNumber
        ;
        _data.isSerialItem = row.getValue({name: 'isserialitem'});
        _qty = row.getValue({name: 'quantityavailable', join: 'inventorynumber'});
        if(_qty > 0){
          _location = row.getValue({name: 'location', join: 'inventorynumber'});
          _serialNumber = row.getValue({name: 'inventorynumber', join: 'inventorynumber'});
          if(!_data.serialNumbers.hasOwnProperty(_location)){
            _data.serialNumbers[_location] = []
          }
          _data.serialNumbers[_location].push(_serialNumber);
          _data.allSerialNumbers.push(_serialNumber);
        }
        return true;
      });

      var _rec = recordModule.load({
        type: recordModule.Type.INVENTORY_ITEM,
        id: item
      });
      // _cachedData.items[item] = _rec;
      _cachedData.items[item] = {
        record: _rec,
        search: _data
      };
    }
    return _cachedData.items[item];
  }

  function isSerialNumberUsed(item, serialNumber, location){
    var _itemSearch, _searchList, _found = false;
    if(isSerialItem(item)){
      _itemSearch = getItem(item).search;
      _searchList = location ? _itemSearch.serialNumbers[location] : _itemSearch.allSerialNumbers;
      if(_searchList){
        _found = _searchList.indexOf(serialNumber) > -1;
      }
    }
    return _found;
  }

  function isSerialItem(item){
    var _itemRec, _isSerialItem;
    _itemRec = getItem(item).record;
    _isSerialItem = _itemRec.getValue({fieldId: 'isserialitem'});
    return _isSerialItem;
  }

  function locationChanged(currentRecord){
    var _value = currentRecord.getValue({fieldId: 'custpage_location'});
    if(_value){
      var _search = searchModule.create({
        type: searchModule.Type.INVENTORY_ITEM,
        filters: [['location',searchModule.Operator.ANYOF,_value]],
        columns: ['itemid']
      });

      var _searchData = _search.run().getRange({ start: 0, end: 1000 });

      var _itemField = currentRecord.getCurrentSublistField({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_item'});

      _itemField.removeSelectOption({value : null});
      if(_searchData.length != 0) {
        for(var i in _searchData) {
          _itemField.insertSelectOption({
            value : _searchData[i].id,
            text : _searchData[i].getValue('itemid')
          });
        }
      }

    }
  }

  function checkTypeChanged(currentRecord){
    var
      _checkTypeValue = currentRecord.getValue({fieldId: 'custpage_check_type'})
      , _projectField = currentRecord.getField({fieldId: 'custpage_project'})
      , _isProjectMandatory = { 1: false, 2: true }
    ;
    _projectField.isMandatory = isNaN(parseInt(_checkTypeValue)) ? false : _isProjectMandatory[parseInt(_checkTypeValue)];
  }

  function fieldChanged(scriptContext){
    var _currentRecord = scriptContext.currentRecord
      , _sublistId = scriptContext.sublistId
      , _fieldId = scriptContext.fieldId
      , _line = scriptContext.line
      , _column = scriptContext.column
      , _itemId
      , _item
      , _locationCount
      , _locationId
      , _locationText
      , _locationIds = []
    ;

    if(/custpage_check_type/i.test(_fieldId)){
      checkTypeChanged(_currentRecord);
    } else if(/custpage_location/i.test(_fieldId)){
      //locationChanged(_currentRecord, _fieldId);
    } else if(/custpage_item/i.test(_fieldId)){
      //do logic to notify user that items that is being added does not exists in this location
      _itemId = _currentRecord.getCurrentSublistValue({sublistId: _sublistId, fieldId: _fieldId});
      _locationId = _currentRecord.getValue({sublistId: _sublistId, fieldId: 'custpage_location'});
      _locationText = _currentRecord.getText({sublistId: _sublistId, fieldId: 'custpage_location'});
      if(typeof _itemId === 'string' && _itemId.length > 0 && typeof _locationId === 'string' && _locationId.length > 0){
        _item = getItem(_itemId).record;
        _locationCount = _item.getLineCount({sublistId: 'locations'});
        for(var i = 0; i < _locationCount; i++){
          _locationIds.push(_item.getSublistValue({sublistId: 'locations', fieldId: 'location', line: i}).toString());
        }
        if(_locationIds.indexOf(_locationId) === -1){
          _currentRecord.setCurrentSublistValue({sublistId: _sublistId, fieldId: _fieldId, value: null});
          if(_lastMessage){
            _lastMessage.hide();
            _lastMessage = undefined;
          }
          _lastMessage = uiMessageModule.create({
            type: uiMessageModule.Type.WARNING,
            title: 'Item unavailable in this location',
            message: ['Please make sure that Item that you are trying to add exists in location "', _locationText, '".'].join(''),
            duration: 30 * 1000
          });
          _lastMessage.show();
        }
      }
    }
  }

  function validateLine(scriptContext){
    var _currentRecord
      , _sublistId
      , _item
      , _qty
      , _serialNumbers
      , _itemIsMissing = false
      , _message = '';

    _currentRecord = scriptContext.currentRecord;
    _sublistId = scriptContext.sublistId;
    _item = _currentRecord.getCurrentSublistValue({sublistId: _sublistId, fieldId: 'custpage_item'});
    _qty = _currentRecord.getCurrentSublistValue({sublistId: _sublistId, fieldId: 'custpage_quantity'});
    _serialNumbers = _currentRecord.getCurrentSublistValue({sublistId: _sublistId, fieldId: 'custpage_serial_numbers'});

    if(!_item || (typeof _item === 'string' && _item.length === 0)){
      _message = [_message, '<li>Item</li>'].join('');
      _itemIsMissing = true;
    }
    if(!_qty || (typeof _qty === 'string' && _qty.length === 0)){
      _message = [_message, '<li>Quantity</li>'].join('');
    }
    if(!_itemIsMissing && isSerialItem(_item) && (!_serialNumbers || (typeof _serialNumbers === 'string' && _serialNumbers.length === 0))){
      _message = [_message, '<li>Serial Numbers</li>'].join('');
    }

    if(_message.length > 0){
      if(_lastMessage){
        _lastMessage.hide();
        _lastMessage = undefined;
      }
      _lastMessage = uiMessageModule.create({
        type: uiMessageModule.Type.ERROR,
        title: 'Missing data in added line for fields',
        message: _message,
        duration: 30 * 1000
      });
      _lastMessage.show();
    }

    return _message.length === 0;

  }

  function saveRecord(scriptContext){
    var
      _currentRecord = scriptContext.currentRecord
      , _lineCount = _currentRecord.getLineCount({sublistId: 'custpage_inventory_check_in_out'})
      , _location = _currentRecord.getValue({fieldId: 'custpage_location'})
      ,  _checkTypeValue = _currentRecord.getValue({fieldId: 'custpage_check_type'})
      , _qty
      , _item
      , _serialNumbers
      , _serialNumbersArray
    ;

    for(var i = 0; i < _lineCount; i++){
      _item = _currentRecord.getSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_item', line: i});
      _qty = _currentRecord.getSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_quantity', line: i});
      _serialNumbers = _currentRecord.getSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_serial_numbers', line: i});
      _serialNumbersArray = typeof _serialNumbers === 'string' ? _serialNumbers.split('\\r\\n') : [];
      _serialNumbersArray = _serialNumbersArray.filter(function(serialNumber){
        return typeof serialNumber === 'string' && serialNumber.trim().length > 0;
      });
      _serialNumbersArray = _serialNumbersArray.map(function(serialNumber){
        return serialNumber.trim();
      });
      if(_checkTypeValue == 2){
        _serialNumbersArray = _serialNumbersArray.filter(function(serialNumber){
          return !isSerialNumberUsed(_item, serialNumber.trim(), _location);
        });
      }
      if(_qty != _serialNumbersArray.length){
        _qty = _serialNumbersArray.length;
        _serialNumbers = _serialNumbersArray.join('\\r\\n');
        _currentRecord.selectLine({sublistId: 'custpage_inventory_check_in_out', line: i});
        _currentRecord.setCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_quantity', value: _qty})
        _currentRecord.setCurrentSublistValue({sublistId: 'custpage_inventory_check_in_out', fieldId: 'custpage_serial_numbers', value: _serialNumbers});
        _currentRecord.commitLine({sublistId: 'custpage_inventory_check_in_out'});
      }
    }

    return true;
  }


  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    validateLine: validateLine,
    saveRecord: saveRecord
  }
});