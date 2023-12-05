/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @author Suhail Akhtar
 */

/**
 * Copyright 2017-2018 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */


define(['N/record', 'N/format', './moment.min','N/search'],
    function (record, format, moment,search) {

        /**
         * Function creates the Project Energy production Record
         * @param Object: energyProdData - Object with details for creation of Project Energy production Record
         */
        function createEnergyProduction(energyProdData) {
            log.debug('inside createEnergyProduction', energyProdData);
            var configLookup = search.lookupFields({
                type: 'customrecord_bb_solar_success_configurtn',
                id: 1,
                columns: ['custrecord_bb_get_detailed_data']
            })

            //create Project Energy production Record
            var prod_energy_record = record.create({
                type: 'customrecord_bb_proj_energy_production',
                isDynamic: true
            });

            //set values for Project Energy production Record
            prod_energy_record.setValue({
                fieldId: 'name',
                value: 'EProd(' + energyProdData.project + ') -' + energyProdData.startDate + '-TO-' + energyProdData.endDate
            });
          /*  prod_energy_record.setValue({
                fieldId: 'externalid',
                value: energyProdData.project + '/' + energyProdData.startDate + '-TO-' + energyProdData.endDate+'/'+energyProdData.siteid+'/'+energyProdData.deviceId
            });*/
            prod_energy_record.setValue({
                fieldId: 'custrecord_bb_proj_en_prdct_project',
                value: energyProdData.project
            });
            prod_energy_record.setValue({
                fieldId: 'custrecord_bb_project_energy_device_type',
                value: energyProdData.devicetype
            });
            prod_energy_record.setValue({
                fieldId: 'custrecord_bbss_device_id_for_energy',
                value: energyProdData.deviceId
            });
            prod_energy_record.setValue({
                fieldId: 'custrecord_bb_project_energy_site_id',
                value: energyProdData.siteid
            });
            // log.debug('energyProdData.startDate', energyProdData.startDate);
            //  var testDate=new Date('2021-2-25');
            // log.debug('testDate ',testDate);
            // log.debug('moment(energyProdData.startDate).format(\'M/D/YYYY\')',moment(energyProdData.startDate).format('M/D/YYYY'));
            var startDateArr = energyProdData.startDate.split('-');
            prod_energy_record.setValue({
                fieldId: 'custrecord_bb_proj_en_prdct_st_date',
                value: new Date(startDateArr[0], parseInt(startDateArr[1]) - 1, startDateArr[2])
            });
            var endDateArr = energyProdData.endDate.split('-');
            prod_energy_record.setValue({
                fieldId: 'custrecord_bb_proj_en_prdct_end_date',
                value: new Date(endDateArr[0], parseInt(endDateArr[1]) - 1, endDateArr[2])
            });
            prod_energy_record.setValue({
                fieldId: 'custrecord_bb_proj_en_prdct_data_source',
                value: energyProdData.energySource
            });
            //log.debug('energyProdData.startTime', energyProdData.startTime);
            //For TIME OF DAY fields, setText needs to be used to set right time.
            prod_energy_record.setText({
                fieldId: 'custrecord_bb_proj_en_prdct_start_time',
                text: energyProdData.startTime
            });
            prod_energy_record.setText({
                fieldId: 'custrecord_bb_proj_en_prdct_end_time',
                text: energyProdData.endTime
            });
            prod_energy_record.setValue({fieldId: 'custrecord_bb_proj_en_prdct_uom', value: energyProdData.unit});

            if (energyProdData.Totalrevenue) {
                prod_energy_record.setValue({
                    fieldId: 'custrecord_bb_energy_prod_revenue',
                    value: energyProdData.Totalrevenue
                });
            }

            var recId = prod_energy_record.save();

            log.debug('prod created,', recId);
            var totalEnergyDay=energyProdData.TotalEnergy;
            if (configLookup.custrecord_bb_get_detailed_data) {

                // Call to make Project energy production Detail records
                totalEnergyDay = createProjectEnergyProdDetailRecs(energyProdData.detailedList, recId, energyProdData.project);
            }
            //once all the details records are created, the total energy produced is set in the Project energy production record
            record.submitFields({
                type: 'customrecord_bb_proj_energy_production',
                id: recId,
                values: {
                    'custrecordustrecord_bb_proj_en_produced': totalEnergyDay.toFixed(2)
                }
            });

            log.debug('Project Energy Production Record Created', 'id: ' + recId);
        }

        /**
         *
         * @param Array: detailsList - array of values of energy produced per quater of the day
         * @param String: energyprodid: Project Energy production record id for linking the details record with it
         * @param String: project - Project internal id to be used in the name of the record
         * @returns {number}: totalEnergy - sum of all the enrgy produced for each quater of the day
         */
        function createProjectEnergyProdDetailRecs(detailsList, energyprodid, project) {
            var totalEnergy = 0;
            //loop thorugh all the values of each quater of the day energy produced
            for (var num = 0; num < detailsList.length; num++) {
                //create the Project Energy production record details record
                var prod_energy_details_record = record.create({
                    type: 'customrecord_bb_proj_en_prod_details',
                    isDynamic: true
                });
                var startDateTime = detailsList[num].date;
                log.debug('startDate',detailsList[num].date)
                log.debug('startDate type', typeof detailsList[num].date)
                var startDateTimeArr=startDateTime.split(' ');

                var startDateArr=startDateTimeArr[0].split('-');

                prod_energy_details_record.setValue({
                    fieldId: 'name',
                    value: 'EPD (' + project + ')-' + detailsList[num].date
                });

                prod_energy_details_record.setValue({
                    fieldId: 'custrecord_bb_pr_en_prd_det_prjenprod',
                    value: energyprodid
                });
                prod_energy_details_record.setValue({
                    fieldId: 'custrecord_bb_pr_en_prd_det_date',
                    value: new Date(startDateArr[0], parseInt(startDateArr[1]) - 1, startDateArr[2])
                });
                var energyProducedInQuat = 0;
                //if there is no value sent for a time set it to 0 else use the value sent
                if (detailsList[num].value) {
                    energyProducedInQuat = detailsList[num].value;
                } else {
                    energyProducedInQuat = 0;
                }
                prod_energy_details_record.setValue({
                    fieldId: 'custrecord_bb_prj_en_prd_dtl_en_prdcd',
                    value: energyProducedInQuat
                });
                //For TIME OF DAY fields, setText needs to be used to set right time.
                var timeArr = (startDateTimeArr[1]).split(':');
                prod_energy_details_record.setText({
                    fieldId: 'custrecord_bb_en_prod_dtl_time',
                    text: timeArr[0] + timeArr[1]
                });

                //sum all the energy produced for the day using individual quater of the day enery produced
                totalEnergy = totalEnergy + parseFloat(energyProducedInQuat);
                var detId = prod_energy_details_record.save();

            }
            return totalEnergy;
        }

        return {
            createEnergyProduction: createEnergyProduction,

        };

    });