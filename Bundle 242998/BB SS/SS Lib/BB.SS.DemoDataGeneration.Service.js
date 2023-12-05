/**
 * This is a Demo data generation service module
 *
 * @exports BB.SS.DemoDataGeneration.Service
 *
 * @copyright Blue Banyan Solutions
 * @author Michael Golichenko <mgolichenko@bluebanyansolutions.com>
 * @version 0.0.1
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 **/

function DemoDataGenerationService (searchModule, recordModule, formatModule, transform, createPoWorkflow, solarConfig, accrualJournalWorkflow, documentStatus){
    var _recordTypes = {
            DEMO_DATA_SEARCH_RECORD_TYPE: 'customrecord_bb_ss_demo_data_search',
            UTILITY_COMPANY_RECORD_TYPE: 'customrecord_bb_utility_company',
            FORECAST_TYPE_TYPE: 'customlist_bb_forecast_type',
            BOM_DATA_TYPE: 'customrecord_bb_ss_demo_data_bom_data',
            DEMO_ADDERS_DATA_TYPE: 'customrecord_bb_ss_demo_data_adders_data',
            PROJECT_BOM_TYPE: 'customrecord_bb_project_bom',
            SCHEDULED_SCRIPT_ID: 'customscript_bb_ss_demo_data_generation',
            DEPLOYMENT_SCHEDULED_SCRIPT_ID_EXEC: 'customdeploy_bb_ss_demo_data_gen_exec',
            PROJECT_ADDER_TYPE: 'customrecord_bb_project_adder',
            ITEM_TYPE: 'item',
            EPC_ROLE_TYPE: 'customlist_bb_epc_role',
            PROJECT_TYPE: 'job'
        },
        _fields = {
            IS_INACTIVE: 'isinactive',
            SEARCH_SEQUENCE_FIELD: 'custrecord_bb_ss_demo_data_search_seq',
            SEARCH_REF: 'custrecord_bb_ss_demo_data_search_ref',
            UTILITY_COMPANY_STATE: 'custrecord_bb_utility_company_state',
            BOM_MIN_KW: 'custrecord_bb_ss_demo_data_bom_min_kw',
            BOM_MAX_KW: 'custrecord_bb_ss_demo_data_bom_max_kw',
            BOM_ITEM: 'custrecord_bb_ss_demo_data_bom_item',
            BOM_QTY: 'custrecord_bb_ss_demo_data_bom_qty',
            PROJECT_BOM_PROJECT: 'custrecord_bb_project_bom_project',
            PROJECT_BOM_ITEM: 'custrecord_bb_project_bom_item',
            PROJECT_BOM_QTY: 'custrecord_bb_project_bom_quantity',
            DATA_ADDER_SEQ: 'custrecord_bb_ss_sequence_number',
            DATA_ADDER_FORMULA: 'custrecord_bb_ss_formula_text',
            DATA_ADDER_LIST: 'custrecord_bb_ss_demo_data_adder',
            PROJECT_ADDER_PROJECT: 'custrecord_bb_project_adder_project',
            PROJECT_ADDER_ADDER_ITEM: 'custrecord_bb_adder_item',
            PROJECT_ADDER_RESPONSIBILITY: 'custrecord_bb_adder_responsibility',
            PROJECT_ADDER_PRICING_METHOD: 'custrecord_bb_adder_pricing_method',
            PROJECT_ADDER_PRICE_AMOUNT: 'custrecord_bb_adder_price_amt',
            PROJECT_ADDER_QTY: 'custrecord_bb_quantity',
            ITEM_CATEGORY: 'custitem_bb_item_category',
            ITEM_PRICING_METHOD: 'custitem_bb_adder_pricing_method',
            ITEM_RESPONSIBILITY: 'custitem_bb_adder_responsibility',
            ITEM_FIXED_PRICE: 'custitem_bb_adder_fixed_price_amt',
            SUB_ORIGINATOR_VENDOR: 'custentity_bb_originator_vendor',
            SUB_INSTALLER_VENDOR: 'custentity_bb_installer_partner_vendor',
            EPC_ROLE: 'custentity_bb_epc_role',
            CREATED_FROM_SALES_ORDER: 'custbody_bb_ss_created_from_so',
            JOB_TYPE: 'jobtype'
        },
        _mapping = {
            project: 'job',
            salesorder: 'salesorder',
            purchaseorder: 'purchaseorder',
            vendorbill: 'vendorbill',
            itemreceipt: 'itemreceipt',
            customerpayment: 'customerpayment',
            project_action: 'customrecord_bb_project_action',
            lead: 'lead',
            leaddata: 'customrecord_bb_ss_demo_data_lead_init',
            proposal: 'customrecord_bb_proposal',
            invoice: 'invoice',
            itemfulfillment: 'itemfulfillment'
        },
        _searches = {
            TEMPLATE_PROJECTS: 'customsearch_bb_ss_demo_data_proj_tpl',
            ACTIVE_ADDERS: 'customsearch_bb_ss_active_adders',
            SUB_INSTALLER_VENDORS: 'customsearch_bb_demo_data_sub_installer',
            SUB_ORIGINATOR_VENDORS: 'customsearch_bb_demo_data_sub_originator'
        },
        _parameters = {
            SEARCH_ID: 'custscript_next_search_id'
        },
        _adderPricingMethods = {
            FIXED: '1',
            PER_FOOT: '3',
            PER_WATT: '2'
        },
        _forecastTypes,
        _utilityCompanies,
        _templateProjects,
        _subInstallerVendors,
        _subOriginatorVendors,
        _epcRoles,
        _bomData,
        _demoAddersData,
        _addersData,
        _sleep = function (sleepDuration) {
            var now = new Date().getTime();
            while(new Date().getTime() < now + sleepDuration){ /* do nothing */ }
        },
        _randomBool = function() {
            return Math.random() >= 0.5;
        };

    var _export = {};

    /*
     *  ALL BUSINESS LOGIC FUNCTIONS
     */

    /**
     * <code>processDemoDataGeneration</code> function
     *
     * @governance 25+
     *
     * @param runtimeModule {runtime} Netsuite runtime module
     * @param taskModule {task} Netsuite task module
     * @return {void}
     *
     * @static
     * @function processDemoDataGeneration
     */
    function processDemoDataGeneration(runtimeModule, taskModule){
        var _searchIds = getListOfSearchIds();
        var _script = runtimeModule.getCurrentScript();
        var _searchId = _script.getParameter({name: _parameters.SEARCH_ID});
        var _mainExecution = typeof _searchId !== 'number' || _searchId == 0;
        var _searchIdsLength = _searchIds.length;
        var _searchIdIndex = _searchIds.indexOf(_searchId);
        var _nextSearchId = _searchIdIndex >= 0 && _searchIdIndex + 1 < _searchIdsLength ? _searchIds[_searchIdIndex + 1] : -1;

        if(_mainExecution && _searchIdsLength > 0){
            log.debug('Executing main task', '');
            _nextSearchId = _searchIds[0];
        } else if(typeof _searchId === 'number' && _searchId > 0) {
            log.debug(['Executing search: ', _searchId].join(''), ['Next search: ', _nextSearchId].join(''));
            searchExecution(_searchId);
        }
        if(_nextSearchId > 0) {
            var _taskParameters = {};
            _taskParameters[_parameters.SEARCH_ID] = _nextSearchId;
            var _createdScheduledScriptTask = taskModule.create({
                taskType: taskModule.TaskType.SCHEDULED_SCRIPT,
                scriptId: _recordTypes.SCHEDULED_SCRIPT_ID,
                deploymentId: _recordTypes.DEPLOYMENT_SCHEDULED_SCRIPT_ID_EXEC,
                params: _taskParameters
            });
            var _createdTaskId = _createdScheduledScriptTask.submit();
        }
    }

    function searchExecution(id){
        var _data = executeSearch(id),
            _loadFields = getLoadFields(_data.columns),
            _voidFields = getVoidFields(_data.columns),
            _createFields = getCreateFields(_data.columns),
            _setFields = getSetFields(_data.columns);
        _data.rows.forEach(function(row){
            var _updates = {},
                _creates = {};
            _loadFields.forEach(function(load){
                var _id = row.getValue(load.column);
                if(load.type && _id && _id > 0){
                    _updates[load.type] = {type: load.type, id: _id, values: {}, update: false};
                }
            });
            _createFields.forEach(function(create){
                if(create.type){
                    _creates[create.type] = {type: create.type, values: {}, create: false}
                }
            })
            _setFields.forEach(function(set){
                var _value = row.getValue(set.column);
              	var _columnJsonData = JSON.parse(JSON.stringify(set.column));
                if(set.column.name == 'formuladate' && _value){
                    _value = formatModule.parse({value: _value, type: formatModule.Type.DATE});
                } else if(set.column.name == 'formuladatetime' && _value){
                    _value = formatModule.parse({value: _value, type: formatModule.Type.DATETIME});
                } else if(_columnJsonData.type == 'date' && _value) {
                    _value = formatModule.parse({value: _value, type: formatModule.Type.DATE});
                } else if(_columnJsonData.type == 'datetime' && _value) {
                    _value = formatModule.parse({value: _value, type: formatModule.Type.DATETIME});
                } else if (set.column.name == 'formulatext' && _value && /^(t|f)$/i.test(_value) && ['isperson'].indexOf(set.field) === -1){
                    _value = /^t$/i.test(_value);
                }
                if(_updates[set.type] && set.field){
                    _updates[set.type].update = true;
                    if(isFunction(_value)){
                        _value = executeFunction(_value);
                    }
                    _updates[set.type].values[set.field] = _value;
                } else if(_creates[set.type] && set.field){
                    _creates[set.type].create = true;
                    if(isFunction(_value)){
                        _value = executeFunction(_value);
                    }
                    _creates[set.type].values[set.field] = _value;
                }
            });
            for(var prop in _creates){
                if(_creates.hasOwnProperty(prop) && _creates[prop].create){
                    var _record = recordModule.create({
                        type: _creates[prop].type
                    });
                    for(var field in _creates[prop].values){
                        var _v = _creates[prop].values[field],
                            _f = _record.getField({fieldId: field});
                        if(_f.type == formatModule.Type.CHECKBOX && _v == 'T'){
                            _v = true;
                        }
                        _record.setValue({fieldId: field, value: _v});
                    }
                    _record.save();
                }
            }
            for(var prop in _updates){
                if(_updates.hasOwnProperty(prop) && _updates[prop].update){
                    delete _updates[prop].update;
                    updateRecord(_updates[prop]);
                }
            }
            _voidFields.forEach(function(voidField){
                var _value = row.getValue(voidField.column);
                if(isFunction(_value)){
                    executeFunction(_value);
                }
            });
        });
    }

    function createProject(leadId){
        try {
            if(transform && transform.onAction){
                var _lead = recordModule.load({type: _mapping.lead, id: leadId});
                if(_lead){
                    transform.onAction({newRecord: _lead});
                }
            } else {
                throw 'Transform is not loaded';
            }
        } catch (e) {
            log.error('Demo data lead to project', ['Lead internal ID: ', leadId].join(''));
        }
    }

    function createPurchaseOrder(salesOrderId){
        try {
            if(createPoWorkflow && createPoWorkflow.onAction){
                var _so = recordModule.load({type: _mapping.salesorder, id: salesOrderId});
                if(_so){
                    createPoWorkflow.onAction({newRecord: _so});
                }
            } else {
                throw 'Create Purchase Order Workflow is not loaded';
            }
        } catch (e) {
            log.error('Exception', e);
            log.error('Purchase Order Workflow', ['Sales Order internal ID: ', salesOrderId].join(''));
        }
    }

    function createItemReceipt(purchaseOrderId){
        if(typeof purchaseOrderId === 'number'){
            var ir = recordModule.transform({fromType: _mapping.purchaseorder, fromId: purchaseOrderId, toType: _mapping.itemreceipt});
            ir.save();
        }
    }

    function createPayment(fromType, id, toType, createDateOverride){
        var trans = recordModule.transform({fromType: fromType, fromId: id, toType: toType});
        var createDateOverrideFormated = typeof createDateOverride === 'string' ? formatModule.parse({value: createDateOverride, type: formatModule.Type.DATE}): '';
        if(createDateOverrideFormated && typeof createDateOverrideFormated !== 'string'){
            trans.setValue({fieldId: 'trandate', value: createDateOverrideFormated});
        }
        trans.save();
    }

    function createEquipmentVendorBill(purchaseOrderId, createDateOverride){
        if(typeof purchaseOrderId === 'number'){
            var configItem = solarConfig.getConfigurations(['custrecord_bb_shipping_item']);
            var shippingItem = configItem['custrecord_bb_shipping_item'].value;
            var purchaseOrder = recordModule.load({type: _mapping.purchaseorder, id: purchaseOrderId});
            var soId = purchaseOrder.getValue({fieldId: _fields.CREATED_FROM_SALES_ORDER});
            var so = recordModule.load({type: _mapping.salesorder, id: soId});
            var soTotal = so.getValue({fieldId: 'total'});
            var bill = recordModule.transform({fromType: _mapping.purchaseorder, fromId: purchaseOrderId, toType: _mapping.vendorbill, isDynamic: true});
            var createDateOverrideFormated = typeof createDateOverride === 'string' ? formatModule.parse({value: createDateOverride, type: formatModule.Type.DATE}): '';
            if(createDateOverrideFormated && typeof createDateOverrideFormated !== 'string'){
                bill.setValue({fieldId: 'trandate', value: createDateOverrideFormated});
            }
            if(shippingItem && soTotal){
                var shippingAmount = soTotal * 0.1;
                bill.selectNewLine('item');
                bill.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: shippingItem
                });
                bill.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: 1
                });
                bill.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    value: shippingAmount
                });
                bill.commitLine('item');
            }
            bill.save();
        }
    }

    function setSubInstallerOriginator(projectId){
        var _hasSubInstaller = _randomBool(),
            _hasSubOriginator = _randomBool(),
            _subInstallers = loadSubInstallerVendors(),
            _subOriginators = loadSubOriginatorVendors(),
            _randomSubInstallerIdx = getRandomInt(0, _subInstallers.length),
            _randomSubOriginatorIdx = getRandomInt(0, _subOriginators.length),
            _project = {type: _mapping.project, id: projectId, values: {}},
            _updated = false;
        if(_hasSubInstaller && _randomSubInstallerIdx > -1){
            _updated = true;
            _project.values[_fields.SUB_INSTALLER_VENDOR] = _subInstallers[_randomSubInstallerIdx].id;
        }
        if(_hasSubOriginator && _randomSubOriginatorIdx > -1){
            _updated = true;
            _project.values[_fields.SUB_ORIGINATOR_VENDOR] = _subOriginators[_randomSubOriginatorIdx].id;
        }
        if(_updated){
            updateRecord(_project);
        }
    }

    function setEpcRole(projectId){
        var _epcRoles = loadEpcRoles(),
            _randomEpcRolesIdx = getRandomInt(0, _epcRoles.length),
            _project = {type: _mapping.project, id: projectId, values: {}};
        _project.values[_fields.EPC_ROLE] = _epcRoles[_randomEpcRolesIdx].id;
        updateRecord(_project);

    }

    function getRandomUtilityCompanyId(stateInternalId){
        var _companies = loadUtilityCompanies(),
            _filteredCompanies = _companies.filter(function(company){
                var _state = company.getValue({name: _fields.UTILITY_COMPANY_STATE});
                return _state == stateInternalId;
            }),
            _randomIdx = getRandomInt(0, _filteredCompanies.length);
        if(_filteredCompanies.length == 0){
            return undefined;
        }
        return _filteredCompanies[_randomIdx].id;
    }

    function getRandomForecastTypeId(){
        var _types = loadForecastTypes(),
            _randomIdx = getRandomInt(0, _types.length);
        if(_types.length == 0){
            return undefined;
        }
        return _types[_randomIdx].id;
    }

    function getRandomProjectTemplateId(){
        var _templates = loadTemplateProjects(),
            _randomIdx = getRandomInt(0, _templates.length);
        if(_templates.length == 0){
            return undefined;
        }
        return _templates[_randomIdx].id;
    }

    function createProjectBoms(projectId, systemSize){
        var _project = recordModule.load({ type: _recordTypes.PROJECT_TYPE, id: projectId });
        var _projectType = _project.getText({ fieldId: _fields.JOB_TYPE });
        var _epcRole = '';
        if (_projectType === 'EPC') {
            _epcRole = _project.getText({ fieldId: _fields.EPC_ROLE });
        }
        if (_epcRole !== 'Originator') {
            var _loadedBomData = loadBomData(),
                _projectBomData = _loadedBomData.filter(function(bom){
                    var _minKw = bom.getValue({name: _fields.BOM_MIN_KW}),
                        _maxKw = bom.getValue({name: _fields.BOM_MAX_KW});
                    return systemSize >= _minKw && systemSize <= _maxKw;
                });
            _projectBomData.forEach(function(bom){
                var _item = bom.getValue({name: _fields.BOM_ITEM}),
                    _qty = bom.getValue({name: _fields.BOM_QTY}),
                    _record = recordModule.create({
                        type: _recordTypes.PROJECT_BOM_TYPE
                    });
                _record.setValue({fieldId: _fields.PROJECT_BOM_PROJECT, value: projectId});
                _record.setValue({fieldId: _fields.PROJECT_BOM_ITEM, value: _item});
                _record.setValue({fieldId: _fields.PROJECT_BOM_QTY, value: _qty});
                _record.save();
            });
        }
    }

    function createProjectAdders(projectId, systemSize, feet){
      log.debug('creatProjectAddders start', [projectId, systemSize, feet]);
        var _loadedDemoAddersData = loadDemoAddersData(),
            _loadedAddersData = loadAdders(),
            _systemSizeWatts = typeof systemSize === 'number' ? Math.round(systemSize * 1000) : 0,
            _feet = typeof feet === 'number' ? feet : 0,
            _addersToAdd = [];
      	log.debug('loadedDemoAddersData', _loadedDemoAddersData);
        _loadedDemoAddersData.sort(function (a, b) {
            return parseInt(a.getValue({name: _fields.DATA_ADDER_SEQ})) - parseInt(b.getValue({name: _fields.DATA_ADDER_SEQ}));
        });
      	log.debug('sorted loadedDemoAddersData', _loadedDemoAddersData);
        _loadedDemoAddersData.forEach(function(el){
            var _formula = el.getValue({name: _fields.DATA_ADDER_FORMULA}),
                _addersInternalIdsString = el.getValue({name: _fields.DATA_ADDER_LIST}),
                _addersInternalIds = _addersInternalIdsString.split(',').map(Number);
            if(isFunction(_formula)){
              	log.debug('before execute formula function', _formula);
                _addersToAdd = executeFunction(_formula, _systemSizeWatts, _addersInternalIds, _addersToAdd);
              	log.debug('after execute formula function', _addersToAdd);
            }
        });
        if(_addersToAdd.length > 0){
          	log.debug('before filter adders', '');
            var _filteredAdders = _loadedAddersData.filter(function(el){
               return _addersToAdd.indexOf(parseInt(el.id)) > -1;
            });
          	log.debug('after filter adders', _filteredAdders);
            if(_filteredAdders.length > 0){
                _filteredAdders.forEach(function(el){
                    var _createProjectAdder = recordModule.create({
                        type: _recordTypes.PROJECT_ADDER_TYPE
                    }),
                    _qty = 0;
                    switch (el.getValue({name: _fields.ITEM_PRICING_METHOD})) {
                        case _adderPricingMethods.FIXED:
                            _qty = 1;
                            break;
                        case _adderPricingMethods.PER_FOOT:
                            _qty = _feet;
                            break;
                        case _adderPricingMethods.PER_WATT:
                            //_qty = _systemSizeWatts;
                            break;
                    }
                    _createProjectAdder.setValue({fieldId: _fields.PROJECT_ADDER_PROJECT, value: projectId});
                    _createProjectAdder.setValue({fieldId: _fields.PROJECT_ADDER_ADDER_ITEM, value: el.id});
                    if(_qty > 0){
                        _createProjectAdder.setValue({fieldId: _fields.PROJECT_ADDER_QTY, value: _qty});
                    }

                    _createProjectAdder.setValue({fieldId: _fields.PROJECT_ADDER_RESPONSIBILITY, value: el.getValue({name: _fields.ITEM_RESPONSIBILITY})});
                    _createProjectAdder.setValue({fieldId: _fields.PROJECT_ADDER_PRICING_METHOD, value: el.getValue({name: _fields.ITEM_PRICING_METHOD})});
                    _createProjectAdder.setValue({fieldId: _fields.PROJECT_ADDER_PRICE_AMOUNT, value: el.getValue({name: _fields.ITEM_FIXED_PRICE})});
					log.debug('before project action save','');
                    _createProjectAdder.save();
                    log.debug('after project action save', '');
                });
            }
        }
      log.debug('creatProjectAddders end', [projectId, systemSize, feet]);
    }

    function createAccrualJE(projectId){
        try {
            if(accrualJournalWorkflow && accrualJournalWorkflow.onAction){
                var _project = recordModule.load({type: _mapping.project, id: projectId});
                if(_project){
                    accrualJournalWorkflow.onAction({newRecord: _project});
                }
            } else {
                throw 'Accrual Journal Workflow is not loaded';
            }
        } catch (e) {
            log.error('Exception', e);
            log.error('Accrual Journal Workflow', ['Project internal ID: ', projectId].join(''));
        }

    }

    function getDocumentStatusId(packageId, statusType, approvedByFilter) {
        var _documentStatuses = documentStatus.findDocumentStatusByPackageAndStatusType(packageId, statusType);
        // log.debug('getDocumentStatusId called',{
        //     packageId: packageId,
        //     statusType: statusType,
        //     approvedByFilter: approvedByFilter
        // });
        log.debug('document statuses', _documentStatuses);
        if(typeof approvedByFilter === 'string' && approvedByFilter.length > 0){
            _documentStatuses = _documentStatuses.filter(function(status) {
                var _regex = new RegExp(approvedByFilter, 'i');
                var _name = status.getValue({name: 'name'});
                log.debug('Document Status Type/Name Test', {
                    '_regex': _regex.toString(),
                    '_name': _name,
                    'test result': _regex.test(_name)
                });
                return _regex.test(_name);
            });
        }
        return _documentStatuses[0] ? _documentStatuses[0].id : undefined;
    }

    function loadBomData(){
        if(!_bomData){
            _bomData = [];
            searchModule.create({
                type: _recordTypes.BOM_DATA_TYPE,
                filters: [{name: _fields.IS_INACTIVE, operator: 'is', values: ['F']}],
                columns: [_fields.BOM_MIN_KW, _fields.BOM_MAX_KW, _fields.BOM_ITEM, _fields.BOM_QTY]
            }).run().each(function(bom){
                _bomData.push(bom);
                return true;
            })
        }
        return _bomData;
    }

    function loadDemoAddersData() {
        if(!_demoAddersData){
            _demoAddersData = [];
            searchModule.create({
                type: _recordTypes.DEMO_ADDERS_DATA_TYPE,
                filters: [{name: _fields.IS_INACTIVE, operator: 'is', values: ['F']}],
                columns: [_fields.DATA_ADDER_SEQ, _fields.DATA_ADDER_FORMULA, _fields.DATA_ADDER_LIST]
            }).run().each(function(adder){
                    _demoAddersData.push(adder);
                    return true;
            });
        }
        return _demoAddersData;
    }

    function loadAdders(){
        if(!_addersData){
            _addersData = [];
            searchModule.load({id: _searches.ACTIVE_ADDERS})
                .run().each(function(adder){
                _addersData.push(adder);
                return true;
            })
        }
        return _addersData;
    }

    function selectSystemSizeAdder(systemSizeWatts, adders, allAdders, adderId, minSize, maxSize){
        if(maxSize == -1){
            return systemSizeWatts > minSize ? [adderId] : [];
        }
        return systemSizeWatts >= minSize && systemSizeWatts <= maxSize ? [adderId] : [];
    }

    function selectSingleRandomAdder(systemSizeWatts, adders, allAdders, excludeIfContainsId){
        var shouldExclude = typeof excludeIfContainsId === 'number' ? allAdders.indexOf(excludeIfContainsId) > -1 : false;
        if(!shouldExclude){
            allAdders.push(adders[Math.floor(Math.random()*adders.length)]);
        }
        return allAdders;
    }

    function selectSingleRandomAdderIfIncludes(systemSizeWatts, adders, allAdders, includeIfContainsId){
        var shouldInclude = typeof includeIfContainsId === 'number' ? allAdders.indexOf(includeIfContainsId) > -1 : false;
        if(shouldInclude){
            allAdders.push(adders[Math.floor(Math.random()*adders.length)]);
        }
        return allAdders;
    }

    function selectOptionalSingleRandomAdder(systemSizeWatts, adders, allAdders, excludeIfContainsId){
        var shouldExclude = typeof excludeIfContainsId === 'number' ? allAdders.indexOf(excludeIfContainsId) > -1 : false;
        if(!shouldExclude && _randomBool()){
            allAdders.push(adders[Math.floor(Math.random()*adders.length)]);
        }
        return allAdders;
    }

    function selectRandomBool(systemSizeWatts, adders, allAdders){
        if(_randomBool()){
            adders.forEach(function(adder){
                if(_randomBool()){
                    allAdders.push(adder);
                }
            });
        }
        return allAdders;
    }

    function selectMultiplePerWattRandomAdders(systemSizeWatts, adders, allAdders, excludeIfContainsId){
        var shouldExclude = typeof excludeIfContainsId === 'number' ? allAdders.indexOf(excludeIfContainsId) > -1 : false;
        if(!shouldExclude) {
            if (adders instanceof Array && adders.length > 0) {
                adders.forEach(function (adder) {
                    if (_randomBool()) {
                        allAdders.push(adder);
                    }
                });
            }
        }
        return allAdders;
    }



    function selectMultipleFixedRandomAdders(systemSizeWatts, adders, allAdders, excludeIfContainsId){
        var shouldExclude = typeof excludeIfContainsId === 'number' ? allAdders.indexOf(excludeIfContainsId) > -1 : false;
        if(!shouldExclude) {
            if (adders instanceof Array && adders.length > 0) {
                adders.forEach(function (adder) {
                    if (_randomBool()) {
                        allAdders.push(adder);
                    }
                });
            }
        }
        return allAdders;
    }

    function loadUtilityCompanies(){
        if(!_utilityCompanies){
            _utilityCompanies = [];
            searchModule.create({type: _recordTypes.UTILITY_COMPANY_RECORD_TYPE, columns: [_fields.UTILITY_COMPANY_STATE]})
                .run().each(function(utilityCompany){
                    _utilityCompanies.push(utilityCompany);
                    return true;
            })
        }
        return _utilityCompanies;
    }

    function loadForecastTypes(){
        if(!_forecastTypes){
            _forecastTypes = [];
            searchModule.create({type: _recordTypes.FORECAST_TYPE_TYPE})
                .run().each(function(forecastType){
                    _forecastTypes.push(forecastType);
                    return true;
            })
        }
        return _forecastTypes;
    }

    function loadEpcRoles(){
        if(!_epcRoles){
            _epcRoles = [];
            searchModule.create({type: _recordTypes.EPC_ROLE_TYPE})
                .run().each(function(role){
                _epcRoles.push(role);
                return true;
            })
        }
        return _epcRoles;
    }

    function loadTemplateProjects(){
        if(!_templateProjects){
            _templateProjects = [];
            searchModule.load({id: _searches.TEMPLATE_PROJECTS})
                .run().each(function(projectTemplate){
                _templateProjects.push(projectTemplate);
                return true;
            })
        }
        return _templateProjects;
    }

    function loadSubInstallerVendors(){
        if(!_subInstallerVendors){
            _subInstallerVendors = [];
            searchModule.load({id: _searches.SUB_INSTALLER_VENDORS})
                .run().each(function(vendor){
                _subInstallerVendors.push(vendor);
                return true;
            })
        }
        return _subInstallerVendors;
    }

    function loadSubOriginatorVendors(){
        if(!_subOriginatorVendors){
            _subOriginatorVendors = [];
            searchModule.load({id: _searches.SUB_ORIGINATOR_VENDORS})
                .run().each(function(vendor){
                _subOriginatorVendors.push(vendor);
                return true;
            })
        }
        return _subOriginatorVendors;
    }

    function isFunction(value){
        var _regexIsFunc = new RegExp('^func\\.(.*)$', 'ig');
        return _regexIsFunc.test(value);
    }

    function getFunction(value){
        var _regexExecute = new RegExp('^func\\.(.*)\\((.*)\\)$', 'ig');
        if(isFunction(value)) {
            var _split = _regexExecute.exec(value);
            var _func = _split[1];
            if(_export.hasOwnProperty(_func)){
                return _export[_func];
            }
        }
        return undefined;
    }

    function executeFunction(){
        var _value = arguments[0],
            _extraArgs = Array.prototype.slice.call(arguments, 1);
        var _regexExecute = new RegExp('^func\\.(.*)\\((.*)\\)$', 'ig');
        if(isFunction(_value)){
            var _split = _regexExecute.exec(_value);
            var _func = _split[1],
                _argString = _split[2],
                _argsString = _argString.split(','),
                _args = [];
            _argsString.forEach(function(arg){
                arg = arg.trim();
                var stringArg = /^["](.*)["]$/.exec(arg);
                if(stringArg){
                    _args.push(stringArg[1]);
                } else if(/^[0-9]+\.[0-9]+$/.test(arg)) {
                    _args.push(parseFloat(arg));
                } else if(/^[0-9]+$/.test(arg)) {
                    _args.push(parseInt(arg));
                }
            });
            if(_extraArgs.length > 0) {
                _args = _extraArgs.concat(_args);
            }
            if(_export.hasOwnProperty(_func)){
                return _export[_func].apply(null, _args);
            }
        }
        return undefined;
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    /**
     * <code>getLoadFields</code> function searches for 'load' prefixed columns names (eg: load.project.internalid)
     *
     * @governance 0
     * @param columns {Column[]} List of all search columns
     *
     * @return {object}
     *
     * @static
     * @function getLoadFields
     */
    function getLoadFields(columns){
        var _regex = /^load\.(project|project_action|lead|leaddata|proposal|salesorder|purchaseorder|invoice|itemreceipt|itemfulfillment|vendorbill)\.(.*)$/ig;
        return getFieldsByRegex(_regex, columns);
    }

    /**
     * <code>getLoadFields</code> function searches for 'load' prefixed columns names (eg: load.project.internalid)
     *
     * @governance 0
     * @param columns {Column[]} List of all search columns
     *
     * @return {object}
     *
     * @static
     * @function getLoadFields
     */
    function getVoidFields(columns){
        var _regex = /^void\.(project|project_action|lead|leaddata|proposal|salesorder|purchaseorder|invoice|itemreceipt|itemfulfillment|vendorbill)$/ig;
        var _split = undefined,
            _result = [];
        columns.forEach(function(column, idx){
            _regex.lastIndex = 0;
            if(_regex.test(column.label)){
                _regex.lastIndex = 0;
                _split = _regex.exec(column.label);
                _result.push({index: idx, type: _mapping[_split[1]], column: column});
            }
        });
        return _result;
    }

    /**
     * <code>getCreateFields</code> function searches for 'create' prefixed columns names (eg: create.project.new)
     *
     * @governance 0
     * @param columns {Column[]} List of all search columns
     *
     * @return {object}
     *
     * @static
     * @function getCreateFields
     */
    function getCreateFields(columns){
        var _regex = /^create\.(project|project_action|lead|leaddata|proposal|salesorder|purchaseorder|invoice|itemreceipt|itemfulfillment|vendorbill)\.(.*)$/ig;
        return getFieldsByRegex(_regex, columns);
    }

    /**
     * <code>getGetFields</code> function searches for 'get' prefixed columns names (eg: get.project.internalid)
     *
     * @governance 0
     * @param columns {Column[]} List of all search columns
     *
     * @return {object}
     *
     * @static
     * @function getGetFields
     */
    function getGetFields(columns){
        var _regex = /^get\.(project|project_action|salesorder|purchaseorder|invoice|itemreceipt|itemfulfillment)\.(.*)$/ig;
        return getFieldsByRegex(_regex, columns);
    }

    /**
     * <code>getSetFields</code> function searches for 'set' prefixed columns names (eg: set.project.internalid)
     *
     * @governance 0
     * @param columns {Column[]} List of all search columns
     *
     * @return {object}
     *
     * @static
     * @function getSetFields
     */
    function getSetFields(columns){
        var _regex = /^set\.(project|project_action|lead|leaddata|proposal|salesorder|purchaseorder|invoice|itemreceipt|itemfulfillment|vendorbill)\.(.*)$/ig;
        return getFieldsByRegex(_regex, columns);
    }

    /**
     * <code>getFieldsByRegex</code> function searches for regular expression specified columns names
     *
     * @governance 0
     * @param regex {RegExp} Regular expression to search for
     * @param columns {Column[]} List of all search columns
     *
     * @return {object}
     *
     * @static
     * @function getSetFields
     */
    function getFieldsByRegex(regex, columns){
        var _split = undefined,
            _result = [];
        columns.forEach(function(column, idx){
            regex.lastIndex = 0;
            if(regex.test(column.label)){
                regex.lastIndex = 0;
                _split = regex.exec(column.label);
                _result.push({index: idx, type: _mapping[_split[1]], field: _split[2], column: column});
            }
        });
        return _result;
    }

    /*
     *  ALL DATA ACCESS FUNCTIONS
     */

    /**
     * <code>updateRecord</code> function
     *
     * @governance 10 for Transaction, 2 for Custom, 5 for All other records
     * @param data {object} Object containing saving data information
     * @param data.type {string} Record type
     * @param data.id {number} Record internal ID
     * @param data.values {object} Key value pair of field and its value
     *
     * @return {number}
     *
     * @static
     * @function updateRecord
     */
    function updateRecord(data){
        var _success = false,
            _retries = 5,
            _sleepPeriod = 10 * 1000,
            _try = 0;
        do {
            try{
                _success = true;
                var _loadRecord = recordModule.load({type: data.type, id: data.id});
                for(var key in data.values){
                    if(data.values.hasOwnProperty(key)){
                        _loadRecord.setValue({fieldId: key, value: data.values[key]});
                    }
                }
              	log.debug([data.type, ' ', data.id].join(''), data.values);
                return _loadRecord.save({ignoreMandatoryFields: true});
                //return recordModule.submitFields(data);
            } catch (e){
                if(e && e.name && e.name === 'RCRD_HAS_BEEN_CHANGED' && _try < _retries){
                    _success = false;
                    _try++;
                    log.debug([e.name, ' error occurred, retry: ', _try].join(''), JSON.stringify(data));
                    _sleep(_sleepPeriod);
                } else {
                    throw e;
                }
            }
        } while(!_success && _try < _retries)
    }

    /**
     * <code>getListOfSearchIds</code> function
     *
     * @governance 10
     *
     * @return {number[]}
     *
     * @static
     * @function getListOfSearchIds
     */
    function getListOfSearchIds(){
        var _searches = getListOfSearches(),
            _ids = [];
        _searches.forEach(function(search){
            var _searchInternalId = search.getValue({name: _fields.SEARCH_REF});
            var _searchInternalIdInt = parseInt(_searchInternalId);
            if(!isNaN(_searchInternalIdInt)) {
                _ids.push(_searchInternalIdInt);
            }
        });
        return _ids;
    }

    /**
     * <code>getListOfSearches</code> function
     *
     * @governance 10
     *
     * @return {Search[]}
     *
     * @static
     * @function getListOfSearches
     */
    function getListOfSearches(){
        var _searches = [];
        searchModule.create({
            type: _recordTypes.DEMO_DATA_SEARCH_RECORD_TYPE,
            filters: [{name: _fields.IS_INACTIVE, operator: 'is', values: ['F']}],
            columns: [{name: _fields.SEARCH_SEQUENCE_FIELD, sort: searchModule.Sort.ASC}, _fields.SEARCH_REF]
        }).run().each(function(search){
            _searches.push(search);
            return true;
        });
        return _searches;
    }

    /**
     * <code>executeSearch</code> function
     *
     * @governance 15
     * @param searchId {number|string} Search internal ID
     *
     * @return {object}
     *
     * @static
     * @function executeSearch
     */
    function executeSearch(searchId){
		var _items = [],
            _searchRecord = searchModule.load({id: searchId}),
            _resultSet = _searchRecord.run(),
            _columns = _resultSet.columns;
            _resultSet.each(function(item){
                _items.push(item);
                return true;
            });
      	log.debug(_searchRecord.id, _items.length);
        return {rows: _items, columns: _columns};
    }

    _export.processDemoDataGeneration = processDemoDataGeneration;
    _export.getRandomUtilityCompanyId = getRandomUtilityCompanyId;
    _export.getRandomForecastTypeId = getRandomForecastTypeId;
    _export.getRandomProjectTemplateId = getRandomProjectTemplateId;
    _export.createProject = createProject;
    _export.setSubInstallerOriginator = setSubInstallerOriginator;
    _export.setEpcRole = setEpcRole;
    _export.createProjectBoms = createProjectBoms;
    _export.createProjectAdders = createProjectAdders;
    _export.selectSingleRandomAdder = selectSingleRandomAdder;
    _export.selectOptionalSingleRandomAdder = selectOptionalSingleRandomAdder;
    _export.selectSingleRandomAdderIfIncludes = selectSingleRandomAdderIfIncludes;
    _export.selectRandomBool = selectRandomBool;
    _export.selectMultiplePerWattRandomAdders = selectMultiplePerWattRandomAdders;
    _export.selectMultipleFixedRandomAdders =  selectMultipleFixedRandomAdders;
    _export.createPurchaseOrder = createPurchaseOrder;
    _export.createItemReceipt = createItemReceipt;
    _export.createEquipmentVendorBill = createEquipmentVendorBill;
    _export.createPayment = createPayment;
    _export.getDocumentStatusId = getDocumentStatusId;

    return _export;
}

define([
    'N/search',
    'N/record',
    'N/format',
    '/SuiteBundles/Bundle 242998/BB_SS_WF_TransformLeadToProject',
    '/SuiteBundles/Bundle 242998/BB.SS.WF.CreatePO',
    '/SuiteBundles/Bundle 242998/BB SS/SS Lib/BB_SS_MD_SolarConfig',
    '/SuiteBundles/Bundle 242998/BB.SS.WF.RecognizeRevenueJE',
    '/SuiteBundles/Bundle 242998/BB SS/SS Lib/BB.SS.DocumentStatus.Service'
], DemoDataGenerationService);