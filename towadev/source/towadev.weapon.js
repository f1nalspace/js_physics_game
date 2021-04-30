final.module("final.towadev.weapon", ["final.vec", "final.vec2math", "final.towadev.entity.enemy", "final.collisions"], function (final, vec, vec2math, enemy, collisions) {
    var Vec2 = vec.Vec2,
        Enemy = enemy.Enemy;

    function Weapon(game, owner) {
        this.pos = owner.pos;
        this.dir = new Vec2(0, -1);
        this.game = game;
        this.owner = owner;
        this.state = {
            fireCount: 0, // How many times total this weapon has fired
            cooldownProgress: 0 // How many seconds the weapon has already waited to cooldown
        };
        this.lockRange = 0;
        this.lockedOn = null;
        this.lockStartTime = 0;
        this.cooldownTime = 0;
        this.weaponId = null;
        this.image = null;
        this.bulletPosFactor = 0;
        this.bulletCount = 0;
        this.bulletScatterRange = 0;
        this.bulletSpeed = 0;
    }

    Weapon.prototype.reset = function () {
        vec2math.set(this.dir, 0, -1);
        vec2math.set(this.pos, this.owner.pos.x, this.owner.pos.y);
        this.state.cooldownProgress = 0;
        this.state.fireCount = 0;
        this.lockRange = 0;
        this.lockedOn = null;
        this.lockStartTime = 0;
        this.cooldownTime = 0;
        this.weaponId = null;
        this.image = null;
        this.bulletPosFactor = 0;
        this.bulletCount = 0;
        this.bulletScatterRange = 0;
        this.bulletSpeed = 0;
    };

    Weapon.prototype.canFire = function () {
        return this.state.cooldownProgress >= this.cooldownTime && this.bulletCount > 0;
    };

    Weapon.prototype.fire = function () {
        if (this.canFire()) {
            this.state.cooldownProgress = 0;
            this.state.fireCount++;

            var rangeAngle = Math.PI * this.bulletScatterRange;
            var rangePerBullet = rangeAngle / this.bulletCount;
            var initAngle = Math.atan2(this.dir.y, this.dir.x) - rangePerBullet * 0.5;
            for (var i = 0; i < this.bulletCount; i++) {
                var newAngle = initAngle + (i * rangePerBullet);
                var dir = new Vec2(Math.cos(newAngle), Math.sin(newAngle));
                this.game.fireBullet(this, this.pos, dir);
            }
        }
    };

    Weapon.prototype.predictEnemyPosition = function(dt, entity, predictedPos) {
        // TODO: Make this configurable
        var bulletPredictionFactor = 0.25;

        // First pass - predict enemy position
        predictedPos.x = entity.pos.x + (entity.dir.x * (entity.speed * dt));
        predictedPos.y = entity.pos.y + (entity.dir.y * (entity.speed * dt));

        // Get distance to weapon
        vec2math.sub(predictedPos, predictedPos, this.pos);

        // Second pass - calculate traveled time for distance and re-predict enemy position
        var bulletDistanceSteps = Math.max(Math.round(vec2math.length(predictedPos) / dt * bulletPredictionFactor), 1);
        predictedPos.x = entity.pos.x + (entity.dir.x * (entity.speed * dt * bulletDistanceSteps));
        predictedPos.y = entity.pos.y + (entity.dir.y * (entity.speed * dt * bulletDistanceSteps));
    };

    Weapon.prototype.update = function (dt) {
        var tmp = new Vec2();
        var predictedPos = new Vec2();
        var entity;

        // First shot is instant
        if (this.state.fireCount == 0) {
            this.state.cooldownProgress = this.cooldownTime;
        }

        // Just increase the cooldown progress
        this.state.cooldownProgress += dt;
        if (this.state.cooldownProgress >= this.cooldownTime) {
            this.state.cooldownProgress = this.cooldownTime;
        }

        // No target yet? - try to find one in range
        if (this.lockedOn == null) {
            var entities = this.game.entities.values();
            var entityCount = entities.length;
            for (var i = 0; i < entityCount; i++) {
                entity = entities[i];
                if (entity.alive && entity instanceof Enemy) {
                    // Predict enemy position
                    this.predictEnemyPosition(dt, entity, predictedPos);

                    if (collisions.isIntersectionCircleOfRectangle(this.pos, this.lockRange, predictedPos, entity.size)) {
                        // Found enemy in range - lock on
                        vec2math.sub(tmp, predictedPos, this.pos);
                        vec2math.normalize(this.dir, tmp);

                        // TODO: Animate rotation to enemy position (predict rotation)

                        // Enemy is locked on
                        this.lockStartTime = final.msecs();
                        this.lockedOn = entity;
                        break;
                    }
                }
            }
        } else {
            // Enemy is locked on - is enemy still alive?
            if (this.lockedOn.alive) {
                // Enemy is locked on - is enemy still in range?
                entity = this.lockedOn;

                // Predict enemy position
                this.predictEnemyPosition(dt, entity, predictedPos);

                if (collisions.isIntersectionCircleOfRectangle(this.pos, this.lockRange, predictedPos, entity.size)) {
                    // Update direction
                    vec2math.sub(tmp, predictedPos, this.pos);
                    vec2math.normalize(this.dir, tmp);

                    // Fire if possible
                    this.fire();
                } else {
                    // Enemy is outside of range - Release lock
                    final.log("Enemy outside of range, lock on duration: " + (final.msecs() - this.lockStartTime));
                    this.lockedOn = null;
                    this.lockStartTime = 0;
                }
            } else {
                // Enemy is dead - Release lock
                final.log("Enemy is dead, lock on duration: " + (final.msecs() - this.lockStartTime));
                this.lockedOn = null;
                this.lockStartTime = 0;
            }
        }
    };

    Weapon.prototype.draw = function (r) {
        var angle = Math.atan2(this.dir.x, -this.dir.y);
        r.push();
        r.translate(this.pos.x, this.pos.y);
        r.rotate(angle);
        if (this.image !== undefined && this.image != null) {
            r.drawImage(this.image, -this.owner.size.x * 0.5, -this.owner.size.y * 0.5, this.owner.size.x, this.owner.size.y);
        } else {
            r.strokeLine(0, 0, 0 + (0 * this.owner.size.x), 0 + (-1 * this.owner.size.y), "white", 2);
        }
        r.pop();

        // Draw cooldown as red bar
        if (this.game.debugDrawStates.WeaponCooldown) {
            var factor = this.state.cooldownProgress / this.cooldownTime;
            var sizeX = this.owner.size.x * 0.1;
            var sizeY = this.owner.size.y * 0.6;
            r.fillRect(this.pos.x + this.owner.size.x * 0.5 - sizeX, this.pos.y + sizeY * 0.5, sizeX, -sizeY * factor, "red");
            r.strokeRect(this.pos.x + this.owner.size.x * 0.5 - sizeX, this.pos.y + sizeY * 0.5, sizeX, -sizeY, "black");
        }
    };

    return {
        Weapon: Weapon
    };
});

