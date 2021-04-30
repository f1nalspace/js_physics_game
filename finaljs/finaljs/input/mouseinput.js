/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.input.MouseInput", ["final.window.Window", "final.Vec2"], function (final, Window, Vec2) {
    var inp = final.input;

    /**
     * Initializes mouse input for the given window
     * @param window {Window}
     * @constructor
     */
    function MouseInput(window) {
        this.window = window;
        this.pos = new Vec2(-1, -1);
        this.state = [];
        var that = this;

        var updatePos = function (pos, x, y) {
            pos.x = (x - that.window.getLeft()) * that.window.getScaleX();
            pos.y = (y - that.window.getTop()) * that.window.getScaleY();
        };

        // Add mouse listeners
        final.log("Adding mouse events");
        window.addEventListener("mousedown", function (e) {
            updatePos(that.pos, e.clientX, e.clientY);
            that.state[e.button] = true;
            return false;
        });
        window.addEventListener("mousemove", function (e) {
            updatePos(that.pos, e.clientX, e.clientY);
            return false;
        });
        window.addEventListener("mouseup", function (e) {
            updatePos(that.pos, e.clientX, e.clientY);
            that.state[e.button] = false;
            return false;
        });
        window.addEventListener("mouseout", function (e) {
            return false;
        });
    }

    /**
     * Returns true when the given mouse button is pressed
     * @param button
     * @returns {boolean}
     */
    MouseInput.prototype.isMouseDown = function (button) {
        return this.state[button] !== undefined && this.state[button] === true;
    };

    /**
     * Overwrites the given mouse button state
     * @param button
     * @param value
     */
    MouseInput.prototype.setMouseButton = function (button, value) {
        this.state[button] = value;
    };

    /**
     * Returns the given mouse position
     * @returns {final.Vec2}
     */
    MouseInput.prototype.getPos = function () {
        return this.pos;
    };

    return MouseInput;
});