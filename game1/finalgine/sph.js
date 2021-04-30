/*
 ************************************************************
 SPH Particle Class
 ************************************************************
 */

finalgine.SPHParticle = function (pos) {
    finalgine.Particle.call(this, pos);
    this.positionOld = pos;
    this.density = 0.0;
    this.pressure = 0.0;
};
finalgine.SPHParticle.inheritsFrom(finalgine.Particle);

/*
 ************************************************************
 SPH Simulation Class
 ************************************************************
 */

finalgine.SPHSimulation = function (maxParticles) {
    finalgine.ParticleSystem.call(this, maxParticles);
};
finalgine.SPHSimulation.inheritsFrom(finalgine.ParticleSystem);

finalgine.SPHSimulation.prototype.update = function (frametime) {
};
