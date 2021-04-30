/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.window.Window", ["final.Vec2", "final.math"], function(final, Vec2, math) {
    function Win(canvas) {
        this.canvas = canvas;
        this.resizeEvent = function () {
        };

        // Disable selection
        this.canvas.addEventListener("selectstart", function (e) {
            e.preventDefault();
            return false;
        }, false);

        // Resize event
        var that = this;
        window.addEventListener("resize", function () {
            that.resizeEvent();
        }, false);
    }

    Win.prototype.addEventListener = function (name, func) {
        this.canvas.addEventListener(name, func, false);
    };

    Win.prototype.isEventSupported = function (eventName) {
        var isSupported = (eventName in this.canvas);
        if (!isSupported) {
            this.canvas.setAttribute(eventName, 'return;');
            isSupported = typeof this.canvas[eventName] == 'function';
            this.canvas.removeAttribute(eventName);
        }
        return isSupported;
    };

    Win.prototype.focus = function(){
        this.canvas.focus();
    };

    Win.prototype.getLeft = function () {
        return this.canvas.getBoundingClientRect().left;
    };

    Win.prototype.getTop = function () {
        return this.canvas.getBoundingClientRect().top;
    };

    Win.prototype.getWidth = function () {
        return this.canvas.width;
    };

    Win.prototype.getHeight = function () {
        return this.canvas.height;
    };

    Win.prototype.getScaleX = function () {
        return this.canvas.width / this.canvas.offsetWidth;
    };

    Win.prototype.getScaleY = function () {
        return this.canvas.height / this.canvas.offsetHeight;
    };

    Win.prototype.getParentWidth = function () {
        return window.innerWidth;
    };

    Win.prototype.getParentHeight = function () {
        return window.innerHeight;
    };

    Win.prototype.setPosition = function (x, y) {
        if (this.canvas.style.position !== "fixed") {
            this.canvas.style.position = "fixed";
        }
        this.canvas.style.left = x + "px";
        this.canvas.style.top = y + "px";
    };

    Win.prototype.setSize = function (w, h) {
        if (this.canvas.style.position !== "fixed") {
            this.canvas.style.position = "fixed";
        }
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px";
    };

    return Win;
});