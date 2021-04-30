/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.tilemap.SimpleTileMap", ["final.Vec2"], function (final, Vec2) {
    function SimpleTileMap(w, h, tw, th) {
        this.tiles = new Array(w * h).fill(0);
        this.dimension = new Vec2(w, h);
        this.tileSize = new Vec2(tw, th);
    }

    SimpleTileMap.prototype.isSolid = function (x, y) {
        if (x < 0 || x > this.dimension.x - 1 || y < 0 || y > this.dimension.y - 1) {
            return false;
        }
        return this.tiles[y * this.dimension.x + x] > 0;
    };

    SimpleTileMap.prototype.setSolid = function (x, y, value) {
        this.tiles[y * this.dimension.x + x] = value;
    };

    SimpleTileMap.prototype.clone = function () {
        var m = new SimpleTileMap(this.dimension.x, this.dimension.y);
        m.tiles = this.tiles.slice(0);
        m.tileSize = this.tileSize.clone();
        return m;
    };

    SimpleTileMap.prototype.remove = function (x, y) {
        this.tiles[y * this.dimension.x + x] = -1;
    };

    SimpleTileMap.prototype.clear = function () {
        for (var i = 0; i < this.dimension.x * this.dimension.y; i++) {
            this.tiles[i] = 0;
        }
    };

    return SimpleTileMap;
});