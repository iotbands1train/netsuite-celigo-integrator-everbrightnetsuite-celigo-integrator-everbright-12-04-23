/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 * @author Michael Golichenko
 */


/**
 * Copyright 2017-2019 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */
define(['N/record', 'N/search', 'N/file'],

  function(recordModule, searchModule, fileModule) {


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

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
      var
        _response = context.response
        , _fileBase64 = context.request.body
        , _result
        , _file
      ;

      if (context.request.method === 'POST') {
        log.debug('_fileBase64', _fileBase64);
        var _folder = getFolder('ProjectInterfaceFiles');
        log.debug('_folder', _folder);
        try {
          _file = fileModule.create({
            name: ['file-', new Date().getTime(), '.tif'].join(''),
            fileType: fileModule.Type.TIFFIMAGE,
            contents: _fileBase64,
            encoding: fileModule.Encoding.BASE_64,
            folder: _folder,
            isOnline: false
          });
          log.debug('_file', _file);
          _file = _file.save();
          log.debug('_file after', _file);
        } catch (ex) {
          log.debug('RESPONSE_NOT_PROCESSED', _response);
          log.debug('ERROR', ex);
          //_response = null;
        }
      }

      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write(JSON.stringify(_file));

    }

    return {
      onRequest: onRequest
    };

  });