fm.ns("fm.geometry");

(function(geo){
	// bresenham algorithm to determine whether a line could be drawn
	geo.linePossible = function(x0, y0, x1, y1, blocked) {
		var dx = Math.abs(x1 - x0);
	    var dy = Math.abs(y1 - y0);
	    var sx = (x0 < x1) ? 1 : -1;
	    var sy = (y0 < y1) ? 1 : -1;
	    var err = dx - dy;
	    
	    var xx = x0, yy = y0;
		while (!((x1 === xx) && (y1 === yy))) {
			if (blocked(xx, yy)) {
				return false;
			}
			
			var e2 = err << 1;
			if (e2 > -dy) {
				err -= dy;
				xx += sx;
			}
			if (e2 < dx) {
				err += dx;
				yy += sy;
			}
		}
	    
	    return true;
	};
})(fm.geometry);
