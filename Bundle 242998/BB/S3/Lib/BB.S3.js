/**
 * Contains a module for connecting with Amazon S3. Credentials must be created in the System Credentials
 * record type using 'amazon-aws' as the name.
 *
 * Blue Banyan Solutions, Inc.
 * Copyright 2018
 *
 * @NApiVersion 2.0
 * @NModuleScope Public
 * @author Graham O'Daniel
 */
define(['./crypto-js', './bb_framework_all', './typedarray', './aws-auth', 'N/encode', 'N/https', 'N/xml', 'N/runtime', 'N/query','N/cache'], function(CryptoJS, framework, typedArrayModule, awsAuthModule, encode, https, xml, runtime, query, cache) {
// Safely define the BB.S3 namespace
	var BB = BB || {};
	BB.S3 = BB.S3 || {};
	BB.S3.FileSystem = BB.S3.FileSystem || {};
	var HelperFunctions = HelperFunctions || {};

	/**
	 * Helper function for determining if an object is empty, undefined, or null.
	 *
	 * Expected usage: 0
	 *
	 * @param {any} object The object to test.
	 * @returns {boolean} True if object is empty, undefined, or null. False otherwise.
	 */
	HelperFunctions.isEmpty = function(object) {
		return typeof object === 'undefined' || object === '' || object === null;
	}


  function UriEncode(input, encodeSlash) {
	var result = '';
	input = input ? input : '';
	for (var i = 0; i < input.length; i++) {
		var ch = input.charAt(i);
		if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '_' || ch == '-' || ch == '~' || ch == '.') {
			result += ch;
		} else if (ch == '/') {
			result += (encodeSlash ? "%2F" : ch);
		} else {
			result += encodeURIComponent(ch);
		}
	}
	return result;
}

	/**
	 * UriEncode specific to AWS
	 * https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html
	 *
	 * @param input {string}
	 * @param encodeSlash {boolean}
	 * @returns {string}
	 * @constructor
	 */
	function UriEncode2(input, encodeSlash) {
		var result = '';
		input = input ? input : '';
		for (var i = 0; i < input.length; i++) {
			var ch = input.charAt(i);
			if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '_' || ch == '-' || ch == '~' || ch == '.') {
				result += ch;
			} else if (ch == '/') {
				result += (encodeSlash ? "%2F" : ch);
			} else {
				result += encodeURIComponent(ch);
			}
		}
		return result;
	}

	/**
	 * Formats the query string according to AWS specifications
	 * @param paramStr
	 * @returns {string}
	 * @constructor
	 */
	function UriEncodeQuery(paramStr){
		if(!paramStr || paramStr.length==0) return '';
		var result = '';
		var paramsArry = paramStr.split('&').sort();
		for(var i=0; i<paramsArry.length; i++){
			var paramAr = paramsArry[i].split('=');
			result += UriEncode(paramAr[0],true) + '=' + UriEncode(paramAr[1],true);
		}
		return result;
	}

	/**
	 *	header should be lower case but value remains the same
	 * @param headers  {array} canonicalHeaders Headers to be included in request.
	 */
	function headerFormating(headers){
		// input format expected is 'host:HostString'
		for(var h=0; h<headers.length; h++){
			var header = headers[h].substr(0,headers[h].indexOf(':'));
			headers[h] = headers[h].replace(header,header.toLowerCase());
		}
		return headers;
	}








	BB.S3.Object = function (params) {
		var _bucket = undefined,
			_name = undefined,
			_contentType = undefined,
			_data = undefined,
			_acl = undefined;

		if (params) {
			_bucket = params.bucket;
			_name = params.name;
			_contentType = params.contentType;
			_data = params.data;
			_acl = params.acl;
		}

		Object.defineProperties(this, {
			'bucket': {
				get: function () {
					return _bucket;
				},
				set: function (val) {
					_bucket = val;
				}
			},
			'name': {
				get: function () {
					return _name;
				},
				set: function (val) {
					_name = val;
				}
			},
			'contentType': {
				get: function () {
					return _contentType;
				},
				set: function (val) {
					_contentType = val;
				}
			},
			'data': {
				get: function () {
					return _data;
				},
				set: function (val) {
					_data = val;
				}
			},
			'acl': {
				get: function () {
					return _acl;
				},
				set: function (val) {
					_acl = val;
				}
			}
		});
	}

	BB.S3.Object.prototype.constructor = BB.S3.Object;
	BB.S3.Policy = function (params) {
		var _expiration = undefined,
			_conditions = undefined;

		if (params) {
			_expiration = params.expiration;
			_conditions = params.conditions;
		}

		Object.defineProperties(this, {
			'expiration': {
				enumerable: true,
				get: function() {
					return _expiration;
				},
				set: function(val) {
					_expiration = val
				}
			},
			'conditions': {
				enumerable: true,
				get: function() {
					return _conditions;
				},
				set: function(val) {
					_conditions = val;
				}
			}
		});
	}

	BB.S3.Policy.prototype.constructor = BB.S3.Policy;
	BB.S3.Policy.prototype.toString = function() {
		return JSON.stringify(this);
	}
	BB.S3.Policy.prototype.toBase64 = function() {
		var _this = this,
			_base64 = undefined;

		require(['N/encode'], function(encode) {
			_base64 = encode.convert({
				string: _this.toString(),
				inputEncoding: encode.Encoding.UTF_8,
				outputEncoding: encode.Encoding.BASE_64
			});
		});

		return _base64;
	}

	BB.S3.PutObjectResponse = function (params) {
		var _this = this,
			_status = undefined,
			_url = undefined;

		if (params) {
			_status = params.status;
			_url = params.url;
		}

		Object.defineProperties(this, {
			'status': {
				get: function () {
					return _status;
				},
				set: function (val) {
					_status = val;
				}
			},
			'url': {
				get: function () {
					return _url;
				},
				set: function (val) {
					_url = val;
				}
			}
		});
	}

	BB.S3.PutObjectResponse.prototype.constructor = BB.S3.PutObjectResponse;
	BB.S3.ResponseQueue = function(params) {
		var _internalId = undefined,
			_key = undefined,
			_bucket = undefined,
			_etag = undefined,
			_recordType = undefined,
			_uniqueId = undefined,
			_link = undefined,
			__changes = {
				key: false,
				bucket: false,
				etag: false,
				recordType: false,
				uniqueId: false,
				link: false,
				hasChanges: function() {
					return this.key || this.bucket || this.etag || this.link || this.recordType || this.uniqueId;
				},
				clear: function() {
					this.key = false;
					this.bucket = false;
					this.etag = false;
					this.recordType = false;
					this.uniqueId = false;
					this.link = false;
				}
			};

		Object.defineProperties(this, {
			'internalId': {
				enumerable: true,
				get: function() {
					return _internalId;
				},
				set: function(val) {
					_internalId = val;
				}
			},
			'key': {
				enumerable: true,
				get: function() {
					return _key;
				},
				set: function(val) {
					_key = val;
					__changes.key = true;
				}
			},
			'bucket': {
				enumerable: true,
				get: function() {
					return _bucket;
				},
				set: function(val) {
					_bucket = val;
					__changes.bucket = true;
				}
			},
			'etag': {
				enumerable: true,
				get: function() {
					return _etag;
				},
				set: function(val) {
					_etag = val;
					__changes.etag = true;
				}
			},
			'recordType': {
				enumerable: true,
				get: function() {
					return _recordType;
				},
				set: function(val) {
					_recordType = val;
					__changes.recordType = true;
				}
			},
			'uniqueId': {
				enumerable: true,
				get: function() {
					return _uniqueId;
				},
				set: function(val) {
					_uniqueId = val;
					__changes.uniqueId = true;
				}
			},
			'link': {
				enumerable: true,
				get: function() {
					return _link;
				},
				set: function(val) {
					_link = val;
					__changes.link = true;
				}
			},
			'__changes': {
				enumerable: true,
				get: function() {
					return __changes;
				}
			}
		});

		if (params) {
			this.internalId = params.internalId;
			this.key = params.key;
			this.bucket = params.buck;
			this.etag = params.etag;
			this.recordType = params.recordType;
			this.uniqueId = params.uniqueId;
			this.link = params.link;
		}
	}
	BB.S3.ResponseQueue.TYPE = 'customrecord_bb_response_queue';
	BB.S3.ResponseQueue.Fields = {
		KEY: 'custrecord_bb_resp_que_key_txt',
		BUCKET: 'custrecord_bb_resp_que_bucket_txt',
		ETAG: 'custrecord_bb_resp_que_etag_txt',
		UNIQUE_ID: 'custrecord_bb_resp_que_uuid_txt',
		RECORD_TYPE: 'custrecord_bb_resp_que_rec_type_txt',
		LINK: 'custrecord_bb_resp_que_link'
	}
	BB.S3.ResponseQueue.prototype.constructor = BB.S3.ResponseQueue;

	BB.S3.ResponseQueue.getSearch = function() {
		var _search = undefined;

		require(['N/search'], function(search) {
			_search = search.create({
				type: BB.S3.ResponseQueue.TYPE,
				columns: [
					BB.S3.ResponseQueue.Fields.KEY,
					BB.S3.ResponseQueue.Fields.BUCKET,
					BB.S3.ResponseQueue.Fields.ETAG,
					BB.S3.ResponseQueue.Fields.UNIQUE_ID,
					BB.S3.ResponseQueue.Fields.RECORD_TYPE,
					BB.S3.ResponseQueue.Fields.LINK
				]
			});
		});

		return _search;
	}

	BB.S3.ResponseQueue.prototype.save = function() {
		var _this = this;

		require(['N/record'], function(record) {
			var responseQueue = undefined;
			var isNew = !(_this.internalId);

			if (isNew) {
				responseQueue = record.create({
					type: BB.S3.ResponseQueue.TYPE
				});
			} else {
				responseQueue = record.load({
					type: BB.S3.ResponseQueue.TYPE,
					id: _this.internalId
				});
			}

			if (isNew || _this.__changes.key) {
				responseQueue.setValue({fieldId: BB.S3.ResponseQueue.Fields.KEY, value: _this.key});
			}
			if (isNew || _this.__changes.bucket) {
				responseQueue.setValue({fieldId: BB.S3.ResponseQueue.Fields.BUCKET, value: _this.bucket});
			}
			if (isNew || _this.__changes.etag) {
				responseQueue.setValue({fieldId: BB.S3.ResponseQueue.Fields.ETAG, value: _this.etag});
			}
			if (isNew || _this.__changes.recordType) {
				responseQueue.setValue({fieldId: BB.S3.ResponseQueue.Fields.RECORD_TYPE, value: _this.recordType});
			}
			if (isNew || _this.__changes.uniqueId) {
				responseQueue.setValue({fieldId: BB.S3.ResponseQueue.Fields.UNIQUE_ID, value: _this.uniqueId});
			}
			if (isNew || _this.__changes.link) {
				log.debug('save _this.link', _this.link);
				responseQueue.setValue({fieldId: BB.S3.ResponseQueue.Fields.LINK, value: _this.link});
			}

			_this.internalId = responseQueue.save();
		});

		return _this;
	}

	BB.S3.ResponseQueue.prototype.load = function(internalId) {
		var _this = this;

		_this.internalId = _this.internalId || internalId;

		require(['N/record'], function(record) {
			var responseQueue = record.load({
				type: BB.S3.ResponseQueue.TYPE,
				id: _this.internalId
			});

			_this.key = responseQueue.getValue({fieldId: BB.S3.ResponseQueue.Fields.KEY});
			_this.bucket = responseQueue.getValue({fieldId: BB.S3.ResponseQueue.Fields.BUCKET});
			_this.etag = responseQueue.getValue({fieldId: BB.S3.ResponseQueue.Fields.ETAG});
			_this.link = responseQueue.getValue({fieldId: BB.S3.ResponseQueue.Fields.LINK});
			_this.recordType = responseQueue.getValue({fieldId: BB.S3.ResponseQueue.Fields.RECORD_TYPE});
			_this.uniqueId = responseQueue.getValue({fieldId: BB.S3.ResponseQueue.Fields.UNIQUE_ID});

			if (_this.link && _this.link.substring(0, 8) == 'http:///') {
				_this.link = _this.link.substring(7); // For whatever reason, NS messes with our links
			}
			_this.__changes.clear();
		});

		return _this;
	}

	BB.S3.ResponseQueue.prototype.delete = function(internalId) {
		var _this = this;

		require(['N/record'], function(record) {
			record.delete({
				type: BB.S3.ResponseQueue.TYPE,
				id: _this.internalId
			});
		});
	}
	BB.S3.Service = function() {
		this._accessKey = undefined;
		this._secretKey = undefined;
		this._baseUrl = undefined;
		this._region = undefined;
		this._bucket = undefined;
		this._service = undefined;
		this._subService = undefined;
		this._stage = undefined;

		this.ALGORITHM = 'AWS4-HMAC-SHA256';
	}

	BB.S3.Service.prototype.constructor = BB.S3.Service;

	/**
	 * Helper function to generate host part of URL.
	 *
	 * Expected usage: 0
	 *
	 * @returns {string} Host part of URL.
	 */
	BB.S3.Service.prototype.getApiGatewayHost = function() {
		return [this._subService, this._service, this._region, 'amazonaws.com'].join('.');
	}

	BB.S3.Service.prototype.getS3Host = function() {
		return [this._bucket, 's3', this._region, 'amazonaws.com'].join('.');
	}

	/**
	 * Helper function to generate endpoint URL.
	 *
	 * Expected usage: 0
	 *
	 * @returns {string} URL for the endpoint.
	 */
	BB.S3.Service.prototype.getEndpoint = function() {
		return this._baseUrl;
	}

	/**
	 * Loads the credentials for Amazon using BB credential framework.
	 *
	 * Expected usage: 10
	 */
	BB.S3.Service.prototype.loadCredentials = function() {
		var _credentials = undefined;
       try{
      		var scriptCache = cache.getCache({
				name: 's3Cache',
				scope: cache.Scope.PUBLIC
			});
		// add key/value to cache
		_credentials = scriptCache.get({
			key: 'credentials',
			loader: function(){
				var sql = 'SELECT '+
                'custrecord_bludoc_username as accesskey, '+
                'custrecord_bludoc_password as secretkey, '+
                'custrecord_bludocs_aws_account_num as accountnum, '+
                'custrecord_bludocs_aws_region as region, '+
                'custrecord_bludocs_bucket as bucket, '+
                'custrecord_bludocs_recycle_bin as recyclebin, '+
                'custrecord_bludocs_aws_sub_serv as putobject, '+
                'custrecord_bludocs_download_api_id as download, '+

                " from customrecord_bludocs_config where isinactive='F' and name='aws' order by id";
                var results = query.runSuiteQL({query: sql, params: []}).asMappedResults();
                //_credentials = results.length>0 ? results[0] : undefined;
                log.debug('_credentials NEW',results[0]);
              return results.length>0 ? results[0] : undefined;
			},
          ttl: 300
		});
         if(_credentials) _credentials=JSON.parse(_credentials);
        
      } catch(e){
        log.error('config missing',e);
      }
      
      if(_credentials){
        this._baseUrl = "https://"+_credentials.accountnum+".execute-api."+_credentials.region+".amazonaws.com/production/"+_credentials.bucket;
        this._subService = _credentials.accountnum;
		this._service = "execute-api";
		this._region = _credentials.region;
		this._stage = "production";
		this._bucket = _credentials.bucket;
		this._accessKey = _credentials.accesskey;
		this._secretKey = _credentials.secretkey;
        
        this._downloadId = _credentials.download;
        this._putObjectId = _credentials.putobject;
        this._recycleBin = _credentials.recyclebin;
        
      } else {
        try{
          // legacy credential record associated with Solar Success
          _credentials = new APICredentialsSs2().init('amazon-aws');

          this._baseUrl = _credentials.getBaseUrl();

          var matches = this._baseUrl.match(/https:\/\/([A-Za-z0-9\-]+).([A-Za-z0-9\-]+).([A-Za-z0-9\-]+).amazonaws.com\/([A-Za-z0-9\-]+)\/([A-Za-z0-9\-]+)/);

          if (matches.length != 6) {
              throw 'Base URL is misconfigured and did not return appropriate parts.';
          }

          this._subService = matches[1];
          this._service = matches[2];
          this._region = matches[3];
          this._stage = matches[4];
          this._bucket = matches[5];

          this._accessKey = _credentials.getUsername();
          this._secretKey = _credentials.getPassword();
        } catch(e){
          log.error('CREDENTIALS',e);
          throw 'Credentials for displaying files were not found.';
        }
        
      }

      //log.audit('loadCredentials',this);
	}

	/**
	 * Makes use of CryptoJS to generate a signature key using several iterations of HmacSHA256.
	 *
	 * Expected usage: 0
	 *
	 * @param {string} key The original key to use for first HmacSHA256.
	 * @param {string} dateStamp The original value to use for the first HmacSHA256.
	 * @returns {string} The signature key after four iterations of HmacSHA256.
	 */
	BB.S3.Service.prototype.getSignatureKey = function(service, key, dateStamp) {
		var _region = this._region;

		var dateKey = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key);
		var regionKey = CryptoJS.HmacSHA256(_region, dateKey);
		var serviceKey = CryptoJS.HmacSHA256(service, regionKey);
		var signatureKey = CryptoJS.HmacSHA256('aws4_request', serviceKey);

		return signatureKey;
	}


	/**
	 * Helper function to generate date formatted for the X-Amz-Date header.
	 *
	 * Expected usage: 0
	 *
	 * @returns {string} Current date formated as YYYYMMDD'T'HHmmss'Z'.
	 */
	BB.S3.Service.getAmzDate = function() {
		var amzDate = new Date().toISOString();
		amzDate = amzDate.split(".")[0] + "Z";
		amzDate = amzDate.replace(/-/g, "").replace(/:/g, "");
		return amzDate;
	}

	/**
	 * Gets a value for the signature header following Amazon's guidelines.
	 *
	 * Expected usage: 0
	 *
	 * @param {string} method HTTP method (i.e. GET or PUT).
	 * @param {string} canonicalUri URI after host and up to but not including parameters.
	 * @param {string} canonicalQueryString Parameters in query string.
	 * @param {array} canonicalHeaders Headers to be included in request.
	 * @param {array} signedHeaders Headers which will be signed using Hmac256.
	 * @param {string} payloadHash Hash of the payload.
	 * @param {any} amzDate Date formatted using YYYYMMDD'T'HHmmss'Z'.
	 */
	BB.S3.Service.prototype.getSignature = function(service, method, canonicalUri, canonicalQueryString, canonicalHeaders, signedHeaders, payloadHash, amzDate) {
		var canonicalRequest = [method,
			canonicalUri,
			canonicalQueryString,
			canonicalHeaders.join('\n') + '\n',
			signedHeaders.join(';'),
			payloadHash
		].join('\n');

		var _region = this._region,
			_secretKey = this._secretKey;

		//log.debug('canonicalRequest', canonicalRequest);

		var datestamp = amzDate.split("T")[0];

		var credentialScope = [datestamp, _region, service, 'aws4_request'].join('/');

		var stringToSign = [this.ALGORITHM,
			amzDate,
			credentialScope,
			CryptoJS.SHA256(canonicalRequest)
		].join('\n');

		//log.debug('stringToSign', stringToSign);

		var signingKey = this.getSignatureKey(service, _secretKey, datestamp);

		var signature = CryptoJS.HmacSHA256(stringToSign, signingKey);

		return signature;
	}
  
  BB.S3.Service.prototype.getSignature2 = function(service, method, canonicalUri, canonicalQueryString, canonicalHeaders, signedHeaders, payloadHash, amzDate) {
	var canonicalRequest = [
		method,
		UriEncode( canonicalUri ),
		UriEncodeQuery( canonicalQueryString ),
		headerFormating(canonicalHeaders).sort().join('\n') + '\n',
		signedHeaders.sort().join(';').toLowerCase(),
		payloadHash
	].join('\n');
	//log.debug('canonicalRequestNEW', canonicalRequest);

	var _region = this._region,
		_secretKey = this._secretKey;

	var datestamp = amzDate.split("T")[0];

	var credentialScope = [datestamp, _region, service, 'aws4_request'].join('/');

	var stringToSign = [
		this.ALGORITHM,
		amzDate,
		credentialScope,
		CryptoJS.SHA256(canonicalRequest)
	].join('\n');

	log.debug('stringToSign', stringToSign);

	var signingKey = this.getSignatureKey(service, _secretKey, datestamp);

	var signature = CryptoJS.HmacSHA256(stringToSign, signingKey);

	return signature;
}

	/**
	 * Calls Amazon using the given method (i.e. GET or PUT).
	 *
	 * Expected usasge: 20
	 *
	 * @param {any} getHostMethod
	 * @param {any} method The method (i.e. GET or PUT).
	 * @param {any} additionalHeaders An array of headers to add. They will not be signed.
	 * @param {any} name Name of the object.
	 * @param {any} data
	 * @param {any} contentType
	 * @param {any} acl
	 * @param {any} error
	 * @param {any} success
	 * @returns {object} The response object.
	 */
	BB.S3.Service.prototype.callAmazonWithHeaders = function(getHostMethod, method, additionalHeaders, name, data, contentType, acl, error, success) {
		this.loadCredentials();

		var _stage = this._stage,
			_bucket = this._bucket,
			_region = this._region,
			_service = this._service,
			_accessKey = this._accessKey;

		name = name.replace(/ /g, '_');
		name = escape(name);

		var amzDate = BB.S3.Service.getAmzDate();

		var canonicalUri = ['', _stage, _bucket, name].join('/');

		var canonicalQueryString = '';

		var headers = ['host:' + getHostMethod.call(this), 'x-amz-date:' + amzDate];

		var signedHeaders = ['host', 'x-amz-date'];

		var payloadHash = CryptoJS.SHA256(data);

		var signature = this.getSignature(_service, method, canonicalUri, canonicalQueryString, headers, signedHeaders, payloadHash, amzDate);

		var datestamp = amzDate.split("T")[0];

		var credentialScope = [datestamp, _region, _service, 'aws4_request'].join('/');

		var authorizationHeader = this.ALGORITHM + ' ' +
			'Credential=' + _accessKey + '/' + credentialScope + ', ' +
			'SignedHeaders=' + signedHeaders.join(';') + ', ' + 'Signature=' + signature;

		var headers = {
			'x-amz-date': amzDate,
			'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
			'Authorization': authorizationHeader
		};

		if (additionalHeaders) {
			additionalHeaders.forEach(function(header) {
				headers[header.key] = header.value;
			});
		}

		if (acl) {
			log.debug('acl', acl);
			headers['x-amz-acl'] = acl;
		}

		if (method === 'PUT' && contentType) {
			headers['Content-Type'] = contentType;
		}

		// ************* SEND THE REQUEST *************
		var requestUrl = this.getEndpoint() + '/' + name;
		var _response = undefined;

		if (typeof require == 'function') {
			require(['N/https'], function(https) {
				_response = https.request({
					method: method,
					url: requestUrl,
					body: data,
					headers: headers
				});
			});
		} else {
			_response = nlapiRequestURL(url, data, headers, method);
		}
		if (_response.code === 200) {
			success(_response);
		}
		else {
			error(_response);
		}
		return _response;
	}

	/**
	 * Calls Amazon using the given method (i.e. GET or PUT).
	 *
	 * Expected usasge: 20
	 *
	 * @param {any} getHostMethod
	 * @param {any} method The method (i.e. GET or PUT).
	 * @param {any} name Name of the object.
	 * @param {any} data
	 * @param {any} contentType
	 * @param {any} acl
	 * @param {any} error
	 * @param {any} success
	 * @returns {object} The response object.
	 */
	BB.S3.Service.prototype.callAmazon = function(getHostMethod, method, name, data, contentType, acl, error, success) {
		this.callAmazonWithHeaders(getHostMethod, method, undefined, name, data, contentType, acl, error, success);
	}

	/**
	 * Gets a presigned URL and retrieves the object from S3.
	 *
	 * Expected usage: 20
	 *
	 * @param {string} name Name of the object (can include / path).
	 * @returns {BB.S3.Object} The object with bucket, name, data, and contentType properties.
	 */
	BB.S3.Service.prototype.getObject = function(name) {
		var _s3object = undefined,
			_bucket = this._bucket;

		name = name.replace(/ /g, '_');

		this.callAmazon(this.getApiGatewayHost, 'GET', name, undefined, undefined, undefined,
			function (error) {
				log.error('Failed to get object from S3', error.body ? error.body : error.code);
			},
			function (response) {
				_s3object = new BB.S3.Object({
					bucket: _bucket,
					name: name,
					data: response.body,
					contentType: response.headers['Content-Type']
				});
			}
		);

		return _s3object;
	}

	/**
	 * Puts an object into S3 given a name, data, content type, and optional ACL.
	 *
	 * Expected usage: 20
	 *
	 * @param {BB.S3.Object} s3Object The object to put into S3, including name, data, contentType, and acl (optional).
	 * @param {function} onError Callback function in case error is encountered.
	 * @param {function} onSuccess Callback function for success.
	 * @returns {BB.S3.PutObjectResponse} Response object including body and code properties.
	 */
	BB.S3.Service.prototype.putObject = function(s3Object, onError, onSuccess) {
		var _name = undefined,
			_data = undefined,
			_contentType = undefined,
			_acl = undefined,
			_this = this,
			_region = this._region,
			_bucket = this._bucket,
			_putObjectResponse = new BB.S3.PutObjectResponse();

		if (typeof s3Object === 'object') {
			_name = s3Object.name;
			_data = s3Object.data;
			_contentType = s3Object.contentType;
			_acl = s3Object.acl;
		}

		_name = _name.replace(/ /g, '_');

		// Make sure we have everything
		if (HelperFunctions.isEmpty(_name)) throw 'Name is required.';
		if (HelperFunctions.isEmpty(_data)) throw 'Data is required.';
		if (HelperFunctions.isEmpty(_contentType)) throw 'Content Type is required.';

		var _successful = false;

		this.callAmazon(this.getApiGatewayHost, 'PUT', _name, _data, _contentType, _acl,
			function (response) {
				_putObjectResponse.status = 'failure';
				log.error('Failed to publish to S3', response.body ? response.body : response.code);
				if (onError) onError(_putObjectResponse);
			},
			function () {
				var url =  ['https:/', _this.getS3Host(), _name].join('/');

				log.debug('success', 'Published to S3');
				log.debug('url', url);
				_putObjectResponse.url = url;
				_putObjectResponse.status = 'success';

				if (onSuccess) onSuccess(_putObjectResponse);
			}
		);
		return _putObjectResponse;
	}

	/**
	 * Gets a presigned URL for accessing S3 objects directly, but within a specified timeframe.
	 *
	 * Expected usage: 10
	 *
	 * @param {string} name Name of the object.
	 * @param {integer} expirationSeconds Number of seconds URL should be valid.
	 * @returns {string} The presigned URL.
	 */
	BB.S3.Service.prototype.getPresignedUrl = function(name, expirationSeconds, method, acl) {
		if (HelperFunctions.isEmpty(name)) {
			throw 'Missing parameter: name.';
		}
		if (HelperFunctions.isEmpty(expirationSeconds)) {
			throw 'Missing parameter: expirationSeconds.';
		}

		if(!method){
			method = 'GET'
		}

		//name = name.replace(/ /g, '_');

		this.loadCredentials();

		var _service = 's3', // force the service to s3
			_bucket = this._bucket,
			_region = this._region,
			_accessKey = this._accessKey,
			_host = this.getS3Host();

		var amzDate = BB.S3.Service.getAmzDate();
		var datestamp = amzDate.split("T")[0];
		var credentialScope = [datestamp, _region, _service, 'aws4_request'].join('/');
		var signedHeaders = ['host'];

		var params = [
			'X-Amz-Algorithm=' + this.ALGORITHM,
			'X-Amz-Credential=' + encodeURIComponent([_accessKey, credentialScope].join('/')),
			'X-Amz-Date=' + amzDate,
			'X-Amz-Expires=' + expirationSeconds,
			'X-Amz-SignedHeaders=' + signedHeaders.join(';')
		];

		if(acl){
			params.unshift('X-Amz-Acl=' + acl);
		}
		var canonicalUri = ['', escape(name)].join('/');
		var canonicalHeaders = ['host:' + _host];
		var canonicalQueryString = params.join('&');

		var signature = this.getSignature(_service, method, canonicalUri, canonicalQueryString, canonicalHeaders, signedHeaders, 'UNSIGNED-PAYLOAD', amzDate);

		params.push('X-Amz-Signature=' + signature);

		return ['https://', _host, canonicalUri].join('') + '?' + params.join('&');
	}

	/**
	 * Gets a presigned URL for listing S3 objects.
	 *
	 * Expected usage: 10
	 *
	 * @param {string} prefix Optional path to list.
	 * @param {integer} expirationSeconds Number of seconds URL should be valid.
	 * @returns {string} The presigned URL.
	 */
	BB.S3.Service.prototype.getPresignedListUrl = function(prefix, expirationSeconds, nextContinuationToken) {
		if (HelperFunctions.isEmpty(prefix)) {
			throw 'Missing parameter: name.';
		}
		if (HelperFunctions.isEmpty(expirationSeconds)) {
			throw 'Missing parameter: expirationSeconds.';
		}

		this.loadCredentials();

		var _service = 's3', // force the service to s3
			_bucket = this._bucket,
			_region = this._region,
			_accessKey = this._accessKey,
			_host = this.getS3Host();

		var amzDate = BB.S3.Service.getAmzDate();
		var datestamp = amzDate.split("T")[0];
		var credentialScope = [datestamp, _region, _service, 'aws4_request'].join('/');
		var signedHeaders = ['host'];

		var params = [
			'X-Amz-Algorithm=' + this.ALGORITHM,
			'X-Amz-Credential=' + encodeURIComponent([_accessKey, credentialScope].join('/')),
			'X-Amz-Date=' + amzDate,
			'X-Amz-Expires=' + expirationSeconds,
			'X-Amz-SignedHeaders=' + signedHeaders.join(';')
		];

		if(nextContinuationToken){
			var encodedToken = encodeURIComponent(nextContinuationToken);
			encodedToken = encodedToken.replace(/\(/g, "%28").replace(/\)/g, "%29"); // encodeURIComponent does not encode parentheses
			params.push('continuation-token='+encodedToken);
		}

		params.push('list-type=2');

		if (prefix) {
			var encodedPrefix = encodeURIComponent(prefix);
			encodedPrefix = encodedPrefix.replace(/\(/g, "%28").replace(/\)/g, "%29"); // encodeURIComponent does not encode parentheses
			params.push('prefix=' + encodedPrefix);
		}

		var canonicalUri = '/';
		var canonicalHeaders = ['host:' + _host];
		var canonicalQueryString = params.join('&');

		var signature = this.getSignature(_service, 'GET', canonicalUri, canonicalQueryString, canonicalHeaders, signedHeaders, 'UNSIGNED-PAYLOAD', amzDate);

		params.push('X-Amz-Signature=' + signature);

		return ['https://', _host, canonicalUri].join('') + '?' + params.join('&');
	}

	BB.S3.Service.prototype.getPresignedList = function(prefix){
		var
			_presignedUrl = this.getPresignedListUrl(prefix, 60)
			, _fileResponse
			, _xmlFilesDocument
			, _files
		;
		_fileResponse  = https.get({ url: _presignedUrl });

		if (_fileResponse.code / 100 !== 2) {
			throw ["Error occurred calling Amazon (", _fileResponse.code, ").", "\n", _fileResponse.body].join('');
		}
		_xmlFilesDocument = xml.Parser.fromString({ text : _fileResponse.body.replace('xmlns="http://s3.amazonaws.com/doc/2006-03-01/"', '') });
		_files = xml.XPath
			.select({ node : _xmlFilesDocument, xpath: '/ListBucketResult/Contents/Key' })
			.map(function(node){
				return node.textContent;
			});
		return _files;
	};

	BB.S3.Service.prototype.copyObject2 = function(CopySource, newName) {
		// CopySource should include the bucket it's coming from
		// newName should have the path included
		this.loadCredentials();

		var _bucket = this._bucket,
			_region = this._region,
			_service = this._service,
			_accessKey = this._accessKey,
			_service = 's3';

		var amzDate = BB.S3.Service.getAmzDate();

		var datestamp = amzDate.split("T")[0];

		var canonicalUri = UriEncode2('/' + newName);

		var canonicalQueryString = '';
		var hostString = this.getS3Host();

		var headers = ['host:' + hostString, 'x-amz-copy-source:' + CopySource, 'x-amz-date:' + amzDate];

		var signedHeaders = ['host', 'x-amz-copy-source', 'x-amz-date'];

		var signature = this.getSignature(_service, 'PUT', canonicalUri, canonicalQueryString, headers, signedHeaders, 'UNSIGNED-PAYLOAD', amzDate);

		var credentialScope = [datestamp, _region, _service, 'aws4_request'].join('/');
		log.debug('cred scope', credentialScope);

		var authorizationHeader = this.ALGORITHM + ' ' +
			'Credential=' + _accessKey + '/' + credentialScope + ', ' +
			'SignedHeaders=' + signedHeaders.join(';') + ', ' + 'Signature=' + signature;

		log.debug('auth header', authorizationHeader);

		var header = {
			'Authorization': authorizationHeader,
			'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
			'x-amz-copy-source': CopySource,
			'x-amz-date': amzDate
		};
		log.debug('header',header);
		// ************* SEND THE REQUEST *************
		var requestUrl = 'https://' + hostString + canonicalUri;
		log.debug('requestUrl',requestUrl);
		var _response = undefined;

		_response = https.put({
			url: requestUrl,
			headers: header,
			body: ''
		});

		return _response;
	}

	BB.S3.Service.prototype.copyObject = function(oldName, newName) {

		this.loadCredentials();

		var _bucket = this._bucket,
			_region = this._region,
			_service = this._service,
			_accessKey = this._accessKey,
			_service = 's3';

		var amzDate = BB.S3.Service.getAmzDate();

      	var urlPath = '/' + newName;
		var canonicalUri = UriEncode('/' + newName);

		var canonicalQueryString = '';
		var hostString = this.getS3Host();
		var copySource = [_bucket, oldName].join('/');

		var headers = ['host:' + hostString, 'x-amz-copy-source:' + copySource, 'x-amz-date:' + amzDate];

		var signedHeaders = ['host', 'x-amz-copy-source', 'x-amz-date'];

		var signature = this.getSignature(_service, 'PUT', canonicalUri, canonicalQueryString, headers, signedHeaders, 'UNSIGNED-PAYLOAD', amzDate);

		var datestamp = amzDate.split("T")[0];

		var credentialScope = [datestamp, _region, _service, 'aws4_request'].join('/');
		log.debug('cred scope', credentialScope);

		var authorizationHeader = this.ALGORITHM + ' ' +
			'Credential=' + _accessKey + '/' + credentialScope + ', ' +
			'SignedHeaders=' + signedHeaders.join(';') + ', ' + 'Signature=' + signature;
		log.debug('auth header', authorizationHeader);
		// var header = {
		// 	'x-amz-copy-source': copySource,
		// 	'x-amz-date': amzDate,
		// 	'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
		// 	'Authorization': authorizationHeader,
		// };
		var header = {
			'Authorization': authorizationHeader,
			'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
			'x-amz-copy-source': copySource,
			'x-amz-date': amzDate
		};

		// ************* SEND THE REQUEST *************
		var requestUrl = 'https://' + hostString + urlPath;
		var _response = undefined;

		_response = https.put({
			url: requestUrl,
			headers: header,
			body: ''
		});

		return _response;
	}

  BB.S3.Service.prototype.moveObject = function(oldName, newName) {

		this.loadCredentials();

		var _bucket = this._bucket,
			_service = 's3';

    	var _oldName = oldName.split('/').map(function(c) { return encodeURIComponent(c).replace(/\(/g, '%28').replace(/\)/g, '%29'); }).join('/');
    	var _newName = newName.split('/').map(function(c) { return encodeURIComponent(c).replace(/\(/g, '%28').replace(/\)/g, '%29'); }).join('/');
    
      	var urlPath = '/' + _newName;
		var hostString = this.getS3Host();
		var copySource = [_bucket, _oldName].join('/');

		// ************* SEND THE REQUEST *************
		var requestUrl = 'https://' + hostString + urlPath;
		var _response = undefined;

    var _requestData = this.authenticate(
      	_service
      	, 'PUT'
        , requestUrl
      	, {'X-Amz-Copy-Source': copySource, 'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'}
      );   
    
		_response = https.put(_requestData);

		return _response;
	}
  
  	function sortObj(obj) {
  return Object.keys(obj).sort().reduce(function (result, key) {
    result[key] = obj[key];
    return result;
  }, {});
}
  
  	BB.S3.Service.prototype.authenticate = function (service, type, url, headers, body){
      var
        _credentials = {
          accessKeyId: this._accessKey,
          secretAccessKey: this._secretKey
        }
        , _service = new awsAuthModule.Service()
        , _request
        , _date = _service.getSkewCorrectedDate()
        , _signer
        , _result
      ;
      _request = new awsAuthModule.HttpRequest(url, this._region);
      _request.method = typeof type === 'string' ? type.toUpperCase() : 'GET';
      _request.headers['Host'] = _request.endpoint.host;
      if(headers) {
        for(var key in headers) {
          if(headers.hasOwnProperty(key)) {
            _request.headers[key] = headers[key];
          }
        }
      }
      if (body) {
        _request.body = typeof body === 'string' ? body : JSON.stringify(body);
        AWS.util.computeSha256(_request.body, function (err, sha) {
          if (err) {
            log.debug('AWS Auth SHA256 error', err);
          } else {
            _request.headers["X-Amz-Content-Sha256"] = sha;
            _request.headers = sortObj(_request.headers);
            _signer = new awsAuthModule.Signers.V4(_request, service);
            _signer.addAuthorization(_credentials, _date);
          }
        });
      } else {
        _request.headers = sortObj(_request.headers);
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
  
	/**
	 * Deletes an object.
	 *
	 * @param {string} name The full path name of the object.
	 */
	BB.S3.Service.prototype.deleteObject = function(name) {
		callAmazon(this.getS3Host, 'DELETE', name, undefined, undefined, undefined,
			function(error) {
				log.debug('delete error', error.body);
			},
			function(success) {
				log.debug('delete success', name + ' deleted');
			}
		);
	}

	/**
	 * Deletes an array of objects.
	 *
	 * @param path - {string} The full path name.
	 * @param deleteObjArr {array} array of File Names string values example - test.pdf
	 */

	BB.S3.Service.prototype.deleteAmazonObjects = function(path, deleteObjArr) {

		this.loadCredentials();

		var _stage = this._stage,
			_bucket = this._bucket,
			_region = this._region,
			_service = this._service,
			_accessKey = this._accessKey,
			_service = 's3';

		if (deleteObjArr.length > 0) {
			var deleteObjects = '<Delete>';
			for (var d = 0; d < deleteObjArr.length; d++) {
				deleteObjects += '<Object><Key>' + path + '/' + deleteObjArr[d] + '</Key></Object>';
			}
			deleteObjects += '</Delete>';

			var contentLength = deleteObjects.length;

			var md5Hash = CryptoJS.MD5(deleteObjects).toString(CryptoJS.enc.Hex);

			var md5Base64 = encode.convert({
				string: md5Hash,
				inputEncoding: encode.Encoding.HEX,
				outputEncoding: encode.Encoding.BASE_64
			});

			var amzDate = BB.S3.Service.getAmzDate();

			var canonicalUri = '/';

			var canonicalQueryString = 'delete=';
			var hostString = this.getS3Host();

			var headers = ['content-length:' + contentLength, 'content-md5:' + md5Base64, 'host:' + hostString, 'x-amz-date:' + amzDate];

			var signedHeaders = ['content-length', 'content-md5', 'host', 'x-amz-date'];

			var signature = this.getSignature(_service, 'POST', canonicalUri, canonicalQueryString, headers, signedHeaders, 'UNSIGNED-PAYLOAD', amzDate);

			var datestamp = amzDate.split("T")[0];

			var credentialScope = [datestamp, _region, _service, 'aws4_request'].join('/');
			log.debug('cred scope', credentialScope);

			var authorizationHeader = this.ALGORITHM + ' ' +
				'Credential=' + _accessKey + '/' + credentialScope + ', ' +
				'SignedHeaders=' + signedHeaders.join(';') + ', ' + 'Signature=' + signature;
			log.debug('auth header', authorizationHeader);
			var header = {
				'x-amz-date': amzDate,
				'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
				'Authorization': authorizationHeader,
				'Content-MD5': md5Base64,
				'Content-Type': 'text/xml',
				'Content-Length': contentLength
			};

			// ************* SEND THE REQUEST *************
			var requestUrl = 'https://' + hostString + '/?delete=';
			var _response = undefined;

			_response = https.post({
				url: requestUrl,
				body: deleteObjects,
				headers: header
			});

			return _response;
		}// end of check delete objects length for request



	}// end of function

	/**
	 * Provides the core class definition for other classes to inherit.
	 *
	 */

	/**
	 * @param {any} context
	 */
	BB.S3.ObjectViewer = function (context) {
		var _this = this,
			_context = context;

		Object.defineProperties(this, {
			'context': {
				get: function () {
					return _context;
				},
				set: function (val) {
					_context = val;
				}
			},
			'parameters': {
				get: function () {
					if (!_context) log.debug('_context is empty');
					return _context ? _context.request.parameters : undefined;
				}
			}
		});
	}

	BB.S3.ObjectViewer.prototype.constructor = BB.S3.ObjectViewer;
	BB.S3.ObjectViewer.prototype.generateView = function () {
		throw 'generateView is an abstract function.';
	};
	BB.S3.ObjectViewer.prototype.getPreviewImage = function () {
		var _this = this;
		var _file = undefined;
		require(['N/file'], function(file){
			_file = file.create({
				name: _this.parameters.name,
				fileType: file.Type.PNGIMAGE,
				contents: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
				encoding: file.Encoding.BASE_64
			});
		});
		_this.context.response.writeFile({file: _file, isInline: true});
	};
	BB.S3.ObjectViewer.prototype.downloadImage = function (imageUrl) {
		var response;
		require(['N/https', 'N/http'], function (https, http) {
			if (imageUrl.indexOf('https://') === 0) {
				response = https.get({
					url: imageUrl
				});
			} else {
				response = http.get({
					url: imageUrl
				});
			}
		});
		if (response && response.code === 200) {
			return response.body;
		}
		return undefined;
	};
	BB.S3.ObjectViewer.prototype.addNextPrevButtons = function(file, form){
		var
			_s3 = new BB.S3.Service()
			, _root
			, _folderPath = file.substring(0, file.lastIndexOf('/'))
			, _imagesUrlList = _s3.getPresignedList(_folderPath)
			, _currentImageIndex = _imagesUrlList.indexOf(file)
			, _nextUrl = _currentImageIndex === -1 || _imagesUrlList.length === _currentImageIndex + 1 ? null : _imagesUrlList[_currentImageIndex + 1]
			, _prevUrl = _currentImageIndex === -1 || _currentImageIndex === 0 ? null : _imagesUrlList[_currentImageIndex - 1]
		;

		if(!form.clientScriptModulePath){
			if (runtime.accountId == 'TSTDRV1749316') {
				_root = '/SuiteScripts';
			} else {
				_root = '/.bundle/207067'
			}
			form.clientScriptModulePath = _root + '/BB/S3/BB_S3_CS_ShowFile.js';
		}

		if(form && _prevUrl){
			form.addButton({
				id: 'prev_button'
				, label: 'Prev'
				, functionName: ['goToUrl("', _prevUrl, '")'].join('')
			});
		}
		if(form && _nextUrl) {
			form.addButton({
				id: 'next_button'
				, label: 'Next'
				, functionName: ['goToUrl("', _nextUrl, '")'].join('')
			});
		}

	}
	BB.S3.GenericViewer = function (context) { BB.S3.ObjectViewer.call(this, context); }
	BB.S3.GenericViewer.prototype = Object.create(BB.S3.ObjectViewer.prototype);
	BB.S3.GenericViewer.prototype.constructor = BB.S3.GenericViewer;
	BB.S3.GenericViewer.prototype.generateView = function () {
		var _this = this;
		if(_this.parameters.preview){
			_this.getPreviewImage();
			return;
		}
		require(['N/ui/serverWidget', 'N/runtime'], function (ui, runtime) {
			var form = ui.createForm({
				title: 'File Viewer'
			});

			var s3 = new BB.S3.Service();

			var fileUrl = s3.getPresignedUrl(_this.parameters.name, 60); // Get a URL good for only 60 seconds

			var root = undefined;
			if (runtime.accountId == 'TSTDRV1749316') {
				root = '/SuiteScripts';
			} else {
				root = '/.bundle/207067'
			}

			form.clientScriptModulePath = root + '/BB/S3/BB_S3_CS_ShowFile.js';

			var field = form.addField({
				id: 's3url',
				type: ui.FieldType.URL,
				label: 'Link'
			});

			field.defaultValue = fileUrl;
			field.updateDisplayType({
				displayType: ui.FieldDisplayType.HIDDEN
			});

			var field = form.addField({
				id: 'notice',
				type: ui.FieldType.INLINEHTML,
				label: 'Download Notice'
			});

			field.defaultValue = '<h2>Download of the file should begin shortly.</h2>';

			_this.addNextPrevButtons(_this.parameters.name, form);

			_this.context.response.writePage(form);
		});
	}
	BB.S3.ImageViewer = function (context) { BB.S3.ObjectViewer.call(this, context); }
	BB.S3.ImageViewer.prototype = Object.create(BB.S3.ObjectViewer.prototype);
	BB.S3.ImageViewer.prototype.constructor = BB.S3.ImageViewer;
	BB.S3.ImageViewer.prototype.getPreviewImage = function(){
		var _this = this;
		var s3 = new BB.S3.Service();
		var imageUrl = s3.getPresignedUrl(_this.parameters.name, 60); // Get a URL good for only 60 seconds
		var imageBody = _this.downloadImage(imageUrl);
		var _file = undefined;
		require(['N/file'], function(file){
			if(!imageBody){
				imageBody ='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
			}
			try{
				_file = file.create({
					name: _this.parameters.name,
					fileType: file.Type.PNGIMAGE,
					contents: imageBody,
					encoding: file.Encoding.BASE_64
				});
			} catch(er){
				log.audit('getPreviewImage '+_this.parameters.name,er);
				imageBody ='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
				_file = file.create({
					name: _this.parameters.name,
					fileType: file.Type.PNGIMAGE,
					contents: imageBody,
					encoding: file.Encoding.BASE_64
				});
				log.audit('getPreviewImage '+_this.parameters.name,'image to large - using default image');
			}
		});
		_this.context.response.writeFile({file: _file, isInline: true});
	};
	BB.S3.ImageViewer.prototype.generateView = function () {
		var _this = this;

		if(_this.parameters.preview){
			_this.getPreviewImage();
			return;
		}

		require(['N/ui/serverWidget'], function (ui) {
			var form = ui.createForm({
				title: 'File Viewer'
			});

			var field = form.addField({
				id: 'inlinehtmlfield',
				type: ui.FieldType.INLINEHTML,
				label: 'File'
			});

			var s3 = new BB.S3.Service();

			var imageUrl = s3.getPresignedUrl(_this.parameters.name, 60); // Get a URL good for only 60 seconds

			_this.addNextPrevButtons(_this.parameters.name, form);

			field.defaultValue = '<img style="max-width: 100%; max-height: 80vh; cursor: zoom-in;" class="file-viewer-image" src="' + imageUrl + '"/>';

			_this.context.response.writePage(form);
		});
	};
	BB.S3.PdfViewer = function (context) { BB.S3.ObjectViewer.call(this, context); }
	BB.S3.PdfViewer.prototype = Object.create(BB.S3.ObjectViewer.prototype);
	BB.S3.PdfViewer.prototype.constructor = BB.S3.PdfViewer;
	BB.S3.PdfViewer.prototype.generateView = function () {
		var _this = this;
		if(_this.parameters.preview){
			_this.getPreviewImage();
			return;
		}
		require(['N/ui/serverWidget'], function (ui) {
			var form = ui.createForm({
				title: 'File Viewer'
			});

			var field = form.addField({
				id: 'inlinehtmlfield',
				type: ui.FieldType.INLINEHTML,
				label: 'File'
			});

			_this.addNextPrevButtons(_this.parameters.name, form);

			var s3 = new BB.S3.Service();

			var pdfUrl = s3.getPresignedUrl(_this.parameters.name, 60); // Get a URL good for only 60 seconds

			var objectProperties = [
				'data="' + pdfUrl + '"',
				'type="application/pdf"',
				'width="100%"',
				'style="height:8in"'
			].join(' ');

			var link = ["<a href='", pdfUrl, "'>Click this link to download the file.</a>"].join('');

			var fallback = ['<p>Didn\'t load? ', link, '</p>'].join('');

			var iosFix = '<script type="text/javascript">if((/iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) && !window.MSStream) '+
				'document.getElementsByTagName("object")[0].outerHTML = "'+fallback+'";</script>';

			field.defaultValue = ['<object ', objectProperties, '>', fallback, '</object>',iosFix].join('');

			_this.context.response.writePage(form);
		});
	}
	BB.S3.ObjectViewerController = function (context) {
		var _this = this,
			_context = context;

		Object.defineProperties(this, {
			'context': {
				get: function () {
					return _context;
				},
				set: function (val) {
					_context = val;
				}
			},
			'parameters': {
				get: function () {
					return _context ? _context.request.parameters : undefined;
				}
			}
		});
	}

	BB.S3.ObjectViewerController.prototype.constructor = BB.S3.ObjectViewerController;
	BB.S3.ObjectViewerController.prototype.getViewer = function () {
		var extension = this.context.request.parameters.extension;
		if (!extension) {
			// Try to get extension from file name
			var filename = this.context.request.parameters.name;
			log.debug('filename', filename);
			extension = (/(?:\.([^.]+))?$/).exec(filename)[1];
			log.debug('extension', extension);
		}
		switch ((extension || '').toLowerCase()) {
			case 'jpg':
			case 'jpeg':
			case 'png':
				return new BB.S3.ImageViewer(this.context);
			case 'pdf':
				return new BB.S3.PdfViewer(this.context);
			default:
				return new BB.S3.GenericViewer(this.context);
		}
	};
	BB.S3.FileSystem.File = function() {
		var _internalId = undefined,
			_name = undefined,
			_parent = undefined,
			_fullpath = undefined,
			_link = undefined,
			_lastSyncDate = undefined,
			_lastSyncError = undefined;

		Object.defineProperties(this, {
			'internalId': {
				enumerable: true,
				get: function() {
					return _internalId;
				},
				set: function(val) {
					_internalId = val;
				}
			},
			'name': {
				enumerable: true,
				get: function() {
					return _name;
				},
				set: function(val) {
					_name = val;
				}
			},
			'parent': {
				enumerable: true,
				get: function() {
					return _parent;
				},
				set: function(val) {
					_parent = val;
				}
			},
			'fullpath': {
				enumerable: true,
				get: function() {
					return _fullpath;
				},
				set: function(val) {
					_fullpath = val;
				}
			},
			'link': {
				enumerable: true,
				get: function() {
					return _link;
				},
				set: function(val) {
					_link = val;
				}
			},
			'lastSyncDate': {
				enumerable: true,
				get: function() {
					return _lastSyncDate;
				},
				set: function(val) {
					_lastSyncDate = val;
				}
			},
			'lastSyncError': {
				enumerable: true,
				get: function() {
					return _lastSyncError;
				},
				set: function(val) {
					_lastSyncError = val;
				}
			}
		})
	}

	BB.S3.FileSystem.File.prototype.constructor = BB.S3.FileSystem.File;
	BB.S3.FileSystem.File.prototype.load = function(internalId) {
		var _this = this;

		require(['N/record'], function(record) {
			var file = record.load({
				type: 'customrecord_bb_file',
				id: internalId
			});

			_this.internalId 	= internalId;
			_this.name 			= file.getValue('name');
			_this.parent		= file.getValue('parent');
			_this.lastSyncDate 	= file.getValue('custrecord_bb_file_synced_datetime');
			_this.lastSyncError = file.getValue('custrecord_bb_file_sync_error');
			_this.link 			= file.getValue('custrecord_bb_file_link');
			_this.fullpath		= _this.name;

			var parentText = file.getText('parent');
			if (parentText) {
				_this.fullpath = [parentText.replace(/ : /g,'/'), _this.name].join('/');
			}
			_this.fullpath = _this.fullpath.replace(/ /g,'_');
		});

		return _this;
	}

	BB.S3.FileSystem.File.prototype.save = function() {
		var _this = this;

		require(['N/record', 'N/format'], function(record, format) {
			if (_this.internalId) {
				var lastSyncDateFormatted = format.format({
					type: format.Type.DATETIME,
					value: _this.lastSyncDate
				});
				var values = {
					name: _this.name,
					parent: _this.parent,
					custrecord_bb_file_synced_datetime: lastSyncDateFormatted,
					custrecord_bb_file_sync_error: _this.lastSyncError,
					custrecord_bb_file_link: _this.link
				};

				record.submitFields({
					type: 'customrecord_bb_file',
					id: _this.internalId,
					values: values
				});
			} else {
				var file = record.create({
					type: 'customrecord_bb_file'
				});

				file.setValue({
					fieldId: 'name',
					value: _this.name
				});

				file.setValue({
					fieldId: 'parent',
					value: _this.parent
				});

				file.setValue({
					fieldId: 'custrecord_bb_file_synced_datetime',
					value: _this.lastSyncDate
				});

				file.setValue({
					fieldId: 'custrecord_bb_file_sync_error',
					value: _this.lastSyncError
				});

				file.setValue({
					fieldId: 'custrecord_bb_file_link',
					value: _this.link
				});

				file.save();
			}
		});

		return _this;
	}
	return BB.S3;
});