/**
 * @NApiVersion 2.x
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define([], function(){
    /**
     * The Helpers module.
     * @module Helpers
     * @version 0.0.1
     */

    var _exports = {};
    /**
     * Remove all NULL and empty arrays
     * @param {Object} obj Target object where all NULL values and empty arrays will be removed
     * @returns {Object} Cleaned object.
     */
    _exports.removeNulls = function(obj) {
        var _isArray = obj instanceof Array;
        for (var k in obj) {
            if (typeof obj[k] === "object") _exports.removeNulls(obj[k]);
            if (_isArray && obj.length === k) _exports.removeNulls(obj);
            if (obj[k] instanceof Array && obj[k].length === 0) delete obj[k];
        }
        return obj;
    };

    /**
     * Builds query string from data object
     * @param {Object} obj Object containing data for building the query string
     * @returns {string} Query string value
     */
    _exports.formatQueryString = function(obj){
        var _queryString = '';
        if(typeof obj !== 'object' || obj === null){
            return _queryString;
        }
        for(var prop in obj){
            if(obj.hasOwnProperty(prop) && typeof obj[prop] !== 'undefined'){
                if(obj[prop] instanceof Array){
                    var _arrayProp = [prop, '[]'].join('');
                    obj[prop].forEach(function(value){
                        _queryString = [_queryString, [_arrayProp, value].join('=')].join('&');
                    });
                } else {
                    _queryString = [_queryString, [prop, obj[prop]].join('=')].join('&');
                }
            }
        }
        return ['?', _queryString].join('');
    };

    /**
     * Merges source objects into target object.
     * @param {Object} target The target object that other objects will be merged in.
     * @param {[Object]} sources The source 1...n objects that will be merged into target object.
     * @returns {Object} Target object merged from other objects.
     */
    _exports.mergeObjects = function(){
        var _args = Array.prototype.slice.call(arguments);
        var _target = _args[0];
        for(var i = 1; i < _args.length; i++){
            if(typeof _args[i] !== 'object' || _args[i] === null){
                continue;
            }
            for(var prop in _args[i]){
                if(_args[i].hasOwnProperty(prop)){
                    _target[prop] = _args[i][prop];
                }
            }
        }
        return  _target;
    };

    /**
     * Parses an ISO-8601 string representation of a date value.
     * @param {String} str The date value as a string.
     * @returns {Date} The parsed date object.
     */
    _exports.parseDate = function(str) {
        return new Date(str.replace(/T/i, ' '));
    };

    /**
     * Converts a value to the specified type.
     * @param {(String|Object)} data The data to convert, as a string or object.
     * @param {(String|Array.<String>|Object.<String, Object>|Function)} type The type to return. Pass a string for simple types
     * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
     * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
     * all properties on <code>data<code> will be converted to this type.
     * @returns An instance of the specified type.
     */
    _exports.convertToType = function(data, type) {
        switch (type) {
            case 'Boolean':
                return Boolean(data);
            case 'Integer':
                return parseInt(data, 10);
            case 'Number':
                return parseFloat(data);
            case 'String':
                return String(data);
            case 'Date':
                return this.parseDate(String(data));
            default:
                if (type === Object) {
                    // generic object, return directly
                    return data;
                } else if (typeof type === 'function') {
                    // for model type like: User
                    return type.constructFromObject(data);
                } else if (Array.isArray(type)) {
                    // for array type like: ['String']
                    var itemType = type[0];
                    return data.map(function(item) {
                        return _exports.convertToType(item, itemType);
                    });
                } else if (typeof type === 'object') {
                    // for plain object type like: {'String': 'Integer'}
                    var keyType, valueType;
                    for (var k in type) {
                        if (type.hasOwnProperty(k)) {
                            keyType = k;
                            valueType = type[k];
                            break;
                        }
                    }
                    var result = {};
                    for (var k in data) {
                        if (data.hasOwnProperty(k)) {
                            var key = _exports.convertToType(k, keyType);
                            var value = _exports.convertToType(data[k], valueType);
                            result[key] = value;
                        }
                    }
                    return result;
                } else {
                    // for unknown type, return the data directly
                    return data;
                }
        }
    };

    /**
     * Returns a string representation for an actual parameter.
     * @param param The actual parameter.
     * @returns {String} The string representation of <code>param</code>.
     */
    _exports.paramToString = function(param) {
        if (param == undefined || param == null) {
            return '';
        }
        if (param instanceof Date) {
            return param.toJSON();
        }
        return param.toString();
    };

    /**
     * Normalizes parameter values:
     * <ul>
     * <li>remove nils</li>
     * <li>keep files and arrays</li>
     * <li>format to string with `paramToString` for other cases</li>
     * </ul>
     * @param {Object.<String, Object>} params The parameters as object properties.
     * @returns {Object.<String, Object>} normalized parameters.
     */
    _exports.normalizeParams = function(params) {
        var _newParams = {};
        for (var key in params) {
            if (params.hasOwnProperty(key) && params[key] != undefined && params[key] != null) {
                var _value = params[key];
                if (Array.isArray(_value)) {
                    _newParams[key] = _value;
                } else {
                    _newParams[key] = _exports.paramToString(_value);
                }
            }
        }
        return _newParams;
    };

    /**
     * Builds full URL by appending the given path to the base URL and replacing path parameter place-holders with parameter values.
     * NOTE: query parameters are not handled here.
     * @param {String} basePath The base URL.
     * @param {String} path The path to append to the base URL.
     * @param {Object} pathParams The parameter values to append.
     * @returns {String} The encoded path with parameter values substituted.
     */
    _exports.buildUrl = function(basePath, path, pathParams) {
        if (!path.match(/^\//)) {
            path = '/' + path;
        }
        var _url = basePath + path;
        _url = _url.replace(/\{([\w-]+)\}/g, function(fullMatch, key) {
            var _value;
            if (pathParams.hasOwnProperty(key)) {
                _value = _exports.paramToString(pathParams[key]);
            } else {
                _value = fullMatch;
            }
            //return encodeURIComponent(_value);
            return _value;
        });
        return _url;
    };

    /**
     * Checks whether the given content type represents JSON.<br>
     * JSON content type examples:<br>
     * <ul>
     * <li>application/json</li>
     * <li>application/json; charset=UTF8</li>
     * <li>APPLICATION/JSON</li>
     * </ul>
     * @param {String} contentType The MIME content type to check.
     * @returns {Boolean} <code>true</code> if <code>contentType</code> represents JSON, otherwise <code>false</code>.
     */
    _exports.isJsonMime = function(contentType) {
        return Boolean(contentType != null && contentType.match(/^application\/json(;.*)?$/i));
    };

    /**
     * Enumeration of collection format separator strategies.
     * @enum {String}
     * @readonly
     */
    _exports.CollectionFormatEnum = {
        /**
         * Comma-separated values. Value: <code>csv</code>
         * @const
         */
        CSV: ',',
        /**
         * Space-separated values. Value: <code>ssv</code>
         * @const
         */
        SSV: ' ',
        /**
         * Tab-separated values. Value: <code>tsv</code>
         * @const
         */
        TSV: '\t',
        /**
         * Pipe(|)-separated values. Value: <code>pipes</code>
         * @const
         */
        PIPES: '|',
        /**
         * Native array. Value: <code>multi</code>
         * @const
         */
        MULTI: 'multi'
    };

    /**
     * Builds a string representation of an array-type actual parameter, according to the given collection format.
     * @param {Array} param An array parameter.
     * @param {module:ApiClient.CollectionFormatEnum} collectionFormat The array element separator strategy.
     * @returns {String|Array} A string representation of the supplied collection, using the specified delimiter. Returns
     * <code>param</code> as is if <code>collectionFormat</code> is <code>multi</code>.
     */
    _exports.buildCollectionParam = function (param, collectionFormat) {
        if (param == null) {
            return null;
        }
        switch (collectionFormat) {
            case 'csv':
                return param.map(_exports.paramToString).join(_exports.CollectionFormatEnum.CSV);
            case 'ssv':
                return param.map(_exports.paramToString).join(_exports.CollectionFormatEnum.SSV);
            case 'tsv':
                return param.map(_exports.paramToString).join(_exports.CollectionFormatEnum.TSV);
            case 'pipes':
                return param.map(_exports.paramToString).join(_exports.CollectionFormatEnum.PIPES);
            case 'multi':
                // return the array directly as SuperAgent will handle it as expected
                return param.map(_exports.paramToString);
            default:
                throw new Error('Unknown collection format: ' + collectionFormat);
        }
    };

    return _exports;
});