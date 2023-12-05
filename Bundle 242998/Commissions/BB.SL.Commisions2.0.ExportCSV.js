/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/dataset', 'N/file', 'N/query', 'N/render', 'N/ui/serverWidget'],
    /**
 * @param{dataset} dataset
 * @param{file} file
 * @param{query} query
 * @param{render} render
 */
    (dataset, file, query, render, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try{
                if(scriptContext.request.method === 'GET') {
                    let arrValuesToPrint = [];

                    let datasetId = scriptContext.request.parameters.datasetId;

                    let loadedQuery = query.load({
                        id: ('custdataset'+datasetId).toLowerCase()
                    });

                    let resultSet = loadedQuery.run();
                    let stringColumnsName = '';
                    for (let index in loadedQuery.columns) {
                        let fieldCode = loadedQuery.columns[index];
                        let fieldArr = fieldCode.label.split('.');
                        if(stringColumnsName !== ''){
                            stringColumnsName +=','
                        }
                        stringColumnsName +=fieldArr[2];
                    }
                    stringColumnsName+='\n';
                    //arrValuesToPrint.push(stringColumnsName);


                    for (let ind = 0; ind < resultSet.results.length; ind++) {
                        let stringResult = '';

                        for (let num = 0; num < loadedQuery.columns.length; num++) {
                            if(stringResult !== ''){
                                stringResult +=','
                            }
                            stringResult +=resultSet.results[ind].values[num];
                        }
                        //arrValuesToPrint.push(stringResult);
                        stringColumnsName+=stringResult+'\n';
                    }

                    log.debug('stringColumnsName',stringColumnsName);
                    var fileObj = file.create({
                        name: 'Commission Data Export - '+new Date()+'.csv',
                        fileType: file.Type.CSV,
                        contents: stringColumnsName
                    });

                    scriptContext.response.writeFile({
                        file: fileObj,
                        isInline: true
                    });

                }
            }catch (e) {
                log.error('ERROR', e);
                pageHandler(scriptContext.response, e.message);
            }
        }

        const pageHandler = (response, message) => {
            let form = serverWidget.createForm({
                title: "Something Went Wrong"
            });
            let script = "win = window.close();";
            form.addButton({
                id: 'custpage_btn_close',
                label: 'Close',
                functionName: script
            });
            let outputHTMLField = form.addField({
                id: 'custpage_output_html',
                label: 'Output',
                type: serverWidget.FieldType.INLINEHTML
            });
            outputHTMLField.defaultValue = message;
            outputHTMLField.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
            });
            response.writePage(form);
        }

        return {onRequest}

    });
