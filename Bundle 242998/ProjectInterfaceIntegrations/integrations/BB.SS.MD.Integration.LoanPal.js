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

define(['N/xml', '../libs/typedarray', '../libs/aws-auth', '../libs/mime', '../../BB SS/API Logs/API_Log', '../../BB SS/SS Lib/bb_framework_all', 'SuiteBundles/Bundle 207067/BB/S3/Lib/BB.S3']
  , function (xmlModule, typedArrayModule, awsAuthModule, mimeModule, apiLogModule, bbFrameworkModule, s3Module) {

    var
      _loanpalSystemCredentials
    ;

    Object.flatten = function (data) {
      var result = {};

      function recurse(cur, prop) {
        if (Object(cur) !== cur) {
          result[prop] = cur;
        } else if (Array.isArray(cur)) {
          result[prop] = JSON.stringify(cur);
          for (var i = 0, l = cur.length; i < l; i++) {
            recurse(cur[i], prop + "[" + i + "]");
          }
        } else {
          var isEmpty = true;
          for (var p in cur) {
            isEmpty = false;
            recurse(cur[p], prop ? prop + "." + p : p);
          }
          if (isEmpty && prop) {
            result[prop] = "";
          }
          if (!isEmpty && prop) {
            result[prop] = JSON.stringify(cur);
          }
        }
      }

      recurse(data, "");
      return result;
    }

    function getAwsFiles(service, prefix){
      var
        _expirationSec = 60
        , _presignedUrl
        , _fileResponse
        , _xmlFilesDocument
        , _files = []
      ;
      _presignedUrl = service.getPresignedListUrl(prefix, _expirationSec);
      _fileResponse  = apiLogModule.get({ url: _presignedUrl });

      if (_fileResponse.response.code / 100 !== 2) {
        throw ["Error occurred calling Amazon (", _fileResponse.response.code, ").", "\n", _fileResponse.response.body].join('');
      }

      _xmlFilesDocument = xmlModule.Parser.fromString({ text : _fileResponse.response.body.replace('xmlns="http://s3.amazonaws.com/doc/2006-03-01/"', '') });
      _files = xmlModule.XPath
        .select({ node : _xmlFilesDocument, xpath: '/ListBucketResult/Contents/Key' })
        .map(function(node){
          return node.textContent;
        });

      return _files instanceof Array && _files.length > 0 ? _files : false;
    }

    function moveFilesCall(service, source, destination){
      var
        _request
        , _response
      ;
      service._service = 'execute-api';
      service._subService = '5be97ixdik';
      _request = authenticate(
        ['https://', service.getApiGatewayHost().replace(/^\/|\/$/g, ''), '/v1/loanpal/presigned-file-move'].join('')
        , service._region
        , service._service
        , 'PUT'
        , {
          source: source // _s3service.getPresignedUrl(_hicFilePath, 10 * 60)
          , destination: destination // _response.presignedContractUrl
        }
        , service._accessKey
        , service._secretKey
      );
      log.debug('_request api', _request);
      _response = apiLogModule.put(_request);
      log.debug('_response api', _response);
      _response = tryParseJson(_response.response.body);
      return _response;
    }

    function sendHicFiles(data){
      var
        _id = data.id
        , _contract = data.folder
        , _signed = typeof data.signed === 'boolean'
          ? data.signed
          : (typeof data.signed === 'string' ? /t/i.test(data.signed) : false)
        , _supplemental = data.supplemental_folder
        , _supplemental_signed = data.supplemental_signed
        , _isValid = false
        , _s3service
        , _contractFiles
        , _supplementalFiles
        , _hicFilePath
        , _supplementalFilePath
        , _hicFileName
        , _response
        , _request
        , _body = { }
        , _path
        , _responseMove = { };
      ;
      if(_id && (_contract || _supplemental)){
        _isValid = true;
        _path = ['applications', _id, 'hic'].join('/');
      }
      if(_isValid){
        _s3service = new s3Module.Service();
        _s3service.loadCredentials();
        _s3service._service = 's3';

        if(_contract) {
          _contractFiles = getAwsFiles(_s3service, _contract);
          if(_contractFiles){
            _contractFiles = _contractFiles.filter(function(path){
              return /pdf/i.test(path.substring(path.lastIndexOf('.') + 1));
            });
            _hicFilePath = _contractFiles.filter(function(filePath){
              _hicFileName = filePath.substring(filePath.lastIndexOf('/') + 1);
              return /hic|contract/i.test(_hicFileName);
            })[0];
            if(!_hicFilePath){
              _hicFilePath = _contractFiles[0];
            }
            _body.contract = {
              fileType: _hicFilePath.substring(_hicFilePath.lastIndexOf('.') + 1)
              , signed: _signed
            };
          }
        }

        if(_supplemental){
          _supplementalFiles = getAwsFiles(_s3service, _supplemental);
          if(_supplementalFiles){
            _supplementalFiles = _supplementalFiles.filter(function(path){
              return /pdf/i.test(path.substring(path.lastIndexOf('.') + 1));
            });
            _supplementalFilePath = _supplementalFiles[0];
            _body.supplemental = {
              fileType: _supplementalFilePath.substring(_supplementalFilePath.lastIndexOf('.') + 1)
              , signed: _supplemental_signed
            }
          }
        }

        if(_body.contract || _body.supplemental){
          _request = authenticateLoanPal('POST', _path, _body);
          log.debug('_request loanpal', _request);
          _response = apiLogModule.post(_request);
          if(_response.response.code / 100 === 2) {
            _response = tryParseJson(_response.response.body);
            log.debug('_response loanpal', _response);
            if(_response.presignedContractUrl){
              _responseMove.contract = moveFilesCall(
                _s3service
                , _s3service.getPresignedUrl(_hicFilePath, 10 * 60)
                , _response.presignedContractUrl
                );
            }
            if(_response.presignedSupplementalUrl){
              _responseMove.supplemental = moveFilesCall(
                _s3service
                , _s3service.getPresignedUrl(_supplementalFilePath, 10 * 60)
                , _response.presignedSupplementalUrl
              );
            }
          }
        }
      }
      return Object.flatten(_responseMove);
    }

    function getLoan(data) { //19-11-000322
      var
        _id = data.id
        , _path
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
      ;
      if (data.id) {
        _isValid = true;
        _path = ['applications', _id].join('/'); // applications/12345679/status
        _request = authenticateLoanPal('GET', _path);
      }

      if (_isValid) {
        _apiLogResponse = apiLogModule.get(_request);
        _response = _apiLogResponse.response;
        try {
          if (_response.code === 200) {
            _response = JSON.parse(_response.body);
            return Object.flatten(_response);
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

    function getLoanStatus(data) { //19-11-000322
      var
        _id = data.id
        , _path
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
      ;
      if (data.id) {
        _isValid = true;
        _path = ['applications', _id, 'status'].join('/'); // applications/12345679/status
        _request = authenticateLoanPal('GET', _path);
        // _request = authenticationHelpersModule.awsExecuteApiV4(_loanpalSystemCredentials, 'GET', _path);
        // _request.headers['x-api-key'] = _loanpalSystemCredentials.getToken();
      }

      if (_isValid) {
        _apiLogResponse = apiLogModule.get(_request);
        _response = _apiLogResponse.response;
        try {
          if (_response.code === 200) {
            _response = JSON.parse(_response.body);
            if (_response.hasOwnProperty('loanStatus')) {
              return _response.loanStatus;
            }
            return _response;
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

    function setMilestoneComplete(data) {
      var
        _id = data.id
        , _milestone = data.milestone
        , _path
        , _request
        , _apiLogResponse
        , _response = null
        , _isValid = false
        , _body = {
          milestone: _milestone
        }
      ;
      if (_id && _milestone) {
        _isValid = true;
        _path = ['applications', _id, 'milestones'].join('/'); // applications/12345679/milestones
        _request = authenticateLoanPal('POST', _path, _body);
        // _request = authenticationHelpersModule.awsExecuteApiV4(_loanpalSystemCredentials, 'GET', _path);
        // _request.headers['x-api-key'] = _loanpalSystemCredentials.getToken();
      }

      if (_isValid) {
        _apiLogResponse = apiLogModule.post(_request);
        _response = _apiLogResponse.response;
        try {
          if (_response.code === 200) {
            _response = tryParseJson(_response.body);
            if (!_response) {
              _response = {};
            }
            if (!_response.hasOwnProperty('message')) {
              _response.message = 'OK';
            }
            return _response;
          } else if (_response.code === 204) {
            _response = {
              message: 'OK'
            }
          } else {
            log.debug('RESPONSE_INVALID_RESPONSE', _response);
            _response = tryParseJson(_response.body);
            if (!_response) {
              _response = {
                message: 'FAILED'
              }
            }
          }
        } catch (ex) {
          log.debug('RESPONSE_NOT_PROCESSED', _response);
          _response = {
            message: 'FAILED'
          };
        }
      }
      return _response;
    }

    function authenticate(url, region, service, type, body, accessKey, secretKey){
      var
        _credentials = {
          accessKeyId: accessKey,
          secretAccessKey: secretKey
        }
        , _service = new awsAuthModule.Service()
        , _request
        , _date = _service.getSkewCorrectedDate()
        , _signer
        , _result
      ;
      _request = new awsAuthModule.HttpRequest(url, region);
      _request.method = typeof type === 'string' ? type.toUpperCase() : 'GET';
      _request.headers['Host'] = _request.endpoint.host;
      if (body) {
        _request.body = typeof body === 'string' ? body : JSON.stringify(body);
        AWS.util.computeSha256(_request.body, function (err, sha) {
          if (err) {
            log.debug('AWS Auth SHA256 error', err);
          } else {
            _request.headers["X-Amz-Content-Sha256"] = sha;
            _signer = new awsAuthModule.Signers.V4(_request, service);
            _signer.addAuthorization(_credentials, _date);
          }
        });
      } else {
        _signer = new awsAuthModule.Signers.V4(_request, service);
        _signer.addAuthorization(_credentials, _date);
      }
      //log.debug('headers', _request.headers);
      _result = {
        url: url
        , headers: _request.headers
      };
      if (_request.body) {
        _result.body = _request.body;
      }
      return _result;
    }

    function authenticateLoanPal(type, path, body) {
      var
        // _url = 'https://api.loanpal.com/sandbox/restapi/v1/applications/19-11-000322/status'
        _url = [_loanpalSystemCredentials.getBaseUrl().replace(/^\/|\/$/g, ''), path.replace(/^\/|\/$/g, '')].join('/')
        , _region = 'us-west-2'
        , _service = 'execute-api'
        , _credentials = {
          accessKeyId: _loanpalSystemCredentials.getUsername(),
          secretAccessKey: _loanpalSystemCredentials.getPassword()
        }
        , _request
      ;
      _request = authenticate(_url, _region, _service, type, body, _credentials.accessKeyId, _credentials.secretAccessKey);
      _request.headers['x-api-key'] = _loanpalSystemCredentials.getToken();
      return _request;
    }

    function tryParseJson(str) {
      var _result;
      try {
        _result = JSON.parse(str);
      } catch (ex) {
        log.debug('COULD_NOT_PARSE_JSON', str);
      }
      return _result;
    }

    function setSystemCredentials(str){
      if(typeof str === 'string' && str.trim().length > 0){
        _loanpalSystemCredentials = new APICredentialsSs2().init(str);
      }
    }

    return {
      name: 'loanpal'
      , authenticate: authenticate
      , setSystemCredentials: setSystemCredentials
      , getLoanStatus: getLoanStatus
      , setMilestoneComplete: setMilestoneComplete
      , getLoan: getLoan
      , sendHicFiles: sendHicFiles
    }
  });