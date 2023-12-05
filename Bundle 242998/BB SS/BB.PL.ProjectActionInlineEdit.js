/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 * @author Michael Golichenko
 * @NModuleScope Public
 * @version 0.0.1
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

define(['N/url', 'N/runtime'], function(urlModule, runtimeModule){

  var _export = {};

  _export.render = function(params){
    var
      _portlet = params.portlet
      , _currentScript = runtimeModule.getCurrentScript()
      , _searchId = _currentScript.getParameter({name: 'custscript_project_action_search'})
      , _title = _currentScript.getParameter({name: 'custscript_project_action_title'})
      , _url = urlModule.resolveScript({
        scriptId: 'customscript_bb_sl_proj_act_inline_edit',
        deploymentId: 'customdeploy_bb_sl_proj_act_inline_edit',
        params: {
          portlet: 'T'
          , searchId: _searchId
          // , phase: ''
          // , package: ''
        }
      })
    ;
    _portlet.title = typeof _title === 'string' && _title.trim().length > 0 ? _title : 'Project Actions';
    _portlet.html = !_searchId
      ? 'No Search specified in deployment'
      : `<iframe id="${_currentScript.deploymentId}" class="sl-project-actions" src="${_url}" border="0" frameborder="0" width="100%" height="600"></iframe>`;

  };

  return _export;

});