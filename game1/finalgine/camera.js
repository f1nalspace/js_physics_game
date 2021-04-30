var finalgine = finalgine || {};

finalgine.Camera = function () {
    this.pos = finalgine.Vector2(0.0, 0.0);
    this.zoom = finalgine.Vector2(2.0, 2.0);
    this.vel = finalgine.Vector2(0.0, 0.0);
    this.friction = finalgine.Vector2(0.0, 0.0);
    this.target = null;
    this.targetSpeed = 0;
};

finalgine.Camera.prototype.lockTarget = function(target, speed) {
    this.target = target;
    if (target instanceof finalgine.RenderableEntity) {
        this.target = target.pos;
    }
    this.targetSpeed = speed;
};

finalgine.Camera.prototype.moveTo = function(target, speed) {
    var targetPos = finalgine.Vector2(target).mul(-1).mul(this.zoom);
    var p = this.pos.sub(targetPos);
    var s = Math.abs(p.lengthSqrt() / speed);
    if (s > 1.01) {
        var axis = p.normalized();
        this.vel.x += (-axis.x * s);
        this.vel.y += (-axis.y * s);
    }
};

finalgine.Camera.prototype.update = function (frametime) {
    // Lock on a target
    if (this.target != null) {
        this.moveTo(this.target, this.targetSpeed);
    }

    // Integrate
    if (Math.abs(this.vel.x) > finalgine.MinFloat) {
        this.pos.x += this.vel.x * frametime;
        this.vel.x *= this.friction.x;
    }
    if (Math.abs(this.vel.y) > finalgine.MinFloat) {
        this.pos.y += this.vel.y * frametime;
        this.vel.y *= this.friction.y;
    }
    if (Math.abs(this.vel.x) < finalgine.MinFloat) {
        this.vel.x = 0.0;
    }
    if (Math.abs(this.vel.y) < finalgine.MinFloat) {
        this.vel.y = 0.0;
    }
};