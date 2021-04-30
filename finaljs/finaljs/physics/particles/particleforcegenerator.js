/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.particles.ParticleForceGenerator",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math",
        "final.physics.particles.Particle"
    ],
    function (final, Vec2, Vec2Pool, math, Particle) {
        var particles = final.physics.particles;

        function ParticleForceGenerator() {
            this.enabled = true;
        }

        ParticleForceGenerator.prototype.updateForce = function (particle, dt, invDt) {
            throw new Error("Interface");
        };

        ParticleForceGenerator.prototype.draw = function (r) {
            throw new Error("Interface");
        };

        return ParticleForceGenerator;
    }
);