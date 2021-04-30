/**
 * Created by final on 08.01.2014.
 */
fm.ns("fm.gfx.renderer.Canvas2DRenderer");
fm.req("fm.gfx.renderer.Renderer");

/**
 * Canvas 2D Renderer
 */
(function (renderer) {
    var defaultFont = {
        name: "arial",
        size: 10,
        style: "normal"
    };

    function Canvas2DRenderer(canvas, doubleBuffer) {
        this.c = canvas;
        this.doubleBuffer = doubleBuffer || false;
        if (!this.doubleBuffer) {
            this.r = canvas.getContext("2d");
        } else {
            this.back = document.createElement("canvas");
            this.back.width = canvas.width;
            this.back.height = canvas.height;
            this.r = this.back.getContext("2d");
            this.fr = canvas.getContext("2d");
        }
    }

    Canvas2DRenderer.prototype = {
        getContext: function () {
            return this.r;
        },
        clear: function () {
            this.r.clearRect(0, 0, this.c.width, this.c.height);
        },
        fillRect: function (x, y, w, h, style, alpha) {
            this.r.globalAlpha = alpha || 1;
            this.r.fillStyle = style || "black";
            this.r.fillRect(x, y, w, h);
            this.r.globalAlpha = 1;
        },
        strokeRect: function (x, y, w, h, style, width, alpha) {
            this.r.globalAlpha = alpha || 1;
            this.r.strokeStyle = style || "white";
            this.r.lineWidth = width || 1;
            this.r.strokeRect(x, y, w, h);
            this.r.lineWidth = 1;
            this.r.globalAlpha = 1;
        },
        push: function () {
            this.r.save();
        },
        pop: function () {
            this.r.restore();
        },
        clip: function (x, y, w, h) {
            this.r.rect(x, y, w, h);
            this.r.clip();
        },
        translate: function (x, y) {
            this.r.translate(x | 0, y | 0);
        },
        scale: function (x, y) {
            this.r.scale(x, y);
        },
        rotate: function (rad) {
            this.r.rotate(rad);
        },
        setFont: function (font) {
            this.r.font = font.style + " " + font.size + "px " + font.name;
        },
        resetFont: function () {
            this.r.font = defaultFont.style + " " + defaultFont.size + "px " + defaultFont.name;
        },
        fillText: function (x, y, text, style, align, baseline, alpha) {
            this.r.globalAlpha = alpha || 1;
            this.r.fillStyle = style;
            this.r.textAlign = align || "center";
            this.r.textBaseline = baseline || "middle";
            this.r.fillText(text, x, y);
            this.r.globalAlpha = 1;
        },

        loadTexture: function (image, targetWidth, targetHeight) {
            var newCanvas = document.createElement("canvas");
            newCanvas.width = targetWidth || image.width;
            newCanvas.height = targetHeight || image.height;
            var newCtx = newCanvas.getContext("2d");
            newCtx.drawImage(image, 0, 0, image.width, image.height, 0, 0, newCanvas.width, newCanvas.height);
            return new fm.gfx.Texture(newCanvas);
        },
        drawTexture: function (img, x, y, w, h, sx, sy, sw, sh, alpha) {
            if (img != null) {
                this.r.globalAlpha = alpha || 1;
                if (typeof img.data != 'undefined') {
                    this.r.drawImage(img.data, sx | 0 || 0, sy | 0 || 0, sw || img.width, sh || img.height, x | 0, y | 0, w, h);
                } else {
                    this.r.drawImage(img, sx | 0 || 0, sy | 0 || 0, sw || img.width, sh || img.height, x | 0, y | 0, w, h);
                }
                this.r.globalAlpha = 1;
            }
        },
        getWidth: function () {
            return this.c.width;
        },
        getHeight: function () {
            return this.c.height;
        },
        drawLine: function (x0, y0, x1, y1, style, width, alpha) {
            this.r.globalAlpha = alpha || 1;
            this.r.beginPath();
            this.r.moveTo(x0, y0);
            this.r.lineTo(x1, y1);
            this.r.strokeStyle = style;
            this.r.lineWidth = width || 1;
            this.r.stroke();
            this.r.lineWidth = 1;
            this.r.globalAlpha = 1;
        },
        flip: function () {
            if (this.doubleBuffer) {
                this.fr.drawImage(this.back, 0, 0);
                this.r.clearRect(0,0,this.back.width,this.back.height);
            }
        },
        getTextureData: function(texture, x, y, w, h){
            if (texture != null && typeof texture.data != "undefined") {
                return texture.data.getContext("2d").getImageData(x || 0, y || 0, w || texture.width, h || texture.height);
            }
            return null;
        },
        createTexture: function(w, h, data) {
            var canvas = document.createElement("2d");
            canvas.width = w;
            canvas.height = w;
            if (typeof data != "undefined" && data != null) {
                canvas.getContext("2d").putImageData(data, 0, 0);
            }
            return canvas;
        }
    };

    renderer.Canvas2DRenderer = Canvas2DRenderer;
})(fm.gfx.renderer);