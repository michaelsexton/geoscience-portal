Ext.define('portal.layer.querier.wms.OnshoreSeismicSurveyQuerier', {
        extend : 'portal.layer.querier.wms.WMSQuerier',

        GETRECORDSSUBSTRING : "https://ecat.ga.gov.au/geonetwork/srv/eng/csw?service=CSW&request=GetRecords&version=2.0.2&outputSchema=http://www.isotc211.org/2005/gmd&constraintLanguage=CQL_TEXT&constraint_language_version=1.1.0&typeNames=csw:Record&elementSetName=full&resultType=results&constraint=AlternateIdentifier+EQ+",
        METADATASUBSTRING : "http://www.ga.gov.au/metadata-gateway/metadata/record/gcat_",
        
        constructor : function(config) {
            this.callParent(arguments);
        }, 
        

        _transformCSWUrl : function(cswrecordurl) {
            var recordNumber = cswrecordurl.replace(this.METADATASUBSTRING,"");
            return this.GETRECORDSSUBSTRING + recordNumber;
        },
        
        /**
         * Parse the response and retrieve the CSWRecord for that point.
         */
         _getCSWRecord : function(cswrecordurl,queryTarget,callback) {

             var cswRecordStore = Ext.create('Ext.data.Store', {
                 id:'seismicCSWRecordStore',
                 autoLoad: false,
                 model : 'portal.csw.CSWRecord',
                 proxy: {
                     type: 'ajax',
                     url: 'getSeismicCSWRecord.do',
                     extraParams: {
                         serviceUrl : cswrecordurl
                     },
                     reader: {
                         type: 'json',
                         rootProperty: 'data',
                         successProperty: 'success',
                         totalProperty: 'totalResults'
                     }

                 }

             });

             cswRecordStore.load({
                 scope: this,
                 callback: function(records, operation, success) {
                     if(success){
                         var panel = Ext.create('portal.layer.querier.BaseComponent', {
                             border : false,
                             autoScroll : true,
                             items : [{
                                 xtype : 'cswmetadatapanel',
                                 border : false,
                                 cswRecord : records[0]
                             }]
                         });

                         callback(this, [panel], queryTarget);
                     }else{
                         callback(this, [this.generateErrorComponent('There was an error when attempting to contact the remote WMS instance for information about this point.')], queryTarget);
                     }
                 }
             });
         },

         /**
          * See parent class for definition
          *
          * Makes a WMS request, waits for the response and then parses it passing the results to callback
          */
         query : function(queryTarget, callback) {
             var proxyUrl = this.generateWmsProxyQuery(queryTarget, 'text/xml');
             Ext.Ajax.request({
                 url : proxyUrl,
                 timeout : 180000,
                 scope : this,
                 callback : function(options, success, response) {
                     if (success) {
                         var xmlResponse = response.responseText;
                         var domDoc = portal.util.xml.SimpleDOM.parseStringToDOM(xmlResponse);
                         //VT: The default namespace is causing alot of grief in IE cause javeline xpath is unable to handle complex xpath.
                         if(domDoc.querySelector){
                             //VT: IE's version of selectSingleNode is querySelector.
                             if(domDoc.querySelector('FeatureInfoResponse').querySelector('FIELDS')){
                                 var cswUrl = domDoc.querySelector('FeatureInfoResponse').querySelector('FIELDS').getAttribute('url');
                             }else{
                                 callback(this,[],queryTarget);
                                 return;
                             }
                         }else{
                             var cswUrl = portal.util.xml.SimpleXPath.evaluateXPathString(domDoc.childNodes[0], "//*[local-name()='FIELDS']/@url");
                         }

                         cswUrl = this._transformCSWUrl(cswUrl);
                         this._getCSWRecord(cswUrl,queryTarget,callback);
                     }else{
                         callback(this, [this.generateErrorComponent('There was an error when attempting to contact the remote WMS instance for information about this point.')], queryTarget);
                     }

                 }
             });
         }
});