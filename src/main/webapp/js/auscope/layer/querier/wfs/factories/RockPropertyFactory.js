
Ext.define('auscope.layer.querier.wfs.factories.RockPropertyFactory', {
	extend : 'portal.layer.querier.wfs.factories.BaseFactory',

	XMLNS_RP : 'http://www.ga.gov.au/geophysics-rockpropertypub-gws/ga_rock_properties_wms/',
	
	ROCKPROPS : ['chargeability','bulk_density','electrical_conductivity','electrical_resistivity',
	             'gamma_bulk_density','koenigsberger_ratio','magnetic_susceptibility','natural_gamma',
	             'porosity','remanent_magnetisation','sonic_velocity','temperature'],
	
	constructor : function(cfg) {
		this.callParent(arguments);
	},
	
	supportsNode : function(domNode) {
	    var hasLocalName = false;
	    for (i=0; i < this.ROCKPROPS.length; i++) {
	        hasLocalName = (portal.util.xml.SimpleDOM.getNodeLocalName(domNode) === this.ROCKPROPS[i]) ? true : hasLocalName;
	    }
		return domNode.namespaceURI = this.XMLNS_RP && hasLocalName;
	},
	
	parseNode : function(domNode, wfsUrl) {
        var bf = this;

        var title = 'Rock Properties - '+ Ext.String.capitalize(portal.util.xml.SimpleDOM.getNodeLocalName(domNode));
        
        var gmlId = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, '@gml:id');
        
        var samplingFeatureNumber = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:SAMPLINGFEATURENO');
        var samplingFeatureName = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:SAMPLINGFEATURENAME');
        var samplingFeatureType = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:SAMPLINGFEATURETYPE');
        var sampleNumber = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:SAMPLENO');
        
        var sampleName = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:SAMPLENAME');
        var sampleType = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:SAMPLETYPE');
        var property = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:PROPERTY');
        var value = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:VALUE');
        
        var unitOfMeasure = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:UNITOFMEASURE');
        var resultQualifier = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:RESULTQUALIFIER');
        var uncertaintyUnitOfMeasure = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:UNCERTAINTYUOM');
        var uncertaintyType = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:UNCERTAINTYTYPE');
        
        var stratigraphicUnitName = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:STRATIGRAPHICUNITNAME');
        var provinceName = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:PROVINCENAME');
        var materialClass = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:MATERIALCLASS');
        var lithologyGroup = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:LITHOLOGYGROUP');
        
        var lithology = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:LITHOLOGY');
        var sampleLongitude = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:SAMPLE_LONGITUDE');
        var sampleLatitude = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:SAMPLE_LATITUDE');
        var sampleElevation = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:SAMPLE_ELEVATION');
        
        var instrument = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:INSTRUMENT');
        var sourceType = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:SOURCETYPE');
        var source = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:SOURCE');
        var resultId = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:RESULTID');
      
        return Ext.create('portal.layer.querier.BaseComponent', {
            border : false,
            tabTitle: gmlId,
            layout : 'fit',
            items : [{
                xtype : 'fieldset',
                title : title,
                labelWidth : 75,
                autoScroll : true,
                items : [{
                    xtype : 'displayfield',
                    fieldLabel : 'Sampling Feature Number',
                    value : samplingFeatureNumber
                },{
                    xtype : 'displayfield',
                    fieldLabel : 'Sampling Feature Name',
                    value : samplingFeatureName
                },{
                    xtype : 'displayfield',
                    fieldLabel : 'Sampling Feature Type',
                    value : samplingFeatureType
                },{
                    xtype : 'displayfield',
                    fieldLabel : 'Sample Number',
                    value : sampleNumber
                },{
                    xtype : 'displayfield',
                    fieldLabel : 'Sample Name',
                    value : sampleName
                },{
                    xtype : 'displayfield',
                    fieldLabel : 'Instrument',
                    value : instrument
                }]
            }],
            buttonAlign : 'right',
            buttons : [{
                text : 'Download Feature',
                iconCls : 'download',
                handler : function() {
                    var getXmlUrl = bf._makeFeatureRequestUrl(wfsUrl, domNode.nodeName, gmlId);
                    portal.util.FileDownloader.downloadFile('downloadGMLAsZip.do',{
                        serviceUrls : getXmlUrl
                    });
                }
            }]
        });
	}
})
