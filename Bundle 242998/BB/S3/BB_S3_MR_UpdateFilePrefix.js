/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */
define(['N/record', 'N/search', 'N/runtime','N/query','N/cache','N/error','./Lib/BB.S3'],
function(record, search, runtime, query, cache, error, s3) {
    function getInputData() {
    	// deployment ID is passed into the MR
		/************** script parameters **************/
		var scriptObj = runtime.getCurrentScript();
		var dId = scriptObj.getParameter({name:"custscript_bludoc_deployid"});
		if(!dId){
			//exit
			log.error('MISSING PARAM','custscript_bludoc_deployid is required');
			return;
		}
		var _fileCountOnly = scriptObj.getParameter({name:"custscript_bludoc_only_file_ct"});
		_fileCountOnly = (_fileCountOnly=='T' || _fileCountOnly==true || _fileCountOnly=='true') ? true : false;
		log.debug(dId+' _fileCountOnly',_fileCountOnly);
		/************** end script parameters **************/

		// Now search the record types it's deployed to and find inconsistencies
		var _data = getDeployData(dId);
		log.debug(dId+' Deployment Details',_data);

		if(!_data.formula || !_data.field) {
			log.debug(_data.depid+' deployment has no field/formula parameters',_data.depscriptid);
			return;
		}

		// strip spaces, pipes and quotes ???
		// reformat for searching
		var regex = /(\{.*?\})/gm;
		var _formula = _data.formula.trim();
		_formula = _formula.replace(regex, `'||NVL($1,{internalid})||'`);
		_formula = _formula.replace(/^('\|\|)|(\|\|')$/gm, '');
      
      if(_formula.charAt(0)=="'" && _formula.indexOf('NVL')==1) 
        _formula = _formula.substr(1);
	  else if(_formula.indexOf('NVL')!=0) 
        _formula = "'"+_formula;
      
      if(_formula.lastIndexOf('})')!=_formula.length-2){
        _formula += "'"
        //_formula = _formula.substr(0,_formula.length-1);
      }
      
      
		//if (_formula.charAt(0) != '{') _formula = _formula.replace(/(^.[\w\/]*)/gm, "'$1");
		//if (_formula.charAt(_formula.length - 1) != '}') _formula = _formula + "'";
		log.debug(_data.depscriptid+' Substitution _formula result: ', _formula);
      
      var _filters = [["formulatext: case when NVL({" + _data.field + "},'__') != " + _formula  +" then 'NG' else 'Match' end", "is", "NG"]
                      ,"and",["mainline","is","T"]
                     ];
      var _cols = [
      		search.createColumn({name: _data.field}),
		  	search.createColumn({name: "formulatext",formula: _formula})
	  ];

      if(_fileCountOnly){
		  _filters[0] = [_data.field,'isnotempty','']
	  }

      // prevent empty formulas by trying to add the correct filters
      try{
		var searchObj = search.create({
			type: _data.rectype,
			filters: _filters,
			columns:_cols
		});
        var searchResultCount = searchObj.runPaged().count;
		log.debug(_data.depscriptid+" searchObj mainline result count", searchResultCount);
      } catch(e1){
        try{
          _filters[2]=["isinactive","is","F"];
          var searchObj = search.create({
              type: _data.rectype,
              filters: _filters,
              columns:_cols
          });
          var searchResultCount = searchObj.runPaged().count;
          log.debug(_data.depscriptid+" searchObj inactive result count", searchResultCount);
        } catch(e2) {
          _filters = [_filters[0]];
          var searchObj = search.create({
              type: _data.rectype,
              filters: _filters,
              columns:_cols
          });
          var searchResultCount = searchObj.runPaged().count;
          log.debug(_data.depscriptid+" searchObj formula only result count", searchResultCount);
        }
      }
      
		log.debug(_data.depscriptid+' search filters',searchObj.filterExpression);
		log.debug(_data.depscriptid+' search columns',searchObj.columns);
		

     	return searchObj;
    }

    function getDeployData(depId){
		var scriptCache = cache.getCache({
				name: 'scriptCache'+depId,
				scope: cache.Scope.PUBLIC
			});
		// add key/value to cache
		var depData = scriptCache.get({
			key: 'data',
			loader: function(){
				var _dep=record.load({type:'scriptdeployment',id:depId});

				var _data = {
					depid:depId,
					depscriptid: _dep.getValue({fieldId:'scriptid'}),
					depscript: _dep.getValue({fieldId:'script'}),
					rectype:_dep.getValue({fieldId:'recordtype'}),
					folder:_dep.getValue({fieldId:'custscript_bludocs_bucket_folder_path'}) || '',
					field:_dep.getValue({fieldId:'custscript_bludocs_path_field_id'}),
					formula:_dep.getValue({fieldId:'custscript_bludocs_path_formula'}),
					countfield:_dep.getValue({fieldId:'custscript_bludocs_file_count_field_id'}),
					useuuid:_dep.getValue({fieldId:'custscript_bludocs_use_uuid_field'})
				}
				if(_data.folder.charAt(_data.folder.length-1)!='/' && _data.folder!='') _data.folder=_data.folder.trim() +'/';

				return _data;
			}
		});

		return JSON.parse(depData);
	}

    function map(context) {
       // log.debug(context.key+' map context',context.value);
		var scriptObj = runtime.getCurrentScript();
		var dId = scriptObj.getParameter({name:"custscript_bludoc_deployid"});
		// get a value from the cache
		var _data = getDeployData(dId);
		//log.debug('cache data',_data);

        // context.key = indext value if standard array
		// context.key = record id if search result
		// context.value = array value or search result

		var result = JSON.parse(context.value);
		//log.debug('map result',result);

		var _rData = {
			recordType: result.recordType,
			id:result.id,
			folder: _data.folder,
			newpath: result.values.formulatext,
			field:_data.field,
			oldpath:result.values[_data.field]
		};
		//log.debug('map _rData',_rData);

		/************** script parameters **************/
		var scriptObj = runtime.getCurrentScript();
		var _fileCountOnly = scriptObj.getParameter({name:"custscript_bludoc_only_file_ct"});
		_fileCountOnly = (_fileCountOnly=='T' || _fileCountOnly==true || _fileCountOnly=='true') ? true : false;
		/************** end script parameters **************/

		if(_fileCountOnly){
			var rootfolder = _rData.folder || '';
			// force the account number into the root of the bucket path/prefix
			rootfolder = runtime.accountId + '/' + rootfolder;
			if (rootfolder.charAt(rootfolder.length - 1) != '/' && rootfolder != '') {
				rootfolder = rootfolder + '/';
			}
			var _service = new s3.Service();
			var recPath = rootfolder + _rData.newpath.replace(/^\/|\/$/g, '');
			var _imagesUrlList = _service.getPresignedList(recPath) || [];
			var valueObj={};
			if(_data.countfield){
				valueObj[_data.countfield] = _imagesUrlList.length;
			}
			if(Object.keys(valueObj).length>0){
				record.submitFields({
					type: _rData.recordType,
					id: _rData.id,
					values: valueObj,
					options: {
						enableSourcing: false,
						ignoreMandatoryFields: true,
						disableTriggers: true
					}
				});
				log.debug('file count set '+_rData.recordType+':'+_rData.id,valueObj);
			}
		} else
			context.write(_rData.id, _rData); // move on to set the path data

    }


    function reduce(context) {
		var values = [];
		for(var i=0; i<context.values.length; i++){
			var value = JSON.parse(context.values[i]);
			values.push( value );
		}

		var data = values[0];
		data.movecount=0;
		log.debug(context.key+' data',data);

		// move the AWS files by triggering the UE
		// success - update the record

		try {
			// don't move files that are in or to a "root" or empty folder
			var newRecPath = data.newpath.replace(/^\/|\/$/g, '');
			var oldRecPath = data.oldpath.replace(/^\/|\/$/g, '');
			if(oldRecPath=="" || newRecPath==""){
				log.audit('Path issues, exit this record',{old: oldRecPath, new: newRecPath});
				return;
			}

			var rootfolder = data.folder || '';
			// force the account number into the root of the bucket path/prefix
			rootfolder = runtime.accountId + '/' + rootfolder;
			if (rootfolder.charAt(rootfolder.length - 1) != '/' && rootfolder != '') {
				rootfolder = rootfolder + '/';
			}

			var _service = new s3.Service();
			newRecPath = rootfolder + newRecPath;
			oldRecPath = rootfolder + oldRecPath;
			log.debug('paths objects', {old: oldRecPath, new: newRecPath});

			var _imagesUrlList = _service.getPresignedList(oldRecPath) || [];
			log.debug('_imagesUrlList', _imagesUrlList);

			var valueObj={};
			// update S3 path
			if (data.oldpath!="" && newRecPath.length > 0 && _imagesUrlList[0]) {
				var _delObjects = [];
				// TODO: if _imagesUrlList.length is too large pass this off to another processing script....

				for (var i = 0; i < _imagesUrlList.length; i++) {
					var _fullPath = _imagesUrlList[i];
					var _fileName = _fullPath.substring(_fullPath.lastIndexOf('/') + 1);
					log.debug('moving ' + _fileName, {from: _fullPath, to: newRecPath + '/' + _fileName});
					var _response = _service.moveObject(_fullPath, newRecPath + '/' + _fileName);
					log.debug('moveObject Response', _response);
					if (_response.code == 200) _delObjects.push(_fileName);
				}
				/*if (_delObjects.length > 0) {
					_response = _service.deleteAmazonObjects(oldRecPath, _delObjects);
					log.debug('deleteAmazonObjects Response', _response);
					data.movecount = _delObjects.length;
				}*/
			}
			if(data.countfield){
				valueObj[data.countfield] = _imagesUrlList.length;
			}
			valueObj[data.field] = data.newpath;

			record.submitFields({
				type: data.recordType,
				id: data.id,
				values: valueObj,
				options: {
					enableSourcing: false,
					ignoreMandatoryFields: true,
					disableTriggers: true
				}
			});


			log.debug(data.recordType + ':' + data.id, valueObj);
		} catch (e) {
			log.error(data.recordType+':'+data.id,e);
		}

    	context.write(context.key, data);
    }
    function summarize(summary) {
    	// InputSummary
    	log.debug('InputSummary', JSON.stringify(summary.inputSummary));
    	
    	/*
    	 * ERRORS
    	 */
    	if (summary.inputSummary.error)
        {
            log.error('Input Error', summary.inputSummary.error);
        };
        var mapErrorKeys = [];
	    summary.mapSummary.errors.iterator().each(function (key, error)
	        {
	            log.error('Map Error for key: ' + key, error);
	            mapErrorKeys.push(key); 
	            return true;
	        });
	    log.debug('map error keys',mapErrorKeys);
	    var reduceErrorKeys = [];
	    summary.reduceSummary.errors.iterator().each(function (key, error)
	        {
	            log.error('Reduce Error for key: ' + key, error);
	            reduceErrorKeys.push(key);
	            return true;
	        });
	    log.debug('reduce error keys',reduceErrorKeys);
    
    	
    	// Summary
		log.debug('Map Summary', JSON.stringify(summary.mapSummary));
		log.debug('Reduce Summary', JSON.stringify(summary.reduceSummary));
		log.audit(summary.toString(), JSON.stringify(summary));

        
        // summary.output.iterator().each(function(key, value) {
        //     // iterator key/value is from the reduce stage context.write(key,value)
    	// 	log.audit(key,'updated ' + value + ' records');
        //     return true;
        // });
        
      // remove cache
       var scriptObj = runtime.getCurrentScript();
		var dId = scriptObj.getParameter({name:"custscript_bludoc_deployid"});
		cache.getCache({
			name: 'scriptCache'+dId,
			scope: cache.Scope.PUBLIC
		}).remove({key: 'data'});

    	log.debug('SCRIPT COMPLETED');
    }



    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize,
        
        config:{
        	retryCount: 0,
            exitOnError: false
        }
    };
    
});


