/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.Body",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math",
        "final.physics.shapes.Shape",
        "final.physics.MassData"
    ],
    function (final, Vec2, Vec2Pool, math, Shape, MassData) {
        var defaultDamping = 0.98;
        var defaultAngularDamping = 0.98;
        var defaultRestitution = 0.2;
        var defaultFriction = 0.3;

        function Body(density, restitution, friction) {
            this.position = new Vec2();
            this.orientation = 0;

            this.velocity = new Vec2();
            this.acceleration = new Vec2();
            this.nextPosition = new Vec2();
            this.angularVelocity = 0;

            this.force = new Vec2();
            this.torque = 0;

            this.massData = new MassData(density);

            this.damping = defaultDamping;
            this.angularDamping = defaultAngularDamping;
            this.restitution = restitution || defaultRestitution;
            this.friction = friction || defaultFriction;

            this.shape = null;
            this.userData = null;
            this.id = 0;
            this.color = "yellow";
        }

        Body.prototype.init = function () {
            math.vec2Zero(this.position);
            this.orientation = 0;

            math.vec2Zero(this.velocity);
            math.vec2Zero(this.acceleration);
            math.vec2Zero(this.nextPosition);
            this.angularVelocity = 0;

            math.vec2Zero(this.force);
            this.torque = 0;

            this.massData.init();

            this.damping = defaultDamping;
            this.angularDamping = defaultAngularDamping;
            this.restitution = defaultRestitution;
            this.friction = defaultFriction;

            this.shape = null;
            this.userData = null;
            this.id = 0;
            this.color = "yellow";
        };

        Body.prototype.isStatic = function () {
            return this.massData.invMass == 0;
        };

        Body.prototype.clearForce = function (dt) {
            // Clear force accumulator
            math.vec2Zero(this.force);
            this.torque = 0;
        };

        Body.prototype.integrateVelocity = function (dt) {
            // Get acceleration from force (Acceleration = Force / Mass)
            math.vec2MultScalar(this.acceleration, this.force, this.massData.invMass);

            // Update linear velocity from linear acceleration
            math.vec2AddMultScalar(this.velocity, this.velocity, this.acceleration, dt);

            // Damp velocity
            math.vec2MultScalar(this.velocity, this.velocity, Math.pow(this.damping, dt));

            // Predict next position
            math.vec2AddMultScalar(this.nextPosition, this.position, this.velocity, dt);

            // Get angular acceleration from torque (Rotational acceleration = Torque / Inertia)
            var angularAcceleration = this.torque * this.massData.invInertia;

            // Update angular velocity from rotational acceleration
            this.angularVelocity += angularAcceleration * dt;
            this.angularVelocity *= Math.pow(this.angularDamping, dt);
        };

        Body.prototype.integratePosition = function (dt) {
            // Update linear position (Position next = Position last + Velocity * dt)
            math.vec2AddMultScalar(this.position, this.position, this.velocity, dt);
            // Update orientation
            this.orientation += this.angularVelocity * dt;
        };

        Body.prototype.addForce = function (force) {
            math.vec2Add(this.force, this.force, force);
        };

        Body.prototype.setShape = function(shape) {
            this.shape = shape;
            this.shape.computeMass(this.massData, this.massData.density);
            return this;
        };

        return Body;
    }
);