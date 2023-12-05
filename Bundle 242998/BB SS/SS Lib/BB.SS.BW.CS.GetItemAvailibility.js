/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @overview - BayWa get item availability call to Pop Up Suitelet to display json in HTML format
 */
define(['N/currentRecord', 'N/url', 'N/search', 'N/record'],

    function(currentRecord, url, search, record) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            return true;
        }

        function getItemAvailability(context) {
            var currRecord = currentRecord.get();
            var recordType = currRecord.type;
            var items = [];
            if (currRecord.id) {

                var filters = [
                    ["internalid","anyof", currRecord.id],
                    "AND",
                    ["mainline","is","F"],
                    "AND",
                    ["item.type","anyof","InvtPart"]
                ];
                var transactionSearchObj = search.create({
                    type: "transaction",
                    filters: filters,
                    columns:
                        [
                            search.createColumn({name: "entity", label: "Name"}),
                            search.createColumn({name: "type", label: "Type"}),
                            search.createColumn({name: "item", label: "Item"}),
                            search.createColumn({name: "quantity", label: "Quantity"}),
                            search.createColumn({
                                name: "vendorcode",
                                join: "CUSTCOL_BBS_CR_ITEM",
                                label: "Vendor Code"
                            }),
                            search.createColumn({name: "line", label: "Line ID"}),
                            search.createColumn({
                                name: "othervendor",
                                join: "item",
                                label: "Vendor"
                            })
                        ]
                });
                var searchResultCount = transactionSearchObj.runPaged().count;
                log.debug("transactionSearchObj result count",searchResultCount);
                transactionSearchObj.run().each(function(result){
                    items.push({
                        item:result.getText({name: 'item'}),
                        qty:result.getValue({name: 'quantity'}),
                        lineID:result.getValue({name: 'line'})
                    });
                    return true;
                });

                //look up Sales Order for main line shipdate and zip code not possible in search
                var searchObj = search.lookupFields({
                    type: (recordType == 'salesorder') ? search.Type.SALES_ORDER : search.Type.PURCHASE_ORDER,
                    id: currRecord.id,
                    columns: ['shipdate', 'shipzip']
                })
                var shipdate = searchObj.shipdate;
                var shipzip = searchObj.shipzip;

                console.log('ship date', shipdate);
                console.log('ship zip', shipzip);
                console.log('Items to be sent in request', JSON.stringify(items));

                var json = {
                    "shipdate": shipdate,
                    "shipzip": shipzip,
                    "items": items
                };
                var payload = JSON.stringify(json);
                if (items.length > 0) {
                    var baywaSuitelet = url.resolveScript({
                        scriptId: 'customscript_bb_sl_baywa_get_item_avail',
                        deploymentId: 'customdeploy_bb_sl_baywa_get_item_avail',
                        params: {
                            'baywaavailability': payload,
                        }
                    });
                    window.onbeforeunload = null;
                    window.open(baywaSuitelet);
                }
            }
        }

        return {
            pageInit: pageInit,
            getItemAvailability: getItemAvailability
        };

    });
