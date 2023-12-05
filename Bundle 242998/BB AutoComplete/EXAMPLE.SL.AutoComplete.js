/**
 * autoComplete.js support module for retrieving results
 * 
 * @NApiVersion 2.x
 * @NModuleScope public
 * @NScriptType Suitelet
 * 
 * @copyright 2019 Blue Banyan Solutions, Inc.
 */

/**
 * Copyright 2019 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */
define(['N/search'], function(search) {
    function onRequest(context) {
        var response = context.response;
        var request = context.request;
        var searchTerm = String(request.parameters.query);
      log.debug('searchTerm',searchTerm);
      if(!searchTerm || searchTerm.length<=1) {
          response.write('[]');
          return;
      }
        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters: [
              ["type","anyof","SalesOrd"], 
              "AND", 
              //["shipaddress","contains",searchTerm],
              //[["shipaddress","contains",searchTerm],"OR",["numbertext","contains",searchTerm]],
              [
                  ["shipaddress","contains",searchTerm],"OR",
                  ["customermain.entityid","contains",searchTerm],"OR",
                  ["numbertext","contains",searchTerm]
              ],

                "AND",
              ["mainline","is","T"]
            ],
            columns:[
                search.createColumn({name: "entity", label: "Name"}),
                search.createColumn({name: "tranid", label: "Document Number"}),
                search.createColumn({name: "custbody_sales_order_status"}),
                // search.createColumn({name: "trandate", label: "Date"}),
                // search.createColumn({name: "asofdate", label: "As-Of Date"}),
                // search.createColumn({name: "postingperiod", label: "Period"}),
                // search.createColumn({name: "taxperiod", label: "Tax Period"}),
                // search.createColumn({name: "type", label: "Type"}),
                // search.createColumn({name: "account", label: "Account"}),
                // search.createColumn({name: "memo", label: "Memo"}),
                // search.createColumn({name: "amount", label: "Amount"}),
                search.createColumn({name: "shipaddress", label: "Shipping Address"}),
                search.createColumn({name: "department", label: "Department"})
            ]
        });
        var searchResultCount = salesorderSearchObj.runPaged().count;
        log.debug("salesorderSearchObj result count",searchResultCount);

        var output = [];
        var results = salesorderSearchObj.run().getRange({
            start: 0, 
            end: 100
        });
        log.debug('results',results);
        for(var i in results) {
            var result = results[i];
            log.debug('result',result);
            var row = {};
            
            row.recordType = result.recordType;
            row.id = result.id;
            result.columns.forEach(function(col){
                var colText = result.getText(col);
                var colValue = result.getValue(col);

                if (colText && colValue) {
                    row[col.name + '_value'] = colValue;
                }
                row[col.name] = colText ? colText : colValue;
            });

            // var entity = result.getText({name: 'entity'});
            // var tranid = result.getValue({name: 'tranid'});
            // row.displayname = tranid + ' ' + entity;
            row.displayname = result.getText({name: 'entity'});

            output.push(row);
        }

        // force the response to be JSON
        response.setHeader({
            name: 'Content-Type',
            value: 'application/json; charset=utf-8',
        });
        response.write( JSON.stringify(output) );
    }

    return {onRequest:onRequest};
});
