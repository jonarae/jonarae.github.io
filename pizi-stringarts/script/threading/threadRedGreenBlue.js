import { EColor } from "../constants.js";
import { ThreadBase } from "./threadBase.js";

export class ThreadRedGreenBlue extends ThreadBase {
    constructor() {
        super();

        this.threadPegsRed = [];
        this.threadPegsGreen = [];
        this.threadPegsBlue = [];
    }

    get totalNbSegments() {
        return this.computeNbSegments(this.threadPegsRed)
            + this.computeNbSegments(this.threadPegsGreen)
            + this.computeNbSegments(this.threadPegsBlue);
    }

    lowerNbSegments(e) {
        var computedSegmentsPartition = this.computeIdealSegmentsRepartition(e);
        this.lowerNbSegmentsForThread(this.threadPegsRed, computedSegmentsPartition.red);
        this.lowerNbSegmentsForThread(this.threadPegsGreen, computedSegmentsPartition.green);
        this.lowerNbSegmentsForThread(this.threadPegsBlue, computedSegmentsPartition.blue);
    }

    iterateOnThreads(totalSegmentCount, callback) {
        var segmentCount = this.computeIdealSegmentsRepartition(totalSegmentCount);
        this.iterateOnThread(this.threadPegsRed, EColor.RED, segmentCount.red, callback),
        this.iterateOnThread(this.threadPegsGreen, EColor.GREEN, segmentCount.green, callback),
        this.iterateOnThread(this.threadPegsBlue, EColor.BLUE, segmentCount.blue, callback);
    }

    getThreadToGrow() {
        const segmentsPartition = this.computeIdealSegmentsRepartition(this.totalNbSegments + 1);
        const shouldGrowRed = segmentsPartition.red > 0 && this.threadPegsRed.length < segmentsPartition.red + 1;
        if(shouldGrowRed) {
            return {
                thread: this.threadPegsRed,
                color: EColor.RED
            };
        }

        const shouldGrowGreen = segmentsPartition.green > 0 && this.threadPegsGreen.length < segmentsPartition.green + 1;
        if(shouldGrowGreen) {
            return {
                thread: this.threadPegsGreen,
                color: EColor.GREEN
            };
        }
        
        return {
            thread: this.threadPegsBlue,
            color: EColor.BLUE
        };
    }

    adjustCanvasData(e, t) {
        var n,
            r = 0,
            a = 0,
            o = 0;
        n = t
            ? function (e) {
                    return (255 - e) / 2;
                }
            : function (e) {
                    return e / 2;
                };
        for (var i = e.length / 4, s = 0; s < i; s++)
            (r += e[4 * s + 0]), (a += e[4 * s + 1]), (o += e[4 * s + 2]), (e[4 * s + 0] = n(e[4 * s + 0])), (e[4 * s + 1] = n(e[4 * s + 1])), (e[4 * s + 2] = n(e[4 * s + 2]));
        t || ((r = 255 * i - r), (a = 255 * i - a), (o = 255 * i - o));
        var h = r + a + o;
        (this.frequencyRed = r / h), (this.frequencyGreen = a / h), (this.frequencyBlue = o / h);
    }

    enableSamplingFor(threadColor) {
        const color = threadColor === EColor.RED ? 0
            : threadColor === EColor.GREEN ? 1
            : 2;

        this.sampleCanvas = function (e, n) {
            return e[n + color];
        };
    }

    computeIdealSegmentsRepartition(totalSegmentCount) {
        const initialRedSegmentCount = totalSegmentCount * this.frequencyRed;
        const initialGreenSegmentCount = totalSegmentCount * this.frequencyGreen;
        const initialBlueSegmentCount = totalSegmentCount * this.frequencyBlue;
        const segmentCount = {
            red: Math.floor(initialRedSegmentCount),
            green: Math.floor(initialGreenSegmentCount),
            blue: Math.floor(initialBlueSegmentCount)
        };

        while (segmentCount.red + segmentCount.green + segmentCount.blue < totalSegmentCount) {
            const currentTotalSegmentCount = Math.max(1, segmentCount.red + segmentCount.green + segmentCount.blue);

            const redSegmentPartition = initialRedSegmentCount - segmentCount.red / currentTotalSegmentCount;
            const greenSegmentPartition = initialGreenSegmentCount - segmentCount.green / currentTotalSegmentCount;
            const blueSegmentPartition = initialBlueSegmentCount - segmentCount.blue / currentTotalSegmentCount;

            redSegmentPartition > greenSegmentPartition && redSegmentPartition > blueSegmentPartition
                ? segmentCount.red++
                : greenSegmentPartition > redSegmentPartition && greenSegmentPartition > blueSegmentPartition
                    ? segmentCount.green++
                    : segmentCount.blue++;
        }

        return segmentCount;
    }
}