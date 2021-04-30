final.module("final.towadev.entity", ["final.shim", "final.vec", "final.vec2math", "final.utils"], function(final, shim, vec, vec2math, utils){
    var Vec2 = vec.Vec2;

    var entityIDCounter = 0;

    function Entity(game) {
        this.id = ++entityIDCounter;
        this.game = game;
        this.pos = new Vec2();
        this.dir = new Vec2();
        this.alive = true;
        this.size = new Vec2(game['map'] !== undefined ? game.map.tileSize : 0);
        this.drawOrder = 0; // 0 = Highest, > 0 Lower
    }

    Entity.prototype.reset = function() {
        vec2math.zero(this.pos);
        vec2math.zero(this.dir);
        vec2math.set(this.size, this.game.map.tileSize, this.game.map.tileSize);
    };

    Entity.prototype.getRadius = function() {
        return Math.max(this.size.x, this.size.y) * 0.5;
    };

    Entity.prototype.update = function(dt) {
    };

    Entity.prototype.draw = function(r) {
    };

    return {
        Entity: Entity
    }
});