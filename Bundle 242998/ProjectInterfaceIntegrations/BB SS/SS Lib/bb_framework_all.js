/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
Boolean.prototype.toNumber = function(){
    return + this;
}

function Environment(){ }
Environment.isSs1 = function(){
    return typeof define !== 'function' && typeof require !== 'function';
}
Environment.isSs2 = function(){
    return typeof define === 'function' && typeof require === 'function';
}

function Converters() {}
Converters.toBase64String = function(str){
    var encrypted = str;
    if(Environment.isSs1()) {
        encrypted = nlapiEncrypt(str, 'base64');
    }
    else if(Environment.isSs2()){
        require(['N/encode'], function(encode){
            encrypted = encode.convert({string: str, inputEncoding: encode.Encoding.UTF_8, outputEncoding: encode.Encoding.BASE_64});
        });
    }
    return encrypted;
}

function Record(){
    var _this = this,
        _type = typeof arguments[0] === 'string' ? arguments[0] : undefined,
        _record = undefined;
    if(_type) {
        if (typeof arguments[1] === 'object') {
            _record = arguments[1];
        }
    }
    Object.defineProperties(this, {
        'record': {
            get: function(){
                return _record;
            },
            set: function(val){
                _record = val;
            }
        },
        'type': {
            get: function(){
                return _type;
            }
        }
    });
}
Record.prototype.isTrue = function(propertyName){
    return this.value(propertyName) === 'T';
}
Record.prototype.isFalse = function(propertyName){
    return this.value(propertyName) === 'F';
}
Record.prototype.id = function(){
    return this.value('id');
}
Record.prototype.isInactive = function(){
    return this.isTrue('isinactive');
}
/**
 * Abstract methods
 */

/**
 * Get value of the field
 * @param {string} propertyName
 */
Record.prototype.value = function(propertyName){
    throw new Error('This is an abstract method and must be implemented by subclass');
};
/**
 * Get text of the field
 * @param {string} propertyName
 */
Record.prototype.text = function(propertyName){
    throw new Error('This is an abstract method and must be implemented by subclass');
};
Record.prototype.save = function(){
    throw new Error('This is an abstract method and must be implemented by subclass');
};
Record.prototype.load = function(type, id){
    throw new Error('This is an abstract method and must be implemented by subclass');
};

/**
 *
 * @author Michael Golichenko
 * 
 * version: 0.0.1
 * 
 */

function APIAuthenticationType() {
	this.None = 'None',
	this.Basic = 'Basic',
	this.Token = 'Token',
	this.Custom = 'Custom'
}
APIAuthenticationType.Types = new APIAuthenticationType();
APIAuthenticationType.isValidAuthenticationType = function(type) {
    for (var prop in APIAuthenticationType.Types) {
        if(type === APIAuthenticationType.Types[prop]){
            return true;
        }
    }
    return false;
}

function APIAuthentication(){}

/*
 * Virtual methods
 */
APIAuthentication.none = function () { };

/**
 * @param {APICredentials} credentials
 */
APIAuthentication.basic = function(credentials){
	var _auth = [credentials.getUsername(), credentials.getPassword()].join(':');
	var _encoded = Converters.toBase64String(encodeURIComponent(_auth).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
	credentials.getCustomSettings().getHeader().append('Authorization', ['Basic', _encoded].join(' '));
}
APIAuthentication.token = function(credentials){
	credentials.getCustomSettings().getHeader().append('Authorization', ['Bearer', credentials.getToken()].join(' '));
}
APIAuthentication.custom = function(){};

function APICredentialsSettings(){
	var _this = this,
		_header = new APIRequestHeader(),
		_params = new APIRequestParams(),
		_data = new APIRequestData();

	this.parse = function(obj){
		if(typeof obj === 'object'){
			if(obj.hasOwnProperty('header') && typeof obj['header'] === 'object'){
				_header.set(obj['header']);
			}
            if(obj.hasOwnProperty('params') && typeof obj['params'] === 'object'){
                _params.set(obj['params']);
            }
            if(obj.hasOwnProperty('data') && typeof obj['data'] === 'object'){
                _data.set(obj['data']);
            }
		}
		return _this;
	}

	this.getHeader = function(){
		return _header;
	};
	this.getParams = function () {
		return _params;
    };
	this.getData = function(){
		return _data;
	};
}

APICredentialsSettings.parse = function (obj) {
	var _settings = new APICredentialsSettings();
	_settings.parse(obj);
	return _settings;
}


function APICredentials() {
	var _this = this,
		_system = undefined,
		_credentialsRecord = undefined,
		_customSettings = undefined;
    Object.defineProperties(this, {
        'fields': {
            writable: false,
            value: function(){
                return {};
            }
        }
    });

	Object.defineProperties(this.fields, {
		'system': {
			get: function(){
				return _system;
			},
			set: function(val){
				_system = val;
			}
		}
	});
	this.getSystem = function(){
		return _system;
	};
	this.setSystem = function(system){
		_system = system;
		return this;
	}
	this.setCredentialsRecord = function(credentialsRecord) {
		_credentialsRecord = credentialsRecord;
		return _this;
	};
	this.getCredentialsRecord = function(){
		return _credentialsRecord;
	};
	this.getId = function() {
		return this.getValue('internalId');
	};
	this.getRecordType = function() {
		return this.getValue('recordType');
	};
	this.getBaseUrl = function(){
		return this.getValue('custrecord_system_base_url');
	};
	this.getAuthenticationType = function() {
		return this.getText('custrecord_system_authentication_type');
	};
	this.getUsername = function() {
		return this.getValue('custrecord_system_username');
	};
	this.getPassword = function() {
		return this.getValue('custrecord_system_password');
	};
	this.getToken = function() {
		return this.getValue('custrecord_system_token');
	};
	this.getDefaultSettings = function() {
		 var _json = this.getValue('custrecord_system_default_settings');
		 try {
		 	var _obj = JSON.parse(_json);
			return APICredentialsSettings.parse(_obj);
		 } catch (ex) {
		 	//TODO: error notification json issue
		 }
	};
	this.getCustomSettings = function() {
		if(_customSettings instanceof APICredentialsSettings){
			return _customSettings;
		}
        var _json = this.getValue('custrecord_system_custom_settings');
        try {
            var _obj = JSON.parse(_json);
            _customSettings = APICredentialsSettings.parse(_obj);
        } catch (ex) {
            //TODO: error notification json issue
        }
        return _customSettings;
	};
	this.getCustomExpiryDateTime = function() {
		return this.getValue('custrecord_system_custom_settings_expiry');
	};
	this.setCustomExpiryDateTime = function(value) {
		this.setValue('custrecord_system_custom_settings_expiry', value);
		return this;
	};
	this.getCustomExpiryPeriod = function() {
		return this.getValue('custrecord_system_custom_setting_exp_ms');
	};
};

APICredentials.prototype.isValid = function() {
	return this.getSystem()&& this.getCredentialsRecord();
};

APICredentials.prototype.authenticate = function(request) {
	var _type = this.getAuthenticationType();
	if(typeof _type === 'string' && APIAuthenticationType.isValidAuthenticationType(_type)){
		_type = _type.toLowerCase();
		APIAuthentication[_type].call(undefined, this);
		request.getHeader().append(this.getCustomSettings().getHeader().json());
	}
};

/*
 * Abstract methods
 */

APICredentials.prototype.get = function() {
	throw new Error('APICredentials.get is an abstract method and must be implemented by subclass');
}

APICredentials.prototype.getValue = function(property) {
    throw new Error('APICredentials.getValue is an abstract method and must be implemented by subclass');
}

APICredentials.prototype.getText = function(property) {
    throw new Error('APICredentials.getText is an abstract method and must be implemented by subclass');
}

APICredentials.prototype.setValue = function(property, value) {
    throw new Error('APICredentials.setValue is an abstract method and must be implemented by subclass');
}

APICredentials.prototype.save = function() {
    throw new Error('APICredentials.save is an abstract method and must be implemented by subclass');
}

/*
 * Virtual methods
 */

APICredentials.prototype.init = function(system) {
	this.setSystem(system).get();
	return this;
}

/**
 *
 * @author Michael Golichenko
 * 
 * version: 0.0.1
 * 
 */

/**
 * @class
 */
function APIRequest() {
	var _this = this,
		_credentials = undefined,
		_baseUrl = undefined,
		_type = undefined,
		_command = undefined,
		_header = new APIRequestHeader(),
		_params = new APIRequestParams(),
		_data = new APIRequestData();

	Object.defineProperties(this, {
		'fields': {
			writable: false,
			value: function(){
				return {};
			}
		}
	});
	Object.defineProperties(this.fields, {
		'credentials': {
			get: function(){
				return _credentials;
			},
			set: function(val){
				_credentials = val;
			}
		}
	});
	this.credentials = function(){
		if(typeof arguments[0] === 'undefined'){
			return this.fields.credentials;
		} else {
			this.fields.credentials = arguments[0];
			return this;
		}
	}

	/**
	 * @param {string} url
	 */
	this.setBaseUrl = function(url) {
		_baseUrl = url;
		return _this;
	};
	/**
	 * @returns {string}
	 */
	this.getBaseUrl = function() {
		return _baseUrl;
	};
	this.setCommand = function(command) {
		_command = command;
		return _this;
	};
	this.getCommand = function(){
		return _command;
	};
	
	function infoSetter(to, from, directSet) {
		if(directSet){
			to = from;
		} else if(typeof from === 'object'){
			to.set(from);
		}
	};
	this.setData = function(data) {
		infoSetter(_data, data, data instanceof APIRequestData);
		return _this;
	};
	this.getData = function(){
		return _data;
	};
	this.setParams = function(params) {
		infoSetter(_params, params, params instanceof APIRequestParams);
		return _this;
	};
	this.getParams = function(){
		return _params;
	};
	this.setHeader = function(header) {
		infoSetter(_header, header, header instanceof APIRequestHeader);
		return _this;
	};
	this.getHeader = function(){
		return _header;
	};
	this.setType = function(type) {
		_type = type;
		return _this;
	}
	this.getType = function() {
		return _type;
	}
}

/*
 * Properties
 */

APIRequest.Type = new APIRequestType();

/*
 * Public Methods
 */

/**
 * @param {string|APICredentials} system
 * @returns {APIRequest}
 */
APIRequest.prototype.loadCredentials = function(system) {
	if(typeof system === 'string') {
        var credentials = new APICredentials().init(system);
        this.fields.credentials = credentials;
    } else if(typeof system === 'object'){
		this.fields.credentials = system;
	}
	this.setBaseUrl(this.fields.credentials.getBaseUrl());
    if(typeof this.fields.credentials.getDefaultSettings() !== 'undefined'){
        var _defaultParams = this.fields.credentials.getDefaultSettings().getParams(),
            _defaultHeaders = this.fields.credentials.getDefaultSettings().getHeader(),
            _defaultData = this.fields.credentials.getDefaultSettings().getData();
        if(typeof _defaultParams !== 'undefined'){
            this.getParams().append(_defaultParams.json())
        }
        if(typeof _defaultHeaders !== 'undefined'){
            this.getHeader().append(_defaultHeaders.json())
        }
        if(typeof _defaultData !== 'undefined'){
            this.getData().append(_defaultData.json())
        }
    }
	return this;
}
/**
 * @param {string} command
 * @param {APIRequestParams|APIRequestHeader} [arg1]
 * @param {APIRequestHeader} [arg2]
 * @returns {APIResponse}
 */
APIRequest.prototype.get = function() {
	this.setType(APIRequest.Type.GET);
	return this.send.apply(this, arguments);
}
/**
 * @param {string} command
 * @param {APIRequestData|APIRequestParams|APIRequestHeader} [arg1]
 * @param {APIRequestParams|APIRequestHeader} [arg2]
 * @param {APIRequestHeader} [arg3]
 * @returns {APIResponse}
 */
APIRequest.prototype.post = function(){
	this.setType(APIRequest.Type.POST);
	return this.send.apply(this, arguments);
}
/**
 * @param {string} command
 * @param {APIRequestData|APIRequestParams|APIRequestHeader} [arg1]
 * @param {APIRequestParams|APIRequestHeader} [arg2]
 * @param {APIRequestHeader} [arg3]
 * @returns {APIResponse}
 */
APIRequest.prototype.put = function() {
	this.setType(APIRequest.Type.PUT);
	return this.send.apply(this, arguments);
}
/**
 * @param {string} type
 * @param {string} command
 * @param {APIRequestData|APIRequestParams|APIRequestHeader} [arg1]
 * @param {APIRequestParams|APIRequestHeader} [arg2]
 * @param {APIRequestHeader} [arg3]
 * @returns {APIResponse}
 */
APIRequest.prototype.send = function() {
	for (var idx in arguments) {
		switch(true){
			case typeof arguments[idx] === 'string':
				if(APIRequestType.isValidRequestType(arguments[idx])){
					this.setType(arguments[idx])
				} else {
					this.setCommand(arguments[idx]);
				}
				break;
			case arguments[idx] instanceof APIRequestData:
				this.setData(arguments[idx]);
				break;
			case arguments[idx] instanceof APIRequestParams:
				this.setParams(arguments[idx]);
				break;
			case arguments[idx] instanceof APIRequestHeader:
				this.setHeader(arguments[idx]);
				break;
			default:
				//TODO: notify unknown argument
				break;
		}
	}
	if(!this.getCommand()){
		//TODO: throw error saying that there is not command initiated
	}
	//TODO: parse json string before returning
	if(this.credentials()){
		this.credentials().authenticate(this);
	}
	if(typeof this.authenticate === 'function'){
		this.authenticate();
	}
	return this.execute();
}
/**
 * @returns {string}
 */
APIRequest.prototype.getUrl = function() {
	var baseUrl = this.getBaseUrl() ? this.getBaseUrl().replace(/^\/+|\/+$/gm,'') : '';
	var commandPath = this.getCommand() ? this.getCommand().replace(/^\/+|\/+$/gm,'') : '';
	commandPath = commandPath.replace(/\/{2,}/gm, '/');
	var parts = [baseUrl, commandPath];
	var url = parts.join('/');
	return APIRequest.isValidUrl(url) ? url : '';
};
/**
 * @returns {string}
 */
APIRequest.prototype.getQueryString = function() {
	var paramsArray = [];
	var paramsData = this.getParams().json();
	for (var param in paramsData) {
		paramsArray.push([param, paramsData[param]].join('='));
	}
	return paramsArray.length > 0 ? paramsArray.join('&') : '';
}
/**
 * @returns {string}
 */
APIRequest.prototype.getUri = function() {
	var baseUrlContainsParams = /\?/g.test(this.getUrl());
	var paramsSeparator = baseUrlContainsParams ? '&' : '?';
	return [this.getUrl(), this.getQueryString()].join(paramsSeparator).replace(/\?+$/g, '');
}

APIRequest.prototype.isHttps = function(){
    var isHttpsRegex = /^https:\/{2}/;
    var url = this.getBaseUrl();
    return typeof url === 'string' && url.length > 0 && isHttpsRegex.test(url);
}

/*
 * Static methods
 */

/**
 * @param {string} url
 */
APIRequest.isValidUrl = function(url) {
	var validHttpHttpsRegex = /^http(|s):\/{2}/g;
	var multipleSlashesInUrl = /\/{2,}/g;
	var urlWithoutProtocol = url.replace(validHttpHttpsRegex, '');
	return typeof url === 'string' && url.length > 0 && validHttpHttpsRegex.test(url) && !multipleSlashesInUrl.test(urlWithoutProtocol);
}
/**
 * @param {string} [baseUrl]
 * @returns {APIRequest}
 */
APIRequest.init = function(baseUrl) {
	var request = new APIRequest();
	if(typeof baseUrl === 'string' && APIRequest.isValidUrl(baseUrl)){
		request.setBaseUrl(baseUrl);
	}
	return request;
}

/*
 * Abstract methods
 */
/**
 * @returns {APIResponse}
 */
APIRequest.prototype.execute = function() {
	throw new Error('This is an abstract method and must be implemented by subclass');
}

/*
 * Virtual methods
 */

APIRequest.prototype.authenticate = function(){
	return this;
};
/**
 *
 * @author Michael Golichenko
 *
 * version: 0.0.1
 *
 */

/**
 * @class
 */
function APIRequestInfo(){
    var _data = {};
    var _this = this;
    this.set = function() {
        if(arguments.length == 1 && typeof arguments[0] === 'object'){
            _data = arguments[0];
        } else if(arguments.length == 2 && typeof arguments[0] === 'string'){
            _this.append(arguments);
        }
        return _this;
    };
    this.append = function() {
        if(arguments.length == 1 && typeof arguments[0] === 'object'){
            for(var prop in arguments[0]){
                _this.append(prop, arguments[0][prop]);
            }
        } else if(arguments.length == 2 && typeof arguments[0] === 'string'){
            if(typeof arguments[1] === 'string'){
                _data[arguments[0]] = arguments[1];
            } else {
                _data[arguments[0]] = JSON.stringify(arguments[1]);
            }
        }
        return _this;
    };
    this.remove = function() {
        if(arguments.length == 1 && typeof arguments[0] === 'array'){
            for(var prop in arguments[0]){
                _this.remove(arguments[0][prop]);
            }
        } else if(arguments.length == 1 && typeof arguments[0] === 'string'){
            if(_data.hasOwnProperty(arguments[0])){
                delete _data[arguments[0]];
            }
        }
        return _this;
    };
    this.clear = function(){
        _data = {};
        return _this;
    };
    this.json = function(asString){
        var _jsonString = JSON.stringify(_data);
        if(asString){
            return _jsonString;
        }
        return JSON.parse(_jsonString);
    };
}

/**
 * @class
 * @implements {APIRequestInfo}
 */
function APIRequestHeader(){ APIRequestInfo.call(this); }
APIRequestHeader.prototype = Object.create(APIRequestInfo.prototype);
APIRequestHeader.prototype.constructor = APIRequestHeader;
/**
 * @class
 * @implements {APIRequestInfo}
 */
function APIRequestParams(){ APIRequestInfo.call(this); }
APIRequestParams.prototype = Object.create(APIRequestInfo.prototype);
APIRequestParams.prototype.constructor = APIRequestParams;
/**
 * @class
 * @implements {APIRequestInfo}
 */
function APIRequestData(){ APIRequestInfo.call(this); }
APIRequestData.prototype = Object.create(APIRequestInfo.prototype);
APIRequestData.prototype.constructor = APIRequestData;

/**
 *
 * @author Michael Golichenko
 *
 * version: 0.0.1
 *
 */

/**
 * @class
 */
function APIRequestType() {
    this.GET = "GET";
    this.POST = "POST";
    this.PUT = "PUT";
    this.HEAD = "HEAD";
    this.DELETE = "DELETE";
    this.OPTIONS = "OPTIONS";
    this.CONNECT = "CONNECT";
}
/**
 * @param {string} type APIRequestType (GET, POST, ...)
 * @returns {boolean}
 */
APIRequestType.isValidRequestType = function(type) {
    var requestType = new APIRequestType();
    for (var prop in requestType) {
        if(type === this[prop]){
            return true;
        }
    }
    return false;
}
function APIResponse(response){
    var _this = this,
        _response = response,
        _header = new APIRequestHeader();
    Object.defineProperties(this, {
        'response': {
            get: function(){
                return _response;
            }
        },
        'header': {
            get: function(){
                return _header;
            }
        }
    });
    _header.set(this.getHeader());
}

APIResponse.prototype.isJson = function(){
    for(var prop in this.header.json()){
        if(/content-type/i.test(prop)){
            var value = this.header.json()[prop];
            return typeof value === 'undefined' || !value ? false : /application\/json/i.test(value);
        }
    }
}

APIResponse.prototype.bodyAsJsonString = function(){
    throw new Error('This is an abstract method and must be implemented by subclass');
};
APIResponse.prototype.bodyAsObject = function(){
    throw new Error('This is an abstract method and must be implemented by subclass');
};
APIResponse.prototype.getHeader = function(){
    throw new Error('This is an abstract method and must be implemented by subclass');
};
APIResponse.prototype.getCode = function(){
    throw new Error('This is an abstract method and must be implemented by subclass');
};
APIResponse.prototype.getDetails = function(){
    throw new Error('This is an abstract method and must be implemented by subclass');
};
/**
 * @class
 * @arguments APIRequest
 */
function APICredentialsSs1(){ APICredentials.call(this); }
APICredentialsSs1.prototype = Object.create(APICredentials.prototype);
APICredentialsSs1.prototype.constructor = APICredentialsSs1;

/**
 * @arguments APIRequest
 */
APICredentialsSs1.prototype.get = function() {
    var _apiCredentialsFilter = [['name', 'is', this.getSystem()]];
    var _credentialsSearch = nlapiSearchRecord('customrecord_system_credentials', null, _apiCredentialsFilter);
    if(_credentialsSearch != null && _credentialsSearch.length == 1){
        var record = nlapiLoadRecord(_credentialsSearch[0].getRecordType(), _credentialsSearch[0].getId());
        this.setCredentialsRecord(record);
    } else {
        var errorBody = {
            'value': this.getSystem(),
            'message': (_credentialsSearch.length > 1
                ? 'RECORD: Multiple credentials found with same base URL, please make sure that base URL is unique.'
                : 'RECORD: No credentials found for specified base URL.')
        };
        nlapiLogExecution('error', errorBody.message, JSON.stringify(errorBody, null, 2));
    }
}

APICredentialsSs1.prototype.save = function () {
    nlapiSubmitRecord(this.getCredentialsRecord());
}
APICredentialsSs1.prototype.getByMethod = function(method, property){
    if(typeof method !== 'string' || typeof property !== 'string') return undefined;
    var _credentials = this.getCredentialsRecord();
    return _credentials && typeof _credentials === 'object' && typeof _credentials[method] === 'function' ? _credentials[method](property) : undefined;
}
APICredentialsSs1.prototype.getValue = function(property) {
    return this.getByMethod('getFieldValue', property);
}

APICredentialsSs1.prototype.getText = function(property) {
    return this.getByMethod('getFieldText', property);
}
/**
 * @class
 * @arguments APIRequest
 */
function APIRequestSs1(){ APIRequest.call(this); }
APIRequestSs1.prototype = Object.create(APIRequest.prototype);
APIRequestSs1.prototype.constructor = APIRequestSs1;

/**
 * This method executes
 * @arguments APIRequest
 * @returns {APIResponse}
 */
APIRequestSs1.prototype.execute = function() {
    var _header = this.getHeader().json(),
        _body = this.getData().json(true),
        _uri = this.getUri(),
        _method = this.getType(),
        _response = undefined;
    try {
        _response = nlapiRequestURL(_uri, _body, _header, _method);
    } catch (e) {
        return new APIResponseSs1(e);
    }
    return new APIResponseSs1(_response);
}

/**
 * @class
 * @arguments APIResponse
 */
function APIResponseSs1(response){ APIResponse.call(this, response); }
APIResponseSs1.prototype = Object.create(APIResponse.prototype);
APIResponseSs1.prototype.constructor = APIResponseSs1;

APIResponseSs1.prototype.bodyAsJsonString = function(){
    return typeof this.response.getBody === 'function' && !this.response.getBody() ? this.response.getBody() : undefined;
};
APIResponseSs1.prototype.bodyAsObject = function(){
    return !this.isJson() || typeof this.bodyAsJsonString() === 'undefined' ? JSON.parse(this.bodyAsJsonString()) : undefined;
};
APIResponseSs1.prototype.getHeader = function(){
    return typeof this.response.getAllHeaders === 'function' && !this.response.getAllHeaders() ? this.response.getAllHeaders() : {};
};
APIResponseSs1.prototype.getCode = function(){
    return typeof this.response.getCode === 'function' && !this.response.getCode() ? this.response.getCode() : undefined;
};
APIResponseSs1.prototype.getDetails = function(){
    return typeof this.response.getDetails === 'function' && !this.response.getDetails() ? this.response.getDetails() : undefined;
};
function RecordSs1(){
    Record.apply(this, arguments);
};
RecordSs1.prototype = Object.create(Record.prototype);
RecordSs1.prototype.constructor = RecordSs1;
RecordSs1.prototype.value = function(){
    var propertyName = arguments[0],
        setterValue = arguments[1];
    if(typeof propertyName !== 'string'){
        return undefined;
    }
    if(typeof setterValue !== 'undefined'){
        setterValue = typeof setterValue === 'object' ? JSON.stringify(setterValue) : setterValue.toString();
        this.record.setFieldValue(propertyName, setterValue);
    }
    return this.record.getFieldValue(propertyName);
}
RecordSs1.prototype.text = function(propertyName){
    var propertyName = arguments[0],
        setterValue = arguments[1];
    if(typeof propertyName !== 'string'){
        return undefined;
    }
    if(typeof setterValue !== 'undefined'){
        setterValue = typeof setterValue === 'object' ? JSON.stringify(setterValue) : setterValue.toString();
        this.record.setFieldText(propertyName, setterValue);
    }
    return this.record.getFieldText(propertyName);
}
RecordSs1.prototype.save = function(){
    nlapiSubmitRecord(this.record);
}
RecordSs1.prototype.load = function(id){
    this.record = nlapiLoadRecord(this.type, id);
    return this;
}
/**
 * @class
 * @arguments APIRequest
 */
function APICredentialsSs2(){ APICredentials.call(this); }
APICredentialsSs2.prototype = Object.create(APICredentials.prototype);
APICredentialsSs2.prototype.constructor = APICredentialsSs2;

/**
 * @arguments APIRequest
 */
APICredentialsSs2.prototype.get = function() {
    var _apiCredentialsFilter = [['name', 'is', this.getSystem()]],
        _apiCredentialsColumns = ['name'],
        _found = undefined,
        _this = this;
    require(['N/record', 'N/search'], function(record, search){
        //
        search.create({
            id: '',
            type: 'customrecord_system_credentials',
            filters: _apiCredentialsFilter,
            columns: _apiCredentialsColumns
        }).run().each(function(result){
            _found = record.load({'type': result.recordType, 'id': result.id});
            if(_found){
                _this.setCredentialsRecord(_found);
            }
        });
        if(!_found){
            var errorBody = {
                'value': _this.getSystem(),
                'message': 'RECORD: No credentials found for specified base URL.'
            };
            //TODO: error logging
        }
    });
}

APICredentialsSs2.prototype.save = function () {
    var _this = this;
    require(['N/record'], function(record){
        _this.getCredentialsRecord().save();
    });
}
APICredentialsSs2.prototype.getByMethod = function(method, property){
    if(typeof method !== 'string' || typeof property !== 'string') return undefined;
    var _credentials = this.getCredentialsRecord();
    return _credentials && typeof _credentials === 'object' && typeof _credentials[method] === 'function' ? _credentials[method]({fieldId: property}) : undefined;
}
APICredentialsSs2.prototype.getValue = function(property) {
    return this.getByMethod('getValue', property);
}

APICredentialsSs2.prototype.getText = function(property) {
    return this.getByMethod('getText', property);
}

/**
 * @class
 * @arguments APIRequest
 */
function APIRequestSs2(){ return APIRequest.call(this); }
APIRequestSs2.prototype = Object.create(APIRequest.prototype);
APIRequestSs2.prototype.constructor = APIRequestSs2;

/**
 * This method executes
 * @arguments APIRequest
 * @returns {APIResponse}
 */
APIRequestSs2.prototype.execute = function() {
    var _header = this.getHeader().json(),
        _body = this.getData().json(true),
        _uri = this.getUri(),
        _method = this.getType(),
        _response = undefined,
        _this = this;
    try {
        require(['N/http', 'N/https'], function (http, https) {
            if (_this.isHttps()){
                _response = https.request({method: _method, url: _uri, body: _body, headers: _header});
            } else {
                _response = http.request({method: _method, url: _uri, body: _body, headers: _header});
            }
        });
    } catch (e) {
        return new APIResponseSs2(e);
    }
    return new APIResponseSs2(_response);
}
/**
 * @class
 * @arguments APIResponse
 */
function APIResponseSs2(response){ APIResponse.call(this, response); }
APIResponseSs2.prototype = Object.create(APIResponse.prototype);
APIResponseSs2.prototype.constructor = APIResponseSs2;

APIResponseSs2.prototype.bodyAsJsonString = function(){
    return typeof this.response.body === 'string' && !this.response.body ? this.response.body : undefined;
};
APIResponseSs2.prototype.bodyAsObject = function(){
    return !this.isJson() || typeof this.bodyAsJsonString() === 'undefined' ? JSON.parse(this.bodyAsJsonString()) : undefined;
};
APIResponseSs2.prototype.getHeader = function(){
    return typeof this.response.headers === 'object' && !this.response.headers ? this.response.headers : {};
};
APIResponseSs2.prototype.getCode = function(){
    return typeof this.response.code !== 'undefined' ? this.response.code : undefined;
};
APIResponseSs2.prototype.getDetails = function(){
    return undefined;
};
function RecordSs2(){
    Record.apply(this, arguments);
};
RecordSs2.prototype = Object.create(Record.prototype);
RecordSs2.prototype.constructor = RecordSs2;
RecordSs2.prototype.value = function(){
    var propertyName = arguments[0],
        setterValue = arguments[1];
    if(typeof propertyName !== 'string'){
        return undefined;
    }
    if(typeof setterValue !== 'undefined'){
        setterValue = typeof setterValue === 'object' ? JSON.stringify(setterValue) : setterValue.toString();
        this.record.setValue({'fieldId': propertyName, 'value': setterValue});
    }
    return this.record.getValue({'fieldId': propertyName});
}
RecordSs2.prototype.text = function(propertyName){
    var propertyName = arguments[0],
        setterValue = arguments[1];
    if(typeof propertyName !== 'string'){
        return undefined;
    }
    if(typeof setterValue !== 'undefined'){
        setterValue = typeof setterValue === 'object' ? JSON.stringify(setterValue) : setterValue.toString();
        this.record.setValue({'fieldId': propertyName, 'value': setterValue});
    }
    return this.record.getText({'fieldId': propertyName});
}
RecordSs2.prototype.save = function () {
    var _this = this;
    require(['N/record'], function(record){
        _this.record.save();
    });
}
RecordSs2.prototype.load = function(id){
    var foundRecord = undefined,
        _this = this;
    require(['N/record'], function(record){
        foundRecord = record.load({'type': _this.type, 'fieldId': id});
    });

}

function EmployeeRecord(record){
    (Environment.isSs1() ? RecordSs1 : RecordSs2).call(this, 'employee', record);
}
EmployeeRecord.prototype = Object.create((Environment.isSs1() ? RecordSs1 : RecordSs2).prototype);
EmployeeRecord.prototype.constructor = EmployeeRecord;
EmployeeRecord.prototype.firstname = function(){
    return this.value('firstname');
}
EmployeeRecord.prototype.lastname = function(){
    return this.value('lastname');
}
EmployeeRecord.prototype.email = function(){
    return this.value('email');
}
EmployeeRecord.prototype.phone = function(){
    return this.value('phone');
}
EmployeeRecord.prototype.mobilePhone = function(){
    return this.value('mobilephone');
}
EmployeeRecord.prototype.homePhone = function(){
    return this.value('homephone');
}
EmployeeRecord.prototype.title = function(){
    return this.value('title');
}
EmployeeRecord.prototype.department = function(){
    return this.value('department');
}
EmployeeRecord.prototype.employeeStatus = function(){
    return this.value('employeestatus');
}
EmployeeRecord.prototype.location = function(){
    return this.value('location');
}