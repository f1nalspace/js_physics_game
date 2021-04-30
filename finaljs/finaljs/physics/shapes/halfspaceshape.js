/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.shapes.HalfSpaceShape",
    [
        "final.math",
        "final.Vec2",
        "final.physics.shapes.Shape",
        "final.physics.shapes.ShapeType"
    ],
    function (final, math, Vec2, Shape, ShapeType) {
        function HalfSpaceShape(normal, size) {
            Shape.call(this, ShapeType.HalfSpace);
            this.normal = normal;
            this.size = size || 500;
        }

        HalfSpaceShape.extend(Shape);

        return HalfSpaceShape;
    }
);