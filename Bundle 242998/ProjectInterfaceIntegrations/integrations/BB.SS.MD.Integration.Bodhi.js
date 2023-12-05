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
  , function (typedArrayModule, apiLogModule, convertModule, bbFrameworkModule) {


    var
      _bodhiSystemCredentials
    ;

    const
      ENDPOINTS = {
        SITE: '/contact'
      }
    ;


    function genericPostPut(func, endpoint, data) {
      var
        _path
        , _data = convertModule.flatToObject(data)
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
      ;
      if (_data) {
        _isValid = true;
        //_path = _bodhiSystemCredentials.getBaseUrl();
        //_path = 'https://postman-echo.com/post';
        _request = authenticate(endpoint, _data);
      }
      if (_isValid) {
        _apiLogResponse = func(_request);
        _response = _apiLogResponse.response.toJSON();
        // log.debug('_request', _request);
        // log.debug('func', func);
        try {
          if (_response.code === 200) {
            _response.body = JSON.parse(_response.body);
          } else {
            log.debug('RESPONSE_INVALID_RESPONSE', _response);
          }
        } catch (ex) {
          log.debug('RESPONSE_NOT_PROCESSED', _response);
        }
      }
      return convertModule.objectToFlat(_response);
    }

    function bodhiSendSitePost(data) {
      return genericPostPut(apiLogModule.post, ENDPOINTS.SITE, data);
    }

    function bodhiSendSitePut(data) {
      return genericPostPut(apiLogModule.put, ENDPOINTS.SITE, data);
    }


    function authenticate(endpoint, body) {
      var
        _url = _bodhiSystemCredentials.getBaseUrl().replace(/^\/+|\/+$/g, '')
        , _request = {
          url: [_url, endpoint].join(''),
          body: body,
          headers: {
            'x-api-key': 'test key',
            'content-type': 'application/json'
          }
        }
      return _request;
    }

    function setSystemCredentials(str) {
      if (typeof str === 'string' && str.trim().length > 0) {
        _bodhiSystemCredentials = new APICredentialsSs2().init(str);
      }
    }

    return {
      name: 'bodhiSendSite'
      , authenticate: authenticate
      , setSystemCredentials: setSystemCredentials
      , bodhiSendSitePost: bodhiSendSitePost
      , bodhiSendSitePut: bodhiSendSitePut
    }
  });
