/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @author Nicholas Radzykewycz, Michael Golichenko
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

define(['../libs/typedarray', '/SuiteScripts/BB SS/API Logs/API_Log', '../BB.SS.MD.FlatToObjConvert', '/SuiteScripts/BB SS/SS Lib/bb_framework_all', 'N/url']
  , function(typedArrayModule, apiLogModule, convertModule, bbFrameworkModule, url){


  var 
    _medeekSystemCredentials
  ;


  function getLoads(data){
    var
      _path
      , _data = data
      , _request
      , _apiLogResponse
      , _response = null
      , _isValid = false
    ;
	//log.debug('medeektest',_data)
    if(_data){
      _isValid = true;
	  _path = url.format({
		domain: _medeekSystemCredentials.getBaseUrl(),
		params: {
			key: _medeekSystemCredentials.getToken(),
			action: _data.action,
			output: 'json',
			lat: _data.lat,
			lng: _data.lng
			}
		});
    }
	log.debug('medeekpathtest',_path)
    if(_isValid) {
      _apiLogResponse = apiLogModule.get({url: _path});
      _response = _apiLogResponse.response;
      try {
        if(_response.code === 200){
          _response = JSON.parse(_response.body);
		  _response = convertModule.objectToFlat(_response);
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
  
  function setSystemCredentials(str){
    if(typeof str === 'string' && str.trim().length > 0){
      _medeekSystemCredentials = new APICredentialsSs2().init(str);
    }
  }
  
  return {
    name: 'Medeek'
    , getLoads: getLoads
	, setSystemCredentials: setSystemCredentials
  }
});
