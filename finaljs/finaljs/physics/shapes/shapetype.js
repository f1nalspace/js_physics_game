/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.shapes.ShapeType",
    [
    ],
    function (final) {
        return {
            Unknown: 0,
            HalfSpace: 1,
            Plane: 2,
            LineSegment: 3,
            Circle: 4
        };
    }
);