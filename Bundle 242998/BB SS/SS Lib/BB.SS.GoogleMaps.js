/**
 * Contains connection with Google Maps API to retrieve address information.
 *
 * @NApiVersion 2.0
 * @NModuleScope Public
 * @author Graham O'Daniel
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

if (typeof Array.prototype.find === 'undefined') {
	Array.prototype.find = function(tester) {
		for (var i = 0; i < this.length; i++) {
			if (tester(this[i])) return this[i];
		}
		return undefined;
	}
}

var BB = BB || {};
BB.GoogleMaps = BB.GoogleMaps || {};

BB.GoogleMaps.AddressComponentResolver = {
	/**
	 * @param {Object} address Google response from get address call.
	 * @param {String} componentType The type of component to retrieve.
	 * @returns {String} The requested component.
	 */
	resolveComponent: function (address, componentType, version) {
		return (address.address_components.find(
			function (component) {
				return component.types[0] == componentType;
			}
		) || {});
	}
}

BB.GoogleMaps.Address = function(params) {
	var _locationType = false,
		_lat = undefined,
		_lng = undefined,
		_streetAddress = undefined,
		_streetAddressLongName = undefined,
		_city = undefined,
		_cityLongName = undefined,
		_state = undefined,
		_stateLongName = undefined,
		_zipCode = undefined,
		_country = undefined,
		_countryLongName = undefined;

	if (params) {
		if (params.geometry) {
			var resolver = BB.GoogleMaps.AddressComponentResolver;
			_locationType = params.geometry.location_type;
			_lat = params.geometry.location.lat;
			_lng = params.geometry.location.lng;
			_streetAddress = [
				resolver.resolveComponent(params, 'street_number').short_name,
				resolver.resolveComponent(params, 'route').short_name
			].join(' ');
			_streetAddressLongName = [
				resolver.resolveComponent(params, 'street_number').long_name,
				resolver.resolveComponent(params, 'route').long_name
			].join(' ');
			_city = resolver.resolveComponent(params, 'locality').short_name;
			_cityLongName = resolver.resolveComponent(params, 'locality').long_name;
			_state = resolver.resolveComponent(params, 'administrative_area_level_1').short_name;
			_stateLongName = resolver.resolveComponent(params, 'administrative_area_level_1').long_name;
			_zipCode = resolver.resolveComponent(params, 'postal_code').short_name;
			_country = resolver.resolveComponent(params, 'country').short_name;
			_countryLongName = resolver.resolveComponent(params, 'country').long_name;
		} else {
			_locationType = params.locationType;
			_lat = params.lat;
			_lng = params.lng;
			_zipCode = params.zipCode;
		}
	}

	Object.defineProperties(this, {
		'locationType': {
			get: function() {
				return _locationType;
			},
			set: function(val) {
				_locationType = val;
			}
		},
		'lat': {
			get: function() {
				return _lat;
			},
			set: function(val) {
				_lat = val;
			}
		},
		'lng': {
			get: function() {
				return _lng;
			},
			set: function(val) {
				_lng = val;
			}
		},
		'isValid': {
			get: function() {
				// Google doesn't actually have a validation service but the address location_type may be useful here.
				return _locationType == 'ROOFTOP';
			},
			set: function() {
				throw 'isValid is a read-only property.';
			}
		},
		'streetAddress': {
			get: function() {
				return _streetAddress;
			},
			set: function(val) {
				_streetAddress = val;
			}
		},
		'streetAddressLongName': {
			get: function() {
				return _streetAddressLongName;
			},
			set: function(val) {
				_streetAddressLongName = val;
			}
		},
		'city': {
			get: function() {
				return _city;
			},
			set: function(val) {
				_city = val;
			}
		},
		'cityLongName': {
			get: function() {
				return _cityLongName;
			},
			set: function(val) {
				_cityLongName = val;
			}
		},
		'state': {
			get: function() {
				return _state;
			},
			set: function(val) {
				_state = val;
			}
		},
		'stateLongName': {
			get: function() {
				return _stateLongName;
			},
			set: function(val) {
				_stateLongName = val;
			}
		},
		'zipCode': {
			get: function() {
				return _zipCode;
			},
			set: function(val) {
				_zipCode = val;
			}
		},
		'country': {
			get: function() {
				return _country;
			},
			set: function(val) {
				_country = val;
			}
		},
		'countryLongName': {
			get: function() {
				return _countryLongName;
			},
			set: function(val) {
				_countryLongName = val;
			}
		},
		'singleLine': {
			get: function() {
				return [_streetAddress, _city, [_state, _zipCode].join(' ')].join(', ');
			},
			set: function() {
				throw 'singleLine is a read-only property.';
			}
		}
	});
}

BB.GoogleMaps.Address.prototype.constructor = BB.GoogleMaps.Address;
BB.GoogleMaps.Address.prototype.equals = function(address) {
	return (this.streetAddress == address.streetAddress || this.streetAddress == address.streetAddressLongName ||
		this.streetAddressLongName == address.streetAddress || this.streetAddressLongName == address.streetAddressLongName)
		&&
		(this.city == address.city || this.city == address.cityLongName ||
		this.cityLongName == address.city || this.cityLongName == address.cityLongName)
		&&
		(this.state == address.state || this.state == address.stateLongName ||
		this.stateLongName == address.state || this.stateLongName == address.stateLongName)
		&&
		this.zipCode == address.zipCode;
}

define(['./bb_framework_all', './custom_gmaps_all'], function(bb_framework, gmaps) {
	/**
	 * Calls Google Geocoding service to retrieve an address. If multiple addresses are returned by Google, only the first
	 * address is returned by the function.
	 * 
	 * Expected usage: 34
	 * 
	 * @param {String} address Address formatted typically as Street, City, State.
	 * @param {Function} onError Callback function if error is returned by Google.
	 * @param {Function} onSuccess Callback function if call to Google is successful.
	 * @returns {BB.GoogleMaps.Address} Returns the first address if successful and undefined otherwise.
	 */
	function getAddress(address, onError, onSuccess) { 
	// ***address passed here should be project address****  lat and lng should be addded here to set on project/customer id can be passed here and save lat and lng to record
	//address should contain lat and lng to set on project record.
		var _address;

		var request = new GoogleMapsGeocodeRequest();
		var response = request.get(address);
		var mapResponse = undefined;

		try {
			mapResponse = JSON.parse(response.response.body);
		} catch(ex) {
			log.error('ERROR: could not parse response', ex);
		}

		if(mapResponse) {
			if (mapResponse.status === 'OK') {
				if (typeof onSuccess === 'function') onSuccess(mapResponse);
				else {
					_address = mapResponse.results[0]; //new BB.GoogleMaps.Address(mapResponse.results[0]);
				}
			} else {
				if (typeof onError === 'function') onError(mapResponse);
			}
		}
		return _address || new BB.GoogleMaps.Address();
	}

	/**
	 * Returns latitude and longitude for a given address.
	 *
	 * Expected usage: 34
	 *
	 * @param {String} address Address string formatted typically as Street Address, City, State.
	 * @returns {BB.GoogleMaps.Address} Object with lat and lng properties. If an error occurred then nothing is returned by the function.
	 * @throws {Object} Will throw an error based on response status.
	 * @example
	 * var x = getLatLong('1600+Amphitheatre+Parkway,+Mountain+View,+CA');
	 * nlapiLogExecution('DEBUG', 'lat, lng', x.lat + ',' + x.lng);
	 */
	function getLatLong(address) {
		var address = getAddress(address, 
			function(response) { // Error
				log.error('ERROR: ' + response.status, (function(status) {
					switch (status) {
						case 'ZERO_RESULTS':
							return 'Address not found.';
						case 'OVER_QUERY_LIMIT':
							return 'Query limit exceeded.';
						case 'REQUEST_DENIED':
							return 'Request denied.';
						case 'INVALID_REQUEST':
							return 'Invalid request.';
						default:
							return 'Unknown error.';
					}
				})(response.status));
			},
			undefined
		);

		return address;
	}

	/**
	 * Returns whether a given address is valid.
	 * 
	 * Expected usage: 34
	 * 
	 * @param {Object} address GoogleAddress object to validate.
	 * @returns {Boolean} True means the address is valid, and False means the address is not valid.
	 */
	function validateAddress(address) {
		if (typeof address.singleLine === 'undefined') {
			throw 'Parameter must be a GoogleAddress object.';
		}
		var resolvedAddress = getAddress(address.singleLine,
			function(response) {
				if (response.status != 'ZERO_RESULTS') {
					log.error('ERROR: ' + response.status, (function(status) {
						switch (status) {
							case 'OVER_QUERY_LIMIT':
								return 'Query limit exceeded.';
							case 'REQUEST_DENIED':
								return 'Request denied.';
							case 'INVALID_REQUEST':
								return 'Invalid request.';
							default:
								return 'Unknown error.';
						}
					})(response.status));
				}
			}
		);

		return resolvedAddress.isValid && resolvedAddress.equals(address);
	}
	
	return {
		getAddress: getAddress,
		getLatLong: getLatLong,
		validateAddress: validateAddress
	};
});