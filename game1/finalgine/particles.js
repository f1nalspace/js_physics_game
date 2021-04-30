/*
 Particle class
 */
finalgine.Particle = function (pos, vel, radius) {
    this.radius = radius;
    this.lifetime = 0;
    this.mass = 1.0;
    this.position = pos;
    this.velocity = vel;
    this.force = finalgine.Vector2(0.0, 0.0);
};

/*
 Particle system class
 */
finalgine.ParticleSystem = function (maxParticles) {
    this.maxParticles = maxParticles;
    this.particles = [];
    this.particleCount = 0;
    for (var i = 0; i < maxParticles; i++) {
        this.particles[i] = null;
    }
};

finalgine.ParticleSystem.prototype.add = function (pos, vel, radius) {
    if (this.particleCount < this.maxParticles) {
        var index = this.particleCount;
        var p = new finalgine.Particle(pos, vel, radius);
        this.particles[index] = p;
        this.particleCount++;
        return index;
    }
    return -1;
};

finalgine.ParticleSystem.prototype.update = function (frametime) {

};