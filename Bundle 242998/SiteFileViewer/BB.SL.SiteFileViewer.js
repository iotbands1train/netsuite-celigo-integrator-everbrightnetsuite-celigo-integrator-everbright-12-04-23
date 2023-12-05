/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @author Michael Golichenko
 */

define(['N/record', 'N/search', 'N/file', 'N/render', 'N/url', 'N/format', 'N/runtime', 'N/https', 'N/xml', 'SuiteBundles/Bundle 207067/BB/S3/Lib/BB.S3'],
    function(recordModule, searchModule, fileModule, renderModule, urlModule, formatModule, runtimeModule, httpsModule, xmlModule, s3Module){

        function getProjectActions(projectId){
            var
                _projectActions = []
                , _projectActionsMap = []
            ;

            searchModule.create({
                type: 'customrecord_bb_project_action'
                , filters: [
                    ['custrecord_bb_project', searchModule.Operator.ANYOF, projectId]
                    , 'AND'
                    , ['isinactive', searchModule.Operator.IS, 'F']
                ]
                , columns: [
                    searchModule.createColumn({name: "entityid", join: "CUSTRECORD_BB_PROJECT"}),
                    searchModule.createColumn({name: "custrecord_bb_package"}),
                    searchModule.createColumn({name: "custrecord_bb_project_package_action"}),
                    searchModule.createColumn({name: "custrecord_bb_package_step_number"}),
                    searchModule.createColumn({name: "custrecord_bb_proj_task_dm_folder_text"}),
                    searchModule.createColumn({
                        name: "custrecord_bb_package_sequence_num",
                        join: "CUSTRECORD_BB_PACKAGE",
                        sort: searchModule.Sort.ASC
                    }),
                    searchModule.createColumn({
                        name: "custrecord_bb_doc_package_step_number",
                        join: "CUSTRECORD_BB_PROJECT_PACKAGE_ACTION",
                        sort: searchModule.Sort.ASC
                    })
                ]
            }).run().each(function(r){
                _projectActions.push({
                    id: r.id
                    , projectId: projectId
                    , projectUid: r.getValue({name: "entityid", join: "CUSTRECORD_BB_PROJECT"})
                    , packageId: r.getValue('custrecord_bb_package')
                    , packageName: r.getText('custrecord_bb_package')
                    , packageActionId: r.getValue('custrecord_bb_project_package_action')
                    , packageActionName: r.getText('custrecord_bb_project_package_action')
                    , packageActionPath: [runtimeModule.accountId, r.getValue('custrecord_bb_proj_task_dm_folder_text')].join('/')
                });
                return true;
            });

            _projectActions.forEach(function(pa){
                var _found = _projectActionsMap.filter(function(pam){ return pam.packageId === pa.packageId; })[0];
                if(!_found){
                    _projectActionsMap.push({
                        projectId: pa.projectId
                        , projectUid: pa.projectUid
                        , packageId: pa.packageId
                        , packageName: pa.packageName
                        , packageActions: _projectActions.filter(function(paf){ return paf.packageId === pa.packageId; })
                    });
                }
            });
            return _projectActionsMap;
        }

        function searchRecord(_params) {
            const
                _uuid = _params.uuid
            ;

            var
                _record = undefined
            ;

// try first to find Project
            searchModule.create({
                type: 'job'
                , filters: [
                    ['custentity_bb_ob_project_uuid', 'is', _uuid]
                ]
                , columns: [
                    'entityid'
                ]
            }).run().each(function(r) {
                _record =  {
                    id: r.id
                    , type: r.recordType
                    , key: [runtimeModule.accountId, 'projects', r.getValue('entityid')].join('/')
                    , projectActions: getProjectActions(r.id)
                };
                return false;
            });

            if(!_record) {
// try to find Project Action
                searchModule.create({
                    type: 'customrecord_bb_project_action'
                    , filters: [
                        ['externalid', 'is', _uuid]
                    ]
                    , columns: [
                        'custrecord_bb_package'
                        , 'custrecord_bb_project_package_action'
                        , 'custrecord_bb_proj_task_dm_folder_text'
                    ]
                }).run().each(function(r) {
                    _record =  {
                        id: r.id
                        , type: r.recordType
                        , key: [runtimeModule.accountId, r.getValue('custrecord_bb_proj_task_dm_folder_text')].join('/')
                        , projectActions: [
                            {
                                packageId: r.getValue('custrecord_bb_package')
                                , packageName: r.getText('custrecord_bb_package')
                                , packageActions: [
                                    {
                                        packageId: r.getValue('custrecord_bb_package')
                                        , packageName: r.getText('custrecord_bb_package')
                                        , packageActionId: r.getValue('custrecord_bb_project_package_action')
                                        , packageActionName: r.getText('custrecord_bb_project_package_action')
                                        , packageActionPath: [runtimeModule.accountId, r.getValue('custrecord_bb_proj_task_dm_folder_text')].join('/')
                                    }
                                ]
                            }
                        ]
                    };
                    return false;
                });

            }

            return _record;

        }

        function getFiles(prefix) {
            var
                _s3service = new s3Module.Service()
                , _presignedUrl
                , _fileResponse
                , _xmlFilesDocument
                , _files
                , _expirationSec = 60 * 15
            ;
            _s3service.loadCredentials();
            _s3service._service = 's3';
            _presignedUrl = _s3service.getPresignedListUrl(prefix, _expirationSec);
            _fileResponse  = httpsModule.get({ url: _presignedUrl });

            if (_fileResponse.code / 100 !== 2) {
                throw ["Error occurred calling Amazon (", _fileResponse.code, ").", "\n", _fileResponse.body].join('');
            }

            _xmlFilesDocument = xmlModule.Parser.fromString({ text : _fileResponse.body.replace('xmlns="http://s3.amazonaws.com/doc/2006-03-01/"', '') });
            _files = xmlModule.XPath
                .select({ node : _xmlFilesDocument, xpath: '/ListBucketResult/Contents/Key' })
                .map(function(node){
                    return node.textContent;
                });
            return _files;
        }

        function onRequest(context){
            const
                _method = context.request.method
                , _request = context.request
                , _response = context.response
                , _params = _request.parameters
            ;

            var
                _record
                , _recordData
                , _templateFilename
                , _htmlFile // _htmlFile = fileModule.load({id:'./template.html'})
                , _html // = _htmlFile.getContents()
                , _templateRender
                , _files
            ;

            if (_method === 'GET') {
                if(typeof _params.uuid === 'string' && _params.uuid.trim().length > 0) {
                    _record = searchRecord(_params);
                    if(_record) {
// load template
                        _templateFilename = ['./templates/', _record.type, '.ftl'].join('');
                        log.debug('_templateFilename', _templateFilename);
                        try {
                            _htmlFile = fileModule.load({ id: _templateFilename });
                        } catch(e) {}
                        if(_htmlFile) {
                            _recordData = recordModule.load({type: _record.type, id: _record.id});

                            _templateRender = renderModule.create();
                            _templateRender.templateContent = _htmlFile.getContents();
                            _templateRender.addRecord({
                                templateName: 'record',
                                record: _recordData
                            });

                            _files = getFiles(_record.key);

                            _record.projectActions.forEach(function(pam){
                                pam.packageActions.forEach(function(pa){
                                    pa.files = _files.filter(function(f){
                                        return typeof f === 'string' && f.indexOf(pa.packageActionPath) > -1;
                                    });
                                    pa.files = pa.files.map(function(f){
                                        var
                                            _fileName = f.replace(pa.packageActionPath, '').replace(/^\/+/, '')
                                            , _path = [pa.packageActionPath, encodeURIComponent(_fileName)].join('/')
                                        ;
                                        return {
                                            key: f
                                            , path: _path
                                            , filename: _fileName
                                            , url: urlModule.resolveScript({
                                                scriptId: 'customscript_bb_sl_site_show_file'
                                                , deploymentId: 'customdeploy_bb_sl_site_show_file'
                                                , params: {
// name: _path
                                                    name: f
                                                }
                                                , returnExternalUrl: true
                                            })
                                            , previewUrl: urlModule.resolveScript({
                                                scriptId: 'customscript_bb_sl_site_show_file'
                                                , deploymentId: 'customdeploy_bb_sl_site_show_file'
                                                , params: {
// name: _path
                                                    name: f
                                                    , preview: true
                                                }
                                                , returnExternalUrl: true
                                            })
                                        };
                                    });
                                })
                            });

                            _record.projectActions = _record.projectActions.filter(function(pam){
                                pam.packageActions = pam.packageActions.filter(function(pa){
                                    return pa.files instanceof Array && pa.files.length > 0;
                                });
                                return pam.packageActions instanceof Array && pam.packageActions.length > 0;
                            });

                            _templateRender.addCustomDataSource({
                                format: renderModule.DataSource.OBJECT,
                                alias: 'data',
                                data: {
                                    packages: _record.projectActions || []
                                }
                            });

                            _html = _templateRender.renderAsString();

                        } else {
// template not found
                        }
                    } else {
// record not found
                    }
                } else {
// invalid params
                }
            }
            _response.write({output: _html});
        }

        return {
            onRequest: onRequest
        };

    });