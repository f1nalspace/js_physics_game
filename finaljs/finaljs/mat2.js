/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.Mat2", [], function (final) {
    function Mat2() {
        this.m11 = 1;
        this.m12 = 0;
        this.m21 = 0;
        this.m22 = 1;
    }

    Mat2.prototype.setRotation = function(radians){
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        this.m11 = c;
        this.m12 = -s;
        this.m21 = s;
        this.m22 = c;
    };

    final.Mat2 = Mat2;
});