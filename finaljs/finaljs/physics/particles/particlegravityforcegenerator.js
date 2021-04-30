/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.particles.ParticleGravityForceGenerator",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math",
        "final.physics.particles.ParticleForceGenerator"
    ],
    function (final, Vec2, Vec2Pool, math, ParticleForceGenerator) {
        function ParticleGravityForceGenerator() {
            ParticleForceGenerator.call(this);
            this.gravityForce = new Vec2(0, 9.81 / (1 / 60));
        }

        ParticleGravityForceGenerator.extend(ParticleForceGenerator);

        ParticleGravityForceGenerator.prototype.updateForce = function (particle, dt, invDt) {
            if (particle.hasFiniteMass() && particle.isAlive()) {
                particle.addForce(this.gravityForce);
            }
        };

        ParticleGravityForceGenerator.prototype.draw = function (r) {
        };

        return ParticleGravityForceGenerator;
    }
);