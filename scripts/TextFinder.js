textFinder = (function (){
    var settings = {
        LineDelimiterDarkPointLesThan: 0.1
    };

    return {
        splitTextLines: splitTextLines
    };

    function splitTextLines(area, monoRgbMap){
        var result = [];
        var textArea = monoRgbMap.cut({left: area.minX, right: area.maxX, top: area.minY, bottom: area.maxY });
        textArea = ImageRecognitionLab.ProcessingManager.binaryFilterWithoutArea(textArea, undefined, -0.1);
        var startY = undefined;
        for (var y = 0; y < textArea.height; y++){
            if(isLineDelimiter(textArea.pixels[y])){
                if(startY != undefined){
                    result.push(textArea.cut({left: 0, right: textArea.width, top: startY, bottom: y-1 }));
                    startY = undefined;
                }
            } else {
                if(startY == undefined){
                    startY = y;
                }
                if(y == (textArea.height - 1) && startY != undefined){
                    result.push(textArea.cut({left: 0, right: textArea.width, top: startY, bottom: y }));
                }
            }
        };
        return result;
    };

    function isLineDelimiter(line){
        var darkPixels = 0;
        for (var x = 0; x < line.length; x++) {
            if(line[x][ImageRecognitionLab.ColorEnum.RED] == 0) {
                darkPixels++;
            }
        }
        var result = (darkPixels / line.length) < settings.LineDelimiterDarkPointLesThan;
        return result;
    }
})();