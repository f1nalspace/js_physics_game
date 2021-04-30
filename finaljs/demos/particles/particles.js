"use strict";
final.module("final.demos.particles.Particles",
    [
        "final.Vec2",
        "final.Vec2Pool",
        "final.math",
        "final.engine.Engine",
        "final.collection.ObjectPool",
        "final.collection.List",
        "final.collection.Map",
        "final.input.Keys",
        "final.input.MouseButton",
        "final.collision.Response",
        "final.physics.particles.ParticleEngine",
        "final.physics.particles.ParticleGravityForceGenerator",
        "final.renderer.ParticleRenderer"
    ],
    function (final, Vec2, Vec2Pool, math, Engine, ObjectPool, List, Map, Keys, MouseButton, Response, ParticleEngine, ParticleGravityForceGenerator, ParticleRenderer) {
        function ParticlesDemo(canvas) {
            Engine.call(this, canvas);
            this.particleEngine = new ParticleEngine();
            this.dragStarted = false;
            this.lastdrag = new Vec2();
            this.dragObj = null;
            this.profilerEnabled = false;
        }

        ParticlesDemo.extend(Engine);

        ParticlesDemo.prototype.init = function (r, w, h) {
            this.addResource("particle.png", "particle");
        };

        ParticlesDemo.prototype.prepare = function (dt, r, w, h) {
            Engine.prototype.prepare.call(this, dt, r, w, h);
            var duration = dt * 120;
            this.particleEngine.loadResources(this);
            this.particleEngine.addForceGenerator(new ParticleGravityForceGenerator());
            this.particleEngine.createEmitter(r, new Vec2(0, -h * 0.3), 270, 0.25, duration, 8, 100, 150, "white", 1, 0.9);
            this.particleEngine.createEmitter(r, new Vec2(-w * 0.45, -h * 0.35), 0, 0.1, duration, 8, 100, 150, "green", 1, 0.9);
            this.particleEngine.createEmitter(r, new Vec2(w * 0.45, -h * 0.35), 180, 0.1, duration, 8, 100, 150, "blue", 1, 0.9);
            this.particleEngine.createEmitter(r, new Vec2(w * 0.45, h * 0.35), 220, 0.1, duration, 8, 100, 150, "red", 1, 0.9);
            this.particleEngine.createEmitter(r, new Vec2(-w * 0.45, h * 0.35), 320, 0.1, duration, 8, 100, 150, "yellow", 1, 0.9);
            this.particleEngine.createEmitter(r, new Vec2(0, h * 0.45), 270, 0.5, duration, 8, 100, 150, "purple", 1, 0.9);
            this.particleEngine.renderer = new ParticleRenderer();
        };

        ParticlesDemo.prototype.getDragObject = function (pos) {
            var difference = Vec2Pool.get();
            for (var i = 0; i < this.particleEngine.emitters.size(); i++) {
                var emitter = this.particleEngine.emitters.item(i);
                math.vec2Sub(difference, pos, emitter.position);
                if (math.vec2LengthSquared(difference) < emitter.interactionRadius * emitter.interactionRadius) {
                    return emitter;
                }
            }
            for (var i = 0; i < this.particleEngine.forceGenerators.size(); i++) {
                var gen = this.particleEngine.forceGenerators.item(i);
                if (typeof gen['position'] != "undefined" && typeof gen['interactionRadius'] != "undefined") {
                    math.vec2Sub(difference, pos, gen.position);
                    if (math.vec2LengthSquared(difference) < gen.interactionRadius * gen.interactionRadius) {
                        return gen;
                    }
                }
            }
            return null;
        };

        ParticlesDemo.prototype.handleInputForEmitters = function () {
            if (this.keyboard.isKeyDown(Keys['0'])) {
            }
        };

        ParticlesDemo.prototype.handleInput = function (dt, w, h) {
            this.handleInputForEmitters();
            var mpos = Vec2Pool.get();
            mpos.x = this.mouse.getPos().x - w * 0.5;
            mpos.y = this.mouse.getPos().y - h * 0.5;
            if (this.mouse.isMouseDown(MouseButton.Left)) {
                if (!this.dragStarted) {
                    var obj = this.getDragObject(mpos);
                    if (obj != null) {
                        math.vec2Clone(this.lastdrag, mpos);
                        this.dragStarted = true;
                        this.dragObj = obj;
                    }
                } else {
                    var difference = Vec2Pool.get();
                    math.vec2Sub(difference, mpos, this.lastdrag);
                    math.vec2Add(this.dragObj.position, this.dragObj.position, difference);
                    math.vec2Clone(this.lastdrag, mpos);
                }
            } else {
                if (this.dragStarted) {
                    this.dragStarted = false;
                    this.dragObj = null;
                }
            }
        };

        ParticlesDemo.prototype.update = function (dt, w, h) {
            this.handleInput(dt, w, h);

            // Update particle engine
            this.particleEngine.step(dt);
        };

        ParticlesDemo.prototype.draw = function (r, dt, w, h) {
            r.clear();
            r.fillRect(0, 0, w, h, "black");

            // Move coordinate system to center
            r.push();
            r.translate(w * 0.5, h * 0.5);

            // Render particles
            this.particleEngine.draw(r, w, h);

            r.pop();

            // Draw text
            r.setFont("arial", 20, "normal");
            r.fillText(10, 10, "Active particles: " + this.particleEngine.getActiveParticles() + " / " + this.particleEngine.getMaxParticles(), "white", "left", "top");
            r.fillText(10, 30, "Fps: " + this.fps.toFixed(2), "white", "left", "top");
            r.resetFont();
        };

        return ParticlesDemo;
    }
);