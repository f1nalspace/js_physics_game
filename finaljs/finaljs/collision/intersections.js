/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.collision.Intersections",
    ["final.Vec2", "final.Vec2Pool", "final.math", "final.collision.ClosestPoints"],
    function (final, Vec2, Vec2Pool, math, ClosestPoints) {
        var aabbAxis = [new Vec2(1, 0), new Vec2(0, 1)];
        return {
            isPointInCircle: function (point, center, radius) {
                var v = Vec2Pool.get();
                math.vec2Sub(v, point, center);
                return math.vec2LengthSquared(v) <= radius * radius;
            },
            isPointInAABB: function (point, center, ext) {
                return !(point.x < center.x - ext.x || point.x > center.x + ext.x || point.y < center.y - ext.y || point.y > center.y + ext.y);
            },
            isCircleInCircle: function (centerA, radiusA, centerB, radiusB) {
                var v = Vec2Pool.get();
                math.vec2Sub(v, centerA, centerB);
                var r = radiusA + radiusB;
                return math.vec2LengthSquared(v) <= r * r;
            },
            isCircleInHalfSpace: function (center, radius, planeNormal, planePos) {
                var planeDistance = -math.vec2Dot(planeNormal, planePos);
                var p = radius - math.vec2Dot(center, planeNormal);
                return p > planeDistance;
            },
            isCircleInAABB: function (center, radius, aabbCenter, aabbExt) {
                var closest = Vec2Pool.get();
                ClosestPoints.closestPointOnAABB(closest, center, aabbCenter, aabbExt);
                var v = Vec2Pool.get();
                math.vec2Sub(v, closest, center);
                return math.vec2LengthSquared(v) < radius * radius;
            },
            isAABBInAABB: function (centerA, extA, centerB, extB) {
                var v = Vec2Pool.get();
                math.vec2Sub(v, centerA, centerB);
                var ex = extA.x + extB.x;
                var ey = extA.y + extB.y;
                return !(v.x < -ex || v.y < -ey || v.x > ex || v.y > ey);
            },
            isAABBInHalfSpace: function (aabbCenter, aabbExt, planeNormal, planePos) {
                var planeDistance = -math.vec2Dot(planeNormal, planePos);
                var p = Math.abs(math.vec2Dot(aabbAxis[0], planeNormal)) * aabbExt.x + Math.abs(math.vec2Dot(aabbAxis[1], planeNormal)) * aabbExt.y - math.vec2Dot(aabbCenter, planeNormal);
                return p > planeDistance;
            },
            intersectRayAABB: function (start, distance, aabbCenter, aabbExt, tmax, tmin, output) {
                tmin.x = 0.0;

                // For all 2 slaps
                for (var j = 0; j < 2; j++) {
                    var i = j == 0 ? "x" : "y";
                    if (Math.abs(distance[i]) < math.epsilon) {
                        // Ray is parallel to slap. No hit if origin is within slap
                        if (start[i] < aabbCenter[i] - aabbExt[i] || start[i] > aabbCenter[i] + aabbExt[i]) return false;
                    } else {
                        // Compute intersection times for near and far plane
                        var ood = 1 / distance[i];
                        var t1 = ((aabbCenter[i] - aabbExt[i]) - start[i]) * ood;
                        var t2 = ((aabbCenter[i] + aabbExt[i]) - start[i]) * ood;
                        // Sort times
                        if (t1 > t2) {
                            var tmp = t1;
                            t1 = t2;
                            t2 = tmp;
                        }
                        // Find min/max intersection times
                        tmin.x = Math.max(tmin.x, t1);
                        tmax = Math.min(tmax, t2);

                        // Exit when intersection is too late
                        if (tmin.x <= 0 || tmin.x >= tmax) return false;
                    }
                }

                // Ray intersects all 2 slabs, return intersection point and time
                output.x = start.x + distance.x * tmin.x;
                output.y = start.y + distance.y * tmin.x;
                return true;
            },
            intersectRayCircle: function (start, distance, center, radius, tmax, tmin, output) {
                tmin.x = 0.0;

                var rayStartToCircle = Vec2Pool.get();
                math.vec2Sub(rayStartToCircle, start, center);

                var a = math.vec2LengthSquared(distance);
                var b = 2 * (distance.x * (start.x - center.x) + distance.y * (start.y - center.y));
                var c = math.vec2LengthSquared(rayStartToCircle) - radius * radius;
                var D = b * b - 4 * a * c;
                if (a <= math.epsilon || D < 0) {
                    // No intersection
                    return false;
                } else if (D == 0) {
                    // Tangent line: one intersection point
                    tmin.x = -b / 2 * a;
                    if (tmin.x <= 0 || tmin.x >= tmax) {
                        return false;
                    }
                } else {
                    // Secant line: two intersection points
                    var d = Math.sqrt(D);

                    // Calculate intersection times
                    var t1 = (-b - d) / (2 * a);
                    var t2 = (-b + d) / (2 * a);

                    // Sort times
                    if (t1 > t2) {
                        var tmp = t1;
                        t1 = t2;
                        t2 = tmp;
                    }

                    // Get min and max time
                    tmin.x = Math.max(tmin.x, t1);
                    tmax = Math.min(tmax, t2);

                    // Exit when intersection is too late
                    if (tmin.x <= 0 || tmin.x >= tmax) {
                        return false;
                    }
                }

                // Ray intersects circle, return intersection point and time
                output.x = start.x + distance.x * tmin.x;
                output.y = start.y + distance.y * tmin.x;
                return true;
            }
        };
    }
);