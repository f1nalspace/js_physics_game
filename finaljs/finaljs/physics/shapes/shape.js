/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.shapes.Shape",
    [
        "final.math",
        "final.Vec2"
    ],
    function (final, math, Vec2) {
        function Shape(type) {
            this.type = type;
        }

        Shape.prototype.getMassFactor = function () {
            return 0;
        };

        Shape.prototype.getInertiaFactor = function () {
            return 0;
        };

        Shape.prototype.computeMass = function (massData, density) {
            massData.mass = density * this.getMassFactor();
            massData.invMass = massData.mass > 0 ? 1 / massData.mass : 0;
            massData.inertia = massData.mass * this.getInertiaFactor();
            massData.invInertia = massData.inertia > 0 ? 1 / massData.inertia : 0;
        };

        return Shape;
    }
);