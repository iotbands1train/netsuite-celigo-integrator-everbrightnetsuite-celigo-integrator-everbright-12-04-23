/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 *
 * - Module Definition -
 *
 * Copyright 2020 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */

define([],
function() {

    function postConnectionTest(payload) {
        return {"success":true,
            "message": "POST Connection to this API was successful."
        };
    }

    function getConnectionTest(payload) {
        return {"success":true,
            "message": "GET Connection to this API was successful."
        };
    }

    function putConnectionTest(payload) {
        return {"success":true,
            "message": "PUT Connection to this API was successful."
        };
    }

    function deleteConnectionTest(payload) {
        return {"success":true,
            "message": "DELETE Connection to this API was successful."
        };
    }

    return {
        name: 'connectionTest',
        post: postConnectionTest,
        get: getConnectionTest,
        put: putConnectionTest,
        delete: deleteConnectionTest
    };
});
