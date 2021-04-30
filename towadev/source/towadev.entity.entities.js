final.module("final.towadev.entity.entities", ["final.towadev.entity"], function(final, entity){
    function Entities() {
        var uniqueIndex = 0;
        var keyValues = {};
        var keys = [];
        var values = [];
        return {
            add: function(entity) {
                if (!entity.hasOwnProperty("_uniqueindex")) {
                    entity['_uniqueindex'] = ++uniqueIndex;
                }
                if (keyValues[entity['_uniqueindex']] === undefined) {
                    keys.push(entity['_uniqueindex']);
                } else {
                    values = values.filter(function(item){
                        return item['_uniqueindex'] != entity['_uniqueindex'];
                    });
                }
                values.push(entity);
                keyValues[entity['_uniqueindex']] = entity;
            },
            remove: function(entity){
                if (entity.hasOwnProperty("_uniqueindex")) {
                    var uindex = entity['_uniqueindex'];
                    if (uindex > 0 && keyValues[uindex] !== undefined) {
                        keyValues[entity] = undefined;
                        keys = keys.filter(function(index){
                            return index != uindex;
                        });
                        values = values.filter(function(item){
                            return item['_uniqueindex'] != entity['_uniqueindex'];
                        });
                    }
                }
            },
            find: function(key) {
                if (keyValues[key] !== undefined) {
                    return keyValues[key];
                }
                return null;
            },
            keys: function(){
                return keys;
            },
            values: function() {
                return values;
            },
            count: function() {
                return values.length;
            },
            removeAll: function() {
                var lst = [];
                var i;
                for (i = 0; i < values.length; i++) {
                    lst.push(values[i]);
                }
                for (i = 0; i < lst.length; i++) {
                    this.remove(lst[i]);
                }
            }
        };
    }

    return {
        Entities: Entities
    }
});