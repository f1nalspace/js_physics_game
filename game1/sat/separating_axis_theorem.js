SeparatingAxisTheorem = function () {
}

SeparatingAxisTheorem.prototype.getCollision = function (A, B, velA, velB, finalDepth, finalAxis) {
    var taxis = [];
    var naxis = [];

    // Get distance from A to B
    var offset = A.center.sub(B.center);

    // Test velocity axis
    var vel = velA.sub(velB);
    var f = vel.dot(vel);
    if (f > 0.00001) {
        var axis = vel.perp().normalized();
        if (!this.intervalIntersect(A, B, offset, vel, axis, taxis, naxis)) {
            return false;
        }
    }

    // Test axis for A
    for (var i in A.axis) {
        var axis = A.axis[i];
        if (!this.intervalIntersect(A, B, offset, vel, axis, taxis, naxis)) {
            return false;
        }
    }

    // Test axis for B
    for (var i in B.axis) {
        var axis = B.axis[i];
        if (!this.intervalIntersect(A, B, offset, vel, axis, taxis, naxis)) {
            return false;
        }
    }

    // Find MTV, because we have not found a separation, therefore there must be an overlap,
    // either in time or now
    if (this.findMTV(taxis, naxis, taxis.length, finalDepth, finalAxis)) {
        // Ensure that the axis is pushing away boxA
        if (offset.dot(finalAxis) < 0.0) {
            finalAxis.x = -finalAxis.x;
            finalAxis.y = -finalAxis.y;
        }
        return true;
    }

    // An error happened, no mtv was found!
    throw new Error("MTV could not be determined!");
}

SeparatingAxisTheorem.prototype.intervalIntersect = function (A, B, offset, vel, axis, taxis, naxis) {
    // Project both boxes on current axis
    var projection1 = A.project(axis);
    var projection2 = B.project(axis);

    // Get overlaps
    var d0 = projection1.min - projection2.max;
    var d1 = projection2.min - projection1.max;

    if (d0 > 0 || d1 > 0) {
        // Project velocity on axis
        var v = vel.dot(axis);
        if (Math.abs(v) < 0.0000001) {
            return false;
        }

        var t0 = -d0 / v; // time of impact to d0 reaches 0
        var t1 = d1 / v; // time of impact to d0 reaches 1

        // Sort times
        if (t0 > t1) {
            var temp = t0;
            t0 = t1;
            t1 = temp;
        }

        // Take the minimum positive (0.9 smaller penetration > 0.5 bigger penetration)
        var overlap = (t0 > 0.0) ? t0 : t1;

        // Intersection time too late or back in time, no collision
        if (overlap < 0.0 || overlap > 1.0) {
            return false;
        }

        // Save the minimum positiv overlap in time (0.0 - 1.0 = 1.0 No collision at all)
        taxis.push(overlap);
        naxis.push(axis.clone());
        return true;
    } else {
        // Save the minimum positive (-1 smaller penetration > -5 bigger penetration)
        var overlap = d0 > d1 ? d0 : d1;
        taxis.push(overlap);
        naxis.push(axis.clone());
        return true;
    }
}

SeparatingAxisTheorem.prototype.findMTV = function (taxis, naxis, count, finalDepth, finalAxis) {
    var mini = -1;
    finalDepth.x = 0.0;
    for (var i = 0; i < count; i++) {
        if (taxis[i] > 0 && taxis[i] > finalDepth.x) {
            mini = i;
            finalDepth.x = taxis[i];
            finalAxis.setup(naxis[i]);
            finalAxis.normalize();
        }
    }

    if (mini != -1) {
        return true;
    }

    mini = -1;
    for (var i = 0; i < count; i++) {
        var n = naxis[i].normalize();
        taxis[i] /= n;
        if (taxis[i] > finalDepth.x || mini == -1) {
            mini = i;
            finalDepth.x = taxis[i];
            finalAxis.setup(naxis[i]);
        }
    }
    return mini != -1;
}
