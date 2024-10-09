export class ThreadBase  {
    sampleCanvas = null;

    lowerNbSegmentsForThread(segmentsArray, maxSegments) {
        if (maxSegments > 0) {
            segmentsArray.length = Math.min(segmentsArray.length, maxSegments + 1);
        } else {
            segmentsArray.length = 0;
        }
    }

    computeNbSegments(threadPegs) {
        if (threadPegs.length > 1) {
            return threadPegs.length - 1;
        } else {
            return 0;
        }
    }

    iterateOnThread(pegs, color, segmentCount, callback) {
        const numberOfSegments = this.computeNbSegments(pegs);
    
        if (segmentCount < numberOfSegments) {
            callback(pegs.slice(segmentCount), color);
        }
    }
}