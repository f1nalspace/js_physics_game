final.module("final.pathfinding", ["final.vec", "final.utils"], function(final, vec, utils){
    var Vec2 = vec.Vec2;

    var AStar = (function(){
        function AStar(map) {
            this.map = map;
            this.startPos = null;
            this.targetPos = null;
            this.basicMoveCost = 10;
            this.diagonalMoveCost = 14;
            this.openList = new utils.HashMap();
            this.closedList = new utils.HashMap();
        }

        AStar.prototype.isBlocked = function(x, y) {
            return false;
        };

        AStar.prototype.step = function() {
            // Get start and end tile
            if (this.startPos == null) {
                throw new Error("Start not found!");
            }
            if (this.targetPos == null) {
                throw new Error("End not found!");
            }
            var endKey = this.targetPos.x + "-" + this.targetPos.y;
            if (this.isBlocked(this.startPos.x, this.startPos.y)) {
                throw new Error("Start is blocked!");
            }
            if (this.isBlocked(this.targetPos.x, this.targetPos.y)) {
                throw new Error("End is blocked!");
            }

            var that = this;

            var findLowest = function() {
                var found = null;
                var cost = null;
                for (var i = 0; i < that.openList.count; i++) {
                    var n = that.openList.item(i);
                    if (n.costF < cost || cost == null) {
                        cost = n.costF;
                        found = n;
                    }
                }
                return found;
            };

            var calculateH = function(pos) {
                return (Math.abs(that.targetPos.x - pos.x) + Math.abs(that.targetPos.y - pos.y)) * that.basicMoveCost;
            };

            var directions = [
                new Vec2(0, -1),
                new Vec2(1, -1),
                new Vec2(1, 0),
                new Vec2(1, 1),
                new Vec2(0, 1),
                new Vec2(-1, 1),
                new Vec2(-1, 0),
                new Vec2(-1, -1)
            ];

            var search = function(baseNode) {
                var basePos = baseNode.pos;
                that.openList.remove(baseNode.key);
                that.closedList.put(baseNode.key, baseNode);
                for (var i = 0; i < directions.length; i++) {
                    var direction = directions[i];
                    var newPos = new Vec2(basePos.x + direction.x, basePos.y + direction.y);
                    var costG = Math.abs(direction.x) + Math.abs(direction.y) > 1 ? that.diagonalMoveCost : that.basicMoveCost;
                    var costH = calculateH(newPos);
                    var newKey = newPos.x + "-" + newPos.y;
                    if (!that.isBlocked(newPos.x, newPos.y) && (costG != that.diagonalMoveCost)) {
                        if (!that.closedList.contains(newKey) && !that.openList.contains(newKey)) {
                            var newNode = {
                                pos: newPos,
                                parent: baseNode,
                                costG: costG,
                                costH: costH,
                                costF: costG + costH,
                                key: newKey
                            };
                            that.openList.put(newNode.key, newNode);
                        }
                    }
                }
                return that.openList.count > 0;
            };

            var constructPath = function(node) {
                // Construct path
                that.path = [];
                var p = node;
                while (p != null) {
                    that.path.push(p.pos);
                    p = p.parent;
                }
                that.path = that.path.reverse();
            };

            // Initialize
            if (this.openList.count == 0 && this.closedList.count == 0) {
                // Add start to open list
                var startNode = {
                    pos: this.startPos,
                    parent: null,
                    key: this.startPos.x + "-" + this.startPos.y
                };
                this.openList.put(startNode.key, startNode);

                // Start search
                return search(startNode);
            } else {
                if (this.openList.count > 0) {
                    var lowestNode = findLowest();
                    if (lowestNode != null) {
                        // Is lowest target?
                        if (lowestNode.key == endKey) {
                            // Remove end node from openlist and move it to closed list
                            this.openList.remove(lowestNode.key);
                            this.closedList.put(lowestNode.key, lowestNode);

                            // Construct path
                            constructPath(lowestNode);
                            return false;
                        } else {
                            // Next search
                            return search(lowestNode);
                        }
                    } else {
                        throw new Error("Target could not be found!");
                    }
                } else {
                    return false;
                }
            }
        };

        AStar.prototype.findPath = function() {
            this.path = [];
            while (this.step()) {
                // Do nothing
            }
            return this.path;
        };

        return AStar;
    })();

    return {
        AStar: AStar
    }
});

