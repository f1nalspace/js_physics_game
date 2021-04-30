final.module("final.utils", ["final.shim"], function(final, shim){
    function Queue(){
        this.items = [];
        this.index = 0;
        this.count = 0;
    }

    Queue.prototype.clear = function() {
        this.items = [];
        this.index = 0;
        this.count = 0;
    };

    Queue.prototype.enqueue = function(item) {
        if (item.length > 0) {
            for (var i = 0; i < item.length; i++) {
                this.items.push(item[i]);
            }
            this.count += item.length;
        } else {
            this.items.push(item);
            this.count++;
        }
    };

    Queue.prototype.dequeue = function() {
        if (this.count > 0 && this.index < this.count) {
            var r = this.items[++this.index];
            if (this.index == this.items.length-1) {
                this.items = [];
                this.count = 0;
                this.index = 0;
            }
            return r;
        }
        return null;
    };

    Queue.prototype.peek = function(item) {
        return (this.count > 0 && this.index < this.count) ? this.items[this.index + 1] : null;
    };

    function ArrayList() {
        this.data = [];
        this.count = 0;
    }

    ArrayList.prototype.add = function(item) {
        this.data[this.count++] = item;
    };

    ArrayList.prototype.sort = function(func) {
        var sorted = this.data.sort(func);
        for (var i = 0; i < sorted.length; i++) {
            this[i] = sorted[i];
        }
    };

    ArrayList.prototype.clear = function() {
        this.data = [];
        this.count = 0;
    };

    function HashMap() {
        this.keyValues = {};
        this.keys = [];
        this.count = 0;
    }

    HashMap.prototype.firstKey = function() {
        return this.keys[0];
    };

    HashMap.prototype.lastKey = function() {
        return this.keys[this.count-1];
    };

    HashMap.prototype.item = function(index) {
        return this.keyValues[this.keys[index]];
    };

    HashMap.prototype.put = function(key, value) {
        if (this.keyValues[key] === undefined) {
            this.keys.push(key);
            this.count++;
        }
        this.keyValues[key] = value;
    };

    HashMap.prototype.get = function(key) {
        return this.keyValues[key];
    };

    HashMap.prototype.contains = function(key) {
        return this.keyValues[key] !== undefined;
    };

    HashMap.prototype.remove = function(key) {
        if (this.keyValues[key] !== undefined) {
            this.keys = this.keys.filter(function(item){
                return item !== key;
            });
            this.count--;
            this.keyValues[key] = undefined;
        }
    };

    HashMap.prototype.clear = function() {
        this.keys = [];
        this.keyValues = {};
        this.count = 0;
    };

    HashMap.prototype.renameKey = function(oldKey, newKey) {
        var keyIndex = -1;
        var newKeyIndex = -1;
        for (var i = 0; i < this.count; i++) {
            if (keyIndex == -1 && this.keys[i] === oldKey) {
                keyIndex = i;
            }
            if (this.keys[i] === newKey) {
                newKeyIndex = i;
            }
        }
        if (keyIndex > -1 && newKeyIndex == -1) {
            this.keyValues[newKey] = this.keyValues[oldKey];
            this.keyValues[oldKey] = undefined;
            this.keys[keyIndex] = newKey;
            return true;
        }
        return false;
    };

    function FixedPool(max) {
        this.items = [];
        this.count = 0;
        this.max = max;
        for (var i = 0; i < max; i++) {
            this.items[i] = null;
        }
        this.getAliveFunc = function(item){
            return item['alive'] === true;
        };
        this.createFunc = function(index) {
            throw new Error("Create function is abstract!");
        };
    }

    FixedPool.prototype.init = function() {
        for (var i = 0; i < this.max; i++) {
            this.items[i] = this.createFunc(i);
        }
    };

    FixedPool.prototype.get = function() {
        if (this.count < this.max) {
            if (this.items[this.count] == null) {
                throw new Error("Fixed pool is not initialized yet!");
            }
            return this.items[this.count++];
        }
        throw new Error("Too many items in the pool!");
    };

    FixedPool.prototype.update = function() {
        var i = 0;
        while (i < this.count) {
            var item = this.items[i];
            if (!this.getAliveFunc(item)) {
                // Return item to the pool
                var li = this.count-1;
                if (i < li) {
                    var tmp = this.items[li];
                    this.items[li] = item;
                    this.items[i] = tmp;
                    i--;
                }
                this.count--;
            }
            i++;
        }
    };

    function GrowablePool(max, expansion) {
        this.items = [];
        this.count = 0;
        this.max = max;
        this.expansion = expansion;
        for (var i = 0; i < this.max; i++) {
            this.items[i] = null;
        }
        this.getAliveFunc = function(item){
            return item['alive'] === true;
        };
        this.createFunc = function(index) {
            throw new Error("Create function is abstract!");
        };
    }

    GrowablePool.prototype.init = function() {
        for (var i = 0; i < this.max; i++) {
            this.items[i] = this.createFunc(i);
        }
    };

    GrowablePool.prototype.get = function() {
        // Expand pool if required
        if (this.count >= this.max) {
            // create some more space (expand by 20%, minimum 1)
            var start = this.count;
            this.max += Math.round(this.expansion*1.2)+1;

            // Allocate new objects
            for (var i = start; i < this.max; i++) {
                this.items[i] = this.createFunc(i);
            }
        }
        if (this.items[this.count] == null) {
            throw new Error("Fixed pool is not initialized yet!");
        }
        return this.items[this.count++];
    };

    GrowablePool.prototype.update = function() {
        var i = 0;
        while (i < this.count) {
            var item = this.items[i];
            if (!this.getAliveFunc(item)) {
                // Return item to the pool
                var li = this.count-1;
                if (i < li) {
                    var tmp = this.items[li];
                    this.items[li] = item;
                    this.items[i] = tmp;
                    i--;
                }
                this.count--;
            }
            i++;
        }
    };

    function StopWatch(){
        this.secs = 0;
        this.active = false;
        this.target = 0;
        this.stopped = function() {};
    }
    StopWatch.prototype.start = function() {
        if (!this.active) {
            this.secs = 0;
            this.active = true;
        }
    };
    StopWatch.prototype.stop = function() {
        if (this.active) {
            this.active = false;
        }
    };
    StopWatch.prototype.restart = function() {
        this.secs = 0;
        this.active = true;
    };
    StopWatch.prototype.update = function(secs) {
        if (this.active) {
            this.secs += secs;
            if (this.target > 0 && this.secs >= this.target) {
                this.secs = 0;
                this.active = false;
                this.stopped();
            }
        }
    };

    var ajax = function(url, callback, method, errorCallback) {
        var xhr = final.createXHR();
        xhr.open(method || "GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    if (typeof callback == "function") {
                        callback(xhr);
                    }
                } else {
                    if (typeof errorCallback == "function") {
                        errorCallback(xhr);
                    }
                }
            }
        };
        xhr.onerror = function() {
            if (typeof errorCallback == "function") {
                errorCallback(xhr);
            }
        };
        xhr.send(null);
    };

    var createArray = function(count, func) {
        var arr = [];
        for (var i = 0; i < count; i++) {
            arr[i] = func(i);
        }
        return arr;
    };

    var copyArray = function(source, target, count) {
        target.length = 0;
        for (var i = 0; i < count; i++) {
            target[i] = source[i];
        }
        return target;
    };

    var randomRange = function(min,  max) {
        return min + (Math.random() * (max - min));
    };

    var inRange = function(value, min, max) {
        return (value >= min) && (value <= max);
    };

    var createRangeArray = function(min, max) {
        var n = [];
        for (var i = min; i < max; i++) {
            n.push(i);
        }
        return n;
    };

    var delay = function(ms) {
        ms += new Date().getTime();
        while (new Date() < ms){}
    };

    /**
     * Loads the given object key array in the target hash map
     * @param obj {Object} Source object
     * @param name {String} Root name in the source object
     * @param target {HashMap} Target hash map
     */
    var loadGameKeys = function(obj, name, target) {
        if (obj && obj[name]) {
            var lst = obj[name];
            if (lst.length > 0) {
                for (var i = 0; i < lst.length; i++) {
                    target.put(lst[i].id !== undefined ? lst[i].id : (i+1), lst[i]);
                }
            }
        }
    };

    /**
     * Loads the given object index array in the target arraxy
     * @param obj {Object} Source object
     * @param name {String} Root name in the source object
     * @param target {ArrayList} Target array list
     */
    var loadGameArray = function(obj, name, target) {
        if (obj && obj[name]) {
            var lst = obj[name];
            if (lst.length > 0) {
                for (var i = 0; i < lst.length; i++) {
                    target.add(lst[i]);
                }
            }
        }
    };

    return {
        ajax: ajax,
        Queue: Queue,
        ArrayList: ArrayList,
        HashMap: HashMap,
        createArray: createArray,
        copyArray: copyArray,
        FixedPool: FixedPool,
        GrowablePool: GrowablePool,
        StopWatch: StopWatch,
        randomRange: randomRange,
        inRange: inRange,
        createRangeArray: createRangeArray,
        delay: delay,
        loadGameKeys: loadGameKeys,
        loadGameArray: loadGameArray
    };

});