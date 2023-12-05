/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope Public
 */
define(['N/runtime', 'N/record', 'N/search'],

  function(runtimeModule, recordModule, searchModule) {

    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
      try {
        var
          _salesOrderId
          , _salesOrder
          , _projectFields
          , _financier
          , _location
          , _subsidiary
          , _lineIndex
          , _lineCount
          , _expenseObj = runtimeModule.getCurrentScript().getParameter({
            name: 'custscript_bb_proj_exp_budg_obj'
          })
        ;

        if (typeof _expenseObj == 'string') {
          _expenseObj = JSON.parse(_expenseObj);
        }
        if (_expenseObj.projectId) {
          _salesOrderId = searchProjectSalesOrder(_expenseObj.projectId);
          _projectFields = searchModule.lookupFields({
            type: searchModule.Type.JOB
            , id: _expenseObj.projectId
            , columns: ['custentity_bb_financier_customer', 'custentity_bb_project_location', 'subsidiary']
          });

          _financier = _projectFields.custentity_bb_financier_customer[0] ? _projectFields.custentity_bb_financier_customer[0].value : null;
          _location = _projectFields.custentity_bb_project_location[0] ? _projectFields.custentity_bb_project_location[0].value : null;
          _subsidiary = _projectFields.subsidiary[0] ? _projectFields.subsidiary[0].value : null;
          if (!_financier)  {
            throw 'Project is Missing Financier';
          }
          if (_salesOrderId) {
            _salesOrder = recordModule.load({
              type: recordModule.Type.SALES_ORDER
              , id: _salesOrderId
              , isDynamic: true
            });
          } else {
            _salesOrder = recordModule.create({
              type: recordModule.Type.SALES_ORDER
              , isDynamic: true
            });
            _salesOrder.setValue({ fieldId: 'entity', value: _financier });
            _salesOrder.setValue({ fieldId: 'subsidiary', value: _subsidiary });
            _salesOrder.setValue({ fieldId: 'location', value: _location });
            _salesOrder.setValue({ fieldId: 'custbody_bb_project', value: _expenseObj.projectId });
            _salesOrder.setValue({ fieldId: 'custbody_bb_milestone', value: 2 });
            _salesOrder.setValue({ fieldId: 'trandate', value: new Date() });
          }
          if (_expenseObj.items.length > 0) {
            _expenseObj.items.forEach(function(line){
              _lineIndex = getLineIndex(_salesOrder, line.id);
              if(line.delete) {
                if (_lineIndex > -1) {
                  _salesOrder.removeLine({ sublistId: 'item', line: _lineIndex });
                }
              } else {
                upsertSoLine(_salesOrder, line.itemId, line.description, 1, line.amount, line.id);
              }
            });


            _lineCount = _salesOrder.getLineCount({ sublistId: 'item' });

            if (_lineCount > 0) {
              _salesOrderId = _salesOrder.save({ ignoreMandatoryFields: true });
              recordModule.submitFields({
                type: recordModule.Type.JOB
                , id: _expenseObj.projectId
                , values: {
                  custentity_bb_project_so: _salesOrderId
                }
                , options: {
                  ignoreMandatoryFields: true
                  , disableTriggers: true
                }
              });

            } else if (_lineCount <= 0 && _salesOrderId) {
              recordModule.delete({
                type: recordModule.Type.SALES_ORDER
                , id: _salesOrderId
              });
            }
          }

        }

      } catch (e) {
        log.error('ERROR: ProjectExpenseBudgetProcess', e);
      }
    }

    function searchProjectSalesOrder(projectId) {
      var
        _salesOrderId =  undefined
        , _salesOrderSearch
      ;
      if (projectId) {
        _salesOrderSearch = searchModule.create({
          type: searchModule.Type.SALES_ORDER
          , filters:
            [
              ['mainline', searchModule.Operator.IS,"T"]
              , 'AND'
              ,['custbody_bb_project', searchModule.Operator.ANYOF, projectId]
            ]
        });
        _salesOrderSearch.run().each(function(result){
          _salesOrderId = result.id;
          return true;
        });
      }
      return _salesOrderId;
    }

    function getLineIndex(salesOrder, id) {
      return salesOrder.findSublistLineWithValue({
        sublistId: 'item'
        , fieldId: 'custcol_bb_proj_exp_budg_line'
        , value: id
      });
    }

    function upsertSoLine(salesOrder, itemId, description, quantity, rate, projectExpenseBudgetLineId) {
      var
        _lineIndex = getLineIndex(salesOrder, projectExpenseBudgetLineId)
      ;
      if(_lineIndex > -1) {
        salesOrder.selectLine({ sublistId: 'item', line: _lineIndex });
      } else {
        salesOrder.selectNewLine('item');
      }
      salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: itemId });
      salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: quantity });
      salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: description });
      if (rate) {
        salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: rate });
      }
      if(_lineIndex == -1) {
        salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_bb_proj_exp_budg_line', value: projectExpenseBudgetLineId });
      }
      salesOrder.commitLine({ sublistId: 'item' });
    }

    return {
      execute: execute
    };

  });
