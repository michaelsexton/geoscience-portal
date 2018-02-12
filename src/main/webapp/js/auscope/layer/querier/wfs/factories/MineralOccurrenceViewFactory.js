/**
 * A factory for parsing a erl:MineralOccurrenceView element.
 */

Ext.define('auscope.layer.querier.wfs.factories.MineralOccurrenceViewFactory', {
    extend: 'portal.layer.querier.wfs.factories.BaseFactory',
    
    constructor : function(cfg) {
        this.callParent(arguments);
    },
    
    supportsNode : function(domNode) {
        return domNode.namespaceURI === this.XMLNS_ERL &&
               portal.util.xml.SimpleDOM.getNodeLocalName(domNode) === 'MineralOccurrenceView';
    },
    
    
    parseNode : function(domNode, wfsUrl) {
        var bf = this;

        var gmlId = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, '@gml:id');

        var identifier = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:identifier');
        var name = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:name');
        
        var mineralOccurrenceType = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:mineralOccurrenceType');
        var mineralOccurrenceType_uri = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:mineralOccurrenceType_uri');
        var commodity = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:commodity');
        
        var mineName = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:mineName');
        var mine_uri = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:mine_uri');
        
        var geologicHistory = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:geologicHistory');
        var representativeAge_uri = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:representativeAge_uri');
        
        var positionalAccuracy = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:positionalAccuracy');
        
        
        var specification_uri = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:specification_uri');
      
        //Build our component
        return Ext.create('portal.layer.querier.BaseComponent', {
            border : false,
            tabTitle : name,
            layout : 'fit',
            items : [{
                xtype : 'fieldset',
                title : 'Mineral Deposits',
                margin : '0 20 0 0',
                autoScroll : true,
                items : [{
                    xtype : 'displayfield',
                    fieldLabel : 'Name',
                    value : this._makeGeneralPopupHtml(identifier, name, 'Click here for the metadata record for the Borehole')
                },{
                    xtype : 'displayfield',
                    fieldLabel : 'Type',
                    value : this._makeGeneralPopupHtml(mineralOccurrenceType_uri, mineralOccurrenceType, 'Click here for the metadata record for the Borehole')
                },{
                    xtype : 'displayfield',
                    fieldLabel : 'Commodities',
                    value : commodity
                },{
                    xtype : 'displayfield',
                    fieldLabel : 'Mine',
                    value : this._makeGeneralPopupHtml(mine_uri, mineName, 'Click here for the metadata record for the Borehole')
                },{
                    xtype : 'displayfield',
                    fieldLabel : 'Geologic History',
                    value : this._makeGeneralPopupHtml(representativeAge_uri, geologicHistory, 'Click here for the metadata record for the Borehole')
                },{
                    xtype : 'displayfield',
                    fieldLabel : 'Specification',
                    value : this._makeGeneralPopupHtml(specification_uri, "Click for resources and full specification", 'Click here for more information about this feature.')
                }]
            }]
           
        });
        
        
    }
});