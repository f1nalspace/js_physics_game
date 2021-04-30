final.module("final.towadev.entity.tower", ["final.vec", "final.towadev.entity.friend", "final.towadev.weapon"], function(final, vec, friend, weapon) {
    var Vec2 = vec.Vec2,
        Friend = friend.Friend,
        Weapon = weapon.Weapon;

    var defaultHintFont = {
        name: "Arial",
        size: 0.35,
        style: "normal"
    };

    function Tower(game, id) {
        Friend.call(this, game);
        this.id = id;
        this.size = new Vec2(game.map.tileSize);
        this.cost = 250; // Costs in money
        this.weapon = new Weapon(game, this);
        this.image = null;
        this.hint = "";
    }
    Tower.extend(Friend);

    Tower.prototype.reset = function() {
        Friend.prototype.reset.call(this);
        this.cost = 250;
        this.weapon.reset();
        this.image = null;
        this.hint = "";
    };

    Tower.prototype.update = function(dt) {
        Friend.prototype.update.call(this, dt);

        // Update weapon
        this.weapon.update(dt);
    };

    Tower.prototype.draw = function(r) {
        // Draw body
        if (this.image !== undefined && this.image != null) {
            r.drawImage(this.image, this.pos.x - this.size.x * 0.5, this.pos.y - this.size.y * 0.5, this.size.x, this.size.y);
        } else {
            r.strokeRect(this.pos.x - this.size.x * 0.5, this.pos.y - this.size.y * 0.5, this.size.x, this.size.y, "purple");
        }

        // Draw weapon
        this.weapon.draw(r);

        // Draw hint
        if (this.hint.length > 0) {
            r.applyFont(defaultHintFont, "right", "middle");
            r.fillText(this.pos.x + this.size.x * 0.5, this.pos.y + this.size.y * 0.35, this.hint, "black");
            r.resetFont();
        }
    };

    Tower.prototype.getSellCost = function() {
        return Math.floor(this.cost * 0.85);
    };

    return {
        Tower: Tower
    };
});