/**
 * An abstract base class to be extended.
 *
 * Represents a grid panel for containing layers
 * that haven't yet been added to the map. Each row
 * will be grouped under a heading, contain links
 * to underlying data sources and have a spatial location
 * that can be viewed by the end user.
 *
 * This class is expected to be extended for usage within
 * the 'Registered Layers', 'Known Layers' and 'Custom Layers'
 * panels in the portal. Support for KnownLayers/CSWRecords and
 * other row types will be injected by implementing the abstract
 * functions of this class
 *
 */

Ext.define('portal.widgets.panel.BaseActiveRecordPanel', {
    extend : 'Ext.grid.Panel',
    alias: 'widget.baseactiverecordpanel',
    browseCatalogueDNSMessage : false, //VT: Flags the do not show message when browse catalogue is clicked.
    map : null,
    activelayerstore : null,
    menuFactory : null,

    constructor : function(cfg) {
        var me = this;
        this.map = cfg.map;
        this.menuFactory = cfg.menuFactory;
        this.activelayerstore = cfg.activelayerstore;
        var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
            groupHeaderTpl: '{name} ({[values.rows.length]} {[values.rows.length > 1 ? "Items" : "Item"]})',
            startCollapsed : true
        });
       
        this.listeners = cfg.listeners;
        
        var menuItems = [this._getVisibleBoundFilterAction(),this._getActivelayerFilterAction(),
                         this._getDataLayerFilterAction(),this._getImageLayerFilterAction()];

        Ext.apply(cfg, {
            cls : 'auscope-dark-grid',
            hideHeaders : true,
            features : [groupingFeature],
            viewConfig : {
                emptyText : '<p class="centeredlabel">No records match the current filter.</p>',
                preserveScrollOnRefresh: true    ,
                plugins: {
                    ptype: 'gridviewdragdrop',
                    dragText: 'Drag and drop to reorganize'
                }
            },          
            columns : [{
                text : 'Drag',
                xtype : 'actioncolumn',
                width: 32,
                align: 'center',
                icon : 'portal-core/img/Drag_and_Drop-128.png',
                tooltipType: 'title',
                sortable: false,
                menuDisabled: true,
             },{
                text : 'Name',
                dataIndex : 'name',
                flex : 1,
                renderer : this._titleRenderer
            },{
                text : 'info',
                id : 'infoBLAHBLAH',
                xtype : 'actioncolumn',
                dataIndex : 'info',
                width: 32,
                align: 'center',
                icon : 'portal-core/img/information.png',
                // Still trying to get tooltips going and also investigating crating 'Ext.tip.Tooltip' objects (at bottom of this)
//                tooltip: 'Legend',// Tooltip.  Click for detailed information about the web services this layer utilises.',
//                getTip: function(value, metadata, record, row, col, store) {
//                    return 'Legend';
//                },
//                tooltipType: 'qtip',
                sortable: false,
                menuDisabled: true,
                handler : function(view, rowIndex, colIndex, item, event, record, row) {
                    me._serviceInformationClickHandler(record);
                }
             },{
                text : 'legend',
                xtype : 'actioncolumn',
                dataIndex : 'legend',
                width: 32,
                align: 'center',
                icon : 'portal-core/img/key.png',
                //tooltip: 'Legend',
                getTip: function(value, metadata, record, row, col, store) {
                    return 'Legend';
                },
                tooltipType: 'title',
                sortable: false,
                menuDisabled: true,
                handler : function(view, rowIndex, colIndex, item, event, layer, row) {
                    me._getLegendAction(layer).execute();
                }
            },{
                text : 'Visible',
                xtype : 'actioncolumn',
                dataIndex : 'visible',
                width: 32,
                align: 'center',
                icon : 'portal-core/img/eye.png',
                tooltip: 'Visible',
                sortable: false,
                menuDisabled: true,
                handler : function(view, rowIndex, colIndex, item, event, layer, row) {
                    me._setVisibilityAction(layer).execute();
                }
            },{
                text : 'Remove',
                xtype : 'actioncolumn',
                dataIndex : 'remove',
                width: 32,
                align: 'center',
                icon : 'portal-core/img/cross.png',
                tooltip: 'Remove',
                sortable: false,
                menuDisabled: true,
                handler : function(view, rowIndex, colIndex, item, event, layer, row) {
                    AppEvents.broadcast('removelayer', {layer:layer, rowIdx:rowIndex});
                }
              }],
              plugins:[{                
                  ptype : 'rowexpandercontainer',
                  baseId : 'rowexpandercontainer-activelayers',
                  pluginId : 'maingrid_rowexpandercontainer',
                  toggleColIndexes: [1],
                  generateContainer : function(layer, parentElId) {
                      //VT:if this is deserialized, we don't need to regenerate the layer
                      if(! layer) {
                          Ext.Error.raise("Expecting layer to be an actual layer for the ActiveLayersPanel but it is undefined")
                      }           
                      var filterForm = cfg.layerFactory.formFactory.getFilterForm(layer).form; //ALWAYS recreate filter form - see https://jira.csiro.au/browse/AUS-2588
                      filterForm.setLayer(layer);
                      var filterPanel = me._getInlineLayerPanel(filterForm, parentElId, this);
                      
                      //Update the layer panel to use
                      if (filterForm) {
                          var filterer = newLayer.get('filterer');
                          if (filterer) {
                              var existingParams = filterer.getParameters();
                              filterForm.getForm().setValues(existingParams);
                          }
                      }
                      this.grid.updateLayout({
                          defer:false,
                          isRoot:false
                      });                    
                      return filterPanel;
                 }
             },{
              ptype: 'celltips'
             }]
                  
        });

        this.callParent(arguments);
    },
    
    _getLegendAction : function(layer){                       
        var legend = layer.get('renderer').getLegend();
        var text = 'Get Legend';
       
        var getLegendAction = new Ext.Action({
            text : text,
            icon : legend.iconUrl,
            //icon : null,
            iconCls : 'portal-ux-menu-icon-size',
            itemId : 'LegendAction',
            
            handler : function(){
                var legendCallback = function(legend, resources, filterer, success, form, layer){
                    if (success && form) {
                        var win = Ext.create('Ext.window.Window', {
                            title       : 'Legend: '+ layer.get('name'),
                            layout      : 'fit',
                            width       : 200,
                            height      : 300,
                            items: form
                        });
                        return win.show();
                    }
                };
    
                var onlineResources = layer.getAllOnlineResources();
                var filterer = layer.get('filterer');
                var renderer = layer.get('renderer');
                var legend = renderer.getLegend(onlineResources, filterer);
    
                //VT: this style is just for the legend therefore no filter is required.
                var styleUrl = layer.get('renderer').parentLayer.get('source').get('proxyStyleUrl');
                
                //VT: if a layer has style, the style should take priority as the default GetLegend source else use default
                if(styleUrl && styleUrl.length > 0){
    
                    Ext.Ajax.request({
                        url: styleUrl,
                        timeout : 180000,
                        scope : this,
                        success:function(response,opts){
                            legend.getLegendComponent(onlineResources, filterer,response.responseText, Ext.bind(legendCallback, this, [layer], true));
                        },
                        failure: function(response, opts) {
                            legend.getLegendComponent(onlineResources, filterer,"", Ext.bind(legendCallback, this, [layer], true));
                        }                        
                    });
                
                }else{
                    legend.getLegendComponent(onlineResources, filterer,"", Ext.bind(legendCallback, this, [layer], true));
                }
                
            }
        });
        
        return getLegendAction;
    },
    
    _setVisibilityAction : function(layer){
//        var me = this;
        var visibleLayerAction = new Ext.Action({
            text : 'Toggle Layer Visibility OFF',
            iconCls : 'visible_eye',
            handler : function(){
//                var layer = me.filterForm.layer;                 
                layer.setLayerVisibility(!layer.visible);
                if(layer.visible){
                    this.setText('Toggle Layer Visibility OFF');
                }else{
                    this.setText('Toggle Layer Visibility ON');
                }
                
            }
        });
        
        return visibleLayerAction;
    },

    /**
     * Generates an Ext.DomHelper.markup for the specified imageUrl
     * for usage as an image icon within this grid.
     */
    _generateHTMLIconMarkup : function(imageUrl) {
        return Ext.DomHelper.markup({
            tag : 'div',
            style : 'text-align:center;',
            children : [{
                tag : 'img',
                width : 16,
                height : 16,
                align: 'CENTER',
                src: imageUrl
            }]
        });
    },
   
    _getInlineLayerPanel : function(filterForm, parentElId){                             
        var me = this;   
        var panel =Ext.create('portal.widgets.panel.FilterPanel', {    
            wantAddLayerButton : false,
            wantOptionsButton : false,
            menuFactory : this.menuFactory,
            filterForm  : filterForm, 
            detachOnRemove : false,
            map         : this.map,
            renderTo    : parentElId,
        });   
        
        return panel
    },
    
    _getVisibleBoundFilterAction : function(){   
        
        var me = this;
        return new Ext.Action({
            text : 'Visible Bound',
            iconCls : 'visible_eye',
            tooltip: 'Filter the layers based on its bounding box and the map\'s visible bound',
            handler : Ext.bind(me._handleVisibleFilterClick, this)
        })
        
    },
    
    
    _getActivelayerFilterAction : function(){
        var me = this;
        return new Ext.Action({
            text : 'Active Layer',
            iconCls : 'tick',
            tooltip: 'Display only active layer',
            handler : function(){
                                // TODO: Do I need this but using the new id for rowexpandercontainer?
                                // var rowExpander = me.getPlugin('maingrid_rowexpandercontainer');
                                //                rowExpander.closeAllContainers();          
                
                //function to check if layer is active on map
                var filterFn = function(rec) {
                    return rec.get('active');
                };

                var searchField = this.findParentByType('toolbar').getComponent(1);
                searchField.clearCustomFilter();
                searchField.runCustomFilter('<active layers>', Ext.bind(filterFn, this));
            }
        })
    },
    
    _getDataLayerFilterAction : function(){
        var me = this;
        return new Ext.Action({
            text : 'Data Layer',
            iconCls : 'data',
            tooltip: 'Display layer with data service',
            handler : function(){
                                // TODO: Do I need this but using the new id for rowexpandercontainer?
                                // var rowExpander = me.getPlugin('maingrid_rowexpandercontainer');
                                //                rowExpander.closeAllContainers();          
                
                //function to if layer contains data service
                var filterFn = function(rec) {
                    var onlineResources = me.getOnlineResourcesForRecord(rec)
                    var serviceType = me._getServiceType(onlineResources); 
                    
                    //VT:This part of the code is to keep it inline with the code in _serviceInformationRenderer
                    //VT: for rendering the icon
                    if (serviceType.containsDataService) {
                        return true; //a single data service will label the entire layer as a data layer
                    }else{
                        return false;
                    } 

                };

                var searchField = this.findParentByType('toolbar').getComponent(1);
                searchField.clearCustomFilter();
                searchField.runCustomFilter('<Data Layers>', Ext.bind(filterFn, this));
            }
        })
        
    },
    
    _getImageLayerFilterAction : function(){
        var me = this;
        return new Ext.Action({
            text : 'Portrayal Layer',
            iconCls : 'portrayal',
            tooltip: 'Display layers with image service',
            handler : function(){
                                // TODO: Do I need this but using the new id for rowexpandercontainer?
                                // var rowExpander = me.getPlugin('maingrid_rowexpandercontainer');
                                //                rowExpander.closeAllContainers();          
                
                //function to if layer contains image service
                var filterFn = function(rec) {           
                    var onlineResources = me.getOnlineResourcesForRecord(rec);
                    var serviceType = me._getServiceType(onlineResources);                                                                                             
                    
                    //VT:This part of the code is to keep it inline with the code in _serviceInformationRenderer
                    //VT: for rendering the picture icon
                    if (serviceType.containsDataService) {
                        return false; //a single data service will label the entire layer as a data layer
                    } else if (serviceType.containsImageService) {
                        return true;
                    } else {
                        return false;
                    }
                          
                };

                var searchField = this.findParentByType('toolbar').getComponent(1);
                searchField.clearCustomFilter();
                searchField.runCustomFilter('<Portrayal layers>', Ext.bind(filterFn, this));
            }
        })
    },
    
    /**
     * When the visible fn is clicked, ensure only the visible records pass the filter
     */
    _handleVisibleFilterClick : function(button) {                           
        var currentBounds = this.map.getVisibleMapBounds();

        //Function for testing intersection of a records's spatial bounds
        //against the current visible bounds
        var filterFn = function(rec) {
            var spatialBounds;
            spatialBounds = this.getSpatialBoundsForRecord(rec);
            for (var i = 0; i < spatialBounds.length; i++) {
                if (spatialBounds[i].intersects(currentBounds)) {
                    return true;
                }
            }

            return false;
        };

        var searchField = button.findParentByType('toolbar').getComponent(1);
        searchField.clearCustomFilter();
        searchField.runCustomFilter('<visible layers>', Ext.bind(filterFn, this));      
    },       
 
    handleFilterSelectComplete : function(filteredResultPanels){
        var me = this;
        var cswSelectionWindow = new CSWSelectionWindow({
            title : 'CSW Record Selection',
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
        cswSelectionWindow.show();


        //
    },

    //-------- Abstract methods requiring implementation ---------

    /**
     * Abstract function - Should return a string based title
     * for a given record
     *
     * function(Ext.data.Model record)
     *
     * record - The record whose title should be extracted
     */
    getTitleForRecord : portal.util.UnimplementedFunction,

    /**
     * Abstract function - Should return an Array of portal.csw.OnlineResource
     * objects that make up the specified record. If no online resources exist
     * then an empty array can be returned
     *
     * function(Ext.data.Model record)
     *
     * record - The record whose underlying online resources should be extracted.
     */
    getOnlineResourcesForRecord : portal.util.UnimplementedFunction,

    /**
     * Abstract function - Should return an Array of portal.util.BBox
     * objects that represent the total spatial bounds of the record. If no
     * bounds exist then an empty array can be returned
     *
     * function(Ext.data.Model record)
     *
     * record - The record whose spatial bounds should be extracted.
     */
    getSpatialBoundsForRecord : portal.util.UnimplementedFunction,

    /**
     * Abstract function - Should return an Array of portal.csw.CSWRecord
     * objects that make up the specified record.
     *
     * function(Ext.data.Model record)
     *
     * record - The record whose underlying CSWRecords should be extracted.
     */
    getCSWRecordsForRecord : portal.util.UnimplementedFunction,

    //--------- Class Methods ---------

    /**
     * Generates an Ext.DomHelper.markup for the specified imageUrl
     * for usage as an image icon within this grid.
     */
    _generateHTMLIconMarkup : function(imageUrl) {
        return Ext.DomHelper.markup({
            tag : 'div',
            style : 'text-align:center;',
            children : [{
                tag : 'img',
                width : 16,
                height : 16,
                align: 'CENTER',
                src: imageUrl
            }]
        });
    },

    /**
     * Internal method, acts as an ExtJS 4 column renderer function for rendering
     * the title of the record.
     *
     * http://docs.sencha.com/ext-js/4-0/#!/api/Ext.grid.column.Column-cfg-renderer
     */
    _titleRenderer : function(value, metaData, record, row, col, store, gridView) {
        return this.getTitleForRecord(record);
    },

    /**
     * Internal method, acts as an ExtJS 4 column renderer function for rendering
     * the service information of the record.
     *
     * http://docs.sencha.com/ext-js/4-0/#!/api/Ext.grid.column.Column-cfg-renderer
     */
    _serviceInformationRenderer : function(value, metaData, record, row, col, store, gridView) {
        
        if(record.get('resourceProvider')=="kml"){
            return this._generateHTMLIconMarkup('portal-core/img/kml.png');
        }
        
        var onlineResources = this.getOnlineResourcesForRecord(record);

        var serviceType = this._getServiceType(onlineResources);
        
        var containsDataService = serviceType.containsDataService;
        var containsImageService = serviceType.containsImageService;

        

        var iconPath = null;
        if (containsDataService) {
            iconPath = 'portal-core/img/binary.png'; //a single data service will label the entire layer as a data layer
        } else if (containsImageService) {
            iconPath = 'portal-core/img/picture.png';
        } else {
            iconPath = 'portal-core/img/cross.png';
        }

        return this._generateHTMLIconMarkup(iconPath);
    },
    
    _getServiceType : function(onlineResources){
        var containsDataService = false;
        var containsImageService = false;
        
      //We classify resources as being data or image sources.
        for (var i = 0; i < onlineResources.length; i++) {
            switch(onlineResources[i].get('type')) {
            case portal.csw.OnlineResource.WFS:
            case portal.csw.OnlineResource.WCS:
            case portal.csw.OnlineResource.SOS:
            case portal.csw.OnlineResource.OPeNDAP:
            case portal.csw.OnlineResource.CSWService:
            case portal.csw.OnlineResource.IRIS:
                containsDataService = true;
                break;
            case portal.csw.OnlineResource.WMS:
            case portal.csw.OnlineResource.WWW:
            case portal.csw.OnlineResource.FTP:
            case portal.csw.OnlineResource.CSW:
            case portal.csw.OnlineResource.UNSUPPORTED:
                containsImageService = true;
                break;
            }
        }
       
        return result = {
            containsDataService : containsDataService,
            containsImageService : containsImageService
        };
        
         
    },

    /**
     * Internal method, acts as an ExtJS 4 column renderer function for rendering
     * the spatial bounds column of the record.
     *
     * http://docs.sencha.com/ext-js/4-0/#!/api/Ext.grid.column.Column-cfg-renderer
     */
    _spatialBoundsRenderer : function(value, metaData, record, row, col, store, gridView) {
        var spatialBounds = this.getSpatialBoundsForRecord(record);
        if (spatialBounds.length > 0 || record.internalId == 'portal-InSar-reports') {
            // create one for insar
            return this._generateHTMLIconMarkup('portal-core/img/magglass.gif');
        }

        return '';
    },

    /**
     * Show a popup containing info about the services that 'power' this layer
     */
    _serviceInformationClickHandler : function(record) {  //column, record, rowIndex, colIndex) {
        var cswRecords = this.getCSWRecordsForRecord(record);
        if (!cswRecords || cswRecords.length === 0) {
            return;
        }

        var popup = Ext.create('portal.widgets.window.CSWRecordDescriptionWindow', {
            cswRecords : cswRecords
        });

        popup.show();
    },


    /**
     * On single click, show a highlight of all BBoxes
     */
    _spatialBoundsClickHandler : function(column, record, rowIndex, colIndex) {
        var spatialBoundsArray;
        if (record.internalId == 'portal-InSar-reports') {
            spatialBoundsArray = this.getWholeGlobeBounds();
        } else {
            spatialBoundsArray = this.getSpatialBoundsForRecord(record);
        }
        var nonPointBounds = [];

        //No point showing a highlight for bboxes that are points
        for (var i = 0; i < spatialBoundsArray.length; i++) {
            var bbox = spatialBoundsArray[i];
            if (bbox.southBoundLatitude !== bbox.northBoundLatitude ||
                bbox.eastBoundLongitude !== bbox.westBoundLongitude) {

                //VT: Google map uses EPSG:3857 and its maximum latitude is only 85 degrees
                // anything more will stretch the transformation
                if(bbox.northBoundLatitude>85){
                    bbox.northBoundLatitude=85;
                }
                if(bbox.southBoundLatitude<-85){
                    bbox.southBoundLatitude=-85;
                }
                nonPointBounds.push(bbox);
            }
        }

        this.map.highlightBounds(nonPointBounds);
    },

    /**
     * Return the max bbox for insar layer as it is a dummy CSW.
     */
    getWholeGlobeBounds : function() {
        var bbox = new Array();
        bbox[0] = Ext.create('portal.util.BBox', {
            northBoundLatitude : 85,
            southBoundLatitude : -85,
            eastBoundLongitude : 180,
            westBoundLongitude : -180
        });
        return bbox;
    },

    /**
     * On double click, move the map so that specified bounds are visible
     */
    _spatialBoundsDoubleClickHandler : function(column, record, rowIndex, colIndex) {
        var spatialBoundsArray;
        if (record.internalId == 'portal-InSar-reports') {
            spatialBoundsArray = this.getWholeGlobeBounds();
        } else {
            spatialBoundsArray = this.getSpatialBoundsForRecord(record);
        }

        if (spatialBoundsArray.length > 0) {
            var superBBox = spatialBoundsArray[0];

            for (var i = 1; i < spatialBoundsArray.length; i++) {
                superBBox = superBBox.combine(spatialBoundsArray[i]);
            }

            this.map.scrollToBounds(superBBox);
        }
    },
   
    

    /**
     * When called, will update the visibility of any search bars
     */
    _updateSearchBar : function(visible) {
        var dockedItems = this.getDockedItems();
        var searchBar = null;
        for (var i = 0; i < dockedItems.length; i++) {
            if (dockedItems[i].initialConfig.portalName === 'search-bar') {
                searchBar = dockedItems[i];
            }
        }
        if (!searchBar) {
            return;
        }

        if (visible) {
            searchBar.show();
        } else {
            searchBar.hide();
        }
    },
        
    _deleteRenderer : function(value, metaData, record, row, col, store, gridView) {
        if (value) {
            return Ext.DomHelper.markup({
                tag : 'img',
                width : 16,
                height : 16,
                src: 'portal-core/img/trash.png'
            });
        } else {
            return Ext.DomHelper.markup({
                tag : 'img',
                width : 16,
                height : 16,
                src: 'portal-core/img/play_blue.png'
            });
        }
    },
    
    _deleteClickHandler :  function(value, record, rowIdx, tip) {
        var layer = record.get('layer');
        if(layer && record.get('active')){            
            layer.removeDataFromMap();
            this.activelayerstore.remove(layer);          
            this.fireEvent('cellclick',this,undefined,undefined,record,undefined,rowIdx);
            this.menuFactory.layerRemoveHandler(layer);
            AppEvents.broadcast('removelayer', layer);
        }             
    },
    
    /**
     * Renderer for the loading column
     */
    _loadingRenderer : function(value, metaData, record, row, col, store, gridView) {
        if (value) {
            return Ext.DomHelper.markup({
                tag : 'img',
                width : 16,
                height : 16,
                src: 'portal-core/img/loading.gif'
            });
        } else {
            
            if(record.get('active')){
            
                var renderStatus = record.get('layer').get('renderer').renderStatus;
                var listOfStatus=renderStatus.getParameters();                
                var errorCount = this._statusListErrorCount(listOfStatus);
                var sizeOfList = Ext.Object.getSize(listOfStatus);
                if(errorCount > 0 && errorCount == sizeOfList){
                    return Ext.DomHelper.markup({
                        tag : 'img',
                        width : 16,
                        height : 16,
                        src: 'portal-core/img/exclamation.png'
                    });
                }else if(errorCount > 0 && errorCount < sizeOfList){
                    return Ext.DomHelper.markup({
                        tag : 'img',
                        width : 16,
                        height : 16,
                        src: 'portal-core/img/warning.png'
                    });
                }else{
                    return Ext.DomHelper.markup({
                        tag : 'img',
                        width : 16,
                        height : 16,
                        src: 'portal-core/img/tick.png'
                    });
                }
                
            }else{
                return Ext.DomHelper.markup({
                    tag : 'img',
                    width : 16,
                    height : 16,
                    src: 'portal-core/img/notloading.gif'
                });
            }
            
            
        }
    },
    
    _statusListErrorCount : function(listOfStatus){
        var match =["reached","error","did not complete","AJAX","Unable"];
        
        var erroCount = 0;  
        
        for(key in listOfStatus){
            for(var i=0; i< match.length; i++){
                if(listOfStatus[key].indexOf(match[i]) > -1){
                    erroCount++;
                    break;
                }
            }
        }
        return erroCount;
    },
    
  
    /**
     * A renderer for generating the contents of the tooltip that shows when the
     * layer is loading
     */
    _loadingTipRenderer : function(value, record, column, tip) {
        var layer = record.get('layer');
        if(!layer){//VT:The layer has yet to be created.
            return 'No status has been recorded';
        }
        var renderer = layer.get('renderer');
        var update = function(renderStatus, keys) {
            tip.update(renderStatus.renderHtml());
        };

        //Update our tooltip as the underlying status changes
        renderer.renderStatus.on('change', update, this);
        tip.on('hide', function() {
            renderer.renderStatus.un('change', update); //ensure we remove the handler when the tip closes
        });

        return renderer.renderStatus.renderHtml();
    },
    
    _loadingClickHandler : function(value, record, rowIdx, tip) {
        
        var layer = record.get('layer');
        
        var html = '<p>No Service recorded, Click on Add layer to map</p>';    
        
        if(layer){
            var renderer = layer.get('renderer');
            html =  renderer.renderStatus.renderHtml();
        }        
        var win = Ext.create('Ext.window.Window', {
            title: 'Service Loading Status',
            height: 200,
            width: 500,
            layout: 'fit',
            items: {  // Let's put an empty grid in just to illustrate fit layout
                xtype: 'panel',
                autoScroll : true,                
                html : html
            }
        });
        
        win.show();
    }
});

// An attempt to get tooltips working.  Also trying in-line ones.
var tip = Ext.create('Ext.tip.ToolTip', {target : 'infoBLAHBLAH', html : 'simple tooltip for info'});