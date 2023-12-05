/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @copyright Blue Banyan Solutions 2018
 */

define(['N/search', 'N/https', 'N/cache', './../Helpers', './../oauth/OAuth', './RestApi', './../model/ErrorDetails'],
    function(searchModule, httpsModule, cacheModule, helpersModule, oAuthModule, restApiModule, errorDetailsModel) {

    /**
     * @module ApiClient
     * @version 0.0.1
     */

    /**
     * Manages low level client-server communications, parameter marshalling, etc. There should not be any need for an
     * application to use this class directly - the *Api and model classes provide the public API for the service. The
     * contents of this file should be regarded as internal but are documented for completeness.
     * @alias module:ApiClient
     * @class
     */
    var _exports = function() {

        /**
         * The base URL against which to resolve every API call's (relative) path.
         * @type {String}
         * @default https://www.docusign.net/restapi
         */
        this.basePath = 'https://www.docusign.net/restapi'.replace(/\/+$/, '');

        /**
         * The base URL override against which to resolve every API call's (relative) path.
         * @type {String}
         * @default undefined
         */
        this.basePathOverride = undefined;


        /**
         * The authentication methods to be included for all API calls.
         * @type {Array.<String>}
         */
        this.authentications = [];
        /**
         * The default HTTP headers to be included for all API calls.
         * @type {Array.<String>}
         * @default {}
         */
        this.defaultHeaders = { 'X-DocuSign-SDK': 'NS' };

        /**
         * If set to false an additional timestamp parameter is added to all API GET calls to
         * prevent browser caching
         * @type {Boolean}
         * @default true
         */
        this.cache = true;

        /**
         * DocuSign account ID key.
         * @type {String}
         * @default undefined
         */
        this.accountId = undefined;

        /**
         * DocuSign environment.
         * @type {String}
         * @default undefined
         */
        this.environment = undefined;

        /**
         * If set to true auto authentication will apply
         * @type {boolean}
         * @default false
         */
        this.autoAuth = false;

    };

    _exports.prototype.setupFromRecord = function(){
        var _self = this;
        var _columns = [];
        for(var key in _exports.NSFields){
            if(_exports.NSFields.hasOwnProperty(key)){
                _columns.push({name: _exports.NSFields[key]});
            }
        }
        var _search = searchModule.create({
            type: _exports.NSAccountRecord,
            filters: [['isinactive', 'is', 'F']],
            columns: _columns
        });
        var _record = _search.run().getRange({start: 0, end: 1})[0];
        if(typeof _record !== 'undefined'){
            var _accountId = _record.getValue({name: _exports.NSFields.ACCOUNT_ID});
            var _clientId = _record.getValue({name: _exports.NSFields.INTEGRATION_KEY});
            var _rsaKey = _record.getValue({name: _exports.NSFields.RSA_KEY});
            var _userId = _record.getValue({name: _exports.NSFields.USER_ID});
            var _env = _record.getText({name: _exports.NSFields.ENV});
            var _baseUrlOverride = _record.getValue({name: _exports.NSFields.BASE_URL_OVERRIDE});
            _self.setEnvironment(_env);
            _self.setAccountId(_accountId);
            _self.setBasePath(restApiModule.BasePath[_env]);
            if(/prod/i.test(_env) && typeof _baseUrlOverride === 'string' && _baseUrlOverride.trim().length > 0){
              _self.basePathOverride =  [
                /^http/i.test(_baseUrlOverride.trim()) ? '' : 'https://'
                , _baseUrlOverride.trim().replace(/\/+$/g, '')
                , '/restapi'
                ].join('');
            }
            if(_self.authentications && _self.authentications.length > 0){
                _self.authentications.forEach(function(auth){
                    if(typeof auth.setClientId === 'function'){
                        auth.setClientId(_clientId);
                    }
                    if(typeof auth.setScope === 'function'){
                        auth.setScope([oAuthModule.Scope.SIGNATURE, oAuthModule.Scope.IMPERSONATION]);
                    }
                    if(typeof auth.setUserId === 'function'){
                        auth.setUserId(_userId);
                    }
                    if(typeof auth.setPrivateKey === 'function'){
                        auth.setPrivateKey(_rsaKey);
                    }
                });
            }
        }
        return this;
    };

    _exports.prototype.getEnvironment = function(){
        return this.environment;
    };

    _exports.prototype.setEnvironment = function(environment){
        this.environment = environment;
        return this;
    };

    _exports.prototype.getAccountId = function(){
        return this.accountId;
    };

    _exports.prototype.setAccountId = function(accountId){
        this.accountId = accountId;
        return this;
    };

    _exports.prototype.getAutoAuth = function(){
        return this.autoAuth;
    };

    _exports.prototype.setAutoAuth = function(autoAuth){
        this.autoAuth = autoAuth;
        return this;
    };

    /**
     * Gets the API endpoint base URL.
     */
    _exports.prototype.getBasePath = function () {
        return this.basePath;
    };

    /**
     * Sets the API endpoint base URL.
     */
    _exports.prototype.setBasePath = function (basePath) {
        this.basePath = basePath;
        return this;
    };

    _exports.prototype.addAuthentication = function(authentication){
        if(!(this.authentications instanceof Array)){
            this.authentications = [];
        }
        this.authentications.push(authentication);
        return this;
    };

    /**
     * Adds request headers to the API client. Useful for Authentication.
     */
    _exports.prototype.addDefaultHeader = function (header, value) {
        this.defaultHeaders[header] = value;
        return this;
    };

    /**
     * Chooses a content type from the given array, with JSON preferred; i.e. return JSON if included, otherwise return the first.
     * @param {Array.<String>} contentTypes
     * @returns {String} The chosen content type, preferring JSON.
     */
    _exports.prototype.jsonPreferredMime = function(contentTypes) {
        for (var i = 0; i < contentTypes.length; i++) {
            if (helpersModule.isJsonMime(contentTypes[i])) {
                return contentTypes[i];
            }
        }
        return contentTypes[0];
    };

    /**
     * Applies authentication headers to the request.
     * @param {Object} request The request object.
     */
    _exports.prototype.applyAuthToRequest = function(request) {
        var _self = this;
        if(typeof request.headers === 'undefined'){
            request.headers = {};
        }
        if(typeof request.params === 'undefined'){
            request.params = {};
        }
        _self.authentications.forEach(function(auth) {
            if(typeof auth.applyAuthToRequest === 'function'){
                auth.applyAuthToRequest(request)
            }
            // switch (_auth.type) {
            //     case 'basic':
            //         if (_auth.username || _auth.password) {
            //             var _token = encodeModule.convert({
            //                 string: [_auth.username, _auth.password].join(':'),
            //                 inputEncoding: encodeModule.Encoding.UTF_8,
            //                 outputEncoding: encodeModule.Encoding.BASE_64
            //             });
            //             request.headers['Authorization'] = ['Basic', _token].join(' ');
            //         }
            //         break;
            //     case 'apiKey':
            //         if (_auth.apiKey) {
            //             var _data = {};
            //             if (_auth.apiKeyPrefix) {
            //                 _data[_auth.name] = _auth.apiKeyPrefix + ' ' + _auth.apiKey;
            //             } else {
            //                 _data[_auth.name] = _auth.apiKey;
            //             }
            //             if (_auth['in'] === 'header') {
            //                 request.headers[_auth.name] = _data[_auth.name];
            //             } else {
            //                 request.params[_auth.name] = _data[_auth.name];
            //             }
            //         }
            //         break;
            //     case 'oauth2':
            //         if (_auth.accessToken) {
            //             request.headers['Authorization'] = ['Bearer', _auth.accessToken].join(' ');
            //         }
            //         break;
            //     default:
            //         throw new Error('Unknown authentication type: ' + _auth.type);
            // }
        });
    };

    /**
     * Deserializes an HTTP response body into a value of the specified type.
     * @param {Object} response A SuperAgent response object.
     * @param {(String|Array.<String>|Object.<String, Object>|Function)} returnType The type to return. Pass a string for simple types
     * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
     * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
     * all properties on <code>data<code> will be converted to this type.
     * @returns A value of the specified type.
     */
    _exports.prototype.deserialize = function (status, response, returnType) {
        if (status == null || returnType == null || status === 204) {
            return null;
        }
        if(typeof response !== 'undefined' && response != null && typeof status !== 'undefined' && status != null && ['200', '201', '304'].indexOf(status.toString()) > -1){
            return helpersModule.convertToType(response, returnType);
        }
        return helpersModule.convertToType(response, errorDetailsModel);
    };

    /**
     * Callback function to receive the result of the operation.
     * @callback module:ApiClient~callApiCallback
     * @param {String} error Error message, if any.
     * @param data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Invokes the REST service using the supplied settings and parameters.
     * @param {String} path The base URL to invoke.
     * @param {String} httpMethod The HTTP method to use.
     * @param {Object.<String, String>} pathParams A map of path parameters and their values.
     * @param {Object.<String, Object>} queryParams A map of query parameters and their values.
     * @param {Object.<String, Object>} headerParams A map of header parameters and their values.
     * @param {Object.<String, Object>} formParams A map of form parameters and their values.
     * @param {Object} bodyParam The value to pass as the request body.
     * @param {Array.<String>} authNames An array of authentication type names.
     * @param {Array.<String>} contentTypes An array of request MIME types.
     * @param {Array.<String>} accepts An array of acceptable response MIME types.
     * @param {(String|Array|Object|Function)} returnType The required type to return; can be a string for simple types or the
     * constructor for a complex type.
     * @returns {Object} The SuperAgent request object.
     */
    _exports.prototype.callApi = function callApi(path, httpMethod, pathParams,
                                                 queryParams, headerParams, formParams, bodyParam, contentTypes, accepts,
                                                 returnType) {

        var _self = this;
        if (typeof _self.accountId === 'undefined' || _self.accountId == null) {
            throw new Error("Missing the required parameter 'accountId' when calling endpoint.");
        }

        if(_self.autoAuth && _self.isExpired()){
            _self.authenticate()
        }

        pathParams = helpersModule.mergeObjects({}, pathParams, { 'accountId': _self.accountId });
        var _url = helpersModule.buildUrl(this.basePathOverride || this.basePath, path, pathParams);
        var _request = {
            method: httpMethod,
            url: _url,
            headers: headerParams
        };

        // apply authentications
        _self.applyAuthToRequest(_request);

        // set query parameters
        if (httpMethod.toUpperCase() === 'GET' && this.cache === false) {
            queryParams['_'] = new Date().getTime();
        }
        _request.params = helpersModule.mergeObjects({}, _request.params, helpersModule.normalizeParams(queryParams));

        // set header parameters
        _request.headers = helpersModule.mergeObjects({}, _request.headers, this.defaultHeaders, helpersModule.normalizeParams(headerParams));

        var _contentType = this.jsonPreferredMime(contentTypes);
        if (_contentType) {
            if(_contentType !== 'multipart/form-data') {
                _request.headers['Content-Type'] = _contentType;
            }
        } else if (!_request.headers['Content-Type']) {
            _request.headers['Content-Type'] = 'application/json';
        }

        if (_contentType === 'application/x-www-form-urlencoded') {
            _request.body = helpersModule.normalizeParams(formParams);
        } else if (bodyParam) {
            _request.body = JSON.stringify(helpersModule.removeNulls(bodyParam));
        }

        var _accept = this.jsonPreferredMime(accepts);
        if (_accept) {
            _request.headers['Accept'] = _accept;
        }

        // format query string and update url
        _request.url = [_request.url, helpersModule.formatQueryString(_request.params)].join('');
        delete _request.params;
		log.debug('_request', _request);
        var _response = httpsModule.request(_request);
        var _body = {};
        try {
            _body = JSON.parse(_response.body);
        } catch (e) {
            log.audit('Empty response body with 200 HTTP code', JSON.stringify(_response));
        }
        return _self.deserialize(_response.code, _body, returnType);
    };

    /**
     * @param {String} accessToken the bearer token to use to authenticate for this call.
     * @return {module:model/UserInfo} OAuth UserInfo model
     */
    _exports.prototype.getUserInfo = function() {
        var _oAuthBasePath = oAuthModule.deriveOAuthBasePathFromRestBasePath(this.basePath);
        var _request = {
            method: 'GET',
            url: ['https://', _oAuthBasePath, '/oauth/userinfo'].join('')
        };
        this.applyAuthToRequest(_request);

        var _response = httpsModule.request(_request);
        var _body = JSON.parse(_response.body);
        return this.deserialize(_response.code, _body, oAuthModule.UserInfo);
    };

    _exports.prototype.authenticate = function(){
        var _self = this;
        var _cache = cacheModule.getCache({name: 'dsApiAuth'});
        _self.authentications.forEach(function(auth){
            if(typeof auth.getJWTUri === 'function') {
              log.debug('Obtain consent', auth.getJWTUri(_self.basePath, 'https://localhost'));
            }
            if(typeof auth.buildAuthenticationRequest === 'function'){
                var _cachedAuth = undefined;
                var _key = undefined;
                if(typeof auth.getUniqueAuthKey === 'function'){
                    _key = auth.getUniqueAuthKey(_self.basePath);
                    _cachedAuth = _cache.get({key: _key});
                }
                var _body = undefined;
                if(typeof _cachedAuth !== 'string'){
                    var _request = auth.buildAuthenticationRequest(_self.basePath);
                    var _response = httpsModule.request(_request);
                    _body = JSON.parse(_response.body);
                    auth.deserialize(_body);
                    if(typeof auth.getToken === 'function'){
                        var _token = auth.getToken();
                        if(!isNaN(_token.expiresIn) && _token.expiresIn > 0) {
                            // correction 10% auth expiry
                            var _ttl = parseInt((_token.expiresIn * 0.9).toFixed(0));
                            if(!isNaN(_ttl) && _ttl > 0) {
                                log.debug('auth saved to cache', JSON.stringify({key: _key, value: _response.body, ttl: _ttl}));
                                _cache.put({key: _key, value: _response.body, ttl: _ttl})
                            }
                        }
                    }
                } else {
                    log.debug('auth loaded from cache', _cachedAuth);
                    _body = JSON.parse(_cachedAuth);
                    auth.deserialize(_body);
                }
            }
        });
    };

    /**
     * Returns if there is a valid auth and if it is expired
     * @returns {boolean}
     */
    _exports.prototype.isExpired = function(){
        var _self = this;
        var _isExpired = false;
        if(!(_self.authentications instanceof Array)) return _isExpired;
        _self.authentications.forEach(function(auth){
            if(typeof auth.isExpired === 'function'){
                if(!_isExpired){
                    _isExpired = auth.isExpired();
                }
            }
        });
        return _isExpired;
    };

    /**
     * Constructs a new map or array model from REST data.
     * @param data {Object|Array} The REST data.
     * @param obj {Object|Array} The target object or array.
     * @param {(String|Array.<String>|Object.<String, Object>|Function)} itemType The type to return. Pass a string for simple types
     * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
     * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
     * all properties on <code>data<code> will be converted to this type.
     */
    _exports.constructFromObject = function(data, obj, itemType) {
        if (Array.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                if (data.hasOwnProperty(i))
                    obj[i] = helpersModule.convertToType(data[i], itemType);
            }
        } else {
            for (var k in data) {
                if (data.hasOwnProperty(k))
                    obj[k] = helpersModule.convertToType(data[k], itemType);
            }
        }
    };

    _exports.NSAccountRecord = 'customrecord_bb_ds_integr_account';
    _exports.NSFields = {
        ACCOUNT_ID: 'custrecord_bb_ds_integr_account_id',
        INTEGRATION_KEY: 'custrecord_bb_ds_integr_key',
        USER_ID: 'custrecord_bb_ds_integr_user_id',
        ENV: 'custrecord_bb_ds_integr_environment',
        BASE_URL_OVERRIDE: 'custrecord_bb_ds_integr_baseurl',
        RSA_KEY: 'custrecord_bb_ds_integr_rsa_prv_key'
    };

    Object.freeze(_exports.NSFields);

    _exports.instance = new _exports();

    return _exports;
});