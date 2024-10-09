import { setup } from "./setup.js";
import { Parameters } from "./parameters.js";
import { ThreadComputer } from "./threading/threadComputer.js";
import { PlotterCanvas2D } from "./plotting/plotterCanvas2D.js";
import { PlotterSVG } from "./plotting/plotterSvg.js";
import { ThreadPlotter } from "./threading/threadPlotter.js";

let threadPlotter = null;
let threadComputer = null;
let reset = true;
const plotterCanvas2dInstance = new PlotterCanvas2D();

let segmentCounter = 0;

export const execute = function () {
    setupObservers();
    setupInitialBlur();
    loadImage("images/pizi_logo.jpg");
    setupDownloadObservers();
};

function setupObservers() {
    Parameters.addRedrawObserver(resetPlotter);
    Parameters.addResetObserver(setResetToTrue);
    Parameters.addBlurChangeObserver(setBlur);
    Parameters.addFileUploadObserver(initializeThreadPlotter);
}

function setupInitialBlur() {
    setBlur(Parameters.blur);
}

function loadImage(url) {
    Page.Canvas.showLoader(true);
    const inputImage = new Image();
    inputImage.addEventListener("load", () => {
        initializeThreadPlotter(inputImage);
        requestAnimationFrame(drawImage);
    });
    inputImage.src = url;
    inputImage.setAttribute("crossOrigin", "");
}

function setupDownloadObservers() {
    Parameters.addDownloadObserver(downloadSvg);
    Parameters.addDownloadInstructionsObserver(downloadInstructions);
}

function downloadSvg() {
    const plotterSvg = new PlotterSVG();
    const threadPlotter = new ThreadPlotter(plotterSvg, threadComputer);
    threadPlotter.plot();
    const svgResults = plotterSvg.export();
    setup.downloadTextFile(svgResults, "image-as-threading.svg");
}

function downloadInstructions() {
    const instructions = threadComputer.instructions;
    setup.downloadTextFile(instructions, "image-as-threading_instructions.txt");
}

function resetPlotter() {
    if (threadPlotter !== null) {
        threadPlotter.reset();
    }
}

function setResetToTrue() {
    reset = true;
}

function drawImage() {
    if (reset) {
        threadComputer.reset(Parameters.linesOpacity, Parameters.linesThickness);
        threadPlotter.reset();
        reset = false;
    }

    const TIME_LIMIT = 20;
    threadComputer.computeNextSegments(TIME_LIMIT);

    if (Parameters.showIndicators) {
        threadComputer.updateIndicators(Page.Canvas.setIndicatorText);
    }

    threadPlotter.plot();

    if (Parameters.debug) {
        threadComputer.drawDebugView(plotterCanvas2dInstance.context);
    }

    requestAnimationFrame(drawImage);
}

function setBlur(blurSetting) {
    plotterCanvas2dInstance.blur = blurSetting;
}

function initializeThreadPlotter(inputImage) {
    Page.Canvas.showLoader(false);
    threadComputer = new ThreadComputer(inputImage);
    threadPlotter = new ThreadPlotter(plotterCanvas2dInstance, threadComputer);
    reset = true;
}