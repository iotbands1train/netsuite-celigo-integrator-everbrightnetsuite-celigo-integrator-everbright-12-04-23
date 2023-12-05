/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */

define(['N/runtime','N/record','N/search'],
    function(runtime,record,search) {


        function afterSubmit(scriptContext) {
            /************** script parameters **************/
            const CLASSFIELD = runtime.getCurrentScript().getParameter({name:"custscript_bbss_class_field"});
            const CLASSLINEFIELD = runtime.getCurrentScript().getParameter({name:"custscript_bbss_class_field_line"});
            /************** end script parameters **************/
            if(scriptContext.type=='delete') return;

            var s = search.create({
                type: scriptContext.newRecord.type,
                filters:
                    [
                        ["internalid","anyof",scriptContext.newRecord.id]
                    ],
                columns:
                    [
                        search.createColumn({name: "mainline", label: "*"}),
                        search.createColumn({
                            name: "lineuniquekey",
                            sort: search.Sort.ASC,
                            label: "Line Unique Key"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: CLASSFIELD, //"{custbody_bb_project.custentity_ss_class}",
                            label: "Header/Body Class"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: CLASSLINEFIELD, //"{customer.custentity_ss_class}",
                            label: "Line Class"
                        })
                    ]
            });
            var searchResultCount = s.runPaged().count;
            log.debug('result count',searchResultCount);
            if(searchResultCount==0) return; // exit script

            let _rec = record.load({
                type: scriptContext.newRecord.type,
                id: scriptContext.newRecord.id,
                isDynamic: true
            });
            var lineKeys = {}
                ,hasChanged=false
            ;
            // List level fields and their unique keys
            let _sublists = _rec.getSublists();
            log.debug('sublists', _sublists);
            for (let s = 0; s < _sublists.length; s++) {
                let _listId = _sublists[s];
                var _lineFields = _rec.getSublistFields({sublistId: _listId});
                // only loop sublist when it has the class field
                if (_lineFields.indexOf('class') >= 0) {
                    log.debug('has class', _listId);
                    let _lineCt = _rec.getLineCount({sublistId: _listId});
                    for (let l = 0; l < _lineCt; l++) {
                        var _lineClass = _rec.getSublistValue({
                            sublistId: _listId,
                            fieldId: 'class',
                            line: l
                        });
                        var _lineKey = _rec.getSublistValue({
                            sublistId: _listId,
                            fieldId: 'lineuniquekey',
                            line: l
                        });
                        lineKeys[_lineKey] = {
                            class:_lineClass,
                            sublistId:_listId,
                            index:l
                        }
                    }
                }
            }
            log.debug('line keys',lineKeys);

            s.run().each(function(result){
                var values=result.toJSON();
                values = values.values;
                log.debug('result',values);
                try {
                    if (values.mainline == "*" && values.formulatext && !_rec.getValue({fieldId:'class'})) {
                        _rec.setValue({fieldId:"class",value:values.formulatext});
                        hasChanged=true;
                        log.debug('set body class',values.formulatext);
                    } else if(values.formulatext_1 || values.formulatext) {
                        var _classId = values.formulatext_1 ? values.formulatext_1 : values.formulatext;
                        if(lineKeys[values.lineuniquekey] && !lineKeys[values.lineuniquekey].class){
                            try {
                                _rec.selectLine({
                                    sublistId: lineKeys[values.lineuniquekey].sublistId,
                                    line: lineKeys[values.lineuniquekey].index
                                });
                                _rec.setCurrentSublistValue({
                                    sublistId: lineKeys[values.lineuniquekey].sublistId,
                                    fieldId: "class",
                                    value: _classId,
                                    ignoreFieldChange: true
                                });
                                _rec.commitLine({sublistId: lineKeys[values.lineuniquekey].sublistId});
                                hasChanged = true;
                                log.debug('set line class', {
                                    sublistId: lineKeys[values.lineuniquekey].sublistId,
                                    fieldId: "class",
                                    line: lineKeys[values.lineuniquekey].index,
                                    value: _classId
                                });
                            } catch (lineError) {
                                log.error('line set error',[lineKeys[values.lineuniquekey],lineError]);
                            }
                        }
                    }
                } catch (e) {
                    log.error('error in result',e);
                }
                return true;
            });

            if(hasChanged){
                _rec.save();
                log.debug('saved changes');
            }
            log.debug('complete');
        }

        return {
            afterSubmit: 	afterSubmit
        };
    });