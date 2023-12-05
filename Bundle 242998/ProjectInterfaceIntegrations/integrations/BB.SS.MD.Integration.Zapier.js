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

define(['../libs/typedarray', '../../BB SS/API Logs/API_Log', '../BB.SS.MD.FlatToObjConvert', '../../BB SS/SS Lib/bb_framework_all']
  , function(typedArrayModule, apiLogModule, convertModule, bbFrameworkModule){


    var
      _systemCredentials
    ;

    const
      ENDPOINTS = {
        SEND_LEADS: '/9024558/ockwc64/'
      }
      ;


    function postData(endpoint, data){
      var
        _data = convertModule.flatToObject(data)
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
      ;
      if(_data){
        _isValid = true;
        _request = authenticate(endpoint, _data);
      }
      if(_isValid) {
        _apiLogResponse = apiLogModule.post(_request);
        _response = _apiLogResponse.response;
        try {
          if(_response.code === 200){
            _response = JSON.parse(_response.body);
            _response = convertModule.objectToFlat(_response);
          } else {
            log.debug('RESPONSE_INVALID_RESPONSE', _response);
            _response = null;
          }
        } catch(ex) {
          log.debug('RESPONSE_NOT_PROCESSED', _response);
          _response = null;
        }
      }
      return _response;
    }

    function getData(endpoint, data){
      var
        _data = convertModule.flatToObject(data)
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
        , _endpoint = null
      ;
      if(_data){
        _isValid = true;
        _endpoint = endpoint;
        for(var key in _data){
          if(_data.hasOwnProperty(key)){
            _endpoint = _endpoint.replace(['{', key, '}'].join(''), _data[key]);
          }
        }
        _request = authenticate(_endpoint);
      }
      if(_isValid) {
        _apiLogResponse = apiLogModule.get(_request);
        _response = _apiLogResponse.response;
        try {
          if(_response.code === 200){
            _response = JSON.parse(_response.body);
            return _response;
          } else {
            log.debug('RESPONSE_INVALID_RESPONSE', _response);
            _response = null;
          }
        } catch(ex) {
          log.debug('RESPONSE_NOT_PROCESSED', _response);
          _response = null;
        }
      }
      return _response;
    }

    function GenericPost(data) {
      var _endpoint = data.endpoint;
      if(typeof _endpoint === 'string') {
        _endpoint = _endpoint.replace(/^\/+|\/+$/g, '');
        if(_endpoint.trim().length > 0) {
          delete data.endpoint;
          return postData(_endpoint, data);
        }
      }
      return null;
    }

    function SendLeadsToZapier(data){
      return postData(ENDPOINTS.SEND_LEADS, data);
    }


    function authenticate(endpoint, body){
      var
        _url = _systemCredentials.getBaseUrl().replace(/^\/+|\/+$/g, '')
        , _request = {
          url: [_url, endpoint].join(''),
          headers: {
            'content-type': 'application/json'
          }
        }
      ;
      if(body){
        _request.body = body;
      }
      return _request;
    }

    function setSystemCredentials(str){
      if(typeof str === 'string' && str.trim().length > 0){
        _systemCredentials = new APICredentialsSs2().init(str);
      }
    }

    return {
      name: 'zapier'
      , authenticate: authenticate
      , setSystemCredentials: setSystemCredentials
      , GenericPost: GenericPost
      , SendLeadsToZapier: SendLeadsToZapier
    }
  });