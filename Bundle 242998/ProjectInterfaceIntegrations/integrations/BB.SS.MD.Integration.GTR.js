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
    , '../../BB SS/SS Lib/bb_framework_all', 'N/encode']
  , function (cacheModule, typedArrayModule, apiLogModule, convertModule
    , bbFrameworkModule, encodeModule) {

    const
      ENDPOINT = {
        LEAD: ''
        , PM: '/advocatechangestage'
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

    function leadWebhook(data){
      return postData(ENDPOINT.LEAD, data);
    }

    function pmWebhook(data){
      return postData(ENDPOINT.PM, data);
    }

    function authenticate(path, body) {
      var
        _apiToken = _systemCredentials.getToken()
        , _username = _systemCredentials.getUsername()
        , _request = {
          url: path
          , body: body
          , headers: {
            'Content-Type': 'application/json'
          }
        };
      if(!_apiToken || !_username) {
        return null;
      }
      _request.body['authtoken'] = encodeModule.convert({
        string: _apiToken,
        inputEncoding: encodeModule.Encoding.UTF_8,
        outputEncoding: encodeModule.Encoding.BASE_64
      });;
      _request.body['companyid'] = _username;
      return _request;
    }

    function setSystemCredentials(str) {
      if (typeof str === 'string' && str.trim().length > 0) {
        _systemCredentials = new APICredentialsSs2().init(str);
      }
    }

    return {
      name: 'GTR'
      , setSystemCredentials: setSystemCredentials
      , leadWebhook: leadWebhook
      , pmWebhook: pmWebhook
    }
  });