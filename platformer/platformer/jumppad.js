/**
 * Created by final on 16.02.14.
 */

fm.ns("fm.app.platformer.Jumppad");
fm.req("fm.entity.TileEntity");
fm.req("fm.geometry.Vec2");

(function (platformer, entity, TileEntity, Vec2) {
    function Jumppad(tile) {
        TileEntity.call(this, tile);

        // We want that other entities can collide with this - and target should be pushed apart from this
        this.handleEntityCollisions.reset().add(entity.EntityCollisionFlag.Target).add(entity.EntityCollisionFlag.TargetResolve);

        // Set jumppad power
        this.power = 220;
    }

    Jumppad.extends(TileEntity);

    platformer.Jumppad = Jumppad;
})(fm.app.platformer, fm.entity, fm.entity.TileEntity, fm.geometry.Vec2);
