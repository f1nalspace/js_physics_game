final.module("final.tilemap", ["final.vec", "final.utils"], function(final, vec, utils){
    var Vec2 = vec.Vec2;

    function Layer(map, name) {
        this.map = map;
        this.name = name;
        this.size = new Vec2(0, 0);
        this.tileSize = new Vec2(0, 0);
        this.tiles = [];
    }

    function Tileset(map, name) {
        this.map = map;
        this.name = name;
        this.tileSize = new Vec2(0, 0);
        this.tiles = [];
    }

    function Tilemap(game) {
        this.game = game;
        this.size = new Vec2(0, 0);
        this.tileSize = new Vec2(0, 0);
        this.layers = new utils.HashMap();
        this.tilesets = new utils.HashMap();
    }

    Tilemap.prototype.getTileset = function(name) {
        if (this.tilesets.contains(name)) {
            return this.tilesets.get(name);
        }
        return null;
    };

    Tilemap.prototype.getLayer = function(name) {
        if (this.layers.contains(name)) {
            return this.layers.get(name);
        }
        return null;
    };

    Tilemap.prototype.addTileset = function(name) {
        if (this.tilesets.contains(name)) {
            throw new Error("Tileset by key '"+name+"' already exists!")
        }
        var tileset = new Tileset(this, name);
        this.tilesets.put(name, tileset);
        return tileset;
    };

    Tilemap.prototype.addLayer = function(name) {
        if (this.layers.contains(name)) {
            throw new Error("Layer by key '"+name+"' already exists!")
        }
        var layer = new Layer(this, name);
        this.layers.put(name, layer);
        return layer;
    };

    return {
        Layer: Layer,
        Tileset: Tileset,
        Tilemap: Tilemap
    }
});

