var ImageRecognitionLab = ImageRecognitionLab || {};

ImageRecognitionLab.LineRetriever = (function () {
    this.angleCount = 32;
    this.rStep = 2;
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

        var border = 20;
        for (var i = border; i < rgbMap.height - border; i++) {
            for (var j = border; j < rgbMap.width - border; j++) {
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
                    if (counts[item.count]) {
                        counts[item.count]++;
                    } else {
                        counts[item.count] = 1;
                    }
                }
            });
        });

        var acc = 0;
        var threshold = 1;
        for (var i = counts.length - 1; i >= 0; i--) {
            if (acc >= 25) {
                break;
            }
            if (counts[i]) {
                acc += counts[i];
                threshold = i;
            }
        }

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
                    var resolvedAngle = Math.PI * anglePart / angleCount;
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
        var step = Math.PI / angleCount;
        for (var anglePart = 0; anglePart < this.angleCount; anglePart++) {
            var resolvedAngle = step * anglePart;
            var expr = j * Math.cos(resolvedAngle) + i * Math.sin(resolvedAngle);
            var item = _.find(accumulator[anglePart], function (item) {
                return (expr >= item.rMin) && (expr < item.rMax);
            });
            if (item) {
                item.count++;
            } else {

            }
        }
    }

    return {
        findLines: findLines,
        drawLines: drawLines,
        resolveMaxR: resolveMaxR,
        angleCount: angleCount
    };
})();