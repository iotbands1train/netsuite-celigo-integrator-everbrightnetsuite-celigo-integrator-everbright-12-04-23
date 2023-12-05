/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */

define(['N/runtime','./Lib/BB.S3','N/search','N/record'],
    function (runtime,s3,search,record) {
        function beforeLoad(scriptContext) {
            try {
                //if(runtime.executionContext === runtime.ContextType.MAP_REDUCE) return;
                var scriptObj = runtime.getCurrentScript();
                var rec = scriptContext.newRecord;

                var useUUID = scriptObj.getParameter({name: "custscript_bludocs_use_uuid_field"}),
                    uuid;
                var prefixField = scriptObj.getParameter({name: "custscript_bludocs_path_field_id"}) || '';
                //prefixField = rec.getFields().indexOf(prefixField) >= 0 ? prefixField : '';

                var filecount = scriptObj.getParameter({name: "custscript_bludocs_file_count_field_id"}) || '';

                var useFileDate = scriptObj.getParameter({name: "custscript_bludocs_use_file_date"});

                //log.debug('use uuid? '+useUUID, prefixField);

                if (scriptContext.type == scriptContext.UserEventType.CREATE ||
                    scriptContext.type == scriptContext.UserEventType.COPY) {
                    if (useUUID && prefixField) {
                        uuid = create_UUID();
                        // set the UUID on CREATE here so we don't loose data on first save
                        rec.setValue({fieldId: prefixField, value: uuid});
                        log.debug(prefixField, uuid);
                    } else if (prefixField) {
                        // clear the field to make sure we don't have values from somewhere else
                        rec.setValue({fieldId: prefixField, value: ''});
                        log.debug(prefixField, "cleared");
                    }
                    if (filecount) {
                        // clear the field to make sure we don't have values from somewhere else
                        rec.setValue({fieldId: filecount, value: ''});
                        log.debug(filecount, "cleared");
                    }
                }

                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) return;

                //View, Edit and Create(when using UUID)
                if (scriptContext.type != scriptContext.UserEventType.VIEW
                    && scriptContext.type != scriptContext.UserEventType.EDIT
                    && scriptContext.type != scriptContext.UserEventType.CREATE
                    && scriptContext.type != scriptContext.UserEventType.COPY
                ) return;
                if (!uuid && (scriptContext.type == scriptContext.UserEventType.CREATE ||
                    scriptContext.type == scriptContext.UserEventType.COPY)) return;
                if(!uuid && prefixField && !rec.getValue({fieldId: prefixField})) return;
                var rootfolder = scriptObj.getParameter({name: "custscript_bludocs_bucket_folder_path"}) || '';
                // force the account number into the root of the bucket path/prefix
                rootfolder = runtime.accountId.toUpperCase() + '/' + rootfolder;
                if (rootfolder.charAt(rootfolder.length - 1) != '/' && rootfolder != '') {
                    rootfolder = rootfolder + '/'; // we need the slash at the end
                }
                var docFrame = '<iframe id="bludocs_s3_iframe" data-count-field="{filecount}" ' +
                    'data-usefiledate="{usefiledate}" ' +
                    'frameborder="0" seamless="seamless" style="width:96vw; height:800px;" ' +
                    'src="/app/site/hosting/scriptlet.nl?script=customscript_bb_s3_sl_showfolder' +
                    '&deploy=customdeploy_bb_s3_sl_showfolder&prefix=' + rootfolder + '{recpath}"></iframe>';

                var prefix;
                if (uuid) {
                    prefix = uuid;
                } else if (prefixField) {
                    prefix = rec.getValue({fieldId: prefixField});
                    // if this field is empty something may have changed on the deployment
                    // does the deployment have a formula?
                    if (!prefix) {
                        prefix = getFormulaPath(scriptContext);
                        if (prefix) {
                            rec.setValue({fieldId: prefixField, value: prefix});
                        }
                    }
                }
                if (!prefix) { // default path
                    prefix = rec.type + '/' + rec.id;
                }
                docFrame = docFrame.replace('{recpath}', prefix);
                docFrame = docFrame.replace('{filecount}', filecount);
                docFrame = docFrame.replace('{usefiledate}',useFileDate);

                var tabName = scriptObj.getParameter({name: "custscript_bludocs_tab_name"}) || 'bluDocs';
                var tabPosition = parseInt(scriptObj.getParameter({name: "custscript_bludocs_tab_position"})) || 1;
                tabPosition = tabPosition < 1 ? 1 : tabPosition;

                var form = scriptContext.form;
                var tabs = form.getTabs() || [];

                var bluDocTab = form.addTab({
                    id: 'custpage_bludocs_tab',
                    label: tabName
                });

                var desc = scriptObj.getParameter({name: "custscript_bludocs_tab_text"});
                if(desc){
                    docFrame = '<div id="bludocs_tab_text" style="font-size: initial;">'+desc+'</div><br/><br/>'+docFrame;
                }

                form.addField({
                    id: 'custpage_bludocs_files',
                    type: 'INLINEHTML',
                    label: 'Files',
                    container: 'custpage_bludocs_tab'
                }).defaultValue = docFrame;

                if (tabs.length) {
                    if (tabPosition <= tabs.length) {
                        form.insertTab({
                            tab: bluDocTab,
                            nexttab: tabs[tabPosition - 1]
                        });
                    }
                }
            } catch (e) {
                log.error('beforeLoad',e);
            }
        }


        function beforeSubmit(scriptContext) {
            try {
                var scriptObj = runtime.getCurrentScript();
                var rec = scriptContext.newRecord;
                var prefixField = scriptObj.getParameter({name: "custscript_bludocs_path_field_id"}) || '';
                prefixField = rec.getFields().indexOf(prefixField) >= 0 ? prefixField : '';
                var useUUID = scriptObj.getParameter({name: "custscript_bludocs_use_uuid_field"});
                if (useUUID && prefixField && !rec.getValue({fieldId: prefixField})) {
                    // set the prefix field to UUID for this record
                    rec.setValue({fieldId: prefixField, value: create_UUID()});
                } else if (prefixField && !rec.getValue({fieldId: prefixField})) {
                    var formula = scriptObj.getParameter({name: 'custscript_bludocs_path_formula'});
                    // if no formula, default to rectype/id
                    var prefix = '';
                    if (!formula) {
                        prefix = rec.type + '/' + rec.id;
                    } else if (scriptContext.type != scriptContext.UserEventType.CREATE &&
                        scriptContext.type != scriptContext.UserEventType.COPY) {
                        // before submit we don't have the record ID to use
                        prefix = getFormulaPath(scriptContext);
                    }
                    // set the field value
                    log.debug('BS set field value',{fieldId: prefixField, value: prefix});
                    rec.setValue({fieldId: prefixField, value: prefix});
                }
            } catch (e) {
                log.error('beforeSubmit',e);
            }
        }

        function afterSubmit(context){
          if(context.type == context.UserEventType.DELETE) return;
          try {
              var scriptObj = runtime.getCurrentScript();
              var prefixField = scriptObj.getParameter({name: "custscript_bludocs_path_field_id"}) || '';
              if (!prefixField) return;
              var newRecPath = context.newRecord.getValue({fieldId: prefixField});
              var useUUID = scriptObj.getParameter({name: "custscript_bludocs_use_uuid_field"});

              if (!useUUID && (context.type == context.UserEventType.CREATE ||
                  context.type == context.UserEventType.COPY)) {
                  // set the path field value correctly for the NEW record
                  var formula = scriptObj.getParameter({name: 'custscript_bludocs_path_formula'});
                  // if no formula, default to rectype/id
                  var prefix = !formula ? rec.type + '/' + rec.id : getFormulaPath(context);
                  var valueObj = {};
                  valueObj[prefixField] = prefix;
                  record.submitFields({
                      type: context.newRecord.type,
                      id: context.newRecord.id,
                      values: valueObj,
                      options: {
                          enableSourcing: false,
                          ignoreMandatoryFields: true,
                          disableTriggers: true
                      }
                  });
                  return; // exit - no file moves
              }

              if (!context.oldRecord) return;

              var oldRecPath = context.oldRecord.getValue({fieldId: prefixField});
              if (oldRecPath && newRecPath != oldRecPath) {// don't attempt to move files from empty old path

                  var rootfolder = scriptObj.getParameter({name: "custscript_bludocs_bucket_folder_path"}) || '';
                  // force the account number into the root of the bucket path/prefix
                  rootfolder = runtime.accountId + '/' + rootfolder;
                  if (rootfolder.charAt(rootfolder.length - 1) != '/' && rootfolder != '') {
                      rootfolder = rootfolder + '/';
                  }

                  var _service = new s3.Service();
                  newRecPath = rootfolder + newRecPath.replace(/^\/|\/$/g, '');
                  oldRecPath = rootfolder + oldRecPath.replace(/^\/|\/$/g, '');
                  log.debug('move objects', {old: oldRecPath, new: newRecPath});

                  var _imagesUrlList = _service.getPresignedList(oldRecPath);
                  log.debug('_imagesUrlList', _imagesUrlList);
                  // update S3 path
                  if (newRecPath.length > 0) {
                      var _delObjects = [];
                      for (var i = 0; i < _imagesUrlList.length; i++) {
                          var _fullPath = _imagesUrlList[i];
                          var _fileName = _fullPath.substring(_fullPath.lastIndexOf('/') + 1);
                          log.debug('moving ' + _fileName, {from: _fullPath, to: newRecPath + '/' + _fileName});
                          var _response = _service.moveObject(_fullPath, newRecPath + '/' + _fileName);
                          log.debug('moveObject Response', _response);
                          if (_response.code == 200) _delObjects.push(_fileName);
                      }
                      if (_delObjects.length > 0) {
                          _response = _service.deleteAmazonObjects(oldRecPath, _delObjects);
                          log.debug('deleteAmazonObjects Response', _response);
                      }
                  }
              }
          } catch (e) {
              log.error('afterSubmit',e);
          }
        }


        function create_UUID() {
            var dt = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (dt + Math.random() * 16) % 16 | 0;
                dt = Math.floor(dt / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        }

        function getFormulaPath(context){
            var scriptObj = runtime.getCurrentScript();
            var rec = context.newRecord;
            var prefixField = scriptObj.getParameter({name: "custscript_bludocs_path_field_id"});
            if(!prefixField) return null; // path needs to be stored somewhere
            var formula = scriptObj.getParameter({name:'custscript_bludocs_path_formula'}) || '';
            var folder = scriptObj.getParameter({name:'custscript_bludocs_bucket_folder_path'}) || '';
            if(!formula && !folder) return null; // no path or folder used
            if(folder.charAt(folder.length-1)!='/' && folder!='') folder=folder.trim() +'/';
            // reformat for searching
            var regex = /(\{.*?\})/gm;
            var _formula = formula.trim();
            _formula = _formula.replace(regex, "'||$1||'");
            _formula = _formula.replace(/^('\|\|)|(\|\|')$/gm, '');
            if (_formula.charAt(0) != '{') _formula = _formula.replace(/(^.[\w\/]*)/gm, "'$1");
            if (_formula.charAt(_formula.length - 1) != '}') _formula = _formula + "'";
            log.debug(' Substitution _formula result: ', _formula);


            var results=[];
            var searchObj = search.create({
                type: rec.type,
                filters: [
                    ["internalid","is",rec.id]
                ],
                columns:[
                    search.createColumn({name: prefixField}),
                    search.createColumn({
                        name: "formulatext",
                        formula: _formula
                    })
                ]
            });
            log.debug(' search filters',searchObj.filterExpression);
            log.debug(' search columns',searchObj.columns);
            var searchResultCount = searchObj.runPaged().count;
            log.debug(" searchObj result count", searchResultCount);

            searchObj.run().each(function (result) {
                results.push(result.toJSON());
                return true;
            });
            log.debug('results',results);

            return results.length>0 ? results[0].values.formulatext : null;
        }


        return {
            beforeLoad: beforeLoad
            ,beforeSubmit: beforeSubmit
            ,afterSubmit: afterSubmit
        };
    });
