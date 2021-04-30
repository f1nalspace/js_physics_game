final.module("final.towadev.entity.enemy", ["final.utils", "final.vec", "final.vec2math", "final.ui.progressbar", "final.towadev.entity"], function (final, utils, vec, vec2math, progressbar, entity) {
    var Vec2 = vec.Vec2,
        Entity = entity.Entity,
        ProgressBar = progressbar.ProgressBar,
        ArrayList = utils.ArrayList;

    var EnemyAction = {
        Nothing: 0,
        TargetReached: 1
    };

    var EnemyEffectOperator = {
        Factor: 0,
        Delta: 1
    };

    // TODO: Data-driven (Property key instead)
    var EnemyEffectType = {
        None: 0,
        Speed: 1,
        Health: 2,
        Armor: 3
    };

    var enemyEffectIDCounter = 0;

    /**
     * @param entityId {Number}
     * @param op {EnemyEffectOperator}
     * @param type {EnemyEffectType}
     * @param duration {Number}
     * @param delta {Number}
     * @param [stackable] {boolean}
     * @constructor
     */
    function EnemyEffect(type, entityId, op, duration, delta, stackable) {
        this.id = ++enemyEffectIDCounter;
        this.type = type;
        this.entityId = entityId;
        this.op = op;
        this.duration = duration;
        this.delta = delta;
        this.stackable = stackable || false;
        this.remaining = duration;
        this.active = true;
    }

    function Enemy(game) {
        Entity.call(this, game);
        this.moving = false;
        this.target = new Vec2();
        this.pathQueue = new utils.Queue();
        this.healthBar = new ProgressBar(game, new Vec2(0, 0), new Vec2(0.75, 0.125));
        this.color = "black";

        // TODO: Data-driven!
        this.speed = 0;
        this.minSpeed = 0;
        this.maxSpeed = 0;
        this.health = 0;
        this.armor = 0;
        this.bounty = 0;
        this.penalty = 0;

        this.effects = [];
        this.removeEffects = [];
    }

    Enemy.extend(Entity);

    Enemy.prototype.reset = function (game) {
        Entity.prototype.reset.call(this);

        this.moving = false;
        vec2math.zero(this.target);
        this.pathQueue.clear();
        this.healthBar.max = 0;
        vec2math.zero(this.healthBar.pos);
        this.color = "black";

        // TODO: Data-driven!
        this.speed = 0;
        this.minSpeed = 0;
        this.maxSpeed = 0;
        this.health = 0;
        this.armor = 0;
        this.bounty = 0;
        this.penalty = 0;

        this.effects = [];
        this.removeEffects = [];
    };

    Enemy.prototype.moveto = function (x, y) {
        if (!this.moving) {
            this.moving = true;
            this.target.x = (x * this.game.map.tileSize) + this.game.map.tileSize * 0.5;
            this.target.y = (y * this.game.map.tileSize) + this.game.map.tileSize * 0.5;
            vec2math.sub(this.dir, this.target, this.pos);
            vec2math.normalize(this.dir, this.dir);
        }
    };

    Enemy.prototype.findEffect = function(type, entityId) {
        var i, effect;
        for (i = 0; i < this.effects.length; i++) {
            effect = this.effects[i];
            if (effect.active && effect.type == type && effect.entityId == entityId) {
                return effect;
            }
        }
        return null;
    };

    Enemy.prototype.hasEffect = function(type, entityId) {
        return this.findEffect(type, entityId) != null;
    };

    Enemy.prototype.addEffect = function(effect) {
        final.log("Added effect to entity: " + effect.entityId);
        this.effects.push(effect);
    };

    Enemy.prototype.removeEffect = function(type, entityId) {
        var effect = this.findEffect(type, entityId);
        if (effect != null) {
            final.log("Removed effect from entity: " + effect.entityId);
            effect.active = false;
            effect.remaining = 0;
        }
    };

    Enemy.prototype.update = function (dt) {
        var i, effect;

        // Initialize healthbar once
        if (this.healthBar.max == 0) {
            this.healthBar.max = this.health;
        }

        // Apply condition effects
        this.removeEffects = [];
        var speed = this.speed,
            health = this.health;
        for (i = 0; i < this.effects.length; i++) {
            effect = this.effects[i];
            if (effect.active) {
                if (effect.remaining > 0) {
                    effect.remaining -= dt;
                    switch (effect.type) {
                        case EnemyEffectType.Speed:
                            if (effect.op == EnemyEffectOperator.Factor) {
                                speed *= effect.delta;
                            } else if (effect.op == EnemyEffectOperator.Delta) {
                                speed += effect.delta;
                            }
                            break;
                        case EnemyEffectType.Health:
                            if (effect.op == EnemyEffectOperator.Factor) {
                                health *= effect.delta;
                            } else if (effect.op == EnemyEffectOperator.Delta) {
                                health += effect.delta;
                            }
                            break;
                    }
                } else {
                    effect.active = false;
                    effect.remaining = 0;
                    this.removeEffects.push(effect.id);
                }
            }
        }

        // Remove inactive effects
        for (i = 0; i < this.removeEffects.length; i++) {
            var effectId = this.removeEffects[i];
            this.effects = this.effects.filter(function(item){
                return item['id'] != effectId;
            });
        }

        // Apply limitations
        speed = Math.max(Math.min(speed, this.maxSpeed), this.minSpeed);
        health = Math.max(health, 0);

        // Apply pernament condition changes
        if (health != this.health) {
            this.health = health;
            this.game.enemyHit(dt, this, null);
        }

        // Move when alive
        if (this.alive) {
            if (this.moving) {
                var dir = new Vec2(this.target.x - this.pos.x, this.target.y - this.pos.y);
                var n = vec2math.dot(dir, this.dir);
                if (n > 0) {
                    var acc = new Vec2();
                    vec2math.multScalar(acc, this.dir, speed * dt);
                    vec2math.add(this.pos, this.pos, acc);
                } else {
                    this.moving = false;
                    if (this.pathQueue.count == 0) {
                        this.game.entityAction(this, EnemyAction.TargetReached);
                    }
                }
            } else {
                if (this.pathQueue.count > 0) {
                    var t = this.pathQueue.dequeue();
                    this.moveto(t.x, t.y);
                }
            }
        }

        // Reposition healthbar and update value
        this.healthBar.pos.x = this.pos.x - (this.healthBar.size.x * 0.5);
        this.healthBar.pos.y = this.pos.y - (this.size.y * 0.75 + this.healthBar.size.y);
        this.healthBar.value = this.health;
    };

    Enemy.prototype.draw = function (r) {
        r.fillRect(this.pos.x - this.size.x * 0.5, this.pos.y - this.size.y * 0.5, this.size.x, this.size.y, this.color);
        this.healthBar.draw(r, this.healthBar.pos, this.healthBar.size);
    };

    return {
        EnemyAction: EnemyAction,
        EnemyEffectOperator: EnemyEffectOperator,
        EnemyEffectType: EnemyEffectType,
        EnemyEffect: EnemyEffect,
        Enemy: Enemy
    }
});