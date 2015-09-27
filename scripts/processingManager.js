var ImageRecognitionLab = ImageRecognitionLab || {};

ImageRecognitionLab.ProcessingManager = (function () {
    function linearCorrection(rgbMap) {
        var minValues = rgbMap.min();
        var maxValues = rgbMap.max();
        var newRgbMap = rgbMap.transform(function (item, colorValue, colorKey) {
            return Math.round((item - minValues[colorKey]) * (255 / (maxValues[colorKey] - minValues[colorKey])));
        }, ImageRecognitionLab.ColorEnum);
        return newRgbMap;
    }

    function grayWorldAdjustment(rgbMap) {
        var averageValues = rgbMap.average();
        var average = _.reduce(averageValues, function (memo, item) {
            return memo + item;
        }, 0) / 3;
        var newRgbMap = rgbMap.transform(function (item, colorValue, colorKey) {
            return Math.round(item * (average / averageValues.RED));
        }, ImageRecognitionLab.ColorEnumUtil.getColor("RED"));
        newRgbMap = rgbMap.transform(function (item, colorValue, colorKey) {
            return Math.round(item * (average / averageValues.GREEN));
        }, ImageRecognitionLab.ColorEnumUtil.getColor("GREEN"), newRgbMap);
        newRgbMap = rgbMap.transform(function (item, colorValue, colorKey) {
            return Math.round(item * (average / averageValues.BLUE));
        }, ImageRecognitionLab.ColorEnumUtil.getColor("BLUE"), newRgbMap);
        return newRgbMap;
    }

    return {
        linearCorrection: linearCorrection,
        grayWorldAdjustment: grayWorldAdjustment,
    }
})();