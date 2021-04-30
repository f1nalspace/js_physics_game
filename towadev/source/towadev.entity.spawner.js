final.module("final.towadev.entity.spawner", ["final.towadev.entity"], function(final, entity){
    var Entity = entity.Entity;

    function EntitySpawner(game, entityClass) {
        Entity.call(this, game);
        var that = this;
        this.game = game;
        this.entityClass = entityClass;
        this.entitySpawned = function(spawner, entity){};
        this.enabled = false;
        this.interval = 0;
        this.max = 0;
        this.count = 0;
        this.now = 0;
        this.createFunc = function(entityClass) {
            var entityFunc = final.require("final.towadev.entity." + (entityClass || that.entityClass));
            if (typeof entityFunc == "function") {
                return new entityFunc(that.game);
            }
            return null;
        };
    }
    EntitySpawner.extend(Entity);

    EntitySpawner.prototype.restart = function() {
        this.count = 0;
        this.now = this.interval;
        this.enabled = true;
    };

    EntitySpawner.prototype.spawn = function(entityClass) {
        var entity = this.createFunc(entityClass);
        if (entity) {
            this.entitySpawned(this, entity);
        }
    };

    EntitySpawner.prototype.update = function(dt) {
        if (this.enabled && this.count < this.max) {
            this.now += dt;
            if (this.now >= this.interval) {
                this.spawn();
                this.count++;
                this.now = 0;
            }
        } else {
            this.enabled = false;
        }
    };

    EntitySpawner.prototype.draw = function(r) {
    };

    return {
        EntitySpawner: EntitySpawner
    };
});