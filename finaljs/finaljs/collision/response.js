/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.collision.Response",
    ["final.Vec2", "final.Vec2Pool", "final.math"],
    function (final, Vec2, Vec2Pool, math) {
        return {
            reflectVector: function (output, v, normal, bounciness, friction) {
                // Project velocity on line normal
                var projVelocity = math.vec2Dot(v, normal);
                // Impact velocity vector
                var impactVel = Vec2Pool.get();
                math.vec2MultScalar(impactVel, normal, projVelocity);
                // Tangent velocity vector (across the surface of collision)
                var tangentVel = Vec2Pool.get();
                math.vec2Sub(tangentVel, v, impactVel);
                // Velocity for bounciness
                var velBounciness = Vec2Pool.get();
                math.vec2Set(velBounciness, -impactVel.x * bounciness, -impactVel.y * bounciness);
                // Velocity for friction
                var velFriction = Vec2Pool.get();
                math.vec2Set(velFriction, tangentVel.x * (1.0 - friction), tangentVel.y * (1.0 - friction));
                // Resulting velocity
                math.vec2Add(output, velBounciness, velFriction);
            }
        };
    });