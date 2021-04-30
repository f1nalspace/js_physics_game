/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.input.KeyboardInput", ["final.window.Window"], function (final, Window) {
    /**
     * Initializes keyboard input for the given window
     * @param window {Window}
     * @constructor
     */
    function KeyboardInput(window) {
        this.keystate = [];

        // Add key listeners
        var that = this;
        final.log("Adding keyboard events");
        window.addEventListener("keydown", function (e) {
            that.keystate[e.keyCode ? e.keyCode : e.which] = true;
            return false;
        });
        window.addEventListener("keyup", function (e) {
            that.keystate[e.keyCode ? e.keyCode : e.which] = false;
            return false;
        });
    }

    KeyboardInput.prototype.isKeyDown = function (key) {
        return typeof this.keystate[key] != "undefined" && this.keystate[key] == true;
    };

    KeyboardInput.prototype.setKeyDown = function (key, value) {
        this.keystate[key] = value;
    };

    return KeyboardInput;
});