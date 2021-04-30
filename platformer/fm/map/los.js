fm.ns("fm.map.Los");
fm.req("fm.map.Map");
fm.req("fm.geometry");

(function (map, geo) {
	function Los(x, y) {
		this.x = x;
		this.y = y;
	};
	
	Los.prototype.isVisible = function(x, y, blocked) {
		return geo.linePossible(this.x, this.y, x, y, blocked);
	};
	
	Los.prototype.setCenter = function(x, y) {
		this.x = x;
		this.y = y;
	};
	
	map.Los = Los;
})(fm.map, fm.geometry);