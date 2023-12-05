/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Michael Golichenko
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
define(['N/record', 'N/search', 'N/ui/serverWidget', 'N/format'],
    function(recordModule, searchModule, serverWidgetModule, formatModule) {

        var _export = {};
        var _class = function () {
            var _self = this;
            _self.context = undefined;
            _self.sublistId = undefined;
            _self.sublistLabel = undefined;
            _self.sublistRecordType = undefined;
            _self.tabId = undefined;
            _self.fieldMapping = {};
            _self.fields = {};
            _self.recordId = undefined;
            _self.searchFilter = undefined;
            _self.form = undefined;
            _self.record = undefined;
            _self.identifierFieldId = 'internalid';
            _self.hooks = {
                'before.insert': [],
                'after.insert': [],
                'before.item.insert': [],
                'after.item.insert': [],
                'before.update': [],
                'after.update': [],
                'before.item.update': [],
                'after.item.update': [],
                'before.delete': [],
                'after.delete': [],
                'before.item.delete': [],
                'after.item.delete': []
            }

            return _self;
        };
        _class.prototype.consturctor = _class;

        _class.prototype.eventExecute = function (event, data) {
            var _self = this;
            if (this.hooks.hasOwnProperty(event)) {
                this.hooks[event].forEach(function (fn) {
                    if (typeof data === 'undefined') {
                        data = [];
                    }
                    data.push(event);
                    fn.apply(_self, data);
                });
            }
        };
        _class.prototype.on = function (event, fn) {
            if (typeof fn === 'function' && this.hooks.hasOwnProperty(event)) {
                this.hooks[event].push(fn);
            }
            return this;
        }
        _class.prototype.setSublistId = function (sublistId) {
            this.sublistId = sublistId;
            return this;
        };
        _class.prototype.setSublistLabel = function (sublistLabel) {
            this.sublistLabel = sublistLabel;
            return this;
        }
        _class.prototype.setRecordId = function (recordId) {
            this.recordId = recordId;
            return this;
        };
        _class.prototype.setIdentifierFieldId = function (fieldId) {
            this.identifierFieldId = fieldId;
            return this;
        };
        _class.prototype.setFilter = function (filterFunction) {
            if (typeof filterFunction === 'function') {
                this.searchFilter = filterFunction;
            }
            return this;
        };
        _class.prototype.setTabId = function (tabId) {
            this.tabId = tabId;
            return this;
        };
        _class.prototype.setForm = function (form) {
            this.form = form;
            return this;
        };
        _class.prototype.setRecord = function (record) {
            this.record = record;
            return this;
        };
        _class.prototype.setSublistRecordType = function (sublistRecordType) {
            this.sublistRecordType = sublistRecordType;
            return this;
        };
        _class.prototype.setParentTab = function (tabId) {
            this.tabId = tabId;
            return this;
        };
        _class.prototype.setFieldMapping = function (sublistFieldId, recordFieldId, type, label, source, mandatory, displayType, formatType, useSetText) {
            var _self = this;
            _self.fieldMapping[recordFieldId] = {
                id: sublistFieldId,
                type: type,
                label: label,
                source: source,
                mandatory: mandatory,
                displayType: displayType,
                formatType: formatType,
                useSetText: useSetText ? useSetText : false
            };
            return _self;
        };
        _class.prototype.search = function () {
            var _self = this;
            var _columns = [];
            var _filter = _self.searchFilter ? _self.searchFilter() : undefined;
            for (var prop  in _self.fieldMapping) {
                if (_self.fieldMapping.hasOwnProperty(prop)) {
                    _columns.push(prop);
                }
            }
            return searchModule.create({
                type: _self.sublistRecordType,
                columns: _columns,
                filters: _filter
            });
        };
        _class.prototype.render = function (preRender, postRender) {
            if (typeof preRender === 'function') {
                preRender.call(this);
            }
            var _self = this;


            var _sublist = _self.form.addSublist({
                id: _self.sublistId,
                type: serverWidgetModule.SublistType.INLINEEDITOR,
                label: _self.sublistLabel,
                tab: _self.tabId
            });

            for (var prop in _self.fieldMapping) {
                if (_self.fieldMapping.hasOwnProperty(prop)) {
                    var _details = _self.fieldMapping[prop];
                    var _isArraySource = _details.source instanceof Array;
                    var _field = _sublist.addField({
                        id: _details.id,
                        type: _details.type,
                        label: _details.label,
                        source: _isArraySource ? undefined : _details.source
                    });
                    if (_details.mandatory) {
                        _field.isMandatory = _details.mandatory
                    }
                    if (_details.displayType) {
                        _field.updateDisplayType({
                            displayType: _details.displayType
                        });
                    }
                    if (_isArraySource){
                        _field.addSelectOption({text: '', value: ''});
                        for(var i = 0; i < _details.source.length; i++){
                            _field.addSelectOption(_details.source[i]);
                        }
                    }
                    _field.maxLength = 100;
                    _self.fields[prop] = _field;
                }
            }

            if (_self.recordId) {
                var _search = _self.search();
                var _lineNumber = 0;
                _search.run().each(function (record) {
                    for (var prop in _self.fieldMapping) {
                        if (_self.fieldMapping.hasOwnProperty(prop)) {
                            var _mapping = _self.fieldMapping[prop];
                            var _value = record.getValue({name: prop});
                            var _isArraySource = _mapping.source instanceof Array;
                            if(_mapping.useSetText && _isArraySource){
                                _value = record.getText({name: prop});
                                var _found = _mapping.source.filter(function (item) {
                                    return item.text == _value;
                                });
                                if(_found && _found.length == 1){
                                    _value = _found[0].value;
                                }
                            }
                            if (typeof _value === 'undefined' || _value == null || (typeof _value === 'string' && _value.trim().length == 0)) continue;
                            _sublist.setSublistValue({
                                id: _mapping.id,
                                line: _lineNumber,
                                value: _value
                            });
                        }
                    }
                    _lineNumber++;
                    return true;
                });
            }

            return this;
        };
        _class.prototype.upsert = function () {
            var _self = this;
            var _search = _self.search();
            var _remote = [];
            var _local = [];
            var _localLineCount = _self.record.getLineCount({sublistId: _self.sublistId});
            _search.run().each(function (record) {
                var _data = undefined;
                for (var prop in _self.fieldMapping) {
                    if (_self.fieldMapping.hasOwnProperty(prop)) {
                        if (typeof _data === 'undefined') {
                            _data = {};
                        }
                        var _value = record.getValue({name: prop});
                        var _text = record.getText({name: prop});
                        _data[prop] = {value: _value, text: _text};
                    }
                }
                if (_data) {
                    _remote.push(_data);
                }
                return true;
            });
            for (var i = 0; i < _localLineCount; i++) {
                var _data = undefined;
                for (var prop in _self.fieldMapping) {
                    if (_self.fieldMapping.hasOwnProperty(prop)) {
                        var _mapping = _self.fieldMapping[prop];
                        if (typeof _data === 'undefined') {
                            _data = {};
                        }
                        var _value = _self.record.getSublistValue({
                            sublistId: _self.sublistId,
                            fieldId: _mapping.id,
                            line: i
                        });
                        var _text = _self.record.getSublistText({
                            sublistId: _self.sublistId,
                            fieldId: _mapping.id,
                            line: i
                        });
                        _data[prop] = { value: _value, text: _text };
                    }
                }
                if (_data) {
                    _local.push(_data)
                }
            }

            var _insert = [];
            var _delete = [];
            var _update = [];
            var _ignore = [];

            _local.forEach(function (l) {
                var _identifier = l[_self.identifierFieldId].value;
                var _emptyIdentifier = !_identifier || (typeof _identifier === 'number' && (_identifier == 0 || isNaN(_identifier))) || (typeof  _identifier === 'string' && _identifier.trim().length == 0)
                if (_emptyIdentifier) {
                    _insert.push(l);
                } else {
                    _remote.forEach(function (r) {
                        var _remoteIdentifider = r[_self.identifierFieldId].value;
                        if (_identifier == _remoteIdentifider) {
                            var _updateStored = false;
                            for (var prop in r) {
                                if (r.hasOwnProperty(prop) && l.hasOwnProperty(prop)) {
                                    if((l[prop].useSetText && r[prop].text != l[prop].text) || (!l[prop].useSetText && r[prop].value != l[prop].value)){
                                        _update.push(l);
                                        _updateStored = true;
                                        break;
                                    }
                                }
                            }
                            if (!_updateStored) {
                                _ignore.push(l);
                            }
                        }
                    });
                }
            });
            var _notDeletingIds = _update.concat(_ignore).map(function (d) {
                return d[_self.identifierFieldId].value;
            });
            _delete = _remote.filter(function (r) {
                return _notDeletingIds.indexOf(r[_self.identifierFieldId].value) == -1;
            });

            // log.debug('_insert', _insert);
            // log.debug('_update', _update);
            // log.debug('_delete', _delete);
            // log.debug('_ignore', _ignore);

            this.internalInsert(_insert, _update, _delete, _ignore);
            this.internalUpdate(_update, _delete, _ignore);
            this.internalDelete(_delete, _ignore);

            return this;
        };

        _class.prototype.internalInsert = function (insertItems, updateItems, deleteItems, ignoreItems) {
            var _self = this;
            _self.eventExecute('before.insert', [insertItems, updateItems, deleteItems, ignoreItems]);
            insertItems.forEach(function (item) {
                _self.eventExecute('before.item.insert', [item]);
                var _record = recordModule.create({type: _self.sublistRecordType})
                for (var prop in item) {
                    if (item.hasOwnProperty(prop) && typeof item[prop] !== 'undefined') {
                        var _mapping = _self.fieldMapping[prop];
                        var _isArraySource = _mapping.source instanceof Array;
                        var _value = _mapping.useSetText ? item[prop].text : item[prop].value;
                        if (_mapping.formatType && typeof _value === 'string' && _value.trim().length > 0) {
                            _value = formatModule.parse({value: _value, type: _mapping.formatType});
                        }
                        if(_mapping.useSetText && _isArraySource) {
                            var _found = _mapping.source.filter(function (item) {
                                return item.value == _value;
                            });
                            if(_found && _found.length == 1){
                                _value = _found[0].text;
                            }
                            log.debug('setText', [prop, _value].join(' => '));
                            _record.setText({fieldId: prop, value: _value});
                        } else {
                            _record.setValue({fieldId: prop, value: _value});
                        }
                    }
                }
                _record.save();
                _self.eventExecute('after.item.insert', [item]);
            });
            _self.eventExecute('after.insert', [insertItems, updateItems, deleteItems, ignoreItems]);
        };
        _class.prototype.internalUpdate = function (updateItems, deleteItems, ignoreItems) {
            var _self = this;
            _self.eventExecute('before.update', [updateItems, deleteItems, ignoreItems]);
            updateItems.forEach(function (item) {
                _self.eventExecute('before.item.update', [item]);
                var _identifier = item[_self.identifierFieldId].value;
                var _values = {};
                var _record = recordModule.load({type: _self.sublistRecordType, id: _identifier});
                for(var prop in item){
                    if(item.hasOwnProperty(prop)){
                        var _mapping = _self.fieldMapping[prop];
                        var _isArraySource = _mapping.source instanceof Array;
                        var _value = _mapping.useSetText ? item[prop].text : item[prop].value;
                        if (_mapping.formatType && typeof _value === 'string' && _value.trim().length > 0) {
                            _value = formatModule.parse({value: _value, type: _mapping.formatType});
                        }
                        if(_mapping.useSetText && _isArraySource) {
                            var _found = _mapping.source.filter(function (item) {
                                return item.value == _value;
                            });
                            if(_found && _found.length == 1){
                                _value = _found[0].text;
                            }
                            log.debug('setText', [prop, _value].join(' => '));
                            _record.setText({fieldId: prop, value: _value});
                        } else {
                            _record.setValue({fieldId: prop, value: _value});
                        }
                        //_values[prop] = _mapping && _mapping.useSetText ? item[prop].text : item[prop].value;
                    }
                }
                _record.save();
                // recordModule.submitFields({
                //     type: _self.sublistRecordType,
                //     id: _identifier,
                //     values: _values
                // });
                _self.eventExecute('after.item.update', [item]);
            });
            _self.eventExecute('after.update', [updateItems, deleteItems, ignoreItems]);
        };
        _class.prototype.internalDelete = function (deleteItems, ignoreItems) {
            var _self = this;
            _self.eventExecute('before.delete', [deleteItems, ignoreItems]);
            deleteItems.forEach(function (item) {
                _self.eventExecute('before.item.delete', [item]);
                var _identifier = item[_self.identifierFieldId].value;
                recordModule.delete({
                    type: _self.sublistRecordType,
                    id: _identifier
                });
                _self.eventExecute('after.item.delete', [item]);
            });
            _self.eventExecute('after.delete', [deleteItems, ignoreItems]);
        };

        _export.createCustomSublist = function () {
            return new _class();
        };

        return {
            createCustomSublist: _export.createCustomSublist
        };

    });