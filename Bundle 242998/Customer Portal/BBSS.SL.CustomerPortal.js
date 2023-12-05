/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search', 'N/runtime', 'N/url', 'N/file', 'N/render', 'N/redirect', 'N/email', 'N/record', 'N/http'],
    function (ui, search, runtime, url, file, render, redirect, email, record, http) {

        function onRequest(context) {
            let request = context.request;
            let response = context.response;
            let scriptObj = runtime.getCurrentScript();


            if (request.method == http.Method.GET) {
                let filterID = request.parameters.filter
                log.debug('filterID', filterID)
                if (filterID == undefined) {
                    // return email form
                    let htmlSubmitForm = file.load({
                        id:  './submitForm.html'
                    });
                  let gapikey=scriptObj.getParameter({name: 'custscript_bb_google_portal_api_key'});
                  log.debug('google key',gapikey);
                    response.write(htmlSubmitForm.getContents().replace('{googleapikey}',gapikey));
                } else {
                    let htmlFile = file.load({
                        id: './customerPortal.html'
                    });
                    let searchResults = getProject(filterID);
                    let htmlData = generateHTMLCode(searchResults);
                  	let gapikey=scriptObj.getParameter({name: 'custscript_bb_google_portal_api_key'});
                  log.debug('google key',gapikey);
                    response.write(htmlFile.getContents().replace('{googleapikey}',gapikey).replace('@PROJECT_ACTION_TABLE', htmlData));
                    return;
                }

            } else if (request.method == http.Method.POST) {
                log.debug('POST request', request)
                let projectEmail = request.parameters.projectEmail;
                log.debug('projectEmail', projectEmail);
              try{
                var link=request.headers.referer +'&filter='+projectEmail;
                email.send({
                    author: scriptObj.getParameter({name: 'custscript_bb_email_sender_rcd_emp'}),
                    recipients: projectEmail,
                    subject: 'Customer Portal Link',
                    body: 'Use this link to monitor your project : <a href="'+ link +'" target="_blank">LINK</a>'
                });
                log.debug('link sent', link);
                response.write('Please check your email for your custom link');
              } catch(e){
                log.error('EMAIL_SEND_ERROR',e);
                response.write('Email not sent.\n'+e.message);
              }
            }

        }

        function getProject(filterID) {
            let filter;
            if (filterID.includes("@")) {
                filter = [["custrecord_bb_project.custentity_bb_home_owner_primary_email", "is", filterID]];
            } else {
                filter = [["custrecord_bb_project.entityid", "is", filterID]];
            }
            let customrecord_bb_project_actionSearchObj = search.create({
                type: "customrecord_bb_project_action",
                filters: filter,
                columns:
                    [
                        search.createColumn({
                            name: "custrecord_bb_project",
                            sort: search.Sort.ASC
                        }),
                        search.createColumn({
                            name: "custrecord_bb_document_status",
                            sort: search.Sort.ASC
                        }),
                        "name",
                        "custrecord_bb_project",
                        "custrecord_bb_proj_act_sequence",
                        "custrecord_bb_document_status_date",
                        "custrecord_bb_package"

                    ]
            });
            return customrecord_bb_project_actionSearchObj.run()
        }

        function generateHTMLCode(searchResults) {
          let _project='';  
          let html = 
  `<table class="table">
  <thead><tr>
      <th scope="col">Name</th>
      <th scope="col">Action</th>
      <th scope="col">Status</th>
      <th scope="col">Date</th>
    </tr>
  </thead>
  <tbody>`;
            log.debug('searchResults', searchResults)
            searchResults.each(function (result) {
                if(!_project) _project=result.getText('custrecord_bb_project');
              /*
              html += '<div class="divTableRow">';
                html += '<div class="divTableCell">' + result.getValue('name') + '</div>';
                html += '<div class="divTableCell">' + result.getText('custrecord_bb_package') + '</div>';
                html += ' <div class="divTableCell">' + result.getText('custrecord_bb_document_status') + '</div>';
                html += '<div class="divTableCell">' + result.getValue('custrecord_bb_document_status_date') + '</div>';
                html += '</div>';
              */
              
              html += '<tr>';
              html += '<td>' + result.getValue('name') + '</td>';
              html += '<td>' + result.getText('custrecord_bb_package') + '</td>';
              html += '<td>' + result.getText('custrecord_bb_document_status') + '</td>';
              html += '<td>' +result.getValue('custrecord_bb_document_status_date') + '</td>';
              html += '</tr>';
              
                return true;
            });
          html += '</tbody></table>';
          
          html = '<h3>'+_project+'</h3><br>'+html;
          
            return html;

        }


        return {
            onRequest: onRequest
        };
    })
;
