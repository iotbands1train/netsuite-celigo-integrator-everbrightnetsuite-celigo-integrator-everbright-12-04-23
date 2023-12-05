/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @version 0.0.1
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

define(['N/cache', '../libs/typedarray', '../../BB SS/API Logs/API_Log', '../BB.SS.MD.FlatToObjConvert'
    , '../../BB SS/SS Lib/bb_framework_all']
  , function (cacheModule, typedArrayModule, apiLogModule, convertModule
    , bbFrameworkModule) {

    const
      ENDPOINT = {
        LOGIN: '/login'
        , CREATE_SITE: '/sites/createSite'
        , ADD_DEVICES: '/equipment/{siteId}/addDevices'
      }
    ;

    var
      _systemCredentials
    ;

    function postData(endpoint, data) {
      var
        _path
        , _data = convertModule.flatToObject(data)
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
      ;
      if (_data) {
        _path = [_systemCredentials.getBaseUrl(), endpoint].join('');
        _request = authenticate(_path, _data);
        if (_request) {
          _isValid = true;
        }
      }
      if (_isValid) {
        // log.debug('_request', _request);
        _apiLogResponse = apiLogModule.post(_request);
        _response = _apiLogResponse.response;
        try {
          if (_response.code === 200) {
            _response = JSON.parse(_response.body);
            _response = convertModule.objectToFlat(_response);
          } else {
            log.debug('RESPONSE_INVALID_RESPONSE', _response);
            _response = null;
          }
        } catch (ex) {
          log.debug('RESPONSE_NOT_PROCESSED', _response);
          _response = null;
        }
      }
      return _response;
    }

    function createSite(data){
      return postData(ENDPOINT.CREATE_SITE, data);
    }

    function addDevices(data){
      var _endpoint = ENDPOINT.ADD_DEVICES;
      if(!data.siteId) {
        log.debug('SOLAREDGE MANAGE INVALID DATA', 'addDevices is missing siteId');
      }
      _endpoint = _endpoint.replace('{siteId}', data.siteId);
      delete data.siteId;
      return postData(_endpoint, data);
    }

    function authenticate(path, body) {
      var
        _username = _systemCredentials.getUsername()
        , _password = _systemCredentials.getPassword()
        , _baseUrl = _systemCredentials.getBaseUrl()
        , _response
        , _request = {
          url: path
          , body: body
          , headers: {
            'Content-Type': 'application/json'
          }
        };
      _response = apiLogModule.post({
        url: [_baseUrl, ENDPOINT.LOGIN].join('')
        , body: {
          j_username: _username
          , j_password: _password
        }
      });

      if(_response.response.code === 200) {
        log.debug('SOLAREDGE MANAGE AUTH', _response.response);
        _request.headers.Cookie = _response.response.headers['Set-Cookie'];
      } else {
        log.debug('SOLAREDGE MANAGE AUTHENTICATION FAILED', _response.response);
        _request = null;
      }
      return _request;
    }

    function setSystemCredentials(str) {
      if (typeof str === 'string' && str.trim().length > 0) {
        _systemCredentials = new APICredentialsSs2().init(str);
      }
    }

    return {
      name: 'SolarEdge.Manage'
      , setSystemCredentials: setSystemCredentials
      , createSite: createSite
      , addDevices: addDevices
    }
  });