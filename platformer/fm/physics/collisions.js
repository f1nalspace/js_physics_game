/**
 * Created by tspaete on 27.02.14.
 */
fm.ns('fm.physics.collisions');
fm.req('fm.geometry.math');
fm.req('fm.physics.Contact');

(function(Vec2, vmath, physics) {
    var aabbAxis = [
        Vec2(1,0),
        Vec2(0,1)
    ];

    var collisions = {
        isIntersectionAABBvsAABB: function(a, b) {
            return (a.max[0] > b.min[0] &&
                a.max[1] > b.min[1]) && (a.min[0] < b.max[0] && a.min[1] < b.max[1]);
        },
        getContactAABBvsAABB: function(contact, aabbA, aabbB, relPos){
            // Find smallest collision normal and distance for a fixed set of axis
            var collisionNormal = Vec2(0, 0);
            var collisionDistance = 0;
            var index = -1;
            for (var i = 0; i < aabbAxis.length; i++) {
                var n = aabbAxis[i];

                // Project box A and B on normal
                var projA = Vec2(0, 0);
                var projB = Vec2(0, 0);
                aabbA.project(projA, n);
                aabbB.project(projB, n);

                // Add relative offset to B´s projection
                projB[0] += vmath.vec2Dot(n, relPos);
                projB[1] += vmath.vec2Dot(n, relPos);

                // Calculate overlap and get smallest (greatest negative) projection
                var d0 = projA[0] - projB[1];
                var d1 = projB[0] - projA[1];
                var overlap = d0 > d1 ? d0 : d1;

                // Store smallest (greatest negative) collision distance and normal when needed
                if (index == -1 || overlap > collisionDistance) {
                    index = i;
                    collisionDistance = overlap;
                    vmath.vec2Copy(collisionNormal, n);
                }
            }

            // Make sure the collision normal is always in right direction
            if (vmath.vec2Dot(collisionNormal, relPos) < 0) {
                vmath.vec2MultScalar(collisionNormal, collisionNormal, -1);
            }

            // Normal needs to be to flipped!
            vmath.vec2MultScalar(collisionNormal, collisionNormal, -1);

            // Store contact normal
            vmath.vec2Copy(contact.normal, collisionNormal);
            contact.distance = collisionDistance;
        }
    };
    physics.collisions = collisions;
})(fm.geometry.Vec2, fm.geometry.math, fm.physics);
