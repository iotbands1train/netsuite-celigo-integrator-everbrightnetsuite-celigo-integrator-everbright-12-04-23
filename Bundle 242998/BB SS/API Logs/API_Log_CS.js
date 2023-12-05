<script>
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* @ FILENAME      : API_Log_CS.js
* @ AUTHOR        : David Smith
* @ DATE          : 2019/07
* @Descriptin - Formats JSON and XML fields in the API Log custom record
* Copyright (c) 2019 MultiPoint Videos, LLC.
* All Rights Reserved.
*
* This software is the confidential and proprietary information of
* MultiPoint Videos, LLC. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with MultiPoint Videos, LLC.
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

document.head.appendChild(document.createElement('style')).innerHTML = 'pre {max-width: 800px; overflow-y: auto; background-color: aliceblue; outline: 1px solid #ccc; padding: 5px; margin: 5px; } .string { color: green; } .number { color: darkorange; } .boolean { color: blue; } .null { color: magenta; } .key { color: red; }';

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

var prettifyXml = function(sourceXml)
{
	var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
	var xsltDoc = new DOMParser().parseFromString([
		// describes how we want to modify the XML - indent everything
		'<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
		'  <xsl:strip-space elements="*"/>',
		'  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
		'    <xsl:value-of select="normalize-space(.)"/>',
		'  </xsl:template>',
		'  <xsl:template match="node()|@*">',
		'    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
		'  </xsl:template>',
		'  <xsl:output indent="yes"/>',
		'</xsl:stylesheet>',
	].join('\n'), 'application/xml');

	var xsltProcessor = new XSLTProcessor();
	xsltProcessor.importStylesheet(xsltDoc);
	var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
	var resultXml = new XMLSerializer().serializeToString(resultDoc);
	return resultXml;
};

var cr,rec;
jQuery(document).ready(function(){
	require(['N/record','N/currentRecord'],function(record,currentRecord){
		cr = currentRecord.get();
		rec = record.load({type: cr.type, id: cr.id});
		console.log(rec);

		var fields = ['custrecord_api_headers','custrecord_api_parameters','custrecord_api_response','custrecord_api_body','custrecord_api_error','custrecord_api_files','custrecord_api_response_headers','custrecord_api_request_error'];

		for(var f=0; f<fields.length; f++){
			var fieldId = fields[f];
			var fieldValue = rec.getValue({fieldId:fieldId});
			console.log(fieldValue);
			try{
				// test for XML
				if((/<((xml)|(cxml))/i).test(fieldValue) && (/<\/((xml)|(cxml))>/i).test(fieldValue)){
					fieldValue = prettifyXml(fieldValue);
					console.log(fieldValue);
					var el = jQuery('#'+fieldId+'_fs_lbl_uir_label').siblings('.uir-field');
					el.html('<pre lang="xml" />');
					el.find('pre').text(fieldValue);
				} else {
					fieldValue = JSON.parse(fieldValue);
					console.log(fieldValue);
					var json = syntaxHighlight( JSON.stringify( fieldValue,null,4) );
					jQuery('#'+fieldId+'_fs_lbl_uir_label').siblings('.uir-field').html('<pre>'+ json +'</pre>' );
				}
			} catch(e){
				console.log('Not JSON');
			    console.error(e);
			}

		}
      
    var s = rec.getValue({fieldId:'custrecord_api_scriptid'});
  	var d = rec.getValue({fieldId:'custrecord_api_deploymentid'});
    var m = rec.getValue({fieldId:'custrecord_api_method'}).toLowerCase();
	if(s && d && m){
      jQuery('#custpage_init_json_script_fs').append('<button onclick="retryLog();">Retry</button>');
    }
	});
})

function retryLog(){
  require(['N/url','N/currentRecord','N/record','N/https'],function(url,currentRecord,record,https){
  	if(!rec){
      cr = currentRecord.get();
      console.log(cr);
      rec=record.load({type:cr.type,id:cr.id});
    }
    
  var s = rec.getValue({fieldId:'custrecord_api_scriptid'});
  var d = rec.getValue({fieldId:'custrecord_api_deploymentid'});
  var m = rec.getValue({fieldId:'custrecord_api_method'}).toLowerCase();
  var b = rec.getValue({fieldId:'custrecord_api_body'});
  var h = rec.getValue({fieldId:'custrecord_api_headers'});
  var p = rec.getValue({fieldId:'custrecord_api_parameters'});
  console.log(s,d);
  var scriptUrl = url.resolveScript({
      scriptId: s,
      deploymentId: d,
      returnExternalUrl: false
  });
  console.log(scriptUrl);
  var resp = https[m]({
      url: scriptUrl,
      body: b,
      headers: h
  });
  console.log(resp);
  });
}
</script>