/**
 * A factory for parsing a erl:MineeView element.
 */

Ext.define('auscope.layer.querier.wfs.factories.MineViewFactory', {
   extend: 'portal.layer.querier.wfs.factories.BaseFactory',
   
   constructor : function(cfg) {
       this.callParent(arguments);
   },
   
   supportsNode : function(domNode) {
       return domNode.namespaceURI === this.XMLNS_ERL &&
              portal.util.xml.SimpleDOM.getNodeLocalName(domNode) === 'MineView';
   },
   
   parseNode : function(domNode, wfsUrl) {
       var bf = this;
       
       var gmlId = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, '@gml:id');

       var identifier = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:identifier');
       var name = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:name');
       
       var status = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:status');
       var owner = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:owner');
       var source = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:source');
       
       var observationMethod = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:observationMethod');
       var positionalAccuracy = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:positionalAccuracy');
      
       var status_uri = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:status_uri');
       var specification_uri = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:specification_uri');
   
   
   //Build our component
       return Ext.create('portal.layer.querier.BaseComponent', {
           border : false,
           tabTitle : name,
           layout : 'fit',
           items : [{
               xtype : 'fieldset',
               title : 'Mines (New)',
               margin : '0 20 0 0',
               autoScroll : true,
               items : [{
                   xtype : 'displayfield',
                   fieldLabel : 'Name',
                   value : this._makeGeneralPopupHtml(identifier, name, 'Click here for the metadata record for the Mines')
               },{
                   xtype : 'displayfield',
                   fieldLabel : 'Operating Status',
                   value : this._makeGeneralPopupHtml(status_uri, status, 'Click here for the information about mine statuses')
               },{
                   xtype : 'displayfield',
                   fieldLabel : 'Source / Owner',
                   value : this._makeGeneralPopupHtml(source, owner, 'Click here to get further information for source or owner of this mine')
               },{
                   xtype : 'displayfield',
                   fieldLabel : 'Specification',
                   value : this._makeGeneralPopupHtml(specification_uri, "Click for full specification", 'Click here for more information about this feature.')
               }]
           }]
       });
   }

});