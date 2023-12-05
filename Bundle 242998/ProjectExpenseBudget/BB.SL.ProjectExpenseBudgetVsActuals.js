/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 * @author Michael Golichenko
 * @overview - Project Expense Budget Vs Actuals suitelet form
 */


define(['N/record', 'N/search', 'N/redirect', 'N/ui/serverWidget', 'N/runtime', 'N/url', 'N/render'
    , 'N/file', 'N/format', 'N/encode'],
  function(recordModule, searchModule, redirect, serverWidget, runtimeModule, urlModule, renderModule
    , fileModule, formatModule, encodeModule) {


    Date.prototype.monthNames = [
      "January", "February", "March",
      "April", "May", "June",
      "July", "August", "September",
      "October", "November", "December"
    ];

    Date.prototype.getMonthName = function() {
      return this.monthNames[this.getMonth()];
    };
    Date.prototype.getShortMonthName = function () {
      return this.getMonthName().substr(0, 3);
    };

    const
      _processMap = {
        'init': init
        , 'download': download
        , 'versions': versions
        , 'projects': projects
      }
    ;


    function Helpers(){}
    Helpers.dateAddMonths = function(addMonths, date){
      var _date = date instanceof Date ? new Date(date) : new Date();
      _date.setMonth(_date.getMonth() + addMonths);
      return _date;
    }
    Helpers.setDateFirstDay = function(date){
      var _date = date instanceof Date ? new Date(date) : new Date();
      _date = new Date(_date.getFullYear(), _date.getMonth(), 1);
      return _date;
    }
    Helpers.setDateLastDay = function(date){
      var _date = date instanceof Date ? new Date(date) : new Date();
      _date = new Date(_date.getFullYear(), _date.getMonth() + 1, 0);
      return _date;
    }
    Helpers.monthsDiff = function (dateFrom, dateTo) {
      return dateTo.getMonth() - dateFrom.getMonth() + 1 +
        (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
    }
    Helpers.calculateSeqDate = function(startDate, sequence, type){
      var _seqCalulateFunc = {
        'week': function(date, seq) {
          return date.setDate(date.getDate() + seq * 7);
        }
        , 'month': function(date, seq) {
          if(seq > 0) {
            return date.setMonth(date.getMonth() + seq * 1, 1);
          }
          return date;
        }
      }
        , _type = ['week', 'month'].indexOf(type) > -1 ? type : 'month'
        , _startDate = startDate instanceof Date ? startDate : formatModule.parse({value: startDate, type: formatModule.Type.DATE});
      ;

      return _seqCalulateFunc[_type](_startDate, sequence);
    }


    function Config(params){
      this.config = {};
      this.project = params.project;
      this.segment = params.segment;
      this.startDate = params.start ? Helpers.setDateFirstDay(new Date(params.start)) : undefined;
      this.endDate = params.end ? Helpers.setDateLastDay(new Date(params.end)) : undefined;
      this.ignoreDates = params.hasOwnProperty('nodates');
      this.period = params.period;
      this.subsidiary = params.subsidiary;
      this.version = params.version || 'current';
      this.items = [];
      this.budgets = [];
      this.actuals = [];
      this.cc = [];
      this.je = [];
      this.subsidiaries = [];
      this.parsePeriodDates();
    }

    Config.loadSearchData = function(search) {
      var
        _paged
        , _data = []
      ;
      _paged = search.runPaged({pageSize: 1000});
      _paged.pageRanges.forEach(function(pageRange){
        _paged.fetch(pageRange).data.forEach(function(result){
          var
            _obj = {}
            , _key
          ;
          search.columns.filter(function(c){
            _key = c.label ? c.label.split('.') : [];
            if(/data/i.test(_key[0]) && _key[1]){
              _obj[_key[1]] = {
                value: result.getValue(c)
                , text: result.getText(c)
              };
            }
          })
          _data.push(_obj);
        });
      });


      return _data;
    }

    Config.loadExpenseItems = function(itemConfig){
      var
        _itemLines = []
        , _item
        , _sections
      ;
      //log.debug('itemConfig', itemConfig);
      itemConfig.search.run().each(function(result) {
        _item = {};
        _item.itemId = result.getValue(itemConfig.columns.itemid);
        if(itemConfig.columns.title) {
          _item.title = result.getText(itemConfig.columns.title) || result.getValue(itemConfig.columns.title);
        }
        if(typeof _item.title !== 'string' || _item.title.trim().length === 0) {
          _item.title = result.getText(itemConfig.columns.itemid) || result.getValue(itemConfig.columns.itemid);
        }
        _item.parentId = result.getValue(itemConfig.columns.section);
        if(itemConfig.columns.sectiontitle) {
          _item.parentText = result.getValue(itemConfig.columns.sectiontitle.trim());
        }
        if(typeof _item.parentText !== 'string' || _item.parentText.trim().length === 0) {
          _item.parentText = result.getText(itemConfig.columns.section) || result.getValue(itemConfig.columns.section);
        }
        if(typeof _item.parentText !== 'string' || _item.parentText.trim().length === 0) {
          _item.parentText = _item.parentId;
        }
        _item.sequenceNum = result.getValue(itemConfig.columns.sequence);
        if(_item.itemId && _item.parentId && _item.title) {
          _itemLines.push(_item);
        }
        return true;
      });

      _sections = _itemLines.reduce(function(newArray, item){
        var
          _foundItem = newArray.filter(function(n){
            return n.parentId === item.parentId;
          })[0];
        if(!_foundItem) {
          newArray.push({
            parentId: item.parentId
            , title: item.parentText
          })
        }

        return newArray;
      }, [])

      // _sections = _itemLines.filter(function(item){
      //   return !item.parentId;
      // });

      _sections.forEach(function(section){
        section.items = _itemLines.filter(function(item){
          return item.parentId == section.parentId;
        })
      });

      return _sections;
    }

    Config.prototype.loadSearch = function(searchId) {
      var _search;

      if(searchId) {
        _search = {
          search: searchModule.load({ id: searchId })
          , columns: {}
        };
        _search.search.columns.forEach(function (column) {
          if(typeof column.label === 'string' && column.label.trim().length > 0) {
            _search.columns[column.label.trim().toLowerCase()] = column;
          }
        });

        if(this.project && _search.columns['data.project']){
          _search.search.filters.push(
            searchModule.createFilter({
              name: _search.columns['data.project'].name
              , join: _search.columns['data.project'].join
              , formula: _search.columns['data.project'].formula
              , operator: searchModule.Operator.ANYOF
              , values: this.project
            })
          )
        }

        if(this.segment && this.segment > 0 && _search.columns['data.segment']){
          _search.search.filters.push(
            searchModule.createFilter({
              name: _search.columns['data.segment'].name
              , join: _search.columns['data.segment'].join
              , formula: _search.columns['data.segment'].formula
              , operator: searchModule.Operator.ANYOF
              , values: this.segment
            })
          )
        }

        if(this.startDate && this.endDate && _search.columns['data.date']){
          _search.search.filters.push(
            searchModule.createFilter({
              name: _search.columns['data.date'].name
              , join: _search.columns['data.date'].join
              , formula: _search.columns['data.date'].formula
              , operator: searchModule.Operator.ONORAFTER
              , values: formatModule.format({value: this.startDate, type: formatModule.Type.DATE})
            })
          )
          _search.search.filters.push(
            searchModule.createFilter({
              name: _search.columns['data.date'].name
              , join: _search.columns['data.date'].join
              , formula: _search.columns['data.date'].formula
              , operator: searchModule.Operator.ONORBEFORE
              , values: formatModule.format({value: this.endDate, type: formatModule.Type.DATE})
            })
          )
        }

        if(this.subsidiary && this.subsidiary > 0 && _search.columns['data.subsidiary']){
          _search.search.filters.push(
            searchModule.createFilter({
              name: _search.columns['data.subsidiary'].name
              , join: _search.columns['data.subsidiary'].join
              , formula: _search.columns['data.subsidiary'].formula
              , operator: searchModule.Operator.ANYOF
              , values: this.subsidiary
            })
          )
        }

        if(this.version && _search.columns['data.version']){
          _search.search.filters.push(
            searchModule.createFilter({
              name: _search.columns['data.version'].name
              , join: _search.columns['data.version'].join
              , formula: _search.columns['data.version'].formula
              , operator: searchModule.Operator.IS
              , values: this.version
            })
          )
        }

        _search.search.columns
          .filter(function(column){
            return typeof column.label === 'string' && column.label.trim().length > 0 && /filter\./i.test(column.label);
          })
      }
      return _search;
    }

    Config.prototype.initConfig = function() {
      var
        _script = runtimeModule.getCurrentScript()
        , _searchItemsId = _script.getParameter({name: 'custscript_bb_proj_exp_bva_item_srch'})
        , _searchSubsidiaryId = _script.getParameter({name: 'custscript_bb_proj_exp_bva_subs_srch'})
      ;

      this.config.items = this.loadSearch(_searchItemsId);
      this.config.subsidiaries = this.loadSearch(_searchSubsidiaryId);
    }

    Config.prototype.initData = function() {
      var
        _script = runtimeModule.getCurrentScript()
        , _searchBudgetId = _script.getParameter({name: 'custscript_bb_proj_exp_bva_budg_srch'})
        , _searchActualsId = _script.getParameter({name: 'custscript_bb_proj_exp_bva_act_srch'})
        , _searchCommCostId = _script.getParameter({name: 'custscript_bb_proj_exp_bva_cc_srch'})
        , _searchJeId = _script.getParameter({name: 'custscript_bb_proj_exp_bva_je_srch'})
      ;

      this.config.budgets = this.loadSearch(_searchBudgetId);
      this.config.actuals = this.loadSearch(_searchActualsId);
      this.config.cc = this.loadSearch(_searchCommCostId);
      this.config.je = this.loadSearch(_searchJeId);
    }

    Config.prototype.loadConfig = function(){
      this.items = this.config.items && this.config.items.search ? Config.loadExpenseItems(this.config.items) : [];
      this.subsidiaries = this.config.subsidiaries && this.config.subsidiaries.search ? Config.loadSearchData(this.config.subsidiaries.search) : [];
    }

    Config.prototype.loadData = function() {
      this.budgets = this.config.budgets && this.config.budgets.search ? Config.loadSearchData(this.config.budgets.search) : [];
      this.actuals = this.config.actuals && this.config.actuals.search ? Config.loadSearchData(this.config.actuals.search) : [];
      this.cc = this.config.cc && this.config.cc.search ? Config.loadSearchData(this.config.cc.search) : [];
      this.je = this.config.je && this.config.je.search ? Config.loadSearchData(this.config.je.search) : [];
    }

    Config.prototype.loadVersions = function(){
      var
        _search
        , _script = runtimeModule.getCurrentScript()
        , _searchBudgetId = _script.getParameter({name: 'custscript_bb_proj_exp_bva_budg_srch'})
        , _column
      ;

      if(_searchBudgetId && this.version) {
        _search = {
          search: searchModule.load({ id: _searchBudgetId })
          , columns: {}
        };
        _search.search.columns.forEach(function (column) {
          if(typeof column.label === 'string' && column.label.trim().length > 0) {
            _search.columns[column.label.trim().toLowerCase()] = column;
          }
        });

        if(this.version && _search.columns['data.version']){
          _column = {
            name: _search.columns['data.version'].name
            , join: _search.columns['data.version'].join
            , formula: _search.columns['data.version'].formula
            , function: _search.columns['data.version'].function
            , label: _search.columns['data.version'].label
            , sort: searchModule.Sort.ASC
            , summary: searchModule.Summary.GROUP
          }
          _search.search.columns = [searchModule.createColumn(_column)];
          _search.search.filters.push(
            searchModule.createFilter({
              name: _search.columns['data.version'].name
              , join: _search.columns['data.version'].join
              , formula: _search.columns['data.version'].formula
              , operator: searchModule.Operator.CONTAINS
              , values: this.version
            })
          );
        }
      }
      return Config.loadSearchData(_search.search).map(function(m){ return {value: m.version.value}; });
    }

    Config.prototype.loadProjects = function(){
      var
        _search
        , _script = runtimeModule.getCurrentScript()
        , _searchBudgetId = _script.getParameter({name: 'custscript_bb_proj_exp_bva_budg_srch'})
        , _column
      ;

      if(_searchBudgetId && this.project) {
        _search = {
          search: searchModule.load({ id: _searchBudgetId })
          , columns: {}
        };
        _search.search.columns.forEach(function (column) {
          if(typeof column.label === 'string' && column.label.trim().length > 0) {
            _search.columns[column.label.trim().toLowerCase()] = column;
          }
        });

        if(this.project && _search.columns['data.project']){
          _column = {
            name: _search.columns['data.project'].name
            , join: _search.columns['data.project'].join
            , formula: _search.columns['data.project'].formula
            , function: _search.columns['data.project'].function
            , label: _search.columns['data.project'].label
            , sort: searchModule.Sort.ASC
            , summary: searchModule.Summary.GROUP
          }
          _search.search.columns = [searchModule.createColumn(_column)];
          if(_search.columns['filter.project']) {
            _search.search.filters.push(
              searchModule.createFilter({
                name: _search.columns['filter.project'].name
                , join: _search.columns['filter.project'].join
                , formula: _search.columns['filter.project'].formula
                , operator: searchModule.Operator.CONTAINS
                , values: this.project
              })
            );
          } else {
            _search.search.filters.push(
              searchModule.createFilter({
                name: _search.columns['data.project'].name
                , join: _search.columns['data.project'].join
                , formula: _search.columns['data.project'].formula
                , operator: searchModule.Operator.CONTAINS
                , values: this.project
              })
            );
          }

        }
        return Config.loadSearchData(_search.search).map(function(m){ return {value: m.project.value, text: m.project.text}; });
      }
      return [];
    }

    Config.prototype.getSections = function(){
      var
        _this = this
        , _sections
      ;
      _sections = this.items.reduce(function(newArray, item){
        var
          _foundItem = newArray.filter(function(n){
            return n.parentId === item.parentId;
          })[0];
        if(!_foundItem) {
          newArray.push({
            id: item.parentId
            , name: item.parentText
          })
        }

        return newArray;
      }, [])

      _sections.forEach(function(section){
        section.items = _this.items.filter(function(item){
          return item.parentId == section.parentId;
        })
      });
    }

    Config.prototype.getProjects = function(){
      var
        _temp = []
        , _projects = []
      ;
      _temp = _temp.concat(
        this.budgets.map(function(b){ return {id: b.project.value, name: b.project.text, item: b.item.value}})
      );

      if(/current/i.test(this.version)){
        _temp = _temp.concat(
          this.actuals.map(function(b){ return {id: b.project.value, name: b.project.text, item: b.item.value}})
        );

        _temp = _temp.concat(
          this.cc.map(function(b){ return {id: b.project.value, name: b.project.text, item: b.item.value}})
        );

        _temp = _temp.concat(
          this.je.map(function(b){ return {id: b.project.value, name: b.project.text, item: b.item.value}})
        )
      }


      _temp.forEach(function(t){
        if(_projects.filter(function(p){ return t.id == p.id}).length === 0){
          if(t.id){
            var _items = [];
            _temp.filter(function(f){ return t.id == f.id; }).map(function(f){ return f.item; }).forEach(function(i){
              if(_items.filter(function(p){ return p == i}).length === 0 && i){
                _items.push(i);
              }
            })
            _projects.push({
              id: t.id
              , name: t.name
              , items: _items
            });
          }
        }
      })

      return _projects;
    }

    Config.prototype.getSegments = function(){
      var
        _temp = []
        , _segments = []
      ;

      _temp = _temp.concat(
        this.budgets
          .filter(function(b) { return b.segment })
          .map(function(b){ return {id: b.segment.value, name: b.segment.text}})
      );
      _temp = _temp.concat(
        this.actuals
          .filter(function(b) { return b.segment })
          .map(function(b){ return {id: b.segment.value, name: b.segment.text}})
      );

      _temp = _temp.concat(
        this.cc
          .filter(function(b) { return b.segment })
          .map(function(b){ return {id: b.segment.value, name: b.segment.text}})
      );

      _temp = _temp.concat(
        this.je
          .filter(function(b) { return b.segment })
          .map(function(b){ return {id: b.segment.value, name: b.segment.text}})
      )

      _temp.forEach(function(t){
        if(_segments.filter(function(p){ return t.id == p.value}).length === 0){
          if(t.id){
            _segments.push({
              value: t.id
              , text: t.name
            });
          }
        }
      })

      _segments.unshift({ value: -1, text: '- All -'})

      return _segments;
    }

    Config.prototype.getItems = function(){
      var
        _temp = []
        , _items = []
      ;
      _temp = _temp.concat(
        this.budgets.map(function(b){ return {id: b.item.value, name: b.item.text}})
      );

      _temp = _temp.concat(
        this.actuals.map(function(a){ return {id: a.item.value, name: a.item.text}})
      );

      _temp = _temp.concat(
        this.cc.map(function(b){ return {id: b.item.value, name: b.item.text}})
      );

      _temp.forEach(function(t){
        if(_items.filter(function(p){ return t.id == p.id}).length === 0){
          if(t.id){
            _items.push(t);
          }
        }
      })

      return _items;
    }

    Config.prototype.getSubsidiaries = function(){
      var _result = [];

      if(this.subsidiaries){
        _result = this.subsidiaries.map(function(s){ return { value: s.id.value, text: s.name.value }; });
      }

      _result.unshift({ value: -1, text: '- All -'})

      return _result;
    }

    // Config.prototype.parseBudget = function(){
    //   if(this.budgets instanceof Array && this.budgets.length > 0){
    //     this.budgets.forEach(function(f){
    //       f.date = { value: Helpers.calculateSeqDate(f.startdate.value, f.sequence.value, f.type.value) };
    //     })
    //   }
    //   //log.debug('this.budgets', this.budgets);
    // }

    Config.prototype.parsePeriodDates = function(){
      var
        _this = this
        , _func = {
        'month': function(start, end){
          _this.startDate = start || Helpers.setDateFirstDay(Helpers.dateAddMonths(-1));
          _this.endDate = end || Helpers.setDateLastDay(Helpers.dateAddMonths(1));
        }
        , 'quarter': function(start, end){
          start = start || Helpers.setDateFirstDay(new Date());
          end = end || Helpers.setDateLastDay(new Date());
          _this.startDate = new Date(start.getFullYear(), Math.floor((start.getMonth() / 3)) * 3, 1);
          _this.endDate = new Date(end.getFullYear(), (Math.floor((end.getMonth() / 3)) * 3) + 3, 0);
        }
        , 'year': function(start, end){
          _this.startDate = start || Helpers.setDateFirstDay(new Date());
          _this.endDate = end || Helpers.setDateLastDay(new Date());
          start.setMonth(0);
          end.setMonth(11);
        }
        , 'totals': function(start, end){
          if(!_this.ignoreDates) {
            _this.startDate = start || Helpers.setDateFirstDay(new Date());
            _this.endDate = end || Helpers.setDateLastDay(new Date());
          } else {
            _this.startDate = undefined;
            _this.endDate = undefined;
          }
        }
      };
      if(typeof _func[this.period] === 'function'){
        _func[this.period](this.startDate, this.endDate);
      }
    }

    Config.prototype.getSequenceCount = function(){
      var _func = {
        'month': function(start, end){
          return Helpers.monthsDiff(start, end)
        }
        , 'quarter': function(start, end){
          var _months = Helpers.monthsDiff(start, end);
          return Math.ceil(_months / 3);
        }
        , 'year': function(start, end){
          var _years = end.getFullYear() - start.getFullYear();
          return _years + 1;
        }
        , 'totals': function(start, end){
          return 1;
        }
      };
      return _func[this.period](this.startDate, this.endDate);
    }

    Config.prototype.getSequenceNames = function(count) {
      var
        _seqNames = []
        , _func = {
          'month': function(start){
            for(var i = 0; i < count; i++) {
              var
                _date = new Date(start)
              ;
              _date.setMonth(_date.getMonth() + i);
              _seqNames.push([_date.getMonthName(), _date.getFullYear()].join(' '));
            }
          }
          , 'quarter': function(start, end){
            var
              _date = new Date(start)
            ;
            for(var i = 0; i < count; i++) {
              var _quarter = 0;
              _quarter = Math.floor(_date.getMonth() / 3);
              log.debug('quarter _date.getMonth() / 3', _date.getMonth() / 3);
              log.debug('quarter _quarter', _quarter);
              log.debug('quarter _date.getMonth()', _date.getMonth());
              _seqNames.push([_quarter + 1, 'Q ', _date.getFullYear()].join(''));
              _date.setMonth(_date.getMonth() + 3);
            }
          }
          , 'year': function(start){
            var _startYear = start.getFullYear();
            for(var i = 0; i < count; i++){
              _seqNames.push(_startYear + i);
            }
          }
          , 'totals': function(start){
            _seqNames.push('Totals');
          }
        }
        ;
      _func[this.period](this.startDate, this.endDate);
      if(!/totals/i.test(this.period)){
        _seqNames.push('Totals');
      }
      return _seqNames;
    }

    function getData(context){
      var
        _request = context.request
        , _params = _request.parameters
        , _config = new Config(_params)
        , _result = []
        , _projects
        , _segments
        , _sections
        , _seqCount
        , _seqNames
        , _subsidiaries
        , _minMaxDates = []
        , _add = {
          'month': 1
          , 'quarter': 3
          , 'year': 12
          , 'totals': 0
        }
      ;
      _config.initConfig();
      _config.loadConfig();
      if(_config.subsidiaries instanceof Array && _config.subsidiaries[0] && !_config.subsidiary){
        _config.subsidiary = -1; //_config.subsidiaries[0].id.value;
      }
      if(!_config.segment){
        _config.segment = -1;
      }
      _config.initData();
      _config.loadData();

      _projects = _config.getProjects();
      _segments = _config.getSegments();
      _sections = _config.getSections();
      _seqCount = _config.getSequenceCount();
      _seqNames = _config.getSequenceNames(_seqCount);
      _subsidiaries = _config.getSubsidiaries();
      if(!/totals/i.test(_config.period)){
        _seqCount++;
      }
      _projects.forEach(function(proj){
        var _proj = {
          name: proj.name
          , sections: []
          , seq: []
          , collapsed: true
        };
        _config.items.forEach(function(sec){
          var
            _section = {
              name: sec.title
              , collapsed: true
              , items: sec.items.filter(function(i){
                return proj.items.filter(function(pi){ return pi == i.itemId}).length > 0;
              })
              , seq: []
            };


          if(_section.items.length > 0){
            _section.items = _section.items.map(function(item){
              var
                _start = new Date(_config.startDate)
                , _end = new Date(_start)
                , _seq = []
                , _count = _seqCount
              ;
              if(/totals/i.test(_config.period)){
                _end = new Date(_config.endDate);
              } else {
                _end.setFullYear(_start.getFullYear(), _start.getMonth() + _add[_config.period], 0);
                _count = _seqCount - 1;
              }

              for(var i = 0; i < _count; i++) {
                var _data = {
                  budget: _config.budgets.filter(function(f){
                    return (_config.ignoreDates || (new Date(f.date.value) >= _start && new Date(f.date.value) <= _end)) && f.project.value == proj.id && f.item.value == item.itemId;
                  }).reduce(function(acc, f){ return acc + parseFloat(f.amount.value); }, 0)
                  // , budget: _config.budgets
                  // , actual: _config.actuals.filter(function(f){
                  //   return new Date(f.date.value) >= _start && new Date(f.date.value) <= _end && f.project.value == proj.id && f.item.value == item.itemId;
                  // }).reduce(function(acc, f){ return acc + parseFloat(f.amount.value); }, 0)
                  , cc: _config.cc.filter(function(f){
                    return (_config.ignoreDates || (new Date(f.date.value) >= _start && new Date(f.date.value) <= _end)) && f.project.value == proj.id && f.item.value == item.itemId;
                  }).reduce(function(acc, f){ return acc + parseFloat(f.amount.value); }, 0)
                };

                _data.actual = _config.actuals.filter(function(f){
                  return (_config.ignoreDates || (new Date(f.date.value) >= _start && new Date(f.date.value) <= _end)) && f.project.value == proj.id && f.item.value == item.itemId;
                }).reduce(function(acc, f){ return acc + parseFloat(f.amount.value); }, 0);
                _data.actual = _data.actual + _config.je.filter(function(f){
                  return (_config.ignoreDates || (new Date(f.date.value) >= _start && new Date(f.date.value) <= _end))  && f.project.value == proj.id && f.item.value == item.itemId;
                }).reduce(function(acc, f){ return acc + parseFloat(f.amount.value); }, 0);
                _data.variance = _data.budget - _data.actual - _data.cc;
                // _data.budget = formatModule.format({value: _data.budget, type: formatModule.Type.CURRENCY});
                // _data.actual = formatModule.format({value: _data.actual, type: formatModule.Type.CURRENCY});
                // _data.cc = formatModule.format({value: _data.cc, type: formatModule.Type.CURRENCY});
                // _data.variance = formatModule.format({value: _data.variance, type: formatModule.Type.CURRENCY});

                _seq.push(_data);

                _start.setMonth(_start.getMonth() + 1);
                _start.setDate(1);
                _end.setFullYear(_start.getFullYear(), _start.getMonth() + _add[_config.period], 0);
              }
              if(!/totals/i.test(_config.period)){
                _seq.push({
                  budget: _seq.reduce(function(acc, f){ return acc + f.budget; }, 0)
                  , actual: _seq.reduce(function(acc, f){ return acc + f.actual; }, 0)
                  , cc: _seq.reduce(function(acc, f){ return acc + f.cc; }, 0)
                  , variance: _seq.reduce(function(acc, f){ return acc + f.variance; }, 0)
                });
              }
              return {
                name: item.title
                , seq: _seq
              }
            });
            for(var i = 0; i < _seqCount; i++) {
              _section.seq.push({
                budget: _section.items.reduce(function(acc, f){ return acc + f.seq[i].budget; }, 0)
                , actual: _section.items.reduce(function(acc, f){ return acc + f.seq[i].actual; }, 0)
                , cc: _section.items.reduce(function(acc, f){ return acc + f.seq[i].cc; }, 0)
                , variance: _section.items.reduce(function(acc, f){ return acc + f.seq[i].variance; }, 0)
              })
            }

            _proj.sections.push(_section);
          }
        });
        if(_proj.sections.length > 0) {
          for(var i = 0; i < _seqCount; i++) {
            _proj.seq.push({
              budget: _proj.sections.reduce(function(acc, f){ return acc + f.seq[i].budget; }, 0)
              , actual: _proj.sections.reduce(function(acc, f){ return acc + f.seq[i].actual; }, 0)
              , cc: _proj.sections.reduce(function(acc, f){ return acc + f.seq[i].cc; }, 0)
              , variance: _proj.sections.reduce(function(acc, f){ return acc + f.seq[i].variance; }, 0)
            })
          }
          _result.push(_proj);
        }
      });
      return {
        data: _result
        , subsidiaries: _subsidiaries
        , seqNames: _seqNames
        , config: {startDate: _config.startDate, endDate: _config.endDate}
        , projects: _projects
        , segments: _segments
        , sections: _sections
        , seqCount: _seqCount
      };
    }

    function versions(context){
      var
        _request = context.request
        , _response = context.response
        , _params = _request.parameters
        , _config = new Config(_params)
      ;
      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write(JSON.stringify(_config.loadVersions()));

    }

    function projects(context){
      var
        _request = context.request
        , _response = context.response
        , _params = _request.parameters
        , _config = new Config(_params)
      ;
      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write(JSON.stringify(_config.loadProjects()));

    }

    function download(context){
      var
        _response = context.response
        , _exportFile = fileModule.load({id:'./budgetvsactualsexport.ftl'})
        , _renderer = renderModule.create()
        , _data = getData(context)
        , _content
        , _file
      ;

      _renderer.templateContent = _exportFile.getContents();

      _renderer.addCustomDataSource({
        format: renderModule.DataSource.OBJECT
        , alias: 'data'
        , data: _data
      });

      // _response.write(_renderer.renderAsString());
      // return;

      _content = encodeModule.convert({
        string: _renderer.renderAsString()
        , inputEncoding: encodeModule.Encoding.UTF_8
        , outputEncoding: encodeModule.Encoding.BASE_64
      });

      _file = fileModule.create({
        name: [
          Math.random().toString(36).substring(2)
          , '-'
          , new Date().getTime()
          , '.xls'
        ].join('')
        , fileType: fileModule.Type.EXCEL
        , contents: _content
        // , encoding: encodeModule.Encoding.UTF_8
      });

      _response.writeFile({file: _file, isInline: true});

    }

    function init(context){
      var
        _response = context.response
        , _data = getData(context)
      ;

      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write(JSON.stringify(_data));
    }

    function render(context){
      var
        _htmlFile = fileModule.load({id:'./budgetvsactuals.html'})
        , _html = _htmlFile.getContents()
        , _form
        , _htmlField
        , _regexStr
        , _script = runtimeModule.getCurrentScript()
        // , _title = 'Project Expense Budget Vs Actuals'
        , _title = _script.getParameter({name: 'custscript_bb_proj_exp_bva_title'})
      ;

      if(typeof _title !== 'string' || _title.trim().length === 0) {
        _title = 'Project Expense Budget Vs Actuals';
      }

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

      _form = serverWidget.createForm({
        title: _title
      });

      _htmlField = _form.addField({
        id: 'custpage_proj_exp_budget_form'
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