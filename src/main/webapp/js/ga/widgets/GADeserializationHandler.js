Ext.define('ga.widgets.GADeserializationHandler', {
    extend : 'portal.util.permalink.DeserializationHandler',
    alias: 'widget.gadeserializationhandler',

    constructor : function(cfg) {
        this.callParent(arguments);
    },

    _deserialize : function() {
        var featureLayers = this._getLayersToAdd();

        if (this.mapStateSerializer.serializedLayers.length > 0)
        {
            var restoreMsg =  '<p>Restore featured map layers from your previous<br/>' +
                     'session?</p>' +
                     '<p><b>NOTE</b>: ASTER maps have been temporarily removed <br />' +
                     'from this Portal due to service problems. ASTER data <br />' +
                     'are still available through the <a href="http://portal.auscope.org/">AuScope Research Portal</a>.</p>';

            Ext.MessageBox.confirm('Restoring Map Layers', restoreMsg, function(btn) {
                if (btn === 'yes') {
                    ActiveLayerManager.addLayers(featureLayers);
                } else {
                    this.mapStateSerializer.clear();
                }
            }, this);

    }
});
