/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */

define(['N/query','./Lib/BB_S3_Schedule_Script','N/task','N/cache'],
    function(query,schedule,task,cache) {

    /**
     * Definition of the Scheduled script trigger point.
     * 
     * @governance XXX
     * 
     * @param scriptContext
     *        {Object}
     * @param scriptContext.type
     *        {InvocationType} The context in which the script is executed. It
     *        is one of the values from the scriptContext.InvocationType enum.
     * 
     * @return {void}
     * 
     * @since 2015.2
     * 
     * @static
     * @function execute
     */
    function execute(scriptContext) {
        // search all the deployments for the BB_S3_UE_AddField script
        // get the IDs of these so we can load them to get the parameter values
        var _sql = "SELECT sd.primarykey from scriptdeployment sd " +
            "left join userEventScript ue on sd.script=ue.id " +
            "where ue.scriptid='customscript_bludocs_file_field' and isdeployed='T' " +
            "and status='RELEASED'";
        var _depIds = query.runSuiteQL({query: _sql, params: []})
            .asMappedResults()
            .map(function(r){return r.primarykey});

        log.debug(_depIds.length+' _depIds',_depIds);

        for(var d=0; d<_depIds.length; d++) {
            // look for this in cache to see if it's currently running
            var deploymentCache = cache.getCache({
                name: 'scriptCache'+_depIds[d],
                scope: cache.Scope.PUBLIC
            }).get({key: 'data'});
            if(!deploymentCache){
                schedule.addToQueue('customscript_bludocs_aws_path_updates', '_bludocs_aws_path_updates',
                    {
                        custscript_bludoc_deployid: _depIds[d],
                        custscript_bludoc_only_file_ct: false
                    }, task.TaskType.MAP_REDUCE);
            } else {
                log.debug('SCRIPT STILL RUNNING',{custscript_bludoc_deployid: _depIds[d]});
            }
        }
    	
    }

    return {
    	execute: execute
    }
});
