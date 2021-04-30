/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.ecs.components.ShapeComponent",
    [
        "final.ecs.Component",
        "final.ecs.ComponentRegister",
        "final.physics.shapes.Shape"
    ],
    function (final, Component, ComponentRegister, Shape) {
        function ShapeComponent(shape){
            Component.call(this);
            this.shape = shape || null;
        }
        ShapeComponent.extend(Component);

        ShapeComponent.prototype.setShape = function(shape){
            this.shape = shape;
            return this;
        };

        ShapeComponent.prototype.calculateMass = function(massData){
            if (this.shape == null) {
                throw new Error("No shape in shape component assigned!");
            }
            this.shape.computeMass(massData, massData.density);
            return this;
        };

        ComponentRegister.register(ShapeComponent);

        return ShapeComponent;
    }
);