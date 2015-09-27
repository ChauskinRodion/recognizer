var ImageRecognitionLab = ImageRecognitionLab || {}

ImageRecognitionLab.ColorEnum = {
    RED: 0,
    GREEN: 1,
    BLUE: 2,
}

ImageRecognitionLab.ColorEnumUtil = {
    getColor: function (colorKey) {
        var result = {};
        result[colorKey] = ImageRecognitionLab.ColorEnum[colorKey];
        return result;
    }
}
