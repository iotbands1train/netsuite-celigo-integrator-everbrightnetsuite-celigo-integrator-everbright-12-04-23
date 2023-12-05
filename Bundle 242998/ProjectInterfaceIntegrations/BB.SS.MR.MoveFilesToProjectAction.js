/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */
define(['N/record', 'N/search', 'N/file', 'N/https', 'N/runtime', 'N/crypto', 'N/encode'
    , '/SuiteBundles/Bundle 207067/BB/S3/Lib/BB.S3', '../BB SS/SS Lib/bb_framework_all'],
  function(recordModule, searchModule, fileModule, httpsModule, runtimeModule, cryptoModule, encodeModule
           , s3Module, bbFrameworkModule) {

    const
      FileTypes = {
        JPG: 'JPGIMAGE',
        PNG: 'PNGIMAGE',
        PDF: 'PDF'
      }
      , S3Acl = {
        'PRIVATE': 'private',
        'READ_ONLY': 'public-read',
        'READ_WRITE': 'public-read-write'
      }
    ;

  function getInputData(){
    var
      _currentScript = runtimeModule.getCurrentScript()
      , _searchId = _currentScript.getParameter({name: 'custscript_pi_move_to_pa_search'})
      , _search
      , _data = {}
      , _columns = {}
    ;

    _search = searchModule.load({id: _searchId});

    _search.columns.forEach(function (column) {
      if(column.label) {
        _columns[column.label] = column;
      }
    });

    _search
      .run()
      .each(function(row){
        _data[row.id] = {
          id: row.id
          , folder: row.getValue(_columns['folder'])
          , file: row.getValue(_columns['file'])
        };
        return true;
      });

    return _data;
  }

  function map(context){
    log.debug('map', context);
    var
      _searchResult = JSON.parse(context.value)
    ;
    context.write(_searchResult.folder, _searchResult.file);
  }

  function reduce(context){
    log.debug('reduce', context);
    context.values.forEach(function(file){
      var _result = uploadFile(file, context.key);
      if(_result.completed) {
        //fileModule.delete({ id: file });
      }
    });
  }

  function summarize(summary){
    // InputSummary
    //log.audit('InputSummary', JSON.stringify(summary.inputSummary));

    /*
     * ERRORS
     */
    if (summary.inputSummary.error)
    {
      log.error('Input Error', summary.inputSummary.error);
    };
    var mapErrorKeys = [];
    var retryFiles = [];
    summary.mapSummary.errors.iterator().each(function (key, mapError)
    {
      log.error('Map Error for key: ' + key, mapError);
      var mErr = mapError;
      try{mErr=JSON.parse(mapError)}catch(e){log.error(e.name,e.message)}
      mapErrorKeys.push(key);
      try{
        var msiFileInfo = mErr.message.substr(0,mErr.message.indexOf('{::}'));
        retryFiles.push(JSON.parse(msiFileInfo));
      }catch (e) {
        log.error(e.name,e.message)
      }
      return true;
    });
    log.debug('map error keys',mapErrorKeys);
    log.audit('map files to retry',retryFiles);
    var reduceErrorKeys = [];
    summary.reduceSummary.errors.iterator().each(function (key, error)
    {
      log.error('Reduce Error for key: ' + key, error);
      reduceErrorKeys.push(key);
      return true;
    });
    log.debug('reduce error keys',reduceErrorKeys);


    // MapSummary
    //log.audit('MapSummary', JSON.stringify(summary.mapSummary));
    // summary
    //log.audit(summary.toString(), JSON.stringify(summary));


    var mapKeys = [];
    var successfulMapKeys = [];
    summary.mapSummary.keys.iterator().each(function (key)
    {
      mapKeys.push(key);
      if(mapErrorKeys.indexOf(key)<0){
        successfulMapKeys.push(key);
      }
      return true;
    });

    //log.audit('MAP keys processed', mapKeys);
    log.audit('MAP keys successfully processed', successfulMapKeys);


    // var reduceKeys = [];
    // var successfulReduceKeys = [];
    // summary.reduceSummary.keys.iterator().each(function (key)
    //     {
    //         reduceKeys.push(key);
    //         if(reduceErrorKeys.indexOf(key)<0){
    //         	successfulReduceKeys.push(key);
    //         }
    //         return true;
    // });
    // //log.audit('REDUCE keys processed', reduceKeys);
    // log.audit('REDUCE keys successfully processed', successfulReduceKeys);


    var contents = '';
    summary.output.iterator().each(function(key, value) {
      // iterator key/value is from the reduce stage context.write(key,value)
      contents += (key + ' ' + value + '\n');
      return true;
    });

  }

  function uploadFile(fileId, basePath){
    var
      _file = fileModule.load({id: fileId})
      , _response
      , _uploaded = false
      , _retries = 0
      , _completed = false
      , _aclUpdated
      , _alreadyUploaded = /aclfailed/i.test(_file.description)
      , _path
    ;

    try {
      log.debug('_alreadyUploaded', _alreadyUploaded);
      if(!_alreadyUploaded) {
        _response = uploadFileToAmazon(_file, basePath);
        if (_response.status && /success/i.test(_response.status)) {
          _path = _response.path;
          _uploaded = true;
        }
      } else {
        _path = _file.description ? _file.description.split('|')[1] : undefined;
      }

      if(_uploaded || (_alreadyUploaded && _path)) {
        do {
          _aclUpdated = processFilesWithAcl(_path);
          _retries++;
        } while (!_aclUpdated && _retries < 3);
        if (!_aclUpdated) {
          _file.description = ['aclfailed', _path].join('|');
          _file.save();
          log.debug('File fix and ACL update failed', _response);
        } else {
          _completed = true;
        }
      }

    } catch(ex){
      log.error('FILE_UPLOAD_ERROR', ex);
    }


    return {
      uploaded: _uploaded
      , completed: _completed
    }
  }

  function uploadFileToAmazon(file, basePath) {
    var _key,
      _file,
      _content,
      _fileInfo,
      _url,
      _result,
      _response,
      _s3Service = new s3Module.Service()
    ;
    _s3Service.loadCredentials();
    try {
      _content = file.getContents();
    } catch (e) {
      throw 'file.getContents(): ' + JSON.stringify(e);
    }
    _fileInfo = (function (fileType) {
      switch (fileType) {
        case FileTypes.PNG:
          return {extension: 'png', contentType: 'image/png'};
        case FileTypes.JPG:
          return {extension: 'jpg', contentType: 'image/jpeg'};
        case FileTypes.PDF:
          return {extension: 'pdf', contentType: 'application/pdf'};
        default:
          return {contentType: 'application/octet-stream'};
      }
    })(file.fileType);
    _file = [basePath, encodeURIComponent(file.name)].join('/');
    _key = [basePath, file.name].join('/');
    _response = {url: undefined};

    _url = _s3Service.getPresignedUrl(_key, 180, 'PUT', null, true);
    _result = httpsModule.put({url:_url, body: _content, headers: {'Content-Type': _fileInfo.contentType}});

    if(_result.code === 200) {
      _response.status = 'success';
      _response.url = ['https:/', _s3Service.getS3Host(), _file].join('/');
      _response.path = _key;
    } else {
      _response = _result;
    }

    return _response;

  }

  function processFilesWithAcl(path) {
    var
      _key = path,
      _body,
      _response = false,
      _s3AclService = new s3Module.Service()
      , _credentialsRecord = new APICredentialsSs2().init('amazon-aws');
    ;



    try {
      _s3AclService.loadCredentials();
      _s3AclService._service = 'execute-api';
      _s3AclService._subService = _credentialsRecord.getValue('custrecord_bb_aws_sub_serv_text');

      _body = {
        acl: S3Acl.READ_ONLY,
        bucket: _s3AclService._bucket,
        key: _key,
      };

      callGatewayApi(_s3AclService, 'POST', '/v1/processobject', _body,
        function (response) {
          log.error('AWS API Gateway', response);
        },
        function (response) {
          log.debug('AWS API Gateway', 'SUCCESS');
          _response = true;
        }
      );
    } catch (e) {
      log.error('error calling s3', e);
    }
    return _response;

  }

  function callGatewayApi(service, method, endpoint, data, error, success) {
    var _host,
      _endpoint,
      _amzDate,
      _authDate,
      _canonicalUri,
      _canonicalQueryString,
      _signHeaders,
      _signedHeaders,
      _payloadHash,
      _signature,
      _credentialScope,
      _authorizationHeader,
      _headers,
      _requestUrl,
      _response,
      _hash;

    _host = service.getApiGatewayHost();
    _host = typeof _host === 'string' ? _host.replace(/^\/|\/$/g, '') : '';
    _endpoint = typeof endpoint === 'string' ? ['/', endpoint.replace(/^\/|\/$/g, '')].join('') : '';
    _requestUrl = ['https://', _host, _endpoint].join('');

    _amzDate = s3Module.Service.getAmzDate();
    _authDate = _amzDate.split("T")[0];
    _canonicalUri = [_endpoint].join('');
    _canonicalQueryString = '';
    // ------------------------------------------------------------------------ //
    // should be in alphabetical order otherwise AWS signature will not match
    // AWS sorts headers alphabetically when generating signature
    // ------------------------------------------------------------------------ //
    _signHeaders = [['host:', _host].join(''), ['x-amz-date:', _amzDate].join('')];
    _signedHeaders = ['host', 'x-amz-date'];
    // ------------------------------------------------------------------------ //
    // _payloadHash = CryptoJS.SHA256(JSON.stringify(data)).toString();
    _hash = cryptoModule.createHash({
      algorithm: cryptoModule.HashAlg.SHA256
    })
    _hash.update({
      input: JSON.stringify(data)
    })
    _payloadHash = _hash.digest({outputEncoding: encodeModule.Encoding.HEX}).toLowerCase();
    _signature = service.getSignature(service._service, method, _canonicalUri, _canonicalQueryString, _signHeaders, _signedHeaders, _payloadHash, _amzDate);
    _credentialScope = [_authDate, service._region, service._service, 'aws4_request'].join('/');
    _authorizationHeader = service.ALGORITHM + ' ' +
      'Credential=' + service._accessKey + '/' + _credentialScope + ',' +
      'SignedHeaders=' + _signedHeaders.join(';') + ',' + 'Signature=' + _signature;

    log.debug('authorizationHeader', _authorizationHeader);

    _headers = {
      'Authorization': _authorizationHeader,
      'Host': _host,
      'x-amz-date': _amzDate,
    };
    if (data) {
      _headers['x-amz-content-sha256'] = _payloadHash;
    }
    // ************* SEND THE REQUEST *************
    _response = httpsModule.request({
      method: method,
      url: _requestUrl,
      body: JSON.stringify(data),
      headers: _headers
    });
    log.audit('S3 Response',_response);

    if (_response.code === 200) {
      success(_response);
    } else {
      error(_response);
    }
    return _response;
  }

  function getFolder(name, parent, createIfNotExists){
    var
      _folderSearchObj
      , _folder
      , _record
      , _filters = [
        ["name","is",name]
      ]
      , _result
    ;
    if(parent){
      _filters.push('AND');
      _filters.push(['parent', 'anyof', parent])
    }
    _folderSearchObj = searchModule.create({
      type: "folder",
      filters: _filters,
      columns:
        [
          "internalid"
        ]
    });
    _folder = _folderSearchObj.run().getRange({start: 0, end: 1})[0];
    _result = _folder ? _folder.id : undefined;
    if(!_result && createIfNotExists){
      _record = recordModule.create({
        type: 'folder'
      });
      _record.setValue({fieldId: 'name', value: name});
      if(parent){
        _record.setValue({fieldId: 'parent', value: parent});
      }
      _result = _record.save();
    }
    return _result;
  }

  return {
    getInputData: getInputData,
    map: map,
    reduce: reduce,
    summarize: summarize,

    config:{
      retryCount: 0,
      // exitOnError: true
    }
  };

});