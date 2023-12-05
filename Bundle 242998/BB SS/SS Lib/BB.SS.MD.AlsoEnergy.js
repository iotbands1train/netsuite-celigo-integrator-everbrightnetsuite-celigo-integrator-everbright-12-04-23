/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @version 0.1.3
 * @fileOverview 
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


define(['N/record', 'N/search', 'N/render', 'N/file', 'N/https', 'N/xml', 'N/cache', './moment.min'],
    function(record, search, render, file, https, xml, cache, moment) {


        var TEMPLATES = { LOGIN: 'login.ftl',
                          LOGOUT: 'logout.ftl',
                          GET_BIN_DATA: 'getBinData.ftl',
                          HARDWARE_IDS: 'getBinData-HID.ftl' },
        CREDENTIALS_REC_NAME = 'AlsoEnergy',
        PROJECT_METER_SEARCH = 'customsearch_bb_energy_prod_proj_list';
   		var _dstObjData = undefined;

     /**
     * Loads the template
     * @return {string} template contents
     */
    function _getTemplate(template) {
        return file.load({
            id: _getTemplateId(template)
        }).getContents();
    }
  
  

    /**
     *Returns a file ID based on a file name that may change location
     *because of bundle  
     * @param {string} templateName
     * @returns {integer} NS internal id  of the file
     */
    function _getTemplateId(templateName){
        var templateLookup = search.create({
            type: "file",
            filters: [ ["name","is",templateName] ],
            columns: ["internalid" ]
        }).run().getRange({ start: 0, end: 1 });
        if (templateLookup.length > 0)
            return templateLookup[0].getValue({ name : 'internalid' });
    }
     


    /**
     * renders and returns the template
     * @param {string} template 
     * @param {object} data 
     */
	function _renderTemplate(template, data){
		var renderer = render.create();
        renderer.templateContent = template;
        renderer.addCustomDataSource({
            format: render.DataSource.OBJECT,
            alias: 'data',
            data: data
        });
		
		return renderer.renderAsString();
	};
    


    /**
     * Creates and returns the headers for the SOAP call
     * @param {string} callName - the template name
     * @returns {array} header
     */
    function _getHeader(callName){
        var header = [];		
		header['Content-Type'] = 'text/xml;charset=UTF-8';     
        header['SOAPAction'] = 'alsoenergy_ns/WebAPI/' + callName;  
        return header;
    };



    /**
     * Makes the soap call and returns the response
     * @param {string} postData 
     * @param {array} header 
     * @param {object} session 
     * @returns {string} response  
     */
	function _soapCall(postData, header, session) {
		var response = https.post({
				url:session.url,
				headers:header,
				body: postData
        });
		return response.body;
    };
    


    /**
     * Takes an xml.Document object returned from the 
     * AlsoEnergy login, and returns the session id.
     * @param {object} xmlDocument 
     * @returns {string} sessionId
     */
    function _getSessionId(xmlDocument){
        return xmlDocument.getElementsByTagName({tagName: 'a:SessionID'})[0].textContent;
    };



    /**
     * Takes an xml.Document object returned from the
     * AlsoEnergy getBinData call, and returns an 
     * object with the start time, and the produced
     * energy in that time frame. 
     * @param {object} xmlDocument 
     * @returns {object} 
     */
    function _getBinDataResults(xmlDocument, params, timezone) {
        var kwhs = xmlDocument.getElementsByTagName({tagName: 'b:float'});
        var timeStamps = xmlDocument.getElementsByTagName({tagName: 'a:Timestamp'});
        var meters = params.meters;
        var meterByKwhs = {};

        var kwhCount = 0;
        for(var i=0; i<timeStamps.length; i++){
            //fix time interval to be in the correct time zone, create date object from it
            var timeInterval = _fixDateString(params.startdate,timeStamps[i].textContent, timezone); 
            for(var j=0; j<meters.length; j++){ //loop through all the meters & add data
                var float = kwhs[kwhCount].textContent;
                var uniqueName = meters[j].meterHID; // + ' - ' + timeInterval.format('LLL');
                meterByKwhs[uniqueName] = JSON.parse(JSON.stringify(meters[j]));
                meterByKwhs[uniqueName].float = float == 'NaN' ? 0 : float; //check for invalid data 
                meterByKwhs[uniqueName].timeInterval = timeInterval;
                meterByKwhs[uniqueName].timeZone = _getTimeZoneString(params.startdate, timezone);
                kwhCount++; //next float
            };
        };

        return meterByKwhs;
    }



    /**
     * Fixes the AlsoEnergy date string. There is a known bug where the time returned is in 
     * GST, but SHOULD be in the timezone that the project is in. Cannot be converted to date
     * and then change the timezone because then the time would be wrong. Needs to have the 
     * date string updated so that is represents the correct time zone. 
     * 
     * Uses a date object within the production data request to determine if day light
     * savings time is observed. Based on the timezone record, then updates the date string
     * to have the correct offset from GST for the timezone. 
     * @param {date} startDate - a good date to use to gauge if daylight savings time
     * is needed or not
     * @param {string} dateString - string representing a date that needs correcting
     * @param {object} timezone - NS timezone record 
     * @returns {object} - moment object for the corrected date
     */
    function _fixDateString(startDate, dateString, timezone){
        var pullDate = new Date(startDate);
        var fixedDateString = '';

        if(pullDate.isDstObserved()){
            fixedDateString = dateString.replace(/Z/g, '') + _getDstObj()[timezone].dstOffsetFromUTC;
        } else {
            fixedDateString = dateString.replace(/Z/g, '') + _getDstObj()[timezone].stdOffsetFromUTC;
        }

        return moment(fixedDateString);
    }


    function _getTimeZoneString(startDate, timezone){
        var pullDate = new Date(startDate);
        var _details = _getDstObj()[timezone];
        return pullDate.isDstObserved() ? _details.dstOffsetFromUTC : _details.stdOffsetFromUTC;
    }


    /**
     * Runs a saved search to get a list of timezone offsets from GST 
     * @returns {Object} list of values from the timezone table
     */
    function _getDstObj() {
        if(typeof _dstObjData !== 'undefined'){
            return _dstObjData;
        }
        _dstObjData = search.create({
            type: 'customrecord_bb_timezone',
            columns: ['name', 
                      'custrecord_bb_utc_std_time_offset', 
                      'custrecord_bb_utc_daylight_time_offset']
        }).run().getRange({
            start: 0,
            end: 1000
        }).reduce(function(map, current) {
            var itemId = current.id;
            map[itemId] = {
                            name: current.getValue({name: 'name'}).toLowerCase(),
                            stdOffsetFromUTC: current.getValue({name: 'custrecord_bb_utc_std_time_offset'}),
                            dstOffsetFromUTC: current.getValue({name: 'custrecord_bb_utc_daylight_time_offset'})
                        }
            return map;
        }, {});
        return _dstObjData;
    };



    /**
     * @returns {integer} - the offset from GST of a date object 
     */
    Date.prototype.stdTimezoneOffset = function () {
        var jan = new Date(this.getFullYear(), 0, 1);
        var jul = new Date(this.getFullYear(), 6, 1);
        return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    }
    
    /**
     * @returns {boolean} - if a date object is within day light savings time
     * or standard time
     */
    Date.prototype.isDstObserved = function () {
        return this.getTimezoneOffset() < this.stdTimezoneOffset();
    }


    /**
     * Returns object with error reason codes names from AlsoEnergy
     * @returns {object}
     */
    function getErrorCodes(){
        return {
            400: 'XML Body Error',
            500: 'Server Error, check header data',
            4000: 'AuthenticationFailed', 
            4001: 'SecureConnectionRequired',
            4002: 'LoginFailed',
            4003: 'NoAPIAccess',
            4004: 'NoData',
            4005: 'AccessDenied',
            5000: 'ServerTemporaryUnavailable',
            5001: 'ServerError', 
            5002: 'InvalidInputData',
            5003: 'UsageLimitExceeded',
            5004: 'HardwareNotConfigured'
        }
    };



    /**
     * logs into AlsoEnergy and returns session id. 
     * @returns {object} - session with id, url, error code. 
     */
    function login(){
        var credentials = _getLoginObject();
        var username = credentials.credentials.username;
        var alsoEnergyCache = cache.getCache({
          name: 'alsoEnergyCache',
          scope: cache.Scope.PRIVATE
        });
        var sessionJson = alsoEnergyCache.get({
          key: username,
          loader: function(){
            var sessionData = {url: credentials.credentials.url};
        var headers = _getHeader('Login');
        var postData = _renderTemplate( _getTemplate(TEMPLATES.LOGIN), credentials);

            var response = xml.Parser.fromString( {text : _soapCall(postData, headers, sessionData) });

        if(getErrorCodes()[response.code])
              sessionData['error'] = response.code;
        else 
              sessionData['id'] = _getSessionId(response);
            return sessionData;
          },
          ttl: 10 * 60
        });
        var session = JSON.parse(sessionJson);
        if(!session.id){
          alsoEnergyCache.remove({
            key: username
          });
        }
        return session;

    };

    

    /**
     * Calls AlsoEnergy getBinData for All available projects
     * and returns an object with the returned data
     * @param {object} session - composed of session.id and session.url
     * @param {date} startDate - the start date for the data, included in returned data
     * @param {date} endDate - the end date, NOT included in the returned data
     * @param {string} interval - The enumerator from AlsoEnergy for the about of time 
     * represented in the returned data
     * @param {string} fieldName - the type of data returned 
     * @param {string} fnName - the function for the type of calculation used to return data
     * @returns {object} the object data by the given interval
     */
    function getAllBinData(session, startDate, endDate, 
                        interval, fieldName, fnName ){
        var params = { 
            session: session.id, startdate: startDate,
            enddate: endDate, interval: interval,
            fieldname: fieldName, fnName: fnName };

        var timeZoneList = getListObj('customrecord_bb_timezone');
        energyProduction = {};

        for (zone in timeZoneList)
            util.extend(energyProduction, _getBinData(params, timeZoneList[zone], session, _getMeterIds(params, timeZoneList[zone], null)));

        return energyProduction;

    };


    /**
     * Calls AlsoEnergy getBinData for a list of given projects
     * @param {object} session - composed of session.id and session.url
     * @param {date} startDate - the start date for the data, included in returned data
     * @param {date} endDate - the end date, NOT included in the returned data
     * @param {string} interval - The enumerator from AlsoEnergy for the about of time 
     * represented in the returned data
     * @param {string} fieldName - the type of data returned 
     * @param {string} fnName - the function for the type of calculation used to return data
     * @param {array} projects - an array of project IDs
     * @returns {object} the object data by the given interval
     */
    function getBinDataByProject(session, startDate, endDate, 
        interval, fieldName, fnName, projects){
        var params = { 
        session: session.id, startdate: startDate,
        enddate: endDate, interval: interval,
        fieldname: fieldName, fnName: fnName };

        var timeZoneList = getListObj('customrecord_bb_timezone');
        energyProduction = {};

        for (zone in timeZoneList){
            var meterIds = _getMeterIds(params, timeZoneList[zone], projects);
            var binData = _getBinData(params, timeZoneList[zone], session, meterIds);
            util.extend(energyProduction, binData);
        }

        return energyProduction;

    };



    /**
     * Calls AlsoEnergy getBinData for a specific energy meter
     * @param {object} session - composed of session.id and session.url
     * @param {date} startDate - the start date for the data, included in returned data
     * @param {date} endDate - the end date, NOT included in the returned data
     * @param {string} interval  - The enumerator from AlsoEnergy for the about of time 
     * represented in the returned data
     * @param {string} fieldName - the type of data returned 
     * @param {string} fnName - the function for the type of calculation used to return data
     * @param {string} meterId - NS Project Energy Meter ID
     * @returns {object} the object data by the given interval
     */
    function getBinDataByMeter(session, startDate, endDate, 
        interval, fieldName, fnName, meterId){
        var params = { 
        session: session.id, startdate: startDate,
        enddate: endDate, interval: interval,
        fieldname: fieldName, fnName: fnName };

        var meterData = _getMeterData(params, meterId);
        var energyProduction = _getBinData(params, meterData[0].timezone, session, meterData);

        return energyProduction;

    };



    /**
     * Runs a saved search to get project energy meter data required for 
     * AlsoEnergy getBinData call, and for creation of a project energy
     * production or project energy meter reading record.
     * @param {object} params - parameters for AlsoEnergy getBinData call  
     * @param {string} meterId - AlsoEnergy energy meter ID to get data from
     */
    function _getMeterData(params, meterId){
        var meterIds = new Array();
        //build object with project, meterId, timeInterval
        var projSearch = search.load({id: PROJECT_METER_SEARCH});
        projSearch.filters.push(search.createFilter({
            name: 'internalid',
            join: 'custrecord_bb_proj_en_meter_project',
            operator: search.Operator.ANYOF,
            values: meterId
        })); //update to be for the meter

        var cols = getSearchColumnNames(projSearch);
        
        projSearch.run().each(function(result) { 
            meterIds.push({
                timeInterval: null, 
                float: null, 
                project: result.getValue(result.columns[cols['project internal id']]),
                meterNsId: result.getValue(result.columns[cols['meter internal id']]),
                meterHID: result.getValue(result.columns[cols['meter id']]),
                timezone: result.getValue(result.columns[cols['timezone']]),
                fnName: params.fnName,
                fieldName: params.fieldname
            });
            return true;
        });

        return meterIds;
    }


    
    /**
     * calls AlsoEnergy and returns data
     * @param {object} params - parameters for the call
     * @param {integer} timeZone - NS timezone record id
     * @param {object} session - the session data from the login
     * @param {array} meterIds - NS project energy meter data
     */
     function _getBinData(params, timeZone, session, meterIds){
        
        params['meters'] = meterIds;
        params['dataFields'] = _getBinDataTemplate(params.meters);
        var headers = _getHeader('GetBinData');
        var postData =  _renderTemplate( _getTemplate(TEMPLATES.GET_BIN_DATA), params);
        var response = xml.Parser.fromString({text: _soapCall(postData, headers, session)});

        if(getErrorCodes()[response.code])
            return {error:response.code};
        else 
            return _getBinDataResults(response, params, timeZone); 
    }



    /**
     * renders template and combines for section of getBinData xml needed for each 
     * project energy meter
     * @param {array} meterIds 
     */
    function _getBinDataTemplate(meterIds){
        var meterString = '';

        for(meter in meterIds){
            meterString = meterString + _renderTemplate(_getTemplate(TEMPLATES.HARDWARE_IDS), meterIds[meter]);
        }
        
        return meterString;
    }


    
    /**
     * returns the project energy meter data for a list of given projects
     * @param {object} params -  parameters for the AlsoEnergy call
     * @param {integer} timeZone - NS timezone record internal id
     * @param {array} projects - list of projects for which data is needed
     */
    function _getMeterIds(params, timeZone, projects){
        var meterIds = new Array();
        //build object with project, meterId, timeInterval
        var projSearch = search.load({id: PROJECT_METER_SEARCH});
      	log.debug('projects', projects);
        projSearch.filters.push(search.createFilter({
            name: 'custentity_bb_timezone',
            operator: search.Operator.ANYOF,
            values: timeZone
        }));

        if(projects instanceof Array){
          if(projects.length > 0) {
            projSearch.filters.push(search.createFilter({
              name: 'internalid',
              operator: search.Operator.ANYOF,
              values: projects
            }));
          } else {
            return meterIds;
          }
        }
            

        var cols = getSearchColumnNames(projSearch);
        
        projSearch.run().each(function(result) { 
            meterIds.push({
                timeInterval: null, 
                float: null, 
                project: result.getValue(result.columns[cols['project internal id']]),
                meterNsId: result.getValue(result.columns[cols['meter internal id']]),
                meterHID: result.getValue(result.columns[cols['meter id']]),
                fnName: params.fnName,
                fieldName: params.fieldname
            });
            return true;
        });

        return meterIds;
    }


    /**
     * logs out of the current session
     * @param {object} session 
     */
    function logout(session) {
        var headers = _getHeader('Logout');
        var postData = _renderTemplate(_getTemplate(TEMPLATES.LOGOUT), session);
        var response = xml.Parser.fromString({
            text : _soapCall(postData, headers, session)
        });

        if(getErrorCodes()[response.code])
            return {error:response.code};
        else 
            return {code:response.code};
    };



    /**
     * returns internal id of the system credentials for AlsoEnergy
     * @returns {integer}
     */
    function _getCredentialRecordId() {   	
        var results = search.create({
    		type: 'customrecord_system_credentials',
    		columns: [{name: 'internalid'}],
    		filters: [{name: 'name', operator: 'IS', values: CREDENTIALS_REC_NAME },
                {name: 'isinactive', operator: 'IS', values: ['F'] }]
        }).run().getRange({start: 0, end: 1000});
        
        if (results.length > 1 || results.length == 0){
            log.debug('Credentials Error','Credentials results: ' + JSON.stringify(results));
            throw 'There was an error accessing the AlsoEnergy credentials.' 
                + ' Please contact your system administrator.';
        };

        return results[0].id;
    };
     
    

    /**
     * returns object with username, password, and url 
     * for AlsoEnergy API 
     * @returns {object}
     */
	function _getLoginObject() {
        var credentialsRecId = _getCredentialRecordId();
        var credentialsRec = record.load({
            type: 'customrecord_system_credentials', 
            id: credentialsRecId,
            isDynamic: false,
        });

		var login = { credentials: 
						{ username: credentialsRec.getValue('custrecord_system_username'),
                          password: credentialsRec.getValue('custrecord_system_password'),
                          url: credentialsRec.getValue('custrecord_system_base_url')
						}
					};
		return login;
    };



    /**
     * Get a map of a list
     * @param {string} list the NS ID of the list 
     * @returns {Object} list
     */
    function getListObj(list) {
        return search.create({
            type: list,
            columns: ['name']
        }).run().getRange({
            start: 0,
            end: 1000
        }).reduce(function(map, current) {
            var itemName = current.getValue({
                name: 'name'
            }).toLowerCase();
            map[itemName] = current.id;
            return map;
        }, {});
    };


    //creates object with the column names of the loaded search
    function getSearchColumnNames(projSearch) {
        return projSearch.columns.reduce(function(map, current, index) {
        var label = current.label.toLowerCase();
        map[label] = index;
        return map;
        }, {});
    }


	return {
        login:login,
        getAllBinData:getAllBinData,
        getBinDataByProject:getBinDataByProject,
        logout:logout,
        getErrorCodes:getErrorCodes,
        getListObject:getListObj,
        getSearchColumnNames:getSearchColumnNames,
        getBinDataByMeter:getBinDataByMeter
	};

});