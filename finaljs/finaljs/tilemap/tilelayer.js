/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.tilemap.TileLayer", ["final.Vec2"], function (final, Vec2) {
    function MapLayer(map, width, height) {
        this.map = map;
        this.tiles = new Array(width * height).fill(0);
    }

    MapLayer.prototype.getTilePosByType = function(type) {
        for (var y = 0; y < this.map.mapSize.y; y++) {
            for (var x = 0; x < this.map.mapSize.x; x++) {
                var tile = this.tiles[y * this.map.mapSize.x + x];
                if (tile == type) {
                    return new Vec2(x, y);
                }
            }
        }
        return null;
    };

    return MapLayer;
});