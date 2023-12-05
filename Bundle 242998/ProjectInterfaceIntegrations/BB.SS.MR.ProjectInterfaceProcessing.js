/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */
define(['N/record', 'N/search', 'N/runtime', 'N/file', 'N/format'
  ],
    function (recordModule, searchModule, runtimeModule, fileModule, formatModule
    ) {

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

        function getConfigData(){
            var
              _script = runtimeModule.getCurrentScript()
              , _integrationId = _script.getParameter({name: 'custscript_integration_system'})
              , _integrationModule = _integrationId ? searchModule.lookupFields({
                  type: 'customrecord_system_credentials'
                  , id: _integrationId
                  , columns: ['name', 'custrecord_system_integration_module']
              }) : null
              , _integrationName = typeof _integrationModule.name === 'string'  && _integrationModule.name.trim().length > 0
                        ? _integrationModule.name
                        : null
              , _file = _integrationModule.custrecord_system_integration_module[0]
                        ? _integrationModule.custrecord_system_integration_module[0].value : null
              , _funcName = _script.getParameter({name: 'custscript_integration_function'})
              , _integration //= _file ? _moduleMap[_file] : null
            ;
            if(_file){
                _file = fileModule.load({id: _file});
                require([_file.path], function(integration){
                    _integration = integration;
                    if(_integration && _integrationName && _integration.setSystemCredentials) {
                      _integration.setSystemCredentials(_integrationName);
                    }
                });
            }

            return {
                integration: _integration
                , func: _funcName && _integration.hasOwnProperty(_funcName) ? _integration[_funcName] : null
                , search: _script.getParameter({name: 'custscript_integration_search'})
                , functionMap: parseMapping(_script.getParameter({name: 'custscript_integration_to_func_map'}))
                , responseMap: parseMapping(_script.getParameter({name: 'custscript_integration_response_map'}), true)
            }
        }

        function mapFrom(obj, mapping){
            var
              _result = {}
              , _to
              , _from
              ;
            for(var key in mapping){
                if(mapping.hasOwnProperty(key)){
                    _to = mapping[key];
                    // check if key is a string parameter
                    if(/^[',"].+[',"]$/ig.test(key)) {
                      _result[_to] = key.replace(/^[',"]+|[',"]+$/ig, '');
                    } else {
                      if(obj && obj.row && obj.row.values && obj.row.values.hasOwnProperty(key)){
                        _result[_to] = util.isObject(obj.row.values[key]) ? obj.row.values[key].value : obj.row.values[key];
                      } else if(obj && obj.columns instanceof Array && obj.columns.filter(function(col){ return col.meta.label === key})[0]) {
                        _from = obj.columns.filter(function(col){ return col.meta.label === key})[0];
                        _result[_to] = _from.value;
                      } else {
                        log.debug('NOT_FOUND: '+ key, obj);
                      }
                    }
                }
            }

            return _result;
        }

        function getInputData() {
            var
              _config = getConfigData()
              , _search
              , _data
              , _column
              , _result = []
            ;

            _search = searchModule.load({ id: _config.search });
            var _count = _search.runPaged().count;
            var _searchResults = _search.run();
            while (_result.length < _count && _count!=0) {
                var _segmentResults = _searchResults.getRange({
                    start: _result.length,
                    end: _result.length+1000
                });
              	for (var i = 0; i < _segmentResults.length; i++) {
              	//_segmentResults.each(function(row){
              		var row = _segmentResults[i];
                    _data = {
                        row : row
                        , columns: []
                    };
                    for (var idx = 0; idx < row.columns.length; idx++){
                        _column = {
                            text: row.getText(row.columns[idx])
                            , value: row.getValue(row.columns[idx])
                            , meta: row.columns[idx]
                        };
                        _data.columns.push(_column);
                    }
                    _result.push(_data);
                };
            }
            return _result;
        }

        function map(context) {
            var
              _obj = JSON.parse(context.value)
              , _data
              , _config = getConfigData()
              , _result
              , _rec
              , _field
              , _value
              , _recordType = _obj.row.recordType
              , _recordId = _obj.row.id
            ;
            log.debug('config data',_config );
            if(_config.func){
                _data = mapFrom(_obj, _config.functionMap);
                if(_data.receive_mapping_record_type && _data.receive_mapping_record_id) {
                  _recordType = _data.receive_mapping_record_type;
                  _recordId = _data.receive_mapping_record_id;
                  delete _data.receive_mapping_record_type;
                  delete _data.receive_mapping_record_id;
                }
                _result = _config.func(_data);
                if(_result){
                    _result = mapFrom({row: {values:_result}}, _config.responseMap);
                    try {
                        _rec = recordModule.load({type: _recordType, id: _recordId});
                        for(var key in _result){
                            if(_result.hasOwnProperty(key)){
                                _field = _rec.getField({fieldId: key});
                                if(_field) {
                                  if(/date|time/i.test(_field.type)){
                                    _value = new Date(_result[key]);
                                    // _value = formatModule.format({value: _value, type: _field.type});
                                  } else if(/currency|integer|float|percent/i.test(_field.type)) {
                                    _value = _result[key];
                                    if(typeof _value === 'string'){
                                      _value = _value.replace(/[^0-9.]/, '').replace(',', '');
                                      _value = Number(_value);
                                      if(isNaN(_value)){
                                        _value = null;
                                      }
                                    }
                                  } else {
                                    _value = _result[key];
                                  }
                                  _rec.setValue({fieldId: key, value: _value});
                                } else {
                                  log.debug('UPDATE_FIELD_NOT_FOUND', key);
                                  log.debug('UPDATE_FIELD_NOT_FOUND_DATA', _result[key]);
                                }
                            }
                        }
                        _rec.save({ignoreMandatoryFields: true});
                        // recordModule.submitFields({
                        //     type: _obj.row.recordType
                        //     , id: _obj.row.id
                        //     , values: _result
                        // });
                    } catch(ex) {
                        log.debug('UPDATE_PROJECT_INTERFACE_FAILED', ex);
                        log.debug('UPDATE_PROJECT_INTERFACE_DATA', _result);
                    }
                }
            } else {
                if(!_module){
                    throw 'No module is mapped';
                }
                if(!_func){
                    throw ['No function is available by name "', _func, '".'].join('');
                }
            }
        }

        function reduce(context) {

        }

        function summarize(summary) {

        }

        return {
            getInputData: getInputData,
            map: map,
            //reduce: reduce,
            //summarize: summarize
        }
    });
