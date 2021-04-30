/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.Vec2Pool", ["final.Vec2", "final.collection.Pool"], function (final, Vec2, Pool) {
    var newVec2 = function () {
        return new Vec2();
    };

    var initVec2 = function (v, x, y) {
        v.x = x || 0;
        v.y = y || 0;
    };

    var Vec2Pool = new Pool(newVec2, initVec2);
    Vec2Pool.expand(50000);

    return Vec2Pool;
});