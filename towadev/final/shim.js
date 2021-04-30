final.module("final.shim", [], function () {
    /**
     * High performance timer shim (msecs with microseconds precision when supported)
     */
    window.performance = window.performance || {};
    window.performance.now = window.performance.now ||
        window.performance.mozNow ||
        window.performance.msNow ||
        window.performance.oNow ||
        window.performance.webkitNow ||
        function () {
            return Date.now();
        };


    /**
     * Request animation frame shim (frame update by browser with 60 fps)
     */
    window.requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };

    /**
     * Audio context shim
     */
    window.AudioContext = window.AudioContext || window.mozAudioContext || window.oAudioContext || window.webkitAudioContext;

    // Simple class inheritance
    if (typeof Function.prototype.extend == "undefined") {
        Function.prototype.extend = function (b) {
            var d = this;
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            function __() {
                this.constructor = d;
            }

            __.prototype = b.prototype;
            d.prototype = new __();
        };
    }

    // Array contains
    if (typeof Array.prototype.contains == "undefined") {
        Array.prototype.contains = function (obj) {
            var i = this.length;
            while (i--) {
                if (this[i] === obj) {
                    return true;
                }
            }
            return false;
        };
    }

    // String endsWith
    if (typeof String.prototype.endsWith == "undefined") {
        String.prototype.endsWith = function (suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }

    // String replaceAt
    if (typeof String.prototype.replaceAt == "undefined") {
        String.prototype.replaceAt = function (index, char) {
            var s = this.substr(0, index);
            if (char !== undefined) s += char;
            s += this.substr(index + 1);
            return s;

        };
    }

    // String insert
    if (typeof String.prototype.insert == "undefined") {
        String.prototype.insert = function (index, string) {
            if (index > 0) {
                return this.substring(0, index) + string + this.substring(index, this.length);
            } else {
                return string + this;
            }
        };
    }
});