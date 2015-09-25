var ImageRecognitionLab = ImageRecognitionLab || {}
    
ImageRecognitionLab.RgbMap = function (width, height, imageData) {
    var self = this;
    self.pixels = createRgbMap(width, height, imageData);

    function createRgbMap(width, height, imageData) {
        var pixels = new Array();
        for (i = 0; i < height; i++) {
            pixels[i] = new Array();
            for (j = 0; j < width; j++) {
                pixels[i][j] = new Array();
                var index = j * 4;
                pixels[i][j][0] = imageData.data[i * width + index];
                index++;
                pixels[i][j][1] = imageData.data[i * width + index];
                index++;
                pixels[i][j][2] = imageData.data[i * width + index];
            }
        }
        return pixels;
    }

    function getRed(i, j) {
        return self.pixels[i][j][0];
    }

    function getGreen(i, j) {
        return self.pixels[i][j][1];
    }

    function getBlue(i, j) {
        return self.pixels[i][j][2];
    }

    function setRed(i, j, value) {
        self.pixels[i][j][0] = value;
    }

    function setGreen(i, j, value) {
        self.pixels[i][j][1] = value;
    }

    function setBlue(i, j, value) {
        self.pixels[i][j][2] = value;
    }

    return {
        getRed: getRed,
        getGreen: getGreen,
        getBlue: getBlue,
        setRed: setRed,
        setGreen: setGreen,
        setBlue: setBlue,
    }
}