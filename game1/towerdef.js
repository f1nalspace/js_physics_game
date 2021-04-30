window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.performance = window.performance || {};
performance.now = (function () {
    return performance.now ||
        performance.mozNow ||
        performance.msNow ||
        performance.oNow ||
        performance.webkitNow ||
        function () {
            return new Date().getTime();
        };
})();

Function.prototype.inheritsFrom = function (parentClassOrObject) {
    if (parentClassOrObject.constructor == Function) {
        //Normal Inheritance
        this.prototype = new parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject.prototype;
    }
    else {
        //Pure Virtual Inheritance
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
};

function Level(sx, sy, tx, ty) {
    if (sx === undefined || sy === undefined) {
        throw new Error("Level parameters are missing!");
    }
    this.map = [];
    this.size = Vec2(sx, sy);
    this.tileSize = Vec2(tx, ty);
    for (var i = 0; i < this.size.x * this.size.y; i++) {
        this.map[i] = 0;
    }
}

Level.prototype.draw = function(ctx) {
    var sx = 0 - ((this.size.x / 2) * this.tileSize.x);
    var sy = 0 - ((this.size.y / 2) * this.tileSize.y);
    for (var y = 0; y < this.size.y; y++) {
        for (var x = 0; x < this.size.x; x++) {
            var cx = sx + (x * this.tileSize.x);
            var cy = sy + (y * this.tileSize.y);
            ctx.fillStyle = "blue";
            ctx.fillRect(cx, cy, this.tileSize.x, this.tileSize.y);
        }
    }
    ctx.strokeStyle = "grey";
    for (var y = 0; y <= this.size.y; y++) {
        ctx.moveTo(sx, sy + (y * this.tileSize.y));
        ctx.lineTo(sx + (this.size.x * this.tileSize.x), sy + (y * this.tileSize.y));
        ctx.stroke();
    }
    for (var x = 0; x <= this.size.x; x++) {
        ctx.moveTo(sx + (x * this.tileSize.x), sy);
        ctx.lineTo(sx + (x * this.tileSize.x), sy + (this.size.y * this.tileSize.y));
        ctx.stroke();
    }
};

function TowerDef() {
    this.canvas = document.getElementById("canvas");

    // Double-click text problem will no longer occur.
    this.canvas.onselectstart = function () {
        return false;
    };

    this.ctx = this.canvas.getContext("2d");
    this.keystate = [];
    this.mouse = Vec2(-1, -1);
    this.mousestate = [];
    this.centerOffset = Vec2(this.canvas.width * 0.5, this.canvas.height * 0.5);
    this.level = new Level(10, 10, 32, 32);

    var that = this;

    var getXandY = function (e) {
        var x = e.clientX - that.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.canvas.getBoundingClientRect().top;
        return Vec2(x - that.centerOffset.x, y - that.centerOffset.y);
    };

    this.canvas.addEventListener("keydown", function (ev) {
        that.keystate[ev.keyCode] = true;
    }, false);
    this.canvas.addEventListener("keyup", function (ev) {
        that.keystate[ev.keyCode] = false;
        console.log(ev.keyCode);
    }, false);
    this.canvas.addEventListener("mousedown", function (ev) {
        that.mouse = getXandY(ev);
        that.mousestate[ev.button] = true;
    }, false);
    this.canvas.addEventListener("mouseup", function (ev) {
        that.mousestate[ev.button] = false;
    }, false);
    this.canvas.addEventListener("mousemove", function (ev) {
        that.mouse = getXandY(ev);
    }, false);
}

TowerDef.prototype.isKeyDown = function (key) {
    return this.keystate[key] !== undefined && this.keystate[key] === true;
};

TowerDef.prototype.setKeyDown = function (key, value) {
    this.keystate[key] = value;
};

TowerDef.prototype.isMouseDown = function (button) {
    return this.mousestate[button] !== undefined && this.mousestate[button] === true;
};

TowerDef.prototype.setMouseButton = function (button, value) {
    this.mousestate[button] = value;
};

TowerDef.prototype.init = function () {
};

TowerDef.prototype.update = function (dt) {
};

TowerDef.prototype.draw = function (dt) {
    var ctx = this.ctx;
    var viewport = Vec2(this.canvas.width, this.canvas.height);

    ctx.clearRect(0, 0, viewport.x, viewport.y);

    // Draw black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, viewport.x, viewport.y);

    // Move coordinate system to center
    ctx.save();
    ctx.translate(this.centerOffset.x, this.centerOffset.y);

    // Draw level
    this.level.draw(ctx);

    // Restore coordinate system
    ctx.restore();
};

TowerDef.prototype.run = function () {
    this.init();
    var that = this;
    var then = 0;
    (function gameLoop() {
        var now = performance.now();
        var delta = (now - then) / 1000;
        that.update(delta);
        that.draw(delta);
        then = now;
        requestAnimFrame(gameLoop);
    })();
};


