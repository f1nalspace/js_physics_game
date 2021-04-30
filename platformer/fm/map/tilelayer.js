/**
 * Created by final on 10.01.2014.
 */
fm.ns("fm.map.TileLayer");
fm.req("fm.geometry.Vec2");
fm.req("fm.map.Tile");

(function (map, Vec2, Tile) {
    function TileLayer(tilesize, size, name) {
    	this.tileSize = tilesize;
        this.size = size;
        this.tiles = Array.apply(null, new Array(size[0] * size[1])).map(Number.prototype.valueOf, -1);
        this.name = name;
        this.solid = false;
    }
    
    TileLayer.prototype.set = function(x, y, tile) {
    	if (x >= 0 && x < this.size[0] && y >= 0 && y < this.size[1]) {
    		this.tiles[x + y * this.size[0]] = tile;
    	}
    };

    TileLayer.prototype.fill = function(x, y, checkTile, fillTile) {
        var queue = [];
        queue.push(Vec2(x, y));

        while (queue.length > 0) {
            var v = queue.pop();

            // fill ourself
            this.set(v[0], v[1], fillTile);

            // Get tiles for 4 directions
            var topTile = this.get(v[0], v[1] - 1);
            var bottomTile = this.get(v[0], v[1] + 1);
            var leftTile = this.get(v[0] - 1, v[1]);
            var rightTile = this.get(v[0] + 1, v[1]);

            // Add direction tiles when required to queue
            if (topTile != null && topTile === checkTile && topTile !== fillTile) {
                queue.push(Vec2(v[0], v[1] - 1));
            }
            if (bottomTile != null && bottomTile === checkTile && bottomTile !== fillTile) {
                queue.push(Vec2(v[0], v[1] + 1));
            }
            if (leftTile != null && leftTile === checkTile && leftTile !== fillTile) {
                queue.push(Vec2(v[0] - 1, v[1]));
            }
            if (rightTile != null && rightTile === checkTile && rightTile !== fillTile) {
                queue.push(Vec2(v[0] + 1, v[1]));
            }
        }
    };

    TileLayer.prototype.get = function(x, y) {
    	if (x >= 0 && x < this.size[0] && y >= 0 && y < this.size[1]) {
    		return this.tiles[x + y * this.size[0]];
    	}
        return null;
    };
    
    TileLayer.prototype.renderLayer = function(renderer, viewport, lightmap, sightmap) {
    	var minX = viewport.getOffsetX() / this.tileSize | 0;
		var minY = viewport.getOffsetY() / this.tileSize | 0;
		var maxX = minX + 1 + viewport.getWidth() / this.tileSize | 0;
		var maxY = minY + 1 + viewport.getHeight() / this.tileSize | 0;
		
		for (var y = minY; y <= maxY; y++) {
			var canvasY = y * this.tileSize;
			for (var x = minX; x <= maxX; x++) {
				var index = x + y * this.size[0];
				if (lightmap[index] == -1 || sightmap[index] == -1) {
					// no light or no LoS, no see ;)
					continue;
				}
				var canvasX = x * this.tileSize;
				if (index >= 0 && index < this.tiles.length && x < this.size[0] && y < this.size[1]) {
					var tile = this.tiles[index];
					if (tile !== -1) {
						var lv = lightmap[index];
						tile.tileset.setTileSize(this.tileSize);
						tile.render(renderer, canvasX, canvasY, lv);
					}
				}
			}
		}
    };
    
    TileLayer.prototype.copyTilesInto = function(layer) {
    	// we can copy only as much tiles the smaller layer contains
    	var minX = Math.min(this.size[0], layer.size[0]);
    	var minY = Math.min(this.size[1], layer.size[1]);
    	
    	for (var y = 0; y < minY; y++) {
    		for (var x = 0; x < minX; x++) {
    			layer.set(x, y, this.tiles[x + y * this.size[0]]);
    		}
    	}
    };
    
    TileLayer.prototype.getWidth = function() {
    	return this.size[0];
    };
    
    TileLayer.prototype.getHeight = function() {
    	return this.size[1];
    };
    
    map.TileLayer = TileLayer;
})(fm.map, fm.geometry.Vec2, fm.map.Tile);
