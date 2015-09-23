var ImageRecognitionLab = ImageRecognitionLab || {

    TargetImage: function (src) {
        //private members
        var pixels = new Array();
        var image = new Image();
        image.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            var imageData = context.getImageData(0, 0, image.width, image.height);
            for (i = 0; i < canvas.height; i++) {
                pixels[i] = new Array();
                for (j = 0; j < canvas.width; j++) {
                    pixels[i][j] = imageData.data[i * canvas.width + j * 4];
                }
            }
        }
        image.src = src;        

        //public members
        return {
            getImageData: function(){
                return pixels;
            }
        }
    }
};