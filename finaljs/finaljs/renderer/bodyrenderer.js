"use strict";
final.module("final.renderer.BodyRenderer",
    [
        "final.Vec2Pool",
        "final.math"
    ],
    function (final, Vec2Pool, math) {
        var geoColor = "yellow";
        var normalColor = "white";
        var normalSize = 50;
        return {
            drawHalfSpaceOrPlane: function (r, pos, normal, size, color) {
                var tangent = Vec2Pool.get();
                math.vec2PerpRight(tangent, normal);
                var a = Vec2Pool.get();
                var b = Vec2Pool.get();
                math.vec2AddMultScalar(a, pos, tangent, -size);
                math.vec2AddMultScalar(b, pos, tangent, size);
                r.drawLine(b.x, b.y, a.x, a.y, color || geoColor, 2);
            },
            drawLineSegment: function (r, position, distance, orientation, color) {
                var a = Vec2Pool.get();
                var b = Vec2Pool.get();
                var rx = Math.cos(orientation) * distance;
                var ry = Math.sin(orientation) * distance;
                math.vec2Set(a, position.x - rx, position.y - ry);
                math.vec2Set(b, position.x + rx, position.y + ry);
                r.drawLine(b.x, b.y, a.x, a.y, color || geoColor, 2);
            },
            drawCircle: function (r, center, radius, orientation, color) {
                r.strokeArc(center.x, center.y, radius, color || geoColor, 2);
                r.drawLine(center.x, center.y, center.x + (Math.cos(orientation) * radius), center.y + (Math.sin(orientation) * radius), color || geoColor, 2);
            }
        };
    }
);