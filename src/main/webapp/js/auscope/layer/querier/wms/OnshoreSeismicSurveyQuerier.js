Ext.define('portal.layer.querier.wms.OnshoreSeismicSurveyQuerier', {
        extend : 'portal.layer.querier.wms.WMSQuerier',

        responseFields : ["uri", "surveyNo", "surveyName", "lineName", "state", "year", "url", "urlNci"],
        
        constructor : function(config) {
            this.callParent(arguments);
        }, 
        
        /**
         * Parse the response and retrieve the CSWRecord for that point.
         */
         _displaySeismicSurveyData : function(doc,queryTarget,callback) {
             var cswUrl = this._getFieldValue(doc,"url");
             
             if (!cswUrl) {
                 callback(this, [], queryTarget);
             }
             
             var cswRecordStore = Ext.create('Ext.data.Store', {
                 id:'seismicCSWRecordStore',
                 autoLoad: false,
                 model : 'portal.csw.CSWRecord',
                 proxy: {
                     type: 'ajax',
                     url: 'getSeismicCSWRecord.do',
                     extraParams: {
                         serviceUrl : cswUrl
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
                         callback(this, [this._fallbackWMSPanel(doc)], queryTarget);
                     }
                 }
             });
         },

         /**
          *  Extracts given field value from the DOM document
          */
         _getFieldValue : function(doc, field) {
             var fieldValue;
             
             //VT: The default namespace is causing alot of grief in IE cause javeline xpath is unable to handle complex xpath.
             if (doc.querySelector) {
                 //VT: IE's version of selectSingleNode is querySelector.
                 if (doc.querySelector('FeatureInfoResponse').querySelector('FIELDS')) {
                     fieldValue = doc.querySelector('FeatureInfoResponse').querySelector('FIELDS').getAttribute(field);
                 }
             } else {
                 fieldValue = portal.util.xml.SimpleXPath.evaluateXPathString(doc.childNodes[0], "//*[local-name()='FIELDS']/@"+field);
             }
             return fieldValue;  
         },
         
         /**
          *  Function to provide basic WMS GetFeatureInfo data from the Onshore Seismic Surveys
          *  service in case of architectural changes to GA's eCat and other metadata catalogs.
          *  So long as the service is running, this will display a minimum set of data to the user.
          */
         _fallbackWMSPanel : function(doc) {
             var me = this;
             var fieldItems = {};
             Ext.each(this.responseFields, function(field) {
                 fieldItems[field] = me._getFieldValue(doc, field);
             });                   
                     
                     
             return Ext.create('portal.layer.querier.BaseComponent', {
                 border : false,
                 tabTitle: name,
                 layout : 'fit',
                 items : [{
                     xtype : 'fieldset',
                     title : 'Onshore Seismic Surveys',
                     labelWidth : 75,
                     autoScroll : true,
                     items : [{
                         xtype : 'displayfield',
                         fieldLabel : 'Survey Name',
                         value : fieldItems["surveyName"]
                     },{
                         xtype : 'displayfield',
                         fieldLabel : 'Survey Number',
                         value : fieldItems["surveyNo"]
                     },{
                         xtype : 'displayfield',
                         fieldLabel : 'Line Name',
                         value : fieldItems["lineName"]
                     },{
                         xtype : 'displayfield',
                         fieldLabel : 'State',
                         value : fieldItems["state"]
                     },{
                         xtype : 'displayfield',
                         fieldLabel : 'Year',
                         value : fieldItems["year"]
                     },{
                         xtype : 'displayfield',
                         fieldLabel : 'URL',
                         value : '<a href="'+fieldItems["url"]+'" target="_blank">'+fieldItems["url"]+'</a>'
                     }]
                 }]
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
                         this._displaySeismicSurveyData(domDoc,queryTarget,callback);
                     }else{
                         callback(this, [this.generateErrorComponent('There was an error when attempting to contact the remote WMS instance for information about this point.')], queryTarget);
                     }

                 }
             });
         }
});