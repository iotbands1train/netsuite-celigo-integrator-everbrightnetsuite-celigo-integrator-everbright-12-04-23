/**
 * SA-44630 SuiteScript Versioning Guidelines
 * SA-43522 SuiteScript 2.x JSDoc Validation
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 *
 * @description Get the status of a Map/Reduce or Scheduled Script
 * There is no UI build for this page
 *
 * Created by David Smith on 12/5/2022
 *
 * @copyright 2022 Blue Banyan Solutions
 */
 define(['N/task', 'N/search', 'N/record', 'N/url'],

 function (task, search, record, url) {
    function getRecordUrl(recType, recId) {
        const func = "getRecordUrl";
        let scheme = 'https://';
        let retUrl, host, relPath;
        let nRecType = (recType === "ije") ? record.Type.ADV_INTER_COMPANY_JOURNAL_ENTRY : record.Type.JOURNAL_ENTRY ; 
        try{
            host = url.resolveDomain({ hostType: url.HostType.APPLICATION });
            relPath = url.resolveRecord({ recordType: nRecType, recordId: recId, isEditMode: false });
            retUrl = scheme + host + relPath;
            log.debug(func, "retUrl: " + retUrl);
            return retUrl;
        } catch(e) {
            log.error(e.name, JSON.stringify(e));
        };
    };

     function onRequest(context) {
         //log.debug('context',context);
         const request = context.request;
         const response = context.response;
         let taskId=request.parameters.taskId,
             scriptId=request.parameters.scriptId,
             limit=request.parameters.limit || 5,
             deploymentId=request.parameters.deploymentId,
             showProgress=request.parameters.show,
             ije = request.parameters.ije,
             rje = request.parameters.rje;
        let ijeUrl = getRecordUrl("ije", ije);
        let rjeUrl = getRecordUrl("rje", rje);
        let sletURL = url.resolveScript({ scriptId: "customscript_bb_sl_payonbehalf", deploymentId: "customdeploy_bb_sl_payonbehalf"});
        log.debug("onRequest", "Start, derived variables: " + JSON.stringify({ ije: ije, rje: rje, ijeUrl: ijeUrl, rjeUrl: rjeUrl }));
        log.debug("onRequest", "context.parameters: " +  JSON.stringify(context.parameters));
        
         if(request.method=='GET' && showProgress){
             // this can be used but is ment more as an example...
             let html = '<!DOCTYPE html>\n' +
                 '<html lang="en-US">\n' +
                 '<head><script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>' +
                 '<title>POB Progress</title></head>' +
                 '<body><h1>Pay On Behalf Transaction Progress</h1>' +
                 '<h3><a href="' + sletURL + '">Return To Pay on Behalf Suitelet</a></h3>' +
                 '<h3><a href="' + ijeUrl + '">Advanced Intercompany Journal Entry</a></h3>' +
                 '<h3><a href="' + rjeUrl + '">Regular Journal Entry</a></h3>' +
                 '<div id="main_form" style="height: 100%;width: 100%"></div><script>$( document ).ready(function() {' +
                 'jQuery(\'#main_form\').append(`<div id="bbprogress">\n' +
                 '    <progress max="100" value="0" style="height:30px;width:100%;"></progress>\n' +
                 '    <span id="bbprogress_status"></span>\n' +
                 '    </div>`);\n' +
                 '\n' +
                 'function updateProgress() {\n' +
                 '    jQuery.post(\'#\', {\n' +
                 '        scriptId: "'+scriptId+'",\n' +
                 '        limit: '+limit+'\n' +
                 '    }, function (data) {\n' +
                 '        console.log(data);\n' +
                 '        jQuery(\'#bbprogress progress\').attr(\'value\', data?.status?.percentComplete || 0);\n' +
                 '        let progressMsg = `${data?.status?.status}`;\n' +
                 '        if(data?.status?.totalMapCount && data?.status?.processed){\n' +
                 '            // map/reduce script - show a little more detail\n' +
                 '            progressMsg = `${data?.status?.percentComplete||0}% `+progressMsg;\n' +
                 '            progressMsg += ` ${data?.status?.processed}/${data?.status?.totalMapCount}`;\n' +
                 '            progressMsg += data?.status?.stage ? ` (${data?.status?.stage})` : \'\';' +
                 '        }\n' +
                 '        jQuery(\'#bbprogress_status\').text(progressMsg);\n' +
                 '\n' +
                 '        if(/complete/i.test(data?.status?.status)){\n' +
                 '            clearInterval(progressTimer);\n' +
                 '            console.log(\'progress timer stopped\');\n' +
                 '        }\n' +
                 '    }, \'json\');\n' +
                 '}\n' +
                 '\n' +
                 'updateProgress();\n' +
                 'let progressTimer = setInterval(updateProgress, 10000);});</script></body>';
 
             response.write(html);
             return;
         }
 
 
         let output = {
             success:true,
             message:"",
             status:{}
         }
 
         if(taskId){
             // get the status of the running script
             output.status = getStatus(request.parameters.taskId);
             log.audit('Status from taskId', output.status);
         } else if(scriptId){
             let scriptId = request.parameters.scriptId;
             // this is the internalid of the script we're looking for
             let instanceData = getInstanceData(scriptId,limit);
             log.debug('instance data',instanceData);
             if(instanceData[0]){
                 output.results = instanceData;
                 output.status = getStatus(instanceData[0].taskid,limit);
             }
         } else if(!isNaN(deploymentId)){
             // this is the internalid of the deployment we're looking for
             // TODO: not sure if we can use the deployment or not due to search limitations
         }
 
 
         // force the response to be JSON
         response.setHeader({
             name: 'Content-Type',
             value: 'application/json; charset=utf-8',
         });
         response.write(JSON.stringify(output));
     }
 
     function getStatus(taskId){
         let isMR = /MAPREDUCETASK/i.test(taskId),
             isSS = /SCHEDSCRIPT/i.test(taskId),
             taskStatus = task.checkStatus(taskId),
             total = 1,
             pending = 1,
             status = {
                 deploymentId:taskStatus.deploymentId,
                 scriptId: taskStatus.scriptId,
                 taskId: taskStatus.taskId,
                 status: taskStatus.status
             }
         ;
         if(isMR) {
             if (taskStatus.stage != "GET_INFO") {
                 total = taskStatus.getTotalMapCount();
                 pending = taskStatus.getPendingMapCount();
             }
             let processed = total - pending;
             status.stage = taskStatus.stage;
             status.totalMapCount = total;
             status.pendingMapCount = pending;
             status.processed = processed;
             status.percentComplete = ((processed / total) * 100).toFixed(2);
         }
         return status;
     }
 
     function getInstanceData(filterId,page){
         let limit = page & page>50 ? 50 : page ? page : 5;
         log.debug('limit',limit);
         let data = [];
         // script internalid || script scriptid || ???
         let filters = !isNaN(filterId) ? "internalid":"scriptid";
         log.debug('filter by',filters);
         var scheduledscriptinstanceSearchObj = search.create({
             type: "scheduledscriptinstance",
             filters: [
                 ["script."+filters,"is",filterId]
             ],
             columns:
                 [
                     search.createColumn({
                         name: "timestampcreated",
                         sort: search.Sort.DESC,
                         label: "Date Created"
                     }),
                     search.createColumn({name: "mapreducestage", label: "Map/Reduce Stage"}),
                     search.createColumn({name: "status", label: "Status"}),
                     search.createColumn({name: "startdate", label: "Start Date"}),
                     search.createColumn({name: "enddate", label: "End Date"}),
                     search.createColumn({name: "taskid", label: "Task ID"}),
                     search.createColumn({name: "originalpriority", label: "Original Priority"}),
                     search.createColumn({
                         name: "percentcomplete",
                         sort: search.Sort.ASC,
                         label: "Percent Complete"
                     }),
                     search.createColumn({name: "processorpool", label: "Processor Pool"}),
                     search.createColumn({name: "queueposition", label: "Queue Position"}),
                     search.createColumn({
                         name: "scriptid",
                         join: "scriptDeployment",
                         label: "Deployment Custom ID"
                     }),
                     search.createColumn({
                         name: "script",
                         join: "scriptDeployment",
                         label: "Deployment Script ID"
                     }),
                     search.createColumn({
                         name: "scripttype",
                         join: "scriptDeployment",
                         label: "Script Type"
                     }),
                     search.createColumn({
                         name: "status",
                         join: "scriptDeployment",
                         label: "Status"
                     }),
                     search.createColumn({
                         name: "title",
                         join: "scriptDeployment",
                         label: "Title"
                     }),
                     search.createColumn({
                         name: "recordtype",
                         join: "scriptDeployment",
                         label: "Record Type"
                     }),
                     search.createColumn({
                         name: "queueid",
                         join: "scriptDeployment",
                         label: "Queue"
                     }),
                     search.createColumn({
                         name: "internalid",
                         join: "scriptDeployment",
                         label: "Deployment Internal ID"
                     }),
                     search.createColumn({
                         name: "executioncontext",
                         join: "scriptDeployment",
                         label: "Execution Context"
                     }),
                     search.createColumn({
                         name: "eventtype",
                         join: "scriptDeployment",
                         label: "Event Type"
                     }),
                     search.createColumn({
                         name: "apiversion",
                         join: "script",
                         label: "API Version"
                     }),
                     search.createColumn({
                         name: "description",
                         join: "script",
                         label: "Description"
                     }),
                     search.createColumn({
                         name: "internalid",
                         join: "script",
                         label: "Script Internal ID"
                     }),
                     search.createColumn({
                         name: "name",
                         join: "script",
                         label: "Script Name"
                     }),
                     search.createColumn({
                         name: "scriptfile",
                         join: "script",
                         label: "Script File"
                     }),
                     search.createColumn({
                         name: "scriptid",
                         join: "script",
                         label: "Script ID"
                     }),
                     search.createColumn({
                         name: "scripttype",
                         join: "script",
                         label: "Script Type"
                     })
                 ]
         });
 
         var searchResultCount = scheduledscriptinstanceSearchObj.runPaged().count;
         log.debug("scheduledscriptinstanceSearchObj result count",searchResultCount);
         // scheduledscriptinstanceSearchObj.run().each(function(result){
         //     log.debug('result',result.toJSON().values);
         //     return false;
         // });
 
         let r = scheduledscriptinstanceSearchObj.runPaged({
             pageSize: limit
         }).fetch({index:0}).data;
         log.debug("script data",r);
         for(let result of r){
             data.push(result.toJSON().values);
         }
         log.debug('data',data);
 
         return data;
     }
 
     return {
         onRequest: onRequest
     };
 });
 