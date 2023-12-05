/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/search', 'N/file', 'N/render', 'N/ui/serverWidget', 'N/url', 'N/format', 'N/query', 'N/runtime'],

  function (recordModule, searchModule, fileModule, renderModule, serverWidget, urlModule, formatModule, queryModule, runtimeModule) {


    const
      _processMap = {
        'data': init
        , 'save': save
        , 'search': searchSelection
      }
      , _supportedType = [
        'select'
        , 'clobtext'
        , 'text'
        , 'currency'
        , 'integer'
        , 'url'
        , 'date'
        , 'checkbox'
        , 'float'
        , 'email'
        , 'percent'
        , 'phone'
        , 'textarea'
        , 'timeofday'
      ]
    ;

    function getFilterColumnName(column) {
      var
        _key = column.name
      ;
      if(/formula/i.test(_key)){
        _key = [_key, column.formula].join(': ');
      } else if(column.join) {
        _key = [column.join, _key].join('.').toLowerCase()
      }
      return _key;
    }

    function getDocumentStatusSelectOptions(package) {
      var
        _data = []
        , _search
        , _sql = `
                SELECT bds.id AS value, bds.name AS text FROM customrecord_bb_document_status AS bds
                WHERE bds.isinactive = 'F' AND bds.custrecord_bb_doc_status_package = ?
                ORDER BY bds.custrecord_bb_doc_status_seq ASC
                `
      ;
      if (package) {

        _data = queryModule.runSuiteQL({query: _sql, params: [package]}).asMappedResults();

        // _search = searchModule.create({
        //   type: "customrecord_bb_document_status",
        //   filters:
        //     [
        //       ["custrecord_bb_doc_status_package", "anyof", package],
        //       "AND",
        //       ["isinactive", "is", "F"]
        //     ],
        //   columns:
        //     [
        //       searchModule.createColumn({name: 'internalid'})
        //       , searchModule.createColumn({name: 'name'})
        //       , searchModule.createColumn({name: 'custrecord_bb_doc_status_seq', sort: searchModule.Sort.ASC})
        //     ]
        // });
        // _search.run().each(function (result) {
        //   _data.push({
        //     value: result.getValue({ name: 'internalid' }),
        //     text: result.getValue({ name: 'name' })
        //   });
        //   return true;
        // });
      }
      return _data;
    }

    function getRoles() {
      var
        _data = []
        , _search
        , _sql = `SELECT r.id AS value, r.name as text FROM role AS r WHERE r.isinactive = 'F'`
        , _result
      ;
      _data = queryModule.runSuiteQL({query: _sql}).asMappedResults();

      // log.debug('roles sql', _result);
      //
      // _search = searchModule.create({
      //   type: "role",
      //   filters:
      //     [
      //       ["isinactive", "is", "F"]
      //     ],
      //   columns:
      //     [
      //       "internalid",
      //       "name"
      //     ]
      // });
      // _search.run().each(function (result) {
      //   _data.push({
      //     value: result.getValue({ name: 'internalid' }),
      //     text: result.getValue({ name: 'name' })
      //   });
      //   return true;
      // });

      return _data;
    }

    function getProjectActionRecords(projectId) {
      var
        _data = []
        , _search
        , _sql = `
        SELECT 
        bpa.id AS value, 
        bpa.custrecord_bb_project_package_action AS text
        /*job.entityid || ' - ' || bpa.custrecord_bb_project_package_action || ' - Revision ' || bpa.custrecord_bb_revision_number AS text,*/
        FROM customrecord_bb_project_action AS bpa
        LEFT JOIN job ON job.id = bpa.custrecord_bb_project
        WHERE bpa.isinactive = 'F' AND bpa.custrecord_bb_project = ?
        `;
      ;
      if (projectId) {
        _data = queryModule.runSuiteQL({query: _sql, params: [projectId]}).asMappedResults();
        // _search = searchModule.create({
        //   type: "customrecord_bb_project_action",
        //   filters:
        //     [
        //       ["custrecord_bb_project", "anyof", projectId],
        //       "AND",
        //       ["isinactive", "is", "F"]
        //
        //     ],
        //   columns:
        //     [
        //       searchModule.createColumn({name: "internalid"}),
        //       searchModule.createColumn({name: 'entityid', join: "custrecord_bb_project"}),
        //       searchModule.createColumn({name: "custrecord_bb_project_package_action"}),
        //       searchModule.createColumn({name: "custrecord_bb_revision_number"}),
        //     ]
        // });
        // _search.run().each(function (result) {
        //   _data.push({
        //     value: result.getValue({name: 'internalid'}),
        //     text:
        //       [
        //       result.getValue({name: 'entityid', join: "custrecord_bb_project"})
        //         , '-'
        //       , result.getText({name: 'custrecord_bb_project_package_action'})
        //         , '-'
        //         , 'Revision'
        //       , result.getValue({name: 'custrecord_bb_revision_number'})
        //       ].join(' ')
        //   });
        //   return true;
        // });
      }
      return _data;
    }

    function getRequired() {
      var
        _data = []
        , _search
        , _sql = `SELECT r.id AS value, r.name as text FROM customlist_bb_required_optional AS r WHERE r.isinactive = 'F'`
        , _result
      ;
      _data = queryModule.runSuiteQL({query: _sql}).asMappedResults();

      return _data;
    }

    // new config

    const
      COLUMN_MAP = {
        'custrecord_bb_document_status': function (column, data) {
          var _packages = [];
          data.forEach(function(r){
            var _package = r['custrecord_bb_package'] ? r['custrecord_bb_package'].value : undefined;
            if(_package && _packages.indexOf(_package) === -1) {
              _packages.push(_package);
            }
          });
          column.data = {}
          if (/select/i.test(column.type) && _packages.length > 0) {

            _packages.forEach(function(p){
              column.data['custrecord_bb_package_' + p] = getDocumentStatusSelectOptions(p);
            });
            column.dataField = 'custrecord_bb_package';
          }
          return column;
        }
        , 'custrecord_bb_projact_preced_proj_action': function (column, data) {
          // if (params && params.projectId) {
          //   column.data = getProjectActionRecords(params.projectId);
          // }
          var
            _projects = []
            , _projectActions = []
          ;
          data.forEach(function(r){
            var _project = r['custrecord_bb_project'] ? r['custrecord_bb_project'].value : undefined;
            if(_project && _projects.indexOf(_project) === -1) {
              _projects.push(_project);
            }
          });
          column.data = {}
          if (/select/i.test(column.type) && _projects.length > 0) {
            _projects.forEach(function(p){
              column.data['custrecord_bb_project_' + p] = getProjectActionRecords(p);
              _projectActions = _projectActions.concat(column.data['custrecord_bb_project_' + p]);
            });
            column.dataField = 'custrecord_bb_project';
          }

          data.forEach(function(row){
            var _data = row['custrecord_bb_projact_preced_proj_action'];
            if(_data && _data.value) {
              var _found = _projectActions.filter(function(pa){
                return pa.value == _data.value;
              })[0];
              if(_found) {
                row['custrecord_bb_projact_preced_proj_action'].text = _found.text;
              }
            }
          });

          return column;
        }
        , 'custrecord_bb_proj_act_assigned_role': function (column) {
          // var _field = sublist.addField({
          //   id: 'custpage_assigned_to_role',
          //   type: serverWidget.FieldType.SELECT,
          //   label: 'Assigned To Role',
          //   source: 'role'
          // });
          column.data = getRoles();
          return column;
        }
        , 'custrecord_bb_proj_doc_required_optional': function (column) {
          column.data = getRequired();
          return column;
        }
        , 'custrecord_bb_proj_act_assigned_to_emp': function (column) {
          // var _field = sublist.addField({
          //   id: 'custpage_assigned_to_emp',
          //   type: serverWidget.FieldType.SELECT,
          //   label: 'Assigned To',
          //   source: 'employee'
          // });
          column.type = 'autocomplete';
          return column;
        }
        , 'custrecord_bb_proj_action_item': function (column) {
          // var _field = sublist.addField({
          //   id: 'custpage_action_item',
          //   type: serverWidget.FieldType.SELECT,
          //   label: 'Budget Item',
          //   source: 'item'
          // });
          column.type = 'autocomplete';
          return column;
        }
        , 'custrecord_bb_proj_act_assigned_to_tech': function (column) {
            column.type = 'autocomplete';
            return column;
          }
      }
      , UPDATE_LINK = {
        'custrecord_bb_document_status': function(data){
          if(data.hasOwnProperty('custrecord_bb_document_status_date')){
            // data['doc_status_date'].value = formatModule.format({
            //   value: new Date(),
            //   type: formatModule.Type.DATE
            // });
            data['custrecord_bb_document_status_date'].value = new Date();
            data['custrecord_bb_document_status_date'].changed = true;
          }
          return data;
        }
      }
      , SEARCH_OPTIONS = {
        'custrecord_bb_proj_act_assigned_to_emp': function(params) {
          var
            _term = params.term
            , _data = [];
          if(typeof _term === 'string' && _term.trim().length > 0) {
            _term = _term.trim();
            searchModule.create({
              type: 'employee'
              , filters: [
                ['entityid', 'contains', _term]
                , 'OR'
                , ['firstname', 'contains', _term]
                , 'OR'
                , ['lastname', 'contains', _term]
              ]
              , columns: ['entityid', 'firstname', 'lastname']
            }).run().each(function(row){
              var
                _firstname = row.getValue('firstname')
                , _lastname = row.getValue('lastname')
                , _entityid = row.getValue('entityid')
              ;

              _data.push({
                value: row.id
                , text: [_entityid, '-', _firstname, _lastname].join(' ')
              });

              return true;
            })
          }
          return _data;
        }
        , 'custrecord_bb_proj_act_assigned_to_tech': function(params) {
          var
            _term = params.term
            , _data = [];
          if(typeof _term === 'string' && _term.trim().length > 0) {
            _term = _term.trim();
            searchModule.create({
              type: 'employee'
              , filters: [
                ['entityid', 'contains', _term]
                , 'OR'
                , ['firstname', 'contains', _term]
                , 'OR'
                , ['lastname', 'contains', _term]
              ]
              , columns: ['entityid', 'firstname', 'lastname']
            }).run().each(function(row){
              var
                _firstname = row.getValue('firstname')
                , _lastname = row.getValue('lastname')
                , _entityid = row.getValue('entityid')
              ;

              _data.push({
                value: row.id
                , text: [_entityid, '-', _firstname, _lastname].join(' ')
              });

              return true;
            })
          }
          return _data;
        }
        , 'custrecord_bb_proj_action_item': function(params) {
          var
            _term = params.term
            , _data = [];
          if(typeof _term === 'string' && _term.trim().length > 0) {
            _term = _term.trim();
            searchModule.create({
              type: 'item'
              , filters: [
                ['itemid', 'contains', _term]
                // , 'OR'
                //   ['displayname', 'contains', _term]
              ]
              , columns: ['itemid']
            }).run().each(function(row){
              var
                _itemid = row.getValue('itemid')
              ;

              _data.push({
                value: row.id
                , text: _itemid
              });

              return true;
            })
          }
          return _data;
        }
      }
    ;

    function loadAllSearchConfig(searchId) {
      const
        _validDisplay = ['readonly', 'hidden']
      ;
      var
        _search = searchModule.load({id: searchId})
        , _columns = {}
        , _formulaFieldsCounter = 0
      ;

      _search.columns.forEach(function (column) {
        var
          _config = typeof column.label === 'string' && column.label.trim().length > 0 ? column.label.split('.') : []
          , _key = column.join ? [column.join, column.name].join('_') : column.name
          , _display = _config.filter(function(d){ return _validDisplay.indexOf(d) > -1; })[0]
          , _dropdown = _config.filter(function(d){ return ['dropdown'].indexOf(d) > -1; }).length > 0
          , _multiselect = _config.filter(function(d){ return ['multiselect'].indexOf(d) > -1; }).length > 0
          , _label = _config.filter(function(d){ return _validDisplay.concat(['dropdown', 'multiselect', 'filter']).indexOf(d) === -1 })[0]
          , _columnJson = column.toJSON()
          , _ignore = _config.filter(function(d){ return ['filter'].indexOf(d) > -1; }).length > 0
        ;

        if(/^formula/i.test(_key)){
          _key = [_key, _formulaFieldsCounter].join('_');
          _formulaFieldsCounter++;
        }


        if(_config.length > 0) {
          if (!_label && _validDisplay.indexOf(_display) === -1) {
            _label = _config[1] ? _config[1] : _config[0];
            _display = 'default';
          }

          if(!_display) {
            _display = 'default';
          }

          if(!/hidden/i.test(_display)) {
            if(/formula/i.test(_columnJson.type)){
              _display = 'readonly';
            } if(/select/i.test(_columnJson.type)) {
              if(!COLUMN_MAP.hasOwnProperty(_key)) {
                _display = 'readonly';
              }
            }
          }

          if(/default/i.test(_display) && _supportedType.indexOf(_columnJson.type) === -1) {
            _display = 'readonly';
          }

          _columns[_key] = {
            key: _key
            , display: _display
            , label: _label
            , column: column
            , type: _columnJson.type
            , filter: _dropdown || _multiselect
            , dropdown: _dropdown
            , multiselect: _multiselect
            , ignore: _ignore
          };
        }
      });
      // log.debug('_columns', _columns);
      return _columns;
    }

    function getFilterDropdown(searchId, key, filter){
      var
        _dd
        , _search
        , _none
        , _filters = []
        , _filterData = []
      ;
      _dd = {
        key: key
        , label: filter.label
        , data: []
        , multiselect: filter.multiselect
      };
      _dd.data.push({ id: 'all', text: '- All -' });
      _search = searchModule.load({id: searchId});
      _search.columns = [searchModule.createColumn({name: filter.column.name, summary: searchModule.Summary.GROUP, join: filter.column.join, sort: searchModule.Sort.ASC})];
      _search.filterExpression.forEach(function(filter){
        if(filter instanceof Array && /rownum/i.test(filter[0])){
          _filters.pop();
        } else {
          _filters.push(filter);
        }
      });
      _search.filterExpression = _filters;
      _search.run().each(function(row){
        _filterData.push({
          id: row.getValue({name: filter.column.name, summary: searchModule.Summary.GROUP, join: filter.column.join})
          , text: row.getText({name: filter.column.name, summary: searchModule.Summary.GROUP, join: filter.column.join}) ||
            row.getValue({name: filter.column.name, summary: searchModule.Summary.GROUP, join: filter.column.join})
        });
        return true;
      });

      _filterData = _filterData.sort(function(a, b) {
        return a.id - b.id;
      });

      _dd.data = _dd.data.concat(_filterData);

      _none = _dd.data.filter(function(f){ return f.id == '' || f.id == '- None -'; });
      if(_none) {
        _dd.data = _dd.data.filter(function(f){ return f.id != '' && f.id != '- None -'; });
        _dd.data.splice(1, 0, {
          id: ''
          , text: '- None -'
        })
      }
      return _dd;
    }

    function getFiltersDataNew(searchId){
      var _data = {
          filters: {}
        }
        // , _currentUser = runtimeModule.getCurrentUser()
        , _searchId = searchId
        , _columns = loadAllSearchConfig(_searchId)
      ;

      for(var key in _columns) {
        if(!_columns.hasOwnProperty(key)) continue;
        if(!_columns[key].filter) continue;

        if(/date/i.test(_columns[key].type)) {
          _data.filters[key] = {
            key: key
            , label: _columns[key].label
            , isDate: true
          };
        } else {
          _data.filters[key] = getFilterDropdown(_searchId, key, _columns[key]);
        }

      }
      return _data.filters;
    }

    function getData(searchId, columns, extraFilters) {
      var _data = [];
      if (searchId) {
        var
          _search = searchModule.load({id: searchId})
          , _counter = 0
        ;

        //log.debug('_search.filterExpression', _search.filterExpression);

        if(extraFilters instanceof Array && extraFilters.length > 0) {
          if (_search.filterExpression.length == 0) {
            extraFilters.shift();
          }
          _search.filterExpression = _search.filterExpression.concat(extraFilters);
        }
        // log.debug("_search.filterExpression", _search.filterExpression);
        _search.run().each(function (result) {
          //log.debug('row', result);
          var _row = {
            id: result.id
            , record_type: result.recordType
            , view: urlModule.resolveRecord({ recordType: result.recordType, recordId: result.id })
          };
          for (var key in columns) {
            if (columns.hasOwnProperty(key)) {
              if (columns[key].column) {
                _row[key] = {
                  value: result.getValue(columns[key].column)
                  , text: result.getText(columns[key].column)
                };
              }
            }
          }
          _data.push(_row);
          _counter++;
          return true;
        });
        //_result.filters = getFiltersDataNew(searchId);
      }

      return _data;
    }

    function getExtraFilters(columns, params) {
      var
        _params = params
        , _columns = columns
        , _extraFilters = []
      ;
      for(var key in _params) {
        if(_params.hasOwnProperty(key)) {
          var
            _val = typeof _params[key] === 'string' ? _params[key].split(String.fromCharCode(5)) : undefined
            , _columnName = undefined
            , _column = undefined
            , _all = _val instanceof Array && _val.filter(function(v){ return /^all$/i.test(v); }).length > 0
          ;
          if(_columns.hasOwnProperty(key)){
            _columnName = getFilterColumnName(_columns[key].column);
            _column = _columns[key].column;
          }
          if(_column && _columnName && _val instanceof Array && !_all){
            if(/select/i.test(_columns[key].type)) {
              _val = _val.map(function(v){ return (v.length === 0 ? '@NONE@' : v); });
              // if (_val.length === 0) {
              //   _val = '@NONE@';
              // }
              _extraFilters = _extraFilters.concat([
                'AND'
                , [_columnName, searchModule.Operator.ANYOF, _val]
              ]);
            } else if(/date/i.test(_columns[key].type) && typeof _val[0] === 'string' && _val[0].trim().length > 0) {
              _extraFilters = _extraFilters.concat([
                'AND'
                , [_columnName, searchModule.Operator.ON, _val[0].trim()]
              ]);
            } else if(typeof _val[0] === 'string') {
              if(_val[0].length === 0) {
                _extraFilters = _extraFilters.concat([
                  'AND'
                  , [_columnName, searchModule.Operator.ISEMPTY, _val[0]]
                ]);
              } else {
                _extraFilters = _extraFilters.concat([
                  'AND'
                  , [_columnName, searchModule.Operator.IS, _val[0]]
                ]);
              }

            }

          }
        }
      }
      return _extraFilters;
    }

    function init(context) {
      const
        _request = context.request
        , _params = _request.parameters
        , _searchId = _params.searchId
      ;
      var
        _columns = loadAllSearchConfig(_searchId)
        , _filters = getFiltersDataNew(_searchId)
        , _extraFilters = getExtraFilters(_columns, _params)
        , _data
      ;

      // log.debug('_extraFilters', _extraFilters);

      _data = getData(_searchId, _columns, _extraFilters);

      for(var key in _columns){
        if(_columns.hasOwnProperty(key)){
          if(_columns[key].ignore) continue;
          if(COLUMN_MAP.hasOwnProperty(key)) {
            COLUMN_MAP[key](_columns[key], _data);
          }
        }
      }

      context.response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });

      context.response.write({output: JSON.stringify({data: _data, columns: _columns, filters: _filters})});
    }

    function save(context) {
      const
        _request = context.request
        , _response = context.response
        , _params = _request.parameters
        , _searchId = _params.searchId
        , _body = JSON.parse(_request.body)
      ;

      var
        _status = {
          status: 'success'
        }
        , _columns = loadAllSearchConfig(_searchId)
        , _columnsArray = []
        , _record = recordModule.load({type: _body.record_type, id: _body.id })
        , _changed = false
        , _extraFilters = getExtraFilters(_columns, _params)
      ;

      for(var key in _columns){
        if(_columns.hasOwnProperty(key) && /default/i.test(_columns[key].display)){
          _columnsArray.push(_columns[key]);
        }
      }

      _columnsArray.forEach(function(c) {
        var
          _orgValue = _record.getValue({fieldId: c.column.name})
          , _bodyField = _body[c.key]
        ;
        if(_orgValue != _bodyField.value){
          _bodyField.changed = true;
          if(UPDATE_LINK.hasOwnProperty(c.key)){
            UPDATE_LINK[c.key](_body, _bodyField);
          }
          _changed = true;
        }
      });

      if(_changed) {
        for(var key in _body){
          if(_body.hasOwnProperty(key) && _body[key].changed && _columns[key]) {
            var
              _column = _columns[key].column
              , _bodyField = _body[key]
            ;
            if(/date/i.test(_columns[key].type) && typeof _bodyField.value === 'string') {
              _bodyField.value = formatModule.parse({value: _bodyField.value, type: formatModule.Type.DATE});
            }
            if(/timeofday/i.test(_columns[key].type) && typeof _bodyField.value === 'string') {
              _bodyField.value = formatModule.parse({value: _bodyField.value, type: formatModule.Type.TIMEOFDAY});
            }
            _record.setValue({fieldId: _column.name, value: _bodyField.value});
          }
        }

        try {
          _record.save({ ignoreMandatoryFields: true });
          _extraFilters = _extraFilters.concat([
            'AND'
            , ['internalid', 'anyof', _body.id]
          ]);

          _status.data = getData(_searchId, _columns, _extraFilters)[0];
        } catch(e) {
          log.error('RECORD SAVE ERROR', e);
          _status.status = 'failed';
        }
      }


      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write(JSON.stringify(_status));
    }

    function searchSelection(context){
      const
        _request = context.request
        , _response = context.response
        , _params = _request.parameters
        , _term = _params.term
        , _field = _params.field
      ;

      var _data = [];

      if(_field && SEARCH_OPTIONS[_field] && _term) {
        _data = SEARCH_OPTIONS[_field](_params)
      }

      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write(JSON.stringify(_data));
    }

    function render(context){
      const
        _request = context.request
        , _params = _request.parameters
        , _searchId = _params.searchId
        , _projectId = _params.projectId
        , _isPortlet = _params.hasOwnProperty('portlet')
      ;
//      log.debug('_params', _params);
      var
        _htmlFile = fileModule.load({id:'./template.html'})
        , _html = _htmlFile.getContents()
        , _form
        , _htmlField
        , _regexStr
        , _templateRender
        // , _columns = loadSearchConfig(_searchId)
        , _columns = loadAllSearchConfig(_searchId)
        , _columnsArray = []
        , _data = getData(_searchId, _columns)
        , _filters = getFiltersDataNew(_searchId)
        , _columnsData = {}
      ;

      for(var key in _columns){
        if(_columns.hasOwnProperty(key)){
          if(_columns[key].ignore) continue;
          if(COLUMN_MAP.hasOwnProperty(key)) {
            COLUMN_MAP[key](_columns[key], _data);
          }
          _columnsArray.push(_columns[key]);
        }
      }

      _columnsData = {
        hidden: _columnsArray.filter(function(c) { return /hidden/i.test(c.display); })
        , visible: _columnsArray.filter(function(c) { return !/hidden/i.test(c.display); })
      };

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
          columns: _columnsData
          // , columnsObj: JSON.stringify(_columns)
          // , data: JSON.stringify(_data)
          , filters: JSON.stringify(_filters)
          , isPortlet: _isPortlet.toString()
        }
      });
      _html = _templateRender.renderAsString();
      _form = serverWidget.createForm({
        title: _isPortlet ? ' ' : 'Multi-Project Action Submission'
        , hideNavBar: _isPortlet
      });

      _htmlField = _form.addField({
        id: 'custpage_proj_exp_budget_form'
        , label: ' '
        , type: serverWidget.FieldType.INLINEHTML
      });
      _htmlField.defaultValue = _html;
      context.response.writePage(_form);
    }




    function onRequest(context) {
      const
        _method = context.request.method
        , _request = context.request
        , _params = _request.parameters
        , _process = _params.process
      ;
      if (_method === 'GET') {
        if (typeof _process === 'string' && _process.trim().length > 0) {
          if (_processMap.hasOwnProperty(_process)) {
            _processMap[_process](context);
          }
        } else {
          render(context);
        }
      } else if (_method === 'POST') {
        if (typeof _process === 'string' && _process.trim().length > 0) {
          if (_processMap.hasOwnProperty(_process)) {
            _processMap[_process](context);
          }
        }
      }

    }

    return {
      onRequest: onRequest
    };

  });