var finalgine = finalgine || {};

finalgine.Physics = {};
finalgine.Physics.Friction = 0.3;
finalgine.Physics.Bounciness = 0.0;
finalgine.Physics.Glue = 0.01;

finalgine.collide = function (A, B, dt) {
    // Skip dead references
    if (!A || !B) {
        return false;
    }

    // No need to resolve collision when both bodies are static
    if (A.isStatic() && B.isStatic()) {
        return false;
    }

    // Init collision output vars
    var t = finalgine.Vector2(1.0, 0.0);
    var N = finalgine.Vector2(0.0, 0.0);

    // Get relative position and velocity
    var rPos = A.pos.sub(B.pos);
    var velA = A.pos.sub(A.prevPos);
    var velB = B.pos.sub(B.prevPos);
    var rVel = velA.sub(velB);

    // Get collision result
    if (finalgine.SAT.getCollision(A.boundingVolume, B.boundingVolume, rPos, rVel, t, N)) {
        // Get velocities before collision is corrected
        if (t.x < 0.0) {
            // Handle overlap collision
            finalgine.overlapCollision(A, B, velA, velB, N, N.mul(-t.x), dt);
        } else {
        }
        return true;
    }
    return false;
};

finalgine.overlapCollision = function (A, B, vA, vB, N, mtd, dt) {
     if (A.isStatic()) {
        B.pos.isub(mtd);
    } else if (B.isStatic()) {
        A.pos.iadd(mtd);
    } else {
        A.pos.iadd(mtd.mul(A.invMass / (A.invMass + B.invMass)));
        B.pos.isub(mtd.mul(B.invMass / (A.invMass + B.invMass)));
    }
};

finalgine.timeCollision = function (A, B, vA, vB, N, t, dt) {
    var bounciness = 0.5;
    var friction = 0.0;

    // Correct position based on velocity and time factor
    var newVelA = vA.mul(t);
    var newVelB = vB.mul(t);
    A.pos.setup(A.prevPos.add(newVelA));
    B.pos.setup(B.prevPos.add(newVelB));

    var rA = vA.reflect(N, bounciness, friction).mul(A.invMass / (A.invMass + B.invMass));
    var rB = vB.reflect(N, bounciness, friction).mul(B.invMass / (A.invMass + B.invMass));

    // Add force to push objects apart
    A.addImpulse(rA);
    B.addImpulse(rB);

    /*
    // Reflect velocity
    var rA = vA.reflect(N, bounciness, friction).mul(A.invMass / (A.invMass + B.invMass));
    var rB = vB.reflect(N, bounciness, friction).mul(B.invMass / (A.invMass + B.invMass));
    A.prevPos.setup(A.pos);
    B.prevPos.setup(B.pos);

    // Add forces
    if (A.addForce)
        A.addForce(rA, 0);
    if (B.addForce)
        B.addForce(rB, 0);
    */

    /*
    var bounciness = 1.0;
    var friction = 0.0;

    // Get relative velocity
	var v = vA.sub(vB);

	var T = N.perp();
	var vN = N.mul(N.dot(v) * -bounciness);
	var vT = T.mul(T.dot(v) * (1.0 - friction));
	v = vN.add(vT);

    var m0 = A.invMass;
    var m1 = B.invMass;
    
    var m = m0 + m1;

    var r0 = m0 / m;
    var r1 = m1 / m;

    A.prevPos.setup(A.pos.sub(vA.add(v.mul(r0))));
    B.prevPos.setup(B.pos.sub(vB.add(v.mul(r1))));
    */

	/*
    var bounciness = 0.0;
    var friction = 0.0;

    // Get velocity for A and B
	var vA = A.pos.sub(A.prevPos);
	var vB = B.pos.sub(B.prevPos);
	
	// Get velocity between A and B
    var v = finalgine.Vector2(vA.sub(vB));
    
    // Get tangent from collision normal
    var t = N.perp();

    // Calculate new velocity for collision normal
    var vn = N.mul(v.dot(N) * -bounciness);

    // Calculate new velocity for collision tangent
    var vt = t.mul(v.dot(t) * (1.0 - friction));
    
    // Calculate new velocity
    v.setup(vn.x + vt.x, vn.y + vt.y);
    
    var m0 = A.invMass;
    var m1 = B.invMass;
    
    var m = m0 + m1;

    var r0 = m0 / m;
    var r1 = m1 / m;
    
    A.prevPos.setup(A.pos.sub(v.mul(r0)));
    B.prevPos.setup(B.pos.sub(v.mul(r1)));

    // Set previous position based on current position and new velocity
     var D = finalgine.Vector2(A.vel.sub(B.vel));

     var n  = D.dot(N);

     var Dn = N.mul(n);
     var Dt = D.sub(Dn);

     if (n > 0.0) Dn.setup(0, 0);

     var dt  = Dt.length();
     var CoF = finalgine.Physics.Friction;

     if (dt < finalgine.Physics.Glue * finalgine.Physics.Glue) CoF = 1.01;

     D.x = -(1.0 + finalgine.Physics.Bounciness) * Dn.x - (CoF) * Dt.x;
     D.y = -(1.0 + finalgine.Physics.Bounciness) * Dn.y - (CoF) * Dt.y;

     var m0 = A.invMass;
     var m1 = B.invMass;

     var m = m0 + m1;

     var r0 = m0 / m;
     var r1 = m1 / m;

     A.vel.x += D.x * r0;
     A.vel.y += D.y * r0;

     B.vel.x -= D.x * r1;
     B.vel.y -= D.y * r1;

    A.prevPos.setup(A.pos.sub(v.mul(r0)));
    B.prevPos.setup(B.pos.sub(v.mul(r1)));
     */
};