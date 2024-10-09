import {setup} from "./setup.js";

var C = [];
function P() {
    for (var e = 0, t = C; e < t.length; e++) (0, t[e])();
}

var w = [];
function O() {
    for (var e = 0, t = w; e < t.length; e++) (0, t[e])();
}

const SHAPE_TABS_ID = "shape-tabs-id",
    PEGS_RANGE_ID = "pegs-range-id",
    QUALITY_TABS_ID = "quality-tabs-id",
    THREAD_MODE_TABS_ID = "thread-mode-tabs-id",
    OPACITY_RANGE_ID = "opacity-range-id",
    THICKNESS_RANGE_ID = "thickness-range-id",
    DISPLAY_PEGS_CHECKBOX_ID = "display-pegs-checkbox-id",
    INVERT_COLORS_CHECKBOX_ID = "invert-colors-checkbox-id",
    SHOW_INDICATORS_CHECKBOX_ID = "show-indicators-checkbox-id",
    BLUR_RANGE_ID = "blur-range-id",
    INSTRUCTIONS_DOWNLOAD_ID = "instructions-download-id";

var isDebugMode = "1" === setup.getQueryStringValue("debug");

const execute = function () {
    Page.Tabs.addObserver(SHAPE_TABS_ID, O);
    Page.Range.addLazyObserver(PEGS_RANGE_ID, O);
    Page.Tabs.addObserver(QUALITY_TABS_ID, O);
    Page.Tabs.addObserver(THREAD_MODE_TABS_ID, O);
    Page.Range.addLazyObserver(OPACITY_RANGE_ID, O);
    Page.Range.addLazyObserver(THICKNESS_RANGE_ID, O);
    Page.Checkbox.addObserver(DISPLAY_PEGS_CHECKBOX_ID, P);
    Page.Checkbox.addObserver(INVERT_COLORS_CHECKBOX_ID, O);
    Page.Canvas.Observers.canvasResize.push(P);

    function showIndicators() {
        var showIndicators = Page.Checkbox.isChecked(SHOW_INDICATORS_CHECKBOX_ID);
        Page.Canvas.setIndicatorsVisibility(showIndicators);
    }
    Page.Canvas.setIndicatorVisibility("error-average", isDebugMode);
    Page.Canvas.setIndicatorVisibility("error-mean-square", isDebugMode);
    Page.Canvas.setIndicatorVisibility("error-variance", isDebugMode);
    Page.Checkbox.addObserver(SHOW_INDICATORS_CHECKBOX_ID, showIndicators);
    showIndicators();

    function setDownloadInstructionsVisibility() {
        // const isMonochrome = pageObject.mode === h.MONOCHROME;
        // const isDarkMode = pageObject.invertColors;
        // const shouldShowDownloadInstructions = isMonochrome && !isDarkMode;
        const shouldShowDownloadInstructions = true;
        Page.Controls.setVisibility(INSTRUCTIONS_DOWNLOAD_ID, shouldShowDownloadInstructions);
    }

    Page.Tabs.addObserver(THREAD_MODE_TABS_ID, setDownloadInstructionsVisibility);
    Page.Checkbox.addObserver(INVERT_COLORS_CHECKBOX_ID, setDownloadInstructionsVisibility);
    setDownloadInstructionsVisibility();
};

execute();

export const Parameters = {
    addFileUploadObserver: function (e) {
        Page.FileControl.addUploadObserver("input-image-upload-button", function (blobArray) {
            if (1 === blobArray.length) {
                Page.Canvas.showLoader(true);
                const fileReader = new FileReader();

                fileReader.onload = function () {
                    const image = new Image();
                    image.addEventListener("load", function () {
                        e(image);
                    });
                    image.src = fileReader.result;
                }

                fileReader.readAsDataURL(blobArray[0]);
            }
        });
    },

    get debug() {
        return isDebugMode;
    },

    get shape() {
        return Page.Tabs.getValues(SHAPE_TABS_ID)[0];
    },

    get pegsCount() {
        return Page.Range.getValue(PEGS_RANGE_ID);
    },

    get quality() {
        return Page.Tabs.getValues(QUALITY_TABS_ID)[0];
    },

    get mode() {
        return Page.Tabs.getValues(THREAD_MODE_TABS_ID)[0];
    },

    get nbLines() {
        return Page.Range.getValue("lines-range-id");
    },

    get linesOpacity() {
        var e = Page.Range.getValue(OPACITY_RANGE_ID);
        return Math.pow(2, e - 7);
    },

    get linesThickness() {
        return Page.Range.getValue(THICKNESS_RANGE_ID);
    },

    get displayPegs() {
        return Page.Checkbox.isChecked(DISPLAY_PEGS_CHECKBOX_ID);
    },

    get invertColors() {
        return Page.Checkbox.isChecked(INVERT_COLORS_CHECKBOX_ID);
    },

    get showIndicators() {
        return Page.Checkbox.isChecked(SHOW_INDICATORS_CHECKBOX_ID);
    },

    addRedrawObserver: function (callback) {
        C.push(callback);
    },

    addResetObserver: function (e) {
        w.push(e);
    },

    get blur() {
        return Page.Range.getValue(BLUR_RANGE_ID);
    },

    addBlurChangeObserver: function (e) {
        Page.Range.addObserver(BLUR_RANGE_ID, e);
    },

    addDownloadObserver: function (e) {
        Page.FileControl.addDownloadObserver("result-download-id", e);
    },

    addDownloadInstructionsObserver: function (e) {
        Page.FileControl.addDownloadObserver(INSTRUCTIONS_DOWNLOAD_ID, e);
    }
};
