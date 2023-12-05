/**
 * @NApiVersion 2.x
 * @NModuleScope Public
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

define(['../libs/typedarray', '/SuiteScripts/BB SS/API Logs/API_Log', '../BB.SS.MD.FlatToObjConvert', '/SuiteScripts/BB SS/SS Lib/bb_framework_all']
  , function(typedArrayModule, apiLogModule, convertModule, bbFrameworkModule){


  var 
    _bodhiSystemCredentials
  ;


  function bodhiSendSite(data){
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
      _path = _bodhiSystemCredentials.getBaseUrl();
      //_path = 'https://postman-echo.com/post';
      _request = authenticate(_path, _data);
    }
    if(_isValid) {
      _apiLogResponse = apiLogModule.put(_request);
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

  function authenticate(path, body){
    var _request = {
      url: path,
      body: body,
      headers: {
        'x-api-key': 'test key',
        'content-type': 'application/json'
      }
    }
    return _request;
  }

  function setSystemCredentials(str){
    if(typeof str === 'string' && str.trim().length > 0){
      _bodhiSystemCredentials = new APICredentialsSs2().init(str);
    }
  }

  return {
    name: 'bodhiSendSite'
    , authenticate: authenticate
    , setSystemCredentials: setSystemCredentials
    , bodhiSendSite: bodhiSendSite
  }
});
