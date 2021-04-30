final.module("final.ui.radiobutton", ["final.vec", "final.ui"], function (final, vec, ui) {
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

    function RadioGroup(game, pos, size) {
        UIControl.call(this, game, pos, size);
    }
    RadioGroup.extend(UIControl);

    RadioGroup.prototype.unCheckAll = function() {
        var i, child;
        for (i = 0; i < this.childs.length; i++) {
            child = this.childs[i];
            if (child instanceof RadioButton) {
                child.checked = false;
            }
        }
    };

    function RadioButton(game, pos, size, text, padding, checkPadding, textPadding) {
        UIControl.call(this, game, pos, size);

        this.text = text;
        this.textAlign = 1;
        this.textPadding = textPadding || 0.15;
        this.disabled = true;

        this.checked = false;

        this.effectStatesBg = {
            enabled: final.clone(defaultEnabledState),
            disabled: final.clone(defaultDisabledState),
            hover: final.clone(defaultHoverState)
        };

        this.effectStatesInset = {
            enabled: final.clone(defaultEnabledState),
            disabled: final.clone(defaultDisabledState),
            hover: final.clone(defaultHoverState)
        };
        this.effectStatesInset.enabled.background = "grey";
        this.effectStatesInset.disabled.background = "grey";
        this.effectStatesInset.hover.background = "grey";
        this.effectStatesInset.hover.shadow = null;

        this.effectStatesCheck = {
            enabled: final.clone(defaultEnabledState),
            disabled: final.clone(defaultDisabledState),
            hover: final.clone(defaultHoverState),
            pressed: final.clone(defaultPressedState)
        };
        this.effectStatesCheck.enabled.background = "white";
        this.effectStatesCheck.disabled.background = "white";
        this.effectStatesCheck.hover.background = "white";
        this.effectStatesCheck.pressed.background = "white";
        this.effectStatesCheck.hover.shadow = null;

        this.padding = padding || 0.15;
        this.checkPadding = checkPadding || 0.1;
    }

    RadioButton.extend(UIControl);

    RadioButton.prototype.controlClickEvent = function() {
        if (this.parent != null && this.parent instanceof RadioGroup) {
            this.parent.unCheckAll();
        }
        this.checked = true;
    };

    RadioButton.prototype.draw = function (r, p, s) {
        // Draw background
        var colorStateBg = this.effectStatesBg.enabled;
        var colorStateInset = this.effectStatesInset.enabled;
        var colorStateCheck = this.effectStatesCheck.enabled;
        if (this.state == UIState.Hover) {
            colorStateBg = this.effectStatesBg.hover;
            colorStateInset = this.effectStatesInset.hover;
            colorStateCheck = this.effectStatesCheck.hover;
        } else if (this.state == UIState.Disabled) {
            colorStateBg = this.effectStatesBg.disabled;
            colorStateInset = this.effectStatesInset.disabled;
            colorStateCheck = this.effectStatesCheck.disabled;
        } else if (this.state == UIState.Pressed) {
            colorStateCheck = this.effectStatesCheck.pressed;
        }
        if (colorStateBg.shadow != null) {
            r.applyShadows(colorStateBg.blur, 0, 0, colorStateBg.shadow);
        }
        r.strokeRect(p.x, p.y, s.x, s.y, colorStateBg.border, colorStateBg.lineWidth);
        r.fillRect(p.x, p.y, s.x, s.y, colorStateBg.background);
        if (colorStateBg.shadow != null) {
            r.resetShadows();
        }

        // Draw inset
        var insetX = p.x + this.padding;
        var insetY = p.y + this.padding;
        var insetW = s.x - this.padding * 2;
        var insetH = s.y - this.padding * 2;
        if (colorStateInset.shadow != null) {
            r.applyShadows(colorStateInset.blur, 0, 0, colorStateInset.shadow);
        }
        r.strokeRect(insetX, insetY, insetW, insetH, colorStateInset.border, colorStateInset.lineWidth);
        r.fillRect(insetX, insetY, insetW, insetH, colorStateInset.background);
        if (colorStateInset.shadow != null) {
            r.resetShadows();
        }

        // Draw check
        var checkX = p.x + this.padding + this.checkPadding;
        var checkY = p.y + this.padding + this.checkPadding;
        var checkW = s.x - this.padding * 2 - this.checkPadding * 2;
        var checkH = s.y - this.padding * 2 - this.checkPadding * 2;
        var checkR = Math.max(checkW, checkH) * 0.5;
        if (colorStateCheck.shadow != null) {
            r.applyShadows(colorStateCheck.blur, 0, 0, colorStateCheck.shadow);
        }
        if (this.checked || this.state === UIState.Pressed) {
            r.fillArc(p.x + s.x * 0.5, p.y + s.y * 0.5, checkR, colorStateCheck.background)
        }
        if (colorStateCheck.shadow != null) {
            r.resetShadows();
        }

        if (this.text.length > 0) {
            r.applyFont(this.font, this.textAlign > 0 ? "left" : "right", "middle");
            r.fillText(p.x + s.x * 0.5 + ((s.x * 0.5 + this.textPadding) * this.textAlign), p.y + s.y * 0.5, this.text, "white");
            r.resetFont();
        }
    };

    RadioGroup.prototype.draw = function (r, p, s) {
    };

    return {
        RadioButton: RadioButton,
        RadioGroup: RadioGroup
    }
});