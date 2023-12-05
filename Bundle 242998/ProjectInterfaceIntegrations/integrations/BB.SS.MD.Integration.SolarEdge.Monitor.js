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
    , '../../BB SS/SS Lib/bb_framework_all', 'N/url']
  , function (cacheModule, typedArrayModule, apiLogModule, convertModule, urlModule
    , bbFrameworkModule) {

    const
      ENDPOINT = {
        TIME_FRAME_ENERGY: '/site/{siteId}/timeFrameEnergy'
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

    function getData(endpoint, params){
      var
        _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
      ;
      _request = authenticate(endpoint, params);
      if (_request) {
        _isValid = true;
      }
      if (_isValid) {
        _apiLogResponse = apiLogModule.get(_request);
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

    /*
    Example JSON response:
    {
      "timeFrameEnergy":{
        "energy":761985.8,
        "unit":"Wh"
      }
    }
     */
    function timeFrameEnergy(params){
      var _endpoint = ENDPOINT.ADD_DEVICES;
      if(!params.siteId) {
        log.error('SOLAREDGE MANAGE INVALID DATA', 'addDevices is missing siteId');
        return null;
      }
      if(!params.startDate) {
        log.error('SOLAREDGE MANAGE INVALID DATA', 'addDevices is missing startDate');
        return null;
      }
      if(!params.endDate) {
        log.error('SOLAREDGE MANAGE INVALID DATA', 'addDevices is missing endDate');
        return null;
      }
      _endpoint = _endpoint.replace('{siteId}', params.siteId);
      delete params.siteId;
      return getData(_endpoint, params);
    }

    function authenticate(path, params, body) {
      var
        _apiToken = _systemCredentials.getToken()
        , _baseUrl = _systemCredentials.getBaseUrl()
        , _path = [_baseUrl, path].join('')
        , _params = params ?? {}
        , _request = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
      if(!_apiToken){
        return null;
      }
      _params['api_key'] = _apiToken;
      _request.url = urlModule.format({
        domain: _path
        , params: _params
      });
      if(body){
        _request.body = body;
      }
      return _request;
    }

    function setSystemCredentials(str) {
      if (typeof str === 'string' && str.trim().length > 0) {
        _systemCredentials = new APICredentialsSs2().init(str);
      }
    }

    return {
      name: 'SolarEdge.Monitor'
      , setSystemCredentials: setSystemCredentials
      , timeFrameEnergy: timeFrameEnergy
    }
  });