/**
 * @NApiVersion 2.0
 * @NScriptType portlet
 * @NModuleScope Public
 * @author Graham O'Daniel
 */
define(['./SS Lib/BB.SS.Weather', 'N/search', './SS Lib/BB.SS.Projects', 'N/format', 'N/render', 'N/record','N/runtime'], function(weather, search, project, format, render, record,runtime) {
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
		'				<span>${forecastday.Day.IconPhrase} - ${forecastday.Temperature.Maximum.Value}${forecastday.Temperature.Maximum.Unit}/${forecastday.Temperature.Minimum.Value}${forecastday.Temperature.Minimum.Unit}</span>',
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
		context.portlet.title = 'Installs Scheduled in Next 5 Days';
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

		var configId = getConfigId();
		if (configId) {
			var config = record.load({
				type: 'customrecord_bb_solar_success_configurtn',
				id: configId
			});
			var upcomingInstallSearch = config.getValue({
				fieldId: 'custrecord_bb_upcoming_install_search'
			})
			if (upcomingInstallSearch) {
				var projectSearch = search.load({
					id: upcomingInstallSearch
				});

				var projects = [];
				projectSearch.run().each(function (result) {
					if(runtime.getCurrentScript().getRemainingUsage()<40) return false;
					var currentProject = new project.Project({internalId: result.id}).load(); // TODO: Figure out a way to use a search instead of loading each one
					projects.push(generateProjectRow(currentProject));
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
					'<div style="text-align:right;">Data provided by <a href="http://www.accuweather.com"><img height="25" src="https://s3.us-east-2.amazonaws.com/solar-success/weather-icons/AW_Black_Small_preview.png"/></a></div>'
				].join('\n');

				context.portlet.html = html;
			} else {
				throw 'You must select a saved search on the configuration record to view this portlet. Please contact your system administrator.'
			}
		}
	}

	function generateProjectRow(projectData) {
		var html = '';
		projectData.forecast = weather.getForecastForZip(projectData.installationZipCode);
		var renderer = render.create();
		renderer.templateContent = PROJECT_TEMPLATE;
		renderer.addCustomDataSource({
			format: render.DataSource.OBJECT,
			alias: "project",
			data: projectData
		});
		html = renderer.renderAsString();
		return html;
	}

	function getDayOfWeek(date) {
		log.debug('date.getDay()', date.getDay());
		return DAYS[date.getDay()];
	}

	function getConfigId() {
		var id = '';
		var customrecord_bb_solar_success_configurtnSearchObj = search.create({
			type: "customrecord_bb_solar_success_configurtn",
			filters:
				[
				],
			columns:
				[
					search.createColumn({
						name: "internalid",
						summary: "MAX"
					})
				]
		});
		var searchResultCount = customrecord_bb_solar_success_configurtnSearchObj.runPaged().count;
		log.debug("customrecord_bb_solar_success_configurtnSearchObj result count",searchResultCount);
		customrecord_bb_solar_success_configurtnSearchObj.run().each(function(result){
			id = result.getValue({
				name: 'internalid',
				summary: 'MAX'
			});
			return true;
		});
		return id;
	}

	return {
		render: onRender
	};

});