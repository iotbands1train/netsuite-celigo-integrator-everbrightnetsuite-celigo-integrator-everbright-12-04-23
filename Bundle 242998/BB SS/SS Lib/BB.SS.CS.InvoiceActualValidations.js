/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @Author Matt Lehman
 * @overview - client side script for custom bom suitelet entry list form - highlight rows that are missing price
 */

/**
 * Copyright 2017-2020 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define(['N/currentRecord', 'N/search'],

    function(currentRecord, search) {

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
            //var tdColor = '#E95656';
            var tdColor = '#F54728';
            var parentColor = '#588ff5'; // #808080 - grey
            var subParentColor = '#b2d3f2'
            var expenseParentColor = '#2f83eb';
            var enteredQtyColor = '#99ffbb'
            var currRecord = currentRecord.get();
            var lineCount = currRecord.getLineCount({
                sublistId: 'custpage_bom_sublist'
            });
            var configObj = search.lookupFields({
                type: 'customrecord_bb_solar_success_configurtn',
                id: 1,
                columns:['custrecord_bb_bom_suitelet_svd_srch']
            });
            var searchId = (configObj.custrecord_bb_bom_suitelet_svd_srch.length > 0) ? configObj.custrecord_bb_bom_suitelet_svd_srch[0].value : null;
            var hasParentColumn = checkItemsForParent(searchId);
            console.log('search has parent column', hasParentColumn);
            if (lineCount != -1) {
                var counter = 0;
                var otherCounter = 0;
                for (var h = 0; h < lineCount; h++) {
                    counter = counter + 1;
                    var basePrice = currRecord.getSublistValue({
                        sublistId: 'custpage_bom_sublist',
                        fieldId: 'custpage_base_price',
                        line: h
                    });
                    var type = currRecord.getSublistValue({
                        sublistId: 'custpage_bom_sublist',
                        fieldId: 'custpage_item_type',
                        line: h
                    });
                    var itemSubCategory = currRecord.getSublistValue({
                        sublistId: 'custpage_bom_sublist',
                        fieldId: 'custpage_invoice_sub_parent',
                        line: h
                    });
                    var bomEnteredQty = currRecord.getSublistValue({
                        sublistId: 'custpage_bom_sublist',
                        fieldId: 'custpage_quantity',
                        line: h
                    });
                    var parent = currRecord.getSublistValue({
                        sublistId: 'custpage_bom_sublist',
                        fieldId: 'custpage_bom_item_parent',
                        line: h
                    });
                    // var relatedPurchaseOrder = currRecord.getSublistValue({
                    //     sublistId: 'custpage_bom_sublist',
                    //     fieldId: 'custpage_related_purchase_order',
                    //     line: h
                    // });
                    // if (relatedPurchaseOrder) {
                    //     // counter = counter + 1;
                    //     var trDom = document.getElementById('custpage_bom_sublistrow'+h);
                    //     trDomChild = trDom.children;
                    //     for (var t=0; t < (trDomChild.length-1); t+=1) {
                    //         var tdDom = trDomChild[t];
                    //         var tdQtyCell = document.getElementById('custpage_quantity' + counter + '_formattedValue');
                    //         // console.log('tdEntryCell', tdQtyCell);
                    //         tdQtyCell.setAttribute(
                    //             'style',
                    //             'pointer-events: none'
                    //         );
                    //     }
                    // }

                    // used for parent row highlighting
                    if (type == '' && itemSubCategory == '' || parent == '') {
                        // counter = counter + 1;
                        console.log('executing parent highlighting');
                        var trDom = document.getElementById('custpage_bom_sublistrow'+h);
                        trDomChild = trDom.children;
                        for (var t=0; t < (trDomChild.length-1); t+=1) {
                            var tdDom = trDomChild[t];

                            tdDom.setAttribute(
                                'style',
                                'background-color: '+parentColor+'!important;border-color: white '+parentColor+' '+parentColor+' '+parentColor+'!important;'
                            );
                            var tdQtyCell = document.getElementById('custpage_quantity' + counter + '_formattedValue');
                            // console.log('tdEntryCell', tdQtyCell);
                            tdQtyCell.setAttribute(
                                'style',
                                'display:none',
                                'visibility: hidden'
                            );
                            try {
                                var tdDescriptionCell = document.getElementById('custpage_bom_sublist_custpage_description' + counter + '_fs');
                                // console.log('tdDescriptionCell', tdDescriptionCell);
                                tdDescriptionCell.setAttribute(
                                    'style',
                                    'display:none',
                                    'visibility: hidden'
                                );
                            } catch (e) {
                                console.log('custpage_bom_sublist_custpage_description is missing');
                            }
                            try {
                                var tdPriceCell = document.getElementById('custpage_base_price' + counter + '_formattedValue');
                                // console.log('tdPriceCell', tdPriceCell);
                                tdPriceCell.setAttribute(
                                    'style',
                                    'display:none',
                                    'visibility: hidden'
                                );
                            } catch (e) {
                                console.log('error');
                            }
                        }
                    }
                    // used for sub parent row highlighting in invoice actual suitelet
                    if (type == '' && itemSubCategory) {
                        console.log('executing sub parent highlighting');
                        // counter = counter + 1;
                        var trDom = document.getElementById('custpage_bom_sublistrow'+h);
                        trDomChild = trDom.children;
                        for (var t=0; t < (trDomChild.length-1); t+=1) {
                            var tdDom = trDomChild[t];
                            tdDom.setAttribute(
                                'style',
                                'background-color: '+subParentColor+'!important;border-color: white '+subParentColor+' '+subParentColor+' '+subParentColor+'!important;'
                            );
                            try {
                                var tdQtyCell = document.getElementById('custpage_quantity' + counter + '_formattedValue');
                                // console.log('tdEntryCell', tdQtyCell);
                                tdQtyCell.setAttribute(
                                    'style',
                                    'display:none',
                                    'visibility: hidden'
                                );
                            } catch (e) {
                                console.log('custpage_quantity field is not found');
                            }

                            try {
                                var tdDescriptionCell = document.getElementById('custpage_bom_sublist_custpage_description' + counter + '_fs');
                                // console.log('tdDescriptionCell', tdDescriptionCell);
                                tdDescriptionCell.setAttribute(
                                    'style',
                                    'display:none',
                                    'visibility: hidden'
                                );
                            } catch (e) {
                                console.log('custpage_bom_sublist_custpage_description field is not found');
                            }
                            try {
                                var tdPriceCell = document.getElementById('custpage_base_price' + counter + '_formattedValue');
                                // console.log('tdPriceCell', tdPriceCell);
                                tdPriceCell.setAttribute(
                                    'style',
                                    'display:none',
                                    'visibility: hidden'
                                );
                            } catch (e) {
                                console.log('custpage_base_price field is not found');
                            }
                        }
                    }
                    // highlight rows when the base price is missing and no parent columns are setup
                    if (basePrice === '' && type) {
                        console.log('base pricing missing and type has value hiding quantity');
                        var trDom = document.getElementById('custpage_bom_sublistrow'+h);
                        trDomChild = trDom.children;
                        var setColor = tdColor;
                        for (var t=0; t < (trDomChild.length-1); t+=1) {
                            var tdDom = trDomChild[t];
                            tdDom.setAttribute(
                                'style',
                                'background-color: '+tdColor+'!important;border-color: white '+tdColor+' '+tdColor+' '+tdColor+'!important;'
                            );
                            try {
                                var tdEntryQtyCell = document.getElementById('custpage_quantity' + counter + '_formattedValue');
                                // console.log('tdEntryCell', tdEntryQtyCell);
                                tdEntryQtyCell.setAttribute(
                                    'style',
                                    'display:none',
                                    'visibility: hidden'
                                );
                            } catch (e) {
                                console.log('custpage_quantity field not found')
                            }
                        }
                    }
                    if (bomEnteredQty) {
                        console.log('has quantity populated');
                        var bomQtyTrDom = document.getElementById('custpage_bom_sublistrow'+h);
                        trDomChild = bomQtyTrDom.children;
                        var setColor = tdColor;
                        for (var t=0; t < (trDomChild.length-1); t+=1) {
                            var tdDom = trDomChild[t];
                            tdDom.setAttribute(
                                'style',
                                'background-color: '+enteredQtyColor+'!important;border-color: white '+enteredQtyColor+' '+enteredQtyColor+' '+enteredQtyColor+'!important;'
                            );
                        }
                    }
                }
                console.log('counter', counter);
                if (counter > 0) {
                    var message = '<b>**If an item is highlighted in red below, it will not save to the BOM as the item\'s pricing is missing**</b></br>' +
                        '<b>**Items highlighted green have processed a BOM record, change the quantity to update or blank out the quantity to delete the BOM record**</b></br>' +
                        '<b>**Quantities on each BOM record can not be adjusted below the invoiced quantity amount - USE WITH CAUTION**</b>\n';
                    currRecord.setValue({
                        fieldId: 'custpage_highlight_message',
                        value: message
                    });
                }
            }

            var expenseLineCount = currRecord.getLineCount({
                sublistId: 'custpage_expense_sublist'
            });
            console.log('expenselinecount', expenseLineCount);
            if (expenseLineCount > 0) {
                var num = 1;
                var expenseTotalAmount = parseFloat(0);
                for (var e = 0; e < expenseLineCount; e++) {
                    var counter = e + num;
                    var sequenceNum = currRecord.getSublistText({
                        sublistId: 'custpage_expense_sublist',
                        fieldId: 'custpage_expense_seq_num',
                        line: e
                    });

                    var expenseAmount = parseFloat(currRecord.getSublistValue({
                        sublistId: 'custpage_expense_sublist',
                        fieldId: 'custpage_expense_amount',
                        line: e
                    }));
                    if (expenseAmount) {
                        expenseTotalAmount = expenseTotalAmount + expenseAmount;
                    }
                    console.log('sequenceNum', sequenceNum);
                    if (sequenceNum == 0) {
                        var trDom = document.getElementById('custpage_expense_sublistrow'+e);

                        trDomChild = trDom.children;
                        for (var x=0; x < (trDomChild.length-1); x+=1) {
                            var tdDom = trDomChild[x];
                            tdDom.setAttribute(
                                'style',
                                'background: '+expenseParentColor+'!important; font-weight: bold; color: white !important; border-color:'+expenseParentColor+' '+expenseParentColor+' '+expenseParentColor+' '+expenseParentColor+'!important;'
                            );

                            // var tdEntryCell = document.getElementById('custpage_expense_sublist_custpage_expense_amount' + counter + '_fs');
                            var tdEntryCell = document.getElementById('custpage_expense_amount' + counter + '_formattedValue');
                            console.log('tdEntryCell', tdEntryCell);
                            tdEntryCell.setAttribute(
                                'style',
                                'display:none',
                                'visibility: hidden'
                            );
                            var tdEntryTextArea = document.getElementById('custpage_expense_sublist_custpage_expense_description' + counter + '_fs');
                            console.log('tdEntryTextArea', tdEntryTextArea);
                            tdEntryTextArea.setAttribute(
                                'style',
                                'display:none',
                                'visibility: hidden'
                            );
                            var tdEntrySeq = document.getElementById('custpage_expense_amount_seq_tpl' + counter + '_formattedValue');
                            console.log('tdEntrySeq', tdEntrySeq);
                            tdEntrySeq.setAttribute(
                                'style',
                                'display:none',
                                'visibility: hidden'
                            );
                        }
                    }
                }// end of expense line loop
                console.log('expense total', parseFloat(expenseTotalAmount).toFixed(2));
                currRecord.setValue({
                    fieldId: 'custpage_expense_total',
                    value: parseFloat(expenseTotalAmount).toFixed(2)
                });
            }
        }

        function fieldChanged(context) {
            var currRecord = currentRecord.get();
            var field = context.fieldId;
            console.log('field Id', field);

            var categorySelection = currRecord.getText({
                fieldId: 'custpage_category_auto_complete'
            });
            var selectionValue = currRecord.getValue({
                fieldId: 'custpage_manf_auto_complete'
            });
            var manuHideString = ".uir-list-row-cell:eq(2):not(:contains("+selectionValue+"))";
            var categoryHideString = ".uir-list-row-cell:eq(0):not(:contains("+categorySelection+"))";

            if (field == 'custpage_manf_auto_complete') {

                jQuery('.uir-list-row-tr').find(".uir-list-row-cell").parent().show(); // this shows all items in the list
                if (selectionValue && categorySelection) {
                    jQuery('.uir-list-row-tr').find(categoryHideString).parent().hide();
                    jQuery('.uir-list-row-tr').find(manuHideString).parent().hide();

                } else if (selectionValue && !categorySelection) {
                    jQuery('.uir-list-row-tr').find(manuHideString).parent().hide();
                }

                return true;
            }
            if (field == 'custpage_category_auto_complete') {
                var categorySelection = currRecord.getText({
                    fieldId: 'custpage_category_auto_complete'
                });
                jQuery('.uir-list-row-tr').find(".uir-list-row-cell").parent().show();// this shows all items in the list
                if (categorySelection && selectionValue) {
                    jQuery('.uir-list-row-tr').find(categoryHideString).parent().hide();
                    jQuery('.uir-list-row-tr').find(manuHideString).parent().hide();

                } else if (categorySelection && !selectionValue) {
                    jQuery('.uir-list-row-tr').find(categoryHideString).parent().hide();
                }
                return true;
            }
        }

        function validateField(context) {
            var currRecord = context.currentRecord; //.get();
            var field = context.fieldId;
            console.log('field Id', field);
            if (field == 'custpage_quantity') {

                var enteredQty = currRecord.getCurrentSublistValue({
                    sublistId: 'custpage_bom_sublist',
                    fieldId: 'custpage_quantity'
                });
                console.log('enteredQty', enteredQty);

                var index = currRecord.getCurrentSublistIndex({
                    sublistId: 'custpage_bom_sublist'
                });
                var invoicedQty = currRecord.getSublistValue({
                    sublistId: 'custpage_bom_sublist',
                    fieldId: 'custpage_invoiced_quantity',
                    line: index
                });
                var fulfilledQty = currRecord.getSublistValue({
                    sublistId: 'custpage_bom_sublist',
                    fieldId: 'custpage_fulfill_qty',
                    line: index
                });
                var relatedPurchaseOrder = currRecord.getSublistValue({
                    sublistId: 'custpage_bom_sublist',
                    fieldId: 'custpage_related_purchase_order',
                    line: index
                });
                console.log('invoicedQty', invoicedQty);
                console.log('index', index);
                if (enteredQty < invoicedQty) {
                    alert('The quantity entered cannot be less then the invoiced quantity');
                    return false;
                } else if (enteredQty < fulfilledQty) {
                    alert('The quantity adjusted cannot be less then the fulfilled quantity');
                    return false;
                }
                // if (relatedPurchaseOrder && enteredQty < ) {
                //     alert('The line you are trying to adjust has a purchase order associated, the quantity cannot be adjusted');
                //     return false;
                // }

            }
            return true;
        }

        function checkItemsForParent(searchId) {
            var hasParentColumn = false;
            if (searchId) {
                var checkforParent = search.load({
                    id: searchId
                });
                var results = checkforParent.run();
                results.columns.forEach(function(col) {
                    log.debug('column', col);
                    if (col.name == 'parent') {
                        hasParentColumn = true;
                    }
                });
            }
            return hasParentColumn;
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            validateField: validateField
        };

    });