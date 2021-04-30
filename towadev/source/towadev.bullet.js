final.module("final.towadev.bullet", ["final.vec", "final.vec2math", "final.utils", "final.collisions", "final.towadev.entity.enemy", "final.towadev.entity.area"], function(final, vec, vec2math, utils, collisions, enemy, area){
    var Vec2 = vec.Vec2,
        Enemy = enemy.Enemy,
        Area = area.Area;

    var BulletType = {
        Normal: 0,
        Area: 1
    };

    function Bullet(game, owner) {
        this.game = game;
        this.owner = owner; // Weapon
        this.pos = new Vec2();
        this.dir = new Vec2();
        this.speed = 0;
        this.alive = true;
        this.radius = 0;
        this.damage = 0;
        this.damageRanges = new Vec2(0, 0);
        this.type = BulletType.Normal;

        this.areaType = 0;
        this.areaRadius = 0;
        this.areaDuration = 0;
        this.areaEffectType = 0;
        this.areaEffectOp = 0;
        this.areaEffectDelta = 0;
    }

    Bullet.prototype.reset = function() {
        vec2math.zero(this.pos);
        vec2math.zero(this.dir);
        this.speed = 0;
        this.radius = 0;
        this.damage = 0;
        vec2math.set(this.damageRanges, 0, 0);
        this.type = BulletType.Normal;

        this.areaType = 0;
        this.areaRadius = 0;
        this.areaDuration = 0;
        this.areaEffectType = 0;
        this.areaEffectOp = 0;
        this.areaEffectDelta = 0;
    };

    Bullet.prototype.hit = function(dt, target) {
        // Create area
        if (this.type == BulletType.Area) {
            var area = new Area(this.game, this.areaType, this.areaRadius, this.areaDuration);
            area.effectType = this.areaEffectType;
            area.effectOp = this.areaEffectOp;
            area.effectDelta = this.areaEffectDelta;
            area.pos.x = target.pos.x;
            area.pos.y = target.pos.y;
            this.game.addEntity(area);
        }

        // Decrease health
        target.health -= utils.randomRange(this.damageRanges.x, this.damageRanges.y) * this.damage;
        this.game.enemyHit(dt, target, this.owner);
    };

    Bullet.prototype.update = function(dt) {
        var vel = new Vec2();
        vec2math.multScalar(vel, this.dir, this.speed * dt);
        vec2math.add(this.pos, this.pos, vel);

        // Check collisions for enemies
        var entities = this.game.entities.values();
        var hitEntity = null;
        for (var i = 0; i <  entities.length; i++) {
            var entity = entities[i];
            if (entity.alive && entity instanceof Enemy) {
                if (collisions.isIntersectionCircleOfRectangle(this.pos, this.radius, entity.pos, entity.size)) {
                    hitEntity = entity;
                    break;
                }
            }
        }

        // Bullet hits entity
        if (hitEntity != null) {
            this.hit(dt, hitEntity);
            this.alive = false;
        }
    };

    Bullet.prototype.draw = function(r) {
        r.fillArc(this.pos.x, this.pos.y, this.radius, "red");
        r.strokeArc(this.pos.x, this.pos.y, this.radius, "black", 0.02);
    };

    return {
        BulletType: BulletType,
        Bullet: Bullet
    }
});