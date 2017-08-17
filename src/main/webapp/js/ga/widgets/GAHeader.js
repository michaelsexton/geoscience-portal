/**
 * This is the GA portal header.
 * It contains the logos of the state and federal agencies that contributed to the portal. 
 */
Ext.define('ga.widgets.GAHeader', {
    extend : 'Ext.panel.Panel',
    alias: 'widget.gaheader',

    map: null,
    registryStore: null,
    layerFactory: null,
    knownLayerStore: null,

    constructor : function(config){   
        
        var me = this;
        me.map = config.map;
        me.registryStore = config.registryStore;    
        me.layerFactory = config.layerFactory;
        me.knownLayerStore = config.knownLayerStore;
        
        //Create our permalink generation handler
        var permalinkHandler = function() {
            var mss = Ext.create('portal.util.permalink.MapStateSerializer');

            mss.addMapState(me.map);
            mss.addLayers(me.map);

            mss.serialize(function(state, version) {
                var popup = Ext.create('portal.widgets.window.PermanentLinkWindow', {
                    state : state,
                    version : version,
                    mapStateSerializer: mss
                });
                portal.util.GoogleAnalytic.trackevent('PermanentLinkHandlerClick', 'Permanent Link', 'Map state: ' +state + '; version: '+version);

                popup.show();

            });

        };

        // Create our Print Map handler
        var printMapHandler = function() {
            var heightPxNumber = Ext.get('center_region').getHeight() - 27;
            var widthPxNumber = Ext.get('center_region').getWidth();

            // create some print-only css rules to apply before printing
            var printCSS1 = 'html, body {\
                margin: 0 0 0 0 !important;\
                padding: 0 0 0 0 !important;\
                height: 99% !important;\
                background-color: #ffffff !important;\
            }\
            div {\
                border: none !important;\
                margin: 0 0 0 0 !important;\
                page-break-after: avoid !important;\
            }\
            .x-panel, .x-tip, .x-splitter {\
                display: none !important;\
                height: 0px !important;\
                width: 0px !important;\
                border: none !important;\
            }\
            #center_region {\
                display: block !important;\
                top: 0px !important;\
                left: 0px !important;\
                height: ';

            var printCSS2 = 'px !important;\
                width: ';

            var printCSS3 = 'px !important;\
            }\
            #center_region-body {\
                padding: 0 0 0 0 !important;\
            }\
            .olButton, .olAlphaImg {\
                display: none !important;\
            }\
            @media print\
            {\
                * {-webkit-print-color-adjust:exact;}\
            }';

            var printCSS = printCSS1 + heightPxNumber + printCSS2 + widthPxNumber + printCSS3;

            // use the browser print() function with the new styles applied
            Ext.util.CSS.createStyleSheet(printCSS, 'printCSSLink');
            window.print();
            Ext.util.CSS.removeStyleSheet('printCSSLink');
            portal.util.GoogleAnalytic.trackevent('PrintMapHandlerClick', 'Print Map', 'http://portal.geoscience.gov.au');
        };

        var scannedMapsHandler = function() {

            clearMapHandler();
            var id = "250K-scanned-geological-maps";

            var knownLayer = me.knownLayerStore.getById(id);
            var scannedMapsLayer = me.layerFactory.generateLayerFromKnownLayer(knownLayer);
            knownLayer.set('layer', scannedMapsLayer);

            var filterParams = {bbox: {"westBoundLongitude":"102","southBoundLatitude":"…157","northBoundLatitude":"-2","crs":"EPSG:4326"}, opacity: 1}
            var filterer = scannedMapsLayer.get('filterer');
            filterer.setParameters(filterParams);
            var renderer = scannedMapsLayer.get('renderer');
            renderer.displayData(scannedMapsLayer.getAllOnlineResources(),filterer,Ext.emptyFn);
            ActiveLayerManager.addLayer(scannedMapsLayer);
            portal.util.GoogleAnalytic.trackevent('ScannedMapsHandlerClick', id, id);
        }

        var helpHandler = function() {
            ga.widgets.GAMenuBar.instructionManager.showInstructions([Ext.create('portal.util.help.Instruction', {
                highlightEl : 'auscope-tabs-panel',
                title : 'Find data/layers',
                description : 'In this panel a list of all available datasets in the form of layers will be presented to you.  Select the layer you would like to visualise.<br><br>Selecting a layer will expand any advanced filter options. If you do not wish to filter your datasets, you can visualise the data by clicking "Add to Map".<br/><br/>Further information about the data behind each layer can be displayed by clicking the icons alongside the layer name.'
            }),Ext.create('portal.util.help.Instruction', {
                highlightEl : 'hh-searchfield-Featured',
                title : 'Search Layer',
                description : 'Allow you to filter through the layers via the layer\'s name. Enter a key and click the magnifying glass to filter'
            }),Ext.create('portal.util.help.Instruction', {
                highlightEl : 'latlng',
                anchor : 'left',
                title : 'Mouse Coordinate',
                description : 'Display the coordinate of the mouse on the map'
            }),Ext.create('portal.util.help.Instruction', {
                highlightEl : 'permanent-link',
                anchor : 'left',
                title : 'Permanent Link',
                description : 'Create a link that captures the current state of the user session.'
            }),Ext.create('portal.util.help.Instruction', {
                highlightEl : 'help-link',
                anchor : 'left',
                title : 'User guide',
                description : 'For more information, refer to the user guide.'
            })]);
        };

        // Create our Clear Map handler
        // revert to the default zoom level, map extent and remove all our layers
        var clearMapHandler = function() {

            ActiveLayerManager.removeAllLayers(me.map);

            me.map.setZoom(4);
            var center = new portal.map.Point({longitude:133.3, latitude: -26});
            me.map.setCenter(center);

            /* set the Base Layer for the map */
            Ext.each(me.map.layerSwitcher.baseLayers, function(baseLayer) {
                if (baseLayer.layer.name === "Google Satellite") {
                    me.map.map.setBaseLayer(baseLayer.layer);
                    return false;
                }
            });



            // if the browser supports local storage, clear the stored map state
            if(typeof(Storage) !== "undefined") {
                localStorage.removeItem("portalStorageApplicationState");
                localStorage.removeItem("portalStorageDefaultBaseLayer");
            }
            portal.util.GoogleAnalytic.trackevent('ClearMapHandlerClick', 'Clear Map', 'http://portal.geoscience.gov.au');
        };

        // Create our Refresh Map handler
        var refreshMapHandler = function() {
            ActiveLayerManager.saveApplicationState(me.map);

            // Refresh the whole browser window
            portal.util.GoogleAnalytic.trackevent('RefreshMapHandlerClick', 'Refresh Map', 'http://portal.geoscience.gov.au');

            window.location.reload();
        };

        //Create our advanced search control handler
        var advancedSearchLinkHandler = function() {
            
            var gaAdvancedSearchWindow = Ext.getCmp('gaAdvancedSearchWindow');
            if (!gaAdvancedSearchWindow) {
                gaAdvancedSearchWindow = new ga.widgets.GAAdvancedSearchWindow({
                    name : 'CSW Filter',
                    id : 'gaAdvancedSearchWindow',
                    map : me.map,
                    layerFactory : me.layerFactory,
                    listeners : {
                        filterselectcomplete : function(filteredResultPanels) {
                            var gaSearchResultsWindow = new GASearchResultsWindow({
                                title : 'Advanced Search Results',
                                id: 'gaSearchResultsWindow',
                                map : me.map,
                                layerFactory : me.layerFactory,
                                
                                resultpanels : filteredResultPanels,
                                listeners : {
                                    selectioncomplete : function(csws){
                                        var tabpanel =  Ext.getCmp('auscope-tabs-panel');
                                        var customPanel = me.ownerCt.getComponent('org-auscope-custom-record-panel');
                                        tabpanel.setActiveTab(customPanel);
                                        if(!(csws instanceof Array)){
                                            csws = [csws];
                                        }
                                        for(var i=0; i < csws.length; i++){
                                            csws[i].set('customlayer',true);
                                            customPanel.getStore().insert(0,csws[i]);
                                        }

                                    }
                                }
                            });
                            gaSearchResultsWindow.show();
                        }
                    }
                });
            }
            
            var basicSearchInput = Ext.get('basic-search-input');
            if (basicSearchInput) {
                //basicSearchInput.dom.disabled = 'true';
                basicSearchInput.dom.value = '';
            }           
            
            var gaSearchResultsWindow = Ext.getCmp('gaSearchResultsWindow');
            if (gaSearchResultsWindow) {
                gaSearchResultsWindow.destroy();
            }           
            
            gaAdvancedSearchWindow.show();
        };
        
    
        //Create our 'Basic Search' handler
        var basicSearchButtonHandler = function() {
    
            var basicSearchInput = Ext.get('basic-search-input');
            
            // hmmm... validate empty input or just ignore it?
            if (!basicSearchInput) {
                return false;
            }  
            
            if (basicSearchInput.dom.value === '') {
                Ext.Msg.alert('Search Term Required', 'Please enter a search term in the provided input field.');
                return false;
            }
                        
            var filteredResultPanels=[];
    
            for(arrayIndex in me.registryStore.data.items){
                filteredResultPanels.push(getTabPanels(me.registryStore.data.items[arrayIndex].data, basicSearchInput.dom.value));                
            }
            
            var gaAdvancedSearchWindow = Ext.getCmp('gaAdvancedSearchWindow');
            if (gaAdvancedSearchWindow) {
                gaAdvancedSearchWindow.destroy();
            }
            var gaSearchResultsWindow = Ext.getCmp('gaSearchResultsWindow');
            if (gaSearchResultsWindow) {
                gaSearchResultsWindow.destroy();
            }
            gaSearchResultsWindow = new GASearchResultsWindow({
                title : 'Search Results',
                id: 'gaSearchResultsWindow',
                map : me.map,
                layerFactory : me.layerFactory,
                resultpanels : filteredResultPanels,
                showControlButtons : false,
                listeners : {
                    selectioncomplete : function(csws){  
                        var tabpanel =  Ext.getCmp('auscope-tabs-panel');
                        var customPanel = me.ownerCt.getComponent('org-auscope-custom-record-panel');
                        tabpanel.setActiveTab(customPanel);
                        if(!(csws instanceof Array)){
                            csws = [csws];
                        }
                        for(var i=0; i < csws.length; i++){
                            csws[i].set('customlayer',true);
                            customPanel.getStore().insert(0,csws[i]);
                        }
                        
                    }
                }
            });
            portal.util.GoogleAnalytic.trackevent('Basic Search:', 'Service ids:All', 'Search parameters:' + basicSearchInput.dom.value);
            gaSearchResultsWindow.show();                  
        };
    
        var userGuideLinkHandler = function () {
            portal.util.GoogleAnalytic.trackevent('UserGuideClick', 'User Guide', 'http://www.geoscience.gov.au/Geoscience_Portal_User_Guide.pdf');
        };
        /**
         * Return configuration for the tabpanels in the basic search results
         *
         * params - the parameter used to filter results for each tab panel
         * cswServiceId - The id of the csw registry.
         */
        var getTabPanels = function(cswService,basicSearchValue) {
            //Convert our keys/values into a form the controller can read
            var keys = [];
            var values = [];
            var customRegistries=[];
    
            keys.push("basicSearchTerm");
            values.push(basicSearchValue);
            
            keys.push('cswServiceId');
            values.push(cswService.id);
            
            //Create our CSWRecord store (holds all CSWRecords not mapped by known layers)
            var filterCSWStore = Ext.create('Ext.data.Store', {
                model : 'portal.csw.CSWRecord',
                pageSize: 35,
                autoLoad: false,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                proxy : {
                    type : 'ajax',
                    url : 'getFilteredCSWRecords.do',
                    reader : {
                        type : 'json',
                        rootProperty : 'data',
                        successProperty: 'success',
                        totalProperty: 'totalResults'
                    },
                    extraParams: {
                        key : keys,
                        value : values
                    }
    
                }
    
            });
            
            tabTitle = cswService.title || 'Error retrieving title';
    
            var result={
                    title : tabTitle,
                    xtype: 'gasearchresultspanel',
                    layout : 'fit',
                    map: me.map,
                    layerFactory : me.layerFactory,
                    store : filterCSWStore
                };
    
            return result;
        };
        
        //Create our 'Clear Search' handler
        var clearSearchLinkHandler = function() {
            var gaAdvancedSearchWindow = Ext.getCmp('gaAdvancedSearchWindow');
            if (gaAdvancedSearchWindow) {
                gaAdvancedSearchWindow.destroy();
            }
            var gaSearchResultsWindow = Ext.getCmp('gaSearchResultsWindow');
            if (gaSearchResultsWindow) {
                gaSearchResultsWindow.destroy();
            }
            
            var basicSearchInput = Ext.get('basic-search-input');
            if (basicSearchInput) {
                basicSearchInput.dom.value = '';
            }
        };
        
        //Create our 'Simple Search' handler for the Enter key. 
        var simpleSearchSubmitHandler = function(e) {
            if (e.getKey() == e.ENTER) {
                basicSearchButtonHandler();
            }
        };     
        
        var gaMenu = Ext.create('Ext.menu.Menu', {
            id: 'gaMainMenu',
            plain: true,
            cls: 'x-btn-text',
            items: [
                {
                    text: 'Share map',
                    handler: permalinkHandler
                }, '-',
                {
                    text: 'Print map',
                    handler: printMapHandler
                }, '-',
                {
                    text: 'Quick links',
                    menu: {
                        plain: true,
                        cls: 'x-btn-text',
                        items: [
                            {
                                text: 'Scanned 250K Geological Maps',
                                handler: scannedMapsHandler
                            }
                        ]
                    }
                }, '-',
                {
                    text: 'Help',
                    menu: {
                        plain: true,
                        cls: 'x-btn-text',
                        items: [{
                            text: 'User Guide',
                            href: "http://www.geoscience.gov.au/Geoscience_Portal_User_Guide.pdf",
                            hrefTarget: '_blank'
                        }, '-',
                        {
                            text: 'Contact Us',
                            href: "mailto:geoscience-portal-aws@ga.gov.au"
                        }]
                    }
                },  '-',
                {
                    text: 'AusGIN Home',
                    href: "http://www.geoscience.gov.au",
                    hrefTarget: '_blank'
                }
        ]});

        // logo
        var northLogo = {
                id: 'ausgin-logo',
                xtype: 'box',
                height: '59px',
                autoEl: {tag : 'span'},
                items: [gaMenu]
        };

        var northPanel = Ext.create('Ext.panel.Panel', {
            tbar : [
                {
                    id: 'header-redesign',
                    xtype: 'box',
                    height: '50px',
                    autoEl: {tag : 'span'}
                },
                {   xtype: 'tbfill' },
                {
                    id: 'header-icon',
                    menu: gaMenu  // assign menu by instance
                }
            ],
            renderTo: Ext.getBody()
        });


        // sponsor link
        var attributionPanel = {
                id: 'sponsor-link-1',
                xtype: 'box',
                height: '0px',
                autoEl: {
                    tag : 'span', 
                    id : "auscope_attrib",
                    html : 'Powered by <a href="//www.auscope.org.au/" target="_blank"><img src="img/logos/AuScope-pic.png" alt="link to Auscope partner"/>AuScope</a>'
                }   
        };

// search panel contains the search controls
        var searchPanel = {
                id: 'search-controls',
                height: '0px',
                xtype: 'box',
                autoEl: {
                    tag: 'span',
                    html: '<label for="basic-search-input">Search for data and publications</label>\
                            <input type="text" id="basic-search-input" name="searchBox" maxlength="50"/>\
                            <span id="basic-search-link"><a href="javascript:void(0)"></a></span>\
                            <a id="advanced-search-link" href="javascript:void(0)">Advanced Search</a>\
                            <a id="clear-search-link" href="javascript:void(0)">Clear Search</a>' 
                }  
        };
        
        // south panel contains the 'Contact Us' and 'Skip to content' links
        var linksPanel = {
            id : "ga-header-south-panel-links",
            height: '0px',
            items: [{
                xtype: 'box',
                id: 'header-controls',
                autoEl: {
                    tag: 'div',
                    html: 
                         '<ul>\
                              <li><a href="mailto:geoscience-portal-aws@ga.gov.au">Contact Us</a></li>\
                              <li><a id="user-guide-link" href="http://www.geoscience.gov.au/Geoscience_Portal_User_Guide.pdf" target="_blank">User Guide</a></li>\
                          </ul> '   
                }       
            }]    
        };

        // center panel contains the "powered by Auscope" logo, search controls and the links
        var centerPanel = {
                id: 'wrapper-search-and-links',
                xtype: 'panel',
                height: '0px',
                layout: 'hbox',
                hidden: true,
                items: [attributionPanel, searchPanel, linksPanel]
            };
        
        // south panel contains the menu bar
        var southPanel = {
            xtype: 'gamenubar',
            hidden: true,
            height: '0px',
            map: me.map,
            knownLayerStore: me.knownLayerStore,
            layerFactory: me.layerFactory
        };

        Ext.apply(config, {
            items: [{
                id: 'header-container',
                xtype: 'panel',
                height: '0px',
                layout: 'vbox',
                items: [northPanel, centerPanel, southPanel]
            }],
        
            listeners: {
                render: function (view) {
                    Ext.get('basic-search-link').on('click', basicSearchButtonHandler);
                    Ext.get('basic-search-input').on('keyup', simpleSearchSubmitHandler);   
                    Ext.get('advanced-search-link').on('click', advancedSearchLinkHandler);
                    Ext.get('clear-search-link').on('click', clearSearchLinkHandler);
                    Ext.get('user-guide-link').on('click', userGuideLinkHandler);
                }
            }
        });
    
        this.callParent(arguments);
    }

});