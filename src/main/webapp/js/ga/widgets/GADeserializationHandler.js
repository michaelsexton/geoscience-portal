Ext.define('ga.widgets.GADeserializationHandler', {
    extend : 'portal.util.permalink.DeserializationHandler',
    alias: 'widget.gadeserializationhandler',

    constructor : function(cfg) {
        this.callParent(arguments);
    },

    _deserialize : function() {
        var s = this.mapStateSerializer;
        var missingLayers = false;

        //Update our map location to the specified bounds
        this.map.setZoom(s.mapState.zoom);
        var centerPoint = Ext.create('portal.map.Point', {latitude : s.mapState.center.lat, longitude : s.mapState.center.lng});
        this.map.setCenter(centerPoint);

        // array of layers that we will want to add to the layer store
        var layersToAdd = [];

        //Add the layers, attempt to load whatever layers are available
        //but warn the user if some layers no longer exist
        for (var i = 0; i < s.serializedLayers.length; i++) {
            var serializedLayer = s.serializedLayers[i];
            if (serializedLayer.source === portal.layer.Layer.KNOWN_LAYER) {
                var id = serializedLayer.id;
                if (!id) {
                    continue;
                }

                var knownLayer = this.knownLayerStore.getById(id);
                if (!knownLayer) {
                    missingLayers = true;
                    continue;
                }

                //Create our new layer
                var newLayer = this.layerFactory.generateLayerFromKnownLayer(knownLayer);

                knownLayer.set('layer', newLayer);

                //Configure it
                this._configureLayer(newLayer, serializedLayer.filter, serializedLayer.visible);
                layersToAdd.push(newLayer);

            } else if (serializedLayer.source === portal.layer.Layer.CSW_RECORD) {

                //Turn our serialized online resources into 'actual' online resources
                var onlineResources = [];
                for (var j = 0; j < serializedLayer.onlineResources.length; j++) {
                    onlineResources.push(Ext.create('portal.csw.OnlineResource', {
                        name : serializedLayer.onlineResources[j].name,
                        type : serializedLayer.onlineResources[j].type,
                        description : serializedLayer.onlineResources[j].description,
                        url : serializedLayer.onlineResources[j].url
                    }));
                }

                //Perform a 'best effort' to find a matching CSWRecord
                var cswRecord = this._findCSWRecordsByOnlineResources(onlineResources);
                if (!cswRecord) {
                    missingLayers = true;
                    continue;
                }

                var newLayer = this.layerFactory.generateLayerFromCSWRecord(cswRecord);

                cswRecord.set('layer', newLayer);

                //Configure it
                this._configureLayer(newLayer, serializedLayer.filter, serializedLayer.visible);
                layersToAdd.push(newLayer);

                if(serializedLayer.customlayer){
                    cswRecord.set('customlayer', true);
                    var tabpanel =  Ext.getCmp('auscope-tabs-panel');
                    var customPanel = tabpanel.getComponent('org-auscope-custom-record-panel');
                    tabpanel.setActiveTab(customPanel);
                    customPanel.getStore().insert(0,cswRecord);
                }
            } else if (serializedLayer.source === 'search') {
                //Configure it
                this._configureLayer(serializedLayer, serializedLayer.filter, serializedLayer.visible);
                layersToAdd.push(newLayer);
            }
        }

        if (layersToAdd.length > 0)
        {
            var restoreMsg = Ext.MessageBox.show({
                title: '<p style="font-size:140%;margin:0em;">Restoring map to its previous state...</p>',
                msg: '<b><h1 style="margin:0em;">Please wait...</h2></b><br>' +
                     '<p style="font-size:140%;margin:0em;">Restoring <b>Featured Layers</b> to your map</p><br>' +
                     '<p style="font-size:140%;margin:0em;">Click "CLEAR MAP" to start with an empty map</p>'
            });

            setTimeout(function(){
                restoreMsg.close();
            }, 7000);
        }

        //Add the layers to the internal store
        ActiveLayerManager.addLayers(layersToAdd);
    },
});
