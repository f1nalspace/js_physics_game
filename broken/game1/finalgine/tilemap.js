var finalgine = finalgine || {};

finalgine.Tile = function(center, scale, isSolid) {
    this.isSolid = isSolid;
    this.boundingVolume = finalgine.AABB(center, scale);
};

finalgine.TileMap = function (game) {
    this.game = game;
    this.solidGrid = new finalgine.Grid();
};

finalgine.TileMap.prototype.loadTiledJSON = function (data) {
    // Resize and initialize map
    this.solidGrid.resize(data.width, data.height, data.tilewidth, data.tileheight);

    // Find solid layer
    var layers = data.layers;
    var solidLayer = null;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].name == "Solid" && (layers[i].width == data.width && layers[i].height == data.height)) {
            solidLayer = layers[i];
            break;
        }
    }

    // Set solid tiles
    if (solidLayer != null) {
        var tileData = solidLayer.data;
        const solidTileIndex = 1;
        for (var y = 0; y < data.height; y++) {
            for (var x = 0; x < data.width; x++) {
                var tile = tileData[(y * data.width) + x];
                var isSolid = (tile == solidTileIndex);

                var p = finalgine.Vector2((x * this.solidGrid.size.x) + this.solidGrid.size.halfX(), (y * this.solidGrid.size.y) + this.solidGrid.size.halfY());
                var s = this.solidGrid.size.clone();
                var newTile = new finalgine.Tile(p, s, isSolid);

                this.solidGrid.set(x, y, newTile);
            }
        }
    }
};

finalgine.TileMap.prototype.positionEntity = function(entity, x, y) {
    entity.setPosition(x * this.solidGrid.size.x, y * this.solidGrid.size.y);
};

finalgine.TileMap.prototype.getSolidLength = function() {
    return this.solidGrid.length;
};

finalgine.TileMap.prototype.getSolidTile = function(x, y) {
    return this.solidGrid.get(x, y);
};

finalgine.TileMap.prototype.isSolid = function(x, y, defValue) {
	if (x >= 0 && x < this.solidGrid.length.x && y >= 0 && y < this.solidGrid.length.y) {
		return this.solidGrid.get(x, y).isSolid;
	} else {
		return defValue || false;
	}
};