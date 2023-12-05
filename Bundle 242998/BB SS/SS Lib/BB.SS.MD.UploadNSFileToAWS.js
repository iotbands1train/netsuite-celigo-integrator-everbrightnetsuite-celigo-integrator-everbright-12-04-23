/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Matt Lehman
 * @fileOverview -
 */

define(['N/file', 'N/runtime', 'N/url', 'N/search', 'N/record', 'N/format', 'N/https', '/SuiteBundles/Bundle 207067/BB/S3/Lib/BB.S3', '/SuiteBundles/Bundle 207067/BB/S3/Lib/crypto-js', 'N/crypto', 'N/encode'],

function(fileModule, runtimeModule, urlModule, searchModule, recordModule, formatModule, https, s3, CryptoJS, cryptoModule, encodeModule) {

    var FileTypes = {
        JPG: 'JPGIMAGE',
        PNG: 'PNGIMAGE',
        PDF: 'PDF'
    };

    var S3Acl = {
      'PRIVATE': 'private',
      'READ_ONLY': 'public-read',
      'READ_WRITE': 'public-read-write'
    };

    var _s3Service = new s3.Service();
    var _s3AclService = new s3.Service();

    function uploadSingleNSFileToAWS(nsFile, folderPath) {
        var _aclUpdated,
            _file = nsFile,
            _retries = 0
        ;

        _s3Service.loadCredentials();
        _s3AclService.loadCredentials();
        _s3AclService._service = 'execute-api';
        _s3AclService._subService = getAWSSubServiceId()// 'b403iq76zj' SS id

        // upload file function
        try {
            var _response = uploadFileToAmazon(_file, folderPath);

            if (_response.status && /success/i.test(_response.status)) {
                do {
                    _aclUpdated = processFilesWithAcl(_response.path);
                    _retries++;
                } while (!_aclUpdated && _retries < 3)

                if (!_aclUpdated) {
                    log.error('File fix and ACL update failed', _response);
                } 
            }
        } catch(ex) {
            log.error('FILE_UPLOAD_ERROR', ex);
        }

    }

    
    function uploadFileToAmazon(file, folderPath) {
        var _key,
            _file,
            _content,
            _fileInfo,
            _body,
            _url,
            _result,
            _response,
            _responseAws,
            _retries = 0
        ;

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

        _file = [folderPath, encodeURIComponent(file.name)].join('/'); // replace with project action folder path
        _key = [folderPath, file.name].join('/'); // replace with project action folder path
        _response = {url: undefined};

        _url = _s3Service.getPresignedUrl(_key, 180, 'PUT', null, true);
        _result = https.put({url:_url, body: _content, headers: {'Content-Type': _fileInfo.contentType}});

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
            _response = false;

        try {
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
        log.debug('url string', _requestUrl);

        _amzDate = s3.Service.getAmzDate();
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
        _response = https.request({
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

    function getAWSSubServiceId() {
        var subServiceId = null;
        var customrecord_system_credentialsSearchObj = searchModule.create({
            type: "customrecord_system_credentials",
            filters:
            [
                ["name","contains","aws"]
            ],
            columns:
            [
                "internalid",
                "custrecord_bb_aws_sub_serv_text"
            ]
        });
        var searchResultCount = customrecord_system_credentialsSearchObj.runPaged().count;
        log.debug("customrecord_system_credentialsSearchObj result count",searchResultCount);
        customrecord_system_credentialsSearchObj.run().each(function(result){
            subServiceId = result.getValue({name: 'custrecord_bb_aws_sub_serv_text'});
            return true;
        });
        return subServiceId;
    }


    return {
    	uploadSingleNSFileToAWS: uploadSingleNSFileToAWS
    }
});