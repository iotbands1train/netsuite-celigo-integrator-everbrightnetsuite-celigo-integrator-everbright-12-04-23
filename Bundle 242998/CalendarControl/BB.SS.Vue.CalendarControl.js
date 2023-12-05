let _cssLinks = window.parent.document.head.getElementsByTagName('link');
for(let idx = 0; idx < _cssLinks.length; idx++){
  let _link = _cssLinks[idx];
  if(_link && /pagestyles|dashboard/i.test(_link.href)){
    window.document.head.appendChild(_link.cloneNode(true));
  }
}
Vue.config.productionTip = false;
Vue.config.silent = true;
Vue.component('status-checkbox', {
  template: `
  		<div class="status-checkbox" @click="onClick">
  		  <button class="checkbox fc-event checkbox-default" :class="[customClass, {'checked': !checkedProxy}]" @click.prevent>
        	<div class="filler checkbox-default" :class="customClass"></div>
        </button>
      	<label>{{label}}</label>
      </div>`,
  props: ['value', 'custom-class', 'val', 'label'],
  data () {
    return {
      checkedProxy: false
    }
  },
  created () {
    // set the checked proxy if we start with this value included.
    if (this.value.includes(this.val)) {
      this.checkedProxy = true
    }
  },
  methods: {
    onClick () {
      this.checkedProxy = !this.checkedProxy
      let value = [].concat(this.value) // copy so we dont mutate directly
      if(!this.checkedProxy && value.includes(this.val)){
        value.splice(value.indexOf(this.val), 1)
      } else {
        value.push(this.val)
      }
      this.$emit('input', value) // emit the new value.
    }
  }
});

let _app = new Vue({
  el: '#app',
  components: {
    'full-calendar': FullCalendarVue.default
  },
  data() {
    let _this = this;
    return {
      initial: true,
      renderTimeout: null,
      newFilters: {},
      dropdowns: null,
      legend: null,
      filters: {
        employees: [],
        status: [],
        packageActions: []
      },
      selected: {
        status: ['5']
      },
      fullyRendered: true,
      isLoadingData: false,
      //selectedAssignee: undefined,
      selectedPackageAction: undefined,
      calendarPlugins: [ FullCalendarDayGrid.default ],
      events(info, success, failure) {
        let
          _start = new Date(info.start)
          , _isWeekView = info && info.end && info.start && (info.end - info.start) / 1000 / 60 / 60 / 24 <= 7
          , _year
          , _month
          , _day
        ;
        if(!_isWeekView) {
          _start.setDate(_start.getDate() + 15);
        } else {
          _day = _start.getDate();
        }
        _month = _start.getMonth() + 1;
        _year = _start.getFullYear();
        _this.getData(_month, _year, _day, success, failure);
      },
      currentStart: new Date(),
      header: {
        left: 'prev,next today title',
        center: '',
        right: ''
      }
    }
  },
  methods: {
    resizeFrame(){
      let
        _iFrameCcEl = window.parent.document.getElementById(window.frameElement.id);
      ;
      _iFrameCcEl.style.height = `${this.$el.offsetHeight + 20}px`;
    },
    rerenderEvents(){
      let
        _calendar = this.$refs.calendar
        , _calendarApi = _calendar.getApi()
      ;
      _calendarApi.rerenderEvents();
    },
    eventRenderHandle(info) {
      let _display = this.selected.status.includes(info.event.extendedProps.status);
      info.el.querySelector('.fc-title').innerHTML = info.event.title;
      if(_display){
        if(this.renderTimeout){
          clearTimeout(this.renderTimeout);
        }
        this.renderTimeout = setTimeout(this.resizeFrame.bind(this), 300);
      }
      return _display;
    },
    eventClickHandle(info){
      info.jsEvent.preventDefault(); // don't let the browser navigate

      if (info.event.url) {
        window.open(info.event.url, '_blank');
      }
    },
    isLoading(value){
      this.isLoadingData = value;
    },
    getData(month, year, day, success, failure){
      let
        _baseUrl = window.location
        , _process = ['process', 'data'].join('=')
        , _month = ['month', month].join('=')
        , _year = ['year', year].join('=')
        , _init = ['initial', 'T'].join('=')
        // , _cache = ['cache', window.frameElement.id].join('=')
        , _params = [_baseUrl, _process, _month, _year]
        , _url
      ;

      if(this.initial) {
        _params.push(_init);
      }

      if(day) {
        _params.push(['day', day].join('='));
      }

      // console.log(this.newFilters);
      for(var key in this.newFilters) {
        if(this.newFilters.hasOwnProperty(key) && typeof this.newFilters[key] === 'string'){
          _params.push([key, this.newFilters[key]].join('='));
        }
      }
      // console.log(_params);
      // if(typeof this.selectedAssignee === 'string'){
      //   _params.push(['assigned', this.selectedAssignee].join('='));
      // }
      // if(!isNaN(parseInt(this.selectedPackageAction))){
      //   _params.push(['pa', this.selectedPackageAction].join('='))
      // }

      _url = _params.join('&');

      this.$http.get(_url).then((response) => {
        if (response.ok && response.status === 200) {
          // console.log(response.body);
          // response.body.forEach((ev) => delete ev.url);
          if(response.body.filters){
            this.dropdowns = response.body.filters.dropdowns;
            this.legend = response.body.filters.legend;
            // if(response.body.filters.employees instanceof Array && this.filters.employees.length === 0){
            //   this.filters.employees = response.body.filters.employees;
            // }

            for(var key in this.dropdowns){
              if(this.dropdowns.hasOwnProperty(key)){
                // if(/assignee/i.test(key)){
                //   if(response.body.currentUser && typeof this.newFilters['assignee'] === 'undefined') {
                //     this.newFilters['assignee'] = response.body.currentUser;
                //   }
                // } else {
                  if(typeof this.newFilters[key] === 'undefined') {
                    if(response.body.filtersData && response.body.filtersData.hasOwnProperty(key)) {
                      this.newFilters[key] = response.body.filtersData[key];
                    } else {
                      this.newFilters[key] = this.dropdowns[key].data[0].id;
                    }
                  }
                // }
              }
            }
            // if(this.dropdowns.hasOwnProperty('assignee') && response.body.currentUser && typeof this.newFilters['assignee'] === 'undefined'){
            //   this.newFilters['assignee'] = response.body.currentUser;
            // }
            for(var key in this.legend) {
              if(this.legend.hasOwnProperty(key)){
                this.selected[key] = this.legend[key].map(s => s.id);
              }
            }

            if(this.initial) {
              this.initial = false;
              this.filterChanged();
              success(null);
              return;
            }
            // if(response.body.filters.status instanceof Array && this.filters.status.length === 0){
            //   this.filters.status = response.body.filters.status;
            //   this.selected.status = response.body.filters.status.map(s => s.id);
            // }
            // if(response.body.filters.packageActions instanceof Array && this.filters.packageActions.length === 0){
            //   this.filters.packageActions = response.body.filters.packageActions;
            //   this.selectedPackageAction = this.filters.packageActions[0].id;
            // }
          }
          // if(response.body.currentUser && typeof this.selectedAssignee === 'undefined'){
          //   this.selectedAssignee = response.body.currentUser;
          // }
          success(response.body.events);
        }
      }, (response) => failure(response));
    },
    datesRender(info){
      this.renderTimeout = setTimeout(this.resizeFrame.bind(this), 1000);
    },
    filterChanged(){
      // console.log('selected assignee', this.selectedAssignee);
      this.$refs.calendar.getApi().refetchEvents();
    }
  },
  created() {
    this.$on('eventClick', () => console.log('eventClick', arguments));
  },
  mounted() {
    let
      _calendar = this.$refs.calendar
      , _calendarApi = _calendar.getApi()
    ;
    _calendar.$on('eventClick', this.eventClickHandle);
    //_calendar.$on('eventRender', this.eventRenderHandle);
  }
});
