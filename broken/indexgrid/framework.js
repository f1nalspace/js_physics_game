Function.prototype.inheritsFrom = function( parentClassOrObject ){
    if ( parentClassOrObject.constructor == Function )
    {
        //Normal Inheritance
        this.prototype = new parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject.prototype;
    }
    else
    {
        //Pure Virtual Inheritance
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
}

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.Game = function (canvas) {
    this.canvas = canvas;
    this.ctx = null;

    this.mousestate = [];
    this.mouse = Vec2(0, 0);

};

Game.prototype.update = function(r, dt) {
};

Game.prototype.render = function(r) {
    var w = this.canvas.width;
    var h = this.canvas.height;
    r.clearRect(0, 0, w, h);
    r.fillStyle = "black";
    r.fillRect(0, 0, w, h);
};

Game.prototype.run = function() {
    this.ctx = this.canvas.getContext("2d");

    var that = this;
    var getXandY = function (e) {
        var x = e.clientX - that.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.canvas.getBoundingClientRect().top;
        return Vec2(x, y);
    };

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

    var dt = 1.0 / 60.0;
    (function loop(){
        requestAnimFrame(loop);
        that.update(that.ctx, dt);
        that.render(that.ctx);
    })();
};

Game.prototype.isMouseDown = function (button) {
    return this.mousestate[button] !== undefined && this.mousestate[button] === true;
}

Game.prototype.setMouseButton = function (button, value) {
    this.mousestate[button] = value;
}
