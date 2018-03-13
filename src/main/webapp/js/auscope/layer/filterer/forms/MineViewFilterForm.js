Ext.define('auscope.layer.filterer.forms.MineViewFilterForm', {
    extend: 'portal.layer.filterer.BaseFilterForm',
    
    constructor: function(config) {

        var cswRecords = config.layer.get('cswRecords');


        var adminAreasMap = {};
        for (var i = 0; i < cswRecords.length; i++) {
            var adminArea = cswRecords[i].get('adminArea');
            if (adminArea === 'ACT') {
                adminArea = cswRecords[i].get('contactOrg')
            }
            var allOnlineResources = cswRecords[i].get('onlineResources');
            var mineWFSOnlineResources = portal.csw.OnlineResource.getFilteredFromArray(allOnlineResources,
                portal.csw.OnlineResource.WFS, 'erl:MineView');

            for (var j = 0; j < mineWFSOnlineResources.length; j++) {
                if (adminAreasMap[adminArea]) {
                    adminAreasMap[adminArea].push(mineWFSOnlineResources[j].get('url'));
                } else {
                    adminAreasMap[adminArea] = [mineWFSOnlineResources[j].get('url')];
                }
            }
        }

        //Set up a list of each unique admin area
        var adminAreasList = [];
        for(key in adminAreasMap){
            adminAreasList.push({
                displayText : key,
                serviceFilter : adminAreasMap[key]
            });
        }

        var adminAreasStore = Ext.create('Ext.data.Store', {
            fields: ['displayText', 'serviceFilter'],
            data : adminAreasList
        });
        
        var mineStatusStore = Ext.create('Ext.data.Store', {
            fields : ['urn', 'label'],
            proxy : {
                type : 'ajax',
                url : 'getAllMineStatuses.do',
                reader : {
                    type : 'array',
                    rootProperty : 'data'
                }
            },
            sorters : [{
                property : 'label',
                direction : 'ASC'
            }]
        })
        
        Ext.apply(config, {
            delayedFormLoading: true, //we won't be ready until our commodity store is loaded - therefore we have to fire formloaded when ready
            border: false,
            autoScroll: true,
            hideMode: 'offsets',
            labelAlign: 'right',
            bodyStyle: 'padding:5px',
            autoHeight: true,
            layout: 'anchor',
            items: [{
                xtype: 'fieldset',
                title: '<span data-qtip="Please enter the filter constraints then hit \'Apply Filter\'">' +
                          'Filter data' +
                       '</span>',
                autoHeight: true,
                labelAlign: 'right',
                bodyStyle: 'padding:0px',
                items :[{
                    xtype: 'textfield',
                    anchor: '100%',
                    itemId: 'name-field',
                    fieldLabel: '<span data-qtip="Wildcards: \'!\' escape character; \'*\' zero or more, \'#\' just one character.">' + 'Name',
                    name: 'name'
                },{
                    xtype : 'combo',
                    anchor: '100%',
                    name: 'statusUri',
                    fieldLabel: '<span data-qtip="Please select a commodity from the Operating Status Vocabulary. Powered by SISSVoc">' + 'Operating Status' + '</span>',
                    forceSelection: false,
                    queryMode: 'local',
                    store: mineStatusStore,
                    triggerAction: 'all',
                    typeAhead: true,
                    typeAheadDelay: 500,
                    displayField:'label',   
                    valueField:'urn'
                },{
                    xtype: 'combo',
                    anchor: '100%',
                    itemId: 'serviceFilter-field',
                    fieldLabel: 'Provider',
                    name: 'serviceFilter',
                    typeAhead: true,
                    triggerAction: 'all',
                    lazyRender:true,
                    mode: 'local',
                    store: adminAreasStore,
                    valueField: 'serviceFilter',
                    displayField: 'displayText',
                    hiddenName: 'serviceFilter'
                }]
            }]
        });
        
        this.callParent(arguments);

        var callingInstance = this;
        
        mineStatusStore.load( {
            callback : function() {
                //It's very important that once all of our stores are loaded we fire the formloaded event
                //because we are setting the delayedFormLoading parameter to true in our constructor
                callingInstance.setIsFormLoaded(true);
                callingInstance.fireEvent('formloaded');
            }
        });
 
    }
})