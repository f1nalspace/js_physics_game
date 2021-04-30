/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.particles.ParticleEngine",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math",
        "final.collection.ObjectPool",
        "final.collection.List",
        "final.collection.Map",
        "final.physics.particles.Particle",
        "final.physics.particles.ParticleEmitter",
        "final.physics.particles.ParticleForceGenerator"
    ],
    function (final, Vec2, Vec2Pool, math, ObjectPool, List, Map, Particle, ParticleEmitter, ParticleForceGenerator) {
        function ParticleEngine() {
            this.renderer = null;
            this.particles = new ObjectPool(function () {
                return new Particle();
            });
            this.particles.expand(10000);
            this.forceGenerators = new List();
            this.emitters = new List();
            this.particleImages = new Map();
            this.particleImage = null;
            this.particleRenderMode = "sprite";
        }

        ParticleEngine.prototype.addForceGenerator = function(fgen) {
            this.forceGenerators.add(fgen);
        };

        ParticleEngine.prototype.getActiveParticles = function () {
            return this.particles.size();
        };

        ParticleEngine.prototype.getMaxParticles = function () {
            return this.particles.capacity();
        };

        ParticleEngine.prototype.createParticle = function (initialPosition, mass, damping, color, image, group) {
            var particle = this.particles.get();
            math.vec2Clone(particle.position, initialPosition);
            math.vec2Zero(particle.velocity);
            math.vec2Zero(particle.force);
            particle.computeMass(mass || 1);
            particle.damping = damping || 0.999;
            particle.color = color;
            particle.image = image;
            particle.group = group || null;
            return particle;
        };

        ParticleEngine.prototype.createEmitter = function (r, position, angle, spread, life, spawnRate, speedMin, speedMax, color, mass, damping) {
            var emitter = new ParticleEmitter(this, angle, spread, life, spawnRate, speedMin, speedMax, color, mass, damping);
            math.vec2Clone(emitter.position, position);
            this.emitters.add(emitter);

            // Colorize particle image
            var that = this;
            var image = this.particleImages.get(color);
            if (image == null) {
                image = r.renderToBuffer(this.particleImage.width, this.particleImage.height, function (br, bw, bh) {
                    // fill offscreen buffer with the tint color
                    br.fillRect(0, 0, bw, bh, color);

                    // destination atop makes a result with an alpha channel identical to fg, but with all pixels retaining their original color *as far as I can tell*
                    br.composite("destination-atop");

                    // to tint the image, draw it first
                    br.drawImage(that.particleImage, 0, 0);
                });
                this.particleImages.put(color, image);
            }
            emitter.image = image;

            return emitter;
        };

        ParticleEngine.prototype.loadResources = function (engine) {
            this.particleImage = engine.getResource("particle");
        };

        ParticleEngine.prototype.draw = function (r, w, h) {
            if (this.renderer == null) return;

            var i;

            // Draw force generators
            for (i = 0; i < this.forceGenerators.size(); i++) {
                var fgen = this.forceGenerators.item(i);
                if (fgen.enabled) {
                    this.renderer.drawForceGenerator(r, fgen);
                }
            }

            // Draw emitters
            for (i = 0; i < this.emitters.size(); i++) {
                var emi = this.emitters.item(i);
                if (emi.enabled) {
                    this.renderer.drawEmitter(r, emi);
                }
            }

            // Draw particles
            //var pixels = r.getPixels();
            //var pixelData = pixels.data;
            for (i = 0; i < this.particles.size(); i++) {
                var particle = this.particles.item(i);
                this.renderer.drawParticle(r, particle, this.particleRenderMode);
            }
            //r.putPixels(pixels, 0, 0);
        };

        ParticleEngine.prototype.step = function (dt) {
            var invDt = 1 / dt;
            var i, j, particle;

            // Emit particles
            for (i = 0; i < this.emitters.size(); i++) {
                var emitter = this.emitters.item(i);
                if (emitter.enabled) {
                    emitter.update(dt);
                }
            }

            // Apply forces from force generators
            for (j = 0; j < this.particles.size(); j++) {
                particle = this.particles.item(j);
                if (particle.isAlive()) {
                    for (i = 0; i < this.forceGenerators.size(); i++) {
                        var gen = this.forceGenerators.item(i);
                        if (gen.enabled) {
                            gen.updateForce(particle, dt, invDt);
                        }
                    }
                }
            }

            // Update/integrate particles
            for (i = 0; i < this.particles.size(); i++) {
                particle = this.particles.item(i);
                if (particle.isAlive()) {
                    particle.update(dt);
                }
                if (particle.isAlive()) {
                    particle.integrate(dt);
                }
            }

            // Remove dead particles
            for (i = 0; i < this.particles.size(); i++) {
                particle = this.particles.item(i);
                if (!particle.isAlive()) {
                    this.particles.release(particle);
                    i--;
                }
            }
        };

        return ParticleEngine;
    }
);