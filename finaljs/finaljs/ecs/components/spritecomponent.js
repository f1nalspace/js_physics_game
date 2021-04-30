/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.components.SpriteComponent",
    [
        "final.ecs.Component",
        "final.ecs.ComponentRegister"
    ],
    function (final, Component, ComponentRegister) {
        function SpriteComponent(image){
            Component.call(this);
            this.image = image || null;
        }
        SpriteComponent.extend(Component);

        SpriteComponent.prototype.setImage = function(image){
            this.image = image;
        };

        ComponentRegister.register(SpriteComponent);

        return SpriteComponent;
    }
);