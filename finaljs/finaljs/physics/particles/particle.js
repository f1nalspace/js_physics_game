/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.particles.Particle",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math"
    ],
    function (final, Vec2, Vec2Pool, math) {
        function Particle() {
            this.position = new Vec2();
            this.velocity = new Vec2();
            this.force = new Vec2();
            this.damping = 1;
            this.mass = 0;
            this.invMass = 0;
            this.radius = 6;
            this.maxLife = 0;
            this.invMaxLife = 0;
            this.life = 0;
            this.color = "white";
            this.image = null;
            this.group = null;
        }

        Particle.prototype.computeMass = function (mass) {
            this.mass = mass;
            this.invMass = this.mass > 0 ? 1 / this.mass : 0;
        };

        Particle.prototype.setLife = function (life) {
            this.maxLife = life;
            this.invMaxLife = 1 / this.maxLife;
            this.life = life;
        };

        Particle.prototype.update = function (dt) {
            this.life -= dt;
        };

        Particle.prototype.integrate = function (dt) {
            // We don't integrate things with zero mass
            if (this.invMass <= 0) return;

            // Update linear position (Position next = Position last + Velocity * dt)
            math.vec2AddMultScalar(this.position, this.position, this.velocity, dt);

            // Get acceleration from force (Acceleration = Force / Mass)
            var resultingAcc = Vec2Pool.get();
            math.vec2MultScalar(resultingAcc, this.force, this.invMass);

            // Update linear velocity from the acceleration
            math.vec2AddMultScalar(this.velocity, this.velocity, resultingAcc, dt);

            // Damp velocity
            math.vec2MultScalar(this.velocity, this.velocity, Math.pow(this.damping, dt));

            // Clear force accumulator
            math.vec2Zero(this.force);
        };

        Particle.prototype.addForce = function (accel) {
            // Force = Acceleration * Mass
            math.vec2AddMultScalar(this.force, this.force, accel, this.mass);
        };

        Particle.prototype.hasFiniteMass = function () {
            return this.invMass >= 0;
        };

        Particle.prototype.isAlive = function () {
            return this.life > 0;
        };

        return Particle;
    }
);