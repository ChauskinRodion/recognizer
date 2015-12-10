var ImageRecognitionLab = ImageRecognitionLab || {}

ImageRecognitionLab.ColorEnum = {
    RED: 0,
    GREEN: 1,
    BLUE: 2
};

ImageRecognitionLab.Colors = {
  WHITE: [255, 255, 255],
  BLACK: [0, 0, 0],
  RED: [255, 0, 0]
};

ImageRecognitionLab.ColorEnumUtil = {
    getColor: function (colorKey) {
        var result = {};
        result[colorKey] = ImageRecognitionLab.ColorEnum[colorKey];
        return result;
    }
}
