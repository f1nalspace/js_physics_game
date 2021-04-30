var finalgine = finalgine || {};

/*
 Grid class
 */
finalgine.Grid = function () {
    this.length = finalgine.Vector2(0, 0);
    this.size = finalgine.Vector2(0, 0);
    this.data = [];
};
finalgine.Grid.prototype.resize = function (w, h, tw, th) {
    this.length = finalgine.Vector2(w, h);
    this.size = finalgine.Vector2(tw, th);
    this.data = Array(w * h);
    for (var i = 0; i < (w * h); i++) {
        this.data[i] = null;
    }
};
finalgine.Grid.prototype.clear = function() {
    for (var i = 0; i < (this.length.x * this.length.y); i++) {
        this.data[i] = null;
    }
};
finalgine.Grid.prototype.totalCount = function () {
    return this.length.x * this.length.y;
};
finalgine.Grid.prototype.totalSize = function () {
    return (this.length.x * this.size.x) * (this.length.y * this.size.y);
};
finalgine.Grid.prototype.getSize = function() {
	return finalgine.Vector2(this.length.x * this.size.x, this.length.y * this.size.y);
};
finalgine.Grid.prototype.index = function (x, y) {
    return (y * this.length.x) + x;
};
finalgine.Grid.prototype.set = function (x, y, value) {
    return this.data[this.index(x, y)] = value;
};
finalgine.Grid.prototype.setIndex = function (index, value) {
    return this.data[index] = value;
};
finalgine.Grid.prototype.get = function (x, y) {
    return this.data[this.index(x, y)];
};
finalgine.Grid.prototype.is = function(x, y, t, f) {
	if (x >= 0 && x < this.length.x && y >= 0 && y < this.length.y) {
		return t(this.get(x, y));
	} else {
		return f;
	}
};
finalgine.Grid.prototype.trace = function (center, size) {
    var t = center.div(this.size);
    var s = size.div(this.size);
    var min = {x:Math.round(t.x - s.x)-1, y:Math.round(t.y - s.y)-1};
    var max = {x:Math.round(t.x + s.x)+1, y:Math.round(t.y + s.y)+1};
    return {min:min, max:max};
};
finalgine.Grid.prototype.clone = function () {
	var g = new finalgine.Grid();
	g.resize(this.length.x, this.length.y, this.size.x, this.size.y);
	for (var i = 0; i < this.totalCount(); i++) {
		g.setIndex(i, this.data[i]);
	}
	return g;
};