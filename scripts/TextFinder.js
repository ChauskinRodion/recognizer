textFinder = (function (){
    var settings = {
        LineDelimiterDarkPointLesThan: 0.05,
        LetterDelimiterDarkPointLesThan: 0.1,
        binarizationCoefStep: -0.05,  //step of minus binarization coef
        letterTogetherCoef: 2.2 //In how much two letter should have width than average letter width
    };

    return {
        splitTextLines: splitTextLines,
        splitLetters: splitLetters,
        findLetters: findLetters
    };

    function findLetters(areaMap, monoRgbMap){
        var simpleAreaMapSplittedLines = new ImageRecognitionLab.SimpleAreaMap(monoRgbMap);
        areaMap.areas.forEach(function (area){
            splitTextLines(area, monoRgbMap).forEach(function (lineArea){
                var letters = [];
                splitLetters(lineArea, monoRgbMap).forEach(function(letterArea){
                    letters.push(letterArea);
                });
                simpleAreaMapSplittedLines.addAreasGroup(letters);
            });
        });
        return simpleAreaMapSplittedLines;
        /*simpleAreaMapSplittedLines.areasGroups.forEach(function(areasGroup){
            areasGroup.forEach(function(letter){
                ImageRecognitionLab.ImageManager.drawRgbMap($("canvas#image_out"), simpleAreaMapSplittedLines.rgbMap.cut({left: letter.minX, right: letter.maxX, top: letter.minY, bottom: letter.maxY }));
                var i = 0;
            });
        });*/
    }

    function splitLetters(area, monoRgbMap){
        if(area.maxY - area.minY <= 1){
            return [];
        }
        var AllLettersNotTogether = false;
        var coef = 0 - settings.binarizationCoefStep;
        while(!AllLettersNotTogether){
            coef += settings.binarizationCoefStep;
            var result = [];
            var textArea = monoRgbMap.cut({left: area.minX, right: area.maxX, top: area.minY, bottom: area.maxY });
            textArea = ImageRecognitionLab.ProcessingManager.binaryFilterWithoutArea(textArea, undefined, coef);
            var startX = undefined;
            for (var x = 0; x < textArea.width; x++){
                if(isLineDelimiter(prepareVerticalLine(x, textArea), settings.LetterDelimiterDarkPointLesThan)){
                    if(startX != undefined){
                        if(x - startX > 1){
                            result.push({minX: area.minX + startX, maxX: area.minX + x - 1, minY: area.minY, maxY: area.maxY});
                        }
                        startX = undefined;
                    }
                } else {
                    if(startX == undefined){
                        startX = x;
                    }
                    if(x == (textArea.width - 1) && startX != undefined){
                        if(x - startX > 1){
                            result.push({minX: area.minX + startX, maxX: area.minX + x, minY: area.minY, maxY: area.maxY});
                        }
                    }
                }
            };
            AllLettersNotTogether = checkForAllLettersNotTogether(result) ||  Math.abs(coef) > 0.21;
            //AllLettersNotTogether = true;
        }
        return result;
    }

    function splitTextLines(area, monoRgbMap){
        var result = [];
        var textArea = monoRgbMap.cut({left: area.minX, right: area.maxX, top: area.minY, bottom: area.maxY });
        textArea = ImageRecognitionLab.ProcessingManager.binaryFilterWithoutArea(textArea);
        var startY = undefined;
        for (var y = 0; y < textArea.height; y++){
            if(isLineDelimiter(textArea.pixels[y], settings.LineDelimiterDarkPointLesThan)){
                if(startY != undefined){
                    result.push({minX: area.minX, maxX: area.maxX, minY: area.minY + startY, maxY: area.minY + y - 1});
                    startY = undefined;
                }
            } else {
                if(startY == undefined){
                    startY = y;
                }
                if(y == (textArea.height - 1) && startY != undefined){
                    result.push({minX: area.minX, maxX: area.maxX, minY: area.minY + startY, maxY: area.minY + y});
                }
            }
        };
        return result;
    };

    function isLineDelimiter(line, threshold){
        var darkPixels = 0;
        for (var x = 0; x < line.length; x++) {
            if(line[x][ImageRecognitionLab.ColorEnum.RED] == 0) {
                darkPixels++;
            }
        }
        var result = (darkPixels / line.length) < threshold;
        return result;
    }

    function prepareVerticalLine(x, picture){
        var result = [];
        for (var y = 0; y < picture.height; y++) {
            result.push(picture.pixels[y][x]);
        }
        return result;
    }

    function checkForAllLettersNotTogether(areas) {
        var averageLetterWidth = findAverageLetterWidth(areas);
        var i = 0;
        while(i < areas.length){
            var area = areas[i];
            var width = (area.maxX - area.minX);
            if((width / averageLetterWidth) >= settings.letterTogetherCoef || (width / (area.maxY - area.minY)) > 2){
                return false;
            }
            i++;
        }
        return true;
    }

    function findAverageLetterWidth(areas){
        var result = 0;
        var areasCount = areas.length;
        areas.forEach(function(area){
            result += (area.maxX - area.minX);
        });
        return result / areasCount;
    }
})();