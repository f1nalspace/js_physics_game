/**
 * Created by final on 10.01.2014.
 */
fm.ns("fm.map.Map");
fm.req("fm.geometry.Vec2");
fm.req("fm.collections.Hashmap");

(function (map, Vec2, Hashmap) {
    var objectClassMapOtherTiles = {
        0: "PlayerSpawn",
        1: "Diamond",
        2: "Diamond",
        3: "Diamond"
    };

    function Map() {
        this.size = null;
        this.tileSize = null;
        this.layers = [];
        this.objects = [];
        this.lights = [];
        this.ambientLight = null;
        this.tileObjectMappings = new Hashmap();
        this.lightmaps = {};
        this.sightmaps = {};
    }

    Map.prototype.addTileObjectMapping = function(tileset, mappings) {
        if (!this.tileObjectMappings.contains(tileset)) {
            this.tileObjectMappings.put(tileset, []);
        }
        if (mappings.length % 2 == 0) {
            var arr = this.tileObjectMappings.get(tileset);
            for (var i = 0; i < mappings.length/2; i++) {
                var tileIndex = mappings[i*2];
                var objectType = mappings[i*2+1];
                arr[tileIndex] = objectType;
            }
        }


    };

    Map.prototype.onTileLoad = function(tile, layer, x, y) {
        for (var k in this.tileObjectMappings.indices) {
            if (tile.tileset.name === k) {
                var mapping = this.tileObjectMappings.get(k);
                if (typeof mapping[tile.tileIndex] != "undefined") {
                    var objectClass = mapping[tile.tileIndex];
                    // add to object
                    this.addObject({
                        type: objectClass,
                        pos: [x, y],
                        layer: layer,
                        tile: tile
                    });
                    // do not display this tile
                    layer.set(x, y, -1);
                }
            }
        }
    };
    
    Map.prototype.initFromJson = function(rm, xhr) {
        var that = this;

    	var json = JSON.parse(xhr.responseText);
    	this.size = new Vec2(json.width, json.height);
    	
    	this.objects = [];
        this.layers = [];
    	json.layers.forEach(function(l) {
    		var layer = that.createEmptyLayer(l.tilesize);
            layer.name = l.name;
            layer.solid = layer.name.substr(0, 9) == "Collision";
			
			for (var k = 0; k < l.data.length; k++) {
				var tileData = l.data[k];
				if (tileData !== -1) {
					var tileset = rm.get(tileData.tileset);
					var tile = tileset.getTile(tileData.index);
					layer.tiles[k] = tile;
                    that.onTileLoad(tile, layer, k % layer.size[0], k / layer.size[0] | 0);
				}
			}
			
			that.addLayer(layer);
    	});

    };
    
    Map.prototype.createEmptyLayer = function(tilesize) {
		// 128px tilesize is the biggest and counts as "one" tile in map size
		var tileSizeFactor = 128 / tilesize;
		var size = new fm.geometry.Vec2(tileSizeFactor * this.size[0], tileSizeFactor * this.size[1]);
		var layer = new fm.map.TileLayer(tilesize, size, null);
		return layer;
	};
    
    Map.prototype.addLayer = function(l) {
    	if (this.size === null) {
    		this.size = new Vec2(l.getWidth(), l.getHeight());
    	}
		this.layers.push({
    		layer: l
    	});
    	return this.layers.length-1;
    };

    Map.prototype.addObject = function(o) {
        this.objects.push(o);
        return this.objects.length-1;
    };

    Map.prototype.getObjectsByType = function(type){
        var lst = [];
        this.objects.forEach(function(o) {
            if (o.type === type) {
                lst.push(o);
            }
        });
        return lst;
    };
    
    Map.prototype.addLight = function(light) {
    	this.lights.push(light);
    };

    Map.prototype.update = function(dt) {
    	for (var i = 0; i < this.lights.length; i++) {
    		this.lights[i].update(dt);
    	}
    };
    
    Map.prototype.render = function(renderer, viewport) {
    	// lightmap for all tilesizes
    	this.lightmaps = {};
    	for (var i = 0; i < 4; i++) {
    		var tilesize = Math.pow(2, i+4);
    		this.lightmaps[tilesize] = this.generateLightMap(tilesize, viewport);
    	}
    	
    	// generate sight map for the viewport's target (usually the player)
    	// TODO: ensure this is the player
    	this.sightmaps = {};
    	for (var i = 0; i < 4; i++) {
    		var tilesize = Math.pow(2, i+4);
    		this.sightmaps[tilesize] = this.generateSightMap(tilesize, viewport, this.lightmaps[tilesize]);
    	}
    	
    	for (var i = 0; i < this.layers.length; i++) {
    		var l = this.layers[i].layer;
    		l.renderLayer(renderer, viewport, this.lightmaps[l.tileSize], this.sightmaps[l.tileSize]);
    	}
    };
    
    Map.prototype.getLightValueAt = function(x, y) {
    	var ts = 32;
    	return this.lightmaps[ts][(x / ts | 0) + (y / ts | 0) * (128 / ts * this.size[0])];
    };
    
    Map.prototype.canBeSeen = function(x, y) {
    	var ts = 32;
    	return this.sightmaps[ts][(x / ts | 0) + (y / ts | 0) * (128 / ts * this.size[0])] === 1;
    };
    
    Map.prototype.generateSightMap = function(tilesize, viewport, lightmap) {
    	var tileSizeFactor = 128 / tilesize;
		var size = new fm.geometry.Vec2(tileSizeFactor * this.size[0], tileSizeFactor * this.size[1]);
    	var sightMap = Array.apply(null, new Array(size[0] * size[1])).map(Number.prototype.valueOf, -1.0);
    	
    	// source of sight
    	var sourceX = viewport.target[0] / tilesize | 0;
    	var sourceY = viewport.target[1] / tilesize | 0;
    	
    	// viewport borders, important for determining the borders to compute sight for
    	var viewportMinX = viewport.getOffsetX() / tilesize | 0;
		var viewportMinY = viewport.getOffsetY() / tilesize | 0;
		var viewportMaxX = viewportMinX + 1 + viewport.getWidth() / tilesize | 0;
		var viewportMaxY = viewportMinY + 1 + viewport.getHeight() / tilesize | 0;
		
		// get borders
		var minX = Math.max(0, viewportMinX);
		var minY = Math.max(0, viewportMinY);
		var maxX = Math.min(size[0], viewportMaxX);
		var maxY = Math.min(size[1], viewportMaxY);
		
		for (var x = minX; x < maxX; x++) {
			for (var y = minY; y < maxY; y++) {
				var index = x + y * size[0];
				// if not lit, we cannot see anyway
				if (lightmap[index] === -1 || !lightmap[index].intensity > 0.0) {
					continue;
				}
				
				if (!this.isLosBlocked(sourceX, sourceY, x, y, tilesize)) {
					sightMap[index] = 1;
				}
			}
		}
		
		return sightMap;
    };
    
    Map.prototype.generateLightMap = function(tilesize, viewport) {
    	// start with unlit map
    	var tileSizeFactor = 128 / tilesize;
		var size = new fm.geometry.Vec2(tileSizeFactor * this.size[0], tileSizeFactor * this.size[1]);
    	var lightMap = new Array(size[0] * size[1]);
    	if (this.ambientLight === null) {
    		lightMap = Array.apply(null, lightMap).map(Number.prototype.valueOf, -1.0);
    	} else {
    		lightMap = Array.apply(null, lightMap).map(fm.gfx.LightValue.prototype.dim.bind(this.ambientLight));
    	}
    	
    	// viewport borders, important for determining the borders to compute light for
    	var viewportMinX = viewport.getOffsetX() / tilesize | 0;
		var viewportMinY = viewport.getOffsetY() / tilesize | 0;
		var viewportMaxX = viewportMinX + 1 + viewport.getWidth() / tilesize | 0;
		var viewportMaxY = viewportMinY + 1 + viewport.getHeight() / tilesize | 0;
    	
    	// go through all lights and calculate the intensity
    	for (var i = 0; i < this.lights.length; i++) {
    		var light = this.lights[i];
    		
    		// translate light's pixel position to tile, so we can restrict the area for which we have to compute the intensity
    		var tileX = light.x / tilesize | 0;
    		var tileY = light.y / tilesize | 0;
    		
    		// light's radius in tiles
    		var tileRadius = light.radius / tilesize | 0;
    		
    		// get borders of area we have to create the lightmap for (=only tiles in the viewport)
    		var minX = Math.max(0, viewportMinX, tileX - tileRadius - 1);
    		var maxX = Math.min(size[0], viewportMaxX, tileX + tileRadius + 1);
    		var minY = Math.max(0, viewportMinY, tileY - tileRadius - 1);
    		var maxY = Math.min(size[1], viewportMaxY, tileY + tileRadius + 1);
    		
    		// now we can loop through the area (rectangular, i.e. we calculate too much)
    		for (var x = minX; x < maxX; x++) {
    			for (var y = minY; y < maxY; y++) {
    				// we take the center of the tile for the intensity calculation
    				var centerX = (x + 0.5) * tilesize;
    				var centerY = (y + 0.5) * tilesize;
    				
    				var lv = light.getValueAt(centerX, centerY);
    				var index = x + y * size[0];
    				if (lv.intensity > 0.0) {
    					// not blocked by any layer?
    					if (!this.isLosBlocked(tileX, tileY, x, y, tilesize)) {
    						if (lightMap[index] === -1) {
    							lightMap[index] = lv;
    						} else {
    							lightMap[index].add(lv);
    						}
    					}
    				}
    			}
    		}
    	}
    	
    	return lightMap;
    };
    
    Map.prototype.isLosBlocked = function(x0, y0, x1, y1, ts) {
    	var blocked = function(x, y) {
    		return layer.get(x, y) !== -1;
    	};
    	
    	for (var i = 0; i < this.layers.length; i++) {
    		var layer = this.layers[i].layer;
    		if (layer.solid) {
    			var tsFactor = ts / layer.tileSize;
    			var tileXStart = x0 * tsFactor | 0;
    			var tileYStart = y0 * tsFactor | 0;
    			var tileXEnd = x1 * tsFactor | 0;
    			var tileYEnd = y1 * tsFactor | 0;
    			
    			if (!fm.geometry.linePossible(tileXStart, tileYStart, tileXEnd, tileYEnd, blocked)) {
    				return true;
    			}
    		}
    	}
    	
    	return false;
    };
    
    Map.prototype.getWidth = function() {
    	return this.size[0];
    };
    
    Map.prototype.getHeight = function() {
    	return this.size[1];
    };
    
    Map.prototype.setSize = function(x, y) {
    	this.size = new Vec2(x, y);
    };
    
    Map.prototype.setTilesize = function(x, y) {
    	this.tileSize = new Vec2(x, y);
    };

    map.Map = Map;
})(fm.map, fm.geometry.Vec2, fm.collections.Hashmap);