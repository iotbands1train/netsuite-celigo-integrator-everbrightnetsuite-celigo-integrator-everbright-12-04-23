/**
 * @NApiVersion 2.0
 * @NScriptType usereventscript
 * @NModuleScope Public
 * @author Graham O'Daniel
 */
define(['./SS Lib/BB.SS.Projects', 'N/ui/serverWidget', 'N/runtime'], function(projectsModule, serverWidget, runtimeModule) {
    function isEmpty(element) {
        return typeof element === 'undefined' || element == '';
    }

    function setDocumentManagerFolder(context) {
        var iFrameFieldId = BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_MANAGER_IFRAME_FIELD || 'custrecord_bb_ss_proj_action_s3_folder';

        if (context.type === context.UserEventType.CREATE) {
            var documentManagerField = context.form.getField({
                id: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_MANAGER_FOLDER
            });
            documentManagerField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            var documentManagerIframe = context.form.getField({
                id: iFrameFieldId
            });
            documentManagerIframe.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            return;
        }
        var scriptObj = runtimeModule.getCurrentScript();
        var fileCountFld = scriptObj.getParameter({name:"custscript_bbss_file_count_fld_scriptid"}) || "";

        var projectFullName = context.newRecord.getText(BB.SS.Projects.ProjectPackageTask.Fields.PROJECT),
            packageFullName = context.newRecord.getText(BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE),
            packageTaskFullName = context.newRecord.getText(BB.SS.Projects.ProjectPackageTask.Fields.PACKAGE_ACTION),
            revisionNumber = context.newRecord.getValue(BB.SS.Projects.ProjectPackageTask.Fields.REVISION_NUMBER),
            iFrameHtml = context.newRecord.getValue(iFrameFieldId);

        if (isEmpty(projectFullName) || isEmpty(packageFullName) || isEmpty(packageTaskFullName)) {
            return;
        }

        var projectId = projectFullName.split(' ')[0];
        var prefix = ['projects', projectId, packageFullName, [packageTaskFullName, revisionNumber].join('_')].join('/');
        iFrameHtml = iFrameHtml.replace('{prefix}', prefix).replace('{filecountfld}',fileCountFld);

        // context.newRecord.setValue({
        //     fieldId: BB.SS.Projects.ProjectPackageTask.Fields.DOCUMENT_MANAGER_FOLDER,
        //     value: prefix
        // });

        context.newRecord.setValue({
            fieldId: iFrameFieldId,
            value: iFrameHtml
        });
    }

    function hideDropZone(context) {
        // context.form.clientScriptModulePath = './SS Lib/BB.SS.CS.ProjectAction';
        var hideDropZone = context.form.addField({
            id: 'custpage_drop_zone',
            type: 'INLINEHTML',
            label: 'Drop Zone Client Script'
        });

        var trigger = context.type;
        log.debug('type', trigger);
        if (trigger == 'view') {

            // Hide Drop Zone for new files in view mode - to add files, user must be in edit mode
            hideDropZone.defaultValue = "<script type='text/javascript'>console.log('script fired');" +
                "jQuery(function(){" +
                "    console.log('main page loaded');" +
                "    var iFrameDocument = jQuery('#bb_s3_iframe').contents();" +
                "    console.log(iFrameDocument);" +
                "	if(jQuery('#drop-area', iFrameDocument).length == 1){ " +
                "		jQuery('#drop-area', iFrameDocument).css({'display': 'none'});" +
                "	} else {" +
                "   	jQuery('#bb_s3_iframe').load(function(){" +
                "       	 console.log('iframe loaded');" +
                "       	 iFrameDocument = jQuery('#bb_s3_iframe').contents();" +
                "       	 console.log(iFrameDocument);" +
                "       	 jQuery('#drop-area', iFrameDocument).css({'display': 'none'});" +
                "    	});" +
                " 	}" +
                "});</script>";

            log.debug('drop zone contents', hideDropZone);

        }
    }

    function beforeLoad(context) {
        setDocumentManagerFolder(context);
        hideDropZone(context);
        var fileCount = context.form.addField({
            id: 'custpage_file_count',
            type: 'INLINEHTML',
            label: 'File Count'
        });
    }

    return {
        beforeLoad: beforeLoad
    };
});