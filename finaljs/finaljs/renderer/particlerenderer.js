"use strict";
final.module("final.renderer.ParticleRenderer",
    [
        "final.renderer.CanvasRenderer",
        "final.physics.particles.Particle",
        "final.physics.particles.ParticleEmitter",
        "final.physics.particles.ParticleForceGenerator"
    ],
    function (final, CanvasRenderer, Particle, ParticleEmitter, ParticleForceGenerator) {
        return function() {
            return {
                /**
                 * Draws an particle
                 * @param r {CanvasRenderer}
                 * @param particle {Particle}
                 * @param [mode] {Number}
                 */
                drawParticle: function (r, particle, mode) {
                    var alpha = particle.life * particle.invMaxLife;
                    if (alpha <= 0) return;
                    r.opacity(alpha);
                    var rad = particle.radius * (alpha);
                    if (mode == "sprite" && particle.image != null) {
                        r.drawImage(particle.image, particle.position.x - rad, particle.position.y - rad, rad * 2, rad * 2);
                    } else {
                        r.fillRect(particle.position.x - rad, particle.position.y - rad, rad * 2, rad * 2, particle.color);
                    }
                    r.resetOpacity();
                },
                /**
                 * Draws an particle emitter
                 * @param r {CanvasRenderer}
                 * @param emitter {ParticleEmitter}
                 */
                drawEmitter: function (r, emitter) {
                    r.strokeArc(emitter.position.x, emitter.position.y, emitter.interactionRadius, emitter.color, 2);
                },
                /**
                 * Draws an particle force generator
                 * @param r {CanvasRenderer}
                 * @param fgen {ParticleForceGenerator}
                 */
                drawForceGenerator: function (r, fgen) {
                    if (typeof fgen.position != "undefined") {
                        r.strokeArc(fgen.position.x, fgen.position.y, fgen.interactionRadius, "yellow", 2);
                    }
                }
            };
        };
    }
);