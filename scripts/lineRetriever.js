var ImageRecognitionLab = ImageRecognitionLab || {};

ImageRecognitionLab.LineRetriever = (function () {
    this.angleCount = 128;
    this.rStep = 1;
    this.precision = 3;

    function findLines(rgbMap) {
        var maxR = resolveMaxR(rgbMap);
        var accumulator = [];
        for (var angle = 0; angle < angleCount; angle++) {
            accumulator[angle] = {};
            for (var r = -maxR; r < maxR; r = roundWithPresision(r + rStep)) {
                accumulator[angle][r] = { rMin: r, rMax: roundWithPresision(r + rStep), count: 0 };
            }
        }

        for (var i = 0; i < rgbMap.height; i++) {
            for (var j = 0; j < rgbMap.width; j++) {
                var pixel = rgbMap.get(i, j);
                if (pixel === 255) {
                    vote(i, j, accumulator);
                }
            }
        }

        var counts = [];
        _.each(accumulator, function (rList) {
            _.each(rList, function (item) {
                if (item.count > 0) {
                    counts.push(item.count);
                }
            });
        });
        var threshold = ImageRecognitionLab.otsuThreshold(counts);

        var result = [];
        _.each(accumulator, function (rList, anglePart) {
            result[anglePart] = _.reject(rList, function (item) {
                return item.count <= threshold;
            });
        });

        return result;
    }

    function drawLines(accumulator, rgbMap, color) {
        for (var i = 0; i < rgbMap.height; i++) {
            _.each(accumulator, function (rList, anglePart) {
                _.each(rList, function (r) {
                    var resolvedAngle = 2 * Math.PI * anglePart / angleCount;
                    var j = Math.round((r.rMin - i * Math.sin(resolvedAngle)) / Math.cos(resolvedAngle));
                    drawAroundPixel(i, j, rgbMap, color);
                });
            });
        }
    }

    function drawAroundPixel(i, j, rgbMap, color) {
        for (var k = -1; k <= 1; k++) {
            for (var l = -1; l < 1; l++) {
                rgbMap.set(i+k, j+l, color.red, ImageRecognitionLab.ColorEnum.RED);
                rgbMap.set(i+k, j+l, color.green, ImageRecognitionLab.ColorEnum.GREEN);
                rgbMap.set(i+k, j+l, color.blue, ImageRecognitionLab.ColorEnum.BLUE);
            }
        }
    }

    function resolveMaxR(rgbMap) {
        return roundWithPresision(Math.sqrt(rgbMap.width * rgbMap.width + rgbMap.height * rgbMap.height));
    }

    function roundWithPresision(n) {
        return parseFloat(n.toFixed(this.precision));
    }

    function vote(i, j, accumulator) {
        var step = 2 * Math.PI / angleCount;
        for (var anglePart = 0; anglePart < this.angleCount; anglePart++) {
            var resolvedAngle = step * anglePart;
            var expr = j * Math.cos(resolvedAngle) + i * Math.sin(resolvedAngle);
            var item = _.find(accumulator[anglePart], function (item) {
                return (expr >= item.rMin) && (expr < item.rMax);
            });
            if (item) {
                item.count++;
            } else {
                console.log("посос");
            }
        }
    }

    return {
        findLines: findLines,
        drawLines: drawLines
    };
})();