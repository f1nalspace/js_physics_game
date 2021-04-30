fm.ns("fm.gfx.Viewport");
fm.req("fm.geometry.Vec2");
fm.req("fm.geometry.math");

(function (gfx, Vec2, vmath) {
    /**
     * Defines a viewport
     * @param x {number} Viewport x
     * @param y {number} Viewport y
     * @param w {number} Viewport width
     * @param h {number} Viewport height
     * @constructor
     */
    function Viewport(x, y, w, h) {
        this.view = [x, y, w, h]; // View boundaries
        this.bounds = [x, y, w, h]; // Max boundaries (Map size or something like that)
        this.vel = Vec2();
        this.center = Vec2();
        this.halfSize = Vec2();
        this.target = null;
        this.speed = 0.5;
        this.targetOffset = Vec2();
    }

    /**
     * Changes the boundary rectangle (Maybe when map changes or something like that?)
     * @param x {number} Boundary x
     * @param y {number} Boundary y
     * @param w {number} Boundary width
     * @param h {number} Boundary height
     */
    Viewport.prototype.setBounds = function (x, y, w, h) {
        this.bounds[0] = x;
        this.bounds[1] = y;
        this.bounds[2] = w;
        this.bounds[3] = h;
    };

    /**
     * Changes the view rectangle - this is our actual viewport
     * Will ensure bounds!
     * @param x {number} Boundary x
     * @param y {number} Boundary y
     * @param w {number} Boundary width
     * @param h {number} Boundary height
     */
    Viewport.prototype.setView = function (x, y, w, h) {
        this.view[0] = Math.max(x, this.bounds[0]);
        this.view[1] = Math.max(y, this.bounds[1]);
        this.view[2] = Math.min(w, this.bounds[2]);
        this.view[3] = Math.min(h, this.bounds[3]);
    };

    /**
     * Offsets the view rectangle
     * Will ensure bounds!
     * @param x
     * @param y
     */
    Viewport.prototype.setOffset = function(x,y){
        this.view[0] = Math.max(Math.min(x, this.bounds[2] - this.view[2]), this.bounds[0]);
        this.view[1] = Math.max(Math.min(y, this.bounds[3] - this.view[3]), this.bounds[1]);
    };

    Viewport.prototype.getOffsetX = function () {
        return this.view[0];
    };

    Viewport.prototype.getOffsetY = function () {
        return this.view[1];
    };

    Viewport.prototype.getWidth = function () {
        return this.view[2];
    };

    Viewport.prototype.getHeight = function () {
        return this.view[3];
    };

    /**
     * Moves the viewport to the given target when target is active
     * @param dt {number} Frametime
     */
    Viewport.prototype.update = function(dt) {
        vmath.vec2Set(this.halfSize, this.view[2] * 0.5, this.view[3] * 0.5);
        vmath.vec2Set(this.center, this.view[0] + this.halfSize[0], this.view[1] + this.halfSize[1]);
        if (this.target != null) {
            vmath.vec2Sub(this.targetOffset, this.center, this.target);
            var s = Math.abs(vmath.vec2Length(this.targetOffset) / this.speed) * dt;
            if (s > 1) {
                vmath.vec2Normalize(this.targetOffset, this.targetOffset);
                this.setOffset(this.view[0] + -this.targetOffset[0] * s, this.view[1] + -this.targetOffset[1] * s);
            }
        }
    };

    gfx.Viewport = Viewport;
})(fm.gfx, fm.geometry.Vec2, fm.geometry.math);