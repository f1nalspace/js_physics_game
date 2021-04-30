/**
 * Created by tspaete on 27.02.14.
 */
fm.ns('fm.physics.ContactSolver');
fm.req('fm.geometry.Vec2');
fm.req('fm.geometry.math');
fm.req('fm.entity.MoveableEntity');
fm.req('fm.physics.Contact');

(function(Vec2, entity, vmath, physics) {
    function ContactSolver() {
        this.maxContacts = 1000;
        this.contactCount = 0;
        this.contacts = Array.apply(null, new Array(this.maxContacts)).map(function(){
            return new physics.Contact();
        });
        this.iterationCount = 10;
        this.contactCallback = function(bodyA, bodyB, normal, dt){};
    }

    ContactSolver.prototype.reset = function() {
        this.contactCount = 0;
    };

    ContactSolver.prototype.addContact = function(bodyA, bodyB, normal, distance, tileAABB) {
        if (this.contactCount < this.maxContacts) {
            var contact = this.contacts[this.contactCount];
            vmath.vec2Copy(contact.normal, normal);
            contact.distance = distance;
            contact.bodyA = bodyA;
            contact.bodyB = bodyB;
            contact.tileAABB = tileAABB || null;
            this.contactCount++;
        } else {
            throw new Error("Too many contacts > "+this.maxContacts+" !");
        }
    };

    ContactSolver.prototype.solveContact = function(contact, dt) {
        // get the separation and penetration separately
        var separation = Math.max(contact.distance, 0);
        var penetration = Math.min(contact.distance, 0);

        // Save normal
        var normal = contact.normal;

        var bodyA = contact.bodyA;
        var bodyB = contact.bodyB;

        var velA = bodyA.vel;
        var velB = bodyB != null ? bodyB.vel : null;
        var posCorrectA = bodyA.posCorrect;
        var posCorrectB = bodyB != null ? bodyB.posCorrect : null;
        var useBodyB = bodyB != null && bodyB.handleEntityCollisions.has(entity.EntityCollisionFlag.SourceResolve);

        var relVel = Vec2();
        if (useBodyB) {
            vmath.vec2Sub(relVel, velA, velB);
        } else {
            vmath.vec2Copy(relVel, velA);
        }

        // compute relative normal velocity require to be object to an exact stop at the surface
        var nv = vmath.vec2Dot(relVel, normal) + separation / dt;

        // accumulate the penetration correction
        if (!useBodyB) {
            posCorrectA[0] -= normal[0] * (penetration / dt);
            posCorrectA[1] -= normal[1] * (penetration / dt);
        } else {
            posCorrectA[0] -= normal[0] * (penetration / dt);
            posCorrectA[1] -= normal[1] * (penetration / dt);
            posCorrectB[0] += normal[0] * (penetration / dt);
            posCorrectB[1] += normal[1] * (penetration / dt);
        }

        if (nv < 0) {
            // remove normal velocity from A
            // TODO: Add velocity to B when collision is accepted (nv needs to be half!)
            if (!useBodyB) {
                velA[0] -= normal[0] * nv;
                velA[1] -= normal[1] * nv;
            } else {
                velA[0] -= normal[0] * nv;
                velA[1] -= normal[1] * nv;
                velB[0] += normal[0] * nv;
                velB[1] += normal[1] * nv;
            }

            // is this some ground?
            if (normal[1] < 0) {
                // get the tanget from the normal (perp vector)
                var tangent = Vec2(-normal[1], normal[0]);
                if (bodyA.applyFriction) {
                    // compute the tangential velocity, scale by friction
                    var tv = vmath.vec2Dot(relVel, tangent) * bodyA.groundFriction;
                    // subtract that from the main velocity
                    velA[0] -= tangent[0] * tv;
                    velA[1] -= tangent[1] * tv;
                }
            }

            // call callback
            this.contactCallback(bodyA, bodyB, normal, dt);
        }
    };

    ContactSolver.prototype.solve = function(dt) {
        for (var i = 0; i < this.iterationCount; i++) {
            for (var j = 0; j < this.contactCount; j++) {
                var contact = this.contacts[j];
                this.solveContact(contact, dt);
            }
        }
    };

    physics.ContactSolver = ContactSolver;
})(fm.geometry.Vec2, fm.entity, fm.geometry.math, fm.physics);
