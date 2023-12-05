/**
 * @NApiVersion 2.0
 * @NScriptType suitelet
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
define(['N/record', 'N/search', 'N/http', 'N/https', 'N/encode', 'N/file'],
    function(record, search, http, https, encode, file) {

      var RECORD_ID = 'customrecord_bb_image_cache',
          FOLDER_NAME = 'Cached Images';

      function getFolderId(){
        var _id = search.create({type: search.Type.FOLDER, filters:[['name', search.Operator.IS, [FOLDER_NAME]]], columns: ['name']}).run().getRange({
          start: 0,
          end: 1
        }).map(function(f){
          return f.id;
        })[0];

        if(typeof _id === 'undefined'){
          _id = record.create({type: record.Type.FOLDER}).setValue({fieldId: 'name', value: FOLDER_NAME}).save();
        }

        return _id;
      }

      function downloadImage(imageUrl, headers){
        var response;
        if(imageUrl.indexOf('https://') === 0){
          response = https.get({
            url: imageUrl,
            headers: headers
          });
        } else {
          response = http.get({
            url: imageUrl,
            headers: headers
          });
        }
        if(response && response.code === 200){
          return response.body;
        }
        return undefined;
      }

      function getFromStore(key){
        if(typeof key === 'string' && key.trim().length > 0) {
          var _cachedImage = search.create({
            type: RECORD_ID,
            filters: [['custrecord_bb_cache_img_unique_id', search.Operator.IS, key]],
            columns: ['custrecord_bb_cache_img_image']
          }).run().getRange({start: 0, end: 1})
          .map(function(rec) {
            return rec.getValue({name: 'custrecord_bb_cache_img_image'});
          })[0];

          if (typeof _cachedImage !== 'undefined') {
            return _cachedImage;
          }
        }
        return undefined;
      }

      function getImage(imageUrl, headers){
        var _key = encode.convert({
          string: imageUrl,
          inputEncoding: encode.Encoding.UTF_8,
          outputEncoding: encode.Encoding.BASE_64
        });
        var _cachedImage = getFromStore(_key);
        if(typeof _cachedImage === 'undefined'){
          var _imageBody = downloadImage(imageUrl, headers);
          if(typeof _imageBody !== 'undefined'){
            var _file = file.create({
              name: ['image', new Date().getTime(), '.png'].join(''),
              fileType: file.Type.PNGIMAGE,
              contents: _imageBody,
              encoding: file.Encoding.BASE_64,
              folder: getFolderId(),
              isOnline: false
            });
            _cachedImage = _file.save();
            record.create({type: RECORD_ID})
                .setValue({fieldId: 'custrecord_bb_cache_img_unique_id', value: _key})
                .setValue({fieldId: 'custrecord_bb_cache_img_image', value: _cachedImage})
                .save();
          }
        }
        return file.load({id: _cachedImage});
      }

      function onRequest(context) {
        var _imageUrl = context.request.parameters.url;
        if (!_imageUrl) {
          throw 'Missing URL parameter.';
        }
        var _headers = context.request.headers;
        var _file = getImage(_imageUrl);
        context.response.writeFile({file: _file, isInline: true});
      }

      return {
        onRequest: onRequest,
        getImage: getImage
      }
    });