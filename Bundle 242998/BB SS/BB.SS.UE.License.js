/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *
 * Use this ID:  customscript_bbss_license_ue
 */

define([], 
function() {

    function beforeLoad(scriptContext) {
    	if(scriptContext.type!='view' && scriptContext.type!='edit') return;

    	scriptContext.form.addField({
			id : 'custpage_bbss_send_license',
			type : 'inlinehtml',
			label : 'BBSS Send License Data'
		}).defaultValue = `<script>
			try{
				require(['N/runtime','N/https','N/url'],function (runtime,https,url){
					var userHasBillingInfo = runtime.getCurrentUser().getPermission({name:'ADMI_BILLINGINFO'})==4;//FULL
					console.log('send billing info',userHasBillingInfo);
					if(!userHasBillingInfo) return;
				
					jQuery( "body" ).append( '<div id="billinginfo" style="display:none;" />' );
					jQuery('#billinginfo').load('/app/billing/billingevents.nl?whence=',function(){
						var billingInfo = jQuery(this);
						var billables = billingInfo.find('#billables_splits tr');
						var data=[];
						billables.each(function(index,tr){
							var rowData=[];
							var row = jQuery(tr).children();
							row.each(function(i,td){
								var value = jQuery(td).text();
								rowData.push(value);
							});
							data.push(rowData);
						});
						var dataObj = {};
						if(data.length>0){
							for(var r=1; r<data.length; r++){
								var c = data[r];
								dataObj[c[0]] = {
									"provisioned":c[1],
									"used":c[2]
								};
							}
						}
						console.log(dataObj);
						var suiteletURL = url.resolveScript({
							scriptId: 'customscript_bbss_schedule_task',
							deploymentId: 'customdeploy_bbss_schedule_task'
						});
						if(suiteletURL){
						    var taskResponse = https.post({
						    	url:suiteletURL,
						    	body: {
						    	    s:'customscript_bbss_licensing',
						    	    d:'customdeploy_bbss_licensing',
						    	    p:JSON.stringify({"custscript_bbss_license_data":dataObj})
						    	}
						    });
						    console.log('taskResponse',taskResponse);
						}
					}).remove();
				});
			} catch(err) {
				console.error(err);
			}
			</script>`;
    }


    return {
    	beforeLoad: 	beforeLoad
    };
});
