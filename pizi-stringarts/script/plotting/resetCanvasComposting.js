import { EColor, ECompositingOperation } from "../constants.js"

function setRedBlueGreen(mode) {
    return mode === EColor.MONOCHROME
        ? { r: 1, g: 1, b: 1 }
        : {
            r: mode === EColor.RED ? 1 : 0,
            g: mode === EColor.GREEN ? 1 : 0,
            b: mode === EColor.BLUE ? 1 : 0
        };
}

let advancedCompostingParameter = true;

function useAdvancedCompositing() {
    return advancedCompostingParameter;
}

export const ResetCanvasCompositing = {
    useAdvancedCompositing,

    computeRawColor: setRedBlueGreen,

    applyCanvasCompositing: function (e, t, n, a) {
        var h = setRedBlueGreen(t);
        if (advancedCompostingParameter) {
            var c = a === ECompositingOperation.LIGHTEN ? "lighter" : "difference";
            if (((e.globalCompositeOperation = c), e.globalCompositeOperation === c)) {
                var d = Math.ceil(255 * n);
                return void (e.strokeStyle = "rgb("
                    .concat(h.r * d, ", ")
                    .concat(h.g * d, ", ")
                    .concat(h.b * d, ")"));
            }
            advancedCompostingParameter = false;
            Page.Demopage.setErrorMessage(
                "advanced-compositing-not-supported",
                "Your browser does not support canvas2D compositing '"
                    .concat(c, "'. The project will not run as expected.")
            );
        }
        s(e),
            a === r.DARKEN && ((h.r = 1 - h.r), (h.g = 1 - h.g), (h.b = 1 - h.b)),
            (e.strokeStyle = "rgba("
                .concat(255 * h.r, ", ")
                .concat(255 * h.g, ", ")
                .concat(255 * h.b, ", ")
                .concat(n, ")"));
    },

    resetCanvasCompositing: function s(e) {
        e.globalCompositeOperation = "source-over";
    }
}