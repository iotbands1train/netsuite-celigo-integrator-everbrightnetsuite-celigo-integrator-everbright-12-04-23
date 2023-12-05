/* jshint undef:true, unused:true */
/**
 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */
define( // jshint ignore:line
    ['N/format', 'N/error', 'N/runtime', 'N/search', 'N/record', 'N/email', 'N/log'],
    
    function(format, error, runtime, search, record, email, log) {
    
     
        /**
         * Validates if the value passed is null or empty
         * Business Context: We need to know if a given variable is null or empty
         * 
         * @governance 0 Units
         * 
         * @param {Object} value : any value of any type that needs to be validated
         * 
         * @return {Boolean} true if the value is null or empty 
         */
        function isNullOrEmpty(value) {
            if (value == null || value == undefined) {
                return true;
            }
    
            switch(Object.prototype.toString.call(value).slice(8, -1)) {
                case 'JavaArray':
                    // server side, searchResult.getResults() returns an object of type "JavaArray" instead of type "Array"
                case 'Array':
                    return (value.length == 0);
                case 'Object':
                    for ( var prop in value) {
                        if (value.hasOwnProperty(prop)) {
                            return false;
                        }
                    }
    
                    return true && JSON.stringify(value) === JSON.stringify({});
                case 'String':
                    return (value === '');
            }
    
            return false;
        }
    
        /**
         * Logs an error in NetSuite, whether it's and nlobjError object or a plain JavaScript error.
         * An email is sent if the "options.emailAuthorId" is not empty
         * Business Context: When an error happens we want to log as much details as possible and create a log record in our NetSuite instance 
         * 
         * @governance 20 Units
         * 
         * @param {Object} options.err : the error.SuiteScriptError/error.UserEventError object or the plain JavaScript error
         * @param {String} options.title : the title that will be given to the error log
         * @param {String} options.emailAuthorId : The internal ID of the active employee record which will be used as the author of the emailed error log
         * @param {String[]} options.cc : any additional emails we want to cc on the email
         * @param {String} options.loggingEmail : the logging email with the customer acronym. If nothing is passed, the default email without the acronym will be used
         * @param {String} options.data : the current data that made the script fail. Used to better debug why the script failed
         * 
         * @return nothing
         */
        function logError(options) {
            var msg = '';
            var userObj = runtime.getCurrentUser();
    
            msg += 'Account: ' + runtime.accountId + '\n';
            msg += 'Environment: ' + runtime.envType + '\n';
            msg += 'Date & Time: ' + new Date() + '\n';
            msg += 'Script Usage (remaining): ' + runtime.getCurrentScript().getRemainingUsage() + '\n';
            msg += 'Script: ' + (options.err.fileName ? options.err.fileName.substr(options.err.fileName.lastIndexOf('/') + 1) : runtime.getCurrentScript().id) + '\n';
            msg += 'Record Id: ' + (options.err.recordId ? options.err.recordId : '') + '\n';
            msg += 'User: ' + (userObj.id ? userObj.id : '') + '\n';
            msg += 'Role: ' + (userObj.role ? userObj.role : '') + '\n';
            msg += 'Error: ' + options.err.name + '\n';
            msg += 'Error Ticket: ' + (options.err.id ? options.err.id : '') + '\n';
            msg += 'Error Message: ' + options.err.message + '\n\n';
    
            msg += 'Error Stacktrace: ' + (options.err.stack ? options.err.stack : (options.err.stacktrace ? options.err.stacktrace : '')) + '\n\n';
    
            msg += 'Data: ' + (options.data ? options.data : '') + '\n\n';
    
            msg += 'Raw Error Details: ' + JSON.stringify(options.err);
    
            logEverything({
                type : 'error',
                title : options.title,
                details : msg
            });
    
            if (!isNullOrEmpty(options.emailAuthorId)) {
                options.title = options.title + '(NS Acct #' + runtime.accountId + ' ' + runtime.envType + ')';
    
                options.loggingEmail = (isNullOrEmpty(options.loggingEmail)) ? LOGGING_EMAIL_RECIPIENT : options.loggingEmail;
    
                // 20 Units
                email.send({
                    author : options.emailAuthorId,
                    recipients : options.loggingEmail,
                    cc : options.cc,
                    subject : options.title.toString(),
                    body : msg.toString()
                });
            }
        }
    
        /**
         * Gets the names of all the properties of the object and stores them in an array
         * Business Context: Need to loop through all the properties of an object. Using this function would give an array of them instead of having to manually type each one
         *
         * @governance 0 Units
         * 
         * @param {Object} obj : the object to get the properties of
         * 
         * @return {String[]} array with the names of all the properties of the object
         */
        function getPropertyNames(obj) {
            var array = [];
            if (!isNullOrEmpty(obj)) {
                for ( var property in obj) {
                    if (obj.hasOwnProperty(property)) {
                        array.push(property);
                    }
                }
            }
            return array;
        }
    
      
        /**
         * Retrieve the date or datetime with the current users's time zone using a saved search with date/time formula
         * Business Context: We need to know the date using the current user time zone and not the server date
         *  
         * @governance 10 Units
         * 
         * @param {String} options.searchType : if the role doesn't have access to perform a customer's search, pass a different search type
         * @param {Boolean} options.isDateTime : true if you want the current datetime, else it will return only the date
         * 
         * @returns {String} today's date or datetime
         */
        function getCurrentDateOrDateTimeOnUserTimeZone(options) {
            if (isNullOrEmpty(options)) {
                options = {};
            }
            if (isNullOrEmpty(options.searchType)) {
                options.searchType = search.Type.CUSTOMER;
            }
    
            var dateformula = 'formuladate';
            if (options.isDateTime) {
                dateformula = 'formuladatetime';
            }
    
            var dateSearch = search.create({
                type : options.searchType,
                columns : [{
                    name : dateformula,
                    formula : '{today}',
                    summary : search.Summary.MAX
                }]
            });
    
            // 10 Units
            var results = dateSearch.run().getRange({
                start : 0,
                end : 1
            });
    
            if (isNullOrEmpty(results)) {
                return null;
            }
    
            return results[0].getValue({
                name : dateformula,
                summary : search.Summary.MAX
            });
        }
    
        /**
         * DO NOT USE YET. NOT COMPLETE
         * 
         * This function returns the current date time based on the time zone set on the current user or company preferences
         * The script has to be executed with a role that has access to the Deployment records
         * The script deployment must have a script parameter of type "Date/Time", "Store Value" should be unchecked and the "Dynamic Default" should be set to "Current Date/Time"
         * Business Context: We need to know the date/time using the current user time zone
         * 
         * @governance 15 Units
         * 
         * @param {Boolean} options.fromCompanyPreferences : true if we should load the company preferences, else we load the user preferences
         * @param {Integer} options.deploymentInternalId : the internal id of the script deployment because nlobjContext.getDeploymentId() returns the ID ("customdeploy_") and not the internal id
         * @param {String} options.currentDateTimeFieldId : the id of the script parameter date/time field
         * 
         * @returns {String} Current date time
         */
        function getCurrentDateTimeOnCompanyTimeZone(options) { // jshint ignore:line
            require(['N/config'], function(config) { // jshint ignore:line
                var configType = config.Type.USER_PREFERENCES;
                if (options.fromCompanyPreferences) {
                    configType = config.Type.COMPANY_INFORMATION;
                }
    
                // 10 Units
                var conf = config.load({
                    type : configType
                });
    
                // field id is different between user and company preference
                var timeZone = conf.getValue({
                    fieldId : 'TIMEZONE'
                });
                if (isNullOrEmpty(timeZone)) {
                    timeZone = conf.getValue({
                        fieldId : 'timezone'
                    });
                }
    
                // 5 Units
                var deploymentRec = record.load({
                    type : record.Type.SCRIPT_DEPLOYMENT,
                    id : options.deploymentInternalId,
                    isDynamic : true
                });
    
                var dateTimeFldValue = deploymentRec.getValue({
                    fieldId : options.currentDateTimeFieldId
                });
    
                var dateCurrentTZ = format.format({
                    value : dateTimeFldValue,
                    type : format.Type.DATETIME,
                    timezone : timeZone
                });
    
                return dateCurrentTZ;
            });
        }
    
        /**
         * If the debug logs characters exceeds the 4000 characters limit, separate log into multiple logs in order to print all the details
         * 
         * @governance 0 Units
         * 
         * @param {String} options.type : the log level : debug, audit, error, emergency
         * @param {String} options.title : log subject
         * @param {String} options.details : log message
         * 
         * @returns nothing
         */
        function logEverything(options) {
            if (options.details != null && options.details !== '' && options.details.length > MAX_LOG_CHAR_SIZE) {
                var numOfLogs = Math.ceil(options.details.length / MAX_LOG_CHAR_SIZE);
                for (var i = 0; i < numOfLogs; i++) {
                    log[options.type]({
                        title : options.title + ' [' + (i + 1) + ' of ' + numOfLogs + ']',
                        details : options.details.substr(i * MAX_LOG_CHAR_SIZE, MAX_LOG_CHAR_SIZE)
                    });
                }
            }
            else {
                log[options.type](options);
            }
        }
    
        /**
         * Represents the constants set for the script. This should be initialized in scripts it is used in
         * 
         * @typedef {Object} Constants
         *  
         * @method initializeConstants : the function allowing the constants to be set
         * @method get : the function that fetches the script constant requested taking into account the instance environment (Prod, Sandbox...)
         */
        function Constants() {
            var ALL_ENVIRONMENT = 'all';
            var constants = {};
    
            /**
             * Initialize the values for a specific environment or for all environment if the environment variable is not provided.
             * 
             * e.g.: var scripConstants = new bbeLib.Constants();
             * 		scripConstants.initializeConstants( { PRINT_ERROR_MESSAGE:'Detailed error message common to all environments...' });
             * 		scripConstants.initializeConstants( { INVOICE_XML_TEMPLATE_ID:123123, INVOICE_FORM_ID:456 }, runtime.EnvType.PRODUCTION);
             * 		scripConstants.initializeConstants( { INVOICE_XML_TEMPLATE_ID:654654, INVOICE_FORM_ID:789 }, runtime.EnvType.SANDBOX); 
             * 
             * @governance 0
             * 
             * @param {Object} values : the key/value pair used for the constant
             * @param {String} environment : the environment to link the value to (must be part of the runtime.EnvType enum)
             */
            function initializeConstants(values, environment) {
                if (isNullOrEmpty(environment)) {
                    environment = ALL_ENVIRONMENT;
                }
                if (isNullOrEmpty(constants[environment])) {
                    constants[environment] = {};
                }
                constants[environment] = values;
            }
    
            /**
             * Gets the environment value, if it is empty, gets the non environmental bound value
             * e.g.: scripConstants.get('PRINT_ERROR_MESSAGE'); // will return the same value regardless of the environment
             * 		scripConstants.get('INVOICE_XML_TEMPLATE_ID'); // will return a different value based on the environment
             * 
             * @governance 0
             * 
             * @param {String} key : the key representing the value to fetch
             * @returns {Object} the value from the key/value pair in the constants for the current execution environment or if it is empty, the value for the constant available across environments  
             */
            function get(key) {
                if (!isNullOrEmpty(constants[runtime.envType]) && !isNullOrEmpty(constants[runtime.envType][key])) {
                    return constants[runtime.envType][key];
                }
                else if (!isNullOrEmpty(constants[ALL_ENVIRONMENT]) && !isNullOrEmpty(constants[ALL_ENVIRONMENT][key])) {
                    return constants[ALL_ENVIRONMENT][key];
                }
                return null;
            }
    
            return {
                initializeConstants : initializeConstants,
                get : get
            };
        }
    
        return {
            isNullOrEmpty : isNullOrEmpty,
            logError : logError,
            getPropertyNames : getPropertyNames,
            getCurrentDateOrDateTimeOnUserTimeZone : getCurrentDateOrDateTimeOnUserTimeZone,
            logEverything : logEverything,
            Constants : Constants
        };
    });