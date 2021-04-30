/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ui.Control", ["final.Vec2", "final.Vec2Pool", "final.math", "final.collision.Intersections", "final.ui.State", "final.input.MouseButton"],
    function (final, Vec2, Vec2Pool, math, Intersections, State, MouseButton) {
        function Control(mng, pos, ext) {
            this.mng = mng;
            this.pos = pos || new Vec2();
            this.ext = ext || new Vec2();
            this.state = State.Enabled;
            this.lastPointState = {left: false};
            this.enabled = true;
            this.visible = true;
            this.childs = [];
            this.click = function (self) {
            };
        }

        Control.prototype.addChild = function (component) {
            this.childs.push(component);
        };

        Control.prototype.init = function (r) {
        };

        Control.prototype.draw = function (r, p, e) {
        };

        Control.prototype.drawChilds = function (r, p, e) {
            var childPos = Vec2Pool.get();
            for (var i = 0; i < this.childs.length; i++) {
                var child = this.childs[i];
                final.math.vec2Add(childPos, p, child.pos);
                child.draw(r, childPos, child.ext);
            }
        };

        Control.prototype.update = function (dt, p, e) {
            var r = false;
            if (this.visible) {
                // Get mouse states
                var touchEnabled = typeof this.mng.touch != "undefined" && this.mng.touch != null && this.mng.touch.enabled;
                var pointPos = touchEnabled ? this.mng.touch.getPos() : this.mng.mouse.getPos();
                var pressed = touchEnabled ? this.mng.touch.getState() : this.mng.mouse.isMouseDown(MouseButton.Left);
                var isMouseOver = Intersections.isPointInAABB(pointPos, p, e);
                if (isMouseOver) {
                    r = true;
                }

                if (this.enabled) {
                    // Update the component state.
                    if (isMouseOver && this.state != State.Pressed) {
                        this.state = State.Hover;
                    } else if (!isMouseOver && this.state != State.Pressed) {
                        this.state = State.Enabled;
                    }

                    // Check if the user holds down the button.
                    if (pressed && !this.lastPointState.left) {
                        if (isMouseOver) {
                            this.state = State.Pressed;
                        }
                    } else if (pressed && this.lastPointState.left) {
                        if (!isMouseOver) {
                            this.state = State.Enabled;
                        } else {
                            this.state = State.Pressed;
                        }
                    }

                    if (!pressed && this.lastPointState.left) {
                        if (isMouseOver) {
                            this.state = State.Hover;
                            this.click(this);
                        } else if (this.state == State.Pressed) {
                            this.state = State.Enabled;
                        }
                    }
                    this.lastPointState.left = pressed;
                }
            }

            // Set disable state, when its disabled
            if (!this.enabled && this.state != State.Disabled) {
                this.state = State.Disabled;
            }

            // Update childs
            var childPos = Vec2Pool.get();
            for (var i = 0; i < this.childs.length; i++) {
                var child = this.childs[i];
                final.math.vec2Add(childPos, p, child.pos);
                if (child.update(dt, childPos, child.ext)) {
                    r = true;
                }
            }

            return r;
        };

        return Control;
    }
);