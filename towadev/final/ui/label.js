final.module("final.ui.label", ["final.vec", "final.ui"], function (final, vec, ui) {
        var Vec2 = vec.Vec2,
            UIControl = ui.UIControl;

        function Label(game, pos, text) {
            UIControl.call(this, game, pos, new Vec2());
            this.text = text || "";
            this.fillStyle = final.clone(ui.defaultEffectState);
            this.fillStyle.text = "white";
            this.strokeStyle = final.clone(ui.defaultEffectState);
            this.strokeStyle.text = null;
            this.textAlign = "left";
            this.baseLine = "middle";
        }

        Label.extend(UIControl);

        Label.prototype.setFill = function(style, shadow, blur) {
            this.fillStyle.text = style;
            this.fillStyle.shadow = shadow;
            this.fillStyle.blur = blur;
        };

        Label.prototype.setStroke = function(style, shadow, blur, width) {
            this.strokeStyle.text = style;
            this.strokeStyle.shadow = shadow;
            this.strokeStyle.blur = blur;
            this.strokeStyle.lineWidth = width;
        };

        Label.prototype.setAlign = function(textAlign, baseLine) {
            this.textAlign = textAlign;
            this.baseLine = baseLine;
        };

        Label.prototype.draw = function (r, p, s) {
            // Fill
            if (this.fillStyle.shadow != null) {
                r.applyShadows(this.fillStyle.blur, 0, 0, this.fillStyle.shadow);
            }
            if (this.fillStyle.text != null) {
                r.applyFont(this.font, this.textAlign, this.baseLine);
                r.fillText(p.x, p.y, this.text, this.fillStyle.text);
                r.resetFont();
            }
            if (this.fillStyle.shadow != null) {
                r.resetShadows();
            }

            // Stroke
            if (this.strokeStyle.shadow != null) {
                r.applyShadows(this.strokeStyle.blur, 0, 0, this.strokeStyle.shadow);
            }
            if (this.strokeStyle.text != null) {
                r.applyFont(this.font, this.textAlign, this.baseLine);
                r.strokeText(p.x, p.y, this.text, this.strokeStyle.text, this.strokeStyle.lineWidth);
                r.resetFont();
            }
            if (this.strokeStyle.shadow != null) {
                r.resetShadows();
            }
        };

        return {
            Label: Label
        }
    }
)
;