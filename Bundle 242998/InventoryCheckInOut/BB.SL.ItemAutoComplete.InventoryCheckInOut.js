/**
 * autoComplete.js support module for retrieving results
 *
 * @NApiVersion 2.x
 * @NModuleScope public
 * @NScriptType Suitelet
 *
 * @author Michael Golichenko
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
    var itemSearchObj = search.create({
      type: "item",
      filters: [
        ["itemid",search.Operator.STARTSWITH,searchTerm],
        "OR",
        ["upccode",search.Operator.IS,searchTerm]
      ],
      columns:[
        search.createColumn({name: "itemid", label: "Name"}),
        search.createColumn({name: "upccode", label: "UPC Code"}),
        search.createColumn({name: "isserialitem", label: "Is Serial Item"})
      ]
    });
    var searchResultCount = itemSearchObj.runPaged().count;
    log.debug("itemSearchObj result count",searchResultCount);

    // salesorderSearchObj.run().each(function(result){
    //     // .run().each has a limit of 4,000 results
    //     return true;
    // });
    var output = [];
    var results = itemSearchObj.run().getRange({
      start: 0,
      end: 100
    });
    for(var i in results) {
      var result = results[i];
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

      row.displayname = result.getValue({name: 'itemid'});

      output.push(row);
    }

    log.debug('output', output);

    // force the response to be JSON
    response.setHeader({
      name: 'Content-Type',
      value: 'application/json; charset=utf-8',
    });
    response.write( JSON.stringify(output) );
  }

  return {onRequest:onRequest};
});