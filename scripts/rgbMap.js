﻿var ImageRecognitionLab = ImageRecognitionLab || {}

ImageRecognitionLab.RgbMap = (function () {
    function RgbMap(width, height, imageData) {
        this.width = width;
        this.height = height;
        this.count = width * height;

        if (imageData !== undefined) {
            this.pixels = createRgbMap(width, height, imageData);
        }
        else {
            this.pixels = createEmptyRgbMap(width, height);
        }

        function createRgbMap(width, height, imageData) {
            var pixels = new Array();
            for (var i = 0; i < height; i++) {
                pixels[i] = new Array();
                for (var j = 0; j < width; j++) {
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
            for (var i = 0; i < height; i++) {
                pixels[i] = new Array();
                for (var j = 0; j < width; j++) {
                    pixels[i][j] = new Array();
                    pixels[i][j][0] = 0;
                    pixels[i][j][1] = 0;
                    pixels[i][j][2] = 0;
                }
            }
            return pixels;
        }
    };

    RgbMap.prototype.populateImageData = function(imageData) {
        var data = imageData.data;

        var index = 0;
        for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                data[index++] = this.get(i, j, ImageRecognitionLab.ColorEnum.RED);
                data[index++] = this.get(i, j, ImageRecognitionLab.ColorEnum.GREEN);
                data[index++] = this.get(i, j, ImageRecognitionLab.ColorEnum.BLUE);
                data[index++] = 255;
            }
        }
    }

    RgbMap.prototype.get = function(i, j, color) {
        return this.pixels[i][j][color];
    }

    RgbMap.prototype.set = function (i, j, value, color) {
        if (value < 0) {
            value = 0;
        }
        if (value > 255) {
            value = 255;
        }

        if (i < 0 || i >= this.height || j < 0 || j >= this.width) {
            return;
        }

        this.pixels[i][j][color] = value;
    }

    RgbMap.prototype.getBrightness = function(i, j) {
        return 0.3 * this.get(i, j, ImageRecognitionLab.ColorEnum.RED)
            + 0.59 * this.get(i, j, ImageRecognitionLab.ColorEnum.GREEN)
            + 0.11 * this.get(i, j, ImageRecognitionLab.ColorEnum.BLUE);
    }

    RgbMap.prototype.average = function (colors) {
        var self = this;
        return _.object(_.map(colors, function (colorValue, colorKey) {
            var result = 0;
            for (var i = 0; i < self.height; i++) {
                var lineSum = 0;
                for (var j = 0; j < self.width; j++) {
                    lineSum += self.get(i, j, colorValue);
                }
                result += lineSum / self.count;
            }
            return [colorKey, result];
        })); 
    }

    RgbMap.prototype.min = function(colors) {
        var minValue = 255;
        var self = this;
        return _.object(_.map(colors, function (color, key) {
            for (var i = 0; i < self.height; i++) {
                for (var j = 0; j < self.width; j++) {
                    var pixel = self.get(i, j, color);
                    if (pixel < minValue) {
                        minValue = pixel;
                    }
                }
            }
            return [key, minValue];
        }));
    }

    RgbMap.prototype.max = function(colors) {
        var maxValue = 0;
        var self = this;
        return _.object(_.map(colors, function (color, key) {
            for (var i = 0; i < self.height; i++) {
                for (var j = 0; j < self.width; j++) {
                    var pixel = self.get(i, j, color);
                    if (pixel > maxValue) {
                        maxValue = pixel;
                    }
                }
            }
            return [key, maxValue];
        }));
    }

    RgbMap.prototype.transformByPixel = function (fn, colors, rgbMap) {
        var self = this;
        var result = rgbMap;
        if (result === undefined) {
            result = new this.constructor(self.width, self.height);
        }
        _.each(colors, function (colorValue, colorKey) {
            for (var i = 0; i < self.height; i++) {
                for (var j = 0; j < self.width; j++) {
                    var newValue = fn(self.get(i, j, colorValue), colorValue, colorKey);
                    result.set(i, j, newValue, colorValue);
                }
            }
        });
        return result;
    }

    RgbMap.prototype.transformByCore = (function() {
        var f = function (coreSize, memo, colors, fnProcess, fnRes) {
            var result = new this.constructor(this.width, this.height);
            var self = this;
            _.each(colors, function (colorValue, colorKey) {
                for (var i = 0; i < self.height; i++) {
                    for (var j = 0; j < self.width; j++) {
                        var localMemo = memo;
                        var newValue = processPixelUsingCore.call(self, i, j, coreSize, localMemo, colorValue, fnProcess, fnRes);
                        result.set(i, j, newValue, colorValue);
                    }
                }
            });
            return result;
        }

        function processPixelUsingCore(i, j, coreSize, memo, color, fnProcess, fnRes) {
            var halfSize = (coreSize - 1) / 2;
            for (var k = -halfSize; k <= halfSize; k++) {
                for (var p = -halfSize; p <= halfSize; p++) {
                    var absI = i + k;
                    var absJ = j + p;
                    if ((absI < 0) || (absJ < 0) || (absI >= this.height) || (absJ >= this.width)) {
                        return this.get(i, j, color);
                    }
                    var coreI = k + halfSize;
                    var coreJ = p + halfSize;
                    fnProcess(absI, absJ, coreI, coreJ, memo, color);
                }
            }
            return fnRes(memo);
        }

        return f;
    })();

    return RgbMap;
})();
