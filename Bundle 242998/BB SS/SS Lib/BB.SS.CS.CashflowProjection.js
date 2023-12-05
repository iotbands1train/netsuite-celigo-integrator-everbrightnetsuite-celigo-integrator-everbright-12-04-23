/**
 * @NApiVersion 2.0
 * @NScriptType clientscript
 * @NModuleScope public
 * @author Ashley Wallace
 */
define(['N/record', 'N/search', 'N/currentRecord', './BB.SS.MD.CashflowProjectionCS.js', 'N/url'], 
function (record, search, currentRecord, cashFlowLib, url) {



    /**
     * script entry point for field change script
     * @param {object} context - NS script context
     */
    function fieldChanged(context)
    {
        var currentFieldId = context.fieldId;
        switch (currentFieldId) {
            case 'custpage_cashflowwhatif' : openSavedAnalysis(context); break;
            case 'custpage_projectstat': setFromProjStatRecord(context); break;
        };
    }



    /**
     * re-sets the name text if the project type, financing type, or
     *  installation state are changed. 
     * @param {object} context - NS script context
     */
    function getNameText(statRec)
    {
        var statDate = statRec.getValue({fieldId: 'custrecord_bb_proj_stat_date'});
        var projType = statRec.getText({fieldId: 'custrecord_bb_jobtype'}); 
        var finType = statRec.getText({fieldId: 'custrecord_bb_financing_type'});
        var installState = statRec.getText({fieldId: 'custrecord_bb_installation_state'});
        
        return [
            statDate.getFullYear(),
            '-', (statDate.getMonth()+1), 
            '-', statDate.getDate(),
            ' ', projType, 
            ', ' + finType,
            ', ' + installState
        ].join('');
    }



    /**
     * Gets the selected project statistic record and sets
     * all fields to the values on the project statistic record.
     * @param {context} context - NS script context
     */
    function setFromProjStatRecord(context)
    {
        try{
            var currRec = context.currentRecord;
            var projStatID = currRec.getValue({fieldId: 'custpage_projectstat'}); 
            log.debug({title:'Project Statistic Record ID', details: 'ID: ' + projStatID});

            if(!projStatID)
            {
                alert('Please select a project statistic record.\nClick OK to continue.');

                return false; 
            }else{
                var projStat = cashFlowLib.getProjStatRecord(projStatID);
            
                currRec.setValue({
                    fieldId: 'custpage_projecttype', 
                    value: projStat.getValue('custrecord_bb_jobtype')
                }).setValue({
                    fieldId: 'custpage_name', 
                    value: getNameText(projStat)
                }).setValue({
                    fieldId: 'custpage_installstate', 
                    value: projStat.getValue('custrecord_bb_installation_state')
                }).setValue({
                    fieldId: 'custpage_financing_type', 
                    value: projStat.getValue('custrecord_bb_financing_type')
                }).setValue({
                    fieldId: 'custpage_curr_avedaysnewtom0_int', 
                    value: projStat.getValue('custrecord_bb_proj_ave_days_new_to_m0_ct')
                }).setValue({
                    fieldId: 'custpage_curr_avedaysm0tom1_int', 
                    value: projStat.getValue('custrecord_bb_proj_ave_days_m0_to_m1_ct')
                }).setValue({
                    fieldId: 'custpage_curr_avedaysm1tom2_int', 
                    value: projStat.getValue('custrecord_bb_proj_ave_days_m1_to_m2_ct')
                }).setValue({
                    fieldId: 'custpage_curr_avedaysm2tom3_int', 
                    value: projStat.getValue('custrecord_bb_proj_ave_days_m2_to_m3_ct')
                });

                getNameText(context);
            };

        } catch (error) {
            log.debug({
                    title: 'Error - load statistic',
                    details: error
                });
          };    
    }



    /**
     * Gets the id of the project statistic record and creates URL with ID
     * and re-directs the user to the new URL in order to view an existing 
     * record.
     * @param {object} context - NS script context
     */
    function openSavedAnalysis(context)
    {
        var currRec = context.currentRecord;
        var recId = currRec.getValue({fieldId: 'custpage_cashflowwhatif'});
        log.debug({title: 'open saved analysis', details: 'recId=' + recId});

        if(!recId){
           return false;
        }
            
        var suiteletURL = url.resolveScript({
            scriptId:'customscript_bb_ss_sl_cashflowprojection', 
            deploymentId: 'customdeploy_bb_ss_sl_cashflowprojection'
        });
        suiteletURL+= '&recId=' + recId;
        window.location = suiteletURL;

    }



    
    /**
     * entry point for immediately before a record is saved on post. 
     * runs data verification and prevents save if necessary. 
     * @param {object} context - NS script context
     */
    function saveRecord(context){
        var currRec = context.currentRecord;

        if(!duplicateName(currRec)) //check if name exists before create
            return false;

        if(!dataMistmatch(currRec)) //selected stat & state/projType/finType mismatch
            return false;

        return true;                
    }



    /**
     * If the what-if cash flow record is new, checks if the name exists,
     * and prompts the user for decision to overwrite or go back and fix. 
     * @param {object} currRec - NS script context
     */
    function duplicateName(currRec) {
        var name = currRec.getValue({fieldId: 'custpage_name'});
        var recId = currRec.getValue({fieldId: 'custpage_cashflowwhatif'});
        var nameRec = cashFlowLib.nameExists(name);
        var response = true;
        log.debug({ title: 'Duplicate Name Confirm', details: 'recId=' + recId + ' nameRec=' + nameRec  + ' name=' + name });

        if(!recId && nameRec)
            response = confirm("A record already exists with this name.\nWould you like to overwrite?");

        return response;
    }



    /**
     * Alerts the user if the data is inconsistent between the project 
     * statistic record selected and the state/financing type/project type
     * selected and prevents the record from being saved by returning false.
     * 
     * @param {record} currRec - the current NS record.
     */
    function dataMistmatch(currRec){
        message = getMistmatchText(currRec);

        if(!message)
            return true;
        
        alert(message); 
        return false;
    }



    /**
     * Gets the message text for a data mistmatch between the project 
     * statistic record selected and the state/financing type/project type
     * selected.
     * @param {record} currRec - the current NS record.
     */
    function getMistmatchText(currRec)
    {
        var statRec = cashFlowLib.getProjStatRecord(currRec.getValue({fieldId:'custpage_projectstat'}));
        var groupData = getMessageObj(statRec,currRec);
        var message = '';
        var errorMsg = ['The baseline statistic record selected does ', 
                        'not match your selections.\nPlease review ',
                        'the following:\n'].join('');

        for(field in groupData.ui)
        {
            if(groupData.ui[field] != groupData.stat[field])
                message += message ? ', ' + groupData.text[field] : groupData.text[field];
        }

        message = message ? errorMsg + message : message;
        return message;
    }



    /**
     * Creates object with required fields from the current record(UI)
     * and the project statistic record(stat), and the name for these 
     * fields to use in the message to the user.
     * @param {record} statRec - NS project statistic record
     * @param {record} currRec - current NS record
     */
    function getMessageObj(statRec, currRec)
    {
        return {
            ui: {
                projType: currRec.getValue({fieldId: 'custpage_projecttype'}),
                finType: currRec.getValue({fieldId: 'custpage_financing_type'}),
                installState: currRec.getValue({fieldId: 'custpage_installstate'})
            },
            stat: {
                projType: statRec.getValue('custrecord_bb_jobtype'),
                finType: statRec.getValue('custrecord_bb_financing_type'),
                installState: statRec.getValue('custrecord_bb_installation_state')
            },
            text: {
                projType:'Project Type',
                finType: 'Financing Type',
                installState: 'Installation State'
            }
        };
    }



    function setProjStatRecord(context)
    {
        var currRec = currentRecord.get();
        var projType = currRec.getValue({fieldId: 'custpage_projecttype'});
        var finType = currRec.getValue({fieldId: 'custpage_financing_type'});
        var installState = currRec.getValue({fieldId: 'custpage_installstate'});
        var errorMsg = getBaselineErrMsg(projType, finType, installState);

        if(errorMsg){
            alert(errorMsg);
        };

        var statId = cashFlowLib.getStatID(projType, finType, installState);
        log.debug({ title: 'Load Statistic ID', details: 'statId=' + statId });

        if(!statId) {
            alert('There are no statistic records that match this selection.\nClick OK to continue.');
            return false;
        }

        currRec.setValue({
            fieldId: 'custpage_projectstat', 
            value: statId
        });

    }


    function getBaselineErrMsg(projType, finType, installState)
    {
        if(!projType || !finType || !installState){
            var errorMsg = [
                'Please select the following:\n',
                projType ? '' : '   Project Type\n',
                finType ? '' : '   Financing Type\n',
                installState ? '' : '   Installation State\n\n',
                'Click OK to Continue.'
            ].join(''); 

            return errorMsg;
        };

        return false;
    };


    return {
        setFromProjStatRecord: setFromProjStatRecord,
        fieldChanged: fieldChanged,
        openSavedAnalysis: openSavedAnalysis,
        saveRecord:saveRecord,
        setProjStatRecord:setProjStatRecord
	};
})