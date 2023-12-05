/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
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

define(['../BB.SS.MD.FlatToObjConvert', '../../BB SS/SS Lib/bb_framework_all', '../../BB SS/API Logs/API_Log'
    , 'N/file', 'N/record', 'N/search', 'N/url']
  , function (convertModule, bbFrameworkModule, apiLogModule, fileModule, recordModule, searchModule
  , urlModule) {

    var
      _testSystemCredentials
    ;

    function createFolder(name, parentId){
      var _record = recordModule.create({type: recordModule.Type.FOLDER});
      _record.setValue({ fieldId:'name', value:name });
      if(parentId) {
        _record.setValue({ fieldId:'parent', value:parentId });
      }
      return _record.save();
    }

    function getFolder(name, parentId){
      var
        _id
        , _filters = [["name", "is", name]]
      ;

      if(parentId) {
        _filters.push('and');
        _filters.push(['parent', 'is', parentId])
      }

      searchModule.create({
        type: searchModule.Type.FOLDER,
        filters: _filters,
        columns: ["parent"]
      }).run().each(function(r){ _id = r.id; });
      if(!_id) _id = createFolder(name, parentId);
      return _id;
    }

    function test(data){
      var
        _request
        , _apiLogResponse
        , _response = null
        , _request =  { url: 'https://www.hq.nasa.gov/alsj/a17/A17_FlightPlan.pdf' }
      ;

      _apiLogResponse = apiLogModule.get(_request);

      _response = _apiLogResponse.response;
      log.debug('_response', _response);
      var url = urlModule.resolveScript({
        scriptId: 'customscript_bb_ss_sl_file_save_test',
        deploymentId: 'customdeploy_bb_ss_sl_file_save_test',
        returnExternalUrl: true
      });
      var _responsePost = apiLogModule.post({
        url: url,
        body: _response.body
      })
      log.debug('_responsePost', _responsePost);
      // log.debug('_response', _response);
      // var _folder = getFolder('ProjectInterfaceFiles');
      // log.debug('_folder', _folder);
      // try {
      //   var _file = fileModule.create({
      //     name: ['file-', new Date().getTime(), '.tif'].join(''),
      //     fileType: fileModule.Type.TIFFIMAGE,
      //     contents: _response.body,
      //     encoding: fileModule.Encoding.BASE_64,
      //     folder: _folder,
      //     isOnline: false
      //   });
      //   log.debug('_file', _file);
      //   _file = _file.save();
      //   log.debug('_file after', _file);
      // } catch (ex) {
      //   log.debug('RESPONSE_NOT_PROCESSED', _response);
      //   log.debug('ERROR', ex);
      //   //_response = null;
      // }

    }

    function setSystemCredentials(str) {
      if (typeof str === 'string' && str.trim().length > 0) {
        _eagleviewSystemCredentials = new APICredentialsSs2().init(str);
      }
    }

    return {
      name: 'test'
      , test: test
      , setSystemCredentials: setSystemCredentials
    }
  });