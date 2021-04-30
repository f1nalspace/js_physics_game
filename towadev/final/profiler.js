final.module("final.profiler", ["final.utils", "final.renderer"], function(final, utils, renderer){
    var Renderer = renderer.Renderer;

    var defaultNodeFont = {
        name: "Courier",
        size: 12,
        style: "normal"
    };

    function NodeList() {
        return {
            childs: [],
            childCount: 0,
            indices: {},
            add: function(node) {
                if (this.indices[node.key] !== undefined) {
                    throw new Error("Node by key 'already exists!'");
                }
                var i = this.childCount++;
                this.childs[i] = node;
                this.indices[node.key] = i;
            },
            get: function(key) {
                if (this.indices[key] !== undefined) {
                    return this.childs[this.indices[key]];
                }
                return null;
            },
            clear: function() {
                for (var i = 0, c = this.childCount; i < c; i++) {
                    this.childs[i].clear();
                }
                this.childCount = 0;
                this.childs = [];
            },
            update: function() {
                for (var i = 0, c = this.childCount; i < c; i++) {
                    this.childs[i].update();
                }
            }
        };
    }

    function Node(parent, key) {
        this.parent = parent;
        this.key = key;
        this.nodes = NodeList();
        this.start = 0;
        this.end = 0;
        this.duration = 0;
    }

    Node.prototype.update = function() {
        this.duration = this.end - this.start;
        this.nodes.update();
    };

    function Profiler() {
        Node.call(this, null, null);
        this.lastTime = final.msecs();
        this.curNode = null;
        this.freq = 250;
        this.renderer = null;
        this.active = false;
        this.parentCanvas = null;
    }
    Profiler.extend(Node);

    Profiler.prototype.resize = function() {
        if (!this.active) return;
        var pc = this.parentCanvas;
        var r = this.renderer;
        var canvas = r.getCanvas();
        canvas.width = pc.width * 0.35;
        canvas.height = pc.height * 0.5;
        canvas.style.width = pc.clientWidth * 0.35 + "px";
        canvas.style.height = pc.clientHeight * 0.5 + "px";
        r.setViewport(canvas.width, canvas.height);
        canvas.style.left = pc.clientWidth - canvas.clientWidth + "px";
        canvas.style.top = pc.style.top;
    };

    Profiler.prototype.enable = function(canvas) {
        if (this.active) return;
        var newcanvas = document.createElement("canvas");
        newcanvas.style.position = "absolute";
        newcanvas.style.zIndex = 10;
        document.body.appendChild(newcanvas);
        this.parentCanvas = canvas;
        this.renderer = new Renderer(newcanvas);
        this.active = true;
        this.curNode = this;
        this.resize();
        this.draw();
    };

    Profiler.prototype.disable = function() {
        if (!this.active) return;
        this.active = false;
        var canvas = this.renderer.getCanvas();
        this.renderer.clear();
        document.removeChild(canvas);
        this.renderer = null;
        this.curNode = null;
    };

    Profiler.prototype.begin = function(key) {
        if (!this.active) return;
        var node = this.curNode.nodes.get(key);
        if (node == null) {
            node = new Node(this.curNode, key);
            this.curNode.nodes.add(node);
        }
        node.start = final.msecs();
        node.end = 0;
        this.curNode = node;
    };

    Profiler.prototype.finish = function() {
        if (!this.active) return;
        var node = this.curNode;
        if (node.parent != null) {
            node.end = final.msecs();
            this.curNode = node.parent;
        }
    };

    Profiler.prototype.update = function(){
        if (!this.active) return;
        var now = final.msecs();
        if (now - this.lastTime >= this.freq) {
            this.lastTime = now;
            if (this.curNode.parent != null) {
                throw new Error("Cur node '"+this.curNode.key+"' is not closed!");
            }
            this.nodes.update();
            this.resize();
            this.draw();
        }
    };


    Profiler.prototype.draw = function() {
        if (!this.active) return;
        var r = this.renderer;
        var vp = r.getViewport();
        r.clear();
        r.fillRect(0, 0, vp.x, vp.y, "rgba(0,0,0,0.5)");
        r.applyFont(defaultNodeFont, "left", "top");
        var x = 0;
        var y = 0;
        var nodeHeight = defaultNodeFont.size;
        var nodeIdent = defaultNodeFont.size;
        (function drawNodes(nodes, ident) {
            for (var i = 0, c = nodes.childCount; i < c; i++) {
                var node = nodes.childs[i];
                r.fillText(x + (ident * nodeIdent), y, node.key + ": " + node.duration.toFixed(3) + " msecs", "white");
                y += nodeHeight;
                drawNodes(node.nodes, ident + 1);
            }
        })(this.curNode.nodes, 0);
        r.resetFont();
    };

    return {
        Profiler: new Profiler()
    };
});