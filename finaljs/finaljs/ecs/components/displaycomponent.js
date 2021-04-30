/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.components.DisplayComponent",
    [
        "final.ecs.Component",
        "final.ecs.ComponentRegister"
    ],
    function (final, Component, ComponentRegister) {
        function DisplayComponent(visible, color){
            Component.call(this);
            this.visible = visible || true;
            this.color = color || "white";
        }
        DisplayComponent.extend(Component);

        DisplayComponent.prototype.setVisible = function(visible){
            this.visible = visible;
            return this;
        };

        DisplayComponent.prototype.setColor = function(color){
            this.color = color;
            return this;
        };

        ComponentRegister.register(DisplayComponent);

        return DisplayComponent;
    }
);