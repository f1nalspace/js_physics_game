var finalgine = finalgine || {};

finalgine.EntityCounter = 0;

finalgine.Entity = function (game) {
    this.id = ++finalgine.EntityCounter;
    this.game = game || null;
};

finalgine.Entity.prototype.update = function (dt) {
};

finalgine.RenderableEntity = function (game, x, y, w, h) {
    finalgine.Entity.call(this, game);
    this.pos = finalgine.Vector2(x, y);
    this.prevPos = this.pos.clone();
    this.size = finalgine.Vector2(w || 1, h || 1);
    this.visible = true;
    this.boundingVolume = finalgine.AABB(this.pos, this.size);
};
finalgine.RenderableEntity.inheritsFrom(finalgine.Entity);

finalgine.RenderableEntity.prototype.getVelocity = function() {
	return this.pos.sub(this.prevPos);
};

finalgine.RenderableEntity.prototype.boundRect = function (offset) {
    return this.boundingVolume.boundRect(offset);
};

finalgine.RenderableEntity.prototype.velocityRect = function () {
	var rect = this.boundRect();
	var vrect = this.boundRect(this.getVelocity());
	var l = Math.min(rect.left(), vrect.left());
	var t = Math.min(rect.top(), vrect.top());
	var r = Math.max(rect.right(), vrect.right());
	var b = Math.max(rect.bottom(), vrect.bottom());
	return finalgine.Rectangle(l, t, r - l, b - t);
};

finalgine.RenderableEntity.prototype.render = function (renderer) {
    this.boundingVolume.draw(renderer, finalgine.Colors.Blue);
};

finalgine.RenderableEntity.prototype.update = function (dt) {
};

finalgine.RenderableEntity.prototype.setPosition = function (x, y) {
    this.pos.setup(x, y);
    this.prevPos.setup(x, y);
};

finalgine.MovableEntity = function (game, x, y, w, h) {
    finalgine.RenderableEntity.call(this, game, x, y, w, h);
    this.dir = finalgine.Vector2();
};
finalgine.MovableEntity.inheritsFrom(finalgine.RenderableEntity);

finalgine.MovableEntity.prototype.update = function (dt) {
    // Update base renderable entity
    finalgine.RenderableEntity.prototype.update.call(this, dt);
};

finalgine.PhysicsEntity = function (game, x, y, w, h, density) {
    finalgine.MovableEntity.call(this, game, x, y, w, h);
    this.force = finalgine.Vector2();
    this.acc = finalgine.Vector2();
    this.friction = finalgine.Vector2(0.01, 0.0);
    this.density = density || 1.0; // 1.0 means has mass, 0.0 means is static unmovable
    this.mass = this.density * this.size.x * this.size.y;
    this.invMass = this.mass > 0.0001 ? 1.0 / this.mass : 0.0;
    this.applyGravity = true;
    this.gravity = game !== undefined ? game.gravity || finalgine.Vector2(0, 0) : finalgine.Vector2(0, 0);
    this.vel = finalgine.Vector2();
};
finalgine.PhysicsEntity.inheritsFrom(finalgine.MovableEntity);

finalgine.PhysicsEntity.prototype.isStatic = function () {
    return this.mass < 0.0001;
};

finalgine.PhysicsEntity.prototype.addImpulse = function (F, dt) {
    // V = V + F * 1/m
    this.force.iadd(F);
};

finalgine.PhysicsEntity.prototype.resetImpulse = function () {
    this.force.zero();
};

finalgine.PhysicsEntity.prototype.update = function (dt) {
    // Integrate
    this.integrate(dt);

    // Update base movable entity
    finalgine.MovableEntity.prototype.update.call(this, dt);
};

finalgine.PhysicsEntity.prototype.integrate = function (dt) {
    // Verlet Integration
    this.acc.iadd(this.force.mul(this.invMass));
    var vel = this.getVelocity();
    var position = this.pos.add(vel).add(this.acc.mul(dt * dt));
    this.prevPos.setup(this.pos);
    this.vel.setup(position.x - this.prevPos.x, position.y - this.prevPos.y);
    this.pos.setup(position);
    this.acc.zero();
};

// PlatformerEntity
finalgine.PlatformerEntity = function (game, x, y, w, h, density) {
    finalgine.PhysicsEntity.call(this, game, x, y, w, h, density);
    this.onGround = false;
    this.canJump = false;
};
finalgine.PlatformerEntity.inheritsFrom(finalgine.PhysicsEntity);

finalgine.PlatformerEntity.prototype.update = function (dt) {
    finalgine.PhysicsEntity.prototype.update.call(this, dt);
};

// PlatformerPlayerEntity
finalgine.PlatformerPlayerEntity = function (game, x, y, w, h) {
    finalgine.PlatformerEntity.prototype.update.call(this, game, x, y, w, h);
};
finalgine.PlatformerPlayerEntity.inheritsFrom(finalgine.PlatformerEntity);

finalgine.PlatformerPlayerEntity.prototype.update = function (dt) {
    finalgine.PlatformerEntity.prototype.update.call(this, dt);
};