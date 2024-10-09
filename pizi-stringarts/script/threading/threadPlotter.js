import { Parameters } from "../parameters.js";

export class ThreadPlotter {
    constructor(plotter, threadComputer) {
        this.plotter = plotter;
        this.threadComputer = threadComputer;
        this.nbSegmentsDrawn = 0;
    } 

    reset() {
        this.nbSegmentsDrawn = 0;
    }

    plot() {
        if (this.nbSegmentsDrawn !== this.threadComputer.nbSegments) {
            if(this.nbSegmentsDrawn > this.threadComputer.nbSegments) {
                this.nbSegmentsDrawn = 0;
            }
            const isFirstIteration = this.nbSegmentsDrawn === 0;

            if (isFirstIteration) {
                var e = {
                    backgroundColor: Parameters.invertColors ? "black" : "white",
                    blur: Parameters.blur
                };

                this.plotter.resize();
                this.plotter.initialize(e);
                
                if(Parameters.displayPegs) {
                    this.threadComputer.drawPegs(this.plotter);
                    this.threadComputer.drawThread(this.plotter, 0);
                    this.plotter.finalize();
                }

            } else {
                this.threadComputer.drawThread(this.plotter, this.nbSegmentsDrawn);
            }

            this.nbSegmentsDrawn = this.threadComputer.nbSegments;
        }
    };
}