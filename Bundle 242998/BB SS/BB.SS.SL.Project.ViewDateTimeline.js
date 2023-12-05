/**
 * @NApiVersion 2.0
 * @NScriptType suitelet
 * @NModuleScope Public
 * @author Graham O'Daniel
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

define(['./SS Lib/BB.SS.Projects', './SS Lib/moment.min', 'N/url', 'N/search', './SS Lib/BB_SS_MD_SolarConfig', 'N/runtime']
  , function(projectsModule, moment, url, search, solarConfig, runtimeModule) {
	const DATE_FORMAT = 'M/D/YYYY';

	function onRequest(context) {
		var images = getImageData(); // returns objects of image url's
		var html = '';
    var _script = runtimeModule.getCurrentScript();

		if (context.request.method !== 'GET') throw 'Requested method is not supported.';

		var projectId = context.request.parameters.projectId;
		var newVersion = context.request.parameters.new;
		if (!projectId) {
			context.response.write('Project ID has not been provided.');
			return;
		}

		var items = [];
		var _data;

		function getFieldByLabel(field, columns){
			var _result = [];
			columns.forEach(function(column){
				if(new RegExp(field, 'i').test(column.label)){
					_result.push(column);
				}
			});
			return _result[0];
		}
		function getMilestoneLine(searchData){
			var _fieldName = [this.id, this.startField].join('.');
			var _field = getFieldByLabel(_fieldName, searchData.columns);
			var _start = searchData.getValue(_field);
			if(_start){
				var image = ['<img src="', this.icon, '" />'].join('');
				return {
					id: this.id,
					content: [image, this.content].join('&nbsp;'),
					start: _start,
					group: this.group,
					title: moment(_start).format(DATE_FORMAT)
				}
			}
			return undefined;
		}
		function getPackageLine(searchData){
			var _startFieldName = [this.id, this.startField].join('.');
			var _startField = getFieldByLabel(_startFieldName, searchData.columns);
			var _endFieldName = [this.id, this.endField].join('.');
			var _endField = getFieldByLabel(_endFieldName, searchData.columns);
			var _start = searchData.getValue(_startField);
			var _end = searchData.getValue(_endField);
			var _image = ['<img src="', this.icon, '" />'].join('');

			var _title = [moment(_start).format(DATE_FORMAT), 'to'].join(' ');

			if (_end) {
				_title = [_title, moment(_end).format(DATE_FORMAT)].join(' ');
			} else {
				this.content = [this.content, '(Not Complete)'].join(' ');
				_title = [_title, 'present'].join(' ');
				_end = new Date();
			}

			this.content = ['<span>', this.content, '</span>'].join('');

			if (_start) {
				return {
					id: this.id,
					content: [_image, this.content].join('&nbsp;'),
					start: _start,
					end: _end,
					type: 'range',
					group: this.group,
					title: _title
				};
			}
			return undefined;
		}

		function getData(data){
			var
				_columns = data.columns
				, _groups = []
				, _fields = []
				, _group
				, _field
				, _items = []
			;

			_columns.forEach(function(column){
				var
					_columnSplit = column.label.split('.')
					, _type = _columnSplit[0]
					, _isGroup = /group/i.test(_type)
					, _isField = /range|single/i.test(_type)
					, _isRange = /range/i.test(_type)
				;

				if(_isGroup){
					if(_group){
						_groups.push(_group);
					}
					_group = {};
					_group.id = _columnSplit[1];
					_group.order = _columnSplit[2];
					_group.label = data.getValue(column);
					if(!_group.order){
						_group.order = (_groups.length + 1).toString()
					}
				} else if(_isField) {
					_field = {};
					_field.id = _columnSplit[1];
					_field.image = _columnSplit[2];
					_field.range = _isRange;
					_field.content = data.getValue(column);
					_field.group = _group.id;
					_field.valid = true;
					if(_isRange){
						_field.type = 'range';
						_field.completed = true;
					}
					if(typeof _field.image === 'string'){
						_field.image = _field.image.toUpperCase();
					}
					_fields.push(_field);
				} else {
					_field = _fields.filter(function(field){
						return field.id == _type;
					})[0];
					if(_field){
						if(_field.range){
							if(/start/i.test(_columnSplit[1])){
								_field.start = data.getValue(column);
							} else if(/end/i.test(_columnSplit[1])){
								_field.end = data.getValue(column);
								if(!_field.end){
									_field.end = new Date();
									_field.completed = false;
								}
							}
						} else {
							_field.start = data.getValue(column);
							if(!_field.start){
								_field.valid = false;
							}
						}
					}
				}
			});

			if(_group){
				_groups.push(_group);
			}

			_fields.forEach(function(field){
				if(field.range){
					if(!field.start){
						field.valid = false;
					} else {
						field.title = [moment(field.start).format(DATE_FORMAT), 'to'].join(' ');
						if (field.completed) {
							field.title = [field.title, moment(field.end).format(DATE_FORMAT)].join(' ');
						} else {
							field.content = [field.content, '(Not Complete)'].join(' ');
							field.title = [field.title, 'present'].join(' ');
						}
						field.content = ['<span>', field.content, '</span>'].join('');
					}
				}
				if(typeof field.image === 'string' && images.hasOwnProperty(field.image)){
					field.content = [
						['<img src="', images[field.image], '" />'].join('')
						, field.content
					].join('&nbsp;');
				}
			});

			_items = _fields.filter(function(field){ return field.valid; });
			_items.forEach(function(item){
				delete item.image;
				delete item.range;
				delete item.valid;
				delete item.completed;
			});

			return {
				groups: _groups
					.sort(function(a, b){ return b.order - a.order; })
					.map(function(group){ return { id: group.id, content: group.label }; })
				, items: _items
			}

		}

		// var _itemsConfig = {
		// 	'start':{
		// 		id: 'start',
		// 		startField: 'date',
		// 		content: 'Start',
		// 		icon: images.GREEN_FLAG,
		// 		group: 'milestone',
		// 		line: getMilestoneLine
		// 	},
		// 	'm0':{
		// 		id: 'm0',
		// 		startField: 'date',
		// 		content: 'Milestone 0',
		// 		icon: images.DOLLAR_SIGN,
		// 		group: 'milestone',
		// 		line: getMilestoneLine
		// 	},
		// 	'm1':{
		// 		id: 'm1',
		// 		startField: 'date',
		// 		content: 'Milestone 1',
		// 		icon: images.DOLLAR_SIGN,
		// 		group: 'milestone',
		// 		line: getMilestoneLine
		// 	},
		// 	'm2':{
		// 		id: 'm2',
		// 		startField: 'date',
		// 		content: 'Milestone 2',
		// 		icon: images.DOLLAR_SIGN,
		// 		group: 'milestone',
		// 		line: getMilestoneLine
		// 	},
		// 	'm3':{
		// 		id: 'm3',
		// 		startField: 'date',
		// 		content: 'Milestone 3',
		// 		icon: images.CHECKERED_FLAG,
		// 		group: 'milestone',
		// 		line: getMilestoneLine
		// 	},
		// 	'contract':{
		// 		id: 'contract',
		// 		startField: 'startDate',
		// 		endField: 'endDate',
		// 		content: 'Contract',
		// 		icon: images.DOCUMENT,
		// 		group: 'package',
		// 		line: getPackageLine
		// 	},
		// 	'design':{
		// 		id: 'design',
		// 		startField: 'startDate',
		// 		endField: 'endDate',
		// 		content: 'Design',
		// 		icon: images.DOCUMENT,
		// 		group: 'package',
		// 		line: getPackageLine
		// 	},
		// 	'siteAudit':{
		// 		id: 'siteAudit',
		// 		startField: 'startDate',
		// 		endField: 'endDate',
		// 		content: 'Site Audit',
		// 		icon: images.DOCUMENT,
		// 		group: 'package',
		// 		line: getPackageLine
		// 	},
		// 	'installationCompletion':{
		// 		id: 'installationCompletion',
		// 		startField: 'startDate',
		// 		endField: 'endDate',
		// 		content: 'Installation',
		// 		icon: images.DOCUMENT,
		// 		group: 'package',
		// 		line: getPackageLine
		// 	},
		// 	'finalAcceptance':{
		// 		id: 'finalAcceptance',
		// 		startField: 'startDate',
		// 		endField: 'endDate',
		// 		content: 'Final Acceptance',
		// 		icon: images.DOCUMENT,
		// 		group: 'package',
		// 		line: getPackageLine
		// 	},
		// 	'substantialCompletion':{
		// 		id: 'substantialCompletion',
		// 		startField: 'startDate',
		// 		endField: 'endDate',
		// 		content: 'Substantial Completion',
		// 		icon: images.DOCUMENT,
		// 		group: 'package',
		// 		line: getPackageLine
		// 	},
		// 	'equipmentShipDate':{
		// 		id: 'equipmentShipDate',
		// 		startField: 'date',
		// 		endField: 'date',
		// 		content: 'Equipment Ship Date',
		// 		icon: images.DOCUMENT,
		// 		group: 'package',
		// 		line: getPackageLine
		// 	}
		// };
		var _searchId = _script.getParameter({name: 'custscript_bb_proj_timeline_search'});

    if(!_searchId){
      _searchId = solarConfig.getConfiguration('custrecord_bb_project_timeline_search');
      if(_searchId) {
        _searchId = _searchId.value;
      }
    }


		if(_searchId){
			var _projectDataSearch = search.load({
				id: _searchId
			});
      if(_projectDataSearch.filterExpression.length > 0){
        _projectDataSearch.filterExpression = _projectDataSearch.filterExpression.concat(['AND', ['internalid', search.Operator.ANYOF, projectId]]);
      } else {
        _projectDataSearch.filterExpression = _projectDataSearch.filterExpression.concat([['internalid', search.Operator.ANYOF, projectId]]);
      }
			_data = _projectDataSearch.run().getRange({start: 0, end: 1})[0];
		}

		if(_data){
			_data = getData(_data);
		}

		// if(_data){
		// 	for (var key in _itemsConfig){
		// 		if(_itemsConfig.hasOwnProperty(key)){
		// 			items.push(_itemsConfig[key].line(_data))
		// 		}
		// 	}
		// }
		//
		// items = items.filter(function(element) { return typeof element !== 'undefined'});
		//
		// var groups = [
		// 	{ id: 'package', content: 'PACKAGES'},
		// 	{ id: 'milestone', content: 'MILESTONES'}
		// ]
		//
		var options = {
			clickToUse: true,
			showTooltips: true,
            zoomMin: 1000*60*60*24*31
		};

		html = [
			'<html>',
			'<head>',
      '<meta http-Equiv="Cache-Control" Content="no-cache" />',
      '<meta http-Equiv="Pragma" Content="no-cache" />',
      '<meta http-Equiv="Expires" Content="0" />',
			'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />',
			'<!-- Font Awesome used for icons -->',
			'<script src="https://use.fontawesome.com/9881c5f012.js"></script>',
			'<!-- Visualization library provided by visjs.org -->',
			'<script src="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.js"></script>',
			'<link href="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.css" rel="stylesheet" type="text/css" />',
			'<!-- Iframe Resizer library provided by David J Bradshaw -->',
			'<script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.15/iframeResizer.contentWindow.min.js"></script>',
			'<!-- Open Sans font provided by Google -->',
			'<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">',
			'<style type="text/css">',
			'.vis-item .vis-item-overflow {',
			'	overflow: visible;',
			'}',
			'body {',
			'	font-family: \'Open Sans\';',
			'	font-style: normal;',
			'	font-weight: 400;',
			'	src: local(\'Open Sans\'), local(\'OpenSans\');',
			'	font-size: 11;',
			'}',
			'img {',
			'	width: 16px;',
			'	height: 16px;',
			'	vertical-align:middle;',
			'}',
			'</style>',
			'</head>',
			'<body style="width:100%; padding:0; margin:0;">',
			'<br />',
			'<div id="projecttimeline"></div>',
			'<br />',
			'<script type="text/javascript">',
            '	var initialDrawComplete = false;',
			'	var container = document.getElementById("projecttimeline");',
			'	var items = new vis.DataSet(' + JSON.stringify(_data.items) + ');',
			'	var groups = new vis.DataSet(' + JSON.stringify(_data.groups) + ');',
			'	var options = ' + JSON.stringify(options) + ';',
            '	options.onInitialDrawComplete = function(){ initialDrawComplete = true; };',
			'	var timeline = new vis.Timeline(container, items, groups, options);',
            '	var focusEventListener = function(){ if(timeline.itemsData != null && !timeline.options.rollingMode && !initialDrawComplete){ timeline.emit("changed"); container.removeEventListener("focus", focusEventListener); } };',
            '	container.addEventListener("focus", focusEventListener);',
            '	var interval = setInterval(',
              'function(){ ',
                'if(timeline.initialRangeChangeDone && !timeline.initialDrawDone){ timeline.emit("changed"); } ',
                'if(timeline.initialRangeChangeDone && timeline.initialDrawDone){ clearInterval(interval); } ',
              '}, 1000);',
			'</script>',
			'</body>',
			'</html>'
		].join('\n');
		
		context.response.write(html);
	}

	function getFileURL(imageName){
		
		var fileSearchObj = search.create({
		    type: "file",
		    filters:
		    [
		        ["name","is",imageName]
		    ],
		    columns:
		    [
		       "url",
		    ]
		}).run().getRange({
			start: 0,
			end: 1
		});
		if (fileSearchObj.length > 0) {
			return fileSearchObj[0].getValue({
				name : 'url'
			});
		}
	}

	function getImageData() {
		var image = {};
		var domain = url.resolveDomain({
			hostType: url.HostType.APPLICATION,
		});
		var imageName = [{GREEN_FLAG: 'BB_GREEN_FLAG.png'}, {CHECKERED_FLAG: 'BB_CHECKERED_FLAG.png'}, {DOCUMENT: 'BB_DOCUMENT.png'}, {DOLLAR_SIGN: 'BB_DOLLAR_SIGN.png'}];
		image.GREEN_FLAG = 'https://' + domain + getFileURL(imageName[0].GREEN_FLAG);
		image.CHECKERED_FLAG = 'https://' + domain + getFileURL(imageName[1].CHECKERED_FLAG);
		image.DOCUMENT = 'https://' + domain + getFileURL(imageName[2].DOCUMENT);
		image.DOLLAR_SIGN = 'https://' + domain + getFileURL(imageName[3].DOLLAR_SIGN);

		return image;
	}

	return {
		onRequest: onRequest
	};
});