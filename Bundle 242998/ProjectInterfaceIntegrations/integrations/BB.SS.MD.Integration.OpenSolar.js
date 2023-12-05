/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Nicholas M. Schultz
 * @version 0.0.1
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

define(['../libs/typedarray', '../../BB SS/API Logs/API_Log', '../BB.SS.MD.FlatToObjConvert', '../../BB SS/SS Lib/bb_framework_all', 'N/crypto']
    , function (typedArrayModule, apiLogModule, convertModule, bbFrameworkModule, crypto) {

        var _openSolarSystemCredentials;

        const ENDPOINTS = {
            PROJECT_CREATE: '/projects/'
            , PROJECT_UPDATE: '/projects'
            , PROJECT_GET: '/projects/{openSolarProjectId}'
            , PROJECT_DELETE: '/projects/{openSolarProjectId}'
            , ORG_GET: ''
            , ORG_UPDATE: '/{openSolarProjectId}'
            , CONTACT_GET: '/contacts/{openSolarContactId}'
            , CONTACT_CREATE: '/contacts/{openSolarContactId}'
            , CONTACT_DELETE: '/contacts/{openSolarContactId}'
            , SYSTEM_GET: '/systems/{openSolarSystemId}'
            , SYSTEM_CREATE: '/systems/{openSolarSystemId}'
            , SYSTEM_DELETE: '/systems/{openSolarSystemId}'
            , SYSTEMIMAGE_GET: '/projects/{openSolarProjectId}/systems/{openSolarSystemUuid}/image?width={imageWidth}&height={imageHeight}'
            , ROLE_GET: '/roles/{openSolarRoleId}'
        };

        function setSystemCredentials(str) {
            if (typeof str === 'string' && str.trim().length > 0) {
                _openSolarSystemCredentials = new APICredentialsSs2().init(str);
            }
        }

        function authenticate(endpoint, body) {
            var
                _url = _openSolarSystemCredentials.getBaseUrl().replace(/^\/+|\/+$/g,'')
                , _token = _openSolarSystemCredentials.getToken()
                , _request = {
                    url: [_url, endpoint].join('')
                    , body: body
                    , headers: {
                        'content-type': 'application/json'
                        , 'Authorization': ['Bearer', _token].join(' ')
                        , 'User-Agent': 'NetSuite/BluBanyan'
                        , 'Accept': 'application/json'
                    }
                }
            return _request;
        }
        function delay(delaySeconds, func, _request){
            var delayStart = new Date().getTime();
            //log.debug('delay start',delayStart);
            /***** wait *****/
            delaySeconds = delaySeconds ? delaySeconds : 1;
            var delayEnd = delayStart + delaySeconds*1000;

            // the await didn't work. NS didn't like the syntax
            // await new Promise(r => setTimeout(r, 2000));

            var ready=0;
            var st=new Date();
            while(st.getTime() < delayEnd) {
                // NOTE: The only reason for the below code it so that it does something during the loop
                // These commands require no governance and prevents SSS_USAGE_LIMIT_EXCEEDED and SSS_STATEMENT_COUNT_EXCEEDED
                //var mySecret = '{SSS_USAGE_LIMIT_EXCEEDED}{SSS_STATEMENT_COUNT_EXCEEDED}';    //secret id take from secrets management page
                //var sKey = crypto.createSecretKey({secret: mySecret,encoding: encode.Encoding.UTF_8});
                //var hmacSHA512 = crypto.createHmac({algorithm: crypto.HashAlg.SHA512,key: sKey});
                // hmacSHA512.update({input: inputString,inputEncoding: encode.Encoding.BASE_64});
                // let digestSHA512 = hmacSHA512.digest({outputEncoding: encode.Encoding.HEX});
                ready++;// this is just a count of how many loops it took for the delay to finish - used for debugging mostly
                st=new Date();
            }
          
            /***** wait *****/
            var delayFinish = new Date().getTime();
            //log.debug('delay end',{"end":delayEnd,"seconds":(delayEnd-delayStart)/1000});
            log.debug('delayed by seconds '+ready,(delayFinish-delayStart)/1000);
            return func(_request);
        }

        function genericGetPostPutDelete(func, endpoint, data) {
            var
                _data = convertModule.flatToObject(data)
                , _request
                , _apiLogResponse
                , _response = null
                , _isValid = false
                , _endpoint = null
                , _result = null
            ;
            if (_data) {
                _isValid = true;
                _endpoint = endpoint;
                for(var key in _data){
                    if(_data.hasOwnProperty(key)){
                        _endpoint = _endpoint.replace(['{', key, '}'].join(''), _data[key]);
                    }
                }
                _request = authenticate(_endpoint, _data);
            }
            if (_isValid) {
                
              var _apiLogResponse = delay(10, func, _request);
                _response = _apiLogResponse.response;
                try {
                    // need to add update to code below into SS bundle. if([200, 201].indexOf(_response.code) < 0){
                    // if (_response.code === 200) {
                    log.debug('BB.SS.MD.Integration.OpenSolar.js _response.code', {code:_response.code, type:typeof(_response.code)});
                    if([200, 201].indexOf(_response.code) >= 0){
                        try {
                            _result = util.extend({}, _response);
                            _result.body = JSON.parse(_result.body);
                        }
                        catch (e) {
                            log.debug('BB.SS.MD.Integration.OpenSolar _result.body JSON Parse Error', e);
                        }
                    } else {
                        log.debug('RESPONSE_INVALID_RESPONSE', _response);
                    }
                } catch (ex) {
                    log.debug('RESPONSE_NOT_PROCESSED', _response);
                }
            }
            return convertModule.objectToFlat(_result);
        }

        /** sample url: https://api.opensolar.com/api/orgs/:org_id/projects/ */
        function openSolarProjectCreate(data) {
            return genericGetPostPutDelete(apiLogModule.post, ENDPOINTS.PROJECT_CREATE, data);
        }

        /** sample url: https://api.opensolar.com/api/orgs/:org_id/projects */
        function openSolarProjectUpdate(data) {
            return genericGetPostPutDelete(apiLogModule.put, ENDPOINTS.PROJECT_UPDATE, data);
        }

        /** sample url: https://api.opensolar.com/api/orgs/:org_id/projects/:project_id */
        function openSolarProjectGet(data) {
            return genericGetPostPutDelete(apiLogModule.get, ENDPOINTS.PROJECT_GET, data);
        }

        /** sample url: https://api.opensolar.com/api/orgs/:org_id/projects/:project_id */
        function openSolarProjectDelete(data) {
            return genericGetPostPutDelete(apiLogModule.delete, ENDPOINTS.PROJECT_DELETE, data);
        }

        function openSolarOrgGet(data) {
            return genericGetPostPutDelete(apiLogModule.get, ENDPOINTS.ORG_GET, data);
        }

        function openSolarOrgUpdate(data) {
            return genericGetPostPutDelete(apiLogModule.post, ENDPOINTS.ORG_UPDATE, data);
        }

        function openSolarContactGet(data) {
            return genericGetPostPutDelete(apiLogModule.get, ENDPOINTS.CONTACT_GET, data);
        }

        function openSolarContactCreate(data) {
            return genericGetPostPutDelete(apiLogModule.post, ENDPOINTS.CONTACT_CREATE, data);
        }

        function openSolarContactDelete(data) {
            return genericGetPostPutDelete(apiLogModule.delete, ENDPOINTS.CONTACT_DELETE, data);
        }

        function openSolarSystemGet(data) {
            return genericGetPostPutDelete(apiLogModule.get, ENDPOINTS.SYSTEM_GET, data);
        }

        function openSolarSystemCreate(data) {
            return genericGetPostPutDelete(apiLogModule.post, ENDPOINTS.SYSTEM_CREATE, data);
        }

        function openSolarSystemDelete(data) {
            return genericGetPostPutDelete(apiLogModule.post, ENDPOINTS.SYSTEM_DELETE, data);
        }

        function openSolarSystemImageGet(data) {
            return genericGetPostPutDelete(apiLogModule.get, ENDPOINTS.SYSTEMIMAGE_GET, data);
        }

        function openSolarRoleGet(data) {
            return genericGetPostPutDelete(apiLogModule.get, ENDPOINTS.ROLE_GET, data);
        }

        return {
            name: 'openSolar'
            , authenticate: authenticate
            , setSystemCredentials: setSystemCredentials
            , openSolarProjectCreate: openSolarProjectCreate
            , openSolarProjectUpdate: openSolarProjectUpdate
            , openSolarProjectGet: openSolarProjectGet
            , openSolarProjectDelete: openSolarProjectDelete
            , openSolarOrgGet: openSolarOrgGet
            , openSolarOrgUpdate: openSolarOrgUpdate
            , openSolarContactGet: openSolarContactGet
            , openSolarContactCreate: openSolarContactCreate
            , openSolarContactDelete: openSolarContactDelete
            , openSolarSystemGet: openSolarSystemGet
            , openSolarSystemCreate: openSolarSystemCreate
            , openSolarSystemDelete: openSolarSystemDelete
            , openSolarSystemImageGet: openSolarSystemImageGet
            , openSolarRoleGet: openSolarRoleGet
        }
    });
