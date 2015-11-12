var ImageRecognitionLab = ImageRecognitionLab || {};

ImageRecognitionLab.ImageManager = (function () {
    function getRgbMap(src) {
        var deferred = $.Deferred();
        var image = new Image();
        image.onload = function () {
            var rgbMap = getRgbMapFromImage(image);
            deferred.resolve(rgbMap);
        };
        image.onerror = function () {
            deferred.reject();
        };
        image.src = src;
        return deferred.promise();
    }

    function drawRgbMap(targetCanvasJQuery, rgbMap) {
        var targetCanvas = _.first(targetCanvasJQuery);
        targetCanvas.width = rgbMap.width;
        targetCanvas.height = rgbMap.height;
        var context = targetCanvas.getContext('2d');
        var imageData = context.createImageData(rgbMap.width, rgbMap.height);
        rgbMap.populateImageData(imageData);
        context.putImageData(imageData, 0, 0);
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

    function getRgbMapFromImage(image) {
        var canvas = createCanvas(image);
        var imageData = getImageData(canvas, image);
        return new ImageRecognitionLab.RgbMap(canvas.width, canvas.height, imageData);
    }

    return {
        getRgbMap: getRgbMap,
        drawRgbMap: drawRgbMap
    }
})();
