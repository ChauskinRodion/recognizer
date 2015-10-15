BINARY_LIMIT = 255 / 2;

var ImageRecognitionLab = ImageRecognitionLab || {};

ImageRecognitionLab.ProcessingManager = (function () {

    function linearCorrectionFilter(rgbMap) {
        var minValues = rgbMap.min();
        var maxValues = rgbMap.max();
        var newRgbMap = rgbMap.transformByPixel(function (item, colorValue, colorKey) {
            return Math.round((item - minValues[colorKey]) * (255 / (maxValues[colorKey] - minValues[colorKey])));
        }, ImageRecognitionLab.ColorEnum);
        return newRgbMap;
    }

    function grayWorldAdjustmentFilter(rgbMap) {
        var averageValues = rgbMap.average();
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
        var coreSize = 3;
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
          var res = memo.sum / (coreSize*coreSize);
          memo.sum = 0;
          return res > BINARY_LIMIT ? 255 : 0;
        });
    }

    //function gaussianFilter(rgbMap) {
    //    var coreSize = 3;
    //    var memo = { sum: 0 };
    //    return rgbMap.transformByCore(coreSize, memo, ImageRecognitionLab.ColorEnum,
    //        function (absI, absJ, coreI, coreJ, memo, color) {
    //            var pixelValue = rgbMap.get(absI, absJ, color);
    //            memo.sum += Math.exp(-())
    //        },
    //        function (memo) {
    //            var res = 9 / memo.sum;
    //            memo.sum = 0;
    //            return res;
    //        });
    //}

    return {
        linearCorrectionFilter: linearCorrectionFilter,
        grayWorldAdjustmentFilter: grayWorldAdjustmentFilter,
        blurFilter: blurFilter,
        medianFilter: medianFilter,
        harmonicMeanFilter: harmonicMeanFilter,
        binaryFilter: binaryFilter
        //gaussianFilter: gaussianFilter,
    }
})();
