/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @NScriptType Suitelet
 */
define([
  'N/search', 
  'N/runtime',
  'N/redirect',

  './Modules/BB.SS.MD.Forecaster', // continue adding as needed.
  './Modules/BB.SS.MD.Scheduler',
  './Modules/BB.SS.MD.Charts',
  './Modules/BB.SS.MD.CashVisualization',
  './Modules/BB.SS.MD.ProjectProfitability',
  './Modules/BB.SS.MD.ProjectProfitabilityEstimated',
  './Modules/BB.SS.MD.ReleaseNotes',
  './Modules/BB.SS.MD.ActionManagement'
], (
  nSearch, 
  nRuntime,
  nRedirect,

  ForecasterService,
  SchedulerService,
  ChartsService,
  CashVisualizationService,
  ProjectProfitabilityService,
  ProjectProfitabilityEstimatedService,
  ReleaseNotesService,
  ActionManagementService
) => {

  const services = {
    forecaster: ForecasterService,
    scheduler: SchedulerService,
    charts: ChartsService,
    cashvisualization: CashVisualizationService,
    projectprofitability: ProjectProfitabilityService,
    projectprofitabilityestimated: ProjectProfitabilityEstimatedService,
    releasenotes: ReleaseNotesService,
    multiaction: ActionManagementService
  }

  const onRequest = (context) => {
    let request = context.request;
    let parameters = request.parameters;
    let service = parameters && parameters.service;

    context.response.setHeader({
      name: 'Content-Type',
      value: 'application/json'
    });

    if (request.method == 'GET') {
      let parameters = request.parameters;

      if (parameters.goToProject) {
        let projectId = parameters.goToProject;

        nRedirect.toRecord({
          id: projectId,
          type: 'job'
        });

        return;
      } else if (parameters.goToProjectAction) {
        let projectActionId = parameters.goToProjectAction;

        nRedirect.toRecord({
          id: projectActionId,
          type: 'customrecord_bb_project_action'
        });

        return;
      }
    }

    if (services[service]) {
      let preferences = getPreferences(service);
      services[service].process(context, preferences);
    }
  }

  const getPreferences = (service) => {
    let user = nRuntime.getCurrentUser().id;

    let search = nSearch.create({
      type: 'customrecord_bb_ss_personal_preferences',
      filters: [
        ['isinactive', 'is', 'F'],
        'and',
        ['custrecord_bb_ss_pp_user', 'anyof', user],
        'and',
        ['custrecord_bb_ss_pp_service', 'is', service]
      ],
      columns: ['name', 'custrecord_bb_ss_pp_value']
    });

    let results = {};

    search.run().each((r) => {
      results[r.getValue('name')] = r.getValue('custrecord_bb_ss_pp_value');

      return true;
    });

    return results;
  }
 
  return {
    onRequest: onRequest
  };
});