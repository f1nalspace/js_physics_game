var finalgine = finalgine || {};

finalgine.QuadTreeNodeIndex = {
    TopLeft:0,
    TopRight:1,
    BottomLeft:2,
    BottomRight:3,
    Parent:4
};

finalgine.QuadTreeNode = function (tree, parent, pos, size, depth) {
    return {
        tree:tree,
        parent:parent,
        pos:pos,
        size:size,
        nodes:[],
        items:[],
        stuckItems: [],
        depth: depth,
        out: [],
        boundRect:function () {
            return finalgine.Rectangle(this.pos.x, this.pos.y, this.size.x, this.size.y);
        },
        draw:function (r, color, lineWidth) {
            r.drawRect(this.pos.x, this.pos.y, this.size.x, this.size.y, color, lineWidth);
        },
        subdivide:function () {
            var size = this.size.div(2);
            var depth = this.depth + 1;
            this.nodes.length = 0;
            this.nodes[finalgine.QuadTreeNodeIndex.TopLeft] = finalgine.QuadTreeNode(tree, this, finalgine.Vector2(this.pos.x, this.pos.y), size, depth);
            this.nodes[finalgine.QuadTreeNodeIndex.TopRight] = finalgine.QuadTreeNode(tree, this, finalgine.Vector2(this.pos.x + size.x, this.pos.y), size, depth);
            this.nodes[finalgine.QuadTreeNodeIndex.BottomRight] = finalgine.QuadTreeNode(tree, this, finalgine.Vector2(this.pos.x + size.x, this.pos.y + size.y), size, depth);
            this.nodes[finalgine.QuadTreeNodeIndex.BottomLeft] = finalgine.QuadTreeNode(tree, this, finalgine.Vector2(this.pos.x, this.pos.y + size.y), size, depth);
        },
        findIndex: function(x, y) {
            var b = this.boundRect();
            var left = x > (b.left() + b.w / 2) ? false : true;
            var top = y > (b.top() + b.h / 2) ? false : true;

            // Top left
            var index = finalgine.QuadTreeNodeIndex.TopLeft;
            if (left) {
                // Left side
                if (!top) {
                    // Bottom left
                    index = finalgine.QuadTreeNodeIndex.BottomLeft;
                }
            } else {
                // Right side
                if (top) {
                    // Top right
                    index = finalgine.QuadTreeNodeIndex.TopRight;
                } else {
                    // Bottom right
                    index = finalgine.QuadTreeNodeIndex.BottomRight;
                }
            }
            return index;
        },
        insert: function(item) {
            var itemRect = item.boundingVolume !== undefined ? item.boundingVolume.boundRect() : (item.boundRect !== undefined ? item.boundRect() : item);
            if (this.nodes.length > 0) {
                var index = this.findIndex(itemRect.x, itemRect.y);
                var node = this.nodes[index];
                var nodeRect = node.boundRect();
                if (itemRect.left() >= nodeRect.left() &&
                    itemRect.right() <= nodeRect.right() &&
                    itemRect.top() >= nodeRect.top() &&
                    itemRect.bottom() <= nodeRect.bottom()) {
                    node.insert(item);
                } else {
                    this.stuckItems.push(item);
                }
                return;
            }

            this.items.push(item);

            var len = this.items.length;
            if (!(this.depth >= this.tree.maxDepth) && len > this.tree.maxChilds) {
                this.subdivide();
                for (var i = 0; i < len; i++) {
                    this.insert(this.items[i]);
                }
                this.items.length = 0;
            }
        },
        clear: function() {
            this.items.length = 0;
            this.stuckItems.length = 0;
            var len = this.nodes.length;
            for (var i = 0; i < len; i++) {
                this.nodes[i].clear();
            }
            this.nodes.length = 0;
        },
        retrieve: function(item) {
            var out = this.out;
            out.length = 0;
            var itemRect = item.boundingVolume !== undefined ? item.boundingVolume.boundRect() : (item.boundRect !== undefined ? item.boundRect() : item);
            if (this.nodes.length > 0) {
                var index = this.findIndex(itemRect.x, itemRect.y);
                out.push.apply(out, this.nodes[index].retrieve(item));
            }
            out.push.apply(out, this.stuckItems);
            out.push.apply(out, this.items);
            return out;
        }
    };
};

finalgine.QuadTree = function (pos, size) {
    this.rootNode = finalgine.QuadTreeNode(this, null, pos, size, 0);
    this.maxDepth = 5;
    this.maxChilds = 3;
};

finalgine.QuadTree.prototype.draw = function (r, color, lineWidth, child) {
    child = child || this.rootNode;
    child.draw(r, color, lineWidth);
    for (var i in child.nodes) {
        this.draw(r, color, lineWidth, child.nodes[i]);
    }
};

finalgine.QuadTree.prototype.insert = function (item) {
    this.rootNode.insert(item);
};

finalgine.QuadTree.prototype.clear = function () {
    this.rootNode.clear();
};

finalgine.QuadTree.prototype.retrieve = function (item, out) {
    var out = this.rootNode.retrieve(item);
    return out;
};