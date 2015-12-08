var ImageRecognitionLab = ImageRecognitionLab || {};

ImageRecognitionLab.SimpleAreaMap = (function () {

    function SimpleAreaMap(rgbMap) {
        this.rgbMap = rgbMap;
        this.areas = [];
        this.areasGroups = [];
    }

    SimpleAreaMap.prototype.addArea = function(area){
        this.areas.push(area);
    }

    SimpleAreaMap.prototype.addAreasGroup = function(areaGroup){
        this.areasGroups.push(areaGroup);
    }

    return SimpleAreaMap;
})();