final.module("final.towadev.map", ["final.vec"], function(final, vec){
   var Vec2 =  vec.Vec2;

    var Tiles = {
        None: -1,
        Placeable: 0,
        EnemyPath: 2,
        EnemyStart: 3,
        EnemyFinish: 4,
        Solid: 5
    };

    var TileColors = {};
    TileColors[Tiles.Placeable] = "green";
    TileColors[Tiles.EnemyPath] = "grey";
    TileColors[Tiles.EnemyStart] = "lime";
    TileColors[Tiles.EnemyFinish] = "orange";
    TileColors[Tiles.Solid] = "darkgreen";

    var TileIndices = {};
    TileIndices[Tiles.Placeable] = 0;
    TileIndices[Tiles.EnemyPath] = 1;
    TileIndices[Tiles.Solid] = 2;

    function Map(game) {
        this.game = game;
        this.size = new Vec2();
        this.tiles = [];
        this.tileSize = 1;
        this.offset = new Vec2();
        this.area = {
            pos: this.offset,
            size: new Vec2()
        };
        this.tileset = null;
    }

    Map.prototype.getTilePositionByType = function(tileType) {
        for (var y = 0; y < this.size.y; y++) {
            for (var x = 0; x < this.size.x; x++) {
                var index = (y * this.size.x) + x;
                var tile = this.tiles[index];
                if (tile === tileType) {
                    return new Vec2(x, y);
                }
            }
        }
        return null;
    };

    Map.prototype.getTile = function(x, y) {
        var index = (y * this.size.x) + x;
        var tile = this.tiles[index];
        if (tile !== undefined) {
            return tile;
        } else {
            return null;
        }
    };

    Map.prototype.import = function(obj) {
        if (typeof obj != "undefined" && obj != null) {
            var size = obj['size'];
            var data = obj['data'];
            if (size !== undefined && data !== undefined) {
                var count = size.x * size.y;
                this.size.x = size.x;
                this.size.y = size.y;
                this.tiles = [];
                for (var i = 0; i < count; i++) {
                    this.tiles[i] = data[i] || 0;
                }
                this.area.size.x = this.size.x * this.tileSize;
                this.area.size.y = this.size.y * this.tileSize;
            }
        }
    };

    Map.prototype.export = function() {
        var output = {
            size: new Vec2(this.size.x, this.size.y),
            data: []
        };
        var count = this.size.x * this.size.y;
        output.data.length = count;
        for (var i = 0; i < count; i++) {
            output.data[i] = this.tiles[i];
        }
        return output;
    };

    Map.prototype.draw = function(r) {
        var size = this.size;
        var tileSize = this.tileSize;
        for (var y = 0; y < size.y; y++) {
            for (var x = 0; x < size.x; x++) {
                var xpos = this.offset.x + (x * tileSize);
                var ypos = this.offset.y + (y * tileSize);
                var index = (y * size.x) + x;
                var tile = this.tiles[index];
                var tileIndex = TileIndices[tile];
                if (this.tileset != null && tileIndex !== undefined && tileIndex < this.tileset.length) {
                    r.drawImage(this.tileset[tileIndex], xpos, ypos, tileSize, tileSize);
                } else {
                    var color = TileColors[tile];
                    r.fillRect(xpos, ypos, tileSize, tileSize, color);
                }
            }
        }
    };

    Map.prototype.clear = function() {
        for (var i = 0; i < this.size.x * this.size.y; i++) {
            this.tiles[i] = Tiles.Placeable;
        }
    };

    Map.prototype.resize  = function(w, h) {
        this.size.x = w;
        this.size.y = h;
        var count = w * h;
        this.tiles = [];
        for (var i = 0; i < count; i++){
            this.tiles[i] = 0;
        }
    };

    Map.prototype.isWalkableForEnemy = function(x, y) {
        var index = (y * this.size.x) + x;
        var tile = this.tiles[index];
        return [Tiles.EnemyStart, Tiles.EnemyFinish, Tiles.EnemyPath].contains(tile);
    };

    Map.prototype.isValid = function(x, y) {
        return x >= 0 && x < this.size.x && y >= 0 && y < this.size.y;
    };

    return {
        Map: Map,
        TileColors: TileColors,
        TileIndices: TileIndices,
        Tiles: Tiles
    }
});