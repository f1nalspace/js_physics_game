/**
 * Crackout (Krakout-clone) based on finaljs game development framework
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.games.leverman.Entity",
    [
        "final.Vec2"
    ],
    function (final, Vec2) {
        function Entity() {
            this.pos = new Vec2();
            this.size = new Vec2();
            this.angle = 0;
            this.body = null;
        }

        Entity.prototype.update = function() {
            var p = this.body.GetPosition();
            var a = this.body.GetAngle();
            this.pos.x = p.x;
            this.pos.y = p.y;
            this.angle = a;
        };

        return Entity;
    }
);