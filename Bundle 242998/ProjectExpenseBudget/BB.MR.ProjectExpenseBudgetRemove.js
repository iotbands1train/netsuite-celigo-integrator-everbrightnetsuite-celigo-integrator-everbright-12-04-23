/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/runtime'],
    /**
 * @param{record} recordModule
 * @param{search} searchModule
     * @param{runtime} runtimeModule
 */
    (recordModule, searchModule, runtimeModule) => {

      const
        SUBLISTS = {
          BUDGET_LINE: 'recmachcustrecord_bb_proj_exp_budget'
          , LINE_SEQ: 'recmachcustrecord_bb_proj_exp_budg_line'
        }
      ;

        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
          let
            _currentScript = runtimeModule.getCurrentScript()
            , _peId = _currentScript.getParameter({name: 'custscript_bb_mr_peb_remove_id'})
            , _record
            , _deletedId
            , _lineCount
            , _result = []
          ;

          // log.debug('PEB ID', _peId);
          if(_peId){
            _record = recordModule.load({type: 'customrecord_bb_proj_exp_budget', id: _peId, isDynamic: true});
            _lineCount = _record.getLineCount({sublistId: SUBLISTS.BUDGET_LINE});
            for(let i = 0; i < _lineCount; i++){
              let _id = _record.getSublistValue({sublistId: SUBLISTS.BUDGET_LINE, fieldId: 'id', line: 0});
              if(_id){
                _result.push(_id);
                _record.removeLine({sublistId: SUBLISTS.BUDGET_LINE, line: 0, ignoreRecalc: true});
              }
            }
            //log.debug('_record.getLineCount', _record.getLineCount({sublistId: SUBLISTS.BUDGET_LINE}));
            //_record.save({ignoreMadatoryFields: true});
            //_deletedId = recordModule.delete({type: 'customrecord_bb_proj_exp_budget', id: _peId});
          }
          // log.debug('PEB -> PEBL Remove', _result);
          // log.debug('PEB Remove', _peId);
          return _result;
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {
          log.debug('mapContext', mapContext);
          let
            _record
            , _deletedId
            , _lineCount
            , _result = []
          ;

          if(mapContext.value){
            _record = recordModule.load({type: 'customrecord_bb_proj_exp_budg_line', id: mapContext.value, isDynamic: true});
            _lineCount = _record.getLineCount({sublistId: SUBLISTS.LINE_SEQ});
            for(let i = 0; i < _lineCount; i++){
              let _id = _record.getSublistValue({sublistId: SUBLISTS.LINE_SEQ, fieldId: 'id', line: 0});
              if(_id){
                mapContext.write(mapContext.value, _id);
                _result.push(_id);
                _record.removeLine({sublistId: SUBLISTS.LINE_SEQ, line: 0, ignoreRecalc: true});
              }
            }
            // log.debug('PEBL -> PEBLS Remove', _result);
            // log.debug('PEBL Remove', mapContext.value);
            _record.save({ignoreMadatoryFields: true});
            //_deletedId = recordModule.delete({type: 'customrecord_bb_proj_exp_budg_line', id: mapContext.value});
          }
          if(_result.length === 0){
            mapContext.write(mapContext.value, '');
          }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {
          log.debug('reduceContext', reduceContext);
          // if(reduceContext.values instanceof Array && reduceContext.values.length > 0) {
          //   reduceContext.values.forEach(function(value){
          //     if(value) {
          //       recordModule.delete({type: 'customrecord_bb_proj_exp_budg_line_seq', id: value});
          //     }
          //   });
          // }
          log.debug('reduceContext.key', reduceContext.key);
          recordModule.delete({type: 'customrecord_bb_proj_exp_budg_line', id: reduceContext.key});
        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {
          let
            _currentScript = runtimeModule.getCurrentScript()
            , _peId = _currentScript.getParameter({name: 'custscript_bb_mr_peb_remove_id'})
            , _errorsCount = 0
          ;
          if(summaryContext.inputSummary.error){
            _errorsCount++;
            log.debug('input error', summaryContext.inputSummary.error);
          }
          summaryContext.mapSummary.errors.iterator().each(function(key, error) {
            log.debug('map error -> ' + key, error);
            _errorsCount++;
            return true;
          });
          summaryContext.reduceSummary.errors.iterator().each(function(key, error) {
            log.debug('map error -> ' + key, error);
            _errorsCount++;
            return true;
          });
          log.debug('_errorsCount', _errorsCount);
          if(_errorsCount === 0){
            recordModule.delete({type: 'customrecord_bb_proj_exp_budget', id: _peId});
          }
        }

        return {getInputData, map, reduce, summarize}

    });
