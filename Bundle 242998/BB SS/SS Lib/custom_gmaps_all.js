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
function GoogleMapsBaseRequest(){
	(Environment.isSs1() ? APIRequestSs1 : APIRequestSs2).call(this);
	if (arguments[0] instanceof GoogleMapsCredentials) {
		this.loadCredentials(arguments[0]);
	} else {
		this.loadCredentials(new GoogleMapsCredentials());
	}
    this.getHeader().append('Content-Type', 'application/json');
}
GoogleMapsBaseRequest.prototype = Object.create((Environment.isSs1() ? APIRequestSs1 : APIRequestSs2).prototype);
GoogleMapsBaseRequest.prototype.constructor = GoogleMapsBaseRequest;



function GoogleMapsCredentials(){
    (Environment.isSs1() ? APICredentialsSs1 : APICredentialsSs2).call(this);
    this.init('google-maps');
}
GoogleMapsCredentials.prototype = Object.create((Environment.isSs1() ? APICredentialsSs1 : APICredentialsSs2).prototype);
GoogleMapsCredentials.prototype.constructor = GoogleMapsCredentials;


function GoogleMapsGeocodeRequest(){
    GoogleMapsBaseRequest.call(this);
    this.getCommand = function(){
		return '/geocode/json';
    };
}
GoogleMapsGeocodeRequest.prototype = Object.create(GoogleMapsBaseRequest.prototype);
GoogleMapsGeocodeRequest.prototype.constructor = GoogleMapsGeocodeRequest;

GoogleMapsGeocodeRequest.prototype.get = function(address){
	var _request = new GoogleMapsBaseRequest();
	_request.getParams().append({ address: address });
	return _request.get(this.getCommand());
};