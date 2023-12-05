/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Matt Lehman
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

define(['N/currentRecord', 'N/https', 'N/search', 'N/record', './crypto-js'], function(currentRecord, https, search, record, CryptoJS) {

	function pageInit(context) {

	}
    
    function callConfluence(context) {
    	var currRecord = currentRecord.get();
		var pageId = currRecord.getValue({
			fieldId: 'custpage_accnt_pdf'
		});

		var configRecord = getCredentialRecordDetails('confluence');
        console.log('configRecord', configRecord);
		if (configRecord) {

			console.log('selected doc page id', pageId);
	    	if (pageId) {
	    		var username = configRecord.getValue({
	    			fieldId: 'custrecord_system_username'
	    		});
	    		var pass = configRecord.getValue({
	    			fieldId: 'custrecord_system_password'
	    		});
	    		var baseUrl = configRecord.getValue({
	    			fieldId: 'custrecord_system_base_url'
	    		});

	    		var connectionString = username + ':' + pass;

	      		var wordArr = CryptoJS.enc.Utf8.parse(connectionString);
	      		var hash = CryptoJS.enc.Base64.stringify(wordArr);

			    headers = {
	                "Authorization": "Basic " + hash ,
	                "Content-Type": "application/json",
	                "Accept": "application/json",
	                "Accept-Encoding": "en-us"
	            };
	            var url = baseUrl + pageId + '/child/attachment';
                console.log('url', url);
	            var response = https.get({
	                url: url,
	                headers: headers
	            });
	            log.debug('reponse body', response);
	            if (response.code == 200) {
	                var body = JSON.parse(response.body);
	                log.debug('body', body);

	                var baseLink = body._links.base;
	                log.debug('baselink', baseLink);
	                var downLoadLink = body.results[0]._links.download;
	                log.debug('download object', downLoadLink);

	                var url = baseLink + downLoadLink;

	                window.location.assign(url);
	            }

	    	}
	    } else {
	    	console.log('There are no crendentials records created in your account for confluence, please see you system administator');
	    }

    }

/*
  * function getCredentialRecordDetails(bbconfigEnvironment, name)
  * @param {name} - text value of Integration Name - Example, Baywa, Amazon, google, etc...
  * @returns NS record object
*/

    function getCredentialRecordDetails(name) {
        var sysRecord = [];
        var customrecord_system_credentialsSearchObj = search.create({
            type: "customrecord_system_credentials",
            filters:
            [
                ["name","contains",name]
            ],
            columns:
            [
              "internalid"
           ]
        });
        customrecord_system_credentialsSearchObj.run().each(function(result){
            var id = result.getValue({
                name: 'internalid'
            });
            sysRecord.push(id);
            return true;
        });
        if (sysRecord.length == 1) {
            var sysCred = record.load({
                type: 'customrecord_system_credentials',
                id: sysRecord[0]
            });
            return sysCred;
        } else {
            console.log('Can not find a system credentials record for ' + name);
        }
    }



    return {
    	pageInit: pageInit,
    	callConfluence: callConfluence

    };
    
});
