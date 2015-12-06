var ImageRecognitionLab = ImageRecognitionLab || {}

ImageRecognitionLab.extend = function (child, parent) {
    var f = function () { }
    f.prototype = parent.prototype;
    child.prototype = new f();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
}

ImageRecognitionLab.otsuThreshold = function (arr) {
    var max = _.max(arr);
    var min = _.min(arr);

    var histWidth = max - min + 1;
    var hist = [];
    for (var i = 0; i < histWidth; i++) {
        hist[i] = 0;
    }
    for (var i = 0; i < arr.length; i++) {
        hist[arr[i] - min]++;
    }

    var m = 0; 
    var n = 0; 
    for (var t = 0; t <= max - min; t++)
    {
        m += t * hist[t];
        n += hist[t];
    }
    
    var maxSigma = -1;
    var threshold = 0; 
    
    var alpha1 = 0; 
    var beta1 = 0; 
    
    for (var t = 0; t < max - min; t++)
    {
        alpha1 += t * hist[t];
        beta1 += hist[t];
    
        var w1 = beta1 / n;
        var a = (alpha1 / beta1) - (m - alpha1) / (n - beta1);
        
        var sigma = w1 * (1 - w1) * a * a;
    
        if (sigma > maxSigma)
        {
            maxSigma = sigma;
            threshold = t;
        }
    }

    return threshold + min;
}

ImageRecognitionLab.buildHistogram = function(arr) {
    var max = _.max(arr);
    var min = _.min(arr);

    var histWidth = max - min + 1;
    var hist = [];
    for (var i = 0; i < histWidth; i++) {
        hist[i] = 0;
    }
    for (var i = 0; i < arr.length; i++) {
        hist[arr[i] - min]++;
    }
    return hist;
}

ImageRecognitionLab.smoothOverHistagram = function (hist, step) {
    var smoothHist = [];
    for (var i = 0; i < hist.length; i++) {
        var sum = 0;
        var count = 0;
        for (var k = -step; k < step; k++) {
            var tmpValue = hist[i + k];
            if (i + k >= 0 && i + k < hist.length) {
                sum += tmpValue;
                count++;
            }
        }
        var smoothValue = sum / count;
        smoothHist.push(smoothValue);
    }
    return smoothHist;
}

ImageRecognitionLab.getThresholdByPercent = function(hist, percent) {
    var maxValue = _.max(hist);
    var highValues = [];

    _.each(hist, function(value) {
        if (1 - (value / maxValue) < percent / 100) {
            highValues.push(value);
        }
    });

    highValues.sort();
    return highValues[0];
}

ImageRecognitionLab.getThresholdByCountAndPercent = function (hist, count, percent) {
    var maxValue = _.max(hist);
    var highValues = [];

    _.each(hist, function (value) {
        if (1 - (value / maxValue) < percent / 100) {
            highValues.push(value);
        }
    });

    highValues.sort();
    highValues = highValues.reverse();
    highValues = _.first(highValues, count);
    return _.min(highValues);
}