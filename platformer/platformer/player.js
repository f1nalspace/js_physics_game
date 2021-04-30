/**
 * Created by final on 08.01.2014.
 */
fm.ns("fm.app.platformer.Player");
fm.req("fm.entity.MoveableEntity");
fm.req("fm.geometry.Vec2");

(function (platformer, MoveableEntity, Vec2) {
    function Player() {
        MoveableEntity.call(this);
        this.sheet = null;
        this.score = 0;
        this.fixedAABB = true;
    }

    Player.extends(MoveableEntity);

    Player.prototype.update = function (dt) {
        MoveableEntity.prototype.update.call(this, dt);
        if (this.sheet != null) {
            this.sheet.update(dt);
        }
    };

    Player.prototype.render = function (r) {
        if (this.sheet != null) {
            var spriteX = 0;
            var spriteY = this.dir[0] > 0 ? 0 : 1;
            this.sheet.draw(r, this.pos[0] - this.size[0] * 0.5, this.pos[1] - this.size[1] * 0.5, this.size[0], this.size[1], spriteX, spriteY);
        }
    };

    platformer.Player = Player;
})(fm.app.platformer, fm.entity.MoveableEntity, fm.geometry.Vec2);