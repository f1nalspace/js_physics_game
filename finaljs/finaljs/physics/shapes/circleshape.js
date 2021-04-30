/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.shapes.CircleShape",
    [
        "final.math",
        "final.Vec2",
        "final.physics.shapes.Shape",
        "final.physics.shapes.ShapeType"
    ],
    function (final, math, Vec2, Shape, ShapeType) {
        function CircleShape(radius) {
            Shape.call(this, ShapeType.Circle);
            this.radius = radius;
        }

        CircleShape.extend(Shape);

        CircleShape.prototype.getMassFactor = function () {
            return Math.PI * this.radius * this.radius;
        };

        CircleShape.prototype.getInertiaFactor = function () {
            return this.radius * this.radius;
        };

        return CircleShape;
    }
);