final.module("final.towadev.entity.friend", ["final.towadev.entity"], function(final, entity){
    var Entity = entity.Entity;

    function Friend(game) {
        Entity.call(this, game);
    }
    Friend.extend(Entity);

    return {
        Friend: Friend
    }
});