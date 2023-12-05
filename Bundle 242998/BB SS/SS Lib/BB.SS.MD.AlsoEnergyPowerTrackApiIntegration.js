/**
 * @NApiVersion 2.1
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

define(['N/record', 'N/search', 'N/https', 'N/log', 'N/format', './moment.min'], function (record, search, https, log, format, moment) {

    var CREDENTIALS_REC_NAME = 'AlsoEnergy';
    var CREDENTIALS_ERROR = 'NO Or More than one System credential records found for ' + CREDENTIALS_REC_NAME + '. Please contact administrator.'
    var HEADER = {
        "Content-Type":"",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Authorization": ""
    };
    var UNAUTHORIZED = 401;
    var addDeviceErrorCodes = {
        INVERTER_EXISTS: 'Inverter already exists on a different site',
        BAD_PREFIX: 'Invalid SN prefix',
        SERIAL_ASSIGNED_TO_DIFFERENT_TYPE_REPORTER: 'The SN is assigned to a component of a different type',
        BAD_SERIAL_NUMBER: 'Invalid SN',
        BAD_CHECKSUM: 'SN checksum failed',
        DEFAULT_PANEL_MODEL_IS_UNDEFINED: 'No default panel model is defined for the site.'
    }

    /**
     *
     * @param Sting: projectId - Id of the project
     * @param String: siteIdn - site id fow which energy needs to be found
     * @param String: startTime - Starting time for energy production observation
     * @param String: endTime - Ending time for energy production observation
     * @returns {{detailedList: *, unit: *, endDate: *, project: *, siteid: *, startTime: *, endTime: *, startDate: *, DataSource: *}}
     */
    function getPowerDetails(projectId, siteId,hardwareId, startTime, endTime) {

        var credentials = getCredentials();
        var alsoEnergyURL = credentials.url + '/Data/BinData/?fromLocalTime='+startTime+'&toLocalTime='+endTime+'&binSizes=Bin15Min';
        HEADER["Authorization"] = 'Bearer ' + credentials.token;
        HEADER["Content-Type"] = 'application/json';
        log.debug('HEADER', HEADER)
        log.debug('alsoEnergyURL',alsoEnergyURL);
        var response = https.post({
            url:encodeURI(alsoEnergyURL),
            headers: HEADER,
            body:JSON.stringify([
                {
                    "hardwareId": hardwareId,
                    "siteId": siteId,
                    "fieldName": "KWHnet",
                    "function": "last"
                }
            ])
        });
        if (response.code == UNAUTHORIZED) {
            var accessToken = login();
            HEADER["Authorization"] = 'Bearer ' + accessToken;
            response = https.get({
                url: alsoEnergyURL,
                headers: HEADER
            });
        }
        log.debug('response', response);
        var powerObj = JSON.parse(response.body);
        log.debug('powerObj', powerObj);
        return formEnergyObj(projectId, siteId, powerObj.info[0].units, startTime, endTime, CREDENTIALS_REC_NAME, powerObj.items);
    }

    function getProjectProductionMeter(projectId){
        var customrecord_bb_ss_proj_site_devicesSearchObj = search.create({
            type: "customrecord_bb_ss_proj_site_devices",
            filters:
                [
                    ["custrecord_bb_ss_device_proj.internalid","anyof",projectId],
                    "AND",
                    ["custrecord_bb_ss_site_device_type","anyof","2"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "scriptid",
                        sort: search.Sort.ASC,
                        label: "Script ID"
                    }),
                    search.createColumn({name: "custrecord_bb_ss_device_id"})
                ]
        });
        var searchResultCount = customrecord_bb_ss_proj_site_devicesSearchObj.runPaged().count;
        log.debug("customrecord_bb_ss_proj_site_devicesSearchObj result count",searchResultCount);
        var hardwareId='';
        customrecord_bb_ss_proj_site_devicesSearchObj.run().each(function(result){
            hardwareId=result.getValue({
                name:'custrecord_bb_ss_device_id'
            })
            return true;
        });
        return hardwareId;
    }

    /**
     * Function gets all the devices present in one site
     * @param String: siteId - Site for which inventory needs to be sent
     * @returns Object: inventoryObj - details of inventory present at a site
     */
    function getInventory(siteId) {
        var credentials = getCredentials();
     var alsoEnergyInventoryUrl = credentials.url + '/Sites/' + siteId +
            '/Hardware?includeArchivedFields=true&includeAlertCount=false&includeAlertInfo=false&includeDisabledHardware=false&includeSummaryFields=true&includeDeviceConfig=true&includeDataNameFields=true';
        HEADER["Authorization"] = 'Bearer ' + credentials.token;
        HEADER["Content-Type"] = 'application/json';
        log.debug('alsoEnergyInventoryUrl',alsoEnergyInventoryUrl)
        var response = https.get({
            url: encodeURI(alsoEnergyInventoryUrl),
            headers: HEADER
        });
        log.debug('response',response);
        if (response.code == UNAUTHORIZED) {
            var accessToken = login();
            HEADER["Authorization"] = 'Bearer ' + accessToken;
            response = https.get({
                url: alsoEnergyInventoryUrl,
                headers: HEADER
            });
        }
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
            id: credentialsRecId,
            token: credentialsRec.getValue('custrecord_system_token')
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
        //log.debug('details',details);
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

        var formattedDetailsObj=getFormattedDetailList(details);

        var energyObj = {
            'project': project,
            'siteid': siteid,
            'unit': unit,
            'startDate': startTime.split(' ')[0],
            'DataSource': source,
            'endDate': endTime.split(' ')[0],
            'TotalEnergy':formattedDetailsObj.totalEnergy,
            'startTime': startingTimeArr[0]+startingTimeArr[1],
            'endTime': endingTimeArr[0]+endingTimeArr[1],
            'detailedList': formattedDetailsObj.formattedDetails
        };
        log.debug('energyObj', energyObj);
        return energyObj;
    }

    function getFormattedDetailList(details){
        var detailObj={}
        var formattedDetails=[]
        var totalEnergy=0;
        for(var num=0;num<details.length;num++){
            var dateInput={};
            var dateStringWithoutTZArr=details[num].timestamp.split('T');
            var dateOfEnergyprod=dateStringWithoutTZArr[0];
            var timeOfEnergyprod=dateStringWithoutTZArr[1].split('-')[0]
            var dateStringWithoutTZ=dateOfEnergyprod+' '+timeOfEnergyprod

            var date=new Date(dateStringWithoutTZ);
            dateInput.date=dateStringWithoutTZ;
            if(num==0 || num==details.length-1){
                dateInput.value=0;
            }else{
                var currenergy=parseFloat(details[num+1].data[0])-parseFloat(details[num].data[0]);
                dateInput.value=currenergy;
                totalEnergy=totalEnergy+currenergy;
            }

            formattedDetails.push(dateInput);
        }
        return {"totalEnergy":totalEnergy,"formattedDetails":formattedDetails};
    }


    /**
     * Function calls the SolarEdge Login service and returns the Cookie needed for subsequent calls
     * @returns {string}
     */
    function login() {
        var credentials = getCredentials();
        log.debug('credentials in login', credentials);
        var formBody = [];
        formBody.push("grant_type=password");
        formBody.push('username=' + credentials.username)
        formBody.push('password=' + credentials.password)
        var alsoEnergyLoginUrl = credentials.url + '/Auth/token';
        HEADER["Content-Type"]="application/x-www-form-urlencoded";
        var responsemain = https.post({
            url: alsoEnergyLoginUrl,
            headers: HEADER,
            body: formBody.join("&")
        });
        record.submitFields({
            type: 'customrecord_system_credentials',
            id: credentials.id,
            values: {
                'custrecord_system_token': JSON.parse(responsemain.body).access_token
            }
        });
        return JSON.parse(responsemain.body).access_token;

    }


    return {
        getCredentials: getCredentials,
        getPowerDetails: getPowerDetails,
        getInventory: getInventory,
        login: login
    };
});