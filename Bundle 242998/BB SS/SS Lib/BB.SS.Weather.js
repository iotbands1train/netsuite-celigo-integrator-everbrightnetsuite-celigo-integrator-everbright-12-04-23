/**
* @NModuleScope Public
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
var BB = BB || {};
BB.SS = BB.SS || {};
BB.SS.Weather = BB.SS.Weather || {};

//var bb = require(['SuiteScripts/BB SS/SS Lib/bb_framework_all']);
BB.SS.Weather.AccuweatherBaseRequest = function(){
    var _export = function() {
			(Environment.isSs1() ? APIRequestSs1 : APIRequestSs2).call(this);
			if (arguments[0] instanceof BB.SS.Weather.AccuweatherCredentials) {
				this.loadCredentials(arguments[0]);
			} else {
				var _accuweatherCredentialsModule = new BB.SS.Weather.AccuweatherCredentials();
				this.loadCredentials(new _accuweatherCredentialsModule());
			}
			this.getHeader().append('Content-Type', 'application/json');
		};
    _export.prototype = Object.create((Environment.isSs1() ? APIRequestSs1 : APIRequestSs2).prototype);
    _export.prototype.constructor = _export;
    return _export;
}

BB.SS.Weather.AccuweatherCredentials = function(){
    var _export = function(){
        (Environment.isSs1() ? APICredentialsSs1 : APICredentialsSs2).call(this);
        this.init('weather-accuweather');
    }
    _export.prototype = Object.create((Environment.isSs1() ? APICredentialsSs1 : APICredentialsSs2).prototype);
    _export.prototype.constructor = _export;
    return _export;
}

BB.SS.Weather.AccuweatherFiveDayForecastRequest = function(){
    var _baseRequestModule = new BB.SS.Weather.AccuweatherBaseRequest(),
        _export = AccuweatherFiveDayForecastRequest = function (){
            _baseRequestModule.call(this);
            this.getCommand = function(){
                return '/forecasts/v1/daily/5day';
            };
        };
    _export.prototype = Object.create(_baseRequestModule.prototype);
    _export.prototype.constructor = _export;

    _export.prototype.get = function(locationKey){
        var _request = new _baseRequestModule();
        return _request.get([this.getCommand(), locationKey].join('/'));
    };
    return _export;
}

BB.SS.Weather.AccuweatherLocationRequest = function(){
	var _baseRequestModule = new BB.SS.Weather.AccuweatherBaseRequest(),
		_export = function (){
            _baseRequestModule.call(this);
			this.getCommand = function(){
				return '/locations/v1/cities/search';
			};
		};
    _export.prototype = Object.create(_baseRequestModule.prototype);
    _export.prototype.constructor = _export;

    _export.prototype.get = function(address){
        var _request = new _baseRequestModule();
        _request.getParams().append({
            q: address
        });
        return _request.get(this.getCommand());
    };
    return _export;
}
BB.SS.Weather.AccuweatherService = function() {}

BB.SS.Weather.AccuweatherService.prototype.constructor = BB.SS.Weather.AccuweatherService;
BB.SS.Weather.AccuweatherService.prototype.getForecastForZip = function(zipCode) {
	var _locationRequestModule = new BB.SS.Weather.AccuweatherLocationRequest(),
		_locationRequest = new _locationRequestModule();
	var _locationResponse = _locationRequest.get([zipCode, 'US'].join(' '));
	var _locations = JSON.parse(_locationResponse.response.body);
	var _location = _locations[0];
  	// if location is not found return empty result
	if(!_location){
		return { DailyForecasts: [] };
	}
	var _forecastRequestModule = new BB.SS.Weather.AccuweatherFiveDayForecastRequest(),
		_forecastRequest = new _forecastRequestModule();
	var _forecastResponse = _forecastRequest.get(_location.Key);
	return JSON.parse(_forecastResponse.response.body);
}
BB.SS.Weather.AccuweatherTenDayForecastRequest = function(){
    var _baseRequestModule = new BB.SS.Weather.AccuweatherBaseRequest(),
        _export = AccuweatherTenDayForecastRequest = function (){
            _baseRequestModule.call(this);
            this.getCommand = function(){
                return '/forecasts/v1/daily/10day';
            };
        };
    _export.prototype = Object.create(_baseRequestModule.prototype);
    _export.prototype.constructor = _export;

    _export.prototype.get = function(locationKey){
        var _request = new _baseRequestModule();
        return _request.get([this.getCommand(), locationKey].join('/'));
    };
    return _export;
}

BB.SS.Weather.ApiXuBaseRequest = function() {
	var _export = function() {
			(Environment.isSs1() ? APIRequestSs1 : APIRequestSs2).call(this);
			if (arguments[0] instanceof BB.SS.Weather.ApiXuCredentials) {
				this.loadCredentials(arguments[0]);
			} else {
				var _apiXuCredentialsModule = new BB.SS.Weather.ApiXuCredentials();
				this.loadCredentials(new _apiXuCredentialsModule());
			}
			this.getHeader().append('Content-Type', 'application/json');
		};
    _export.prototype = Object.create((Environment.isSs1() ? APIRequestSs1 : APIRequestSs2).prototype);
    _export.prototype.constructor = _export;
    return _export;
}

BB.SS.Weather.ApiXuCredentials = function(){
    var _export = function(){
        (Environment.isSs1() ? APICredentialsSs1 : APICredentialsSs2).call(this);
        this.init('weather-apixu');
    }
    _export.prototype = Object.create((Environment.isSs1() ? APICredentialsSs1 : APICredentialsSs2).prototype);
    _export.prototype.constructor = _export;
    return _export;
}
BB.SS.Weather.ApiXuCurrentRequest = function(){
	var _baseRequestModule = new BB.SS.Weather.ApiXuBaseRequest(),
		_export = function (){
            _baseRequestModule.call(this);
			this.getCommand = function(){
				return '/v1/current.json';
			};
		};
    _export.prototype = Object.create(_baseRequestModule.prototype);
    _export.prototype.constructor = _export;

    _export.prototype.get = function(address){
        var _request = new _baseRequestModule();
        _request.getParams().append({ q: address });
        return _request.get(this.getCommand());
    };
    return _export;
}
BB.SS.Weather.ApiXuForecast = function(params) {
	var _address = undefined,
		_days = undefined;

	Object.defineProperties(this, {
		'address': {
			enumerable: true,
			get: function() {
				return _address;
			},
			set: function(val) {
				_address = val;
			}
		},
		'days': {
			enumerable: true,
			get: function() {
				return _days;
			}
		}
	});

	if (params) {
		_address = params.address;
		_days = params.days;
	}
}

BB.SS.Weather.ApiXuForecast.prototype.constructor = BB.SS.Weather.ApiXuForecast;
BB.SS.Weather.ApiXuForecast.prototype.get = function(forecastDays) {
	
}
BB.SS.Weather.ApiXuForecastRequest = function(){
	var _baseRequestModule = new BB.SS.Weather.ApiXuBaseRequest(),
		_export = function (){
            _baseRequestModule.call(this);
			this.getCommand = function(){
				return '/v1/forecast.json';
			};
		};
    _export.prototype = Object.create(_baseRequestModule.prototype);
    _export.prototype.constructor = _export;

    _export.prototype.get = function(address){
        var _request = new _baseRequestModule();
        _request.getParams().append({
            q: address,
            days: 10
        });
        return _request.get(this.getCommand());
    };
    return _export;
}
BB.SS.Weather.ApiXuService = function() {}

BB.SS.Weather.ApiXuService.prototype.constructor = BB.SS.Weather.ApiXuService;
BB.SS.Weather.ApiXuService.prototype.getForecastForZip = function(zipCode) {
	var _forecastRequestModule = new BB.SS.Weather.ApiXuForecastRequest(),
		_forecastRequest = new _forecastRequestModule();
	var _forecastResponse = _forecastRequest.get(zipCode);
	return JSON.parse(_forecastResponse.response.body);
}
define(['./bb_framework_all'], function(bb) {
	return new BB.SS.Weather.AccuweatherService();
});