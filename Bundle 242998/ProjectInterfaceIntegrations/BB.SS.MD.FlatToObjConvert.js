/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([],function() {

  if (!Object.keys) {
    Object.keys = (function() {
      'use strict';
      var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({
          toString: null
        }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

      return function(obj) {
        if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
          throw new TypeError('Object.keys called on non-object');
        }

        var result = [],
          prop, i;

        for (prop in obj) {
          if (hasOwnProperty.call(obj, prop)) {
            result.push(prop);
          }
        }

        if (hasDontEnumBug) {
          for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
          }
        }
        return result;
      };
    }());
  }

  function parseDotNotation(str, val, obj) {
    var
      _currentObj = obj
      , _keys = str.split(".")
      , _key = _keys[0]
      , _arrayKey
      , _match
      , _idx
      , _lastKey = _keys[_keys.length - 1]
      , _lastKeyIsArray = _lastKey && /(.+)\[(\d+)\]$/.test(_lastKey)
    ;
    var i, l = _keys.length - (_lastKeyIsArray ? 0 : 1);

    for (i = 0; i < l; i++) {
      _key = _keys[i];
      if(/(.+)\[(\d+)\]$/.test(_key)){
        _match = /(.+)\[(\d+)\]$/.exec(_key);
        _arrayKey = _match[1];
        _idx = parseInt(_match[2]);
        if(!(_currentObj[_arrayKey] instanceof Array)){
          _currentObj[_arrayKey] = []
        }
        if(_currentObj[_arrayKey][_idx]) {
          _currentObj[_arrayKey][_idx] = _currentObj[_arrayKey][_idx];
          _currentObj = _currentObj[_arrayKey][_idx];
        } else if(_lastKeyIsArray && i === l-1) {
          _currentObj = _currentObj[_arrayKey];
        } else {
          _currentObj[_arrayKey][_idx] = {};
          _currentObj = _currentObj[_arrayKey][_idx];
        }

      } else {
        _currentObj[_key] = _currentObj[_key] || {};
        _currentObj = _currentObj[_key];
      }
    }

    if(_lastKeyIsArray) {
      _match = /(.+)\[(\d+)\]$/.exec(_lastKey);
      _arrayKey = _match[1];
      _idx = parseInt(_match[2]);
      if(!(_currentObj instanceof Array)){
        _currentObj = []
      }
      _currentObj[_idx] = val;
    } else {
      _currentObj[_keys[i]] = val;
    }
  }

  function createDotNotation(cur, prop, result, skipJson) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      if (!skipJson) {
        result[prop] = JSON.stringify(cur);
      }
      for (var i = 0, l = cur.length; i < l; i++) {
        createDotNotation(cur[i], prop + "[" + i + "]", result, skipJson);
      }
    } else {
      var isEmpty = true;
      for (var p in cur) {
        isEmpty = false;
        createDotNotation(cur[p], prop ? prop + "." + p : p, result, skipJson);
      }
      if (isEmpty && prop) {
        result[prop] = "";
      }
      if (!isEmpty && prop) {
        if (!skipJson) {
          result[prop] = JSON.stringify(cur);
        }
      }
    }
  }

  function clearEmptyArraysValues(data){
    var _valid;
    if(data instanceof Array){
      data = data.filter(function(d){
        return typeof clearEmptyArraysValues(d) !== 'undefined';
      })
      return data.length > 0 ? data : undefined;
    } else if(data instanceof Object) {
      for(var key in data){
        if(data.hasOwnProperty(key)) {
          data[key] = clearEmptyArraysValues(data[key]);
          if(typeof data[key] !== 'undefined' && data[key] != null) {
            _valid = true;
          }
        }
      }
      if(_valid) {
        return data;
      }
    } else if(typeof data !== 'undefined' && data != null) {
      return data
    }
    return undefined;
  }

  function toObject(data){
    var _result = {};
    for (var key in data) {
      if(data.hasOwnProperty(key)) {
        parseDotNotation(key, data[key], _result);
      }
    }
    _result = clearEmptyArraysValues(_result);
    return _result;
  }

  function toFlat(data, skipJson){
      var result = {};
      createDotNotation(data, "", result, skipJson);
      return result;
  }

  function mapFrom(obj, mapping) {
    var
      _result = {},
      _to, _from;
    for (var key in mapping) {
      if (mapping.hasOwnProperty(key)) {
        _to = mapping[key];
        // check if key is a string parameter
        if (/^[',"].+[',"]$/ig.test(key)) {
          _result[_to] = key.replace(/^[',"]+|[',"]+$/ig, '');
        } else {
          if (obj && obj.row && obj.row.values) {
            if (obj.row.values.hasOwnProperty(key)) {
              _result[_to] = util.isObject(obj.row.values[key]) ? obj.row.values[key].value : obj.row.values[key];
              continue;
            }
            if (/\[.*\]/.test(key)) {
              var _keys = Object.keys(obj.row.values);
              _keys.forEach(function(k) {
                var _tk = key.replace(/\[[^.]*\]/ig, '\\[(.*)\\]');
                var _tok = _to.split('[]');
                var _ttk = '';
                _to.split('[]').forEach(function(s, idx, arr) {
                  _ttk += idx + 1 < arr.length ? [s, '\[$', idx + 1, '\]'].join('') : s;
                });

                if (new RegExp(_tk).test(k)) {
                  var _match = k.match(new RegExp(_tk));
                  var _st = k.replace(new RegExp(_tk), _ttk);
                  _result[_st] = obj.row.values[k];
                }
              })
              continue;
            }

            log.debug('NOT_FOUND: ' + key, obj);



          } else if (obj && obj.columns instanceof Array && obj.columns.filter(function(col) {
            return col.meta.label === key
          })[0]) {
            _from = obj.columns.filter(function(col) {
              return col.meta.label === key
            })[0];
            _result[_to] = _from.value;
          } else {
            log.debug('NOT_FOUND: ' + key, obj);
          }
        }
      }
    }

    return _result;
  }

  function groupObject(obj, arr) {
    if (!util.isObject(obj)) {
      if (arr instanceof Array) {
        arr.push(obj);
      }
      return;
    }
    var _keys = Object.keys(obj);
    var _groupKey = _keys.filter(function(k) { return  /\[.*\]/.test(k); })[0];

    if (!_groupKey && arr instanceof Array) {
      arr.push(JSON.parse(JSON.stringify(obj)));
      return;
    }

    var _groupField = _groupKey ? _groupKey.match(/\[(.*)\]/)[1] : '';
    var _foundObj = util.isObject(arr) ?
      arr :
      arr.filter(function(a) { return a[_groupField] == obj[_groupField]; })[0];
    if (!_foundObj) {
      _foundObj = {};
      arr.push(_foundObj);
    }
    _keys.forEach(function(k){
      if (/\[.*\]/.test(k)) {
        var _arrKey = k.replace(/\[.*\]/, '');
        if (!_foundObj[_arrKey]) {
          _foundObj[_arrKey] = [];
        }
        groupObject(obj[k], _foundObj[_arrKey]);
      } else {
        if (util.isObject(obj[k])) {
          if (!_foundObj[k]) {
            _foundObj[k] = {};
          }
          groupObject(obj[k], _foundObj[k])
        } else {
          _foundObj[k] = obj[k];
        }
      }
    });
  }

  return {
    flatToObject: toObject,
    objectToFlat: toFlat,
    keys: Object.keys,
    mapFrom: mapFrom,
    groupObject: groupObject
  }

});