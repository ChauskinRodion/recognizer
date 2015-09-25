var ImageRecognitionLab = ImageRecognitionLab || {

    TargetImage: function (src) {
        var self = this;

        self.src = src;
        self.rgbMap = null;

        function initialize() {
            var deferred = $.Deferred();
            var image = new Image();
            image.onload = function () {
                self.rgbMap = getRgbMapFromImage(image);
                deferred.resolve();
            }
            image.onerror = function () {
                deferred.reject();
            }
            image.src = self.src;
            return deferred.promise();
        }

        function createCanvas(image) {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            return canvas;
        }

        function getImageData(canvas, image) {
            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            return context.getImageData(0, 0, image.width, image.height);
        }

        function getRgbMap(canvas, imageData) {
            var pixels = new Array();
            for (i = 0; i < canvas.height; i++) {
                pixels[i] = new Array();
                for (j = 0; j < canvas.width; j++) {
                    pixels[i][j] = imageData.data[i * canvas.width + j * 4];
                }
            }
            return pixels;
        }

        function getRgbMapFromImage(image) {
            var canvas = createCanvas(image);
            var imageData = getImageData(canvas, image);
            return getRgbMap(canvas, imageData);
        }

        return {
            getRgbMap: function () {
                return self.rgbMap;
            },

            initialize: initialize,
        }
    }
};