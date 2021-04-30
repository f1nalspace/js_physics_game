/**
 * Created by final on 10.01.2014.
 */
fm.ns("fm.gfx.Tileset");
fm.req("fm.geometry.Vec2");
fm.req("fm.map.Tile");
fm.req("fm.collections.Hashmap");

(function (gfx, Vec2, Tile, Hashmap) {
    function Tileset() {
        this.tileSize = 0;
        this.texture = null;
        this.tilesPerRow = 0;
        this.tiles = new Hashmap();
        this.aabb = new Hashmap();
        this.name = null;
        this.litTextures = new Hashmap();
        this.animations = [];
    }
    
    Tileset.prototype.init = function(r, name,  img, tilesize, animations) {
    	this.name = name;
    	
        // Load texture (Specify a width and height to scale it)
        this.texture = r.loadTexture(img);

    	this.tileSize = tilesize;
    	this.tilesPerRow = this.texture.width / this.tileSize | 0;
    	if (typeof animations !== 'undefined') {
    		this.animations = animations;
    	}
    	
    	return this;
    };
    
    Tileset.prototype.update = function(dt) {
    	var tiles = this.tiles.values;
    	for (var i = 0; i < tiles.length; i++) {
    		tiles[i].update(dt);
    	}
    };
    
    Tileset.prototype.getTile = function(x, y) {
    	if (typeof y === 'undefined') {
    		y = x / this.tilesPerRow | 0;
    		x = x % this.tilesPerRow;
    	}
    	
    	
    	var key = x + ':::' + y + ':::' + this.tileSize;
    	if (!this.tiles.contains(key)) {
    		var index = x + y * this.tilesPerRow;
    		var animation = undefined;
    		for (var i = 0; i < this.animations.length; i++) {
        		if (this.animations[i].tilesize == this.tileSize) {
        			for (var k = 0; k < this.animations[i].animation.length; k++) {
        				if (this.animations[i].animation[k].index == index) {
        					animation = this.animations[i].animation;
        					break;
        				}
        			}
        		}
    		}
    		var t = new Tile(this, index, animation);
    		this.tiles.put(key, t);
    	}
    	
    	return this.tiles.get(key);
    };
    
    Tileset.prototype.getTileAABB = function(index, aabb) {
    	var x = index % this.tilesPerRow;
    	var y = index / this.tilesPerRow | 0;
    	
    	var key = x + ':::' + y + ':::' + this.tileSize;
    	if (!this.aabb.contains(key)) {
    		// auto detect AABB
    		var imageData = this.texture.getImageData(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
			var left = this.tileSize;
			var right = 0;
			var top = this.tileSize;
			var bottom = 0;
			for (var xx = 0; xx < this.tileSize; xx++) {
				for (var yy = 0; yy < this.tileSize; yy++) {
					if (xx < left || xx > right || yy < top || yy > bottom) {
						var baseIndex = (xx + yy * this.tileSize) * 4;
						
						// tighten AABB for non-transparent pixels
						if (imageData.data[baseIndex+3] !== 0) {
							if (xx < left) {
								left = xx;
							}
							if (xx > right) {
								right = xx;
							}
							if (yy < top) {
								top = yy;
							}
							if (yy > bottom) {
								bottom = yy;
							}
						}
					}
				}
			}

    		var a = new fm.geometry.AABB(new fm.geometry.Vec2(left, top), new fm.geometry.Vec2(right, bottom));
    		this.aabb.put(key, a);
    	}
    	
    	var b = this.aabb.get(key);
    	aabb.min[0] = b.min[0];
		aabb.min[1] = b.min[1];
		aabb.max[0] = b.max[0];
		aabb.max[1] = b.max[1];
    };
    
    Tileset.prototype.renderTile = function(r, x, y, tileX, tileY, lv) {
    	if (typeof tileY === 'undefined') {
    		tileY = tileX / this.tilesPerRow | 0;
    		tileX = tileX % this.tilesPerRow;
    	}
    	var sx = tileX * this.tileSize;
    	var sy = tileY * this.tileSize;
    	
    	var texture = lv != null ? this.getLitTexture(lv) : this.texture;
    	
    	r.drawTexture(texture, x, y, this.tileSize, this.tileSize, sx, sy, this.tileSize, this.tileSize);
    };
    
    Tileset.prototype.getLitTexture = function(lv) {
    	lv.intensity = Math.round(10 * lv.intensity) / 10;
    	lv.color[0] = Math.round(10 * lv.color[0]) / 10;
    	lv.color[1] = Math.round(10 * lv.color[1]) / 10;
    	lv.color[2] = Math.round(10 * lv.color[2]) / 10;
    	var key = 'l' + (lv.intensity * 10) + 'r' + (lv.color[0] * 10) + 'g' + (lv.color[1] * 10) + 'b' + (lv.color[2] * 10);
    	if (!this.litTextures.contains(key)) {
			this.litTextures.put(key, this.texture.createLitTexture(lv));
    	}
    	
    	return this.litTextures.get(key);
    };
    
    Tileset.prototype.getTileSize = function() {
    	return this.tileSize;
    };
    
    Tileset.prototype.setTileSize = function(tilesize) {
    	this.tileSize = tilesize;
    	this.tilesPerRow = this.texture.width / this.tileSize | 0;
    };
    
    
    Tileset.prototype.getTexture = function() {
    	return this.texture;
    };
    
    gfx.Tileset = Tileset;
})(fm.gfx, fm.geometry.Vec2, fm.map.Tile, fm.collections.Hashmap);