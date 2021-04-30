/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.physics.MassData",
    [
    ],
    function (final) {
        function MassData(density){
            this.density = density || 0;
            this.mass = 0;
            this.invMass = 0;
            this.inertia = 0;
            this.invInertia = 0;
        }

        MassData.prototype.init = function(){
            this.density = 0;
            this.mass = 0;
            this.invMass = 0;
            this.inertia = 0;
            this.invInertia = 0;
        };

        MassData.prototype.setMass = function(mass){
            this.mass = mass;
            this.invMass = this.mass > 0 ? 1 / this.mass : 0;
            return this;
        };

        MassData.prototype.setInertia = function(inertia){
            this.inertia = inertia;
            this.invInertia = this.inertia > 0 ? 1 / this.inertia : 0;
            return this;
        };

        return MassData;
    }
);