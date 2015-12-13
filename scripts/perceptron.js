var ImageRecognitionLab = ImageRecognitionLab || {}

ImageRecognitionLab.Perceptron = (function () {
    function Perceptron(nIn, nHidden, nOut, alpha, precision, trainingSpeed) {
        this.alpha = alpha;
        this.precision = precision;
        this.trainingSpeed = trainingSpeed;
        this.hiddenLayer = initializeLayer(nIn, nHidden);
        this.outLayer = initializeLayer(nHidden, nOut);
        this.dictionary = initializeCharList();

        function initializeLayer(demensionW, neuronCount) {
            var layer = new Array(neuronCount);
            return _.map(layer, function () {
                return { w: initializeRandomW(demensionW, -1, 1) };
            });
        }

        function initializeRandomW(demensionW, wMin, wMax) {
            var w = new Array(demensionW);
            return _.map(w, function () {
                return Math.random() * (wMax - wMin) + wMin;
            });
        }

        function initializeCharList() {
            //var alphabetEn = "abcdefghijklmnopqrstuvwxyz".split('');
            //var alphabetRu = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя".split('');
            //var numbers = "1234567890".split('');
            //return alphabetEn.concat(alphabetRu).concat(numbers);
            return ["1", "2", "3"];
        }
    }

    Perceptron.prototype.sum = function(a, b) {
        if (a.length !== b.length) {
            throw new Error("Cannot sum two vectors with different length");
        }
        var scalarProduct = _.map(_.zip(a, b), function (item) {
            return item[0] * item[1];
        });
        return _.reduce(scalarProduct, function (sum, item) {
            return sum + item;
        }, 0);
    }

    Perceptron.prototype.activationFunction = function(x) {
        return 1 / (1 + Math.exp(-this.alpha * x));
    }

    Perceptron.prototype.calculateSigmaForOutLevel = function(expected, actual) {
        return actual * (1 - actual) * (expected - actual);
    }

    Perceptron.prototype.calculateSigmaForHiddenLevel = function (neuronIndex, sigmaListForOutLevel, hiddenLayerResults) {
        var sum = 0;
        for (var k = 0; k < this.outLayer.length; k++) {
            sum += sigmaListForOutLevel[k] * this.outLayer[k].w[neuronIndex];
        }
        return hiddenLayerResults[neuronIndex] * (1 - hiddenLayerResults[neuronIndex]) * sum;
    }

    Perceptron.prototype.train = function (knownData) {
        var self = this;
        var iterationCount = 0;
        var errorCount;
        do {
            iterationCount++;
            errorCount = 0;
            _.each(knownData, function (item) {
                // forward pass
                var hiddenLayerResults = _.map(self.hiddenLayer, function (hiddenNeuron) {
                    var sumResult = self.sum(item.x, hiddenNeuron.w);
                    return self.activationFunction(sumResult);
                });
                var outLayerResults = _.map(self.outLayer, function (outNeuron) {
                    var sumResult = self.sum(hiddenLayerResults, outNeuron.w);
                    return self.activationFunction(sumResult);
                });
                //reverse pass
                var expectedOutIndex = _.indexOf(self.dictionary, item.char);
                //correct out layer weights
                var sigmaList = new Array(outLayerResults.length);
                _.each(outLayerResults, function(value, index) {
                    if (index === expectedOutIndex) {
                        if ((1 - value) > self.precision) {
                            errorCount++;
                            var sigma = self.calculateSigmaForOutLevel(1, value);
                            sigmaList[index] = sigma;
                            self.outLayer[index].w = _.map(self.outLayer[index].w, function (oldW, indexW) {
                                return oldW + self.trainingSpeed * sigma * hiddenLayerResults[indexW];
                            });
                        } else {
                            sigmaList[index] = 0;
                        }
                    } else {
                        if (value > self.precision) {
                            errorCount++;
                            var sigma = self.calculateSigmaForOutLevel(0, value);
                            sigmaList[index] = sigma;
                            self.outLayer[index].w = _.map(self.outLayer[index].w, function (oldW, indexW) {
                                return oldW + self.trainingSpeed * sigma * hiddenLayerResults[indexW];
                            });
                        } else {
                            sigmaList[index] = 0;
                        }
                    }
                });
                //correct hidden layer weights
                _.each(self.hiddenLayer, function(neuron, index) {
                    var sigma = self.calculateSigmaForHiddenLevel(index, sigmaList, hiddenLayerResults);
                    self.hiddenLayer[index].w = _.map(self.hiddenLayer[index].w, function (oldW, indexW) {
                        return oldW + self.trainingSpeed * sigma * item.x[indexW];
                    });
                });
            });
        } while (errorCount > 0 && iterationCount < 1000);
    }

    Perceptron.prototype.classify = function (x) {
        var self = this;
        var hiddenLayerResults = _.map(self.hiddenLayer, function (hiddenNeuron) {
            var sumResult = self.sum(x, hiddenNeuron.w);
            return self.activationFunction(sumResult);
        });
        var outLayerResults = _.map(self.outLayer, function (outNeuron) {
            var sumResult = self.sum(hiddenLayerResults, outNeuron.w);
            return self.activationFunction(sumResult);
        });
        var maxWeight = _.max(outLayerResults);
        var index = _.indexOf(outLayerResults, maxWeight);
        return self.dictionary[index];

    }

    return Perceptron;
})();
