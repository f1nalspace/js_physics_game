final.module("final.ui", ["final.shim", "final.vec", "final.vec2math", "final.renderer"], function(final, shim, vec, vec2math, renderer){
    var Vec2 = vec.Vec2;

    var defaultEffectState = {
        background: "white",
        border: "grey",
        shadow: "white",
        text: "black",
        blur: 0.1,
        lineWidth: 0.05
    };

    var defaultControlFont = {
        name: "Arial",
        size: 0.3,
        style: "normal"
    };

    var UIState = {
        None: -1,
        Disabled: 0, // Can only be unpressed
        Enabled: 1, // Unpressed
        Hover: 2, // Hover
        Pressed: 3 // Pressed
    };

    var Alignment = {
        Left: 1,
        Right: 2,
        Top: 4,
        Bottom: 8,
        TopLeft: 4 | 1
    };

    var Utils = {
        mouseIn: function(mouse, pos, size){
            return (mouse.x >= pos.x) && (mouse.x <= pos.x + size.x) &&
                (mouse.y >= pos.y) && (mouse.y <= pos.y + size.y);
        }
    };

    /**
     * Creates a UI Control
     * @param {Game} game
     * @param {Vec2} pos
     * @param {Vec2} size
     * @constructor
     */
    function UIControl(game, pos, size){
        this.parent = null;
        this.game = game;
        this.pos = pos;
        this.size = size;
        this.state = UIState.Enabled;
        this.lastPointState = {left: false};
        this.enabled = true;
        this.visible = true;
        this.childs = [];
        this.click = function(self){};
        this.hint = "";
        this.hintPos = new Vec2(0, 0.75);
        this.font = final.clone(defaultControlFont);
    }

    UIControl.prototype.addChild = function(component) {
        component.parent = this;
        this.childs.push(component);
    };

    UIControl.prototype.init = function(r) {
    };

    UIControl.prototype.drawHint = function(r, p, s) {
        if (this.hint.length > 0) {
            r.applyFont(this.font, "center", "middle");
            r.fillText(p.x + s.x * 0.5 + s.x * this.hintPos.x, p.y + s.y * 0.5 + s.y * this.hintPos.y, this.hint, "white");
            r.resetFont();
        }
    };

    UIControl.prototype.controlClickEvent = function() {
    };

    UIControl.prototype.userClickEvent = function() {
        this.click(this);
    };

    UIControl.prototype.draw = function(r, p, s) {
    };

    UIControl.prototype.drawChilds = function(r, p, s) {
        var childPos = new Vec2();
        for (var i = 0; i < this.childs.length; i++) {
            var child = this.childs[i];
            if (child.visible) {
                vec2math.add(childPos, p, child.pos);
                child.draw(r, childPos, child.size);
            }
        }
    };

    UIControl.prototype.update = function(dt, p, s) {
        var r = false;
        if (this.visible) {
            // Get mouse states
            var pointPos = this.game.isTouchDevice ? this.game.touch : this.game.mouse;
            var pressed = this.game.isTouchDevice ? this.game.touchstate : this.game.isMouseDown(final.game.MouseButton.Left);
            var isMouseOver = Utils.mouseIn(pointPos, p, s);
            if (isMouseOver) {
                r = true;
            }

            if (this.enabled) {
                // Update the component state.
                if (isMouseOver && this.state != final.ui.UIState.Pressed) {
                    this.state = final.ui.UIState.Hover;
                } else if (!isMouseOver && this.state != final.ui.UIState.Pressed) {
                    this.state = final.ui.UIState.Enabled;
                }

                // Check if the user holds down the button.
                if (pressed && !this.lastPointState.left) {
                    if (isMouseOver) {
                        this.state = final.ui.UIState.Pressed;
                    }
                } else if (pressed && this.lastPointState.left) {
                    if (!isMouseOver) {
                        this.state = final.ui.UIState.Enabled;
                    } else {
                        this.state = final.ui.UIState.Pressed;
                    }
                }

                if (!pressed && this.lastPointState.left) {
                    if (isMouseOver) {
                        this.controlClickEvent();
                        this.userClickEvent();
                        this.state = final.ui.UIState.Hover;
                    } else if (this.state == final.ui.UIState.Pressed) {
                        this.state = final.ui.UIState.Enabled;
                    }
                }
                this.lastPointState.left = pressed;
            }
        }

        // Set disable state, when its disabled
        if (!this.enabled && this.state != final.ui.UIState.Disabled) {
            this.state = final.ui.UIState.Disabled;
        }

        // Update childs
        var childPos = new Vec2();
        for (var i = 0; i < this.childs.length; i++) {
            var child = this.childs[i];
            vec2math.add(childPos, p, child.pos);
            if (child.update(dt, childPos, child.size)) {
                r = true;
            }
        }

        return r;
    };

    function UIManager(game){
        this.game = game;
        this.components = [];
    }

    UIManager.prototype.add = function(component) {
        this.components.push(component);
    };

    UIManager.prototype.update = function(dt) {
        var r = false;
        for (var i = 0; i < this.components.length; i++) {
            var comp = this.components[i];
            if (comp.update(dt, comp.pos, comp.size)) {
                r = true;
            }
        }
        return r;
    };

    UIManager.prototype.draw = function(r) {
        for (var i = 0; i < this.components.length; i++) {
            var comp = this.components[i];
            if (comp.visible) {
                comp.draw(r, comp.pos, comp.size);
                comp.drawChilds(r, comp.pos, comp.size);
            }
        }
    };

    UIManager.prototype.setComponents = function(components) {
        this.components = [];
        for (var i = 0; i < components.length; i++) {
            this.components[i] = components[i];
        }
    };

    return {
        UIState: UIState,
        Alignment: Alignment,
        Utils: Utils,
        UIControl: UIControl,
        UIManager: UIManager,
        defaultEffectState: defaultEffectState,
        defaultControlFont: defaultControlFont
    }
});