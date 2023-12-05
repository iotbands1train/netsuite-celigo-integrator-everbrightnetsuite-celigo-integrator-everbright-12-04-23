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
        CREATE_USER: '/v1/users'
        , CREATE_INSTALL: '/v1/ob/installs'
        , MILESTONE_UPDATE: '/v1/titan/action/milestones/update'
        , CREATE_TASK: '/v1/tasks'
        , GET_TASKS: '/v1/tasks/{customerId}'
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

    function createTask(data){
      return postData(ENDPOINTS.CREATE_TASK, data);
    }

    function getTasks(data){
      return getData(ENDPOINTS.GET_TASKS, data);
    }

    function createUser(data){
      return postData(ENDPOINTS.CREATE_USER, data);
    }

    function createInstall(data){
      return postData(ENDPOINTS.CREATE_INSTALL, data);
    }

    function milestoneUpdate(data){
      return postData(ENDPOINTS.MILESTONE_UPDATE, data);
    }


    function authenticate(endpoint, body){
      log.debug('_systemCredentials Base Url', _systemCredentials.getBaseUrl());
      log.debug('_systemCredentials API key', _systemCredentials.getToken());
      log.debug('endpoint', endpoint);
      var
        _url = _systemCredentials.getBaseUrl()
        , _request = {
          url: [_url, endpoint].join(''),
          headers: {
            'api-key': _systemCredentials.getToken(),
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
      name: 'enerflo'
      , authenticate: authenticate
      , setSystemCredentials: setSystemCredentials
      , createTask: createTask
      , getTasks: getTasks
      , createUser: createUser
      , createInstall: createInstall
      , milestoneUpdate: milestoneUpdate
    }
  });