/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Suhail Akhtar
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

define(['N/record', 'N/search', 'N/https', 'N/log','N/format','./moment.min'], function (record, search, https, log,format,moment) {

    var CREDENTIALS_REC_NAME = 'SolarEdge';
    var CREDENTIALS_ERROR='NO Or More than one System credential records found for '+CREDENTIALS_REC_NAME+'. Please contact administrator.'
    var HEADER = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "User-Agent":"Mozilla/5"
    };
    var addDeviceErrorCodes={
        INVERTER_EXISTS:'Inverter already exists on a different site',
        BAD_PREFIX:'Invalid SN prefix',
        SERIAL_ASSIGNED_TO_DIFFERENT_TYPE_REPORTER:'The SN is assigned to a component of a different type',
        BAD_SERIAL_NUMBER:'Invalid SN',
        BAD_CHECKSUM:'SN checksum failed',
        DEFAULT_PANEL_MODEL_IS_UNDEFINED:'No default panel model is defined for the site.'
    }

    /**
     *
     * @param Sting: projectId - Id of the project
     * @param String: siteIdn - site id fow which energy needs to be found
     * @param String: startTime - Starting time for energy production observation
     * @param String: endTime - Ending time for energy production observation
     * @returns {{detailedList: *, unit: *, endDate: *, project: *, siteid: *, startTime: *, endTime: *, startDate: *, DataSource: *}}
     */
    function getPowerDetails(projectId, siteId, startTime, endTime) {
        var credentials = getCredentials();
        var SolarEdgeUrl = credentials.url + '/site/' + siteId +
            '/powerDetails?meters=PRODUCTION&startTime=' + startTime +
            '&endTime=' + endTime +
            '&api_key=' + credentials.apiToken;

        var response = https.get({
            url: encodeURI(SolarEdgeUrl),
            headers: HEADER
        });
        log.debug('response',response);
        var powerObj = JSON.parse(response.body);
        return formEnergyObj(projectId, siteId, powerObj.powerDetails.unit, startTime, endTime, CREDENTIALS_REC_NAME, powerObj.powerDetails.meters[0].values);
    }

    /**
     * Function gets all the devices present in one site
     * @param String: siteId - Site for which inventory needs to be sent
     * @returns Object: inventoryObj - details of inventory present at a site
     */
    function getInventory(siteId) {
        var credentials = getCredentials();
        var SolarEdgeInventoryUrl = credentials.url + '/site/' + siteId +
            '/inventory?&api_key=' + credentials.apiToken;
        var response = https.get({
            url: encodeURI(SolarEdgeInventoryUrl),
            headers: HEADER
        });
        var inventoryObj = response.body;
        log.debug('inventoryObj', inventoryObj);
        return inventoryObj;

    }


    /**
     * Function gets the details from System creadentials record for the required API provider
     * @returns {{password: *, apiToken: *, url: *, username: *}}
     */
    function getCredentials() {
        var credentialsRecId = getCredentialRecordId();
        var credentialsRec = record.load({
            type: 'customrecord_system_credentials',
            id: credentialsRecId
        });

        var credentials = {
            username: credentialsRec.getValue('custrecord_system_username'),
            password: credentialsRec.getValue('custrecord_system_password'),
            url: credentialsRec.getValue('custrecord_system_base_url'),
            apiToken: credentialsRec.getValue('custrecord_system_token')
        };
        log.debug('credentials', credentials);
        return credentials;
    }

    /**
     * Function returns the internal id of the System Credential record for the API system
     * @returns {*}
     */
    function getCredentialRecordId() {
        var results = search.create({
            type: 'customrecord_system_credentials',
            filters: [{
                name: 'name',
                operator: 'IS',
                values: CREDENTIALS_REC_NAME
            }, {
                name: 'isinactive',
                operator: 'IS',
                values: ['F']
            }]
        }).run().getRange({
            start: 0,
            end: 10
        });

        if (results.length > 1 || results.length == 0) {
            log.debug('Credentials Error', 'Credentials results: ' + JSON.stringify(results));
            throw CREDENTIALS_ERROR;
        }
        return results[0].id;
    }

    /**
     * Function creates the object in required form for the Energy production creation record to process the data
     * @param project
     * @param siteid
     * @param unit
     * @param startTime
     * @param endTime
     * @param source
     * @param details
     * @returns {{detailedList: *, unit: *, endDate: *, project: *, siteid: *, startTime: *, endTime: *, startDate: *, DataSource: *}}
     */
    function formEnergyObj(project, siteid, unit, startTime, endTime, source, details) {
       log.debug('startTime',startTime);
        log.debug('endTime',endTime);
        log.debug('startTime.split(\' \')[0]',startTime.split(' ')[0])
        //get start date in NS format
        var startDate = format.format({
            value: new Date(startTime.split(' ')[0]),
            type: format.Type.DATE
        });
        // get start time in 12 hours format
        var startingTimeArr=(startTime.split(' ')[1]).split(':');
        //get end date in NS format
        var endDate=format.parse({
            value: moment(endTime.split(' ')[0]).format('M/D/YYYY'),
            type: format.Type.DATE
        });
        // get end time in 12 hours format
        var endingTimeArr=(endTime.split(' ')[1]).split(':');

        var energyObj = {
            'project': project,
            'siteid': siteid,
            'unit': unit,
            'startDate': startTime.split(' ')[0],
            'DataSource': source,
            'endDate': endTime.split(' ')[0],
            'startTime': startingTimeArr[0]+startingTimeArr[1],
            'endTime': endingTimeArr[0]+endingTimeArr[1],
            'detailedList': details
        };
        log.debug('energyObj', energyObj);
        return energyObj;
    }

    /**
     * Function calls the SolarEdge Login service and returns the Cookie needed for subsequent calls
     * @returns {string}
     */
    function login(){
        var credentials = getCredentials();
        var SolarEdgeUrl = credentials.url + '/login?j_username='+credentials.username+'&j_password='+credentials.password
        log.debug('login URL',SolarEdgeUrl);
        var responsemain = https.post({
            url: SolarEdgeUrl,
            headers: HEADER
        });
        log.debug('responsemain',responsemain);
        var cookie='';
        for(var header in responsemain.headers){
            if(header=='Set-Cookie'){
                cookie=responsemain.headers[header]
            }
        }
        cookie='JSESSIONID=BC9BC5648B2FE71B30A82D7F03691DCA; SPRING_SECURITY_REMEMBER_ME_COOKIE=YWNhc2lsbGFzQHRpdGFuc29sYXJwb3dlci5jb206MTYxMTc4Mjk1MjYyOTo2ZTUyNzU5Y2I2NmMxZmUzNTgzYTkyMDIyMjZhN2RlMw'
        return cookie;

    }

    /**
     * Function calls the logout service and clears the cookie session
     * @param cookie : existing cookie that needs to be cleared
     */
    function logout(cookie){
        var credentials = getCredentials();
        var SolarEdgeUrl = credentials.url + '/logout';
        HEADER.Cookie=cookie;
        var responsemain = https.post({
            url: SolarEdgeUrl,
            headers: HEADER
        });
    }

    /**
     * Function calls the createSite service and creates a site at SolarEdge
     * @param siteObj : JSON object with site details in expected format by SolarEdge
     * @param cookie : cookie to be added in header to authenticate the request
     * @returns id : Site id created in SolarEdge
     */
    function createSite(siteObj,cookie){
        var credentials = getCredentials();
        var SolarEdgeUrl = credentials.url + '/sites/createSite';
        HEADER.Cookie=cookie;
        log.debug('HEADER',JSON.stringify(HEADER));
        var responsemain = https.post({
            url: SolarEdgeUrl,
            headers: HEADER,
            body:siteObj
        });
        log.debug('responsemain',responsemain);
        return responsemain.id;
    }

    /**
     * Function calls the update Site service and updates the site if needed
     * @param siteObj : JSON object with site details in expected format by SolarEdge
     * @param cookie : cookie to be added in header to authenticate the request
     * @param siteId : Site id to be upated in SolarEdge
     */
    function updateSite(siteObj,cookie,siteId){
        var credentials = getCredentials();
        var SolarEdgeUrl = credentials.url + '/site/'+siteId+'/updateSite';
        HEADER.Cookie=cookie;
        var responsemain = https.post({
            url: SolarEdgeUrl,
            headers: HEADER,
            body:siteObj
        });
    }

    /**
     * Funcion calls the create site devices service for a specific site
     * @param deviceObj : JSON object with device details in expected format by SolarEdge
     * @param cookie : cookie to be added in header to authenticate the request
     * @param siteId : Site id where device needs to be created
     */
    function createSiteDevice(deviceObj,cookie,siteId){
        var credentials = getCredentials();
        var SolarEdgeUrl = credentials.url + '/equipment/'+siteId+'/addDevices';
        HEADER.Cookie=cookie;
        var responsemain = https.post({
            url: SolarEdgeUrl,
            headers: HEADER,
            body:deviceObj
        });
    }
    return {
        getCredentials: getCredentials,
        getPowerDetails: getPowerDetails,
        getInventory: getInventory,
        login:login,
        logout:logout,
        createSite:createSite,
        updateSite:updateSite,
        createSiteDevice:createSiteDevice

    };
});