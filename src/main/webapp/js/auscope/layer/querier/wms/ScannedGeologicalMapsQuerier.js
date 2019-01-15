/**
 * Sub-Class for making and then parsing a WMS request/response for WMSGetFeatureRequests on Geological Maps / Scanned 250K Geological Map index.
 * Then render each field in a tab in the panel / window.
 */
Ext.define('portal.layer.querier.wms.ScannedGeologicalMapsQuerier', {
    extend: 'portal.layer.querier.wms.WMSMultipleTabDisplayQuerier',

    constructor: function(config){
        this.callParent(arguments);
    },

    getFieldNameMappingMap : function() {
        var fieldNameMappingMap = {
                qmapid: "1:250K Map ID",
                qmapname: "1:250K Tile Name",
                edition: "Edition",
                pubyear: "Publication Year",
                locn125: "View / Download Map image 125dpi",
                locn250: "View / Download Map image 250dpi",
                label: "Map Title"
        };
        return fieldNameMappingMap;
    },
    
    getTabTitleMappedName : function() {
        return 'Map Title';
    },
    
    populateFeatureFieldsDisplayArray : function(featureFieldsArray, featureFieldsDisplayArray) {
        for (var i = 0; i < featureFieldsArray.length; i++) {
            var record = {};
            var order = []; // Order want to retrieve field from record map
            record['order'] = order;
            featureFieldsDisplayArray.push(record);

            var tile = featureFieldsArray[i];
            
            var mapTitle = this._lookupTileData(tile, "label");
            record[mapTitle[0]] = mapTitle[1];
            order.push(mapTitle[0]);

            var mapId = this._lookupTileData(tile, "qmapid");
            record[mapId[0]] = mapId[1];
            order.push(mapId[0]);
            
            var tileName = this._lookupTileData(tile, "qmapname");
            record[tileName[0]] = tileName[1];
            order.push(tileName[0]);
            
            var edition = this._lookupTileData(tile, "edition");
            record[edition[0]] = edition[1];
            order.push(edition[0]);
            
            var pubYear = this._lookupTileData(tile, "pubyear");
            record[pubYear[0]] = pubYear[1];
            order.push(pubYear[0]);
            
            var pubAgency = "";
            if (tile.data['agency1']) {
                pubAgency = tile.data['agency1'];
            }
            if (tile.data['agency2']) {
                if (pubAgency.size > 0) {
                    pubAgency += ", ";
                } 
                pubAgency += tile.data['agency2'];
            }
            record["Publishing Agency"] = pubAgency;
            order.push("Publishing Agency");
            
            var location125 = this._lookupTileData(tile, "locn125");
            record[location125[0]] = location125[1];
            order.push(location125[0]);
            
            var location250 = this._lookupTileData(tile, "locn250");
            record[location250[0]] = location250[1];
            order.push(location250[0]);
        }
    },
    
    _lookupTileData : function(featureFields, fieldName) {
        return [this._fieldNameMapping(fieldName), featureFields.data[fieldName]];
    }
});