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
BB.SS.BayWa = BB.SS.BayWa || {};

//var bb = require(['/SuiteScripts/BB SS/SS Lib/bb_framework_all']);
BB.SS.BayWa.BaseRequest = function(){
	var _export = function() {
		(Environment.isSs1() ? APIRequestSs1 : APIRequestSs2).call(this);
		if (arguments[0] instanceof BB.SS.BayWa.Credentials) {
			this.loadCredentials(arguments[0]);
		} else {
			var credentialsModule = new BB.SS.BayWa.Credentials();
			this.loadCredentials(new credentialsModule());
		}
		this.getHeader().append('Content-Type', 'application/json');
	}
    _export.prototype = Object.create((Environment.isSs1() ? APIRequestSs1 : APIRequestSs2).prototype);
    _export.prototype.constructor = _export;
    return _export;
}

BB.SS.BayWa.Credentials = function(){
    var _export = function(){
        (Environment.isSs1() ? APICredentialsSs1 : APICredentialsSs2).call(this);
        this.init('distributor-BayWa');
    }
    _export.prototype = Object.create((Environment.isSs1() ? APICredentialsSs1 : APICredentialsSs2).prototype);
    _export.prototype.constructor = _export;
    return _export;
}
BB.SS.BayWa.GetItemAvailabilityRequest = function(){
    var _baseRequestModule = new BB.SS.BayWa.BaseRequest(),
        _export = function (){
            _baseRequestModule.call(this);
            this.getCommand = function(){
                return 'restlet.nl';  // replace script id with the text form, deploy with text form
            };
        };
    _export.prototype = Object.create(_baseRequestModule.prototype);
    _export.prototype.constructor = _export;

    _export.prototype.post = function(payload){
        var _request = new _baseRequestModule();
        _request.getParams().append({       // To-Do: replace internal ID's with custom name
            script: 529,
            deploy: 1
        });
        _request.getData().set(payload);
        return _request.post(this.getCommand());
    };
    return _export;
}
BB.SS.BayWa.GetItemCatalogRequest = function(){ //GetItemPricesRequest
	var _baseRequestModule = new BB.SS.BayWa.BaseRequest(),
        _export = function (){
            _baseRequestModule.call(this);
            this.getCommand = function(){
                return 'restlet.nl';  // replace script id with the text form, deploy with text form
            };
        };
    _export.prototype = Object.create(_baseRequestModule.prototype);
    _export.prototype.constructor = _export;

    _export.prototype.get = function(customerEmail){
        var _request = new _baseRequestModule();
        _request.getParams().append({
            script: 541,
            deploy: 1,
            email: customerEmail
        });
        return _request.get(this.getCommand());
    };
    return _export;
}
BB.SS.BayWa.Service = function() {}

BB.SS.BayWa.Service.prototype.constructor = BB.SS.BayWa.Service;

BB.SS.BayWa.Service.prototype.getEmailAddress = function() {
    var _credentialsModule = new BB.SS.BayWa.Credentials(),
        _credentialsObject = new _credentialsModule();
    return _credentialsObject.getUsername();
}

BB.SS.BayWa.Service.prototype.getItemCatalog = function(customerEmail) { //getItemPrices
    var _getItemCatalogRequestModule = new BB.SS.BayWa.GetItemCatalogRequest(),
        _getItemCatalogRequestObject = new _getItemCatalogRequestModule(),
        _getItemCatalogResponse = _getItemCatalogRequestObject.get(customerEmail);
	return JSON.parse(_getItemCatalogResponse.response.body);
}

BB.SS.BayWa.Service.prototype.getItemAvailability = function(payload) {
    var _getItemAvailabilityResponseModule = new BB.SS.BayWa.GetItemAvailabilityRequest(),
        _getItemAvailabilityResponseObject = new _getItemAvailabilityResponseModule(),
        _getItemAvailabilityResponse = _getItemAvailabilityResponseObject.post(payload);
    return JSON.parse(_getItemAvailabilityResponse.response.body);
}
define(['./bb_framework_all'], function(bb) {
	return new BB.SS.BayWa.Service();
});