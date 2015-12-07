var ImageRecognitionLab = ImageRecognitionLab || {};

ImageRecognitionLab.Area = (function () {
    function Area(label) {
        this.label = label;
        this.pixels = [];
        this.minX = null;
        this.maxX = null;
        this.minY = null;
        this.maxY = null;
        this.area = null;
        this.perimeter = null;
        this.massCenterX = null;
        this.massCenterY = null;
    }

    Area.prototype.addPixel = function(y, x) {
        this.pixels.push(x);
        this.pixels.push(y);
    }

    Area.prototype.getPixelX = function (i) {
        return this.pixels[2 * i];
    }

    Area.prototype.getPixelY = function (i) {
        return this.pixels[2 * i + 1];
    }

    Area.prototype.selectBorder = function()
    {
        this.maxX = this.getPixelX(0), this.minX = this.getPixelX(0);
        this.maxY = this.getPixelY(0), this.minY = this.getPixelY(0);
        for (var j = 1; j < this.pixels.length/2; j++) {
            var x = this.getPixelX(j);
            var y = this.getPixelY(j);

            this.maxX = x > this.maxX ? x : this.maxX;
            this.minX = x < this.minX ? x : this.minX;
            this.maxY = y > this.maxY ? y : this.maxY;
            this.minY = y < this.minY ? y : this.minY;
        }
    }

    Area.prototype.circle = (function() {
        var circle = function (rgbMap, color) {
            for (var x = this.minX; x <= this.maxX; x++) {
                drawPixel(rgbMap, x, this.maxY, color);
                drawPixel(rgbMap, x, this.maxY - 1, color);
                drawPixel(rgbMap, x, this.maxY + 1, color);
                drawPixel(rgbMap, x, this.minY, color);
                drawPixel(rgbMap, x, this.minY - 1, color);
                drawPixel(rgbMap, x, this.minY + 1, color);
            }
            for (var y = this.minY; y <= this.maxY; y++) {
                drawPixel(rgbMap, this.minX, y, color);
                drawPixel(rgbMap, this.minX - 1, y, color);
                drawPixel(rgbMap, this.minX + 1, y, color);
                drawPixel(rgbMap, this.maxX, y, color);
                drawPixel(rgbMap, this.maxX - 1, y, color);
                drawPixel(rgbMap, this.maxX + 1, y, color);
            }
        }

        function drawPixel(rgbMap, x, y, color) {
            rgbMap.set(y, x, color.red, ImageRecognitionLab.ColorEnum.RED);
            rgbMap.set(y, x, color.green, ImageRecognitionLab.ColorEnum.GREEN);
            rgbMap.set(y, x, color.blue, ImageRecognitionLab.ColorEnum.BLUE);
        }

        return circle;
    })();

    Area.prototype.calculateArea = function () {
        if (this.area) {
            return;
        }
        this.area = this.pixels.length/2;
    }

    Area.prototype.calculatePerimeter = function (rgbMap) {
        if (this.perimeter) {
            return;
        }
        this.perimeter = 0;
        for (var j = 1; j < this.pixels.length/2; j++) {
            var x = this.getPixelX(j);
            var y = this.getPixelY(j);
            var isEdge = false;
            for (var k = -1; k < 1; k++) {
                for (var l = -1; l < 1; l++) {
                    var tmp = rgbMap.get(y + k, x + l);
                    if (tmp === 255) {
                        isEdge = true;
                    }
                }
            }
            if (isEdge) {
                this.perimeter++;
            }
        }
    }

    Area.prototype.calculateMassCenter = function () {
        if (this.massCenterX && this.massCenterY) {
            return;
        }
        if (!this.area) {
            this.calculateArea();
        }
        var massX = 0, massY = 0;
        for (var j = 1; j < this.pixels.length / 2; j++) {
            var x = this.getPixelX(j);
            var y = this.getPixelY(j);
            massX += x / this.area;
            massY += y / this.area;
        }
        this.massCenterX = Math.round(massX);
        this.massCenterY = Math.round(massY);
    }

    return Area;
})();