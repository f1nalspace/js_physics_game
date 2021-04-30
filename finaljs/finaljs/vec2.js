/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.Vec2", [], function (final) {
    function Vec2(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    Vec2.prototype.magnitudeSquared = function() {
        return this.x * this.x + this.y * this.y;
    };

    Vec2.prototype.magnitude = function() {
        return Math.sqrt(this.magnitudeSquared());
    };

    Vec2.prototype.set = function(x, y){
        this.x = x;
        this.y = y;
        return this;
    };

    Vec2.prototype.setFrom = function(v){
        this.x = v.x;
        this.y = v.y;
        return this;
    };

    Vec2.prototype.normalize = function(){
        var l = this.magnitude();
        if (l == 0) {
            l = 1;
        }
        this.x /= l;
        this.y /= l;
        return this;
    };

    Vec2.prototype.add = function(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    };

    Vec2.prototype.sub = function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    };

    Vec2.prototype.mult = function(v) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    };

    Vec2.prototype.div = function(v) {
        this.x /= v.x;
        this.y /= v.y;
        return this;
    };

    Vec2.prototype.multScalar = function(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    };

    Vec2.prototype.addMultScalar = function(v, scalar) {
        this.x *= v.x * scalar;
        this.y *= v.y * scalar;
        return this;
    };

    Vec2.prototype.equals = function (v) {
        if (v instanceof Vec2) {
            return this.x == v.x && this.y == v.y;
        }
        return false;
    };

    Vec2.prototype.clone = function () {
        return new Vec2(this.x, this.y);
    };

    Vec2.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };

    return Vec2;
});