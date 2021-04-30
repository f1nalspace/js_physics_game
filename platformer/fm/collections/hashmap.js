/**
 * Created by final on 09.01.2014.
 */
fm.ns("fm.collections.Hashmap");

(function (collections) {
    function Hashmap() {
        this.indices = {};
        this.values = [];
        this.count = 0;
    }

    Hashmap.prototype.put = function(id, value){
        if (typeof this.indices[id] != "undefined") {
            this.values[this.indices[id]] = value;
        } else {
            this.values[this.count] = value;
            this.indices[id] = this.count;
            this.count++;
        }
    };

    Hashmap.prototype.remove = function(id) {
        if (typeof this.indices[id] == "undefined") {
            throw new Error("Item by id '"+id+"' does not exists!");
        }
        var index = this.indices[id];
        this.values.splice(index, 1);
        this.indices[id] = undefined;
        this.count--;
    };

    Hashmap.prototype.contains = function(id) {
        return this.indices[id] !== undefined;
    };

    Hashmap.prototype.get = function(id) {
        if (typeof this.indices[id] != "undefined") {
            return this.values[this.indices[id]];
        }
        return null;
    };

    Hashmap.prototype.count = function() {
        return this.count;
    };

    Hashmap.prototype.item = function(index) {
        return this.values[index];
    };

    Hashmap.prototype.values = function(){
        return this.values;
    };

    collections.Hashmap = Hashmap;
})(fm.collections);