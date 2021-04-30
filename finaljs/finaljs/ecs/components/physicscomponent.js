/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.components.PhysicsComponent",
    [
        "final.ecs.Component",
        "final.ecs.ComponentRegister",
        "final.physics.Body"
    ],
    function (final, Component, ComponentRegister, Body) {
        function PhysicsComponent(density, restitution, friction){
            Component.call(this);
            this.body = new Body(density, restitution, friction);
        }
        PhysicsComponent.extend(Component);

        ComponentRegister.register(PhysicsComponent);

        return PhysicsComponent;
    }
);