/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.collision.ClosestPoints", ["final.Vec2Pool", "final.math"], function (final, Vec2Pool, math) {
    return {
        closestPointOnLineSegment: function (output, point, a, b) {
            var ab = Vec2Pool.get();
            var ac = Vec2Pool.get();
            math.vec2Sub(ab, b, a);
            math.vec2Sub(ac, point, a);
            math.vec2AddMultScalar(output, a, ab, Math.max(Math.min(math.vec2Dot(ac, ab) / math.vec2LengthSquared(ab), 1), 0));
        },
        closestPointOnPlaneOrHalfSpace: function (output, point, normal, pos) {
            var pointToPos = Vec2Pool.get();
            math.vec2Sub(pointToPos, point, pos);
            math.vec2AddMultScalar(output, point, normal, -math.vec2Dot(pointToPos, normal));
        },
        closestPointOnAABB: function (output, point, center, ext) {
            math.vec2Clone(output, point);
            output.x = Math.max(Math.min(center.x + ext.x, output.x), center.x - ext.x);
            output.y = Math.max(Math.min(center.y + ext.y, output.y), center.y - ext.y);
        },
        closestPointOnOBB: function (output, point, center, ext, u0, u1) {
            var d = Vec2Pool.get();
            math.vec2Sub(d, point, center);

            var q = Vec2Pool.get();
            math.vec2Set(q, center.x, center.y);
            var dist = Math.max(Math.min(math.vec2Dot(d, u0), ext.x), -ext.x);
            math.vec2AddMultScalar(q, q, u0, dist);

            dist = Math.max(Math.min(math.vec2Dot(d, u1), ext.y), -ext.y);
            math.vec2AddMultScalar(q, q, u1, dist);

            math.vec2Clone(output, q);
        },
        closestPointOnCircle: function (output, point, center, radius) {
            var n = Vec2Pool.get();
            math.vec2Sub(n, point, center);
            if (math.vec2LengthSquared(n) < radius * radius) {
                math.vec2Clone(output, point);
            } else {
                math.vec2Normalize(n, n);
                math.vec2AddMultScalar(output, center, n, radius);
            }
        }
    };
});