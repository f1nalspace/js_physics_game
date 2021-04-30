/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.renderer.CanvasRenderer", function () {
    var CanvasRenderer = function(canvas) {
        var defaultFont = {
            name: "arial",
            size: 12,
            style: "normal"
        };
        var c = canvas.getContext("2d");
        c.font = defaultFont.style + " " + defaultFont.size + "px " + defaultFont.name;

        return {
            getCanvas: function () {
                return c.canvas;
            },
            getWidth: function () {
                return c.canvas.width;
            },
            getHeight: function () {
                return c.canvas.height;
            },
            clear: function () {
                c.clearRect(0, 0, c.canvas.width, c.canvas.height);
            },
            push: function () {
                c.save();
            },
            pop: function () {
                c.restore();
            },
            setTransform: function(scaleX, scaleY, translateX, translateY){
                c.setTransform(scaleX, 0, 0, scaleY, translateX, translateY);
            },
            translate: function (x, y) {
                c.translate(x, y);
            },
            scale: function (x, y) {
                c.scale(x, y);
            },
            rotate: function (angle) {
                c.rotate(angle);
            },
            opacity: function (value) {
                c.globalAlpha = value;
            },
            composite: function (op) {
                c.globalCompositeOperation = op;
            },
            resetComposite: function () {
                c.globalCompositeOperation = "source-over";
            },
            resetOpacity: function () {
                c.globalAlpha = 1;
            },
            clipRect: function(x, y, w, h){
                c.beginPath();
                c.rect(x, y, w, h);
                c.clip();
            },
            fillRect: function (x, y, w, h, color) {
                c.fillStyle = color;
                c.fillRect(x, y, w, h);
            },
            strokeRect: function (x, y, w, h, color, width) {
                c.strokeStyle = color;
                c.lineWidth = width || 1;
                c.strokeRect(x, y, w, h);
                c.lineWidth = 1;
            },
            fillArc: function (x, y, r, color) {
                c.fillStyle = color;
                c.beginPath();
                c.arc(x, y, r, 0, Math.PI * 2, false);
                c.fill();
            },
            strokeArc: function (x, y, r, color, width) {
                c.strokeStyle = color;
                c.lineWidth = width || 1;
                c.beginPath();
                c.arc(x, y, r, 0, Math.PI * 2, false);
                c.stroke();
                c.lineWidth = 1;
            },
            drawLine: function (x1, y1, x2, y2, color, width) {
                c.strokeStyle = color;
                c.lineWidth = width || 1;
                c.beginPath();
                c.moveTo(x1, y1);
                c.lineTo(x2, y2);
                c.stroke();
                c.lineWidth = 1;
            },
            drawCustom: function (func, color, width) {
                c.strokeStyle = color;
                c.lineWidth = width || 1;
                c.beginPath();
                func(c);
                c.stroke();
                c.lineWidth = 1;
            },
            drawNormal: function (cx, cy, nx, ny, color, width, depth) {
                var d = depth || 10;
                var tx = -ny;
                var ty = nx;
                var u = 0.35;
                c.strokeStyle = color;
                c.beginPath();
                c.moveTo(cx, cy);
                c.lineTo(cx + nx * d, cy + ny * d);
                c.lineWidth = width || 1;
                c.stroke();
                c.moveTo(cx + nx * d * u, cy + ny * d * u);
                c.lineTo(cx + nx * d * u - tx * d * u, cy + ny * d * u - ty * d * u);
                c.lineTo(cx - tx * d * u, cy - ty * d * u);
                c.moveTo(cx - tx * d * 2, cy - ty * d * 2);
                c.lineTo(cx + tx * d * 2, cy + ty * d * 2);
                c.lineWidth = (width || 1) - 1;
                c.stroke();
                c.lineWidth = 1;
            },
            drawImage: function (img, tx, ty, tw, th, sx, sy, sw, sh) {
                if (typeof sh != "undefined") {
                    c.drawImage(img, sx, sy, sw, sh, tx, ty, tw, th);
                } else {
                    c.drawImage(img, 0, 0, img.width, img.height, tx, ty, (tw || img.width), (th || img.height));
                }
            },
            setFont: function (name, size, style) {
                c.font = (style || "normal") + " " + size + "px " + name;
            },
            resetFont: function () {
                c.font = defaultFont.style + " " + defaultFont.size + "px " + defaultFont.name;
            },
            fillText: function (x, y, text, color, align, baseline) {
                c.fillStyle = color;
                c.textAlign = align || "center";
                c.textBaseline = baseline || "middle";
                c.fillText(text, x, y);
                c.textAlign = "center";
                c.textBaseline = "middle";
            },
            strokeText: function (x, y, text, color, align, baseline, width) {
                c.strokeStyle = color;
                c.lineWidth = width || 1;
                c.textAlign = align || "center";
                c.textBaseline = baseline || "middle";
                c.strokeText(text, x, y);
                c.lineWidth = 1;
                c.textAlign = "center";
                c.textBaseline = "middle";
            },
            renderToBuffer: function (w, h, func) {
                var offscreenCanvas = document.createElement("canvas");
                offscreenCanvas.width = w;
                offscreenCanvas.height = h;
                func(new CanvasRenderer(offscreenCanvas), w, h);
                return offscreenCanvas;
            },
            getPixels: function (w, h) {
                return c.getImageData(0, 0, w || c.canvas.width, h || c.canvas.height);
            },
            putPixels: function (data, x, y) {
                c.putImageData(data, x, y);
            }
        };
    };

    return CanvasRenderer;
});