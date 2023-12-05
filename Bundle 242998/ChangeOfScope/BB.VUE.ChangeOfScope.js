var
  _cosView = {
    methods: {
      cosMessage: function (child) {
        const _this = this;
        var
          _revision = child.createNewRevision ? 'New revision will be created' : 'Current revision will be updated'
          , _selectedOldStatusText = child.oldDocumentStatus
          ? this.$root.form.view.statuses[child.packageId].filter(function (status) {
            return status.id == child.oldDocumentStatus
          })[0]
          : undefined
          ,
          _oldStatus = _selectedOldStatusText ? ['with old rev. status "', _selectedOldStatusText.name, '"'].join('') : ''
          , _selectedNewStatusText = child.newDocumentStatus
          ? this.$root.form.view.statuses[child.packageId].filter(function (status) {
            return status.id == child.newDocumentStatus
          })[0]
          : undefined
          ,
          _newStatus = _selectedNewStatusText ? ['with new rev. status "', _selectedNewStatusText.name, '"'].join('') : ''
          , _selectedRejectionText = child.rejectionReason
          ? this.$root.form.view.rejectionReasons[child.packageId].filter(function (rr) {
            return rr.id == child.rejectionReason
          })[0]
          : undefined
          ,
          _rejection = _selectedRejectionText ? ['and with following reason "', _selectedRejectionText.name, '"'].join('') : ''
        ;
        return [_revision, [_oldStatus, _rejection].join(' '), _newStatus].filter(function(line){ return typeof line === 'string' && line.trim().length > 0}).join('<br />').trim();
      }
      , toggleShow(child, propName) {
        Vue.set(child, propName, !child[propName]);
      }
      , onChange() {
      }
    }
  }
  , _collapsibleList = {
    props: ['children']
    , template: '#collapsible-list'
    , data: function(){
        return {
          templateHeader: 'collapsible-header'
          , templateBody: 'collapsible-body'
          , show: false
        };
    }
    , methods: {
      statusClass: function(child){
        var
          _class = child.hasOwnProperty('name') && typeof child.name === 'string' && child.name.trim().length > 0
          ? child.name.trim().toLowerCase().replace(/s/, '-')
          : undefined;

        _class = _class ? ['status', _class].join('-') : '';

        return _class;
      }
    }
  }
  , _collapsibleHeader = {
    mixins: [_cosView]
    , props: ['child']
    , template: '#collapsible-header'
    , data: function(){
      return {
        show: false
      }
    }
    , created: function(){
      Vue.set(this.child, 'createNewRevision', true);
    }
    , methods: {
      updateSelected: function(override){
        const _this = this;
        var
          _data = override ? override : this.child
          , _list = _data.projectActionsByStatus
        ;

        if(_data.showCosForm && !_data.selected){
          _data.showCosForm = false;
        }

        if(!_list){
          _list = _data.projectActions;
        }

        if(!_list){
          return;
        }
        _list.forEach(function(projectAction){
          Vue.set(projectAction, 'selected', _this.child.selected);
          _this.updateSelected(projectAction);
        });
      }
    }
    , watch: {
      'child.selected': function(){
        this.updateSelected();
      }
    }
  }
  , _collapsibleBody = {
    mixins: [_cosView]
    , props: ['child']
    , template: '#collapsible-body'
  }
  , _tempData = {}
  ;

Vue.component('collapsible-header', {
  mixins: [_collapsibleHeader]
});

Vue.component('collapsible-body', {
  mixins: [_collapsibleBody]
});

Vue.component('collapsible-list', {
  mixins: [_collapsibleList]
});

Vue.component('package-action-list', {
  mixins: [_collapsibleList]
  , data: function(){
    return {
      templateBody: 'package-action-body'
      , templateHeader: 'package-action-header'
    };
  }
});

Vue.component('package-action-body', {
  mixins: [_collapsibleBody]
  , template: '#package-action-body'
  , methods: {
    onChange: function(){

    }
  }
});

Vue.component('package-action-header', {
  mixins: [_collapsibleHeader]
  , methods: {
    onChange(child, selected){
      child.projectActionsByStatus.forEach(function(projectAction){
        projectAction.selected = selected;
      });
    }
  }
});

Vue.component('project-action-list', {
  mixins: [_collapsibleList]
  , data: function(){
    return {
      templateBody: 'project-action-body'
      , templateHeader: 'project-action-header'
    };
  }
});

Vue.component('project-action-body', {
  mixins: [_collapsibleBody]
  , template: '#project-action-body'
  , created: function(){
    this.child.projectActions.forEach(function(projectAction){
      Vue.set(projectAction, 'createNewRevision', true);
    })
  }
});

Vue.component('project-action-header', {
  mixins: [_collapsibleHeader]
  , methods: {
    onChange(child, selected){
      child.projectActions.forEach(function(projectAction){
        projectAction.selected = selected;
      });
    }
  }
  , watch: {
    'child.selected': function(selected){
      this.onChange(this.child, selected);
    }
  }
});

Vue.component('change-of-scope-form', {
  template: '#change-of-scope-form'
  , props: ['cos']
  , data: {
    oldRevisionStatusList: []
    , newRevisionStatusList: []
  }
  , computed: {
    showRejectionReason: function(){
      const _this = this;
      var
        _selectedStatusText = this.cos.oldDocumentStatus
          ? this.$root.form.view.statuses[this.cos.packageId].filter(function(status){ return status.id == _this.cos.oldDocumentStatus })[0]
          : undefined
        , _isRejectedStatus = _selectedStatusText && /rejected/i.test(_selectedStatusText.statusType)
      ;

      return _isRejectedStatus;
    }
  }
  , methods: {
    updateChild: function(override){
      const _this = this;
      var
        _data = override ? override : this.cos
        , _list = _data.projectActionsByStatus
      ;

      if(!_list){
        _list = _data.projectActions;
      }

      if(!_list){
        return;
      }

      _list.forEach(function(projectAction){
        Vue.set(projectAction, 'createNewRevision', _this.cos.createNewRevision);
        Vue.set(projectAction, 'oldDocumentStatus', _this.cos.oldDocumentStatus);
        Vue.set(projectAction, 'newDocumentStatus', _this.cos.newDocumentStatus);
        Vue.set(projectAction, 'rejectionReason', _this.cos.rejectionReason);
        _this.updateChild(projectAction);
      });
    }
    , getOrderedStatusList: function(packageId){
      var
        _hasData = this.$root.form && this.$root.form.view && this.$root.form.view.statuses && this.$root.form.view.statuses.hasOwnProperty(packageId)
        , _statuses = _hasData ? this.$root.form.view.statuses[packageId].sort(function(a, b){
          return a.seq - b.seq;
        }) : []
      ;
      return _statuses;
    }
    , getOldRevisionStatusList: function(packageId){
      return this.getOrderedStatusList(packageId);
    }
    , getNewRevisionStatusList: function(packageId){
      return this.getOrderedStatusList(packageId).filter(function(status){
        return !/approved|rejected/i.test(status.statusType);
      });
    }
  }
  , watch: {
    'cos.createNewRevision': function(val){
      this.updateChild();
    }
    , 'cos.oldDocumentStatus': function(val){
      this.updateChild();
    }
    , 'cos.newDocumentStatus': function(val){
      this.updateChild();
    }
    , 'cos.rejectionReason': function(val){
      this.updateChild();
    }
  }
  , created: function(){
    this.oldRevisionStatusList = this.getOldRevisionStatusList(this.cos.packageId);
    this.newRevisionStatusList = this.getNewRevisionStatusList(this.cos.packageId);
    if(this.cos.documentStatusId && !this.cos.oldDocumentStatus){
      //this.cos.oldDocumentStatus = this.cos.documentStatusId;
      Vue.set(this.cos, 'oldDocumentStatus', this.cos.documentStatusId);
    }
    if(this.newRevisionStatusList instanceof Array && this.newRevisionStatusList.length > 0){
      Vue.set(this.cos, 'newDocumentStatus', this.newRevisionStatusList[0].id);
    }
  }
});

const app = new Vue({
  el: '#app'
  , data: {
    form: {}
    , savingForm: false
  }
  , created: function() {
    const _this = this;
    var
      _baseUrl = window.location
      , _process = ['process', 'init'].join('=')
      , _url = [_baseUrl, _process].join('&')
    // simulate ajax call
    if(typeof jQuery !== "undefined"){
      jQuery.get(_url, function(response){
        Vue.set(_this, 'form', response);
        //_this.form = response;
        console.log(_this.form);
      });
    } else {
      // setTimeout(function(){
        _this.form = _tempData;
      //   Vue.set(_this, 'form', _tempData);
      // }, 2000);

    }
  }
  , computed: {
    isLoaded: function(){
      return typeof this.form.view !== 'undefined';
    }
  }
  , methods: {
    validateElement: function(el){
      const _this = this;
      var
        _isValid = typeof el.checkValidity === 'function' ? el.checkValidity() : true
      ;
      Array.prototype.forEach.call(el.children, function(chEl){
        if(_this.validateElement(chEl) === false){
          _isValid = false;
        }
      });
      return _isValid;
    }
    , submitForm: function(e){
      const
        _form = this.$el
        , _this = this
        , _baseUrl = window.location
        , _process = ['process', 'save'].join('=')
        , _url = [_baseUrl, _process].join('&')
      ;
      if (this.validateElement(_form) === false) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        console.log(this.form.data);
        if(typeof jQuery !== "undefined"){
          this.savingForm = true;
          jQuery.post(_url, JSON.stringify(this.form.data), function(response){
            if(/success/i.test(response.status)){
              if(response.redirect){
                window.location.replace(response.redirect);
              }
            } else {
              showAlertBox('cos_errors', 'Error', 'Error occurred, please contact administrator for support.', NLAlertDialog.TYPE_HIGH_PRIORITY);
              setTimeout(function(){
                hideAlertBox('cos_errors');
              }, 5000);
            }
          }, 'json')
            .fail(function(){
              showAlertBox('cos_errors', 'Error', 'Error occurred, please contact administrator for support.', NLAlertDialog.TYPE_HIGH_PRIORITY);
              setTimeout(function(){
                hideAlertBox('cos_errors');
              }, 5000);
            })
            .always(function() {
              this.savingForm = false;
            });
        }
        else {
          this.savingForm = true;
          setTimeout(function(){ _this.savingForm = false;  }, 5000);
        }
      }
      _form.classList.add('was-validated');
    }
  }
});
