/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.systems.InputSystem",
    [
        "final.ecs.System",
        "final.ecs.SystemTypes",
        "final.ecs.ComponentRegister",
        "final.ecs.components.MouseInputComponent",
        "final.input.MouseInput",
        "final.input.MouseButton",
        "final.Vec2"
    ],
    function (final, System, SystemTypes, ComponentRegister, MouseInputComponent, MouseInput, MouseButton, Vec2) {
        var mouseButtons = [];
        mouseButtons.push(MouseButton.Left);
        mouseButtons.push(MouseButton.Right);
        var mouseButtonCount = mouseButtons.length;

        function InputSystem(engine){
            System.call(this, SystemTypes.Update);
            this.engine = engine;
            this.mouseInputHandle = this.addRequiredComponent(new MouseInputComponent(), false);
            this.updatePriority = -100; // Needs to be called as first system
            this.lastMousePos = new Vec2(-1, -1);
            this.mouseState = {};
            for (var i = 0; i < mouseButtonCount; i++) {
                this.mouseState[mouseButtons[i]] = false;
            }
        }
        InputSystem.extend(System);

        InputSystem.prototype.processMouseMove = function(entities, x, y) {
            for (var i = 0; i < entities.size(); i++) {
                var entity = entities.item(i);
                var mouseInputComp = entity.getComponent(this.mouseInputHandle);
                if (mouseInputComp != null) {
                    mouseInputComp.mouseMove(x, y);
                }
            }
        };

        InputSystem.prototype.processMouseEvent = function(entities, name, x, y, button) {
            for (var i = 0; i < entities.size(); i++) {
                var entity = entities.item(i);
                var mouseInputComp = entity.getComponent(this.mouseInputHandle);
                if (mouseInputComp != null) {
                    mouseInputComp['mouse' + name](x, y, button);
                }
            }
        };

        InputSystem.prototype.update = function (entities, dt) {
            var mouse = this.engine.mouse;

            // Process mouse move
            var newPos = mouse.getPos();
            if (newPos.x != this.lastMousePos.x || newPos.y != this.lastMousePos.y) {
                this.lastMousePos.setFrom(newPos);
                this.processMouseMove(entities, newPos.x, newPos.y);
            }

            // Process mouse events
            for (var i = 0; i < mouseButtonCount; i++) {
                var btn = mouseButtons[i];
                if (mouse.isMouseDown(btn)) {
                    if (!this.mouseState[btn]) {
                        this.mouseState[btn] = true;
                        this.processMouseEvent(entities, "Down", newPos.x, newPos.y, btn);
                    }
                } else {
                    if (this.mouseState[btn]) {
                        this.mouseState[btn] = false;
                        this.processMouseEvent(entities, "Up", newPos.x, newPos.y, btn);
                        this.processMouseEvent(entities, "Click", newPos.x, newPos.y, btn);
                    }
                }
            }
        };

        return InputSystem;
    }
);