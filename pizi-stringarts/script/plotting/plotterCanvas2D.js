import { ResetCanvasCompositing } from "./resetCanvasComposting.js";
import { PlotterBase } from "./plotterBase.js";

export class PlotterCanvas2D extends PlotterBase {
    constructor() {
        super();

        this.canvas = Page.Canvas.getCanvas();
        this.context = this.canvas.getContext("2d", { alpha: false });
        this.cssPixel = window.devicePixelRatio || 1;
    }

    resize = function () {
        var e = Math.floor(this.cssPixel * this.canvas.clientWidth),
            t = Math.floor(this.cssPixel * this.canvas.clientHeight);
        (this.canvas.width === e && this.canvas.height === t) || ((this.canvas.width = e), (this.canvas.height = t));
    }

    initialize = function (e) {
        (this.context.fillStyle = e.backgroundColor), (this.context.lineJoin = "round"), (0, ResetCanvasCompositing.resetCanvasCompositing)(this.context), this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    finalize = function () {}

    set blur(e) {
        0 === e
            ? (this.canvas.style.filter = "")
            : ((this.canvas.style.filter = "blur(".concat(e, "px)")),
                (this.canvas.style.filter = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a' x='0' y='0' width='1' height='1'%3E%3CfeGaussianBlur stdDeviation='"
                    .concat(e, "' result='b'/%3E%3CfeMorphology operator='dilate' radius='")
                    .concat(e, "'/%3E %3CfeMerge%3E%3CfeMergeNode/%3E%3CfeMergeNode in='b'/%3E%3C/feMerge%3E%3C/filter%3E%3C/svg%3E#a\")")));
    }

    drawLines = function (e, t, n, r, a) {
        if (e.length >= 1) {
            (0, ResetCanvasCompositing.applyCanvasCompositing)(this.context, t, n, r), (this.context.lineWidth = a * this.cssPixel);
            for (var i = 0, s = e; i < s.length; i++) {
                var h = s[i];
                this.context.beginPath(),
                    this.context.moveTo(h.from.x * this.cssPixel, h.from.y * this.cssPixel),
                    this.context.lineTo(h.to.x * this.cssPixel, h.to.y * this.cssPixel),
                    this.context.stroke(),
                    this.context.closePath();
            }
            (0, ResetCanvasCompositing.resetCanvasCompositing)(this.context);
        }
    }

    drawPoints = function (e, t, n) {
        if (e.length > 0) {
            (this.context.fillStyle = t), (this.context.strokeStyle = "none");
            for (var r = 0, a = e; r < a.length; r++) {
                var o = a[r];
                this.context.beginPath(), this.context.arc(o.x * this.cssPixel, o.y * this.cssPixel, 0.5 * n * this.cssPixel, 0, 2 * Math.PI), this.context.fill(), this.context.closePath();
            }
        }
    }

    get size() {
        return { width: Math.floor(this.canvas.width / this.cssPixel), height: Math.floor(this.canvas.height / this.cssPixel) };
    }
}