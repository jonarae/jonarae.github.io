import { PlotterBase } from "./plotterBase.js";
import { XMLWriter } from "../xmlWriter.js";
import { ResetCanvasCompositing } from "./resetCanvasComposting.js";
import { ECompositingOperation } from "../constants.js";

const GAUSSIAN_BLUR = "gaussianBlur";
export class PlotterSVG extends PlotterBase {
    constructor() {
        super();
    }

    resize() {}

    initialize(e) {
        (this.writer = new XMLWriter()),
            (this.hasBlur = e.blur > 0),
            this.writer.addLine('<?xml version="1.0" encoding="UTF-8" standalone="no"?>'),
            this.writer.startBlock('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 '.concat(1e3, " ").concat(1e3, '">')),
            this.hasBlur &&
                (this.writer.startBlock("<defs>"),
                this.writer.startBlock('<filter id="'.concat(GAUSSIAN_BLUR, '" x="0" y="0">')),
                this.writer.addLine('<feGaussianBlur in="SourceGraphic" stdDeviation="'.concat(e.blur, '"/>')),
                this.writer.endBlock("</filter>"),
                this.writer.endBlock("</defs>"),
                this.writer.startBlock('<g filter="url(#'.concat(GAUSSIAN_BLUR, ')">'))),
            this.writer.addLine('<rect fill="white" stroke="none" x="'.concat(-10, '" y="').concat(-10, '" width="').concat(1020, '" height="').concat(1020, '"/>'));
    }

    finalize() {
        this.hasBlur && this.writer.endBlock("</g>"), this.writer.endBlock("</svg>");
    }

    drawLines(e, t, n, r, a) {
        if (e.length >= 1) {
            var i = void 0;
            if ((0, ResetCanvasCompositing.useAdvancedCompositing)()) {
                this.writer.startBlock("<defs>"),
                    this.writer.startBlock('<style type="text/css">'),
                    this.writer.startBlock("<![CDATA["),
                    this.writer.addLine("line { mix-blend-mode: difference; }"),
                    r === ECompositingOperation.LIGHTEN && this.writer.addLine("svg { filter: invert(1); background: black; }"),
                    this.writer.endBlock("]]>"),
                    this.writer.endBlock("</style>"),
                    this.writer.endBlock("</defs>");
                var s = Math.ceil(255 * n),
                    h = (0, ResetCanvasCompositing.computeRawColor)(t);
                i = "rgb("
                    .concat(h.r * s, ", ")
                    .concat(h.g * s, ", ")
                    .concat(h.b * s, ")");
            } else
                (s = (0, useAdvancedCompositing)() ? 255 : 0),
                    (h = (0, ResetCanvasCompositing.computeRawColor)(t)),
                    (i = "rgba("
                        .concat(h.r * s, ", ")
                        .concat(h.g * s, ", ")
                        .concat(h.b * s, ", ")
                        .concat(n, ")"));
            this.writer.startBlock('<g stroke="'.concat(i, '" stroke-width="').concat(a, '" stroke-linecap="round" fill="none">'));
            for (var c = 0, d = e; c < d.length; c++) {
                var l = d[c];
                this.writer.addLine('<line x1="'.concat(l.from.x.toFixed(1), '" y1="').concat(l.from.y.toFixed(1), '" x2="').concat(l.to.x.toFixed(1), '" y2="').concat(l.to.y.toFixed(1), '"/>'));
            }
            this.writer.endBlock("</g>");
        }
    }
    drawPoints(e, t, n) {
        if (e.length > 0) {
            this.writer.startBlock('<g fill="'.concat(t, '" stroke="none">'));
            for (var r = 0, a = e; r < a.length; r++) {
                var o = a[r];
                this.writer.addLine(
                    '<circle cx="'
                        .concat(o.x.toFixed(1), '" cy="')
                        .concat(o.y.toFixed(1), '" r="')
                        .concat(0.5 * n, '"/>')
                );
            }
            this.writer.endBlock("</g>");
        }
    }

    export() {
        const currentDate = Date.now();
        const results = this.writer.result;
        return console.log("Concatenation took ".concat(Date.now() - currentDate, " ms.")), results;
    }

    get size() {
        return { width: 1e3, height: 1e3 };
    }
}