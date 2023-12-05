/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search', 'N/runtime', 'N/url', 'N/file', 'N/record','N/query'],
	
    function(ui, search, runtime, url, file, record, query) {
        function onRequest(context) {
          
        	//log.debug('context',context);
        	var request = context.request;
            var response = context.response;
            var pid = request.parameters.pid || null;
            
            /**************************************
             * build the initial page
             **************************************/
            if (request.method === 'GET') {
              
              
              var listOptionsObj = getRecordIds();
              log.debug('listOptionsObj',listOptionsObj);
              
              
              var rec = record.load({
                type: 'customrecordtype',
                id: getRecordId('customrecord_bb_site_survey')
              });
              log.debug('rec',rec);
			var fieldCount = rec.getLineCount({sublistId:'customfield'});
			log.debug('field Count',fieldCount);
              
            for(var f=0; f<fieldCount; f++){
              var fieldInternalId = rec.getSublistValue({
				sublistId: 'customfield',
				fieldId: 'fieldid',
				line: f
              });
              //log.debug('field id',fieldInternalId);

              var field = record.load({
                  type: 'customrecordcustomfield',
                  id: fieldInternalId,
                  isDynamic: true
              });
              //log.debug(field.getValue({fieldId:'scriptid'}),field);
              var fld = {
                fieldtype: field.getValue({fieldId:'fieldtype'}),
                selectrecordtypeid: field.getValue({fieldId:'selectrecordtype'}) ? listOptionsObj[field.getValue({fieldId:'selectrecordtype'})] : '',
                selectrecordtype: field.getValue({fieldId:'selectrecordtype'}),
                displaytype: field.getValue({fieldId:'displaytype'}),
                scriptid: field.getValue({fieldId:'scriptid'}),
                inactive: field.getValue({fieldId:'inactive'}),
                id: field.getValue({fieldId:'id'}),
                label: field.getValue({fieldId:'label'}),
                ismandatory: field.getValue({fieldId:'ismandatory'})
              }
              log.debug('fld',fld);
            }
              
              return;
              
              var r = record.load({
						type: 'customrecord_bb_site_survey',
						id: 101,
						isDynamic: false
					});

            log.debug('rec',r);
            
              var fields = r.getFields();
              //log.debug('fields',fields);
              
              var custFlds = fields.filter(function(f){return f.indexOf('custrecord')==0});
              //log.debug('custFlds',custFlds);
              
              for(var f=0; f<custFlds.length; f++){
                var fld = r.getField({fieldId:custFlds[f]});
                log.debug(custFlds[f],fld);
              }
              
              return;
              
              
              
              
              
            	var form = ui.createForm({
            		title: 'Project BOM Budget List'
            	});
            	//form.clientScriptFileId = 1077203;
            	//form.clientScriptModulePath = "SuiteScripts/....js";
            	
            	var prjFld = form.addField({
            		id : 'custpage_pid',
            		type : 'select',
            		label : 'Project',
					source : 'job'
            	});

            	if(pid){
            		prjFld.defaultValue  = pid;

            		var prj = record.load({
						type: record.Type.JOB,
						id: pid,
						isDynamic: false
					});

            		//log.debug('project rec',prj);

            		var cbudgetLineCt = prj.getLineCount({sublistId:'cbudget'});
            		log.debug('cbudget line ct',cbudgetLineCt);

					// costcategoryref = itemid
					var budgetLineIndex = prj.findSublistLineWithValue({
						fieldId: 'costcategoryref',
						sublistId: 'cbudget',
						value: 86
					});

					log.debug('budget line #',budgetLineIndex);

					prj.setSublistValue({
						sublistId: 'cbudget',
						fieldId: 'selectline',
						line: budgetLineIndex,
						value: true
					});
					prj.setSublistValue({
						sublistId: 'cbudget',
						fieldId: 'totalamount',
						line: budgetLineIndex,
						value: 8765
					});
					prj.setSublistValue({
						sublistId: 'cbudget',
						fieldId: 'amount_1_',
						line: budgetLineIndex,
						value: 8765
					});

					prj.save({
						enableSourcing: false,
						ignoreMandatoryFields: true
					})


				}

            	response.writePage(form);
            	return;
            }
            
            // POST
            // force the response to always be JSON
            response.setHeader({
            	name: 'Content-Type',
            	value: 'application/json; charset=utf-8',
            });
            response.write( 'some html or JSON' );
        }
  function getRecordId(scriptId){
		var id;
		if(scriptId.indexOf('customlist')==0)
			search.create({type:'customlist',filters:[['scriptid','is',scriptId]]}).run().each(function(r){id=r.id});
		else if(scriptId.indexOf('customrecord')==0)
			search.create({type:'customrecordtype',filters:[['scriptid','is',scriptId]]}).run().each(function(r){id=r.id});
		else if(scriptId.indexOf('customdeploy')==0)
			search.create({type:'scriptdeployment',filters:[['scriptid','is',scriptId]]}).run().each(function(r){id=r.id});
		log.debug('custom record id',id);
		return id;
	}
  function getRecordIds(rec,fieldId){
    var custRecs = getCustomRecords();
    
    var field = record.create({
                  type: 'customrecordcustomfield',
                  isDynamic: true
              });
                            
              field.setValue({fieldId:'fieldtype',text:'SELECT'});
		var fldArray = field.getField({fieldId:'selectrecordtype'}).getSelectOptions();
		// convert array to key/pair
		var fldObj = {};
    log.debug('fldArray.length',fldArray.length);
		for(var s=0; s<fldArray.length; s++){
          
			fldObj[fldArray[s].value] = {
              name: fldArray[s].text.toUpperCase(),
              scirptid: record.Type[fldArray[s].text.toUpperCase().replace(/\s/g,'_')]
            }
          if(custRecs[fldArray[s].value]){
            fldObj[fldArray[s].value].scriptid = custRecs[fldArray[s].value].scriptid;
            fldObj[fldArray[s].value].type = custRecs[fldArray[s].value].type;
          }
          if(!fldObj[fldArray[s].value].scriptid){
            // what's left??? native lists...
          }
		}
		return fldObj;
	}
  function getCustomRecords(){
	
      var custRecList = {};
		search.create({type:'customrecordtype',filters:[['isinactive','is','F']],columns:['internalid','scriptid']}).run().each(function(r){
          custRecList[r.getValue({name:'internalid'})] = {type:'customrecordtype', scriptid: r.getValue({name:'scriptid'})};
          return true;
        });
      search.create({type:'customlist',filters:[['isinactive','is','F']],columns:['internalid','scriptid']}).run().each(function(r){
          custRecList[r.getValue({name:'internalid'})] = {type:'customlist', scriptid: r.getValue({name:'scriptid'})};
        	return true;
        });
      log.debug('custRecList',custRecList);
	return custRecList;
	}
  
        
        return {
            onRequest: onRequest
        };
});
