/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.ContactSolver",
    [
        "final.Vec2Pool",
        "final.math",
        "final.collision.Contact",
        "final.collision.ContactList"
    ],
    function (final, Vec2Pool, math, Contact, ContactList) {
        function ContactSolver() {
            this.accumulateImpulses = true;
            this.allowedPenetration = 0.01;
            this.baumGarte = 0.2;
            this.iterations = 10;
            this.velocityThreshold = 30;
            this.allowAngularDynamics = true;
        }

        ContactSolver.prototype.initializeVelocityContacts = function (dt, contacts) {
            var dtInv = 1 / dt;
            var relVelocity = Vec2Pool.get();
            for (var i = 0; i < contacts.size(); i++) {
                var contact = contacts.item(i);
                var bodyA = contact.bodyA;
                var bodyB = contact.bodyB;
                var massDataA = bodyA.massData;
                var massDataB = bodyB.massData;
                var normal = contact.normal;
                var tangent = contact.tangent;
                var rA = contact.rA;
                var rB = contact.rB;

                // Setup coeffecients
                contact.friction = Math.sqrt(bodyA.friction * bodyB.friction);
                contact.restitution = Math.max(bodyA.restitution, bodyB.restitution);

                // Calculate relative contact points
                math.vec2Sub(rA, contact.contactPoint, bodyA.position);
                math.vec2Sub(rB, contact.contactPoint, bodyB.position);

                // Calculate normal mass matrix
                var rnA = math.vec2Dot(rA, normal);
                var rnB = math.vec2Dot(rB, normal);
                var kNormal = massDataA.invMass + massDataB.invMass;
                if (this.allowAngularDynamics) {
                    kNormal += massDataA.invInertia * (math.vec2Dot(rA, rA) - rnA * rnA) + massDataB.invInertia * (math.vec2Dot(rB, rB) - rnB * rnB);
                }
                contact.normMass = 1.0 / kNormal;

                // Calculate tangent normal
                math.vec2CrossVS(tangent, normal, 1.0);

                // Calculate tangent mass matrix
                var rtA = math.vec2Dot(rA, tangent);
                var rtB = math.vec2Dot(rB, tangent);
                var kTangent = massDataA.invMass + massDataB.invMass;
                if (this.allowAngularDynamics) {
                    kTangent += massDataA.invInertia * (math.vec2Dot(rA, rA) - rtA * rtA) + massDataB.invInertia * (math.vec2Dot(rB, rB) - rtB * rtB);
                }
                contact.tangentMass = 1.0 / kTangent;

                // Relative velocity
                if (this.allowAngularDynamics) {
                    var tmp = Vec2Pool.get();
                    math.vec2CrossSV(tmp, bodyB.angularVelocity, contact.rB);
                    math.vec2Add(relVelocity, bodyB.velocity, tmp);
                    math.vec2Sub(relVelocity, relVelocity, bodyA.velocity);
                    math.vec2CrossSV(tmp, bodyA.angularVelocity, contact.rA);
                    math.vec2Sub(relVelocity, relVelocity, tmp);
                } else {
                    math.vec2Sub(relVelocity, bodyB.velocity, bodyA.velocity);
                }

                // Setup a velocity bias position correction and restitution
                contact.velocityBias = -this.baumGarte * dtInv * Math.min(0.0, contact.penetration + this.allowedPenetration);
                var velAlongNormal = math.vec2Dot(contact.normal, relVelocity);
                if (velAlongNormal < -this.velocityThreshold) {
                    contact.velocityBias += -contact.restitution * velAlongNormal;
                }
            }
        };

        ContactSolver.prototype.solveVelocityContact = function (dt, contact) {
            var bodyA = contact.bodyA;
            var bodyB = contact.bodyB;
            var normal = contact.normal;
            var tangent = contact.tangent;
            var massDataA = bodyA.massData;
            var massDataB = bodyB.massData;

            var relVelocity = Vec2Pool.get();
            var tmp = Vec2Pool.get();

            // Relative velocity
            if (this.allowAngularDynamics) {
                math.vec2CrossSV(tmp, bodyB.angularVelocity, contact.rB);
                math.vec2Add(relVelocity, bodyB.velocity, tmp);
                math.vec2Sub(relVelocity, relVelocity, bodyA.velocity);
                math.vec2CrossSV(tmp, bodyA.angularVelocity, contact.rA);
                math.vec2Sub(relVelocity, relVelocity, tmp);
            } else {
                math.vec2Sub(relVelocity, bodyB.velocity, bodyA.velocity);
            }

            // Calculate velocity scalar along normal
            var velAlongNormal = math.vec2Dot(relVelocity, normal);

            // Calculate normal impulse with velocity bias (position correction + restitution)
            var j = contact.normMass * (-velAlongNormal + contact.velocityBias);

            // Accumulate normal impulse
            if (this.accumulateImpulses) {
                var oldImpulse = contact.impulse;
                contact.impulse = Math.max(oldImpulse + j, 0.0);
                j = contact.impulse - oldImpulse;
            } else {
                j = Math.max(j, 0);
            }
            var impulse = Vec2Pool.get();
            math.vec2MultScalar(impulse, normal, j);

            // Apply impulse
            if (this.allowAngularDynamics) {
                math.vec2SubMultScalar(bodyA.velocity, bodyA.velocity, impulse, massDataA.invMass);
                bodyA.angularVelocity -= math.vec2Cross(contact.rA, impulse) * massDataA.invInertia;
                math.vec2AddMultScalar(bodyB.velocity, bodyB.velocity, impulse, massDataB.invMass);
                bodyB.angularVelocity += math.vec2Cross(contact.rB, impulse) * massDataB.invInertia;
            } else {
                math.vec2SubMultScalar(bodyA.velocity, bodyA.velocity, impulse, massDataA.invMass);
                math.vec2AddMultScalar(bodyB.velocity, bodyB.velocity, impulse, massDataB.invMass);
            }

            // Recalculate relative velocity
            if (this.allowAngularDynamics) {
                math.vec2CrossSV(tmp, bodyB.angularVelocity, contact.rB);
                math.vec2Add(relVelocity, bodyB.velocity, tmp);
                math.vec2Sub(relVelocity, relVelocity, bodyA.velocity);
                math.vec2CrossSV(tmp, bodyA.angularVelocity, contact.rA);
                math.vec2Sub(relVelocity, relVelocity, tmp);
            } else {
                math.vec2Sub(relVelocity, bodyB.velocity, bodyA.velocity);
            }

            // Calculate velocity scalar along tangent
            var velAlongTangent = math.vec2Dot(relVelocity, tangent);

            // Calculate friction impulse
            var jt = contact.tangentMass * (-velAlongTangent);

            // Accumulate friction impulse
            var maxFriction;
            if (this.accumulateImpulses) {
                maxFriction = contact.friction * contact.impulse;
                var oldTangentImpulse = contact.tangentImpulse;
                contact.tangentImpulse = math.clamp(oldTangentImpulse + jt, -maxFriction, maxFriction);
                jt = contact.tangentImpulse - oldTangentImpulse;
            } else {
                maxFriction = contact.friction * j;
                jt = math.clamp(jt, -maxFriction, maxFriction);
            }

            // Calculate tangent impulse
            var tangentImpulse = Vec2Pool.get();
            math.vec2MultScalar(tangentImpulse, tangent, jt);

            // Apply tangent impulse
            if (this.allowAngularDynamics) {
                math.vec2SubMultScalar(bodyA.velocity, bodyA.velocity, tangentImpulse, massDataA.invMass);
                bodyA.angularVelocity -= math.vec2Cross(contact.rA, tangentImpulse) * massDataA.invInertia;
                math.vec2AddMultScalar(bodyB.velocity, bodyB.velocity, tangentImpulse, massDataB.invMass);
                bodyB.angularVelocity += math.vec2Cross(contact.rB, tangentImpulse) * massDataB.invInertia;
            } else {
                math.vec2SubMultScalar(bodyA.velocity, bodyA.velocity, tangentImpulse, massDataA.invMass);
                math.vec2AddMultScalar(bodyB.velocity, bodyB.velocity, tangentImpulse, massDataB.invMass);
            }
        };

        ContactSolver.prototype.solveVelocities = function (dt, contacts) {
            for (var j = 0; j < this.iterations; j++) {
                for (var i = 0; i < contacts.size(); i++) {
                    this.solveVelocityContact(dt, contacts.item(i));
                }
            }
        };

        return ContactSolver;
    }
);