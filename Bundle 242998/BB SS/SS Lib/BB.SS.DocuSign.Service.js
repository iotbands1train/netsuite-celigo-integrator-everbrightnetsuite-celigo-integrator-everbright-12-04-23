define(['N/https'], function(httpsModule){
    var requestHeaders = {
        "Content-Type": "application/json",
        "X-DocuSign-Authentication": JSON.stringify({
            "Username":"bboyd@bluebanyansolutions.com",
            "Password":"wvxJikWvY4GxbqelEEK2",
            "IntegratorKey":"97148b1e-2a08-4251-b089-56980ebc31cd"
        })
    };
    var jsonPayload = {
        "status": "sent",
        "templateId": "8AE75873-9732-4860-BC7E-26E64B447BE2",
        "templateRoles": [
            {
                "email": "mgolichenko@bluebanyansolutions.com",
                "name": "Michael Golichenko",
                "roleName": "Primary Contact",
                "tabs": {
                    "textTabs": [
                        // {
                        //     "tabLabel": "job_name",
                        //     "value": "Test job " + new Date()
                        // }
                    ]
                }
            }
        ]
    };
    var envelopeEndpoint = "https://demo.docusign.net/restapi/v2/accounts/6375980/envelopes";
    var _export = {};
    _export.sendEnvelope = function(data){
        if(data){
            log.debug('data', data);
            var textTabs = [];
            for(var key in data){
                if(data.hasOwnProperty(key)){
                    textTabs.push({
                        "tabLabel": key,
                        "value": data[key]
                    })
                }
            }
            log.debug("textTabs", textTabs);
            for(var i = 0; i < jsonPayload.templateRoles.length; i++){
                jsonPayload.templateRoles[i].tabs.textTabs = textTabs;
            }
        }
        var response = httpsModule.post({
            url: envelopeEndpoint,
            body: JSON.stringify(jsonPayload),
            headers: requestHeaders
        });
        log.debug('payload', jsonPayload);
        log.debug('response', response);
    };

    return _export;

});