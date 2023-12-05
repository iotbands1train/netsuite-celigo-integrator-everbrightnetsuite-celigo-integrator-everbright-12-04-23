/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/runtime','./Lib/BB.S3', 'N/https', './Lib/crypto-js', 'N/encode','N/query'],

function(runtime, s3, https, CryptoJS, encode,query) {
   
    function onRequest(context) {
        if (context.request.method === 'POST') {
          var
            _currentScript = runtime.getCurrentScript()
            , _moveToPrefix = getMoveToPrefix(_currentScript)
            , _moving = false
            , _shouldDelete = []
            , _response
            , _responseJson
            , _body = JSON.parse(context.request.body)
            , _path = _body.path
            , _service = new s3.Service()
          ;
          log.debug('_moveToPrefix',_moveToPrefix);
            //log.debug('request body', _body);
            if(_body && _body.deleteItems instanceof Array && _body.deleteItems.length > 0) {
              if(typeof _moveToPrefix === 'string') {
                _moveToPrefix = _moveToPrefix.replace(/^\/|\/$/g, '');
                if(_moveToPrefix.length > 0) {
                  _moving = true;
                  _path = _path.replace(/^\/|\/$/g, '');
                  log.debug('copy object body',_body);
                  _body.deleteItems.forEach(function(d){
                    _response = _service.moveObject([_path, d].join('/'), [_moveToPrefix, _path, d].join('/'));
                    log.debug('copyObject Response', _response);
                    if(_response.code < 300) {
                      _shouldDelete.push(d);
                    }
                  });
                }
              }

              if(!_moving) {
                _shouldDelete = _body.deleteItems;
              }
              if(_shouldDelete.length > 0) {
                // log.debug('_shouldDelete', _shouldDelete);
                _response = _service.deleteAmazonObjects(_path, _shouldDelete);
                // log.debug('rsp', _response);
                _responseJson = JSON.stringify(_response);

              } else {
                _responseJson = JSON.stringify({
                  statusCode: 500
                  , body: 'Files were not moved.'
                })
              }
              // delete the thumb and print
              try {
                  _response = _service.deleteAmazonObjects(_path.replace(/\//,'-thumbnails/'), _shouldDelete);
                  log.debug('thumb rsp', _response);
                  //_responseJson = JSON.stringify(_response);
              } catch (e) {
                  log.debug('ERROR thumb',e);
              }
              try {
                  _response = _service.deleteAmazonObjects(_path.replace(/\//,'-print/'), _shouldDelete);
                  log.debug('print rsp', _response);
                  //_responseJson = JSON.stringify(_response);
              } catch (e) {
                  log.debug('ERROR print',e);
              }
            } else {
              _responseJson = JSON.stringify({
                statusCode: 400
                , body: 'No files to move.'
              })
            }
            context.response.setHeader({
                name: 'Content-Type',
                value: 'application/json; charset=utf-8',
              });
            return context.response.write(_responseJson);
        }

    }

    function getMoveToPrefix(_currentScript){
        try{
          var _credentials;
          var sql = 'SELECT '+
              'custrecord_bludocs_recycle_bin as recyclebin, '+
              " from customrecord_bludocs_config where isinactive='F' order by id";
              var results = query.runSuiteQL({query: sql, params: []}).asMappedResults();
              _credentials = results.length>0 ? results[0] : undefined;
              log.debug('_credentials NEW',_credentials);

          } catch(e){
            log.error('config missing',e);
          }

          if(_credentials && _credentials.recyclebin){
              return _credentials.recyclebin
          }else{
              return _currentScript.getParameter({name: 'custscript_bb_s3_move_deleted_to_prefix'})
          }
    }

    return {
        onRequest: onRequest
    };
    
});
