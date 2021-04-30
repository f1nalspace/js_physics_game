/**
 * Created by final on 16.02.14.
 */

fm.ns("fm.app.platformer.MoveableBox");
fm.req("fm.entity.TileEntity");
fm.req("fm.geometry.Vec2");

(function (platformer, entity, TileEntity, Vec2) {
    function MoveableBox(tile) {
        TileEntity.call(this, tile);
        this.handleMapCollisions = true;
        this.acceptGravity = true;
        this.applyFriction = true;
        this.handleEntityCollisions.reset().add(entity.EntityCollisionFlag.SourceAndTarget).add(entity.EntityCollisionFlag.SourceAndTargetResolve);
        this.groundFriction = 0.5;
    }

    MoveableBox.extends(TileEntity);

    platformer.MoveableBox = MoveableBox;
})(fm.app.platformer, fm.entity, fm.entity.TileEntity, fm.geometry.Vec2);
