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
                title: 'Restoring map to its previous state...',
                msg: 'Please wait... Restoring Featured Layers to your map. Custom Layers will not be reloaded. Click "CLEAR MAP" to start with an empty map.'
            });

            setTimeout(function(){
                restoreMsg.close();
            }, 3000);
         }

        this.callParent(arguments);
    },
});
