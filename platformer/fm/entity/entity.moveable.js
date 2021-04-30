/**
 * Created by final on 15.01.2014.
 */
fm.ns("fm.entity.MoveableEntity");
fm.req("fm.entity.RenderableEntity");
fm.req("fm.geometry.Vec2");
fm.req("fm.geometry.math");

(function (entity, vmath, Vec2) {
    var EntityCollisionFlag = {
        Source: 1,
        Target: 2,
        SourceAndTarget: 1 | 2,
        SourceResolve: 4,
        TargetResolve: 8,
        SourceAndTargetResolve: 4 | 8
    };

    function EntityCollision() {
        this.flag = 0;
    }

    EntityCollision.prototype.reset = function() {
        this.flag = 0;
        return this;
    };

    EntityCollision.prototype.has = function(flag) {
        return (this.flag & flag) === flag;
    };

    EntityCollision.prototype.add = function(flag) {
        this.flag |= flag;
        return this;
    };

    function MoveableEntity() {
        entity.RenderableEntity.call(this);
        this.vel = Vec2();

        // Handle map collisions by default
        this.handleMapCollisions = true;

        // We want that this moveable entity can collide with everything and this and other entities will be pushed apart
        this.handleEntityCollisions = new EntityCollision().add(EntityCollisionFlag.SourceAndTarget);

        this.acceptGravity = true;
        this.applyFriction = false;
        this.groundFriction = 0.2; // friction with ground - 1=totally sticky, 0=ice
        this.onGround = false;
        this.onGroundLast = false;
        this.maxJumps = 2;
        this.jumpCount = 0;
        this.jumpPower = 100;
        this.dir = Vec2(1,0);
        this.nextPos = Vec2(); // Just a temporary storage for the predicted position
        this.posCorrect = Vec2(); // Position correction
    }

    MoveableEntity.extends(entity.RenderableEntity);

    MoveableEntity.prototype.update = function (dt) {
        entity.RenderableEntity.prototype.update.call(this, dt);

        // Integration
        var tempX = this.vel[0];
        var tempY = this.vel[1];
        var newVelX = tempX * dt;
        var newVelY = tempY * dt;
        this.vel[0] += (newVelX + this.posCorrect[0]) * dt;
        this.vel[1] += (newVelY + this.posCorrect[1]) * dt;
        this.pos[0] += (tempX + this.vel[0]) * 0.5 * dt;
        this.pos[1] += (tempY + this.vel[1]) * 0.5 * dt;
        this.posCorrect[0] = 0;
        this.posCorrect[1] = 0;
    };

    MoveableEntity.prototype.render = function (r) {
        entity.RenderableEntity.prototype.render.call(this, r);
    };

    MoveableEntity.prototype.canJump = function () {
        return (this.jumpCount < this.maxJumps) && ((this.jumpCount == 0 && this.onGround) || this.jumpCount > 0 && this.vel[1] >= 0);
    };

    MoveableEntity.prototype.jump = function () {
        this.jumpCount++;
        this.vel[1] -= this.jumpPower;
    };

    MoveableEntity.prototype.getAABB = function(aabb) {
        aabb.min[0] = this.pos[0] - this.size[0] * 0.5;
        aabb.min[1] = this.pos[1] - this.size[1] * 0.5;
        aabb.max[0] = this.pos[0] + this.size[0] * 0.5;
        aabb.max[1] = this.pos[1] + this.size[1] * 0.5;
    };

    MoveableEntity.prototype.getPredictedPos = function(output, dt) {
        var tempX = this.vel[0];
        var tempY = this.vel[1];
        var newVelX = tempX * dt;
        var newVelY = tempY * dt;
        output[0] = this.pos[0] + (tempX + newVelX) * 0.5 * dt;
        output[1] = this.pos[1] + (tempY + newVelY) * 0.5 * dt;
    };

    MoveableEntity.prototype.getSweptAABB = function(aabb, dt) {
        // get predicted pos on next frame
        this.getPredictedPos(this.nextPos, dt);

        // find min/max
        vmath.vec2Min(aabb.min, this.pos, this.nextPos);
        vmath.vec2Max(aabb.max, this.pos, this.nextPos);

        // extend by radius
        aabb.min[0] -= this.size[0] * 0.5;
        aabb.min[1] -= this.size[1] * 0.5;
        aabb.max[0] += this.size[0] * 0.5;
        aabb.max[1] += this.size[1] * 0.5;
    };

    entity.MoveableEntity = MoveableEntity;
    entity.EntityCollisionFlag = EntityCollisionFlag;
})(fm.entity, fm.geometry.math, fm.geometry.Vec2);