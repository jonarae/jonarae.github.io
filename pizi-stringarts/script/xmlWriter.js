export class XMLWriter {
    constructor() {
        this.indentationLevel = 0;
        this.lines = [];
    }

    get result() {
        return this.lines.join("\n");
    }

    startBlock(e) {
        this.addLine(e), this.indentationLevel++;
    }

    endBlock(e) {
        this.indentationLevel--, this.addLine(e);
    }

    addLine(e) {
        this.lines.push(this.prefix + e);
    }

    get prefix() {
        return "\t".repeat(this.indentationLevel);
    }
}