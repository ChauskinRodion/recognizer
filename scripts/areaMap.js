var ImageRecognitionLab = ImageRecognitionLab || {};

ImageRecognitionLab.AreaMap = (function () {
    function AreaMap(rgbMap) {
        var self = this;
        this.rgbMap = rgbMap;
        this.labelMap = [];
        this.areas = [];
        emptyLabelMap();
        markLabelMap();
        exctractDistictLabels();
        splitAreas();
        selectBorder();

        function emptyLabelMap() {
            for (var i = 0; i < rgbMap.height; i++) {
                self.labelMap[i] = [];
                for (var j = 0; j < rgbMap.width; j++) {
                    self.labelMap[i][j] = 0;
                }
            }
        }

        function markLabelMap() {
            var l = 1;
            for (var i = 0; i < rgbMap.height; i++) {
                for (var j = 0; j < rgbMap.width; j++) {
                    fill(rgbMap, self.labelMap, i, j, l++);
                }
            }
        }

        function fill(rgbMap, labelMap, y, x, l) {
            if ((self.labelMap[y][x] === 0) && (rgbMap.get(y, x) === 0)) {
                self.labelMap[y][x] = l;
                if (x > 0) {
                    fill(rgbMap, self.labelMap, y, x - 1, l);
                }
                if (x < rgbMap.width - 1) {
                    fill(rgbMap, self.labelMap, y, x + 1, l);
                }
                if (y > 0) {
                    fill(rgbMap, self.labelMap, y - 1, x, l);
                }
                if (y < rgbMap.height - 1) {
                    fill(rgbMap, self.labelMap, y + 1, x, l);
                }
            }
        }

        function exctractDistictLabels() {
            for (var i = 0; i < rgbMap.height; i++) {
                for (var j = 0; j < rgbMap.width; j++) {
                    var label = self.labelMap[i][j];
                    if (!_.any(self.areas, function (area) {
                        return area.label === label;
                    })) {
                        self.areas.push(new ImageRecognitionLab.Area(self.labelMap[i][j]));
                    }
                }
            }
            self.areas = _.without(self.areas, _.findWhere(self.areas, { label: 0 }));
        }

        function splitAreas() {
            for (var i = 0; i < rgbMap.height; i++) {
                for (var j = 0; j < rgbMap.width; j++) {
                    var area = _.filter(self.areas, function (area, index) {
                        if (area.label === self.labelMap[i][j]) {
                            return area;
                        }
                    })[0];
                    if (area) {
                        area.addPixel(i, j);
                    }
                }
            }
        }

        function selectBorder() {
            _.each(self.areas, function(area, index) {
                area.selectBorder();
            }); 
        }
    }

    AreaMap.prototype.circle = function (rgbMap, color) {
        _.each(this.areas, function(area) {
            area.circle(rgbMap, color);
        });
    }

    AreaMap.prototype.calculateArea = function() {
        _.each(this.areas, function (area) {
            area.calculateArea();
        });
    }

    AreaMap.prototype.calculatePerimeter = function (rgbMap) {
        _.each(this.areas, function (area) {
            area.calculatePerimeter(rgbMap);
        });
    }
    AreaMap.prototype.calculateMassCenter = function () {
        _.each(this.areas, function (area) {
            area.calculateMassCenter();
        });
    }

    return AreaMap;
})();