/**
 * @NApiVersion 2.x
 * @NModuleScope public
 * @author Michael Golichenko
 */

/**
 * Copyright 2017-2018 Blue Banyan Solutions, Inc.
 * All Rights Reserved.
 *
 * This software and information are proprietary to Blue Banyan Solutions, Inc.
 * Any use of the software and information shall be in accordance with the terms
 * of the license agreement you entered into with Blue Banyan Solutions, Inc,
 * including possible restrictions on redistribution, misuse, and alteration.
 */
define(['N/https'],
    function(httpsModule) {

        var _export = {};
        var _class = function () {
            var _self = this;
            _self.path = undefined;
            _self.suiteletUrl = undefined;
            return _self;
        };
        _class.prototype.consturctor = _class;

        _class.prototype.setPath = function(path){
            this.path = path;
            return this;
        }
        _class.prototype.setSuiteletUrl = function(suiteletUrl){
            this.suiteletUrl = suiteletUrl;
            return this;
        }

        _class.prototype.renderJavascript = function () {
            var _self = this;
            jQuery(function(){
                var iFrameDocument = jQuery('#bb_s3_iframe').contents();

                // delete button
                jQuery('.direct-upload', iFrameDocument).append(
                    jQuery(document.createElement('input')).attr({
                        id:    'submit_delete',
                        name:  'Delete Files',
                        value: 'Delete Files',
                        type:  'button'
                    })
                );

                jQuery('.submit_delete', iFrameDocument).css({height: 20, width: 100, margin: 10});

                jQuery('.objects', iFrameDocument).after('<p></p>');
                //loop over each object and add a check box
                var counter = 1;
                jQuery('.object', iFrameDocument).each(function(counter){
                    if (counter >= 1 ) {
                        jQuery(this).append(
                            jQuery(document.createElement('input')).attr({
                                id:    'delete_file' + counter,
                                name:  'delete_file',
                                type:  'checkbox'
                            })
                        );
                        // position of check boxes
                        jQuery('#delete_file' + counter, iFrameDocument).parent().css({position: 'relative'});
                        jQuery('#delete_file' + counter, iFrameDocument).css({top: 5, right: 5, position:'absolute'});
                    }

                });

                // button click function
                jQuery(document).ready(function(){
                    var deleteItems =[];
                    jQuery('#submit_delete', iFrameDocument).click(function(){
                        // loop over objects that have check box marked as true, then pass those objects to request call to the suitelet
                        var counter = 1;
                        jQuery('.object', iFrameDocument).each(function(counter){
                            if (counter >= 1 && jQuery('#delete_file'+ counter, iFrameDocument).prop('checked') == true) {
                                var objectName = jQuery('.object', iFrameDocument).get(counter);
                                var fileName = jQuery('span', objectName).text();
                                deleteItems.push(fileName);
                            }
                        });
                        if (deleteItems.length > 0) {
                            var data = {
                                deleteItems: deleteItems,
                                path: _self.path
                            }
                            var body = JSON.stringify(data);
                            var rsp = httpsModule.post({
                                url: _self.suiteletUrl,
                                body: body
                            });
                            if (rsp.code == 200) {
                                jQuery(location.reload());
                            }

                        }

                    }); // end of on click function

                }); // end of on document ready function

            }); // end of JQuery function
        };

        _export.createFileDelete = function () {
            return new _class();
        };

        return {
            createFileDelete: _export.createFileDelete
        };

    });