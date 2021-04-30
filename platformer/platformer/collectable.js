/**
 * Created by final on 09.02.2014.
 */
fm.ns("fm.app.platformer.Collectable");
fm.req("fm.entity.TileEntity");
fm.req("fm.geometry.Vec2");

(function (platformer, TileEntity, Vec2) {
    function Collectable(tile) {
        TileEntity.call(this, tile);
    }

    Collectable.extends(TileEntity);

    platformer.Collectable = Collectable;
})(fm.app.platformer, fm.entity.TileEntity, fm.geometry.Vec2);