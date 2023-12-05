/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope Public
 *
 */

define(['N/runtime','N/file', '../BB SS/API Logs/API_Log'],
function(runtime, file, apiLog) {

    function process(method) {
        return function(payloadOrParams) { return doCall(payloadOrParams, method) };
    }

    function doCall(payload,method){
        log.debug('payload',payload);
        var _module,
            _output = {};
        var _apiLog = new apiLog.APILog({body:payload,method:method.toUpperCase()});

        var _scriptObj = runtime.getCurrentScript();
        var _moduleFileName = _scriptObj.getParameter({name: 'custscript_bb_module_file_name'});
        var _fieldMap = _scriptObj.getParameter({name: 'custscript_bb_field_map_'+method.toLowerCase()});

        _apiLog.setValue({fieldId:'parameters',value:{
            custscript_bb_module_file:_moduleFileName, custscript_bb_field_map:_fieldMap
            }});

        var _modPath = file.load({id:'./libs/'+_moduleFileName}).path;
        log.debug('module file path',_modPath);

        require([_modPath], function(module){ _module = module; });

        if(typeof _module[method]=="function"){
            _output = _module[method].call(this, {
                payload:payload,
                apilog:_apiLog,
                map:_fieldMap
            });
        } else {
            _output = {error: {code: 'UNKNOWN_METHOD',message: 'Request method invalid. '+method.toUpperCase()+' is not supported by this action.'}};
            _apiLog.setValue({fieldId:'error',value:_output});
        }

        _apiLog.setValue({fieldId:'response',value:_output});
        return _output;
    }

    return {
    	get: process('get'),
        post: process('post'),
        put: process('put'),
        delete: process('delete')
    };
});
