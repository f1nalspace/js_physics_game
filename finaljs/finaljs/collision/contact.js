/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.collision.Contact", ["final.Vec2", "final.math"], function(final, Vec2, math) {
    function Contact() {
        this.bodyA = null;
        this.bodyB = null;
        this.penetration = 0;
        this.normal = new Vec2();
        this.tangent = new Vec2();
        this.contactPoint = new Vec2();
        this.normMass = 0;
        this.tangentMass = 0;
        this.friction = 0;
        this.restitution = 0;
        this.impulse = 0;
        this.tangentImpulse = 0;
        this.velocityBias = 0;
        this.rA = new Vec2();
        this.rB = new Vec2();
    }

    Contact.prototype.init = function(){
        this.bodyA = null;
        this.bodyB = null;
        this.penetration = 0;
        math.vec2Zero(this.normal);
        math.vec2Zero(this.tangent);
        math.vec2Zero(this.contactPoint);
        this.normMass = 0;
        this.tangentMass = 0;
        this.friction = 0;
        this.restitution = 0;
        this.impulse = 0;
        this.tangentImpulse = 0;
        this.velocityBias = 0;
        math.vec2Zero(this.rA);
        math.vec2Zero(this.rB);
    };

    Contact.prototype.swap = function() {
        math.vec2MultScalar(this.normal, this.normal, -1);
        var temp = this.bodyA;
        this.bodyA = this.bodyB;
        this.bodyB = temp;
    };
    return Contact;
});