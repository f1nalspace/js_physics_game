final.module("final.renderer", [], function () {
    function Transform(x, y, sx, sy) {
        this.offsetX = x;
        this.offsetY = y;
        this.scaleX = sx;
        this.scaleY = sy;
        this.invScaleX = 1 / sx;
        this.invScaleY = 1 / sy;
    }

    function Renderer(canvas, initTransform) {
        var ctx = canvas.getContext("2d");
        var viewport = {x: canvas.width, y: canvas.height};
        var transform = initTransform || new Transform(0, 0, 1, 1);

        var defaultFont = {
            size: 20 * transform.invScaleX,
            style: "italic",
            name: "Arial"
        };

        var fontSizeMatcher = /(italic|normal)?([0-9]+)px/;

        var defaultLineWidth = 1 * transform.invScaleX;

        var applyShadows = function (blur, x, y, color) {
            ctx.shadowBlur = blur * transform.scaleX;
            ctx.shadowOffsetX = x * transform.scaleX;
            ctx.shadowOffsetY = y * transform.scaleY;
            ctx.shadowColor = color;
        };

        var resetShadows = function () {
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowColor = "";
        };

        var applyFont = function (font, align, baseline) {
            ctx.font = font.style + " " + font.size * transform.scaleX + "px " + font.name;
            ctx.textAlign = align || "left";
            ctx.textBaseline = baseline || "top";
        };

        var resetFont = function () {
            applyFont(defaultFont);
        };

        var applyStroke = function (width) {
            ctx.lineWidth = (typeof width != "undefined" ? width : defaultLineWidth) * transform.scaleX;
        };

        var resetStroke = function () {
            ctx.lineWidth = defaultLineWidth * transform.scaleX;
        };

        var applyAlpha = function (alpha) {
            ctx.globalAlpha = typeof alpha != "undefined" ? alpha : 1;
        };

        var resetAlpha = function (alpha) {
            ctx.globalAlpha = 1;
        };

        resetShadows();
        resetFont();
        resetStroke();

        return {
            getViewport: function () {
                return viewport;
            },
            setViewport: function(w, h) {
                viewport.x = w;
                viewport.y = h;
            },
            getCanvas: function () {
                return ctx.canvas;
            },
            getContext: function() {
                return ctx;
            },

            // Transform
            getTransform: function() {
                return transform;
            },
            projectX: function (x) {
                return x * transform.scaleX + transform.offsetX;
            },
            projectY: function (y) {
                return y * transform.scaleY + transform.offsetY;
            },
            unProjectX: function (x) {
                return (x - transform.offsetX) * transform.invScaleX;
            },
            unProjectY: function (y) {
                return (y - transform.offsetY) * transform.invScaleY;
            },
            push: function () {
                ctx.save();
            },
            pop: function () {
                ctx.restore();
            },
            translate: function (x, y) {
                ctx.translate(x * transform.scaleX, y * transform.scaleY);
            },
            scale: function (x, y) {
                ctx.scale(x, y);
            },
            rotate: function (angle) {
                ctx.rotate(angle);
            },
            setTransformScale: function(x, y) {
                transform.scaleX = x;
                transform.scaleY = y;
                transform.invScaleX = 1 / transform.scaleX;
                transform.invScaleY = 1 / transform.scaleY;
            },

            // Text
            applyFont: applyFont,
            resetFont: resetFont,
            setDefaultFont: function(font) {
                defaultFont = font;
            },
            getTextSize: function (text) {
                var size = fontSizeMatcher.exec(ctx.font)[2];
                return {
                    w:ctx.measureText(text).width * transform.invScaleX,
                    h: size * transform.invScaleX
                };
            },
            fillText: function (x, y, text, color) {
                ctx.fillStyle = color;
                ctx.fillText(text, this.projectX(x), this.projectY(y));
            },
            strokeText: function (x, y, text, color, width) {
                applyStroke(width);
                ctx.strokeStyle = color;
                ctx.strokeText(text, this.projectX(x), this.projectY(y));
                resetStroke();
            },

            // Geometry
            rect: function (x, y, w, h) {
                ctx.rect(this.projectX(x), this.projectY(y), w * transform.scaleX, h * transform.scaleY);
            },
            arc: function (x, y, radius, start, end) {
                ctx.arc(this.projectX(x), this.projectY(y), radius * transform.scaleX, start, end, false);
            },

            // Drawing
            clear: function (color) {
                ctx.clearRect(0, 0, viewport.x, viewport.y);
                if (typeof color != "undefined") {
                    ctx.fillStyle = color;
                    ctx.fillRect(0, 0, viewport.x, viewport.y);
                }
            },
            strokeLine: function (x, y, tx, ty, color, width) {
                ctx.beginPath();
                ctx.moveTo(this.projectX(x), this.projectY(y));
                ctx.lineTo(this.projectX(tx), this.projectY(ty));
                applyStroke(width);
                ctx.strokeStyle = color;
                ctx.stroke();
                resetStroke();
            },
            clipRect: function (x, y, w, h) {
                ctx.beginPath();
                this.rect(x, y, w, h);
                ctx.clip();
            },
            fillRect: function (x, y, w, h, color) {
                ctx.beginPath();
                this.rect(x, y, w, h);
                ctx.fillStyle = color;
                ctx.fill();
            },
            strokeRect: function (x, y, w, h, color, width) {
                ctx.beginPath();
                this.rect(x, y, w, h);
                applyStroke(width);
                ctx.strokeStyle = color;
                ctx.stroke();
                resetStroke();
            },
            fillArc: function (x, y, radius, color) {
                ctx.beginPath();
                this.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            },
            strokeArc: function (x, y, radius, color, width) {
                ctx.beginPath();
                this.arc(x, y, radius, 0, Math.PI * 2);
                applyStroke(width);
                ctx.strokeStyle = color;
                ctx.stroke();
                resetStroke();
            },

            // Effects
            createGradientStyle: function (l, t, r, b, colors) {
                var grd = ctx.createLinearGradient(this.projectX(l), this.projectY(t), this.projectX(r), this.projectY(b));
                for (var i = 0; i < colors.length; i++) {
                    grd.addColorStop(i, colors[i]);
                }
                return grd;
            },
            applyShadows: applyShadows,
            resetShadows: resetShadows,
            applyAlpha: applyAlpha,
            resetAlpha: resetAlpha,
            renderToCanvas: function (w, h, renderFunc, t) {
                var buffer = document.createElement('canvas');
                buffer.width = w;
                buffer.height = h;
                var newRenderer = new Renderer(buffer, t || new Transform(0, 0, 1, 1));
                var result = renderFunc(newRenderer);
                return typeof result != "undefined" ? result : buffer;
            },
            drawImage: function (img, x, y, w, h, sx, sy, sw, sh) {
                if (sx !== undefined && sy !== undefined && sw !== undefined && sh !== undefined) {
                    ctx.drawImage(img, sx, sy, sw, sh, this.projectX(x), this.projectX(y), w * transform.scaleX, h * transform.scaleY);
                } else {
                    ctx.drawImage(img, this.projectX(x), this.projectX(y), w * transform.scaleX, h * transform.scaleY);
                }
            },
            getImageData: function(x, y, w, h) {
                return ctx.getImageData(x, y, w, h);
            },
            putImageData: function(data, x, y) {
                ctx.putImageData(data, x, y);
            }
        }
    }

    return {
        Renderer: Renderer,
        Transform: Transform
    };
});

