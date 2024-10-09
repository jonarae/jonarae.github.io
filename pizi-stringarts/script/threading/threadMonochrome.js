import { ThreadBase } from "./threadBase.js";
import { EColor } from "../constants.js";

export class ThreadMonochrome extends ThreadBase {
    constructor() {
        super();
        this.threadPegs = [];
    }

    get totalNbSegments() {
        return this.computeNbSegments(this.threadPegs);
    }

    lowerNbSegments(e) {
        this.lowerNbSegmentsForThread(this.threadPegs, e);
    }

    iterateOnThreads(segmentCount, callback) {
        this.iterateOnThread(this.threadPegs, EColor.MONOCHROME, segmentCount, callback);
    }

    getThreadToGrow() {
        return {
            thread: this.threadPegs,
            color: EColor.MONOCHROME
        };
    }

    adjustCanvasData(canvasData, isInverted) {
        const adjustmentFunction = isInverted 
            ? (value) => (255 - value) / 2
            : (value) => value / 2;
    
        const pixelCount = canvasData.length / 4;
    
        for (let i = 0; i < pixelCount; i++) {
            const averageColorValue = (canvasData[4 * i + 0] + 
                                       canvasData[4 * i + 1] + 
                                       canvasData[4 * i + 2]) / 3;
    
            const adjustedValue = adjustmentFunction(averageColorValue);    
            canvasData[4 * i + 0] = adjustedValue; // Red
            canvasData[4 * i + 1] = adjustedValue; // Green
            canvasData[4 * i + 2] = adjustedValue; // Blue
        }
    }

    enableSamplingFor() {
        null === this.sampleCanvas &&
            (this.sampleCanvas = function (e, t) {
                return e[t + 0];
            });
    }
}