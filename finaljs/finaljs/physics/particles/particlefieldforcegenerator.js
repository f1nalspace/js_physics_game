/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.particles.ParticleFieldForceGenerator",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math",
        "final.physics.particles.ParticleForceGenerator"
    ],
    function (final, Vec2, Vec2Pool, math, ParticleForceGenerator) {
        function ParticleFieldForceGenerator(pos, mass) {
            ParticleForceGenerator.call(this);
            this.position = pos || new Vec2();
            this.interactionRadius = 10;
            this.mass = mass;
            this.tmpRelPos = new Vec2();
            this.tmpAccel = new Vec2();
        }

        ParticleFieldForceGenerator.extend(ParticleForceGenerator);

        ParticleFieldForceGenerator.prototype.updateForce = function (particle, dt, invDt) {
            if (particle.hasFiniteMass() && particle.isAlive()) {
                math.vec2Sub(this.tmpRelPos, this.position, particle.position);
                var forceScalar = -this.mass / Math.pow(math.vec2LengthSquared(this.tmpRelPos), 1.1);
                math.vec2MultScalar(this.tmpAccel, this.tmpRelPos, forceScalar * invDt * invDt);
                particle.addForce(this.tmpAccel);
            }
        };
        return ParticleFieldForceGenerator;
    }
);