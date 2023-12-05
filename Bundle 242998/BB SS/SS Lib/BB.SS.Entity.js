/**
* @NApiVersion 2.x
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
BB.SS.Entity = BB.SS.Entity || {};
BB.SS.DocumentStatuses = {
	NOT_STARTED: '1',
	REQUESTED: '2',
	PENDING_PM_REVIEW: '3',
	SUBMITTED_TO_ENGINEERING: '4',
	SUBMITTED_TO_FUND: '5',
	SUBMITTED_TO_HOMEOWNER: '6',
	SUBMITTED_TO_INSTALLER: '7',
	SUBMITTED_TO_SALES_PARTNER: '8',
	SUBMITTED_TO_UTILITY: '9',
	APPROVED_BY_INTERNAL_REVIEWER: '10',
	APPROVED_BY_FUN: '11',
	APPROVED_BY_UTILITY: '12',
	REJECTED_BY_INTERNAL_REVIEWER: '13',
	REJECTED_BY_FUND: '14',
	REJECTED_BY_INSTALLER: '15',
	REJECTED_BY_SALES_PARTNER: '16',
	REJECTED_BY_UTILITY: '17'
}
BB.SS.Entity.Address = function(){
	var _export = function(params) {
            var _addressLine1 = undefined,
                _addressLine2 = undefined,
                _addressLine3 = undefined,
                _city = undefined,
                _state = undefined,
                _zip = undefined,
                _defaultShipping = false,
                _defaultBilling = false,
                __changes = {
                    _addressLine1: false,
                    _addressLine2: false,
                    _addressLine3: false,
                    _city: false,
                    _state: false,
                    _zip: false,
                    _defaultShipping: false,
                    _defaultBilling: false,
                    hasChanges: function() {
                        return this._addressLine1 || this._addressLine2 || this._addressLine3 ||
                            this._city || this._state || this._zip ||
                            this._defaultBilling || this._defaultShipping;
                    },
                    clear: function() {
                        this._addressLine1 = false;
                        this._addressLine2 = false,
                            this._addressLine3 = false,
                            this._city = false;
                        this._state = false;
                        this._zip = false;
                        this._defaultBilling = false;
                        this._defaultShipping = false;
                    }
                };

            Object.defineProperties(this, {
                'addressLine1': {
                    enumerable: true,
                    get: function() {
                        return _addressLine1;
                    },
                    set: function(val) {
                        _addressLine1 = val;
                        __changes.addressLine1 = true;
                    }
                },
                'addressLine2': {
                    enumerable: true,
                    get: function() {
                        return _addressLine2;
                    },
                    set: function(val) {
                        _addressLine2 = val;
                        __changes.addressLine2 = true;
                    }
                },
                'addressLine3': {
                    enumerable: true,
                    get: function() {
                        return _addressLine3;
                    },
                    set: function(val) {
                        _addressLine3 = val;
                        __changes.addressLine3 = true;
                    }
                },
                'city': {
                    enumerable: true,
                    get: function() {
                        return _city;
                    },
                    set: function(val) {
                        _city = val;
                        __changes.city = true;
                    }
                },
                'state': {
                    enumerable: true,
                    get: function() {
                        return _state;
                    },
                    set: function(val) {
                        _state = val;
                        __changes.state = true;
                    }
                },
                'zip': {
                    enumerable: true,
                    get: function() {
                        return _zip;
                    },
                    set: function(val) {
                        _zip = val;
                        __changes.zip = true;
                    }
                },
                'defaultBilling': {
                    enumerable: true,
                    get: function() {
                        return _defaultBilling;
                    },
                    set: function(val) {
                        _defaultBilling = val;
                        __changes.defaultBilling = true;
                    }
                },
                'defaultShipping': {
                    enumerable: true,
                    get: function() {
                        return _defaultShipping;
                    },
                    set: function(val) {
                        _defaultShipping = val;
                        __changes.defaultShipping = true;
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
                _addressLine1 = params.addressLine1;
                _addressLine2 = params.addressLine2;
                _addressLine3 = params.addressLine3;
                _city = params.city;
                _state = params.state;
                _zip = params.zip;
                _defaultBilling = params.defaultBilling;
                _defaultShipping = params.defaultShipping;
            }
        };
	_export.prototype.constructor = _export;
	_export.initializeFromAddressSubrecord = function(subrecord) {
        var address = new _export({
            addressLine1: subrecord.getValue('addr1'),
            addressLine2: subrecord.getValue('addr2'),
            city: subrecord.getValue('city'),
            state: subrecord.getValue('state'),
            zip: subrecord.getValue('zip')
        });

        return address;
    }
	return _export;
}

BB.SS.Entity.Address.prototype.constructor = BB.SS.Entity.Address;
if (typeof Array.prototype.find === 'undefined') {
	Array.prototype.find = function(callback) {
		for (var x = 0; x < this.length; x++) {
			if (callback.call(this, this[x])) return this[x];
		}
	}
}
BB.SS.Entity.AddressBook = function(){
	var _export = function() {
        var _addresses = [];

        Object.defineProperties(this, {
            'addresses': {
                enumerable: true,
                get: function() {
                    return _addresses;
                }
            },
            'defaultBillingAddress': {
                enumerable: true,
                get: function() {
                    return _addresses.find(function(address) {
                        return address.defaultBilling;
                    });
                }
            },
            'defaultShippingAddress': {
                enumerable: true,
                get: function() {
                    return _addresses.find(function(address) {
                        return address.defaultShipping;
                    });
                }
            }
        });
    };
	_export.prototype.constructor = _export;
	_export.initializeFromRecord = function(record) {
        var addressBook = new _export(),
			addressModule = new BB.SS.Entity.Address();

        var addresses = record.getLineCount({ sublistId: 'addressbook' });
        for (var x=0; x < addresses; x++) {
            var defaultShipping = record.getSublistValue({ sublistId: 'addressbook', fieldId: 'defaultshipping', line: x });
            var addressSubrecord = record.getSublistSubrecord({ sublistId: 'addressbook', fieldId: 'addressbookaddress', line: x });
            var address = addressModule.initializeFromAddressSubrecord(addressSubrecord);
            address.defaultShipping = defaultShipping;

            addressBook.addresses.push(address);
        }

        return addressBook;
    }
	return _export;
}

BB.SS.Entity.AddressBook.prototype.constructor = BB.SS.Entity.AddressBook;
BB.SS.Entity.BbFile = function(recordModule){
    var _recordModule = recordModule,
        _export = function(params) {
            var _internalId = undefined,
                _link = undefined,
                _uniqueId = undefined,
                __changes = {
                    link: false,
                    uniqueId: false,
                    hasChanges: function() {
                        return this.link || this.uniqueId;
                    },
                    clear: function() {
                        this.link = false;
                        this.uniqueId = false;
                    }
                };

            Object.defineProperties(this, {
                'internalId': {
                    enumerable: true,
                    get: function() {
                        return _internalId;
                    },
                    set: function(val) {
                        //if (!util.isNumber(val)) throw 'Invalid value, ' + val + ', for internalId.';
                        _internalId = val;
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
                '__changes': {
                    enumerable: true,
                    get: function() {
                        return __changes;
                    }
                }

            });

            if (params) {
                this.internalId = params.internalId;
                this.link = params.link;
                this.uniqueId = params.uniqueId;
            }
        };
    _export.prototype.constructor = _export;
    _export.prototype.load = function() {
        var _this = this;

        var file = _recordModule.load({
            type: BB.SS.Entity.BbFile.TYPE,
            id: _this.internalId
        });

        _this.map(file);

        _this.__changes.clear();

        return this;
    };
    _export.prototype.map = function(file){
        var _this = this;
        if(file !== Object(file)){
            throw 'Variable "file" is not a valid NetSuite object';
        }
        _this.link = file.getValue(BB.SS.Entity.BbFile.Fields.LINK);
        _this.uniqueId = file.getValue(BB.SS.Entity.BbFile.Fields.UNIQUE_ID);

        if(typeof _this.link === 'string'){
            _this.link = _this.link.replace('https://', '');
            _this.link = _this.link.replace('http://', '');
        }
        return _this;
    }
    return _export;
}

BB.SS.Entity.BbFile.TYPE = 'customrecord_bb_file';
BB.SS.Entity.BbFile.Fields = {
    LINK: 'custrecord_bb_file_link',
    UNIQUE_ID: 'custrecord_bb_file_uuid'
}
BB.SS.Entity.BbFile.prototype.constructor = BB.SS.Entity.BbFile;

BB.SS.Entity.EntityRecord = function(recordModule){ //
	var _recordModule = recordModule,
		_addressBookModule = new BB.SS.Entity.AddressBook(),
		_export = function(params) {
            var _internalId = undefined,
                _id = undefined,
                _name = undefined,
                _isPerson = undefined,
                _companyName = undefined,
                _parent = undefined,
                _status = undefined,
                _subsidiary = undefined,
                _firstName = undefined,
                _lastName = undefined,
                _salesRep = undefined,
                _partner = undefined,
                _category = undefined,
                _defaultOrderPriority = undefined,
                _comments = undefined,
                _email = undefined,
                _altEmail = undefined,
                _phone = undefined,
                _altPhone = undefined,
                _mobilePhone = undefined,
                _homePhone = undefined,
                _fax = undefined,
                _installationAddr1 = undefined,
                _installationAddr2 = undefined,
                _installationCity = undefined,
                _installationZip = undefined,
                _installationState = undefined,
                _utilityCompany = undefined,
                _utilityBillDocument = undefined,
                _marketSegment = undefined,
                _addressBook = undefined,
                __changes = {
                    id: false,
                    isPerson: false,
                    companyName: false,
                    parent: false,
                    status: false,
                    subsidiary: false,
                    firstName: false,
                    lastName: false,
                    salesRep: false,
                    partner: false,
                    category: false,
                    defaultOrderPriority: false,
                    comments: false,
                    email: false,
                    altEmail: false,
                    phone: false,
                    altPhone: false,
                    mobilePhone: false,
                    homePhone: false,
                    fax: false,
                    installationAddr1: false,
                    installationAddr2: false,
                    installationCity: false,
                    installationZip: false,
                    installationState: false,
                    utilityCompany: false,
                    utilityBillDocument: false,
                    marketSegment: false,
                    hasChanges: function() {
                        return this.id || this.isPerson || this.companyName || this.parent || this.status || this.subsidiary
                            || this.firstName || this.lastName
                            || this.salesRep || this.partner || this.category
                            || this.defaultOrderPriority || this.comments || this.email
                            || this.altEmail || this.phone || this.altPhone
                            || this.mobilePhone || this.homePhone || this.fax
                            || this.installationAddr1
                            || this.installationAddr2 || this.installationCity
                            || this.installationZip || this.installationState
                            || this.utilityCompany || this.utilityBillDocument
                            || this.marketSegment;
                    },
                    clear: function() {
                        this.id = false;
                        this.isPerson = false;
                        this.companyName = false;
                        this.parent = false;
                        this.status = false;
                        this.subsidiary = false;
                        this.firstName = false;
                        this.lastName = false;
                        this.salesRep = false;
                        this.partner = false;
                        this.category = false;
                        this.defaultOrderPriority = false;
                        this.comments = false;
                        this.email = false;
                        this.altEmail = false;
                        this.phone = false;
                        this.altPhone = false;
                        this.mobilePhone = false;
                        this.homePhone = false;
                        this.fax = false;
                        this.installationAddr1 = false;
                        this.installationAddr2 = false;
                        this.installationCity = false;
                        this.installationZip = false;
                        this.installationState = false;
                        this.utilityCompany = false;
                        this.utilityBillDocument = false;
                        this.marketSegment = false;
                    }
                };

            Object.defineProperties(this, {
                'internalId': {
                    enumerable: true,
                    get: function() {
                        return _internalId;
                    },
                    set: function(val) {
                        //if (!util.isNumber(val)) throw 'Invalid value, ' + val + ', for internalId.';
                        _internalId = val;
                    }
                },
                'id': {
                    enumerable: true,
                    get: function() {
                        return _id;
                    },
                    set: function(val) {
                        _id = val;
                        __changes.id = true;
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
                'isPerson': {
                    enumerable: true,
                    get: function() {
                        return _isPerson;
                    },
                    set: function(val) {
                        _isPerson = val;
                        __changes.isPerson = true;
                    }
                },
                'companyName': {
                    enumerable: true,
                    get: function() {
                        return _companyName;
                    },
                    set: function(val) {
                        _companyName = val;
                        __changes.companyName = true;
                    }
                },
                'parent': {
                    enumerable: true,
                    get: function() {
                        return _parent;
                    },
                    set: function(val) {
                        _parent = val;
                        __changes.parent = true;
                    }
                },
                'status': {
                    enumerable: true,
                    get: function() {
                        return _status;
                    },
                    set: function(val) {
                        _status = val;
                        __changes.status = true;
                    }
                },
                'subsidiary': {
                    enumerable: true,
                    get: function() {
                        return _subsidiary;
                    },
                    set: function(val) {
                        _subsidiary = val;
                        __changes.subsidiary = true;
                    }
                },
                'firstName': {
                    enumerable: true,
                    get: function() {
                        return _firstName;
                    },
                    set: function(val) {
                        _firstName = val;
                        __changes.firstName = true;
                    }
                },
                'lastName': {
                    enumerable: true,
                    get: function() {
                        return _lastName;
                    },
                    set: function(val) {
                        _lastName = val;
                        __changes.lastName = true;
                    }
                },
                'salesRep': {
                    enumerable: true,
                    get: function() {
                        return _salesRep;
                    },
                    set: function(val) {
                        _salesRep = val;
                        __changes.salesRep = true;
                    }
                },
                'partner': {
                    enumerable: true,
                    get: function() {
                        return _partner;
                    },
                    set: function(val) {
                        _partner = val;
                        __changes.partner = true;
                    }
                },
                'category': {
                    enumerable: true,
                    get: function() {
                        return _category;
                    },
                    set: function(val) {
                        _category = val;
                        __changes.category = true;
                    }
                },
                'defaultOrderPriority': {
                    enumerable: true,
                    get: function() {
                        return _defaultOrderPriority;
                    },
                    set: function(val) {
                        _defaultOrderPriority = val;
                        __changes.defaultOrderPriority = true;
                    }
                },
                'comments': {
                    enumerable: true,
                    get: function() {
                        return _comments;
                    },
                    set: function(val) {
                        _comments = val;
                        __changes.comments = true;
                    }
                },
                'email': {
                    enumerable: true,
                    get: function() {
                        return _email;
                    },
                    set: function(val) {
                        _email = val;
                        __changes.email = true;
                    }
                },
                'altEmail': {
                    enumerable: true,
                    get: function() {
                        return _altEmail;
                    },
                    set: function(val) {
                        _altEmail = val;
                        __changes.altEmail = true;
                    }
                },
                'phone': {
                    enumerable: true,
                    get: function() {
                        return _phone;
                    },
                    set: function(val) {
                        _phone = val;
                        __changes.phone = true;
                    }
                },
                'altPhone': {
                    enumerable: true,
                    get: function() {
                        return _altPhone;
                    },
                    set: function(val) {
                        _altPhone = val;
                        __changes.altPhone = true;
                    }
                },
                'mobilePhone': {
                    enumerable: true,
                    get: function() {
                        return _mobilePhone;
                    },
                    set: function(val) {
                        _mobilePhone = val;
                        __changes.mobilePhone = true;
                    }
                },
                'homePhone': {
                    enumerable: true,
                    get: function() {
                        return _homePhone;
                    },
                    set: function(val) {
                        _homePhone = val;
                        __changes.homePhone = true;
                    }
                },
                'fax': {
                    enumerable: true,
                    get: function() {
                        return _fax;
                    },
                    set: function(val) {
                        _fax = val;
                        __changes.fax = true;
                    }
                },
                'installationAddr1': {
                    enumerable: true,
                    get: function() {
                        return _installationAddr1;
                    },
                    set: function(val) {
                        _installationAddr1 = val;
                        __changes.installationAddr1 = true;
                    }
                },
                'installationAddr2': {
                    enumerable: true,
                    get: function() {
                        return _installationAddr2;
                    },
                    set: function(val) {
                        _installationAddr2 = val;
                        __changes.installationAddr2 = true;
                    }
                },
                'installationCity': {
                    enumerable: true,
                    get: function() {
                        return _installationCity;
                    },
                    set: function(val) {
                        _installationCity = val;
                        __changes.installationCity = true;
                    }
                },
                'installationZip': {
                    enumerable: true,
                    get: function() {
                        return _installationZip;
                    },
                    set: function(val) {
                        _installationZip = val;
                        __changes.installationZip = true;
                    }
                },
                'installationState': {
                    enumerable: true,
                    get: function() {
                        return _installationState;
                    },
                    set: function(val) {
                        _installationState = val;
                        __changes.installationState = true;
                    }
                },
                'utilityCompany': {
                    enumerable: true,
                    get: function() {
                        return _utilityCompany;
                    },
                    set: function(val) {
                        _utilityCompany = val;
                        __changes.utilityCompany = true;
                    }
                },
                'utilityBillDocument': {
                    enumerable: true,
                    get: function() {
                        return _utilityBillDocument;
                    },
                    set: function(val) {
                        _utilityBillDocument = val;
                        __changes.utilityBillDocument = true;
                    }
                },
                'marketSegment': {
                    enumerable: true,
                    get: function() {
                        return _marketSegment;
                    },
                    set: function(val) {
                        _marketSegment = val;
                        __changes.marketSegment = true;
                    }
                },
                'addressBook': { // load entity type from transformer object
                    enumerable: false,
                    get: function() {
                        if (typeof _addressBook === 'undefined') {
                            if (typeof _internalId !== 'undefined') {
								var entity = _recordModule.load({
									type: stage, 
									id: _internalId,
									isDynamic: false
								});

								_addressBook = _addressBookModule.initializeFromRecord(entity);
                            }
                        }

                        return _addressBook;
                    },
                    set: function(val) {
                        throw 'addressBook is a read-only property.';
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
                this.name = params.name;
                this.id = params.id;
                this.isPerson = params.isPerson;
                this.companyName = params.companyName;
                this.parent = params.parent;
                this.status = params.status;
                this.subsidiary = BB.SS.Entity.EntityRecord.USE_SUBSIDIARY ? params.subsidiary : null;
                this.firstName = params.firstName;
                this.lastName = params.lastName;
                this.salesRep = params.salesRep;
                this.partner = params.partner;
                this.category = params.category;
                this.defaultOrderPriority = params.defaultOrderPriority;
                this.comments = params.comment;
                this.email = params.email;
                this.altEmail = params.altEmail;
                this.phone = params.phone;
                this.altPhone = params.altPhone;
                this.mobilePhone = params.mobilePhone;
                this.homePhone = params.homePhone;
                this.fax = params.fax;
                this.installationAddr1 = params.installationAddr1;
                this.installationAddr2 = params.installationAddr2;
                this.installationCity = params.installationCity;
                this.installationZip = params.installationZip;
                this.installationState = params.installationState;
                this.utilityCompany = params.utilityCompany;
                this.utilityBillDocument = params.utilityBillDocument;
                this.marketSegment = params.marketSegment;
            }
        };

	_export.prototype.constructor = _export;
    _export.prototype.load = function(stage) {
        var _this = this;

		var entity = _recordModule.load({
			type: stage,
			id: _this.internalId
		});

		_this.map(entity);

		_this.__changes.clear();

        return this;
    };
    _export.prototype.map = function(entity){
        var _this = this;
        if(entity !== Object(entity)){
            throw 'Variable "entity" is not a valid NetSuite object';
        }
        _this.id = entity.getValue(BB.SS.Entity.EntityRecord.Fields.ID);
        _this.isPerson = entity.getValue(BB.SS.Entity.EntityRecord.Fields.IS_PERSON);
        _this.companyName = entity.getValue(BB.SS.Entity.EntityRecord.Fields.COMPANY_NAME);
        _this.parent = entity.getValue(BB.SS.Entity.EntityRecord.Fields.PARENT);
        _this.status = entity.getValue(BB.SS.Entity.EntityRecord.Fields.STATUS);
        if(BB.SS.Entity.EntityRecord.USE_SUBSIDIARY)
            _this.subsidiary = entity.getValue(BB.SS.Entity.EntityRecord.Fields.SUBSIDIARY);
        _this.salesRep = entity.getValue(BB.SS.Entity.EntityRecord.Fields.SALES_REP);
        _this.partner = entity.getValue(BB.SS.Entity.EntityRecord.Fields.PARTNER);
        _this.category = entity.getValue(BB.SS.Entity.EntityRecord.Fields.CATEGORY);
        _this.defaultOrderPriority = entity.getValue(BB.SS.Entity.EntityRecord.Fields.DEFAULT_ORDER_PRIORITY);
        _this.comments = entity.getValue(BB.SS.Entity.EntityRecord.Fields.COMMENTS);
        _this.email = entity.getValue(BB.SS.Entity.EntityRecord.Fields.EMAIL);
        _this.altEmail = entity.getValue(BB.SS.Entity.EntityRecord.Fields.ALT_EMAIL);
        _this.phone = entity.getValue(BB.SS.Entity.EntityRecord.Fields.PHONE);
        _this.altPhone = entity.getValue(BB.SS.Entity.EntityRecord.Fields.ALT_PHONE);
        _this.mobilePhone = entity.getValue(BB.SS.Entity.EntityRecord.Fields.MOBILE_PHONE);
        _this.homePhone = entity.getValue(BB.SS.Entity.EntityRecord.Fields.HOME_PHONE);
        _this.fax = entity.getValue(BB.SS.Entity.EntityRecord.Fields.FAX);
        _this.installationAddr1 = entity.getValue(BB.SS.Entity.EntityRecord.Fields.INSTALLATION_ADDR1);
        _this.installationAddr2 = entity.getValue(BB.SS.Entity.EntityRecord.Fields.INSTALLATION_ADDR2);
        _this.installationCity = entity.getValue(BB.SS.Entity.EntityRecord.Fields.INSTALLATION_CITY);
        _this.installationZip = entity.getValue(BB.SS.Entity.EntityRecord.Fields.INSTALLATION_ZIP);
        _this.installationState = entity.getValue(BB.SS.Entity.EntityRecord.Fields.INSTALLATION_STATE);
        _this.utilityCompany = entity.getValue(BB.SS.Entity.EntityRecord.Fields.UTILITY_COMPANY);
        _this.utilityBillDocument = entity.getValue(BB.SS.Entity.EntityRecord.Fields.UTILITY_BILL_DOCUMENT);
        _this.marketSegment = entity.getValue(BB.SS.Entity.EntityRecord.Fields.MARKET_SEGMENT);
        _this.firstName = entity.getValue(BB.SS.Entity.EntityRecord.Fields.FIRST_NAME);
        _this.middleName = entity.getValue(BB.SS.Entity.EntityRecord.Fields.MIDDLE_NAME);
        var addressArray = _this.installationAddr1.split(' ');
        var addressNumber = addressArray.shift();
        _this.lastName = entity.getValue(BB.SS.Entity.EntityRecord.Fields.LAST_NAME) + ' ' + addressNumber;
        _this.name = _this.firstName + ' ' + _this.middleName + ' ' + _this.lastName;//don't rely on "altname" which only exists with Auto-generated entity numbers
        return _this;
    };
    _export.prototype.save = function() {
        var _this = this,
            _netsuiteRecord = undefined,
            isNew = typeof this.internalId === 'undefined';

        if (isNew) {
            if (BB.SS.Entity.EntityRecord.USE_SUBSIDIARY && !this.subsidiary) throw 'Missing required subsidiary.';
			_netsuiteRecord = _recordModule.create({
				type: stage, 
				isDynamic: true
			});
        } else {
            // Load the existing record
			_netsuiteRecord = _recordModule.load({
				type: stage, 
				id: _this.internalId,
				isDynamic: true
			});
        }

        /*
        if (this.__changes.id) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.Lead.Fields.ID,
                value: this.id
            });
        }
        */

        log.debug('changes', JSON.stringify(this.__changes));
        log.debug('isPerson', this.isPerson);

        if (isNew || this.__changes.isPerson) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.IS_PERSON,
                value: this.isPerson
            });
        }

        if (isNew || this.__changes.companyName) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.COMPANY_NAME,
                value: this.companyName
            });
        }

        if (isNew || this.__changes.parent) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.PARENT,
                value: this.parent
            });
        }

        if (isNew || this.__changes.status) {
            log.debug('status', this.status);

            _netsuiteRecord.setText({
                fieldId: BB.SS.Entity.EntityRecord.Fields.STATUS,
                text: this.status
            });
        }

        if ((isNew || this.__changes.subsidiary) && BB.SS.Entity.EntityRecord.USE_SUBSIDIARY) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.SUBSIDIARY,
                value: this.subsidiary
            });
        }

        if (isNew || this.__changes.firstName) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.FIRST_NAME,
                value: this.firstName
            });
        }
		
		if (isNew || this.__changes.middleName) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.MIDDLE_NAME,
                value: this.middleName
            });
        }

        if (isNew || this.__changes.lastName) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.LAST_NAME,
                value: this.lastName
            });
        }

        if (isNew || this.__changes.salesRep) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.SALES_REP,
                value: this.salesRep
            });
        }

        if (isNew || this.__changes.partner) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.PARTNER,
                value: this.partner
            });
        }

        if (isNew || this.__changes.category) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.CATEGORY,
                value: this.category
            });
        }

        if (isNew || this.__changes.defaultOrderPriority) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.DEFAULT_ORDER_PRIORITY,
                value: this.defaultOrderPriority
            });
        }

        if (isNew || this.__changes.comments) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.COMMENTS,
                value: this.comments
            });
        }

        if (isNew || this.__changes.email) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.Lead.Fields.EMAIL,
                value: this.email
            });
        }

        if (isNew || this.__changes.altEmail) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.ALT_EMAIL,
                value: this.altEmail
            });
        }

        if (isNew || this.__changes.phone) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.PHONE,
                value: this.phone
            });
        }

        if (isNew || this.__changes.altPhone) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.ALT_PHONE,
                value: this.altPhone
            });
        }

        if (isNew || this.__changes.mobilePhone) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.MOBILE_PHONE,
                value: this.mobilePhone
            });
        }

        if (isNew || this.__changes.homePhone) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.HOME_PHONE,
                value: this.homePhone
            });
        }

        if (isNew || this.__changes.fax) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.FAX,
                value: this.fax
            });
        }

        if (isNew || this.__changes.installationAddr1) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.INSTALLATION_ADDR1,
                value: this.installationAddr1
            });
        }
        if (isNew || this.__changes.installationAddr2) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.INSTALLATION_ADDR2,
                value: this.installationAddr2
            });
        }
        if (isNew || this.__changes.installationCity) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.INSTALLATION_CITY,
                value: this.installationCity
            });
        }
        if (isNew || this.__changes.installationZip) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.INSTALLATION_ZIP,
                value: this.installationZip
            });
        }
        if (isNew || this.__changes.installationState) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.INSTALLATION_STATE,
                value: this.installationState
            });
        }
        if (isNew || this.__changes.utilityCompany) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.UTILITY_COMPANY,
                value: this.utilityCompany
            });
        }
        if (isNew || this.__changes.utilityBillDocument) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.UTILITY_BILL_DOCUMENT,
                value: this.utilityBillDocument
            });
        }
        if (isNew || this.__changes.marketSegment) {
            _netsuiteRecord.setValue({
                fieldId: BB.SS.Entity.EntityRecord.Fields.MARKET_SEGMENT,
                value: this.marketSegment
            });
        }
        this.internalId = _netsuiteRecord.save();

        return this;
    };
	return _export;
}

BB.SS.Entity.EntityRecord.USE_SUBSIDIARY = true;

BB.SS.Entity.EntityRecord.Fields = {
	ID: 'entityid',
	NAME: 'altname',
	IS_PERSON: 'isperson',
	COMPANY_NAME: 'companyname',
	PARENT: 'parent',
	STATUS: 'entitystatus',
	SUBSIDIARY: 'subsidiary',
	FIRST_NAME: 'firstname',
	MIDDLE_NAME: 'middlename',
	LAST_NAME: 'lastname',
	SALES_REP: 'salesrep',
	PARTNER: 'partner',
	CATEGORY: 'category',
	DEFAULT_ORDER_PRIORITY: 'defaultorderpriority',
	COMMENTS: 'comments',
	EMAIL: 'email',
	ALT_EMAIL: 'altemail',
	PHONE: 'phone',
	ALT_PHONE: 'altphone',
	MOBILE_PHONE: 'mobilephone',
	HOME_PHONE: 'homephone',
	FAX: 'fax',
	INSTALLATION_ADDR1: 'custentity_bb_install_address_1_text',
	INSTALLATION_ADDR2: 'custentity_bb_install_address_2_text',
	INSTALLATION_CITY: 'custentity_bb_install_city_text',
	INSTALLATION_ZIP: 'custentity_bb_install_zip_code_text',
	INSTALLATION_STATE: 'custentity_bb_install_state',
	UTILITY_COMPANY: 'custentity_bb_utility_company',
	UTILITY_BILL_DOCUMENT: 'custentity_bb_util_bill_doc_bb_file_sys',
	MARKET_SEGMENT: 'custentity_bb_market_segment',

}
BB.SS.Entity.EntityRecord.prototype.constructor = BB.SS.Entity.EntityRecord;


define(['N/record', './BB_SS_MD_SolarConfig'], function(recordModule, config) {
    try{
        BB.SS.Entity.EntityRecord.USE_SUBSIDIARY = config.getConfiguration('custrecord_bb_ss_has_subsidiaries').value;
        if(!BB.SS.Entity.EntityRecord.USE_SUBSIDIARY)
            delete BB.SS.Entity.EntityRecord.Fields.SUBSIDIARY;
    } catch (e) {
        log.error(e.name,e.message);
        BB.SS.Entity.EntityRecord.USE_SUBSIDIARY = true;
    }

    return {
        Address: new BB.SS.Entity.Address(),
        AddressBook: new BB.SS.Entity.AddressBook(),
        BbFile: new BB.SS.Entity.BbFile(recordModule),
        EntityRecord: new BB.SS.Entity.EntityRecord(recordModule)
    };
});