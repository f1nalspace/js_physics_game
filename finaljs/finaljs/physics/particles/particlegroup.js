/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.particles.ParticleGroup",
    [
    ],
    function (final) {
        var particleGroupCounter = 0;

        function ParticleGroup() {
            this.id = ++particleGroupCounter;
        }

        return ParticleGroup;
    }
);