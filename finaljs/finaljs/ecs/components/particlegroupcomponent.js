/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.components.ParticleGroupComponent",
    [
        "final.ecs.Component",
        "final.ecs.ComponentRegister",
        "final.Vec2"
    ],
    function (final, Component, ComponentRegister, Vec2) {
        function ParticleGroupComponent(vel){
            Component.call(this);
            this.group = null;
        }
        ParticleGroupComponent.extend(Component);

        ComponentRegister.register(ParticleGroupComponent);

        return ParticleGroupComponent;
    }
);