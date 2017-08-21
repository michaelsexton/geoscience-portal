/**
 * This is the GA portal footer.
 * It contains the logos of the state and federal agencies that contributed to the portal. 
 */
Ext.define('ga.widgets.GAFooter', {
    extend : 'Ext.panel.Panel',
    alias: 'widget.gafooter',

    constructor : function(config){   
        Ext.apply(config, {
            items: [{
                xtype : 'panel',
                id: 'footer-container',
                left: '3px',
                right: '3px',
                layout: 'vbox',
                items : [
                    {
                        xtype : 'container',
                        width: '100%',
                        layout : 'hbox',
                        id: 'footer-top',
                        items :[
                        {
                            xtype: 'component',
                            html: 'AUSGIN - Australian Geoscience Information Network'
                        },
                        {
                            xtype: 'container',
                            flex: 1
                        },
                        {
                            id: 'sponsor-link-2',
                            xtype: 'box',
                            height: '30px',
                            autoEl: {
                                tag : 'span',
                                id : "auscope_attrib",
                                html : 'Powered by <a href="//www.auscope.org.au/" target="_blank"><img src="img/logos/AuScope-pic.png" alt="link to Auscope partner"/>AuScope</a>'
                            }
                        }
                        ]
                    },
                    {
                        xtype: 'panel',
                        width: '100%',
                        layout: 'column',
                        items :[
                    {
                    xtype : 'box',
                    columnWidth: .125,
                    autoEl : {
                            tag : 'span',
                            html: '<a href="http://www.ga.gov.au/" target="_blank"  title="Australian Government - Geoscience Australia"><img alt="Geoscience Australia Logo" src="img/logos/ga.jpg"/></a>'   
                        }
                    },{
                        xtype : 'box',
                        columnWidth: .125,
                        autoEl : {
                            tag : 'span',
                            html: '<a href="http://www.resourcesandenergy.nsw.gov.au/" target="_blank"  title="Resources and Energy"><img alt="NSW Trade and Investment Resources and Energy Logo" src="img/logos/nsw.jpg"/></a>'        
                        }
                    },{
                        xtype : 'box',
                        columnWidth: .125,
                        autoEl : {
                            tag : 'span',
                            html: '<a href="https://www.dnrm.qld.gov.au/mining" target="_blank"  title="Queensland Government"><img alt="Queensland Government Logo" src="img/logos/qld.jpg"/></a>'                  
                        }
                    },{
                        xtype : 'box',
                        columnWidth: .1,
                        autoEl : {
                            tag : 'span',
                            html: '<a href="http://www.mrt.tas.gov.au/portal/home" target="_blank"  title="Tasmanian Government"><img alt="Mineral Resources Tasmania Logo" src="img/logos/tas.jpg"/></a>'                  
                        }
                    },{
                        xtype : 'box',
                        columnWidth: .1,
                        autoEl : {
                            tag : 'span',
                            html: '<a href="http://www.nt.gov.au/d/Minerals_Energy/" target="_blank"  title="Northern Territory Government"><img alt="Northern Territory Government Logo" src="img/logos/nt.jpg"/></a>'                  
                        }
                    },{
                        xtype : 'box',
                        columnWidth: .08,
                        autoEl : {
                            tag : 'span',
                            html: '<a href="http://www.energyandresources.vic.gov.au/earth-resources" target="_blank"  title="Victoria State Government"><img alt="Victorian Department of State Development Business and Innovation Logo" src="img/logos/vic.jpg"/></a>'                  
                        }
                    },{
                        xtype : 'box',
                        columnWidth: .13,
                        autoEl : {
                            tag : 'span',
                            html: '<a href="http://minerals.statedevelopment.sa.gov.au/" target="_blank"  title="Government of South Australia"><img alt="South Australia Department of Manufacturing, Innovation, Trade, Resources and Energy Logo" src="img/logos/sa.jpg"/></a>'                  
                        }
                    },{
                        xtype : 'box',
                        columnWidth: .17,
                        autoEl : {
                            tag : 'span',
                            html: '<a href="http://www.dmp.wa.gov.au/index.aspx" target="_blank"  title="Department of Mines and Petroleum"><img alt="Western Australia Department of Mines and Petroleum Logo" src="img/logos/wa.jpg"/></a>'                  
                        }
                    }]}]
                }]
            
            });
        
            this.callParent(arguments);
        
        }
});