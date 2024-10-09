// export const PlotterBase = function (source, destination) {
//     Object.defineProperty(destination, "__esModule", { value: true }), (destination.PlotterBase = void 0);
//     destination.PlotterBase = function () {
//         this.drawBrokenLine = (e, color, lineOpacity, compostingOperation, scaledThreadSize) => {
//             for (var o = [], i = 0; i < e.length - 1; i++) {
//                 o.push({
//                     from: e[i],
//                     to: e[i + 1]
//                 });
//             }

//             this.drawLines(o, color, lineOpacity, compostingOperation, scaledThreadSize);
//         }
//     };
// };

export class PlotterBase {
    drawBrokenLine(e, color, lineOpacity, compostingOperation, scaledThreadSize) {
        for (var o = [], i = 0; i < e.length - 1; i++) {
            o.push({
                from: e[i],
                to: e[i + 1]
            });
        }

        this.drawLines(o, color, lineOpacity, compostingOperation, scaledThreadSize);
    }
}