/**
 * Crackout (Krakout-clone) based on finaljs game development framework
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.games.leverman.Player",
    [
        "final.games.leverman.Entity"
    ],
    function (final, Entity) {
        function Player() {
            Entity.call(this);
        }
        Player.extend(Entity);

        Player.SCALE = 0.8;

        return Player;
    }
);