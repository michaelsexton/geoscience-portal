/**
 * layerSearchCtrl class handles searching layers based on user keywords
 * @module controllers
 * @class layerSearchCtrl
 * 
 */
allControllers.controller('layerSearchCtrl', ['$scope', 'GetCSWRecordService', function ($scope,GetCSWRecordService) {
    
    $scope.showClearGlyph=false;
    /**
     * This is triggered after the user types inside the search text field and press enter.
     * It will search through all known layers CSW records name and description that matches the keywords.
     * It will then show the layer panel with search results or all layers if no keyword is entered.
     * @method submit
     */
    this.submit = function() {
        // search layers that matches keywords and flag them
        GetCSWRecordService.searchLayers($scope.keywords); 
        $scope.showClearGlyph=true;      
    }; 
    
    /**
     * This will clear all search selection
     * @method submit
     */
    this.clear = function() {
        // search layers that matches keywords and flag them
        $scope.keywords ="";
        GetCSWRecordService.searchLayers("");
        $scope.showClearGlyph=false;
              
    }; 
    
    this.openMenu = function() {       
        $scope.$parent.showlayerPanel = true;
    }; 
    
}]);