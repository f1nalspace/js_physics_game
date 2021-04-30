/**
 * Created by final on 15.01.2014.
 */
fm.ns("fm.entity.RenderableEntity");
fm.req("fm.entity.Entity");
fm.req("fm.geometry.Vec2");

(function (entity, Vec2) {
    function RenderableEntity() {
        entity.Entity.call(this);
        this.pos = Vec2();
        this.size = Vec2();
        this.color = "white";
        this.texture = null;
    }
    RenderableEntity.extends(entity.Entity);

    RenderableEntity.prototype.update = function (dt) {
        entity.Entity.prototype.update.call(this, dt);
    };

    RenderableEntity.prototype.render = function (r, lv) {
        // TODO: Just a temporary rendering method
        if (this.texture != null) {
        	var litTexture = this.texture.createLitTexture(lv);
            r.drawTexture(litTexture, this.pos[0] - this.size[0] * 0.5, this.pos[1] - this.size[1] * 0.5, this.size[0], this.size[1]);
        } else {
            r.fillRect(this.pos[0] - this.size[0] * 0.5, this.pos[1] - this.size[1] * 0.5, this.size[0], this.size[1], this.color);
        }
    };

    entity.RenderableEntity = RenderableEntity;
})(fm.entity, fm.geometry.Vec2);