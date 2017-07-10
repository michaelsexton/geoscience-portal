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
               title : 'Mines (Geoscience Australia)',
               margin : '0 20 0 0',
               autoScroll : true,
               items : [{
                   xtype : 'displayfield',
                   fieldLabel : 'Name',
                   value : this._pidResolver(identifier, name, 'Click here for the metadata record for the Mines')
               },{
                   xtype : 'displayfield',
                   fieldLabel : 'Operating Status',
                   value : this._makeGeneralPopupHtml(status_uri, status, 'Click here for the metadata record for the Borehole')
               },{
                   xtype : 'displayfield',
                   fieldLabel : 'Owner',
                   value : this._makeGeneralPopupHtml(source, owner, 'Click here for the metadata record for the Borehole')
               },{
                   xtype : 'displayfield',
                   fieldLabel : 'Specification',
                   value : this._pidResolver(specification_uri, "Click for resources and full specification", 'Click here for more information about this feature.')
               }]
           }]
       });
   },
   
   _pidResolver : function(pidUri, text, comment) {
       
       var outputFormatLookup = {
               'er' : 'gml32',
               'erl' : 'gml3'
       }
       
       var typeNameLookup ={
               'mineview' : 'MineView',
               'mine' : 'Mine',
       }
       
       fragment = 'http://pid.geoscience.gov.au/feature/ga/';
       if (pidUri.startsWith('http://pid.geoscience.gov.au/feature/ga/')){
           partialString = pidUri.replace(fragment,'');
           partials=partialString.split('/')
           featureType = partials[0] + ':' + typeNameLookup[partials[1]];
           featureId = 'ga';
           for (i = 0; i < partials.length ; i++) {
               featureId = featureId + '.' + partials[i]
           }
           outputFormat = outputFormatLookup[partials[0]]
           wfsUri = 'http://services.ga.gov.au/earthresource/ows?service=WFS&version=1.1.0&request=GetFeature&typeName={0}&featureId={1}&outputFormat={2}';
           resolvedUri = Ext.String.format(wfsUri, featureType, featureId, outputFormat);          
           return this._makeGeneralPopupHtml(resolvedUri, text, comment);
       } else {
           return text;
       }       
   }
});