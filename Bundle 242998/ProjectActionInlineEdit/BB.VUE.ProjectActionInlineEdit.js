Vue.config.productionTip = false;
Vue.config.silent = true;

Vue.component('integer-input', {
  template: '#text-input'
  , props: ['value']
  , data: function () {
    return {};
  }
  , methods: {

  }
});

Vue.component('currency-input', {
  template: '#text-input'
  , props: ['value']
  , data: function () {
    return {};
  }
  , methods: {

  }
});

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

Vue.component('autocomplete-input', {
  template: '#autocomplete-input'
  , props: ['value', 'column']
  , data: function () {
    return {
      hover: null
      , tooltip: false
      , term: null
      , delay: null
      , searching: false
      , foundData: []
    };
  }
  , methods: {
    select: function(data) {
      this.tooltip = false;
      this.term = data.text;
      this.$emit('input', data);
      this.$emit('change', data);
    }
    , close: function(e) {
      if (!this.$el.contains(e.target)) {
        this.tooltip = false;
      }
    }
    , filter: function() {
      var
        _this = this
        , _baseUrl = window.location
        , _process = ['process', 'search'].join('=')
        , _field = ['field', _this.column].join('=')
        , _term
        , _url
      ;
      if(typeof _this.term === 'string' && _this.term.length > 0) {
        _term = ['term', _this.term.trim()].join('=');
        _url = [_baseUrl, _process, _field, _term].join('&');
        _this.searching = true;
        // do call to Suitelet
        if (typeof jQuery !== 'undefined') {
          jQuery.get(_url, function (response) {
            if(response instanceof Array){
              _this.foundData = response;
              _this.tooltip = true;
            }
          }).always(function () {
            setTimeout(function(){
              _this.searching = false;
            }, 500);
          });
        }
      } else {
        _this.searching = false;
        _this.foundData = [];
      }
    }
    , filterDelay: function() {
      var _this = this;
      if(_this.delay) {
        clearTimeout(_this.delay);
      }
      _this.delay = setTimeout(function(){
        _this.filter();
      }, 300);
    }
  }
  , mounted () {
    document.addEventListener('click', this.close);
    if(this.value && this.value.text) {
      this.term = this.value.text;
    }
  }
  , beforeDestroy () {
    document.removeEventListener('click',this.close)
  }
});

Vue.component('date-filter-input', {
  template: '#date-filter-input'
  , props: ['id', 'value']
  , data: function () {
    return {

    };
  }
  , methods: {
    onchange: function() {
      this.$emit('input', this.$refs["date-filter-input"].value);
      this.$emit('change');
    }
    , onblur: function() {

    }
    , onclick: function(e) {
      NLCalender_popup(e.target, '', 'main:' + this.id, false);
    }
  }
  , mounted: function() {
    this.$refs["date-filter-input"].onchange = this.onchange;
  }
  , beforeDestroy () {
    this.$refs["date-filter-input"].onchange = null;
  }
});

// data-fieldtype="multiselect"
//new NLMultiDropdown(name, nameC, values, defaultValuesString, settings.flags, settings.width, settings.height, $dropdown.get(0).ownerDocument);
Vue.component('multi-select-filter-input', {
  template: '#multi-select-filter-input'
  , props: ['id', 'options', 'value']
  , data: function () {
    return {
      multidropdown: null
      , timeout: null
    };
  }
  , methods: {
    onchange: function() {
      var
        _this = this
      ;
      if(this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(function(){
        _this.$emit('input', _this.$refs[_this.id + '-value'].value);
        _this.$emit('change');
      }, 1000);
    }
    , unEscapeHtml: function(str) {
      var
        _node = document.createElement('a')
        , _child
        , _result = ''
      ;
      if (str == null)
        return null;
      if (str.length == 0)
        return _result;
      _node = document.createElement('a');
      _node.innerHTML = str + '\n';
      _child = _node.firstChild;

      if(_child != null && _child.nodeName != "#text")
        _child = _child.firstChild;

      if (_child != null)
      {
        _result = _child.data;
        if (_result.charAt(_result.length - 1) == ' '){
          _result = _result.substring(0, _result.length - 1);
        }
        return _result;
      }
      else {
        return _result;
      }
    }
  }
  , mounted: function() {
    var
      _values = []
      , _ref = this.$refs[this.id + '-value']
    ;
    if (this.options.length > 0) {
      _values = [];
      this.options.forEach(function(option){
        _values.push(option.text.indexOf("&") > -1 ? this.unEscapeHtml(option.text) : option.text);
        _values.push(option.id);
      });
    }
    this.multidropdown = new NLMultiDropdown(this.id, this.id, _values, [].join(String.fromCharCode(5)), 0, 280, 4, _ref.ownerDocument);
    _ref.onchange = this.onchange;
  }
  , beforeDestroy () {
    this.$refs[this.id + '-value'].onchange = null;
  }
})

Vue.component('date-input', {
  template: '#date-input'
  , props: ['column', 'value', 'row']
  , data: function () {
    return {

    };
  }
  , methods: {
    onchange: function() {
      this.value.value = this.$refs["date-input"].value;
      //onchange="this.checkvalid=false;this.isvalid=(validate_field(this,'date',true,false,null,null,false, null ,8) &amp;&amp; (this.shouldDoAlertInAdditionalValidation = true, nlapiValidateField(null,'{{column + \'_\' + row.id}}'))); if (this.isvalid) {nlapiFieldChanged(null,'{{column + \'_\' + row.id}}');} if (!this.isvalid) {selectAndFocusField(this);} return this.isvalid;"
    }
    , onblur: function() {
      //onblur="if (this.checkvalid == true) {this.isvalid=(validate_field(this,'date',false,false,null,null,false, null ,8) &amp;&amp; (this.shouldDoAlertInAdditionalValidation = false, nlapiValidateField(null,'{{column + \'_\' + row.id}}')));} if (this.isvalid == false) { selectAndFocusField(this); if (arguments[0]){ arguments[0].stopPropagation();} return this.isvalid;} "
    }
    , onclick: function(e) {
      NLCalender_popup(e.target, '', 'main:' + this.column + '_' + this.row.id, false);
      //onclick="NLCalender_popup(this, '', 'main:' + column +  '_' + row.id, false);return false;"
    }
  }
  , mounted: function() {
    this.$refs["date-input"].onchange = this.onchange;
  }
  , beforeDestroy () {
    this.$refs["date-input"].onchange = null;
  }
});

Vue.component('text-input', {
  template: '#text-input'
  , props: ['value']
  , data: function () {
    return {};
  }
  , methods: {

  }
});

Vue.component('url-input', {
  template: '#text-input'
  , props: ['value']
  , data: function () {
    return {};
  }
  , methods: {

  }
});

Vue.component('checkbox-input', {
  template: '#checkbox-input'
  , props: ['value']
  , data: function () {
    return {};
  }
  , methods: {

  }
});

Vue.component('float-input', {
  template: '#text-input'
  , props: ['value']
  , data: function () {
    return {};
  }
  , methods: {

  }
});

Vue.component('email-input', {
  template: '#text-input'
  , props: ['value']
  , data: function () {
    return {};
  }
  , methods: {

  }
});

Vue.component('percent-input', {
  template: '#text-input'
  , props: ['value']
  , data: function () {
    return {};
  }
  , methods: {

  }
});

Vue.component('phone-input', {
  template: '#text-input'
  , props: ['value']
  , data: function () {
    return {};
  }
  , methods: {

  }
});

Vue.component('textarea-input', {
  template: '#text-input'
  , props: ['value']
  , data: function () {
    return {};
  }
  , methods: {

  }
});

Vue.component('clobtext-input', {
  template: '#clobtext-input'
  , props: ['value']
  , data: function () {
    return {};
  }
  , methods: {

  }
});

Vue.component('timeofday-input', {
  template: '#text-input'
  , props: ['value']
  , data: function () {
    return {};
  }
  , methods: {
    onchange: function() {
      var _value = this.value.value;
      if(typeof _value === 'string' && _value.trim().length > 0){
        var _validate = validate_time(_value, true, false);
        if(_validate.validflag){
          this.value.value = _validate.value;
        } else {
          this.value.value = '';
        }
      }
    }
  }
  , mounted: function() {
    this.$el.onchange = this.onchange;
    this.$el.onblur = this.onchange;
  }
  , beforeDestroy () {
    this.$el.onchange = undefined;
    this.$el.onblur = undefined;
  }
});



const app = new Vue({
  el: '#app'
  , data: {
    rows: []
    , isLoadingData: true
    , columns: {}
    , filters: _filters
    , selectedLine: -1
    , originalData: null
    , newFilters: {}
  }
  , computed: {

  }
  , methods: {
    submit: function() {
      const
        _this = this
        , _savingLine = this.selectedLine
        , _row = this.rows[this.selectedLine]
        , _baseUrl = window.location
        , _process = ['process', 'save'].join('=')
      ;
      var
        _params = [_baseUrl, _process]
        , _url
      ;
      if (typeof jQuery !== "undefined") {
        Vue.set(_row, 'saving', true);
        _this.cancelLine(true);
        for(var key in this.newFilters) {
          if(this.newFilters.hasOwnProperty(key) && typeof this.newFilters[key] === 'string'){
            _params.push([key, this.newFilters[key]].join('='));
          }
        }

        _url = _params.join('&');
        jQuery.post(_url, JSON.stringify(_row), function (response) {
          if (/success/i.test(response.status)) {
            if(response.data) {
              _this.rows.splice(_savingLine, 1, response.data);
            } else {
              _this.rows.splice(_savingLine, 1);
              _this.selectedLine = _this.selectedLine - 1;
            }
          } else {

          }
        }, 'json')
          .fail(function () {

          })
          .always(function () {
            Vue.set(_row, 'saving', false);
          });
      } else {

      }

    }
    , selectLine: function(idx) {
      var
        _row = this.rows[idx]
      ;
      if(!_row.saving) {
        if(this.selectedLine > -1) {
          this.cancelLine();
        }
        this.selectedLine = idx;
        this.originalData = JSON.stringify(_row);
      }
    }
    , cancelLine: function(skip){
      if(!skip) {
        this.rows.splice(this.selectedLine, 1, JSON.parse(this.originalData));
      }
      // this.rows[this.selectedLine] = JSON.parse(this.originalData);
      this.originalData = null;
      this.selectedLine = -1;
    }
    , filterChanged: function() {
      this.getData();
    }
    , getData: function() {
      let
        _baseUrl = window.location
        , _process = ['process', 'data'].join('=')
        , _params = [_baseUrl, _process]
        , _url
      ;

      this.cancelLine();
      this.isLoadingData = true;
      this.rows = [];

      for(var key in this.newFilters) {
        if(this.newFilters.hasOwnProperty(key) && typeof this.newFilters[key] === 'string'){
          _params.push([key, this.newFilters[key]].join('='));
        }
      }

      _url = _params.join('&');
      this.$http.get(_url).then((response) => {
        if (response.ok && response.status === 200) {
          this.rows = response.body.data;
          this.columns = response.body.columns;
          //this.filters = response.body.filters;
          for(var key in this.filters){
            if(this.filters.hasOwnProperty(key)){
              if(!this.filters[key].isDate && !this.filters[key].multiselect && typeof this.newFilters[key] === 'undefined') {
                this.newFilters[key] = this.filters[key].data[0].id;
              } else if(this.filters[key].isDate && typeof this.newFilters[key] === 'undefined') {
                this.newFilters[key] = '';
              }
            }
          }
        }
        this.isLoadingData = false;
      }, (response) => {
        this.isLoadingData = false;
      });

    }
  }
  , created: function() {
    if(_isPortlet) {
      jQuery('.uir-page-title').closest('tr').remove();
    }
    this.getData();
  }
});