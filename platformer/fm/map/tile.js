fm.ns("fm.map.Tile");
fm.req("fm.geometry.Vec2");

(function (map, Vec2) {
	function Tile(tileset, tilesetIndex, animation) {
		this.tileset = tileset;
		this.tileIndex = tilesetIndex;
		this.animation = animation;
		this.accumulatedAnimationTime = 0;
	};
	
	Tile.prototype.getTileset = function() {
		return this.tileset;
	};
	
	Tile.prototype.getTileIndex = function() {
		return this.tileIndex;
	};
	
	Tile.prototype.getAABB = function(aabb) {
		return this.tileset.getTileAABB(this.tileIndex, aabb);
	};
	
	Tile.prototype.render = function(renderer, canvasX, canvasY, lv) {
		this.tileset.renderTile(renderer, canvasX, canvasY, this.tileIndex, undefined, lv);
	};
	
	Tile.prototype.update = function(dt) {
		if (typeof this.animation !== 'undefined') {
			this.accumulatedAnimationTime += dt;
			for (var i = 0; i < this.animation.length; i++) {
				if (this.animation[i].index == this.tileIndex) {
					if (this.accumulatedAnimationTime > this.animation[i].duration) {
						this.accumulatedAnimationTime -= this.animation[i].duration;
						this.tileIndex = this.animation[(i + 1) % this.animation.length].index;
					}
					break;
				}
			}
		}
	};
	
	map.Tile = Tile;
})(fm.map, fm.geometry.Vec2);