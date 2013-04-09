/* Copyright 2011 University of California, Berkeley; Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at https://source.collectionspace.org/collection-space/LICENSE.txt */

/*global jQuery, fluid, window, cspace:true*/
"use strict";

var cspace = cspace || {};

(function($, fluid) {
    
    //TODO: Design Discussion: potentially this should be a component of the sidebar, instead of a component of the recordEditor?

    fluid.defaults("cspace.berkeleyMapperIntegration", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        model: "{recordEditor}.model",
        parentBundle: "{globalBundle}",
        finalInitFunction: "cspace.berkeleyMapperIntegration.finalInit",
        components: {
             globalModel: "{globalModel}"
        },
        recordType: "{recordEditor}.options.recordType",
        berkeleyMapperBtn: ".csc-berkeleyMapper-btn",
        urls: cspace.componentUrlBuilder({
            reportUrl: "%tenant/%tname/invokereport/%reportcsid/%recordType/%csid/publish",
            configUrl: "%webapp/config/BerkeleyMapperConfig.xml",
            tabfileUrl: "%services%publicItemCsid/%tId/content/"
        })
    });

    cspace.berkeleyMapperIntegration.finalInit = function(that) {        
        $(that.options.berkeleyMapperBtn).click(function(me) {
            return function() {
                //TODO: Need Help/Design: ReportProducer.js makes the call to the app layer to get the list of reports, but in no guaranteed order
                //Here I'm making the assumption that the BerkeleyMapper report is loaded into the selection drop down element
                //by the time the user clicks the BerkeleyMapper button, and that the BerkeleyMapper report is called 'BerkeleyMapperTest' 
                //In the future, the BerkeleyMapper reports shouldn't show up in the Report drop down at all. It seems a waste though to 
                //have to call the same App layer url twice per page load though. We could decide on a naming convention for BerkeleyMapper
                //related reports, but this still requires looking at the drop down list via the DOM to get the CSID of a report. Optionally could
                //add the name/CSID to the json config per record type. 
                var reportTypeSelection = $('#reportType-selection option').filter(function(index) {
                    return $(this).text() == "BerkeleyMapperTest";
                }).val();

                var reportUrl = fluid.stringTemplate(me.options.urls.reportUrl, {
                    reportcsid: reportTypeSelection,
                    recordType: me.options.recordType,
                    csid: me.globalModel.model.primaryModel.csid
                });
                
                //TODO: this should be a POST with json payload to support mapping multiple items down the road
                $.get(reportUrl, function(data, textStatus, jqXHR) {
                    if (textStatus == "success") {
                        //TODO: where should the config file live? generalize this to make name based on record type & report type?
                        var configfile = fluid.stringTemplate(me.options.urls.configUrl);
                        
                        var tabfile = fluid.stringTemplate(me.options.urls.tabfileUrl, {
                            publicItemCsid: jqXHR.getResponseHeader("Location"),
                            tId: me.model.fields.tenantId
                        });
                        
                        window.open("http://berkeleymappertest.berkeley.edu/index.html?ViewResults=tab&tabfile=" + tabfile + "&configfile=" + configfile);
                    }
                });
            }
        }(that));
    };

})(jQuery, fluid);