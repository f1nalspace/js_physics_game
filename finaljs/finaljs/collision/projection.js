/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.collision.Projection", ["final.Vec2", "final.math"], function(final, Vec2, math) {
    return {
        projectAABB: function(output, aabbExt, normal){
            var p = Math.abs(math.vec2Dot(math.vec2UnitX(), normal)) * aabbExt.x + Math.abs(math.vec2Dot(math.vec2UnitY(), normal)) * aabbExt.y;
            output.x = -p;
            output.y = p;
        },
        projectCircle: function(output, radius) {
            output.x = -radius;
            output.y = radius;
        }
    };
});