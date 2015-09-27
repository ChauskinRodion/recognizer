var ImageRecognitionLab = ImageRecognitionLab || {}
    
ImageRecognitionLab.RgbMap = function (width, height, imageData) {
    var Color = ImageRecognitionLab.ColorEnum;
    var self = this;
    self.width = width;
    self.height = height;
    self.count = width * height;

    if (imageData !== undefined) {
        self.pixels = createRgbMap(width, height, imageData);
    }
    else {
        self.pixels = createEmptyRgbMap(width, height);
    }

    function createRgbMap(width, height, imageData) {
        var pixels = new Array();
        for (i = 0; i < height; i++) {
            pixels[i] = new Array();
            for (j = 0; j < width; j++) {
                pixels[i][j] = new Array();
                var index = j * 4;
                pixels[i][j][0] = imageData.data[i * width * 4 + index];
                index++;
                pixels[i][j][1] = imageData.data[i * width * 4 + index];
                index++;
                pixels[i][j][2] = imageData.data[i * width * 4 + index];
            }
        }
        return pixels;
    }

    function createEmptyRgbMap(width, height) {
        var pixels = new Array();
        for (i = 0; i < height; i++) {
            pixels[i] = new Array();
            for (j = 0; j < width; j++) {
                pixels[i][j] = new Array();
                pixels[i][j][0] = 0;
                pixels[i][j][1] = 0;
                pixels[i][j][2] = 0;
            }
        }
        return pixels;
    }

    function populateImageData(imageData) {
        var data = imageData.data;

        var index = 0;
        for (var i = 0; i < self.height; i++) {
            for (var j = 0; j < self.width; j++) {
                data[index++] = get(i, j, Color.RED);
                data[index++] = get(i, j, Color.GREEN);
                data[index++] = get(i, j, Color.BLUE);
                data[index++] = 255;
            }
        }
    }

    function get(i, j, color) {
        return self.pixels[i][j][color];
    }

    function set(i, j, color, value) {
        self.pixels[i][j][color] = value;
    }

    function getBrightness(i, j) {
        return 0.3 * get(i, j, Color.RED) + 0.59 * get(i, j, Color.GREEN) + 0.11 * get(i, j, Color.BLUE);
    }

    function average() {
        return _.object(_.map(Color, function (colorValue, colorKey) {
            var result = 0;
            for (var i = 0; i < self.height; i++) {
                var lineSum = 0;
                for (var j = 0; j < self.width; j++) {
                    lineSum += get(i, j, colorValue);
                }
                result += lineSum / self.count;
            }
            return [colorKey, result];
        })); 
    }

    function min() {
        var minValue = 255;
        return _.object(_.map(Color, function (color, key) {
            for (var i = 0; i < self.height; i++) {
                for (var j = 0; j < self.width; j++) {
                    var pixel = get(i, j, color);
                    if (pixel < minValue) {
                        minValue = pixel;
                    }
                }
            }
            return [key, minValue];
        }));
    }

    function max() {
        var maxValue = 0;
        return _.object(_.map(Color, function (color, key) {
            for (var i = 0; i < self.height; i++) {
                for (var j = 0; j < self.width; j++) {
                    var pixel = get(i, j, color);
                    if (pixel > maxValue) {
                        maxValue = pixel;
                    }
                }
            }
            return [key, maxValue];
        }));
    }

    function transform(fn, colors, rgbMap) {
        var result = rgbMap;
        if (result === undefined) {
            result = new ImageRecognitionLab.RgbMap(self.width, self.height);
        }
        _.each(colors, function (colorValue, colorKey) {
            for (var i = 0; i < self.height; i++) {
                for (var j = 0; j < self.width; j++) {
                    var newValue = fn(get(i, j, colorValue), colorValue, colorKey);
                    result.set(i, j, colorValue, newValue);
                }
            }
        });
        return result;
    }

    return {
        width: self.width,

        height: self.height,

        count: self.count,

        get: get,

        set: set,

        populateImageData: populateImageData,

        getBrightness: getBrightness,

        min: min,

        max: max,

        transform: transform,

        average: average,
    }
}