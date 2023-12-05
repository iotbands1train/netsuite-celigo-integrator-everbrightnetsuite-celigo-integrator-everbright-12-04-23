/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @author Michael Golichenko
 * Date          Author        Remarks
 * 12/23/2022    adonato       Added function formatTime
 */

define([
	'N/search',
	'N/file',
	'N/render',
	'N/url',
	'N/format',
	'N/runtime',
	'N/cache',
	'../BB SS/SS Lib/BB_SS_MD_SolarConfig',
], function (
	searchModule,
	fileModule,
	renderModule,
	urlModule,
	formatModule,
	runtimeModule,
	cacheModule,
	solarConfigModule
) {
	const _processMap = {
		data: init,
	};
	function getSearchConfig(searchId) {
		var // _searchId = solarConfigModule.getConfiguration('custrecord_bb_proj_action_cal_search')
			_searchId = searchId,
			_search,
			_filterFunc = function (columns, regexp) {
				return columns.filter(function (c) {
					return regexp.test(c.label);
				});
			},
			_transformToObj = function (arr) {
				var _obj = {};
				arr.forEach(function (c) {
					var _split = c.label.split('.'),
						_key = _split[1],
						_title = _split[2];
					_obj[_key] = {
						key: _key,
						title: _title ? _title : '',
						column: c,
					};
				});
				return _obj;
			},
			_columns = {};
		if (_searchId) {
			_search = searchModule.load({id: _searchId});
			_columns.filters = _transformToObj(
				_filterFunc(_search.columns, /^filter/i)
			);
			_columns.dropdowns = _transformToObj(
				_filterFunc(_search.columns, /^dropdown/i)
			);
			_columns.legend = _filterFunc(_search.columns, /^legend/i)[0];
			_columns.title = _filterFunc(_search.columns, /^title$/i)[0];
			_columns.start = _filterFunc(_search.columns, /^start$/i)[0];
			_columns.end = _filterFunc(_search.columns, /^end$/i)[0];
			_columns.color = _filterFunc(_search.columns, /^color$/i)[0];
		}
		//log.debug('columns', _columns);
		return _columns;
	}

	function getStatusClass(statusText) {
		if (typeof statusText === 'string') {
			return statusText
				.replace(/\s\s+/g, ' ')
				.replace(/\s/g, '-')
				.toLowerCase();
		}
		return '';
	}

	function getFilterColumnName(column) {
		var _key = column.name;
		if (/formula/i.test(_key)) {
			_key = [_key, column.formula].join(': ');
		} else if (column.join) {
			_key = [column.join, _key].join('.').toLowerCase();
		}
		return _key;
	}

	function getFiltersDataNew(searchId) {
		var _data = {
				dropdowns: {},
				legend: {},
			},
			_currentUser = runtimeModule.getCurrentUser(),
			// , _searchId = solarConfigModule.getConfiguration('custrecord_bb_proj_action_cal_search')
			_searchId = searchId,
			_columns = getSearchConfig(_searchId),
			_search;

		for (var key in _columns.dropdowns) {
			if (!_columns.dropdowns.hasOwnProperty(key)) return;
			var _none,
				_dropdown = _columns.dropdowns[key];
			_data.dropdowns[key] = {
				key: key,
				label: _dropdown.title,
				data: [],
			};
			_data.dropdowns[key].data.push({id: 'all', text: '- All -'});
			_search = searchModule.load({id: _searchId});
			_search.columns = [
				searchModule.createColumn({
					name: _dropdown.column.name,
					join: _dropdown.column.join,
					summary: searchModule.Summary.GROUP,
					sort: searchModule.Sort.ASC,
				}),
			];
			_search.run().each(function (row) {
				_data.dropdowns[key].data.push({
					id: row.getValue({
						name: _dropdown.column.name,
						join: _dropdown.column.join,
						summary: searchModule.Summary.GROUP,
						sort: searchModule.Sort.ASC,
					}),
					text: row.getText({
						name: _dropdown.column.name,
						join: _dropdown.column.join,
						summary: searchModule.Summary.GROUP,
						sort: searchModule.Sort.ASC,
					}),
				});
				return true;
			});
			_none = _data.dropdowns[key].data.filter(function (f) {
				return f.id == '';
			});
			if (/assignee/i.test(key)) {
				if (
					_data.dropdowns[key].data.filter(function (emp) {
						return emp.id == _currentUser.id;
					}).length === 0
				) {
					_data.dropdowns[key].data.splice(1, 0, {
						id: _currentUser.id.toString(),
						text: _currentUser.name,
					});
				}
				if (!_none) {
					_data.dropdowns[key].data.splice(1, 0, {
						id: '',
						text: '- None -',
					});
				}
			}
			if (_none) {
				_data.dropdowns[key].data = _data.dropdowns[key].data.filter(function (
					f
				) {
					return f.id != '';
				});
				_data.dropdowns[key].data.splice(1, 0, {
					id: '',
					text: '- None -',
				});
			}
		}

		if (_columns.legend) {
			var _key = _columns.legend.label.split('.')[1],
				_colorColumn = _columns.color
					? JSON.parse(JSON.stringify(_columns.color))
					: undefined;
			if (_colorColumn) {
				_colorColumn.summary = searchModule.Summary.MIN;
			}

			_data.legend[_key] = [];
			_search = searchModule.load({id: _searchId});
			_search.columns = [
				searchModule.createColumn({
					name: _columns.legend.name,
					join: _columns.legend.join,
					summary: searchModule.Summary.GROUP,
					sort: searchModule.Sort.ASC,
				}),
			];
			if (_colorColumn) {
				_search.columns.push(searchModule.createColumn(_colorColumn));
			}
			_search.run().each(function (row) {
				var _status = row.getText({
						name: _columns.legend.name,
						join: _columns.legend.join,
						summary: searchModule.Summary.GROUP,
					}),
					_color = _colorColumn
						? row.getValue(_colorColumn)
						: getStatusClass(_status);
				_data.legend[_key].push({
					id: row.getValue({
						name: _columns.legend.name,
						join: _columns.legend.join,
						summary: searchModule.Summary.GROUP,
					}),
					text: /internal/i.test(_status) ? 'In Progress' : _status,
					class: _color,
				});
				return true;
			});
		}
		return _data;
	}

	function getDataGeneric(context) {
		var _request = context.request,
			_currentUser = runtimeModule.getCurrentUser(),
			_data = {
				events: [],
				filters: {},
				//, currentUser: runtimeModule.getCurrentUser().id.toString()
			},
			_cache,
			_params = _request.parameters,
			// TODO: search should be coming from deployment
			// , _searchId = solarConfigModule.getConfiguration('custrecord_bb_proj_action_cal_search')
			_searchId = _params.searchId,
			_search,
			_searchConfig = getSearchConfig(_searchId),
			_titleColumn,
			_nowDate = new Date(),
			_isInit =
				typeof _params.initial === 'string' && /t/i.test(_params.initial),
			_year = _params.year || _nowDate.getFullYear(),
			_month = _params.month || _nowDate.getMonth() + 1,
			_isWeekView =
				_params.hasOwnProperty('day') && !isNaN(parseInt(_params.day)),
			// , _assigned = _params.hasOwnProperty('assigned') ? _params.assigned : _data.currentUser
			_pa =
				_params.hasOwnProperty('pa') && !isNaN(parseInt(_params.pa))
					? _params.pa
					: undefined,
			_startDate,
			_endDate,
			_extraFilters = [];
		log.debug('_searchConfig', _searchConfig);
		if (_searchConfig.filters.year) {
			_extraFilters.push('AND', [
				getFilterColumnName(_searchConfig.filters.year.column),
				searchModule.Operator.LESSTHANOREQUALTO,
				_year,
			]);
		}
		if (_searchConfig.filters.month) {
			_extraFilters.push('AND', [
				getFilterColumnName(_searchConfig.filters.month.column),
				searchModule.Operator.LESSTHANOREQUALTO,
				_month,
			]);
		}
		if (_searchConfig.filters.yearend) {
			_extraFilters.push('AND', [
				getFilterColumnName(_searchConfig.filters.yearend.column),
				searchModule.Operator.GREATERTHANOREQUALTO,
				_year,
			]);
		}
		if (_searchConfig.filters.monthend) {
			_extraFilters.push('AND', [
				getFilterColumnName(_searchConfig.filters.monthend.column),
				searchModule.Operator.GREATERTHANOREQUALTO,
				_month,
			]);
		}

		if (_isWeekView) {
			_startDate = new Date(
				parseInt(_year),
				parseInt(_month) - 1,
				parseInt(_params.day)
			);
			_endDate = new Date(_startDate.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
			if (_startDate.getFullYear() != _endDate.getFullYear()) {
				_extraFilters = [
					'AND',
					[
						[
							[
								getFilterColumnName(_searchConfig.filters.year.column),
								searchModule.Operator.LESSTHANOREQUALTO,
								_startDate.getFullYear(),
							],
							'AND',
							[
								getFilterColumnName(_searchConfig.filters.month.column),
								searchModule.Operator.LESSTHANOREQUALTO,
								_startDate.getMonth() + 1,
							],
							'AND',
							[
								getFilterColumnName(_searchConfig.filters.yearend.column),
								searchModule.Operator.GREATERTHANOREQUALTO,
								_startDate.getFullYear(),
							],
							'AND',
							[
								getFilterColumnName(_searchConfig.filters.monthend.column),
								searchModule.Operator.GREATERTHANOREQUALTO,
								_startDate.getMonth() + 1,
							],
						],
						'OR',
						[
							[
								getFilterColumnName(_searchConfig.filters.year.column),
								searchModule.Operator.LESSTHANOREQUALTO,
								_endDate.getFullYear(),
							],
							'AND',
							[
								getFilterColumnName(_searchConfig.filter.month.column),
								searchModule.Operator.LESSTHANOREQUALTO,
								_endDate.getMonth() + 1,
							],
							'AND',
							[
								getFilterColumnName(_searchConfig.filters.yearend.column),
								searchModule.Operator.GREATERTHANOREQUALTO,
								_endDate.getFullYear(),
							],
							'AND',
							[
								getFilterColumnName(_searchConfig.filters.monthend.column),
								searchModule.Operator.GREATERTHANOREQUALTO,
								_endDate.getMonth() + 1,
							],
						],
					],
				];
				// end of extra filters
			} else if (_startDate.getMonth() != _endDate.getMonth()) {
				_extraFilters = [
					'AND',
					[
						getFilterColumnName(_searchConfig.filters.year.column),
						searchModule.Operator.LESSTHANOREQUALTO,
						_startDate.getFullYear(),
					],
					'AND',
					[
						getFilterColumnName(_searchConfig.filters.yearend.column),
						searchModule.Operator.GREATERTHANOREQUALTO,
						_startDate.getFullYear(),
					],
					'AND',
					[
						[
							[
								getFilterColumnName(_searchConfig.filters.month.column),
								searchModule.Operator.LESSTHANOREQUALTO,
								_startDate.getMonth() + 1,
							],
							'AND',
							[
								getFilterColumnName(_searchConfig.filters.monthend.column),
								searchModule.Operator.GREATERTHANOREQUALTO,
								_startDate.getMonth() + 1,
							],
						],
						'OR',
						[
							[
								getFilterColumnName(_searchConfig.filters.month.column),
								searchModule.Operator.LESSTHANOREQUALTO,
								_endDate.getMonth() + 1,
							],
							'AND',
							[
								getFilterColumnName(_searchConfig.filters.monthend.column),
								searchModule.Operator.GREATERTHANOREQUALTO,
								_endDate.getMonth() + 1,
							],
						],
					],
				];
			}
		}

		_cache = cacheModule.getCache({
			name: ['calendar_control', _searchId].join('__'),
			scope: cacheModule.Scope.PUBLIC,
		});

		if (_isInit) {
			// load cache
			_params = _cache.get({
				key: ['user', _currentUser.id].join('-'),
				loader: function () {
					return JSON.stringify(_params);
				},
			});
			_params = JSON.parse(_params);
			_data.filtersData = {};
		} else {
			_cache.put({
				key: ['user', _currentUser.id].join('-'),
				value: JSON.stringify(_params),
			});
		}

		for (var key in _params) {
			if (_params.hasOwnProperty(key)) {
				var _val = _params[key],
					_column = undefined;
				if (_searchConfig.dropdowns.hasOwnProperty(key)) {
					_column = getFilterColumnName(_searchConfig.dropdowns[key].column);
					if (_data.filtersData) {
						_data.filtersData[key] = _val;
					}
				}
				if (_column && typeof _val === 'string' && !/^all$/i.test(_val)) {
					if (_val.length === 0) {
						_val = '@NONE@';
					}
					_extraFilters = _extraFilters.concat([
						'AND',
						[_column, searchModule.Operator.ANYOF, [_val]],
					]);
				}
			}
		}

		if (_searchId) {
			_data.filters = getFiltersDataNew(_searchId);
			_search = searchModule.load({id: _searchId});

			// log.debug('_extraFilters', _extraFilters);

			if (_search.filterExpression.length > 0) {
				_search.filterExpression =
					_search.filterExpression.concat(_extraFilters);
			} else {
				_extraFilters.shift();
				_search.filterExpression =
					_search.filterExpression.concat(_extraFilters);
			}

			_search.run().each(function (row) {
				var _statusText = row.getText(_searchConfig.legend),
					_statusId = row.getValue(_searchConfig.legend),
					_color = _searchConfig.color
						? row.getValue(_searchConfig.color)
						: getStatusClass(_statusText);
				if (_data.filters.legend && _data.filters.legend.status) {
					if (!_statusText) {
						var _found = _data.filters.legend.status.filter(function (s) {
							return s.text == _statusId;
						})[0];
						if (_found) {
							_statusText = _found.text;
							_statusId = _found.id;
						}
					}
				}
				// log.debug('row values', row);
				// log.debug('_searchConfig.end', _searchConfig.end);
				var endDate =
					_searchConfig.end && row.getValue(_searchConfig.end)
						? new Date(row.getValue(_searchConfig.end))
						: undefined;
				if (endDate) endDate.setDate(endDate.getDate() + 1);
				var newDate = new Date(row.getValue(_searchConfig.start));
				var newDateTime = newDate.getTime() + 10 * 60 * 60 * 1000;
				var timenow = new Date(newDateTime);
				_data.events.push({
					id: row.id,
					status: _statusId,
					title: row.getValue(_searchConfig.title),
					allDay: true,
					start: formatTime(timenow),
					end: endDate
						? formatModule.parse({value: endDate, type: formatModule.Type.DATE})
						: null,
					url: urlModule.resolveRecord({
						recordType: row.recordType,
						recordId: row.id,
						isEditMode: true,
					}),
					classNames: [_color],
					order: _data.events.length,
				});
				// log.debug('data events array', _data.events);
				return true;
			});
		}
		return _data;
	}

	function init(context) {
		var _response = context.response,
			//, _data = getData(context)
			_newData = getDataGeneric(context);
		// log.debug('data', _newData);
		_response.setHeader({
			name: 'Content-Type',
			value: 'application/json; charset=utf-8',
		});
		_response.write({output: JSON.stringify(_newData)});
	}

	function render(context) {
		var _response = context.response,
			_request = context.request,
			_params = _request.parameters,
			_showWeekend = _params.weekend ? /t/i.test(_params.weekend) : false,
			_gridWeek = _params.week && /t/i.test(_params.week) ? 'Week' : 'Month',
			_templateRender,
			_regexStr,
			_htmlFile = fileModule.load({id: './BB.SS.CalendarControl.html'}),
			_html = _htmlFile.getContents();
		searchModule
			.create({
				type: 'file',
				filters: [
					['folder', searchModule.Operator.ANYOF, _htmlFile.folder],
					'AND',
					['filetype', searchModule.Operator.ANYOF, 'JAVASCRIPT'],
				],
				columns: ['name', 'url'],
			})
			.run()
			.each(function (result) {
				_regexStr = [
					'<script.* src="(',
					result.getValue('name'),
					')".*?>',
				].join('');
				_html = _html.replace(
					new RegExp(_regexStr, 'igm'),
					function (match, p1) {
						return match.replace(p1, result.getValue('url'));
					}
				);
				return true;
			});

		_templateRender = renderModule.create();
		_templateRender.templateContent = _html;

		_templateRender.addCustomDataSource({
			format: renderModule.DataSource.OBJECT,
			alias: 'form',
			data: {
				showWeekend: _showWeekend,
				type: _gridWeek,
			},
		});

		_html = _templateRender.renderAsString();

		_response.write(_html);
	}

	function onRequest(context) {
		const _method = context.request.method,
			_request = context.request,
			_params = _request.parameters,
			_process =
				typeof _params.process === 'string' && _params.process.trim().length > 0
					? _params.process.trim()
					: null;
		//try {
		if (_method === 'GET') {
			if (_process) {
				if (_processMap.hasOwnProperty(_process)) {
					_processMap[_process](context);
				}
			} else {
				render(context);
			}
		} else if (_method === 'POST') {
			if (_process) {
				if (_processMap.hasOwnProperty(_process)) {
					_processMap[_process](context);
				}
			}
		}
		// } catch (e) {
		//   log.error('error executing calendar control', e);
		// }
	}

	function formatTime(timenow) {
		var userObj = runtimeModule.getCurrentUser();
		var userPref = userObj.getPreference({
			name: 'timezone',
		});

		var dateFormated = formatModule.format({
			value: timenow,
			type: formatModule.Type.DATETIME,
			timezone: formatModule.Timezone.userPref,
		});

		var origHour = timenow.getDate();
		var toHour = new Date(dateFormated).getDate();
		var diff = toHour - origHour;
		if (diff > 0) {
			timenow.setDate(timenow.getDate() - diff);
		} else if (diff < 0) {
			timenow.setDate(timenow.getDate() + diff);
		}
		var time = timenow.getTime();
		var timenow = new Date(time);
		log.debug('diff', diff);

		log.debug('timenow', timenow);
		log.debug('userPref', userPref);
		log.debug('dateFormated', new Date(dateFormated).getHours());

		return timenow;
	}

	return {
		onRequest: onRequest,
	};
});
