/**
 * @NApiVersion 2.0
 * @NScriptType portlet
 * @author Graham O'Daniel
 * @NModuleScope public
 */
define(['./SS Lib/BB.SS.Weather', 'N/search', './SS Lib/BB.SS.Projects', 'N/format', 'N/render'], function(weather, search, project, format, render) {
	const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const PROJECT_TEMPLATE = [
		'<tr class="bb_forecast">',
		'	<td colspan="3">',
		'		<div class="bb_projectid"><a href="/app/site/hosting/scriptlet.nl?script=customscript_bb_ss_sl_recordviewer&deploy=customdeploy_bb_ss_sl_recordviewer&recordId=${project.internalId}&recordType=job">${project.id}</a></div>',
		'		<div class="bb_address">${project.installationAddress}</div>',
		'		<div class="bb_phone"><a href="tel:${project.homeownerPhone}">${project.homeownerPhone}</a></div>',
		'	</td>',
		'	<td colspan="2">',
		'		<#setting datetime_format="iso">',
		'		<div class="bb_installdate">${project.installationScheduledDate?split("T")[0]}</div>',
		'	</td>',
		'	<#list project.forecast.DailyForecasts as forecastday>',
		'		<#if forecastday_index == 5><#break></#if>',
		'		<td class="bb_day">',
		'			<div class="conditionimage tooltip">',
		'				<img src="https://s3.us-east-2.amazonaws.com/solar-success/weather-icons/${forecastday.Day.Icon}-s.png" />',
		'				<span>${forecastday.Day.IconPhrase}</span>',
		'			</div>',
		'		</td>',
			'</#list>',
		'</tr>'
	].join('\n');

	Date.prototype.addDays = function(days) {
		var dat = new Date(this.valueOf());
		dat.setDate(dat.getDate() + days);
		return dat;
	}

	function onRender(context) {
		context.portlet.title = 'Upcoming Projects';
		var html = [
			'<style>',
			'.bb_day {',
			'	text-align: center;',
			'}',
			'.bb_address {',
			'	white-space: pre-wrap;',
			'}',
			'.bb_table {',
			'	width: 100%;',
			'	padding: 0;',
			'	margin: 0;',
			'}',
			'div.tooltip span {display: none; position: absolute; bottom: 0; left: 0; right: 0; background: #333; color: #fff; }',
			'div.tooltip:hover span {display: block; }',
			'.bb_table tr:nth-child(even) {background: #EEE}',
			'.bb_table tr:nth-child(odd) {background: #FFF}',
			'</style>',
		].join('\n');

		// Run the search
		var projectSearch = search.load({
			id: 'customsearch_bb_pm_proj_inst_rdy_for_pln'
		});

		var projects = [];
		projectSearch.run().each(function (result) {
			var project = new BB.SS.Projects.Project({internalId: result.id}).load(); // TODO: Figure out a way to use a search instead of loading each one
			projects.push(generateProjectRow(project));
			return true;
		});

		var day = new Date();
		var headers = ['<th colspan="3">Project</th>', '<th colspan="2">Scheduled</th>'];

		for (var x=0; x < 5; x++) {
			if (x == 0) {
				headers.push('<th>Today</th>');
			} else if (x == 1) {
				headers.push('<th>Tomorrow</th>');
			} else {
				headers.push('<th>' + getDayOfWeek(day) + '</th>');
			}
			day = day.addDays(1);
		}

		html += [
			'<table class="bb_table">',
			'<tr>',
			headers.join(''),
			'</tr>',
			projects.join('\n'),
			'</table>'
		].join('\n');

		html += [
			'<div>Data provided by <a href="http://www.accuweather.com"><img height="30" src="https://s3.us-east-2.amazonaws.com/solar-success/weather-icons/AW_Black_Small_preview.png"/></a></div>'
		].join('\n');

		context.portlet.html = html;
	}

	function generateProjectRow(project) {
		var html = '';
		project.forecast = weather.getForecastForZip(project.installationZipCode);
		var renderer = render.create();
		renderer.templateContent = PROJECT_TEMPLATE;
		renderer.addCustomDataSource({
			format: render.DataSource.OBJECT,
			alias: "project",
			data: project
		});
		html = renderer.renderAsString();
		return html;
	}

	function getDayOfWeek(date) {
		log.debug('date.getDay()', date.getDay());
		return DAYS[date.getDay()];
	}

	return {
		render: onRender
	};

});