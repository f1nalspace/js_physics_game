/**
 * This unit is part of the "finaljs" Framework
 *
 * finaljs game development framework v_$version$
 * copyright (c) 2014 Torsten Spaete
 */
"use strict";
final.module("final.tilemap.TileMap", ["final.Vec2", "final.tilemap.TileLayer"], function (final, Vec2, TileLayer) {
    function TileMap(width, height, tileWidth, tileHeight, layerCount) {
        var that = this;
        this.mapSize = new Vec2(width, height);
        this.layers = new Array(layerCount).fillFunc(function(){return new TileLayer(that, width, height);});
        this.layerIndices = {};
        this.tileSize = new Vec2(tileWidth, tileHeight);
    }

    TileMap.prototype.getLayerByName = function(name) {
        if (typeof this.layerIndices[name] != "undefined") {
            return this.layers[this.layerIndices[name]];
        }
        return null;
    };

    TileMap.createFromObject = function(mapObject) {
        var tileWidth = mapObject['tilewidth'];
        var tileHeight = mapObject['tileheight'];
        var width = mapObject['width'];
        var height = mapObject['height'];
        var layers = mapObject['layers'];
        var map = new TileMap(width, height, tileWidth, tileHeight, layers.length);
        for (var i = 0; i < layers.length; i++) {
            var srcLayer = layers[i];
            var dstLayer = map.layers[i];
            var data = srcLayer['data'];
            map.layerIndices[srcLayer.name] = i;
            for (var j = 0; j < data.length; j++) {
                dstLayer.tiles[j] = data[j];
            }
        }
        return map;
    };

    return TileMap;
});