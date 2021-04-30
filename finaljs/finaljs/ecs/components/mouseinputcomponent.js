/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.components.MouseInputComponent",
    [
        "final.ecs.Component",
        "final.ecs.ComponentRegister"
    ],
    function (final, Component, ComponentRegister) {
        function MouseInputComponent(){
            Component.call(this);
            this.mouseMove = function(x, y){};
            this.mouseDown = function(x, y, button){};
            this.mouseUp = function(x, y, button){};
            this.mouseClick = function(x, y, button){};
        }
        MouseInputComponent.extend(Component);

        MouseInputComponent.prototype.setMouseMove = function(mouseMove){
            this.mouseMove = mouseMove;
            return this;
        };

        MouseInputComponent.prototype.setMouseDown = function(mouseDown){
            this.mouseDown = mouseDown;
            return this;
        };

        MouseInputComponent.prototype.setMouseUp = function(mouseUp){
            this.mouseUp = mouseUp;
            return this;
        };

        MouseInputComponent.prototype.setMouseClick = function(mouseClick){
            this.mouseClick = mouseClick;
            return this;
        };

        ComponentRegister.register(MouseInputComponent);

        return MouseInputComponent;
    }
);