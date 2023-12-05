/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Taos Transue, Michael Golichenko
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
    , '../../BB SS/SS Lib/bb_framework_all', 'N/encode', 'N/url', 'N/file', 'N/record', 'N/search']
  , function (cacheModule, typedArrayModule, apiLogModule, convertModule
    , bbFrameworkModule, encode, urlModule, fileModule, recordModule, searchModule) {

    const
      ENDPOINT = {
        AUTH: '/Token'
        , GET_PRODUCTS: '/v2/Product/GetAvailableProducts'
        , PLACE_ORDER: '/v2/Order/PlaceOrder'
        , GET_REPORT_FILE: '/v1/File/GetReportFile'
        , UPDATE_REPORT_ADDRESS: '/v2/Report/UpdateReportAddress'
        , NEED_TO_ID: '/NeedToId'
        , CLOSE_REPORT: '/v2/Report/CloseReport'
        , GET_REPORT: '/v2/Report/GetReport'
      }
      , TYPE_MAP = {
        '5' : {
          format: 5
          , extension: 'dxf'
          , fileType: fileModule.Type.AUTOCAD
        }
        , '2' : {
          format: 2
          , extension: 'pdf'
          , fileType: fileModule.Type.PDF
        }
      }
      , FILE_MAP = {
        '26': TYPE_MAP['5']
      , '8': TYPE_MAP['2']
      , '132': TYPE_MAP['2']
      }
    ;

    var
      _eagleviewSystemCredentials
    ;

    function createFolder(name, parentId){
      var _record = recordModule.create({type: recordModule.Type.FOLDER});
      _record.setValue({ fieldId:'name', value:name });
      if(parentId) {
        _record.setValue({ fieldId:'parent', value:parentId });
      }
      return _record.save();
    }

    function getFolder(name, parentId){
      var
        _id
        , _filters = [["name", "is", name]]
      ;

      if(parentId) {
        _filters.push('and');
        _filters.push(['parent', 'is', parentId])
      }

      searchModule.create({
        type: searchModule.Type.FOLDER,
        filters: _filters,
        columns: ["parent"]
      }).run().each(function(r){ _id = r.id; });
      if(!_id) _id = createFolder(name, parentId);
      return _id;
    }

    function getReportFile(data) {
      var
        _path
        , _data = data
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
        , _map = FILE_MAP[data.fileType]
        , _fileFormat = ! data.fileFormat && _map ? _map.format : data.fileFormat
      ;
      _path = [_eagleviewSystemCredentials.getBaseUrl(), ENDPOINT.GET_REPORT_FILE].join('');
      if(data.id && data.reportId && data.fileType && _fileFormat) {
        _path = urlModule.format({
          domain: _path,
          params: {
            reportId: data.reportId
            , fileType: data.fileType
            , fileFormat: _fileFormat
          }
        });

        _request = authenticate(_path);
        if (_request) {
          _isValid = true;
        }
      }


      if (_isValid) {
        log.debug('_request', _request);
        _apiLogResponse = apiLogModule.get(_request);
        _response = _apiLogResponse.response;
        try {
          if (_response.code === 200) {
            var _folder = getFolder('ProjectInterfaceFiles');
            _folder = getFolder(_eagleviewSystemCredentials.getSystem(), _folder);
            _folder = getFolder(data.id.toString(), _folder);
            var _file = fileModule.create({
              name: [data.reportId, '-', data.fileType, '-', new Date().getTime(), '.', _map.extension].join(''),
              fileType: _map.fileType,
              contents: _response.body,
              encoding: fileModule.Encoding.BASE_64,
              folder: _folder,
              isOnline: false
            });
            _file = _file.save();

            log.debug('_file', _file);
            log.debug('data', data);
            if(_file && data.id) {
              log.debug('attach', '');
              recordModule.attach({
                record: {
                  type: 'file',
                  id: _file
                },
                to: {
                  type: 'customrecord_bb_ss_project_interface',
                  id: data.id
                }
              });
            }

            // log.debug('response', _response);
            // log.debug('_response body type', typeof _response.body);
            // log.debug('_response body', _response.body);
          } else {
            log.debug('RESPONSE_INVALID_RESPONSE', _response);
            _response = null;
          }
        } catch (ex) {
          log.debug('RESPONSE_NOT_PROCESSED', _response);
          log.debug('ERROR', ex);
          _response = null;
        }
      }
      return _response;
    }

    function PlaceOrder(data) {
      log.debug('Start');
      var
        _path
        , _data = convertModule.flatToObject(data)
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
      ;
      _path = [_eagleviewSystemCredentials.getBaseUrl(), ENDPOINT.PLACE_ORDER].join('');
      _request = authenticate(_path, _data);
      if (_request) {
        _isValid = true;
      }

      if (_isValid) {
        log.debug('_request', _request);
        _apiLogResponse = apiLogModule.post(_request);
        _response = _apiLogResponse.response;
        try {
          if (_response.code === 200) {
            _response = JSON.parse(_response.body);
            _response = convertModule.objectToFlat(_response);
            log.debug('_response', _response);
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

    function updateReportAddress(data) {
      log.debug('Start');
      var
        _path
        , _data = convertModule.flatToObject(data)
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
      ;
      _path = [_eagleviewSystemCredentials.getBaseUrl(), ENDPOINT.UPDATE_REPORT_ADDRESS].join('');
      if(_data.reportId) {
        _path = urlModule.format({
          domain: _path,
          params: {
            reportId: _data.reportId
          }
        });
        delete _data.reportId;
        _data.AddressType = parseInt(_data.AddressType);
        _request = authenticate(_path, _data);
        if (_request) {
          _isValid = true;
        }
      }

      if (_isValid) {
        log.debug('_request', _request);
        _apiLogResponse = apiLogModule.post(_request);
        _response = _apiLogResponse.response;
        try {
          if (_response.code === 200) {
            _response = JSON.parse(_response.body);
            _response = convertModule.objectToFlat(_response);
            log.debug('_response', _response);
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

    function needToId(data) {
      var
        _path
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
      ;
      _path = [_eagleviewSystemCredentials.getBaseUrl(), ENDPOINT.NEED_TO_ID].join('');
      if(data.RefId && data.ReportId && data.VerifyId) {
        _path = urlModule.format({
          domain: _path,
          params: {
            RefId: data.RefId
            , ReportId: data.ReportId
            , VerifyId: data.VerifyId
          }
        });

        _request = authenticate(_path);
        if (_request) {
          _isValid = true;
        }
      }

      if (_isValid) {
        log.debug('_request', _request);
        _apiLogResponse = apiLogModule.get(_request);
        _response = _apiLogResponse.response;
        try {
          if (_response.code === 200) {
            _response = {status: 'OK'};
          } else {
            log.debug('RESPONSE_INVALID_RESPONSE', _response);
            _response = null;
          }
        } catch (ex) {
          log.debug('RESPONSE_NOT_PROCESSED', _response);
          log.debug('ERROR', ex);
          _response = null;
        }
      }
      return _response;
    }

    function getAvalableProducts(data) {
      log.debug('Start');
      var
        _path
        , _data = convertModule.flatToObject(data)
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
      ;
      _path = [_eagleviewSystemCredentials.getBaseUrl(), ENDPOINT.GET_PRODUCTS].join('');
      _request = authenticate(_path, _data);
      if (_request) {
        _isValid = true;
      }

      if (_isValid) {
        log.debug('_request', _request);
        _apiLogResponse = apiLogModule.post(_request);
        _response = _apiLogResponse.response;
        try {
          if (_response.code === 200) {
            _response = JSON.parse(_response.body);
            _response = convertModule.objectToFlat(_response);
            log.debug('_response', _response);
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

    function closeReport(data) {
      log.debug('Start');
      var
        _path
        , _data = convertModule.flatToObject(data)
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
      ;
      _path = [_eagleviewSystemCredentials.getBaseUrl(), ENDPOINT.CLOSE_REPORT].join('');
      if(_data.reportId){
        _path = urlModule.format({
          domain: _path,
          params: {
            reportId: data.reportId
          }
        });
        _request = authenticate(_path);
        if (_request) {
          _isValid = true;
        }
      }

      if (_isValid) {
        log.debug('_request', _request);
        _apiLogResponse = apiLogModule.post(_request);
        _response = _apiLogResponse.response;
        try {
          if (_response.code === 200) {
            _response = {status: 'OK'};
            log.debug('_response', _response);
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

    function getReport(data) {
      var
        _path
        , _data = data
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
      ;
      if(data.reportId) {
        _path = urlModule.format({
          domain: [_eagleviewSystemCredentials.getBaseUrl(), ENDPOINT.GET_REPORT].join(''),
          params: {
            reportId: data.reportId
          }
        });

        _request = authenticate(_path);
        if (_request) {
          _isValid = true;
        }
      }
      if(_isValid) {
        _apiLogResponse = apiLogModule.get(_request);
        _response = _apiLogResponse.response;
        try {
          if (_response.code === 200) {
            _response = JSON.parse(_response.body);
            _response = convertModule.objectToFlat(_response);
            log.debug('_response', _response);
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

    function authenticate(path, body) {
      log.debug('authenticate')
      var
        _apiToken = getApiToken()
        , _request = {
          url: path
          , body: body
          , headers: {
            'Content-Type': 'application/json'
            , 'Authorization': ['Bearer', _apiToken.access_token].join(' ')
          }
        };
      if(!_apiToken) {
        return null;
      }
      return _request;
    }

    function getApiToken() {
      log.debug('getApiToken')
      var
        _apiToken
        , _basePath = _eagleviewSystemCredentials.getBaseUrl()
        , _username = _eagleviewSystemCredentials.getUsername()
        , _pass = _eagleviewSystemCredentials.getPassword()
        , _defaultHeaders = tryParseJson(_eagleviewSystemCredentials.getValue('custrecord_system_default_settings'))
        , _sourceId = _defaultHeaders && _defaultHeaders.header ?  _defaultHeaders.header.SourceID : ''
        , _clientSecret = _defaultHeaders && _defaultHeaders.header ?  _defaultHeaders.header.ClientSecret : ''
        , _request = {
          url: [_basePath, ENDPOINT.AUTH].join('')
          , body:
            [
              'grant_type=password'
              , '&username=', _username
              , '&password=', _pass
            ].join('')
          , headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            ,'Authorization': 'Basic '+ base64(_sourceId+':'+_clientSecret)
            // ,'Authorization': 'Basic MEVBMzE4M0MtREEzRS0xRTIxLTg5MDktNjRBMzI5QUNGNkY5OlBLQ1E0QlBWS0RQRk1XWEMwOUk3TDkwQjAxN0RTQkpOWktPVTgyRTVaV0U3VDY5U1M2NU9UUzM4UTczV1RBMFo='
          }
        }
        , _response
        , _cache
      ;
      log.debug('_defaultHeaders', _defaultHeaders);
      log.debug('_sourceId', _sourceId);
      log.debug('_clientSecret', _clientSecret);
      log.debug('request', _request);
      log.debug('cache name', ['eagleview', _eagleviewSystemCredentials.getSystem()].join('-'));
      _cache = cacheModule.getCache({
        name: ['eagleview', _eagleviewSystemCredentials.getSystem()].join('-'),
        scope: cacheModule.Scope.PUBLIC
      });

      _apiToken = _cache.get({
        key: _username,
        loader: function () {
          // log.debug('request', _request);
          _response = apiLogModule.post(_request);
          _response = _response.response;
          try {
            if (_response.code === 200) {
              _response = _response.body;
            } else {
              log.debug('RESPONSE_API_TOKEN_INVALID_RESPONSE', _response);
              _response = null;
            }
          } catch (ex) {
            log.debug('RESPONSE_API_TOKEN_NOT_PROCESSED', _response);
            _response = null;
          }
          return _response;
        },
        ttl: 60 * 60 * 1.9
      });

      if (!_apiToken) {
        _cache.remove({key: _username});
      }

      if(typeof _apiToken === 'string') {
        _apiToken = JSON.parse(_apiToken);
      }
      log.debug('_apiToken', _apiToken);
      return _apiToken;
    }

    function tryParseJson(str) {
      var _data = undefined;

      try {
        _data = JSON.parse(str);
      } catch(e) {}

      return _data;
    }

    function base64(str){
      log.debug('base64');
      return encode.convert({
        string: str,
        inputEncoding: encode.Encoding.UTF_8,
        outputEncoding: encode.Encoding.BASE_64
      });
    }

    function setSystemCredentials(str) {
      if (typeof str === 'string' && str.trim().length > 0) {
        _eagleviewSystemCredentials = new APICredentialsSs2().init(str);
      }
    }

    return {
      name: 'eagleview'
      , setSystemCredentials: setSystemCredentials
      , getAvalableProducts: getAvalableProducts
      , PlaceOrder: PlaceOrder
      , getReportFile: getReportFile
      , updateReportAddress: updateReportAddress
      , needToId: needToId
      , closeReport: closeReport
      , getReport: getReport
    }
  });