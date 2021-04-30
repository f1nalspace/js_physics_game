/**
 * Created by final on 08.01.2014.
 */
fm.ns("fm.geometry.math");
fm.req("fm.geometry.Vec2");

(function (vmath, Vec2) {
    vmath.vec2Clone = function (v) {
        return Vec2(v[0], v[1]);
    };
    vmath.vec2Copy = function (v, a) {
        v[0] = a[0];
        v[1] = a[1];
    };
    vmath.vec2Set = function (out, x, y) {
        if (typeof x[0] !== "undefined") {
            out[0] = x[0];
            out[1] = x[1];
        } else {
            out[0] = x;
            out[1] = y;
        }
    };
    vmath.vec2Zero = function (out) {
        out[0] = 0;
        out[1] = 0;
    };
    vmath.vec2Add = function (out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
    };
    vmath.vec2AddScalar = function (out, a, scalar) {
        out[0] = a[0] + scalar;
        out[1] = a[1] + scalar;
    };
    vmath.vec2Sub = function (out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
    };
    vmath.vec2SubScalar = function (out, a, scalar) {
        out[0] = a[0] - scalar;
        out[1] = a[1] - scalar;
    };
    vmath.vec2Mult = function (out, a, b) {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
    };
    vmath.vec2MultScalar = function (out, a, scalar) {
        out[0] = a[0] * scalar;
        out[1] = a[1] * scalar;
    };
    vmath.vec2Div = function (out, a, b) {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
    };
    vmath.vec2DivScalar = function (out, a, scalar) {
        out[0] = a[0] / scalar;
        out[1] = a[1] / scalar;
    };
    vmath.vec2LengthSquared = function (out) {
        return out[0] * out[0] + out[1] * out[1];
    };
    vmath.vec2Length = function (out) {
        return Math.sqrt(out[0] * out[0] + out[1] * out[1]);
    };
    vmath.vec2Dot = function (a, b) {
        return a[0] * b[0] + a[1] * b[1];
    };
    vmath.vec2AddMultScalar = function (out, a, b, scalar) {
        out[0] = a[0] + b[0] * scalar;
        out[1] = a[1] + b[1] * scalar;
    };
    vmath.vec2Normalize = function (out, v) {
        var l = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        if (l == 0) {
            l = 1;
        }
        out[0] = v[0] / l;
        out[1] = v[1] / l;
    };
    vmath.vec2Min = function (out, a, b) {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
    };
    vmath.vec2Max = function (out, a, b) {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
    };
})(fm.geometry.math, fm.geometry.Vec2);