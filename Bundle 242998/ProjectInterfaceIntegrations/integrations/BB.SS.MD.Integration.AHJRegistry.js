/**
 * @NModuleScope Public
 * @NApiVersion 2.x
 * @author Taos Transue
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
    _AHJRegistrySystemCredentials
  ;


  function getAhjs(data){
    var
      _path
      , _data = convertModule.flatToObject(data)
      , _request
      , _apiLogResponse
      , _response = null
      , _isValid = false
    ;
    if(_data){
      _isValid = true;
      _path = _AHJRegistrySystemCredentials.getBaseUrl() + 'api/v1/geo/location/';
      _request = authenticate(_path, _data);
    }
    if(_isValid) {
      _apiLogResponse = apiLogModule.post(_request);
      _response = _apiLogResponse.response;
      try {
        if(_response.code === 200){
          _response = JSON.parse(_response.body);
          _response[0]['HTTPResponseCode'] = {};
          _response[0]['HTTPResponseCode'] = {
        		  'Value': 200
        		  };
          _response[0]['HTTPResponseMsg'] = {};
          _response[0]['HTTPResponseMsg'] = {
        		  'Value': 'Success'
        		  };
          _response = convertModule.objectToFlat(_response);
          return _response;
        } else {
          log.debug('RESPONSE_INVALID_RESPONSE', _response);
          var code = _response.code;
          var msg = _response.body;
          var _responseFresh = [];
          _responseFresh[0] = {};
          _responseFresh[0] = {
        		  'HTTPResponseCode' : {'Value': code},
        		  'HTTPResponseMsg' : {'Value': msg}
          };
          _response = _responseFresh;
          _response = convertModule.objectToFlat(_response);
        }
      } catch(ex) {
//    	log.debug('RESPONSE_NOT_PROCESSED', ex);
        log.debug('RESPONSE_NOT_PROCESSED', _response);
        _response = null;
      }
    }
    return _response;
  }

  function authenticate(path, body){
    var _request = {
      url: path,
      body: body,
      headers: {
        'Accept': 'application/json',
        'Authorization':'Token '+_AHJRegistrySystemCredentials.getToken(),
        'content-type': 'application/json'
      }
    }
    return _request;
  }

  function setSystemCredentials(str){
    if(typeof str === 'string' && str.trim().length > 0){
      _AHJRegistrySystemCredentials = new APICredentialsSs2().init(str);
    }
  }

  return {
    name: 'getAhjs'
    , authenticate: authenticate
    , setSystemCredentials: setSystemCredentials
    , getAhjs: getAhjs
  }
});
