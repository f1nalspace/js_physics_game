/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.input.TouchInput", ["final.window.Window", "final.Vec2"], function (final, Window, Vec2) {
    /**
     * Initialize the touch input handler
     * @param window {Window}
     * @constructor
     */
    function TouchInput(window) {
        this.window = window;
        this.pos = new Vec2(-1, -1);
        this.state = false;
        this.enabled = window.isEventSupported("ontouchstart");
        this.release = false;
        var that = this;

        var updatePos = function (pos, x, y) {
            pos.x = (x - that.window.getLeft()) * that.window.getScaleX();
            pos.y = (y - that.window.getTop()) * that.window.getScaleY();
        };

        if (this.enabled) {
            final.log("Adding touch events");
            window.addEventListener('touchstart', function (e) {
                var touchobj = e.changedTouches.x;
                updatePos(that.pos, touchobj.clientX, touchobj.clientY);
                if (!that.state) {
                    that.release = false;
                    that.state = true;
                }
                return false;
            });
            window.addEventListener('touchmove', function (e) {
                e.preventDefault();
                var touchobj = e.changedTouches.x;
                updatePos(that.pos, touchobj.clientX, touchobj.clientY);
                return false;
            });
            window.addEventListener('touchend', function (e) {
                if (that.state) {
                    that.release = true;
                    that.state = false;
                }
                return false;
            });
        }
    }

    TouchInput.prototype.getState = function () {
        return false;
    };

    return TouchInput;
});