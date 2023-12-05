/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @author Michael Golichenko
 * @version 0.0.1
 */

define(['./../DocuSign', 'N/search', 'N/ui/serverWidget', 'N/url'], function(docuSignModule, search, serverWidget, url){

    function addDocuSignView(context, envelopeId){
        var TAB_NAME = '^files';
        var _tabId = undefined;
        var _form = context.form;
        var _tabs = _form.getTabs();
        _tabs.forEach(function(tab){
            var _tabDetails = _form.getTab({id: tab});
            if(new RegExp(TAB_NAME, 'i').test(_tabDetails.label)){
                _tabId = tab;
            }
        });
        if(_tabId){
            var _search = search.create({
                type: 'customrecord_docusign_envelope_status',
                filters: [['custrecord_docusign_status_envelope_id', search.Operator.IS, [envelopeId]]],
                columns: ['name']
            });
            var _foundRecord = _search.run().getRange({start: 0, end: 1})[0];
            if(_foundRecord){
                var _name = _foundRecord.getValue({name: 'name'});
                var _htmlViewField = _form.addField({
                    id: 'custpage_docusign_html_view',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'DocuSign Documents',
                    container: _tabId
                });
                var _scriptUrl = url.resolveScript({
                    scriptId: 'customscript_bb_ds_sl_console_view',
                    deploymentId: 'customdeploy_bb_ds_sl_console_view',
                    returnExternalUrl: false,
                    params: {'envelopeId':envelopeId}
                });
                var _cssString = '<style type="text/css"> .objects {\n' +
                    '          display: grid;\n' +
                    '          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n' +
                    '          grid-gap: 10px;\n' +
                    '          margin: 14px;\n' +
                    '          width: 94vw;\n' +
                    '        }\n' +
                    '        \n' +
                    '        .object {\n' +
                    '          padding: 10px;\n' +
                    '          text-align: center;\n' +
                    '          display: block;\n' +
                    '          background: lightgray;\n' +
                    '          font-size: 12;\n' +
                    '          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);\n' +
                    '        }\n' +
                    '        \n' +
                    '        .object a {\n' +
                    '          text-decoration: none;\n' +
                    '          color: black;\n' +
                    '        } </style>';
                var _htmlString = '<div class="objects"><div class="object"><a target="_blank" href="' +
                    _scriptUrl +
                    '"><img width="128" src="https://www.docusign.com/sites/default/files/docusign-logo-bw.png">\n' +
                    '<br>' +
                    '<span>' +
                    _name +
                    '</span></a></div></div>';
                _htmlViewField.defaultValue = [_cssString, _htmlString].join('');
                _htmlViewField.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                _htmlViewField.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                });
                _htmlViewField.updateBreakType({
                    breakType : serverWidget.FieldBreakType.STARTROW
                });
                return true;
            }
        }
        return false;
    }

    function beforeLoad(scriptContext){
        var _form = scriptContext.form;
        var _trigger = scriptContext.type;
        var _record = scriptContext.newRecord;
        var _templateId = undefined;
        var _envelopeId = undefined;
        var _addClientScript = false;
        if(['edit', 'view'].indexOf(_trigger)){
            _templateId = _record.getValue({fieldId: 'custrecord_bb_proj_act_docu_templ_id_txt'});
            _envelopeId = _record.getValue({fieldId: 'custrecord_bb_docusign_envelope_id'});
            if(typeof _templateId === 'string' && _templateId.trim().length > 0){
                var _button = _form.addButton({
                    id: 'custpage_edit_template_btn',
                    label: 'Edit DocuSign Template',
                    functionName: 'openTemplateEditView("' + _templateId  + '")'
                });
                if(!_envelopeId){
                  _form.addButton({
                    id: 'custpage_send_envelope'
                    , label: 'Send Document'
                    , functionName: ['sendEnvelopeFromProjectAction(', scriptContext.newRecord.id, ')'].join('')
                  })
                }
                _addClientScript = true;
            }
            if(typeof _envelopeId === 'string' && _envelopeId.trim().length > 0){
                // var _button = _form.addButton({
                //     id: 'custpage_console_view_btn',
                //     label: 'View Documents',
                //     functionName: 'openConsoleView("' + _envelopeId  + '")'
                // });
                _addClientScript = addDocuSignView(scriptContext, _envelopeId);
            }


            if(_addClientScript){
                _form.clientScriptModulePath = './BB.DS.CS.ProjectAction.js';
            }
        }
    }

    return {
        beforeLoad: beforeLoad
    }
});