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
    extend : 'portal.widgets.panel.CommonBaseRecordPanel',
    alias: 'widget.baseactiverecordpanel',

    visibleIcon : 'img/eye.png',
    notVisibleIcon : 'img/eye_off.png',
    
    constructor : function(cfg) {
        var me = this;
       
        me.listeners = Object.extend(me.listenersHere, cfg.listeners);
        this.store = cfg.store;
        
        Ext.apply(cfg, {
            cls : 'auscope-dark-grid',
            header: false,
            hideSearch: true,
            emptyText : '<p class="centeredlabel">No map layers currently loaded.</p>',
            titleField: 'name',
            titleIndex: 1,
            allowReordering: true,
            tools: [{
                field: ['loading', 'active'],
                clickHandler: Ext.bind(me._loadingClickHandler, this),
                stopEvent: true,
                tipRenderer: Ext.bind(me._loadingTipRenderer, this),
                iconRenderer: Ext.bind(me._loadingRenderer, this)
            },{
                field: 'serviceInformation',
                stopEvent: true,
                clickHandler: Ext.bind(me._serviceInformationClickHandler, me),
                tipRenderer: function(layer, tip) {
                    return 'Click for detailed information about the web services this layer utilises.';
                },
                iconRenderer: Ext.bind(me._serviceInformationRenderer, me)
            },{
                field: 'legend',
                stopEvent: true,
                clickHandler: function (value, record) {
                    Ext.bind(me._getLegendAction(record).execute(), me);
                },
                tipRenderer: function(layer, tip) {
                    return 'Show layer legend.';
                },
                iconRenderer: function(value, record) {
                    return 'portal-core/img/key.png';
                }
            },{
                field: 'visible',
                stopEvent: true,
                tipRenderer: function(value, record, tip) {
                    var tip = 'Toggle layer visibility ';
                    if(record.visible){
                        tip+='off';
                    }else{
                        tip+='on';
                    }
                    return tip;
                },
                iconRenderer: function(value, record) {
                    if(record.visible){
                        return me.visibleIcon;
                    }else{
                        return me.notVisibleIcon;
                    }
                },
                clickHandler: function(value, record) {
                    me._setVisibilityAction(record).execute();
                }
            },{
                field: 'active',
                iconRenderer: function(value, record) {
                    return 'portal-core/img/cross.png';
                },
                tipRenderer: function(value, record) {
                    return 'Remove layer';
                },
                clickHandler: function(value, record) {
                    ActiveLayerManager.removeLayer(record);
                }
            }],
            childPanelGenerator: function(layer) {                  
                if(! layer) {
                    Ext.Error.raise("Expecting layer to be an actual layer for the ActiveLayersPanel but it is undefined")
                }           
                var filterForm = cfg.layerFactory.formFactory.getFilterForm(layer).form; //ALWAYS recreate filter form - see https://jira.csiro.au/browse/AUS-2588
                filterForm.setLayer(layer);
                var filterPanel = me._getInlineLayerPanel(filterForm);
                
                //Update the layer panel to use
                if (filterForm) {
                    var filterer = layer.get('filterer');
                    if (filterer) {
                        var existingParams = filterer.getParameters();
                        filterForm.getForm().setValues(existingParams);
                    }
                }
                return filterPanel;
           },
           listeners: {
               reorder: function(recordPanel, record) {
                   ActiveLayerManager.updateLayerOrder(me.map, record);
               }
            }
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
                // this will be resized dynamically as legend content is added
                var legendCallback = function(legend, resources, filterer, success, form, layer){
                    if (success && form) {                        
                        // allow more than one legend popup but only one per layer
                        var popupId = 'legendPopup_' + layer.get('id');                        
                        var popupWindow = Ext.get(popupId);
                        if (!popupWindow) {
                            popupWindow = Ext.create('Ext.window.Window', {                        
                                id          : 'legendPopup',
                                title       : 'Legend: '+ layer.get('name'),
                                layout      : 'vbox',
                                maxHeight   : Ext.get('center_region-map').getHeight(),
                                autoScroll  : true,
                                items: form,
                                listeners: {
                                    show: function() {
                                        var container = Ext.get('center_region-map');
                                        this.setPosition(container.getX()-1, container.getY()-1);
                                    }
                                },
                            }); 
                            popupWindow.show();
                        } 
                        return Ext.getCmp(popupWindow.id).focus();              
                    }
                };
    
                var onlineResources = layer.getAllOnlineResources();
                var filterer = layer.get('filterer');
                var renderer = layer.get('renderer');
                var legend = renderer.getLegend(onlineResources, filterer);
    
                //VT: this style is just for the legend therefore no filter is required.
                var styleUrl = layer.get('renderer').parentLayer.get('source').get('proxyStyleUrl');

                var staticLegendURL = layer.get('source').get('staticLegendUrl');

                if (staticLegendURL && staticLegendURL.length > 0) {
                    legend.getLegendComponent(onlineResources, filterer,"", true, Ext.bind(legendCallback, this, [layer], true), staticLegendURL, true);
                } else if(styleUrl && styleUrl.length > 0) {
    
                    Ext.Ajax.request({
                        url: styleUrl,
                        timeout : 180000,
                        scope : this,
                        success:function(response,opts){
                            legend.getLegendComponent(onlineResources, filterer,response.responseText, true, Ext.bind(legendCallback, this, [layer], true), null, true);
                        },
                        failure: function(response, opts) {
                            legend.getLegendComponent(onlineResources, filterer,"", true, Ext.bind(legendCallback, this, [layer], true));
                        }
                    });
                }
            }
        });
        
        return getLegendAction;
    },
    
    // Column Function
    _setVisibilityAction : function(layer){
//        var me = this;
        var visibleLayerAction = new Ext.Action({
            text : 'Toggle Layer Visibility OFF',
            iconCls : 'visible_eye',
            handler : function(){
//                var layer = me.filterForm.layer;                 
                layer.setLayerVisibility(!layer.visible);
            }
        });
        
        return visibleLayerAction;
    },

    /**
     * Column definition function to draw the panel when a row is clicked upon.  Here is a common one to draw the WMS/WFS filter with Opacity, drop-downs etc..
     * Override
     */
    _getInlineLayerPanel : function(filterForm){
        var me = this;   
        var panel = Ext.create('portal.widgets.panel.FilterPanel', {    
            menuFactory : this.menuFactory,
            filterForm  : filterForm, 
            detachOnRemove : false,
            map         : this.map,
            menuItems : []
        });   
        
        return panel
       
    },
    
    _playRenderer : function () {
      return Ext.DomHelper.markup({
        tag : 'img',
        width : 16,
        height : 16,
        src: 'portal-core/img/play_blue.png'
    });
      
    },
    
    _loadingRenderer : function(value, layer) {
        if (value) {
            return 'portal-core/img/loading.gif';
        } else {

            if(layer.get('active')){

                var renderStatus = layer.get('renderer').renderStatus;
                var listOfStatus=renderStatus.getParameters();
                var errorCount = this._statusListErrorCount(listOfStatus);
                var sizeOfList = Ext.Object.getSize(listOfStatus);
                if(errorCount > 0 && errorCount == sizeOfList){
                    return 'portal-core/img/exclamation.png';
                }else if(errorCount > 0 && errorCount < sizeOfList){
                    return 'portal-core/img/warning.png';
                }else{
                    return 'portal-core/img/tick.png';
                }

            }else{
                return 'portal-core/img/notloading.gif';
            }
        }
    },
    
    _statusListErrorCount : function(listOfStatus){
        var match =["reached","error","did not complete","AJAX","Unable"];
        
        var errorCount = 0;  
        
        for(key in listOfStatus){
            for(var i=0; i< match.length; i++){
                if(listOfStatus[key].indexOf(match[i]) > -1){
                    errorCount++;
                    break;
                }
            }
        }
        return errorCount;
    },
    
    _loadingTipRenderer : function(value, layer, tip) {
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
    
    _loadingClickHandler : function(value, layer) {
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
