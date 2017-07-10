/**
 * A factory for parsing a CommodityResourceView element.
 */

Ext.define('auscope.layer.querier.wfs.factories.CommodityResourceViewFactory', {
    extend: 'portal.layer.querier.wfs.factories.BaseFactory',
    
    constructor : function(cfg) {
        this.callParent(arguments);
    },
    
    supportsNode : function(domNode) {
        return domNode.namespaceURI === this.XMLNS_ERL &&
               portal.util.xml.SimpleDOM.getNodeLocalName(domNode) === 'CommodityResourceView';
    },
    
    
    parseNode : function(domNode, wfsUrl) {
        var bf = this;

        var gmlId = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, '@gml:id');

        var identifier = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:identifier');
        
        var commodity = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:commodity');
        var commodityClassifier_uri = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:commodityClassifier_uri');
        
        var mineralOccurrenceName = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:mineralOccurrenceName');
        var mineralOccurrence_uri = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:mineralOccurrence_uri');
        
        var totalResources = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:totalResources');
        var resourcesCategory = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:resourcesCategory');
        var resourcesCategory_uri = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:resourcesCategory_uri');
        
        var totalReserves = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:totalReserves');
        var reservesCategory = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:reservesCategory');
        var reservesCategory_uri = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:reservesCategory_uri');
        
        var classificationMethodUsed = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:classificationMethodUsed');
        var classificationMethodUsed_uri = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:classificationMethodUsed_uri');
        
        var totalEndowment = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:totalEndowment');
       
        var mineName = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:mineName');
        var mine_uri = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:mine_uri');
        
        var coordinates = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:shape/gml:Point/gml:pos');
        var positionalAccuracy = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:positionalAccuracy');
        
        var specification_uri = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'erl:specification_uri');
      
        var name = this._generateCommodityResourceName(mineralOccurrenceName, commodity, reservesCategory, resourcesCategory, totalEndowment);
        
        
        /* Initial items for display - required */
        var displayItems = [{
                xtype : 'displayfield',
                fieldLabel : 'Name',
                value : this._pidResolver(identifier, name, 'Click here for the metadata record for the Borehole')
            },{
                xtype : 'displayfield',
                fieldLabel : 'Commodity',
                value : this._makeGeneralPopupHtml(commodityClassifier_uri, commodity, 'Click here for the metadata record for the Borehole')
            },{
                xtype : 'displayfield',
                fieldLabel : 'Mineral Occurrence',
                value : this._pidResolver(mineralOccurrence_uri, mineralOccurrenceName, 'Click here for the metadata record for the Borehole')
            }];
        
        
        if (totalResources) {
            var resourceItems = [{
                    xtype : 'displayfield',
                    fieldLabel : 'Resources',
                    value : totalResources
                },{
                    xtype : 'displayfield',
                    fieldLabel : 'Resources Category',
                    value : this._makeGeneralPopupHtml(resourcesCategory_uri, resourcesCategory, 'Click here for the metadata record for the Borehole')
                }];
            displayItems = displayItems.concat(resourceItems);
        }
        
        if (totalReserves) {
            var reserveItems = [{
                xtype : 'displayfield',
                fieldLabel : 'Reserves',
                value : totalReserves
            },{
                xtype : 'displayfield',
                fieldLabel : 'Resources Category',
                value : this._makeGeneralPopupHtml(reservesCategory_uri, reservesCategory, 'Click here for the metadata record for the Borehole')
            }];
            displayItems = displayItems.concat(reserveItems);
        }
        
        if (totalResources || totalReserves) {
            displayItems.push({
                xtype : 'displayfield',
                fieldLabel : 'Classification Method',
                value : this._makeGeneralPopupHtml(classificationMethodUsed_uri, classificationMethodUsed, 'Click here for the metadata record for the Borehole')
            });
        }
        
        if (totalEndowment) {
            displayItems.push({
                xtype : 'displayfield',
                fieldLabel : 'Total Deposit Endowment',
                value : totalEndowment
            });
        }
        
        if (mineName) {
            displayItems.push({
                xtype : 'displayfield',
                fieldLabel : 'Mine',
                value : this._pidResolver(mine_uri, mineName, 'Click here for the metadata record for the Borehole')
            });
        }
        
        /* Add final items*/
        displayItems = displayItems.concat([{
            xtype : 'displayfield',
            fieldLabel : 'Location',
            value : coordinates
        },{
            xtype : 'displayfield',
            fieldLabel : 'Specification',
            value : this._pidResolver(specification_uri, "Click for resources and full specification", 'Click here for more information about this feature.')
        }
        ]);
        
        //Build our component
        return Ext.create('portal.layer.querier.BaseComponent', {
            border : false,
            tabTitle : name,
            layout : 'fit',
            items : [{
                xtype : 'fieldset',
                title : 'Mineral Resources and Reserves',
                margin : '0 20 0 0',
                autoScroll : true,
                items : displayItems
            }]
           
        });
        
        
    },
    
    /* Creates a reference name for the Commodity Resource according to what data returns*/
    
    _generateCommodityResourceName : function(mineralOccurrenceName, commodity, reservesCategory, resourcesCategory, totalEndowment) {
        if (totalEndowment) {
            return Ext.String.format('{0} ({1} - endowment)',mineralOccurrenceName, commodity);
        }
        if (reservesCategory || resourcesCategory) {
            return Ext.String.format('{0} ({1} - {2})',mineralOccurrenceName, commodity, reservesCategory || resourcesCategory);
        } 
        return Ext.String.format('{0} ({1})',mineralOccurrenceName, commodity);
    },
    
    /*
     * Resolves PIDs that don't actually have a PID service behind them
     * 
     * */
    
    _pidResolver : function(pidUri, text, comment) {
        
        var outputFormatLookup = {
                'er' : 'gml32',
                'erl' : 'gml3'
        }
        
        var typeNameLookup ={
                'mineraloccurrenceview' : 'MineralOccurrenceView',
                'commodityresourceview' : 'CommodityResourceView',
                'mine' : 'Mine',
                'mineraloccurrence' : 'MineralOccurrence',
                'commodity' : 'Commodity'
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