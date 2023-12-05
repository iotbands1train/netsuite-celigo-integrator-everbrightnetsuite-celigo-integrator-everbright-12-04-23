define(['N/record'], function (record) {
    'use strict';

    return {
        createTransferOrder: function (data) {
            var fromLocation = record.load({
                type: record.Type.LOCATION,
                id: data.from_location
            });
            var fromSubsidiary = fromLocation.getValue('subsidiary');

            var toLocation = record.load({
                type: record.Type.LOCATION,
                id: data.to_location
            });
            var toSubsidiary = toLocation.getValue('subsidiary');

            var isIntercompany = fromSubsidiary !== toSubsidiary;

            var transferOrder = isIntercompany
                ? record.create({
                    type: record.Type.INTER_COMPANY_TRANSFER_ORDER
                })
                : record.create({
                    type: record.Type.TRANSFER_ORDER
                });

            var values = {};
            values.subsidiary = fromSubsidiary;
            if (isIntercompany) {
                values.tosubsidiary = toSubsidiary;
            }
            values.location = data.from_location;
            values.transferlocation = data.to_location;
            if (data.date) {
                values.trandate = new Date(data.date);
            }
            if (data.department) {
                values.department = data.department;
            }
            if (data.class) {
                values.class = data.class;
            }
            if (data.memo) {
                values.memo = data.memo;
            }
            for (var field in values) {
                transferOrder.setValue({
                    fieldId: field,
                    value: values[field]
                });
            }
            if (data.customFields) {
                for (var field in data.customFields) {
                    transferOrder.setValue({
                        fieldId: field,
                        value: data.customFields[field]
                    });
                    return true;
                };
            }
            data.lines.forEach(function (line, index) {
                transferOrder.insertLine({
                    sublistId: 'item',
                    line: index
                });
                values = {};
                values.item = line.item;
                values.quantity = line.quantity;
                for (var field in values) {
                    transferOrder.setSublistValue({
                        sublistId: 'item',
                        line: index,
                        fieldId: field,
                        value: values[field]
                    });
                }
                if (line.customFields) {
                    for (var field in line.customFields) {
                        transferOrder.setSublistValue({
                            sublistId: 'item',
                            line: index,
                            fieldId: field,
                            value: line.customFields[field]
                        });
                        return true;
                    };
                }
                return true;
            });
            return transferOrder.save();
        },
        getTransferOrder: function (id) {
            return record.load({
                type: record.Type.TRANSFER_ORDER,
                id: id
            });
        }
    };
});