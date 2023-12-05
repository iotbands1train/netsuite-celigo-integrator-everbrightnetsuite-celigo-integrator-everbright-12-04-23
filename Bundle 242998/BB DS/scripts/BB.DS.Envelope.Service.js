/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author Michael Golichenko
 * @version 0.0.1
 */

define(['N/record', 'N/search', 'N/format', './../libs/moment.min', './../DocuSign'], function(recordModule, searchModule, formatModule, momentModule, docuSignModule){

  var _exports = {};
  var _envelopeButtonsConfig = [
    {
      nameField: 'custentity_bb_design_partner_vendor',
      emailField: 'custentity_bb_design_main_contact_email',
      counterPartyId: 1,
      sendToText: 'Designer'
    },
    {
      nameField: 'custentity_bb_originator_vendor',
      emailField: 'custentity_bb_originator_email',
      counterPartyId: 2,
      sendToText: 'Originator'
    },
    {
      nameField: 'custentity_bb_financier_customer',
      emailField: 'custentity_bb_financier_customer.email',
      counterPartyId: 3,
      sendToText: 'Financier'
    },
    {
      nameField: 'custentity_bb_home_owner_name_text',
      emailField: 'custentity_bb_home_owner_primary_email',
      counterPartyId: 4,
      sendToText: 'Homeowner'
    },
    {
      nameField: 'custentity_bb_inspection_partner_vendor',
      emailField: 'custentity_bb_inspection_main_cont_email',
      counterPartyId: 5,
      sendToText: 'Inspection Partner'
    },
    {
      nameField: 'custentity_bb_installer_partner_vendor',
      emailField: 'custentity_bb_installer_main_conct_email',
      counterPartyId: 6,
      sendToText: 'Installer Sub-Contractor'
    },
    {
      nameField: 'custentity_bb_sales_rep_employee',
      emailField: 'custentity_bb_sales_rep_email',
      counterPartyId: 7,
      sendToText: 'Sales Rep'
    },
    {
      nameField: 'custentity_bb_site_audit_vendor',
      emailField: 'custentity_bb_site_audit_contact_email',
      counterPartyId: 8,
      sendToText: 'Site Audit Vendor'
    }
  ];

  function getDocumentStatusTypes(){
    return searchModule.create({
      type: 'customlist_bb_status_type'
      , columns: ['name']
    }).run()
      .getRange({start: 0, end: 100})
      .map(function(type){
        return {
          id: type.id
          , name: type.getValue('name')
        }
      })
      .filter(function(type){
        return /^(internal|submitted)/i.test(type.name)
      });
  }

  function getProjectActionStatuses(){
    var
      _types = getDocumentStatusTypes()
      , _result = []
    ;
    _types = _types.map(function(type){
      return type.id;
    })
    searchModule.create({
      type: 'customrecord_bb_document_status',
      filters: [
        ['custrecord_bb_doc_status_type', searchModule.Operator.ANYOF, _types]
      ],
      columns: ['name']
    }).run().each(function(row) {
      _result.push(row.id);
      return true;
    });
    return _result;
  }

  function getValidProjectActionStatuses(){
    // var _applicableProjectActionStatusesRegex = new RegExp('^(Requested|Submitted to|Pending PM Review)', 'i');
    // var _projectActionStatuses = getProjectActionStatuses();
    // var _validProjectActionStatuses = [];
    // for (var prop in _projectActionStatuses){
    //     if(_projectActionStatuses.hasOwnProperty(prop) && _applicableProjectActionStatusesRegex.test(prop)){
    //         _validProjectActionStatuses.push(_projectActionStatuses[prop]);
    //     }
    // }
    // return _validProjectActionStatuses;
    return getProjectActionStatuses();
  }

  function getCounterPartyProjectActions(projectId, counterPartyId){
    var _validProjectActionStatuses = getValidProjectActionStatuses();
    var _projectActions = [];
    if(projectId && _validProjectActionStatuses instanceof Array && _validProjectActionStatuses.length > 0) {
      var _projectActionsSearch = searchModule.create({
        type: 'customrecord_bb_project_action',
        filters: [
          ['custrecord_bb_project', searchModule.Operator.ANYOF, projectId], 'and',
          ['custrecord_bb_proj_act_counterparty_type', searchModule.Operator.ANYOF, counterPartyId], 'and',
          ['isinactive', searchModule.Operator.IS, 'F'], 'and',
          ['custrecord_bb_docusign_envelope_id', searchModule.Operator.ISEMPTY, null], 'and',
          ['custrecord_bb_document_status', searchModule.Operator.ANYOF, _validProjectActionStatuses]
        ],
        columns: ['custrecord_bb_proj_act_docu_templ_id_txt']
      });
      _projectActionsSearch.run().each(function(projectAction){
        _projectActions.push(projectAction);
        return true;
      });
    }
    return _projectActions;
  }

  _exports.createEnvelopeFromProjectAction = function(projectActionId){
    log.debug('createEnvelopeFromProjectAction', {projectActionId:projectActionId})
    var
      _mappings = []
      , _projectAction
      , _projectId
      , _templateId
      , _counterParty
      , _project
      , _envelopeDefinition = new docuSignModule.EnvelopeDefinition()
      , _compositeTemplate = new docuSignModule.CompositeTemplate()
      , _templateRole = new docuSignModule.TemplateRole()
      , _toName
      , _toEmail
      , _envelopeApi
      , _result
      , _envelope
      , _statusRecord
      , _statusDateCreated
      , _statusRecordId
      , _counterPartyId
      , _records = {}
    ;

    _projectAction = recordModule.load({type:'customrecord_bb_project_action', id: projectActionId});
    _records['customrecord_bb_project_action'] = _projectAction;
    _projectId = _projectAction.getValue({fieldId: 'custrecord_bb_project'});
    _templateId = _projectAction.getValue({fieldId: 'custrecord_bb_proj_act_docu_templ_id_txt'});
    _counterPartyId = _projectAction.getValue({fieldId: 'custrecord_bb_proj_act_counterparty_type'});
    _counterParty = _envelopeButtonsConfig.filter(function(config){
      return config.counterPartyId == _counterPartyId;
    })[0];
    if(typeof _counterParty === 'undefined') return ['Counter party configuration is not found.'];
    _project = recordModule.load({type: 'job', id: _projectId});
    _records['job'] = _project;
    _toName = _project.getText({fieldId: _counterParty.nameField});
    _toEmail = _project.getValue({fieldId: _counterParty.emailField});
    //_toEmail = 'mgolichenko@bluebanyansolutions.com';
    searchModule.create({
      type: 'customrecord_bb_custom_field_mapping',
      filters: [['isinactive', searchModule.Operator.IS, 'F']],
      columns: ['custrecord_bb_ss_cust_map_ns_record_id', 'custrecord_bb_ss_cust_map_ns_field_id', 'custrecord_bb_ss_cust_map_field_alias']
    }).run().each(function(mapping){
      _mappings.push(mapping);
      return true;
    });

    _envelopeDefinition.templateId = _templateId;
    // _envelopeDefinition.compositeTemplates = [];
    // _envelopeDefinition.compositeTemplates.push(_compositeTemplate);

    _templateRole.email = _toEmail;
    _templateRole.name = _toName;
    _templateRole.roleName = 'Primary Contact';

    _templateRole.tabs = new docuSignModule.Tabs();
    _templateRole.tabs.textTabs = [];

    _mappings.forEach(function(mapping){
      var _recordId = mapping.getValue({name: 'custrecord_bb_ss_cust_map_ns_record_id'});
      var _fieldId = mapping.getValue({name: 'custrecord_bb_ss_cust_map_ns_field_id'});
      var _record = _records[_recordId];
      if(_record) {
        var _textTab = new docuSignModule.Text();
        var _fieldValue = _record.getText({fieldId: _fieldId});
        if(typeof _fieldValue !== 'string' || _fieldValue.trim().length === 0) {
          _fieldValue = _record.getValue({fieldId: _fieldId});
        }
        if(typeof _fieldValue === 'undefined' || _fieldValue == null) return;
        _fieldValue = _fieldValue.toString();
        _textTab.tabLabel = '\\*' + mapping.getValue({name: 'custrecord_bb_ss_cust_map_field_alias'});
        _textTab.value = _fieldValue;
        _templateRole.tabs.textTabs.push(_textTab);
      }
    });

    _envelopeDefinition.templateRoles = [];
    _envelopeDefinition.templateRoles.push(_templateRole);
    _envelopeDefinition.status = 'sent';

    log.debug('envelope definition', _envelopeDefinition);
    _envelopeApi = new docuSignModule.EnvelopesApi();
    _envelopeApi.apiClient.addAuthentication(new docuSignModule.OAuth()).setupFromRecord().setAutoAuth(true).authenticate();
    _result = _envelopeApi.createEnvelope({envelopeDefinition: _envelopeDefinition, mergeRolesOnDraft: 'true'});
    if(typeof _result === 'object'){
      _envelope = _envelopeApi.getEnvelope(_result.envelopeId);
      _statusRecord = recordModule.create({
        type: 'customrecord_docusign_envelope_status'
      });
      _statusDateCreated = momentModule(_result.statusDateTime);
      _statusRecord.setValue({fieldId: 'custrecord_docusign_recordtype', value: 'customrecord_bb_project_action'});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_recordid', value: projectActionId});
      _statusRecord.setValue({fieldId: 'name', value: _envelope.emailSubject});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_document_name', value: _envelope.emailSubject});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_status_envelope_id', value: _result.envelopeId});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_status_date_created', value: _statusDateCreated.isValid() ? formatModule.format({value: _statusDateCreated.toDate(), type: formatModule.Type.DATETIME}) : _result.statusDateTime});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_status', value: _result.status});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_envelope_accountid', value: _envelopeApi.apiClient.getAccountId()});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_envelope_environment', value: _envelopeApi.apiClient.getEnvironment()});
      _statusRecordId = _statusRecord.save();
      log.debug('status record', _statusRecordId);
      recordModule.submitFields({
        type: 'customrecord_bb_project_action',
        id: projectActionId,
        values: {
          'custrecord_bb_docusign_envelope_id': _result.envelopeId
        }
      });
      return [];
    }
    log.error('BB.DS.Envelope.Service -> createEnvelopeFromProjectForCounterParty', _result);
    return ['Something went wrong, contact your administrator.'];
  }

  _exports.createEnvelopeFromProjectForCounterParty = function(projectId, counterPartyId){
    var _mappings = [];
    var _projectActions = getCounterPartyProjectActions(projectId, counterPartyId);
    if(_projectActions.length === 0) return ['No project actions found for the counter party.'];
    var _counterParty = _envelopeButtonsConfig.filter(function(config){
      return config.counterPartyId === counterPartyId;
    })[0];
    if(typeof _counterParty === 'undefined') return ['Counter party configuration is not found.'];
    var _project = recordModule.load({type: 'job', id: projectId});

    if(!_exports.canProcessCounterParty(_project, _counterParty.nameField, _counterParty.emailField, counterPartyId)) return ['Counter party details are missing.'];

    var _envelopeDefinition = new docuSignModule.EnvelopeDefinition();

    var _toName = _project.getText({fieldId: _counterParty.nameField});
    var _toEmail = _project.getValue({fieldId: _counterParty.emailField});
    //var _toEmail = 'mgolichenko@bluebanyansolutions.com';
    var _docusignMappingsSearch = searchModule.create({
      type: 'customrecord_bb_custom_field_mapping',
      filters: [['isinactive', searchModule.Operator.IS, 'F']],
      columns: ['custrecord_bb_ss_cust_map_ns_record_id', 'custrecord_bb_ss_cust_map_ns_field_id', 'custrecord_bb_ss_cust_map_field_alias']
    });
    _docusignMappingsSearch.run().each(function(mapping){
      _mappings.push(mapping);
      return true;
    });

    _envelopeDefinition.templateId = _projectActions[0].getValue({name: 'custrecord_bb_proj_act_docu_templ_id_txt'});
    if(_projectActions.length > 1){
      var _compositeTemplate = new docuSignModule.CompositeTemplate();
      _compositeTemplate.serverTemplates = [];
      _projectActions.forEach(function(template, idx){
        if(idx === 0) return;
        var _templateId = template.getValue({name: 'custrecord_bb_proj_act_docu_templ_id_txt'});
        var _serverTemplate = new docuSignModule.ServerTemplate();
        _serverTemplate.sequence = (idx + 1).toString();
        _serverTemplate.templateId = _templateId;
        _compositeTemplate.serverTemplates.push(_serverTemplate);
      });
      _envelopeDefinition.compositeTemplates = [];
      _envelopeDefinition.compositeTemplates.push(_compositeTemplate);
    }

    var _templateRole = new docuSignModule.TemplateRole();
    _templateRole.email = _toEmail;
    _templateRole.name = _toName;
    _templateRole.roleName = 'Primary Contact';

    _templateRole.tabs = new docuSignModule.Tabs();
    _templateRole.tabs.textTabs = [];

    _mappings.forEach(function(mapping){
      var _textTab = new docuSignModule.Text();
      var _fieldId = mapping.getValue({name: 'custrecord_bb_ss_cust_map_ns_field_id'});
      var _fieldValue = _project.getText({fieldId: _fieldId});
      if(typeof _fieldValue !== 'string' || _fieldValue.trim().length === 0) {
        _fieldValue = _project.getValue({fieldId: _fieldId});
      }
      if(typeof _fieldValue === 'undefined' || _fieldValue == null) return;
      _fieldValue = _fieldValue.toString();
      _textTab.tabLabel = '\\*' + mapping.getValue({name: 'custrecord_bb_ss_cust_map_field_alias'});
      _textTab.value = _fieldValue;
      _templateRole.tabs.textTabs.push(_textTab);
    });

    _envelopeDefinition.templateRoles = [];
    _envelopeDefinition.templateRoles.push(_templateRole);
    _envelopeDefinition.status = 'sent';
    log.debug('envelope definition', _envelopeDefinition);
    var _envelopeApi = new docuSignModule.EnvelopesApi();
    _envelopeApi.apiClient.addAuthentication(new docuSignModule.OAuth()).setupFromRecord().setAutoAuth(true).authenticate();
    var _result = _envelopeApi.createEnvelope({envelopeDefinition: _envelopeDefinition, mergeRolesOnDraft: 'true'});
    if(typeof _result === 'object'){
      var _envelope = _envelopeApi.getEnvelope(_result.envelopeId);
      var _statusRecord = recordModule.create({
        type: 'customrecord_docusign_envelope_status'
      });
      var _statusDateCreated = momentModule(_result.statusDateTime);
      _statusRecord.setValue({fieldId: 'custrecord_docusign_recordtype', value: 'job'});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_recordid', value: projectId.toFixed(0)});
      _statusRecord.setValue({fieldId: 'name', value: _envelope.emailSubject});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_document_name', value: _envelope.emailSubject});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_status_envelope_id', value: _result.envelopeId});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_status_date_created', value: _statusDateCreated.isValid() ? formatModule.format({value: _statusDateCreated.toDate(), type: formatModule.Type.DATETIME}) : _result.statusDateTime});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_status', value: _result.status});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_envelope_accountid', value: _envelopeApi.apiClient.getAccountId()});
      _statusRecord.setValue({fieldId: 'custrecord_docusign_envelope_environment', value: _envelopeApi.apiClient.getEnvironment()});
      var _statusRecordId = _statusRecord.save();
      log.debug('status record', _statusRecordId);

      _projectActions.forEach(function(pa){
        recordModule.submitFields({
          type: 'customrecord_bb_project_action',
          id: pa.id,
          values: {
            'custrecord_bb_docusign_envelope_id': _result.envelopeId
          }
        });
      });
      return [];
    }
    log.error('BB.DS.Envelope.Service -> createEnvelopeFromProjectForCounterParty', _result);
    return ['Something went wrong, contact your administrator.'];
  };

  _exports.canSendEnvelopeByProjectIdAndCounterPartyId = function(projectId, counterPartyId){
    var _projectActions = getCounterPartyProjectActions(projectId, counterPartyId);
    return _projectActions.length > 0;
  };

  _exports.canProcessCounterParty = function(record, nameField, emailField, counterPartyId) {
    var _toName = record.getValue({fieldId: nameField});
    var _toEmail = record.getValue({fieldId: emailField});
    if (typeof _toName === 'string' && _toName.length > 0 && typeof _toEmail === 'string' && _toEmail.length > 0) {
      return _exports.canSendEnvelopeByProjectIdAndCounterPartyId(record.id, counterPartyId);
    }
    return false;
  };

  _exports.getEnvelopesStatus = function(envelopeIds) {
    var
      _envelopeApi
      , _result
    if(envelopeIds instanceof Array) {
      _envelopeApi = new docuSignModule.EnvelopesApi();
      _envelopeApi.apiClient.addAuthentication(new docuSignModule.OAuth()).setupFromRecord().setAutoAuth(true).authenticate();
      _result = _envelopeApi.listStatus({envelopeIdsRequest: { envelopeIds: envelopeIds}, envelopeIds: 'request_body'});
      log.debug('_result', _result);
      if(_result.envelopes instanceof Array) {
        return _result.envelopes.map(function(envelopeStatus) {
          return {envelopeId: envelopeStatus.envelopeId, status: envelopeStatus.status};
        })
      }
    }
    return undefined;
  }

  _exports.createEnvelopeFromRecord = function(recordType, recordId, recipients, templateId, envelopeIdField, statusField) {

    if(!recordType || !recordId || recipients.filter(function(r){ return (r.name && r.email && r.role) || r.role; }).length === 0 || !templateId) {
      log.audit('Missing one of the required parameters', {
        recordType: recordType
        , recordId: recordId
        , recipients: recipients
        , templateId: templateId
      })
      return false;
    }


    var
      _referenceMapping = []
      , _mappings = []
      , _records = {}
      , _filters = []
      , _tabsData = []
      , _envelopeApi = new docuSignModule.EnvelopesApi()
      , _envelopeStatus
      , _statusRecord
      , _statusDateCreated
    ;

    // get reference mapping
    searchModule.create({
      type: 'customrecord_bb_ds_custom_ref_mapping',
      filters: [
        ['isinactive', searchModule.Operator.IS, 'F']
        , 'AND'
        , ['custrecord_bb_ds_source_ns_record_id', searchModule.Operator.IS, recordType.toLowerCase()]
      ],
      columns: ['custrecord_bb_ds_source_ns_record_id', 'custrecord_bb_ds_source_ns_field_id', 'custrecord_bb_ds_ref_ns_record_id']
    }).run().each(function(mapping){
      _referenceMapping.push({
        srcRecord: mapping.getValue('custrecord_bb_ds_source_ns_record_id')
        , srcField: mapping.getValue('custrecord_bb_ds_source_ns_field_id')
        , refRecord: mapping.getValue('custrecord_bb_ds_ref_ns_record_id')
      });
      return true;
    });
    // filter reference mapping for not valid configuration
    _referenceMapping = _referenceMapping.filter(function(mapping){
      return mapping.srcField && mapping.srcRecord;
    }).map(function(mapping){
      return {
        refRecord: mapping.refRecord.toLowerCase()
        , srcField: mapping.srcField.toLowerCase()
        , srcRecord: mapping.srcRecord.toLowerCase()
      }
    });
    log.debug('_referenceMapping', _referenceMapping);
    // load root record
    _records[recordType] = recordModule.load({type: recordType, id: recordId});
    // get reference records IDs
    _referenceMapping.forEach(function(mapping){
      var _value;
      try {
        _value = _records[recordType].getValue(mapping.srcField);
      } catch(e) {
        log.audit('INVALID_SRC_FIELD', mapping);
      }
      if(_value){
        try {
          mapping.srcId = _value;
          // load reference records
          _records[mapping.refRecord] = recordModule.load({type: mapping.refRecord, id: _value});
        } catch(e) {
          log.audit('COULD_NOT_LOAD_REF_RECORD', mapping);
        }
      }
    });


    _filters.push(['custrecord_bb_ss_cust_map_ns_record_id', 'is', recordType]);
    _referenceMapping.forEach(function(mapping, idx) {
      _filters.push('OR');
      _filters.push(['custrecord_bb_ss_cust_map_ns_record_id', 'is', mapping.refRecord]);
    });

    _filters = [_filters].concat(['AND', ['isinactive', searchModule.Operator.IS, 'F']]);

    log.debug('mapping _filters', _filters);

    // get mapping fields
    searchModule.create({
      type: 'customrecord_bb_custom_field_mapping',
      filters: _filters,
      columns: ['custrecord_bb_ss_cust_map_ns_record_id', 'custrecord_bb_ss_cust_map_ns_field_id', 'custrecord_bb_ss_cust_map_field_alias']
    }).run().each(function(mapping){
      _mappings.push({
        mapRecord: mapping.getValue('custrecord_bb_ss_cust_map_ns_record_id')
        , mapField: mapping.getValue('custrecord_bb_ss_cust_map_ns_field_id')
        , alias: mapping.getValue('custrecord_bb_ss_cust_map_field_alias')
      });
      return true;
    });

    _mappings = _mappings.filter(function(mapping) {
      return mapping.mapRecord && mapping.mapField && mapping.alias;
    }).map(function(mapping){
      return {
        record: mapping.mapRecord.toLowerCase()
        , field: mapping.mapField.toLowerCase()
        , alias: mapping.alias
      };
    });

    log.debug('_mappings', _mappings);

    // get data for envelope

    _mappings.forEach(function(mapping) {
      var _record = _records[mapping.record];
      if(_record) {
        var _fieldValue = _record.getText({fieldId: mapping.field});
        if(typeof _fieldValue !== 'string' || _fieldValue.trim().length === 0) {
          _fieldValue = _record.getValue({fieldId: mapping.field});
        }
        if(typeof _fieldValue === 'undefined' || _fieldValue == null) return;
        _fieldValue = _fieldValue.toString();
        _tabsData.push({
          label: mapping.alias
          , value: _fieldValue
        });
      }
    });
    log.debug('_tabsData', _tabsData);

    // send envelope
    _envelopeStatus = _exports.sendEnvelope(templateId, _tabsData, recipients);

    log.debug('_envelopeStatus', _envelopeStatus);

    // create envelope record
    _statusRecord = recordModule.create({
      type: 'customrecord_docusign_envelope_status'
    });
    _statusDateCreated = momentModule(_envelopeStatus.response.statusDateTime);
    _statusRecord.setValue({fieldId: 'custrecord_docusign_recordtype', value: recordType});
    _statusRecord.setValue({fieldId: 'custrecord_docusign_recordid', value: recordId});
    _statusRecord.setValue({fieldId: 'name', value: _envelopeStatus.envelope.emailSubject});
    _statusRecord.setValue({fieldId: 'custrecord_docusign_document_name', value: _envelopeStatus.envelope.emailSubject});
    _statusRecord.setValue({fieldId: 'custrecord_docusign_status_envelope_id', value: _envelopeStatus.response.envelopeId});
    _statusRecord.setValue({fieldId: 'custrecord_docusign_status_date_created', value: _statusDateCreated.isValid() ? formatModule.format({value: _statusDateCreated.toDate(), type: formatModule.Type.DATETIME}) : _envelopeStatus.response.statusDateTime});
    _statusRecord.setValue({fieldId: 'custrecord_docusign_status', value: _envelopeStatus.response.status});
    _statusRecord.setValue({fieldId: 'custrecord_docusign_envelope_accountid', value: _envelopeApi.apiClient.getAccountId()});
    _statusRecord.setValue({fieldId: 'custrecord_docusign_envelope_environment', value: _envelopeApi.apiClient.getEnvironment()});
    _statusRecord.save();

    // save envelope ID and status to executing record
    if(envelopeIdField || statusField) {
      var _values = {};
      if(envelopeIdField) {
        _values[envelopeIdField] = _envelopeStatus.response.envelopeId
      }
      if(statusField) {
        _values[statusField] = _envelopeStatus.response.status
      }
      log.debug('_values', _values);
      recordModule.submitFields({
        type: recordType
        , id: recordId
        , values: _values
      })

    }

    return [];
  }

  _exports.sendEnvelope = function(templateId, tabs, recipients) {
    var
      _envelopeApi = new docuSignModule.EnvelopesApi()
      , _envelopeDefinition = new docuSignModule.EnvelopeDefinition()
      , _templateRole
      , _result
      , _envelope
      , _recipients = [];
    ;
    _envelopeDefinition.templateId = templateId;

    recipients.forEach(function(r) {
      _templateRole = new docuSignModule.TemplateRole()
      if(r.email && r.name) {
        _templateRole.email = r.email;
        _templateRole.name = r.name;
      }
      if(r.role) {
        _templateRole.roleName = r.role;
      }

      _templateRole.tabs = new docuSignModule.Tabs();
      _templateRole.tabs.textTabs = tabs.map(function(tab){
        return {
          tabLabel: '\\*' + tab.label
          , value: tab.value
        };
      });
      _recipients.push(_templateRole);
    })

    // _templateRole.email = email;
    // _templateRole.name = name;
    // _templateRole.roleName = 'Primary Contact';
    //
    // _templateRole.tabs = new docuSignModule.Tabs();
    // _templateRole.tabs.textTabs = tabs.map(function(tab){
    //   return {
    //     tabLabel: '\\*' + tab.label
    //     , value: tab.value
    //   };
    // });

    _envelopeDefinition.templateRoles = _recipients;
    // _envelopeDefinition.templateRoles.push(_templateRole);
    _envelopeDefinition.status = 'sent';

    log.debug('envelope definition', _envelopeDefinition);

    _envelopeApi.apiClient.addAuthentication(new docuSignModule.OAuth()).setupFromRecord().setAutoAuth(true).authenticate();
    _result = _envelopeApi.createEnvelope({envelopeDefinition: _envelopeDefinition, mergeRolesOnDraft: 'true'});
    if(typeof _result === 'object') {
      _envelope = _envelopeApi.getEnvelope(_result.envelopeId);
      return {
        response: _result
        , envelope: _envelope
      };
    }
    return undefined;
  }

  _exports.envelopeButtonsConfig = _envelopeButtonsConfig;
  Object.freeze(_exports.envelopeButtonsConfig);
  return _exports;
});