/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 * @version 0.0.1
 * @author Michael Golichenko
 **/

define(['./BB.DS.Envelope.Service'],
    function(envelopeService) {

        var _exports = {};

        _exports.sendEnvelope = function(context){
            context.response.setHeader({name: 'Content-Type', value: 'application/json'});
            var _projectId = parseInt(context.request.parameters.projectId);
            var _counterPartyId = parseInt(context.request.parameters.counterPartyId);
            if(isNaN(_projectId) || isNaN(_counterPartyId)){
                log.error('ERROR: sendEnvelope()', {projectId: _projectId, counterPartyId: _counterPartyId});
                context.response.write(JSON.stringify(['Please contact your administrator to fix following issue.']));
                return;
            }
            var _result = envelopeService.createEnvelopeFromProjectForCounterParty(_projectId, _counterPartyId);
            context.response.setHeader({name: 'Content-Type', value: 'application/json'});
            context.response.write(JSON.stringify(_result));
        };

        _exports.sendEnvelopeFromProjectAction = function(context){
          var
            _projectActionId = parseInt(context.request.parameters.projectActionId)
            , _result
          ;
          if(isNaN(_projectActionId)){
            log.error('ERROR: sendEnvelopeFromProjectAction()', {projectActionId: _projectActionId});
            context.response.write(JSON.stringify(['Please contact your administrator to fix following issue.']));
            return;
          }
          _result = envelopeService.createEnvelopeFromProjectAction(_projectActionId);
          context.response.setHeader({name: 'Content-Type', value: 'application/json'});
          context.response.write(JSON.stringify(_result));
        };

        function onRequest(context){
            var _action = context.request.parameters.action;
            if(typeof _action === 'string' && _exports.hasOwnProperty(_action) && typeof _exports[_action] === 'function'){
                _exports[_action](context);
            } else {
                context.response.setHeader({name: 'Content-Type', value: 'application/json'});
                context.response.write(JSON.stringify({status: 'ERROR', message: 'No valid actions specified.'}));
            }
        }


        _exports.onRequest = onRequest;
        return _exports;

    });