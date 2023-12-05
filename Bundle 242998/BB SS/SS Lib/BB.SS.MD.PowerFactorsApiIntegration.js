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

define(['N/record', 'N/search', 'N/https', 'N/log', 'N/format', './moment.min'], function (record, search, https, log, format, moment) {
    var UNIT_OF_MEASURE = 'w'
    var CREDENTIALS_REC_NAME = 'PowerFactors';
    var CREDENTIALS_ERROR = 'NO Or More than one System credential records found for ' + CREDENTIALS_REC_NAME + '. Please contact administrator.'
    var HEADER = {
        "Host": "api.powerfactorscorp.com"
    }
    var POWERFACTOR_ATTRIBUTE={
        1:'ENERGY_BILLABLE'
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
        var projectEnergyLookup = search.lookupFields({
            type: 'job',
            id: projectId,
            columns: ['custentity_bb_pf_poewrfctor_energy_attr']
        })
        var configLookup = search.lookupFields({
            type: 'customrecord_bb_solar_success_configurtn',
            id: 1,
            columns: ['custrecord_bb_getrevenue_from_powerfac']
        })

        var url;
        if (configLookup.custrecord_bb_getrevenue_from_powerfac && projectEnergyLookup.custentity_bb_pf_poewrfctor_energy_attr[0]) {
            url = credentials.url + '/drive/v2/data?startTime=' + startTime +
                '&endTime=' + endTime + '&resolution=raw&id=' + siteId + '&attribute=' + POWERFACTOR_ATTRIBUTE[projectEnergyLookup.custentity_bb_pf_poewrfctor_energy_attr[0].value] + '&attribute=' + 'REVENUE' + '&subscription-key=' + credentials.apiToken

        } else {
            url = credentials.url + '/drive/v2/data?startTime=' + startTime +
                '&endTime=' + endTime + '&resolution=raw&id=' + siteId + '&attribute=' + POWERFACTOR_ATTRIBUTE[projectEnergyLookup.custentity_bb_pf_poewrfctor_energy_attr[0].value] + '&subscription-key=' + credentials.apiToken

        }


        log.debug('URL', url);
        var response = https.get({
            url: encodeURI(url),
            headers: HEADER
        });
        log.debug('response', response);
        var powerObj = JSON.parse(response.body);
        if (configLookup.custrecord_bb_getrevenue_from_powerfac) {
            return formEnergyObj(projectId, siteId, UNIT_OF_MEASURE, startTime, endTime, CREDENTIALS_REC_NAME, powerObj.assets[0].attributes[0].values,configLookup.custrecord_bb_getrevenue_from_powerfac,powerObj.assets[0].attributes[1].values);
        }else{
            return formEnergyObj(projectId, siteId, UNIT_OF_MEASURE, startTime, endTime, CREDENTIALS_REC_NAME, powerObj.assets[0].attributes[0].values,configLookup.custrecord_bb_getrevenue_from_powerfac,null);

        }
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
    function formEnergyObj(project, siteid, unit, startTime, endTime, source, details, isRevenueEnabled,revenueDetails) {
        //get start date in NS format
        var startDate = format.format({
            value: new Date(startTime.split(' ')[0]),
            type: format.Type.DATE
        });
        // get start time in 12 hours format
        var startingTimeArr = (startTime.split(' ')[1]).split(':');
        //get end date in NS format
        var endDate = format.parse({
            value: moment(endTime.split(' ')[0]).format('M/D/YYYY'),
            type: format.Type.DATE
        });
        // get end time in 12 hours format
        var endingTimeArr = (endTime.split(' ')[1]).split(':');

        var detailList = [];
        var min = 0;
        var totRev=0;
        var totEnergy=0;
        for (var x = 0; x < details.length; x++) {
            var newStartTime = startTime.replace('00:00:00', intToTime(min))
            detailList.push({
                date: newStartTime,
                value: details[x]
            });
            min += 5;
            totEnergy=totEnergy+parseFloat(details[x])
        }
        if(revenueDetails != null){
            for (var x = 0; x < revenueDetails.length; x++) {
                totRev=totRev+parseFloat(revenueDetails[x])
            }
        }

        var energyObj = {
            'project': project,
            'siteid': siteid,
            'unit': unit,
            'startDate': startTime.split(' ')[0],
            'DataSource': source,
            'endDate': endTime.split(' ')[0],
            'startTime': startingTimeArr[0] + startingTimeArr[1],
            'endTime': endingTimeArr[0] + endingTimeArr[1],
            'detailedList': detailList,
            'Totalrevenue':totRev,
            'TotalEnergy':totEnergy
        };
        return energyObj;
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

    function intToTime(minute) {
        var hour = Math.floor(minute / 60);
        var min = minute % 60;
        var time;
        if (hour < 10) {
            time = '0' + hour + ':';
        } else {
            time = hour + ':';
        }
        if (min < 10) {
            time += '0' + min;
        } else {
            time += min;
        }
        return time + ':00';
    }


    return {
        getCredentials: getCredentials,
        getPowerDetails: getPowerDetails,

    };
});