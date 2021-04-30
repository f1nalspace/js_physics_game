var finalgine = finalgine || {};

/*
 IndexGrid class
 */
finalgine.IndexGrid = function (gridRect, cellSize) {
    finalgine.Grid.call(this);
    this.resize(Math.floor(gridRect.w / cellSize.x), Math.floor(gridRect.h / cellSize.y), cellSize.x, cellSize.y);
    this.gridRect = gridRect;
    this.allocatedCells = 0;
    this.totalCells = this.length.x * this.length.y;
};
finalgine.IndexGrid.inheritsFrom(finalgine.Grid);

finalgine.IndexGrid.prototype.clear = function() {
    finalgine.Grid.prototype.clear.call(this);
    this.allocatedCells = 0;
};

finalgine.IndexGrid.prototype.retrieve = function (item, itemRect) {
    var results = [];

    // Target cell coordinates
    var leftCell = Math.floor((itemRect.left() - this.gridRect.left()) / this.size.x);
    var topCell = Math.floor((itemRect.top() - this.gridRect.top()) / this.size.y);
    var rightCell = Math.floor((itemRect.right() - this.gridRect.left()) / this.size.x);
    var bottomCell = Math.floor((itemRect.bottom() - this.gridRect.top()) / this.size.y);

    for (var y = topCell; y <= bottomCell; y++) {
        for (var x = leftCell; x <= rightCell; x++) {
            if (x >= 0 && x < this.length.x && y >= 0 && y < this.length.y) {
                var cell = this.get(x, y);
                if (cell != null) {
                    results.push.apply(results, cell);
                }
            }
        }
    }

    return results;
};

finalgine.IndexGrid.prototype.insert = function (item, itemRect) {
    // Target cell coordinates
    var leftCell = Math.floor((itemRect.left() - this.gridRect.left()) / this.size.x);
    var topCell = Math.floor((itemRect.top() - this.gridRect.top()) / this.size.y);
    var rightCell = Math.floor((itemRect.right()-1 - this.gridRect.left()) / this.size.x);
    var bottomCell = Math.floor((itemRect.bottom()-1 - this.gridRect.top()) / this.size.y);

    for (var y = topCell; y <= bottomCell; y++) {
        for (var x = leftCell; x <= rightCell; x++) {
            if (x >= 0 && x < this.length.x && y >= 0 && y < this.length.y) {
                var index = this.index(x, y);
                var cell = this.get(x, y);
                if (cell == null) {
                    cell = [];
                    this.set(x, y, cell);
                    this.allocatedCells++;
                }
                cell.push(item);
            }
        }
    }
};

finalgine.IndexGrid.prototype.draw = function (r, color, color2, lineWidth) {
    /*
    // Draw lines from top to bottom
    var xp = this.gridRect.left();
    for (var i = 0; i < this.length.x; i++) {
        r.drawLine(xp, this.gridRect.top(), xp, this.gridRect.bottom(), color, lineWidth);
        xp += this.size.x;
    }

    // Draw lines from left to right
    var yp = this.gridRect.top();
    for (var i = 0; i < this.length.y; i++) {
        r.drawLine(this.gridRect.left(), yp, this.gridRect.right(), yp, color, lineWidth);
        yp += this.size.y;
    }
    */

    for (var y = 0; y < this.length.y; y++) {
        for (var x = 0; x < this.length.x; x++) {
            var cell = this.get(x, y);
            if (cell != null && cell.length > 0) {
                var cellX = this.gridRect.left() + (x * this.size.x);
                var cellY = this.gridRect.top() + (y * this.size.y);
                r.drawRect(cellX, cellY, this.size.x, this.size.y, color2, lineWidth);
            }
        }
    }
};