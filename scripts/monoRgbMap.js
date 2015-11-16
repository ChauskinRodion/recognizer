var ImageRecognitionLab = ImageRecognitionLab || {}

ImageRecognitionLab.MonoRgbMap = (function () {
    function MonoRgbMap(width, height, imageData) {
        ImageRecognitionLab.MonoRgbMap.superclass.constructor.call(this, width, height, imageData);
    }

    ImageRecognitionLab.extend(MonoRgbMap, ImageRecognitionLab.RgbMap);

    MonoRgbMap.prototype.set = function(i, j, value) {
        ImageRecognitionLab.MonoRgbMap.superclass.set.call(this, i, j, value, ImageRecognitionLab.ColorEnum.RED);
        ImageRecognitionLab.MonoRgbMap.superclass.set.call(this, i, j, value, ImageRecognitionLab.ColorEnum.GREEN);
        ImageRecognitionLab.MonoRgbMap.superclass.set.call(this, i, j, value, ImageRecognitionLab.ColorEnum.BLUE);
    }

    MonoRgbMap.prototype.get = function (i, j) {
        return ImageRecognitionLab.MonoRgbMap.superclass.get.call(this, i, j, ImageRecognitionLab.ColorEnum.RED);
    }

    MonoRgbMap.prototype.getBrightness = function (i, j) {
        return this.get(i, j);
    }

    MonoRgbMap.prototype.average = function () {
        return ImageRecognitionLab.MonoRgbMap.superclass.average.call(this, ImageRecognitionLab.ColorEnumUtil.getColor("RED"));
    }

    MonoRgbMap.prototype.min = function () {
        return ImageRecognitionLab.MonoRgbMap.superclass.min.call(this, ImageRecognitionLab.ColorEnumUtil.getColor("RED"));
    }

    MonoRgbMap.prototype.max = function () {
        return ImageRecognitionLab.MonoRgbMap.superclass.max.call(this, ImageRecognitionLab.ColorEnumUtil.getColor("RED"));
    }

    MonoRgbMap.prototype.transformByPixel = function (fn, colors, rgbMap) {
        return ImageRecognitionLab.MonoRgbMap.superclass.transformByPixel.call(this, fn, ImageRecognitionLab.ColorEnumUtil.getColor("RED"), rgbMap);
    }

    MonoRgbMap.prototype.transformByCore = function (coreSize, memo, colors, fnProcess, fnRes) {
        return ImageRecognitionLab.MonoRgbMap.superclass.transformByCore.call(this, coreSize, memo, ImageRecognitionLab.ColorEnumUtil.getColor("RED"), fnProcess, fnRes);
    }

    return MonoRgbMap;
})();