import { Parameters } from "../parameters.js";
import { EMode, EShape, ECompositingOperation } from "../constants.js";
import { ResetCanvasCompositing } from "../plotting/resetCanvasComposting.js";
import { ThreadMonochrome } from "./threadMonochrome.js";
import { ThreadRedGreenBlue } from "./threadRedGreenBlue.js";
import { Transformation } from "../transformation.js"

const MIN_SAFE_INTEGER = -9007199254740991;
const TWO_PI = 2 * Math.PI;

function clamp(value, minValue, maxValue) {
    if (value < minValue) {
        return minValue;
    } else if (value > maxValue) {
        return maxValue;
    } else {
        return value;
    }
}
function interpolate(startValue, endValue, factor) {
    return startValue * (1 - factor) + endValue * factor;
}
function getRandomElement(array) {
    if (array.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

export class ThreadComputer {
    constructor(inputImage) {
        this.hiddenCanvasData = null;
        this.sourceImage = inputImage;
        this.hiddenCanvas = document.createElement("canvas");
        this.hiddenCanvasContext = this.hiddenCanvas.getContext("2d");
        this.reset(0.0625, 1);

        this.threads = [];
    }

    drawThread(plotter, numberOfSegmentsDrawn) {
        const lineOpacity = this.lineOpacity;
        const transformation = this.computeTransformation(plotter.size);

        const scaledThreadSize = transformation.scaling * this.hiddenCanvasScale * this.lineThickness;
        const compostingOperation = Parameters.invertColors ? ECompositingOperation.LIGHTEN : ECompositingOperation.DARKEN;

        this.thread.iterateOnThreads(numberOfSegmentsDrawn, function (segments, color) {
            const transformedSegments = [];

            for (let i = 0, len = segments.length; i < len; i++) {
                const transformedSegment = transformation.transform(segments[i]);
                transformedSegments.push(transformedSegment);
            }

            plotter.drawBrokenLine(transformedSegments, color, lineOpacity, compostingOperation, scaledThreadSize);
        });
    }

    drawPegs(canvas) {
        const transformation = this.computeTransformation(canvas.size);
        
        const pegRadius = transformation.scaling * this.hiddenCanvasScale * 0.5;
        const transformedPegs = [];
        
        for (let i = 0, len = this.pegs.length; i < len; i++) {
            const transformedPeg = transformation.transform(this.pegs[i]);
            transformedPegs.push(transformedPeg);
        }
        
        canvas.drawPoints(transformedPegs, "red", pegRadius);
    }

    drawDebugView(e) {
        e.drawImage(this.hiddenCanvas, 0, 0, this.hiddenCanvas.width, this.hiddenCanvas.height);
    }

    computeNextSegments(timeLimit) {
        const startTime = performance.now();
        const targetSegmentCount = Parameters.nbLines;
    
        if (this.nbSegments === targetSegmentCount) {
            return false;
        }
    
        if (this.nbSegments > targetSegmentCount) {
            this.thread.lowerNbSegments(targetSegmentCount);
            this.resetHiddenCanvas();
    
            this.thread.iterateOnThreads(0, (segment, color) => {
                ResetCanvasCompositing.applyCanvasCompositing(
                    this.hiddenCanvasContext,
                    color,
                    this.lineOpacityInternal,
                    ECompositingOperation.LIGHTEN
                );
    
                for (let i = 0; i + 1 < segment.length; i++) {
                    this.drawSegmentOnHiddenCanvas(segment[i], segment[i + 1]);
                }
            });
    
            this.computeError();
            return;
        }
    
        for (let lastColor = null; this.nbSegments < targetSegmentCount; ) {
            if (performance.now() - startTime >= timeLimit) {
                return;
            }
    
            const threadToGrow = this.thread.getThreadToGrow();
            if (lastColor !== threadToGrow.color) {
                ResetCanvasCompositing.applyCanvasCompositing(
                    this.hiddenCanvasContext,
                    threadToGrow.color,
                    this.lineOpacityInternal,
                    ECompositingOperation.LIGHTEN
                );
    
                this.thread.enableSamplingFor(threadToGrow.color);
                lastColor = threadToGrow.color;
    
                this.computeSegment(threadToGrow.thread);
    
                if (this.nbSegments % 100 === 0) {
                    this.computeError();
                }

                this.threads.push({
                    color: threadToGrow.color,
                    from: threadToGrow.thread.at(-2),
                    to: threadToGrow.thread.at(-1)
                });
            }

        }
        return true;
    }

    reset(lineOpacity, lineThickness) {
        (this.lineOpacity = lineOpacity),
            (this.lineThickness = lineThickness),
            (this.hiddenCanvasScale = Parameters.quality),
            Parameters.mode === EMode.MONOCHROME
                ? (this.thread = new ThreadMonochrome())
                : (this.thread = new ThreadRedGreenBlue()),
            this.resetHiddenCanvas(),
            (this.pegs = this.computePegs());
    }

    updateIndicators(callback) {
        callback("pegs-count", this.pegs.length.toString());
        callback("segments-count", this.nbSegments.toString());
        callback("error-average", this.error.average.toString());
        callback("error-mean-square", this.error.meanSquare.toString());
        callback("error-variance", this.error.variance.toString());
    }

    get nbSegments() {
        return this.thread.totalNbSegments;
    }

    get instructions() {
        function findMaxCoordinates(pegs) {
            let maxX = -1;
            let maxY = -1;
        
            for (let peg of pegs) {
                maxX = Math.max(maxX, peg.x);
                maxY = Math.max(maxY, peg.y);
            }
        
            return { maxX, maxY };
        }
        
        const { maxX, maxY } = findMaxCoordinates(this.pegs);

        const pinPositions = this.pegs.map((peg, index) => {
            const x = peg.x.toFixed(2);
            const y = peg.y.toFixed(2);
            return `- PIN ${index}: x=${x}, y=${y}`;
        });

        const steps = this.threads.map(({from, to, color}, index) => {
            const stepNumber = index + 1;
            const isFirstStep = stepNumber === 1;

            if(isFirstStep) {
                return `- First start from ${from.name}\n`;
            }

            const threadColor = color === 1 ? "Red"
                : color === 2 ? "Green"
                : color === 3 ? "Blue"
                : "Black";

            return `${index}. ${threadColor === "Black" ? "" : threadColor + " "} ${to.name}`;
        });

        const isMonochrome = Parameters.mode === EMode.MONOCHROME;
        const colorInfo = [
            `Then here are the steps of the ${this.threads.length} thread with ${isMonochrome ? "black color.": "three colors:"}`,
            isMonochrome ? "" : ["1. Red", "2. Green", "3. Blue"].join("\n")
        ];
        
        const instructionsText = [
            // "Here are instructions to reproduce this in real life.",
            // "Space units used below are abstract, just scale it to whatever size you want. Typically, you can choose 1 unit = 1 millimeter.",
            // `Computed for a total size of ${maxX} x ${maxY}`,
            // `First here are the positions of the ${this.pegs.length} PINS:`,
            // `${pinPositions.join("\n")}`,
            // `${colorInfo.join("\n")}`,
            `Number of Lines: ${this.threads.length}`,
            `Number of Pins: ${this.pegs.length}`,
            "Then here are the steps of the thread:",
            `${steps.join("\n")}`,
        ];

        return instructionsText.filter(text => !!text).join("\n\n");
    }
        
    initializeHiddenCanvasLineProperties() {
        var e = this.lineThickness * this.hiddenCanvasScale;
        e <= 1 ? ((this.lineOpacityInternal = 0.5 * this.lineOpacity * e), (this.hiddenCanvasContext.lineWidth = 1)) : ((this.lineOpacityInternal = 0.5 * this.lineOpacity), (this.hiddenCanvasContext.lineWidth = e));
    }

    computeSegment(thread) {
        let firstPeg, secondPeg;
    
        if (thread.length === 0) {
            const startingSegment = this.computeBestStartingSegment();
            thread.push(startingSegment.peg1);
            firstPeg = startingSegment.peg1;
            secondPeg = startingSegment.peg2;
        } else {
            firstPeg = thread[thread.length - 1];
            const segmentDifference = Math.min(thread.length, 20);
            const recentThreadSegments = thread.slice(-segmentDifference);
            secondPeg = this.computeBestNextPeg(firstPeg, recentThreadSegments);
        }
    
        thread.push(secondPeg);
        this.drawSegmentOnHiddenCanvas(firstPeg, secondPeg);
    }

    resetHiddenCanvas() {
            var computedSize = this.computeBestSize(this.sourceImage, 100 * this.hiddenCanvasScale);
            this.hiddenCanvas.width = computedSize.width;
            this.hiddenCanvas.height = computedSize.height;
            
            (0, ResetCanvasCompositing.resetCanvasCompositing)(this.hiddenCanvasContext);
            
            this.hiddenCanvasContext.drawImage(this.sourceImage, 0, 0, computedSize.width, computedSize.height);

            var imageData = this.hiddenCanvasContext.getImageData(0, 0, computedSize.width, computedSize.height);
            
            this.thread.adjustCanvasData(imageData.data, Parameters.invertColors);
            this.hiddenCanvasContext.putImageData(imageData, 0, 0);
            this.computeError();
            this.initializeHiddenCanvasLineProperties();
    }

    computeError() {
        this.uploadCanvasDataToCPU();
        this.error = { average: 0, variance: 0, meanSquare: 0 };
    
        const pixelCount = this.hiddenCanvasData.width * this.hiddenCanvasData.height;
        const totalPixels = 3 * pixelCount;
    
        this.calculateErrorMetrics(pixelCount, totalPixels);
        this.calculateVariance(pixelCount, totalPixels);
    }
    
    calculateErrorMetrics(pixelCount, totalPixels) {
        for (let n = 0; n < pixelCount; n++) {
            const [red, green, blue] = this.getRGBValues(n);
    
            this.error.average += red + green + blue;
            this.error.meanSquare += red * red + green * green + blue * blue;
        }
    
        this.error.average = Math.round(this.error.average / totalPixels);
        this.error.meanSquare = Math.round(this.error.meanSquare / totalPixels);
    }
    
    calculateVariance(pixelCount, totalPixels) {
        for (let n = 0; n < pixelCount; n++) {
            const [red, green, blue] = this.getRGBValues(n);
            const averageColor = (red + green + blue) / 3;
            const diff = averageColor - this.error.average;
    
            this.error.variance += diff * diff;
        }
    
        this.error.variance = Math.round(this.error.variance / totalPixels);
    }
    
    getRGBValues(pixelIndex) {
        const r = 127 - this.hiddenCanvasData.data[4 * pixelIndex + 0];
        const g = 127 - this.hiddenCanvasData.data[4 * pixelIndex + 1];
        const b = 127 - this.hiddenCanvasData.data[4 * pixelIndex + 2];
    
        return [r, g, b];
    }

    computeTransformation(e) {
        return new Transformation(e, this.hiddenCanvas);
    }

    drawSegmentOnHiddenCanvas(e, t) {
        this.hiddenCanvasContext.beginPath(),
        this.hiddenCanvasContext.moveTo(e.x, e.y),
        this.hiddenCanvasContext.lineTo(t.x, t.y),
        this.hiddenCanvasContext.stroke(),
        this.hiddenCanvasContext.closePath(),
        (this.hiddenCanvasData = null);
    }

    computeBestStartingSegment() {
        const potentialSegments = [];
        let maxPotential = MIN_SAFE_INTEGER;
        const stepSize = 1 + Math.floor(this.pegs.length / 100);
    
        for (let i = 0; i < this.pegs.length; i += stepSize) {
            for (let j = i + 1; j < this.pegs.length; j += stepSize) {
                const peg1 = {
                    ...this.pegs[i],
                    name: `PIN ${i}`
                };
                const peg2 = {
                    ...this.pegs[j],
                    name: `PIN ${j}`
                };
                if (!this.arePegsTooClose(peg1, peg2)) {
                    const segmentPotential = this.computeSegmentPotential(peg1, peg2);

                    if (segmentPotential > maxPotential) {
                        maxPotential = segmentPotential;
                        potentialSegments.length = 0;
                        potentialSegments.push({ peg1, peg2 });
                    } else if (segmentPotential === maxPotential) {
                        potentialSegments.push({ peg1, peg2 });
                    }
                }
            }
        }
    
        return getRandomElement(potentialSegments);
    }
        
    computeBestNextPeg(peg1, threads) {
        const potentialNextPegs = [];
        let maxPotential = MIN_SAFE_INTEGER;
    
        for (let index = 0; index < this.pegs.length; index++) {
            const currentPeg = {
                ...this.pegs[index],
                name: `PIN ${index}`
            };
            if (!this.arePegsTooClose(peg1, currentPeg) && !threads.includes(currentPeg)) {
                const segmentPotential = this.computeSegmentPotential(peg1, currentPeg);
                if (segmentPotential > maxPotential) {
                    maxPotential = segmentPotential;
                    potentialNextPegs.length = 0;
                    potentialNextPegs.push(currentPeg);
                } else if (segmentPotential === maxPotential) {
                    potentialNextPegs.push(currentPeg);
                }
            }
        }
    
        return getRandomElement(potentialNextPegs);
    }
        
    uploadCanvasDataToCPU() {
        if (null === this.hiddenCanvasData) {
            var e = this.hiddenCanvas.width,
                t = this.hiddenCanvas.height;
            this.hiddenCanvasData = this.hiddenCanvasContext.getImageData(0, 0, e, t);
        }
    }

    computeSegmentPotential(e, t) {
        this.uploadCanvasDataToCPU();
        for (var n, r, a, o, i = 0, s = ((r = t), (a = (n = e).x - r.x), (o = n.y - r.y), Math.sqrt(a * a + o * o)), h = Math.ceil(s), c = 0; c < h; c++) {
            var d = (c + 1) / (h + 1),
                u = { x: interpolate(e.x, t.x, d), y: interpolate(e.y, t.y, d) };
            i += 127 - (this.sampleCanvasData(u) + 255 * this.lineOpacityInternal);
        }
        return i / h;
    }

    sampleCanvasData(e) {
        var t = this.hiddenCanvasData.width,
            n = this.hiddenCanvasData.height,
            r = clamp(Math.floor(e.x), 0, t - 1),
            a = clamp(Math.ceil(e.x), 0, t - 1),
            o = clamp(Math.floor(e.y), 0, n - 1),
            i = clamp(Math.ceil(e.y), 0, n - 1),
            s = this.sampleCanvasPixel(r, o),
            h = this.sampleCanvasPixel(a, o),
            c = this.sampleCanvasPixel(r, i),
            u = this.sampleCanvasPixel(a, i),
            p = e.x % 1,
            g = interpolate(s, h, p),
            f = interpolate(c, u, p);
        return interpolate(g, f, e.y % 1);
    }
    sampleCanvasPixel(e, t) {
        var n = 4 * (e + t * this.hiddenCanvasData.width);
        return this.thread.sampleCanvas(this.hiddenCanvasData.data, n);
    }
    computeBestSize(e, t) {
        var n = t / Math.max(e.width, e.height);
        return { width: Math.ceil(e.width * n), height: Math.ceil(e.height * n) };
    }
    computePegs() {
        var e,
            t = 1e3;
        e = (h = this.hiddenCanvas.width / this.hiddenCanvas.height) > 1 ? { width: t, height: Math.round(t / h) } : { width: Math.round(t * h), height: t };
        var n = Parameters.shape,
            a = Parameters.pegsCount,
            o = [];
        if (n === EShape.RECTANGLE) {
            this.arePegsTooClose = function (e, t) {
                return e.x === t.x || e.y === t.y;
            };
            var i = e.width,
                s = e.height,
                h = s / i,
                d = Math.round((0.5 * a) / (1 + h)),
                l = Math.round(0.5 * (a - 2 * d));
            o.push({ x: 0, y: 0 });
            for (var u = 1; u < d; u++) o.push({ x: i * (u / d), y: 0 });
            o.push({ x: i, y: 0 });
            for (var p = 1; p < l; p++) o.push({ x: i, y: s * (p / l) });
            for (o.push({ x: i, y: s }), u = d - 1; u >= 1; u--) o.push({ x: i * (u / d), y: s });
            for (o.push({ x: 0, y: s }), p = l - 1; p >= 1; p--) o.push({ x: 0, y: s * (p / l) });
        } else {
            this.arePegsTooClose = function (e, t) {
                var n = Math.abs(e.angle - t.angle);
                return Math.min(n, TWO_PI - n) <= TWO_PI / 16;
            };
            for (var g = 0.5 * e.width, f = 0.5 * e.height, v = (Math.PI * (3 * (g + f) - Math.sqrt((3 * g + f) * (g + 3 * f)))) / a, m = 0; o.length < a; ) {
                var b = Math.cos(m),
                    y = Math.sin(m),
                    C = { x: g * (1 + b), y: f * (1 + y), angle: m };
                o.push(C), (m += v / Math.sqrt(g * g * y * y + f * f * b * b));
            }
        }
        for (var P = 0, w = o; P < w.length; P++) ((C = w[P]).x *= this.hiddenCanvas.width / e.width), (C.y *= this.hiddenCanvas.height / e.height);
        return o;
    }
}