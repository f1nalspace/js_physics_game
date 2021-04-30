/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.particles.ParticleEmitter",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math"
    ],
    function (final, Vec2, Vec2Pool, math) {
        function ParticleEmitter(particleEngine, angle, spread, life, spawnRate, speedMin, speedMax, color, mass, damping) {
            this.particleEngine = particleEngine;
            this.position = new Vec2();
            this.angle = angle;
            this.spread = spread;
            this.particleLife = life;
            this.particleSpeedMin = speedMin || 500;
            this.particleSpeedMax = speedMax || 600;
            this.spawnRate = spawnRate;
            this.emissionRate = 0;
            this.angleLength = 90;
            this.lastTime = Date.now();
            this.color = color || "white";
            this.particleMass = mass || 1;
            this.particleDamping = damping || 0.999;
            this.image = null;
            this.timeAccumulator = 0;
            this.particleRadius = 6;
            this.interactionRadius = 10;
            this.group = null;
            this.enabled = true;
        }

        ParticleEmitter.prototype.update = function (dt) {
            this.timeAccumulator += dt * 1000;

            var count;
            if (this.emissionRate > 0) {
                count = this.emissionRate;
            } else {
                count = Math.floor((this.timeAccumulator - this.lastTime) / this.spawnRate);
            }
            this.lastTime = this.timeAccumulator;

            // Spawn particles
            for (var i = 0; i < count; i++) {
                var initialPos = Vec2Pool.get();
                var initialAccel = Vec2Pool.get();
                var dir = Vec2Pool.get();
                math.vec2UnitRotate(dir, math.deg2rad(math.randomRange(this.angle - this.angleLength * this.spread, this.angle + this.angleLength * this.spread)));
                math.vec2Clone(initialPos, this.position);
                math.vec2MultScalar(initialAccel, dir, (this.particleSpeedMin + Math.random() * (this.particleSpeedMax - this.particleSpeedMin)) / dt);
                var particle = this.particleEngine.createParticle(initialPos, this.particleMass, this.particleDamping, this.color, this.image, this.group);
                particle.radius = this.particleRadius;
                particle.setLife(this.particleLife);
                particle.addForce(initialAccel);
            }
        };

        return ParticleEmitter;
    }
);