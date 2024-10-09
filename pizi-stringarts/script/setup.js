export const setup = {
    downloadTextFile: function (e, t) {
        var n = "text/plain",
            r = new Blob([e], { type: n });
        if (void 0 !== window.navigator && void 0 !== window.navigator.msSaveBlob) window.navigator.msSaveBlob(r, t);
        else {
            var a = URL.createObjectURL(r),
                o = document.createElement("a");
            (o.download = t),
                (o.href = a),
                (o.dataset.downloadurl = "".concat(n, ":").concat(o.download, ":").concat(o.href)),
                (o.style.display = "none"),
                document.body.appendChild(o),
                o.click(),
                document.body.removeChild(o),
                setTimeout(function () {
                    URL.revokeObjectURL(a);
                }, 5e3);
        }
    },
    getQueryStringValue: function (e) {
        var t = window.location.href,
            n = t.indexOf("?");
        if (n >= 0) {
            var r = t.substring(n + 1);
            if (r.length > 0)
                for (var a = 0, o = r.split("&"); a < o.length; a++) {
                    var i = o[a].split("=");
                    if (2 === i.length && decodeURIComponent(i[0]) === e) return decodeURIComponent(i[1]);
                }
        }
        return null;
    },
    declarePolyfills: function () {
        "function" != typeof Array.prototype.includes &&
            (console.log("Declaring Array.includes polyfill..."),
            Object.defineProperty(Array.prototype, "includes", {
                value: function (e) {
                    return this.indexOf(e) >= 0;
                },
            })),
            "function" != typeof String.prototype.repeat &&
                (console.log("Declaring String.repeat polyfill..."),
                Object.defineProperty(String.prototype, "repeat", {
                    value: function (e) {
                        if (e < 0 || e === 1 / 0) throw new RangeError();
                        for (var t = "", n = 0; n < e; n++) t += this;
                        return t;
                    },
                }));
    }
};