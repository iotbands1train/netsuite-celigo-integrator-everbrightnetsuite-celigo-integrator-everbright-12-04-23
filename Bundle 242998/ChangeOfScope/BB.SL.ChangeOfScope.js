/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 * @author Michael Golichenko
 * @overview - Change of Scope suitelet form
 */


define(['N/record', 'N/search', 'N/redirect', 'N/ui/serverWidget', 'N/runtime', 'N/url', 'N/render', 'N/file', './../BB SS/SS Lib/BB.SS.ProjectAction.Service', './../BB SS/SS Lib/BB.SS.ProjectAction.Model'],
  function(recordModule, searchModule, redirect, serverWidget, runtimeModule, urlModule, renderModule, fileModule, projectActionService, projectActionModel) {

    const
      _processMap = {
        'init': init
        , 'save': save
      }
      ;

    function init(context){
      var
        _response = context.response
        , _projectId = context.request.parameters.project
        , _project
        , _projectActionsData = []
        , _rejectionReasonData = []
        , _documentStatuses = []
        , _packageActionIds = []
        , _searchActionPackages
        , _searchRejectionReason
        , _searchChangeOfScopeReason
        , _searchDocumentStatus
        , _result = {
          data: {
            projectId: _projectId
            , packageActionsData: []
            , changeOfScopeReason: undefined
            , changeOfScopeComment: undefined
          }
          , view: {
            projectUrl: urlModule.resolveRecord({
              recordType: recordModule.Type.JOB
              , recordId: _projectId
            })
            , projectName: undefined
            , changeOfScopeReasonList: []
            , rejectionReasons: {}
            , statuses: {}
          }
        }
      ;

      _project = searchModule.lookupFields({
        type: searchModule.Type.JOB
        , id: _projectId
        , columns: ['altname', 'entityid']
      });

      _searchActionPackages = searchModule.create({
        type: 'customrecord_bb_project_action'
        , filters:
          [
            ['isinactive', searchModule.Operator.IS, 'F']
            , 'AND'
            , ['custrecord_bb_project', searchModule.Operator.ANYOF, _projectId]
          ]
        , columns: [
          searchModule.createColumn({ name: 'custrecord_bb_document_status' })
          , searchModule.createColumn({ name: 'internalid', join: 'custrecord_bb_package' })
          , searchModule.createColumn({ name: 'custrecord_bb_package' })
          , searchModule.createColumn({ name: 'internalid', join: 'custrecord_bb_project_package_action' })
          , searchModule.createColumn({ name: 'custrecord_bb_project_package_action' })
          , searchModule.createColumn({ name: 'custrecord_bb_doc_status_type', join: 'custrecord_bb_document_status' })
          , searchModule.createColumn({ name: 'custrecord_bb_project_package_action' })
        ]
      });
      // only use internal and submitted status type filter
      _searchActionPackages.filters.push(searchModule.createFilter({
        name: 'custrecord_bb_doc_status_type',
        join: 'custrecord_bb_document_status',
        operator: searchModule.Operator.ANYOF,
        values: [2, 3, 4]
      }));
      _searchActionPackages.run().each(function(result){
        _projectActionsData.push({
          id: result.id
          , packageId: result.getValue({name: 'internalid', join: 'custrecord_bb_package'})
          , package: result.getText({name: 'custrecord_bb_package'})
          , packageActionId: result.getValue({name: 'internalid', join: 'custrecord_bb_project_package_action'})
          , packageAction: result.getText({name: 'custrecord_bb_project_package_action'})
          , documentStatusId: result.getValue({name: 'custrecord_bb_document_status'})
          , documentStatus: result.getText({name: 'custrecord_bb_document_status'})
          , statusTypeId: result.getValue({ name: 'custrecord_bb_doc_status_type', join: 'custrecord_bb_document_status' })
          , statusType: result.getText({ name: 'custrecord_bb_doc_status_type', join: 'custrecord_bb_document_status' })
          , selected: false
          , show: false
        });
        return true;
      });

      _searchRejectionReason = searchModule.create({
        type: 'customrecord_bb_rejection_reason',
        filters:
          [
            ['isinactive', searchModule.Operator.IS, 'F']
          ],
        columns: [
          'name',
          'custrecord_bb_rej_package'
        ]
      });
      _searchRejectionReason.run().each(function(rejection){
        _rejectionReasonData.push({
          id: rejection.id
          , packageId: rejection.getValue({name: 'custrecord_bb_rej_package'})
          , name: rejection.getValue({name: 'name'})
        });
        return true;
      });

      _searchChangeOfScopeReason = searchModule.create({
        type: 'customlist_bb_cos_reason',
        filters:
          [
            ['isinactive', searchModule.Operator.IS, 'F']
          ],
        columns: [
          'name'
        ]
      });
      _searchChangeOfScopeReason.run().each(function(rejection){
        _result.view.changeOfScopeReasonList.push({
          id: rejection.id
          , name: rejection.getValue({name: 'name'})
        });
        return true;
      });

      _result.projectActions = _projectActionsData;

      _projectActionsData.forEach(function(val){
        const _addToList = _result.data.packageActionsData.filter(function(pad){return pad.id == val.packageId}).length === 0;
        if(_addToList){
          var
            _packageProjectActions = _projectActionsData.filter(function(pad){return pad.packageId == val.packageId})
            , _data = {
              id: val.packageId
              , name: val.package
              , packageId: val.packageId
              , projectActionsByStatus: []
              , selected: false
              , show: false
            }
          ;

          _packageProjectActions.forEach(function(pad){
            const _addToStatusList = _data.projectActionsByStatus.filter(function(ppa){return  ppa.id == pad.statusTypeId;}).length == 0;
            if(_addToStatusList){
              _data.projectActionsByStatus.push({
                id: pad.statusTypeId
                , name: pad.statusType
                , packageId: val.packageId
                , projectActions: _packageProjectActions.filter(function(ppa){return ppa.statusTypeId == pad.statusTypeId})
                , selected: false
                , show: false
              });
            }
          });
          _result.data.packageActionsData.push(_data);
        }
      });

      _packageActionIds = _result.data.packageActionsData.map(function(pad){
        return pad.id;
      })

      if(_packageActionIds.length > 0){
        _searchDocumentStatus = searchModule.create({
          type: 'customrecord_bb_document_status',
          filters:
            [
              ['isinactive', searchModule.Operator.IS, 'F']
              , 'AND'
              , ['custrecord_bb_doc_status_package', searchModule.Operator.ANYOF, _packageActionIds]
            ],
          columns: [
            'name'
            , 'custrecord_bb_doc_status_package'
            , 'custrecord_bb_doc_status_type'
            , 'custrecord_bb_doc_status_seq'
          ]
        });
        _searchDocumentStatus.run().each(function(result){
          _documentStatuses.push({
            id: result.id
            , name: result.getValue('name')
            , packageId: result.getValue('custrecord_bb_doc_status_package')
            , statusType: result.getText('custrecord_bb_doc_status_type')
            , seq: result.getValue('custrecord_bb_doc_status_seq')
            ,
          });
          return true;
        });
      }

      _result.data.packageActionsData.forEach(function(pad){
        _result.view.rejectionReasons[pad.id] = _rejectionReasonData.filter(function(rr){return rr.packageId == pad.id;});
        _result.view.statuses[pad.id] = _documentStatuses.filter(function(ds){return ds.packageId == pad.id;});
      })

      _result.view.projectName = _project.altname;

      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write(JSON.stringify(_result));
    }

    function save(context){

      const
        _request = context.request
        , _response = context.response
        , _body = JSON.parse(_request.body)
        , _result = {}
        , _status = {}
      ;

      var
        _projectActionRec
        , _newRevProjectActionId
        , _values = {}
        , _rejectComment
      ;

      _result.projectId = _body.projectId;
      _result.changeOfScopeReason = _body.changeOfScopeReason;
      _result.changeOfScopeComment = _body.changeOfScopeComment;
      _result.changeOfScopeProjectActions = [];
      _body.packageActionsData.forEach(function(packageActionData){
        packageActionData.projectActionsByStatus.forEach(function(byStatusData){
          byStatusData.projectActions.filter(function(pa){ return pa.selected }).forEach(function(pa){
            _result.changeOfScopeProjectActions.push(pa);
            })
        });
      });

      _result.changeOfScopeProjectActions.forEach(function(r){
        _rejectComment = [_result.changeOfScopeReason.name, _result.changeOfScopeComment].join(' - ');
        _projectActionRec = recordModule.load({
          type: projectActionModel.Type,
          id: r.id
        });
        if(r.createNewRevision){
          _newRevProjectActionId = projectActionService.createNewRevision(_projectActionRec);
          _values[projectActionModel.CustomFields.DOCUMENT_STATUS] = r.newDocumentStatus;
          recordModule.submitFields({
            id: _newRevProjectActionId
            , type: projectActionModel.Type
            , values: _values
            , options: {
              ignoreMandatoryFields: true
            }
          });
          _projectActionRec.setValue({fieldId: 'isinactive', value: true});
          _projectActionRec.setValue({fieldId: 'custrecord_bb_proj_actn_previous_rev_box', value: true});
        }
        _projectActionRec.setValue({fieldId: 'custrecord_bb_document_status', value: r.oldDocumentStatus});
        if(!isNaN(parseInt(r.rejectionReason))){
          _projectActionRec.setValue({fieldId: 'custrecord_bb_rejection_reason', value: r.rejectionReasonId});
          _projectActionRec.setValue({fieldId: 'custrecord_bb_rejection_comments', value: _rejectComment});
        }
        _projectActionRec.save();
      });
      recordModule.submitFields({
        type: recordModule.Type.JOB,
        id: _result.projectId,
        values: {
          'custentity_bb_change_of_scope_reason': _result.changeOfScopeReason.id,
          'custentity_bb_change_of_scope_date': (new Date()),
          'custentity_bb_change_of_scope_comments': _result.changeOfScopeComment
        }
      });

      _status.status = 'success';
      _status.result = _result;
      _status.redirect = urlModule.resolveRecord({
        recordId: _result.projectId,
        recordType: recordModule.Type.JOB,
        isEditMode: false
      });

      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write(JSON.stringify(_status));

    }

    function render(context){
      var
        _projectId = context.request.parameters.project
        , _htmlFile = fileModule.load({id:'./template.html'})
        , _html = _htmlFile.getContents()
        , _form
        , _htmlField
        , _regexStr
        , _templateRender
        , _currentScript = runtimeModule.getCurrentScript()
        , _title = _currentScript.getParameter({name: 'custscript_bb_sl_cos_title'}) || 'Change of Scope'
        , _saveButtonText = _currentScript.getParameter({name: 'custscript_bb_sl_cos_save_button_text'}) || 'Save'
      ;

      searchModule.create({
        type: 'file'
        , filters:[
          ['folder', searchModule.Operator.ANYOF, _htmlFile.folder]
          , 'AND'
          , ['filetype', searchModule.Operator.ANYOF, 'JAVASCRIPT']
        ]
        , columns: ['name', 'url']
      }).run().each(function(result){
        _regexStr = ['<script.* src="(', result.getValue('name'), ')".*?>'].join('');
        _html = _html.replace(new RegExp(_regexStr, 'igm'), function(match, p1){
          return match.replace(p1, result.getValue('url'));
        });
        return true;
      });

      _templateRender = renderModule.create();
      _templateRender.templateContent = _html;
      _templateRender.addCustomDataSource({
        format: renderModule.DataSource.OBJECT,
        alias: 'form',
        data: {
          view: {
            saveButtonText: _saveButtonText
          }
        }
      });
      _html = _templateRender.renderAsString();

      _form = serverWidget.createForm({
        title: _title
      });
      _htmlField = _form.addField({
        id: 'custpage_cos_form'
        , label: ' '
        , type: serverWidget.FieldType.INLINEHTML
      });
      _htmlField.defaultValue = _html;

      context.response.writePage(_form);
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
      const
        _method = context.request.method
        , _request = context.request
        , _params = _request.parameters
        , _process = _params.process
      ;

      if (_method === 'GET') {
        if(typeof _process === 'string' && _process.trim().length > 0){
          if(_processMap.hasOwnProperty(_process)){
            _processMap[_process](context);
          }
        } else {
          render(context);
        }
      } else if(_method === 'POST') {
        if(typeof _process === 'string' && _process.trim().length > 0){
          if(_processMap.hasOwnProperty(_process)){
            _processMap[_process](context);
          }
        }
      }
    }


    return {
      onRequest: onRequest
    };
  });