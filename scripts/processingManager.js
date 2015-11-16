BINARY_LIMIT = 255 / 2;

var ImageRecognitionLab = ImageRecognitionLab || {};

ImageRecognitionLab.ProcessingManager = (function () {

    function linearCorrectionFilter(rgbMap) {
        var minValues = rgbMap.min(ImageRecognitionLab.ColorEnum);
        var maxValues = rgbMap.max(ImageRecognitionLab.ColorEnum);
        var newRgbMap = rgbMap.transformByPixel(function (item, colorValue, colorKey) {
            return Math.round((item - minValues[colorKey]) * (255 / (maxValues[colorKey] - minValues[colorKey])));
        }, ImageRecognitionLab.ColorEnum);
        return newRgbMap;
    }

    function grayWorldAdjustmentFilter(rgbMap) {
        var averageValues = rgbMap.average(ImageRecognitionLab.ColorEnum);
        var average = _.reduce(averageValues, function (memo, item) {
            return memo + item;
        }, 0) / 3;
        var newRgbMap = rgbMap.transformByPixel(correctGrayLevel(averageValues.RED, average), ImageRecognitionLab.ColorEnumUtil.getColor("RED"));
        newRgbMap = rgbMap.transformByPixel(correctGrayLevel(averageValues.GREEN, average), ImageRecognitionLab.ColorEnumUtil.getColor("GREEN"), newRgbMap);
        newRgbMap = rgbMap.transformByPixel(correctGrayLevel(averageValues.BLUE, average), ImageRecognitionLab.ColorEnumUtil.getColor("BLUE"), newRgbMap);
        return newRgbMap;
    }

    function correctGrayLevel(averageForLevel, average){
        return function (item, colorValue, colorKey) {
            return Math.round(item * (average / averageForLevel));
        }
    }

    function toMonochrome(rgbMap) {
        var result = new ImageRecognitionLab.MonoRgbMap(rgbMap.width, rgbMap.height);
        for (var i = 0; i < rgbMap.height; i++) {
            for (var j = 0; j < rgbMap.width; j++) {
                var newValue = rgbMap.getBrightness(i, j);
                result.set(i, j, newValue);
            }
        }
        return result;
    }

    function blurFilter(rgbMap) {
        var coreSize = 3;
        var core = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
        var memo = { sum : 0};
        return rgbMap.transformByCore(coreSize, memo, ImageRecognitionLab.ColorEnum,
            function (absI, absJ, coreI, coreJ, memo, color) {
                var pixelValue = rgbMap.get(absI, absJ, color);
                memo.sum += pixelValue * core[coreI][coreJ];
            },
            function (memo) {
                var res = memo.sum / 9;
                memo.sum = 0;
                return res;
            });
    }

    function medianFilter(rgbMap) {
        var coreSize = 5;
        var memo = [];
        return rgbMap.transformByCore(coreSize, memo, ImageRecognitionLab.ColorEnum,
            function (absI, absJ, coreI, coreJ, memo, color) {
                var pixelValue = rgbMap.get(absI, absJ, color);
                memo.push(pixelValue);
            },
            function (memo) {
                memo.sort();
                var medIndex = (coreSize*coreSize - 1) / 2;
                var res = memo[medIndex];
                memo.length = 0;
                return res;
            });
    }

    function harmonicMeanFilter(rgbMap) {
        var coreSize = 3;
        var memo = { sum: 0 };
        return rgbMap.transformByCore(coreSize, memo, ImageRecognitionLab.ColorEnum,
            function (absI, absJ, coreI, coreJ, memo, color) {
                var pixelValue = rgbMap.get(absI, absJ, color);
                memo.sum += (1 / pixelValue);
            },
            function (memo) {
                var res = 9 / memo.sum;
                memo.sum = 0;
                return res;
            });
    }

    function binaryFilter(rgbMap) {
        var coreSize = 3;
        var memo = { sum: 0 };
        return rgbMap.transformByCore(coreSize, memo, ImageRecognitionLab.ColorEnum,
            function (absI, absJ, coreI, coreJ, memo, color) {
            memo.sum += rgbMap.get(absI, absJ, color);
        },
        function (memo) {
          var res = memo.sum / (coreSize * coreSize);
          memo.sum = 0;
          return res > BINARY_LIMIT ? 255 : 0;
        });
    }

    function adaptiveBinaryFilter(rgbMap) {
        var coreSize = 7;
        var coeff = 7;
        var memo = { sum: 0, centralPixel: -1 };
        return rgbMap.transformByCore(coreSize, memo, ImageRecognitionLab.ColorEnum,
            function(absI, absJ, coreI, coreJ, memo, color) {
                var pixelValue = rgbMap.get(absI, absJ, color);
                memo.sum += pixelValue;
                var centralPixel = ((coreSize - 1) / 2);
                if (coreI === centralPixel && coreJ === centralPixel) {
                    memo.centralPixel = pixelValue;
                }
            },
            function(memo) {
                var mean = memo.sum / (coreSize * coreSize);
                memo.sum = 0;
                return memo.centralPixel > mean + coeff ? 255 : 0;
            });
    }

    function sobelFilter(rgbMap) {
        var coreSize = 3;
        var core1 = [[1, 0, -1], [2, 0, -2], [1, 0, -1]];
        var core2 = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
        var memo = { sum1: 0, sum2: 0 };
        return rgbMap.transformByCore(coreSize, memo, ImageRecognitionLab.ColorEnum,
            function (absI, absJ, coreI, coreJ, memo, color) {
                var pixelValue = rgbMap.get(absI, absJ, color);
                memo.sum1 += pixelValue * core1[coreI][coreJ];
                memo.sum2 += pixelValue * core2[coreI][coreJ];
            },
            function (memo) {
                var res1 = memo.sum1 / (coreSize * coreSize);
                var res2 = memo.sum2 / (coreSize * coreSize);
                memo.sum1 = 0;
                memo.sum2 = 0;
                return Math.sqrt(Math.pow(res1, 2), Math.pow(res2, 2));
            });
    }

    function prewittFilter(rgbMap) {
        var coreSize = 3;
        var core1 = [[1, 0, -1], [1, 0, -1], [1, 0, -1]];
        var core2 = [[-1, -1, -1], [0, 0, 0], [1, 1, 1]];
        var memo = { sum1: 0, sum2: 0 };
        return rgbMap.transformByCore(coreSize, memo, ImageRecognitionLab.ColorEnum,
            function (absI, absJ, coreI, coreJ, memo, color) {
                var pixelValue = rgbMap.get(absI, absJ, color);
                memo.sum1 += pixelValue * core1[coreI][coreJ];
                memo.sum2 += pixelValue * core2[coreI][coreJ];
            },
            function (memo) {
                var res1 = memo.sum1 / (coreSize * coreSize);
                var res2 = memo.sum2 / (coreSize * coreSize);
                memo.sum1 = 0;
                memo.sum2 = 0;
                return Math.max(res1, res2);
            });
    }

    function morphologicalOr(rgbMap, core) {
        var coreSize = core[0].length;
        var memo = { isBlack: false };
        return rgbMap.transformByCore(coreSize, memo, ImageRecognitionLab.ColorEnum,
            function (absI, absJ, coreI, coreJ, memo, color) {
                var pixelValue = rgbMap.get(absI, absJ, color);
                if ((pixelValue === 0) && (core[coreI][coreJ] === 1)) {
                    memo.isBlack = true;
                }
            },
            function (memo) {
                var res = memo.isBlack ? 0 : 255;
                memo.isBlack = false;
                return res;
            });
    }

    function morphologicalAnd(rgbMap, core) {
        var coreSize = core[0].length;
        var memo = { isBlackCount: 0 };
        return rgbMap.transformByCore(coreSize, memo, ImageRecognitionLab.ColorEnum,
            function (absI, absJ, coreI, coreJ, memo, color) {
                var pixelValue = rgbMap.get(absI, absJ, color);
                if ((pixelValue === 0) && (core[coreI][coreJ] === 1)) {
                    memo.isBlack++;
                }
            },
            function (memo) {
                var res = memo.isBlack === (coreSize * coreSize) ? 0 : 255;
                memo.isBlack = 0;
                return res;
            });
    }

    return {
        linearCorrectionFilter: linearCorrectionFilter,
        grayWorldAdjustmentFilter: grayWorldAdjustmentFilter,
        toMonochrome: toMonochrome,
        blurFilter: blurFilter,
        medianFilter: medianFilter,
        harmonicMeanFilter: harmonicMeanFilter,
        binaryFilter: binaryFilter,
        adaptiveBinaryFilter: adaptiveBinaryFilter,
        sobelFilter: sobelFilter,
        prewittFilter: prewittFilter,
        morphologicalOr: morphologicalOr,
        morphologicalAnd: morphologicalAnd,
    }
})();
