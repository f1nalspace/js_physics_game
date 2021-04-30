/**
 * Created by final on 08.01.2014.
 */
fm.ns("fm.entity.Entity");

(function (entity) {
    var entityId = 0;

    function Entity() {
        this.id = ++entityId;
        this.alive = true;
    }

    Entity.prototype.update = function (dt) {
    };

    entity.Entity = Entity;
})(fm.entity);