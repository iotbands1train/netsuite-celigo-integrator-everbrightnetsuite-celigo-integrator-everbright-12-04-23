'use strict';
/**
 * autoComplete.js support module for NS
 *
 * @NApiVersion 2.x
 * @NModuleScope public
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
define([ 'N/search', 'N/currentRecord', '../BB AutoComplete/autoComplete.js'], function(search, currentRecordModule, autoComplete) {
  var exports = {};

  exports.loadCSS = function(stylesheetUrl) {
    if (!window) {
      return; // cs only
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = stylesheetUrl;
    document.head.appendChild(link);
  }

  exports.configureAutocompleteLibrary = function(options) {
    var dataSource = [options.dataSource, 'query'].join('&'); // todo
    var fieldId = options.fieldId;
    var targetFieldId = options.targetFieldId || fieldId;
    var htmlFieldId = options.fieldHtmlId || fieldId;
    var htmlFieldSelector = '#' + htmlFieldId;
    var currentRecord = currentRecordModule.get();
    var customOnSelect = typeof options.onSelect === 'function' ? options.onSelect : undefined;
    console.log('htmlFieldId', htmlFieldId);
    console.log('options',options);
    // console.log('autoComplete',autoComplete);
    const autoCompleteJS = new autoComplete({
      data: {                              // Data src [Array, Function, Async] | (REQUIRED)
        src: function() {
          // API key token
          //const token = "this_is_the_API_token_number";
          // User search query
          //var query = document.querySelector("#memo").value;
          var query = currentRecord.getCurrentSublistValue({
            sublistId: 'custpage_inventory_check_in_out',
            fieldId: fieldId
          });
          console.log('autocomplete query',query);
          return jQuery.get({
            url:  [dataSource, query].join('='),
            dataType: 'json'
          }).then(function(data){
            return data;
          }, function(e) {
            console.log('error in autocomplete data retrieve',e);
            return [];
          });

          // Fetch External Data Source
          // const source = await fetch('/app/site/hosting/restlet.nl?script=738&deploy=1&query='+query);
          // Format data into JSON
          // const data = await source.json();
          // Return Fetched data
          //return [{"recordType":"salesorder","id":"1121","entity_value":"267","entity":"CUS-1003 Spruce","tranid":"SO-00000009","trandate":"7/9/2018","asofdate":"","postingperiod":"Jul 2018","taxperiod":"","type_value":"SalesOrd","type":"Sales Order","account_value":"117","account":"20 Sales Orders","memo":"","amount":"9800.17","shipaddress":"40035 Lillian Hill\nFort Lauderdale, FL 33320\n805-124-2392\ncfolliott1j@economist.com","displayname":"SO-00000009 CUS-1003 Spruce"},{"recordType":"salesorder","id":"1121","entity_value":"267","entity":"CUS-1003 Spruce","tranid":"SO-00000009","trandate":"7/9/2018","asofdate":"","postingperiod":"Jul 2018","taxperiod":"","type_value":"SalesOrd","type":"Sales Order","account_value":"172","account":"4010 Revenue : Sales","memo":"Installation","amount":"1979.80","shipaddress":"40035 Lillian Hill\nFort Lauderdale, FL 33320\n805-124-2392\ncfolliott1j@economist.com","displayname":"SO-00000009 CUS-1003 Spruce"},{"recordType":"salesorder","id":"1121","entity_value":"267","entity":"CUS-1003 Spruce","tranid":"SO-00000009","trandate":"7/9/2018","asofdate":"","postingperiod":"Jul 2018","taxperiod":"","type_value":"SalesOrd","type":"Sales Order","account_value":"172","account":"4010 Revenue : Sales","memo":"","amount":"211.01","shipaddress":"40035 Lillian Hill\nFort Lauderdale, FL 33320\n805-124-2392\ncfolliott1j@economist.com","displayname":"SO-00000009 CUS-1003 Spruce"}];
//                    return data;
//data = [{"recordType":"salesorder","id":"1121","entity_value":"267","entity":"CUS-1003 Spruce","tranid":"SO-00000009","trandate":"7/9/2018","asofdate":"","postingperiod":"Jul 2018","taxperiod":"","type_value":"SalesOrd","type":"Sales Order","account_value":"117","account":"20 Sales Orders","memo":"","amount":"9800.17","shipaddress":"40035 Lillian Hill\nFort Lauderdale, FL 33320\n805-124-2392\ncfolliott1j@economist.com","displayname":"SO-00000009 CUS-1003 Spruce"},{"recordType":"salesorder","id":"1121","entity_value":"267","entity":"CUS-1003 Spruce","tranid":"SO-00000009","trandate":"7/9/2018","asofdate":"","postingperiod":"Jul 2018","taxperiod":"","type_value":"SalesOrd","type":"Sales Order","account_value":"172","account":"4010 Revenue : Sales","memo":"Installation","amount":"1979.80","shipaddress":"40035 Lillian Hill\nFort Lauderdale, FL 33320\n805-124-2392\ncfolliott1j@economist.com","displayname":"SO-00000009 CUS-1003 Spruce"},{"recordType":"salesorder","id":"1121","entity_value":"267","entity":"CUS-1003 Spruce","tranid":"SO-00000009","trandate":"7/9/2018","asofdate":"","postingperiod":"Jul 2018","taxperiod":"","type_value":"SalesOrd","type":"Sales Order","account_value":"172","account":"4010 Revenue : Sales","memo":"","amount":"211.01","shipaddress":"40035 Lillian Hill\nFort Lauderdale, FL 33320\n805-124-2392\ncfolliott1j@economist.com","displayname":"SO-00000009 CUS-1003 Spruce"}];
          // return exports.searchSalesOrders(query);
        },
        key: ["itemid", "upccode"],
        cache: false
      },
      //query: {                               // Query Interceptor               | (Optional)
      //    manipulate: (query) => {
      //      return query.replace("pizza", "burger");
      //    }
      //},

      sort: function(a, b) {                    // Sort rendered results ascendingly | (Optional)
        if (a.match < b.match) return -1;
        if (a.match > b.match) return 1;
        return 0;
      },
      //placeHolder: "Food & Drinks...",     // Place Holder text                 | (Optional)
      selector: htmlFieldSelector,           // Input field selector              | (Optional)
      threshold: 3,                        // Min. Chars length to start Engine | (Optional)
      debounce: 300,                       // Post duration for engine to start | (Optional)
      searchEngine: "loose",              // Search Engine type/mode           | (Optional)
      resultsList: {                       // Rendered results list object      | (Optional)
        render: true,
        container: function(source) {
          source.setAttribute("id", "autoComplete_list");
        },
        destination: document.querySelector(htmlFieldSelector),
        position: "afterend",
        element: "ul"
      },
      maxResults: 10,                         // Max. number of rendered results | (Optional)
      highlight: true,                       // Highlight matching results      | (Optional)
      resultItem: {                          // Rendered result item            | (Optional)
        content: function(data, source) {
          /* data variable contents
          {
            "key": "entity",
            "index": 7,
            "match": "CUS-1003 <span class=autoComplete_highlighted>Spruc</span>e",
            "value": {
              "recordType": "salesorder",
              "id": "21688",
              "entity_value": "267",
              "entity": "CUS-1003 Spruce",
              "tranid": "SO-00000184",
              "trandate": "4/12/2019",
              "asofdate": "",
              "postingperiod": "Apr 2019",
              "taxperiod": "",
              "type_value": "SalesOrd",
              "type": "Sales Order",
              "account_value": "172",
              "account": "4010 Revenue : Sales",
              "memo": "Installation",
              "amount": "3975.00",
              "shipaddress": "Spruce\n9393 Vidon Road\nHelena MT 59623\nUnited States",
              "displayname": "SO-00000184 CUS-1003 Spruce"
            }
          }
          */
          var displayMap = {
            'UPC Code': 'upccode'
          }

          //source.innerHTML = data.match;
          var heading = document.createElement('h2');
          heading.innerText = data.value.displayname;

          var dl = document.createElement('dl');

          var keys = Object.keys(displayMap);
          for (var i in keys) {
            var label = keys[i];
            var dt = document.createElement('dt');
            dt.innerText = label;
            dl.appendChild(dt);
            var dd = document.createElement('dd');
            var value = data.key === label ? data.match : (data.value[displayMap[label]] || '')
            dd.innerText = (value);
            dl.appendChild(dd);
          }

          source.appendChild(heading);
          source.appendChild(dl);



          console.log('resultItem data', data);
        },
        element: "li"
      },
      noResults: function() {                     // Action script on noResults      | (Optional)
        const result = document.createElement("li");
        result.setAttribute("class", "no_result");
        result.setAttribute("tabindex", "1");
        result.innerHTML = "No Results";
        document.querySelector("#autoComplete_list").appendChild(result);
      },
      onSelection: function(feedback) {             // Action script onSelection event | (Optional)
        console.log(feedback);
        currentRecord.setCurrentSublistValue({
          sublistId: 'custpage_inventory_check_in_out',
          fieldId: targetFieldId,
          value: feedback.selection.value.id
        });
        if(customOnSelect){
          customOnSelect(feedback);
        }
        return false;
      }
    });
  }

  return exports;
});