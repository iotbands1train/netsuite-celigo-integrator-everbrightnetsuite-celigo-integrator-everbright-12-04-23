/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @fileOverview 
 */

define(['N/search','N/record','./moment.min','./BB.SS.MD.AlsoEnergy'], function(search,record,moment,alsoenergy) {
    function existingInvoice(endDate, projectId, customerId) {
        var endDateStr = moment(endDate).format('M/D/YYYY');
        var templateLookup = search.create({
            type: search.Type.INVOICE,
            columns: [
                { name: 'internalid' },
                { name: 'entity' },
                { name: 'custbody_bb_project' },
                { name: 'custbody_bb_inv_period_start_date' },
                { name: 'custbody_bb_inv_period_end_date' }
            ],
            filters: [{
                name: 'entity',
                operator: 'is',
                values: [customerId]
            }, {
                name: 'custbody_bb_project',
                operator: 'is',
                values: [projectId]
            }, {
                name: 'custbody_bb_inv_period_end_date',
                operator: search.Operator.ONORAFTER,
                values: [endDateStr]
            }, {
                name: 'mainline',
                operator: search.Operator.IS,
                values: 'T'
            }
         /*   , {
                name: 'internalid',
                operator: search.Operator.ANYOF,
                values: ['@NONE@'],
                join: 'custrecord_c2_invoice_transaction'
            }*/
        ]
        }).run().getRange({ start: 0, end: 10 });
        return templateLookup.length;
    };


    function getOfftaker(project) {
        var offtakers = [];
        var offTakerSearch = search.create({
            type: 'customrecord_bb_project_offtaker',
            columns: [
                { name: 'internalid' },
                { name: 'custrecord_bb_proj_offtkr_customer' },
                { name: 'custrecord_bb_proj_offtkr_mnth_dsc_prc' },
                { name: 'custrecord_bb_proj_offtkr_utl_acnt_num' }
            ],
            filters: [{
                name: 'custrecord_bb_proj_offtkr_project',
                operator: 'is',
                values: [project]
            }]
        })
        offTakerSearch.run().each(function (result) {
            offtakers.push({
                "customer": result.getValue({ name: 'custrecord_bb_proj_offtkr_customer' }),
                "monthlyPercentage": result.getValue({ name: 'custrecord_bb_proj_offtkr_mnth_dsc_prc' }),
                "accountNumber": result.getValue({ name: 'custrecord_bb_proj_offtkr_utl_acnt_num' })
            }
            );
            return true;
        })
        return offtakers;
    };

    function createMeterReading(projectData) {
        var endDate = new Date(projectData.periodEndDate);
        //set values
        for (line in projectData.lines) {
            var meterId = projectData.lines[line].nsMeterId;
            if (existingMeterReading(endDate, meterId)) { //check for existing records
                log.debug('Meter Reading Creation Error',
                    'A meter reading record for this end'
                    + 'date and meter already exists. End Date: '
                    + endDate + ', Meter ID: ' + meterId);
                break;
            };

            var meterReading = record.create({
                type: 'customrecord_c2_proj_enrgy_meter_reading',
                isDynamic: true
            });
            meterReading.setValue({ fieldId: 'custrecord_c2_meter_reading_meter', value: meterId });
            meterReading.setValue({ fieldId: 'custrecord_c2_meter_reading_project', value: projectData.project });
            meterReading.setValue({ fieldId: 'custrecord_c2_meter_reading_start_date', value: new Date(projectData.periodStartDate) });
            meterReading.setValue({ fieldId: 'custrecord_c2_meter_reading_end_date', value: endDate });
            meterReading.setValue({ fieldId: 'custrecord_c2_meter_reading_start_readin', value: projectData.lines[line].startingMeterReading });
            meterReading.setValue({ fieldId: 'custrecord_c2_meter_reading_end_reading', value: projectData.lines[line].endingMeterReading });
            var meterID = meterReading.save();
            log.debug('Meter Reading created: ' + meterID);
        }
    }

    function existingMeterReading(endDate, meterId) {
        var endDateStr = moment(endDate).format('M/D/YYYY');
        var templateLookup = search.create({
            type: 'customrecord_c2_proj_enrgy_meter_reading',
            columns: [
                { name: 'custrecord_c2_meter_reading_meter' },
                { name: 'custrecord_c2_meter_reading_end_date' }
            ],
            filters: [{
                name: 'custrecord_c2_meter_reading_meter',
                operator: 'is',
                values: [meterId]
            }, {
                name: 'custrecord_c2_meter_reading_end_date',
                operator: search.Operator.ONORAFTER,
                values: [endDateStr]
            }]
        }).run().getRange({ start: 0, end: 10 });
        return templateLookup.length;
    }
    function _getPlugin(invoiceType){
        switch(invoiceType){
            case 'per kwh': 
                return plugin.loadImplementation({
                            type: 'customscript_c2_auto_invoicing', 
                            implementation:'customscript_c2_auto_invoice_perkwh'
                });
            case 'flat fee': 
                return plugin.loadImplementation({
                        type: 'customscript_c2_auto_invoicing', 
                        implementation:'customscript_c2_auto_invoice_flatfee'
                });
        };
    };
    function _getProjects(rateType){
        var projects = search.load({
            type:search.Type.JOB,
            id:'customsearch_bb_c2_proj_energy_rate_type'
        });
        var list = alsoenergy.getListObject('customlist_c2_proj_en_rate_engy_rt_typ');
        projects.filters.push(search.createFilter({
           name: 'custentity_bb_c2_energy_rate_type',
           operator: search.Operator.ANYOF,
           values: list[rateType]
       }));
        var projectIDs = []
        var results = projects.run().each(function(result){
            var projectID = result.id;
            projectIDs.push(projectID);
            return true;
        });
        return projectIDs
    };
    function _getProjectData(projects){
        var projectData = {};
        var projSearch = search.load({
            type:search.Type.JOB,
            id:'customsearch_c2_project_data_for_invoice'
        });
        var cols = alsoenergy.getSearchColumnNames(projSearch);
        
        projSearch.run().each(function(result){
            var projId = result.getValue(result.columns[cols['internal id']]);
            
            if(!projectData[projId]){
                projectData[projId] = {
                    project: projId,
                    rateType: result.getValue(result.columns[cols['energy rate type']]), 
                    customer: null,
                    subsidiary: result.getValue(result.columns[cols['subsidiary']]), 
                    periodStartDate: result.getValue(result.columns[cols['end date']]), 
                    periodEndDate: moment().format('M/D/YYYY'), 
                    lines: {}
                };
            }
            
            var meterId = result.getValue(result.columns[cols['meter id']]);
            
            if(!projectData[projId])
                return true;

            projectData[projId].lines[meterId] = {
                itemId: '412',  
                nsMeterId: result.getValue(result.columns[cols['project meter']]), 
                aeMeterId: meterId,
                location: result.getValue(result.columns[cols['meter location']]),
                utilityMeterId: result.getValue(result.columns[cols['utility meter account number']]), 
                quantity: null,
                startingMeterReading: result.getValue(result.columns[cols['ending reading']]), 
                endingMeterReading: null,
                rate: null //stays null until map
            };
            return true;
        });

        return projectData;
    }
    function _combineData(meterReadings, projectFields){
        //create object that looks like: 
        for (meter in meterReadings){
            var meterId = meterReadings[meter].meterHID;
            var project = meterReadings[meter].project;
            var float = meterReadings[meter].float;
            var startReading = projectFields[project].lines[meterId].startingMeterReading;
            projectFields[project].lines[meterId].endingMeterReading = float;
            projectFields[project].lines[meterId].quantity = float - startReading;
        }
        return projectFields;
    }
    function _getMonthlyProduction(startDate, endDate, projects) {
        var session = alsoenergy.login();
        var monthlyProdrec = alsoenergy.getBinDataByProject(session, startDate, endDate,
            'BinMonth', 'KWHnet', 'Last', projects); 
        alsoenergy.logout(session);
        return monthlyProdrec;
        
    }
    return{
        existingInvoice:existingInvoice,
        getOfftaker:getOfftaker,
        createMeterReading:createMeterReading,
        existingMeterReading:existingMeterReading,
        _getPlugin:_getPlugin,
        _getProjects:_getProjects,
        _getProjectData:_getProjectData,
        _combineData:_combineData,
        _getMonthlyProduction:_getMonthlyProduction
    }
})