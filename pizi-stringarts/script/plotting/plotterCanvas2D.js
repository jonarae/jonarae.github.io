import { ResetCanvasCompositing } from "./resetCanvasComposting.js";
import { PlotterBase } from "./plotterBase.js";

export class PlotterCanvas2D extends PlotterBase {
    constructor() {
        super();

        this.canvas = Page.Canvas.getCanvas();
        this.context = this.canvas.getContext("2d", { alpha: false });
        this.cssPixel = window.devicePixelRatio || 1;
    }

    resize = function() {
        var newWidth = Math.floor(this.cssPixel * this.canvas.clientWidth);
        var newHeight = Math.floor(this.cssPixel * this.canvas.clientHeight);
    
        if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;
        }
    }

    initialize = function(settings) {
        this.context.fillStyle = settings.backgroundColor;
        this.context.lineJoin = "round";
        ResetCanvasCompositing.resetCanvasCompositing(this.context);
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    finalize = function () {}

    set blur(value) {
        if (value === 0) {
            this.canvas.style.filter = "";
        } else {
            this.canvas.style.filter = `blur(${value}px)`;
            this.canvas.style.filter = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a' x='0' y='0' width='1' height='1'%3E%3CfeGaussianBlur stdDeviation='${value}' result='b'/%3E%3CfeMorphology operator='dilate' radius='${value}'/%3E %3CfeMerge%3E%3CfeMergeNode/%3E%3CfeMergeNode in='b'/%3E%3C/feMerge%3E%3C/filter%3E%3C/svg%3E#a")`;
        }
    }

    drawLines = function(points, compositing, globalAlpha, operation, lineWidth) {
        if (points.length >= 1) {
            ResetCanvasCompositing.applyCanvasCompositing(this.context, compositing, globalAlpha, operation);
            this.context.lineWidth = lineWidth * this.cssPixel;
    
            for (var i = 0; i < points.length; i++) {
                var point = points[i];
    
                this.context.beginPath();
                this.context.moveTo(point.from.x * this.cssPixel, point.from.y * this.cssPixel);
                this.context.lineTo(point.to.x * this.cssPixel, point.to.y * this.cssPixel);
                this.context.stroke();
                this.context.closePath();
            }
    
            ResetCanvasCompositing.resetCanvasCompositing(this.context);
        }
    }

    drawPoints = function(points, fillColor, scale) {
        if (points.length > 0) {
            this.context.fillStyle = fillColor;
            this.context.strokeStyle = "none";
    
            for (var i = 0; i < points.length; i++) {
                var point = points[i];
    
                this.context.beginPath();
                this.context.arc(
                    point.x * this.cssPixel, 
                    point.y * this.cssPixel, 
                    0.5 * scale * this.cssPixel, 
                    0, 
                    2 * Math.PI
                );
                this.context.fill();
                this.context.closePath();
            }
        }
    }

    get size() {
        return {
            width: Math.floor(this.canvas.width / this.cssPixel),
            height: Math.floor(this.canvas.height / this.cssPixel)
        };
    }
}