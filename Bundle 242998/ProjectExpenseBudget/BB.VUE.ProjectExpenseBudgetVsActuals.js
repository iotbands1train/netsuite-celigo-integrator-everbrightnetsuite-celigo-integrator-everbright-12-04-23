Vue.component('select-input', {
  template: '#select-input'
  , props: ['options', 'value']
  , data: function () {
    return {
      hover: null
      , tooltip: false
    };
  }
  , methods: {
    select: function(data) {
      this.tooltip = false;
      this.$emit('input', data);
      this.$emit('change', data);
    }
    , close: function(e) {
      if (!this.$el.contains(e.target)) {
        this.tooltip = false;
      }
    }
  }
  , mounted () {
    document.addEventListener('click', this.close)
  }
  , beforeDestroy () {
    document.removeEventListener('click',this.close)
  }
});

const app = new Vue({
  el: '#app'
  , data: {
    form: undefined
    , versionSearch: {
      term: ''
      , found: []
      , searching: false
      , delay: undefined
    }
    , searchProjects: {
      term: ''
      , found: []
      , searching: false
      , delay: undefined
    }
    , focusedLineIdx: -1
    , focusedSectionIdx: -1
    , focusedSequence: -1
    , savingForm: false
    , loading: true
    , redirecting: false
    , todaySeq: 1
    , formatFunc: undefined
    , startDate: undefined
    , endDate: undefined
    , column: {value: 'month', text: 'Month'}
    , subsidiary: undefined
    , version: undefined
    , tooltip: false
    , hover: null
    , ignoreDates: false
    , options: [
      {value: 'month', text: 'Month'}
      , {value: 'quarter', text: 'Quarter'}
      , {value: 'year', text: 'Year'}
      , {value: 'totals', text: 'Totals'}
    ]
    , subsidiaries: undefined
    , project: undefined
    , segments: undefined
    , segment: undefined
  }
  , created: function () {
    var _this = this;
    if(!this.formatFunc) {
      require(['N/format'], function(formatModule){
        _this.formatFunc = function(v) {
          return formatModule.format({value: v, type: formatModule.Type.CURRENCY});
        }
      });
    }

    this.getData();
  }
  , computed: {
    isLoaded: function () {
      return typeof this.form.view !== 'undefined';
    }
    // , formattedStart: function(){
    //   return this.formatDate(this.form.projectDates.start);
    // }
    // , formattedEnd: function(){
    //   return this.formatDate(this.form.projectDates.end);
    // }
    , totalAmount: function() {
      var _totalAmount = 0;
      if(this.form && this.form.sections) {
        this.form.sections.forEach(function(section){
          if(section.items) {
            section.items.forEach(function(item){
              if(!isNaN(parseFloat(item.amount))) {
                _totalAmount += parseFloat(item.amount);
              }
            });
          }
        })
      }
      return this.formatCurrency(_totalAmount); // typeof nlapiFormatCurrency === 'function' ? nlapiFormatCurrency(_totalAmount) : _totalAmount;
    }
  }
  , methods: {
    formatCurrency: function(value){
      if(!this.formatFunc) {
        require(['N/format'], function(formatModule){
          this.formatFunc = function(v) {
            return formatModule.format({value: v, type: formatModule.Type.CURRENCY});
          }
        });
      }

      if(typeof value === 'undefined' || value == null){
        value = 0;
      }

      if(this.formatFunc) {
        var _value = this.formatFunc(value);
        _value = _value.replace(/^-+/, '');
        _value = _value.replace(/[\(\)]/gm, '');
        _value = ['$', _value].join('');
        if(value < 0){
          _value = ['(', _value, ')'].join('');
        }
        return _value;
      }
      return value;
    }
    // , runFilter: function(filter) {
    //   var
    //     _this = this
    //     , _baseUrl = window.location
    //     , _process = ['process', 'find'].join('=')
    //     , _term
    //     , _url
    //   ;
    //   if(typeof filter.term === 'string' && filter.term.length > 0) {
    //     _term = ['version', filter.term.trim()].join('=');
    //     _url = [_baseUrl, _process, _term].join('&');
    //     filter.searching = true;
    //     // do call to Suitelet
    //     if (typeof jQuery !== 'undefined') {
    //       jQuery.get(_url, function (response) {
    //         if(response instanceof Array){
    //           response.forEach(function(f){
    //             f.hover = false;
    //           })
    //           filter.found = response;
    //         }
    //       }).always(function () {
    //         setTimeout(function(){
    //           filter.searching = false;
    //         }, 500);
    //       });
    //     }
    //   } else {
    //     _this.version = undefined;
    //   }
    // }
    , projectFilter: function(){
      var
        _this = this
        , _baseUrl = window.location
        , _process = ['process', 'projects'].join('=')
        , _term
        , _url
      ;
      if(typeof _this.searchProjects.term === 'string' && _this.searchProjects.term.length > 0) {
        _term = ['project', _this.searchProjects.term.trim()].join('=');
        _url = [_baseUrl, _process, _term].join('&');
        _this.searchProjects.searching = true;
        // do call to Suitelet
        if (typeof jQuery !== 'undefined') {
          jQuery.get(_url, function (response) {
            if(response instanceof Array){
              response.forEach(function(f){
                f.hover = false;
              })
              _this.searchProjects.found = response;
            }
          }).always(function () {
            setTimeout(function(){
              _this.searchProjects.searching = false;
            }, 500);
          });
        }
      } else {
        _this.project = undefined;
      }
    }
    , projectFilterDelay: function() {
      var _this = this;
      if(_this.searchProjects.delay) {
        clearTimeout(_this.searchProjects.delay);
      }
      _this.searchProjects.delay = setTimeout(function(){
        _this.projectFilter();
      }, 300);
    }
    , selectProject: function(project){
      this.searchProjects.term = project.text;
      this.searchProjects.found = undefined;
      this.project = project.value;
    }
    , versionFilter: function(){
      var
        _this = this
        , _baseUrl = window.location
        , _process = ['process', 'versions'].join('=')
        , _term
        , _url
      ;
      if(typeof _this.versionSearch.term === 'string' && _this.versionSearch.term.length > 0) {
        _term = ['version', _this.versionSearch.term.trim()].join('=');
        _url = [_baseUrl, _process, _term].join('&');
        _this.versionSearch.searching = true;
        // do call to Suitelet
        if (typeof jQuery !== 'undefined') {
          jQuery.get(_url, function (response) {
            if(response instanceof Array){
              response.forEach(function(f){
                f.hover = false;
              })
              _this.versionSearch.found = response;
            }
          }).always(function () {
            setTimeout(function(){
              _this.versionSearch.searching = false;
            }, 500);
          });
        }
      } else {
        _this.version = undefined;
      }
    }
    , versionFilterDelay: function() {
      var _this = this;
      if(_this.versionSearch.delay) {
        clearTimeout(_this.versionSearch.delay);
      }
      _this.versionSearch.delay = setTimeout(function(){
        _this.versionFilter();
      }, 300);
    }
    , selectVersion: function(version){
      this.versionSearch.term = version.value;
      this.versionSearch.found = undefined;
    }
    , focusSequence: function(seq) {
      if(this.focusedSequence == seq || (this.selectedVersion && this.selectedVersion.readonly)) {
        this.focusedSequence = -1;
      } else {
        this.focusedSequence = seq;
        this.calculateSelectedMoveItems();
      }
    }
    , focused: function(sectionIdx, lineIdx){
      this.focusedSectionIdx = sectionIdx;
      this.focusedLineIdx = lineIdx;
      //this.canDivide = this.form && this.form.sections && this.focusedSectionIdx > -1 && this.focusedLineIdx > -1 && this.form.sections[this.focusedSectionIdx].items[this.focusedLineIdx].amount;
    }
    , toggleSection: function(idx){
      if(this.form && this.form.sections){
        this.form.sections[idx].collapsed =
          typeof this.form.sections[idx].collapsed === 'boolean' ? !this.form.sections[idx].collapsed : true;
      }
    }
    , submitForm: function (e) {
      const
        _this = this
        , _baseUrl = window.location
        , _process = ['process', 'save'].join('=')
        , _url = [_baseUrl, _process].join('&')
        , _dates = this.form.projectDates
      ;
      if (typeof jQuery !== "undefined") {
        _this.loading = true;
        jQuery.post(_url, JSON.stringify({
          id: this.form.id
          , projectId: this.form.projectId
          , salesOrderId: this.form.salesOrderId
          , sections: this.form.sections
          , seqCount: this.form.seqCount
          , updateEndDate: _dates.end instanceof Date && _dates.originalEnd instanceof Date && _dates.end > _dates.originalEnd
            ? _dates.end
            : undefined
          , versionName: this.form.setVersionName
        }), function (response) {
          if (/success/i.test(response.status)) {
            if (response.redirect) {
              _this.redirecting = true;
              _this.getData();
              // window.location.replace(response.redirect);
            }
          } else {
            showAlertBox('peb_errors', 'Error', 'Error occurred, please contact administrator for support.', NLAlertDialog.TYPE_HIGH_PRIORITY);
            setTimeout(function () {
              hideAlertBox('peb_errors');
            }, 5000);
          }
        }, 'json')
          .fail(function () {
            showAlertBox('peb_errors', 'Error', 'Error occurred, please contact administrator for support.', NLAlertDialog.TYPE_HIGH_PRIORITY);
            setTimeout(function () {
              hideAlertBox('peb_errors');
            }, 5000);
          })
          .always(function () {
            setTimeout(function(){
              _this.loading = _this.redirecting;
            }, 500);
          });
      } else {
        this.savingForm = true;
        setTimeout(function () {
          _this.savingForm = false;
        }, 5000);
      }
    }
    , buildUrl: function(process) {
      var
        _baseUrl = window.location
        , _process = ['process', process].join('=')
        , _params = []
        , _url = [_baseUrl, _process].join('&')
      if(this.ignoreDates){
        _params.push('nodates=');
      }
      if(!this.ignoreDates && typeof this.startDate === 'string' && this.startDate.trim().length > 0){
        _params.push(['start', this.startDate].join('='));
      }
      if(!this.ignoreDates && typeof this.endDate === 'string' && this.endDate.trim().length > 0){
        _params.push(['end', this.endDate].join('='));
      }
      if(this.column && typeof this.column.value === 'string' && this.column.value.trim().length > 0){
        _params.push(['period', this.column.value].join('='));
      }
      if(this.subsidiary && typeof this.subsidiary.value === 'string' && this.subsidiary.value.trim().length > 0){
        _params.push(['subsidiary', this.subsidiary.value].join('='));
      }
      if(this.versionSearch && this.versionSearch.term && typeof this.versionSearch.term === 'string' && this.versionSearch.term.trim().length > 0){
        _params.push(['version', this.versionSearch.term].join('='));
      }
      if(this.project){
        _params.push(['project', this.project].join('='));
      }
      if(this.segment && typeof this.segment.value === 'string' && this.segment.value.trim().length > 0){
        _params.push(['segment', this.segment.value].join('='));
      }
      if(_params.length > 0) {
        _url = [_url, _params.join('&')].join('&');
      }
      return _url;
    }
    , exportData: function(){
      const
        _this = this
        , _url = this.buildUrl('download')
      ;
      _this.loading = true;

      // simulate ajax call
      if (typeof jQuery !== "undefined") {
        window.open(_url, '_blank');
        _this.loading = false;
      } else {
        // setTimeout(function(){
        // _this.form = _tempData;
        //   Vue.set(_this, 'form', _tempData);
        // }, 2000);
        _this.loading = false;
      }
    }
    , getData: function(){
      const
        _this = this
        , _url = this.buildUrl('init')
      ;
      _this.loading = true;
      // simulate ajax call
      if (typeof jQuery !== "undefined") {
        jQuery.get(_url, function (response) {
          if(response instanceof Object){
            // console.log('response', response);
            Vue.set(_this, 'version', _this.versionSearch.term);
            Vue.set(_this, 'form', response);
            if(response.config && response.config.startDate && response.config.endDate){
              Vue.set(_this, 'startDate', _this.formatDate(new Date(response.config.startDate)));
              Vue.set(_this, 'endDate', _this.formatDate(new Date(response.config.endDate)));
            }
            // console.log('_this.todaySeq', _this.todaySeq);
            if(response.subsidiaries instanceof Array){
              Vue.set(_this, 'subsidiaries', response.subsidiaries);
              if(!_this.subsidiary){
                Vue.set(_this, 'subsidiary', response.subsidiaries[0]);
              }
            }
            if(response.segments instanceof Array){
              Vue.set(_this, 'segments', response.segments);
              if(!_this.segment){
                Vue.set(_this, 'segment', response.segments[0]);
              }
            }
          } else {
            showAlertBox('peb_errors', 'Error', 'Error occurred, please contact administrator for support.', NLAlertDialog.TYPE_HIGH_PRIORITY);
            setTimeout(function () {
              hideAlertBox('peb_errors');
            }, 5000);
          }
        }).fail(function () {
          showAlertBox('peb_errors', 'Error', 'Error occurred, please contact administrator for support.', NLAlertDialog.TYPE_HIGH_PRIORITY);
          setTimeout(function () {
            hideAlertBox('peb_errors');
          }, 5000);
        })
          .always(function () {
            setTimeout(function(){
              _this.loading = false;
            }, 500);

          });
      } else {
        // setTimeout(function(){
        // _this.form = _tempData;
        //   Vue.set(_this, 'form', _tempData);
        // }, 2000);
        _this.loading = false;
      }
    }
    , calculateSeqDate: function(date, sequence) {
      const _seqCalulateFunc = {
        'week': function(date, seq) {
          return date.setDate(date.getDate() + seq * 7);
        }
        , 'month': function(date, seq) {
          return date.setMonth(date.getMonth() + seq * 1);
        }
      };
      var
        _seqName = this.form ? this.form.seqName.toLowerCase() : undefined
      ;
      if(_seqCalulateFunc.hasOwnProperty(_seqName)) {
        return new Date(_seqCalulateFunc[_seqName](new Date(date), sequence - 1));
      }
      return undefined;
    }
    , calculateTodaysSeq: function(startDate) {
      const _seqCalulateFunc = {
        'week': function() {
          return parseInt(Math.floor((new Date() - startDate)/(1000*60*60*24*7))) + 1;
        }
        , 'month': function() {
          var _today = new Date();
          return (_today.getFullYear() - startDate.getFullYear()) * 12 + (_today.getMonth() - startDate.getMonth()) + 1;
        }
      };
      var
        _seqName = this.form ? this.form.seqName.toLowerCase() : undefined
      ;
      if(startDate instanceof Date && _seqCalulateFunc.hasOwnProperty(_seqName)) {
        return _seqCalulateFunc[_seqName]();
      }
      return 1;
    }
    , getDates: function(sequence){
      const _seqCalulateFunc = {
        'week': function(date, seq) {
          return date.setDate(date.getDate() + seq * 7);
        }
        , 'month': function(date, seq) {
          return date.setMonth(date.getMonth() + seq * 1, 1);
        }
      };

      var
        _dates = {
          start: null
          , end: null
        }
        , _seqFunc
      ;

      if(this.form && this.form.seqName
        && this.form.projectDates && this.form.projectDates.start instanceof Date
        && _seqCalulateFunc.hasOwnProperty(this.form.seqName.toLowerCase())) {
        _seqFunc = _seqCalulateFunc[this.form.seqName.toLowerCase()];
        _dates.start = new Date(_seqFunc(new Date(this.form.projectDates.start), sequence - 1));
        if(_dates.start < this.form.projectDates.start) {
          _dates.start = new Date(this.form.projectDates.start);
        }
        _dates.start.setHours(0,0,0,0);
        _dates.end = new Date(_seqFunc(new Date(this.form.projectDates.start), sequence));
        _dates.end.setDate(_dates.end.getDate()-1);
        if(this.form.projectDates.end instanceof Date && _dates.end > this.form.projectDates.end) {
          _dates.end = this.form.projectDates.end;
        }
        _dates.end.setHours(23, 59, 59, 999);
      }

      return _dates;
    }
    , getSeqTitle: function(seq) {
      var
        _this = this
        , _dates = this.getDates(seq)
        , _seqTypeFormat = {
          'week': [_this.formatDate(_dates.start), _this.formatDate(_dates.end)].join(' - ')
          , 'month': _this.formatDate(_dates.start, 'MON YYYY')
        }
      if(this.form && this.form.seqName
        && this.form.projectDates && this.form.projectDates.start instanceof Date
        && _seqTypeFormat.hasOwnProperty(this.form.seqName.toLowerCase())) {
        return _seqTypeFormat[this.form.seqName.toLowerCase()];
      }
      return seq;
    }
    , getSeqTooltip: function(seq) {
      //{{form.seqName}} {{n}}
      var
        _this = this
        , _dates = this.getDates(seq)
        , _seqTypeFormat = {
          'week': function() { return [_this.form.seqName, seq].join(' '); }
          , 'month': function() {
            return [_this.formatDate(_dates.start), _this.formatDate(_dates.end)].join(' - ');
          }
        }
      if(this.form && this.form.seqName
        && this.form.projectDates && this.form.projectDates.start instanceof Date
        && _seqTypeFormat.hasOwnProperty(this.form.seqName.toLowerCase())) {
        return _seqTypeFormat[this.form.seqName.toLowerCase()]();
      }
      return seq;
    }
    , isHistory: function(seq){
      return this.todaySeq - this.showHistorySeqCount > seq;
    }
    , sameAmountAsSeq: function(line){
      var
        _amount = 0
        , _seqAmount = 0;
      ;
      if(line){
        _amount = parseFloat(line.amount);
        if(isNaN(_amount)) {
          _amount = 0;
        }
        line.seqData.forEach(function(seq){
          if(!isNaN(parseFloat(seq.amount))){
            _seqAmount += parseFloat(seq.amount);
          }
        });
      }
      _seqAmount = Number(_seqAmount.toFixed(2));
      return _amount != _seqAmount;
    }
    , totalAmountSeq: function(seq){
      const _this = this;
      var
        _totalAmountSeq = 0
        // , _seqData
      ;

      if(this.form && this.form.sections){
        this.form.sections.forEach(function(sec){
          _totalAmountSeq += _this.totalAmountSectionSeq(sec, seq, true);
          // if(sec.items){
          //   sec.items.forEach(function(item){
          //     if(item.seqData){
          //       _seqData = item.seqData.filter(function(s){
          //         return s.seq == seq;
          //       })[0];
          //       if(_seqData && _seqData.amount && !isNaN(parseFloat(_seqData.amount))){
          //         _totalAmountSeq += parseFloat(_seqData.amount);
          //       }
          //     }
          //   });
          // }
        });
      }
      _totalAmountSeq = Number(_totalAmountSeq.toFixed(2));
      return this.formatCurrency(_totalAmountSeq); // typeof nlapiFormatCurrency === 'function' ? nlapiFormatCurrency(_totalAmountSeq) : _totalAmountSeq;
    }
    , totalAmountSectionSeq: function(section, seq, ignoreFormat) {
      var
        _totalAmountSeq = 0
        , _seqData
      ;
      if(section && section.items){
        section.items.forEach(function(item){
          if(seq && item.seqData){
            _seqData = item.seqData.filter(function(s){
              return s.seq == seq;
            })[0];
            if(_seqData && _seqData.amount && !isNaN(parseFloat(_seqData.amount))){
              _totalAmountSeq += parseFloat(_seqData.amount);
            }
          } else if(!isNaN(parseFloat(item.amount))) {
            _totalAmountSeq += parseFloat(item.amount);
          }
        });
      }
      _totalAmountSeq = Number(_totalAmountSeq.toFixed(2));
      return !ignoreFormat ? this.formatCurrency(_totalAmountSeq) : _totalAmountSeq; // typeof nlapiFormatCurrency === 'function' && !ignoreFormat ? nlapiFormatCurrency(_totalAmountSeq) : _totalAmountSeq;
    }
    , isFocused: function(sectionIdx, lineIdx){
      return this.focusedSectionIdx == sectionIdx && this.focusedLineIdx == lineIdx;
    }
    , isSeqFocused:function(seqIdx){
      return (Number(seqIdx) + 1) == this.focusedSequence;
    }
    , formatDate: function(date, format){
      if(date instanceof Date && typeof getdatestring === 'function'){
        return getdatestring(date, format);
      }
      return date;
    }
    , openCalendar: function(e, id){
      NLCalender_popup(e.target, '', 'main:' + id, false);
    }
    , dateChanged: function(target, property){
      this.$set(this, property, this.$refs[target].value);
    }
    , selectColumn: function(option){
      this.column = option;
      this.tooltip = false;
    }
    , selectSubsidiary: function(subsidiary){
      this.subsidiary = subsidiary;
      this.tooltip = false;
    }
    , expandAll: function(){
      if(this.form && this.form.data instanceof Array){
        this.form.data.forEach(function(p){
          p.collapsed = false;
          p.sections.forEach(function(s){
            s.collapsed = false;
          })
        })
      }
    }
    , collapseAll: function(){
      if(this.form && this.form.data instanceof Array){
        this.form.data.forEach(function(p){
          p.sections.forEach(function(s){
            s.collapsed = true;
          })
          p.collapsed = true;
        })
      }
    }
  }
  , mounted: function() {
    var _this = this;
    this.$refs['start-date-input'].onchange = function(){ _this.dateChanged('start-date-input', 'startDate'); };
    this.$refs['end-date-input'].onchange = function(){ _this.dateChanged('end-date-input', 'endDate'); };
  }
  , beforeDestroy: function () {
    this.$refs['start-date-input'].onchange = null;
    this.$refs['end-date-input'].onchange = null;
  }
});