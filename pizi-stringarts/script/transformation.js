export class Transformation {
    constructor(original, target) {
        var widthRatio = original.width / target.width,
            heightRatio = original.height / target.height;

        this.scaling = Math.min(widthRatio, heightRatio);
        this.origin = {
            x: 0.5 * (original.width - this.scaling * target.width),
            y: 0.5 * (original.height - this.scaling * target.height)
        };
    }

    transform(e) {
        return {
            x: this.origin.x + e.x * this.scaling,
            y: this.origin.y + e.y * this.scaling
        };
    }
}