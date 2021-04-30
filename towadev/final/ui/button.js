final.module("final.ui.button", ["final.vec", "final.ui"], function (final, vec, ui) {
        var Vec2 = vec.Vec2,
            UIControl = ui.UIControl,
            UIState = ui.UIState;

        var defaultEnabledState = final.clone(ui.defaultEffectState);

        var defaultDisabledState = final.clone(ui.defaultEffectState);
        defaultDisabledState.border = "darkgrey";
        defaultDisabledState.shadow = null;

        var defaultHoverState = final.clone(ui.defaultEffectState);
        defaultHoverState.border = "blue";
        defaultHoverState.shadow = "blue";
        defaultHoverState.text = "blue";

        var defaultPressedState = final.clone(ui.defaultEffectState);
        defaultPressedState.border = "red";
        defaultPressedState.shadow = "red";
        defaultPressedState.text = "red";

        function Button(game, pos, size, text) {
            UIControl.call(this, game, pos, size);
            this.text = text || "";
            this.image = null;
            this.imageSize = new Vec2(0, 0);
            this.effectStates = {
                enabled: final.clone(defaultEnabledState),
                disabled: final.clone(defaultDisabledState),
                pressed: final.clone(defaultPressedState),
                hover: final.clone(defaultHoverState)
            };
        }

        Button.extend(UIControl);

        Button.prototype.draw = function (r, p, s) {
            if (!this.visible) return;
            var colorState = this.effectStates.enabled;
            if (this.state == UIState.Pressed) {
                colorState = this.effectStates.pressed;
            } else if (this.state == UIState.Hover) {
                colorState = this.effectStates.hover;
            } else if (this.state == UIState.Disabled) {
                colorState = this.effectStates.disabled;
            }
            if (colorState.shadow != null) {
                r.applyShadows(colorState.blur, 0, 0, colorState.shadow);
            }
            if (colorState.border != null) {
                r.strokeRect(p.x, p.y, s.x, s.y, colorState.border, colorState.lineWidth);
            }
            if (colorState.background != null) {
                r.fillRect(p.x, p.y, s.x, s.y, colorState.background);
            }
            if (colorState.shadow != null) {
                r.resetShadows();
            }
            if (this.image != null) {
                if (this.image instanceof Array) {
                    var imgIndex = this.enabled ? 0 : 1;
                    r.drawImage(this.image[imgIndex], p.x + (s.x * 0.5 - this.imageSize.x * 0.5), p.y + (s.y * 0.5 - this.imageSize.y * 0.5), this.imageSize.x, this.imageSize.y);
                } else {
                    r.drawImage(this.image, p.x + (s.x * 0.5 - this.imageSize.x * 0.5), p.y + (s.y * 0.5 - this.imageSize.y * 0.5), this.imageSize.x, this.imageSize.y);
                }
            }
            if (this.text.length > 0) {
                r.applyFont(this.font, "center", "middle");
                r.fillText(p.x + s.x * 0.5, p.y + s.y * 0.5, this.text, colorState.text);
                r.resetFont();
            }
            if (this.state == UIState.Hover || this.state == UIState.Pressed) {
                this.drawHint(r, p, s);
            }
        }
        ;

        return {
            Button: Button
        }
    }
)
;