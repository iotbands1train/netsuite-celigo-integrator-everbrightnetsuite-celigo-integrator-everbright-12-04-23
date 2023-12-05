<!--Div that will hold the pie chart-->
<div id="chart_div"></div>

<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
<script type="text/javascript">

    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart']});

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);

    // Callback that creates and populates a data table,
    // instantiates the pie chart, passes in the data and
    // draws it.
    function drawChart() {

    var data = google.visualization.arrayToDataTable([
        ['Band', '', '', { role: 'annotation' } ],
        <#list data.bands as band>
            <#if band_index != 0>,</#if> ['${band.name}', (${data.bands[0].value} - ${band.value})/2, ${band.value}, '${band.value}']
        </#list>
    ]);

    var options = {
        width: 600,
        height: 400,
        legend: { position: 'none' },
        bar: { groupWidth: '75%' },
        isStacked: true,
        series: {
            0: {color: 'transparent'},
            1: {color: '#888'}
        },
        hAxis: {
            textPosition: 'none',
            ticks: []
        },
        vAxis: {
            title: '${format.yaxistitle}'
        }
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
    chart.draw(data, options);
    }
</script>