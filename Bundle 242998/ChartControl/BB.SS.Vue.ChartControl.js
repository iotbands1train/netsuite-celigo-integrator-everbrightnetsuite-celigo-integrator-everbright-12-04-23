let _app = new Vue({
  el: '#app',
  components: {
    highcharts: HighchartsVue.Chart
  },
  data() {
    return {
      chartOptions: {
        credits: {
          enabled: false
        },
        chart: {
          type: 'column',
          animation: {
            duration: 1500,
            easing: 'easeOutBounce'
          }
        },
        title: false,
        // title: {
        //   text: 'Project Funnel by Status'
        // },
        xAxis: {
          categories: [
            'Total'
          ],
          crosshair: true
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Count'
          }
        },
        plotOptions: {
          column: {
            pointPadding: 0.1,
            borderWidth: 0,
            events: {
              click: (event) => {
                var _url = event.point.series.options.custom && event.point.series.options.custom.url
                  ? event.point.series.options.custom.url
                  : undefined;
                if(typeof _url === 'string' && _url.trim().length > 0) {
                  window.open(_url, '_blank');
                }
              }
            }
          }
        },
        series: []
      }
    };
  },
  methods: {
    resizeFrame(){
      let
        _iFrameCcEl = window.parent.document.getElementById(window.frameElement.id);
      ;
      _iFrameCcEl.style.height = `${this.$el.offsetHeight + 20}px`;
    },
    done() {
      this.$refs.chartholder.chart.hideLoading();
      this.$refs.chartholder.chart.redraw();
      this.resizeFrame();
    },
    getData(){
      let
        _self = this
        , _baseUrl = window.location
        , _process = ['process', 'data'].join('=')
        , _params = [_baseUrl, _process]
        , _url
      ;

      _url = _params.join('&');
      _self.$refs.chartholder.chart.showLoading();
      this.$http.get(_url).then((response) => {
        if (response.ok && response.status === 200 && response.body) {
          if(typeof response.body.yAxisTitle === 'string' && response.body.yAxisTitle.trim().length > 0){
            _self.$refs.chartholder.chart.yAxis[0].setTitle({ text: response.body.yAxisTitle });
          }
          if(response.body.series instanceof Array) {
            response.body.series.forEach(function(s){
              _self.$refs.chartholder.chart.addSeries(s, false);
            });
          }
        }
        _self.done();
      }, () => {
        _self.done();
      });
    },
  },
  mounted() {
    this.getData();
  }
});