/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.shapes.LineSegmentShape",
    [
        "final.math",
        "final.Vec2",
        "final.physics.shapes.Shape",
        "final.physics.shapes.ShapeType"
    ],
    function (final, math, Vec2, Shape, ShapeType) {
        function LineSegmentShape(distance) {
            Shape.call(this, ShapeType.LineSegment);
            this.distance = distance;
        }

        LineSegmentShape.extend(Shape);

        return LineSegmentShape;
    }
);