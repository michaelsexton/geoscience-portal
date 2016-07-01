Ext.define('ga.widgets.GADeserializationHandler', {
    extend : 'portal.util.permalink.DeserializationHandler',
    alias: 'widget.gadeserializationhandler',

    constructor : function(cfg) {
        this.callParent(arguments);
    },

    _deserialize : function() {
        if (this.mapStateSerializer.serializedLayers.length > 0)
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

        this.callParent(arguments);
    },
});
