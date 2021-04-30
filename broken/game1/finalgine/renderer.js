var finalgine = finalgine || {};

finalgine.Renderer = function (canvas, screenRes) {
    this.ctx = canvas.getContext("2d");
    this.screenRes = screenRes;
    this.colorToStyle = function (color) {
        if (color.x !== undefined) {
            return "rgb(" + color.x * 255 + ", " + color.y * 255 + ", " + color.z * 255 + ")";
        } else {
            return "rgb(" + color[0] * 255 + ", " + color[1] * 255 + ", " + color[2] * 255 + ")";
        }
    };
};

finalgine.Renderer.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.screenRes.x, this.screenRes.y);
};

finalgine.Renderer.prototype.fillRect = function (x, y, w, h, color) {
    if (x === undefined) {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.screenRes.x, this.screenRes.y);
    } else {
        this.ctx.fillStyle = this.colorToStyle(color);
        this.ctx.fillRect(x, y, w, h);
    }
};

finalgine.Renderer.prototype.drawRect = function (x, y, w, h, color, lineWidth) {
    this.ctx.strokeStyle = this.colorToStyle(color);
    this.ctx.lineWidth = lineWidth || 1;
    this.ctx.beginPath();
    this.ctx.rect(x, y, w, h);
    this.ctx.stroke();
    this.ctx.closePath();
};

finalgine.Renderer.prototype.drawLine = function(x1, y1, x2, y2, color, lineWidth) {
    this.ctx.strokeStyle = this.colorToStyle(color);
    this.ctx.lineWidth = lineWidth || 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.closePath();
};

finalgine.Renderer.prototype.push = function () {
    this.ctx.save();
};

finalgine.Renderer.prototype.pop = function () {
    this.ctx.restore();
};

finalgine.Renderer.prototype.reset = function () {
    this.ctx.transform(1, 0, 0, 1, 0, 0);
};

finalgine.Renderer.prototype.translate = function (x, y) {
    if (x.x !== undefined && y === undefined) {
        this.ctx.translate(x.x, x.y);
    } else {
        this.ctx.translate(x, y);
    }
};

finalgine.Renderer.prototype.scale = function (x, y) {
    if (x.x !== undefined && y === undefined) {
        this.ctx.scale(x.x, x.y);
    } else {
        this.ctx.scale(x, y);
    }
};

finalgine.Renderer.prototype.unproject = function (x, y) {
    if (x.x !== undefined && y === undefined) {
        return finalgine.Vector2(x.x - this.screenRes.halfX(), x.y - this.screenRes.halfY());
    } else {
        return finalgine.Vector2(x - this.screenRes.halfX(), y - (this.screenRes.y / 2));
    }
};

finalgine.Renderer.prototype.project = function (x, y) {
    if (x.x !== undefined && y === undefined) {
        return finalgine.Vector2(x.x + this.screenRes.halfX(), x.y + this.screenRes.halfY());
    } else {
        return finalgine.Vector2(x + this.screenRes.halfX(), y + this.screenRes.halfY());
    }
};

finalgine.Renderer.prototype.textWidth = function(text, font) {
    this.ctx.font = "normal " + font;
    return this.ctx.measureText(text).width;
};

finalgine.createFont = function(name, size, style) {
    return {
        name: name,
        style: style || "normal",
        size: size,
        toFontStyle: function(){
            return this.style + " " + this.size + "px" + " " + this.name;
        }
    };
};

finalgine.Renderer.prototype.drawText = function (x, y, text, font, color, align, baseline) {
    this.ctx.fillStyle = this.colorToStyle(color);
    this.ctx.font = font.toFontStyle();

    this.ctx.textBaseline = baseline || "middle";
    this.ctx.textAlign = align || "center";

    if (text instanceof Array) {
        var yp = y;
        for (var i = 0; i < text.length; i++) {
            this.ctx.fillText(text[i], x, yp);
            yp += font.size;
        }
    } else {
        this.ctx.fillText(text, x, y);
    }
};