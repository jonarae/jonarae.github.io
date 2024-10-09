export const webUtilityToolkit = function () {
    Object.defineProperty(exports, "__esModule", { value: true });

    // Exported functions
    exports.declarePolyfills = declarePolyfills;
    exports.downloadTextFile = downloadTextFile;
    exports.getQueryStringValue = getQueryStringValue;

    /**
     * Downloads a text file with the specified content and filename.
     * @param {string} content - The content of the file.
     * @param {string} filename - The name of the file.
     */
    function downloadTextFile(content, filename) {
        var mimeType = "text/plain";
        var blob = new Blob([content], { type: mimeType });

        if (window.navigator && window.navigator.msSaveBlob) {
            // For IE and Edge
            window.navigator.msSaveBlob(blob, filename);
        } else {
            // For other browsers
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.download = filename;
            a.href = url;
            a.dataset.downloadurl = `${mimeType}:${a.download}:${a.href}`;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function () {
                URL.revokeObjectURL(url);
            }, 5000);
        }
    }

    /**
     * Gets the value of a query string parameter by name.
     * @param {string} name - The name of the query string parameter.
     * @returns {string|null} The value of the query string parameter, or null if not found.
     */
    function getQueryStringValue(name) {
        var url = window.location.href;
        var queryStart = url.indexOf("?");
        
        if (queryStart >= 0) {
            var queryString = url.substring(queryStart + 1);
            if (queryString.length > 0) {
                var params = queryString.split("&");
                for (var i = 0; i < params.length; i++) {
                    var param = params[i].split("=");
                    if (param.length === 2 && decodeURIComponent(param[0]) === name) {
                        return decodeURIComponent(param[1]);
                    }
                }
            }
        }
        return null;
    }

    /**
     * Declares polyfills for Array.prototype.includes and String.prototype.repeat if they don't exist.
     */
    function declarePolyfills() {
        if (typeof Array.prototype.includes !== "function") {
            console.log("Declaring Array.includes polyfill...");
            Object.defineProperty(Array.prototype, "includes", {
                value: function (element) {
                    return this.indexOf(element) >= 0;
                }
            });
        }

        if (typeof String.prototype.repeat !== "function") {
            console.log("Declaring String.repeat polyfill...");
            Object.defineProperty(String.prototype, "repeat", {
                value: function (count) {
                    if (count < 0 || count === Infinity) throw new RangeError();
                    var repeatedString = "";
                    for (var i = 0; i < count; i++) {
                        repeatedString += this;
                    }
                    return repeatedString;
                }
            });
        }
    }

    return {
        declarePolyfills,
        downloadTextFile,
        getQueryStringValue
    };
}