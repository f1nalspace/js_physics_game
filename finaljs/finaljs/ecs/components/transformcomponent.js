/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.components.TransformComponent",
    [
        "final.ecs.Component",
        "final.ecs.ComponentRegister",
        "final.Vec2"
    ],
    function (final, Component, ComponentRegister, Vec2) {
        function TransformComponent(pos, orientation){
            Component.call(this);
            this.position = pos || new Vec2();
            this.orientation = orientation || 0;
        }
        TransformComponent.extend(Component);

        TransformComponent.prototype.setPosition = function(x, y){
            this.position.x = x;
            this.position.y = y;
            return this;
        };

        TransformComponent.prototype.setPositionFrom = function(v){
            this.position.x = v.x;
            this.position.y = v.y;
            return this;
        };

        TransformComponent.prototype.setOrientation = function(orientation){
            this.orientation = orientation;
            return this;
        };

        ComponentRegister.register(TransformComponent);

        return TransformComponent;
    }
);