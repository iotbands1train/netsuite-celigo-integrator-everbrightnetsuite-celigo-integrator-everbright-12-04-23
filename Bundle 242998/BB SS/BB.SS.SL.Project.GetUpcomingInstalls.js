/**
 * @NApiVersion 2.0
 * @NScriptType suitelet
 * @NModuleScope Public
 * @author Graham O'Daniel
 * 
 */

/**
 * Copyright 2017-2018 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['./SS Lib/BB.SS.Weather', 'N/search', './SS Lib/BB.SS.Projects', 'N/format', 'N/render'], function(weather, search, projectsModule, format, render) {
	const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const PROJECT_TEMPLATE = [
		'<tr class="forecast">',
		'	<td colspan="5">',
		'		<div class="projectid">${project.id}</div>',
		'		<div class="address">${project.installationAddress}</div>',
		'		<div class="phone"><a href="tel:${project.homeownerPhone}">${project.homeownerPhone}</a></div>',
		'	</td>',
		'	<#list project.forecast.forecast.forecastday as forecastday>',
		'		<#if forecastday_index == 7><#break></#if>',
		'		<td class="day">',
		'			<img src="https://${forecastday.day.condition.icon}" />',
		'			<#assign hoursByChanceOfRain = forecastday.hour?sort_by("chance_of_rain")?reverse()>',
		'			<div>Rain: ${hoursByChanceOfRain[0]}</div>',
		'		</td>',
			'</#list>',
		'</tr>'
	].join('\n');

	Date.prototype.addDays = function(days) {
		var dat = new Date(this.valueOf());
		dat.setDate(dat.getDate() + days);
		return dat;
	}

	function onRequest(context) {
		var html = [
			'<html>',
			'<head>',
			'<!-- Iframe Resizer library provided by David J Bradshaw -->',
			'<script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.15/iframeResizer.contentWindow.min.js"></script>',
			'<!-- Open Sans font provided by Google -->',
			'<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">',
			'<style>',
			'body {',
			'	width: 100%;',
			'}',
			'.day {',
			'	text-align: center;',
			'}',
			'.address {',
			'	white-space: pre-wrap;',
			'}',
			'table {',
			'	width: 100%',
			'}',
			'</style>',
			'</head>',
			'<body>'
		].join('\n');

		// Run the search
		var projectSearch = search.load({
			id: 'customsearch_bb_pm_proj_inst_rdy_for_pln'
		});

		var projects = [];
		projectSearch.run().each(function (result) {
			var project = new projectsModule.Project({internalId: result.id}).load();
			projects.push(generateProjectRow(project));
			return true;
		});

		var day = new Date();
		var headers = ['<th colspan="5">Project</th>'];

		for (var x=0; x < 7; x++) {
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
			'<table>',
			'<tr>',
			headers.join(''),
			'</tr>',
			projects.join('\n'),
			'</table>'
		].join('\n');

		html += [
			'</body>'
		].join('\n');

		context.response.write(html);
	}

	function generateProjectRow(project) {
		var html = '';
		var zip = project.installationZipCode;
		var forecast = weather.getForecastForZip(zip);
		project.forecast = forecast;
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
		onRequest: onRequest
	};

});