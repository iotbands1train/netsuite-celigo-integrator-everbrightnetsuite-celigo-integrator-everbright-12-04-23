/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 * @author Michael Golichenko
 * @overview - Project Expense Budget suitelet form
 */


define(['N/record', 'N/search', 'N/redirect', 'N/ui/serverWidget', 'N/runtime', 'N/url', 'N/render'
    , 'N/file', 'N/format', 'N/task', 'N/encode', '../BB SS/SS Lib/BB_SS_MD_SolarConfig'
    ,'../BB SS/SS Lib/BB.SS.ScheduledScript.BatchProcessing', '../BB SS/SS Lib/moment.min'],
  function(recordModule, searchModule, redirect, serverWidget, runtimeModule, urlModule, renderModule
           , fileModule, formatModule, taskModule, encodeModule, configModule
           , batchProcessingModule, momentModule) {

    const
      _processMap = {
        'init': init
        , 'save': save
        , 'copy': copy
        , 'projects': findProjects
        , 'remove': remove
        , 'download': download
      }
      , _seqCalulateFunc = {
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
      , _sublists = {
        BUDGET_LINE: 'recmachcustrecord_bb_proj_exp_budget'
      , LINE_SEQ: 'recmachcustrecord_bb_proj_exp_budg_line'
      }
      , _url = '/app/common/search/searchresults.nl?rectype=452&searchtype=Custom' +
      '&CUSTRECORD_BB_PATS_PROJECT={projectId}' +
      '&BDZ_Item_PARENT={parentId}' +
      '&CUSTRECORD_BB_PATS_ITEM={itemId}' +
      '&CUSTRECORD_BB_PATS_EXPECTED_PAYMENT_DATErange=CUSTOM' +
      '&CUSTRECORD_BB_PATS_EXPECTED_PAYMENT_DATEfrom={from}' +
      '&CUSTRECORD_BB_PATS_EXPECTED_PAYMENT_DATEto={to}' +
      '&style=NORMAL&CUSTRECORD_BB_PATS_EXPECTED_PAYMENT_DATEmodi=WITHIN&CUSTRECORD_BB_PATS_EXPECTED_PAYMENT_DATE=CUSTOM' +
      '&searchid=1286&dle=T&sortcol=BDZ_Item_PARENT_raw&sortdir=ASC&csv=HTML&OfficeXML=F&size=1000'
    ;

    var
      _seqTypes
      , _firstPaidWeekNumberSegments = {}
      , _startRequest
      , _startTask
    ;

    function logExecutionTime(message, start, end) {
      var diff = end.getTime() - start.getTime();
      var seconds = Math.floor(diff / (1000));
      diff -= seconds * (1000);
      //log.debug(message, seconds + " seconds, " + diff + " milliseconds");
    }

    function buildLink(projectId, parentId, itemId, from, to){
      const
        _projectId = projectId ? projectId : ''
        , _parentId = parentId ? parentId : ''
        , _itemId = itemId ? itemId : ''
        , _from = from ? encodeURIComponent(from) : ''
        , _to = to ? encodeURIComponent(to) : ''
      ;
      return _url
        .replace('{projectId}', _projectId)
        .replace('{parentId}', _parentId)
        .replace('{itemId}', _itemId)
        .replace('{from}', _from)
        .replace('{to}', _to);
    }

    function getSequenceTypes (){
      var _types = [];
      searchModule.create({
        type: 'customlist_bb_proj_exp_budg_seq_type'
        , columns: ['name']
      }).run().each(function(row){
        _types.push({
          seqTypeId: row.id
          , seqTypeName: row.getValue('name')
        });
        return true;
      });
      return _types;
    }

    function getDefaultValues(){
      var
        _seqType = configModule.getConfiguration('custrecord_bb_def_proj_exp_budg_seq_type')
      ;
      if(!_seqTypes){
        _seqTypes = getSequenceTypes();
      }
      if(_seqType) {
        return {
          seqTypeId: _seqType.value
          , seqTypeName: _seqType.text
        }
      }
      return _seqTypes[0];
    }

    function formatAmount(value){
      if(typeof value === 'string'){
        value = value.trim();
        value = value.replace(/\.+$/g, '');
        value = value.replace(',', '');
      }
      return value;
    }

    function getWeek(date) {
      var _fullYear = new Date(date.getFullYear(),0,1);
      return Math.ceil((((date - _fullYear) / 86400000) + _fullYear.getDay()+1)/7);
    }

    function findFirstPaidWeekNumber(seq, projectStartDate, seqName){
      var
        _seqNameLower = typeof seqName === 'string' ? seqName.toLowerCase() : undefined
        , _seqCalcFunc = _seqCalulateFunc[_seqNameLower]
        , _startDate
        , _year
        , _week
        , _segmentName
        , _foundSegment
      ;
      if(typeof _seqCalcFunc === 'function'){
        _startDate = new Date(_seqCalcFunc(projectStartDate, seq - 1));
        if(_startDate instanceof Date) {
          _year = _startDate.getFullYear().toString();
          if(!_firstPaidWeekNumberSegments.hasOwnProperty(_year)) {
            _firstPaidWeekNumberSegments[_year] = [];
            searchModule.create({
              type: 'customrecord_cseg_bb_paid_wk_num'
              , filters: [
                ['name', searchModule.Operator.STARTSWITH, _year]
              ]
              , columns: ['name']
            }).run().each(function(row){
              _firstPaidWeekNumberSegments[_year].push({
                id: row.id
                , name: row.getValue({name: 'name'})
              });
              return true;
            });
          }
          _week = getWeek(_startDate);
          _segmentName = [_year, _week].join('-');
          _foundSegment = _firstPaidWeekNumberSegments[_year].filter(function(s){
            return s.name == _segmentName;
          })[0];
          if(_foundSegment) {
            return _foundSegment.id;
          }
        }
      }
      return undefined;
    }

    // function createProjExpBudgetSeq(itemId, seq) {
    //   var
    //     _projExpBudgetSeqRecord
    //   ;
    //   _projExpBudgetSeqRecord = recordModule.create({
    //     type: 'customrecord_bb_proj_exp_budg_line_seq'
    //   });
    //   _projExpBudgetSeqRecord.setValue({fieldId: 'custrecord_bb_proj_exp_budg_line', value: itemId});
    //   _projExpBudgetSeqRecord.setValue({fieldId: 'custrecord_bb_proj_exp_budg_line_seq', value: seq.seq});
    //   _projExpBudgetSeqRecord.setValue({fieldId: 'custrecord_bb_proj_exp_budg_line_seq_amt', value: seq.amount});
    //   if(seq.firstPaidWeekNumber) {
    //     _projExpBudgetSeqRecord.setValue({fieldId: 'cseg_bb_paid_wk_num', value: seq.firstPaidWeekNumber});
    //   }
    //   if(seq.projectId){
    //     _projExpBudgetSeqRecord.setValue({fieldId: 'custrecord_bb_exp_budg_line_seq_proj', value: seq.projectId});
    //   }
    //   seq.id = _projExpBudgetSeqRecord.save();
    // }
    //
    // function createProjExpBudgetLine(projExpBudgetId, item){
    //   var
    //     _projExpBudgetLineRecord
    //   ;
    //   _projExpBudgetLineRecord = recordModule.create({
    //     type: 'customrecord_bb_proj_exp_budg_line'
    //   });
    //   _projExpBudgetLineRecord.setValue({fieldId: 'custrecord_bb_proj_exp_budget', value: projExpBudgetId});
    //   _projExpBudgetLineRecord.setValue({fieldId: 'custrecord_bb_proj_exp_budget_item', value: item.itemId});
    //   if(item.amount){
    //     _projExpBudgetLineRecord.setValue({fieldId: 'custrecord_bb_proj_exp_budget_amount', value: item.amount});
    //   }
    //   _projExpBudgetLineRecord.setValue({fieldId: 'custrecord_bb_proj_exp_budget_desc', value: item.desc});
    //   item.id = _projExpBudgetLineRecord.save();
    //   item.seqData.forEach(function(seq){
    //     createProjExpBudgetSeq(item.id, seq);
    //   });
    // }

    function searchProjectSalesOrder(projectId) {
      var
        _so = null
        , _salesorderSearchObj
      ;
      if (projectId) {
        _salesorderSearchObj = searchModule.create({
          type: "salesorder",
          filters:
            [
              ["type","anyof","SalesOrd"],
              "AND",
              ["mainline","is","T"],
              "AND",
              ["custbody_bb_project","anyof", projectId]
            ],
          columns:
            [
              "internalid"
              , 'name'
            ]
        });
        _salesorderSearchObj.run().each(function(result){
          _so = {
            id: result.getValue({name: 'internalid'})
            , name: result.getText({name: 'name'})
          };
          return true;
        });
      }
      return _so;
    }

    function getSearchConfig() {
      // refactor get config from deployment
      var
        _script = runtimeModule.getCurrentScript()
        , _searchId = _script.getParameter({name: 'custscript_bb_proj_exp_budget_item_srch'})
        , _search = searchModule.load({
          id: _searchId
        })
        , _config = {}
      ;

      _config.search = _search;
      _config.columns = {}
      _search.columns.forEach(function (column) {
        if(typeof column.label === 'string' && column.label.trim().length > 0) {
          _config.columns[column.label.trim().toLowerCase()] = column;
        }
      });

      return _config;
    }

    function getExpenseItems(){
      var
        _config = getSearchConfig()
        , _itemLines = []
        , _item
        , _sections
      ;
      //log.debug('columns', _config.columns);
      _config.search.run().each(function(result) {
        _item = {};
        _item.itemId = result.getValue(_config.columns.itemid);
        if(_config.columns.title) {
          _item.title = result.getText(_config.columns.title) || result.getValue(_config.columns.title);
          //log.debug('columns.title', _item.title);
        }
        if(typeof _item.title !== 'string' || _item.title.trim().length === 0) {
          _item.title = result.getText(_config.columns.itemid) || result.getValue(_config.columns.itemid);
          //log.debug('columns.itemid', _item.title);
        }
        _item.parentId = result.getValue(_config.columns.section);
        if(_config.columns.sectiontitle) {
          _item.parentText = result.getValue(_config.columns.sectiontitle.trim());
        }
        if(typeof _item.parentText !== 'string' || _item.parentText.trim().length === 0) {
          _item.parentText = result.getText(_config.columns.section) || result.getValue(_config.columns.section);
        }
        if(typeof _item.parentText !== 'string' || _item.parentText.trim().length === 0) {
          _item.parentText = _item.parentId;
        }
        _item.sequenceNum = result.getValue(_config.columns.sequence);
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

    function getProjectExpenseVersions(projectId){
      var
        _projectExpenseSearch
        , _result = {
          versions: []
        }
        , _defaultReadonly = configModule.getConfiguration('custrecord_bb_uses_proj_actn_tran_schdl').value
        , _projectReadonlyLookup = searchModule.lookupFields({
            type: searchModule.Type.JOB,
            id: projectId,
            columns: ['custentity_bb_uses_proj_actn_tran_schdl']
          })
        , _projectReadonly = _projectReadonlyLookup.custentity_bb_uses_proj_actn_tran_schdl instanceof Array
        && _projectReadonlyLookup.custentity_bb_uses_proj_actn_tran_schdl[0]
        ? _projectReadonlyLookup.custentity_bb_uses_proj_actn_tran_schdl[0].text
        : undefined
      ;

      if(typeof _defaultReadonly === 'string') {
        _defaultReadonly = /t/i.test(_defaultReadonly);
      }

      if(typeof _projectReadonly === 'string') {
        _defaultReadonly = /yes/i.test(_projectReadonly);
      }

      _projectExpenseSearch = searchModule.create({
        type: 'customrecord_bb_proj_exp_budget'
        , filters: [
          ['custrecord_bb_proj_exp_budget_project', 'anyof', projectId]
          , 'AND'
          , ['isinactive', 'is', 'F']
        ]
        , columns: [
          'custrecord_bb_proj_exp_budget_version'
          // , 'custrecord_bb_proj_exp_budget_readonly'
        ]
      });

      _projectExpenseSearch.run().each(function(result){
        _result.versions.push({
          id: result.id
          , name: result.getValue({name: 'custrecord_bb_proj_exp_budget_version'})
          // , forceReadonly: result.getValue({name: 'custrecord_bb_proj_exp_budget_readonly'})
        });
        return true;
      });

      if(_result.versions.length > 1){
        _result.versions.sort(function(a,b) { return b.id - a.id});
        _result.versions.unshift(_result.versions.splice(_result.versions.length - 1, 1)[0]);
      }
      _result.count = _result.versions.length;
      _result.baseLineIsSet = _result.count > 0 && /baseline/i.test(_result.versions[_result.versions.length - 1].name);
      _result.versions.forEach(function(v, idx) {
        v.readonly = idx > 0;
      });
      _result.currentVersion = _result.versions.filter(function(v){ return !v.readonly; })[0];
      //_result.readonly = _result.currentVersion ? _result.currentVersion.forceReadonly : _defaultReadonly;
      _result.readonly = _defaultReadonly;
      _result.activePeId = _result.currentVersion ? _result.currentVersion.id : undefined;
      _result.canAddVersion = _result.count > 0 && _result.baseLineIsSet;
      if(_defaultReadonly) {
        _result.versions.forEach(function(v) {
          v.readonly = true;
        });
      }
      return _result;
    }

    function getProjectExpense(projectId, peId){
      var
        _getDefaultTypes = getDefaultValues()
        , _dates = getProjectDates(projectId)
        , _result = {
          seqName: _getDefaultTypes ? _getDefaultTypes.seqTypeName : ''
          , seqCount: 0
          , projectDates: _dates
          , maxSeqCount: getDatesSequenceCount(_getDefaultTypes.seqTypeName, _dates.start, _dates.end)
          , items: []
        }
        , _projectExpenseSearch
        , _pagedResult
        , _projExpBudgetLines = []
        , _filters = peId
        ? [['custrecord_bb_proj_exp_budget', 'anyof', peId]]
        : [["custrecord_bb_proj_exp_budg_line_proj","anyof", projectId]]
      ;
      _filters.push('AND');
      _filters.push(['custrecord_bb_proj_exp_budget.isinactive', 'is', 'F']);
      _projectExpenseSearch = searchModule.create({
        type: "customrecord_bb_proj_exp_budg_line",
        filters: _filters,
        columns:
          [
            "custrecord_bb_proj_exp_budget",
            searchModule.createColumn({ name: "custrecord_bb_proj_exp_budget_seq", join: "CUSTRECORD_BB_PROJ_EXP_BUDGET" }),
            searchModule.createColumn({ name: "custrecord_bb_proj_exp_budget_seq_count", join: "CUSTRECORD_BB_PROJ_EXP_BUDGET" }),
            "internalid",
            "custrecord_bb_proj_exp_budget_item",
            "custrecord_bb_proj_exp_budget_amount",
            "custrecord_bb_proj_exp_budget_desc",
            searchModule.createColumn({ name: "internalid", join: "CUSTRECORD_BB_PROJ_EXP_BUDG_LINE" }),
            searchModule.createColumn({ name: "custrecord_bb_proj_exp_budg_line_seq", join: "CUSTRECORD_BB_PROJ_EXP_BUDG_LINE" }),
            searchModule.createColumn({ name: "custrecord_bb_proj_exp_budg_line_seq_amt", join: "CUSTRECORD_BB_PROJ_EXP_BUDG_LINE" })
          ]
      });
      _pagedResult = _projectExpenseSearch.runPaged({pageSize: 1000});
      _pagedResult.pageRanges.forEach(function(pageRange){
        _pagedResult.fetch(pageRange).data.forEach(function(result){
          _projExpBudgetLines.push({
            id: result.getValue({name: 'custrecord_bb_proj_exp_budget'})
            , seqName: result.getText({name: 'custrecord_bb_proj_exp_budget_seq', join: 'CUSTRECORD_BB_PROJ_EXP_BUDGET'})
            , seqCount: result.getValue({ name: "custrecord_bb_proj_exp_budget_seq_count", join: "CUSTRECORD_BB_PROJ_EXP_BUDGET" })
            , lineId: result.getValue({name: 'internalid'})
            , lineItem: result.getValue({name: 'custrecord_bb_proj_exp_budget_item'})
            , lineAmount: result.getValue({name: 'custrecord_bb_proj_exp_budget_amount'})
            , lineDesc: result.getValue({name: 'custrecord_bb_proj_exp_budget_desc'})
            , seqId: result.getValue({ name: "internalid", join: "CUSTRECORD_BB_PROJ_EXP_BUDG_LINE" })
            , seqNumber: result.getValue({ name: "custrecord_bb_proj_exp_budg_line_seq", join: "CUSTRECORD_BB_PROJ_EXP_BUDG_LINE" })
            , seqAmount: result.getValue({ name: "custrecord_bb_proj_exp_budg_line_seq_amt", join: "CUSTRECORD_BB_PROJ_EXP_BUDG_LINE" })
          });
        });
      });
      // _projectExpenseSearch.run().each(function(result){
      //   _projExpBudgetLines.push({
      //     id: result.getValue({name: 'custrecord_bb_proj_exp_budget'})
      //     , seqName: result.getText({name: 'custrecord_bb_proj_exp_budget_seq', join: 'CUSTRECORD_BB_PROJ_EXP_BUDGET'})
      //     , seqCount: result.getValue({ name: "custrecord_bb_proj_exp_budget_seq_count", join: "CUSTRECORD_BB_PROJ_EXP_BUDGET" })
      //     , lineId: result.getValue({name: 'internalid'})
      //     , lineItem: result.getValue({name: 'custrecord_bb_proj_exp_budget_item'})
      //     , lineAmount: result.getValue({name: 'custrecord_bb_proj_exp_budget_amount'})
      //     , lineDesc: result.getValue({name: 'custrecord_bb_proj_exp_budget_desc'})
      //     , seqId: result.getValue({ name: "internalid", join: "CUSTRECORD_BB_PROJ_EXP_BUDG_LINE" })
      //     , seqNumber: result.getValue({ name: "custrecord_bb_proj_exp_budg_line_seq", join: "CUSTRECORD_BB_PROJ_EXP_BUDG_LINE" })
      //     , seqAmount: result.getValue({ name: "custrecord_bb_proj_exp_budg_line_seq_amt", join: "CUSTRECORD_BB_PROJ_EXP_BUDG_LINE" })
      //   });
      //   return true;
      // });

      if(_projExpBudgetLines.length){
        _result.id = _projExpBudgetLines[0].id;
        _result.seqName = _projExpBudgetLines[0].seqName;
        _result.seqCount = isNaN(parseInt(_projExpBudgetLines[0].seqCount))
          ? getDatesSequenceCount(_result.seqName, _dates.start, _dates.end)
          : parseInt(_projExpBudgetLines[0].seqCount);
        _result.items = _projExpBudgetLines.reduce(function(arr, line){
          if(!arr.filter(function(s){ return s.id == line.lineId; })[0]){
            arr.push({
              id: line.lineId
              , itemId: line.lineItem
              , desc: line.lineDesc
              , amount: line.lineAmount || ''
              , seqData: _projExpBudgetLines.filter(function(f){
                return f.lineId == line.lineId;
              }).map(function(m){
                return {
                  id: m.seqId
                  , seq: m.seqNumber
                  , amount: m.seqAmount || ''
                };
              })
            });
          }
          return arr;
        }, []);
      } else {
        _result.seqCount = getDatesSequenceCount(_getDefaultTypes.seqTypeName, _dates.start, _dates.end);
      }

      return _result;
    }

    function getProjectDates(projectId){
      var
        _dates = {
          start: null
          , end: null
        }
        , _lookupFields
      ;
        if(projectId){
          _lookupFields = searchModule.lookupFields({
            type: searchModule.Type.JOB
            , id: projectId
            , columns: [
              'custentity_bb_project_start_date'
              , 'projectedenddate'
            ]
          });
          if(_lookupFields.custentity_bb_project_start_date){
            _dates.start = _lookupFields.custentity_bb_project_start_date instanceof Date
              ? _lookupFields.custentity_bb_project_start_date
              : formatModule.parse({value: _lookupFields.custentity_bb_project_start_date, type: formatModule.Type.DATE});
          }
          if(_lookupFields.projectedenddate) {
            _dates.end = _lookupFields.projectedenddate instanceof Date
              ? _lookupFields.projectedenddate
              : formatModule.parse({value: _lookupFields.projectedenddate, type: formatModule.Type.DATE});
          }
        }
        return _dates;
    }

    function getDatesSequenceCount(seqType, startDate, endDate){
      const _seqCalulateFunc = {
        'week': function(start, end) {
          return parseInt(Math.floor((end - start)/(1000*60*60*24*7))) + 1;
        }
        , 'month': function(start, end) {
          return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
        }
      };

      var
        _seqCount = 0
        //, _startDate
        , _seqFunc
      ;

      if(seqType && startDate instanceof Date && endDate instanceof Date
        && _seqCalulateFunc.hasOwnProperty(seqType.toLowerCase())) {
        _seqFunc = _seqCalulateFunc[seqType.toLowerCase()];
        _seqCount = _seqFunc(startDate, endDate);
      }

      return _seqCount;
    }

    function getData(context){
      var
        _projectId = context.request.parameters.project
        , _peId = context.request.parameters.peid
        , _version
        , _result
        , _project
        , _item
        , _seq
      ;


      _startTask = new Date();
      _version = getProjectExpenseVersions(_projectId);
      logExecutionTime('getProjectExpenseVersions process', _startTask, new Date());
      _startTask = new Date();
      _result = getProjectExpense(_projectId, _peId ? _peId : _version.activePeId);
      logExecutionTime('getProjectExpense process', _startTask, new Date());
      _startTask = new Date();
      _project = _projectId
        ? searchModule.lookupFields({
          type: searchModule.Type.JOB
          , id: _projectId
          , columns: [
            'entityid'
          ]
        })
        : null;
      logExecutionTime('load project process', _startTask, new Date());

      if(!_result.id && _version.activePeId){
        _result.id = _version.activePeId;
      }

      _result.projectId = _projectId;
      _result.version = _version;
      if(_project){
        _result.project = {
          id: _result.projectId
          , name: _project.entityid
          , url: urlModule.resolveRecord({recordType: 'job', recordId: _result.projectId})
          //, data: _project
        }
      }
      _startTask = new Date();
      _result.salesOrder = searchProjectSalesOrder(_projectId);
      logExecutionTime('searchProjectSalesOrder process', _startTask, new Date());
      if(_result.salesOrder){
        _result.salesOrderId = _result.salesOrder.id;
        _result.salesOrder.url = urlModule.resolveRecord({recordType: 'salesorder', recordId: _result.salesOrder.id});
      }
      _startTask = new Date();
      _result.sections = getExpenseItems();
      logExecutionTime('getExpenseItems process', _startTask, new Date());
      _startTask = new Date();
      _result.sections.forEach(function(section){
        section.collapsed = false;
        //section.url = buildLink(_projectId, section.itemId);
        section.items.forEach(function(item){
          _item = _result.items.filter(function(f){ return f.itemId == item.itemId; })[0];
          item.title = item.title.split(':').pop().trim();
          item.seqData = [];
          item.amount = '';
          //item.url = buildLink(_projectId, item.parentId, item.itemId);
          if(_item){
            item.id = _item.id;
            item.amount = _item.amount;
            item.desc = _item.desc;
          }
          for(var n = 1; n <= _result.seqCount; n++){
            _seq = {
              seq: n
              , amount: ''
            };
            if(_item && _item.seqData instanceof Array){
              _seq = _item.seqData.filter(function(f) { return f.seq == n })[0];
              if(!_seq){
                _seq = {
                  seq: n
                  , amount: ''
                }
              }
              if(_seq && !_seq.amount){
                _seq.amount = '';
              }
            }
            item.seqData.push(_seq);
          }
        })
      });
      logExecutionTime('sections build process', _startTask, new Date());
      delete _result.items;

      return _result;
    }

    function init(context){
      var
        _response = context.response
        , _result = getData(context)
      ;
      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write(JSON.stringify(_result));
    }

    function setProjExpBudgetLine(rec, item, lineNum){
      var
        _projId = rec.getValue({fieldId: 'custrecord_bb_proj_exp_budget_project'})
        , _version = [rec.id, rec.getValue({fieldId: 'custrecord_bb_proj_exp_budget_version'})].join('-')
      ;
      if(typeof lineNum !== 'undefined') {
        if(lineNum == -1) return;
        rec.selectLine({
          sublistId: _sublists.BUDGET_LINE,
          line: lineNum
        });
      } else {
        rec.selectNewLine({ sublistId: _sublists.BUDGET_LINE });
      }
      rec.setCurrentSublistValue({ sublistId: _sublists.BUDGET_LINE, fieldId: 'custrecord_bb_proj_exp_budg_line_version', value: _version});
      rec.setCurrentSublistValue({ sublistId: _sublists.BUDGET_LINE, fieldId: 'custrecord_bb_proj_exp_budget_item', value: item.itemId});
      rec.setCurrentSublistValue({ sublistId: _sublists.BUDGET_LINE, fieldId: 'custrecord_bb_proj_exp_budget_desc', value: item.desc});
      if(_projId){
        rec.setCurrentSublistValue({ sublistId: _sublists.BUDGET_LINE, fieldId: 'custrecord_bb_proj_exp_budg_line_proj', value: _projId});
      }
      if(item.amount) {
        rec.setCurrentSublistValue({ sublistId: _sublists.BUDGET_LINE, fieldId: 'custrecord_bb_proj_exp_budget_amount', value: item.amount });
      }
      rec.commitLine({ sublistId: _sublists.BUDGET_LINE });
    }

    function setProjExpBudgetSeq(rec, seq, lineNum) {
      var
        _projId = rec.getValue({fieldId: 'custrecord_bb_proj_exp_budg_line_proj'})
        , _version = rec.getValue({fieldId: 'custrecord_bb_proj_exp_budg_line_version'})
      ;
      if(typeof lineNum !== 'undefined') {
        if(lineNum == -1) return;
        rec.selectLine({
          sublistId: _sublists.LINE_SEQ,
          line: lineNum
        });
      } else {
        rec.selectNewLine({ sublistId: _sublists.LINE_SEQ });
      }
      rec.setCurrentSublistValue({ sublistId: _sublists.LINE_SEQ, fieldId: 'custrecord_bb_exp_budg_line_seq_version', value: _version});
      rec.setCurrentSublistValue({ sublistId: _sublists.LINE_SEQ, fieldId: 'custrecord_bb_proj_exp_budg_line_seq', value: seq.seq});
      rec.setCurrentSublistValue({ sublistId: _sublists.LINE_SEQ, fieldId: 'custrecord_bb_proj_exp_budg_line_seq_amt', value: seq.amount});
      if(_projId){
        rec.setCurrentSublistValue({ sublistId: _sublists.LINE_SEQ, fieldId: 'custrecord_bb_exp_budg_line_seq_proj', value: _projId});
      }
      if(seq.firstPaidWeekNumber) {
        rec.setCurrentSublistValue({ sublistId: _sublists.LINE_SEQ, fieldId: 'cseg_bb_paid_wk_num', value: seq.firstPaidWeekNumber});
      }
      if(seq.projectId){
        rec.setCurrentSublistValue({ sublistId: _sublists.LINE_SEQ, fieldId: 'custrecord_bb_exp_budg_line_seq_proj', value: seq.projectId});
      }
      rec.commitLine({ sublistId: _sublists.LINE_SEQ });
    }

    function download(context){
      var
        _response = context.response
        , _exportFile = fileModule.load({id:'./budgetexport.ftl'})
        , _renderer = renderModule.create()
        , _data = getData(context)
        , _content
        , _file
      ;

      _data.seqNames = [];

      for(var n = 1; n <= _data.seqCount; n++){
        var
          _dates = {
            start: null
            , end: null
          }
          , _seqFunc
          , _seqTypeFormat = {
          'week': function(dates){
            return [
              formatModule.format({value: dates.start, type: formatModule.Type.DATE})
              , formatModule.format({value: dates.end, type: formatModule.Type.DATE})
            ].join(' - '); }
          , 'month': function(dates) { return momentModule(dates.start).format('MMM YYYY'); }
        }
        if(_data.seqName
          && _data.projectDates && _data.projectDates.start instanceof Date
          && _seqTypeFormat.hasOwnProperty(_data.seqName.toLowerCase())) {
          _seqFunc = _seqCalulateFunc[_data.seqName.toLowerCase()];
          _dates.start = new Date(_seqFunc(new Date(_data.projectDates.start), n - 1));
          if(_dates.start < _data.projectDates.start) {
            _dates.start = new Date(_data.projectDates.start);
          }
          _dates.start.setHours(0,0,0,0);
          _dates.end = new Date(_seqFunc(new Date(_data.projectDates.start), n));
          _dates.end.setDate(_dates.end.getDate()-1);
          if(_data.projectDates.end instanceof Date && _dates.end > _data.projectDates.end) {
            _dates.end = _data.projectDates.end;
          }
          _dates.end.setHours(23, 59, 59, 999);

          _data.seqNames.push(_seqTypeFormat[_data.seqName.toLowerCase()](_dates));
        }
      }

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

    function copy(context){

      const
        _request = context.request
        , _response = context.response
        , _getDefaultTypes = getDefaultValues()
        , _body = JSON.parse(_request.body)
        , _status = {}
        , _processLines = []
        //, _removeLine = []
        , _script = runtimeModule.getCurrentScript()
      ;

      var
        _versionNameIsSet = false
        , _copyId = undefined
        , _dates
      ;

      if(_body){
        _versionNameIsSet = typeof _body.versionName === 'string' && _body.versionName.trim().length > 0;
        if(_versionNameIsSet && _body.id){
          _dates = getProjectDates(_body.projectId)
          _body.items = [];
          _body.sections.forEach(function(section){
            section.items.forEach(function(item){
              item.seqData = item.seqData.filter(function(seq){
                seq.amount = formatAmount(seq.amount);
                if(seq.id && (!seq.amount || seq.remove)){
                  _removeSeq.push({id: seq.id, lineId: item.id});
                }
                return !isNaN(parseFloat(seq.amount)) && parseFloat(seq.amount) > 0;
              });
            });
            section.items = section.items.filter(function(item){
              item.amount = formatAmount(item.amount);
              if(item.id && !item.amount && !item.seqData.length){
                //_removeLine.push(item.id);
                _processLines.push({
                  id: item.id
                  , itemId: item.itemId
                  , delete: true
                });
              }
              return (!isNaN(parseFloat(item.amount)) && parseFloat(item.amount) > 0) || item.seqData.length > 0;
            });
            _body.items = _body.items.concat(section.items);
          });

          _body.items.forEach(function(item){
            item.seqData.forEach(function(seq){
              seq.firstPaidWeekNumber = findFirstPaidWeekNumber(seq.seq, new Date(_dates.start.getTime()), _getDefaultTypes.seqTypeName);
              seq.projectId = _body.projectId;
            })
          })
          log.debug('Governance before copy', _script.getRemainingUsage());
          _copyId = recordModule.copy({
            type: 'customrecord_bb_proj_exp_budget'
            , id: _body.id
            , isDynamic: true
          });
          _copyId.setValue({fieldId: 'custrecord_bb_proj_exp_budget_version', value: _body.versionName.trim()});
          _body.items.forEach(function(item){
            setProjExpBudgetLine(_copyId, item);
            _processLines.push({
              id: item.id
              , itemId: item.itemId
              , amount: item.amount
              , description: item.desc
            });
          });
          _copyId = _copyId.save();

          searchModule.create({
            type: 'customrecord_bb_proj_exp_budg_line'
            , filters: ['custrecord_bb_proj_exp_budget', 'anyof', [_copyId]]
            , columns: ['custrecord_bb_proj_exp_budget_item']
          }).run().each(function(row){
            var
              _itemId = row.getValue({name: 'custrecord_bb_proj_exp_budget_item'})
              , _foundItem = _body.items.filter(function(item){
                return item.itemId == _itemId;
              })[0];
            if(_foundItem) {
              _foundItem.id = row.id;
            }
            return true;
          });

          _body.items.forEach(function(item){
            if(item.id) {
              var _itemRec = recordModule.load({
                type: 'customrecord_bb_proj_exp_budg_line'
                , id: item.id
                , isDynamic: true
              });
              item.seqData.forEach(function(seq){
                setProjExpBudgetSeq(_itemRec, seq);
              });
              _itemRec.save();
            }
          });
          log.debug('Governance after copy', _script.getRemainingUsage());

          _processLines.forEach(function(line){
            if(isNaN(parseFloat(line.amount))){
              line.delete = true;
            }
          });
          if (_processLines.length > 0) {
            batchProcessingModule.addToQueue(
              'customscript_bb_ss_proj_exp_budg_process'
              , 'customdeploy_bb_ss_proj_exp_budg_proc'
              , {
                custscript_bb_proj_exp_budg_obj: {
                  projectId: _body.projectId
                  , items: _processLines
                }
              }
              , taskModule.TaskType.SCHEDULED_SCRIPT
            );
          }

          _status.status = 'success';
        } else {
          _status.status = 'error';
        }

        _status.redirect = urlModule.resolveRecord({recordType: 'job', recordId: _body.projectId})
        _status.id = _body.id;
      }

      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write(JSON.stringify(_status));
    }

    function save(context){

      const
        _request = context.request
        , _response = context.response
        , _body = JSON.parse(_request.body)
        , _getDefaultTypes = getDefaultValues()
        , _status = {}
        , _removeSeq = []
        , _removeLine = []
        , _processLines = []
        , _values = {}
        , _script = runtimeModule.getCurrentScript()
        //, _defaultReadonly = configModule.getConfiguration('custrecord_bb_uses_proj_actn_tran_schdl').value
      ;

      var
        _projExpBudgetRecord
        // , _projectVersions
        , _versionNameIsSet = false
        , _copyId = undefined
        , _dates
      ;

      if(_body){
        _dates = getProjectDates(_body.projectId)
        _body.items = [];
        _body.sections.forEach(function(section){
          section.items.forEach(function(item){
            item.seqData = item.seqData.filter(function(seq){
              seq.amount = formatAmount(seq.amount);
              if(seq.id && (!seq.amount || seq.remove)){
                _removeSeq.push({id: seq.id, lineId: item.id});
              }
              return !isNaN(parseFloat(seq.amount)) && (parseFloat(seq.amount) > 0 || parseFloat(seq.amount) < 0);
            });
          });
          section.items = section.items.filter(function(item){
            item.amount = formatAmount(item.amount);
            if(item.id && !item.amount && !item.seqData.length){
              _removeLine.push(item.id);
              _processLines.push({
                id: item.id
                , itemId: item.itemId
                , delete: true
              });
            }
            return (!isNaN(parseFloat(item.amount)) && (parseFloat(item.amount) > 0 || parseFloat(item.amount) < 0)) || item.seqData.length > 0;
          });
          _body.items = _body.items.concat(section.items);
        });

        _body.items.forEach(function(item){
          item.seqData.forEach(function(seq){
            seq.firstPaidWeekNumber = findFirstPaidWeekNumber(seq.seq, new Date(_dates.start.getTime()), _getDefaultTypes.seqTypeName);
            seq.projectId = _body.projectId;
          })
        })

        // _projectVersions = getProjectExpenseVersions(_body.projectId);

        delete _body.sections;
        delete _body.project;
        delete _body.salesOrder;

        _versionNameIsSet = typeof _body.versionName === 'string' && _body.versionName.trim().length > 0;

        if(_versionNameIsSet) {
          _values['custrecord_bb_proj_exp_budget_version'] = 'Current';
        }

        if(_body.id){
          _values['custrecord_bb_proj_exp_budget_seq_count'] = _body.seqCount;


          _removeLine.forEach(function(lineId){
            var _relatedSeqToRemove = _removeSeq.filter(function(seq){
              return seq.lineId == lineId;
            });
            if(_relatedSeqToRemove.length > 0) {
              var _itemRec = recordModule.load({
                type: 'customrecord_bb_proj_exp_budg_line'
                , id: lineId
                , isDynamic: true
              });

              _relatedSeqToRemove
                .map(function(seq) {
                  return seq.id;
                })
                .forEach(function(id) {
                  var _lineNumber = _itemRec.findSublistLineWithValue({
                    sublistId: _sublists.LINE_SEQ,
                    fieldId: 'id',
                    value: id
                  });
                  if(_lineNumber > -1) {
                    _itemRec.removeLine({
                      sublistId: _sublists.LINE_SEQ
                      , line: _lineNumber
                      , ignoreRecalc: true
                    });
                  }
                });
              _itemRec.save();
            }
          });

          _projExpBudgetRecord = recordModule.load({
            type: 'customrecord_bb_proj_exp_budget'
            , id: _body.id
            , isDynamic: true
          });
          for(var key in _values) {
            if(_values.hasOwnProperty(key)){
              _projExpBudgetRecord.setValue({fieldId: key, value: _values[key]});
            }
          }

          _removeLine.forEach(function(id) {
            var _lineNumber = _projExpBudgetRecord.findSublistLineWithValue({
              sublistId: _sublists.BUDGET_LINE,
              fieldId: 'id',
              value: id
            });
            if(_lineNumber > -1) {
              _projExpBudgetRecord.removeLine({
                sublistId: _sublists.BUDGET_LINE
                , line: _lineNumber
                , ignoreRecalc: true
              });
            }
          });

          _body.items.forEach(function(item){
            if(item.id){
              var _lineNumber = _projExpBudgetRecord.findSublistLineWithValue({
                sublistId: _sublists.BUDGET_LINE,
                fieldId: 'id',
                value: item.id
              });
              if(_lineNumber > -1) {
                setProjExpBudgetLine(_projExpBudgetRecord, item, _lineNumber);
              }
            } else {
              setProjExpBudgetLine(_projExpBudgetRecord, item);
            }
            _processLines.push({
              id: item.id
              , itemId: item.itemId
              , amount: item.amount
              , description: item.desc
            });
          });

          _projExpBudgetRecord.save();

          searchModule.create({
            type: 'customrecord_bb_proj_exp_budg_line'
            , filters: ['custrecord_bb_proj_exp_budget', 'anyof', [_body.id]]
            , columns: ['custrecord_bb_proj_exp_budget_item']
          }).run().each(function(row){
            var
              _itemId = row.getValue({name: 'custrecord_bb_proj_exp_budget_item'})
              , _foundItem = _body.items.filter(function(item){
                return item.itemId == _itemId;
              })[0]
              , _foundProcessLines = _processLines.filter(function(item) {
                return item.itemId == _itemId;
              })[0]
            ;
            if(_foundItem && !_foundItem.id) {
              _foundItem.id = row.id;
            }
            if(_foundProcessLines && !_foundProcessLines.id) {
              _foundProcessLines.id = row.id;
            }
            return true;
          });

          _body.items.forEach(function(item){
            if(item.id) {
              var _itemRec = recordModule.load({
                type: 'customrecord_bb_proj_exp_budg_line'
                , id: item.id
                , isDynamic: true
              });
              item.seqData.forEach(function(seq){
                if(seq.id){
                  var _lineNumber = _itemRec.findSublistLineWithValue({
                    sublistId: _sublists.LINE_SEQ,
                    fieldId: 'id',
                    value: seq.id
                  });
                  if(_lineNumber > -1) {
                    setProjExpBudgetSeq(_itemRec, seq, _lineNumber);
                  }
                } else {
                  setProjExpBudgetSeq(_itemRec, seq);
                }
              });
              _removeSeq.filter(function(seq){
                return seq.lineId == item.id;
              })
                .map(function(seq) {
                  return seq.id;
                })
                .forEach(function(id) {
                  var _lineNumber = _itemRec.findSublistLineWithValue({
                    sublistId: _sublists.LINE_SEQ,
                    fieldId: 'id',
                    value: id
                  });
                if(_lineNumber > -1) {
                  _itemRec.removeLine({
                    sublistId: _sublists.LINE_SEQ
                    , line: _lineNumber
                    , ignoreRecalc: true
                  });
                }
              });
              _itemRec.save();
            }
          });

          // _removeSeq.forEach(function(id){
          //   recordModule.delete({
          //     type: 'customrecord_bb_proj_exp_budg_line_seq'
          //     , id: id
          //   });
          // });
          // _removeLine.forEach(function(id){
          //   recordModule.delete({
          //     type: 'customrecord_bb_proj_exp_budg_line'
          //     , id: id
          //   });
          // });

        } else {
          // if(!_copyId) {
            _projExpBudgetRecord = recordModule.create({
              type: 'customrecord_bb_proj_exp_budget'
              , isDynamic: true
            });
            _projExpBudgetRecord.setValue({fieldId: 'custrecord_bb_proj_exp_budget_seq_count', value: _body.seqCount});
            _projExpBudgetRecord.setValue({fieldId: 'custrecord_bb_proj_exp_budget_project', value: _body.projectId});
            // _projExpBudgetRecord.setValue({fieldId: 'custrecord_bb_proj_exp_budget_readonly', value: _defaultReadonly});
            if(_versionNameIsSet){
              // _projExpBudgetRecord.setValue({fieldId: 'custrecord_bb_proj_exp_budget_version', value: _body.versionName.trim()});
              _projExpBudgetRecord.setValue({fieldId: 'custrecord_bb_proj_exp_budget_version', value: 'Current'});
            }
            if(_getDefaultTypes && _getDefaultTypes.seqTypeId){
              _projExpBudgetRecord.setValue({fieldId: 'custrecord_bb_proj_exp_budget_seq', value: _getDefaultTypes.seqTypeId});
            }

            _body.items.forEach(function(item){
              setProjExpBudgetLine(_projExpBudgetRecord, item);
            });

            _body.id = _projExpBudgetRecord.save();

            searchModule.create({
              type: 'customrecord_bb_proj_exp_budg_line'
              , filters: ['custrecord_bb_proj_exp_budget', 'anyof', [_body.id]]
              , columns: ['custrecord_bb_proj_exp_budget_item']
            }).run().each(function(row){
              var
                _itemId = row.getValue({name: 'custrecord_bb_proj_exp_budget_item'})
                , _foundItem = _body.items.filter(function(item){
                  return item.itemId == _itemId;
                })[0];
              if(_foundItem) {
                _foundItem.id = row.id;
              }
              return true;
            });

            _body.items.forEach(function(item){
              if(item.id) {
                var _itemRec = recordModule.load({
                  type: 'customrecord_bb_proj_exp_budg_line'
                  , id: item.id
                  , isDynamic: true
                });
                item.seqData.forEach(function(seq){
                  setProjExpBudgetSeq(_itemRec, seq);
                });
                _itemRec.save();
              }
            });

        }

        if(_versionNameIsSet){
          log.debug('Governance before copy', _script.getRemainingUsage());
          _status.copy = true;
          log.debug('Governance after copy', _script.getRemainingUsage());
        }

        if(_body.updateEndDate){
          _body.updateEndDate = new Date(_body.updateEndDate);
          if(_body.updateEndDate instanceof Date && !/invalid/i.test(_body.updateEndDate.toString())) {
            //_body.updateEndDate = formatModule.format({value: _body.updateEndDate, type: formatModule.Type.DATE});
            recordModule.submitFields({
              type: 'job'
              , id: _body.projectId
              , values: {
                'projectedenddate': _body.updateEndDate
              }
              , options: {
                ignoreMandatoryFields: true
                , enablesourcing: false
              }
            });
          }
        }

        _processLines.forEach(function(line){
          if(isNaN(parseFloat(line.amount))){
            line.delete = true;
          }
        });
        if (_processLines.length > 0) {
          batchProcessingModule.addToQueue(
            'customscript_bb_ss_proj_exp_budg_process'
            , 'customdeploy_bb_ss_proj_exp_budg_proc'
            , {
              custscript_bb_proj_exp_budg_obj: {
                projectId: _body.projectId
                , items: _processLines
              }
            }
            , taskModule.TaskType.SCHEDULED_SCRIPT
          );
        }

        _status.status = 'success';
        _status.redirect = urlModule.resolveRecord({recordType: 'job', recordId: _body.projectId})
        _status.id = _body.id;
      }

      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write(JSON.stringify(_status));
    }

    function remove(context){
      var
        _response = context.response
        , _peId = context.request.parameters.peid
        , _success = false
      ;

      if(_peId){
        try {
          recordModule.submitFields({
            type: 'customrecord_bb_proj_exp_budget'
            , id: _peId
            , values: {
              isinactive: true
              , 	custrecord_bb_proj_exp_budg_proj_delete: true
            }
          });
          _success = true;

          batchProcessingModule.addToQueue(
            'customscript_bb_mr_peb_remove'
            , 'customdeploy_bb_mr_peb_remove'
            , { custscript_bb_mr_peb_remove_id: _peId }
            , taskModule.TaskType.MAP_REDUCE
          );

        } catch(e) {
          log.error('NOT_FOUND_PEB_ID', _peId);
        }
      } else {
        log.error('NO_PEB_ID', _peId);
      }
      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write(JSON.stringify({success: _success}));
    }

    function render(context){
      var
        _htmlFile = fileModule.load({id:'./template.html'})
        , _html = _htmlFile.getContents()
        , _form
        , _htmlField
        , _regexStr
        , _templateRender
        , _title = 'Enter Project Expense Budget Item'
        , _saveButtonText = 'Submit Expense Budget Records'
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
        id: 'custpage_proj_exp_budget_form'
        , label: ' '
        , type: serverWidget.FieldType.INLINEHTML
      });
      _htmlField.defaultValue = _html;

      context.response.writePage(_form);
    }

    function findProjects(context) {
      const
        _request = context.request
        , _response = context.response
        , _term = _request.parameters.term
        , _projects = []
      ;

      searchModule.create({
        type: 'customrecord_bb_proj_exp_budget'
        , filters: [
          ['custrecord_bb_proj_exp_budget_project.entityid', 'contains', _term]
        ]
        , columns: ['custrecord_bb_proj_exp_budget_project']
      }).run().each(function(row){
        var
          _projectId = row.getValue({name: 'custrecord_bb_proj_exp_budget_project'})
          , _found = _projects.filter(function(p){ return p.projectId == _projectId})[0];
        ;
        if(!_found) {
          _projects.push({
            name: row.getText({name: 'custrecord_bb_proj_exp_budget_project'})
            , projectId: _projectId
            , url: urlModule.resolveScript({
              scriptId: 'customscript_bb_sl_proj_exp_budget'
              , deploymentId: 'customdeploy_bb_sl_proj_exp_budget'
              , params: { project: _projectId}
            })
          });
        }
        return true;
      });

      _response.setHeader({
        name: 'Content-Type',
        value: 'application/json; charset=utf-8',
      });
      _response.write(JSON.stringify(_projects));
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

      _startRequest = new Date();

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

      logExecutionTime('onRequest process', _startRequest, new Date());
    }


    return {
      onRequest: onRequest
    };
  });