/**
 * Crackout (Krakout-clone) based on finaljs game development framework
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.games.skeleton.SkeletonGame", ["final.Vec2", "final.math", "final.engine.Engine"], function (final, Vec2, math, Engine) {
    function SkeletonGame(canvas) {
        Engine.call(this, canvas);
    }

    SkeletonGame.extend(Engine);

    SkeletonGame.prototype.update = function (dt, w, h) {
    };

    SkeletonGame.prototype.draw = function (r, dt, w, h) {
        r.clear();
        r.fillRect(0, 0, w, h, "black");

        r.push();
        r.translate(w * 0.5, h * 0.5);
    };

    return SkeletonGame;
});