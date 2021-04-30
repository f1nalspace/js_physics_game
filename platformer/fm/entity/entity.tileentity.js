/**
 * Created by final on 16.02.14.
 */

fm.ns("fm.entity.TileEntity");
fm.req("fm.entity.MoveableEntity");
fm.req("fm.geometry.Vec2");

(function (entity, MoveableEntity, Vec2) {
    function TileEntity(tile) {
        MoveableEntity.call(this);

        // We dont want map collisions for this tile entity
        this.handleMapCollisions = false;

        // We want that other entities can collide with this tile entity only
        // But our tile entity cannot collide with other entities
        this.handleEntityCollisions.reset().add(entity.EntityCollisionFlag.Target);

        // Do not add gravity to this tile entity
        this.acceptGravity = false;

        // Tile entities are normally unmoveable - therefore no need to allow jumps :D
        this.maxJumps = 0;

        this.tile = tile;
        this.aabb = null;
        this.size = Vec2(32, 32); // Default tile size

        this.fixedAABB = false;
    }

    TileEntity.extends(MoveableEntity);

    TileEntity.prototype.update = function (dt) {
        MoveableEntity.prototype.update.call(this, dt);
    };

    TileEntity.prototype.render = function (r, lv) {
        var x = this.pos[0] - this.size[0] * 0.5;
        var y = this.pos[1] - this.size[1] * 0.5;
        this.tile.render(r, x, y, lv);
    };

    TileEntity.prototype.getAABB = function(aabb) {
        if (this.aabb == null) {
            this.aabb = new fm.geometry.AABB(new Vec2(), new Vec2());
            if (!this.fixedAABB) {
                this.tile.getAABB(this.aabb);
            } else {
                this.aabb.min[0] = 0;
                this.aabb.min[1] = 0;
                this.aabb.max[0] = this.size[0];
                this.aabb.max[1] = this.size[1];
            }
        }

        var x = this.pos[0] - this.size[0] * 0.5;
        var y = this.pos[1] - this.size[1] * 0.5;
        aabb.min[0] = x + this.aabb.min[0];
        aabb.min[1] = y + this.aabb.min[1];
        aabb.max[0] = x + this.aabb.max[0];
        aabb.max[1] = y + this.aabb.max[1];
    };

    TileEntity.prototype.getSweptAABB = function(aabb, dt) {
        if (this.aabb == null) {
            this.aabb = new fm.geometry.AABB(new Vec2(), new Vec2());
            this.tile.getAABB(this.aabb);
        }
        var x = this.pos[0] - this.size[0] * 0.5;
        var y = this.pos[1] - this.size[1] * 0.5;
        aabb.min[0] = x + this.aabb.min[0];
        aabb.min[1] = y + this.aabb.min[1];
        aabb.max[0] = x + this.aabb.max[0];
        aabb.max[1] = y + this.aabb.max[1];
    };

    fm.entity.TileEntity = TileEntity;
})(fm.entity, fm.entity.MoveableEntity, fm.geometry.Vec2);