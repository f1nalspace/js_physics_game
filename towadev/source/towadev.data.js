final.module("final.towadev.data", ["final.vec", "final.vec2math"], function(final, vec, vec2math){
    var Vec2 = vec.Vec2;

    function DataValue(value) {
        this.init = value;
        this.cur = value;
        this.min = 0;
        this.max = value * 100;
    }

    function Data() {
        var data = {};
        var insert = function(key, value) {
            data[key] = new DataValue(value);
        };
        var replace = function(key, value) {
            var v = data[key];
            v.initValue = value;
            v.curValue = value;
        };
        return {
            put: function(key, value){
                if (typeof data[key] == "undefined") {
                    insert(key, value);
                } else {
                    replace(key, value);
                }
            },
            get: function(key) {
                if (typeof data[key] != "undefined") {
                    return data[key].curValue;
                }
                return null;
            }
        };
    }

    return {
        Data: Data,
        DataValue: DataValue
    }
});