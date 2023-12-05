/**
 * @NApiVersion 2.0
 * @NScriptType suitelet
 * @NModuleScope Public
 * @author Graham O'Daniel
 */

define(['./Lib/BB.S3', 'N/https', 'N/render', './Lib/crypto-js', 'N/file', 'N/url','N/xml','N/format', 'N/crypto', 'N/encode', 'N/runtime', 'N/search', 'N/query']
  , function (s3, https, render, CryptoJS, fs, url,xml,format, cryptoModule, encodeModule, runtimeModule, searchModule, query) {
  var STYLE_BLOCK = [
    '<style type="text/css">',
    '.objects {',
    '  display: grid;',
    '  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));',
    '  grid-gap: 10px;',
    '}',
    '',
    '.object {',
    '  padding: 10px;',
    '  text-align: center;',
    '  display: block;',
    '  border: 1px solid gray;',
    '  background: lightgray;',
    '  font-size: 12;',
    '}',
    '',
    '.object a {',
    '  text-decoration: none;',
    '  color: black;',
    '}',
    '',
    '.new {',
    '  border: dashed;',
    '  background: lightblue;',
    '}',
    '',
    '#file_uploads {',
    '  opacity: 0;',
    '}',
    '',
    '.drop-target {',
    '  width: 100%;',
    '  display: inline-block;',
    '}',
    '</style>'
  ].join('\n');

  var NEW_OBJECT_BLOCK = [
    '<div class="object new" id="drop-area">',
    '<label for="file_uploads" class="drop-target">',
    '<span style="font-size: 36">+</span><br/>',
    '<span>Add Files</span>',
    '</label>',
    '<input type="file" name="file" id="file_uploads" multiple />',
    '</div>',
  ].join('\n');

  var VIEW_TEMPLATE = [
    '<#list XML.ListBucketResult.Contents as result>',
    '  <#assign lowerKey = result.Key?lower_case>',
    '  <div class="object">',
    '    <a target="_" href="/app/site/hosting/scriptlet.nl?script=customscript_bb_s3_sl_showfile&deploy=customdeploy_bb_s3_sl_showfile&name=${result.Key}">',
    '    <#if lowerKey?contains(".jpg")>',
    '      <img src="https://img.icons8.com/image"/>',
    '    <#elseif lowerKey?contains(".png")>',
    '      <img src="https://img.icons8.com/image"/>',
    '    <#elseif lowerKey?contains(".gif")>',
    '      <img src="https://img.icons8.com/image"/>',
    '    <#else>',
    '      <img src="https://img.icons8.com/document"/>',
    '    </#if><br/>',
    '    ${result.Key?replace(METADATA.prefix + "/","")}',
    '    </a>',
    '  </div>',
    '</#list>'
  ].join('\n');

  /*
  var SCRIPT_BLOCK = [
      '<script>',
      'let dropArea = document.getElementById("drop-area");',
      '["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {',
      '    dropArea.addEventListener(eventName, preventDefaults, false)',
      '});',
      '',
      'function preventDefaults (e) {',
      '  e.preventDefault();',
      '  e.stopPropagation();',
      '}',
      '</script>'
  ].join('\n');
  */

  const SCRIPT_BLOCK = [
    '<!-- Start of the JavaScript -->',
    '<!-- Load jQuery & jQuery UI (Needed for the FileUpload Plugin) -->',
    '<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>',
    '<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>',
    '',
    '<!-- Load the FileUpload Plugin (more info @ https://github.com/blueimp/jQuery-File-Upload) -->',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/blueimp-file-upload/9.5.7/jquery.fileupload.js"></script>',
    '',
    '<script>',
    '    $(document).ready(function () {',
    '',
    '        // Assigned to variable for later use.',
    '        var form = $(\'.direct-upload\');',
    '        var filesUploaded = [];',
    '        var folder = form.find(\'input[name="prefix"]\').val();',
    '',
    '        // Place any uploads within the descending folders',
    '        var folders = [];',
    '',
    '        form.fileupload({',
    '            url: form.attr(\'action\'),',
    '            type: form.attr(\'method\'),',
    '            datatype: \'xml\',',
    '            add: function (event, data) {',
    '',
    '                // Give the file which is being uploaded its current content-type (It doesn\'t retain it otherwise)',
    '                // and give it a unique name (so it won\'t overwrite anything already on s3).',
    '                var file = data.files[0];',

    '                var filename = file.name;',
    '                form.find(\'input[name="Content-Type"]\').val(file.type);',
    '                form.find(\'input[name="key"]\').val([folder, filename].join("/"));',
    '',
    '                // Show warning message if you\'re leaving the page during an upload.',
    '                window.onbeforeunload = function () {',
    '                    return \'You have unsaved changes.\';',
    '                };',
    '',
    '                // Actually submit form to S3.',
    '                data.submit();',
    '',
    '                // Add new object panel to list',
    '                // Uses the file size as a unique identifier',
    '                var viewUrl = "/app/site/hosting/scriptlet.nl?script=customscript_bb_s3_sl_showfile&deploy=customdeploy_bb_s3_sl_showfile&name=" + [folder, filename].join("/");',
    '                var aHref = \'<a href="\' + viewUrl + \'" target="_">\';',
    '                var img = \'<img src="" />\';',
    '                var newObject = $([\'<div class="object" data-mod="\', filename, \'">\', aHref, img, \'<span>\', filename, \'</span><br/><div class="bar"></div></a></div>\'].join(""));',
    '                $(\'.objects\').append(newObject);',
    '                newObject.slideDown(\'fast\');',
    '            },',
    '            progress: function (e, data) {',
    '                // This is what makes everything really cool, thanks to that callback',
    '                // you can now update the progress bar based on the upload progress.',
    '                var percent = Math.round((data.loaded / data.total) * 100);',
    '                $([\'.object[data-mod="\', data.files[0].name, \'"] .bar\'].join("")).css(\'width\', percent + \'%\').html(percent+\'%\');',
    '            },',
    '            fail: function (e, data) {',
    '                // Remove the \'unsaved changes\' message.',
    '                window.onbeforeunload = null;',
    '                $(\'.object[data-mod="\'+data.files[0].name+\'"] .bar\').css(\'width\', \'100%\').addClass(\'red\').html(\'\');',
    '            },',
    '            done: function (event, data) {',
    '                window.onbeforeunload = null;',
    '',
    '                // Upload Complete, show information about the upload in a textarea',
    '                // from here you can do what you want as the file is on S3',
    '                // e.g. save reference to your server / log it, etc.',
    '                var original = data.files[0];',
    '                var s3Result = data.result.documentElement.children;',
    '',
    '                filesUploaded.push({',
    '                    "original_name": original.name',
    '                //    "s3_name": s3Result[2].innerHTML,',
    '                 //   "size": original.size,',
    '                //    "url": s3Result[0].innerHTML',
    '                });',
    '            }',
    '        });',
    
    
    'console.log("FRAME",window.frameElement);',
    
    
    '    });',
    '</script>'
  ].join('\n');

  /**
   * Generates a presigned URL from S3 and presents the file in an HTML form.
   *
   * @param {any} params
   */
  function onRequest(params) {
    if (params.request.method === 'GET') {
      var acl = params.request.parameters.custom_bb_acl || 'private',
        prefix = params.request.parameters.prefix,
        _guid = params.request.parameters.guid,
        hideDropArea = params.request.parameters.hide_drop_area=='true',
        _currentScript = runtimeModule.getCurrentScript(),
        _guidSearchRecordType = _currentScript.getParameter({name: 'custscript_bb_s3_guid_search_record_type'}),
        _prefixSearchField = _currentScript.getParameter({name: 'custscript_bb_s3_prefix_search_field'}),
        ispublic=params.request.parameters.public=='true';

      if(_guid && _guidSearchRecordType && _prefixSearchField) {
        searchModule.create({
          type: _guidSearchRecordType
          , filters: [
            ['externalid', searchModule.Operator.ANYOF, [_guid]]
          ]
          , columns: [_prefixSearchField]
        }).run().each(function(row) {
          prefix = row.getValue({name: _prefixSearchField});
          return false;
        })
      }

      if (!prefix) {
        throw "Missing prefix/guid parameter.";
      }

      log.debug('hide drop area',hideDropArea);
      log.debug('public',ispublic);

      var amzDate = s3.Service.getAmzDate();
      var datestamp = amzDate.split("T")[0];
      var successStatus = "201";

      var s3service = new s3.Service();
      s3service.loadCredentials();
      s3service._service = 's3';

      var bucket = s3service._bucket;

      var amzAlgorithm = s3service.ALGORITHM;

      var amzCredential = [s3service._accessKey, datestamp, s3service._region, s3service._service, 'aws4_request'].join('/');

      var policy = new s3.Policy({
        "expiration": new Date().addHours(.5).toISOString(),
        //"expiration": "2027-12-01T12:00:00.000Z", // TODO: replace with now + 30 minutes
        "conditions": [
          {"prefix": prefix},
          {"bucket": s3service._bucket},
          {"acl": acl},
          {"success_action_status": successStatus},
          {"x-amz-credential": amzCredential},
          {"x-amz-algorithm": amzAlgorithm},
          {"x-amz-date": amzDate},
          {"content-disposition": "inline"},
          ["starts-with", "$content-type", ""], // Any content type for now
          ["starts-with", "$key", ""] // User can name it anything
        ]
      });

      var policyBase64 = policy.toBase64();

      var signingKey = s3service.getSignatureKey(s3service._service, s3service._secretKey, datestamp);

      var signature = CryptoJS.HmacSHA256(policyBase64, signingKey);

      log.debug('signature', JSON.stringify(signature));

      var html = getHtml(s3service, prefix, 'us-east-2', bucket, acl, amzCredential, amzAlgorithm, amzDate, policyBase64, signature, hideDropArea);

      if(ispublic){
        var pubURL = url.resolveScript({
          scriptId: 'customscript_bb_s3_sl_showfile',
          deploymentId: 'customdeploy_bb_s3_sl_showfile_public',
          returnExternalUrl: true
        });
        log.debug('replace url with public version',pubURL);
        html = html.replace(/\/app\/site\/hosting\/scriptlet\.nl\?script=customscript_bb_s3_sl_showfile&amp;deploy=customdeploy_bb_s3_sl_showfile/g,pubURL);
      }

      params.response.write(html);

      /*
      params.response.write(
          [
              '<html>',
              STYLE_BLOCK,
              '<body>',
              '<form action="//s3-us-east-2.amazonaws.com/' + bucket + '/" method="POST" enctype="multipart/form-data" class="direct-upload">',
              getHiddenField('prefix', 'prefix', prefix),
              getHiddenField('key', 'key', ''),
              getHiddenField('acl', 'acl', acl),
              getHiddenField('success_action_status', undefined, "201"),
              getHiddenField('Content-Type', 'contentType', 'binary/octet-stream'),
              getHiddenField('Content-Disposition', undefined, 'inline'),
              getHiddenField('X-Amz-Credential', undefined, amzCredential),
              getHiddenField('X-Amz-Algorithm', undefined, amzAlgorithm),
              getHiddenField('X-Amz-Date', undefined, amzDate),
              getHiddenField('Policy', undefined, policyBase64),
              getHiddenField('X-Amz-Signature', undefined, signature),
              '<div class="objects">',
              NEW_OBJECT_BLOCK,
              objectList,
              '</div>',
              '</form>',
              SCRIPT_BLOCK,
              '</body>',
              '</html>'
          ].join('\n')
      );
      */
    }
  }

  function buildPresignedUrl(service, method, endpoint, data) {
    var _host,
      _endpoint,
      _amzDate,
      _authDate,
      _canonicalUri,
      _canonicalQueryString,
      _signHeaders,
      _signedHeaders,
      _payloadHash,
      _signature,
      _credentialScope,
      _requestUrl,
      _params = [],
      _hash;

    _host = service.getApiGatewayHost();
    _host = typeof _host === 'string' ? _host.replace(/^\/|\/$/g, '') : '';
    _endpoint = typeof endpoint === 'string' ? ['/', endpoint.replace(/^\/|\/$/g, '')].join('') : '';
    _requestUrl = ['https://', _host, _endpoint].join('');

    _amzDate = s3.Service.getAmzDate();
    _authDate = _amzDate.split("T")[0];
    _canonicalUri = [_endpoint].join('');
    _canonicalQueryString = '';
    // ------------------------------------------------------------------------ //
    // should be in alphabetical order otherwise AWS signature will not match
    // AWS sorts headers alphabetically when generating signature
    // ------------------------------------------------------------------------ //
    _signHeaders = [['host:', _host].join('')];
    _signedHeaders = ['host'];
    // ------------------------------------------------------------------------ //
    // _payloadHash = CryptoJS.SHA256(JSON.stringify(data)).toString();
    _hash = cryptoModule.createHash({
      algorithm: cryptoModule.HashAlg.SHA256
    })
    _hash.update({
      input: JSON.stringify(data)
    })
    _payloadHash = _hash.digest({outputEncoding: encodeModule.Encoding.HEX}).toLowerCase();
    _credentialScope = [_authDate, service._region, service._service, 'aws4_request'].join('/');

    _params.push('X-Amz-Algorithm=');
    _params.push(service.ALGORITHM);
    if (data) {
      _params.push('&X-Amz-Content-Sha256=');
      _params.push(_payloadHash);
    }
    _params.push('&X-Amz-Credential=');
    _params.push(encodeURIComponent([service._accessKey, _credentialScope].join('/')));
    _params.push('&X-Amz-Date=');
    _params.push(_amzDate);
    _params.push('&X-Amz-Expires=');
    _params.push(60*60*24);
    _params.push('&X-Amz-SignedHeaders=')
    _params.push(_signedHeaders.join(';'));
    _canonicalQueryString = _params.join('');
    _signature = service.getSignature(service._service, method, _canonicalUri, _canonicalQueryString, _signHeaders, _signedHeaders, _payloadHash, _amzDate);

    _params.push('&X-Amz-Signature=');
    _params.push(_signature);

    return [_requestUrl, '?', _params.join('')].join('');
  }

  function getHtml(s3service, prefix, region, bucket, acl, amzCredential, amzAlgorithm, amzDate, policyBase64, signature, hideDropArea) {
    var templateFile = (function() {
      try {
        return fs.load({
          id: 'SuiteBundles/Bundle 207067/BB/S3/Templates/BB.S3.SL.ShowFolder.Template.xml'
        });
      } catch (e) {
        return fs.load({
          id: 'SuiteScripts/BB/S3/Templates/BB.S3.SL.ShowFolder.Template.xml'
        });
      }
    })();

    //log.debug('templateFile', templateFile.getContents());

    var
      _currentScript = runtimeModule.getCurrentScript()
      , _currentUser = runtimeModule.getCurrentUser()
      , _apiGatewayService = getdownloadApiId(_currentScript)
      , _forceHideDropArea = _currentScript.getParameter({name: 'custscript_bb_s3_force_hide_drop_area'})
      , _customViewFileDeployment = _currentScript.getParameter({name: 'custscript_bb_s3_view_file_deployment'})
      , _downloadAllUrl = ''
      , _isPublic = _currentUser.id == -4
      , _showFileUrl
    ;

    if(typeof _apiGatewayService === 'string' && _apiGatewayService.trim().length > 0){
      _downloadAllUrl = new s3.Service();
      _downloadAllUrl.loadCredentials();
      _downloadAllUrl._service = 'execute-api';
      _downloadAllUrl._subService = _apiGatewayService;
      _downloadAllUrl = buildPresignedUrl(
        _downloadAllUrl
        , 'POST'
        , '/v1/files/download'
        , {"prefix": prefix, "bucketName": _downloadAllUrl._bucket}
      );
      log.debug('_downloadAllUrl',_downloadAllUrl);
    }
    if(/t/i.test(_forceHideDropArea)) {
      hideDropArea = true;
    }

    if(!_customViewFileDeployment) {
      _customViewFileDeployment = 'customdeploy_bb_s3_sl_showfile';
    }

    _showFileUrl = url.resolveScript({
      scriptId: 'customscript_bb_s3_sl_showfile'
      , deploymentId: _customViewFileDeployment
      , returnExternalUrl: _isPublic
    });

    var presignedUrl = s3service.getPresignedListUrl(prefix, 60);
    var response = https.get({
      url: presignedUrl
    });
    log.audit('presignedUrl',response);

    var presignedThumbUrl = s3service.getPresignedListUrl(prefix.replace(/\//,'-thumbnails/'), 60);
    var thumbResponse = https.get({
      url: presignedThumbUrl
    });
    log.audit('thumbResponse',thumbResponse);

    if (response.code / 100 !== 2) {
      throw ["Error occurred calling Amazon (", response.code, ").", "\n", response.body].join('');
    }

    var renderer = render.create();
    renderer.templateContent = templateFile.getContents();//VIEW_TEMPLATE;

    var responseString = response.body.replace('xmlns="http://s3.amazonaws.com/doc/2006-03-01/"', '');
    //log.debug('responseString',responseString);
    var xmlDocument = xml.Parser.fromString({text : responseString});
    xmlDocument.getElementsByTagName({tagName : 'Key'}).forEach(function(key){
      var fileName = key.textContent.substr(key.textContent.lastIndexOf('/')+1);
      //log.debug('file fileName',fileName);
      var encodedName = encodeURIComponent(fileName);
      //log.debug('file encodedName',encodedName);
      responseString = responseString.replace(fileName,encodedName);

      var keyname = xmlDocument.createElement({tagName:'filename'});
      var keynameVal = xmlDocument.createTextNode(fileName);
      keyname.appendChild(keynameVal);
      key.parentNode.appendChild({newChild : keyname});

      key.textContent = key.textContent.replace(fileName,encodedName);
    });

    var thumbResponseString = thumbResponse.body.replace('xmlns="http://s3.amazonaws.com/doc/2006-03-01/"', '');
    log.debug('responseString',responseString);
    var xmlThumbDocument = xml.Parser.fromString({text : thumbResponseString});
    xmlThumbDocument.getElementsByTagName({tagName : 'Key'}).forEach(function(thumbKey){
      var fileName = thumbKey.textContent.substr(thumbKey.textContent.lastIndexOf('/')+1);
      log.debug('thumb file fileName',fileName);
      var encodedName = encodeURIComponent(fileName);
      //log.debug('file encodedName',encodedName);
      thumbResponseString = thumbResponseString.replace(fileName,encodedName);

      var keyname = xmlThumbDocument.createElement({tagName:'filename'});
      var keynameVal = xmlThumbDocument.createTextNode(fileName);
      keyname.appendChild(keynameVal);
      thumbKey.parentNode.appendChild({newChild : keyname});

      thumbKey.textContent = thumbKey.textContent.replace(fileName,encodedName);
    });


    var xmlStr = xml.Parser.toString({document : xmlDocument});
    var xmlThumbStr = xml.Parser.toString({document : xmlThumbDocument});

    renderer.addCustomDataSource({
      format: render.DataSource.XML_STRING,
      alias: "XML",
      data: xmlStr
    });
    renderer.addCustomDataSource({
      format: render.DataSource.XML_STRING,
      alias: "XMLTHUMB",
      data: xmlThumbStr
    });
    /* renderer.addCustomDataSource({
        format: render.DataSource.XML_STRING,
        alias: "XML",
        data: responseString
    });*/

    renderer.addCustomDataSource({
      format: render.DataSource.OBJECT,
      alias: "METADATA",
      data: {
        downloadAllUrl: _downloadAllUrl,
        prefix: prefix,
        region: region,
        bucket: bucket,
        hideDropArea: hideDropArea,
        viewFileDeployment: _customViewFileDeployment,
        showFileUrl: _showFileUrl,
        hiddenFields: [
          {
            name: 'prefix',
            id: 'prefix',
            value: prefix
          },
          {
            name: 'key',
            id: 'key',
            value: ''
          },
          {
            name: 'acl',
            id: 'acl',
            value: acl
          },
          {
            name: 'success_action_status',
            id: 'successActionStatus',
            value: '201'
          },
          {
            name: 'Content-Type',
            id: 'contentType',
            value: 'binary/octet-stream'
          },
          {
            name: 'Content-Disposition',
            id: 'contentDisposition',
            value: 'inline'
          },
          {
            name: 'X-Amz-Credential',
            id: 'amzCredential',
            value: amzCredential
          },
          {
            name: 'X-Amz-Algorithm',
            id: 'amzAlgorithm',
            value: amzAlgorithm
          },
          {
            name: 'X-Amz-Date',
            id: 'amzDate',
            value: amzDate
          },
          {
            name: 'Policy',
            id: 'policy',
            value: policyBase64
          },
          {
            name: 'X-Amz-Signature',
            id: 'amzSignature',
            value: signature.toString()
          }
        ]
      }
    });

    var html = (renderer.renderAsString() || 'No contents').replace("###SIGNATURE###", signature);

    return html;
  }

  function getInputField(type, name, id, value, onchange, br) {
    return [
      '<input',
      type ? 'type="' + type + '"' : '',
      name ? 'name="' + name + '"'  : '',
      id ? 'id="' + id + '"' : '',
      typeof value !== 'undefined' ? 'value="' + value + '"' : '',
      onchange ? 'onchange="' + onchange + '"' : '',
      '/>',
      br ? '<br />': ''
    ].join(' ');
  }

  function getHiddenField(name, id, value) {
    return getInputField('hidden', name, id, value, undefined, false);
  }

   function getdownloadApiId(_currentScript){
        try{
          var _credentials;
          var sql = 'SELECT '+
              'custrecord_bludocs_download_api_id as downloadapiid, '+
              " from customrecord_bludocs_config where isinactive='F' order by id";
              var results = query.runSuiteQL({query: sql, params: []}).asMappedResults();
              _credentials = results.length>0 ? results[0] : undefined;
              log.debug('_credentials downloadapiid',_credentials);

          } catch(e){
            log.error('config missing',e);
          }

          if(_credentials && _credentials.downloadapiid){
            log.debug('DOWNLOAD BTN','using _credentials');
              return _credentials.downloadapiid
          }else{
            log.debug('DOWNLOAD BTN','using script param');
              return _currentScript.getParameter({name: 'custscript_bb_s3_down_aws_api_gate_serv'})
          }
    }

    function isImage(prefix){
      var fileType = prefix.substring(prefix.lastIndexOf('.')+1).toLowerCase();
      var imageTypes = ['jpg','jpeg','png','gif'];
      return imageTypes.indexOf(fileType)>=0;
    }

      Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
      }

  return {
    onRequest: onRequest
  };
});