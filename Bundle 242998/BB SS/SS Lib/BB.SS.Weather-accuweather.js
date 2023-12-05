var BB = BB || {};
BB.SS = BB.SS || {};
BB.SS.Weather = BB.SS.Weather || {};

var bb = require(['/SuiteScripts/BB/SS/Lib/bb_framework_all']);
BB.SS.Weather.AccuweatherBaseRequest = function() {
	(Environment.isSs1() ? APIRequestSs1 : APIRequestSs2).call(this);
	if (arguments[0] instanceof BB.SS.Weather.AccuweatherCredentials) {
		this.loadCredentials(arguments[0]);
	} else {
		this.loadCredentials(new BB.SS.Weather.AccuweatherCredentials());
	}
    this.getHeader().append('Content-Type', 'application/json');
}
BB.SS.Weather.AccuweatherBaseRequest.prototype = Object.create((Environment.isSs1() ? APIRequestSs1 : APIRequestSs2).prototype);
BB.SS.Weather.AccuweatherBaseRequest.prototype.constructor = BB.SS.Weather.AccuweatherBaseRequest;

BB.SS.Weather.AccuweatherCredentials = function(){
    (Environment.isSs1() ? APICredentialsSs1 : APICredentialsSs2).call(this);
    this.init('weather-accuweather');
}
BB.SS.Weather.AccuweatherCredentials.prototype = Object.create((Environment.isSs1() ? APICredentialsSs1 : APICredentialsSs2).prototype);
BB.SS.Weather.AccuweatherCredentials.prototype.constructor = BB.SS.Weather.AccuweatherCredentials;
BB.SS.Weather.AccuweatherFiveDayForecastRequest = function (){
    BB.SS.Weather.BaseRequest.call(this);
    this.getCommand = function(){
		return '/forecasts/v1/daily/5day';
    };
}
BB.SS.Weather.AccuweatherFiveDayForecastRequest.prototype = Object.create(BB.SS.Weather.AccuweatherBaseRequest.prototype);
BB.SS.Weather.AccuweatherFiveDayForecastRequest.prototype.constructor = BB.SS.Weather.AccuweatherFiveDayForecastRequest;

BB.SS.Weather.AccuweatherFiveDayForecastRequest.prototype.get = function(locationKey){
	var _request = new BB.SS.Weather.AccuweatherBaseRequest();
	return _request.get([this.getCommand(), locationKey].join('/'));
};
BB.SS.Weather.AccuweatherLocationRequest = function (){
    BB.SS.Weather.AccuweatherBaseRequest.call(this);
    this.getCommand = function(){
		return '/locations/v1/cities/search';
    };
}
BB.SS.Weather.AccuweatherLocationRequest.prototype = Object.create(BB.SS.Weather.AccuweatherBaseRequest.prototype);
BB.SS.Weather.AccuweatherLocationRequest.prototype.constructor = BB.SS.Weather.AccuweatherLocationRequest;

BB.SS.Weather.AccuweatherLocationRequest.prototype.get = function(address){
	var _request = new BB.SS.Weather.AccuweatherBaseRequest();
	_request.getParams().append({
		q: address
	});
	return _request.get(this.getCommand());
};
BB.SS.Weather.AccuweatherService = function() {}

BB.SS.Weather.AccuweatherService.prototype.constructor = BB.SS.Weather.AccuweatherService;
BB.SS.Weather.AccuweatherService.prototype.getForecastForZip = function(zipCode) {
	var locationResponse = new BB.SS.Weather.AccuweatherLocationRequest().get([zipCode, 'US'].join(' '));
	var locations = JSON.parse(locationResponse.response.body);
	var location = locations[0];
	var forecastResponse = new BB.SS.Weather.AccuweatherFiveDayForecastRequest().get(location.Key);
	return JSON.parse(forecastResponse.response.body);
}
BB.SS.Weather.BaseRequest = function() {
	(Environment.isSs1() ? APIRequestSs1 : APIRequestSs2).call(this);
	if (arguments[0] instanceof BB.SS.Weather.Credentials) {
		this.loadCredentials(arguments[0]);
	} else {
		this.loadCredentials(new BB.SS.Weather.Credentials());
	}
    this.getHeader().append('Content-Type', 'application/json');
}
BB.SS.Weather.BaseRequest.prototype = Object.create((Environment.isSs1() ? APIRequestSs1 : APIRequestSs2).prototype);
BB.SS.Weather.BaseRequest.prototype.constructor = BB.SS.Weather.BaseRequest;

BB.SS.Weather.Credentials = function(){
    (Environment.isSs1() ? APICredentialsSs1 : APICredentialsSs2).call(this);
    this.init('weather-apixu');
}
BB.SS.Weather.Credentials.prototype = Object.create((Environment.isSs1() ? APICredentialsSs1 : APICredentialsSs2).prototype);
BB.SS.Weather.Credentials.prototype.constructor = BB.SS.Weather.Credentials;
BB.SS.Weather.CurrentRequest = function (){
    BB.SS.Weather.BaseRequest.call(this);
    this.getCommand = function(){
		return '/v1/current.json';
    };
}
BB.SS.Weather.CurrentRequest.prototype = Object.create(BB.SS.Weather.BaseRequest.prototype);
BB.SS.Weather.CurrentRequest.prototype.constructor = BB.SS.Weather.CurrentRequest;

BB.SS.Weather.CurrentRequest.prototype.get = function(address){
	var _request = new BB.SS.Weather.BaseRequest();
	_request.getParams().append({ q: address });
	return _request.get(this.getCommand());
};
BB.SS.Weather.Forecast = function(params) {
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

BB.SS.Weather.Forecast.prototype.constructor = BB.SS.Weather.Forecast;
BB.SS.Weather.Forecast.prototype.get = function(forecastDays) {
	
}
BB.SS.Weather.ForecastRequest = function (){
    BB.SS.Weather.BaseRequest.call(this);
    this.getCommand = function(){
		return '/v1/forecast.json';
    };
}
BB.SS.Weather.ForecastRequest.prototype = Object.create(BB.SS.Weather.BaseRequest.prototype);
BB.SS.Weather.ForecastRequest.prototype.constructor = BB.SS.Weather.ForecastRequest;

BB.SS.Weather.ForecastRequest.prototype.get = function(address){
	var _request = new BB.SS.Weather.BaseRequest();
	_request.getParams().append({
		q: address,
		days: 10
	});
	return _request.get(this.getCommand());
};
BB.SS.Weather.Service = function() {}

BB.SS.Weather.Service.prototype.constructor = BB.SS.Weather.Service;
BB.SS.Weather.Service.prototype.getForecastForZip = function(zipCode) {
	var forecastResponse = new BB.SS.Weather.ForecastRequest().get(zipCode);
	return JSON.parse(forecastResponse.response.body);
}
define(['/SuiteScripts/BB/SS/Lib/bb_framework_all'], function(bb) {
	return new BB.SS.Weather.Service();
});