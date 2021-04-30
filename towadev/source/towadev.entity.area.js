final.module("final.towadev.entity.area", ["final.utils", "final.vec", "final.vec2math", "final.towadev.entity", "final.towadev.entity.enemy"], function(final, utils, vec, vec2math, entity, enemy) {
    var Vec2 = vec.Vec2,
        Entity = entity.Entity,
        Enemy = enemy.Enemy,
        EnemyEffectOperator = enemy.EnemyEffectOperator,
        EnemyEffectType = enemy.EnemyEffectType,
        EnemyEffect = enemy.EnemyEffect;

    var AreaTypes = {
        None: 0,
        Always: 1, // When a entity comes into the area of effect circle
        Once: 2 // Only for entities which was enclosing in the effect circle once
    };

    function Area(game, areaType, radius, duration) {
        Entity.call(this, game);
        this.areaType = areaType;
        this.radius = radius;
        this.duration = duration;
        this.remaining = duration;
        this.color = "black";
        this.drawOrder = 10;
        this.inactive = false;
        this.effectType = 0;
        this.effectOp = 0;
        this.effectDelta = 0;
    }

    Area.extend(Entity);

    Area.prototype.entityInRange = function(entity, dt) {
        var predictedPos = new Vec2(), tmp = new Vec2();
        predictedPos.x = entity.pos.x + (entity.dir.x * entity.speed * dt);
        predictedPos.y = entity.pos.y + (entity.dir.y * entity.speed * dt);
        var enemyRadius = Math.max(entity.size.x, entity.size.y) * 0.5;
        vec2math.sub(tmp, predictedPos, this.pos);
        var distanceSquared = vec2math.lengthSquared(tmp);
        var rad = this.radius + enemyRadius;
        return distanceSquared <= rad * rad;
    };

    Area.prototype.applyEffect = function(entity, wasInactive) {
        if (this.areaType != AreaTypes.None && (this.areaType == AreaTypes.Always || (this.areaType == AreaTypes.Once && !wasInactive))) {
            if (!entity.hasEffect(this.effectType, entity.id)) {
                entity.addEffect(new EnemyEffect(this.effectType, entity.id, this.effectOp, this.duration, this.effectDelta));
                if (this.areaType == AreaTypes.Once) {
                    this.inactive = true;
                }
            }
        }
    };

    Area.prototype.removeEffect = function(entity) {
        if (entity.hasEffect(this.effectType, entity.id)) {
            entity.removeEffect(this.effectType, entity.id);
        }
    };

    Area.prototype.update = function (dt) {
        this.remaining -= dt;
        if (this.remaining > 0) {
            var entities = this.game.entities.values();
            var entityCount = entities.length;
            var entity, wasInactive = this.inactive;
            for (var i = 0; i < entityCount; i++) {
                entity = entities[i];
                if (entity.alive && entity instanceof Enemy) {
                    if (this.entityInRange(entity, dt)) {
                        this.applyEffect(entity, wasInactive);
                    } else {
                        this.removeEffect(entity);
                    }
                }
            }
        } else {
            this.alive = false;
            this.remaining = 0;
        }
    };

    Area.prototype.draw = function (r) {
        r.applyAlpha((1 / this.duration) * this.remaining);
        r.strokeArc(this.pos.x, this.pos.y, this.radius, this.color);
        r.resetAlpha();
    };

    return {
        AreaTypes: AreaTypes,
        Area: Area
    };
});