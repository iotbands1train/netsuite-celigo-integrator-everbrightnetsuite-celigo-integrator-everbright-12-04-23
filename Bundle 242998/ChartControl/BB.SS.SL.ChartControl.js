/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @author Michael Golichenko
 */

define(['N/search', 'N/file', 'N/render', 'N/url', 'N/format', 'N/runtime'],
  function(searchModule, fileModule, renderModule, urlModule, formatModule, runtimeModule){

    const
      _processMap = {
        'data': init
      }
    ;

    function getSearchConfig(searchId){
      var
        _searchId = searchId
        , _search
        , _filterFunc = function(columns, regexp) {
          return columns.filter(function(c) {
            return regexp.test(c.label);
          });
        }
        , _columns = {}
      ;
      if(_searchId){
        _search = searchModule.load({ id: _searchId });
        _columns.url  = _filterFunc(_search.columns, /^series\.url/i)[0];
        _columns.name = _filterFunc(_search.columns, /^series\.name/i)[0];
        _columns.data = _filterFunc(_search.columns, /^series\.data/i)[0];
        _columns.yAxisTitle = _filterFunc(_search.columns, /^axis\.y\.title/i)[0];
      }

      return _columns;
    }

    function getData(context){
      var
        _request = context.request
        , _result = {
          series: []
        }
        , _params = _request.parameters
        , _searchId = _params.searchId
        , _search
        , _searchConfig = getSearchConfig(_searchId)
      ;

      if(_searchId){
        _search = searchModule.load({id: _searchId});
        _search.run().each(function(row){
          var
            _data
            , _name
            , _url
            , _yAxisTitle = row.getValue(_searchConfig.yAxisTitle)
          ;
          if(_searchConfig.data && _searchConfig.name) {
            _data = row.getValue(_searchConfig.data);
            _name = row.getText(_searchConfig.name) || row.getValue(_searchConfig.name);
            _url = _searchConfig.url ? (row.getText(_searchConfig.url) || row.getValue(_searchConfig.url)) : undefined;
            if(!isNaN(Number(_data))){
              _data = Number(_data);
            }
            if(typeof _yAxisTitle === 'string' && _yAxisTitle.trim().length > 0) {
              _result.yAxisTitle = _yAxisTitle.trim();
            }
            _result.series.push({
              name: _name
              , data: [_data]
              , custom: {
                url: _url
              }
            });
          }
          return true;
        });

      }
      return _result;
    }

    function init(context) {
      var
        _response = context.response
        , _newData = getData(context)
      ;

      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write({output: JSON.stringify(_newData)});
    }

    function render(context){
      var
        _response = context.response
        , _templateRender
        , _regexStr
        , _htmlFile = fileModule.load({id:'./BB.SS.ChartControl.html'})
        , _html = _htmlFile.getContents()
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
      _response.write(_html);
    }

    function onRequest(context){
      const
        _method = context.request.method
        , _request = context.request
        , _params = _request.parameters
        , _process = typeof _params.process === 'string' && _params.process.trim().length > 0 ? _params.process.trim() : null
      ;
      try {
        if (_method === 'GET') {
          if(_process){
            if(_processMap.hasOwnProperty(_process)){
              _processMap[_process](context);
            }
          } else {
            render(context);
          }
        } else if(_method === 'POST') {
          if(_process){
            if(_processMap.hasOwnProperty(_process)){
              _processMap[_process](context);
            }
          }
        }
      } catch (e) {
        log.error('error executing calendar control', e);
      }
    }

    return {
      onRequest: onRequest
    };

  });