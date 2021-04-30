final.module("final.collisions", ["final.vec", "final.vec2math"], function(final, vec, vec2math){
    var Vec2 = vec.Vec2;

    var isIntersectionCircleOfCircle = function(p1, r1, p2, r2) {
        var distance = new Vec2();
        vec2math.sub(distance, p2, p1);
        var l = vec2math.lengthSquared(distance);
        return l <= r1 * r1 + r2 * r2;
    };

    var getClosestPointOnPlane = function(out, point, normal, distance) {
        var distancePointToPlane = -vec2math.dot(normal, point) + distance;
        vec2math.multScalar(out, normal, distancePointToPlane);
        vec2math.add(out, point, out);
        return out;
    };

    var isIntersectionCircleOfRectangle = function(circlePos, circleRadius, rectCenter, rectSize) {
        var closest = new Vec2(circlePos.x, circlePos.y);
        closest.x = Math.max(Math.min(closest.x, rectCenter.x + rectSize.x * 0.5), rectCenter.x - rectSize.x * 0.5);
        closest.y = Math.max(Math.min(closest.y, rectCenter.y + rectSize.y * 0.5), rectCenter.y - rectSize.y * 0.5);
        var radii = new Vec2(circleRadius + rectSize.x * 0.5, circleRadius + rectSize.y * 0.5);
        var result = false;
        if (vec2math.equals(closest, circlePos)) {
            // Inside
            var dx = Math.abs((circlePos.x - rectCenter.x) - radii.x);
            var dy = Math.abs((circlePos.y - rectCenter.y) - radii.y);
            result = true;
        } else {
            // Outside
            var distance = new Vec2();
            vec2math.sub(distance, circlePos, closest);
            var dir = new Vec2();
            vec2math.normalize(dir, distance);
            var d = vec2math.dot(distance, dir) - circleRadius;
            result = d < 0;
        }
        return (result);
    };

    return {
        isIntersectionCircleOfCircle: isIntersectionCircleOfCircle,
        isIntersectionCircleOfRectangle: isIntersectionCircleOfRectangle,
        getClosestPointOnPlane: getClosestPointOnPlane
    };
});

