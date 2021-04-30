/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.math", ["final.Vec2"], function (final, Vec2) {
    var d2r = Math.PI / 180;
    var r2d = 180 / Math.PI;
    var epsilon = 1.1920929E-7;
    var unitX = new Vec2(1, 0);
    var unitY = new Vec2(0, 1);
    final.math = {
        epsilon: epsilon,
        randomRange: function (min, max) {
            return min + Math.random() * (max - min);
        },
        equals: function (a, b) {
            return Math.abs(a - b) <= epsilon;
        },
        min: function(a, b) {
            return a < b ? a : b;
        },
        max: function(a, b) {
            return a > b ? a : b;
        },
        clamp: function (value, min, max) {
            return this.max(this.min(value, max), min);
        },
        deg2rad: function (degree) {
            return degree * d2r;
        },
        rad2deg: function (rad) {
            return rad * r2d;
        },
        vec2UnitX: function () {
            return unitX;
        },
        vec2UnitY: function () {
            return unitY;
        },
        vec2Angle: function (axis) {
            return this.rad2deg(Math.atan2(axis.y, axis.x));
        },
        vec2Equals: function (a, b) {
            return this.equals(a.x, b.x) && this.equals(a.y, b.y);
        },
        vec2Set: function (out, x, y) {
            out.x = x || 0;
            out.y = y || 0;
        },
        vec2Add: function (out, a, b) {
            out.x = a.x + b.x;
            out.y = a.y + b.y;
        },
        vec2Sub: function (out, a, b) {
            out.x = a.x - b.x;
            out.y = a.y - b.y;
        },
        vec2MultScalar: function (out, a, scalar) {
            out.x = a.x * scalar;
            out.y = a.y * scalar;
        },
        vec2Dot: function (a, b) {
            return a.x * b.x + a.y * b.y;
        },
        vec2AddMultScalar: function (out, a, b, scalar) {
            out.x = a.x + b.x * scalar;
            out.y = a.y + b.y * scalar;
        },
        vec2SubMultScalar: function (out, a, b, scalar) {
            out.x = a.x - b.x * scalar;
            out.y = a.y - b.y * scalar;
        },
        vec2LengthSquared: function (v) {
            return v.x * v.x + v.y * v.y;
        },
        vec2Length: function (v) {
            return Math.sqrt(this.vec2LengthSquared(v));
        },
        vec2Normalize: function (out, v) {
            var l = this.vec2Length(v);
            if (l == 0) {
                l = 1;
            }
            out.x = v.x / l;
            out.y = v.y / l;
        },
        vec2Clone: function (out, inp) {
            out.x = inp.x;
            out.y = inp.y;
        },
        vec2Zero: function (out) {
            out.x = 0;
            out.y = 0;
        },
        vec2PerpRight: function (out, inp) {
            var x = -inp.y;
            var y = inp.x;
            out.x = x;
            out.y = y;
        },
        vec2UnitRotate: function (out, rad) {
            out.x = Math.cos(rad);
            out.y = Math.sin(rad);
        },
        vec2CrossVS: function (out, v, scalar) {
            var x = v.x;
            var y = v.y;
            out.x = scalar * y;
            out.y = -scalar * x;
        },
        vec2CrossSV: function (out, scalar, v) {
            var x = v.x;
            var y = v.y;
            out.x = -scalar * y;
            out.y = scalar * x;
        },
        vec2Cross: function (a, b) {
            return a.x * b.y - a.y * b.x;
        }
    };
});