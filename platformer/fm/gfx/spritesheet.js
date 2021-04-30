/**
 * Created by final on 04.02.14.
 */
fm.ns("fm.gfx.Spritesheet");
fm.req("fm.geometry.Vec2");

(function (gfx) {
    function Spritesheet() {
        this.width = 0;
        this.height = 0;
        this.texture = null;
    }

    Spritesheet.prototype.init = function(w, h, texture) {
        this.width = w;
        this.height = h;
        this.texture = texture;
    };

    Spritesheet.prototype.update = function(dt) {
    };

    /**
     * Draws the spritesheet
     * @param r {fm.gfx.renderer.Renderer}
     * @param x {number} Target x
     * @param y {number} Target y
     * @param w [number] Target width
     * @param h [number] Target height
     * @param tx [number] Sprite X-Tile
     * @param ty [number] Sprite Y-Tile
     */
    Spritesheet.prototype.draw = function(r, x, y, w, h, tx, ty) {
        r.drawTexture(this.texture, x, y, w, h, tx * this.width + 0.5, ty * this.height + 0.5, this.width, this.height);
    };

    gfx.Spritesheet = Spritesheet;
})(fm.gfx);