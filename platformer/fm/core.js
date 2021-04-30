/**
 * Created by final on 08.01.2014.
 */

// Fm is just some short namespace - means final markus
var fm = {};

/**
 * Defines the provided namespace
 * Creates non existing sub namespaces as well
 * @param clazz {String} Comma seperated full namespace
 */
fm.ns = function(clazz) {
    var s = clazz.split(".");
    if (s.length > 0) {
        var n = window;
        for (var i = 0; i < s.length; i++) {
            if (typeof n[s[i]] == "undefined") {
                n[s[i]] = {};
            }
            n = n[s[i]];
        }
    }
};

/**
 * Checks if any of the provided namespaces and/or objects exists
 * Throws an exception when one part does not exists
 * @param clazz {String} Comma seperated full namespace
 * @returns {*}
 */
fm.req = function(clazz) {
    var s = clazz.split(".");
    if (s.length > 0) {
        var n = window;
        var x = "";
        for (var i = 0; i < s.length; i++) {
            if (i > 0) {
                x += ".";
            }
            x += s[i];
            if (typeof n[s[i]] == "undefined") {
                throw new Error("Namespace or class '"+x+"' not found!");
            }
            n = n[s[i]];
        }
        return n;
    }
    return null;
};

/**
 * Just a log wrapper
 * @param s {String}
 */
fm.log = function(s) {
    console.log(s);
};

/**
 * Simple class inheritance
 */
if (typeof Function.prototype.extends == "undefined") {
    Function.prototype.extends = function (b) {
        var d = this;
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
            this.constructor = d;
        }
        __.prototype = b.prototype;
        d.prototype = new __();
    };
}

/**
 * String addons
 */
if (typeof String.prototype.endsWith == "undefined") {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

/**
 * Array addons
 */
if (typeof Array.prototype.swap === 'undefined') {
	Array.prototype.swap = function (x,y) {
		var b = this[x];
		this[x] = this[y];
		this[y] = b;
		return this;
	};
}


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
