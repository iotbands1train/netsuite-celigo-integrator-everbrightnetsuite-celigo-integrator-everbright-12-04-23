/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author - Matt Lehman
 * @overview - NetSuite Token Authentication Library
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

define(['N/https', 'N/record', 'N/search', 'N/encode', './crypto-js'], function(https, record, search, encode, CryptoJS) {
    /*
    * function callEndpoint(environment, name, method, path, payload)
    * @param {environment} - string value of connection environment - Example Sandbox, Production
    * @param {name} - integration connection name - Example - BayWa, this value gets the correct integration record based on environment type and integration name
    * @param {method} -- string value for Request method, Example POST, GET, PUT
    * @param {path} - string value of path to resource example - 'script=541&deploy=1' -- this should include other parameters
    * @param {payload} - Object, the object value to be passed in a POST request body, **** NOTE- The function will stringify the payload for you *****
    **/

    function callEndpoint(bbconfigEnvironment, name, method, path, payload) {
        var systemCreds = getCredentialRecordDetails(bbconfigEnvironment, name);
        if (systemCreds) {
            var consumerKey = systemCreds.getValue({fieldId:'custrecord_system_ns_consumer_key'});
            //process as token request
            if (consumerKey) {

                var requestData = requestDataObj(systemCreds);

                var headers = signedHeaders(requestData, path, method);

                var url = requestData.url + '?' + path;

                if (method == 'GET') {
                    var getRsp = https.get({
                        url: url,
                        headers: {"Content-Type": "application/json", "Authorization": headers}
                    });
                    if(getRsp.code == 200) {
                        return getRsp.body;
                        log.debug('response', getRsp.body);
                        
                    } else{
                        //return error
                        log.debug('response', getRsp.body);
                    }
                }
                if (method == 'POST') {
                    var postRsp = https.post({
                        url: url,
                        headers: {"Content-Type": "application/json", "Authorization": headers},
                        body: JSON.stringify(payload)
                    });
                    if (postRsp.code == 200) {
                        return JSON.parse(postRsp.body);
                        
                    } else{
                        //return error
                    }
                }
            } else {
                //TODO - No consumer key found --- process a regular request
            }
            
        } else {
            log.debug('Message', 'The system configuration record could not be found, please contact your NetSuite Administrator');
        }
    }


/*
 * function headerData
 * @param {systemCreds} - NS record object
 * @returns object 
*/

    function requestDataObj(systemCreds) {

        var headerObj = {
                realm: systemCreds.getValue({fieldId: 'custrecord_system_ns_account_id_text'}),
                oauth_consumer_key: systemCreds.getValue({fieldId: 'custrecord_system_ns_consumer_key'}),
                oauth_token: systemCreds.getValue({fieldId:'custrecord_system_ns_token_key'}),
                oauth_nonce: randomString(),
                oauth_timestamp: unixTime(),
                oauth_signature_method: "HMAC-SHA256",
                oauth_version: "1.0",
                oauth_token_secret: systemCreds.getValue({fieldId: 'custrecord_system_ns_token_secret'}),
                oauth_consumer_secret: systemCreds.getValue({fieldId: 'custrecord_system_ns_consumer_secret'}),
                url: systemCreds.getValue({fieldId: 'custrecord_system_base_url'}) + '/restlet.nl'
        }
        return headerObj;

    }

/*
 * function signedHeaders(headerObj, path, method)
 *  @param {headerObj} - header object created and passed to this function to create signature header and parameters
 *  @param {path} - string value of path to end point, also include your parameters here, May need enhancement for get requests
 *  @param {method} - string value of Request type - Example GET, POST, PUT, DELETE
*/

    function signedHeaders(headerObj, path, method) {

        var authHeaders = [];
        authHeaders.push(['oauth_consumer_key', headerObj.oauth_consumer_key]);
        authHeaders.push(['oauth_nonce', headerObj.oauth_nonce]);
        authHeaders.push(['oauth_signature_method', headerObj.oauth_signature_method]);
        authHeaders.push(['oauth_timestamp', headerObj.oauth_timestamp]);
        authHeaders.push(['oauth_token', headerObj.oauth_token]);
        authHeaders.push(['oauth_version', headerObj.oauth_version]);
        var OAuth = 'OAuth ';
        for (x in authHeaders) {
            OAuth += authHeaders[x][0] + '="' + authHeaders[x][1] + '", ';
        }
        // add parameters to array
        var headers = OAuth.slice(0, -2);
        log.debug('Oauth Header sliced', headers); // request header values

        var paramArr = path.split('&'); // splits path/parms into an array value
        log.debug('paramArr', paramArr); 

        for (p in paramArr) {
            var val = paramArr[p].split('=');
            authHeaders.push([val[0], val[1]]); // values are added to authorization headers
        }
        authHeaders.sort(); // sorts array values in alaphabetical order

        var params = '';
        for (t in authHeaders) {
            params += authHeaders[t][0] + '=' + authHeaders[t][1] + '&';
        }
        var paramsString = params.slice(0, -1);
        log.debug('base string', paramsString);

        var urlDataEncoded = encodeURIComponent(paramsString);

        var signatureString = [method, encodeURIComponent(headerObj.url),  urlDataEncoded].join('&');
        log.debug('signature string', signatureString);

        // hashing here
        var secret = [encodeURIComponent(headerObj.oauth_consumer_secret), encodeURIComponent(headerObj.oauth_token_secret)].join('&');
        var signed = CryptoJS.HmacSHA256(signatureString, secret).toString(CryptoJS.enc.Hex); 
        var base64 = encode.convert({
            string: signed,
            inputEncoding: encode.Encoding.HEX,
            outputEncoding: encode.Encoding.BASE_64
        });
        var encodedSignature = encodeURIComponent(base64);

        headers += ', oauth_signature="' + encodedSignature + '", ';
        headers += 'realm="' + headerObj.realm + '"';
        log.debug('headers', headers);
        return headers;
    }


/*
  * function getCredentialRecordDetails(bbconfigEnvironment, name)
  * @param {bbconfigEnvironment} - text value of Environment - Example Sandbox, Production, etc...
  * @param {name} - text value of Integration Name - Example, Baywa, Amazon, google, etc...
  * @returns NS record object
*/

    function getCredentialRecordDetails(bbconfigEnvironment, name) {
        var sysRecord = [];
        var customrecord_system_credentialsSearchObj = search.create({
            type: "customrecord_system_credentials",
            filters:
            [
                ["name","contains",name]
            ],
            columns:
            [
              "internalid",
              "custrecord_system_environment"
           ]
        });
        customrecord_system_credentialsSearchObj.run().each(function(result){
            var id = result.getValue({
                name: 'internalid'
            });
            var environment = result.getText({
                name: 'custrecord_system_environment'
            });
            if (bbconfigEnvironment == environment) {
                sysRecord.push(id);
            }
            return true;
        });
        if (sysRecord.length == 1) {
            var sysCred = record.load({
                type: 'customrecord_system_credentials',
                id: sysRecord[0]
            });
            return sysCred;
        } else {
            log.debug('Error', 'Can not find a system credentials record for ' + name);
        }
    }

/*
  * function - processToken(systemCreds, token, isNewToken) - gets new token or revokes a token per each request using NS token request API
  * @param {bbconfigEnvironment} - text value of Environment - Example Sandbox, Production, etc...
  * @param {name} - text value of Integration Name - Example, Baywa, Amazon, google, etc...
  * @param {systemCreds} - NS object record used to get values from integration record
  * @param {newToken} - true of false value - true = issue new token, false = revoke token
  * @returns NS httpClientResponse body 
*/

    function processToken(systemCreds, isNewToken) {
        var url;
        if (isNewToken) {
            var tokenPath = 'issuetoken';
            url = "https://rest.netsuite.com/rest/" + tokenPath + "?consumerKey=" + systemCreds.getValue({fieldId: 'custrecord_system_ns_consumer_key'});
        } else {
            var tokenPath = 'revoketoken';
            url = "https://rest.netsuite.com/rest/"+ tokenPath + "?consumerKey=" + systemCreds.getValue({fieldId: 'custrecord_system_ns_consumer_key'}) + ((token) ? "&token=" + systemCreds.getValue({fieldId:'custrecord_system_ns_token_key'}) : null);
        }

        var headers = {
            "Authorization": "NLAuth nlauth_account=" + systemCreds.getValue({fieldId:'custrecord_system_ns_account_id_text'}) + ", nlauth_email=" + systemCreds.getValue({fieldId: 'custrecord_system_username'}) + ", nlauth_signature=" + systemCreds.getValue({fieldId: 'custrecord_system_password'}) + ", nlauth_role=1000",
            "Content-Type": "application/json"
        };
        var response = https.get({
            url: url,
            headers: headers
        });
        if (response.code == '200' && isNewToken) {
            return JSON.parse(response.body)
        } else {
            throw 'Your request to generate or revoke a token was denied';
        }

    }

    function randomString() { // creates 30 count random string
        return new Array(30).join().replace(/(.|$)/g, function(){return ((Math.random()*36)|0).toString(36)[Math.random()<.5?"toString":"toUpperCase"]();});
    }

    function unixTime() { // unix time stamp
        return Math.round(+new Date() / 1000).toFixed(0);
    }
   
    return {
        callEndpoint: callEndpoint
    };
    
});